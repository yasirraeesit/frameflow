'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Scissors,
  RotateCcw,
  ArrowRight,
  Sliders,
  Volume2,
  Film,
  Type,
  Layers,
  Sparkles,
  Shield,
  Smartphone,
  Eye,
  EyeOff,
} from 'lucide-react';

export function AsymmetricWorkflowShowcase(): JSX.Element {
  // Transcript strike-out states
  const [cutWord1, setCutWord1] = useState(false);
  const [cutWord2, setCutWord2] = useState(false);

  // Safe zone toggle state
  const [showSafeZones, setShowSafeZones] = useState(false);

  // Undo notification state
  const [undoToast, setUndoToast] = useState(false);

  const handleUndo = () => {
    setCutWord1(false);
    setCutWord2(false);
    setUndoToast(true);
    setTimeout(() => setUndoToast(false), 2000);
  };

  // Base length: 44.0s. Word 1 trims 1.8s, Word 2 trims 1.4s.
  const cutSeconds = (cutWord1 ? 1.8 : 0) + (cutWord2 ? 1.4 : 0);
  const currentDuration = (44.0 - cutSeconds).toFixed(1);

  return (
    <section id="editor" className="border-t border-[#E6E4DD] bg-[#FAF9F5] py-20 lg:py-28 text-[#14151A] scroll-mt-16">
      <div id="how-it-works" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* ========================================================= */}
          {/* LEFT STICKY COLUMN (40% / 5 cols)                         */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E6E4DD] bg-white px-3.5 py-1 text-xs font-mono tracking-wider uppercase text-[#E84C2B] shadow-2xs">
                <Sliders className="h-3.5 w-3.5" />
                <span>TEXT & TIMELINE WORKFLOW</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.035em] text-[#14151A] leading-tight">
                Cut video like a Google Doc{' '}
                <span className="font-editorial text-[#E84C2B] font-normal italic text-4xl sm:text-5xl block sm:inline">
                  (or tweak every frame).
                </span>
              </h2>

              <p className="text-[15px] text-[#52545E] leading-relaxed max-w-[44ch]">
                Other clippers give you an uneditable black box. We give you a doc where deleting filler text cuts the video, backed by an actual non-destructive timeline when you want frame-perfect control.
              </p>
            </div>

            {/* Workflow Steps with Monospace Badges */}
            <div className="space-y-6 border-l-2 border-[#E6E4DD] pl-6 ml-2">
              {/* Step 01 */}
              <div className="space-y-1 relative">
                <span className="absolute -left-[33px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-[#E84C2B] text-[10px] font-mono font-bold text-[#E84C2B] shadow-2xs">
                  01
                </span>
                <h3 className="text-sm font-bold font-mono tracking-wide text-[#14151A] uppercase">
                  Fast Ingest & Word Timestamps
                </h3>
                <p className="text-xs text-[#52545E] leading-relaxed">
                  Drop a 60-minute video or paste a YouTube URL. Whisper extracts every word with sub-second timestamps and marks filler pauses.
                </p>
              </div>

              {/* Step 02 */}
              <div className="space-y-1 relative">
                <span className="absolute -left-[33px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-[#DCDAD2] text-[10px] font-mono font-bold text-[#52545E] shadow-2xs">
                  02
                </span>
                <h3 className="text-sm font-bold font-mono tracking-wide text-[#14151A] uppercase">
                  Viral Hook Discovery
                </h3>
                <p className="text-xs text-[#52545E] leading-relaxed">
                  Intelligent multimodal scoring scores tension, pacing, and retention slope to isolate the 15 strongest standalone shorts.
                </p>
              </div>

              {/* Step 03 */}
              <div className="space-y-1 relative">
                <span className="absolute -left-[33px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-[#DCDAD2] text-[10px] font-mono font-bold text-[#52545E] shadow-2xs">
                  03
                </span>
                <h3 className="text-sm font-bold font-mono tracking-wide text-[#14151A] uppercase">
                  Delete Words or Drag Timeline
                </h3>
                <p className="text-xs text-[#52545E] leading-relaxed">
                  Delete filler words directly in the text to trim footage. Drag handles on video, B-roll, and audio tracks for surgical polish.
                </p>
              </div>
            </div>

            <Link
              href="/editor/e1011111-1111-4111-8111-111111111111"
              className="inline-flex items-center gap-2 rounded-xl bg-[#14151A] hover:bg-[#252732] text-white px-5 py-3 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <span>Test Interactive Studio Editor</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#E84C2B]" />
            </Link>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: 60% Layered Interactive Showcase            */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. INTERACTIVE TRANSCRIPT CUT EDITOR (Crisp Light Card) */}
            <div className="rounded-2xl border border-[#E6E4DD] bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(20,21,26,0.04)] space-y-4">
              {/* Window Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E4DD] pb-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#E6E4DD]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#E6E4DD]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#E6E4DD]" />
                  </div>
                  <span className="font-mono text-[#14151A] font-bold text-[11px] uppercase tracking-wider">
                    INTERACTIVE TRANSCRIPT EDITOR
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px]">
                  {/* Safe Zone Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowSafeZones(!showSafeZones)}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-colors cursor-pointer ${
                      showSafeZones
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        : 'bg-[#FAF9F5] text-[#52545E] border border-[#E6E4DD] hover:text-[#14151A]'
                    }`}
                  >
                    <Smartphone className="h-3 w-3" />
                    <span>{showSafeZones ? 'Safe Zones ON' : 'Show Safe Zones'}</span>
                  </button>

                  {cutSeconds > 0 ? (
                    <span className="text-[#E84C2B] font-bold bg-[#E84C2B]/10 border border-[#E84C2B]/30 px-2 py-0.5 rounded-md animate-pulse">
                      -{cutSeconds.toFixed(1)}s trimmed
                    </span>
                  ) : (
                    <span className="text-[#8C8E9A] hidden sm:inline">Click words to strike</span>
                  )}
                  <span className="rounded bg-[#FAF9F5] border border-[#E6E4DD] px-2 py-0.5 text-[#14151A] font-bold tabular-nums">
                    {currentDuration}s duration
                  </span>
                </div>
              </div>

              {/* Clickable Word Transcript Card */}
              <div className="rounded-xl border border-[#E6E4DD] bg-[#FAF9F5] p-4 sm:p-5 select-none space-y-3">
                <div className="flex items-center justify-between text-[11px] text-[#52545E] border-b border-[#E6E4DD] pb-2">
                  <span className="font-mono text-[#8C8E9A]">SPEAKER 01 • FOUNDER INTERVIEW</span>
                  <span className="text-[#E84C2B] font-medium flex items-center gap-1">
                    <Scissors className="h-3 w-3" />
                    Click highlighted filler words to strike out & trim video
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-sm sm:text-base font-mono leading-relaxed text-[#14151A]">
                  <span>So what happened is</span>

                  {/* Interactive Filler Word 1 ("um, sort of like") */}
                  <button
                    type="button"
                    onClick={() => setCutWord1(!cutWord1)}
                    className={`relative rounded px-1.5 py-0.5 font-bold transition-all cursor-pointer ${
                      cutWord1
                        ? 'bg-rose-100 text-rose-700 line-through border border-rose-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                    }`}
                    title="Click to strike out and trim footage"
                  >
                    <span>&ldquo;um, sort of like&rdquo;</span>
                  </button>

                  <span>we realized our viewer retention fell off a cliff,</span>

                  {/* Interactive Filler Word 2 ("you know what I mean") */}
                  <button
                    type="button"
                    onClick={() => setCutWord2(!cutWord2)}
                    className={`relative rounded px-1.5 py-0.5 font-bold transition-all cursor-pointer ${
                      cutWord2
                        ? 'bg-rose-100 text-rose-700 line-through border border-rose-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                    }`}
                    title="Click to strike out and trim footage"
                  >
                    <span>&ldquo;you know what I mean&rdquo;</span>
                  </button>

                  <span>right at the 12-second mark. The moment we killed the rambling, retention skyrocketed.</span>
                </div>
              </div>

              {/* Action and Undo Bar */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUndo}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6E4DD] bg-white hover:bg-[#FAF9F5] px-3 py-1.5 text-xs font-semibold text-[#14151A] transition-colors shadow-2xs cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-[#52545E]" />
                    <span>Undo (Ctrl+Z)</span>
                  </button>
                  {undoToast && (
                    <span className="text-[11px] font-mono text-emerald-600 font-semibold animate-pulse">
                      ✓ Words restored to timeline
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-mono text-[#8C8E9A]">
                  Zero re-encode delay • Synchronized in real time
                </span>
              </div>
            </div>

            {/* 2. SYNCHRONIZED MULTI-TRACK TIMELINE (Dark Frame so Tracks Pop) */}
            <div className="rounded-2xl border border-[#2A2B35] bg-[#121318] p-5 shadow-xl text-white space-y-4 relative overflow-hidden">
              {/* Safe Zone Visual Overlays when toggled */}
              {showSafeZones && (
                <div className="absolute inset-x-5 top-12 bottom-12 border-2 border-dashed border-emerald-400/40 rounded-xl pointer-events-none flex flex-col justify-between p-2 z-20">
                  <span className="text-[9px] font-mono text-emerald-400 font-bold bg-black/70 px-1.5 py-0.5 rounded self-start">
                    TikTok/Reels Safe Zone Active
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold bg-black/70 px-1.5 py-0.5 rounded self-end">
                    Unobstructed from Engagement Icons
                  </span>
                </div>
              )}

              {/* Timeline Header */}
              <div className="flex items-center justify-between border-b border-[#242530] pb-2.5 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#E84C2B]" />
                  <span className="text-zinc-200 font-bold uppercase tracking-wider text-[11px]">
                    MULTI-TRACK TIMELINE (NON-DESTRUCTIVE)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-zinc-400">PLAYHEAD:</span>
                  <span className="rounded bg-[#1E202A] px-2 py-0.5 text-[#E84C2B] font-bold tabular-nums">
                    00:14.22
                  </span>
                  <span className="text-emerald-400 font-bold tabular-nums">
                    {currentDuration}s
                  </span>
                </div>
              </div>

              {/* Timeline Tracks */}
              <div className="space-y-2 select-none">
                {/* Track 1: B-Roll Overlay (V2) */}
                <div className="flex items-center gap-2.5">
                  <div className="w-16 flex items-center gap-1 text-[10px] font-mono text-zinc-400 shrink-0">
                    <Film className="h-3 w-3 text-purple-400" />
                    <span>V2 B-Roll</span>
                  </div>
                  <div className="relative flex-1 h-7 rounded-lg bg-[#1A1B23] border border-[#2A2B35] overflow-hidden">
                    <div
                      className="absolute top-1 bottom-1 rounded bg-purple-500/25 border border-purple-400/50 flex items-center px-2 text-[9px] font-mono text-purple-200 font-semibold"
                      style={{ left: '15%', width: '38%' }}
                    >
                      B-Roll: retention_graph.mp4
                    </div>
                  </div>
                </div>

                {/* Track 2: Primary Video (V1) - Dynamically Trims! */}
                <div className="flex items-center gap-2.5">
                  <div className="w-16 flex items-center gap-1 text-[10px] font-mono text-zinc-400 shrink-0">
                    <Film className="h-3 w-3 text-[#E84C2B]" />
                    <span>V1 Video</span>
                  </div>
                  <div className="relative flex-1 h-8 rounded-lg bg-[#1A1B23] border border-[#2A2B35] overflow-hidden">
                    <div
                      className="absolute top-1 bottom-1 rounded bg-[#E84C2B]/30 border border-[#E84C2B] flex items-center justify-between px-2 text-[10px] font-mono text-white font-bold transition-all duration-300"
                      style={{
                        left: '4%',
                        width: cutSeconds > 0 ? '76%' : '88%',
                      }}
                    >
                      <span>Speaker_01_9x16_crop</span>
                      {cutSeconds > 0 && (
                        <span className="text-[9px] text-[#E84C2B] bg-black/70 px-1 rounded font-normal">
                          Cut applied (-{cutSeconds.toFixed(1)}s)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Track 3: Captions Track (T1) */}
                <div className="flex items-center gap-2.5">
                  <div className="w-16 flex items-center gap-1 text-[10px] font-mono text-zinc-400 shrink-0">
                    <Type className="h-3 w-3 text-emerald-400" />
                    <span>T1 Text</span>
                  </div>
                  <div className="relative flex-1 h-7 rounded-lg bg-[#1A1B23] border border-[#2A2B35] overflow-hidden flex items-center gap-1 px-1">
                    <span className="h-5 rounded bg-emerald-500/20 border border-emerald-500/40 px-1.5 text-[8.5px] font-mono text-emerald-300 flex items-center">
                      Bold Pop Subtitles
                    </span>
                    <span className="h-5 rounded bg-emerald-500/20 border border-emerald-500/40 px-1.5 text-[8.5px] font-mono text-emerald-300 flex items-center">
                      Word Sync
                    </span>
                  </div>
                </div>

                {/* Track 4: Master Audio (A1) */}
                <div className="flex items-center gap-2.5">
                  <div className="w-16 flex items-center gap-1 text-[10px] font-mono text-zinc-400 shrink-0">
                    <Volume2 className="h-3 w-3 text-[#10B981]" />
                    <span>A1 Audio</span>
                  </div>
                  <div className="relative flex-1 h-7 rounded-lg bg-[#1A1B23] border border-[#2A2B35] flex items-center px-2 gap-0.5 overflow-hidden">
                    {/* Simulated Waveform Bars */}
                    {Array.from({ length: 48 }).map((_, i) => {
                      const heights = [2, 4, 8, 14, 18, 12, 6, 16, 20, 14, 8, 4];
                      const h = heights[i % heights.length];
                      return (
                        <span
                          key={i}
                          className="w-1 rounded-full bg-emerald-400/70"
                          style={{ height: `${h}px` }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Scrubber Ruler */}
              <div className="pt-2 border-t border-[#242530] flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>00:00</span>
                <span>00:15</span>
                <span className="text-[#E84C2B]">00:30</span>
                <span>00:45</span>
                <span>01:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
