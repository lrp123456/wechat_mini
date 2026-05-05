export interface Material {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  title: string;
  tags: string[];
  source: string;
  status: 'available' | 'used' | 'processing';
  createdAt: number;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    size?: number;
  };
}

export interface VideoTask {
  id: string;
  style: string;
  type: 'no-narration' | 'with-narration';
  materials: string[];
  bgm?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  outputUrl?: string;
  createdAt: number;
  completedAt?: number;
}

export interface UploadTask {
  id: string;
  videoId: string;
  platforms: string[];
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  progress: Record<string, number>;
  results?: Record<string, { url?: string; status: string }>;
  createdAt: number;
}

export interface WorkflowLog {
  id: string;
  type: 'crawler' | 'material-update' | 'video-generate' | 'upload';
  status: 'success' | 'failed' | 'processing';
  message: string;
  details?: any;
  createdAt: number;
}

export interface CrawlerConfig {
  keyword: string;
  count: number;
  filter: 'like' | 'save' | 'comments' | 'all';
}

export interface VideoStyle {
  id: string;
  name: string;
  description: string;
  preview: string;
  duration: number;
}

export interface Platform {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}
