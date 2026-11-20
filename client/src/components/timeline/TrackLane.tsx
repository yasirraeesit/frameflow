'use client';

import React, { memo } from 'react';
import { Track } from '@frameflow/shared';
import { ClipView } from './ClipView';
import { useTimelineStore } from '../../store/timeline.store';

interface TrackLaneProps {
  track: Track;
  width: number;
}

export const TrackLane = memo(function TrackLane({ track, width }: TrackLaneProps) {
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
      className={`relative h-14 border-b border-studio-border/70 transition-colors select-none ${track.locked ? 'locked-track-pattern' : 'bg-studio-panel hover:bg-studio-surface/30'
        }`}
      style={{ width: `${width}px` }}
    >
      {/* 1-Second Grid Lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, #ffffff 0, #ffffff 1px, transparent 1px, transparent ${zoom}px)`,
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
});
