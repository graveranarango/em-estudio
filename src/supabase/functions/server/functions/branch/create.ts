// POST /api/branch/create - Crea una rama en un hilo
import { Context } from 'npm:hono@4';
import { ThreadsDbService } from '../../shared/db.threads.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export async function createBranch(c: Context) {
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
    const { threadId, name } = await c.req.json();
    
    // Validar payload
    if (!threadId || !name) {
      return c.json({ error: 'Missing required fields: threadId, name' }, 400);
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      return c.json({ error: 'Name must be a non-empty string' }, 400);
    }

    if (name.trim().length > 50) {
      return c.json({ error: 'Name must be 50 characters or less' }, 400);
    }

    // Crear rama
    const result = await ThreadsDbService.createBranch(user.id, threadId, name.trim());

    console.log(`[createBranch] Created branch ${result.id} "${name}" in thread ${threadId} for user ${user.id}`);

    return c.json(result);

  } catch (error) {
    console.error('[createBranch] Error:', error);
    
    // Manejo específico de errores de constraint único
    if (error instanceof Error && error.message.includes('unique')) {
      return c.json({ 
        error: 'A branch with this name already exists in the thread',
        details: 'Branch names must be unique within a thread'
      }, 409);
    }

    return c.json({ 
      error: 'Failed to create branch',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}