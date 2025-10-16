// Chat Store with Zustand + Immer
// Manages chat state including threads, messages, streaming status, and UI state

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { brandGuardSDK } from '../sdk/guard';
import { useBrandKit } from '../contexts/BrandKitContext';
import type { 
  Settings, 
  Msg, 
  SSEEvent, 
  GoogleIARequest 
} from '../sdk/chat/contracts';
import type { ThreadSummary as APIThreadSummary, Branch } from '../sdk/threads/contracts';
import threadsSDK from '../sdk/threads/index';

// Thread summary for history list (legacy, replaced by APIThreadSummary)
export interface ThreadSummary {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: string;
  messageCount: number;
  isActive?: boolean;
}

// Streaming state
export interface StreamingState {
  runId?: string;
  status: 'idle' | 'thinking' | 'streaming' | 'error' | 'cancelled';
  abortFn?: () => void;
  currentStage?: 'analyze' | 'plan' | 'generate' | 'finalize';
  toolsUsed?: Array<{
    name: string;
    args: any;
    mode: 'dry_run' | 'live';
    completed?: boolean;
  }>;
}

// Main chat store state
export interface ChatState {
  // Current thread state
  threadId: string;
  branchId?: string;
  system: string;
  settings: Settings;
  messages: Msg[];
  
  // UI state
  rightPanelOpen: boolean;
  composerText: string;
  
  // Mobile-specific UI state
  mobileKeyboardOpen: boolean;
  showVirtualKeyboard: boolean;
  isMobileView: boolean;
  
  // Streaming state
  streaming: StreamingState;
  
  // Thread history with branches
  history: APIThreadSummary[];
  
  // Current thread branches
  branches: Branch[];
  
  // Google IA request (when visual generation is needed)
  googleIaRequest?: GoogleIARequest;
  
  // Error state
  error?: string;

  // Loading state
  isLoading: boolean;
  
  // Actions
  setSystem: (system: string) => void;
  setSettings: (settings: Partial<Settings>) => void;
  setRightPanelOpen: (open: boolean) => void;
  setComposerText: (text: string) => void;
  
  // Mobile actions
  setMobileKeyboardOpen: (open: boolean) => void;
  setShowVirtualKeyboard: (show: boolean) => void;
  setIsMobileView: (isMobile: boolean) => void;
  
  // Message actions
  pushUserMessage: (content: string, attachments?: any[]) => void;
  upsertAssistantMessage: (content: string, messageId?: string) => void;
  
  // Streaming actions  
  setStreaming: (status: StreamingState['status'], runId?: string, abortFn?: () => void) => void;
  appendDeltaToLastAssistant: (delta: string) => void;
  endStreaming: () => void;
  
  // Tool actions
  applyToolChipToLastAssistant: (tool: { name: string; args: any; mode: 'dry_run' | 'live' }) => void;
  setGoogleIaRequest: (request: GoogleIARequest) => void;
  
  // Thread actions
  loadHistory: () => Promise<void>;
  selectThread: (threadId: string, branchId?: string) => Promise<void>;
  createNewThread: (title?: string) => Promise<void>;
  renameThread: (threadId: string, title: string) => Promise<void>;
  deleteThread: (threadId: string) => Promise<void>;
  
  // Branch actions
  setBranch: (branchId: string) => Promise<void>;
  createBranch: (threadId: string, name: string) => Promise<string>;
  renameBranch: (branchId: string, name: string) => Promise<void>;
  deleteBranch: (branchId: string) => Promise<void>;
  branchFromMessage: (messageId: string, name?: string) => Promise<string>;
  
  // SSE event handler
  handleSSEEvent: (event: SSEEvent) => void;
  
  // Error handling
  setError: (error?: string) => void;
  clearError: () => void;

  // Loading action
  setLoading: (isLoading: boolean) => void;
}

// Default settings
const DEFAULT_SETTINGS: Settings = {
  model: 'gpt-5',
  temperature: 0.3,
  persona: 'mentor',
  brandGuard: true
};

// Generate unique IDs
function generateId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateThreadId(): string {
  return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create the store
export const useChatStore = create<ChatState>()(
  immer((set, get) => ({
    // Initial state
    threadId: generateThreadId(),
    branchId: undefined,
    system: 'You are a helpful AI assistant specialized in content creation.',
    settings: { ...DEFAULT_SETTINGS },
    messages: [],
    rightPanelOpen: false,
    composerText: '',
    
    // Mobile state
    mobileKeyboardOpen: false,
    showVirtualKeyboard: false,
    isMobileView: false,
    
    streaming: {
      status: 'idle'
    },
    history: [],
    branches: [],
    isLoading: true,
    
    // Basic setters
    setSystem: (system: string) => 
      set((state) => {
        state.system = system;
      }),

    setSettings: (newSettings: Partial<Settings>) => 
      set((state) => {
        state.settings = { ...state.settings, ...newSettings };
      }),

    setRightPanelOpen: (open: boolean) => 
      set((state) => {
        state.rightPanelOpen = open;
      }),

    setComposerText: (text: string) => 
      set((state) => {
        state.composerText = text;
      }),

    // Mobile actions
    setMobileKeyboardOpen: (open: boolean) => 
      set((state) => {
        state.mobileKeyboardOpen = open;
      }),

    setShowVirtualKeyboard: (show: boolean) => 
      set((state) => {
        state.showVirtualKeyboard = show;
      }),

    setIsMobileView: (isMobile: boolean) => 
      set((state) => {
        state.isMobileView = isMobile;
      }),

    // Message actions
    pushUserMessage: (content: string, attachments?: any[]) =>
      set((state) => {
        const userMessage: Msg = {
          id: generateId(),
          role: 'user',
          parts: [{ type: 'text', value: content }],
          createdAt: new Date().toISOString(),
          meta: { attachments }
        };
        state.messages.push(userMessage);
        state.composerText = ''; // Clear composer after sending

        // Persist the message to the backend
        if (state.threadId && state.branchId) {
          threadsSDK.addMessage(state.threadId, state.branchId, userMessage)
            .catch(error => {
              console.error('[ChatStore] Failed to save message:', error);
              // Optionally, handle the error in the UI
            });
        }

        // Perform Brand Guard check
        if (state.settings.brandGuard) {
          const { brandKit } = useBrandKit.getState();
          if (brandKit) {
            brandGuardSDK.checkText({
              text: content,
              role: 'user',
              brand: brandGuardSDK.convertBrandKitToBrandGuard(brandKit),
            }).then(response => {
              console.log('[ChatStore] Brand Guard check response:', response);
            }).catch(error => {
              console.error('[ChatStore] Brand Guard check failed:', error);
            });
          }
        }
      }),

    upsertAssistantMessage: (content: string, messageId?: string) => 
      set((state) => {
        const existingIndex = state.messages.findIndex(
          m => m.id === messageId || (m.role === 'assistant' && !messageId)
        );
        
        if (existingIndex >= 0) {
          // Update existing message
          state.messages[existingIndex].parts = [{ type: 'text', value: content }];
        } else {
          // Create new assistant message
          const assistantMessage: Msg = {
            id: messageId || generateId(),
            role: 'assistant',
            parts: [{ type: 'text', value: content }],
            createdAt: new Date().toISOString(),
            meta: { streaming: true }
          };
          state.messages.push(assistantMessage);
        }
      }),

    // Streaming actions
    setStreaming: (status: StreamingState['status'], runId?: string, abortFn?: () => void) => 
      set((state) => {
        state.streaming = {
          status,
          runId,
          abortFn,
          toolsUsed: status === 'idle' ? [] : state.streaming.toolsUsed
        };
        
        if (status === 'idle') {
          state.streaming.currentStage = undefined;
          state.streaming.toolsUsed = [];
        }
      }),

    appendDeltaToLastAssistant: (delta: string) => 
      set((state) => {
        const lastMessage = state.messages[state.messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          const currentContent = lastMessage.parts[0]?.value || '';
          lastMessage.parts[0] = {
            type: 'text',
            value: currentContent + delta
          };
        }
      }),

    endStreaming: () => 
      set((state) => {
        state.streaming = { status: 'idle' };
        
        // Mark last assistant message as completed
        const lastMessage = state.messages[state.messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          if (lastMessage.meta) {
            lastMessage.meta.streaming = false;
          }
        }
      }),

    // Tool actions
    applyToolChipToLastAssistant: (tool: { name: string; args: any; mode: 'dry_run' | 'live' }) => 
      set((state) => {
        // Add to streaming tools
        if (!state.streaming.toolsUsed) {
          state.streaming.toolsUsed = [];
        }
        state.streaming.toolsUsed.push({ ...tool, completed: false });
        
        // Add to last assistant message meta
        const lastMessage = state.messages[state.messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          if (!lastMessage.meta) {
            lastMessage.meta = {};
          }
          if (!lastMessage.meta.tools) {
            lastMessage.meta.tools = [];
          }
          lastMessage.meta.tools.push(tool);
        }
      }),

    setGoogleIaRequest: (request: GoogleIARequest) => 
      set((state) => {
        state.googleIaRequest = request;
        
        // Also add to last assistant message
        const lastMessage = state.messages[state.messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          if (!lastMessage.meta) {
            lastMessage.meta = {};
          }
          lastMessage.meta.googleIaRequest = request;
        }
      }),

    // Thread actions
    loadHistory: async () => {
      try {
        const history = await threadsSDK.listThreads();
        set((state) => {
          state.history = history;
        });
        console.log(`[ChatStore] Loaded ${history.length} threads from backend`);
      } catch (error) {
        console.error('[ChatStore] Failed to load history:', error);
        set((state) => {
          state.error = 'Failed to load thread history';
        });
      }
    },

    selectThread: async (threadId: string, branchId?: string) => {
      try {
        const state = get();
        const threadSummary = state.history.find(t => t.id === threadId);
        
        if (!threadSummary) {
          throw new Error('Thread not found in history');
        }

        // Determinar rama a usar
        const targetBranch = branchId 
          ? threadSummary.branches.find(b => b.id === branchId)
          : threadsSDK.getDefaultBranch(threadSummary);

        if (!targetBranch) {
          throw new Error('Branch not found');
        }

        set((state) => {
          state.threadId = threadId;
          state.branchId = targetBranch.id;
          state.branches = threadSummary.branches;
          state.messages = [];
          state.streaming = { status: 'idle' };
          state.googleIaRequest = undefined;
          state.error = undefined;
        });

        console.log(`[ChatStore] Selected thread ${threadId}, branch ${targetBranch.name}`);

        // Load messages for the selected branch
        const messages = await threadsSDK.getMessages(threadId, targetBranch.id);
        set((state) => {
          state.messages = messages;
        });
        
      } catch (error) {
        console.error('[ChatStore] Failed to select thread:', error);
        set((state) => {
          state.error = `Failed to load thread: ${error instanceof Error ? error.message : 'Unknown error'}`;
        });
      }
    },

    createNewThread: async (title?: string) => {
      try {
        const response = await threadsSDK.createThread({
          title: title || 'Nuevo Hilo'
        });

        // Recargar historial para incluir el nuevo hilo
        await get().loadHistory();

        // Seleccionar el nuevo hilo
        await get().selectThread(response.id);

        console.log(`[ChatStore] Created new thread: ${response.id}`);
        
      } catch (error) {
        console.error('[ChatStore] Failed to create thread:', error);
        set((state) => {
          state.error = `Failed to create thread: ${error instanceof Error ? error.message : 'Unknown error'}`;
        });
      }
    },

    renameThread: async (threadId: string, title: string) => {
      try {
        await threadsSDK.renameThread(threadId, title);
        
        // Actualizar historial local
        set((state) => {
          const thread = state.history.find(t => t.id === threadId);
          if (thread) {
            thread.title = title;
          }
        });

        console.log(`[ChatStore] Renamed thread ${threadId} to "${title}"`);
        
      } catch (error) {
        console.error('[ChatStore] Failed to rename thread:', error);
        set((state) => {
          state.error = `Failed to rename thread: ${error instanceof Error ? error.message : 'Unknown error'}`;
        });
      }
    },

    deleteThread: async (threadId: string) => {
      try {
        await threadsSDK.deleteThread(threadId);
        
        // Remover del historial local
        set((state) => {
          state.history = state.history.filter(t => t.id !== threadId);
          
          // Si era el hilo activo, limpiar estado
          if (state.threadId === threadId) {
            state.threadId = generateThreadId();
            state.branchId = undefined;
            state.messages = [];
            state.branches = [];
            state.streaming = { status: 'idle' };
            state.googleIaRequest = undefined;
          }
        });

        console.log(`[ChatStore] Deleted thread ${threadId}`);
        
      } catch (error) {
        console.error('[ChatStore] Failed to delete thread:', error);
        set((state) => {
          state.error = `Failed to delete thread: ${error instanceof Error ? error.message : 'Unknown error'}`;
        });
      }
    },

    // Branch actions
    setBranch: async (branchId: string) => {
      try {
        const state = get();
        const branch = state.branches.find(b => b.id === branchId);
        
        if (!branch) {
          throw new Error('Branch not found');
        }

        await threadsSDK.switchBranch(state.threadId, branchId);

        set((draft) => {
          draft.branchId = branchId;
          draft.messages = []; // Will be loaded separately
          draft.streaming = { status: 'idle' };
        });

        console.log(`[ChatStore] Switched to branch ${branchId}`);
        
        // TODO: Load messages for the branch
        
      } catch (error) {
        console.error('[ChatStore] Failed to switch branch:', error);
        set((state) => {
          state.error = `Failed to switch branch: ${error instanceof Error ? error.message : 'Unknown error'}`;
        });
      }
    },

    createBranch: async (threadId: string, name: string) => {
      try {
        const response = await threadsSDK.createBranch(threadId, name);
        
        // Actualizar ramas locales
        set((state) => {
          state.branches.push({
            id: response.id,
            name,
            isDefault: false
          });
        });

        console.log(`[ChatStore] Created branch ${response.id} "${name}"`);
        return response.id;
        
      } catch (error) {
        console.error('[ChatStore] Failed to create branch:', error);
        set((state) => {
          state.error = `Failed to create branch: ${error instanceof Error ? error.message : 'Unknown error'}`;
        });
        throw error;
      }
    },

    renameBranch: async (branchId: string, name: string) => {
      try {
        await threadsSDK.renameBranch(branchId, name);
        
        // Actualizar rama local
        set((state) => {
          const branch = state.branches.find(b => b.id === branchId);
          if (branch) {
            branch.name = name;
          }
        });

        console.log(`[ChatStore] Renamed branch ${branchId} to "${name}"`);
        
      } catch (error) {
        console.error('[ChatStore] Failed to rename branch:', error);
        set((state) => {
          state.error = `Failed to rename branch: ${error instanceof Error ? error.message : 'Unknown error'}`;
        });
      }
    },

    deleteBranch: async (branchId: string) => {
      try {
        await threadsSDK.deleteBranch(branchId);
        
        // Remover rama local
        set((state) => {
          state.branches = state.branches.filter(b => b.id !== branchId);
          
          // Si era la rama activa, cambiar a otra
          if (state.branchId === branchId) {
            const defaultBranch = state.branches.find(b => b.isDefault);
            const fallbackBranch = defaultBranch || state.branches[0];
            
            if (fallbackBranch) {
              state.branchId = fallbackBranch.id;
              state.messages = []; // Will reload
            }
          }
        });

        console.log(`[ChatStore] Deleted branch ${branchId}`);
        
      } catch (error) {
        console.error('[ChatStore] Failed to delete branch:', error);
        set((state) => {
          state.error = `Failed to delete branch: ${error instanceof Error ? error.message : 'Unknown error'}`;
        });
      }
    },

    branchFromMessage: async (messageId: string, name?: string) => {
      try {
        const state = get();
        const response = await threadsSDK.branchFromMessage(
          state.threadId, 
          messageId, 
          name
        );
        
        // Actualizar ramas locales
        const branchName = name || `rama-${Date.now()}`;
        set((draft) => {
          draft.branches.push({
            id: response.branchId,
            name: branchName,
            isDefault: false
          });
          
          // Cambiar a la nueva rama
          draft.branchId = response.branchId;
          // Messages will be loaded separately
        });

        console.log(`[ChatStore] Created branch ${response.branchId} from message ${messageId}`);
        return response.branchId;
        
      } catch (error) {
        console.error('[ChatStore] Failed to branch from message:', error);
        set((state) => {
          state.error = `Failed to create branch: ${error instanceof Error ? error.message : 'Unknown error'}`;
        });
        throw error;
      }
    },

    // SSE event handler
    handleSSEEvent: (event: SSEEvent) => {
      const state = get();
      
      switch (event.type) {
        case 'ready':
          set((draft) => {
            draft.streaming.status = 'thinking';
            draft.error = undefined;
          });
          break;

        case 'state':
          set((draft) => {
            draft.streaming.currentStage = event.data.stage;
            if (event.data.stage === 'generate') {
              draft.streaming.status = 'streaming';
            }
          });
          break;

        case 'tool':
          state.applyToolChipToLastAssistant({
            name: event.data.name,
            args: event.data.args,
            mode: event.data.mode
          });
          break;

        case 'token':
          if (state.streaming.status === 'streaming') {
            state.appendDeltaToLastAssistant(event.data.delta);
          }
          break;

        case 'usage':
          set((draft) => {
            const lastMessage = draft.messages[draft.messages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              if (!lastMessage.meta) {
                lastMessage.meta = {};
              }
              lastMessage.meta.usage = event.data;
            }
          });
          break;

        case 'error':
          set((draft) => {
            draft.streaming.status = 'error';
            draft.error = `${event.data.code}: ${event.data.message}`;
          });
          break;

        case 'done':
          set((draft) => {
            draft.streaming.status = 'idle';
            draft.streaming.currentStage = undefined;
            
            // Finalize last assistant message
            const lastMessage = draft.messages[draft.messages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              lastMessage.id = event.data.messageId;
              if (lastMessage.meta) {
                lastMessage.meta.streaming = false;
              }
            }
          });
          break;
      }
    },

    // Error handling
    setError: (error?: string) => 
      set((state) => {
        state.error = error;
      }),

    clearError: () => 
      set((state) => {
        state.error = undefined;
      }),

    setLoading: (isLoading: boolean) =>
      set((state) => {
        state.isLoading = isLoading;
      })
  }))
);

// Selectors for easy access to computed state
export const useChatSelectors = {
  // Get current streaming status
  useIsStreaming: () => useChatStore((state) => state.streaming.status !== 'idle'),
  
  // Get last assistant message
  useLastAssistantMessage: () => useChatStore((state) => {
    const assistantMessages = state.messages.filter(m => m.role === 'assistant');
    return assistantMessages[assistantMessages.length - 1];
  }),
  
  // Get current tools being used
  useCurrentTools: () => useChatStore((state) => state.streaming.toolsUsed || []),
  
  // Get formatted thread title
  useThreadTitle: () => useChatStore((state) => {
    const firstUserMessage = state.messages.find(m => m.role === 'user');
    if (firstUserMessage?.parts?.[0]?.value) {
      return firstUserMessage.parts[0].value.substring(0, 50) + '...';
    }
    return 'New Chat';
  }),
  
  // Check if can send message
  useCanSendMessage: () => useChatStore((state) => 
    state.streaming.status === 'idle' && state.composerText.trim().length > 0
  ),
  
  // Check if can abort
  useCanAbort: () => useChatStore((state) => 
    state.streaming.status !== 'idle' && !!state.streaming.abortFn
  )
};