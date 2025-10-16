// Export/Share SDK for Chat Maestro Frontend

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

import { functionsUrl } from '@/utils/backend';

/**
 * Export SDK for handling conversation exports
 */
export class ExportSDK {
  private baseUrl: string;
  private authToken?: string;

  constructor(authToken?: string) {
    this.baseUrl = functionsUrl('exportHandler');
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
    console.log('[Export SDK] export called with:', request);

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`[Export SDK] API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates a shareable link for a conversation
   */
  async createShareLink(request: ShareCreateRequest): Promise<ShareCreateResult> {
    console.log('[Export SDK] createShareLink called with:', request);
    // Return mock data
    return {
      link: 'https://example.com/share/mock-link',
      token: 'mock-token',
      expires_at: null
    };
  }

  /**
   * Revokes a shareable link
   */
  async revokeShareLink(linkId: string): Promise<{ ok: boolean }> {
    console.log('[Export SDK] revokeShareLink called with:', linkId);
    // Return mock data
    return { ok: true };
  }

  /**
   * Gets shared content by token (public access, no auth required)
   */
  async getSharedContent(token: string): Promise<ShareGetResult> {
    console.log('[Export SDK] getSharedContent called with:', token);
    // Return mock data
    return {
      thread: {
        title: 'Mock Thread',
        system: 'Mock System'
      },
      messages: [],
      readOnly: true
    };
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