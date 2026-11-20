'use client';

import React, { memo } from 'react';
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

export const TimelineToolbar = memo(function TimelineToolbar({
  onOpenHistory,
  onSave,
}: TimelineToolbarProps) {
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
  const selectedClipId = useTimelineStore((s) => s.selectedClipId);
  const executeCommand = useTimelineStore((s) => s.executeCommand);
  const isDirty = useTimelineStore((s) => s.isDirty);
  const isSaving = useTimelineStore((s) => s.isSaving);

  // Split selected clip at playhead (or clip directly under playhead)
  const handleSplit = () => {
    if (!timeline) return;
    const playhead = useTimelineStore.getState().playhead;

    let targetTrackId: string | null = null;
    let targetClipId: string | null = null;

    if (selectedClipId) {
      for (const track of timeline.tracks) {
        if (track.locked) continue;
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
    <div className="h-11 bg-studio-surface border-b border-studio-border px-3 flex items-center justify-between select-none">
      {/* Left controls: Play, Split, Delete, Undo, Redo */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={togglePlay}
          className={`p-1.5 rounded transition flex items-center gap-1 font-medium text-xs border ${
            isPlaying
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-primary text-white border-blue-500 hover:bg-primary-hover'
          }`}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        <div className="h-4 w-px bg-studio-border mx-1" />

        {/* Split Clip Tool */}
        <button
          onClick={handleSplit}
          className="p-1.5 rounded border border-transparent text-zinc-300 hover:text-white hover:bg-studio-surface-sub hover:border-studio-border transition flex items-center gap-1 text-xs"
          title="Split Clip at Playhead (S)"
        >
          <Scissors className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden md:inline">Split</span>
          <kbd className="hidden lg:inline text-[9px] bg-studio-panel border border-studio-border px-1 py-0.2 rounded font-mono text-zinc-400">
            S
          </kbd>
        </button>

        {/* Delete Selected Clip */}
        <button
          onClick={handleDelete}
          disabled={!selectedClipId}
          className={`p-1.5 rounded border transition flex items-center gap-1 text-xs ${
            selectedClipId
              ? 'text-red-400 border-transparent hover:text-red-300 hover:bg-red-950/40 hover:border-red-900/60'
              : 'text-zinc-600 border-transparent cursor-not-allowed'
          }`}
          title="Delete Selected Clip (Del / Backspace)"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Delete</span>
        </button>

        <div className="h-4 w-px bg-studio-border mx-1" />

        {/* Undo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-1.5 rounded border border-transparent transition ${
            canUndo
              ? 'text-zinc-300 hover:text-white hover:bg-studio-surface-sub hover:border-studio-border'
              : 'text-zinc-600 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>

        {/* Redo */}
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-1.5 rounded border border-transparent transition ${
            canRedo
              ? 'text-zinc-300 hover:text-white hover:bg-studio-surface-sub hover:border-studio-border'
              : 'text-zinc-600 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right controls: Snapping, Zoom, History, Manual Save */}
      <div className="flex items-center gap-2">
        {/* Snapping Toggle */}
        <button
          onClick={() => setSnappingEnabled(!snappingEnabled)}
          className={`p-1.5 rounded border text-xs transition flex items-center gap-1 ${
            snappingEnabled
              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/80 hover:bg-cyan-900/60'
              : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-studio-surface-sub hover:border-studio-border'
          }`}
          title={snappingEnabled ? 'Magnetic Snapping Active' : 'Magnetic Snapping Disabled'}
        >
          <Magnet className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Snap</span>
        </button>

        <div className="h-4 w-px bg-studio-border mx-0.5" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-studio-panel px-1.5 py-1 rounded border border-studio-border">
          <button
            onClick={() => setZoom(zoom - 15)}
            className="p-0.5 text-zinc-400 hover:text-white transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <span className="text-[10px] font-mono text-zinc-400 w-10 text-center tabular-nums">
            {Math.round((zoom / 60) * 100)}%
          </span>
          <button
            onClick={() => setZoom(zoom + 15)}
            className="p-0.5 text-zinc-400 hover:text-white transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
        </div>

        {/* Version History Modal Button */}
        {onOpenHistory && (
          <button
            onClick={onOpenHistory}
            className="p-1.5 rounded border border-studio-border bg-studio-panel text-zinc-300 hover:text-white hover:bg-studio-surface-sub transition flex items-center gap-1 text-xs"
            title="Timeline Version History Snapshots"
          >
            <History className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Versions</span>
          </button>
        )}

        {/* Manual Save Trigger (if provided) */}
        {onSave && (
          <button
            onClick={() => void onSave()}
            disabled={isSaving || !isDirty}
            className={`p-1.5 rounded border text-xs font-medium transition flex items-center gap-1 ${
              isSaving
                ? 'bg-blue-950/60 text-blue-400 border-blue-800 cursor-wait'
                : isDirty
                ? 'bg-amber-600/20 text-amber-300 border-amber-600/40 hover:bg-amber-600/30'
                : 'text-zinc-500 border-studio-border bg-studio-panel cursor-default'
            }`}
            title={isDirty ? 'Save Changes to Server' : 'All Changes Saved'}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isDirty ? (
              <Save className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="hidden md:inline">
              {isSaving ? 'Saving' : isDirty ? 'Save' : 'Saved'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
});
