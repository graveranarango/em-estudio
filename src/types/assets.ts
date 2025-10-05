export type AssetType = 
  | "post" 
  | "story" 
  | "video" 
  | "podcast" 
  | "clip" 
  | "logo" 
  | "font"
  | "carrousel";

export type AssetStatus = "draft" | "final" | "published";

export type AssetPlatform = 
  | "instagram" 
  | "facebook" 
  | "tiktok" 
  | "youtube" 
  | "linkedin" 
  | "twitter"
  | "spotify"
  | "generic";

export interface AssetVersion {
  version: number;
  url: string;
  thumbnailUrl?: string;
  date: string;
  notes: string;
  fileSize?: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface Asset {
  id: string;
  type: AssetType;
  title: string;
  description?: string;
  brandkitId: string;
  projectId: string;
  campaignId?: string;
  platform: AssetPlatform;
  createdAt: string;
  updatedAt: string;
  status: AssetStatus;
  thumbnailUrl: string;
  tags: string[];
  versions: AssetVersion[];
  currentVersion: number;
  brandCompliance: {
    isCompliant: boolean;
    issues: string[];
    score: number; // 0-100
  };
  metadata: {
    duration?: number; // for videos/audio
    dimensions?: {
      width: number;
      height: number;
    };
    fileSize: number;
    format: string;
  };
  author: {
    id: string;
    name: string;
  };
}

export interface AssetFilters {
  type?: AssetType[];
  status?: AssetStatus[];
  platform?: AssetPlatform[];
  projectId?: string;
  campaignId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  brandCompliance?: 'compliant' | 'issues' | 'all';
  search?: string;
}

export interface AssetProject {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  brandkitId: string;
  assetsCount: number;
}

export interface AssetCampaign {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  createdAt: string;
  assetsCount: number;
}