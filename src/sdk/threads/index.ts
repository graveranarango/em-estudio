// Threads SDK implementation

import { auth } from '../../firebase';
import {
  ThreadSummary,
  Branch,
  CreateThreadRequest,
  CreateThreadResponse,
  CreateBranchRequest,
  CreateBranchResponse,
  BranchFromMessageRequest,
  BranchFromMessageResponse,
} from './contracts';

// Firebase Hosting rewrite maps /api/** -> functions:apiV1
const API_BASE = '/api';

class ThreadsSDK {
  private async getAuthHeaders() {
    const user = auth.currentUser;
    if (!user) return {};
    const token = await user.getIdToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  async listThreads(): Promise<ThreadSummary[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE}/listThreads`, { headers });
    if (!response.ok) {
      throw new Error('Failed to list threads');
    }
    const data = await response.json();
    const items: ThreadSummary[] = (data.threads || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      updatedAt: t.updatedAt || t.createdAt || new Date().toISOString(),
      messageCount: typeof t.messageCount === 'number' ? t.messageCount : t.msgCount || 0,
      branches: t.branches || [],
    }));
    return items.map((t: any) => ({ ...t, msgCount: t.messageCount }));
  }

  async createThread(request: CreateThreadRequest): Promise<CreateThreadResponse> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE}/createThread`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error('Failed to create thread');
    }
    return response.json();
  }

  async renameThread(threadId: string, title: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE}/renameThread`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ threadId, title }),
    });
    if (!response.ok) {
      throw new Error('Failed to rename thread');
    }
  }

  async deleteThread(threadId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE}/deleteThread`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ threadId }),
    });
    if (!response.ok) {
      throw new Error('Failed to delete thread');
    }
  }

  async createBranch(threadId: string, name: string): Promise<CreateBranchResponse> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE}/createBranch`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ threadId, name }),
    });
    if (!response.ok) {
      throw new Error('Failed to create branch');
    }
    return response.json();
  }

  async renameBranch(branchId: string, name: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE}/renameBranch`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ branchId, name }),
    });
    if (!response.ok) {
      throw new Error('Failed to rename branch');
    }
  }

  async deleteBranch(branchId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE}/deleteBranch`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ branchId }),
    });
    if (!response.ok) {
      throw new Error('Failed to delete branch');
    }
  }

  async switchBranch(threadId: string, branchId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE}/switchBranch`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ threadId, branchId }),
    });
    if (!response.ok) {
      throw new Error('Failed to switch branch');
    }
  }

  async branchFromMessage(
    threadId: string,
    messageId: string,
    name?: string,
  ): Promise<BranchFromMessageResponse> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE}/branchFromMessage`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ threadId, messageId, name }),
    });
    if (!response.ok) {
      throw new Error('Failed to branch from message');
    }
    return response.json();
  }

  getDefaultBranch(thread: ThreadSummary): Branch | undefined {
    return thread.branches.find((branch) => branch.isDefault) || thread.branches[0];
  }

  async getMessages(threadId: string, branchId: string): Promise<any[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE}/getMessages?threadId=${threadId}&branchId=${branchId}`, { headers });
    if (!response.ok) {
      throw new Error('Failed to get messages');
    }
    const data = await response.json();
    return data.messages || [];
  }

  async addMessage(threadId: string, branchId: string, message: any): Promise<any> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE}/addMessage`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ threadId, branchId, message }),
    });
    if (!response.ok) {
      throw new Error('Failed to add message');
    }
    return response.json();
  }

  // Helpers used by UI hooks
  validateBranchName(name: string, existing: Branch[]): string | undefined {
    const trimmed = (name || '').trim();
    if (!trimmed) return 'El nombre de la rama no puede estar vacío';
    const exists = existing.some((b) => b.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return 'Ya existe una rama con ese nombre';
    return undefined;
  }

  generateUniqueBranchName(baseName: string, existing: Branch[]): string {
    const base = (baseName || 'rama').trim();
    const set = new Set(existing.map((b) => b.name.toLowerCase()));
    if (!set.has(base.toLowerCase())) return base;
    let i = 2;
    while (true) {
      const candidate = `${base}-${i}`;
      if (!set.has(candidate.toLowerCase())) return candidate;
      i++;
    }
  }
}

const threadsSDK = new ThreadsSDK();
export default threadsSDK;
