// Hook personalizado para gestión de threads y branches
import { useCallback } from 'react';
import { useChatStore } from '@/state/chatStore';
import threadsSDK from '@/sdk/threads/index';
import { toast } from 'sonner@2.0.3';

export function useThreads() {
  const {
    threadId,
    branchId,
    history,
    branches,
    loadHistory,
    selectThread,
    createNewThread,
    renameThread,
    deleteThread,
    setBranch,
    createBranch,
    renameBranch,
    deleteBranch,
    branchFromMessage,
    error,
    clearError
  } = useChatStore();

  // Actions con manejo de errores y notificaciones
  const handleCreateThread = useCallback(async (title?: string) => {
    try {
      await createNewThread(title);
      toast.success('Hilo creado exitosamente');
    } catch (error) {
      toast.error('Error al crear hilo');
      console.error('Create thread error:', error);
    }
  }, [createNewThread]);

  const handleRenameThread = useCallback(async (id: string, title: string) => {
    try {
      await renameThread(id, title);
      toast.success('Hilo renombrado exitosamente');
    } catch (error) {
      toast.error('Error al renombrar hilo');
      console.error('Rename thread error:', error);
    }
  }, [renameThread]);

  const handleDeleteThread = useCallback(async (id: string) => {
    try {
      await deleteThread(id);
      toast.success('Hilo eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar hilo');
      console.error('Delete thread error:', error);
    }
  }, [deleteThread]);

  const handleSelectThread = useCallback(async (id: string, branchId?: string) => {
    try {
      await selectThread(id, branchId);
      // No mostrar toast para selección, es una acción silenciosa
    } catch (error) {
      toast.error('Error al cargar hilo');
      console.error('Select thread error:', error);
    }
  }, [selectThread]);

  const handleCreateBranch = useCallback(async (name: string) => {
    if (!threadId) {
      toast.error('No hay hilo activo');
      return;
    }

    // Validar nombre único
    const validationError = threadsSDK.validateBranchName(name, branches);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const branchId = await createBranch(threadId, name);
      await setBranch(branchId); // Cambiar a la nueva rama
      toast.success(`Rama "${name}" creada exitosamente`);
      return branchId;
    } catch (error) {
      toast.error('Error al crear rama');
      console.error('Create branch error:', error);
    }
  }, [threadId, branches, createBranch, setBranch]);

  const handleRenameBranch = useCallback(async (id: string, name: string) => {
    // Validar nombre único (excluyendo la rama actual)
    const otherBranches = branches.filter(b => b.id !== id);
    const validationError = threadsSDK.validateBranchName(name, otherBranches);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      await renameBranch(id, name);
      toast.success('Rama renombrada exitosamente');
    } catch (error) {
      toast.error('Error al renombrar rama');
      console.error('Rename branch error:', error);
    }
  }, [branches, renameBranch]);

  const handleDeleteBranch = useCallback(async (id: string) => {
    // Validar que no sea la única rama
    if (branches.length <= 1) {
      toast.error('No se puede eliminar la única rama del hilo');
      return;
    }

    try {
      await deleteBranch(id);
      toast.success('Rama eliminada exitosamente');
    } catch (error) {
      toast.error('Error al eliminar rama');
      console.error('Delete branch error:', error);
    }
  }, [branches, deleteBranch]);

  const handleSwitchBranch = useCallback(async (id: string) => {
    try {
      await setBranch(id);
      const branch = branches.find(b => b.id === id);
      if (branch) {
        toast.success(`Cambiado a rama "${branch.name}"`);
      }
    } catch (error) {
      toast.error('Error al cambiar de rama');
      console.error('Switch branch error:', error);
    }
  }, [setBranch, branches]);

  const handleBranchFromMessage = useCallback(async (messageId: string, name?: string) => {
    if (!threadId) {
      toast.error('No hay hilo activo');
      return;
    }

    try {
      // Generar nombre único si no se proporciona
      const branchName = name || threadsSDK.generateUniqueBranchName('rama', branches);
      
      const branchId = await branchFromMessage(messageId, branchName);
      toast.success(`Rama "${branchName}" creada desde el mensaje`);
      return branchId;
    } catch (error) {
      toast.error('Error al crear rama desde mensaje');
      console.error('Branch from message error:', error);
    }
  }, [threadId, branches, branchFromMessage]);

  const handleLoadHistory = useCallback(async () => {
    try {
      await loadHistory();
    } catch (error) {
      toast.error('Error al cargar historial');
      console.error('Load history error:', error);
    }
  }, [loadHistory]);

  // Helpers
  const getCurrentThread = useCallback(() => {
    return history.find(t => t.id === threadId);
  }, [history, threadId]);

  const getCurrentBranch = useCallback(() => {
    return branches.find(b => b.id === branchId);
  }, [branches, branchId]);

  const getDefaultBranch = useCallback(() => {
    return branches.find(b => b.isDefault) || branches[0];
  }, [branches]);

  const isCurrentBranchDefault = useCallback(() => {
    const current = getCurrentBranch();
    return current?.isDefault || false;
  }, [getCurrentBranch]);

  const canDeleteCurrentBranch = useCallback(() => {
    return branches.length > 1;
  }, [branches]);

  return {
    // State
    threadId,
    branchId,
    history,
    branches,
    error,
    
    // Thread actions
    createThread: handleCreateThread,
    renameThread: handleRenameThread,
    deleteThread: handleDeleteThread,
    selectThread: handleSelectThread,
    loadHistory: handleLoadHistory,
    
    // Branch actions
    createBranch: handleCreateBranch,
    renameBranch: handleRenameBranch,
    deleteBranch: handleDeleteBranch,
    switchBranch: handleSwitchBranch,
    branchFromMessage: handleBranchFromMessage,
    
    // Helpers
    getCurrentThread,
    getCurrentBranch,
    getDefaultBranch,
    isCurrentBranchDefault,
    canDeleteCurrentBranch,
    
    // Utilities
    clearError,
    validateBranchName: (name: string) => threadsSDK.validateBranchName(name, branches),
    generateUniqueBranchName: (baseName: string) => threadsSDK.generateUniqueBranchName(baseName, branches)
  };
}