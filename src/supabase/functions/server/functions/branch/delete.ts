// POST /api/branch/delete - Elimina rama (bloquear si es default y hay única)
import { Context } from 'npm:hono@4';
import { ThreadsDbService } from '../../shared/db.threads.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export async function deleteBranch(c: Context) {
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

    // Eliminar rama (validaciones en el trigger de BD)
    const result = await ThreadsDbService.deleteBranch(user.id, id);

    console.log(`[deleteBranch] Deleted branch ${id} for user ${user.id}`);

    return c.json(result);

  } catch (error) {
    console.error('[deleteBranch] Error:', error);
    
    // Manejo específico de errores de validación
    if (error instanceof Error && error.message.includes('Cannot delete the only branch')) {
      return c.json({ 
        error: 'Cannot delete the only branch in a thread',
        details: 'A thread must have at least one branch'
      }, 409);
    }

    return c.json({ 
      error: 'Failed to delete branch',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}