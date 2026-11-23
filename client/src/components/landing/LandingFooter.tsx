'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

export function LandingFooter(): JSX.Element {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().length > 3) {
      setIsSubscribed(true);
      setTimeout(() => {
        setEmail('');
      }, 1000);
    }
  };

  return (
    <footer className="relative border-t border-[#E6E4DD] bg-[#FAF9F5] pt-16 pb-8 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ========================================================= */}
        {/* TIER 1: BRAND STORY + 4 NAVIGATION COLUMNS                */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left: Brand Story & Socials (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              {/* Custom geometric FrameFlow viewfinder mark */}
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-[#E6E4DD] shadow-xs group-hover:border-[#E84C2B]/60 transition-colors">
                <div className="absolute top-1 left-1 h-1.5 w-1.5 border-t-2 border-l-2 border-[#E84C2B]" />
                <div className="absolute top-1 right-1 h-1.5 w-1.5 border-t-2 border-r-2 border-[#E84C2B]" />
                <div className="absolute bottom-1 left-1 h-1.5 w-1.5 border-b-2 border-l-2 border-[#E84C2B]" />
                <div className="absolute bottom-1 right-1 h-1.5 w-1.5 border-b-2 border-r-2 border-[#E84C2B]" />
                <div className="h-1.5 w-1.5 rounded-full bg-[#E84C2B]" />
              </div>

              <span className="text-lg font-bold tracking-[-0.03em] text-[#14151A]">
                FrameFlow
              </span>
            </Link>

            <p className="text-sm text-[#52545E] leading-relaxed max-w-[42ch]">
              Turn long podcasts, interviews, and YouTube videos into viral 9:16 shorts with animated captions and a real timeline editor underneath.
            </p>

            {/* Social Icon Links */}
            <div className="flex items-center gap-2.5 pt-1">
              {/* X / Twitter */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X (formerly Twitter)"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E6E4DD] bg-white text-[#52545E] hover:text-[#14151A] hover:border-[#14151A] transition-all shadow-2xs"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E6E4DD] bg-white text-[#52545E] hover:text-[#14151A] hover:border-[#14151A] transition-all shadow-2xs"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* Discord */}
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Discord"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E6E4DD] bg-white text-[#52545E] hover:text-[#14151A] hover:border-[#14151A] transition-all shadow-2xs"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E6E4DD] bg-white text-[#52545E] hover:text-[#14151A] hover:border-[#14151A] transition-all shadow-2xs"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right: 4 Navigation Columns (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Col 1: Product */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#14151A]">
                Product
              </h4>
              <ul className="space-y-2 text-xs text-[#52545E]">
                <li>
                  <Link href="/dashboard" className="hover:text-[#14151A] transition-colors">
                    AI Clip Generator
                  </Link>
                </li>
                <li>
                  <Link href="/editor/e1011111-1111-4111-8111-111111111111" className="hover:text-[#14151A] transition-colors">
                    Studio Timeline Editor
                  </Link>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-[#14151A] transition-colors">
                    Auto Reframe & Layouts
                  </a>
                </li>
                <li>
                  <a href="#engine" className="hover:text-[#14151A] transition-colors">
                    Caption Styles
                  </a>
                </li>
                <li>
                  <Link href="/brand-kit" className="hover:text-[#14151A] transition-colors">
                    Brand Kits
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 2: Use Cases */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#14151A]">
                Use Cases
              </h4>
              <ul className="space-y-2 text-xs text-[#52545E]">
                <li>
                  <span className="hover:text-[#14151A] cursor-pointer transition-colors">
                    Podcasters
                  </span>
                </li>
                <li>
                  <span className="hover:text-[#14151A] cursor-pointer transition-colors">
                    YouTube Creators
                  </span>
                </li>
                <li>
                  <span className="hover:text-[#14151A] cursor-pointer transition-colors">
                    Agencies & Editors
                  </span>
                </li>
                <li>
                  <span className="hover:text-[#14151A] cursor-pointer transition-colors">
                    Founders & Marketers
                  </span>
                </li>
              </ul>
            </div>

            {/* Col 3: Cloud & Models */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#14151A]">
                Cloud & Models
              </h4>
              <ul className="space-y-2 text-xs text-[#52545E]">
                <li>
                  <Link href="/pricing" className="hover:text-[#14151A] transition-colors">
                    Managed Cloud GPU
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-[#14151A] transition-colors">
                    Virality Scoring Engine
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[#14151A] transition-colors">
                    1080p 60fps Pipeline
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-[#14151A] transition-colors">
                    Pricing & Free Plan
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Company */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#14151A]">
                Company
              </h4>
              <ul className="space-y-2 text-xs text-[#52545E]">
                <li>
                  <span className="hover:text-[#14151A] cursor-pointer transition-colors">
                    Changelog
                  </span>
                </li>
                <li>
                  <span className="hover:text-[#14151A] cursor-pointer transition-colors">
                    Help Center
                  </span>
                </li>
                <li>
                  <span className="hover:text-[#14151A] cursor-pointer transition-colors">
                    Privacy Policy
                  </span>
                </li>
                <li>
                  <span className="hover:text-[#14151A] cursor-pointer transition-colors">
                    Terms of Service
                  </span>
                </li>
                <li>
                  <span className="hover:text-[#14151A] cursor-pointer transition-colors">
                    Contact
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TIER 2: CREATOR NEWSLETTER & SYSTEM STATUS STRIP          */}
        {/* ========================================================= */}
        <div className="pt-8 border-t border-[#E6E4DD] flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Inline Email Signup */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="text-xs font-medium text-[#14151A] shrink-0">
              Get weekly short-form editing tips & product updates
            </span>
            <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isSubscribed}
                className="bg-white border border-[#E6E4DD] rounded-xl px-3.5 py-1.5 text-xs text-[#14151A] placeholder-[#8C8E9A] focus:outline-none focus:border-[#E84C2B] shadow-2xs w-full sm:w-56 transition-all"
              />
              <button
                type="submit"
                disabled={isSubscribed}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#14151A] hover:bg-[#252732] text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
              >
                {isSubscribed ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>Subscribed!</span>
                  </>
                ) : (
                  <span>Subscribe</span>
                )}
              </button>
            </form>
          </div>

          {/* Live System Status Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E6E4DD] bg-white px-3 py-1 text-[11px] font-mono text-[#52545E] shadow-2xs shrink-0">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>All rendering & AI pipelines operational</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TIER 3: LEGAL BAR + ARCHITECTURAL WORDMARK                */}
        {/* ========================================================= */}
        <div className="pt-8 border-t border-[#E6E4DD] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C8E9A]">
          <div>© 2026 FrameFlow Inc. All rights reserved.</div>
          <div className="font-medium text-[#52545E]">
            Made for creators who still care about the edit.
          </div>
        </div>

        {/* Subtle, large low-contrast FrameFlow typographic watermark */}
        <div className="relative pt-4 -mb-10 sm:-mb-14 select-none pointer-events-none overflow-hidden text-center" aria-hidden="true">
          <span className="text-[64px] sm:text-[110px] lg:text-[150px] font-black tracking-tighter text-[#14151A]/[0.035] uppercase leading-none block">
            FrameFlow
          </span>
        </div>
      </div>
    </footer>
  );
}
