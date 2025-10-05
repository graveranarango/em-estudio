// POST /api/thread/create - Crea hilo (y rama 'main')
import { Context } from 'npm:hono@4';
import { ThreadsDbService } from '../../shared/db.threads.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export async function createThread(c: Context) {
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
    const payload = await c.req.json();
    
    // Validar payload opcional
    const { title, system, objective } = payload;

    // Crear hilo
    const result = await ThreadsDbService.createThread(user.id, {
      title,
      system,
      objective
    });

    console.log(`[createThread] Created thread ${result.id} for user ${user.id}`);

    return c.json(result);

  } catch (error) {
    console.error('[createThread] Error:', error);
    return c.json({ 
      error: 'Failed to create thread',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}