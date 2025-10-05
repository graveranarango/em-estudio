// POST /api/message/branch-from - Crea rama desde un mensaje y duplica los mensajes previos
import { Context } from 'npm:hono@4';
import { ThreadsDbService } from '../../shared/db.threads.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export async function branchFromMessage(c: Context) {
  try {
    // Obtener user ID del token de autorización
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user?.id) {
      return c.json({ error: 'Invalid authorization' }, 401);
    }

    // Obtener payload
    const { threadId, messageId, name } = await c.req.json();
    
    // Validar payload
    if (!threadId || !messageId) {
      return c.json({ error: 'Missing required fields: threadId, messageId' }, 400);
    }

    if (name && (typeof name !== 'string' || name.trim().length > 50)) {
      return c.json({ error: 'Name must be a string of 50 characters or less' }, 400);
    }

    // Crear rama desde mensaje
    const result = await ThreadsDbService.branchFromMessage(
      user.id, 
      threadId, 
      messageId, 
      name?.trim()
    );

    console.log(`[branchFromMessage] Created branch ${result.branchId} from message ${messageId} in thread ${threadId} for user ${user.id}`);

    return c.json(result);

  } catch (error) {
    console.error('[branchFromMessage] Error:', error);
    
    // Manejo específico de errores
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('unauthorized')) {
        return c.json({ 
          error: 'Thread or message not found or unauthorized',
          details: 'Verify that the thread and message exist and you have access'
        }, 404);
      }
      
      if (error.message.includes('unique')) {
        return c.json({ 
          error: 'A branch with this name already exists in the thread',
          details: 'Branch names must be unique within a thread'
        }, 409);
      }
    }

    return c.json({ 
      error: 'Failed to create branch from message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}