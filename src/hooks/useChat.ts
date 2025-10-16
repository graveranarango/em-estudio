import { useCallback, useRef, useEffect } from 'react';
import { ChatSDK, stream, abort, regenerate, signUpload, saveThread } from '@/sdk/chat';
import { useChatStore, useChatSelectors } from '@/state/chatStore';
import type { 
  Settings, 
  Tool, 
  ChatRequest,
  SSEEvent,
  Msg
} from '@/sdk/chat/contracts';

// Hook return type
export interface UseChatReturn {
  // State from store
  messages: Msg[];
  isStreaming: boolean;
  error: string | undefined;
  settings: Settings;
  composerText: string;
  rightPanelOpen: boolean;
  
  // Actions
  send: (content?: string, tools?: Tool[]) => Promise<void>;
  abort: () => Promise<void>;
  regenerate: (nudge?: 'shorter' | 'longer' | 'creative' | 'concise') => Promise<void>;
  
  // UI actions
  setComposerText: (text: string) => void;
  setSettings: (settings: Partial<Settings>) => void;
  setRightPanelOpen: (open: boolean) => void;
  
  // Thread actions
  createNewThread: () => void;
  selectThread: (threadId: string) => Promise<void>;
  saveCurrentThread: () => Promise<void>;
  
  // Attachment actions
  uploadAttachment: (file: File) => Promise<{ id: string; url: string }>;
  
  // Slash commands
  processSlashCommand: (command: string) => { content: string; tools: Tool[]; settings: Partial<Settings> };
}

export function useChat(jwt?: string): UseChatReturn {
  console.log('useChat hook called');
  // Get state and actions from store
  const {
    threadId,
    system,
    settings,
    messages,
    composerText,
    rightPanelOpen,
    streaming,
    error,
    setComposerText,
    setSettings,
    setRightPanelOpen,
    pushUserMessage,
    upsertAssistantMessage,
    setStreaming,
    handleSSEEvent,
    createNewThread,
    selectThread,
    setError,
    clearError
  } = useChatStore();

  // Get selectors
  const isStreaming = useChatSelectors.useIsStreaming();
  const canSendMessage = useChatSelectors.useCanSendMessage();
  const canAbort = useChatSelectors.useCanAbort();

  // Load initial data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      const { history, loadHistory, selectThread, setLoading } = useChatStore.getState();
      setLoading(true);
      if (history.length === 0) {
        await loadHistory();
        const { history: updatedHistory } = useChatStore.getState();
        if (updatedHistory.length > 0) {
          await selectThread(updatedHistory[0].id);
        }
      }
      setLoading(false);
    };
    loadInitialData();
  }, []);

  const sdkRef = useRef<ChatSDK>(new ChatSDK(jwt));
  const currentRunIdRef = useRef<string>();

  // Update JWT token when provided
  if (jwt) {
    sdkRef.current.setJWT(jwt);
  }

  // Process slash commands
  const processSlashCommand = useCallback((content: string) => {
    return sdkRef.current.processSlashCommands(content);
  }, []);

  // Send a message
  const send = useCallback(async (content?: string, tools: Tool[] = []) => {
    const messageContent = content || composerText;
    if (!messageContent.trim() || isStreaming) {
      return;
    }

    // Demo mode - simulate chat without real backend
    if (!jwt) {
      try {
        clearError();
        
        // Process slash commands
        const processed = processSlashCommand(messageContent);
        
        // Add user message to store
        pushUserMessage(processed.content);
        
        // Simulate streaming response
        setStreaming('thinking');
        
        // Create placeholder assistant message
        upsertAssistantMessage('');
        
        // Simulate AI response after a delay
        setTimeout(() => {
          const responses = [
            "Esta es una respuesta simulada del Chat Maestro. En modo demo, puedo ayudarte a entender la funcionalidad sin conectar al backend real.",
            "¡Excelente pregunta! En producción, estaría procesando tu solicitud con IA avanzada y herramientas como búsqueda web, análisis de documentos y brand guard.",
            "Para activar todas las funcionalidades, necesitas configurar la autenticación JWT y conectar con el backend de Supabase."
          ];
          
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          upsertAssistantMessage(randomResponse, `demo_${Date.now()}`);
          setStreaming('idle');
        }, 2000);
        
        return;
      } catch (error) {
        console.error('Demo mode error:', error);
        setError('Error en modo demo');
        setStreaming('error');
        return;
      }
    }

    try {
      clearError();
      
      // Process slash commands
      const processed = processSlashCommand(messageContent);
      const finalTools = [...tools, ...processed.tools.map(name => ({ name } as Tool))];
      
      // Update settings from slash commands
      if (Object.keys(processed.settings).length > 0) {
        setSettings(processed.settings);
      }

      // Add user message to store
      pushUserMessage(processed.content);

      // Create placeholder assistant message
      upsertAssistantMessage('');

      // Prepare chat request
      const chatRequest: ChatRequest = {
        threadId,
        system: `You are a ${settings.persona} AI assistant specialized in content creation. ${settings.brandGuard ? 'Always follow brand guidelines and maintain brand consistency.' : ''}`,
        messages: [
          ...messages,
          {
            id: `user_${Date.now()}`,
            role: 'user',
            parts: [{ type: 'text', value: processed.content }],
            createdAt: new Date().toISOString()
          }
        ],
        settings: { ...settings, ...processed.settings },
        tools: finalTools,
        objective: processed.content
      };

      // Start streaming
      const { runId } = await stream(chatRequest, jwt, handleSSEEvent);
      currentRunIdRef.current = runId;

      // Set streaming status
      setStreaming('thinking', runId);

    } catch (error) {
      console.error('Failed to send message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
      setStreaming('error');
    }
  }, [
    jwt, 
    composerText, 
    isStreaming, 
    threadId, 
    system, 
    settings, 
    messages, 
    processSlashCommand,
    setSettings,
    pushUserMessage,
    upsertAssistantMessage,
    handleSSEEvent,
    setStreaming,
    setError,
    clearError
  ]);

  // Regenerate last response
  const regenerateResponse = useCallback(async (nudge?: 'shorter' | 'longer' | 'creative' | 'concise') => {
    if (isStreaming || messages.length === 0) {
      return;
    }

    const lastAssistantMessage = [...messages].reverse().find(msg => msg.role === 'assistant');
    if (!lastAssistantMessage) {
      console.warn('No assistant message to regenerate');
      return;
    }

    try {
      clearError();
      
      // Create new assistant message placeholder
      upsertAssistantMessage('', `regenerate_${Date.now()}`);

      // Set streaming status
      setStreaming('thinking');

      if (!jwt) {
        // Demo mode - simulate regeneration
        setTimeout(() => {
          const regeneratedResponses = {
            'shorter': 'Respuesta más breve simulada.',
            'longer': 'Esta es una respuesta más detallada y extensa que simula el comportamiento de regeneración del Chat Maestro en modo demo.',
            'creative': '✨ Respuesta creativa e innovadora que demuestra el potencial del sistema! 🚀',
            'concise': 'Respuesta concisa y directa.'
          };
          
          const response = regeneratedResponses[nudge || 'shorter'] || 'Respuesta regenerada en modo demo.';
          upsertAssistantMessage(response, `regenerate_${Date.now()}`);
          setStreaming('idle');
        }, 1500);
        return;
      }

      // Call regenerate endpoint
      await regenerate(threadId, lastAssistantMessage.id, nudge, jwt);

    } catch (error) {
      console.error('Failed to regenerate response:', error);
      setError(error instanceof Error ? error.message : 'Failed to regenerate');
      setStreaming('error');
    }
  }, [
    jwt, 
    isStreaming, 
    messages, 
    threadId,
    upsertAssistantMessage,
    setStreaming,
    setError,
    clearError
  ]);

  // Abort current generation
  const abortGeneration = useCallback(async () => {
    if (!isStreaming) {
      return;
    }

    try {
      if (jwt && currentRunIdRef.current) {
        await abort(threadId, currentRunIdRef.current, jwt);
      }
      
      setStreaming('cancelled');
      
      // Call abort function if available
      if (streaming.abortFn) {
        streaming.abortFn();
      }

    } catch (error) {
      console.error('Failed to abort generation:', error);
      setError('Failed to abort generation');
    }
  }, [jwt, isStreaming, threadId, streaming.abortFn, setStreaming, setError]);

  // Save current thread
  const saveCurrentThread = useCallback(async () => {
    try {
      const title = messages.find(m => m.role === 'user')?.parts[0]?.value.substring(0, 50) || 'Untitled Chat';
      
      if (jwt) {
        await saveThread({
          id: threadId,
          title,
          system,
          settings
        }, jwt);
      } else {
        // Demo mode - save to localStorage
        const threadData = {
          id: threadId,
          title,
          system,
          settings,
          messages,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem(`chat_thread_${threadId}`, JSON.stringify(threadData));
        console.log('Thread saved to localStorage in demo mode');
      }

    } catch (error) {
      console.error('Failed to save thread:', error);
      setError('Failed to save thread');
    }
  }, [jwt, threadId, system, settings, messages, setError]);

  // Upload attachment
  const uploadAttachment = useCallback(async (file: File): Promise<{ id: string; url: string }> => {
    try {
      if (jwt) {
        // Get signed upload URL
        const { url, fields } = await signUpload(file.type, threadId, jwt);

        // Create form data for upload
        const formData = new FormData();
        if (fields) {
          Object.entries(fields).forEach(([key, value]) => {
            formData.append(key, value);
          });
        }
        formData.append('file', file);

        // Upload file
        const uploadResponse = await fetch(url, {
          method: 'POST',
          body: formData
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.status}`);
        }

        return {
          id: `attachment_${Date.now()}`,
          url: url // In production, this would be the final file URL
        };
      } else {
        // Demo mode - simulate file upload
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              id: `demo_attachment_${Date.now()}`,
              url: URL.createObjectURL(file) // Create local blob URL for demo
            });
          }, 1000);
        });
      }

    } catch (error) {
      console.error('Failed to upload attachment:', error);
      throw new Error('Failed to upload attachment');
    }
  }, [jwt, threadId]);

  return {
    // State from store
    messages,
    isStreaming,
    error,
    settings,
    composerText,
    rightPanelOpen,
    
    // Actions
    send,
    abort: abortGeneration,
    regenerate: regenerateResponse,
    
    // UI actions
    setComposerText,
    setSettings,
    setRightPanelOpen,
    
    // Thread actions
    createNewThread,
    selectThread,
    saveCurrentThread,
    
    // Attachment actions
    uploadAttachment,
    
    // Slash commands
    processSlashCommand
  };
}