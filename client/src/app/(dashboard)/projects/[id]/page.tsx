'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MOCK_PROJECTS, MOCK_VIRAL_CLIPS, MockProject } from '@/lib/mock-data';
import type { GeneratedClipResponse } from '@frameflow/shared';
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
} from 'lucide-react';

type FilterCategory = 'all' | 'top90' | 'under30';

export default function ProjectShortsFeedPage(): JSX.Element {
  const params = useParams();
  const projectId = (params?.id as string) || 'demo-1';

  const project: MockProject =
    MOCK_PROJECTS.find((p) => p.id === projectId) || MOCK_PROJECTS[0];

  const [clips, setClips] = useState<GeneratedClipResponse[]>(MOCK_VIRAL_CLIPS);
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isPrompting, setIsPrompting] = useState(false);

  // Video playback preview state
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);
  const [playbackSec, setPlaybackSec] = useState<number>(0);

  // Editable titles state
  const [editingClipId, setEditingClipId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState('');

  // Export & copy notification state
  const [copiedClipId, setCopiedClipId] = useState<string | null>(null);
  const [exportedClipId, setExportedClipId] = useState<string | null>(null);

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

  const togglePlay = (clipId: string) => {
    if (playingClipId === clipId) {
      setPlayingClipId(null);
      setPlaybackSec(0);
    } else {
      setPlayingClipId(clipId);
      setPlaybackSec(0);
    }
  };

  const handleStartEdit = (clip: GeneratedClipResponse) => {
    setEditingClipId(clip.id);
    setTitleDraft(clip.title);
  };

  const handleSaveTitle = (clipId: string) => {
    setClips((prev) =>
      prev.map((c) => (c.id === clipId ? { ...c, title: titleDraft || c.title } : c))
    );
    setEditingClipId(null);
  };

  const handleCopyCaption = (clip: GeneratedClipResponse) => {
    if (!clip.socialPack) return;
    const text = `${clip.socialPack.title}\n\n${clip.socialPack.caption}\n\n${clip.socialPack.hashtags.join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopiedClipId(clip.id);
    setTimeout(() => setCopiedClipId(null), 2000);
  };

  const handleExport = (clipId: string) => {
    setExportedClipId(clipId);
    setTimeout(() => setExportedClipId(null), 2500);
  };

  const handlePromptMore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsPrompting(true);
    setTimeout(() => {
      setIsPrompting(false);
      setAiPrompt('');
    }, 1200);
  };

  // Filter clips
  const filteredClips = clips.filter((clip) => {
    if (filter === 'top90') return clip.viralityScore >= 90;
    if (filter === 'under30') return clip.duration < 38;
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Project Banner Header */}
      <div className="rounded-2xl border border-[#27272A] bg-[#111114] p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
              {clips.length} Ranked Shorts Ready
            </span>
            <span className="text-xs text-[#71717A]">•</span>
            <span className="text-xs text-[#94A3B8] font-mono tabular-nums">{project.channelName}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {project.title}
          </h1>
          <p className="text-xs text-[#94A3B8] max-w-2xl line-clamp-1">
            {project.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl border border-[#27272A] bg-[#18181C] hover:bg-[#222228] px-4 py-2 text-xs font-semibold text-white transition-colors"
          >
            + Ingest Another Video
          </Link>
          <Link
            href="/exports"
            className="rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all"
          >
            View Export Queue
          </Link>
        </div>
      </div>

      {/* Filter Bar & Prompt AI for More Clips */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 rounded-xl border border-[#27272A] bg-[#111114] p-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#71717A] mr-1 hidden sm:inline">Filter:</span>
          {(
            [
              { id: 'all', label: `All Clips (${clips.length})` },
              { id: 'top90', label: 'Top 90+ Score' },
              { id: 'under30', label: 'Under 40s Fast Hook' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter === tab.id
                  ? 'bg-[#6366F1] text-white font-semibold shadow-sm'
                  : 'bg-[#18181C] text-[#94A3B8] border border-[#27272A] hover:text-white hover:border-[#3F3F46]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Prompt AI For More Clips */}
        <form onSubmit={handlePromptMore} className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-2.5 h-3.5 w-3.5 text-indigo-400" aria-hidden="true" />
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Prompt AI for more clips (e.g. Find pricing debates)..."
              className="w-full rounded-xl border border-[#27272A] bg-[#18181C] py-2 pl-9 pr-3 text-xs text-white placeholder-[#71717A] focus:border-[#6366F1] focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
            />
          </div>
          <button
            type="submit"
            disabled={isPrompting}
            className="rounded-xl border border-[#27272A] bg-[#18181C] hover:bg-[#222228] px-3.5 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50 shrink-0"
          >
            {isPrompting ? 'Scanning...' : 'Find Clips'}
          </button>
        </form>
      </div>

      {/* 3-4 Column Grid of Vertical 9:16 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredClips.map((clip, index) => {
          const isPlaying = playingClipId === clip.id;
          const isEditing = editingClipId === clip.id;
          const isCopied = copiedClipId === clip.id;
          const isExported = exportedClipId === clip.id;
          const rank = index + 1;

          // Word-level caption sync based on playbackSec
          const words = clip.timelineDocument?.tracks?.[0]?.clips?.[0]?.words || [];
          const activeWord =
            words.find((w) => playbackSec >= w.start && playbackSec <= w.end)?.word ||
            words[0]?.word ||
            'VIRAL HOOK';

          return (
            <div
              key={clip.id}
              className="group flex flex-col justify-between rounded-2xl border border-[#27272A] bg-[#111114] p-4 hover:border-[#3F3F46] transition-all space-y-4 shadow-sm"
            >
              {/* Vertical 9:16 Phone Canvas / Preview Area */}
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-black border border-[#27272A]">
                {/* Background image preview */}
                <img
                  src="https://images.unsplash.com/photo-1534972195531-a756b11269d5?auto=format&fit=crop&w=720&q=80"
                  alt={clip.title}
                  className={`h-full w-full object-cover transition-transform duration-700 ${
                    isPlaying ? 'scale-105 opacity-90' : 'opacity-80 group-hover:scale-102'
                  }`}
                />

                {/* Top Overlay Badges: Rank & Virality Score */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <span className="rounded-lg bg-black/80 backdrop-blur-sm border border-white/10 px-2 py-0.5 text-xs font-mono font-bold text-white">
                    #{rank}
                  </span>

                  <span className="virality-badge shadow-md">
                    <TrendingUp className="h-3 w-3" aria-hidden="true" />
                    {clip.viralityScore}
                  </span>
                </div>

                {/* Live Overlaid Animated Captions */}
                <div className="absolute bottom-12 left-2 right-2 text-center pointer-events-none">
                  {clip.captionStyle?.preset === 'hormozi_pop' ? (
                    <div className="inline-block transform -rotate-1 rounded bg-black/85 px-3 py-1.5 shadow-lg border border-white/10">
                      <span
                        className="text-sm font-black tracking-wider uppercase font-mono"
                        style={{ color: clip.captionStyle.highlightColor || '#10B981' }}
                      >
                        {isPlaying ? activeWord : clip.title.split(' ').slice(0, 3).join(' ').toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <div className="inline-block rounded-md bg-black/75 px-3 py-1 backdrop-blur-sm">
                      <span className="text-xs font-bold text-white">
                        {isPlaying ? activeWord : clip.title.slice(0, 24)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Duration Tag & Play/Pause Interactive Trigger */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <span className="rounded bg-black/80 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-white flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {clip.duration.toFixed(1)}s
                  </span>

                  <button
                    type="button"
                    onClick={() => togglePlay(clip.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6366F1] text-white shadow-md hover:scale-105 active:scale-95 transition-transform"
                    aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Play className="h-4 w-4 ml-0.5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Title & Virality Sub-Scores Breakdown */}
              <div className="space-y-3">
                {/* Title (Inline Editable) */}
                {isEditing ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={titleDraft}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveTitle(clip.id);
                      }}
                      className="flex-1 rounded-lg border border-[#6366F1] bg-[#18181C] px-2 py-1 text-xs text-white focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveTitle(clip.id)}
                      className="rounded bg-[#6366F1] p-1 text-white hover:bg-[#4F46E5]"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-1 group/title">
                    <h3 className="text-xs font-semibold text-white line-clamp-2 leading-snug">
                      {clip.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(clip)}
                      className="opacity-0 group-hover/title:opacity-100 text-[#71717A] hover:text-white transition-opacity p-0.5 shrink-0"
                      title="Edit title"
                    >
                      <Edit2 className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                )}

                {/* Sub-Scores Meter (Hook / Flow / Relevance) */}
                <div className="grid grid-cols-3 gap-1 rounded-lg bg-[#18181C] border border-[#27272A] p-2 text-center text-[10px] font-mono tabular-nums">
                  <div>
                    <span className="block text-[#71717A]">HOOK</span>
                    <span className="font-bold text-emerald-400">
                      {clip.scoreBreakdown?.hook ?? 95}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-[#71717A]">FLOW</span>
                    <span className="font-bold text-indigo-400">
                      {clip.scoreBreakdown?.flow ?? 90}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-[#71717A]">TOPIC</span>
                    <span className="font-bold text-[#F8FAFC]">
                      {clip.scoreBreakdown?.topicRelevance ?? 88}%
                    </span>
                  </div>
                </div>

                {/* AI Viral Insight */}
                {clip.hookSummary && (
                  <p className="text-[11px] text-[#94A3B8] line-clamp-2 italic leading-relaxed">
                    &ldquo;{clip.hookSummary}&rdquo;
                  </p>
                )}
              </div>

              {/* Action Buttons: Export, Copy Caption & Edit Short */}
              <div className="space-y-2 pt-2 border-t border-[#27272A]">
                <div className="flex items-center gap-2">
                  {/* 1-Click Export MP4 */}
                  <button
                    type="button"
                    onClick={() => handleExport(clip.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-[#27272A] bg-[#18181C] hover:bg-[#222228] hover:border-[#3F3F46] py-1.5 text-xs font-medium text-white transition-colors"
                  >
                    {isExported ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                        <span className="text-emerald-400 font-semibold">Export Queued</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5 text-indigo-400" aria-hidden="true" />
                        <span>Export MP4</span>
                      </>
                    )}
                  </button>

                  {/* Copy Social Caption */}
                  <button
                    type="button"
                    onClick={() => handleCopyCaption(clip)}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-[#27272A] bg-[#18181C] hover:bg-[#222228] px-2.5 py-1.5 text-xs font-medium text-white transition-colors"
                    title="Copy Social Pack & Hashtags"
                  >
                    {isCopied ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-[#94A3B8]" aria-hidden="true" />
                    )}
                  </button>
                </div>

                {/* Edit Short CTA -> /editor/[clipId] */}
                <Link
                  href={`/editor/${clip.id}`}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] py-2 text-xs font-semibold text-white shadow-sm transition-all"
                >
                  <Scissors className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Edit Short in 9:16 Timeline</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
