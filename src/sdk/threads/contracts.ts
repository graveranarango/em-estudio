// Threads SDK contracts

export interface ThreadSummary {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: string;
  messageCount: number;
  branches: Branch[];
}

export interface Branch {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface CreateThreadRequest {
  title: string;
}

export interface CreateThreadResponse {
  id: string;
  title: string;
}

export interface CreateBranchRequest {
  threadId: string;
  name: string;
}

export interface CreateBranchResponse {
  id: string;
  name: string;
}

export interface BranchFromMessageRequest {
  threadId: string;
  messageId: string;
  name?: string;
}

export interface BranchFromMessageResponse {
  branchId: string;
}