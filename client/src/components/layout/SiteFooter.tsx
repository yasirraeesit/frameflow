'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

export function SiteFooter(): JSX.Element {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email.trim().length > 3) {
      setIsSubscribed(true);
      setTimeout(() => {
        setEmail('');
      }, 1500);
    }
  };

  return (
    <footer className="relative bg-[#FAF9F5] border-t border-[#E6E4DD] pt-16 sm:pt-20 pb-8 overflow-hidden">
      {/* ========================================================= */}
      {/* 1. TOP PRE-FOOTER CONVERSION STRIP                        */}
      {/* ========================================================= */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
        <div className="relative rounded-3xl bg-[#121318] text-white px-8 py-12 lg:px-14 lg:py-14 border border-[#2A2C38] shadow-2xl overflow-hidden">
          {/* Subtle Cinema Coral atmospheric glow */}
          <div
            className="pointer-events-none absolute -top-24 right-0 w-96 h-96 bg-[#E84C2B]/15 blur-3xl rounded-full"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 left-0 w-80 h-80 bg-[#10B981]/10 blur-3xl rounded-full"
            aria-hidden="true"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-8">
            {/* Left Column (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <span className="text-[#E84C2B] font-mono text-xs tracking-[0.14em] uppercase font-bold">
                READY IN UNDER 3 MINUTES
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] leading-[1.1] text-white">
                Turn your next long video into{' '}
                <span className="font-editorial text-[#E84C2B] font-normal italic text-3xl sm:text-4xl lg:text-[42px]">
                  15 viral shorts
                </span>{' '}
                today.
              </h2>

              <p className="text-[#A1A1AA] text-sm sm:text-base max-w-[46ch] mt-3 leading-relaxed">
                Auto-reframe speakers, burn animated captions in 20+ languages, and fine-tune every cut in our multi-track studio.
              </p>
            </div>

            {/* Right Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-3.5 w-full">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] text-white font-semibold px-6 py-3.5 text-sm transition-all shadow-md active:scale-[0.98] w-full sm:w-auto text-center"
              >
                <span>Start Clipping Free</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#2C2E38] hover:border-white/40 text-white px-6 py-3.5 text-sm font-semibold transition-colors bg-white/5 hover:bg-white/10 w-full sm:w-auto text-center"
              >
                <span>View Plans & Credits</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN MULTI-COLUMN COMPANY FOOTER                       */}
      {/* ========================================================= */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Brand Column (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              {/* Geometric FrameFlow viewfinder mark */}
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

            <p className="text-[#52545E] text-sm leading-relaxed max-w-[34ch]">
              AI-powered video clipping with Virality Scoring, animated captions, and a real non-destructive timeline built for modern creators and teams.
            </p>

            {/* Social Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              {/* X / Twitter */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X (formerly Twitter)"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E6E4DD] bg-white text-[#14151A] hover:border-[#14151A] transition-all shadow-2xs"
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
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E6E4DD] bg-white text-[#14151A] hover:border-[#14151A] transition-all shadow-2xs"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E6E4DD] bg-white text-[#14151A] hover:border-[#14151A] transition-all shadow-2xs"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E6E4DD] bg-white text-[#14151A] hover:border-[#14151A] transition-all shadow-2xs"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* 4 Navigation Columns (8 cols) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Column 1: Product */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#14151A]">
                Product
              </h4>
              <ul className="space-y-2.5 text-xs text-[#52545E]">
                <li>
                  <a href="/#engine" className="hover:text-[#14151A] transition-colors">
                    AI Clip Generator
                  </a>
                </li>
                <li>
                  <a href="/#editor" className="hover:text-[#14151A] transition-colors">
                    Studio Timeline Editor
                  </a>
                </li>
                <li>
                  <a href="/#captions" className="hover:text-[#14151A] transition-colors">
                    Animated Captions
                  </a>
                </li>
                <li>
                  <Link href="/brand-kit" className="hover:text-[#14151A] transition-colors">
                    Brand Templates
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-[#14151A] transition-colors font-semibold text-[#14151A]">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Workflows */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#14151A]">
                Workflows
              </h4>
              <ul className="space-y-2.5 text-xs text-[#52545E]">
                <li>
                  <Link href="/dashboard" className="hover:text-[#14151A] transition-colors">
                    YouTube & Podcasts
                  </Link>
                </li>
                <li>
                  <Link href="/projects/demo-1" className="hover:text-[#14151A] transition-colors">
                    TikTok & Reels
                  </Link>
                </li>
                <li>
                  <Link href="/exports" className="hover:text-[#14151A] transition-colors">
                    Premiere & DaVinci Export
                  </Link>
                </li>
                <li>
                  <span className="hover:text-[#14151A] cursor-pointer transition-colors">
                    Social Media Scheduler
                  </span>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-[#14151A] transition-colors">
                    Team Workspaces
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#14151A]">
                Resources
              </h4>
              <ul className="space-y-2.5 text-xs text-[#52545E]">
                <li>
                  <span className="hover:text-[#14151A] cursor-pointer transition-colors">
                    Creator Blog
                  </span>
                </li>
                <li>
                  <a href="/#virality-engine" className="hover:text-[#14151A] transition-colors">
                    Virality Score Guide
                  </a>
                </li>
                <li>
                  <a href="/#faq" className="hover:text-[#14151A] transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <span className="hover:text-[#14151A] cursor-pointer transition-colors">
                    Changelog
                  </span>
                </li>
                <li>
                  <span className="hover:text-[#14151A] cursor-pointer transition-colors">
                    System Status
                  </span>
                </li>
              </ul>
            </div>

            {/* Column 4: Company */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#14151A]">
                Company
              </h4>
              <ul className="space-y-2.5 text-xs text-[#52545E]">
                <li>
                  <span className="hover:text-[#14151A] cursor-pointer transition-colors">
                    About FrameFlow
                  </span>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-[#14151A] transition-colors">
                    Enterprise & Business
                  </Link>
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
                  <Link href="/register?plan=business" className="hover:text-[#14151A] transition-colors">
                    Contact Sales
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. NEWSLETTER & OPERATIONAL STATUS BAR                    */}
        {/* ========================================================= */}
        <div className="mt-14 pt-8 border-t border-[#E6E4DD] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Newsletter subscription form */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
            <span className="text-xs font-medium text-[#52545E] whitespace-nowrap">
              Weekly short-form hooks & product drops:
            </span>

            <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@channel.com"
                className="bg-white border border-[#DCDAD2] rounded-xl px-3.5 py-2 text-xs text-[#14151A] placeholder:text-[#8C8E9A] focus:outline-none focus:border-[#E84C2B] w-full sm:w-60 shadow-2xs"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-[#14151A] hover:bg-[#2C2E38] text-white px-4 py-2 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
              >
                {isSubscribed ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>Joined!</span>
                  </>
                ) : (
                  <span>Subscribe</span>
                )}
              </button>
            </form>
          </div>

          {/* Live Operational Status */}
          <div className="inline-flex items-center gap-2 bg-white border border-[#E6E4DD] px-3.5 py-1.5 rounded-full text-xs text-[#52545E] shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
            </span>
            <span className="font-mono text-[11px]">
              All AI clipping & export pipelines operational
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. COPYRIGHT & OVERSIZED SUBTLE BRAND WATERMARK          */}
        {/* ========================================================= */}
        <div className="mt-8 pt-6 border-t border-[#E6E4DD]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8C8E9A]">
          <div>
            &copy; {new Date().getFullYear()} FrameFlow Inc. All rights reserved.
          </div>
          <div>
            Built for creators, podcasters & video teams.
          </div>
        </div>

        {/* Oversized Typographic Watermark */}
        <div
          className="text-5xl sm:text-8xl lg:text-[148px] font-bold tracking-[-0.04em] text-[#14151A]/[0.035] leading-none text-center select-none mt-6 overflow-hidden pointer-events-none truncate"
          aria-hidden="true"
        >
          FrameFlow
        </div>
      </div>
    </footer>
  );
}
