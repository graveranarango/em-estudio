// GET /api/threads/list - Lista hilos del usuario con conteo y ramas
import { Context } from 'npm:hono@4';
import { ThreadsDbService } from '../../shared/db.threads.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export async function listThreads(c: Context) {
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

    // Obtener hilos
    const items = await ThreadsDbService.listThreads(user.id);

    console.log(`[listThreads] Retrieved ${items.length} threads for user ${user.id}`);

    return c.json({ items });

  } catch (error) {
    console.error('[listThreads] Error:', error);
    return c.json({ 
      error: 'Failed to list threads',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}