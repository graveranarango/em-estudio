// Tipos para el sistema completo de Posts y Carrousels

export interface PostProject {
  id: string;
  title: string;
  type: 'post' | 'carousel';
  status: 'briefing' | 'configuring' | 'generating' | 'editing' | 'finalizing' | 'scheduled' | 'published';
  briefing: PostBriefing;
  configuration: PostConfiguration;
  designs: PostDesign[];
  selectedDesignId?: string;
  copywriting: PostCopywriting;
  publishing: PostPublishing;
  createdAt: Date;
  updatedAt: Date;
  brandKitCompliant: boolean;
}

export interface PostBriefing {
  description: string;
  chatHistory: ChatMessage[];
  referenceImages: ReferenceImage[];
  objectives: string[];
  targetAudience?: string;
  keyMessages?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: string[];
}

export interface ReferenceImage {
  id: string;
  url: string;
  filename: string;
  description?: string;
  uploadedAt: Date;
}

export interface PostConfiguration {
  socialPlatforms: SocialPlatform[];
  primaryPlatform: SocialPlatform;
  generationCount: number;
  format: PostFormat;
  dimensions: {
    width: number;
    height: number;
  };
  style?: string;
}

export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'twitter';

export interface PostFormat {
  ratio: '1:1' | '9:16' | '16:9' | '4:5';
  name: string;
  width: number;
  height: number;
}

export interface PostDesign {
  id: string;
  projectId: string;
  version: number;
  thumbnail: string;
  layers: DesignLayer[];
  metadata: DesignMetadata;
  brandElements: AppliedBrandElements;
  createdAt: Date;
  isSelected?: boolean;
}

export interface DesignLayer {
  id: string;
  type: 'text' | 'image' | 'logo' | 'shape' | 'background';
  name: string;
  content: any;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
  };
  style: LayerStyle;
  visible: boolean;
  locked: boolean;
  zIndex: number;
}

export interface LayerStyle {
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
}

export interface DesignMetadata {
  aiGenerated: boolean;
  prompt?: string;
  generationTime?: number;
  confidence?: number;
  tags: string[];
}

export interface AppliedBrandElements {
  colors: Array<{ name: string; hex: string; usage: string }>;
  fonts: Array<{ name: string; family: string; weight: string }>;
  logos: Array<{ name: string; url: string; position: string }>;
  guidelines: string[];
}

export interface PostCopywriting {
  caption: string;
  hashtags: string[];
  callToAction?: string;
  mentions?: string[];
  tone: string;
  length: 'short' | 'medium' | 'long';
  aiGenerated: boolean;
  variations?: string[];
}

export interface PostPublishing {
  scheduledDate?: Date;
  platforms: PublishingPlatform[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  publishingNotes?: string;
}

export interface PublishingPlatform {
  platform: SocialPlatform;
  accountId?: string;
  customCaption?: string;
  customHashtags?: string[];
  postTime?: Date;
  status: 'pending' | 'scheduled' | 'published' | 'failed';
}

// Canvas de edición
export interface CanvasState {
  zoom: number;
  pan: { x: number; y: number };
  selectedLayerId?: string;
  clipboardLayers: DesignLayer[];
  history: CanvasAction[];
  historyIndex: number;
}

export interface CanvasAction {
  type: 'add' | 'modify' | 'delete' | 'move' | 'style';
  layerId: string;
  before?: any;
  after?: any;
  timestamp: Date;
}

// Formatos predefinidos por plataforma
export const PLATFORM_FORMATS: Record<SocialPlatform, PostFormat[]> = {
  instagram: [
    { ratio: '1:1', name: 'Cuadrado', width: 1080, height: 1080 },
    { ratio: '4:5', name: 'Vertical', width: 1080, height: 1350 },
    { ratio: '9:16', name: 'Stories', width: 1080, height: 1920 }
  ],
  facebook: [
    { ratio: '1:1', name: 'Cuadrado', width: 1200, height: 1200 },
    { ratio: '16:9', name: 'Horizontal', width: 1200, height: 675 }
  ],
  tiktok: [
    { ratio: '9:16', name: 'Vertical', width: 1080, height: 1920 }
  ],
  linkedin: [
    { ratio: '1:1', name: 'Cuadrado', width: 1200, height: 1200 },
    { ratio: '16:9', name: 'Horizontal', width: 1200, height: 675 }
  ],
  twitter: [
    { ratio: '16:9', name: 'Horizontal', width: 1200, height: 675 },
    { ratio: '1:1', name: 'Cuadrado', width: 1200, height: 1200 }
  ]
};