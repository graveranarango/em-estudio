// POST /api/branch/switch - Cambia la rama activa del hilo
import { Context } from 'npm:hono@4';
import { ThreadsDbService } from '../../shared/db.threads.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export async function switchBranch(c: Context) {
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
    const { threadId, branchId } = await c.req.json();
    
    // Validar payload
    if (!threadId || !branchId) {
      return c.json({ error: 'Missing required fields: threadId, branchId' }, 400);
    }

    // Cambiar rama (incluye validaciones de ownership)
    const result = await ThreadsDbService.switchBranch(user.id, threadId, branchId);

    console.log(`[switchBranch] Switched to branch ${branchId} in thread ${threadId} for user ${user.id}`);

    return c.json(result);

  } catch (error) {
    console.error('[switchBranch] Error:', error);
    
    // Manejo específico de errores de autorización/validación
    if (error instanceof Error && 
        (error.message.includes('not found') || error.message.includes('unauthorized'))) {
      return c.json({ 
        error: 'Branch or thread not found or unauthorized',
        details: 'Verify that the branch and thread exist and you have access'
      }, 404);
    }

    return c.json({ 
      error: 'Failed to switch branch',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}