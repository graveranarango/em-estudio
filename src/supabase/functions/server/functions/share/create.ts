// Share Create Function for Chat Maestro
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ShareCreateReq, ShareCreateResult } from '../../shared/export.types.ts';
import { truncateForLog } from '../../shared/export.pii.ts';
import * as kv from '../../kv_store.tsx';

export async function createShareLink(
  request: Request,
  supabase: ReturnType<typeof createClient>
): Promise<Response> {
  try {
    const body = await request.json();
    const shareReq: ShareCreateReq = body.req;
    
    console.log(`[Share Create] Creating share link for thread ${shareReq.threadId}, mode: ${shareReq.mode}`);
    
    // Validate request
    if (!shareReq.threadId || !shareReq.mode || !shareReq.scope) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: threadId, mode, scope' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get user from auth
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      console.log(`[Share Create] Auth error: ${authError?.message}`);
      return new Response('Unauthorized', { status: 401 });
    }
    
    // Verify thread exists and user owns it
    const threadKey = `thread:${shareReq.threadId}`;
    const threadData = await kv.get(threadKey);
    
    if (!threadData) {
      console.log(`[Share Create] Thread not found: ${shareReq.threadId}`);
      return new Response(
        JSON.stringify({ error: 'Thread not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (threadData.userId !== user.id) {
      console.log(`[Share Create] Access denied for user ${user.id} to thread ${shareReq.threadId}`);
      return new Response('Forbidden', { status: 403 });
    }
    
    // Generate unique token
    const token = generateSecureToken();
    
    // Calculate expiration date
    let expiresAt: string | null = null;
    if (shareReq.expiresDays && shareReq.expiresDays > 0) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + shareReq.expiresDays);
      expiresAt = expiry.toISOString();
    }
    
    // Prepare selection data
    let selectionData = null;
    if (shareReq.scope === 'selection' && shareReq.selectionIds) {
      selectionData = { ids: shareReq.selectionIds };
    }
    
    // Create share link record in database
    const { data: shareLink, error: insertError } = await supabase
      .from('share_links')
      .insert({
        thread_id: shareReq.threadId,
        owner: user.id,
        mode: shareReq.mode,
        scope: shareReq.scope,
        branch: shareReq.branch,
        selection: selectionData,
        token: token,
        expires_at: expiresAt
      })
      .select()
      .single();
    
    if (insertError) {
      console.error(`[Share Create] Database insert failed: ${insertError.message}`);
      return new Response(
        JSON.stringify({ error: 'Failed to create share link' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate the public share URL
    const baseUrl = Deno.env.get('SUPABASE_URL') || 'http://localhost:54321';
    const shareUrl = `${baseUrl}/functions/v1/make-server-ecf7df64/share/view?token=${token}`;
    
    // Store additional metadata in KV for quick access
    const shareMetaKey = `share:${token}`;
    await kv.set(shareMetaKey, {
      threadId: shareReq.threadId,
      owner: user.id,
      mode: shareReq.mode,
      scope: shareReq.scope,
      cleanup: shareReq.cleanup,
      hideUsernames: shareReq.hideUsernames,
      createdAt: new Date().toISOString(),
      expiresAt
    });
    
    console.log(`[Share Create] Created share link: ${shareLink.id} with token ${token.slice(0, 8)}...`);
    
    // Log event for analytics
    try {
      await kv.set(`event:share:${Date.now()}:${user.id}`, {
        stage: 'share',
        action: 'create',
        threadId: shareReq.threadId,
        mode: shareReq.mode,
        scope: shareReq.scope,
        expiresAt,
        success: true,
        timestamp: new Date().toISOString(),
        userId: user.id
      });
    } catch (eventError) {
      console.log(`[Share Create] Event logging failed: ${eventError}`);
    }
    
    const result: ShareCreateResult = {
      link: shareUrl,
      token: token,
      expires_at: expiresAt
    };
    
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    );
    
  } catch (error) {
    console.error(`[Share Create] Error creating share link: ${error}`);
    
    // Log failed event
    try {
      const accessToken = request.headers.get('Authorization')?.split(' ')[1];
      const { data: { user } } = await supabase.auth.getUser(accessToken);
      
      if (user?.id) {
        await kv.set(`event:share:${Date.now()}:${user.id}`, {
          stage: 'share',
          action: 'create',
          success: false,
          error: truncateForLog(error.toString()),
          timestamp: new Date().toISOString(),
          userId: user.id
        });
      }
    } catch (eventError) {
      console.log(`[Share Create] Event logging failed: ${eventError}`);
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create share link',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Generates a secure random token for share links
 */
function generateSecureToken(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const tokenLength = 32;
  let token = '';
  
  for (let i = 0; i < tokenLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters.charAt(randomIndex);
  }
  
  // Add timestamp prefix for uniqueness
  const timestamp = Date.now().toString(36);
  return `${timestamp}_${token}`;
}