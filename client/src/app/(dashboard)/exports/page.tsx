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
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-[#14151A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E6E4DD] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <DownloadCloud className="h-5 w-5 text-[#E84C2B]" aria-hidden="true" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#14151A]">
              Exports History
            </h1>
          </div>
          <p className="text-xs text-[#52545E] mt-1">
            Production-rendered 1080p MP4 shorts with ready-to-publish AI viral titles, hooks, and optimized hashtag bundles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 rounded-xl border border-[#DCDAD2] bg-white px-3.5 py-2 text-xs font-semibold text-[#14151A] hover:bg-[#FAF9F5] transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-[#E84C2B]' : 'text-[#52545E]'}`} aria-hidden="true" />
            <span>Refresh Queue</span>
          </button>
          <a
            href={MOCK_EXPORTS[0]?.downloadUrl ?? '#'}
            download
            className="flex items-center gap-1.5 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-[0.98]"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Download All Completed (.zip)</span>
          </a>
        </div>
      </div>

      {/* Filter Tabs & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 rounded-xl border border-[#E6E4DD] bg-white p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${activeTab === 'ALL'
              ? 'bg-[#14151A] text-white shadow-sm'
              : 'text-[#52545E] hover:text-[#14151A]'
              }`}
          >
            All Exports ({exportsList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('COMPLETED')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${activeTab === 'COMPLETED'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'text-[#52545E] hover:text-[#14151A]'
              }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            Completed ({completedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PROCESSING')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${activeTab === 'PROCESSING'
              ? 'bg-[#FAF3EE] text-[#E84C2B] border border-[#E84C2B]/30'
              : 'text-[#52545E] hover:text-[#14151A]'
              }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#E84C2B] animate-pulse" />
            In Queue ({processingCount})
          </button>
        </div>

        <div className="text-xs font-mono text-[#8C8E9A] tabular-nums">
          Storage: <span className="text-[#14151A] font-semibold">90.5 MB</span> · FFmpeg v7.0 NVENC accelerated
        </div>
      </div>

      {/* Exports List Cards */}
      <div className="space-y-4">
        {filteredExports.map((item) => {
          const isCopied = copiedId === item.id;

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-[#E6E4DD] bg-white p-5 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Mini Preview Thumbnail */}
                <div className="relative h-20 w-12 sm:h-24 sm:w-14 rounded-xl bg-[#121318] border border-[#2A2B36] flex flex-col justify-between p-1 overflow-hidden shrink-0 shadow-inner">
                  <div className="h-0.5 w-4 rounded-full bg-white/20 mx-auto mt-0.5" />
                  <div className="my-auto flex justify-center">
                    <FileVideo className="h-4 w-4 text-[#E84C2B]" />
                  </div>
                  <span className="text-[8px] font-mono text-zinc-400 text-center block pb-0.5">
                    {item.aspectRatio}
                  </span>
                </div>

                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.status === 'COMPLETED' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        COMPLETED
                      </span>
                    ) : item.status === 'PROCESSING' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF3EE] border border-[#E84C2B]/30 px-2 py-0.5 text-[10px] font-mono font-bold text-[#E84C2B]">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        RENDERING {item.progress}%
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-[10px] font-mono font-semibold text-zinc-600">
                        <Clock className="h-3 w-3" />
                        QUEUED
                      </span>
                    )}

                    <span className="text-[11px] font-mono text-[#8C8E9A]">
                      {item.resolution} • {item.format.toUpperCase()} • {item.fps}fps
                    </span>
                    {item.fileSizeMb && (
                      <>
                        <span className="text-[#C5C3BC]">•</span>
                        <span className="text-[11px] font-mono text-[#52545E]">
                          {item.fileSizeMb} MB
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[#14151A] truncate">
                    {item.clipTitle}
                  </h3>

                  {item.aiTitle && (
                    <p className="text-xs text-[#52545E] line-clamp-1">
                      <span className="font-semibold text-[#14151A]">Viral Title:</span> {item.aiTitle}
                    </p>
                  )}

                  {/* Hashtag bundle */}
                  {item.hashtags && item.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 text-[10px] font-mono text-[#E84C2B] pt-0.5">
                      {item.hashtags.slice(0, 4).map((tag) => (
                        <span key={tag} className="bg-[#FAF3EE] px-1.5 py-0.5 rounded border border-[#E84C2B]/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-[#F0EFEA]">
                {item.status === 'COMPLETED' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleCopyCaption(item)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-[#DCDAD2] bg-white hover:bg-[#FAF9F5] px-3.5 py-2 text-xs font-semibold text-[#14151A] transition-colors shadow-2xs cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-[#52545E]" />
                          <span>Copy Social Pack</span>
                        </>
                      )}
                    </button>

                    <a
                      href={item.downloadUrl}
                      download
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-[0.98]"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download MP4</span>
                    </a>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-[#8C8E9A] font-mono">
                    <Loader2 className="h-4 w-4 animate-spin text-[#E84C2B]" />
                    <span>Transcoding 1080p...</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
