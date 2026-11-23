'use client';

import React, { useState } from 'react';
import {
  Flame,
  Check,
  Copy,
  Sparkles,
  TrendingUp,
  Play,
  Pause,
  MessageSquare,
  Share2,
  Bookmark,
  Heart,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface SampleClip {
  id: string;
  tabTitle: string;
  viralityScore: number;
  title: string;
  hookExplanation: string;
  hookScore: number;
  flowScore: number;
  clarityScore: number;
  duration: string;
  reframeMode: string;
  captionWords: string[];
  socialPack: {
    tiktok: { title: string; caption: string; tags: string[] };
    reels: { title: string; caption: string; tags: string[] };
    shorts: { title: string; caption: string; tags: string[] };
  };
}

const SAMPLE_CLIPS: SampleClip[] = [
  {
    id: 'clip-1',
    tabTitle: 'Clip #1 • 96/99',
    viralityScore: 96,
    title: 'The Copper Wire Physics Constraint Nobody Explains',
    hookExplanation:
      'Elena Vance opens with a stark counter-intuitive thesis: AI isn’t limited by software algorithms, but by thermal dissipation in copper interconnects. This creates an immediate open loop in the first 2.4 seconds.',
    hookScore: 98,
    flowScore: 94,
    clarityScore: 96,
    duration: '0:38',
    reframeMode: 'Solo Speaker Auto-Center',
    captionWords: ['THIS', 'CHANGES', 'THE ENTIRE', 'CHIP INDUSTRY'],
    socialPack: {
      tiktok: {
        title: 'Why AI datacenter physics will break before software does ⚡️',
        caption: 'Ever wonder why Nvidia chips cost $40,000? It’s not code. It’s copper wire physics. Watch Elena explain what happens next.',
        tags: ['#deeptech', '#technews', '#hardware', '#founderadvice'],
      },
      reels: {
        title: 'The real hardware bottleneck halting frontier AI clusters',
        caption: 'Algorithms are cheap. Thermodynamics is expensive. Dr. Elena Vance breaks down the silicon constraint nobody wants to admit.',
        tags: ['#engineering', '#siliconvalley', '#aihardware', '#techpodcast'],
      },
      shorts: {
        title: 'Why Copper Wires Are Killing AI Scaling #Shorts',
        caption: 'The invisible physical limit behind every AI data center. Full podcast interview on our channel.',
        tags: ['#Shorts', '#Tech', '#AI', '#HardwareRevolution'],
      },
    },
  },
  {
    id: 'clip-2',
    tabTitle: 'Clip #2 • 91/99',
    viralityScore: 91,
    title: 'Why Bootstrapped SaaS Always Beats Seed-Funded Bloat',
    hookExplanation:
      'Direct callout attacking vanity hiring metrics in venture capital. The speaker uses concrete numbers ($2M ARR with 3 people) which drives high comment-section debate.',
    hookScore: 94,
    flowScore: 90,
    clarityScore: 92,
    duration: '0:42',
    reframeMode: '2-Speaker Dynamic Split',
    captionWords: ['STOP', 'HIRING', 'TWENTY', 'ENGINEERS'],
    socialPack: {
      tiktok: {
        title: 'We reached $2M ARR with only 3 people. Here is how 👇',
        caption: 'Stop confusing headcount with traction. When you stay small, margins stay 90% and you actually control your company.',
        tags: ['#bootstrapping', '#saas', '#startups', '#entrepreneur'],
      },
      reels: {
        title: 'The unsexy truth about venture capital hiring traps',
        caption: 'More engineers does not mean faster shipping. Here is why the best modern software companies stay under 10 employees.',
        tags: ['#founders', '#techbusiness', '#saasgrowth', '#solopreneur'],
      },
      shorts: {
        title: 'Why VC Headcount Is A Trap #Shorts',
        caption: 'High revenue, lean team. That is how you survive 2026.',
        tags: ['#Shorts', '#Startup', '#Bootstrapping', '#Business'],
      },
    },
  },
  {
    id: 'clip-3',
    tabTitle: 'Clip #3 • 88/99',
    viralityScore: 88,
    title: 'How We Cut Cloud Egress Bills by 90% in One Afternoon',
    hookExplanation:
      'Immediate utility hook that promises actionable savings. High save-to-bookmark ratio because developers want to reference the specific network routing rule.',
    hookScore: 90,
    flowScore: 88,
    clarityScore: 94,
    duration: '0:34',
    reframeMode: 'Screen + Cam PIP',
    captionWords: ['CUT', 'AWS EGRESS', 'BY 90%', 'TODAY'],
    socialPack: {
      tiktok: {
        title: 'AWS was charging us $8,000/mo for bandwidth. We fixed it with this.',
        caption: 'One proxy rule change saved us almost $100k a year. Save this video before your next cloud bill.',
        tags: ['#developer', '#cloudcomputing', '#devops', '#techhacks'],
      },
      reels: {
        title: 'The cloud billing trick Amazon does not advertise',
        caption: 'Bandwidth fees are pure margin for cloud providers. Here is how modern infra teams bypass them safely.',
        tags: ['#softwareengineering', '#cloudops', '#coding', '#techsaver'],
      },
      shorts: {
        title: '90% Off AWS Bandwidth In 1 Minute #Shorts',
        caption: 'Simple network fix that will save your startup thousands.',
        tags: ['#Shorts', '#Coding', '#DevOps', '#AWS'],
      },
    },
  },
];

export function ViralityScoreExplorer(): JSX.Element {
  const [selectedClipIdx, setSelectedClipIdx] = useState(0);
  const [activePlatform, setActivePlatform] = useState<'tiktok' | 'reels' | 'shorts'>('tiktok');
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const clip = SAMPLE_CLIPS[selectedClipIdx];
  const pack = clip.socialPack[activePlatform];

  const handleCopy = () => {
    const text = `${pack.title}\n\n${pack.caption}\n\n${pack.tags.join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="virality-engine" className="border-t border-[#E6E4DD] bg-[#FAF9F5] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header with Editorial Serif */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E6E4DD] bg-white px-3.5 py-1 text-xs font-mono tracking-wider uppercase text-[#E84C2B] shadow-2xs">
            <Flame className="h-3.5 w-3.5 fill-current" />
            <span>AI VIRALITY AUDIT & SOCIAL AUTO-COPY</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.035em] text-[#14151A] leading-tight">
            Rank hooks before you post.{' '}
            <span className="font-editorial text-[#E84C2B] font-normal italic text-4xl sm:text-5xl block sm:inline">
              Zero guesswork.
            </span>
          </h2>

          <p className="text-[15px] text-[#52545E] leading-relaxed">
            FrameFlow analyzes retention curves, speech momentum, and emotional tension. It tells you exactly <em>why</em> a clip will perform and writes ready-to-paste social captions for every platform.
          </p>
        </div>

        {/* 3 Clickable Sample Clip Tabs */}
        <div className="flex flex-wrap gap-2.5">
          {SAMPLE_CLIPS.map((c, idx) => {
            const isSelected = selectedClipIdx === idx;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedClipIdx(idx);
                  setIsPlaying(false);
                }}
                className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#14151A] text-white shadow-md'
                    : 'bg-white text-[#52545E] border border-[#E6E4DD] hover:border-[#DCDAD2] hover:text-[#14151A]'
                }`}
              >
                <Flame
                  className={`h-3.5 w-3.5 ${
                    isSelected ? 'text-[#10B981] fill-[#10B981]' : 'text-[#8C8E9A]'
                  }`}
                />
                <span>{c.tabTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Explorer Showcase Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* LEFT: Mini 9:16 Vertical Video Preview (4 cols) */}
          <div className="lg:col-span-4 rounded-3xl border border-[#272935] bg-[#121318] p-5 shadow-xl text-white flex flex-col justify-between select-none">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-white/10 pb-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {clip.viralityScore}/99 VIRAL
              </span>
              <span>{clip.duration}</span>
            </div>

            {/* Video Canvas Stage */}
            <div className="relative aspect-[9/16] w-full rounded-2xl bg-[#090A0E] border border-white/5 overflow-hidden my-3 flex flex-col justify-between p-4">
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#E84C2B] to-amber-500 blur-2xl" />
              </div>

              {/* Layout mode tag */}
              <div className="relative z-10 flex justify-between items-center text-[10px] font-mono">
                <span className="bg-black/60 px-2 py-0.5 rounded-full text-zinc-300 border border-white/10">
                  {clip.reframeMode}
                </span>
              </div>

              {/* Center Play Button */}
              <div className="relative z-10 my-auto flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="h-12 w-12 rounded-full bg-[#E84C2B] hover:bg-[#D13B1C] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  )}
                </button>
              </div>

              {/* Animated Captions */}
              <div className="relative z-10 text-center">
                <div className="inline-flex flex-wrap items-center justify-center gap-1 p-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10">
                  {clip.captionWords.map((word, wIdx) => (
                    <span
                      key={word}
                      className={`text-xs font-black uppercase tracking-tight ${
                        wIdx === 1
                          ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                          : 'text-white'
                      }`}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-2 border-t border-white/10">
              <span>Auto 9:16 Reframe</span>
              <span className="text-[#10B981]">Safe Zones OK</span>
            </div>
          </div>

          {/* RIGHT: Metric Score Gauges & Auto-Copy Generator (8 cols) */}
          <div className="lg:col-span-8 rounded-3xl border border-[#E6E4DD] bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Title & Score Ribbon */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E4DD] pb-4">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C8E9A] font-semibold">
                    Extracted Candidate #{selectedClipIdx + 1}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#14151A] tracking-tight">
                    {clip.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-300 px-3.5 py-1.5 text-center">
                    <span className="text-xs font-mono text-[#52545E] block leading-none">
                      Retention Index
                    </span>
                    <span className="text-lg font-mono font-bold text-emerald-800 leading-none">
                      {clip.viralityScore}/99
                    </span>
                  </div>
                </div>
              </div>

              {/* Score Metric Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-[#FAF9F5] border border-[#E6E4DD] p-4 space-y-1">
                  <span className="text-xs font-mono text-[#52545E]">Hook Strength</span>
                  <div className="flex items-baseline justify-between">
                    <strong className="text-xl font-mono text-[#14151A]">{clip.hookScore}</strong>
                    <span className="text-[11px] text-emerald-600 font-bold">First 3 Seconds</span>
                  </div>
                  <div className="w-full bg-[#E6E4DD] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#E84C2B] h-full rounded-full"
                      style={{ width: `${clip.hookScore}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-[#FAF9F5] border border-[#E6E4DD] p-4 space-y-1">
                  <span className="text-xs font-mono text-[#52545E]">Flow & Pacing</span>
                  <div className="flex items-baseline justify-between">
                    <strong className="text-xl font-mono text-[#14151A]">{clip.flowScore}</strong>
                    <span className="text-[11px] text-emerald-600 font-bold">Zero Dead Air</span>
                  </div>
                  <div className="w-full bg-[#E6E4DD] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#10B981] h-full rounded-full"
                      style={{ width: `${clip.flowScore}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-[#FAF9F5] border border-[#E6E4DD] p-4 space-y-1">
                  <span className="text-xs font-mono text-[#52545E]">Topic Clarity</span>
                  <div className="flex items-baseline justify-between">
                    <strong className="text-xl font-mono text-[#14151A]">{clip.clarityScore}</strong>
                    <span className="text-[11px] text-emerald-600 font-bold">High Replay Value</span>
                  </div>
                  <div className="w-full bg-[#E6E4DD] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${clip.clarityScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Plain English "Why It Will Go Viral" Callout */}
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Sparkles className="h-3.5 w-3.5 text-[#E84C2B]" />
                  <span>Why this moment converts:</span>
                </div>
                <p className="text-amber-900/90 leading-relaxed italic">
                  &ldquo;{clip.hookExplanation}&rdquo;
                </p>
              </div>

              {/* Auto-Generated Social Copy Drawer */}
              <div className="rounded-2xl border border-[#E6E4DD] bg-[#FAF9F5] p-5 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E4DD] pb-3">
                  <div className="flex items-center gap-1.5">
                    {(['tiktok', 'reels', 'shorts'] as const).map((plat) => (
                      <button
                        key={plat}
                        type="button"
                        onClick={() => setActivePlatform(plat)}
                        className={`rounded-xl px-3 py-1 text-xs font-bold font-mono uppercase transition-all cursor-pointer ${
                          activePlatform === plat
                            ? 'bg-[#14151A] text-white shadow-2xs'
                            : 'text-[#52545E] hover:text-[#14151A]'
                        }`}
                      >
                        {plat === 'tiktok' ? 'TikTok' : plat === 'reels' ? 'Instagram Reels' : 'YouTube Shorts'}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCDAD2] bg-white px-3.5 py-1.5 text-xs font-bold text-[#14151A] hover:bg-[#FAF9F5] transition-all shadow-2xs cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-[#E84C2B]" />
                        <span>Copy Caption & Tags</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-[#14151A]">{pack.title}</p>
                  <p className="text-xs text-[#52545E] leading-relaxed">{pack.caption}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {pack.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-white border border-[#E6E4DD] px-2 py-0.5 text-[10px] font-mono text-[#E84C2B] font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA Link */}
            <div className="pt-2 flex items-center justify-between text-xs text-[#52545E]">
              <span>Ready to test on your own footage?</span>
              <a
                href="/projects/demo-1"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E84C2B] hover:text-[#D13B1C] transition-colors"
              >
                <span>View Full 8-Short Ranked Feed</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
