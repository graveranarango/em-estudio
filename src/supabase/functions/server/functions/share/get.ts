// Share Get Function for Chat Maestro - Public access to shared conversations
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ShareGetResult, ProcessedThread, CleanupOpts } from '../../shared/export.types.ts';
import { sanitizeContent, maskUsernames } from '../../shared/export.pii.ts';
import * as kv from '../../kv_store.tsx';

export async function getSharedContent(
  request: Request,
  supabase: ReturnType<typeof createClient>
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    console.log(`[Share Get] Accessing shared content with token: ${token?.slice(0, 8)}...`);
    
    // Validate request
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing token parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get share link from database (no auth required for public access)
    const { data: shareLink, error: shareError } = await supabase
      .from('share_links')
      .select('*')
      .eq('token', token)
      .single();
    
    if (shareError || !shareLink) {
      console.log(`[Share Get] Share link not found: ${token?.slice(0, 8)}...`);
      return new Response(
        JSON.stringify({ error: 'Share link not found or invalid' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if link has expired
    if (shareLink.expires_at) {
      const expiry = new Date(shareLink.expires_at);
      if (expiry < new Date()) {
        console.log(`[Share Get] Share link expired: ${token?.slice(0, 8)}...`);
        return new Response(
          JSON.stringify({ error: 'Share link has expired' }),
          { status: 410, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Get additional metadata from KV store
    const shareMetaKey = `share:${token}`;
    const shareMeta = await kv.get(shareMetaKey);
    
    // Fetch thread data from KV store
    const threadKey = `thread:${shareLink.thread_id}`;
    const threadData = await kv.get(threadKey);
    
    if (!threadData) {
      console.log(`[Share Get] Thread not found: ${shareLink.thread_id}`);
      return new Response(
        JSON.stringify({ error: 'Thread content not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Process thread data
    const processedThread: ProcessedThread = {
      id: threadData.id,
      title: threadData.title || 'Chat compartido',
      system: threadData.system || '',
      messages: threadData.messages || [],
      createdAt: threadData.createdAt,
      updatedAt: threadData.updatedAt
    };
    
    // Apply scope filtering
    let filteredMessages = processedThread.messages;
    
    if (shareLink.scope === 'selection' && shareLink.selection?.ids) {
      filteredMessages = processedThread.messages.filter(msg => 
        shareLink.selection.ids.includes(msg.id)
      );
    } else if (shareLink.scope === 'branch' && shareLink.branch) {
      // Filter by branch if supported in your message structure
      filteredMessages = processedThread.messages.filter(msg => 
        msg.branch === shareLink.branch || !msg.branch
      );
    }
    
    // Apply cleanup options from share metadata
    const cleanup: CleanupOpts = shareMeta?.cleanup || {
      hideMeta: true,
      hideChips: true,
      maskPII: true
    };
    
    // Sanitize messages for public consumption
    const sanitizedMessages = filteredMessages.map(message => {
      let content = sanitizeContent(message.content, cleanup);
      
      // Always mask usernames for public shares
      if (shareMeta?.hideUsernames !== false) {
        content = maskUsernames(content);
      }
      
      return {
        id: message.id,
        role: message.role,
        content: content,
        timestamp: message.timestamp,
        // Never expose internal metadata in public shares
        metadata: cleanup.hideMeta ? undefined : {
          // Only expose safe metadata
          wordCount: message.metadata?.wordCount,
          language: message.metadata?.language
        },
        // Remove brand guard findings if hideChips is enabled
        brandGuardFindings: cleanup.hideChips ? undefined : message.brandGuardFindings
      };
    });
    
    // Prepare safe thread info (never expose owner info)
    const safeThread = {
      title: processedThread.title,
      system: cleanup.hideMeta ? '' : processedThread.system
    };
    
    const result: ShareGetResult = {
      thread: safeThread,
      messages: sanitizedMessages,
      readOnly: true,
      cleanup
    };
    
    console.log(`[Share Get] Served shared content: ${sanitizedMessages.length} messages`);
    
    // Log anonymous access event (no user ID)
    try {
      await kv.set(`event:share:${Date.now()}:anonymous`, {
        stage: 'share',
        action: 'access',
        threadId: shareLink.thread_id,
        token: token.slice(0, 8), // Only log partial token
        messageCount: sanitizedMessages.length,
        success: true,
        timestamp: new Date().toISOString(),
        userId: 'anonymous'
      });
    } catch (eventError) {
      console.log(`[Share Get] Event logging failed: ${eventError}`);
    }
    
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'public, max-age=300' // 5 minute cache
        }
      }
    );
    
  } catch (error) {
    console.error(`[Share Get] Error serving shared content: ${error}`);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to load shared content',
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
 * Serves a public HTML view of shared content
 */
export async function getSharedContentHTML(
  request: Request,
  supabase: ReturnType<typeof createClient>
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return new Response('Missing token parameter', { status: 400 });
    }
    
    // Get the JSON data first
    const jsonRequest = new Request(request.url.replace('/view', '/get'));
    const jsonResponse = await getSharedContent(jsonRequest, supabase);
    
    if (!jsonResponse.ok) {
      const errorData = await jsonResponse.json();
      return new Response(
        `<html><body><h1>Error</h1><p>${errorData.error}</p></body></html>`,
        { status: jsonResponse.status, headers: { 'Content-Type': 'text/html' } }
      );
    }
    
    const data: ShareGetResult = await jsonResponse.json();
    
    // Generate HTML view
    const html = generatePublicHTML(data);
    
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300'
      }
    });
    
  } catch (error) {
    console.error(`[Share Get HTML] Error: ${error}`);
    return new Response(
      `<html><body><h1>Error</h1><p>Failed to load shared content</p></body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

/**
 * Generates a public HTML view for shared content
 */
function generatePublicHTML(data: ShareGetResult): string {
  const messages = data.messages.map(message => {
    const roleIcon = message.role === 'user' ? '👤' : '🤖';
    const roleClass = `message-${message.role}`;
    const timestamp = new Date(message.timestamp).toLocaleString();
    
    return `
      <div class="message ${roleClass}">
        <div class="message-header">
          <span class="role-icon">${roleIcon}</span>
          <span class="role-name">${message.role === 'user' ? 'Usuario' : 'Asistente'}</span>
          ${!data.cleanup?.hideMeta ? `<span class="timestamp">${timestamp}</span>` : ''}
        </div>
        <div class="message-content">${message.content.replace(/\n/g, '<br>')}</div>
      </div>
    `;
  }).join('');
  
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.thread.title} - Chat Compartido</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            color: #333;
            background: #f8f9fa;
        }
        .header {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .message {
            background: white;
            margin-bottom: 1rem;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .message-user { border-left: 4px solid #2196f3; }
        .message-assistant { border-left: 4px solid #9c27b0; }
        .message-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            font-weight: 600;
            color: #666;
        }
        .timestamp {
            margin-left: auto;
            font-size: 0.875rem;
            font-weight: normal;
        }
        .message-content {
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .footer {
            text-align: center;
            margin-top: 3rem;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            color: #666;
            font-size: 0.875rem;
        }
        .readonly-badge {
            background: #e3f2fd;
            color: #1976d2;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            font-size: 0.875rem;
            display: inline-block;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="readonly-badge">📖 Vista de solo lectura</div>
        <h1>${data.thread.title}</h1>
        <p>${data.messages.length} mensajes compartidos</p>
    </div>
    
    ${messages}
    
    <div class="footer">
        <p>Conversación compartida desde AI Content Studio</p>
        <p>Esta es una vista de solo lectura con contenido filtrado para proteger información sensible.</p>
    </div>
</body>
</html>`;
}