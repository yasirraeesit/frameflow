export type TrackType = 'VIDEO' | 'AUDIO' | 'TEXT';

export type AspectRatio = '9:16' | '1:1' | '4:5' | '16:9';

export interface TextConfig {
  text: string;
  fontSize: number;
  color: string;
  position: { x: number; y: number };
}

export interface WordTiming {
  word: string;
  start: number; // in seconds relative to timeline or clip
  end: number;
  confidence?: number;
  highlighted?: boolean;
}

export interface ReframeConfig {
  cropX: number; // 0.0 - 1.0 normalized horizontal center
  cropY: number; // 0.0 - 1.0 normalized vertical center
  scale: number; // 1.0 - 3.0 zoom multiplier
  mode: 'auto' | 'split' | 'manual' | 'AUTO_SPEAKER' | 'MANUAL';
  speakerTracking?: boolean;
}

export type CaptionPresetType =
  | 'hormozi_pop'
  | 'keyword_highlight'
  | 'karaoke_box'
  | 'clean_minimal'
  | 'HORMOZI'
  | 'KARAOKE'
  | 'MINIMAL'
  | 'NONE';

export interface CaptionStyle {
  preset: CaptionPresetType;
  primaryColor: string;
  highlightColor: string;
  position: 'bottom' | 'center' | 'top' | 'BOTTOM' | 'CENTER' | 'TOP';
  uppercase: boolean;
  fontSize?: number;
}

export type CaptionConfig = CaptionStyle;

export interface BrandKitConfig {
  primaryColor: string;
  highlightColor: string;
  fontFamily: string;
  captionPreset: string;
  logoUrl?: string;
  logoPosition?: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';
  logoScale?: number;
}

export interface Clip {
  id: string;
  assetId: string | null;
  name: string;
  start: number;        // Position on timeline in seconds
  duration: number;     // Duration on timeline in seconds
  inPoint: number;      // Source media trim start offset in seconds
  outPoint: number;     // Source media trim end offset in seconds
  speed: number;        // Playback speed multiplier (default 1.0)
  proxyUrl: string | null;
  thumbnailUrl: string | null;
  textConfig: TextConfig | null;
  words?: WordTiming[];
  reframe?: { cropX: number; cropY: number; scale: number };
}

export interface Track {
  id: string;
  type: TrackType;
  name: string;
  locked: boolean;
  muted: boolean;
  clips: Clip[];
}

export interface Marker {
  id: string;
  time: number;
  label: string;
  color: string;
}

export interface ViralClipMetadata {
  title: string;
  viralityScore: number;
  hookScore: number;
  flowScore: number;
  relevanceScore: number;
  reason: string;
  socialCaption: string;
  hashtags: string[];
}

export interface TimelineDocument {
  id: string;
  projectId: string;
  clipId?: string;
  version: number;
  fps: number;
  duration: number;
  aspectRatio?: AspectRatio;
  reframeConfig?: ReframeConfig;
  captionStyle?: CaptionStyle;
  captionConfig?: CaptionStyle;
  brandKit?: BrandKitConfig;
  tracks: Track[];
  markers: Marker[];
}
