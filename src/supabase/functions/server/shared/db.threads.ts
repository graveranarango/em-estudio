// Servicios de base de datos para threads y branches
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export interface ThreadSummary {
  id: string;
  title?: string;
  updatedAt: string;
  msgCount: number;
  branches: {
    id: string;
    name: string;
    isDefault: boolean;
  }[];
}

export interface Branch {
  id: string;
  name: string;
  isDefault?: boolean;
}

export class ThreadsDbService {
  // Lista hilos del usuario con conteo y ramas
  static async listThreads(userId: string): Promise<ThreadSummary[]> {
    const { data: threads, error: threadsError } = await supabase
      .from('threads')
      .select(`
        id,
        title,
        updated_at,
        branches!inner (
          id,
          name,
          is_default
        )
      `)
      .eq('owner', userId)
      .order('updated_at', { ascending: false });

    if (threadsError) {
      throw new Error(`Error fetching threads: ${threadsError.message}`);
    }

    // Obtener conteo de mensajes por hilo
    const threadIds = threads?.map(t => t.id) || [];
    if (threadIds.length === 0) return [];

    const { data: messageCounts, error: countsError } = await supabase
      .from('messages')
      .select('thread_id')
      .in('thread_id', threadIds);

    if (countsError) {
      throw new Error(`Error fetching message counts: ${countsError.message}`);
    }

    // Agrupar conteos por thread_id
    const countsByThread = messageCounts?.reduce((acc, msg) => {
      acc[msg.thread_id] = (acc[msg.thread_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return threads?.map(thread => ({
      id: thread.id,
      title: thread.title,
      updatedAt: thread.updated_at,
      msgCount: countsByThread[thread.id] || 0,
      branches: thread.branches.map((b: any) => ({
        id: b.id,
        name: b.name,
        isDefault: b.is_default
      }))
    })) || [];
  }

  // Crea hilo (y rama 'main' automáticamente via trigger)
  static async createThread(
    userId: string, 
    payload: { title?: string; system?: string; objective?: string }
  ): Promise<{ id: string }> {
    const { data, error } = await supabase
      .from('threads')
      .insert({
        owner: userId,
        title: payload.title,
        system_prompt: payload.system,
        objective: payload.objective
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Error creating thread: ${error.message}`);
    }

    return { id: data.id };
  }

  // Renombra hilo
  static async renameThread(userId: string, id: string, title: string): Promise<{ ok: true }> {
    const { error } = await supabase
      .from('threads')
      .update({ title })
      .eq('id', id)
      .eq('owner', userId);

    if (error) {
      throw new Error(`Error renaming thread: ${error.message}`);
    }

    return { ok: true };
  }

  // Elimina hilo y cascada (branches y messages se eliminan automáticamente)
  static async deleteThread(userId: string, id: string): Promise<{ ok: true }> {
    const { error } = await supabase
      .from('threads')
      .delete()
      .eq('id', id)
      .eq('owner', userId);

    if (error) {
      throw new Error(`Error deleting thread: ${error.message}`);
    }

    return { ok: true };
  }

  // Crea una rama en un hilo
  static async createBranch(
    userId: string, 
    threadId: string, 
    name: string
  ): Promise<{ id: string }> {
    // Verificar que el usuario es owner del hilo
    const { data: thread, error: threadError } = await supabase
      .from('threads')
      .select('id')
      .eq('id', threadId)
      .eq('owner', userId)
      .single();

    if (threadError || !thread) {
      throw new Error('Thread not found or unauthorized');
    }

    const { data, error } = await supabase
      .from('branches')
      .insert({
        thread_id: threadId,
        name,
        is_default: false
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Error creating branch: ${error.message}`);
    }

    return { id: data.id };
  }

  // Renombra rama
  static async renameBranch(userId: string, id: string, name: string): Promise<{ ok: true }> {
    const { error } = await supabase
      .from('branches')
      .update({ name })
      .eq('id', id)
      .eq('thread_id', supabase.from('threads').select('id').eq('owner', userId));

    if (error) {
      throw new Error(`Error renaming branch: ${error.message}`);
    }

    return { ok: true };
  }

  // Elimina rama (validación via trigger)
  static async deleteBranch(userId: string, id: string): Promise<{ ok: true }> {
    // Verificar ownership via join
    const { error } = await supabase
      .from('branches')
      .delete()
      .eq('id', id)
      .in('thread_id', 
        supabase.from('threads').select('id').eq('owner', userId)
      );

    if (error) {
      throw new Error(`Error deleting branch: ${error.message}`);
    }

    return { ok: true };
  }

  // Cambia la rama activa del hilo (actualiza el thread para trackear rama activa)
  static async switchBranch(userId: string, threadId: string, branchId: string): Promise<{ ok: true }> {
    // Verificar que la rama pertenece al hilo y el usuario es owner
    const { data: branch, error: branchError } = await supabase
      .from('branches')
      .select('id, thread_id')
      .eq('id', branchId)
      .eq('thread_id', threadId)
      .single();

    if (branchError || !branch) {
      throw new Error('Branch not found or unauthorized');
    }

    const { error: threadError } = await supabase
      .from('threads')
      .select('id')
      .eq('id', threadId)
      .eq('owner', userId)
      .single();

    if (threadError) {
      throw new Error('Thread not found or unauthorized');
    }

    // Por ahora no guardamos rama activa en el thread, se maneja en frontend
    // Pero podríamos agregar active_branch_id al thread si queremos persistir

    return { ok: true };
  }

  // Crea rama desde un mensaje y duplica los mensajes previos
  static async branchFromMessage(
    userId: string, 
    threadId: string, 
    messageId: string, 
    name?: string
  ): Promise<{ branchId: string }> {
    // Verificar ownership del hilo
    const { data: thread, error: threadError } = await supabase
      .from('threads')
      .select('id')
      .eq('id', threadId)
      .eq('owner', userId)
      .single();

    if (threadError || !thread) {
      throw new Error('Thread not found or unauthorized');
    }

    // Obtener el mensaje y su posición
    const { data: targetMessage, error: msgError } = await supabase
      .from('messages')
      .select('id, created_at, branch_id')
      .eq('id', messageId)
      .eq('thread_id', threadId)
      .single();

    if (msgError || !targetMessage) {
      throw new Error('Message not found');
    }

    // Generar nombre de rama si no se proporciona
    const branchName = name || `rama-${Date.now()}`;

    // Crear nueva rama
    const { data: newBranch, error: branchError } = await supabase
      .from('branches')
      .insert({
        thread_id: threadId,
        name: branchName,
        is_default: false
      })
      .select('id')
      .single();

    if (branchError) {
      throw new Error(`Error creating branch: ${branchError.message}`);
    }

    // Obtener todos los mensajes hasta e incluyendo el mensaje target
    const { data: messagesToCopy, error: copyError } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .eq('branch_id', targetMessage.branch_id)
      .lte('created_at', targetMessage.created_at)
      .order('created_at', { ascending: true });

    if (copyError) {
      throw new Error(`Error fetching messages to copy: ${copyError.message}`);
    }

    // Duplicar mensajes a la nueva rama
    if (messagesToCopy && messagesToCopy.length > 0) {
      const newMessages = messagesToCopy.map(msg => ({
        thread_id: threadId,
        branch_id: newBranch.id,
        role: msg.role,
        content: msg.content,
        created_at: msg.created_at
      }));

      const { error: insertError } = await supabase
        .from('messages')
        .insert(newMessages);

      if (insertError) {
        throw new Error(`Error copying messages: ${insertError.message}`);
      }
    }

    return { branchId: newBranch.id };
  }

  // Obtiene mensajes de una rama específica
  static async getMessagesForBranch(
    userId: string, 
    threadId: string, 
    branchId: string
  ): Promise<any[]> {
    // Verificar ownership
    const { data: thread, error: threadError } = await supabase
      .from('threads')
      .select('id')
      .eq('id', threadId)
      .eq('owner', userId)
      .single();

    if (threadError || !thread) {
      throw new Error('Thread not found or unauthorized');
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .eq('branch_id', branchId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Error fetching messages: ${error.message}`);
    }

    return messages || [];
  }

  // Obtiene la rama default de un hilo
  static async getDefaultBranch(userId: string, threadId: string): Promise<Branch | null> {
    const { data: branch, error } = await supabase
      .from('branches')
      .select('id, name, is_default')
      .eq('thread_id', threadId)
      .eq('is_default', true)
      .in('thread_id', 
        supabase.from('threads').select('id').eq('owner', userId)
      )
      .single();

    if (error || !branch) {
      return null;
    }

    return {
      id: branch.id,
      name: branch.name,
      isDefault: branch.is_default
    };
  }
}