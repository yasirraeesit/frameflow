export type TrackType = 'VIDEO' | 'AUDIO' | 'TEXT';

export interface TextConfig {
  text: string;
  fontSize: number;
  color: string;
  position: { x: number; y: number };
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

export interface TimelineDocument {
  id: string;
  projectId: string;
  version: number;
  fps: number;
  duration: number;
  tracks: Track[];
  markers: Marker[];
}

