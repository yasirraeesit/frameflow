'use client';

import React, { useRef, useCallback } from 'react';
import { useTimelineStore } from '../../store/timeline.store';
import { findSnapTime, collectSnapTargets } from '../../store/snapping';
import { formatTimecode } from '../../lib/timecode';

interface PlayheadProps {
  timelineHeight: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function Playhead({ timelineHeight, containerRef }: PlayheadProps) {
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
      const thresholdSeconds = 8 / zoom; // 8px threshold

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
      className="absolute top-0 bottom-0 pointer-events-none z-30"
      style={{
        left: `${leftPx}px`,
        transform: 'translateX(-50%)',
      }}
    >
      {/* Draggable Scrubber Flag */}
      <div
        onPointerDown={handlePointerDown}
        className="pointer-events-auto cursor-ew-resize flex flex-col items-center select-none"
      >
        <div className="bg-red-500 hover:bg-red-400 text-white font-mono text-[9px] px-1.5 py-0.5 rounded shadow flex items-center gap-1 font-semibold">
          <span>{formatTimecode(playhead, fps)}</span>
        </div>
        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-red-500" />
      </div>

      {/* Vertical needle spanning down */}
      <div
        className="w-[2px] bg-red-500 shadow-sm mx-auto"
        style={{ height: `${timelineHeight}px` }}
      />
    </div>
  );
}
