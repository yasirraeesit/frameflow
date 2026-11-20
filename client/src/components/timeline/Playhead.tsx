'use client';

import React, { useCallback, memo } from 'react';
import { useTimelineStore } from '../../store/timeline.store';
import { findSnapTime, collectSnapTargets } from '../../store/snapping';
import { formatTimecode } from '../../lib/timecode';

interface PlayheadProps {
  timelineHeight: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const Playhead = memo(function Playhead({
  timelineHeight,
  containerRef,
}: PlayheadProps) {
  const playhead = useTimelineStore((s) => s.playhead);
  const zoom = useTimelineStore((s) => s.zoom);
  const fps = useTimelineStore((s) => s.timeline?.fps ?? 30);
  const snappingEnabled = useTimelineStore((s) => s.snappingEnabled);
  const timeline = useTimelineStore((s) => s.timeline);
  const setPlayhead = useTimelineStore((s) => s.setPlayhead);

  const leftPx = playhead * zoom;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const targets = timeline && snappingEnabled ? collectSnapTargets(timeline, -1) : [];
      const thresholdSeconds = 8 / zoom;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const offsetX = moveEvent.clientX - rect.left + containerRef.current.scrollLeft;
        let candidateTime = Math.max(0, offsetX / zoom);

        if (snappingEnabled && targets.length > 0) {
          const snap = findSnapTime(candidateTime, targets, thresholdSeconds);
          if (snap.isSnapped) {
            candidateTime = snap.snappedTime;
          }
        }

        setPlayhead(candidateTime);
      };

      const handlePointerUp = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [zoom, snappingEnabled, timeline, containerRef, setPlayhead]
  );

  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none z-30 select-none will-change-transform"
      style={{
        left: `${leftPx}px`,
        transform: 'translateX(-50%)',
      }}
    >
      {/* Draggable Scrubber Flag */}
      <div
        onPointerDown={handlePointerDown}
        className="pointer-events-auto cursor-ew-resize flex flex-col items-center group"
      >
        <div className="bg-studio-accent hover:bg-studio-accent-hover text-white font-mono text-[9.5px] px-1.5 py-0.5 rounded-sm shadow-sm flex items-center justify-center font-bold tracking-wider tabular-nums transition-colors">
          <span>{formatTimecode(playhead, fps)}</span>
        </div>
        {/* Downward triangle pointer */}
        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-studio-accent group-hover:border-t-studio-accent-hover transition-colors" />
      </div>

      {/* Vertical hairline needle spanning down across all tracks */}
      <div
        className="w-[1.5px] bg-studio-accent mx-auto shadow-[0_0_8px_rgba(99,102,241,0.7)]"
        style={{ height: `${timelineHeight}px` }}
      />
    </div>
  );
});
