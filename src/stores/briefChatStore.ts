import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    edited?: boolean;
    editedAt?: Date;
    originalContent?: string;
  };
}

export interface BriefField {
  id: keyof BriefData;
  label: string;
  placeholder: string;
  type: 'input' | 'textarea' | 'tags' | 'select';
  options?: string[];
  required?: boolean;
  validation?: (value: any) => string | null;
}

export interface BriefData {
  // Objetivo
  objetivo: string;
  
  // Audiencia
  audienciaPrimaria: string;
  audienciaInsight: string;
  
  // Oferta
  ofertaProducto: string;
  ofertaBeneficio: string;
  ofertaPrueba: string;
  
  // Marca (BrandKit)
  marcaTono: string;
  marcaColores: string[];
  marcaTipografia: string;
  
  // Formato
  formatoTipo: string;
  formatoPlataformas: string[];
  formatoAspectRatio: string;
  formatoDuracion: string;
  
  // CTA
  cta: string;
  
  // Hashtags
  hashtags: string[];
  
  // Assets
  assetsProporcionados: string[];
  assetsNecesarios: string[];
  
  // Restricciones
  restriccionesLegales: string;
  restriccionesClaims: string;
  restriccionesFecha: string;
  
  // Aceptación
  aceptacionDebeIncluir: string[];
  aceptacionMetrica: string;
}

export interface BriefSection {
  id: string;
  name: string;
  fields: BriefField[];
  isComplete: boolean;
  completionPercentage: number;
}

export interface ConflictData {
  fieldId: keyof BriefData;
  chatValue: string;
  briefValue: string;
  suggestion: string;
  timestamp: Date;
  resolved: boolean;
}

interface BriefChatState {
  // Chat State
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  
  // Brief State
  briefData: BriefData;
  activeBriefSection: string;
  
  // Conflict Detection
  conflicts: ConflictData[];
  hasUnresolvedConflicts: boolean;
  
  // UI State
  chatCollapsed: boolean;
  briefCollapsed: boolean;
  
  // Auto-save
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  autoSaveEnabled: boolean;
  
  // Completion State
  briefCompleted: boolean;
  canContinueWorkflow: boolean;
  
  // Actions
  addMessage: (content: string, role: 'user' | 'assistant' | 'system') => void;
  updateMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  setIsLoading: (loading: boolean) => void;
  setIsTyping: (typing: boolean) => void;
  
  // Brief Actions  
  updateBriefField: (fieldId: keyof BriefData, value: any) => void;
  setActiveBriefSection: (sectionId: string) => void;
  resetBrief: () => void;
  
  // Conflict Actions
  addConflict: (conflict: Omit<ConflictData, 'timestamp' | 'resolved'>) => void;
  resolveConflict: (fieldId: keyof BriefData, resolution: 'chat' | 'brief' | 'manual', manualValue?: string) => void;
  dismissConflict: (fieldId: keyof BriefData) => void;
  
  // UI Actions
  toggleChatCollapse: () => void;
  toggleBriefCollapse: () => void;
  
  // Auto-save Actions
  markUnsavedChanges: () => void;
  markSaved: () => void;
  setAutoSaveEnabled: (enabled: boolean) => void;
  
  // Completion Actions
  checkBriefCompletion: () => void;
  setBriefCompleted: (completed: boolean) => void;
  setCanContinueWorkflow: (canContinue: boolean) => void;
  
  // Persistence
  saveBrief: () => Promise<void>;
  loadBrief: (briefId?: string) => Promise<void>;
  
  // Reset
  resetStore: () => void;
}

const initialBriefData: BriefData = {
  // Objetivo
  objetivo: '',
  
  // Audiencia
  audienciaPrimaria: '',
  audienciaInsight: '',
  
  // Oferta
  ofertaProducto: '',
  ofertaBeneficio: '',
  ofertaPrueba: '',
  
  // Marca (BrandKit)
  marcaTono: '',
  marcaColores: [],
  marcaTipografia: '',
  
  // Formato
  formatoTipo: 'single',
  formatoPlataformas: [],
  formatoAspectRatio: '',
  formatoDuracion: '',
  
  // CTA
  cta: '',
  
  // Hashtags
  hashtags: [],
  
  // Assets
  assetsProporcionados: [],
  assetsNecesarios: [],
  
  // Restricciones
  restriccionesLegales: '',
  restriccionesClaims: '',
  restriccionesFecha: '',
  
  // Aceptación
  aceptacionDebeIncluir: [],
  aceptacionMetrica: ''
};

const briefSections: BriefSection[] = [
  {
    id: 'objetivo',
    name: 'Objetivo',
    fields: [
      {
        id: 'objetivo',
        label: 'Objetivo del post',
        placeholder: 'Ej.: Generar awareness + clics al sitio',
        type: 'input',
        required: true,
        validation: (value) => value.length < 10 ? 'Describe el objetivo con más detalle' : null
      }
    ],
    isComplete: false,
    completionPercentage: 0
  },
  {
    id: 'audiencia',
    name: 'Audiencia',
    fields: [
      {
        id: 'audienciaPrimaria',
        label: 'Primaria',
        placeholder: 'Segmento principal (edad, intereses)',
        type: 'input',
        required: true
      },
      {
        id: 'audienciaInsight',
        label: 'Insight',
        placeholder: 'Dolor/beneficio clave que moverá a la acción',
        type: 'textarea',
        required: true
      }
    ],
    isComplete: false,
    completionPercentage: 0
  },
  {
    id: 'oferta',
    name: 'Oferta',
    fields: [
      {
        id: 'ofertaProducto',
        label: 'Producto/servicio',
        placeholder: '¿Qué se promociona?',
        type: 'input',
        required: true
      },
      {
        id: 'ofertaBeneficio',
        label: 'Beneficio principal',
        placeholder: '¿Qué gana el usuario?',
        type: 'input',
        required: true
      },
      {
        id: 'ofertaPrueba',
        label: 'Prueba/soporte',
        placeholder: 'Datos, testimonios o certificaciones',
        type: 'textarea'
      }
    ],
    isComplete: false,
    completionPercentage: 0
  },
  {
    id: 'marca',
    name: 'Marca',
    fields: [
      {
        id: 'marcaTono',
        label: 'Tono',
        placeholder: 'Elegir tono',
        type: 'select',
        options: ['Simple', 'Neutral', 'Formal']
      },
      {
        id: 'marcaColores',
        label: 'Colores',
        placeholder: 'Seleccionar colores de marca',
        type: 'tags'
      },
      {
        id: 'marcaTipografia',
        label: 'Tipografía',
        placeholder: 'Ej.: Headline/Body',
        type: 'input'
      }
    ],
    isComplete: false,
    completionPercentage: 0
  },
  {
    id: 'formato',
    name: 'Formato',
    fields: [
      {
        id: 'formatoTipo',
        label: 'Tipo',
        placeholder: 'Tipo de post',
        type: 'select',
        options: ['single', 'carousel', 'story'],
        required: true
      },
      {
        id: 'formatoPlataformas',
        label: 'Plataformas',
        placeholder: 'Selecciona plataformas',
        type: 'tags'
      },
      {
        id: 'formatoAspectRatio',
        label: 'Aspect ratio',
        placeholder: 'Elegir',
        type: 'select',
        options: ['1:1', '4:5', '16:9']
      },
      {
        id: 'formatoDuracion',
        label: 'Duración (s) (si aplica)',
        placeholder: '0',
        type: 'input'
      }
    ],
    isComplete: false,
    completionPercentage: 0
  },
  {
    id: 'cta',
    name: 'CTA',
    fields: [
      {
        id: 'cta',
        label: 'CTA',
        placeholder: 'Ej.: Compra ahora / Reserva hoy / Más info',
        type: 'input',
        required: true
      }
    ],
    isComplete: false,
    completionPercentage: 0
  },
  {
    id: 'hashtags',
    name: 'Hashtags',
    fields: [
      {
        id: 'hashtags',
        label: 'Hashtags',
        placeholder: '#tuMarca #postSimple #oferta',
        type: 'tags'
      }
    ],
    isComplete: false,
    completionPercentage: 0
  },
  {
    id: 'assets',
    name: 'Assets',
    fields: [
      {
        id: 'assetsProporcionados',
        label: 'Proporcionados',
        placeholder: 'logo.svg, foto_packshot.png',
        type: 'tags'
      },
      {
        id: 'assetsNecesarios',
        label: 'Necesarios',
        placeholder: 'Mockup del producto, foto lifestyle',
        type: 'tags'
      }
    ],
    isComplete: false,
    completionPercentage: 0
  },
  {
    id: 'restricciones',
    name: 'Restricciones',
    fields: [
      {
        id: 'restriccionesLegales',
        label: 'Legales',
        placeholder: 'Cláusulas/advertencias obligatorias',
        type: 'textarea'
      },
      {
        id: 'restriccionesClaims',
        label: 'Claims prohibidos',
        placeholder: 'Afirmaciones no permitidas',
        type: 'textarea'
      },
      {
        id: 'restriccionesFecha',
        label: 'Fecha límite',
        placeholder: 'YYYY-MM-DD',
        type: 'input'
      }
    ],
    isComplete: false,
    completionPercentage: 0
  },
  {
    id: 'aceptacion',
    name: 'Aceptación',
    fields: [
      {
        id: 'aceptacionDebeIncluir',
        label: 'Debe incluir',
        placeholder: 'Precio final, delivery, logo, CTA…',
        type: 'tags'
      },
      {
        id: 'aceptacionMetrica',
        label: 'Métrica de éxito',
        placeholder: 'CTR ≥ x%, comentarios ≥ n',
        type: 'input'
      }
    ],
    isComplete: false,
    completionPercentage: 0
  }
];

export const useBriefChatStore = create<BriefChatState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        messages: [
          {
            id: 'system-welcome',
            role: 'system',
            content: '¡Hola! Te ayudaré a definir el brief para tu post. Cuéntame sobre el proyecto que tienes en mente.',
            timestamp: new Date()
          }
        ],
        isLoading: false,
        isTyping: false,
        briefData: initialBriefData,
        activeBriefSection: 'objetivo',
        conflicts: [],
        hasUnresolvedConflicts: false,
        chatCollapsed: false,
        briefCollapsed: false,
        lastSaved: null,
        hasUnsavedChanges: false,
        autoSaveEnabled: true,
        briefCompleted: false,
        canContinueWorkflow: false,

        // Chat Actions
        addMessage: (content: string, role: 'user' | 'assistant' | 'system') => {
          const newMessage: ChatMessage = {
            id: `msg_${Date.now()}_${Math.random()}`,
            role,
            content,
            timestamp: new Date()
          };
          
          set((state) => ({
            messages: [...state.messages, newMessage],
            hasUnsavedChanges: true
          }));
          
          // Auto-extract information if it's an assistant message
          if (role === 'assistant') {
            setTimeout(() => {
              get().extractInformationFromChat(content);
            }, 500);
          }
        },

        updateMessage: (messageId: string, content: string) => {
          set((state) => ({
            messages: state.messages.map(msg =>
              msg.id === messageId
                ? {
                    ...msg,
                    content,
                    metadata: {
                      ...msg.metadata,
                      edited: true,
                      editedAt: new Date(),
                      originalContent: msg.metadata?.originalContent || msg.content
                    }
                  }
                : msg
            ),
            hasUnsavedChanges: true
          }));
        },

        deleteMessage: (messageId: string) => {
          set((state) => ({
            messages: state.messages.filter(msg => msg.id !== messageId),
            hasUnsavedChanges: true
          }));
        },

        setIsLoading: (loading: boolean) => set({ isLoading: loading }),
        setIsTyping: (typing: boolean) => set({ isTyping: typing }),

        // Brief Actions
        updateBriefField: (fieldId: keyof BriefData, value: any) => {
          set((state) => {
            const newBriefData = { ...state.briefData, [fieldId]: value };
            
            // Check for conflicts with chat content
            const chatContent = state.messages
              .filter(msg => msg.role === 'user' || msg.role === 'assistant')
              .map(msg => msg.content)
              .join(' ')
              .toLowerCase();
            
            // Detect potential conflicts
            get().detectConflicts(fieldId, value, chatContent);
            
            return {
              briefData: newBriefData,
              hasUnsavedChanges: true
            };
          });
          
          // Check completion after update
          setTimeout(() => get().checkBriefCompletion(), 100);
        },

        setActiveBriefSection: (sectionId: string) => set({ activeBriefSection: sectionId }),
        
        resetBrief: () => set({
          briefData: initialBriefData,
          conflicts: [],
          hasUnresolvedConflicts: false,
          briefCompleted: false,
          canContinueWorkflow: false
        }),

        // Conflict Actions
        addConflict: (conflict) => {
          const newConflict: ConflictData = {
            ...conflict,
            timestamp: new Date(),
            resolved: false
          };
          
          set((state) => ({
            conflicts: [...state.conflicts.filter(c => c.fieldId !== conflict.fieldId), newConflict],
            hasUnresolvedConflicts: true
          }));
        },

        resolveConflict: (fieldId, resolution, manualValue) => {
          const conflict = get().conflicts.find(c => c.fieldId === fieldId);
          if (!conflict) return;
          
          let resolvedValue: any;
          
          switch (resolution) {
            case 'chat':
              resolvedValue = conflict.chatValue;
              break;
            case 'brief':
              resolvedValue = conflict.briefValue;
              break;
            case 'manual':
              resolvedValue = manualValue || conflict.briefValue;
              break;
          }
          
          // Update the brief with resolved value
          get().updateBriefField(fieldId, resolvedValue);
          
          // Mark conflict as resolved
          set((state) => ({
            conflicts: state.conflicts.map(c =>
              c.fieldId === fieldId ? { ...c, resolved: true } : c
            ),
            hasUnresolvedConflicts: state.conflicts.some(c => c.fieldId !== fieldId && !c.resolved)
          }));
        },

        dismissConflict: (fieldId) => {
          set((state) => ({
            conflicts: state.conflicts.filter(c => c.fieldId !== fieldId),
            hasUnresolvedConflicts: state.conflicts.some(c => c.fieldId !== fieldId && !c.resolved)
          }));
        },

        // UI Actions
        toggleChatCollapse: () => set((state) => ({ chatCollapsed: !state.chatCollapsed })),
        toggleBriefCollapse: () => set((state) => ({ briefCollapsed: !state.briefCollapsed })),

        // Auto-save Actions
        markUnsavedChanges: () => set({ hasUnsavedChanges: true }),
        markSaved: () => set({ hasUnsavedChanges: false, lastSaved: new Date() }),
        setAutoSaveEnabled: (enabled) => set({ autoSaveEnabled: enabled }),

        // Completion Actions
        checkBriefCompletion: () => {
          const state = get();
          const requiredFields = ['objetivo', 'audienciaPrimaria', 'audienciaInsight', 'ofertaProducto', 'ofertaBeneficio', 'formatoTipo', 'cta'];
          const completed = requiredFields.every(field => 
            state.briefData[field as keyof BriefData] && 
            String(state.briefData[field as keyof BriefData]).trim() !== ''
          );
          
          const canContinue = completed && !state.hasUnresolvedConflicts;
          
          set({
            briefCompleted: completed,
            canContinueWorkflow: canContinue
          });
        },

        setBriefCompleted: (completed) => set({ briefCompleted: completed }),
        setCanContinueWorkflow: (canContinue) => set({ canContinueWorkflow: canContinue }),

        // Helper Functions (internal)
        extractInformationFromChat: (content: string) => {
          const state = get();
          const lowerContent = content.toLowerCase();
          
          // Auto-fill logic based on chat content
          const updates: Partial<BriefData> = {};
          
          // Extract objective
          if (!state.briefData.objetivo && (lowerContent.includes('objetivo') || lowerContent.includes('meta') || lowerContent.includes('lograr'))) {
            const sentences = content.split('.').filter(s => s.trim().length > 0);
            if (sentences.length > 0) {
              updates.objetivo = sentences[0].trim() + '.';
            }
          }
          
          // Extract audience
          if (!state.briefData.audienciaPrimaria) {
            if (lowerContent.includes('jóvenes') || lowerContent.includes('millennials')) {
              updates.audienciaPrimaria = 'Jóvenes 18-35 años, activos en redes sociales';
            } else if (lowerContent.includes('profesional') || lowerContent.includes('empresa')) {
              updates.audienciaPrimaria = 'Profesionales y empresarios';
            } else if (lowerContent.includes('estudiante')) {
              updates.audienciaPrimaria = 'Estudiantes universitarios';
            } else if (lowerContent.includes('familia') || lowerContent.includes('padres')) {
              updates.audienciaPrimaria = 'Padres de familia, 25-45 años';
            }
          }
          
          // Extract producto/servicio
          if (!state.briefData.ofertaProducto && (lowerContent.includes('producto') || lowerContent.includes('servicio'))) {
            if (lowerContent.includes('curso') || lowerContent.includes('capacitación')) {
              updates.ofertaProducto = 'Curso online';
            } else if (lowerContent.includes('software') || lowerContent.includes('app')) {
              updates.ofertaProducto = 'Aplicación/Software';
            } else if (lowerContent.includes('consultoría')) {
              updates.ofertaProducto = 'Servicio de consultoría';
            }
          }
          
          // Extract CTA
          if (!state.briefData.cta) {
            if (lowerContent.includes('comprar') || lowerContent.includes('vender')) {
              updates.cta = 'Compra ahora';
            } else if (lowerContent.includes('suscrib') || lowerContent.includes('registr')) {
              updates.cta = 'Suscríbete';
            } else if (lowerContent.includes('visita') || lowerContent.includes('web')) {
              updates.cta = 'Visita nuestra web';
            } else if (lowerContent.includes('contacto') || lowerContent.includes('consulta')) {
              updates.cta = 'Contáctanos';
            }
          }
          
          // Apply updates
          Object.entries(updates).forEach(([key, value]) => {
            if (value) {
              get().updateBriefField(key as keyof BriefData, value);
            }
          });
        },

        detectConflicts: (fieldId: keyof BriefData, newValue: any, chatContent: string) => {
          const state = get();
          
          // Simple conflict detection logic
          if (fieldId === 'audienciaPrimaria' && newValue && chatContent) {
            if (newValue.toLowerCase().includes('jóvenes') && chatContent.includes('profesional')) {
              get().addConflict({
                fieldId,
                chatValue: 'Profesionales y empresarios',
                briefValue: newValue,
                suggestion: 'El chat menciona profesionales, pero el brief indica jóvenes'
              });
            }
          }
          
          if (fieldId === 'cta' && newValue && chatContent) {
            if (newValue.toLowerCase().includes('compra') && chatContent.includes('suscrib')) {
              get().addConflict({
                fieldId,
                chatValue: 'Suscríbete',
                briefValue: newValue,
                suggestion: 'El chat sugiere suscripción, pero el brief indica compra'
              });
            }
          }
        },

        // Persistence
        saveBrief: async () => {
          const state = get();
          try {
            // Here you would save to your backend/Firestore
            console.log('Saving brief data:', state.briefData);
            console.log('Saving chat messages:', state.messages);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            get().markSaved();
          } catch (error) {
            console.error('Error saving brief:', error);
            throw error;
          }
        },

        loadBrief: async (briefId?: string) => {
          try {
            // Here you would load from your backend/Firestore
            console.log('Loading brief:', briefId);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // This would be your loaded data
            // set({ briefData: loadedData, messages: loadedMessages });
          } catch (error) {
            console.error('Error loading brief:', error);
            throw error;
          }
        },

        // Reset
        resetStore: () => {
          set({
            messages: [
              {
                id: 'system-welcome',
                role: 'system',
                content: '¡Hola! Te ayudaré a definir el brief para tu post. Cuéntame sobre el proyecto que tienes en mente.',
                timestamp: new Date()
              }
            ],
            isLoading: false,
            isTyping: false,
            briefData: initialBriefData,
            activeBriefSection: 'objetivo',
            conflicts: [],
            hasUnresolvedConflicts: false,
            chatCollapsed: false,
            briefCollapsed: false,
            lastSaved: null,
            hasUnsavedChanges: false,
            autoSaveEnabled: true,
            briefCompleted: false,
            canContinueWorkflow: false
          });
        }
      }),
      {
        name: 'brief-chat-storage',
        partialize: (state) => ({
          briefData: state.briefData,
          messages: state.messages,
          lastSaved: state.lastSaved,
          autoSaveEnabled: state.autoSaveEnabled
        })
      }
    ),
    { name: 'BriefChatStore' }
  )
);

export { briefSections };