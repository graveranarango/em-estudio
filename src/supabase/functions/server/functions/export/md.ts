// Markdown Export Function for Chat Maestro
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ExportRequest, ProcessedThread } from '../../shared/export.types.ts';
import { serializeToMarkdown, generateFilename } from '../../shared/export.serializer.ts';
import { truncateForLog } from '../../shared/export.pii.ts';
import * as kv from '../../kv_store.tsx';

export async function exportToMarkdown(
  request: Request,
  supabase: ReturnType<typeof createClient>
): Promise<Response> {
  try {
    const body = await request.json();
    const exportReq: ExportRequest = body.req;
    
    console.log(`[MD Export] Starting export for thread ${exportReq.threadId}, range: ${exportReq.range}`);
    
    // Validate request
    if (!exportReq.threadId || !exportReq.range) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: threadId, range' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get user from auth
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      console.log(`[MD Export] Auth error: ${authError?.message}`);
      return new Response('Unauthorized', { status: 401 });
    }
    
    // Fetch thread data from KV store
    const threadKey = `thread:${exportReq.threadId}`;
    const threadData = await kv.get(threadKey);
    
    if (!threadData) {
      console.log(`[MD Export] Thread not found: ${exportReq.threadId}`);
      return new Response(
        JSON.stringify({ error: 'Thread not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify user owns this thread
    if (threadData.userId !== user.id) {
      console.log(`[MD Export] Access denied for user ${user.id} to thread ${exportReq.threadId}`);
      return new Response('Forbidden', { status: 403 });
    }
    
    // Process thread data
    const processedThread: ProcessedThread = {
      id: threadData.id,
      title: threadData.title || 'Chat sin título',
      system: threadData.system || '',
      messages: threadData.messages || [],
      createdAt: threadData.createdAt,
      updatedAt: threadData.updatedAt
    };
    
    // Filter messages if selection is specified
    let selectionIds: string[] | undefined;
    if (exportReq.range === 'selection' && exportReq.selectionIds) {
      selectionIds = exportReq.selectionIds;
    }
    
    // Generate markdown content
    const markdownContent = serializeToMarkdown(
      processedThread,
      exportReq.cleanup,
      exportReq.range,
      selectionIds
    );
    
    // Generate filename
    const filename = generateFilename(
      processedThread.title,
      'md',
      exportReq.range
    );
    
    console.log(`[MD Export] Generated MD file: ${filename} (${markdownContent.length} chars)`);
    
    // Log event for analytics
    try {
      await kv.set(`event:export:${Date.now()}:${user.id}`, {
        stage: 'export',
        format: 'md',
        range: exportReq.range,
        threadId: exportReq.threadId,
        size_kb: Math.round(markdownContent.length / 1024),
        success: true,
        timestamp: new Date().toISOString(),
        userId: user.id
      });
    } catch (eventError) {
      console.log(`[MD Export] Event logging failed: ${eventError}`);
    }
    
    return new Response(
      JSON.stringify({
        filename,
        content: markdownContent
      }),
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
    console.error(`[MD Export] Error during export: ${error}`);
    
    // Log failed event
    try {
      const accessToken = request.headers.get('Authorization')?.split(' ')[1];
      const { data: { user } } = await supabase.auth.getUser(accessToken);
      
      if (user?.id) {
        await kv.set(`event:export:${Date.now()}:${user.id}`, {
          stage: 'export',
          format: 'md',
          success: false,
          error: truncateForLog(error.toString()),
          timestamp: new Date().toISOString(),
          userId: user.id
        });
      }
    } catch (eventError) {
      console.log(`[MD Export] Event logging failed: ${eventError}`);
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Export failed',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}