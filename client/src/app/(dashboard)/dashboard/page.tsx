'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MOCK_PROJECTS, MockProject } from '@/lib/mock-data';
import {
  Link as LinkIcon,
  UploadCloud,
  Film,
  Clock,
  ChevronRight,
  Sliders,
  Layers,
  ArrowRight,
  Flame,
} from 'lucide-react';

type InputMode = 'url' | 'upload';
type ClipLengthOption = 'Auto' | '<30s' | '30–60s' | '60–90s';
type AspectRatioOption = '9:16' | '1:1' | '16:9';
type CaptionPresetOption = 'Hormozi Pop' | 'Karaoke' | 'Minimal' | 'None';

export default function DashboardPage(): JSX.Element {
  const router = useRouter();
  const [inputMode, setInputMode] = useState<InputMode>('url');
  const [videoUrl, setVideoUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedLength, setSelectedLength] = useState<ClipLengthOption>('30–60s');
  const [selectedAspect, setSelectedAspect] = useState<AspectRatioOption>('9:16');
  const [selectedCaption, setSelectedCaption] = useState<CaptionPresetOption>('Hormozi Pop');
  const [focusPrompt, setFocusPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lengthOptions: ClipLengthOption[] = ['Auto', '<30s', '30–60s', '60–90s'];
  const aspectOptions: AspectRatioOption[] = ['9:16', '1:1', '16:9'];
  const captionOptions: CaptionPresetOption[] = ['Hormozi Pop', 'Karaoke', 'Minimal', 'None'];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    router.push('/projects/demo-1/processing');
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-16">
      {/* Page Title & Mission */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-[#F4F4F6] flex items-center gap-2.5">
          <span>Clip Generator</span>
          <span className="rounded-full bg-[#1E1E23] border border-[#28282F] px-2.5 py-0.5 text-xs font-mono font-medium text-[#F59E0B]">
            BYOK v2.4
          </span>
        </h1>
        <p className="text-xs text-[#9E9EA8]">
          Paste raw footage or a YouTube link. FrameFlow extracts ranked viral moments, crops speakers to 9:16, and burns in word-by-word captions.
        </p>
      </div>

      {/* Hero Card: New Clip Generator Form */}
      <div className="rounded-2xl border border-[#28282F] bg-[#141417] p-6 shadow-xl space-y-6">
        {/* Ingest Tabs: Paste URL vs Upload File */}
        <div className="flex border-b border-[#28282F] pb-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setInputMode('url')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                inputMode === 'url'
                  ? 'bg-[#1E1E23] text-[#F4F4F6] border border-[#28282F] shadow-sm'
                  : 'text-[#9E9EA8] hover:text-[#F4F4F6] hover:bg-[#1E1E23]/50'
              }`}
            >
              <LinkIcon className="h-3.5 w-3.5 text-[#F59E0B]" aria-hidden="true" />
              <span>Paste Video URL</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                inputMode === 'upload'
                  ? 'bg-[#1E1E23] text-[#F4F4F6] border border-[#28282F] shadow-sm'
                  : 'text-[#9E9EA8] hover:text-[#F4F4F6] hover:bg-[#1E1E23]/50'
              }`}
            >
              <UploadCloud className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
              <span>Upload Long Video</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Tab 1: Video URL Input */}
          {inputMode === 'url' ? (
            <div className="space-y-2">
              <label htmlFor="video-url" className="text-xs font-medium text-[#9E9EA8] block">
                YouTube, Twitch, Google Drive, or Direct MP4 Link
              </label>
              <div className="relative">
                <input
                  id="video-url"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or direct .mp4..."
                  className="w-full rounded-xl border border-[#28282F] bg-[#1E1E23] px-4 py-3 text-xs text-[#F4F4F6] placeholder-[#71717A] focus:border-[#F59E0B] focus:outline-none focus:ring-1 focus:ring-[#F59E0B] transition-colors"
                />
              </div>
              <p className="text-[11px] text-[#71717A]">
                Supports up to 4 hours in 4K/1080p. Whisper transcription begins automatically upon link validation.
              </p>
            </div>
          ) : (
            /* Tab 2: Upload Dropzone */
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
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                isDragging
                  ? 'border-[#F59E0B] bg-[#1E1E23]'
                  : 'border-[#28282F] bg-[#141417] hover:border-[#3E3E47]'
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1E1E23] border border-[#28282F] text-[#F59E0B] mb-3">
                <UploadCloud className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="text-xs font-semibold text-[#F4F4F6]">Drag & drop source video file here</p>
              <p className="text-[11px] text-[#9E9EA8] mt-1">
                MP4, MOV, MKV, or WebM up to 4GB · 1080p or 4K recommended
              </p>
              <button
                type="button"
                className="mt-4 rounded-lg border border-[#28282F] bg-[#1E1E23] px-3.5 py-1.5 text-xs font-medium text-[#F4F4F6] hover:bg-[#26262D] transition-colors"
              >
                Browse Files
              </button>
            </div>
          )}

          {/* Quick Tuning Pills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            {/* Clip Length Pills */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-[#9E9EA8] block">Clip Duration</span>
              <div className="flex flex-wrap gap-1.5">
                {lengthOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedLength(opt)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium font-mono tabular-nums transition-colors ${
                      selectedLength === opt
                        ? 'bg-[#F59E0B] text-[#0C0C0E] font-bold shadow-sm'
                        : 'bg-[#1E1E23] text-[#9E9EA8] border border-[#28282F] hover:text-[#F4F4F6] hover:border-[#3E3E47]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Pills */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-[#9E9EA8] block">Aspect Ratio</span>
              <div className="flex flex-wrap gap-1.5">
                {aspectOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedAspect(opt)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium font-mono tabular-nums transition-colors ${
                      selectedAspect === opt
                        ? 'bg-[#1E1E23] text-[#10B981] border border-[#10B981] font-bold shadow-sm'
                        : 'bg-[#1E1E23] text-[#9E9EA8] border border-[#28282F] hover:text-[#F4F4F6] hover:border-[#3E3E47]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Caption Preset Pills */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-[#9E9EA8] block">Caption Template</span>
              <div className="flex flex-wrap gap-1.5">
                {captionOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedCaption(opt)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      selectedCaption === opt
                        ? 'bg-[#1E1E23] text-[#F4F4F6] border border-[#F59E0B] ring-1 ring-[#F59E0B]'
                        : 'bg-[#1E1E23] text-[#9E9EA8] border border-[#28282F] hover:text-[#F4F4F6] hover:border-[#3E3E47]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Focus Prompt */}
          <div className="space-y-2">
            <label htmlFor="focus-prompt" className="text-xs font-medium text-[#9E9EA8] flex items-center justify-between">
              <span>AI Focus Prompt (Optional)</span>
              <span className="text-[10px] text-[#71717A] font-mono">Gemini 1.5 Hook Director</span>
            </label>
            <input
              id="focus-prompt"
              type="text"
              value={focusPrompt}
              onChange={(e) => setFocusPrompt(e.target.value)}
              placeholder="e.g. Focus on contrarian startup takes, high energy debate, and actionable revenue numbers..."
              className="w-full rounded-xl border border-[#28282F] bg-[#1E1E23] px-4 py-2.5 text-xs text-[#F4F4F6] placeholder-[#71717A] focus:border-[#F59E0B] focus:outline-none focus:ring-1 focus:ring-[#F59E0B] transition-colors"
            />
          </div>

          {/* Submit Action CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] py-3.5 text-sm font-bold text-[#0C0C0E] shadow-lg shadow-amber-500/10 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
              <span>{isSubmitting ? 'Starting Extraction Pipeline...' : 'Generate Viral Shorts'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Grid of 4 Recent Long-Video Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-[#F59E0B]" aria-hidden="true" />
            <h2 className="text-sm font-bold text-[#F4F4F6]">Recent Long-Video Projects</h2>
          </div>
          <span className="text-xs font-mono text-[#71717A] tabular-nums">
            4 Loaded Projects
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_PROJECTS.map((project: MockProject) => {
            const mins = Math.floor(project.sourceDurationSec / 60);
            const secs = project.sourceDurationSec % 60;
            const durationFormatted = `${mins}m ${secs.toString().padStart(2, '0')}s`;

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group flex flex-col justify-between rounded-xl border border-[#28282F] bg-[#141417] p-3.5 hover:border-[#3E3E47] hover:bg-[#1E1E23] transition-all space-y-3 shadow-sm"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-[#28282F] bg-[#1E1E23]">
                  <img
                    src={project.thumbnailUrl}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300 opacity-80"
                  />
                  <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-white">
                    {durationFormatted}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
                      {project.channelName}
                    </span>
                    <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-[#10B981]">
                      {project.clipCount} Shorts
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-[#F4F4F6] group-hover:text-[#F59E0B] transition-colors line-clamp-2">
                    {project.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#71717A] pt-2 border-t border-[#28282F]">
                  <span className="font-mono tabular-nums">
                    {new Date(project.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1 text-[#F4F4F6] group-hover:text-[#F59E0B] font-medium">
                    <span>View Shorts</span>
                    <ChevronRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
