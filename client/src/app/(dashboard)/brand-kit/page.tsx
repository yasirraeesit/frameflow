'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_BRAND_KIT } from '@/lib/mock-data';
import type { BrandKitResponse } from '@frameflow/shared';
import {
  Palette,
  Sparkles,
  Type,
  CheckCircle2,
  Save,
  RotateCcw,
  Smartphone,
  Sliders,
  Image as ImageIcon,
  Check,
  Lock,
  Crown,
  ArrowRight,
  Upload,
  Eye,
  EyeOff,
  Layers,
  ShieldCheck,
  User,
  Users,
  X,
  Volume2,
} from 'lucide-react';

type CaptionPreset = 'hormozi_pop' | 'keyword_highlight' | 'karaoke_box' | 'clean_minimal' | 'vice_neon';
type FontFamily = 'Plus Jakarta Sans' | 'Montserrat Black' | 'Inter Bold';
type LogoPosition = 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';
type SpeakerMode = 'solo' | 'split';

interface PresetOption {
  id: CaptionPreset;
  title: string;
  tag: string;
  desc: string;
  sampleBefore: string;
  sampleHighlight: string;
  sampleAfter: string;
}

const PRESET_OPTIONS: PresetOption[] = [
  {
    id: 'hormozi_pop',
    title: 'Hormozi Pop',
    tag: '98% RETENTION',
    desc: 'Bold uppercase single-word bursts with high contrast keyword colors.',
    sampleBefore: 'NOBODY CARES ABOUT',
    sampleHighlight: 'YOUR ROADMAP',
    sampleAfter: 'UNTIL YOU SHIP',
  },
  {
    id: 'vice_neon',
    title: 'Vice Neon',
    tag: 'GTA 6 & GAMING',
    desc: 'Electrifying Vice City cyan & hot magenta glow engineered for high-energy gameplay shorts.',
    sampleBefore: '5-STAR POLICE CHASE',
    sampleHighlight: 'VICE CITY',
    sampleAfter: 'MAX SPEED ESCAPE',
  },
  {
    id: 'karaoke_box',
    title: 'Karaoke Glow',
    tag: 'VIRAL TIKTOK',
    desc: 'Word-by-word animated backing box with synchronized syllable wiping.',
    sampleBefore: 'Stop paying',
    sampleHighlight: 'twenty dollars',
    sampleAfter: 'a month for bloat',
  },
  {
    id: 'keyword_highlight',
    title: 'Clean Cinema',
    tag: 'FOUNDER / TECH',
    desc: 'Natural sentence flow with critical semantic verbs and nouns lit up.',
    sampleBefore: 'Real engineering is about',
    sampleHighlight: 'shipping ruthlessly',
    sampleAfter: 'every single week.',
  },
  {
    id: 'clean_minimal',
    title: 'Minimal Top',
    tag: 'DOCUMENTARY',
    desc: 'Editorial lower-third subtitles for documentary and thought-leadership.',
    sampleBefore: 'Listen closely to this',
    sampleHighlight: 'frequency shift',
    sampleAfter: 'in real time.',
  },
];

const FONT_OPTIONS: { id: FontFamily; label: string; previewClass: string }[] = [
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', previewClass: 'font-sans font-bold' },
  { id: 'Montserrat Black', label: 'Montserrat Black', previewClass: 'font-black tracking-tight' },
  { id: 'Inter Bold', label: 'Inter Bold', previewClass: 'font-sans font-extrabold' },
];

const QUICK_COLORS = [
  { hex: '#E84C2B', label: 'Cinema Coral' },
  { hex: '#00F0FF', label: 'Vice Cyan' },
  { hex: '#FF007F', label: 'Vice Magenta' },
  { hex: '#FACC15', label: 'Electric Yellow' },
  { hex: '#10B981', label: 'Emerald Mint' },
  { hex: '#60A5FA', label: 'Sky Blue' },
  { hex: '#A855F7', label: 'Violet Pop' },
];

export default function BrandKitPage(): JSX.Element {
  // Brand Kit State
  const [brandKit, setBrandKit] = useState<BrandKitResponse>(MOCK_BRAND_KIT);
  const [selectedFont, setSelectedFont] = useState<FontFamily>('Montserrat Black');
  const [isUppercase, setIsUppercase] = useState<boolean>(true);
  const [hasHeavyShadow, setHasHeavyShadow] = useState<boolean>(true);
  const [brandName, setBrandName] = useState<string>('FRAMEFLOW');
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(85); // 20 - 100%
  const [activeTab, setActiveTab] = useState<'primary' | 'pro_new'>('primary');

  // Preview Mode State
  const [speakerMode, setSpeakerMode] = useState<SpeakerMode>('solo');
  const [showSafeZones, setShowSafeZones] = useState<boolean>(false);

  // Interaction feedback states
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showProUpgradeModal, setShowProUpgradeModal] = useState<boolean>(false);
  const [proModalFeature, setProModalFeature] = useState<string>('Multiple Brand Kits');

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    setBrandKit(MOCK_BRAND_KIT);
    setSelectedFont('Montserrat Black');
    setIsUppercase(true);
    setHasHeavyShadow(true);
    setBrandName('FRAMEFLOW');
    setShowWatermark(true);
    setWatermarkOpacity(85);
  };

  const handleOpenProModal = (featureName: string) => {
    setProModalFeature(featureName);
    setShowProUpgradeModal(true);
  };

  const activePreset = PRESET_OPTIONS.find((p) => p.id === brandKit.captionPreset) || PRESET_OPTIONS[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-[#14151A]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E6E4DD] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#FAF3EE] border border-[#E84C2B]/20 flex items-center justify-center text-[#E84C2B]">
              <Palette className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#14151A]">
                  Brand Templates
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FAF3EE] text-[#E84C2B] border border-[#E84C2B]/20">
                  Starter: 1 Template
                </span>
              </div>
              <p className="text-xs text-[#52545E] mt-0.5">
                Configure viral subtitle typography, active keyword highlight colors, and corner watermark branding.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
          <Link
            href="/pricing"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 text-amber-900 text-[11px] font-semibold transition-colors"
          >
            <Crown className="h-3 w-3 text-amber-600" />
            <span>Upgrade to Pro for up to 4 templates & custom fonts</span>
            <ArrowRight className="h-3 w-3 text-amber-600" />
          </Link>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-[#DCDAD2] bg-white px-3.5 py-2 text-xs font-semibold text-[#52545E] hover:text-[#14151A] hover:bg-[#FAF9F5] transition-colors shadow-2xs cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-white animate-bounce" aria-hidden="true" />
                <span>Saved & Applied to 12 Shorts!</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Save & Apply to All Shorts</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Configuration Studio */}
        <div className="lg:col-span-7 space-y-6">
          {/* Template Switcher Tabs */}
          <div className="flex items-center gap-2 border-b border-[#E6E4DD] pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('primary')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'primary'
                  ? 'bg-white border border-[#DCDAD2] text-[#14151A] shadow-xs ring-1 ring-black/5'
                  : 'text-[#6B7280] hover:text-[#14151A]'
                }`}
            >
              <span className="h-2 w-2 rounded-full bg-[#10B981]" />
              <span>Primary Podcast Kit</span>
              <span className="text-[10px] font-mono font-semibold uppercase px-1.5 py-0.2 bg-[#FAF3EE] text-[#E84C2B] rounded">
                Active
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenProModal('Multiple Brand Templates')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8C8E9A] hover:text-[#14151A] hover:bg-white/80 border border-transparent hover:border-[#E6E4DD] transition-all cursor-pointer"
            >
              <Crown className="h-3 w-3 text-amber-500" />
              <span>+ New Template</span>
              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                PRO
              </span>
            </button>
          </div>

          {/* Card 1: Caption Typography & Style */}
          <div className="rounded-2xl border border-[#E6E4DD] bg-white p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-[#FAF3EE] flex items-center justify-center text-[#E84C2B]">
                  <Type className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#14151A]">
                    Caption Typography & Style
                  </h2>
                  <p className="text-[11px] text-[#52545E]">Choose viral subtitle rhythm and animation style</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#8C8E9A] bg-[#FAF9F5] px-2 py-0.5 rounded border border-[#E6E4DD]">
                Auto-synced via AST
              </span>
            </div>

            {/* 4 Signature Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_OPTIONS.map((preset) => {
                const isSelected = brandKit.captionPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      setBrandKit({
                        ...brandKit,
                        captionPreset: preset.id,
                      })
                    }
                    className={`rounded-xl border p-4 text-left transition-all cursor-pointer relative ${isSelected
                        ? 'border-[#E84C2B] bg-[#FFF8F6] shadow-xs ring-1 ring-[#E84C2B]/40'
                        : 'border-[#E6E4DD] bg-[#FAF9F5] hover:border-[#DCDAD2] hover:bg-white'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#14151A]">{preset.title}</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${isSelected
                              ? 'bg-[#E84C2B] text-white'
                              : 'bg-[#E6E4DD] text-[#52545E]'
                            }`}
                        >
                          {preset.tag}
                        </span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-[#E84C2B]" />}
                      </div>
                    </div>

                    <p className="text-[11px] text-[#52545E] leading-relaxed mb-3">
                      {preset.desc}
                    </p>

                    {/* Mini in-card visual preview */}
                    <div className="bg-[#121318] rounded-lg px-2.5 py-1.5 text-center text-[11px] font-bold text-white border border-white/10">
                      <span className="opacity-80">{preset.sampleBefore} </span>
                      <span
                        style={{ color: brandKit.highlightColor }}
                        className={preset.id === 'karaoke_box' ? 'bg-white/20 px-1 py-0.5 rounded' : ''}
                      >
                        {preset.sampleHighlight}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Font Selector & Case Toggle */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#E6E4DD]">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#14151A] flex items-center justify-between">
                  <span>Font Family</span>
                  <button
                    type="button"
                    onClick={() => handleOpenProModal('Custom Font Upload')}
                    className="text-[10px] text-[#E84C2B] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Crown className="h-2.5 w-2.5 text-amber-500" />
                    <span>Upload Font [PRO]</span>
                  </button>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {FONT_OPTIONS.map((f) => {
                    const isSelected = selectedFont === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setSelectedFont(f.id);
                          setBrandKit({ ...brandKit, fontFamily: f.id });
                        }}
                        className={`px-2 py-2 rounded-lg text-center text-[11px] transition-all cursor-pointer border ${isSelected
                            ? 'border-[#E84C2B] bg-[#FFF8F6] text-[#E84C2B] font-bold ring-1 ring-[#E84C2B]/30'
                            : 'border-[#E6E4DD] bg-white text-[#52545E] hover:border-[#DCDAD2]'
                          }`}
                      >
                        <span className={f.previewClass}>{f.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#14151A] block">Text Lettercase</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsUppercase(true)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${isUppercase
                        ? 'border-[#E84C2B] bg-[#FFF8F6] text-[#E84C2B] ring-1 ring-[#E84C2B]/30'
                        : 'border-[#E6E4DD] bg-white text-[#52545E] hover:border-[#DCDAD2]'
                      }`}
                  >
                    ALL CAPS
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUppercase(false)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border ${!isUppercase
                        ? 'border-[#E84C2B] bg-[#FFF8F6] text-[#E84C2B] font-bold ring-1 ring-[#E84C2B]/30'
                        : 'border-[#E6E4DD] bg-white text-[#52545E] hover:border-[#DCDAD2]'
                      }`}
                  >
                    Sentence case
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Brand Color Swatches & Contrast */}
          <div className="rounded-2xl border border-[#E6E4DD] bg-white p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-[#FAF3EE] flex items-center justify-center text-[#E84C2B]">
                <Palette className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#14151A]">
                  Brand Colors & Contrast Legibility
                </h2>
                <p className="text-[11px] text-[#52545E]">High-retention highlight accents and subtitle drop shadow</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Primary Text Color */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#14151A] block">
                  Base Subtitle Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandKit.primaryColor}
                    onChange={(e) => setBrandKit({ ...brandKit, primaryColor: e.target.value })}
                    className="h-9 w-9 rounded-lg border border-[#DCDAD2] cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={brandKit.primaryColor}
                    onChange={(e) => setBrandKit({ ...brandKit, primaryColor: e.target.value })}
                    className="w-28 rounded-xl border border-[#DCDAD2] bg-white px-3 py-2 text-xs font-mono font-bold text-[#14151A] focus:outline-none focus:border-[#E84C2B]"
                  />
                </div>
                <p className="text-[10px] text-[#8C8E9A]">Default: #FFFFFF for optimal contrast over footage</p>
              </div>

              {/* Active Keyword Highlight Color */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#14151A] block">
                  Keyword Highlight Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandKit.highlightColor}
                    onChange={(e) => setBrandKit({ ...brandKit, highlightColor: e.target.value })}
                    className="h-9 w-9 rounded-lg border border-[#DCDAD2] cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={brandKit.highlightColor}
                    onChange={(e) => setBrandKit({ ...brandKit, highlightColor: e.target.value })}
                    className="w-28 rounded-xl border border-[#DCDAD2] bg-white px-3 py-2 text-xs font-mono font-bold text-[#14151A] focus:outline-none focus:border-[#E84C2B]"
                  />
                </div>

                {/* Quick Swatches */}
                <div className="flex items-center gap-1.5 pt-1">
                  {QUICK_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.label}
                      onClick={() => setBrandKit({ ...brandKit, highlightColor: c.hex })}
                      style={{ backgroundColor: c.hex }}
                      className={`h-6 w-6 rounded-full border-2 transition-transform cursor-pointer ${brandKit.highlightColor.toLowerCase() === c.hex.toLowerCase()
                          ? 'border-[#14151A] scale-110 shadow-xs'
                          : 'border-white hover:scale-105'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Outline & Drop Shadow Toggle */}
            <div className="pt-3 border-t border-[#E6E4DD] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#14151A] block">Heavy Black Outline & Drop Shadow</span>
                <span className="text-[11px] text-[#52545E]">
                  Applies deep 3px stroke and cinematic drop shadow for legibility over bright video frames.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHasHeavyShadow(!hasHeavyShadow)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${hasHeavyShadow ? 'bg-[#E84C2B]' : 'bg-[#DCDAD2]'
                  }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${hasHeavyShadow ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>
          </div>

          {/* Card 3: Watermark & Channel Logo Overlay */}
          <div className="rounded-2xl border border-[#E6E4DD] bg-white p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-[#FAF3EE] flex items-center justify-center text-[#E84C2B]">
                  <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#14151A]">
                    Watermark & Corner Brand Badge
                  </h2>
                  <p className="text-[11px] text-[#52545E]">Burn persistent channel mark or handle onto all clips</p>
                </div>
              </div>

              {/* Show/Hide Toggle */}
              <button
                type="button"
                onClick={() => setShowWatermark(!showWatermark)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${showWatermark
                    ? 'bg-[#E84C2B]/10 text-[#E84C2B] border border-[#E84C2B]/20'
                    : 'bg-[#F4F3EF] text-[#8C8E9A] border border-[#E6E4DD]'
                  }`}
              >
                {showWatermark ? (
                  <>
                    <Eye className="h-3 w-3" />
                    <span>Enabled</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3" />
                    <span>Hidden</span>
                  </>
                )}
              </button>
            </div>

            {showWatermark && (
              <div className="space-y-4 pt-1 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Brand / Channel Text */}
                  <div className="space-y-1.5">
                    <label htmlFor="brand-name" className="text-xs font-semibold text-[#14151A] block">
                      Brand Watermark Text
                    </label>
                    <input
                      id="brand-name"
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="e.g. FRAMEFLOW or @yourhandle"
                      className="w-full rounded-xl border border-[#DCDAD2] bg-white px-3.5 py-2 text-xs font-mono font-bold text-[#14151A] focus:outline-none focus:border-[#E84C2B]"
                    />
                  </div>

                  {/* Corner Position Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#14151A] block">
                      Corner Placement
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(
                        [
                          { id: 'top_right', label: 'Top-Right' },
                          { id: 'top_left', label: 'Top-Left' },
                          { id: 'bottom_right', label: 'Bottom-Right' },
                          { id: 'bottom_left', label: 'Bottom-Left' },
                        ] as const
                      ).map((pos) => {
                        const isSelected = brandKit.logoPosition === pos.id;
                        return (
                          <button
                            key={pos.id}
                            type="button"
                            onClick={() =>
                              setBrandKit({
                                ...brandKit,
                                logoPosition: pos.id,
                              })
                            }
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${isSelected
                                ? 'border-[#E84C2B] bg-[#FFF8F6] text-[#E84C2B] ring-1 ring-[#E84C2B]/30'
                                : 'border-[#E6E4DD] bg-white text-[#52545E] hover:border-[#DCDAD2]'
                              }`}
                          >
                            {pos.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Opacity Slider */}
                <div className="space-y-1.5 pt-2 border-t border-[#E6E4DD]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#14151A]">Watermark Opacity</span>
                    <span className="font-mono font-bold text-[#E84C2B]">{watermarkOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                    className="w-full accent-[#E84C2B] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#8C8E9A] font-mono">
                    <span>20% (Subtle)</span>
                    <span>60%</span>
                    <span>100% (Solid)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Sticky Dark Cinema 9:16 Monitor */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="rounded-3xl border border-[#2A2B36] bg-[#121318] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.45)] text-white">
            {/* Monitor Header Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-[#22232B] text-xs">
              <div className="flex items-center gap-2 font-mono">
                <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="font-bold tracking-wider text-zinc-300">9:16 LIVE PREVIEW</span>
              </div>

              {/* Safe Zones Toggle */}
              <button
                type="button"
                onClick={() => setShowSafeZones(!showSafeZones)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${showSafeZones
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
                  }`}
              >
                <ShieldCheck className="h-3 w-3" />
                <span>Safe Zones: {showSafeZones ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Mode Switcher: Solo Speaker vs 2-Speaker Split */}
            <div className="pt-3 pb-3 flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-400">STAGE MODE:</span>
              <div className="flex items-center p-1 bg-[#1A1B22] rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSpeakerMode('solo')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${speakerMode === 'solo'
                      ? 'bg-[#E84C2B] text-white shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                    }`}
                >
                  <User className="h-3 w-3" />
                  <span>Solo Speaker</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSpeakerMode('split')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${speakerMode === 'split'
                      ? 'bg-[#E84C2B] text-white shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                    }`}
                >
                  <Users className="h-3 w-3" />
                  <span>2-Speaker Split</span>
                </button>
              </div>
            </div>

            {/* Authentic Vertical Phone Canvas */}
            <div className="relative w-full max-w-[290px] mx-auto aspect-[9/16] rounded-[36px] border-[6px] border-[#2A2B36] bg-[#0A0A0E] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.8)] my-2 select-none">
              {/* Dynamic Island / Camera Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 w-20 h-4 bg-black rounded-full flex items-center justify-center border border-zinc-800/80">
                <div className="h-2 w-2 rounded-full bg-zinc-900 border border-zinc-800 mr-2" />
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/70" />
              </div>

              {/* Watermark Overlay */}
              {showWatermark && (
                <div
                  style={{ opacity: watermarkOpacity / 100 }}
                  className={`absolute z-30 pointer-events-none transition-all ${brandKit.logoPosition === 'top_right'
                      ? 'top-8 right-3.5'
                      : brandKit.logoPosition === 'top_left'
                        ? 'top-8 left-3.5'
                        : brandKit.logoPosition === 'bottom_right'
                          ? 'bottom-10 right-3.5'
                          : 'bottom-10 left-3.5'
                    }`}
                >
                  <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/15 shadow-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E84C2B]" />
                    <span className="text-[10px] font-mono font-black tracking-wider text-white uppercase">
                      {brandName || 'FRAMEFLOW'}
                    </span>
                  </div>
                </div>
              )}

              {/* Safe Zones Guidelines (Overlay) */}
              {showSafeZones && (
                <div className="absolute inset-0 z-35 pointer-events-none border border-dashed border-emerald-500/40 p-4 m-2 rounded-2xl flex flex-col justify-between">
                  <div className="text-[8px] font-mono text-emerald-400 bg-emerald-950/70 px-1 py-0.5 rounded self-start">
                    SAFE TOP (SEARCH BAR)
                  </div>
                  <div className="text-[8px] font-mono text-emerald-400 bg-emerald-950/70 px-1 py-0.5 rounded self-end">
                    SAFE RIGHT (BUTTONS)
                  </div>
                  <div className="text-[8px] font-mono text-emerald-400 bg-emerald-950/70 px-1 py-0.5 rounded self-start">
                    SAFE BOTTOM (CAPTION AREA)
                  </div>
                </div>
              )}

              {/* Video Content Canvas */}
              {speakerMode === 'solo' ? (
                /* Solo Speaker Video Canvas */
                <div className="absolute inset-0 bg-gradient-to-b from-[#1c1d25] via-[#12131a] to-[#0a0a0f] flex flex-col justify-between p-4">
                  {/* Face Tracking HUD Indicator */}
                  <div className="relative z-10 flex items-center justify-between pt-5">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/50 border border-white/10 text-[9px] font-mono text-zinc-300">
                      <Volume2 className="h-2.5 w-2.5 text-[#E84C2B]" />
                      <span>48kHz AUDIO</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#E84C2B]/20 border border-[#E84C2B]/40 text-[9px] font-mono text-[#E84C2B]">
                      <span>98% FACE RETICLE</span>
                    </span>
                  </div>

                  {/* Speaker Face Reticle / Keylight Stage */}
                  <div className="relative my-auto flex flex-col items-center justify-center">
                    {/* Atmospheric Studio Glow */}
                    <div className="absolute -inset-4 bg-gradient-to-tr from-[#E84C2B]/20 to-amber-500/20 blur-2xl rounded-full" />

                    {/* Speaker Avatar Representation */}
                    <div className="relative h-28 w-28 rounded-2xl border-2 border-[#E84C2B]/50 bg-gradient-to-b from-zinc-800 to-zinc-900 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
                      <User className="h-16 w-16 text-zinc-400 mt-2" />
                      <div className="absolute bottom-1 px-2 py-0.5 rounded bg-black/70 text-[9px] font-mono font-bold text-white border border-white/10">
                        DR. ELENA VANCE
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* 2-Speaker Split Video Canvas */
                <div className="absolute inset-0 flex flex-col">
                  {/* Top Half: Speaker 1 */}
                  <div className="relative flex-1 bg-gradient-to-b from-[#1c1d25] to-[#12131a] border-b-2 border-zinc-800 flex flex-col items-center justify-center p-2">
                    <div className="absolute top-7 left-3 z-10 px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[8px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>ACTIVE SPEAKER</span>
                    </div>
                    <div className="h-16 w-16 rounded-xl border-2 border-emerald-500/60 bg-zinc-800 flex items-center justify-center">
                      <User className="h-9 w-9 text-zinc-300" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-zinc-300 mt-1">Host • Alex Rivera</span>
                  </div>

                  {/* Bottom Half: Speaker 2 */}
                  <div className="relative flex-1 bg-gradient-to-b from-[#12131a] to-[#0a0a0f] flex flex-col items-center justify-center p-2">
                    <div className="h-16 w-16 rounded-xl border border-zinc-700 bg-zinc-900 flex items-center justify-center opacity-75">
                      <User className="h-9 w-9 text-zinc-500" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-zinc-400 mt-1">Guest • Dr. Vance</span>
                  </div>
                </div>
              )}

              {/* Subtitles Overlay (Dynamic with active configuration) */}
              <div className="absolute inset-x-0 bottom-12 z-30 px-3 text-center pointer-events-none">
                <div
                  className={`inline-block max-w-full px-3 py-2 rounded-xl backdrop-blur-md transition-all ${brandKit.captionPreset === 'karaoke_box'
                      ? 'bg-black/85 border border-white/15'
                      : 'bg-black/60 border border-white/10'
                    }`}
                >
                  <p
                    className={`leading-tight ${isUppercase ? 'uppercase' : ''
                      } ${selectedFont === 'Montserrat Black'
                        ? 'font-black tracking-tight text-xs'
                        : selectedFont === 'Plus Jakarta Sans'
                          ? 'font-sans font-extrabold text-xs'
                          : 'font-sans font-bold text-xs'
                      } ${hasHeavyShadow ? 'drop-shadow-[0_3px_8px_rgba(0,0,0,1)]' : ''}`}
                  >
                    <span style={{ color: brandKit.primaryColor }}>
                      {isUppercase ? activePreset.sampleBefore.toUpperCase() : activePreset.sampleBefore}{' '}
                    </span>
                    <span
                      style={{ color: brandKit.highlightColor }}
                      className={`inline-block ${brandKit.captionPreset === 'karaoke_box'
                          ? 'bg-white/20 px-1 py-0.5 rounded shadow-sm'
                          : brandKit.captionPreset === 'hormozi_pop'
                            ? 'scale-105 mx-0.5'
                            : ''
                        }`}
                    >
                      {isUppercase ? activePreset.sampleHighlight.toUpperCase() : activePreset.sampleHighlight}
                    </span>
                    <span style={{ color: brandKit.primaryColor }}>
                      {' '}{isUppercase ? activePreset.sampleAfter.toUpperCase() : activePreset.sampleAfter}
                    </span>
                  </p>
                </div>
              </div>

              {/* Phone Home Indicator Bar */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-40 w-24 h-1 bg-white/40 rounded-full" />
            </div>

            {/* Preview Spec Pill Footer */}
            <div className="pt-3 border-t border-[#22232B] text-center">
              <p className="text-[11px] font-mono text-zinc-400">
                Preset: <span className="text-white font-bold">{activePreset.title}</span> • Font:{' '}
                <span className="text-white font-bold">{selectedFont}</span>
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">
                Safe zones calibrated for TikTok, YouTube Shorts & Instagram Reels
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Plan Upgrade Modal */}
      {showProUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#E6E4DD] text-[#14151A] space-y-4">
            <button
              type="button"
              onClick={() => setShowProUpgradeModal(false)}
              className="absolute top-4 right-4 text-[#8C8E9A] hover:text-[#14151A] p-1 rounded-lg hover:bg-[#FAF9F5] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 bg-amber-100/70 px-2 py-0.5 rounded">
                  PRO FEATURE
                </span>
                <h3 className="text-base font-bold text-[#14151A] mt-0.5">
                  Unlock {proModalFeature}
                </h3>
              </div>
            </div>

            <p className="text-xs text-[#52545E] leading-relaxed">
              FrameFlow Starter gives you 1 universal Brand Kit. Upgrade to <strong>FrameFlow Pro</strong> to create up to 4 custom brand templates, upload custom OTF/TTF fonts, and manage different caption styles across multiple channels or clients.
            </p>

            <div className="rounded-xl bg-[#FAF9F5] border border-[#E6E4DD] p-3 text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#14151A] font-medium">
                <Check className="h-3.5 w-3.5 text-[#10B981]" />
                <span>Up to 4 Brand Templates for different shows & clients</span>
              </div>
              <div className="flex items-center gap-2 text-[#14151A] font-medium">
                <Check className="h-3.5 w-3.5 text-[#10B981]" />
                <span>Upload custom OTF / TTF fonts and brand logos</span>
              </div>
              <div className="flex items-center gap-2 text-[#14151A] font-medium">
                <Check className="h-3.5 w-3.5 text-[#10B981]" />
                <span>300 AI Video Processing Credits / month included</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowProUpgradeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#52545E] hover:text-[#14151A] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
              >
                Maybe Later
              </button>
              <Link
                href="/pricing"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
              >
                <span>View Pro Plans ($39/mo)</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
