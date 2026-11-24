'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  X,
  ArrowRight,
  Sparkles,
  Key,
  Film,
  Building2,
  Zap,
} from 'lucide-react';
import { BusinessContactModal } from '@/components/modals/BusinessContactModal';

export function PricingComparison(): JSX.Element {
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);

  return (
    <section id="pricing" className="border-t border-[#E6E4DD] bg-[#FAF9F5] py-20 lg:py-28 text-[#14151A]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header with Editorial Serif */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E6E4DD] bg-white px-3 py-1 text-xs font-mono tracking-wider uppercase text-[#E84C2B] shadow-2xs">
            <Key className="h-3.5 w-3.5" />
            <span>HONEST PRICING & ZERO MINUTE TRAPS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.035em] text-[#14151A] leading-tight">
            Honest Pricing & Clear Credits.{' '}
            <span className="font-serif text-[#E84C2B] font-normal italic text-4xl sm:text-5xl lg:text-6xl block sm:inline">
              Starting at $3/mo.
            </span>
          </h2>

          <p className="text-[15px] sm:text-base text-[#52545E] leading-relaxed max-w-[56ch] mx-auto">
            Other clipping tools charge $49 to $99 a month for credits that expire every 30 days and lock you into a single-track baby editor. FrameFlow gives you full timeline precision with fair, accessible tiers.
          </p>
        </div>

        {/* Feature Comparison Matrix Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
          {/* Left Column: Other Clipping Tools */}
          <div className="rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(20,21,26,0.03)]">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-red-600 font-bold">
                  Other Clipping Tools
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#14151A]">$49 – $99</span>
                  <span className="text-xs text-[#8C8E9A] font-mono">/ month</span>
                </div>
                <p className="text-xs text-[#52545E]">
                  Artificial minute caps, expensive credit markups, and locked single-track baby editors.
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#E6E4DD] text-xs text-[#52545E]">
                <div className="flex items-start gap-2.5">
                  <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Expiring credits (120–300 mins/mo) that vanish at billing cycle</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Locked baby editor: cannot tweak cuts or adjust single words</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Re-rendering a single caption mistake burns your paid minutes</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Watermarked exports and 720p limits on entry tiers</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Zero B-roll overlay tracks or multi-track audio control</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E6E4DD] text-[11px] font-mono text-[#8C8E9A]">
              Expensive credit lock-in for basic cuts
            </div>
          </div>

          {/* Right Column: FrameFlow Studio (Cinema Coral Highlight) */}
          <div className="rounded-2xl border-2 border-[#E84C2B] bg-white p-6 sm:p-8 space-y-6 shadow-[0_12px_40px_rgba(232,76,43,0.08)] relative flex flex-col justify-between">
            {/* Top Recommended Tag */}
            <div className="absolute -top-3.5 right-6 inline-flex items-center gap-1.5 rounded-full bg-[#E84C2B] px-3 py-0.5 text-[10px] font-mono font-bold text-white shadow-sm uppercase">
              <Sparkles className="h-3 w-3" />
              <span>Creator-First Freedom</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-[#E84C2B] font-bold">
                  FrameFlow Studio
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#14151A]">$3</span>
                  <span className="text-xs text-emerald-600 font-mono font-bold">
                    / mo (or Free Trial with 30 Credits)
                  </span>
                </div>
                <p className="text-xs text-[#52545E]">
                  Full studio editing capability with zero artificial credit extortion.
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#E6E4DD] text-xs text-[#14151A]">
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>30 Free Trial Credits (No credit card required to start)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Full non-destructive timeline: Video, B-Roll, Subtitles, and Master Audio</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Text-based transcript cuts + frame-accurate playhead trimming</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Watermark-free 1080p 60fps exports &amp; unmetered timeline tweaks</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>AI B-Roll (V2) overlays and customizable Brand Kits</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E6E4DD] flex items-center justify-between">
              <span className="text-[11px] font-mono text-emerald-600 font-semibold">
                100% Client-Side Privacy
              </span>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] text-white px-5 py-2.5 text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
              >
                <span>Make My Shorts</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 4-Tier Commercial Pricing Lineup */}
        <div className="space-y-6 pt-4">
          <div className="text-center space-y-1.5">
            <h3 className="text-2xl font-bold tracking-tight text-[#14151A]">
              Choose Your Production Capacity
            </h3>
            <p className="text-xs sm:text-sm text-[#52545E]">
              Clear monthly quotas powered by Paddle. Cancel or switch anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* 1. Free */}
            <div className="rounded-2xl border border-[#E6E4DD] bg-white p-6 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-[#8C8E9A] uppercase tracking-wider">
                    Free Trial
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#14151A]">$0</span>
                    <span className="text-xs font-mono text-[#8C8E9A]">/ forever</span>
                  </div>
                  <p className="text-xs text-[#52545E]">
                    Test FrameFlow with full text-based editing precision.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E6E4DD] text-xs font-mono font-bold text-[#14151A] flex items-center gap-2">
                  <Film className="h-3.5 w-3.5 text-[#10B981]" />
                  <span>30 One-Time Trial Credits</span>
                </div>

                <ul className="space-y-2 text-xs text-[#52545E] pt-2 border-t border-[#E6E4DD]">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>30 minutes of raw video ingest</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>720p clean exports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Gaming &amp; GTA 6 hybrid detector</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>1 Brand Template preset</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#DCDAD2] bg-[#FAF9F5] hover:bg-white hover:border-[#14151A] text-[#14151A] py-2.5 text-xs font-bold transition-all shadow-2xs"
              >
                <span>Start Free</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* 2. Pro */}
            <div className="rounded-2xl border border-[#E6E4DD] bg-white p-6 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-[#E84C2B] uppercase tracking-wider">
                    Pro Creator
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#14151A]">$3</span>
                    <span className="text-xs font-mono text-[#8C8E9A]">/ month</span>
                  </div>
                  <p className="text-xs text-[#52545E]">
                    Billed $29/year ($2.40/mo) or $3/mo cancel anytime.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E6E4DD] text-xs font-mono font-bold text-[#14151A] flex items-center gap-2">
                  <Film className="h-3.5 w-3.5 text-[#10B981]" />
                  <span>120 Video Mins / Month</span>
                </div>

                <ul className="space-y-2 text-xs text-[#52545E] pt-2 border-t border-[#E6E4DD]">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Watermark-free 1080p 60fps exports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>2 Custom Brand Templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Voiceover Hook mic recorder</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Unused credits roll over automatically</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/pricing"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#14151A] hover:bg-black text-white py-2.5 text-xs font-bold transition-all shadow-xs"
              >
                <span>Get Pro — $3/mo</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#E84C2B]" />
              </Link>
            </div>

            {/* 3. Max (Cinema Coral Highlighted Card) */}
            <div className="rounded-2xl border-2 border-[#E84C2B] bg-white p-6 flex flex-col justify-between space-y-6 shadow-[0_12px_40px_rgba(232,76,43,0.08)] relative ring-1 ring-[#E84C2B]/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-[#E84C2B] px-3 py-0.5 text-[10px] font-mono font-bold text-white uppercase shadow-xs">
                <Sparkles className="h-3 w-3" />
                <span>MOST POPULAR</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-[#E84C2B] uppercase tracking-wider">
                    Max Studio
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#14151A]">$10</span>
                    <span className="text-xs font-mono text-[#8C8E9A]">/ month</span>
                  </div>
                  <p className="text-xs text-[#52545E]">
                    Billed $96/year ($8/mo) or $10/mo cancel anytime.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E84C2B]/30 text-xs font-mono font-bold text-[#14151A] flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-[#E84C2B]" />
                  <span>500 Video Mins / Month</span>
                </div>

                <ul className="space-y-2 text-xs text-[#14151A] pt-2 border-t border-[#E6E4DD]">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#E84C2B] shrink-0" />
                    <span className="font-semibold">AI B-Roll (V2) image &amp; video overlays</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#E84C2B] shrink-0" />
                    <span>5 Brand Templates + Custom Fonts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#E84C2B] shrink-0" />
                    <span>Priority GPU cloud rendering queue</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#E84C2B] shrink-0" />
                    <span>Full 3-metric AI Virality Score Engine</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/pricing"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] text-white py-2.5 text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <span>Get Max — $10/mo</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* 4. Business */}
            <div className="rounded-2xl border border-[#2A2C38] bg-[#121318] p-6 flex flex-col justify-between space-y-6 text-white shadow-xl">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-[#8C8E9A] uppercase tracking-wider">
                    Studios &amp; Networks
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">Custom</span>
                  </div>
                  <p className="text-xs text-[#9A9BA6]">
                    Tailored monthly invoicing and enterprise SLA.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#1A1C24] border border-[#2A2C38] text-xs font-mono font-bold text-white flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-[#00F0FF]" />
                  <span>Custom Credit Quota (1,000+)</span>
                </div>

                <ul className="space-y-2 text-xs text-[#D3D4DC] pt-2 border-t border-[#2A2C38]">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#00F0FF] shrink-0" />
                    <span>4K 60fps master exports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#00F0FF] shrink-0" />
                    <span>Premiere Pro &amp; DaVinci XML export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#00F0FF] shrink-0" />
                    <span>Unlimited Brand Templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#00F0FF] shrink-0" />
                    <span>Dedicated Slack / WhatsApp VIP support</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-[#FAF9F5] text-[#14151A] py-2.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <span>Contact Sales</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <BusinessContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </section>
  );
}
