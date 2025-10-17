// Chat system types

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: MessagePart[];
  createdAt: string;
  meta?: MessageMeta;
}

export interface MessagePart {
  type: 'text' | 'image' | 'file';
  value: string;
  metadata?: Record<string, any>;
}

export interface MessageMeta {
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
}

export interface Thread {
  id: string;
  title: string;
  updatedAt: {
    seconds: number;
    nanoseconds: number;
  } | Date; // Firestore timestamp object or Date object
  // other fields from the document can be added here
  lastMessage?: string;
  messageCount?: number;
}


export interface ThreadSummary {
  id: string;
  title:string;
  lastMessage?: string;
  updatedAt: string;
  messageCount: number;
  isActive?: boolean;
}

export interface Branch {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface Settings {
  model: string;
  temperature: number;
  persona: string;
  brandGuard: boolean;
}

export interface StreamingState {
  status: 'idle' | 'thinking' | 'streaming' | 'error' | 'cancelled';
  runId?: string;
  abortFn?: () => void;
  currentStage?: 'analyze' | 'plan' | 'generate' | 'finalize';
  toolsUsed?: Array<{
    name: string;
    args: any;
    mode: 'dry_run' | 'live';
    completed?: boolean;
  }>;
}

// Export aliases for backward compatibility
export type Msg = Message;