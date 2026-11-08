'use client';

import React, { useRef, useCallback } from 'react';
import { Clip, TrackType, MoveClipCommand, TrimClipCommand } from '@frameflow/shared';
import { useTimelineStore } from '../../store/timeline.store';
import { findSnapTime, collectSnapTargets } from '../../store/snapping';
import { formatDuration } from '../../lib/timecode';

interface ClipViewProps {
  clip: Clip;
  trackId: string;
  trackType: TrackType;
  trackLocked: boolean;
}

export function ClipView({ clip, trackId, trackType, trackLocked }: ClipViewProps) {
  const clipRef = useRef<HTMLDivElement>(null);
  const zoom = useTimelineStore((s) => s.zoom);
  const selectedClipId = useTimelineStore((s) => s.selectedClipId);
  const setSelectedClipId = useTimelineStore((s) => s.setSelectedClipId);
  const executeCommand = useTimelineStore((s) => s.executeCommand);
  const snappingEnabled = useTimelineStore((s) => s.snappingEnabled);
  const timeline = useTimelineStore((s) => s.timeline);
  const playhead = useTimelineStore((s) => s.playhead);

  const isSelected = selectedClipId === clip.id;

  const getTrackStyles = () => {
    switch (trackType) {
      case 'VIDEO':
        return isSelected
          ? 'bg-blue-600/70 border-white ring-2 ring-blue-400'
          : 'bg-blue-900/60 border-blue-600 hover:border-blue-400';
      case 'AUDIO':
        return isSelected
          ? 'bg-emerald-600/70 border-white ring-2 ring-emerald-400'
          : 'bg-emerald-900/60 border-emerald-600 hover:border-emerald-400';
      case 'TEXT':
        return isSelected
          ? 'bg-purple-600/70 border-white ring-2 ring-purple-400'
          : 'bg-purple-900/60 border-purple-600 hover:border-purple-400';
    }
  };

  // Drag-to-move handler
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (trackLocked) return;
      e.stopPropagation();
      setSelectedClipId(clip.id);

      const startX = e.clientX;
      const initialStart = clip.start;
      const thresholdSeconds = 8 / zoom;
      const targets = timeline && snappingEnabled ? collectSnapTargets(timeline, playhead, clip.id) : [];

      let currentStart = initialStart;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const deltaX = moveEvent.clientX - startX;
        let candidateStart = Math.max(0, initialStart + deltaX / zoom);

        if (snappingEnabled && targets.length > 0) {
          // Snap start edge
          const snapStart = findSnapTime(candidateStart, targets, thresholdSeconds);
          if (snapStart.isSnapped) {
            candidateStart = snapStart.snappedTime;
          } else {
            // Also test snapping end edge
            const snapEnd = findSnapTime(candidateStart + clip.duration, targets, thresholdSeconds);
            if (snapEnd.isSnapped) {
              candidateStart = snapEnd.snappedTime - clip.duration;
            }
          }
        }

        candidateStart = Math.max(0, candidateStart);
        currentStart = candidateStart;

        if (clipRef.current) {
          clipRef.current.style.left = `${candidateStart * zoom}px`;
        }
      };

      const handlePointerUp = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);

        if (Math.abs(currentStart - initialStart) > 0.01) {
          executeCommand(new MoveClipCommand(trackId, trackId, clip.id, currentStart));
        } else if (clipRef.current) {
          clipRef.current.style.left = `${initialStart * zoom}px`;
        }
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [trackLocked, clip, trackId, zoom, timeline, snappingEnabled, playhead, setSelectedClipId, executeCommand]
  );

  // Left trim handle (adjusts start, inPoint, duration)
  const handleLeftTrimDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (trackLocked) return;
      e.stopPropagation();
      setSelectedClipId(clip.id);

      const startX = e.clientX;
      const initialStart = clip.start;
      const initialDuration = clip.duration;
      const initialInPoint = clip.inPoint;
      const thresholdSeconds = 8 / zoom;
      const targets = timeline && snappingEnabled ? collectSnapTargets(timeline, playhead, clip.id) : [];

      let finalStart = initialStart;
      let finalDuration = initialDuration;
      let finalInPoint = initialInPoint;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const deltaX = moveEvent.clientX - startX;
        let candidateStart = initialStart + deltaX / zoom;

        // Constraint: clip duration must be at least 0.1s
        const maxStart = initialStart + initialDuration - 0.1;
        candidateStart = Math.min(candidateStart, maxStart);

        if (snappingEnabled && targets.length > 0) {
          const snap = findSnapTime(candidateStart, targets, thresholdSeconds);
          if (snap.isSnapped && snap.snappedTime <= maxStart) {
            candidateStart = snap.snappedTime;
          }
        }

        candidateStart = Math.max(0, candidateStart);
        const deltaSeconds = candidateStart - initialStart;
        const newDuration = Math.max(0.1, initialDuration - deltaSeconds);
        const newInPoint = Math.max(0, initialInPoint + deltaSeconds * clip.speed);

        finalStart = candidateStart;
        finalDuration = newDuration;
        finalInPoint = newInPoint;

        if (clipRef.current) {
          clipRef.current.style.left = `${candidateStart * zoom}px`;
          clipRef.current.style.width = `${newDuration * zoom}px`;
        }
      };

      const handlePointerUp = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);

        if (Math.abs(finalStart - initialStart) > 0.01) {
          executeCommand(
            new TrimClipCommand(trackId, clip.id, {
              start: finalStart,
              duration: finalDuration,
              inPoint: finalInPoint,
              outPoint: clip.outPoint,
            })
          );
        } else if (clipRef.current) {
          clipRef.current.style.left = `${initialStart * zoom}px`;
          clipRef.current.style.width = `${initialDuration * zoom}px`;
        }
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [trackLocked, clip, trackId, zoom, timeline, snappingEnabled, playhead, setSelectedClipId, executeCommand]
  );

  // Right trim handle (adjusts duration, outPoint)
  const handleRightTrimDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (trackLocked) return;
      e.stopPropagation();
      setSelectedClipId(clip.id);

      const startX = e.clientX;
      const initialDuration = clip.duration;
      const initialOutPoint = clip.outPoint;
      const thresholdSeconds = 8 / zoom;
      const targets = timeline && snappingEnabled ? collectSnapTargets(timeline, playhead, clip.id) : [];

      let finalDuration = initialDuration;
      let finalOutPoint = initialOutPoint;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const deltaX = moveEvent.clientX - startX;
        let candidateDuration = Math.max(0.1, initialDuration + deltaX / zoom);
        const candidateEnd = clip.start + candidateDuration;

        if (snappingEnabled && targets.length > 0) {
          const snap = findSnapTime(candidateEnd, targets, thresholdSeconds);
          if (snap.isSnapped && snap.snappedTime > clip.start + 0.1) {
            candidateDuration = snap.snappedTime - clip.start;
          }
        }

        const deltaSeconds = candidateDuration - initialDuration;
        const newOutPoint = Math.max(0.1, initialOutPoint + deltaSeconds * clip.speed);

        finalDuration = candidateDuration;
        finalOutPoint = newOutPoint;

        if (clipRef.current) {
          clipRef.current.style.width = `${candidateDuration * zoom}px`;
        }
      };

      const handlePointerUp = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);

        if (Math.abs(finalDuration - initialDuration) > 0.01) {
          executeCommand(
            new TrimClipCommand(trackId, clip.id, {
              start: clip.start,
              duration: finalDuration,
              inPoint: clip.inPoint,
              outPoint: finalOutPoint,
            })
          );
        } else if (clipRef.current) {
          clipRef.current.style.width = `${initialDuration * zoom}px`;
        }
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [trackLocked, clip, trackId, zoom, timeline, snappingEnabled, playhead, setSelectedClipId, executeCommand]
  );

  return (
    <div
      ref={clipRef}
      onPointerDown={handlePointerDown}
      style={{
        left: `${clip.start * zoom}px`,
        width: `${clip.duration * zoom}px`,
      }}
      className={`absolute top-1 bottom-1 rounded border overflow-hidden select-none cursor-move flex items-center justify-between text-white transition-shadow ${getTrackStyles()}`}
    >
      {/* Left Trim Handle */}
      <div
        onPointerDown={handleLeftTrimDown}
        className="w-2.5 h-full bg-black/20 hover:bg-white/40 cursor-ew-resize flex items-center justify-center group flex-shrink-0 z-10"
        title="Trim Start"
      >
        <div className="w-0.5 h-4 bg-white/60 group-hover:bg-white" />
      </div>

      {/* Clip Content Details */}
      <div className="flex-1 px-2 overflow-hidden flex flex-col justify-center min-w-0">
        <span className="text-xs font-medium truncate drop-shadow-sm leading-tight">
          {clip.name}
        </span>
        <span className="text-[10px] text-zinc-300 font-mono drop-shadow-sm leading-tight">
          {formatDuration(clip.duration)}
        </span>
      </div>

      {/* Right Trim Handle */}
      <div
        onPointerDown={handleRightTrimDown}
        className="w-2.5 h-full bg-black/20 hover:bg-white/40 cursor-ew-resize flex items-center justify-center group flex-shrink-0 z-10"
        title="Trim End"
      >
        <div className="w-0.5 h-4 bg-white/60 group-hover:bg-white" />
      </div>
    </div>
  );
}
