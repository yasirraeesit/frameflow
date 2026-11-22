'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Key,
  Shield,
  Zap,
  ArrowRight,
  Cpu,
  Sliders,
} from 'lucide-react';

type PresetType = 'bold_pop' | 'karaoke_box' | 'clean_cinema';
type PositionType = 'bottom' | 'center' | 'top';

export function StaggeredBento(): JSX.Element {
  // Caption Styler Interactive State
  const [activePreset, setActivePreset] = useState<PresetType>('bold_pop');
  const [highlightColor, setHighlightColor] = useState('#E84C2B');
  const [isUppercase, setIsUppercase] = useState(true);
  const [captionPos, setCaptionPos] = useState<PositionType>('bottom');

  const colorDots = [
    { name: 'Cinema Coral', hex: '#E84C2B' },
    { name: 'Electric Yellow', hex: '#FACC15' },
    { name: 'Vivid Cyan', hex: '#06B6D4' },
    { name: 'Crisp Emerald', hex: '#10B981' },
  ];

  return (
    <section id="engine" className="border-t border-[#E6E4DD] bg-[#FAF9F5] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header with Editorial Serif */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E6E4DD] bg-white px-3 py-1 text-xs font-mono tracking-wider uppercase text-[#E84C2B] shadow-2xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>CUSTOM CAPTION & BYOK ENGINE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.035em] text-[#14151A] leading-tight">
            Captions people actually{' '}
            <span className="font-editorial text-[#E84C2B] font-normal italic text-4xl sm:text-5xl block sm:inline">
              stop scrolling for.
            </span>
          </h2>

          <p className="text-[15px] text-[#52545E] leading-relaxed">
            Zero manually keyframing 400 text layers ever again. Pick a high-retention animation style, match your brand color, and place subtitles safely inside the TikTok and Reels safe zones.
          </p>
        </div>

        {/* Staggered Asymmetric Bento: 7 cols + 5 cols */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================= */}
          {/* LEFT: 7 COLS — Interactive Caption & Brand Kit Styler     */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(20,21,26,0.04)] space-y-6">
            <div className="space-y-1.5 border-b border-[#E6E4DD] pb-4">
              <div className="flex items-center gap-2 text-[#E84C2B]">
                <Sliders className="h-4 w-4" />
                <span className="text-xs font-mono uppercase tracking-wider font-bold">
                  Interactive Subtitle Engine
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#14151A]">
                Dynamic Subtitle Customizer
              </h3>
              <p className="text-xs text-[#52545E]">
                Click styles, change colors, and watch the vertical canvas re-render live.
              </p>
            </div>

            {/* Split layout inside card: Controls Left vs Mini 9:16 Canvas Right */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Controls (7 cols) */}
              <div className="sm:col-span-7 space-y-4">
                {/* Presets: Bold Pop, Karaoke Box, Clean Cinema */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C8E9A] block">
                    Caption Style
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 bg-[#FAF9F5] p-1 rounded-xl border border-[#E6E4DD]">
                    <button
                      type="button"
                      onClick={() => setActivePreset('bold_pop')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        activePreset === 'bold_pop'
                          ? 'bg-[#14151A] text-white shadow-2xs'
                          : 'text-[#52545E] hover:text-[#14151A]'
                      }`}
                    >
                      Bold Pop
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePreset('karaoke_box')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        activePreset === 'karaoke_box'
                          ? 'bg-[#14151A] text-white shadow-2xs'
                          : 'text-[#52545E] hover:text-[#14151A]'
                      }`}
                    >
                      Karaoke Box
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePreset('clean_cinema')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        activePreset === 'clean_cinema'
                          ? 'bg-[#14151A] text-white shadow-2xs'
                          : 'text-[#52545E] hover:text-[#14151A]'
                      }`}
                    >
                      Clean Cinema
                    </button>
                  </div>
                </div>

                {/* Highlight Color Dots */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C8E9A] block">
                    Highlight Accent
                  </span>
                  <div className="flex items-center gap-2.5">
                    {colorDots.map((dot) => (
                      <button
                        key={dot.hex}
                        type="button"
                        onClick={() => setHighlightColor(dot.hex)}
                        className={`h-7 w-7 rounded-full border-2 transition-transform cursor-pointer ${
                          highlightColor === dot.hex
                            ? 'scale-110 border-[#14151A] shadow-md ring-2 ring-black/10'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: dot.hex }}
                        title={dot.name}
                      />
                    ))}
                    <span className="text-[11px] font-mono text-[#52545E] ml-1">
                      {highlightColor}
                    </span>
                  </div>
                </div>

                {/* Uppercase & Position */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsUppercase(!isUppercase)}
                    className="p-2.5 rounded-xl border border-[#E6E4DD] bg-[#FAF9F5] text-left hover:border-[#14151A] transition-colors cursor-pointer"
                  >
                    <span className="text-[10px] font-mono uppercase text-[#8C8E9A] block">
                      Case Format
                    </span>
                    <span className="text-xs font-bold text-[#14151A]">
                      {isUppercase ? 'ALL UPPERCASE' : 'Sentence case'}
                    </span>
                  </button>

                  <div className="p-2 rounded-xl border border-[#E6E4DD] bg-[#FAF9F5] space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#8C8E9A] block">
                      Position
                    </span>
                    <div className="grid grid-cols-3 gap-1">
                      {(['top', 'center', 'bottom'] as PositionType[]).map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => setCaptionPos(pos)}
                          className={`text-[9px] font-mono uppercase py-0.5 rounded transition-colors cursor-pointer ${
                            captionPos === pos
                              ? 'bg-[#14151A] text-white font-bold'
                              : 'text-[#52545E] hover:text-[#14151A]'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-[#52545E] border-t border-[#E6E4DD]">
                  <span className="font-mono text-[11px]">Safe Zone Auto-Padding</span>
                  <span className="text-emerald-600 font-semibold font-mono text-[11px]">
                    ✓ TikTok & Reels Verified
                  </span>
                </div>
              </div>

              {/* Mini 9:16 Canvas Right (5 cols) - Keep DARK #121318 so Video Pops */}
              <div className="sm:col-span-5 flex justify-center">
                <div className="w-[185px] h-[330px] rounded-2xl border-2 border-[#2A2B35] bg-[#121318] p-1.5 shadow-xl relative flex flex-col justify-between overflow-hidden">
                  {/* Background Video Mockup */}
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                    alt="Speaker Subtitle Preview"
                    className="absolute inset-0 h-full w-full object-cover opacity-85"
                  />

                  {/* Safe Zone Grid Guide */}
                  <div className="absolute inset-x-2 top-6 bottom-14 border border-dashed border-white/20 pointer-events-none rounded-lg flex items-start justify-end p-1">
                    <span className="text-[7px] font-mono text-white/50 bg-black/60 px-1 rounded">
                      Safe Zone
                    </span>
                  </div>

                  {/* Dynamic Caption Overlay */}
                  <div
                    className={`relative z-10 w-full px-2 text-center transition-all duration-200 ${
                      captionPos === 'top'
                        ? 'pt-8'
                        : captionPos === 'center'
                        ? 'my-auto'
                        : 'pb-10 mt-auto'
                    }`}
                  >
                    {activePreset === 'bold_pop' && (
                      <div className="inline-block rounded-md bg-black/90 backdrop-blur-md border border-white/10 px-2 py-1 shadow-lg">
                        <div
                          className={`text-[10px] font-black italic tracking-wide ${
                            isUppercase ? 'uppercase' : ''
                          }`}
                        >
                          <span className="text-white">THIS IS </span>
                          <span
                            className="scale-110 inline-block font-black drop-shadow-md"
                            style={{ color: highlightColor }}
                          >
                            HOW WE SCALED
                          </span>
                        </div>
                      </div>
                    )}

                    {activePreset === 'karaoke_box' && (
                      <div className="inline-block rounded-md bg-black/95 border border-white/20 px-2.5 py-1 shadow-2xl">
                        <div
                          className={`text-[10px] font-mono font-bold tracking-wider ${
                            isUppercase ? 'uppercase' : ''
                          }`}
                        >
                          <span className="text-white">THIS IS </span>
                          <span
                            className="px-1 py-0.2 rounded font-black text-black"
                            style={{ backgroundColor: highlightColor }}
                          >
                            HOW WE SCALED
                          </span>
                        </div>
                      </div>
                    )}

                    {activePreset === 'clean_cinema' && (
                      <div className="inline-block px-1 py-0.5">
                        <div
                          className={`text-[11px] font-sans font-bold tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${
                            isUppercase ? 'uppercase' : ''
                          }`}
                        >
                          <span className="text-white">This is </span>
                          <span style={{ color: highlightColor }} className="font-extrabold underline decoration-2">
                            how we scaled
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: 5 COLS — Bring Your Own Key (BYOK) Engine Card     */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(20,21,26,0.04)] space-y-6">
            <div className="space-y-1.5 border-b border-[#E6E4DD] pb-4">
              <div className="flex items-center gap-2 text-[#E84C2B]">
                <Key className="h-4 w-4" />
                <span className="text-xs font-mono uppercase tracking-wider font-bold">
                  Zero Artificial Limits
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#14151A]">
                Bring Your Own Key (BYOK)
              </h3>
              <p className="text-xs text-[#52545E]">
                Why pay a 300% markup on video minutes? Connect your free developer keys.
              </p>
            </div>

            <div className="space-y-4">
              {/* Item 1: Groq */}
              <div className="rounded-xl border border-[#E6E4DD] bg-[#FAF9F5] p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-[#E84C2B]" />
                    <span className="font-bold text-[#14151A]">Groq Whisper Turbo</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                    Free Tier
                  </span>
                </div>
                <p className="text-[11px] text-[#52545E] leading-relaxed">
                  500+ free transcription minutes per month. Transcribes a 1-hour video in 42 seconds with word-level timestamps.
                </p>
              </div>

              {/* Item 2: Google Gemini */}
              <div className="rounded-xl border border-[#E6E4DD] bg-[#FAF9F5] p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-3.5 w-3.5 text-blue-600" />
                    <span className="font-bold text-[#14151A]">Google Gemini 2.0 Flash</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                    15 req/min Free
                  </span>
                </div>
                <p className="text-[11px] text-[#52545E] leading-relaxed">
                  Multimodal hook detection reads video visuals, pacing, and retention drop-offs to pick the 15 strongest cuts.
                </p>
              </div>

              {/* Item 3: Direct Privacy */}
              <div className="rounded-xl border border-[#E6E4DD] bg-[#FAF9F5] p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="font-bold text-[#14151A]">100% Client-Side Privacy</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#52545E]">Browser-Direct</span>
                </div>
                <p className="text-[11px] text-[#52545E] leading-relaxed">
                  Your API keys never touch our servers. Your raw video footage is never used to train anyone&apos;s models.
                </p>
              </div>
            </div>

            <Link
              href="/settings"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#E6E4DD] bg-[#FAF9F5] hover:bg-white hover:border-[#14151A] text-[#14151A] py-2.5 text-xs font-bold transition-all shadow-2xs"
            >
              <span>Configure AI Keys in Settings</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#E84C2B]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
