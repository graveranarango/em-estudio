// Chat SDK exports
import { functionsUrl } from '../../utils/backend';

export * from './contracts';
import type { ChatRequest, SSEEvent, ThreadData, SignUploadResponse } from './contracts';

// Chat SDK Class
export class ChatSDK {
  private jwt?: string;

  constructor(jwt?: string) {
    this.jwt = jwt;
  }

  setJWT(jwt: string) {
    this.jwt = jwt;
  }

  processSlashCommands(content: string) {
    // Parse slash commands like /model, /temp, /creative, etc.
    const commands = {
      content: content,
      tools: [] as string[],
      settings: {} as Record<string, any>
    };

    // Extract slash commands
    const slashPattern = /\/(\w+)(?:\s+([^\s\/]+))?/g;
    let match;
    
    while ((match = slashPattern.exec(content)) !== null) {
      const [fullMatch, command, value] = match;
      
      switch (command.toLowerCase()) {
        case 'model':
          if (value) commands.settings.model = value;
          break;
        case 'temp':
        case 'temperature':
          if (value) commands.settings.temperature = parseFloat(value);
          break;
        case 'creative':
          commands.settings.temperature = 0.8;
          break;
        case 'precise':
          commands.settings.temperature = 0.1;
          break;
        case 'web':
          commands.tools.push('web_search');
          break;
        case 'docs':
          commands.tools.push('document_search');
          break;
        case 'brand':
          commands.settings.brandGuard = true;
          break;
      }
      
      // Remove the command from content
      commands.content = commands.content.replace(fullMatch, '').trim();
    }

    return commands;
  }
}

// Stream function
export async function stream(
  request: ChatRequest, 
  jwt?: string, 
  onEvent?: (event: SSEEvent) => void
): Promise<{ runId: string }> {
  const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const response = await fetch(functionsUrl('/api/chat/stream'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': jwt ? `Bearer ${jwt}` : ''
      },
      body: JSON.stringify({ ...request, runId })
    });

    if (!response.ok) {
      throw new Error(`Streaming failed: ${response.status}`);
    }

    // Handle SSE streaming
    if (response.body && onEvent) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const eventData = JSON.parse(line.slice(6));
                onEvent(eventData);
              } catch (e) {
                console.warn('Failed to parse SSE event:', line);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }

    return { runId };
  } catch (error) {
    console.error('Stream error:', error);
    throw error;
  }
}

// Abort function
export async function abort(
  threadId: string, 
  runId: string, 
  jwt?: string
): Promise<void> {
  try {
    const response = await fetch(functionsUrl('/api/chat/abort'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': jwt ? `Bearer ${jwt}` : ''
      },
      body: JSON.stringify({ threadId, runId })
    });

    if (!response.ok) {
      throw new Error(`Abort failed: ${response.status}`);
    }
  } catch (error) {
    console.error('Abort error:', error);
    throw error;
  }
}

// Regenerate function
export async function regenerate(
  threadId: string, 
  messageId: string, 
  nudge?: 'shorter' | 'longer' | 'creative' | 'concise',
  jwt?: string
): Promise<void> {
  try {
    const response = await fetch(functionsUrl('/api/chat/regenerate'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': jwt ? `Bearer ${jwt}` : ''
      },
      body: JSON.stringify({ threadId, messageId, nudge })
    });

    if (!response.ok) {
      throw new Error(`Regenerate failed: ${response.status}`);
    }
  } catch (error) {
    console.error('Regenerate error:', error);
    throw error;
  }
}

// Sign upload function
export async function signUpload(
  contentType: string, 
  threadId: string, 
  jwt?: string
): Promise<SignUploadResponse> {
  try {
    const response = await fetch(functionsUrl('/api/chat/attach/sign'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': jwt ? `Bearer ${jwt}` : ''
      },
      body: JSON.stringify({ contentType, threadId })
    });

    if (!response.ok) {
      throw new Error(`Sign upload failed: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Sign upload error:', error);
    throw error;
  }
}

// Save thread function
export async function saveThread(
  threadData: ThreadData, 
  jwt?: string
): Promise<void> {
  try {
    const response = await fetch(functionsUrl('/api/chat/thread/save'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': jwt ? `Bearer ${jwt}` : ''
      },
      body: JSON.stringify(threadData)
    });

    if (!response.ok) {
      throw new Error(`Save thread failed: ${response.status}`);
    }
  } catch (error) {
    console.error('Save thread error:', error);
    throw error;
  }
}

// Legacy export for backward compatibility
export const chatSDK = {
  sendMessage: async (message: string, threadId?: string) => {
    console.log('Sending message:', message, 'to thread:', threadId);
    return { success: true, messageId: `msg_${Date.now()}` };
  },
  
  streamMessage: async (message: string, onChunk: (chunk: string) => void) => {
    console.log('Streaming message:', message);
    // Simulate streaming
    const chunks = message.split(' ');
    for (const chunk of chunks) {
      await new Promise(resolve => setTimeout(resolve, 100));
      onChunk(chunk + ' ');
    }
  }
};
