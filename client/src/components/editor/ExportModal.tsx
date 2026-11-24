'use client';

import React, { useState } from 'react';
import { apiFetch } from '@/lib/api';
import {
  X,
  Download,
  Film,
  FileCode,
  FileText,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Check,
} from 'lucide-react';

export type ExportFormat = 'mp4' | 'xml' | 'subtitles';
export type ExportResolution = '1080p' | '4k';
export type ExportFps = '60' | '30';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clipTitle: string;
  durationSec: number;
  clipId?: string;
}

export function ExportModal({
  isOpen,
  onClose,
  clipTitle,
  durationSec,
  clipId,
}: ExportModalProps): JSX.Element | null {
  const [format, setFormat] = useState<ExportFormat>('mp4');
  const [resolution, setResolution] = useState<ExportResolution>('1080p');
  const [fps, setFps] = useState<ExportFps>('60');
  const [removeWatermark, setRemoveWatermark] = useState<boolean>(true);
  const [subtitleFormat, setSubtitleFormat] = useState<'srt' | 'vtt' | 'txt'>('srt');

  // Simulated Rendering States
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);
  const [renderStage, setRenderStage] = useState<string>('');
  const [renderComplete, setRenderComplete] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsRendering(true);
    setRenderProgress(10);
    setRenderStage('Compiling timeline AST and video tracks...');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('frameflow_token') : null;
      if (token && clipId) {
        let exportFormat = 'mp4_1080p';
        if (format === 'mp4') {
          exportFormat = resolution === '4k' ? 'mp4_4k' : 'mp4_1080p';
        } else if (format === 'xml') {
          exportFormat = 'fcpxml_premiere';
        } else if (format === 'subtitles') {
          exportFormat = subtitleFormat === 'vtt' ? 'subtitles_vtt' : subtitleFormat === 'txt' ? 'transcript_txt' : 'subtitles_srt';
        }

        await apiFetch(`/api/clips/${clipId}/export`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            format: exportFormat,
            includeWatermark: !removeWatermark,
          }),
        });
      }
    } catch (err) {
      console.warn('Export API call warning:', err);
    }

    setTimeout(() => {
      setRenderProgress(35);
      setRenderStage('Baking animated word-by-word subtitles...');
    }, 500);

    setTimeout(() => {
      setRenderProgress(70);
      setRenderStage('Encoding 1080p 60fps NVENC MP4 stream...');
    }, 1100);

    setTimeout(() => {
      setRenderProgress(100);
      setRenderStage('Export ready for download!');
      setIsRendering(false);
      setRenderComplete(true);
    }, 1800);
  };

  const handleDownload = () => {
    // Simulated file download
    const cleanFileName = clipTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const extension = format === 'mp4' ? 'mp4' : format === 'xml' ? 'xml' : subtitleFormat;
    const blob = new Blob([`FrameFlow Export: ${clipTitle}\nDuration: ${durationSec}s`], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cleanFileName}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const resetAndClose = () => {
    setIsRendering(false);
    setRenderProgress(0);
    setRenderComplete(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14151A]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#E6E4DD] space-y-6 text-[#14151A]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F0EFEA] pb-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-[#14151A] flex items-center gap-2">
              <Download className="h-4 w-4 text-[#E84C2B]" />
              <span>Export Video &amp; NLE Project</span>
            </h3>
            <p className="text-xs text-[#52545E] truncate max-w-[360px]">
              {clipTitle} &bull; {durationSec.toFixed(1)}s
            </p>
          </div>

          <button
            type="button"
            onClick={resetAndClose}
            className="p-1.5 rounded-lg text-[#8C8E9A] hover:text-[#14151A] hover:bg-[#FAF9F5] transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {renderComplete ? (
          /* Render Success State */
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-[#14151A]">Export Ready!</h4>
              <p className="text-xs text-[#52545E]">
                Rendered clean at <strong>{resolution.toUpperCase()} {fps}fps</strong> with zero watermark.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E6E4DD] text-xs font-mono space-y-1 text-left">
              <div className="flex justify-between">
                <span className="text-[#8C8E9A]">Format:</span>
                <span className="font-bold uppercase">{format === 'subtitles' ? subtitleFormat : format}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C8E9A]">Resolution:</span>
                <span>{resolution === '4k' ? '3840x2160' : '1080x1920 (9:16)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C8E9A]">Est. File Size:</span>
                <span className="font-bold text-[#14151A]">28.4 MB</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] text-white py-3 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download File Now</span>
              </button>
              <button
                type="button"
                onClick={resetAndClose}
                className="w-full py-2 text-xs font-semibold text-[#8C8E9A] hover:text-[#14151A]"
              >
                Back to Studio Editor
              </button>
            </div>
          </div>
        ) : isRendering ? (
          /* Live Progress Bar State */
          <div className="py-8 space-y-5 text-center">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 text-[#E84C2B] animate-spin" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-[#14151A]">
                Rendering Viral Short ({renderProgress}%)
              </h4>
              <p className="text-xs font-mono text-[#52545E]">{renderStage}</p>
            </div>

            {/* Progress Track */}
            <div className="h-2.5 w-full bg-[#E6E4DD] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E84C2B] rounded-full transition-all duration-300"
                style={{ width: `${renderProgress}%` }}
              />
            </div>

            <p className="text-[11px] font-mono text-[#8C8E9A]">
              Cloud GPU acceleration active &bull; No CPU throttle
            </p>
          </div>
        ) : (
          /* Format Configuration State */
          <div className="space-y-5">
            {/* 3 Format Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-[#FAF9F5] border border-[#E6E4DD]">
              {[
                { id: 'mp4', label: 'MP4 Video', icon: Film },
                { id: 'xml', label: 'Premiere / NLE', icon: FileCode, badge: 'PRO' },
                { id: 'subtitles', label: 'Subtitles / Text', icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = format === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFormat(tab.id as ExportFormat)}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-white text-[#14151A] shadow-xs border border-[#E6E4DD]'
                        : 'text-[#52545E] hover:text-[#14151A]'
                    }`}
                  >
                    <Icon className={`h-4 w-4 mb-1 ${isSelected ? 'text-[#E84C2B]' : 'text-[#8C8E9A]'}`} />
                    <span className="text-[11px]">{tab.label}</span>
                    {tab.badge && (
                      <span className="absolute top-1 right-1 text-[9px] font-mono font-bold bg-[#E84C2B] text-white px-1 py-0.2 rounded">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Format-Specific Options */}
            {format === 'mp4' && (
              <div className="space-y-4">
                {/* Resolution & FPS */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#14151A] block">Resolution</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setResolution('1080p')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          resolution === '1080p'
                            ? 'border-[#E84C2B] bg-[#FAF3EE] text-[#E84C2B]'
                            : 'border-[#E6E4DD] bg-white text-[#52545E]'
                        }`}
                      >
                        1080p (FHD)
                      </button>
                      <button
                        type="button"
                        onClick={() => setResolution('4k')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          resolution === '4k'
                            ? 'border-[#E84C2B] bg-[#FAF3EE] text-[#E84C2B]'
                            : 'border-[#E6E4DD] bg-white text-[#52545E]'
                        }`}
                      >
                        4K (Ultra)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#14151A] block">Framerate</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFps('60')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          fps === '60'
                            ? 'border-[#E84C2B] bg-[#FAF3EE] text-[#E84C2B]'
                            : 'border-[#E6E4DD] bg-white text-[#52545E]'
                        }`}
                      >
                        60 FPS
                      </button>
                      <button
                        type="button"
                        onClick={() => setFps('30')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          fps === '30'
                            ? 'border-[#E84C2B] bg-[#FAF3EE] text-[#E84C2B]'
                            : 'border-[#E6E4DD] bg-white text-[#52545E]'
                        }`}
                      >
                        30 FPS
                      </button>
                    </div>
                  </div>
                </div>

                {/* Watermark Removal Toggle */}
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-[#14151A] block">
                        No FrameFlow Watermark
                      </span>
                      <span className="text-[10px] text-emerald-800">
                        Pro / Max Plan Active &bull; Clean commercial export
                      </span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={removeWatermark}
                      onChange={(e) => setRemoveWatermark(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#DCDAD2] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#DCDAD2] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
                  </label>
                </div>
              </div>
            )}

            {format === 'xml' && (
              <div className="p-4 rounded-xl border border-[#E6E4DD] bg-[#FAF9F5] space-y-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#14151A]">
                  <Sparkles className="h-4 w-4 text-[#E84C2B]" />
                  <span>Pro NLE Timeline Export</span>
                </div>
                <p className="text-[11px] text-[#52545E] leading-relaxed">
                  Export complete non-destructive timeline sequences with split audio, video, B-roll layers, and subtitle markers directly into:
                </p>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center gap-2 text-[#14151A]">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Adobe Premiere Pro XML (.xml)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#14151A]">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>DaVinci Resolve Timeline (.edl / .xml)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#14151A]">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Final Cut Pro FCPXML</span>
                  </div>
                </div>
              </div>
            )}

            {format === 'subtitles' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#14151A] block">Subtitle Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'srt', label: 'SRT Subtitles' },
                    { id: 'vtt', label: 'WebVTT (.vtt)' },
                    { id: 'txt', label: 'Plain Text + Timings' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSubtitleFormat(sub.id as 'srt' | 'vtt' | 'txt')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        subtitleFormat === sub.id
                          ? 'border-[#E84C2B] bg-[#FAF3EE] text-[#E84C2B]'
                          : 'border-[#E6E4DD] bg-white text-[#52545E]'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartExport}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] text-white py-3 px-4 text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>Start Render &amp; Export</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
