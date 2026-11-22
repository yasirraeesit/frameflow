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
  Share2,
  Disc,
  ThumbsUp,
  ThumbsDown,
  Wifi,
  Battery,
} from 'lucide-react';

type LayoutMode = 'single' | 'split' | 'screen_cam';

export function HeroOverlappingStage(): JSX.Element {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState('');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('single');
  const [phone1WordIdx, setPhone1WordIdx] = useState(0);
  const [phone2WordIdx, setPhone2WordIdx] = useState(0);

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
    <section className="relative min-h-[calc(100svh-64px)] py-8 flex items-center overflow-hidden bg-[#FAF9F5]">
      {/* Subtle Warm Ambient Glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[750px] h-[380px] bg-[#E84C2B]/4 blur-[130px] rounded-full"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* ========================================================= */}
          {/* LEFT COLUMN: 50% High-Craft Creator Copy (Max 3-4 Lines)  */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 space-y-4">
            {/* Creator Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E6E4DD] bg-white px-3 py-1 text-xs font-mono tracking-wider uppercase text-[#52545E] shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-[#E84C2B] animate-pulse" />
              <span>STOP SCRUBBING 2-HOUR TIMELINES AT 2 AM</span>
            </div>

            {/* Display Headline with Expressive Editorial Serif Italic */}
            <h1 className="text-4xl sm:text-5xl xl:text-[54px] font-bold tracking-[-0.035em] leading-[1.06] text-[#14151A]">
              Drop one long video. Walk away with{' '}
              <span className="font-editorial text-[#E84C2B] text-5xl sm:text-6xl xl:text-[62px] font-normal not-italic sm:italic px-1 underline decoration-[#E84C2B]/30 decoration-4 underline-offset-8">
                15 bangers
              </span>{' '}
              ready to post.
            </h1>

            {/* Subheadline */}
            <p className="text-[17px] text-[#52545E] leading-relaxed max-w-[48ch]">
              Paste a YouTube link or drag in that massive podcast file. FrameFlow hunts down the best hooks, tracks speakers into 9:16, slaps on word-by-word captions, and opens a real timeline when you want control.
            </p>

            {/* Launcher Input Bar */}
            <div className="space-y-2.5 pt-1">
              <form
                onSubmit={handleGetClips}
                className="relative rounded-2xl border border-[#DCDAD2] bg-white p-1.5 pl-4 flex items-center gap-2.5 shadow-[0_8px_30px_rgba(20,21,26,0.06)] focus-within:border-[#E84C2B] focus-within:ring-2 focus-within:ring-[#E84C2B]/20 transition-all"
              >
                <LinkIcon className="h-4 w-4 text-[#E84C2B] shrink-0" aria-hidden="true" />
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste a YouTube link (or drop an MP4)..."
                  className="w-full bg-transparent text-sm text-[#14151A] placeholder-[#8C8E9A] focus:outline-none font-sans"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] text-white px-5 py-2.5 text-xs font-bold transition-all shadow-sm active:scale-[0.98] shrink-0"
                >
                  <span>Chop It Up</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </form>

              {/* Direct Clickable Cheeky Text Link */}
              <div className="flex items-center justify-between text-xs px-1">
                <button
                  type="button"
                  onClick={handleSamplePodcast}
                  className="inline-flex items-center gap-1 text-[#E84C2B] hover:text-[#D13B1C] hover:underline font-semibold transition-colors cursor-pointer"
                >
                  <span>No link handy? Test it on a 58-min founder podcast</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
                <span className="text-[#8C8E9A] font-mono text-[11px] tabular-nums">
                  Whisper Turbo • 42ms
                </span>
              </div>
            </div>

            {/* Authentic Social Proof & Micro Badges */}
            <div className="pt-2 border-t border-[#E6E4DD]/80 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#52545E] font-medium leading-relaxed">
                  Built for creators who would rather make content than keyframe text for 3 hours.
                </p>
                <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] text-[#E84C2B] bg-[#FAF3EE] border border-[#E84C2B]/30 rounded-md px-2 py-0.5 shadow-2xs -rotate-2 shrink-0">
                  &larr; yes, a real multi-track timeline
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#52545E]">
                <span className="rounded-md bg-white border border-[#E6E4DD] px-2 py-0.5 text-[#14151A] shadow-2xs font-medium">
                  9:16 Auto-Crop
                </span>
                <span className="text-[#B3B1A9]">•</span>
                <span className="rounded-md bg-white border border-[#E6E4DD] px-2 py-0.5 text-[#14151A] shadow-2xs font-medium">
                  Whisper Turbo
                </span>
                <span className="text-[#B3B1A9]">•</span>
                <span className="rounded-md bg-white border border-[#E6E4DD] px-2 py-0.5 text-[#14151A] shadow-2xs font-medium">
                  Multi-Track Timeline
                </span>
                <span className="text-[#B3B1A9]">•</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[#059669] font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                  Clean 1080p MP4
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: 2 Modern Flagship Vertical Phones (9:16)    */}
          {/* Strictly under max-h-[520px] — iPhone + Android side-by-side */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center max-h-[520px]">
            {/* TWO VERTICAL PHONES SIDE BY SIDE WITH CLEAR BREATHING ROOM */}
            <div className="flex items-center justify-center gap-6 w-full">
              {/* ----------------------------------------------------- */}
              {/* LEFT PHONE: iPhone Frame (w-[220px] h-[445px])        */}
              {/* ----------------------------------------------------- */}
              <div className="w-[220px] h-[445px] rounded-[38px] border-[6px] border-[#1F2028] bg-[#121318] p-2 shadow-[0_24px_60px_rgba(20,21,26,0.28)] flex flex-col justify-between shrink-0 relative overflow-hidden ring-1 ring-white/10">
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

                {/* Top Floating Badge: 96/99 Viral • Reels / TikTok */}
                <div className="relative z-20 px-2 pt-1 flex justify-center">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-black/85 backdrop-blur-md border border-[#10B981]/40 px-2.5 py-0.5 text-[9px] font-mono font-bold text-[#10B981] shadow-lg">
                    <Flame className="h-3 w-3 text-[#10B981]" />
                    <span>96/99 Viral • Reels / TikTok</span>
                  </div>
                </div>

                {/* Vertical Phone Screen Canvas */}
                <div className="absolute inset-0 z-10 w-full h-full overflow-hidden bg-black flex flex-col justify-between">
                  {/* Video View */}
                  {layoutMode === 'single' && (
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                      alt="Solo Speaker"
                      className="absolute inset-0 h-full w-full object-cover opacity-90 transition-opacity duration-200"
                    />
                  )}

                  {layoutMode === 'split' && (
                    <div className="absolute inset-0 flex flex-col divide-y divide-[#E84C2B]">
                      <div className="relative flex-1 overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                          alt="Host"
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute top-8 left-3 rounded bg-black/75 px-1.5 text-[8px] font-mono text-[#E84C2B] font-bold">
                          HOST
                        </span>
                      </div>
                      <div className="relative flex-1 overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                          alt="Guest"
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute top-2 left-3 rounded bg-black/75 px-1.5 text-[8px] font-mono text-zinc-300 font-bold">
                          GUEST
                        </span>
                      </div>
                    </div>
                  )}

                  {layoutMode === 'screen_cam' && (
                    <div className="absolute inset-0 flex flex-col justify-between">
                      <img
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80"
                        alt="Screen Share"
                        className="absolute inset-0 h-full w-full object-cover opacity-75"
                      />
                      <div className="p-3 pt-10 z-10">
                        <span className="rounded bg-black/85 border border-[#242530] px-2 py-0.5 text-[8px] font-mono text-white font-bold">
                          KEYNOTE DEMO
                        </span>
                      </div>
                      <div className="m-3 self-end h-16 w-14 rounded-xl overflow-hidden border-2 border-[#E84C2B] shadow-xl z-10">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                          alt="Facecam"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Right-Side Reels / TikTok Engagement Column */}
                  <div className="absolute right-2 bottom-14 z-20 flex flex-col items-center gap-3 text-white select-none">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="h-7 w-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform">
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      </div>
                      <span className="text-[8px] font-mono font-bold">124K</span>
                    </div>

                    <div className="flex flex-col items-center gap-0.5">
                      <div className="h-7 w-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <MessageCircle className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[8px] font-mono font-bold">1.8K</span>
                    </div>

                    <div className="flex flex-col items-center gap-0.5">
                      <div className="h-7 w-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <Bookmark className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[8px] font-mono font-bold">14K</span>
                    </div>

                    <div className="flex flex-col items-center gap-0.5">
                      <div className="h-7 w-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <Share2 className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[8px] font-mono font-bold">8.2K</span>
                    </div>

                    {/* Rotating Sound Disc */}
                    <div className="h-6 w-6 rounded-full bg-black/70 border border-white/30 flex items-center justify-center mt-1">
                      <Disc className="h-3.5 w-3.5 text-zinc-300 animate-spin" style={{ animationDuration: '4s' }} />
                    </div>
                  </div>

                  {/* Live Cycling Hormozi Captions: "NOBODY CARES ABOUT YOUR ROADMAP" */}
                  <div className="relative z-20 px-3 pb-8 text-center mt-auto w-[82%]">
                    <div className="inline-block rounded-xl bg-black/90 backdrop-blur-md border border-white/10 px-2.5 py-1 shadow-2xl">
                      <div className="flex flex-wrap justify-center gap-1 text-[9.5px] font-black italic tracking-wider uppercase font-mono">
                        {captionWordsPhone1.map((word, idx) => {
                          const isCurrent = idx === phone1WordIdx;
                          return (
                            <span
                              key={word.text}
                              className={`transition-all duration-150 ${
                                isCurrent
                                  ? 'text-[#E84C2B] scale-110 drop-shadow-[0_0_8px_rgba(232,76,43,0.8)] font-black'
                                  : word.highlight
                                  ? 'text-white'
                                  : 'text-zinc-400'
                              }`}
                            >
                              &ldquo;{word.text}&rdquo;
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom iOS Home Indicator Bar */}
                <div className="relative z-30 pt-1">
                  <div className="h-1 w-20 bg-white/40 rounded-full mx-auto mb-0.5" />
                </div>
              </div>

              {/* ----------------------------------------------------- */}
              {/* RIGHT PHONE: Android Flagship (w-[220px] h-[445px])   */}
              {/* Slightly offset translate-y-5 for natural rhythm      */}
              {/* ----------------------------------------------------- */}
              <div className="w-[220px] h-[445px] translate-y-5 rounded-[26px] border-[5px] border-[#252730] bg-[#121318] p-2 shadow-[0_20px_50px_rgba(20,21,26,0.22)] flex flex-col justify-between shrink-0 relative overflow-hidden ring-1 ring-white/10">
                {/* Android Top Bar + Centered Punch-Hole Camera */}
                <div className="relative z-30 pt-0.5 px-3 flex items-center justify-between text-white text-[9.5px] select-none">
                  <span className="font-medium font-sans">10:00</span>
                  {/* Punch-hole camera dot */}
                  <div className="h-2.5 w-2.5 rounded-full bg-black ring-1 ring-white/20 shadow-inner" />
                  {/* Android Status Icons */}
                  <div className="flex items-center gap-1.5 text-[9px]">
                    <Wifi className="h-3 w-3" />
                    <Battery className="h-3 w-3 fill-current" />
                  </div>
                </div>

                {/* Top Floating Badge: 92/99 Viral • YT Shorts */}
                <div className="relative z-20 px-2 pt-1 flex justify-center">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-black/85 backdrop-blur-md border border-[#E84C2B]/40 px-2.5 py-0.5 text-[9px] font-mono font-bold text-[#E84C2B] shadow-lg">
                    <Flame className="h-3 w-3 text-[#E84C2B]" />
                    <span>92/99 Viral • YT Shorts</span>
                  </div>
                </div>

                {/* Vertical Phone Screen Canvas: 2-Speaker Split View */}
                <div className="absolute inset-0 z-10 w-full h-full overflow-hidden bg-black flex flex-col justify-between">
                  {/* Distinct 2-Speaker Split Layout from the same video */}
                  <div className="absolute inset-0 flex flex-col divide-y-2 divide-[#E84C2B]/80">
                    {/* Top Speaker: Founder */}
                    <div className="relative flex-1 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                        alt="Founder"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute top-8 left-3 rounded bg-black/80 px-1.5 py-0.5 text-[7.5px] font-mono text-[#E84C2B] font-bold">
                        FOUNDER
                      </span>
                    </div>

                    {/* Bottom Speaker: Investor */}
                    <div className="relative flex-1 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                        alt="Investor"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute top-2 left-3 rounded bg-black/80 px-1.5 py-0.5 text-[7.5px] font-mono text-zinc-300 font-bold">
                        INVESTOR
                      </span>
                    </div>
                  </div>

                  {/* YouTube Shorts Bottom Overlay & Engagement */}
                  <div className="absolute right-2 bottom-12 z-20 flex flex-col items-center gap-3 text-white select-none">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="h-7 w-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[8px] font-mono font-bold">89K</span>
                    </div>

                    <div className="flex flex-col items-center gap-0.5">
                      <div className="h-7 w-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[8px] font-mono font-bold">Dislike</span>
                    </div>

                    <div className="flex flex-col items-center gap-0.5">
                      <div className="h-7 w-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <Share2 className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[8px] font-mono font-bold">Share</span>
                    </div>
                  </div>

                  {/* YouTube Shorts Channel & Sound Title */}
                  <div className="relative z-20 px-3 pb-8 text-left mt-auto w-[80%] space-y-1.5">
                    {/* Live Cycling Karaoke Captions: "HERE'S HOW WE ACTUALLY SCALED" */}
                    <div className="inline-block rounded-xl bg-black/90 backdrop-blur-md border border-white/10 px-2.5 py-1 shadow-2xl">
                      <div className="flex flex-wrap gap-1 text-[9px] font-black italic tracking-wider uppercase font-mono">
                        {captionWordsPhone2.map((word, idx) => {
                          const isCurrent = idx === phone2WordIdx;
                          return (
                            <span
                              key={word.text}
                              className={`transition-all duration-150 ${
                                isCurrent
                                  ? 'text-[#E84C2B] scale-110 drop-shadow-[0_0_8px_rgba(232,76,43,0.8)] font-black'
                                  : word.highlight
                                  ? 'text-[#10B981]'
                                  : 'text-white'
                              }`}
                            >
                              &ldquo;{word.text}&rdquo;
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* YouTube Shorts Channel Bar */}
                    <div className="flex items-center gap-1.5 text-[8.5px] font-mono text-zinc-300">
                      <div className="h-4 w-4 rounded-full bg-[#E84C2B] flex items-center justify-center text-[7px] font-bold text-white">
                        FF
                      </div>
                      <span className="font-bold text-white">@startupgrowth</span>
                      <span className="rounded bg-white text-black font-bold px-1 text-[7px]">
                        Subscribe
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Android Gesture Pill */}
                <div className="relative z-30 pt-1">
                  <div className="h-1 w-12 bg-white/40 rounded-full mx-auto mb-0.5" />
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------- */}
            {/* 3. COMPACT INTERACTIVE CONTROLS TUCKED BENEATH MOBILES  */}
            {/* ------------------------------------------------------- */}
            <div className="relative z-20 mt-3 flex items-center justify-center">
              <div className="inline-flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E6E4DD] shadow-sm">
                <span className="text-[10px] font-mono text-[#8C8E9A] px-2 hidden sm:inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#E84C2B]" />
                  Layout
                </span>
                <button
                  type="button"
                  onClick={() => setLayoutMode('single')}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-colors cursor-pointer ${
                    layoutMode === 'single'
                      ? 'bg-[#14151A] text-white shadow-2xs font-bold'
                      : 'text-[#52545E] hover:text-[#14151A]'
                  }`}
                >
                  Solo Speaker
                </button>

                <button
                  type="button"
                  onClick={() => setLayoutMode('split')}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-colors cursor-pointer ${
                    layoutMode === 'split'
                      ? 'bg-[#14151A] text-white shadow-2xs font-bold'
                      : 'text-[#52545E] hover:text-[#14151A]'
                  }`}
                >
                  2-Person Split
                </button>

                <button
                  type="button"
                  onClick={() => setLayoutMode('screen_cam')}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-colors cursor-pointer ${
                    layoutMode === 'screen_cam'
                      ? 'bg-[#14151A] text-white shadow-2xs font-bold'
                      : 'text-[#52545E] hover:text-[#14151A]'
                  }`}
                >
                  Screen + Cam
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
