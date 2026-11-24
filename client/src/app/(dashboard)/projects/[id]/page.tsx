'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MOCK_PROJECTS, MOCK_VIRAL_CLIPS, MockProject } from '@/lib/mock-data';
import type { GeneratedClipResponse, WordTiming } from '@frameflow/shared';
import {
  Flame,
  Play,
  Pause,
  Download,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Clock,
  Edit2,
  Check,
  CheckCircle2,
  Copy,
  Scissors,
  ArrowRight,
  TrendingUp,
  MessageSquareQuote,
  Eye,
  Info,
  ChevronDown,
  Layers,
  Palette,
  ExternalLink,
  Smartphone,
  Square,
  RectangleHorizontal,
} from 'lucide-react';

type FilterCategory = 'all' | 'top90' | 'under30' | 'gaming';
type SocialPlatform = 'tiktok' | 'reels' | 'shorts';

export default function ProjectShortsFeedPage(): JSX.Element {
  const params = useParams();
  const projectId = (params?.id as string) || 'demo-1';

  const project: MockProject =
    MOCK_PROJECTS.find((p) => p.id === projectId) || MOCK_PROJECTS[0];

  const [clips, setClips] = useState<GeneratedClipResponse[]>(MOCK_VIRAL_CLIPS);
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isPrompting, setIsPrompting] = useState(false);
  const [appliedBrandKit, setAppliedBrandKit] = useState('Founder Minimal');

  // Video playback preview state
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);
  const [playbackSec, setPlaybackSec] = useState<number>(0);

  // Active aspect ratio per clip
  const [aspectRatios, setAspectRatios] = useState<Record<string, '9:16' | '1:1' | '16:9'>>({});

  // Active social tab per clip
  const [socialTabs, setSocialTabs] = useState<Record<string, SocialPlatform>>({});

  // Score popover state
  const [activeScorePopoverId, setActiveScorePopoverId] = useState<string | null>(null);

  // Editable titles state
  const [editingClipId, setEditingClipId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState('');

  // Export & copy notification state
  const [copiedClipId, setCopiedClipId] = useState<string | null>(null);
  const [downloadingClipId, setDownloadingClipId] = useState<string | null>(null);

  // Simulated animated subtitle playback tick
  useEffect(() => {
    if (!playingClipId) return;

    const interval = setInterval(() => {
      setPlaybackSec((prev) => {
        const next = prev + 0.25;
        if (next > 12) {
          return 0; // loop preview
        }
        return next;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [playingClipId]);

  // Load real project clips from Fastify API
  useEffect(() => {
    if (projectId === 'demo-1') return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('frameflow_token') : null;
    if (!token) return;

    fetch(`/api/projects/${projectId}/clips`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { clips?: Array<{ id: string; projectId: string; title: string; aiInsight?: string; viralityScore: number; scoreBreakdownJson?: { hook: number; flow: number; topicRelevance: number }; startSeconds: number; endSeconds: number; layoutMode?: string; commentaryHookScript?: string | null; sourceType?: 'original' | 'commentary'; monetizationStatus?: 'ready' | 'needs_voiceover' | 'transformative_applied'; timelineAstJson?: object; socialCopyJson?: { tiktok?: string; reels?: string; shorts?: string }; createdAt: string; updatedAt: string }> } | null) => {
        if (data?.clips && Array.isArray(data.clips) && data.clips.length > 0) {
          const mappedClips: GeneratedClipResponse[] = data.clips.map((c) => ({
            id: c.id,
            projectId: c.projectId,
            title: c.title,
            hookSummary: c.aiInsight || null,
            viralityScore: c.viralityScore,
            scoreBreakdown: c.scoreBreakdownJson || { hook: 95, flow: 92, topicRelevance: 90 },
            startTime: c.startSeconds,
            endTime: c.endSeconds,
            duration: c.endSeconds - c.startSeconds,
            aspectRatio: '9:16',
            reframeMode: c.layoutMode || 'auto',
            timelineDocument: (c.timelineAstJson as unknown as GeneratedClipResponse['timelineDocument']) || MOCK_VIRAL_CLIPS[0].timelineDocument,
            socialPack: c.socialCopyJson ? {
              title: c.title,
              caption: c.socialCopyJson.tiktok || c.socialCopyJson.reels || c.socialCopyJson.shorts || '',
              hashtags: ['#shorts', '#viral', '#creator'],
            } : null,
            commentaryHookScript: c.commentaryHookScript || null,
            sourceType: c.sourceType || 'original',
            monetizationStatus: c.monetizationStatus || 'ready',
            status: 'READY',
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          }));
          setClips(mappedClips);
        }
      })
      .catch((err) => console.warn('Failed to fetch project clips:', err));
  }, [projectId]);

  const togglePlay = (clipId: string) => {
    if (playingClipId === clipId) {
      setPlayingClipId(null);
      setPlaybackSec(0);
    } else {
      setPlayingClipId(clipId);
      setPlaybackSec(0);
    }
  };

  const handleSetAspect = (clipId: string, aspect: '9:16' | '1:1' | '16:9') => {
    setAspectRatios((prev) => ({ ...prev, [clipId]: aspect }));
  };

  const handleSetSocialTab = (clipId: string, tab: SocialPlatform) => {
    setSocialTabs((prev) => ({ ...prev, [clipId]: tab }));
  };

  const handleStartEdit = (clip: GeneratedClipResponse) => {
    setEditingClipId(clip.id);
    setTitleDraft(clip.title);
  };

  const handleSaveTitle = async (clipId: string) => {
    const updatedTitle = titleDraft.trim();
    if (!updatedTitle) return;

    setClips((prev) =>
      prev.map((c) => (c.id === clipId ? { ...c, title: updatedTitle } : c))
    );
    setEditingClipId(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('frameflow_token') : null;
      if (token) {
        await fetch(`/api/clips/${clipId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: updatedTitle }),
        });
      }
    } catch (err) {
      console.warn('Failed to persist title update:', err);
    }
  };

  const handleCopyCaption = (clip: GeneratedClipResponse, platform: SocialPlatform = 'tiktok') => {
    if (!clip.socialPack) return;
    const prefix = platform === 'tiktok' ? 'TikTok' : platform === 'reels' ? 'Reels' : 'Shorts';
    const text = `[${prefix}] ${clip.socialPack.title}\n\n${clip.socialPack.caption}\n\n${clip.socialPack.hashtags.join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopiedClipId(`${clip.id}-${platform}`);
    setTimeout(() => setCopiedClipId(null), 2000);
  };

  const handleDownload = async (clipId: string) => {
    setDownloadingClipId(clipId);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('frameflow_token') : null;
      if (token) {
        await fetch(`/api/clips/${clipId}/export`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ format: 'mp4_1080p' }),
        });
      }
    } catch (err) {
      console.warn('Export dispatch error:', err);
    }

    setTimeout(() => {
      setDownloadingClipId(null);
    }, 1200);
  };

  const handlePromptMore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsPrompting(true);
    setTimeout(() => {
      setIsPrompting(false);
      setAiPrompt('');
      alert(`AI extracted 2 new viral moments based on: "${aiPrompt}"`);
    }, 1400);
  };

  // Filter clips
  const filteredClips = clips.filter((clip) => {
    if (filter === 'top90') return clip.viralityScore >= 90;
    if (filter === 'under30') return clip.duration < 38;
    if (filter === 'gaming') return clip.title.includes('GTA') || clip.reframeMode === 'gameplay_cam' || clip.reframeMode === 'gameplay_full';
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-[#14151A]">
      {/* ========================================================= */}
      {/* 1. TOP CONTROL STRIP                                      */}
      {/* ========================================================= */}
      <div className="rounded-2xl border border-[#E6E4DD] bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E6E4DD] pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 font-bold font-mono text-emerald-700">
                {clips.length} Ranked Shorts Ready
              </span>
              <span className="text-[#8C8E9A]">•</span>
              <span className="text-[#52545E] font-medium">{project.channelName}</span>
              <span className="text-[#8C8E9A]">•</span>
              <span className="text-[#52545E] font-mono tabular-nums">Source: 58m 14s</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#14151A]">
              {project.title}
            </h1>
            <p className="text-xs text-[#52545E] max-w-3xl line-clamp-1">
              {project.description}
            </p>
          </div>

          {/* Right Action Controls: 1-Click Apply Brand Kit & New Video */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 1-Click Brand Kit Selector */}
            <div className="flex items-center gap-1.5 rounded-xl border border-[#E6E4DD] bg-[#FAF9F5] px-3 py-1.5 text-xs">
              <Palette className="h-3.5 w-3.5 text-[#E84C2B]" />
              <span className="text-[#52545E] font-medium">Brand Kit:</span>
              <select
                value={appliedBrandKit}
                onChange={(e) => setAppliedBrandKit(e.target.value)}
                className="bg-transparent font-bold text-[#14151A] focus:outline-none cursor-pointer"
              >
                <option value="Founder Minimal">Founder Minimal</option>
                <option value="Hormozi Pop">Hormozi Pop</option>
                <option value="Karaoke Glow">Karaoke Glow</option>
                <option value="Clean Cinema">Clean Cinema</option>
              </select>
            </div>

            <Link
              href="/dashboard"
              className="rounded-xl border border-[#DCDAD2] bg-white hover:bg-[#FAF9F5] px-3.5 py-2 text-xs font-semibold text-[#14151A] transition-all shadow-2xs"
            >
              + Ingest Another Video
            </Link>
          </div>
        </div>

        {/* Filter Tabs & AI Prompt Input Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${filter === 'all'
                ? 'bg-[#14151A] text-white shadow-sm'
                : 'bg-[#FAF9F5] text-[#52545E] border border-[#E6E4DD] hover:text-[#14151A]'
                }`}
            >
              All Shorts ({clips.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('top90')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${filter === 'top90'
                ? 'bg-[#14151A] text-white shadow-sm'
                : 'bg-[#FAF9F5] text-[#52545E] border border-[#E6E4DD] hover:text-[#14151A]'
                }`}
            >
              <Flame className="h-3.5 w-3.5 text-[#10B981]" />
              <span>Viral 90+ (5)</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter('under30')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${filter === 'under30'
                ? 'bg-[#14151A] text-white shadow-sm'
                : 'bg-[#FAF9F5] text-[#52545E] border border-[#E6E4DD] hover:text-[#14151A]'
                }`}
            >
              Under 30s (3)
            </button>
            <button
              type="button"
              onClick={() => setFilter('gaming')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${filter === 'gaming'
                ? 'bg-[#121318] text-[#00F0FF] shadow-sm border border-[#2A2C38]'
                : 'bg-[#FAF9F5] text-[#52545E] border border-[#E6E4DD] hover:text-[#14151A]'
                }`}
            >
              <span>GTA 6 & Gaming</span>
            </button>
          </div>

          {/* Interactive AI Prompt Input Bar */}
          <form onSubmit={handlePromptMore} className="flex-1 max-w-md flex items-center gap-2">
            <div className="relative w-full">
              <Sparkles className="h-3.5 w-3.5 text-[#E84C2B] absolute left-3 top-2.5" />
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Prompt AI for more clips (e.g. pricing mistakes, funny stories)..."
                className="w-full rounded-xl border border-[#DCDAD2] bg-[#FAF9F5] py-2 pl-9 pr-3 text-xs text-[#14151A] placeholder-[#8C8E9A] focus:border-[#E84C2B] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E84C2B] transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isPrompting || !aiPrompt.trim()}
              className="rounded-xl bg-[#14151A] hover:bg-[#2A2B35] text-white px-3.5 py-2 text-xs font-bold transition-all disabled:opacity-40 shrink-0 cursor-pointer"
            >
              {isPrompting ? 'Hunting...' : 'Find Clips'}
            </button>
          </form>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SIGNATURE OPUSCLIP RANKED SHORTS GRID (3–4 Columns)    */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClips.map((clip, index) => {
          const isPlaying = playingClipId === clip.id;
          const currentAspect = aspectRatios[clip.id] || '9:16';
          const activeSocial = socialTabs[clip.id] || 'tiktok';
          const showScorePopover = activeScorePopoverId === clip.id;

          // Find sample words for live preview
          const words = clip.timelineDocument?.tracks
            ?.find((t) => t.type === 'TEXT')
            ?.clips[0]?.textConfig
            ? [
              { word: 'THE', highlighted: false },
              { word: 'BIGGEST', highlighted: true },
              { word: 'MISTAKE', highlighted: true },
              { word: 'IN', highlighted: false },
              { word: 'HARDWARE', highlighted: true },
            ]
            : [
              { word: 'THIS', highlighted: false },
              { word: 'IS', highlighted: false },
              { word: 'HOW', highlighted: true },
              { word: 'WE', highlighted: false },
              { word: 'SCALED', highlighted: true },
            ];

          const activeWordIndex = Math.floor(playbackSec * 2) % words.length;

          return (
            <div
              key={clip.id}
              className="rounded-2xl border border-[#E6E4DD] bg-white p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
            >
              <div className="space-y-3.5">
                {/* 1. Dark Cinema Stage (#121318) 9:16 Player */}
                <div
                  className={`relative w-full rounded-xl bg-[#121318] border border-[#23242E] overflow-hidden flex flex-col justify-between p-3 select-none transition-all ${currentAspect === '9:16'
                    ? 'aspect-[9/16]'
                    : currentAspect === '1:1'
                      ? 'aspect-square'
                      : 'aspect-video'
                    }`}
                >
                  {/* Speaker Background Simulation */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1E202B]/90 via-[#151620] to-[#0D0E13] flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#E84C2B]/30 to-amber-500/20 blur-xl opacity-60" />
                  </div>

                  {(clip.reframeMode === 'gameplay_cam' || clip.title.includes('GTA')) && (
                    <div className="absolute top-10 right-3 z-20 flex items-center gap-1 bg-[#121318]/90 backdrop-blur-md px-2 py-0.5 rounded border border-amber-500/40 text-[9px] font-mono text-amber-400 font-bold">
                      <span>&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                      <span className="text-red-500 text-[8px] ml-0.5 font-black">POLICE</span>
                    </div>
                  )}

                  {/* Top Bar: Layout Badge & Aspect Selector */}
                  <div className="relative z-20 flex items-center justify-between">
                    <span className="rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 text-[9px] font-mono text-zinc-300">
                      {clip.reframeMode === 'gameplay_cam' || clip.title.includes('GTA')
                        ? 'Gameplay + Cam (16:9 HUD)'
                        : clip.reframeMode === 'gameplay_full'
                        ? 'Full Gameplay 9:16'
                        : clip.reframeMode === 'auto'
                        ? 'Speaker Centered'
                        : '2-Speaker Split'}
                    </span>

                    {/* Quick Aspect Ratio Switcher */}
                    <div className="flex items-center gap-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 p-0.5 text-[9px] font-mono">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetAspect(clip.id, '9:16');
                        }}
                        className={`px-1.5 py-0.5 rounded ${currentAspect === '9:16'
                          ? 'bg-[#E84C2B] text-white font-bold'
                          : 'text-zinc-400 hover:text-white'
                          }`}
                        title="Vertical 9:16"
                      >
                        9:16
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetAspect(clip.id, '1:1');
                        }}
                        className={`px-1.5 py-0.5 rounded ${currentAspect === '1:1'
                          ? 'bg-[#E84C2B] text-white font-bold'
                          : 'text-zinc-400 hover:text-white'
                          }`}
                        title="Square 1:1"
                      >
                        1:1
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetAspect(clip.id, '16:9');
                        }}
                        className={`px-1.5 py-0.5 rounded ${currentAspect === '16:9'
                          ? 'bg-[#E84C2B] text-white font-bold'
                          : 'text-zinc-400 hover:text-white'
                          }`}
                        title="Horizontal 16:9"
                      >
                        16:9
                      </button>
                    </div>
                  </div>

                  {/* Center Play Button Overlay */}
                  <div className="relative z-20 my-auto flex flex-col items-center justify-center">
                    <button
                      type="button"
                      onClick={() => togglePlay(clip.id)}
                      className={`h-11 w-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${isPlaying
                        ? 'bg-black/60 text-white backdrop-blur-md border border-white/20'
                        : 'bg-[#E84C2B] text-white hover:scale-105 active:scale-95'
                        }`}
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5 fill-current" />
                      ) : (
                        <Play className="h-5 w-5 fill-current ml-0.5" />
                      )}
                    </button>
                    <span className="text-[10px] font-mono text-zinc-400 mt-1.5">
                      {isPlaying ? `00:${Math.floor(playbackSec).toString().padStart(2, '0')}` : `${clip.duration}s`}
                    </span>
                  </div>

                  {/* Live Animated Subtitle Word Highlights */}
                  <div className="relative z-20 text-center pb-2 px-2">
                    <div className="inline-flex flex-wrap items-center justify-center gap-1 p-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 shadow-sm">
                      {words.map((w, idx) => {
                        const isWordActive = isPlaying && idx === activeWordIndex;
                        return (
                          <span
                            key={w.word}
                            className={`text-[11px] font-black tracking-tight uppercase transition-all duration-150 ${isWordActive
                              ? 'text-[#F59E0B] scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                              : w.highlighted
                                ? 'text-white'
                                : 'text-zinc-400'
                              }`}
                          >
                            {w.word}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. Virality Score Badge & Interactive Popover */}
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveScorePopoverId(showScorePopover ? null : clip.id)
                      }
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-300 px-2.5 py-1 text-xs font-mono font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      <Flame className="h-3.5 w-3.5 text-emerald-600 fill-current" />
                      <span>{clip.viralityScore} / 99 VIRALITY</span>
                      <Info className="h-3 w-3 text-emerald-600 ml-0.5" />
                    </button>

                    <span className="text-[11px] font-mono text-[#8C8E9A]">
                      #{index + 1} Ranked
                    </span>
                  </div>

                  {/* Interactive Virality Breakdown Popover */}
                  {showScorePopover && (
                    <div className="absolute left-0 right-0 top-9 z-30 rounded-xl border border-[#E6E4DD] bg-white p-3.5 shadow-xl text-xs space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between border-b border-[#F0EFEA] pb-1.5">
                        <span className="font-bold text-[#14151A] text-[11px] uppercase tracking-wider font-mono">
                          Virality Metric Breakdown
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveScorePopoverId(null)}
                          className="text-[#8C8E9A] hover:text-[#14151A] font-bold"
                        >
                          &times;
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div className="bg-[#FAF9F5] p-1.5 rounded-lg border border-[#E6E4DD]">
                          <span className="text-[#52545E] block">Hook:</span>
                          <strong className="text-emerald-700">
                            {clip.scoreBreakdown?.hook || 96}/100
                          </strong>
                        </div>
                        <div className="bg-[#FAF9F5] p-1.5 rounded-lg border border-[#E6E4DD]">
                          <span className="text-[#52545E] block">Flow:</span>
                          <strong className="text-emerald-700">
                            {clip.scoreBreakdown?.flow || 94}/100
                          </strong>
                        </div>
                        <div className="bg-[#FAF9F5] p-1.5 rounded-lg border border-[#E6E4DD]">
                          <span className="text-[#52545E] block">Engagement:</span>
                          <strong className="text-emerald-700">95/100</strong>
                        </div>
                        <div className="bg-[#FAF9F5] p-1.5 rounded-lg border border-[#E6E4DD]">
                          <span className="text-[#52545E] block">Clarity:</span>
                          <strong className="text-emerald-700">96/100</strong>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#52545E] leading-relaxed italic border-t border-[#F0EFEA] pt-1.5">
                        &ldquo;{clip.scoreBreakdown?.reasoning || 'Strong curiosity gap; connects planetary scale infrastructure with immediate viewer takeaways.'}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Monetization Check Badge */}
                <div className="pt-0.5">
                  {(clip as unknown as { sourceType?: string }).sourceType === 'commentary' || clip.title.includes('GTA') ? (
                    <div className="flex items-center justify-between text-[10px] font-mono rounded-lg bg-amber-50 border border-amber-200/90 px-2.5 py-1 text-amber-800">
                      <span className="flex items-center gap-1.5 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Monetization Check: Add 5s Voiceover Hook
                      </span>
                      <Link
                        href={`/editor/${clip.id}`}
                        className="text-[#E84C2B] font-bold hover:underline ml-1"
                      >
                        Record &rarr;
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[10px] font-mono rounded-lg bg-emerald-50 border border-emerald-200/90 px-2.5 py-1 text-emerald-800">
                      <span className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Monetization Check: Original Ready
                      </span>
                      <span className="text-[9px] text-emerald-700 bg-emerald-100/70 px-1 rounded font-bold">
                        FAIR-USE SAFE
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. Editable Title */}
                <div className="space-y-1">
                  {editingClipId === clip.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={titleDraft}
                        onChange={(e) => setTitleDraft(e.target.value)}
                        className="w-full rounded-lg border border-[#E84C2B] bg-white px-2 py-1 text-xs font-bold text-[#14151A] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveTitle(clip.id)}
                        className="p-1 rounded bg-[#E84C2B] text-white hover:bg-[#D13B1C]"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2 group/title">
                      <h3 className="text-xs sm:text-sm font-bold text-[#14151A] line-clamp-2 leading-snug">
                        {clip.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(clip)}
                        className="opacity-0 group-hover/title:opacity-100 p-1 rounded hover:bg-[#FAF9F5] text-[#8C8E9A] hover:text-[#14151A] transition-all"
                        title="Edit title"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  <p className="text-[11px] text-[#52545E] line-clamp-2 leading-relaxed">
                    {clip.hookSummary}
                  </p>
                </div>

                {/* 4. Auto-Generated Social Caption Drawer */}
                <div className="rounded-xl border border-[#E6E4DD] bg-[#FAF9F5] p-2.5 space-y-2">
                  <div className="flex items-center justify-between border-b border-[#E6E4DD] pb-1.5">
                    {/* Social Platform Tabs */}
                    <div className="flex gap-1">
                      {(['tiktok', 'reels', 'shorts'] as SocialPlatform[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleSetSocialTab(clip.id, p)}
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${activeSocial === p
                            ? 'bg-[#14151A] text-white font-bold'
                            : 'text-[#8C8E9A] hover:text-[#14151A]'
                            }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCaption(clip, activeSocial)}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#E84C2B] hover:text-[#D13B1C] transition-colors cursor-pointer"
                    >
                      {copiedClipId === `${clip.id}-${activeSocial}` ? (
                        <>
                          <Check className="h-3 w-3 text-[#10B981]" />
                          <span className="text-[#10B981]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[10px] text-[#52545E] line-clamp-2 leading-relaxed">
                    {clip.socialPack?.caption || 'Check out this segment on founder economics.'}
                  </p>

                  <div className="flex flex-wrap gap-1 text-[9px] font-mono text-[#8C8E9A]">
                    {clip.socialPack?.hashtags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[#E84C2B]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Action Footer */}
              <div className="pt-3 border-t border-[#F0EFEA] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(clip.id)}
                  disabled={downloadingClipId === clip.id}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#DCDAD2] bg-white hover:bg-[#FAF9F5] py-2 px-2.5 text-xs font-semibold text-[#14151A] transition-all shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-[#52545E]" />
                  <span>{downloadingClipId === clip.id ? 'Exporting...' : '1080p MP4'}</span>
                </button>

                <Link
                  href={`/editor/${clip.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] py-2 px-2.5 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
                >
                  <span>Edit in Studio</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
