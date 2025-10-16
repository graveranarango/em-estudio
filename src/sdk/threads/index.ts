// Threads SDK implementation

import { 
  ThreadSummary, 
  Branch, 
  CreateThreadRequest, 
  CreateThreadResponse,
  CreateBranchRequest,
  CreateBranchResponse,
  BranchFromMessageRequest,
  BranchFromMessageResponse
} from './contracts';

const API_BASE = '/make-server-ecf7df64/api';

class ThreadsSDK {
  async listThreads(): Promise<ThreadSummary[]> {
    const response = await fetch(`${API_BASE}/threads/list`);
    if (!response.ok) {
      throw new Error('Failed to list threads');
    }
    const data = await response.json();
    return data.threads || [];
  }

  async createThread(request: CreateThreadRequest): Promise<CreateThreadResponse> {
    const response = await fetch(`${API_BASE}/thread/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create thread');
    }
    
    return response.json();
  }

  async renameThread(threadId: string, title: string): Promise<void> {
    const response = await fetch(`${API_BASE}/thread/rename`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, title })
    });
    
    if (!response.ok) {
      throw new Error('Failed to rename thread');
    }
  }

  async deleteThread(threadId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/thread/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete thread');
    }
  }

  async createBranch(threadId: string, name: string): Promise<CreateBranchResponse> {
    const response = await fetch(`${API_BASE}/branch/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, name })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create branch');
    }
    
    return response.json();
  }

  async renameBranch(branchId: string, name: string): Promise<void> {
    const response = await fetch(`${API_BASE}/branch/rename`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branchId, name })
    });
    
    if (!response.ok) {
      throw new Error('Failed to rename branch');
    }
  }

  async deleteBranch(branchId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/branch/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branchId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete branch');
    }
  }

  async switchBranch(threadId: string, branchId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/branch/switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, branchId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to switch branch');
    }
  }

  async branchFromMessage(
    threadId: string, 
    messageId: string, 
    name?: string
  ): Promise<BranchFromMessageResponse> {
    const response = await fetch(`${API_BASE}/message/branch-from`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, messageId, name })
    });
    
    if (!response.ok) {
      throw new Error('Failed to branch from message');
    }
    
    return response.json();
  }

  getDefaultBranch(thread: ThreadSummary): Branch | undefined {
    return thread.branches.find(branch => branch.isDefault) || thread.branches[0];
  }
}

const threadsSDK = new ThreadsSDK();
export default threadsSDK;