'use client';

import React, { useRef } from 'react';
import type { WordTiming } from '@frameflow/shared';
import type { BRollBlock } from './TranscriptPanel';
import {
  Scissors,
  Magnet,
  ZoomIn,
  ZoomOut,
  Layers,
  Sparkles,
  Volume2,
  Type,
  Video,
  Film,
  Maximize2,
} from 'lucide-react';

interface TimelineDockProps {
  playheadTime: number;
  totalDuration: number;
  onSeek: (time: number) => void;
  words: WordTiming[];
  cutWordIndices: Set<number>;
  bRollList: BRollBlock[];
  onSplitAtPlayhead: () => void;
  timelineZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  snapEnabled: boolean;
  onToggleSnap: () => void;
}

export function TimelineDock({
  playheadTime,
  totalDuration,
  onSeek,
  words,
  cutWordIndices,
  bRollList,
  onSplitAtPlayhead,
  timelineZoom,
  onZoomIn,
  onZoomOut,
  snapEnabled,
  onToggleSnap,
}: TimelineDockProps): JSX.Element {
  const rulerRef = useRef<HTMLDivElement>(null);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(percentage * totalDuration);
  };

  // Percentage for playhead needle position
  const playheadPercent = Math.min(100, Math.max(0, (playheadTime / totalDuration) * 100));

  // Generate ruler tick marks every 5 seconds
  const tickCount = Math.ceil(totalDuration / 5);
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i * 5);

  // Active phrase determination for AST indicator
  const activeWord = words.find(
    (w, idx) => !cutWordIndices.has(idx) && playheadTime >= w.start && playheadTime <= w.end
  );

  return (
    <div className="h-[220px] bg-[#121318] border-t border-[#262830] flex flex-col text-white shrink-0 select-none z-20">
      {/* ========================================================= */}
      {/* 1. TIMELINE TOOLBAR (36px)                                */}
      {/* ========================================================= */}
      <div className="h-9 border-b border-[#262830] px-4 flex items-center justify-between text-xs bg-[#161820]">
        {/* Left Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSplitAtPlayhead}
            title="Split Clip at Playhead (S)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#22242E] hover:bg-[#2C2E3B] text-zinc-200 hover:text-white transition-all text-[11px] font-bold border border-white/5 cursor-pointer"
          >
            <Scissors className="h-3 w-3 text-[#E84C2B]" />
            <span>Split (S)</span>
          </button>

          <button
            type="button"
            onClick={onToggleSnap}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
              snapEnabled
                ? 'bg-[#E84C2B]/15 text-[#E84C2B] border-[#E84C2B]/40'
                : 'bg-[#22242E] text-zinc-400 border-white/5 hover:text-white'
            }`}
          >
            <Magnet className="h-3 w-3" />
            <span>Snap</span>
          </button>
        </div>

        {/* Center: Active AST Node Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E84C2B] animate-pulse" />
          <span>AST Node:</span>
          <span className="text-zinc-200 font-bold bg-[#22242E] px-2 py-0.5 rounded border border-white/5">
            {activeWord
              ? `#token-${activeWord.word.toLowerCase()} [${activeWord.start.toFixed(1)}s -> ${activeWord.end.toFixed(1)}s]`
              : `#scene-root [00:00 -> ${totalDuration.toFixed(1)}s]`}
          </span>
        </div>

        {/* Right: Zoom & Total Length */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#22242E] rounded-lg p-0.5 border border-white/5">
            <button
              type="button"
              onClick={onZoomOut}
              disabled={timelineZoom <= 1.0}
              title="Zoom Out"
              className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ZoomOut className="h-3 w-3" />
            </button>
            <span className="text-[10px] font-mono text-zinc-300 px-1 font-bold">
              {timelineZoom.toFixed(1)}x
            </span>
            <button
              type="button"
              onClick={onZoomIn}
              disabled={timelineZoom >= 3.0}
              title="Zoom In"
              className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ZoomIn className="h-3 w-3" />
            </button>
          </div>

          <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
            Total: <strong>{totalDuration.toFixed(1)}s</strong>
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TIMELINE TRACKS WITH CORAL PLAYHEAD NEEDLE             */}
      {/* ========================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers (Left Rail: 110px) */}
        <div className="w-28 shrink-0 border-r border-[#262830] bg-[#14151C] flex flex-col divide-y divide-[#262830] text-[11px] font-mono text-zinc-400 font-bold">
          {/* Ruler spacer */}
          <div className="h-6 flex items-center px-2 text-[10px] text-zinc-500">
            TRACKS
          </div>

          {/* V1 Header */}
          <div className="h-9 flex items-center gap-1.5 px-2.5 text-zinc-200">
            <Video className="h-3 w-3 text-indigo-400" />
            <span>V1 Cam</span>
          </div>

          {/* V2 Header */}
          <div className="h-9 flex items-center gap-1.5 px-2.5 text-zinc-200">
            <Film className="h-3 w-3 text-emerald-400" />
            <span>V2 B-Roll</span>
          </div>

          {/* T1 Header */}
          <div className="h-9 flex items-center gap-1.5 px-2.5 text-zinc-200">
            <Type className="h-3 w-3 text-[#E84C2B]" />
            <span>T1 Text</span>
          </div>

          {/* A1 Header */}
          <div className="h-9 flex items-center gap-1.5 px-2.5 text-zinc-200">
            <Volume2 className="h-3 w-3 text-cyan-400" />
            <span>A1 Audio</span>
          </div>
        </div>

        {/* Tracks Canvas + Ruler */}
        <div
          ref={rulerRef}
          onClick={handleTimelineClick}
          className="flex-1 relative flex flex-col bg-[#0F1015] overflow-hidden cursor-crosshair select-none divide-y divide-[#262830]"
        >
          {/* 1. Timecode Ruler (h-6) */}
          <div className="h-6 relative bg-[#181A22] border-b border-[#262830] flex items-center">
            {ticks.map((t) => {
              const tickPercent = (t / totalDuration) * 100;
              if (tickPercent > 100) return null;
              const formatSec = (s: number) => {
                const m = Math.floor(s / 60);
                const sec = Math.floor(s % 60);
                return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
              };

              return (
                <div
                  key={t}
                  className="absolute top-0 bottom-0 flex flex-col justify-end pb-1"
                  style={{ left: `${tickPercent}%` }}
                >
                  <div className="h-2 w-[1px] bg-zinc-600" />
                  <span className="text-[9px] font-mono text-zinc-400 -translate-x-1/2">
                    {formatSec(t)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 2. Track V1: Speaker Cam */}
          <div className="h-9 relative bg-[#12141D] flex items-center px-1">
            {/* Segment blocks */}
            <div className="w-full h-7 rounded-md bg-indigo-950/70 border border-indigo-500/40 flex items-center justify-between px-2 text-[10px] font-mono text-indigo-200">
              <span className="truncate">Active Speaker 9:16 (Face Tracking)</span>
              <span className="text-[9px] text-indigo-400">00:00 - {totalDuration.toFixed(1)}s</span>
            </div>
          </div>

          {/* 3. Track V2: AI B-Roll Overlays */}
          <div className="h-9 relative bg-[#12141D] flex items-center px-1">
            {bRollList
              .filter((b) => b.inTimeline)
              .map((b) => {
                const leftPct = (b.start / totalDuration) * 100;
                const widthPct = (b.duration / totalDuration) * 100;

                return (
                  <div
                    key={b.id}
                    className="absolute h-7 rounded-md bg-emerald-950/80 border border-emerald-500/50 flex items-center px-2 text-[10px] font-mono text-emerald-200 truncate shadow-sm"
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  >
                    <span className="truncate">{b.title}</span>
                  </div>
                );
              })}
          </div>

          {/* 4. Track T1: Captions */}
          <div className="h-9 relative bg-[#12141D] flex items-center px-1 overflow-hidden">
            {words.map((w, idx) => {
              if (cutWordIndices.has(idx)) return null;
              const leftPct = (w.start / totalDuration) * 100;
              const widthPct = Math.max(1, ((w.end - w.start) / totalDuration) * 100);
              const isActive = playheadTime >= w.start && playheadTime <= w.end;

              return (
                <div
                  key={idx}
                  className={`absolute h-6 rounded px-1 flex items-center justify-center text-[9px] font-mono font-bold transition-colors ${
                    isActive
                      ? 'bg-[#E84C2B] text-white shadow-xs z-10'
                      : 'bg-[#2E1A1A] border border-[#E84C2B]/30 text-rose-200/80'
                  }`}
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  title={`${w.word} (${w.start.toFixed(1)}s)`}
                >
                  <span className="truncate">{w.word}</span>
                </div>
              );
            })}
          </div>

          {/* 5. Track A1: Voice Audio Waveform */}
          <div className="h-9 relative bg-[#12141D] flex items-center px-1">
            <div className="w-full h-7 rounded-md bg-cyan-950/50 border border-cyan-500/30 flex items-center gap-0.5 px-2 overflow-hidden">
              {Array.from({ length: 90 }).map((_, i) => {
                const height = Math.abs(Math.sin(i * 0.25) * 18) + 4;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-cyan-400/60 rounded-full"
                    style={{ height: `${height}px` }}
                  />
                );
              })}
            </div>
          </div>

          {/* ======================================================= */}
          {/* DRAGGABLE CORAL PLAYHEAD NEEDLE (#E84C2B)               */}
          {/* ======================================================= */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-30 flex flex-col items-center"
            style={{ left: `${playheadPercent}%` }}
          >
            {/* Playhead Triangular Header */}
            <div className="w-0 h-0 border-x-4 border-x-transparent border-t-[8px] border-t-[#E84C2B] -translate-y-0.5" />
            {/* Playhead Vertical Line */}
            <div className="w-[2px] flex-1 bg-[#E84C2B] shadow-[0_0_8px_rgba(232,76,43,0.8)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
