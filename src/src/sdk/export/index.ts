// Export/Share SDK for Chat Maestro Frontend
import { projectId, publicAnonKey } from '@/utils/supabase/info';

export interface ExportRequest {
  threadId: string;
  messageId?: string;
  range: 'current' | 'selection' | 'thread';
  format: 'md' | 'pdf' | 'html';
  cleanup: {
    hideMeta?: boolean;
    hideChips?: boolean;
    maskPII?: boolean;
  };
  branch?: string;
  selectionIds?: string[];
}

export interface ShareCreateRequest {
  threadId: string;
  mode: 'readonly' | 'comments';
  scope: 'thread' | 'branch' | 'selection';
  branch?: string;
  selectionIds?: string[];
  expiresDays?: number;
  requireCode?: boolean;
  hideUsernames?: boolean;
  cleanup?: {
    hideMeta?: boolean;
    hideChips?: boolean;
    maskPII?: boolean;
  };
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
  cleanup?: any;
}

/**
 * Export SDK for handling conversation exports
 */
export class ExportSDK {
  private baseUrl: string;
  private authToken?: string;

  constructor(authToken?: string) {
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-ecf7df64`;
    this.authToken = authToken;
  }

  /**
   * Sets authentication token
   */
  setAuthToken(token: string) {
    this.authToken = token;
  }

  /**
   * Exports conversation to Markdown
   */
  async exportToMarkdown(request: ExportRequest): Promise<ExportResult> {
    return this.export({ ...request, format: 'md' });
  }

  /**
   * Exports conversation to HTML
   */
  async exportToHTML(request: ExportRequest): Promise<ExportResult> {
    return this.export({ ...request, format: 'html' });
  }

  /**
   * Exports conversation to PDF
   */
  async exportToPDF(request: ExportRequest): Promise<ExportResult> {
    return this.export({ ...request, format: 'pdf' });
  }

  /**
   * Generic export method
   */
  private async export(request: ExportRequest): Promise<ExportResult> {
    const response = await fetch(`${this.baseUrl}/api/export/${request.format}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken || publicAnonKey}`,
      },
      body: JSON.stringify({ req: request }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Export failed' }));
      throw new Error(error.error || `Export failed with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * Creates a shareable link for a conversation
   */
  async createShareLink(request: ShareCreateRequest): Promise<ShareCreateResult> {
    const response = await fetch(`${this.baseUrl}/api/share/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken || publicAnonKey}`,
      },
      body: JSON.stringify({ req: request }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Share creation failed' }));
      throw new Error(error.error || `Share creation failed with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * Revokes a shareable link
   */
  async revokeShareLink(linkId: string): Promise<{ ok: boolean }> {
    const response = await fetch(`${this.baseUrl}/api/share/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken || publicAnonKey}`,
      },
      body: JSON.stringify({ id: linkId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Revoke failed' }));
      throw new Error(error.error || `Revoke failed with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * Gets shared content by token (public access, no auth required)
   */
  async getSharedContent(token: string): Promise<ShareGetResult> {
    const response = await fetch(`${this.baseUrl}/api/share/get?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to load shared content' }));
      throw new Error(error.error || `Failed to load shared content with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * Downloads exported content
   */
  async downloadExport(result: ExportResult): Promise<void> {
    if (result.url) {
      // For PDF exports, open the signed URL
      window.open(result.url, '_blank');
    } else if (result.content) {
      // For text-based exports, trigger download
      const blob = new Blob([result.content], { 
        type: result.filename.endsWith('.html') ? 'text/html' : 'text/markdown' 
      });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Copies content to clipboard
   */
  async copyToClipboard(content: string): Promise<void> {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(content);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  /**
   * Copies share link to clipboard
   */
  async copyShareLink(shareResult: ShareCreateResult): Promise<void> {
    await this.copyToClipboard(shareResult.link);
  }
}

// Default export instance
export const exportSDK = new ExportSDK();

// Export individual functions for convenience
export const {
  exportToMarkdown,
  exportToHTML,
  exportToPDF,
  createShareLink,
  revokeShareLink,
  getSharedContent,
  downloadExport,
  copyToClipboard,
  copyShareLink
} = exportSDK;