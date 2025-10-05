// POST /api/thread/rename - Renombra hilo
import { Context } from 'npm:hono@4';
import { ThreadsDbService } from '../../shared/db.threads.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export async function renameThread(c: Context) {
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
    const { id, title } = await c.req.json();
    
    // Validar payload
    if (!id || !title) {
      return c.json({ error: 'Missing required fields: id, title' }, 400);
    }

    if (typeof title !== 'string' || title.trim().length === 0) {
      return c.json({ error: 'Title must be a non-empty string' }, 400);
    }

    // Renombrar hilo
    const result = await ThreadsDbService.renameThread(user.id, id, title.trim());

    console.log(`[renameThread] Renamed thread ${id} to "${title}" for user ${user.id}`);

    return c.json(result);

  } catch (error) {
    console.error('[renameThread] Error:', error);
    return c.json({ 
      error: 'Failed to rename thread',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}