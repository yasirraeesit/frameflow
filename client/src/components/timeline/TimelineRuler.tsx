'use client';

import React, { useRef, useCallback } from 'react';
import { useTimelineStore } from '../../store/timeline.store';
import { formatTimecode } from '../../lib/timecode';

interface TimelineRulerProps {
  totalDuration: number;
  width: number;
  scrollLeft: number;
}

export function TimelineRuler({ totalDuration, width, scrollLeft }: TimelineRulerProps) {
  const rulerRef = useRef<HTMLDivElement>(null);
  const zoom = useTimelineStore((s) => s.zoom);
  const fps = useTimelineStore((s) => s.timeline?.fps ?? 30);
  const setPlayhead = useTimelineStore((s) => s.setPlayhead);

  // Determine tick interval based on zoom
  // If zoom is high (>80 px/sec), major tick every 1s, minor every 0.2s
  // If zoom is medium (40-80 px/sec), major tick every 2s, minor every 0.5s
  // If zoom is low (<40 px/sec), major tick every 5s, minor every 1s
  let majorInterval = 1;
  let minorInterval = 0.2;
  if (zoom < 30) {
    majorInterval = 5;
    minorInterval = 1;
  } else if (zoom < 60) {
    majorInterval = 2;
    minorInterval = 0.5;
  }

  const durationToRender = Math.max(totalDuration + 10, 60);
  const totalTicks = Math.ceil(durationToRender / minorInterval);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!rulerRef.current) return;

      const updatePlayheadFromEvent = (event: PointerEvent | React.PointerEvent) => {
        if (!rulerRef.current) return;
        const rect = rulerRef.current.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const targetTime = Math.max(0, offsetX / zoom);
        setPlayhead(targetTime);
      };

      updatePlayheadFromEvent(e);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        updatePlayheadFromEvent(moveEvent);
      };

      const handlePointerUp = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [zoom, setPlayhead]
  );

  return (
    <div
      ref={rulerRef}
      onPointerDown={handlePointerDown}
      className="relative h-7 bg-zinc-900 border-b border-zinc-800 select-none cursor-pointer overflow-hidden"
      style={{ width: `${Math.max(width, durationToRender * zoom)}px` }}
    >
      {Array.from({ length: totalTicks + 1 }).map((_, i) => {
        const time = i * minorInterval;
        const left = time * zoom;
        const isMajor = Math.abs(time % majorInterval) < 0.001;

        if (left < scrollLeft - 50 || left > scrollLeft + 2000) {
          return null; // Virtualize ticks outside visible viewport
        }

        return (
          <div
            key={i}
            className="absolute top-0 pointer-events-none"
            style={{ left: `${left}px` }}
          >
            {isMajor ? (
              <>
                <div className="h-3 w-px bg-zinc-400" />
                <span className="absolute left-1 top-0 text-[10px] font-mono text-zinc-400 leading-none">
                  {formatTimecode(time, fps).slice(3, 8)}
                </span>
              </>
            ) : (
              <div className="h-1.5 w-px bg-zinc-700" />
            )}
          </div>
        );
      })}
    </div>
  );
}
