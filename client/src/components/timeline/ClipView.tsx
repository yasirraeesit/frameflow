'use client';

import React, { useRef, useCallback, memo } from 'react';
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

export const ClipView = memo(function ClipView({
  clip,
  trackId,
  trackType,
  trackLocked,
}: ClipViewProps) {
  const clipRef = useRef<HTMLDivElement>(null);
  const zoom = useTimelineStore((s) => s.zoom);
  const isSelected = useTimelineStore((s) => s.selectedClipId === clip.id);
  const setSelectedClipId = useTimelineStore((s) => s.setSelectedClipId);
  const executeCommand = useTimelineStore((s) => s.executeCommand);
  const snappingEnabled = useTimelineStore((s) => s.snappingEnabled);
  const timeline = useTimelineStore((s) => s.timeline);

  // Distinct track styling: muted dark-mode fills with bright structural borders
  const getTrackStyles = () => {
    switch (trackType) {
      case 'VIDEO':
        return isSelected
          ? 'bg-track-video-bg border-track-video-border ring-2 ring-studio-accent shadow-sm'
          : 'bg-track-video-bg/90 border-track-video-border/80 hover:border-track-video-hover hover:bg-track-video-bg';
      case 'AUDIO':
        return isSelected
          ? 'bg-track-audio-bg border-track-audio-border ring-2 ring-studio-accent shadow-sm'
          : 'bg-track-audio-bg/90 border-track-audio-border/80 hover:border-track-audio-hover hover:bg-track-audio-bg';
      case 'TEXT':
        return isSelected
          ? 'bg-track-text-bg border-track-text-border ring-2 ring-studio-accent shadow-sm'
          : 'bg-track-text-bg/90 border-track-text-border/80 hover:border-track-text-hover hover:bg-track-text-bg';
    }
  };

  // Drag-to-move handler (GPU-accelerated; zero re-renders during playhead scrubbing)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (trackLocked) return;
      e.stopPropagation();
      setSelectedClipId(clip.id);

      const startX = e.clientX;
      const initialStart = clip.start;
      const thresholdSeconds = 8 / zoom;
      const currentPlayhead = useTimelineStore.getState().playhead;
      const targets =
        timeline && snappingEnabled
          ? collectSnapTargets(timeline, currentPlayhead, clip.id)
          : [];

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
            const snapEnd = findSnapTime(
              candidateStart + clip.duration,
              targets,
              thresholdSeconds
            );
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
    [trackLocked, clip, trackId, zoom, timeline, snappingEnabled, setSelectedClipId, executeCommand]
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
      const currentPlayhead = useTimelineStore.getState().playhead;
      const targets =
        timeline && snappingEnabled
          ? collectSnapTargets(timeline, currentPlayhead, clip.id)
          : [];

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
    [trackLocked, clip, trackId, zoom, timeline, snappingEnabled, setSelectedClipId, executeCommand]
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
      const currentPlayhead = useTimelineStore.getState().playhead;
      const targets =
        timeline && snappingEnabled
          ? collectSnapTargets(timeline, currentPlayhead, clip.id)
          : [];

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
    [trackLocked, clip, trackId, zoom, timeline, snappingEnabled, setSelectedClipId, executeCommand]
  );

  return (
    <div
      ref={clipRef}
      onPointerDown={handlePointerDown}
      style={{
        left: `${clip.start * zoom}px`,
        width: `${clip.duration * zoom}px`,
      }}
      className={`absolute top-1.5 bottom-1.5 rounded-sm border select-none cursor-grab active:cursor-grabbing flex items-stretch justify-between text-white overflow-hidden transition-colors ${
        trackLocked ? 'opacity-50 cursor-not-allowed' : ''
      } ${getTrackStyles()}`}
    >
      {/* Left Trim Handle */}
      {!trackLocked && (
        <div
          onPointerDown={handleLeftTrimDown}
          className="w-2.5 hover:w-3.5 h-full bg-black/40 hover:bg-white/40 cursor-ew-resize flex items-center justify-center group flex-shrink-0 z-10 transition-all border-r border-black/30"
          title="Trim Start Edge"
        >
          <div className="w-0.5 h-3.5 bg-white/50 group-hover:bg-white rounded-full" />
        </div>
      )}

      {/* Clip Content Details */}
      <div className="flex-1 px-2 overflow-hidden flex flex-col justify-center min-w-0 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium truncate text-zinc-100 leading-tight">
            {clip.name}
          </span>
          {clip.speed !== 1.0 && (
            <span className="text-[9px] font-mono px-1 rounded bg-black/50 text-amber-300 font-bold">
              {clip.speed}x
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-zinc-300 font-mono tabular-nums leading-none font-medium">
            {formatDuration(clip.duration)}
          </span>
          {clip.inPoint > 0 && (
            <span className="text-[9px] text-zinc-400 font-mono tabular-nums leading-none">
              in: {formatDuration(clip.inPoint)}
            </span>
          )}
        </div>
      </div>

      {/* Right Trim Handle */}
      {!trackLocked && (
        <div
          onPointerDown={handleRightTrimDown}
          className="w-2.5 hover:w-3.5 h-full bg-black/40 hover:bg-white/40 cursor-ew-resize flex items-center justify-center group flex-shrink-0 z-10 transition-all border-l border-black/30"
          title="Trim End Edge"
        >
          <div className="w-0.5 h-3.5 bg-white/50 group-hover:bg-white rounded-full" />
        </div>
      )}
    </div>
  );
});
