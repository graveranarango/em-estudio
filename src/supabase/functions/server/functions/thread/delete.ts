// POST /api/thread/delete - Elimina hilo y cascada
import { Context } from 'npm:hono@4';
import { ThreadsDbService } from '../../shared/db.threads.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export async function deleteThread(c: Context) {
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
    const { id } = await c.req.json();
    
    // Validar payload
    if (!id) {
      return c.json({ error: 'Missing required field: id' }, 400);
    }

    // Eliminar hilo
    const result = await ThreadsDbService.deleteThread(user.id, id);

    console.log(`[deleteThread] Deleted thread ${id} for user ${user.id}`);

    return c.json(result);

  } catch (error) {
    console.error('[deleteThread] Error:', error);
    return c.json({ 
      error: 'Failed to delete thread',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}