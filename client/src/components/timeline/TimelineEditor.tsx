'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useTimelineStore } from '../../store/timeline.store';
import { TimelineToolbar } from './TimelineToolbar';
import { TimelineRuler } from './TimelineRuler';
import { TrackHeader } from './TrackHeader';
import { TrackLane } from './TrackLane';
import { Playhead } from './Playhead';
import { SplitClipCommand, DeleteClipCommand, AddClipCommand, Clip } from '@frameflow/shared';

interface TimelineEditorProps {
  onOpenHistory?: () => void;
  onSave?: () => Promise<void>;
}

export function TimelineEditor({ onOpenHistory, onSave }: TimelineEditorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  const timeline = useTimelineStore((s) => s.timeline);
  const zoom = useTimelineStore((s) => s.zoom);
  const playhead = useTimelineStore((s) => s.playhead);
  const togglePlay = useTimelineStore((s) => s.togglePlay);
  const selectedClipId = useTimelineStore((s) => s.selectedClipId);
  const executeCommand = useTimelineStore((s) => s.executeCommand);
  const undo = useTimelineStore((s) => s.undo);
  const redo = useTimelineStore((s) => s.redo);
  const canUndo = useTimelineStore((s) => s.canUndo());
  const canRedo = useTimelineStore((s) => s.canRedo());

  // Handle horizontal scrolling to keep ruler and playhead synced
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Space: Toggle Play/Pause
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
        return;
      }

      // Split clip at playhead (S key)
      if (e.key === 's' || e.key === 'S') {
        if (!timeline) return;
        e.preventDefault();

        let targetTrackId: string | null = null;
        let targetClipId: string | null = null;

        if (selectedClipId) {
          for (const track of timeline.tracks) {
            const found = track.clips.find((c) => c.id === selectedClipId);
            if (found) {
              targetTrackId = track.id;
              targetClipId = found.id;
              break;
            }
          }
        } else {
          for (const track of timeline.tracks) {
            if (track.locked) continue;
            const found = track.clips.find(
              (c) => playhead > c.start && playhead < c.start + c.duration
            );
            if (found) {
              targetTrackId = track.id;
              targetClipId = found.id;
              break;
            }
          }
        }

        if (targetTrackId && targetClipId) {
          const newRightId = `clip-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
          executeCommand(new SplitClipCommand(targetTrackId, targetClipId, playhead, newRightId));
        }
        return;
      }

      // Delete clip (Delete or Backspace)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!timeline || !selectedClipId) return;
        e.preventDefault();

        for (const track of timeline.tracks) {
          if (track.locked) continue;
          const found = track.clips.find((c) => c.id === selectedClipId);
          if (found) {
            executeCommand(new DeleteClipCommand(track.id, found.id));
            break;
          }
        }
        return;
      }

      // Undo (Ctrl+Z or Cmd+Z)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }

      // Redo (Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z)
      if (
        ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z'))
      ) {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timeline, selectedClipId, playhead, canUndo, canRedo, togglePlay, executeCommand, undo, redo]);

  if (!timeline) {
    return (
      <div className="h-64 flex items-center justify-center bg-zinc-950 text-zinc-500 text-sm">
        No timeline loaded
      </div>
    );
  }

  // Calculate track canvas width (based on duration + minimum 60 seconds padding)
  const totalDuration = Math.max(timeline.duration + 30, 60);
  const canvasWidth = Math.max(1200, totalDuration * zoom);
  const trackCanvasHeight = timeline.tracks.length * 64 + 28; // 64px per track lane + 28px ruler

  // Drop asset onto timeline track handler
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const assetData = JSON.parse(dataStr) as {
        id: string;
        filename: string;
        duration?: number;
        proxyUrl?: string;
        thumbnailUrl?: string;
      };

      if (!scrollContainerRef.current) return;
      const rect = scrollContainerRef.current.getBoundingClientRect();
      const dropX = e.clientX - rect.left + scrollContainerRef.current.scrollLeft;
      const dropTime = Math.max(0, dropX / zoom);
      const clipDuration = assetData.duration && assetData.duration > 0 ? assetData.duration : 5;

      const newClip: Clip = {
        id: `clip-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        assetId: assetData.id,
        name: assetData.filename,
        start: dropTime,
        duration: clipDuration,
        inPoint: 0,
        outPoint: clipDuration,
        speed: 1.0,
        proxyUrl: assetData.proxyUrl ?? null,
        thumbnailUrl: assetData.thumbnailUrl ?? null,
        textConfig: null,
      };

      executeCommand(new AddClipCommand(trackId, newClip));
    } catch {
      // Ignored non-json drops
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-t border-zinc-800 select-none">
      {/* Toolbar */}
      <TimelineToolbar onOpenHistory={onOpenHistory} onSave={onSave} />

      {/* Main Track Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Track Headers Column */}
        <div className="w-52 flex-shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-900 z-10">
          {/* Top spacer matching ruler height */}
          <div className="h-7 border-b border-zinc-800 bg-zinc-900 flex items-center px-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Tracks
          </div>
          {/* Track Headers */}
          <div className="flex-1 overflow-hidden">
            {timeline.tracks.map((track) => (
              <TrackHeader key={track.id} track={track} />
            ))}
          </div>
        </div>

        {/* Scrollable Tracks Canvas with Ruler and Playhead */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-x-auto overflow-y-auto relative bg-zinc-950"
        >
          <div
            className="relative"
            style={{ width: `${canvasWidth}px`, minHeight: '100%' }}
          >
            {/* Timecode Ruler */}
            <TimelineRuler
              totalDuration={totalDuration}
              width={canvasWidth}
              scrollLeft={scrollLeft}
            />

            {/* Playhead Scrubber */}
            <Playhead
              timelineHeight={trackCanvasHeight}
              containerRef={scrollContainerRef}
            />

            {/* Track Lanes */}
            <div className="relative">
              {timeline.tracks.map((track) => (
                <div
                  key={track.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, track.id)}
                >
                  <TrackLane track={track} width={canvasWidth} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

