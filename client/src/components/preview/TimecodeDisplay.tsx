'use client';

import React from 'react';
import { formatTimecode } from '../../lib/timecode';
import { useTimelineStore } from '../../store/timeline.store';

interface TimecodeDisplayProps {
  className?: string;
}

export function TimecodeDisplay({ className = '' }: TimecodeDisplayProps) {
  const playhead = useTimelineStore((s) => s.playhead);
  const duration = useTimelineStore((s) => s.timeline?.duration ?? 0);
  const fps = useTimelineStore((s) => s.timeline?.fps ?? 30);

  return (
    <div className={`font-mono text-xs flex items-center gap-1.5 select-none ${className}`}>
      <span className="text-white font-semibold tracking-wider">
        {formatTimecode(playhead, fps)}
      </span>
      <span className="text-zinc-500">/</span>
      <span className="text-zinc-400">
        {formatTimecode(duration, fps)}
      </span>
    </div>
  );
}
