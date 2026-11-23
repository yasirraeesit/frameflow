'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Link as LinkIcon,
  Flame,
  Sparkles,
  Heart,
  MessageCircle,
  Bookmark,
  Disc,
  Battery,
  SlidersHorizontal,
  Info,
  Check,
} from 'lucide-react';

type LayoutMode = 'single' | 'split' | 'screen_cam';

export function HeroOverlappingStage(): JSX.Element {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState('');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('single');
  const [phone1WordIdx, setPhone1WordIdx] = useState(0);
  const [phone2WordIdx, setPhone2WordIdx] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Phone 1: Hormozi caption words ("NOBODY" "CARES" "ABOUT YOUR" "ROADMAP")
  const captionWordsPhone1 = [
    { text: 'NOBODY', highlight: true },
    { text: 'CARES', highlight: true },
    { text: 'ABOUT YOUR', highlight: false },
    { text: 'ROADMAP', highlight: true },
  ];

  // Phone 2: 2-Speaker kinetic hook words ("HERE'S HOW" "WE ACTUALLY" "SCALED")
  const captionWordsPhone2 = [
    { text: "HERE'S HOW", highlight: false },
    { text: 'WE ACTUALLY', highlight: false },
    { text: 'SCALED', highlight: true },
  ];

  // Auto-cycle kinetic captions
  useEffect(() => {
    const timer1 = setInterval(() => {
      setPhone1WordIdx((prev) => (prev + 1) % captionWordsPhone1.length);
    }, 500);
    const timer2 = setInterval(() => {
      setPhone2WordIdx((prev) => (prev + 1) % captionWordsPhone2.length);
    }, 650);
    return () => {
      clearInterval(timer1);
      clearInterval(timer2);
    };
  }, [captionWordsPhone1.length, captionWordsPhone2.length]);

  const handleGetClips = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/projects/demo-1/processing');
  };

  const handleSamplePodcast = () => {
    setVideoUrl('https://www.youtube.com/watch?v=hardware-revolution-elena-vance');
    setTimeout(() => {
      router.push('/projects/demo-1/processing');
    }, 200);
  };

  return (
    <section className="relative min-h-[calc(100svh-64px)] py-6 sm:py-8 flex items-center overflow-hidden bg-[#FAF9F5]">
      {/* Subtle Warm Ambient Glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[750px] h-[380px] bg-[#E84C2B]/4 blur-[130px] rounded-full"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Punchy Creator Copy + OpusClip-Style Launch  */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 space-y-4">
            {/* Creator Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E6E4DD] bg-white px-3.5 py-1 text-xs font-mono tracking-wider uppercase text-[#52545E] shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-[#E84C2B] animate-pulse" />
              <span>AI VIRAL CLIPPER + REAL TIMELINE EDITOR</span>
            </div>

            {/* Display Headline with Expressive Editorial Serif Italic */}
            <h1 className="text-4xl sm:text-5xl xl:text-[54px] font-bold tracking-[-0.035em] leading-[1.06] text-[#14151A]">
              1 long video in.{' '}
              <span className="font-editorial text-[#E84C2B] text-5xl sm:text-6xl xl:text-[62px] font-normal not-italic sm:italic px-1 underline decoration-[#E84C2B]/30 decoration-4 underline-offset-8">
                15 viral shorts
              </span>{' '}
              out in one click.
            </h1>

            {/* Subheadline */}
            <p className="text-[17px] text-[#52545E] leading-relaxed max-w-[48ch]">
              Paste a YouTube link or drop a raw MP4. FrameFlow finds your highest-retention hooks, tracks speakers into 9:16, burns animated captions, and gives you a real multi-track timeline underneath.
            </p>

            {/* OpusClip-Style Quick-Launch Bar */}
            <div className="space-y-2.5 pt-1">
              <div className="rounded-2xl border border-[#DCDAD2] bg-white p-2 shadow-[0_8px_30px_rgba(20,21,26,0.06)] space-y-2">
                <form
                  onSubmit={handleGetClips}
                  className="relative flex items-center gap-2"
                >
                  <div className="pl-3 flex items-center pointer-events-none text-[#E84C2B]">
                    <LinkIcon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Paste a YouTube, Loom, or Drive link..."
                    className="w-full bg-transparent text-xs sm:text-sm text-[#14151A] placeholder-[#8C8E9A] focus:outline-none font-sans py-2"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] text-white px-5 py-2.5 text-xs font-bold transition-all shadow-sm active:scale-[0.98] shrink-0 cursor-pointer"
                  >
                    <span>Get Free Clips</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </form>

                {/* Compact Inline Chips Inside the Launch Bar */}
                <div className="pt-2 border-t border-[#F0EFEA] flex flex-wrap items-center justify-between gap-2 px-2 text-[11px] font-mono text-[#52545E]">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#FAF9F5] px-1.5 py-0.5 border border-[#E6E4DD] text-[#14151A] font-medium">
                      9:16 Vertical
                    </span>
                    <span>•</span>
                    <span className="rounded bg-[#FAF9F5] px-1.5 py-0.5 border border-[#E6E4DD] text-[#14151A] font-medium">
                      Auto-Hook Score
                    </span>
                    <span>•</span>
                    <span className="rounded bg-[#FAF9F5] px-1.5 py-0.5 border border-[#E6E4DD] text-[#14151A] font-medium">
                      Hormozi Captions
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSamplePodcast}
                    className="inline-flex items-center gap-1 text-[#E84C2B] hover:text-[#D13B1C] hover:underline font-bold transition-colors cursor-pointer"
                  >
                    <span>Or test with a 58-min founder podcast &rarr;</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Authentic Social Proof & Micro Badges */}
            <div className="pt-2 border-t border-[#E6E4DD]/80 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#52545E] font-medium leading-relaxed">
                  Used by 3,200+ editors who would rather create than keyframe subtitles for 3 hours.
                </p>
                <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] text-[#E84C2B] bg-[#FAF3EE] border border-[#E84C2B]/30 rounded-md px-2 py-0.5 shadow-2xs -rotate-2 shrink-0">
                  &larr; yes, a real multi-track timeline
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#52545E]">
                <span className="rounded-md bg-white border border-[#E6E4DD] px-2 py-0.5 text-[#14151A] shadow-2xs font-medium">
                  Auto Speaker Centering
                </span>
                <span className="text-[#B3B1A9]">•</span>
                <span className="rounded-md bg-white border border-[#E6E4DD] px-2 py-0.5 text-[#14151A] shadow-2xs font-medium">
                  Whisper Turbo (216x)
                </span>
                <span className="text-[#B3B1A9]">•</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[#059669] font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                  Zero Watermarks
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: 2 Flagship Phones (Max Height 510px)        */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center max-h-[510px]">
            {/* TWO VERTICAL PHONES SIDE BY SIDE WITH CLEAR BREATHING ROOM */}
            <div className="flex items-center justify-center gap-6 w-full">
              {/* ----------------------------------------------------- */}
              {/* LEFT PHONE: iPhone Frame (w-[215px] h-[435px])        */}
              {/* ----------------------------------------------------- */}
              <div className="w-[215px] h-[435px] rounded-[38px] border-[6px] border-[#1F2028] bg-[#121318] p-2 shadow-[0_24px_60px_rgba(20,21,26,0.28)] flex flex-col justify-between shrink-0 relative overflow-hidden ring-1 ring-white/10">
                {/* iPhone Dynamic Island + iOS Status Bar */}
                <div className="relative z-30 pt-1 px-3 flex items-center justify-between text-white text-[10px] select-none">
                  <span className="font-semibold tracking-tight text-[10px]">9:41</span>
                  {/* Dynamic Island pill */}
                  <div className="h-4 w-20 bg-black rounded-full flex items-center justify-between px-2 shadow-inner ring-1 ring-white/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#111] ring-1 ring-[#333]" />
                    <span className="h-1 w-1 rounded-full bg-emerald-500/80 animate-pulse" />
                  </div>
                  {/* iOS Status Icons */}
                  <div className="flex items-center gap-1 text-[9px] font-mono">
                    <span className="text-[8px] font-bold">5G</span>
                    <Battery className="h-3 w-3 fill-current" />
                  </div>
                </div>

                {/* Floating Emerald Virality Score Badge */}
                <div className="relative z-20 mt-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="inline-flex items-center gap-1 rounded-full bg-[#10B981] px-2.5 py-0.5 text-[9px] font-mono font-bold text-black shadow-md cursor-pointer hover:scale-105 transition-transform"
                  >
                    <Flame className="h-2.5 w-2.5 fill-black" />
                    <span>96/99 Viral &bull; Reels / TikTok</span>
                  </button>
                </div>

                {/* Video Stage Inside Phone Screen */}
                <div className="absolute inset-x-2 inset-y-2 rounded-[30px] overflow-hidden bg-gradient-to-b from-[#1C1D24] via-[#121318] to-[#0A0A0C] flex flex-col justify-end p-3 pb-7">
                  {/* Subtle Speaker Silhouette & Lighting */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#E84C2B]/40 to-amber-500/30 blur-xl" />
                  </div>

                  {/* Reels Engagement Stack on Right */}
                  <div className="absolute right-2 bottom-12 flex flex-col items-center gap-2.5 text-white/90 select-none">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                      </div>
                      <span className="text-[8px] font-mono mt-0.5 text-zinc-300">42k</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                        <MessageCircle className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-[8px] font-mono mt-0.5 text-zinc-300">812</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                        <Bookmark className="w-3 h-3 text-amber-400" />
                      </div>
                      <span className="text-[8px] font-mono mt-0.5 text-zinc-300">3.4k</span>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-[#E84C2B] flex items-center justify-center animate-spin">
                      <Disc className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>

                  {/* Live Animated Hormozi Captions */}
                  <div className="relative z-20 pr-8 text-center mb-1">
                    <div className="inline-flex flex-wrap items-center justify-center gap-1 p-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 shadow-lg">
                      {captionWordsPhone1.map((w, idx) => {
                        const isActive = idx === phone1WordIdx;
                        return (
                          <span
                            key={w.text}
                            className={`text-[11px] font-black tracking-tight uppercase transition-all duration-150 ${
                              isActive
                                ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                                : w.highlight
                                ? 'text-white'
                                : 'text-zinc-400'
                            }`}
                          >
                            {w.text}
                          </span>
                        );
                      })}
                    </div>
                    <p className="text-[8px] font-mono text-zinc-400 mt-1">
                      Elena Vance &bull; Solo Speaker Reframe
                    </p>
                  </div>
                </div>

                {/* iPhone Bottom Home Indicator Bar */}
                <div className="relative z-30 flex justify-center pb-0.5 select-none">
                  <div className="h-1 w-20 rounded-full bg-white/40" />
                </div>
              </div>

              {/* ----------------------------------------------------- */}
              {/* RIGHT PHONE: Android Flagship Frame (w-[215px] h-[435px]) */}
              {/* ----------------------------------------------------- */}
              <div className="w-[215px] h-[435px] rounded-[26px] border-[5px] border-[#22242F] bg-[#101116] p-2 shadow-[0_20px_50px_rgba(20,21,26,0.22)] flex flex-col justify-between shrink-0 relative overflow-hidden translate-y-3 ring-1 ring-white/10">
                {/* Android Punch-Hole Camera + Android Status Bar */}
                <div className="relative z-30 pt-0.5 px-3 flex items-center justify-between text-white text-[10px] select-none">
                  <span className="font-mono text-[9px] text-zinc-300">10:42</span>
                  {/* Centered Punch-Hole Camera Dot */}
                  <div className="h-2.5 w-2.5 rounded-full bg-black ring-1 ring-[#333] shadow-inner" />
                  <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-300">
                    <span className="text-[8px]">LTE</span>
                    <span>94%</span>
                  </div>
                </div>

                {/* Top Badge: 92/99 Viral • YT Shorts */}
                <div className="relative z-20 mt-1 flex justify-center">
                  <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[9px] font-mono font-bold text-emerald-300 shadow-sm backdrop-blur-md">
                    <Flame className="h-2.5 w-2.5 fill-current" />
                    <span>92/99 Viral &bull; YT Shorts</span>
                  </div>
                </div>

                {/* Video Stage with 2-Speaker Split Screen Layout */}
                <div className="absolute inset-x-2 inset-y-2 rounded-[20px] overflow-hidden bg-[#0A0A0E] flex flex-col justify-between p-2 pb-6">
                  {/* Split Screen Top: Speaker A */}
                  <div className="relative h-[48%] w-full rounded-lg bg-[#181922] border border-white/5 overflow-hidden flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#E84C2B]/20 blur-md" />
                    <span className="absolute bottom-1 left-2 text-[8px] font-mono text-zinc-400 bg-black/60 px-1 rounded">
                      Host (Austin)
                    </span>
                  </div>

                  {/* Split Screen Bottom: Speaker B (Guest) */}
                  <div className="relative h-[48%] w-full rounded-lg bg-[#14151C] border border-white/5 overflow-hidden flex flex-col justify-end p-2">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-amber-500/20 blur-md" />
                    </div>

                    {/* Live Animated Karaoke Captions */}
                    <div className="relative z-10 text-center">
                      <div className="inline-flex items-center gap-1 p-1 rounded bg-black/80 border border-white/10 text-[10px] font-bold uppercase">
                        {captionWordsPhone2.map((w, idx) => {
                          const isActive = idx === phone2WordIdx;
                          return (
                            <span
                              key={w.text}
                              className={`transition-all duration-150 ${
                                isActive
                                  ? 'text-emerald-400 underline decoration-2'
                                  : 'text-zinc-300'
                              }`}
                            >
                              {w.text}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* YouTube Shorts Bottom Channel Overlay */}
                  <div className="absolute bottom-1 left-2 right-2 flex items-center justify-between text-[8px] font-mono text-zinc-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                    <span>@NextGenSilicon</span>
                    <span className="text-[#E84C2B] font-bold">SUBSCRIBE</span>
                  </div>
                </div>

                {/* Android Bottom Navigation Bar */}
                <div className="relative z-30 flex justify-center pb-0.5 select-none">
                  <div className="h-1 w-14 rounded-full bg-white/30" />
                </div>
              </div>
            </div>

            {/* Layout Mode Switcher Pills + Hook Breakdown Tooltip */}
            <div className="relative z-30 mt-4 flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-[#E6E4DD] shadow-sm text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setLayoutMode('single')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    layoutMode === 'single'
                      ? 'bg-[#14151A] text-white font-bold'
                      : 'text-[#52545E] hover:text-[#14151A]'
                  }`}
                >
                  Solo Speaker
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('split')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    layoutMode === 'split'
                      ? 'bg-[#14151A] text-white font-bold'
                      : 'text-[#52545E] hover:text-[#14151A]'
                  }`}
                >
                  2-Speaker Split
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('screen_cam')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    layoutMode === 'screen_cam'
                      ? 'bg-[#14151A] text-white font-bold'
                      : 'text-[#52545E] hover:text-[#14151A]'
                  }`}
                >
                  Screen + Cam
                </button>
              </div>

              {/* Live 96/99 Hook Breakdown Interactive Pill */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#E6E4DD] px-3 py-1 text-[11px] font-mono text-[#14151A] shadow-2xs">
                <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>Hook Score 98</span>
                <span className="text-[#B3B1A9]">•</span>
                <span>Pacing 94</span>
                <span className="text-[#B3B1A9]">•</span>
                <span>Clarity 96</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
