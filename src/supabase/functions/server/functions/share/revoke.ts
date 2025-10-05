// Share Revoke Function for Chat Maestro
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { truncateForLog } from '../../shared/export.pii.ts';
import * as kv from '../../kv_store.tsx';

export async function revokeShareLink(
  request: Request,
  supabase: ReturnType<typeof createClient>
): Promise<Response> {
  try {
    const body = await request.json();
    const { id, token } = body;
    
    console.log(`[Share Revoke] Revoking share link: ${id || 'by token'}`);
    
    // Validate request - need either id or token
    if (!id && !token) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: id or token' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get user from auth
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      console.log(`[Share Revoke] Auth error: ${authError?.message}`);
      return new Response('Unauthorized', { status: 401 });
    }
    
    // Find and verify ownership of share link
    let shareLink;
    if (id) {
      // Revoke by ID
      const { data, error } = await supabase
        .from('share_links')
        .select('*')
        .eq('id', id)
        .eq('owner', user.id)
        .single();
        
      if (error || !data) {
        console.log(`[Share Revoke] Share link not found or access denied: ${id}`);
        return new Response(
          JSON.stringify({ error: 'Share link not found or access denied' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      shareLink = data;
    } else {
      // Revoke by token
      const { data, error } = await supabase
        .from('share_links')
        .select('*')
        .eq('token', token)
        .eq('owner', user.id)
        .single();
        
      if (error || !data) {
        console.log(`[Share Revoke] Share link not found or access denied: ${token?.slice(0, 8)}...`);
        return new Response(
          JSON.stringify({ error: 'Share link not found or access denied' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      shareLink = data;
    }
    
    // Delete the share link record
    const { error: deleteError } = await supabase
      .from('share_links')
      .delete()
      .eq('id', shareLink.id);
    
    if (deleteError) {
      console.error(`[Share Revoke] Database delete failed: ${deleteError.message}`);
      return new Response(
        JSON.stringify({ error: 'Failed to revoke share link' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Clean up KV metadata
    try {
      const shareMetaKey = `share:${shareLink.token}`;
      await kv.del(shareMetaKey);
    } catch (kvError) {
      console.log(`[Share Revoke] KV cleanup failed: ${kvError}`);
      // Don't fail the request for this
    }
    
    console.log(`[Share Revoke] Successfully revoked share link: ${shareLink.id}`);
    
    // Log event for analytics
    try {
      await kv.set(`event:share:${Date.now()}:${user.id}`, {
        stage: 'share',
        action: 'revoke',
        shareId: shareLink.id,
        threadId: shareLink.thread_id,
        success: true,
        timestamp: new Date().toISOString(),
        userId: user.id
      });
    } catch (eventError) {
      console.log(`[Share Revoke] Event logging failed: ${eventError}`);
    }
    
    return new Response(
      JSON.stringify({ ok: true }),
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
    console.error(`[Share Revoke] Error revoking share link: ${error}`);
    
    // Log failed event
    try {
      const accessToken = request.headers.get('Authorization')?.split(' ')[1];
      const { data: { user } } = await supabase.auth.getUser(accessToken);
      
      if (user?.id) {
        await kv.set(`event:share:${Date.now()}:${user.id}`, {
          stage: 'share',
          action: 'revoke',
          success: false,
          error: truncateForLog(error.toString()),
          timestamp: new Date().toISOString(),
          userId: user.id
        });
      }
    } catch (eventError) {
      console.log(`[Share Revoke] Event logging failed: ${eventError}`);
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to revoke share link',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}