// Hook for Export/Share functionality in Chat Maestro
import { useState, useCallback } from 'react';
import { 
  exportSDK, 
  ExportRequest, 
  ShareCreateRequest, 
  ExportResult, 
  ShareCreateResult 
} from '@/sdk/export';
import { toast } from 'sonner@2.0.3';

export interface ExportShareState {
  isExporting: boolean;
  isSharing: boolean;
  exportError: string | null;
  shareError: string | null;
  lastExport: ExportResult | null;
  lastShare: ShareCreateResult | null;
}

export const useExportShare = (authToken?: string) => {
  const [state, setState] = useState<ExportShareState>({
    isExporting: false,
    isSharing: false,
    exportError: null,
    shareError: null,
    lastExport: null,
    lastShare: null,
  });

  // Set auth token when it becomes available
  if (authToken) {
    exportSDK.setAuthToken(authToken);
  }

  /**
   * Export conversation to specified format
   */
  const exportConversation = useCallback(async (request: ExportRequest) => {
    setState(prev => ({ 
      ...prev, 
      isExporting: true, 
      exportError: null 
    }));

    try {
      let result: ExportResult;

      switch (request.format) {
        case 'md':
          result = await exportSDK.exportToMarkdown(request);
          break;
        case 'html':
          result = await exportSDK.exportToHTML(request);
          break;
        case 'pdf':
          result = await exportSDK.exportToPDF(request);
          break;
        default:
          throw new Error(`Formato no soportado: ${request.format}`);
      }

      setState(prev => ({ 
        ...prev, 
        isExporting: false,
        lastExport: result 
      }));

      // Show success message
      const formatNames = { md: 'Markdown', html: 'HTML', pdf: 'PDF' };
      toast.success(`Chat exportado a ${formatNames[request.format]} exitosamente`);

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      setState(prev => ({ 
        ...prev, 
        isExporting: false,
        exportError: errorMessage 
      }));

      toast.error(`Error al exportar: ${errorMessage}`);
      throw error;
    }
  }, []);

  /**
   * Download the last export result
   */
  const downloadLastExport = useCallback(async () => {
    if (!state.lastExport) {
      toast.error('No hay exportación disponible para descargar');
      return;
    }

    try {
      await exportSDK.downloadExport(state.lastExport);
      toast.success('Descarga iniciada');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en la descarga';
      toast.error(`Error al descargar: ${errorMessage}`);
    }
  }, [state.lastExport]);

  /**
   * Copy export content to clipboard
   */
  const copyExportToClipboard = useCallback(async () => {
    if (!state.lastExport?.content) {
      toast.error('No hay contenido disponible para copiar');
      return;
    }

    try {
      await exportSDK.copyToClipboard(state.lastExport.content);
      toast.success('Contenido copiado al portapapeles');
    } catch (error) {
      toast.error('Error al copiar al portapapeles');
    }
  }, [state.lastExport]);

  /**
   * Create shareable link
   */
  const createShareLink = useCallback(async (request: ShareCreateRequest) => {
    setState(prev => ({ 
      ...prev, 
      isSharing: true, 
      shareError: null 
    }));

    try {
      const result = await exportSDK.createShareLink(request);

      setState(prev => ({ 
        ...prev, 
        isSharing: false,
        lastShare: result 
      }));

      toast.success('Enlace de compartir creado exitosamente');
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      setState(prev => ({ 
        ...prev, 
        isSharing: false,
        shareError: errorMessage 
      }));

      toast.error(`Error al crear enlace: ${errorMessage}`);
      throw error;
    }
  }, []);

  /**
   * Copy share link to clipboard
   */
  const copyShareLink = useCallback(async () => {
    if (!state.lastShare) {
      toast.error('No hay enlace disponible para copiar');
      return;
    }

    try {
      await exportSDK.copyShareLink(state.lastShare);
      toast.success('Enlace copiado al portapapeles');
    } catch (error) {
      toast.error('Error al copiar enlace');
    }
  }, [state.lastShare]);

  /**
   * Revoke share link
   */
  const revokeShareLink = useCallback(async (linkId: string) => {
    try {
      await exportSDK.revokeShareLink(linkId);
      toast.success('Enlace revocado exitosamente');
      
      // Clear last share if it matches the revoked one
      setState(prev => ({ 
        ...prev, 
        lastShare: null 
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al revocar enlace: ${errorMessage}`);
      throw error;
    }
  }, []);

  /**
   * Quick export current message block
   */
  const exportCurrentMessage = useCallback(async (
    threadId: string, 
    messageId: string,
    format: 'md' | 'html' = 'md'
  ) => {
    return exportConversation({
      threadId,
      messageId,
      range: 'current',
      format,
      cleanup: {
        hideMeta: false,
        hideChips: false,
        maskPII: false
      }
    });
  }, [exportConversation]);

  /**
   * Quick share entire conversation
   */
  const shareConversation = useCallback(async (
    threadId: string,
    options: {
      mode?: 'readonly' | 'comments';
      expiresDays?: number;
      hideUsernames?: boolean;
    } = {}
  ) => {
    return createShareLink({
      threadId,
      mode: options.mode || 'readonly',
      scope: 'thread',
      expiresDays: options.expiresDays || 7, // Default 7 days
      hideUsernames: options.hideUsernames ?? true,
      cleanup: {
        hideMeta: true,
        hideChips: true,
        maskPII: true
      }
    });
  }, [createShareLink]);

  /**
   * Clear errors
   */
  const clearErrors = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      exportError: null,
      shareError: null 
    }));
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      isExporting: false,
      isSharing: false,
      exportError: null,
      shareError: null,
      lastExport: null,
      lastShare: null,
    });
  }, []);

  return {
    // State
    ...state,
    
    // Export functions
    exportConversation,
    exportCurrentMessage,
    downloadLastExport,
    copyExportToClipboard,
    
    // Share functions
    createShareLink,
    shareConversation,
    copyShareLink,
    revokeShareLink,
    
    // Utility functions
    clearErrors,
    reset,
    
    // Computed state
    hasExport: !!state.lastExport,
    hasShare: !!state.lastShare,
    isLoading: state.isExporting || state.isSharing,
    hasErrors: !!(state.exportError || state.shareError),
  };
};
