// Chat SDK contracts and types

export interface Msg {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: Array<{
    type: 'text' | 'image' | 'file';
    value: string;
    metadata?: Record<string, any>;
  }>;
  createdAt: string;
  meta?: {
    streaming?: boolean;
    tools?: Array<{
      name: string;
      args: any;
      mode: 'dry_run' | 'live';
    }>;
    usage?: {
      totalTokens: number;
      promptTokens: number;
      completionTokens: number;
    };
    attachments?: any[];
    googleIaRequest?: any;
  };
}

export interface Settings {
  model: string;
  temperature: number;
  persona: string;
  brandGuard: boolean;
}

export interface SSEEvent {
  type: 'ready' | 'state' | 'tool' | 'token' | 'usage' | 'error' | 'done';
  data: any;
}

export interface GoogleIARequest {
  type: string;
  prompt: string;
  parameters?: Record<string, any>;
}

export interface Tool {
  name: string;
  args?: any;
  mode?: 'dry_run' | 'live';
}

export interface ChatRequest {
  threadId: string;
  system: string;
  messages: Msg[];
  settings: Settings;
  tools?: Tool[];
  objective?: string;
}

export interface ThreadData {
  id: string;
  title: string;
  system: string;
  settings: Settings;
}

export interface SignUploadResponse {
  url: string;
  fields?: Record<string, string>;
}

// Export alias for backward compatibility
export type Message = Msg;
