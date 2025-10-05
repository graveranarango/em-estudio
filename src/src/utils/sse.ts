// SSE Utilities with polyfill support and proper error handling
// Handles EventSource with custom headers via fetch + ReadableStream when needed

import type { SSEEvent } from '../sdk/chat/contracts';

export interface SSEOptions {
  headers?: Record<string, string>;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface SSEConnection {
  close: () => void;
  reconnect: () => void;
  readyState: 'connecting' | 'open' | 'closed';
}

/**
 * Creates an SSE connection with custom headers support
 * Falls back to fetch + ReadableStream if EventSource doesn't support headers
 */
export function createSSEConnection(
  url: string,
  onEvent: (event: SSEEvent) => void,
  onError?: (error: Error) => void,
  onOpen?: () => void,
  onClose?: () => void,
  options: SSEOptions = {}
): SSEConnection {
  const {
    headers = {},
    reconnect = false,
    reconnectInterval = 5000,
    maxReconnectAttempts = 3
  } = options;

  let connection: EventSource | null = null;
  let abortController: AbortController | null = null;
  let readyState: 'connecting' | 'open' | 'closed' = 'connecting';
  let reconnectAttempts = 0;
  let shouldReconnect = reconnect;

  const hasCustomHeaders = Object.keys(headers).length > 0;

  function connect() {
    readyState = 'connecting';
    reconnectAttempts++;

    if (hasCustomHeaders) {
      // Use fetch + ReadableStream for custom headers
      connectWithFetch();
    } else {
      // Use native EventSource
      connectWithEventSource();
    }
  }

  function connectWithEventSource() {
    try {
      connection = new EventSource(url);

      connection.onopen = () => {
        readyState = 'open';
        reconnectAttempts = 0;
        onOpen?.();
      };

      connection.onmessage = (event) => {
        try {
          const sseEvent: SSEEvent = JSON.parse(event.data);
          onEvent(sseEvent);
        } catch (parseError) {
          console.warn('Failed to parse SSE event:', event.data, parseError);
        }
      };

      connection.onerror = (error) => {
        console.error('EventSource error:', error);
        handleConnectionError();
      };

    } catch (error) {
      console.error('Failed to create EventSource:', error);
      onError?.(error as Error);
    }
  }

  function connectWithFetch() {
    abortController = new AbortController();

    fetch(url, {
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        ...headers
      },
      signal: abortController.signal
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`SSE request failed: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body for SSE stream');
      }

      readyState = 'open';
      reconnectAttempts = 0;
      onOpen?.();

      return processStream(response.body);
    })
    .catch(error => {
      if (error.name !== 'AbortError') {
        console.error('Fetch SSE error:', error);
        handleConnectionError();
      }
    });
  }

  async function processStream(body: ReadableStream<Uint8Array>) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('SSE stream completed');
          handleStreamEnd();
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          processSSELine(line.trim());
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Stream processing error:', error);
        handleConnectionError();
      }
    } finally {
      reader.releaseLock();
    }
  }

  function processSSELine(line: string) {
    if (line.startsWith('data: ')) {
      const eventData = line.substring(6);
      
      if (eventData.trim()) {
        try {
          const sseEvent: SSEEvent = JSON.parse(eventData);
          onEvent(sseEvent);
          
          // Auto-close on 'done' event to prevent reconnection
          if (sseEvent.type === 'done') {
            shouldReconnect = false;
            close();
          }
        } catch (parseError) {
          console.warn('Failed to parse SSE event:', eventData, parseError);
        }
      }
    } else if (line.startsWith('event: ')) {
      // Handle custom event types if needed
      const eventType = line.substring(7);
      console.log('SSE event type:', eventType);
    } else if (line.startsWith('id: ')) {
      // Handle event IDs if needed
      const eventId = line.substring(4);
      console.log('SSE event ID:', eventId);
    } else if (line.startsWith('retry: ')) {
      // Handle retry instructions
      const retryTime = parseInt(line.substring(7), 10);
      if (!isNaN(retryTime)) {
        // Could update reconnectInterval based on server suggestion
        console.log('SSE retry time suggested:', retryTime);
      }
    }
  }

  function handleConnectionError() {
    readyState = 'closed';
    
    if (shouldReconnect && reconnectAttempts <= maxReconnectAttempts) {
      console.log(`SSE reconnection attempt ${reconnectAttempts}/${maxReconnectAttempts} in ${reconnectInterval}ms`);
      
      setTimeout(() => {
        if (shouldReconnect && readyState === 'closed') {
          connect();
        }
      }, reconnectInterval);
    } else {
      onError?.(new Error(`SSE connection failed after ${maxReconnectAttempts} attempts`));
    }
  }

  function handleStreamEnd() {
    readyState = 'closed';
    onClose?.();
    
    // Don't reconnect on normal stream end
    shouldReconnect = false;
  }

  function close() {
    shouldReconnect = false;
    readyState = 'closed';

    if (connection) {
      connection.close();
      connection = null;
    }

    if (abortController) {
      abortController.abort();
      abortController = null;
    }

    onClose?.();
  }

  function reconnectManually() {
    if (readyState === 'closed') {
      shouldReconnect = true;
      reconnectAttempts = 0;
      connect();
    }
  }

  // Start initial connection
  connect();

  return {
    close,
    reconnect: reconnectManually,
    get readyState() {
      return readyState;
    }
  };
}

/**
 * Simple SSE helper for POST requests that return SSE streams
 */
export async function postSSE(
  url: string,
  body: any,
  headers: Record<string, string>,
  onEvent: (event: SSEEvent) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void
): Promise<() => void> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        ...headers
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SSE POST failed: ${response.status} - ${errorText}`);
    }

    if (!response.body) {
      throw new Error('No response body received');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let isClosed = false;

    async function processStream() {
      try {
        while (!isClosed) {
          const { done, value } = await reader.read();

          if (done) {
            console.log('POST SSE stream completed');
            onComplete?.();
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const eventData = line.substring(6);
              
              if (eventData.trim()) {
                try {
                  const sseEvent: SSEEvent = JSON.parse(eventData);
                  onEvent(sseEvent);
                  
                  // Auto-complete on 'done' or 'error' events
                  if (sseEvent.type === 'done' || sseEvent.type === 'error') {
                    isClosed = true;
                    if (sseEvent.type === 'error') {
                      onError?.(new Error(`${sseEvent.data.code}: ${sseEvent.data.message}`));
                    } else {
                      onComplete?.();
                    }
                    break;
                  }
                } catch (parseError) {
                  console.warn('Failed to parse POST SSE event:', eventData, parseError);
                }
              }
            }
          }
        }
      } catch (streamError) {
        if (!isClosed) {
          console.error('POST SSE stream error:', streamError);
          onError?.(streamError as Error);
        }
      } finally {
        reader.releaseLock();
      }
    }

    processStream();

    // Return abort function
    return () => {
      isClosed = true;
      reader.cancel();
    };

  } catch (error) {
    console.error('Failed to start POST SSE:', error);
    onError?.(error as Error);
    return () => {}; // Return no-op abort function
  }
}

/**
 * Utility to detect if browser supports EventSource with custom headers
 */
export function supportsEventSourceWithHeaders(): boolean {
  if (typeof EventSource === 'undefined') {
    return false;
  }

  // EventSource doesn't natively support custom headers in most browsers
  // We'll always use fetch for consistency
  return false;
}