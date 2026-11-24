'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MOCK_PROJECTS, MockProject } from '@/lib/mock-data';
import { apiFetch } from '@/lib/api';
import {
  Link as LinkIcon,
  UploadCloud,
  Film,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  Sliders,
  SlidersHorizontal,
  Scissors,
  Check,
  Play,
  Layers,
  ChevronRight,
  Radio,
  Gamepad2,
  Zap,
  ShieldCheck,
  Video,
  Mic,
  AlertCircle,
} from 'lucide-react';

function sanitizeVideoUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (url.pathname === '/watch') {
        const v = url.searchParams.get('v');
        return v ? `https://www.youtube.com/watch?v=${v}` : trimmed;
      }
      url.search = '';
      return url.toString().replace(/\/$/, '');
    }
    if (host === 'youtu.be') {
      url.search = '';
      return url.toString().replace(/\/$/, '');
    }
    return trimmed;
  } catch {
    return trimmed;
  }
}

function parseTimestampToSeconds(ts: string): number {
  const parts = ts.trim().split(':').map((p) => parseFloat(p) || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

type InputMode = 'url' | 'upload';
type SourceType = 'original' | 'commentary';
type ContentMode = 'talking_head' | 'gaming';
type ClipLengthOption = 'Auto' | '<30s' | '30–60s' | '60–90s';
type CaptionPresetOption = 'Hormozi Pop' | 'Karaoke Glow' | 'Clean Cinema' | 'Minimal Top' | 'Vice Neon';

export default function DashboardPage(): JSX.Element {
  const router = useRouter();
  const [inputMode, setInputMode] = useState<InputMode>('url');
  const [sourceType, setSourceType] = useState<SourceType>('original');
  const [contentMode, setContentMode] = useState<ContentMode>('talking_head');
  const [layoutMode, setLayoutMode] = useState<'solo' | 'split' | 'screen_cam' | 'gameplay_cam' | 'gameplay_full' | 'auto'>('auto');
  const [videoUrl, setVideoUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedLength, setSelectedLength] = useState<ClipLengthOption>('30–60s');
  const [selectedCaption, setSelectedCaption] = useState<CaptionPresetOption>('Hormozi Pop');
  const [focusPrompt, setFocusPrompt] = useState('');
  const [startTime, setStartTime] = useState('00:00:00');
  const [endTime, setEndTime] = useState('00:58:14');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [insufficientCreditsModal, setInsufficientCreditsModal] = useState<{ required: number; available: number } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const retryUrl = params.get('retryUrl') || params.get('url');
      if (retryUrl) {
        setVideoUrl(retryUrl);
      }
    }
  }, []);

  const lengthOptions: ClipLengthOption[] = ['Auto', '<30s', '30–60s', '60–90s'];

  const GAMING_FOCUS_CHIPS = [
    { label: '5-Star Chases & Stunts', prompt: '5-Star police chases, high-speed vehicle stunts, and near-misses in Vice City' },
    { label: 'Funny Fails & NPC Moments', prompt: 'Hilarious NPC ragdoll glitches, pedestrian dialogues, and chaotic open-world fails' },
    { label: 'Easter Eggs & Secrets', prompt: 'Hidden map secrets, underwater mysteries, and Vice City lore easter eggs' },
    { label: 'Mission Highlights', prompt: 'High-stakes bank heists, sniper shootouts, and cinematic mission climaxes' },
    { label: 'No-Commentary Action', prompt: 'No-commentary gameplay highlights driven by gunfire audio peaks and vehicle engine roars' },
  ];

  const captionTemplates: {
    id: CaptionPresetOption;
    name: string;
    description: string;
    previewBg: string;
    previewText: string;
    highlightWord: string;
    styleSnippet: string;
  }[] = [
    {
      id: 'Hormozi Pop',
      name: 'Hormozi Pop',
      description: 'Bold kinetic pop with high-energy yellow/red keyword highlights.',
      previewBg: 'bg-[#0E0F14]',
      previewText: 'THIS CHANGES',
      highlightWord: 'EVERYTHING',
      styleSnippet: 'text-amber-400 font-black tracking-tight uppercase drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]',
    },
    {
      id: 'Vice Neon',
      name: 'Vice Neon',
      description: 'Electrifying Vice City cyan & hot magenta glow engineered for GTA 6 and high-energy gaming.',
      previewBg: 'bg-[#090514]',
      previewText: '5-STAR CHASE',
      highlightWord: 'ESCAPED',
      styleSnippet: 'text-[#00F0FF] font-black tracking-tight uppercase drop-shadow-[0_0_12px_rgba(0,240,255,0.85)]',
    },
    {
      id: 'Karaoke Glow',
      name: 'Karaoke Glow',
      description: 'Synchronized neon box highlight that follows spoken words.',
      previewBg: 'bg-[#0C0C10]',
      previewText: 'SCALE TO',
      highlightWord: '$10M ARR',
      styleSnippet: 'text-emerald-400 bg-emerald-500/20 px-1 rounded font-bold uppercase',
    },
    {
      id: 'Clean Cinema',
      name: 'Clean Cinema',
      description: 'Editorial sans with balanced drop shadow for documentaries and essays.',
      previewBg: 'bg-[#121318]',
      previewText: 'Silicon physics at',
      highlightWord: 'planetary scale',
      styleSnippet: 'text-white font-medium italic underline decoration-coral decoration-[#E84C2B]/60 underline-offset-2',
    },
    {
      id: 'Minimal Top',
      name: 'Minimal Top',
      description: 'Top-anchored caption pill preserving unobstructed lower footage.',
      previewBg: 'bg-[#0F1015]',
      previewText: 'FOUNDER LESSON:',
      highlightWord: 'DAY ONE PRICING',
      styleSnippet: 'text-zinc-200 font-mono text-[10px] tracking-wide',
    },
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setValidationError(null);

    const cleanUrl = sanitizeVideoUrl(videoUrl);

    // Validate timeframe: end must be greater than start if provided
    if (startTime && endTime) {
      const startSec = parseTimestampToSeconds(startTime);
      const endSec = parseTimestampToSeconds(endTime);
      if (endSec > 0 && endSec <= startSec) {
        setValidationError('Timeframe end must be greater than timeframe start.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const res = await apiFetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: cleanUrl
            ? (contentMode === 'gaming' ? `GTA 6 Gaming (${cleanUrl.slice(-11)})` : `Podcast (${cleanUrl.slice(-11)})`)
            : (contentMode === 'gaming' ? 'GTA 6 Gameplay VOD' : 'Studio Source Video'),
          youtubeUrl: cleanUrl || undefined,
          sourceType,
          contentMode,
          layoutMode: contentMode === 'gaming' && layoutMode === 'auto' ? 'gameplay_cam' : layoutMode,
          timeframeStart: startTime || undefined,
          timeframeEnd: endTime || undefined,
          preferredLength: selectedLength,
          captionPreset: selectedCaption.toLowerCase().replace(/ /g, '_'),
          aiFocusPrompt: focusPrompt || undefined,
          estimatedDurationSec: contentMode === 'gaming' ? 1580 : 300,
          idempotencyKey: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined,
        }),
      });

      if (res.status === 402) {
        const errorData = await res.json().catch(() => ({}));
        setInsufficientCreditsModal({
          required: errorData.required || 5,
          available: errorData.available || 0,
        });
        setIsSubmitting(false);
        return;
      }

      if (res.status === 400) {
        const errorData = await res.json().catch(() => ({}));
        setValidationError(errorData.error || 'Video validation failed. Please check the URL.');
        setIsSubmitting(false);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        const projectId = data.project?.id || (contentMode === 'gaming' ? 'gta6-demo' : 'demo-1');
        router.push(`/projects/${projectId}/processing`);
        return;
      }

      const destId = contentMode === 'gaming' ? 'gta6-demo' : 'demo-1';
      router.push(`/projects/${destId}/processing`);
    } catch (err: unknown) {
      console.warn('[Dashboard] Ingest network error, navigating to demo processing:', err);
      const destId = contentMode === 'gaming' ? 'gta6-demo' : 'demo-1';
      router.push(`/projects/${destId}/processing`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSamplePodcast = () => {
    setContentMode('talking_head');
    setSelectedCaption('Hormozi Pop');
    setVideoUrl('https://www.youtube.com/watch?v=hardware-revolution-elena-vance');
    setFocusPrompt('Focus on the moments where Elena explains hardware margin compression and copper wire physics.');
    setTimeout(() => {
      router.push('/projects/demo-1/processing');
    }, 200);
  };

  const handleSampleGta6 = () => {
    setContentMode('gaming');
    setSelectedCaption('Vice Neon');
    setLayoutMode('gameplay_cam');
    setVideoUrl('https://www.youtube.com/watch?v=gta6-vice-city-26min-gameplay-vod');
    setFocusPrompt('5-Star police chases, high-speed sports car stunts, and funny NPC ragdoll physics');
    setStartTime('00:00:00');
    setEndTime('00:26:40');
    setTimeout(() => {
      router.push('/projects/gta6-demo/processing');
    }, 200);
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-16 text-[#14151A]">
      {/* Page Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E6E4DD] bg-white px-3 py-1 text-xs font-mono text-[#52545E] shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-[#E84C2B] animate-pulse" />
            <span>AI CLIP GENERATOR • OPUS WORKFLOW</span>
          </div>
          <h1 className="text-3xl font-bold tracking-[-0.035em] text-[#14151A]">
            Turn any long video into viral shorts
          </h1>
          <p className="text-sm text-[#52545E] max-w-2xl">
            Drop a YouTube link or raw footage. FrameFlow auto-detects hooks, reframes speakers into 9:16, burns in kinetic captions, and exports cleanly with zero watermarks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleSamplePodcast}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#52545E] hover:text-[#14151A] bg-white hover:bg-[#FAF9F5] border border-[#E6E4DD] px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#E84C2B]" />
            <span>Try 58-min founder podcast</span>
            <ArrowRight className="h-3 w-3" />
          </button>

          <button
            type="button"
            onClick={handleSampleGta6}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00F0FF] bg-[#121318] hover:bg-[#1C1E26] border border-[#2A2C38] px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer group"
          >
            <Gamepad2 className="h-3.5 w-3.5 text-[#FF007F] group-hover:rotate-12 transition-transform" />
            <span>Test with a 26-min GTA 6 Vice City Gameplay VOD</span>
            <span className="text-[9px] font-mono bg-[#FF007F]/25 text-[#FF007F] px-1.5 py-0.2 rounded font-bold">NEW</span>
            <ArrowRight className="h-3 w-3 text-[#00F0FF]" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. TOP GENERATOR CARD: OpusClip-Style Ingest & Config      */}
      {/* ========================================================= */}
      <div className="rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(20,21,26,0.04)] space-y-7">
        {/* Ingest Mode Tabs: Paste Link vs Upload File */}
        <div className="flex items-center justify-between border-b border-[#E6E4DD] pb-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setInputMode('url')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                inputMode === 'url'
                  ? 'bg-[#14151A] text-white shadow-sm'
                  : 'text-[#52545E] hover:text-[#14151A] hover:bg-[#FAF9F5]'
              }`}
            >
              <LinkIcon className="h-3.5 w-3.5 text-[#E84C2B]" aria-hidden="true" />
              <span>Paste Video URL</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                inputMode === 'upload'
                  ? 'bg-[#14151A] text-white shadow-sm'
                  : 'text-[#52545E] hover:text-[#14151A] hover:bg-[#FAF9F5]'
              }`}
            >
              <UploadCloud className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
              <span>Upload Video File</span>
            </button>
          </div>

          <span className="hidden sm:inline-flex text-[11px] font-mono text-[#8C8E9A]">
            Whisper Turbo • 216x Real-time
          </span>
        </div>

        <form onSubmit={handleGenerate} className="space-y-7">
          {/* Main Ingest Area */}
          {inputMode === 'url' ? (
            <div className="space-y-2">
              <label htmlFor="video-url" className="text-xs font-semibold text-[#14151A] flex items-center justify-between">
                <span>Source Video URL (YouTube, Loom, Google Drive, or MP4)</span>
                <span className="text-[11px] font-normal text-[#8C8E9A]">Up to 4 hours in 4K/1080p</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 flex items-center pointer-events-none">
                  <LinkIcon className="h-4 w-4 text-[#E84C2B]" />
                </div>
                <input
                  id="video-url"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste YouTube link (e.g. https://www.youtube.com/watch?v=...) or direct .mp4..."
                  className="w-full rounded-2xl border border-[#DCDAD2] bg-white py-3.5 pl-11 pr-4 text-xs sm:text-sm text-[#14151A] placeholder-[#8C8E9A] focus:border-[#E84C2B] focus:outline-none focus:ring-2 focus:ring-[#E84C2B]/15 transition-all font-sans"
                />
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                isDragging
                  ? 'border-[#E84C2B] bg-[#FAF3EE]'
                  : 'border-[#DCDAD2] bg-[#FAF9F5] hover:border-[#BDBBAF]'
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[#E6E4DD] text-[#E84C2B] mb-3 shadow-sm">
                <UploadCloud className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="text-sm font-bold text-[#14151A]">
                Drag and drop your long video here
              </p>
              <p className="text-xs text-[#52545E] mt-1 max-w-md">
                MP4, MOV, WebM, or MKV up to 5GB. Chunked multipart upload streams directly into private S3 MinIO storage.
              </p>
              <button
                type="button"
                className="mt-4 rounded-xl border border-[#DCDAD2] bg-white px-4 py-2 text-xs font-semibold text-[#14151A] hover:bg-[#FAF9F5] transition-all shadow-2xs cursor-pointer"
              >
                Browse Local Files
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* CONTENT MODE & GAMING TOGGLE                              */}
          {/* ========================================================= */}
          <div className="space-y-3 pt-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F0EFEA] rounded-xl border border-[#E6E4DD]">
                <button
                  type="button"
                  onClick={() => setContentMode('talking_head')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    contentMode === 'talking_head'
                      ? 'bg-white text-[#14151A] shadow-xs border border-[#E6E4DD]'
                      : 'text-[#6E717D] hover:text-[#14151A]'
                  }`}
                >
                  <Radio className="h-3.5 w-3.5 text-[#E84C2B]" />
                  <span>Podcast / Talking Head</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setContentMode('gaming');
                    setSelectedCaption('Vice Neon');
                    setLayoutMode('gameplay_cam');
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    contentMode === 'gaming'
                      ? 'bg-[#121318] text-[#00F0FF] shadow-xs border border-[#2A2C38]'
                      : 'text-[#6E717D] hover:text-[#14151A]'
                  }`}
                >
                  <Gamepad2 className="h-3.5 w-3.5 text-[#FF007F]" />
                  <span>Gaming & GTA 6</span>
                  <span className="text-[9px] bg-[#FF007F]/25 text-[#FF007F] px-1.5 py-0.2 rounded font-mono font-bold">HOT</span>
                </button>
              </div>

              {contentMode === 'gaming' && (
                <span className="text-[11px] font-mono text-[#00F0FF] bg-[#121318] px-3 py-1 rounded-xl border border-[#2A2C38] flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-[#FF007F] animate-pulse" />
                  <span>Vice City Audio-Peak & Gameplay Detection Active</span>
                </span>
              )}
            </div>

            {/* Gaming One-Click AI Focus Chips */}
            {contentMode === 'gaming' && (
              <div className="p-4 rounded-2xl bg-[#121318] text-white border border-[#2A2C38] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#00F0FF] flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-[#FF007F]" />
                    <span>Quick AI Focus Chips (GTA 6 / Gameplay)</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">Defaults to Gameplay+Cam HUD</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {GAMING_FOCUS_CHIPS.map((chip) => {
                    const isSelected = focusPrompt === chip.prompt;
                    return (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => {
                          setFocusPrompt(chip.prompt);
                          setLayoutMode('gameplay_cam');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#E84C2B] text-white border-[#E84C2B] shadow-sm'
                            : 'bg-[#1C1E26] text-zinc-200 border-[#2A2C38] hover:border-[#00F0FF] hover:text-[#00F0FF]'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                        <span>{chip.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* SOURCE OWNERSHIP & MONETIZATION SAFETY MODE               */}
          {/* ========================================================= */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#14151A] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#E84C2B]" />
                <span>Source Ownership & Monetization Safety</span>
              </label>
              <span className="text-[11px] font-mono text-[#52545E]">
                YouTube Shorts & Facebook Reels Partner Ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSourceType('original')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  sourceType === 'original'
                    ? 'border-[#E84C2B] bg-[#FAF3EE] shadow-2xs'
                    : 'border-[#E6E4DD] bg-white hover:border-[#14151A]'
                }`}
              >
                <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${sourceType === 'original' ? 'bg-[#E84C2B] text-white' : 'bg-[#F5F4EE] text-[#52545E]'}`}>
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#14151A]">
                    <span>My Original Footage / Podcast</span>
                    <span className="text-[9px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">ORIGINAL</span>
                  </div>
                  <div className="text-[11px] text-[#52545E] mt-0.5 leading-snug">
                    Marks source as original. Generates standard 9:16 speaker tracking, kinetic captions, and multi-track exports.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('commentary')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  sourceType === 'commentary'
                    ? 'border-[#E84C2B] bg-[#FAF3EE] shadow-2xs'
                    : 'border-[#E6E4DD] bg-white hover:border-[#14151A]'
                }`}
              >
                <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${sourceType === 'commentary' ? 'bg-[#E84C2B] text-white' : 'bg-[#F5F4EE] text-[#52545E]'}`}>
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#14151A]">
                    <span>Commentary / Reaction Clip</span>
                    <span className="text-[9px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">TRANSFORMATIVE</span>
                  </div>
                  <div className="text-[11px] text-[#52545E] mt-0.5 leading-snug">
                    Generates 5s AI hook script, dynamic 1.12x pacing cuts every 4s, and reserves Track A2 for your mic voiceover.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SIGNATURE OPUSCLIP CONTROLS                               */}
          {/* ========================================================= */}
          <div className="rounded-2xl border border-[#E6E4DD] bg-[#FAF9F5] p-5 sm:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#E84C2B]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#14151A]">
                  OpusClip Extraction Parameters
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#52545E]">AI Engine: FrameFlow Cloud GPU (1080p 60fps)</span>
            </div>

            {/* 1. Processing Timeframe Dual Range Bar */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#14151A] flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#52545E]" />
                  <span>Processing Timeframe</span>
                </span>
                <span className="font-mono text-[11px] text-[#52545E]">
                  Selected: <strong className="text-[#14151A]">58m 14s</strong> of 58m 14s (Full Video)
                </span>
              </div>

              {/* Visual Dual Timeline Bar */}
              <div className="relative h-7 w-full rounded-xl bg-white border border-[#E6E4DD] p-1 flex items-center">
                {/* Active selected range track */}
                <div className="absolute left-1 right-1 top-1 bottom-1 rounded-lg bg-[#E84C2B]/15 border border-[#E84C2B]/40 flex items-center justify-between px-2">
                  <div className="h-4 w-2 rounded-xs bg-[#E84C2B] cursor-ew-resize shadow-xs" title="Start Time Handle" />
                  <span className="text-[10px] font-mono font-bold text-[#E84C2B]">
                    CHAPTER 1 &bull; 00:00 &rarr; 58:14
                  </span>
                  <div className="h-4 w-2 rounded-xs bg-[#E84C2B] cursor-ew-resize shadow-xs" title="End Time Handle" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#8C8E9A]">
                <div className="flex items-center gap-1.5">
                  <span>Start:</span>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-18 rounded border border-[#DCDAD2] bg-white px-1.5 py-0.5 text-center text-[10px] text-[#14151A]"
                  />
                </div>
                <span className="hidden sm:inline">Drag handles or enter chapter bounds to clip specific interviews</span>
                <div className="flex items-center gap-1.5">
                  <span>End:</span>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-18 rounded border border-[#DCDAD2] bg-white px-1.5 py-0.5 text-center text-[10px] text-[#14151A]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Clip Length Pills */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#14151A] block">
                Target Clip Length
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {lengthOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedLength(opt)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                      selectedLength === opt
                        ? 'bg-[#14151A] text-white border-[#14151A] shadow-sm'
                        : 'bg-white text-[#52545E] border-[#E6E4DD] hover:border-[#DCDAD2] hover:text-[#14151A]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Visual Caption Template Picker (4 Mini 9:16 Thumbnails) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#14151A] block">
                  Signature Caption Preset
                </label>
                <span className="text-[11px] text-[#8C8E9A]">Customizable anytime in Studio Timeline</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {captionTemplates.map((template) => {
                  const isSelected = selectedCaption === template.id;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setSelectedCaption(template.id)}
                      className={`relative flex flex-col rounded-2xl border text-left p-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#E84C2B] ring-2 ring-[#E84C2B]/20 bg-white shadow-sm'
                          : 'border-[#E6E4DD] bg-white hover:border-[#DCDAD2]'
                      }`}
                    >
                      {/* Active Indicator Checkmark */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-[#E84C2B] text-white flex items-center justify-center shadow-xs">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                      )}

                      {/* Mini 9:16 Phone Card Simulation */}
                      <div
                        className={`w-full h-24 rounded-xl ${template.previewBg} p-2 flex flex-col justify-end items-center relative overflow-hidden mb-2.5 border border-white/5 shadow-inner`}
                      >
                        {/* Notch / Header */}
                        <div className="absolute top-1.5 inset-x-0 flex justify-center">
                          <div className="h-1 w-6 rounded-full bg-white/20" />
                        </div>

                        {/* Speaker Glow */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#E84C2B] to-amber-400 blur-sm" />
                        </div>

                        {/* Animated Caption Preview Words */}
                        <div className="relative z-10 text-center space-y-0.5">
                          <div className="text-[10px] text-zinc-300 font-semibold uppercase leading-tight">
                            {template.previewText}
                          </div>
                          <div className={`text-[11px] ${template.styleSnippet}`}>
                            {template.highlightWord}
                          </div>
                        </div>

                        {/* Home indicator bar */}
                        <div className="h-0.5 w-8 rounded-full bg-white/30 mt-1" />
                      </div>

                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-[#14151A]">{template.name}</div>
                        <p className="text-[10px] text-[#52545E] line-clamp-2 leading-relaxed">
                          {template.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Optional AI Focus Prompt */}
            <div className="space-y-1.5">
              <label htmlFor="ai-focus" className="text-xs font-semibold text-[#14151A] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#E84C2B]" />
                <span>AI Prompt Focus (Optional)</span>
              </label>
              <input
                id="ai-focus"
                type="text"
                value={focusPrompt}
                onChange={(e) => setFocusPrompt(e.target.value)}
                placeholder="Optional: Tell AI what moments to prioritize (e.g. founder failures, unit economics, controversy)..."
                className="w-full rounded-xl border border-[#DCDAD2] bg-white px-3.5 py-2.5 text-xs text-[#14151A] placeholder-[#8C8E9A] focus:border-[#E84C2B] focus:outline-none focus:ring-1 focus:ring-[#E84C2B]"
              />
            </div>
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-semibold animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2 text-xs text-[#52545E]">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
              <span>Full non-destructive timeline editor ready on every generated short.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] px-7 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer w-full sm:w-auto"
            >
              <span>{isSubmitting ? 'Analyzing & Ingesting...' : 'Get Clips in 1 Click'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================= */}
      {/* 2. RECENT PROJECTS GRID: Rich 16:9 Cards with Hover Scrub */}
      {/* ========================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold tracking-tight text-[#14151A]">
              Recent Video Projects
            </h2>
            <p className="text-xs text-[#52545E]">
              Click any project to review ranked viral shorts or export rendered MP4s.
            </p>
          </div>
          <span className="text-xs font-mono text-[#8C8E9A]">4 Projects Saved</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {MOCK_PROJECTS.map((project: MockProject) => {
            const minutes = Math.floor(project.sourceDurationSec / 60);
            const seconds = project.sourceDurationSec % 60;
            const formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group rounded-2xl border border-[#E6E4DD] bg-white overflow-hidden shadow-2xs hover:shadow-md hover:border-[#DCDAD2] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* 16:9 Thumbnail Container */}
                  <div className="relative aspect-video w-full bg-[#121318] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.thumbnailUrl}
                      alt={project.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Top Virality Score Pill */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981] px-2 py-0.5 text-[10px] font-mono font-bold text-black shadow-xs">
                        <Flame className="h-3 w-3 fill-current" />
                        <span>TOP 97/99</span>
                      </span>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-2.5 right-2.5">
                      <span className="rounded-md bg-black/70 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-mono text-white">
                        {formattedDuration}
                      </span>
                    </div>

                    {/* Hover Play Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-10 w-10 rounded-full bg-[#E84C2B] text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play className="h-4 w-4 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-1.5">
                    <p className="text-[11px] font-mono text-[#8C8E9A] uppercase tracking-wider">
                      {project.channelName}
                    </p>
                    <h3 className="text-xs sm:text-sm font-bold text-[#14151A] line-clamp-2 leading-snug group-hover:text-[#E84C2B] transition-colors">
                      {project.title}
                    </h3>
                  </div>
                </div>

                {/* Footer with Clip Count and Jump Arrow */}
                <div className="px-4 py-3 border-t border-[#F0EFEA] bg-[#FAF9F5] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-[#14151A]">
                    <Layers className="h-3.5 w-3.5 text-[#E84C2B]" />
                    <span>{project.clipCount} Viral Shorts</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#E84C2B] group-hover:translate-x-0.5 transition-transform">
                    <span>View Feed</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Insufficient Credits Upgrade Modal */}
      {insufficientCreditsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14151A]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-[#E6E4DD] space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#14151A]">
                  More Credits Needed
                </h3>
                <p className="text-xs text-[#52545E]">
                  This project requires {insufficientCreditsModal.required} credits (you have {insufficientCreditsModal.available} available).
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E6E4DD] text-xs space-y-1.5">
              <p className="font-semibold text-[#14151A]">
                Upgrade to FrameFlow Starter or Pro:
              </p>
              <ul className="text-[#52545E] space-y-1">
                <li>• Starter: 150 credits/mo ($12/mo)</li>
                <li>• Pro: 300 credits/mo ($31/mo) with DaVinci &amp; XML export</li>
                <li>• Unused credits rollover automatically</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setInsufficientCreditsModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8C8E9A] hover:text-[#14151A]"
              >
                Cancel
              </button>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] text-xs font-bold text-white transition-all shadow-sm"
              >
                <span>View Plans &amp; Top-Up</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
