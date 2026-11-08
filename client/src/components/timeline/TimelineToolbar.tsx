'use client';

import React from 'react';
import { useTimelineStore } from '../../store/timeline.store';
import { SplitClipCommand, DeleteClipCommand } from '@frameflow/shared';
import {
  Play,
  Pause,
  Scissors,
  Trash2,
  Undo2,
  Redo2,
  Magnet,
  ZoomIn,
  ZoomOut,
  History,
  Save,
  Check,
  Loader2,
} from 'lucide-react';

interface TimelineToolbarProps {
  onOpenHistory?: () => void;
  onSave?: () => Promise<void>;
}

export function TimelineToolbar({ onOpenHistory, onSave }: TimelineToolbarProps) {
  const isPlaying = useTimelineStore((s) => s.isPlaying);
  const togglePlay = useTimelineStore((s) => s.togglePlay);
  const zoom = useTimelineStore((s) => s.zoom);
  const setZoom = useTimelineStore((s) => s.setZoom);
  const snappingEnabled = useTimelineStore((s) => s.snappingEnabled);
  const setSnappingEnabled = useTimelineStore((s) => s.setSnappingEnabled);
  const canUndo = useTimelineStore((s) => s.canUndo());
  const canRedo = useTimelineStore((s) => s.canRedo());
  const undo = useTimelineStore((s) => s.undo);
  const redo = useTimelineStore((s) => s.redo);
  const timeline = useTimelineStore((s) => s.timeline);
  const playhead = useTimelineStore((s) => s.playhead);
  const selectedClipId = useTimelineStore((s) => s.selectedClipId);
  const executeCommand = useTimelineStore((s) => s.executeCommand);
  const isDirty = useTimelineStore((s) => s.isDirty);
  const isSaving = useTimelineStore((s) => s.isSaving);

  // Split selected clip at playhead (or clip directly under playhead)
  const handleSplit = () => {
    if (!timeline) return;

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
      // Find topmost clip under playhead
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
  };

  // Delete selected clip
  const handleDelete = () => {
    if (!timeline || !selectedClipId) return;

    for (const track of timeline.tracks) {
      if (track.locked) continue;
      const found = track.clips.find((c) => c.id === selectedClipId);
      if (found) {
        executeCommand(new DeleteClipCommand(track.id, found.id));
        break;
      }
    }
  };

  return (
    <div className="h-12 bg-zinc-900 border-b border-zinc-800 px-4 flex items-center justify-between select-none">
      {/* Left controls: Play/Pause, Split, Delete, Undo, Redo */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={togglePlay}
          className="p-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1 text-xs font-medium px-2.5 shadow-sm"
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        <div className="h-5 w-px bg-zinc-800 mx-1" />

        <button
          onClick={handleSplit}
          className="p-1.5 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
          title="Split Clip at Playhead (S)"
        >
          <Scissors className="w-4 h-4" />
        </button>

        <button
          onClick={handleDelete}
          disabled={!selectedClipId}
          className="p-1.5 rounded-md text-zinc-300 hover:text-red-400 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:text-zinc-300 disabled:hover:bg-transparent transition"
          title="Delete Clip (Del)"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-zinc-800 mx-1" />

        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-1.5 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-1.5 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-zinc-800 mx-1" />

        <button
          onClick={() => setSnappingEnabled(!snappingEnabled)}
          className={`p-1.5 rounded-md transition ${
            snappingEnabled
              ? 'bg-blue-950/80 text-blue-400 hover:bg-blue-900/80'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
          title={snappingEnabled ? 'Snapping Enabled (Click to disable)' : 'Snapping Disabled'}
        >
          <Magnet className="w-4 h-4" />
        </button>
      </div>

      {/* Right controls: Zoom, History, Save Status */}
      <div className="flex items-center gap-3">
        {/* Zoom controls */}
        <div className="flex items-center gap-2 bg-zinc-950/60 px-2 py-1 rounded-md border border-zinc-800/80">
          <button
            onClick={() => setZoom(zoom - 10)}
            className="text-zinc-400 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <input
            type="range"
            min="15"
            max="200"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-20 accent-blue-500 cursor-pointer h-1 bg-zinc-800 rounded"
          />
          <button
            onClick={() => setZoom(zoom + 10)}
            className="text-zinc-400 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-zinc-400 font-mono w-7 text-right">
            {Math.round((zoom / 60) * 100)}%
          </span>
        </div>

        {/* History Modal Trigger */}
        {onOpenHistory && (
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-md border border-zinc-700/60 transition"
          >
            <History className="w-3.5 h-3.5 text-zinc-400" />
            <span>History</span>
          </button>
        )}

        {/* Save button & state */}
        {onSave && (
          <button
            onClick={() => void onSave()}
            disabled={isSaving || !isDirty}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition ${
              isDirty
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-zinc-800 text-zinc-400 cursor-default'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : isDirty ? (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

