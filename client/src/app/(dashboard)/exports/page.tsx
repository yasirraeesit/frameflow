'use client';

import React, { useState } from 'react';
import { MOCK_EXPORTS, ExportItem } from '@/lib/mock-data';
import {
  DownloadCloud,
  CheckCircle2,
  Clock,
  Loader2,
  FileVideo,
  Download,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Hash,
  ExternalLink,
  Share2,
} from 'lucide-react';

type FilterTab = 'ALL' | 'COMPLETED' | 'PROCESSING';

export default function ExportsPage(): JSX.Element {
  const [exportsList, setExportsList] = useState<ExportItem[]>(MOCK_EXPORTS);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredExports = exportsList.filter((item) => {
    if (activeTab === 'COMPLETED') return item.status === 'COMPLETED';
    if (activeTab === 'PROCESSING') return item.status === 'PROCESSING' || item.status === 'QUEUED';
    return true;
  });

  const handleCopyCaption = async (item: ExportItem) => {
    const textToCopy = `${item.aiTitle || item.clipTitle}\n\n${(item.hashtags || []).join(' ')}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const completedCount = exportsList.filter((e) => e.status === 'COMPLETED').length;
  const processingCount = exportsList.filter((e) => e.status === 'PROCESSING' || e.status === 'QUEUED').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#27272A] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <DownloadCloud className="h-5 w-5 text-[#10B981]" aria-hidden="true" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Exports History</h1>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Production-rendered 1080p MP4 shorts with ready-to-publish AI viral titles, hooks, and optimized hashtag bundles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 rounded-xl border border-[#27272A] bg-[#111114] px-3.5 py-2 text-xs font-medium text-[#94A3B8] hover:text-white hover:bg-[#18181C] transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-white' : ''}`} aria-hidden="true" />
            <span>Refresh Queue</span>
          </button>
          <a
            href={MOCK_EXPORTS[0]?.downloadUrl ?? '#'}
            download
            className="flex items-center gap-1.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all active:scale-[0.98]"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Download All Completed (.zip)</span>
          </a>
        </div>
      </div>

      {/* Filter Tabs & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 rounded-xl border border-[#27272A] bg-[#111114] p-1">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'ALL'
                ? 'bg-[#18181C] text-white shadow-sm border border-[#27272A]'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            All Exports ({exportsList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('COMPLETED')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'COMPLETED'
                ? 'bg-[#18181C] text-emerald-400 shadow-sm border border-[#27272A]'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Completed ({completedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PROCESSING')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'PROCESSING'
                ? 'bg-[#18181C] text-indigo-400 shadow-sm border border-[#27272A]'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            In Queue ({processingCount})
          </button>
        </div>

        <div className="text-xs font-mono text-[#71717A] tabular-nums">
          Storage: <span className="text-[#94A3B8] font-semibold">90.5 MB</span> · FFmpeg v7.0 NVENC accelerated
        </div>
      </div>

      {/* Exports List Cards */}
      <div className="space-y-4">
        {filteredExports.map((item) => {
          const isCopied = copiedId === item.id;

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-[#27272A] bg-[#111114] p-5 transition-all hover:border-[#3F3F46] shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              {/* Left Column: Video Icon / Aspect Badge & Details */}
              <div className="flex items-start gap-4 flex-1 min-w-0 w-full">
                {/* 9:16 Aspect Thumbnail Mockup */}
                <div className="relative h-24 w-16 shrink-0 rounded-xl bg-black border border-[#27272A] overflow-hidden flex flex-col justify-between p-1.5 shadow-md">
                  <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400">
                    <span className="bg-black/60 px-1 py-0.2 rounded font-semibold text-emerald-400">9:16</span>
                  </div>
                  <div className="flex items-center justify-center my-auto">
                    <FileVideo className="h-6 w-6 text-indigo-400/80" aria-hidden="true" />
                  </div>
                  <div className="text-[9px] font-mono tabular-nums text-zinc-400 text-right bg-black/60 px-1 rounded">
                    {item.durationSec ? `${item.durationSec}s` : '0:35'}
                  </div>
                </div>

                {/* Metadata & Title */}
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-tight truncate max-w-lg">
                      {item.clipTitle}
                    </h3>
                    <span className="rounded-md bg-[#18181C] border border-[#27272A] px-2 py-0.5 text-[10px] font-mono text-[#94A3B8] tabular-nums">
                      {item.resolution}
                    </span>
                    <span className="rounded-md bg-[#18181C] border border-[#27272A] px-2 py-0.5 text-[10px] font-mono text-[#94A3B8] uppercase">
                      {item.format}
                    </span>
                    <span className="rounded-md bg-[#18181C] border border-[#27272A] px-2 py-0.5 text-[10px] font-mono text-[#94A3B8] tabular-nums">
                      {item.fps} FPS
                    </span>
                    {item.fileSizeMb && (
                      <span className="rounded-md bg-[#18181C] border border-[#27272A] px-2 py-0.5 text-[10px] font-mono text-emerald-400 font-semibold tabular-nums">
                        {item.fileSizeMb} MB
                      </span>
                    )}
                  </div>

                  {/* AI Generated TikTok / Shorts Title & Copy */}
                  {item.aiTitle && (
                    <div className="rounded-xl border border-[#27272A] bg-[#18181C] p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                          <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>AI Viral Hook Title:</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCaption(item)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-[#94A3B8] hover:text-white transition-colors"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" aria-hidden="true" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" aria-hidden="true" />
                              <span>Copy Post Caption</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-white font-medium select-all">
                        {item.aiTitle}
                      </p>

                      {/* Hashtag Pills */}
                      {item.hashtags && item.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {item.hashtags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-[#111114] border border-[#27272A] px-2 py-0.5 text-[10px] font-mono text-[#94A3B8] hover:text-indigo-300 transition-colors cursor-default"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Processing Progress Bar */}
                  {item.status === 'PROCESSING' && (
                    <div className="rounded-xl border border-[#27272A] bg-[#18181C] p-3 space-y-2 max-w-xl">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-[#94A3B8] flex items-center gap-2">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                          Encoding 1080p MP4 (FFmpeg filter_complex burn-in)...
                        </span>
                        <span className="text-indigo-400 font-bold tabular-nums">{item.progress}%</span>
                      </div>
                      <div className="w-full bg-[#111114] rounded-full h-2 overflow-hidden border border-[#27272A]">
                        <div
                          className="bg-[#6366F1] h-2 rounded-full transition-all duration-300 shadow-sm shadow-indigo-500/50"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {item.status === 'QUEUED' && (
                    <div className="flex items-center gap-2 text-xs font-mono text-[#71717A]">
                      <Clock className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Queued in BullMQ Redis worker pipeline (Position #1)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center gap-3 w-full lg:w-auto justify-end border-t lg:border-t-0 border-[#27272A] pt-3 lg:pt-0">
                {item.status === 'COMPLETED' && (
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleCopyCaption(item)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl border border-[#27272A] bg-[#18181C] hover:bg-[#202026] px-3.5 py-2.5 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors"
                      title="Copy viral title and tags"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                          <span className="text-emerald-400 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Copy Social Copy</span>
                        </>
                      )}
                    </button>

                    <a
                      href={item.downloadUrl ?? '#'}
                      download
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all active:scale-[0.98]"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Download 1080p MP4</span>
                    </a>
                  </div>
                )}

                {item.status === 'PROCESSING' && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-2 text-xs font-semibold text-indigo-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    Rendering ({item.progress}%)
                  </span>
                )}

                {item.status === 'QUEUED' && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-500/10 border border-zinc-500/20 px-3.5 py-2 text-xs font-medium text-zinc-400">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    In Render Queue
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredExports.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#27272A] bg-[#111114] p-12 text-center space-y-3">
            <DownloadCloud className="h-8 w-8 text-[#71717A] mx-auto" />
            <h3 className="text-sm font-semibold text-white">No exports found</h3>
            <p className="text-xs text-[#94A3B8]">
              You don&apos;t have any video exports matching the &ldquo;{activeTab}&rdquo; filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
