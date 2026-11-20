'use client';

import React, { memo } from 'react';
import { formatTimecode } from '../../lib/timecode';
import { useTimelineStore } from '../../store/timeline.store';

interface TimecodeDisplayProps {
  className?: string;
}

export const TimecodeDisplay = memo(function TimecodeDisplay({
  className = '',
}: TimecodeDisplayProps) {
  const playhead = useTimelineStore((s) => s.playhead);
  const duration = useTimelineStore((s) => s.timeline?.duration ?? 0);
  const fps = useTimelineStore((s) => s.timeline?.fps ?? 30);

  return (
    <div
      className={`font-mono text-xs flex items-center gap-1.5 select-none tabular-nums bg-studio-panel px-2.5 py-1 rounded border border-studio-border/90 ${className}`}
    >
      <span className="text-white font-semibold tracking-wider">
        {formatTimecode(playhead, fps)}
      </span>
      <span className="text-studio-text-dim">/</span>
      <span className="text-studio-text-muted">
        {formatTimecode(duration, fps)}
      </span>
      <span className="text-[9px] text-zinc-500 font-mono ml-1">
        @{fps}fps
      </span>
    </div>
  );
});
