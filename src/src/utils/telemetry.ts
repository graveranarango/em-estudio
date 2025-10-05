/**
 * Frontend Telemetry Utilities
 * 
 * Handles client-side metrics collection and emission for the Chat Maestro module.
 * Includes mobile-specific metrics, performance tracking, and accessibility events.
 */

interface TelemetryEvent {
  event: string;
  properties: Record<string, any>;
  timestamp?: string;
  session_id?: string;
  user_agent?: string;
}

interface PerformanceMetrics {
  ttft_ms?: number;           // Time to first token
  stream_duration_ms?: number; // Total streaming duration
  fps_avg?: number;           // Average FPS during interaction
  mobile_keyboard_jank_ms?: number; // Mobile keyboard animation jank
  virtual_list_render_ms?: number;   // Virtual list render time
}

const SAMPLING_RATE = 0.15; // 15% sampling rate
const API_ENDPOINT = '/api/events';

// Session ID for grouping related events
let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  return sessionId;
}

function shouldSample(): boolean {
  return Math.random() < SAMPLING_RATE;
}

export async function emitTelemetryEvent(
  event: string, 
  properties: Record<string, any> = {},
  force: boolean = false
): Promise<void> {
  // Skip if not sampling and not forced
  if (!force && !shouldSample()) {
    return;
  }

  try {
    const telemetryEvent: TelemetryEvent = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        is_mobile: window.innerWidth < 768
      },
      timestamp: new Date().toISOString(),
      session_id: getSessionId(),
      user_agent: navigator.userAgent
    };

    await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(telemetryEvent),
      // Fire and forget - don't block UI
      keepalive: true
    });

  } catch (error) {
    // Silent failure - don't disrupt user experience
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to emit telemetry event:', error);
    }
  }
}

export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>,
  properties: Record<string, any> = {}
): T | Promise<T> {
  const startTime = performance.now();
  
  const handleResult = (result: T): T => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    emitTelemetryEvent(`performance_${name}`, {
      ...properties,
      duration_ms: duration
    });
    
    return result;
  };

  try {
    const result = fn();
    
    if (result instanceof Promise) {
      return result.then(handleResult) as T;
    } else {
      return handleResult(result);
    }
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    emitTelemetryEvent(`performance_${name}_error`, {
      ...properties,
      duration_ms: duration,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    throw error;
  }
}

// Specific chat metrics
export const ChatMetrics = {
  // Track time to first token when streaming starts
  trackTTFT: (threadId: string, branchId: string) => {
    performance.mark('chat-ttft-start');
    
    return {
      end: () => {
        performance.mark('chat-ttft-end');
        performance.measure('chat-ttft', 'chat-ttft-start', 'chat-ttft-end');
        
        const measure = performance.getEntriesByName('chat-ttft')[0];
        if (measure) {
          emitTelemetryEvent('chat_ttft', {
            thread_id: threadId,
            branch_id: branchId,
            ttft_ms: measure.duration
          });
        }
      }
    };
  },

  // Track streaming session duration
  trackStreamingSession: (threadId: string, branchId: string, messageCount: number) => {
    const startTime = performance.now();
    
    return {
      end: (tokens?: number, error?: string) => {
        const duration = performance.now() - startTime;
        
        emitTelemetryEvent('chat_streaming_session', {
          thread_id: threadId,
          branch_id: branchId,
          stream_duration_ms: duration,
          message_count: messageCount,
          tokens_received: tokens,
          error: error
        });
      }
    };
  },

  // Track message sending
  trackMessageSent: (threadId: string, branchId: string, messageLength: number, isMobile: boolean) => {
    emitTelemetryEvent('chat_message_sent', {
      thread_id: threadId,
      branch_id: branchId,
      message_length: messageLength,
      is_mobile: isMobile
    });
  },

  // Track virtual list performance
  trackVirtualListPerformance: (messageCount: number, renderTime: number) => {
    emitTelemetryEvent('virtual_list_performance', {
      message_count: messageCount,
      render_time_ms: renderTime,
      fps_estimate: 1000 / Math.max(renderTime, 16) // Rough FPS estimate
    });
  },

  // Track mobile keyboard interactions
  trackMobileKeyboard: (action: 'open' | 'close', jankTime?: number) => {
    emitTelemetryEvent('mobile_keyboard_interaction', {
      action,
      mobile_keyboard_jank_ms: jankTime
    });
  },

  // Track accessibility announcements
  trackA11yAnnouncement: (message: string, priority: 'polite' | 'assertive') => {
    emitTelemetryEvent('a11y_announcement', {
      message_length: message.length,
      priority
    });
  },

  // Track error states
  trackError: (error: string, context: Record<string, any> = {}) => {
    emitTelemetryEvent('chat_error', {
      error_message: error,
      context
    }, true); // Force emit errors
  }
};

// Performance observer for tracking FPS during interactions
let fpsObserver: PerformanceObserver | null = null;

export function startFPSTracking(): () => void {
  if (!window.PerformanceObserver || fpsObserver) {
    return () => {};
  }

  const fpsData: number[] = [];
  let lastFrameTime = performance.now();

  fpsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'measure') {
        const currentTime = entry.startTime + entry.duration;
        const frameDuration = currentTime - lastFrameTime;
        const fps = 1000 / frameDuration;
        
        fpsData.push(fps);
        lastFrameTime = currentTime;
        
        // Keep only last 60 frames
        if (fpsData.length > 60) {
          fpsData.shift();
        }
      }
    }
  });

  try {
    fpsObserver.observe({ entryTypes: ['measure'] });
  } catch (error) {
    console.warn('Failed to start FPS tracking:', error);
    fpsObserver = null;
    return () => {};
  }

  return () => {
    if (fpsObserver) {
      fpsObserver.disconnect();
      fpsObserver = null;
      
      // Emit average FPS if we have data
      if (fpsData.length > 0) {
        const avgFPS = fpsData.reduce((a, b) => a + b, 0) / fpsData.length;
        emitTelemetryEvent('fps_session_summary', {
          fps_avg: avgFPS,
          fps_min: Math.min(...fpsData),
          fps_max: Math.max(...fpsData),
          frame_count: fpsData.length
        });
      }
    }
  };
}

// Browser-specific optimizations
export function getBrowserOptimizations() {
  const userAgent = navigator.userAgent;
  
  return {
    isIOS: /iPhone|iPad|iPod/.test(userAgent),
    isAndroid: /Android/.test(userAgent),
    isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
    isChrome: /Chrome/.test(userAgent),
    supportsVisualViewport: 'visualViewport' in window,
    supportsPerformanceObserver: 'PerformanceObserver' in window,
    preferredSampling: 
      /iPhone|iPad|iPod|Android/.test(userAgent) ? 0.1 : // Lower sampling on mobile
      0.15 // Standard sampling on desktop
  };
}

// Initialize telemetry
export function initTelemetry() {
  const optimizations = getBrowserOptimizations();
  
  emitTelemetryEvent('telemetry_init', {
    browser_optimizations: optimizations,
    page_load_time: performance.now()
  });
  
  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    emitTelemetryEvent('page_visibility_change', {
      visible: !document.hidden
    });
  });
  
  // Track errors
  window.addEventListener('error', (event) => {
    ChatMetrics.trackError('javascript_error', {
      message: event.message,
      filename: event.filename,
      line: event.lineno,
      column: event.colno
    });
  });
  
  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    ChatMetrics.trackError('unhandled_promise_rejection', {
      reason: event.reason instanceof Error ? event.reason.message : 'Unknown'
    });
  });
}

// Cleanup function for component unmount
export function cleanupTelemetry() {
  if (fpsObserver) {
    fpsObserver.disconnect();
    fpsObserver = null;
  }
}