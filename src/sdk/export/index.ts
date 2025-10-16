// Export/Share SDK for Chat Maestro Frontend (Firebase version)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { FUNCTIONS_BASE_URL, FUNCTIONS_TOKEN } from "../../utils/backend";

/**
 * Firebase initialization
 */
const firebaseConfig = {
  apiKey: "AIzaSyBQb8sz5oZVmmk9tOf49CbtAzaHLxwzIJw",
  authDomain: "em-estudio.firebaseapp.com",
  databaseURL: "https://em-estudio-default-rtdb.firebaseio.com",
  projectId: "em-estudio",
  storageBucket: "em-estudio.firebasestorage.app",
  messagingSenderId: "642931774003",
  appId: "1:642931774003:web:b1970320faf53bd7874946"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Export SDK Types
 */
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
 * Export SDK for handling conversation exports (Firebase Cloud Functions)
 */
export class ExportSDK {
  private baseUrl: string;
  private authToken?: string;

  constructor(authToken?: string) {
    // Se reemplaza el dominio de Supabase por la función de Firebase Hosting
    this.baseUrl = FUNCTIONS_BASE_URL;
    this.authToken = authToken;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  async exportToMarkdown(request: ExportRequest): Promise<ExportResult> {
    return this.export({ ...request, format: 'md' });
  }

  async exportToHTML(request: ExportRequest): Promise<ExportResult> {
    return this.export({ ...request, format: 'html' });
  }

  async exportToPDF(request: ExportRequest): Promise<ExportResult> {
    return this.export({ ...request, format: 'pdf' });
  }

  private async export(request: ExportRequest): Promise<ExportResult> {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/api/export/${request.format}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken || "firebase-public"}`,
      },
      body: JSON.stringify({ req: request }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Export failed' }));
      throw new Error(error.error || `Export failed with status ${response.status}`);
    }

    return response.json();
  }

  async createShareLink(request: ShareCreateRequest): Promise<ShareCreateResult> {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/api/share/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken || "firebase-public"}`,
      },
      body: JSON.stringify({ req: request }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Share creation failed' }));
      throw new Error(error.error || `Share creation failed with status ${response.status}`);
    }

    return response.json();
  }

  async revokeShareLink(linkId: string): Promise<{ ok: boolean }> {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/api/share/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken || "firebase-public"}`,
      },
      body: JSON.stringify({ id: linkId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Revoke failed' }));
      throw new Error(error.error || `Revoke failed with status ${response.status}`);
    }

    return response.json();
  }

  async getSharedContent(token: string): Promise<ShareGetResult> {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/api/share/get?token=${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to load shared content' }));
      throw new Error(error.error || `Failed to load shared content with status ${response.status}`);
    }

    return response.json();
  }

  async downloadExport(result: ExportResult): Promise<void> {
    if (result.url) {
      window.open(result.url, '_blank');
    } else if (result.content) {
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

  async copyToClipboard(content: string): Promise<void> {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(content);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

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
