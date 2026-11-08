'use client';

import React from 'react';
import { Track } from '@frameflow/shared';
import { ClipView } from './ClipView';
import { useTimelineStore } from '../../store/timeline.store';

interface TrackLaneProps {
  track: Track;
  width: number;
}

export function TrackLane({ track, width }: TrackLaneProps) {
  const zoom = useTimelineStore((s) => s.zoom);
  const setSelectedClipId = useTimelineStore((s) => s.setSelectedClipId);

  const handleLaneClick = (e: React.MouseEvent) => {
    // If clicking directly on lane empty area, clear selection
    if (e.target === e.currentTarget) {
      setSelectedClipId(null);
    }
  };

  return (
    <div
      onClick={handleLaneClick}
      className={`relative h-16 border-b border-zinc-800/80 transition-colors ${
        track.locked ? 'bg-zinc-950/90' : 'bg-zinc-950/40 hover:bg-zinc-900/20'
      }`}
      style={{ width: `${width}px` }}
    >
      {/* Grid line indicator background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent ${zoom}px)`,
        }}
      />

      {/* Render Clips */}
      {track.clips.map((clip) => (
        <ClipView
          key={clip.id}
          clip={clip}
          trackId={track.id}
          trackType={track.type}
          trackLocked={track.locked}
        />
      ))}
    </div>
  );
}

