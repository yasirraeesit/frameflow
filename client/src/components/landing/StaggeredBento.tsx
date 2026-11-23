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
  Check,
} from 'lucide-react';

type PresetType = 'bold_pop' | 'karaoke_box' | 'clean_cinema' | 'minimal_top';
type PositionType = 'bottom' | 'center' | 'top';

export function StaggeredBento(): JSX.Element {
  // Caption Styler Interactive State
  const [activePreset, setActivePreset] = useState<PresetType>('bold_pop');
  const [highlightColor, setHighlightColor] = useState('#E84C2B');
  const [isUppercase, setIsUppercase] = useState(true);
  const [captionPos, setCaptionPos] = useState<PositionType>('bottom');

  const colorDots = [
    { name: 'Cinema Coral', hex: '#E84C2B' },
    { name: 'Cinema Amber', hex: '#F59E0B' },
    { name: 'Crisp Emerald', hex: '#10B981' },
    { name: 'Vivid Cyan', hex: '#06B6D4' },
    { name: 'Deep Violet', hex: '#8B5CF6' },
  ];

  return (
    <section id="engine" className="border-t border-[#E6E4DD] bg-[#FAF9F5] py-20 lg:py-28 text-[#14151A] scroll-mt-16">
      <div id="captions" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header with Editorial Serif */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E6E4DD] bg-white px-3.5 py-1 text-xs font-mono tracking-wider uppercase text-[#E84C2B] shadow-2xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>CUSTOM CAPTIONS & MANAGED CLOUD ENGINE</span>
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
                {/* 4 Presets: Hormozi Pop, Karaoke Glow, Clean Cinema, Minimal Top */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C8E9A] block font-semibold">
                    Caption Preset Style
                  </span>
                  <div className="grid grid-cols-2 gap-2 bg-[#FAF9F5] p-1.5 rounded-xl border border-[#E6E4DD]">
                    <button
                      type="button"
                      onClick={() => {
                        setActivePreset('bold_pop');
                        setCaptionPos('bottom');
                      }}
                      className={`py-2 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                        activePreset === 'bold_pop'
                          ? 'bg-[#14151A] text-white shadow-2xs'
                          : 'text-[#52545E] hover:text-[#14151A] bg-white'
                      }`}
                    >
                      Hormozi Pop
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActivePreset('karaoke_box');
                        setCaptionPos('bottom');
                      }}
                      className={`py-2 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                        activePreset === 'karaoke_box'
                          ? 'bg-[#14151A] text-white shadow-2xs'
                          : 'text-[#52545E] hover:text-[#14151A] bg-white'
                      }`}
                    >
                      Karaoke Glow
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActivePreset('clean_cinema');
                        setCaptionPos('bottom');
                      }}
                      className={`py-2 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                        activePreset === 'clean_cinema'
                          ? 'bg-[#14151A] text-white shadow-2xs'
                          : 'text-[#52545E] hover:text-[#14151A] bg-white'
                      }`}
                    >
                      Clean Cinema
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActivePreset('minimal_top');
                        setCaptionPos('top');
                      }}
                      className={`py-2 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                        activePreset === 'minimal_top'
                          ? 'bg-[#14151A] text-white shadow-2xs'
                          : 'text-[#52545E] hover:text-[#14151A] bg-white'
                      }`}
                    >
                      Minimal Top
                    </button>
                  </div>
                </div>

                {/* Highlight Color Dots */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C8E9A] block font-semibold">
                    Highlight Accent Palette
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
                    <span className="text-[10px] font-mono uppercase text-[#8C8E9A] block font-semibold">
                      Letter Case
                    </span>
                    <span className="text-xs font-bold text-[#14151A]">
                      {isUppercase ? 'ALL UPPERCASE' : 'Sentence case'}
                    </span>
                  </button>

                  <div className="p-2 rounded-xl border border-[#E6E4DD] bg-[#FAF9F5] space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#8C8E9A] block font-semibold">
                      Canvas Position
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
                      <div className="inline-block rounded-sm bg-black/60 backdrop-blur-xs px-2 py-0.5">
                        <p
                          className={`text-[10px] font-medium tracking-normal text-white ${
                            isUppercase ? 'uppercase' : ''
                          }`}
                        >
                          This is{' '}
                          <span
                            className="font-semibold underline decoration-2 underline-offset-2"
                            style={{ textDecorationColor: highlightColor }}
                          >
                            how we scaled
                          </span>
                        </p>
                      </div>
                    )}

                    {activePreset === 'minimal_top' && (
                      <div className="inline-block rounded-full bg-black/80 backdrop-blur-md border border-white/15 px-2.5 py-0.5 shadow-md">
                        <p
                          className={`text-[9px] font-mono tracking-wider text-zinc-200 ${
                            isUppercase ? 'uppercase' : ''
                          }`}
                        >
                          LESSON 01 &bull;{' '}
                          <span className="font-bold" style={{ color: highlightColor }}>
                            PRICING POWER
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom indicator */}
                  <div className="relative z-10 mx-auto h-0.5 w-12 rounded-full bg-white/40 mb-1" />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: 5 COLS — 30 Free Trial Credits & Managed Pipeline   */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-8 space-y-6 shadow-[0_8px_30px_rgba(20,21,26,0.04)]">
            <div className="space-y-1.5 border-b border-[#E6E4DD] pb-4">
              <div className="flex items-center gap-2 text-[#E84C2B]">
                <Zap className="h-4 w-4" />
                <span className="text-xs font-mono uppercase tracking-wider font-bold">
                  Zero Upfront Commitment
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#14151A]">
                30 Free Trial Credits Included
              </h3>
              <p className="text-xs text-[#52545E]">
                Experience instant 1-click AI clipping, face tracking, and animated captions with zero card required.
              </p>
            </div>

            {/* Trial Feature Highlights */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-[#E6E4DD] bg-[#FAF9F5]">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-[#E6E4DD] text-[#E84C2B] font-mono font-bold text-xs shadow-2xs">
                    30
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#14151A] block">30 Processing Minutes</span>
                    <span className="text-[10px] text-[#52545E]">Auto hook discovery & silence trimming</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  FREE ON SIGNUP
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-[#E6E4DD] bg-[#FAF9F5]">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-[#E6E4DD] text-blue-600 font-mono font-bold text-xs shadow-2xs">
                    GPU
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#14151A] block">Instant Cloud GPU Rendering</span>
                    <span className="text-[10px] text-[#52545E]">High-speed serverless pipeline, zero hardware load</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  CLOUD READY
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-[#E6E4DD] bg-[#FAF9F5]">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-[#E6E4DD] text-purple-600 font-mono font-bold text-xs shadow-2xs">
                    MP4
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#14151A] block">Watermark-Free 1080p Export</span>
                    <span className="text-[10px] text-[#52545E]">Ready for TikTok, Reels & YouTube Shorts</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  NO WATERMARK
                </span>
              </div>
            </div>

            {/* Paddle Security Promise Box */}
            <div className="rounded-xl border border-[#E6E4DD] bg-[#FAF9F5] p-3.5 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#14151A]">
                <Shield className="h-3.5 w-3.5 text-emerald-600" />
                <span>Secure Checkout & Billing Powered by Paddle</span>
              </div>
              <p className="text-[11px] text-[#52545E] leading-relaxed">
                Upgrade anytime for more credits or rollover unused minutes. Global tax compliance and instant VAT invoicing across 200+ countries.
              </p>
            </div>

            <Link
              href="/pricing"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#14151A] hover:bg-[#2C2E38] py-2.5 text-xs font-bold text-white transition-colors shadow-2xs"
            >
              <span>View Plans & Upgrade Credits</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#E84C2B]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
