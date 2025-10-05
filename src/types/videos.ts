// Tipos para el sistema completo de Videos, Reels y Shorts

export interface VideoProject {
  id: string;
  title: string;
  type: VideoType;
  status: 'briefing' | 'generating' | 'editing' | 'finalizing' | 'scheduled' | 'published';
  briefing: VideoBriefing;
  scenes: VideoScene[];
  selectedSceneIds: string[];
  timeline: VideoTimeline;
  copywriting: VideoCopywriting;
  publishing: VideoPublishing;
  createdAt: Date;
  updatedAt: Date;
  brandKitCompliant: boolean;
}

export interface VideoBriefing {
  description: string;
  videoType: VideoType;
  duration: VideoDuration;
  platform: VideoPlatform;
  style: VideoStyle;
  chatHistory: VideoChatMessage[];
  script?: string;
  objectives: string[];
  targetAudience?: string;
}

export interface VideoChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: string[];
}

export type VideoType = 'short' | 'video_long';

export interface VideoDuration {
  target: number; // seconds
  min: number;
  max: number;
  label: string;
}

export type VideoPlatform = 'tiktok' | 'instagram' | 'youtube' | 'linkedin' | 'twitter' | 'multiple';

export type VideoStyle = 'dynamic' | 'formal' | 'educational' | 'fun' | 'minimal' | 'cinematic' | 'trendy';

export interface VideoScene {
  id: string;
  projectId: string;
  order: number;
  duration: number; // seconds
  title: string;
  description: string;
  thumbnail: string;
  layers: VideoLayer[];
  transitions: SceneTransition[];
  brandElements: AppliedVideoBrandElements;
  metadata: SceneMetadata;
  createdAt: Date;
  isSelected?: boolean;
}

export interface VideoLayer {
  id: string;
  type: 'video' | 'audio' | 'text' | 'image' | 'logo' | 'overlay' | 'subtitle';
  name: string;
  content: any;
  startTime: number; // seconds
  duration: number; // seconds
  position: LayerPosition;
  style: VideoLayerStyle;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  effects?: LayerEffect[];
}

export interface LayerPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scale?: number;
}

export interface VideoLayerStyle {
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
  animation?: string;
}

export interface LayerEffect {
  type: 'fade_in' | 'fade_out' | 'slide_in' | 'slide_out' | 'zoom_in' | 'zoom_out' | 'bounce';
  duration: number;
  delay?: number;
  easing?: string;
}

export interface SceneTransition {
  type: 'cut' | 'fade' | 'slide' | 'wipe' | 'zoom' | 'dissolve';
  duration: number;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export interface VideoTimeline {
  totalDuration: number;
  scenes: TimelineScene[];
  globalLayers: VideoLayer[]; // Layers that span multiple scenes
  audioTracks: AudioTrack[];
  markers: TimelineMarker[];
}

export interface TimelineScene {
  sceneId: string;
  startTime: number;
  duration: number;
  volume: number;
}

export interface AudioTrack {
  id: string;
  name: string;
  url?: string;
  startTime: number;
  duration: number;
  volume: number;
  type: 'music' | 'voice' | 'sfx';
  fadeIn?: number;
  fadeOut?: number;
}

export interface TimelineMarker {
  id: string;
  time: number;
  label: string;
  type: 'scene' | 'beat' | 'highlight';
}

export interface SceneMetadata {
  aiGenerated: boolean;
  prompt?: string;
  generationTime?: number;
  confidence?: number;
  tags: string[];
  complexity: 'low' | 'medium' | 'high';
}

export interface AppliedVideoBrandElements {
  colors: Array<{ name: string; hex: string; usage: string }>;
  fonts: Array<{ name: string; family: string; weight: string }>;
  logos: Array<{ name: string; url: string; position: string; timing: string }>;
  animations: Array<{ name: string; type: string; timing: string }>;
  guidelines: string[];
}

export interface VideoCopywriting {
  caption: string;
  hashtags: string[];
  title?: string;
  description?: string;
  callToAction?: string;
  mentions?: string[];
  tone: string;
  transcript?: string;
  subtitles?: SubtitleSegment[];
  aiGenerated: boolean;
  variations?: string[];
}

export interface SubtitleSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  style?: VideoLayerStyle;
}

export interface VideoPublishing {
  scheduledDate?: Date;
  platforms: VideoPublishingPlatform[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  publishingNotes?: string;
  thumbnailCustom?: string;
}

export interface VideoPublishingPlatform {
  platform: VideoPlatform;
  accountId?: string;
  customCaption?: string;
  customHashtags?: string[];
  customTitle?: string;
  customThumbnail?: string;
  postTime?: Date;
  status: 'pending' | 'scheduled' | 'published' | 'failed';
  visibility?: 'public' | 'unlisted' | 'private';
}

// Canvas de timeline
export interface TimelineState {
  zoom: number;
  currentTime: number;
  selectedLayerId?: string;
  selectedSceneId?: string;
  isPlaying: boolean;
  clipboardLayers: VideoLayer[];
  history: TimelineAction[];
  historyIndex: number;
}

export interface TimelineAction {
  type: 'add' | 'modify' | 'delete' | 'move' | 'trim' | 'split';
  layerId?: string;
  sceneId?: string;
  before?: any;
  after?: any;
  timestamp: Date;
}

// Configuraciones predefinidas por tipo de video
export const VIDEO_TYPE_CONFIGS: Record<VideoType, {
  durations: VideoDuration[];
  platforms: VideoPlatform[];
  recommendedStyle: VideoStyle[];
  maxScenes: number;
}> = {
  short: {
    durations: [
      { target: 15, min: 10, max: 30, label: '15s (Viral)' },
      { target: 30, min: 20, max: 60, label: '30s (Engagement)' },
      { target: 60, min: 45, max: 90, label: '90s (Máximo)' }
    ],
    platforms: ['instagram', 'tiktok', 'youtube'],
    recommendedStyle: ['dynamic', 'fun', 'trendy'],
    maxScenes: 5
  },
  video_long: {
    durations: [
      { target: 120, min: 60, max: 300, label: '2min (Corto)' },
      { target: 600, min: 300, max: 1200, label: '10min (Estándar)' },
      { target: 1200, min: 600, max: 1800, label: '20min (Extenso)' }
    ],
    platforms: ['youtube', 'linkedin'],
    recommendedStyle: ['educational', 'formal', 'cinematic'],
    maxScenes: 15
  }
};

// Formatos predefinidos por plataforma
export const VIDEO_PLATFORM_FORMATS: Record<VideoPlatform, {
  ratio: string;
  width: number;
  height: number;
  maxDuration: number;
  recommendedDurations: number[];
}> = {
  tiktok: {
    ratio: '9:16',
    width: 1080,
    height: 1920,
    maxDuration: 180,
    recommendedDurations: [15, 30, 60]
  },
  instagram: {
    ratio: '9:16',
    width: 1080,
    height: 1920,
    maxDuration: 90,
    recommendedDurations: [15, 30, 60, 90]
  },
  youtube: {
    ratio: '16:9',
    width: 1920,
    height: 1080,
    maxDuration: 43200, // 12 hours
    recommendedDurations: [60, 300, 600, 1200]
  },
  linkedin: {
    ratio: '16:9',
    width: 1920,
    height: 1080,
    maxDuration: 600,
    recommendedDurations: [60, 120, 300]
  },
  twitter: {
    ratio: '16:9',
    width: 1280,
    height: 720,
    maxDuration: 140,
    recommendedDurations: [30, 60, 120]
  },
  multiple: {
    ratio: '9:16',
    width: 1080,
    height: 1920,
    maxDuration: 60,
    recommendedDurations: [15, 30, 60]
  }
};