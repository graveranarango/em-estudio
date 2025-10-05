// Database helper functions with RLS support
// Provides safe, typed database operations for the chat service

import { createClient } from 'jsr:@supabase/supabase-js@2';
import type { 
  ChatRequest, 
  Msg, 
  SSEEvent, 
  LogEvent 
} from './contracts.ts';

// Database types
export interface Thread {
  id: string;
  owner: string;
  title?: string;
  system?: string;
  objective?: string;
  active_branch: string;
  settings: any;
  meta: any;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  role: 'system' | 'user' | 'assistant';
  parts: any[];
  meta: any;
  tokens: number;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  thread_id: string;
  message_id?: string;
  url: string;
  filename?: string;
  kind: 'pdf' | 'image' | 'audio' | 'link';
  mime_type?: string;
  size_bytes?: number;
  meta: any;
  created_at: string;
}

export interface Event {
  id: number;
  user_id?: string;
  thread_id?: string;
  message_id?: string;
  stage: string;
  tool?: string;
  latency_ms?: number;
  tokens: number;
  code?: string;
  info: any;
  ts: string;
}

export interface Quota {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  tokens_used: number;
  requests_count: number;
  attachments_mb: number;
  created_at: string;
  updated_at: string;
}

export interface ShareLink {
  id: string;
  thread_id: string;
  owner: string;
  mode: 'read' | 'write';
  scope: 'public' | 'internal' | 'private';
  token: string;
  expires_at?: string;
  access_count: number;
  last_accessed_at?: string;
  created_at: string;
}

export class DatabaseService {
  private supabase: any;

  constructor(serviceRoleKey?: string) {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      serviceRoleKey || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
  }

  // ==========================================
  // THREAD OPERATIONS
  // ==========================================

  async createThread(
    userId: string, 
    threadData: Partial<Thread>
  ): Promise<Thread> {
    const { data, error } = await this.supabase
      .from('threads')
      .insert({
        owner: userId,
        title: threadData.title || 'New Chat',
        system: threadData.system,
        objective: threadData.objective,
        active_branch: threadData.active_branch || 'main',
        settings: threadData.settings || {},
        meta: threadData.meta || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create thread:', error);
      throw new Error(`Failed to create thread: ${error.message}`);
    }

    return data;
  }

  async getThread(threadId: string, userId: string): Promise<Thread | null> {
    const { data, error } = await this.supabase
      .from('threads')
      .select('*')
      .eq('id', threadId)
      .eq('owner', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      console.error('Failed to get thread:', error);
      throw new Error(`Failed to get thread: ${error.message}`);
    }

    return data;
  }

  async updateThread(
    threadId: string, 
    userId: string, 
    updates: Partial<Thread>
  ): Promise<Thread> {
    const { data, error } = await this.supabase
      .from('threads')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', threadId)
      .eq('owner', userId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update thread:', error);
      throw new Error(`Failed to update thread: ${error.message}`);
    }

    return data;
  }

  async getUserThreads(
    userId: string, 
    limit = 50, 
    offset = 0
  ): Promise<Thread[]> {
    const { data, error } = await this.supabase
      .from('threads')
      .select('*')
      .eq('owner', userId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to get user threads:', error);
      throw new Error(`Failed to get user threads: ${error.message}`);
    }

    return data || [];
  }

  async deleteThread(threadId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('threads')
      .delete()
      .eq('id', threadId)
      .eq('owner', userId);

    if (error) {
      console.error('Failed to delete thread:', error);
      throw new Error(`Failed to delete thread: ${error.message}`);
    }
  }

  // ==========================================
  // MESSAGE OPERATIONS
  // ==========================================

  async createMessage(
    threadId: string,
    messageData: Omit<Message, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Message> {
    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        thread_id: threadId,
        role: messageData.role,
        parts: messageData.parts,
        meta: messageData.meta || {},
        tokens: messageData.tokens || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create message:', error);
      throw new Error(`Failed to create message: ${error.message}`);
    }

    return data;
  }

  async updateMessage(
    messageId: string,
    updates: Partial<Message>
  ): Promise<Message> {
    const { data, error } = await this.supabase
      .from('messages')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update message:', error);
      throw new Error(`Failed to update message: ${error.message}`);
    }

    return data;
  }

  async getThreadMessages(
    threadId: string, 
    limit = 100, 
    offset = 0
  ): Promise<Message[]> {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to get thread messages:', error);
      throw new Error(`Failed to get thread messages: ${error.message}`);
    }

    return data || [];
  }

  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await this.supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('Failed to delete message:', error);
      throw new Error(`Failed to delete message: ${error.message}`);
    }
  }

  // ==========================================
  // ATTACHMENT OPERATIONS
  // ==========================================

  async createAttachment(
    attachmentData: Omit<Attachment, 'id' | 'created_at'>
  ): Promise<Attachment> {
    const { data, error } = await this.supabase
      .from('attachments')
      .insert(attachmentData)
      .select()
      .single();

    if (error) {
      console.error('Failed to create attachment:', error);
      throw new Error(`Failed to create attachment: ${error.message}`);
    }

    return data;
  }

  async getThreadAttachments(threadId: string): Promise<Attachment[]> {
    const { data, error } = await this.supabase
      .from('attachments')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to get thread attachments:', error);
      throw new Error(`Failed to get thread attachments: ${error.message}`);
    }

    return data || [];
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    const { error } = await this.supabase
      .from('attachments')
      .delete()
      .eq('id', attachmentId);

    if (error) {
      console.error('Failed to delete attachment:', error);
      throw new Error(`Failed to delete attachment: ${error.message}`);
    }
  }

  // ==========================================
  // EVENT LOGGING
  // ==========================================

  async logEvent(eventData: Omit<Event, 'id' | 'ts'>): Promise<void> {
    const { error } = await this.supabase
      .from('events')
      .insert({
        ...eventData,
        ts: new Date().toISOString()
      });

    if (error) {
      console.warn('Failed to log event:', error);
      // Don't throw here - logging failures shouldn't break the main flow
    }
  }

  async getEvents(
    userId?: string,
    threadId?: string,
    limit = 100,
    offset = 0
  ): Promise<Event[]> {
    let query = this.supabase
      .from('events')
      .select('*')
      .order('ts', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (threadId) {
      query = query.eq('thread_id', threadId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to get events:', error);
      throw new Error(`Failed to get events: ${error.message}`);
    }

    return data || [];
  }

  // ==========================================
  // QUOTA MANAGEMENT
  // ==========================================

  async checkQuota(userId: string): Promise<{
    allowed: boolean;
    quota: Quota;
    limits: {
      tokensRemaining: number;
      requestsRemaining: number;
      attachmentsMbRemaining: number;
    };
  }> {
    // Use the stored function for quota checking
    const { data, error } = await this.supabase
      .rpc('check_and_update_quota', {
        p_user_id: userId,
        p_tokens: 0,
        p_requests: 0,
        p_attachments_mb: 0
      });

    if (error) {
      console.error('Failed to check quota:', error);
      // Fail open - allow request if quota check fails
      return {
        allowed: true,
        quota: {
          id: '',
          user_id: userId,
          period_start: new Date().toISOString(),
          period_end: new Date(Date.now() + 24*60*60*1000).toISOString(),
          tokens_used: 0,
          requests_count: 0,
          attachments_mb: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        limits: {
          tokensRemaining: 200000,
          requestsRemaining: 1000,
          attachmentsMbRemaining: 500
        }
      };
    }

    // Get current quota
    const quotaResult = await this.supabase
      .rpc('get_or_create_quota', { p_user_id: userId });

    const quota = quotaResult.data || {
      tokens_used: 0,
      requests_count: 0,
      attachments_mb: 0
    };

    const maxTokens = 200000;
    const maxRequests = 1000;
    const maxAttachmentsMb = 500;

    return {
      allowed: data === true,
      quota: quota,
      limits: {
        tokensRemaining: Math.max(0, maxTokens - quota.tokens_used),
        requestsRemaining: Math.max(0, maxRequests - quota.requests_count),
        attachmentsMbRemaining: Math.max(0, maxAttachmentsMb - quota.attachments_mb)
      }
    };
  }

  async updateQuota(
    userId: string,
    tokens = 0,
    requests = 1,
    attachmentsMb = 0
  ): Promise<boolean> {
    const { data, error } = await this.supabase
      .rpc('check_and_update_quota', {
        p_user_id: userId,
        p_tokens: tokens,
        p_requests: requests,
        p_attachments_mb: attachmentsMb
      });

    if (error) {
      console.error('Failed to update quota:', error);
      return false;
    }

    return data === true;
  }

  // ==========================================
  // SHARE LINKS
  // ==========================================

  async createShareLink(
    threadId: string,
    userId: string,
    options: {
      mode?: 'read' | 'write';
      scope?: 'public' | 'internal' | 'private';
      expiresAt?: Date;
    } = {}
  ): Promise<ShareLink> {
    const token = crypto.randomUUID();
    
    const { data, error } = await this.supabase
      .from('share_links')
      .insert({
        thread_id: threadId,
        owner: userId,
        mode: options.mode || 'read',
        scope: options.scope || 'private',
        token,
        expires_at: options.expiresAt?.toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create share link:', error);
      throw new Error(`Failed to create share link: ${error.message}`);
    }

    return data;
  }

  async getShareLink(token: string): Promise<ShareLink | null> {
    const { data, error } = await this.supabase
      .from('share_links')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      console.error('Failed to get share link:', error);
      throw new Error(`Failed to get share link: ${error.message}`);
    }

    // Check if link is expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null;
    }

    // Update access count
    await this.supabase
      .from('share_links')
      .update({
        access_count: data.access_count + 1,
        last_accessed_at: new Date().toISOString()
      })
      .eq('id', data.id);

    return data;
  }

  async deleteShareLink(linkId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('share_links')
      .delete()
      .eq('id', linkId)
      .eq('owner', userId);

    if (error) {
      console.error('Failed to delete share link:', error);
      throw new Error(`Failed to delete share link: ${error.message}`);
    }
  }

  // ==========================================
  // STORAGE OPERATIONS
  // ==========================================

  async createSignedUploadUrl(
    bucket: string,
    filePath: string,
    expiresIn = 300 // 5 minutes
  ): Promise<{ url: string; fields?: Record<string, string> }> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUploadUrl(filePath, expiresIn);

    if (error) {
      console.error('Failed to create signed upload URL:', error);
      throw new Error(`Failed to create signed upload URL: ${error.message}`);
    }

    return {
      url: data.signedUrl,
      fields: data.token ? { token: data.token } : undefined
    };
  }

  async createSignedUrl(
    bucket: string,
    filePath: string,
    expiresIn = 3600 // 1 hour
  ): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Failed to create signed URL:', error);
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  async deleteFile(bucket: string, filePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Failed to delete file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      // Simple query to test database connection
      const { data, error } = await this.supabase
        .from('threads')
        .select('count(*)')
        .limit(1);

      if (error) {
        throw error;
      }

      return {
        status: 'healthy',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString()
      };
    }
  }

  async getStats(userId?: string): Promise<{
    totalThreads: number;
    totalMessages: number;
    totalTokens: number;
    totalAttachments: number;
  }> {
    try {
      const threadsQuery = this.supabase
        .from('threads')
        .select('count(*)', { count: 'exact' });
      
      const messagesQuery = this.supabase
        .from('messages')
        .select('count(*), tokens.sum()', { count: 'exact' });
      
      const attachmentsQuery = this.supabase
        .from('attachments')
        .select('count(*)', { count: 'exact' });

      if (userId) {
        threadsQuery.eq('owner', userId);
        messagesQuery.eq('thread_id', 'in', `(select id from threads where owner = '${userId}')`);
        attachmentsQuery.eq('thread_id', 'in', `(select id from threads where owner = '${userId}')`);
      }

      const [threadsResult, messagesResult, attachmentsResult] = await Promise.all([
        threadsQuery,
        messagesQuery,
        attachmentsQuery
      ]);

      return {
        totalThreads: threadsResult.count || 0,
        totalMessages: messagesResult.count || 0,
        totalTokens: messagesResult.data?.[0]?.sum || 0,
        totalAttachments: attachmentsResult.count || 0
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      return {
        totalThreads: 0,
        totalMessages: 0,
        totalTokens: 0,
        totalAttachments: 0
      };
    }
  }
}