// Export and Share Types for Chat Maestro
export type ExportFormat = 'md' | 'pdf' | 'html';
export type ExportRange = 'current' | 'selection' | 'thread';

export interface CleanupOpts {
  hideMeta?: boolean;
  hideChips?: boolean;
  maskPII?: boolean;
}

export interface ExportRequest {
  threadId: string;
  messageId?: string;
  range: ExportRange;
  format: ExportFormat;
  cleanup: CleanupOpts;
  branch?: string;
  selectionIds?: string[];
}

export interface ShareCreateReq {
  threadId: string;
  mode: 'readonly' | 'comments';
  scope: 'thread' | 'branch' | 'selection';
  branch?: string;
  selectionIds?: string[];
  expiresDays?: number;
  requireCode?: boolean;
  hideUsernames?: boolean;
  cleanup?: CleanupOpts;
}

export interface ExportResult {
  filename: string;
  content?: string;
  url?: string;
}

export interface ShareCreateResult {
  link: string;
  token: string;
  expires_at: string | null;
}

export interface ShareGetResult {
  thread: {
    title: string;
    system: string;
  };
  messages: any[];
  readOnly: boolean;
  cleanup?: CleanupOpts;
}

// Internal types for processing
export interface ProcessedMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: any;
  brandGuardFindings?: any[];
}

export interface ProcessedThread {
  id: string;
  title: string;
  system: string;
  messages: ProcessedMessage[];
  createdAt: string;
  updatedAt: string;
}