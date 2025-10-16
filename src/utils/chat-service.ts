import { FUNCTIONS_TOKEN, functionsUrl } from './backend';
import type { ChatRequest, SSEEvent, AbortRequest, RegenerateRequest } from '@/types/chat';

export class ChatService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(accessToken?: string) {
    this.baseUrl = functionsUrl('/api/chat');
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken || FUNCTIONS_TOKEN}`
    };
  }

  /**
   * Start a streaming chat session
   */
  async streamChat(
    request: ChatRequest,
    onEvent: (event: SSEEvent) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<() => void> {
    try {
      const response = await fetch(`${this.baseUrl}/stream`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Chat stream failed: ${response.status} - ${errorText}`);
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const abortController = new AbortController();
      
      // Process the stream
      async function processStream() {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log('Chat stream completed');
              onComplete?.();
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            
            // Process complete SSE events
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const eventData = line.substring(6);
                  if (eventData.trim()) {
                    const event: SSEEvent = JSON.parse(eventData);
                    onEvent(event);
                  }
                } catch (parseError) {
                  console.warn('Failed to parse SSE event:', line, parseError);
                }
              }
            }
          }
        } catch (streamError) {
          console.error('Stream processing error:', streamError);
          onError?.(streamError as Error);
        } finally {
          reader.releaseLock();
        }
      }

      processStream();

      // Return abort function
      return () => {
        abortController.abort();
        reader.cancel();
      };

    } catch (error) {
      console.error('Failed to start chat stream:', error);
      onError?.(error as Error);
      return () => {}; // Return no-op abort function
    }
  }

  /**
   * Abort a running chat generation
   */
  async abortChat(request: AbortRequest): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/abort`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Abort request failed:', response.status, errorText);
        return false;
      }

      const result = await response.json();
      return result.success;

    } catch (error) {
      console.error('Failed to abort chat:', error);
      return false;
    }
  }

  /**
   * Regenerate the last assistant response
   */
  async regenerateResponse(
    request: RegenerateRequest,
    onEvent: (event: SSEEvent) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<() => void> {
    try {
      const response = await fetch(`${this.baseUrl}/regenerate`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Regenerate failed: ${response.status} - ${errorText}`);
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Process the stream (same logic as streamChat)
      async function processStream() {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log('Regenerate stream completed');
              onComplete?.();
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const eventData = line.substring(6);
                  if (eventData.trim()) {
                    const event: SSEEvent = JSON.parse(eventData);
                    onEvent(event);
                  }
                } catch (parseError) {
                  console.warn('Failed to parse SSE event:', line, parseError);
                }
              }
            }
          }
        } catch (streamError) {
          console.error('Regenerate stream error:', streamError);
          onError?.(streamError as Error);
        } finally {
          reader.releaseLock();
        }
      }

      processStream();

      // Return abort function
      return () => {
        reader.cancel();
      };

    } catch (error) {
      console.error('Failed to regenerate response:', error);
      onError?.(error as Error);
      return () => {};
    }
  }

  /**
   * Check the current rate limit status
   */
  async getRateLimitStatus(): Promise<{
    remaining: number;
    resetTime: number;
  } | null> {
    try {
      // Make a HEAD request to check rate limit headers without consuming quota
      const response = await fetch(`${this.baseUrl}/stream`, {
        method: 'OPTIONS',
        headers: this.headers,
      });

      const remaining = response.headers.get('X-RateLimit-Remaining');
      const resetTime = response.headers.get('X-RateLimit-Reset');

      if (remaining && resetTime) {
        return {
          remaining: parseInt(remaining),
          resetTime: parseInt(resetTime)
        };
      }

      return null;
    } catch (error) {
      console.warn('Failed to check rate limit status:', error);
      return null;
    }
  }
}
