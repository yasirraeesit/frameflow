'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Heart, MessageCircle, Bookmark, Share2, Disc, Star, Sparkles } from 'lucide-react';

export function AuthShowcasePanel(): JSX.Element {
  const [activeWordIdx, setActiveWordIdx] = useState(0);

  // Hormozi kinetic subtitle words as specified: "STOP" "EDITING" "THE HARD" "WAY"
  const captionWords = [
    { text: 'STOP', highlight: true },
    { text: 'EDITING', highlight: true },
    { text: 'THE HARD', highlight: false },
    { text: 'WAY', highlight: true },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveWordIdx((prev) => (prev + 1) % captionWords.length);
    }, 550);
    return () => clearInterval(timer);
  }, [captionWords.length]);

  return (
    <div className="relative hidden lg:flex lg:col-span-6 flex-col justify-between p-10 xl:p-14 bg-[#121318] border-l border-[#22232B] overflow-hidden select-none">
      {/* Ambient Cinema Coral Glow */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 w-[520px] h-[520px] bg-[#E84C2B]/12 blur-[140px] rounded-full"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 w-[480px] h-[480px] bg-[#10B981]/8 blur-[130px] rounded-full"
        aria-hidden="true"
      />

      {/* Top Tagline */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#272935] bg-[#191A22] px-3 py-1 text-xs font-mono text-[#A1A1AA]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span>STUDIO ENGINE • 1080P PRO RENDER</span>
        </div>
        <span className="text-xs font-mono text-[#71717A]">30 FREE CREDITS</span>
      </div>

      {/* Centerpiece: Sleek Floating 9:16 iPhone Frame */}
      <div className="relative z-10 my-auto py-8 flex flex-col items-center justify-center">
        {/* Floating iPhone 9:16 hardware frame */}
        <div className="relative w-[235px] h-[450px] rounded-[38px] border-[6px] border-[#252733] bg-[#0A0A0E] shadow-[0_30px_90px_rgba(0,0,0,0.85)] flex flex-col justify-between overflow-hidden p-3 transition-transform hover:scale-[1.01] duration-300">
          {/* Hardware Gloss Highlight */}
          <div className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-white/10" />

          {/* Top Notch / Dynamic Island */}
          <div className="relative z-30 flex items-center justify-between px-2 pt-0.5">
            <span className="text-[10px] font-mono text-zinc-400 font-semibold">9:41</span>
            {/* Dynamic Island pill */}
            <div className="h-3.5 w-16 rounded-full bg-black border border-white/5 flex items-center justify-end pr-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
            </div>
            <span className="text-[9px] font-mono text-zinc-400">5G</span>
          </div>

          {/* Floating Virality Badge */}
          <div className="relative z-20 mt-2 flex justify-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#34D399] shadow-sm backdrop-blur-md">
              <Flame className="h-3 w-3 fill-current" />
              <span>96/99 VIRAL SCORE</span>
            </div>
          </div>

          {/* Video Preview Canvas Background */}
          <div className="absolute inset-x-0 inset-y-0 z-10 bg-gradient-to-b from-[#1E202B]/90 via-[#151620] to-[#0D0E13] flex flex-col justify-end p-4 pb-10">
            {/* Speaker Silhouette Backdrop */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#E84C2B]/30 to-amber-500/20 blur-2xl" />
            </div>

            {/* Engagement column on right */}
            <div className="absolute right-2.5 bottom-16 flex flex-col items-center gap-3.5 text-white/80">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                </div>
                <span className="text-[9px] font-mono mt-0.5 text-zinc-300">48.2k</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[9px] font-mono mt-0.5 text-zinc-300">1.4k</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-[9px] font-mono mt-0.5 text-zinc-300">9.8k</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#E84C2B] flex items-center justify-center animate-spin">
                <Disc className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Live Animated Hormozi Captions */}
            <div className="relative z-20 pr-10 text-center mb-2">
              <div className="inline-flex flex-wrap items-center justify-center gap-1.5 p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
                {captionWords.map((word, idx) => {
                  const isActive = idx === activeWordIdx;
                  return (
                    <span
                      key={word.text}
                      className={`text-[13px] font-black tracking-tight uppercase transition-all duration-150 ${
                        isActive
                          ? 'text-[#F59E0B] scale-110 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                          : word.highlight
                          ? 'text-white'
                          : 'text-zinc-400'
                      }`}
                    >
                      {word.text}
                    </span>
                  );
                })}
              </div>
              <p className="text-[9px] font-mono text-zinc-400 mt-1">
                Speaker 1 Centered • 00:14:22
              </p>
            </div>
          </div>

          {/* iOS Bottom Home Indicator Bar */}
          <div className="relative z-30 flex justify-center pb-1">
            <div className="h-1 w-20 rounded-full bg-white/40" />
          </div>
        </div>

        {/* Floating Social Proof Quote Card */}
        <div className="mt-6 max-w-[380px] w-full rounded-2xl border border-[#272935] bg-[#171821]/95 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-1 mb-2 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
            <span className="ml-1 text-[11px] font-mono text-[#A1A1AA]">4.9/5 from 3,200+ editors</span>
          </div>
          <p className="text-xs text-[#E4E4E7] leading-relaxed italic">
            &ldquo;I used to spend 4 hours chopping one podcast. Now I drop the link, grab coffee, and tweak two cuts in the timeline.&rdquo;
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-[#272935] pt-2 text-[11px]">
            <div>
              <span className="font-semibold text-white">Alex Vance</span>
              <span className="text-[#8C8E9A] ml-1.5">Host, The Founder Breakdown</span>
            </div>
            <span className="font-mono text-[10px] text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full border border-[#10B981]/20">
              140k followers
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Feature Badges */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#22232B] text-[11px] font-mono text-[#8C8E9A]">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-[#E84C2B]" />
          <span>Zero &ldquo;AI Minutes&rdquo; Math</span>
        </div>
        <span>•</span>
        <span>Non-Destructive 4-Track</span>
        <span>•</span>
        <span>Clean 1080p MP4</span>
      </div>
    </div>
  );
}
