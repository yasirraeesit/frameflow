'use client';

import React from 'react';
import Link from 'next/link';
import {
  Check,
  X,
  ArrowRight,
  Sparkles,
  Key,
} from 'lucide-react';

export function PricingComparison(): JSX.Element {
  return (
    <section id="pricing" className="border-t border-[#E6E4DD] bg-[#FAF9F5] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header with Editorial Serif */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E6E4DD] bg-white px-3 py-1 text-xs font-mono tracking-wider uppercase text-[#E84C2B] shadow-2xs">
            <Key className="h-3.5 w-3.5" />
            <span>HONEST PRICING & ZERO MINUTE TRAPS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.035em] text-[#14151A] leading-tight">
            Honest Pricing & Clear Credits.{' '}
            <span className="font-editorial text-[#E84C2B] font-normal italic text-4xl sm:text-5xl lg:text-6xl block sm:inline">
              30 Free Trial Credits.
            </span>
          </h2>

          <p className="text-[15px] sm:text-base text-[#52545E] leading-relaxed max-w-[54ch] mx-auto">
            Other clipping tools charge $49 to $99 a month for credits that expire every 30 days and lock you into a baby editor. FrameFlow gives you a real editing studio with 30 free trial credits and fair managed plans powered by Paddle.
          </p>
        </div>

        {/* Feature Comparison Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
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
                  <span>Watermarked exports and 720p limits on trial tiers</span>
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
                  <span className="text-3xl font-extrabold text-[#14151A]">$0</span>
                  <span className="text-xs text-emerald-600 font-mono font-bold">
                    30 Free Trial Credits Included
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
                  <span>Clean 1080p MP4 exports with zero watermarks on every short</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Unlimited revisions, caption restyling, and instant Ctrl+Z undo</span>
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

        {/* Commercial Plans Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Card 1: Starter */}
          <div className="rounded-2xl border border-[#E6E4DD] bg-white p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#14151A]">Free Trial Starter</h3>
                <p className="text-xs text-[#52545E]">Ideal for solo creators and podcasters</p>
              </div>
              <span className="text-2xl font-extrabold text-[#14151A]">$0</span>
            </div>
            <ul className="space-y-2 text-xs text-[#52545E] pt-2 border-t border-[#E6E4DD]">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>30 free trial credits on signup</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Instant cloud GPU rendering with zero watermark</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Full 4-track timeline & text transcript cut editor</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Clean 1080p MP4 exports with zero watermarks</span>
              </li>
            </ul>
            <Link
              href="/register"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#DCDAD2] bg-[#FAF9F5] hover:bg-white hover:border-[#14151A] text-[#14151A] py-2.5 text-xs font-bold transition-all shadow-2xs"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 2: Pro Studio */}
          <div className="rounded-2xl border border-[#E6E4DD] bg-white p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#14151A]">Pro Studio</h3>
                <p className="text-xs text-[#52545E]">For production teams and agencies</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-[#14151A]">$19</span>
                <span className="text-xs text-[#8C8E9A] font-mono"> / mo</span>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-[#52545E] pt-2 border-t border-[#E6E4DD]">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>300 cloud-render minutes with rollover (never expires!)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Priority cloud rendering queue & 4K source support</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Unlimited custom brand kits, logos, and custom fonts</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Batch export all 15 shorts in one click</span>
              </li>
            </ul>
            <Link
              href="/register"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#14151A] hover:bg-[#252732] text-white py-2.5 text-xs font-bold transition-all shadow-xs"
            >
              <span>Start Pro 14-Day Free Trial</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#E84C2B]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
