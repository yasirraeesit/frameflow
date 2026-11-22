'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FileAudio,
  Sparkles,
  Bot,
  Crop,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Terminal,
  Activity,
} from 'lucide-react';

interface PipelineStep {
  id: number;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  startProgress: number;
  endProgress: number;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 1,
    label: 'Ingesting Audio & Demuxing',
    description: 'Separating 16kHz audio stream, applying noise reduction & loudness normalization.',
    icon: FileAudio,
    startProgress: 0,
    endProgress: 25,
  },
  {
    id: 2,
    label: 'Whisper Word Timestamps',
    description: 'Extracting frame-accurate word boundary timings, punctuation, and speaker turns.',
    icon: Sparkles,
    startProgress: 25,
    endProgress: 50,
  },
  {
    id: 3,
    label: 'AI Viral Scoring & Hook Detection',
    description: 'Multimodal LLM evaluating hook potency, pacing, and retention drop-off probability.',
    icon: Bot,
    startProgress: 50,
    endProgress: 75,
  },
  {
    id: 4,
    label: 'Auto 9:16 Reframe & Captions',
    description: 'YOLOv8 face tracking dynamic crop + generating Hormozi animated subtitle overlays.',
    icon: Crop,
    startProgress: 75,
    endProgress: 100,
  },
];

const LOG_MESSAGES = [
  'Initialized FFprobe demuxer on source stream...',
  'Audio stream separated: 48kHz stereo -> 16kHz mono PCM buffer',
  'Whisper v3 turbo loaded into GPU memory (78ms latency)',
  'Detected 2 speakers across 1,842 transcribed tokens',
  'Prompting Gemini 1.5 Pro Hook Detector with full conversation AST...',
  'Extracted 8 high-scoring candidate segments (Score > 75)',
  'Top hook found at offset 02:22.00 (Virality Score 97)',
  'Generating 9:16 crop box with YOLOv8 face-tracking coordinates...',
  'Composing Hormozi animated subtitle layers...',
  'Synthesizing final viral short package...',
];

export default function ProcessingPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.id as string) || 'demo-1';

  const [progress, setProgress] = useState(12);
  const [logs, setLogs] = useState<string[]>([LOG_MESSAGES[0], LOG_MESSAGES[1]]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const increment = Math.floor(Math.random() * 6) + 3;
        const next = Math.min(prev + increment, 100);

        // Add log messages based on progress milestones
        const logIndex = Math.floor((next / 100) * LOG_MESSAGES.length);
        if (logIndex < LOG_MESSAGES.length) {
          setLogs((l) => {
            const nextMsg = LOG_MESSAGES[logIndex];
            if (!l.includes(nextMsg)) {
              return [...l, nextMsg];
            }
            return l;
          });
        }

        return next;
      });
    }, 450);

    return () => clearInterval(timer);
  }, []);

  // When progress reaches 100, automatically redirect to results feed
  useEffect(() => {
    if (progress >= 100) {
      const redirectTimer = setTimeout(() => {
        router.push(`/projects/${projectId}`);
      }, 700);
      return () => clearTimeout(redirectTimer);
    }
  }, [progress, projectId, router]);

  const handleSkip = () => {
    router.push(`/projects/${projectId}`);
  };

  const currentStep =
    PIPELINE_STEPS.find(
      (s) => progress >= s.startProgress && progress < s.endProgress
    ) || PIPELINE_STEPS[PIPELINE_STEPS.length - 1];

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#27272A] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              BullMQ Worker Pipeline Active
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Analyzing Video & Generating Shorts
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Project <span className="font-mono text-white">{projectId}</span> · Extracting 8 viral hooks with Whisper v3 & Gemini 1.5 Pro
          </p>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="flex items-center gap-1.5 rounded-xl border border-[#27272A] bg-[#111114] px-4 py-2 text-xs font-semibold text-white hover:bg-[#18181C] hover:border-[#3F3F46] transition-all"
        >
          <span>Skip to Results</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Main Progress Gauge Card */}
      <div className="rounded-2xl border border-[#27272A] bg-[#111114] p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-white">Pipeline Execution</span>
            <p className="text-[11px] text-[#94A3B8] font-mono">
              Current Step: <strong className="text-indigo-400">{currentStep.label}</strong>
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {progress}%
            </span>
          </div>
        </div>

        {/* Outer Progress Bar */}
        <div className="w-full bg-[#18181C] rounded-full h-3 overflow-hidden border border-[#27272A] p-0.5">
          <div
            className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 4 Steps Interactive Tracker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {PIPELINE_STEPS.map((step) => {
            const isFinished = progress >= step.endProgress;
            const isCurrent = progress >= step.startProgress && progress < step.endProgress;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`rounded-xl border p-3.5 flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-[#6366F1] bg-[#18181C] shadow-md ring-1 ring-[#6366F1]/50'
                    : isFinished
                    ? 'border-[#27272A] bg-[#141418]'
                    : 'border-[#1E1E22] bg-[#111114] opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                      isCurrent
                        ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400'
                        : isFinished
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                        : 'border-[#27272A] bg-[#18181C] text-[#71717A]'
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>

                  {isFinished ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" aria-hidden="true" />
                  ) : (
                    <span className="text-[10px] font-mono text-[#71717A]">Step {step.id}</span>
                  )}
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-xs font-semibold text-white">{step.label}</h3>
                  <p className="text-[10px] text-[#94A3B8] line-clamp-2 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Streaming Terminal Log Box */}
      <div className="rounded-2xl border border-[#27272A] bg-[#0C0C0E] overflow-hidden shadow-lg">
        <div className="flex items-center justify-between border-b border-[#27272A] px-4 py-2.5 bg-[#141418]">
          <div className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-indigo-400" aria-hidden="true" />
            <span className="text-xs font-mono font-medium text-white">Redis Pub/Sub Stream Logs</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <Activity className="h-3 w-3" aria-hidden="true" />
            Live WebSocket
          </span>
        </div>

        <div className="p-4 font-mono text-xs text-[#94A3B8] space-y-1.5 max-h-52 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-[#71717A] shrink-0 text-[11px] tabular-nums">
                [{new Date().toLocaleTimeString()}]
              </span>
              <span className={index === logs.length - 1 ? 'text-emerald-400 font-semibold' : 'text-[#F8FAFC]'}>
                {log}
              </span>
            </div>
          ))}
          {progress < 100 && (
            <div className="flex items-center gap-2 text-indigo-400 pt-1">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              <span className="text-[11px]">Processing next audio chunk...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
