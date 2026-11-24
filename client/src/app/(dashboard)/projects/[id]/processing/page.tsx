'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  FileAudio,
  Sparkles,
  Bot,
  Crop,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Clock,
  Coins,
  Check,
  Mail,
  Film,
  Zap,
  Play,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface PipelineStage {
  id: number;
  label: string;
  description: string;
  startProgress: number;
  endProgress: number;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 1,
    label: 'Ingesting & Extracting Clean Audio',
    description: 'Separating 48kHz audio stream, applying neural noise reduction & loudness leveling.',
    startProgress: 0,
    endProgress: 25,
  },
  {
    id: 2,
    label: 'Word-Level Transcription & Speaker Diarization',
    description: 'Extracting frame-accurate word boundary timestamps and 2-speaker conversational turns.',
    startProgress: 25,
    endProgress: 55,
  },
  {
    id: 3,
    label: 'Scoring Viral Hooks & Retention Peaks',
    description: 'Evaluating hook potency, conversational pacing, and retention drop-off probability (1–99).',
    startProgress: 55,
    endProgress: 82,
  },
  {
    id: 4,
    label: 'Auto-Reframing 9:16 & Rendering Captions',
    description: 'Composing active speaker face tracking and burning animated Hormozi subtitle layers.',
    startProgress: 82,
    endProgress: 100,
  },
];

export default function ProcessingPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.id as string) || 'demo-1';

  const [progress, setProgress] = useState<number>(projectId === 'demo-1' ? 58 : 10);
  const [notifyByEmail, setNotifyByEmail] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Poll real project status every 2 seconds, or run smooth progress for demo
  useEffect(() => {
    if (projectId === 'demo-1') {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          const inc = Math.floor(Math.random() * 4) + 2;
          return Math.min(100, prev + inc);
        });
      }, 450);
      return () => clearInterval(timer);
    }

    let isCancelled = false;

    const pollProject = async () => {
      try {
        const res = await apiFetch(`/api/projects/${projectId}`);
        if (res.ok) {
          const data = await res.json();
          const p = data.project;
          if (p) {
            if (p.progressPercent !== undefined) {
              setProgress(p.progressPercent);
            }
            if (p.status === 'COMPLETED') {
              setProgress(100);
              setTimeout(() => {
                if (!isCancelled) {
                  router.push(`/projects/${projectId}`);
                }
              }, 600);
            } else if (p.status === 'FAILED') {
              setErrorMessage(p.errorMessage || 'AI pipeline encountered an error. Deducted credits were automatically refunded.');
            }
          }
        }
      } catch (err) {
        console.warn('Project polling error:', err);
      }
    };

    pollProject();
    const pollInterval = setInterval(pollProject, 2000);
    return () => {
      isCancelled = true;
      clearInterval(pollInterval);
    };
  }, [projectId, router]);

  // Compute remaining seconds based on progress
  const secondsRemaining = Math.max(5, Math.round(((100 - progress) / 100) * 80));

  return (
    <div className="bg-[#FAF9F5] min-h-[calc(100vh-3.5rem)] flex flex-col justify-center py-10 px-4 text-[#14151A] select-none antialiased">
      {/* ========================================================= */}
      {/* CENTERED PROCESSING CARD                                  */}
      {/* ========================================================= */}
      <div className="max-w-[680px] w-full mx-auto bg-white border border-[#E6E4DD] rounded-2xl p-5 sm:p-8 shadow-[0_14px_40px_rgba(20,21,26,0.06)] space-y-7">
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900">Processing Failed</p>
                <p className="mt-0.5 text-red-800 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Link
                href="/dashboard?tab=upload"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#E84C2B] text-white text-xs font-semibold rounded-lg hover:bg-[#D03B1C] transition-colors shadow-sm"
              >
                Refunded — Try Uploading MP4 Instead
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E6E4DD] text-[#52545E] text-xs font-semibold rounded-lg hover:text-[#14151A] hover:bg-neutral-50 transition-colors"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        )}
        {/* Top Source Video Pill */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-[#E6E4DD] bg-[#FAF9F5]/70">
          <div className="flex items-center gap-3 min-w-0">
            {/* Thumbnail */}
            <div className="relative h-12 w-16 rounded-lg bg-cover bg-center shrink-0 border border-[#E6E4DD] overflow-hidden"
              style={{
                backgroundImage:
                  'url(https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80)',
              }}
            >
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Play className="h-3.5 w-3.5 text-white fill-white/80" />
              </div>
              <div className="absolute bottom-0.5 right-0.5 bg-black/80 text-[8px] font-mono text-white px-1 rounded">
                58:14
              </div>
            </div>

            {/* Video Meta */}
            <div className="truncate">
              <h3 className="text-xs font-bold text-[#14151A] truncate max-w-[320px] sm:max-w-[380px]">
                Building a $10M SaaS Without VC Funding — Founder Podcast
              </h3>
              <p className="text-[11px] text-[#52545E] flex items-center gap-2 mt-0.5">
                <span>Duration: 58:14</span>
                <span>&bull;</span>
                <span>Source: YouTube 4K</span>
              </p>
            </div>
          </div>

          {/* Credits Used Badge */}
          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#FFF8F6] text-[#E84C2B] border border-[#E84C2B]/25 font-mono font-bold text-xs px-3 py-1 shadow-2xs">
            <Coins className="h-3 w-3" />
            <span>58 credits used</span>
          </span>
        </div>

        {/* Progress Header & Animated Bar */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-xs font-mono uppercase tracking-wider text-[#E84C2B] font-bold flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 animate-pulse" />
                <span>AI Processing In Progress</span>
              </span>
              <p className="text-xs text-[#52545E]">
                Extracting high-retention shorts with AI Virality Scoring
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black font-mono text-[#14151A] tabular-nums">
                {progress}%
              </span>
              <div className="text-[10px] font-mono text-[#8C8E9A]">
                ~{secondsRemaining}s remaining
              </div>
            </div>
          </div>

          {/* Cinema Coral Progress Bar */}
          <div className="w-full bg-[#FAF9F5] rounded-full h-3 overflow-hidden border border-[#E6E4DD] p-0.5">
            <div
              className="bg-[#E84C2B] h-full rounded-full transition-all duration-300 ease-out shadow-xs"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 4-Stage Real-Time Pipeline Checklist */}
        <div className="space-y-2.5 pt-1 border-t border-[#F0EFEA]">
          <span className="text-[11px] font-mono font-bold text-[#8C8E9A] uppercase tracking-wider block mb-1">
            Pipeline Verification Stages
          </span>

          <div className="space-y-2">
            {PIPELINE_STAGES.map((stage) => {
              const isCompleted = progress >= stage.endProgress;
              const isActive = progress >= stage.startProgress && progress < stage.endProgress;
              const isQueued = progress < stage.startProgress;

              return (
                <div
                  key={stage.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${isActive
                      ? 'border-[#E84C2B] bg-[#FAF3EE] shadow-2xs'
                      : isCompleted
                        ? 'border-emerald-200/80 bg-emerald-50/50'
                        : 'border-[#E6E4DD] bg-[#FAF9F5] opacity-60'
                    }`}
                >
                  {/* Status Indicator Icon */}
                  <div className="shrink-0 mt-0.5">
                    {isCompleted ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    ) : isActive ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E84C2B] text-white shadow-2xs">
                        <Loader2 className="h-3 w-3 animate-spin" />
                      </div>
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#DCDAD2] bg-white text-[#8C8E9A] text-[10px] font-mono font-bold">
                        {stage.id}
                      </div>
                    )}
                  </div>

                  {/* Stage Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-xs font-bold ${isActive ? 'text-[#E84C2B]' : isCompleted ? 'text-[#14151A]' : 'text-[#8C8E9A]'
                          }`}
                      >
                        {stage.label}
                      </h4>
                      <span
                        className={`text-[10px] font-mono uppercase font-bold px-1.5 py-0.2 rounded ${isCompleted
                            ? 'text-emerald-700 bg-emerald-100/70'
                            : isActive
                              ? 'text-[#E84C2B] bg-white border border-[#E84C2B]/30'
                              : 'text-[#8C8E9A]'
                          }`}
                      >
                        {isCompleted ? 'Completed' : isActive ? 'Processing' : 'Queued'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#52545E] mt-0.5 leading-snug">
                      {stage.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="pt-2 border-t border-[#F0EFEA] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#52545E]">
            {/* Notify Me Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifyByEmail}
                onChange={(e) => setNotifyByEmail(e.target.checked)}
                className="h-4 w-4 rounded border-[#DCDAD2] text-[#E84C2B] focus:ring-[#E84C2B]"
              />
              <span className="flex items-center gap-1.5 font-medium text-[#14151A]">
                <Mail className="h-3.5 w-3.5 text-[#52545E]" />
                <span>Notify me by email when ready</span>
              </span>
            </label>

            <span className="text-[10px] font-mono text-[#8C8E9A]">
              Cloud Pipeline: GPU Cluster #fra-04
            </span>
          </div>

          {/* Jump to Results Button */}
          <Link
            href={`/projects/${projectId}`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] text-white py-3 px-4 text-xs sm:text-sm font-bold transition-all shadow-md active:scale-[0.98]"
          >
            <span>{progress >= 100 ? 'View Generated Shorts Now' : 'Skip & View Generated Shorts Now'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
