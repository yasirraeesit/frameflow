'use client';

import React, { useState } from 'react';
import { MOCK_BRAND_KIT } from '@/lib/mock-data';
import type { BrandKitResponse } from '@frameflow/shared';
import {
  Palette,
  Sparkles,
  Type,
  LayoutTemplate,
  CheckCircle2,
  Save,
  RotateCcw,
  Smartphone,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react';

type CaptionPreset = 'hormozi_pop' | 'keyword_highlight' | 'karaoke_box' | 'clean_minimal';

export default function BrandKitPage(): JSX.Element {
  const [brandKit, setBrandKit] = useState<BrandKitResponse>(MOCK_BRAND_KIT);
  const [brandName, setBrandName] = useState('FRAMEFLOW');
  const [isUppercase, setIsUppercase] = useState(true);
  const [watermarkScale, setWatermarkScale] = useState(0.15);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const presets: { id: CaptionPreset; title: string; desc: string; sample: string }[] = [
    {
      id: 'hormozi_pop',
      title: 'Hormozi Pop',
      desc: 'Bold uppercase single-word bursts with high contrast highlight.',
      sample: 'COMPLETELY VANISH',
    },
    {
      id: 'keyword_highlight',
      title: 'Keyword Glow',
      desc: 'Natural sentence flow with critical semantic verbs and nouns lit up.',
      sample: 'math can happen with zero electricity',
    },
    {
      id: 'karaoke_box',
      title: 'Karaoke Box',
      desc: 'Word-by-word animated backing box with synchronized syllable wiping.',
      sample: 'Stop paying twenty dollars a month',
    },
    {
      id: 'clean_minimal',
      title: 'Clean Minimal',
      desc: 'Editorial lower-third subtitles for documentary and thought-leadership.',
      sample: 'Listen to this background noise.',
    },
  ];

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    setBrandKit(MOCK_BRAND_KIT);
    setBrandName('FRAMEFLOW');
    setIsUppercase(true);
    setWatermarkScale(0.15);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#27272A] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-[#6366F1]" aria-hidden="true" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Brand Kit & Templates</h1>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Configure your global brand identity, viral subtitle typography, keyword palettes, and logo watermark placement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-[#27272A] bg-[#111114] px-3.5 py-2 text-xs font-medium text-[#94A3B8] hover:text-white hover:bg-[#18181C] transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all active:scale-[0.98]"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                <span>Saved Successfully</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Save Brand Kit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Split View: Left Controls vs Right Live 9:16 Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Brand Identity & Logo Watermark */}
          <div className="rounded-2xl border border-[#27272A] bg-[#111114] p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-emerald-400" aria-hidden="true" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">
                Brand Name & Watermark
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="brand-name" className="text-xs font-medium text-[#94A3B8] block">
                  Brand / Channel Name
                </label>
                <input
                  id="brand-name"
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. FRAMEFLOW"
                  className="w-full rounded-xl border border-[#27272A] bg-[#18181C] px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#94A3B8] block">
                  Watermark Placement
                </label>
                <select
                  value={brandKit.logoPosition}
                  onChange={(e) =>
                    setBrandKit({
                      ...brandKit,
                      logoPosition: e.target.value as BrandKitResponse['logoPosition'],
                    })
                  }
                  className="w-full rounded-xl border border-[#27272A] bg-[#18181C] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6366F1]"
                >
                  <option value="top_right">Top Right (Recommended)</option>
                  <option value="top_left">Top Left</option>
                  <option value="bottom_right">Bottom Right</option>
                  <option value="bottom_left">Bottom Left</option>
                </select>
              </div>
            </div>

            {/* Watermark Scale Slider */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-[#94A3B8]">
                <span>Watermark Size</span>
                <span className="font-mono tabular-nums text-white">{(watermarkScale * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.08"
                max="0.25"
                step="0.01"
                value={watermarkScale}
                onChange={(e) => setWatermarkScale(parseFloat(e.target.value))}
                className="w-full h-1.5 cursor-pointer accent-[#6366F1]"
              />
            </div>
          </div>

          {/* Typography & Color Customization */}
          <div className="rounded-2xl border border-[#27272A] bg-[#111114] p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-indigo-400" aria-hidden="true" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">
                Subtitle Typography & Palette
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Font Family */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#94A3B8] block">
                  Font Family
                </label>
                <select
                  value={brandKit.fontFamily}
                  onChange={(e) => setBrandKit({ ...brandKit, fontFamily: e.target.value })}
                  className="w-full rounded-xl border border-[#27272A] bg-[#18181C] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6366F1]"
                >
                  <option value="Inter">Inter (Clean modern tech)</option>
                  <option value="Montserrat">Montserrat (Punchy & heavy)</option>
                  <option value="Poppins">Poppins (Friendly viral curves)</option>
                  <option value="Space Grotesk">Space Grotesk (Crypto & future)</option>
                </select>
              </div>

              {/* Uppercase Toggle */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-[#94A3B8] block">
                  Text Case
                </span>
                <button
                  type="button"
                  onClick={() => setIsUppercase(!isUppercase)}
                  className={`w-full flex items-center justify-between rounded-xl border px-3.5 py-2 text-xs transition-colors ${
                    isUppercase
                      ? 'border-[#6366F1] bg-[#18181C] text-white font-semibold'
                      : 'border-[#27272A] bg-[#141418] text-[#94A3B8]'
                  }`}
                >
                  <span>UPPERCASE ALL WORDS</span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${isUppercase ? 'bg-indigo-400' : 'bg-[#27272A]'}`}
                  />
                </button>
              </div>

              {/* Primary Color */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#94A3B8] block">
                  Primary Text Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandKit.primaryColor}
                    onChange={(e) => setBrandKit({ ...brandKit, primaryColor: e.target.value })}
                    className="h-9 w-10 cursor-pointer rounded-lg border border-[#27272A] bg-[#18181C] p-0.5"
                  />
                  <input
                    type="text"
                    value={brandKit.primaryColor}
                    onChange={(e) => setBrandKit({ ...brandKit, primaryColor: e.target.value })}
                    className="flex-1 rounded-xl border border-[#27272A] bg-[#18181C] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
              </div>

              {/* Keyword Highlight Color */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#94A3B8] block">
                  Keyword Highlight Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandKit.highlightColor}
                    onChange={(e) => setBrandKit({ ...brandKit, highlightColor: e.target.value })}
                    className="h-9 w-10 cursor-pointer rounded-lg border border-[#27272A] bg-[#18181C] p-0.5"
                  />
                  <input
                    type="text"
                    value={brandKit.highlightColor}
                    onChange={(e) => setBrandKit({ ...brandKit, highlightColor: e.target.value })}
                    className="flex-1 rounded-xl border border-[#27272A] bg-[#18181C] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Caption Style Templates */}
          <div className="rounded-2xl border border-[#27272A] bg-[#111114] p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-white">
                  Caption Templates & Positioning
                </h2>
              </div>
              <div className="flex gap-1 text-[11px]">
                {(['bottom', 'center', 'top'] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setBrandKit({ ...brandKit, captionPosition: pos })}
                    className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors ${
                      brandKit.captionPosition === pos
                        ? 'bg-[#6366F1] text-white'
                        : 'bg-[#18181C] text-[#94A3B8] border border-[#27272A]'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {presets.map((p) => {
                const isSelected = brandKit.captionPreset === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setBrandKit({ ...brandKit, captionPreset: p.id })}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setBrandKit({ ...brandKit, captionPreset: p.id });
                      }
                    }}
                    className={`rounded-xl border p-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#6366F1] bg-[#18181C] ring-1 ring-[#6366F1]'
                        : 'border-[#27272A] bg-[#141418] hover:border-[#3F3F46]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{p.title}</span>
                      {isSelected && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#94A3B8] line-clamp-2 mb-2 leading-relaxed">
                      {p.desc}
                    </p>
                    <div className="rounded-lg bg-[#09090B] border border-[#27272A] px-2.5 py-1.5 text-center">
                      <span
                        className="text-xs font-bold font-mono tracking-wide"
                        style={{
                          color: p.id === 'clean_minimal' ? '#F4F4F5' : brandKit.highlightColor,
                        }}
                      >
                        {isUppercase ? p.sample.toUpperCase() : p.sample}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Live 9:16 Vertical Preview Card (5 cols) */}
        <div className="lg:col-span-5 sticky top-20 flex flex-col items-center">
          <div className="w-full max-w-[320px] rounded-2xl border-2 border-[#27272A] bg-[#111114] p-3.5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-mono text-[#94A3B8] flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-indigo-400" aria-hidden="true" />
                Live 9:16 Preview
              </span>
              <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] font-mono font-medium text-emerald-400">
                1080x1920
              </span>
            </div>

            {/* Phone Screen Canvas */}
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-black border border-[#27272A] flex flex-col justify-between">
              {/* Mock Video Frame */}
              <img
                src="https://images.unsplash.com/photo-1534972195531-a756b11269d5?auto=format&fit=crop&w=720&q=80"
                alt="Brand Kit Preview"
                className="absolute inset-0 h-full w-full object-cover opacity-80"
              />

              {/* Watermark Logo */}
              <div
                className={`absolute p-3 z-10 ${
                  brandKit.logoPosition === 'top_right'
                    ? 'top-2 right-2'
                    : brandKit.logoPosition === 'top_left'
                    ? 'top-2 left-2'
                    : brandKit.logoPosition === 'bottom_right'
                    ? 'bottom-2 right-2'
                    : 'bottom-2 left-2'
                }`}
              >
                <div
                  className="flex items-center gap-1 rounded bg-black/70 backdrop-blur-md px-2.5 py-1 border border-white/15 text-[10px] font-black text-white font-mono tracking-wider shadow-lg"
                  style={{ transform: `scale(${watermarkScale / 0.15})` }}
                >
                  {brandName || 'FRAMEFLOW'}
                </div>
              </div>

              {/* Dynamic Animated Caption Display */}
              <div
                className={`relative z-10 px-4 text-center my-auto transition-all ${
                  brandKit.captionPosition === 'top'
                    ? 'mt-16 mb-auto'
                    : brandKit.captionPosition === 'center'
                    ? 'my-auto'
                    : 'mb-16 mt-auto'
                }`}
              >
                {brandKit.captionPreset === 'hormozi_pop' && (
                  <div className="inline-block transform -rotate-1 rounded-md bg-black/85 px-3 py-1.5 shadow-xl border border-white/10">
                    <span
                      className="text-base font-black tracking-wider uppercase font-mono drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
                      style={{
                        color: brandKit.highlightColor,
                        fontFamily: brandKit.fontFamily,
                      }}
                    >
                      {isUppercase ? 'COMPLETELY VANISH' : 'Completely Vanish'}
                    </span>
                  </div>
                )}

                {brandKit.captionPreset === 'keyword_highlight' && (
                  <div className="rounded-lg bg-black/75 px-3 py-2 backdrop-blur-sm border border-white/10">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: brandKit.primaryColor, fontFamily: brandKit.fontFamily }}
                    >
                      {isUppercase ? 'MATH CAN HAPPEN WITH ' : 'Math can happen with '}
                    </span>
                    <span
                      className="text-xs font-bold underline decoration-2"
                      style={{ color: brandKit.highlightColor, fontFamily: brandKit.fontFamily }}
                    >
                      {isUppercase ? 'ZERO ELECTRICITY' : 'zero electricity'}
                    </span>
                  </div>
                )}

                {brandKit.captionPreset === 'karaoke_box' && (
                  <div className="inline-block rounded-lg bg-indigo-600/90 px-3.5 py-1.5 text-xs font-bold tracking-wide text-white shadow-lg">
                    {isUppercase ? 'STOP PAYING TWENTY DOLLARS' : 'Stop paying twenty dollars'}
                  </div>
                )}

                {brandKit.captionPreset === 'clean_minimal' && (
                  <div
                    className="text-xs font-medium tracking-wide text-zinc-100 drop-shadow-md"
                    style={{ fontFamily: brandKit.fontFamily }}
                  >
                    {isUppercase ? 'LISTEN TO THIS BACKGROUND NOISE.' : 'Listen to this background noise.'}
                  </div>
                )}
              </div>
            </div>

            <div className="text-[11px] text-center text-[#71717A] space-y-0.5">
              <p>
                Preset: <span className="font-mono text-white">{brandKit.captionPreset}</span> · Font:{' '}
                <span className="font-mono text-white">{brandKit.fontFamily}</span>
              </p>
              <p>
                Colors: <span className="font-mono text-white">{brandKit.primaryColor}</span> /{' '}
                <span className="font-mono" style={{ color: brandKit.highlightColor }}>
                  {brandKit.highlightColor}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
