'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { MOCK_VIRAL_CLIPS, MOCK_BRAND_KIT } from '@/lib/mock-data';
import type { GeneratedClipResponse, WordTiming, AspectRatio } from '@frameflow/shared';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Download,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Scissors,
  Crop,
  Layers,
  Volume2,
  Type,
  Video,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  Trash2,
  Plus,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Smartphone,
  ShieldCheck,
  Sparkle,
  Image as ImageIcon,
  Flame,
  Clock,
  Edit2,
  Split,
  MessageSquare,
} from 'lucide-react';

type CaptionPresetType = 'Hormozi Pop' | 'Karaoke' | 'Minimal';
type CaptionPositionType = 'Top' | 'Center' | 'Bottom';
type ReframeModeType = 'Auto-Speaker' | 'Manual Crop';

interface BRollSuggestion {
  id: string;
  title: string;
  duration: number;
  thumbnailUrl: string;
  inTimeline: boolean;
}

const DEFAULT_BROLL: BRollSuggestion[] = [
  {
    id: 'br-1',
    title: 'Silicon Wafer Macro 4K',
    duration: 3.5,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    inTimeline: true,
  },
  {
    id: 'br-2',
    title: 'Data Center Liquid Cooling',
    duration: 4.0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
    inTimeline: false,
  },
  {
    id: 'br-3',
    title: 'Photonic Lightwave Animation',
    duration: 2.8,
    thumbnailUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=400&q=80',
    inTimeline: false,
  },
];

export default function StudioEditorPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const clipId = (params?.clipId as string) || MOCK_VIRAL_CLIPS[0].id;

  const clip: GeneratedClipResponse =
    MOCK_VIRAL_CLIPS.find((c) => c.id === clipId) || MOCK_VIRAL_CLIPS[0];

  // 1. Top Bar State
  const [shortTitle, setShortTitle] = useState(clip.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [undoStack, setUndoStack] = useState<string[]>([clip.title]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [exportNotice, setExportNotice] = useState(false);

  // 2. Playhead & Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadTime, setPlayheadTime] = useState(0.0);
  const clipDuration = clip.duration; // e.g. 36.5s

  // 3. Transcript & Word Cut State
  const initialWords = clip.timelineDocument?.tracks?.[0]?.clips?.[0]?.words || [];
  const [wordsList, setWordsList] = useState<WordTiming[]>(initialWords);
  const [cutWordIndices, setCutWordIndices] = useState<Set<number>>(new Set());
  const [removeSilences, setRemoveSilences] = useState(false);
  const [removeFillers, setRemoveFillers] = useState(false);
  const [captionPreset, setCaptionPreset] = useState<CaptionPresetType>('Hormozi Pop');
  const [captionPosition, setCaptionPosition] = useState<CaptionPositionType>('Bottom');

  // 4. Center Stage Controls
  const [safeZoneOverlay, setSafeZoneOverlay] = useState(true);
  const [reframeMode, setReframeMode] = useState<ReframeModeType>('Auto-Speaker');

  // 5. Right Pane: Brand Kit, Hook Banner & B-Roll
  const [brandKitActive, setBrandKitActive] = useState(true);
  const [hookBannerActive, setHookBannerActive] = useState(true);
  const [hookBannerText, setHookBannerText] = useState('THE SECRET NOBODY WILL ADMIT 💥');
  const [bRollList, setBRollList] = useState<BRollSuggestion[]>(DEFAULT_BROLL);

  // 6. Bottom Timeline State
  const [timelineZoom, setTimelineZoom] = useState(1.0); // 1x to 4x
  const timelineScrubberRef = useRef<HTMLDivElement>(null);

  // Real-time Playback Timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setPlayheadTime((prev) => {
        const next = prev + 0.1;
        if (next >= clipDuration) {
          return 0; // loop
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, clipDuration]);

  // Keyboard shortcut listener for Space (play/pause), Ctrl+Z (undo), Ctrl+Y (redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack]);

  const handleUndo = () => {
    if (undoStack.length <= 1) return;
    const current = undoStack[undoStack.length - 1];
    const previous = undoStack[undoStack.length - 2];
    setRedoStack((r) => [...r, current]);
    setUndoStack((u) => u.slice(0, -1));
    setShortTitle(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((r) => r.slice(0, -1));
    setUndoStack((u) => [...u, next]);
    setShortTitle(next);
  };

  const handleTitleChange = (newVal: string) => {
    setShortTitle(newVal);
    setUndoStack((u) => [...u, newVal]);
  };

  const toggleWordCut = (index: number) => {
    setCutWordIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleWordClick = (startSec: number) => {
    setPlayheadTime(startSec);
  };

  const toggleBRoll = (id: string) => {
    setBRollList((prev) =>
      prev.map((b) => (b.id === id ? { ...b, inTimeline: !b.inTimeline } : b))
    );
  };

  const handleExport = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2500);
  };

  // Timeline scrub click
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineScrubberRef.current) return;
    const rect = timelineScrubberRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    setPlayheadTime(percentage * clipDuration);
  };

  // Find currently spoken word
  const activeWord = wordsList.find(
    (w, idx) => !cutWordIndices.has(idx) && playheadTime >= w.start && playheadTime <= w.end
  );

  return (
    <div className="flex flex-col h-[100dvh] w-screen overflow-hidden bg-[#09090B] text-[#F8FAFC] select-none">
      {/* ======================================================== */}
      {/* ZONE 1: TOP BAR (48px)                                   */}
      {/* ======================================================== */}
      <header className="h-12 shrink-0 border-b border-[#27272A] bg-[#111114] px-4 flex items-center justify-between z-30">
        {/* Left: Back & Editable Short Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/projects/${clip.projectId}`}
            className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline font-medium">Clips</span>
          </Link>

          <span className="text-[#3F3F46]">•</span>

          {/* Editable Title */}
          {isEditingTitle ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={shortTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingTitle(false);
                }}
                className="rounded border border-[#6366F1] bg-[#18181C] px-2 py-0.5 text-xs font-semibold text-white focus:outline-none max-w-sm"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsEditingTitle(false)}
                className="text-emerald-400 p-1"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center gap-1.5 group cursor-pointer max-w-md truncate"
            >
              <span className="text-xs font-semibold text-white truncate">{shortTitle}</span>
              <Edit2 className="h-3 w-3 text-[#71717A] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}

          <span className="virality-badge text-[10px] hidden md:inline-flex">
            Score: {clip.viralityScore}
          </span>
        </div>

        {/* Center: Undo / Redo & Aspect Switcher */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center rounded-lg border border-[#27272A] bg-[#18181C] p-0.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoStack.length <= 1}
              className="p-1 rounded text-[#94A3B8] hover:text-white hover:bg-[#222228] disabled:opacity-30 disabled:hover:bg-transparent"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1 rounded text-[#94A3B8] hover:text-white hover:bg-[#222228] disabled:opacity-30 disabled:hover:bg-transparent"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Aspect Ratio Switcher */}
          <div className="flex items-center rounded-lg border border-[#27272A] bg-[#18181C] p-0.5 text-[11px] font-mono">
            {(['9:16', '1:1', '16:9'] as const).map((aspect) => (
              <button
                key={aspect}
                type="button"
                onClick={() => setAspectRatio(aspect)}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  aspectRatio === aspect
                    ? 'bg-[#6366F1] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {aspect}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Export 1080p CTA */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] px-3 py-1 text-xs font-semibold text-white shadow-sm transition-all active:scale-[0.98]"
          >
            {exportNotice ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                <span>Export Queued</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>Export 1080p</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MIDDLE WORKSPACE (3 PANES: LEFT, CENTER, RIGHT)          */}
      {/* ======================================================== */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* ======================================================== */}
        {/* ZONE 2: LEFT PANE (320px) — Transcript & Caption Styler  */}
        {/* ======================================================== */}
        <aside className="w-80 shrink-0 border-r border-[#27272A] bg-[#111114] flex flex-col z-20">
          <div className="p-3 border-b border-[#27272A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-indigo-400" />
              <h2 className="text-xs font-semibold text-white">Transcript & Subtitles</h2>
            </div>
            <span className="text-[10px] font-mono text-[#71717A] tabular-nums">
              {wordsList.length - cutWordIndices.size} active tokens
            </span>
          </div>

          {/* AI Silence & Filler Word Cleaner */}
          <div className="p-3 border-b border-[#27272A] space-y-2 bg-[#141418]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#94A3B8]">Remove Silences ({'>'}0.5s)</span>
              <button
                type="button"
                onClick={() => setRemoveSilences(!removeSilences)}
                className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors ${
                  removeSilences ? 'bg-emerald-500' : 'bg-[#27272A]'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform mt-0.5 ml-0.5 ${
                    removeSilences ? 'translate-x-3' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#94A3B8]">Remove Filler Words (um, uh)</span>
              <button
                type="button"
                onClick={() => setRemoveFillers(!removeFillers)}
                className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors ${
                  removeFillers ? 'bg-indigo-500' : 'bg-[#27272A]'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform mt-0.5 ml-0.5 ${
                    removeFillers ? 'translate-x-3' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Interactive Word-by-Word Transcript Flow */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
            <p className="text-[10px] text-[#71717A] font-mono uppercase tracking-wider">
              Click word to seek · Click trash to cut
            </p>
            <div className="flex flex-wrap gap-1.5 leading-relaxed">
              {wordsList.map((item, index) => {
                const isCut = cutWordIndices.has(index);
                const isCurrent =
                  !isCut && playheadTime >= item.start && playheadTime <= item.end;

                return (
                  <span
                    key={index}
                    className={`group/word inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-mono transition-colors ${
                      isCut
                        ? 'line-through text-[#71717A] bg-[#18181C]/40 border border-[#27272A]/50'
                        : isCurrent
                        ? 'bg-[#6366F1] text-white font-bold shadow-sm'
                        : item.highlighted
                        ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30'
                        : 'bg-[#18181C] text-[#F8FAFC] border border-[#27272A] hover:border-[#3F3F46]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleWordClick(item.start)}
                      className="text-left"
                    >
                      {item.word}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWordCut(index);
                      }}
                      className="opacity-0 group-hover/word:opacity-100 text-[#71717A] hover:text-red-400 ml-0.5"
                      title={isCut ? 'Restore word' : 'Cut word from timeline'}
                    >
                      <Scissors className="h-2.5 w-2.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Caption Style Preset Cards & Position */}
          <div className="p-3 border-t border-[#27272A] bg-[#141418] space-y-3">
            <span className="text-[11px] font-semibold text-white block">Caption Preset</span>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Hormozi Pop', 'Karaoke', 'Minimal'] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCaptionPreset(preset)}
                  className={`rounded-lg p-2 text-center text-xs font-medium border transition-all ${
                    captionPreset === preset
                      ? 'border-[#6366F1] bg-[#18181C] text-white ring-1 ring-[#6366F1]'
                      : 'border-[#27272A] bg-[#111114] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <span className="block text-[11px] font-bold">{preset}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] text-[#94A3B8]">Position</span>
              <div className="flex gap-1">
                {(['Top', 'Center', 'Bottom'] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setCaptionPosition(pos)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      captionPosition === pos
                        ? 'bg-[#6366F1] text-white'
                        : 'bg-[#18181C] text-[#94A3B8] border border-[#27272A]'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* ZONE 3: CENTER STAGE — 9:16 Vertical Canvas              */}
        {/* ======================================================== */}
        <main className="flex-1 bg-[#09090B] flex flex-col items-center justify-center p-4 relative overflow-hidden">
          {/* Top Quick Theater Toggles */}
          <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSafeZoneOverlay(!safeZoneOverlay)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-mono border transition-colors ${
                  safeZoneOverlay
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-[#111114] border-[#27272A] text-[#94A3B8]'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Safe Zones: {safeZoneOverlay ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setReframeMode(reframeMode === 'Auto-Speaker' ? 'Manual Crop' : 'Auto-Speaker')
                }
                className="flex items-center gap-1.5 rounded-lg bg-[#111114] border border-[#27272A] px-2.5 py-1 text-[11px] font-mono text-[#F8FAFC] hover:border-[#3F3F46]"
              >
                <Crop className="h-3.5 w-3.5 text-indigo-400" />
                <span>{reframeMode}</span>
              </button>
            </div>

            <div className="flex items-center gap-1 text-xs font-mono tabular-nums text-white bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
              <span className="text-emerald-400">{playheadTime.toFixed(2)}s</span>
              <span className="text-[#71717A]">/</span>
              <span>{clipDuration.toFixed(2)}s</span>
            </div>
          </div>

          {/* 9:16 Dark Theater Frame Container */}
          <div
            className={`relative aspect-[9/16] h-[92%] max-h-[580px] rounded-2xl bg-black border-2 border-[#27272A] overflow-hidden shadow-2xl flex flex-col justify-between`}
          >
            {/* Background Source Video Simulation */}
            <img
              src="https://images.unsplash.com/photo-1534972195531-a756b11269d5?auto=format&fit=crop&w=720&q=80"
              alt="Video Preview"
              className="absolute inset-0 h-full w-full object-cover opacity-90"
            />

            {/* Simulated Speaker Tracking Bounding Box */}
            {reframeMode === 'Auto-Speaker' && (
              <div className="absolute top-[26%] left-[20%] w-[60%] h-[36%] border-2 border-emerald-400/80 rounded-xl pointer-events-none z-10 transition-all">
                <span className="absolute -top-5 left-1 rounded bg-black/80 px-1.5 py-0.2 text-[9px] font-mono text-emerald-400">
                  Target: Dr. Vance (99% Conf)
                </span>
              </div>
            )}

            {/* Viral Top Hook Banner */}
            {hookBannerActive && (
              <div className="relative z-20 m-3 rounded-lg bg-black/85 backdrop-blur-md border border-white/15 px-3 py-1.5 text-center shadow-lg">
                <p className="text-[11px] font-black tracking-wide text-white font-mono">
                  {hookBannerText}
                </p>
              </div>
            )}

            {/* Brand Kit Watermark (Top Right) */}
            {brandKitActive && (
              <div className="absolute top-12 right-3 z-20">
                <div className="flex items-center gap-1 rounded bg-black/60 backdrop-blur-sm px-2 py-0.5 border border-white/10 text-[9px] font-bold text-white font-mono">
                  FRAMEFLOW
                </div>
              </div>
            )}

            {/* TikTok / Reels / Shorts Safe Zones Overlay */}
            {safeZoneOverlay && (
              <div className="absolute inset-0 pointer-events-none z-10 border border-red-500/30 flex flex-col justify-between p-2">
                <div className="text-[9px] font-mono text-red-400/60 uppercase tracking-widest text-center">
                  --- Top UI Danger Zone (Avoid Text) ---
                </div>

                {/* Right Side Icons Simulation */}
                <div className="self-end space-y-4 pr-1 text-white/50 text-right">
                  <div className="h-6 w-6 rounded-full bg-white/20 ml-auto" />
                  <div className="h-6 w-6 rounded-full bg-white/20 ml-auto" />
                  <div className="h-6 w-6 rounded-full bg-white/20 ml-auto" />
                </div>

                <div className="text-[9px] font-mono text-red-400/60 uppercase tracking-widest text-center">
                  --- Bottom Description & Sound Bar Safe Zone ---
                </div>
              </div>
            )}

            {/* Dynamic Overlaid Captions */}
            <div
              className={`relative z-20 px-4 text-center pointer-events-none transition-all ${
                captionPosition === 'Top'
                  ? 'mt-8 mb-auto'
                  : captionPosition === 'Center'
                  ? 'my-auto'
                  : 'mb-16 mt-auto'
              }`}
            >
              {captionPreset === 'Hormozi Pop' && (
                <div className="inline-block transform -rotate-1 rounded-md bg-black/85 px-3 py-1.5 shadow-xl border border-white/15">
                  <span className="text-base sm:text-lg font-black tracking-wider uppercase font-mono text-emerald-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                    {activeWord?.word || 'COMPLETELY VANISH'}
                  </span>
                </div>
              )}

              {captionPreset === 'Karaoke' && (
                <div className="inline-block rounded-lg bg-indigo-600/90 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                  {activeWord ? `▶ ${activeWord.word}` : 'Watching AI Hardware...'}
                </div>
              )}

              {captionPreset === 'Minimal' && (
                <div className="inline-block rounded bg-black/60 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white shadow">
                  {activeWord?.word || 'Watching AI Hardware...'}
                </div>
              )}
            </div>

            {/* Canvas Playback Overlay Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20 bg-black/20">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6366F1] text-white shadow-xl hover:scale-110 active:scale-95 transition-transform"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
              </button>
            </div>
          </div>
        </main>

        {/* ======================================================== */}
        {/* ZONE 4: RIGHT PANE (280px) — Brand Kit, B-Roll & Hook    */}
        {/* ======================================================== */}
        <aside className="w-72 shrink-0 border-l border-[#27272A] bg-[#111114] flex flex-col z-20 overflow-y-auto">
          {/* Header */}
          <div className="p-3 border-b border-[#27272A] flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <h2 className="text-xs font-semibold text-white">Brand Kit & Viral Hooks</h2>
          </div>

          <div className="p-3 space-y-5">
            {/* 1. Brand Kit Watermark Switch */}
            <div className="rounded-xl border border-[#27272A] bg-[#18181C] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Brand Watermark</span>
                <button
                  type="button"
                  onClick={() => setBrandKitActive(!brandKitActive)}
                  className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors ${
                    brandKitActive ? 'bg-indigo-500' : 'bg-[#27272A]'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform mt-0.5 ml-0.5 ${
                      brandKitActive ? 'translate-x-3' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[10px] text-[#94A3B8]">
                Shows &quot;FRAMEFLOW&quot; logo watermark anchored to Top-Right.
              </p>
            </div>

            {/* 2. Top Viral Hook Banner */}
            <div className="rounded-xl border border-[#27272A] bg-[#18181C] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Viral Hook Banner</span>
                <button
                  type="button"
                  onClick={() => setHookBannerActive(!hookBannerActive)}
                  className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors ${
                    hookBannerActive ? 'bg-emerald-500' : 'bg-[#27272A]'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform mt-0.5 ml-0.5 ${
                      hookBannerActive ? 'translate-x-3' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <input
                type="text"
                value={hookBannerText}
                onChange={(e) => setHookBannerText(e.target.value)}
                placeholder="Hook Banner Text..."
                className="w-full rounded-lg border border-[#27272A] bg-[#111114] px-2.5 py-1.5 text-[11px] font-mono text-white focus:outline-none focus:border-[#6366F1]"
              />
            </div>

            {/* 3. AI Suggested B-Roll Overlays */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Suggested AI B-Roll</span>
                <span className="text-[10px] font-mono text-indigo-400">Context Matched</span>
              </div>

              <div className="space-y-2">
                {bRollList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2.5 rounded-lg border border-[#27272A] bg-[#18181C] p-2 hover:border-[#3F3F46] transition-colors"
                  >
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="h-10 w-14 object-cover rounded border border-[#27272A] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-white truncate">{item.title}</p>
                      <p className="text-[10px] text-[#71717A] font-mono tabular-nums">
                        {item.duration}s Cutaway
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleBRoll(item.id)}
                      className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors shrink-0 ${
                        item.inTimeline
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-[#111114] text-white border border-[#27272A] hover:bg-[#222228]'
                      }`}
                    >
                      {item.inTimeline ? 'Added' : '+ Insert'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ======================================================== */}
      {/* ZONE 5: BOTTOM PANE (220px) — Compact Multi-Track Timeline */}
      {/* ======================================================== */}
      <footer className="h-56 shrink-0 border-t border-[#27272A] bg-[#111114] flex flex-col z-30">
        {/* Timeline Transport Bar (Scrub, Play, Zoom) */}
        <div className="h-9 shrink-0 border-b border-[#27272A] px-4 flex items-center justify-between bg-[#141418]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex h-6 w-6 items-center justify-center rounded bg-[#6366F1] text-white hover:bg-[#4F46E5] transition-colors"
              title="Spacebar to Play/Pause"
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 ml-0.2" />}
            </button>

            <button
              type="button"
              onClick={() => setPlayheadTime(0)}
              className="text-[#94A3B8] hover:text-white"
              title="Return to 00:00"
            >
              <RotateCcw className="h-3 w-3" />
            </button>

            <span className="text-xs font-mono font-semibold text-white tabular-nums">
              00:{playheadTime < 10 ? '0' : ''}{playheadTime.toFixed(2)} / 00:{clipDuration.toFixed(2)}
            </span>
          </div>

          {/* Zoom Slider */}
          <div className="flex items-center gap-2">
            <ZoomOut className="h-3 w-3 text-[#71717A]" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.5"
              value={timelineZoom}
              onChange={(e) => setTimelineZoom(parseFloat(e.target.value))}
              className="h-1.5 w-24 cursor-pointer accent-[#6366F1]"
            />
            <ZoomIn className="h-3 w-3 text-[#71717A]" />
            <span className="text-[10px] font-mono text-[#71717A] tabular-nums">
              {timelineZoom}x
            </span>
          </div>
        </div>

        {/* Tracks Area */}
        <div
          ref={timelineScrubberRef}
          onClick={handleTimelineClick}
          className="flex-1 p-2 space-y-1.5 overflow-x-auto relative cursor-pointer"
        >
          {/* Vertical Playhead Cursor Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#6366F1] z-40 pointer-events-none transition-all duration-75"
            style={{
              left: `${(playheadTime / clipDuration) * 100}%`,
            }}
          >
            <div className="h-2.5 w-2.5 -ml-1 -top-1 bg-[#6366F1] transform rotate-45 rounded-xs" />
          </div>

          {/* Track 1: Video Track */}
          <div className="h-9 rounded-md bg-[#18181C] border border-[#27272A] flex items-center px-3 relative overflow-hidden">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-blue-300 w-20 shrink-0 z-10">
              <Video className="h-3 w-3" />
              <span>Video</span>
            </div>
            <div className="flex-1 h-6 rounded bg-blue-900/50 border border-blue-500/40 flex items-center px-2 text-[10px] font-mono text-blue-200 truncate">
              {clip.title} (0.0s - {clip.duration.toFixed(1)}s)
            </div>
          </div>

          {/* Track 2: B-Roll Cutaway Track */}
          <div className="h-9 rounded-md bg-[#18181C] border border-[#27272A] flex items-center px-3 relative overflow-hidden">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-300 w-20 shrink-0 z-10">
              <Layers className="h-3 w-3" />
              <span>B-Roll</span>
            </div>
            <div className="flex-1 h-6 flex items-center gap-2">
              {bRollList
                .filter((b) => b.inTimeline)
                .map((b) => (
                  <div
                    key={b.id}
                    className="h-6 rounded bg-amber-950/60 border border-amber-500/40 px-2 flex items-center text-[10px] font-mono text-amber-200 truncate"
                  >
                    {b.title} ({b.duration}s)
                  </div>
                ))}
            </div>
          </div>

          {/* Track 3: Word-Level Caption Track */}
          <div className="h-9 rounded-md bg-[#18181C] border border-[#27272A] flex items-center px-3 relative overflow-hidden">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-purple-300 w-20 shrink-0 z-10">
              <Type className="h-3 w-3" />
              <span>Captions</span>
            </div>
            <div className="flex-1 h-6 flex items-center gap-0.5 overflow-hidden">
              {wordsList.map((w, idx) => (
                <div
                  key={idx}
                  className={`h-5 rounded px-1 flex items-center text-[9px] font-mono truncate ${
                    cutWordIndices.has(idx)
                      ? 'bg-zinc-800 text-zinc-500 line-through'
                      : w.highlighted
                      ? 'bg-emerald-500/40 text-emerald-200 font-bold border border-emerald-500/60'
                      : 'bg-purple-900/40 text-purple-200 border border-purple-500/20'
                  }`}
                  style={{ width: `${Math.max(28, (w.end - w.start) * 45 * timelineZoom)}px` }}
                >
                  {w.word}
                </div>
              ))}
            </div>
          </div>

          {/* Track 4: Audio Track */}
          <div className="h-9 rounded-md bg-[#18181C] border border-[#27272A] flex items-center px-3 relative overflow-hidden">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-teal-300 w-20 shrink-0 z-10">
              <Volume2 className="h-3 w-3" />
              <span>Audio</span>
            </div>
            <div className="flex-1 h-6 rounded bg-teal-950/50 border border-teal-500/30 flex items-center px-2">
              {/* Simulated Speech Waveform bars */}
              <div className="flex items-center gap-0.5 w-full h-4 opacity-70">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-teal-400 rounded-full"
                    style={{
                      height: `${Math.max(2, Math.sin(i * 0.5) * 12 + 6)}px`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
