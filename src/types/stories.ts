// Tipos para el sistema completo de Stories

export interface StoryProject {
  id: string;
  title: string;
  type: 'story';
  objective: StoryObjective;
  status: 'briefing' | 'generating' | 'editing' | 'finalizing' | 'scheduled' | 'published';
  briefing: StoryBriefing;
  concepts: StoryConcept[];
  selectedConceptId?: string;
  layers: StoryLayer[];
  copywriting: StoryCopywriting;
  publishing: StoryPublishing;
  createdAt: Date;
  updatedAt: Date;
  brandKitCompliant: boolean;
}

export interface StoryBriefing {
  description: string;
  objective: StoryObjective;
  platform: StoryPlatform;
  duration: StoryDuration;
  chatHistory: StoryChatMessage[];
  visualStyle?: StoryVisualStyle;
  targetAudience?: string;
  callToAction?: string;
}

export interface StoryChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: string[];
}

export type StoryObjective = 'announcement' | 'promotion' | 'educational' | 'engagement' | 'behind_scenes' | 'product_showcase' | 'event' | 'poll_question';

export type StoryPlatform = 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'snapchat';

export interface StoryDuration {
  seconds: number;
  label: string;
  autoAdvance: boolean;
}

export type StoryVisualStyle = 'minimal' | 'bold' | 'elegant' | 'playful' | 'professional' | 'trendy';

export interface StoryConcept {
  id: string;
  projectId: string;
  title: string;
  description: string;
  thumbnail: string;
  layout: StoryLayout;
  brandElements: AppliedStoryBrandElements;
  metadata: ConceptMetadata;
  createdAt: Date;
  isSelected?: boolean;
}

export interface StoryLayout {
  background: LayoutBackground;
  textPlacement: TextPlacement;
  logoPosition: LogoPosition;
  overlays: LayoutOverlay[];
}

export interface LayoutBackground {
  type: 'solid' | 'gradient' | 'image' | 'pattern';
  primaryColor: string;
  secondaryColor?: string;
  direction?: 'vertical' | 'horizontal' | 'diagonal';
}

export interface TextPlacement {
  area: 'top' | 'center' | 'bottom' | 'custom';
  alignment: 'left' | 'center' | 'right';
  maxLines: number;
}

export type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'hidden';

export interface LayoutOverlay {
  type: 'shape' | 'frame' | 'badge' | 'pattern';
  position: StoryPosition;
  style: StoryLayerStyle;
}

export interface StoryLayer {
  id: string;
  type: 'background' | 'text' | 'logo' | 'image' | 'shape' | 'cta_button' | 'sticker';
  name: string;
  content: any;
  position: StoryPosition;
  style: StoryLayerStyle;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  animation?: StoryAnimation;
}

export interface StoryPosition {
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
  rotation?: number;
  scale?: number;
}

export interface StoryLayerStyle {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  border?: string;
  boxShadow?: string;
  opacity?: number;
  filters?: string[];
  textAlign?: 'left' | 'center' | 'right';
  padding?: number;
}

export interface StoryAnimation {
  type: 'none' | 'fade_in' | 'slide_up' | 'slide_down' | 'zoom_in' | 'bounce' | 'pulse';
  duration: number;
  delay?: number;
  easing?: string;
}

export interface ConceptMetadata {
  aiGenerated: boolean;
  prompt?: string;
  generationTime?: number;
  confidence?: number;
  tags: string[];
  layoutComplexity: 'simple' | 'medium' | 'complex';
}

export interface AppliedStoryBrandElements {
  colors: Array<{ name: string; hex: string; usage: string }>;
  fonts: Array<{ name: string; family: string; weight: string }>;
  logos: Array<{ name: string; url: string; position: string }>;
  style: string;
  guidelines: string[];
}

export interface StoryCopywriting {
  mainText: string;
  ctaText?: string;
  hashtags: string[];
  mentions?: string[];
  tone: string;
  length: 'short' | 'medium';
  aiGenerated: boolean;
  variations?: string[];
}

export interface StoryPublishing {
  scheduledDate?: Date;
  platforms: StoryPublishingPlatform[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  publishingNotes?: string;
  highlightName?: string; // Para Stories permanentes
}

export interface StoryPublishingPlatform {
  platform: StoryPlatform;
  accountId?: string;
  customText?: string;
  customHashtags?: string[];
  postTime?: Date;
  status: 'pending' | 'scheduled' | 'published' | 'failed';
  addToHighlight?: boolean;
}

// Configuraciones predefinidas por objetivo
export const STORY_OBJECTIVE_CONFIGS: Record<StoryObjective, {
  durations: StoryDuration[];
  platforms: StoryPlatform[];
  recommendedStyles: StoryVisualStyle[];
  suggestedCTAs: string[];
}> = {
  announcement: {
    durations: [
      { seconds: 5, label: '5s (Rápido)', autoAdvance: true },
      { seconds: 10, label: '10s (Estándar)', autoAdvance: true },
      { seconds: 15, label: '15s (Detallado)', autoAdvance: false }
    ],
    platforms: ['instagram', 'facebook', 'linkedin'],
    recommendedStyles: ['bold', 'professional', 'elegant'],
    suggestedCTAs: ['Desliza para más info', 'Toca para detalles', 'Visita el enlace en bio']
  },
  promotion: {
    durations: [
      { seconds: 5, label: '5s (Impacto)', autoAdvance: true },
      { seconds: 10, label: '10s (Persuasivo)', autoAdvance: true },
      { seconds: 15, label: '15s (Completo)', autoAdvance: false }
    ],
    platforms: ['instagram', 'facebook', 'tiktok'],
    recommendedStyles: ['bold', 'trendy', 'playful'],
    suggestedCTAs: ['Compra ahora', 'Aprovecha la oferta', 'Desliza arriba para comprar']
  },
  educational: {
    durations: [
      { seconds: 10, label: '10s (Tip rápido)', autoAdvance: true },
      { seconds: 15, label: '15s (Educativo)', autoAdvance: false }
    ],
    platforms: ['instagram', 'linkedin', 'tiktok'],
    recommendedStyles: ['minimal', 'professional', 'elegant'],
    suggestedCTAs: ['Guarda para después', 'Comparte si te sirvió', 'Sígueme para más tips']
  },
  engagement: {
    durations: [
      { seconds: 5, label: '5s (Pregunta)', autoAdvance: true },
      { seconds: 10, label: '10s (Interacción)', autoAdvance: false }
    ],
    platforms: ['instagram', 'facebook', 'tiktok'],
    recommendedStyles: ['playful', 'trendy', 'bold'],
    suggestedCTAs: ['Responde en comentarios', 'Reacciona con emoji', 'Comparte tu opinión']
  },
  behind_scenes: {
    durations: [
      { seconds: 10, label: '10s (Momento)', autoAdvance: true },
      { seconds: 15, label: '15s (Historia)', autoAdvance: false }
    ],
    platforms: ['instagram', 'tiktok', 'snapchat'],
    recommendedStyles: ['minimal', 'playful', 'trendy'],
    suggestedCTAs: ['¿Quieres ver más?', 'Pregúntame algo', 'Sígueme para más behind scenes']
  },
  product_showcase: {
    durations: [
      { seconds: 10, label: '10s (Destaque)', autoAdvance: true },
      { seconds: 15, label: '15s (Completo)', autoAdvance: false }
    ],
    platforms: ['instagram', 'facebook', 'tiktok'],
    recommendedStyles: ['elegant', 'professional', 'bold'],
    suggestedCTAs: ['Ver más productos', 'Comprar ahora', 'Desliza para detalles']
  },
  event: {
    durations: [
      { seconds: 5, label: '5s (Reminder)', autoAdvance: true },
      { seconds: 10, label: '10s (Invitación)', autoAdvance: true },
      { seconds: 15, label: '15s (Detalles)', autoAdvance: false }
    ],
    platforms: ['instagram', 'facebook', 'linkedin'],
    recommendedStyles: ['bold', 'elegant', 'professional'],
    suggestedCTAs: ['Confirma asistencia', 'Más info en bio', 'Comparte con amigos']
  },
  poll_question: {
    durations: [
      { seconds: 5, label: '5s (Pregunta)', autoAdvance: false },
      { seconds: 10, label: '10s (Con contexto)', autoAdvance: false }
    ],
    platforms: ['instagram', 'facebook', 'tiktok'],
    recommendedStyles: ['playful', 'trendy', 'minimal'],
    suggestedCTAs: ['Vota en la encuesta', 'Dime qué piensas', 'Tu opinión cuenta']
  }
};

// Formatos por plataforma (todas las Stories son 9:16)
export const STORY_PLATFORM_SPECS: Record<StoryPlatform, {
  ratio: string;
  width: number;
  height: number;
  maxDuration: number;
  features: string[];
}> = {
  instagram: {
    ratio: '9:16',
    width: 1080,
    height: 1920,
    maxDuration: 15,
    features: ['Stickers', 'Música', 'Encuestas', 'Preguntas', 'Enlaces']
  },
  facebook: {
    ratio: '9:16',
    width: 1080,
    height: 1920,
    maxDuration: 20,
    features: ['Stickers', 'Enlaces', 'CTAs', 'Encuestas']
  },
  tiktok: {
    ratio: '9:16',
    width: 1080,
    height: 1920,
    maxDuration: 15,
    features: ['Efectos', 'Filtros', 'Música', 'Stickers']
  },
  linkedin: {
    ratio: '9:16',
    width: 1080,
    height: 1920,
    maxDuration: 30,
    features: ['Texto profesional', 'Enlaces', 'Hashtags']
  },
  snapchat: {
    ratio: '9:16',
    width: 1080,
    height: 1920,
    maxDuration: 10,
    features: ['Filtros', 'Lenses', 'Stickers', 'Música']
  }
};

// Canvas state para Stories
export interface StoryCanvasState {
  zoom: number;
  selectedLayerId?: string;
  clipboardLayers: StoryLayer[];
  history: StoryCanvasAction[];
  historyIndex: number;
  previewMode: boolean;
}

export interface StoryCanvasAction {
  type: 'add' | 'modify' | 'delete' | 'move' | 'style';
  layerId: string;
  before?: any;
  after?: any;
  timestamp: Date;
}