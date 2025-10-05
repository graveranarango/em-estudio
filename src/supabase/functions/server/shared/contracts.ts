export type Part = { 
  type: 'text' | 'image' | 'file' | 'code'; 
  value: string; 
  mime?: string; 
};

export type Msg = { 
  id: string; 
  role: 'system' | 'user' | 'assistant'; 
  parts: Part[]; 
  createdAt?: string; 
  meta?: Record<string, any>; 
};

export type Settings = { 
  model: 'gpt-5'; 
  temperature: number; 
  persona: 'mentor' | 'planner' | 'engineer'; 
  brandGuard?: boolean; 
};

export type Tool = { 
  name: 'web.run' | 'calc' | 'pdf.read' | 'image.describe' | 'audio.transcribe' | 'export.md' | 'export.pdf'; 
  input?: Record<string, any>; 
};

export type ChatRequest = { 
  threadId: string; 
  system: string; 
  messages: Msg[]; 
  settings: Settings; 
  tools: Tool[]; 
  objective?: string; 
  attachments?: { 
    id: string; 
    url: string; 
    type: 'pdf' | 'image' | 'audio' | 'link'; 
  }[]; 
};

export type SSEEvent = 
  | { type: 'ready'; data: { threadId: string } }
  | { type: 'state'; data: { stage: 'analyze' | 'plan' | 'generate' | 'finalize' } }
  | { type: 'tool'; data: { name: string; args: any; mode: 'dry_run' | 'live' } }
  | { type: 'token'; data: { delta: string } }
  | { type: 'usage'; data: { prompt: number; completion: number } }
  | { type: 'error'; data: { code: string; message: string } }
  | { type: 'done'; data: { messageId: string; final: true } };

export type AbortRequest = {
  threadId: string;
  runId: string;
};

export type RegenerateRequest = {
  threadId: string;
  messageId: string;
  nudge?: 'shorter' | 'longer' | 'creative' | 'concise';
};

export type GoogleIARequest = {
  task: 'image.generate' | 'image.edit' | 'layout';
  subject: string;
  style: string;
  palette: string; // BrandKit reference
  constraints: string[];
  sizes: string[];
};

export type LogEvent = {
  userId: string;
  threadId: string;
  stage: string;
  latency_ms: number;
  tokens: number;
  tool?: string;
  ts: string;
};