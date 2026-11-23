'use client';

import React from 'react';
import Link from 'next/link';
import {
  Radio,
  SlidersHorizontal,
  FileVideo,
  Download,
  ArrowRight,
} from 'lucide-react';

interface HeaderProps {
  currentProjectTitle?: string;
  sourceDuration?: string;
}

export function Header({
  currentProjectTitle = 'The AI Hardware Revolution & Future of Silicon',
  sourceDuration = '01:02:22',
}: HeaderProps): JSX.Element {
  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[#E6E4DD] bg-white/90 px-6 backdrop-blur-md text-[#14151A]">
      {/* Left: Breadcrumbs & Source Duration */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-[#52545E]">
          <FileVideo className="h-4 w-4 text-[#8C8E9A]" aria-hidden="true" />
          <Link href="/dashboard" className="hover:text-[#14151A] font-medium transition-colors">
            Projects
          </Link>
          <span className="text-[#C5C3BC]">/</span>
          <span className="font-bold text-[#14151A] max-w-[240px] sm:max-w-[380px] truncate">
            {currentProjectTitle}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-[#FAF9F5] border border-[#E6E4DD] px-2.5 py-1 text-[11px] text-[#52545E] font-mono tabular-nums">
          <span className="text-[#8C8E9A]">Length:</span>
          <span className="text-[#14151A] font-semibold">{sourceDuration}</span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-[11px] text-emerald-700 font-mono">
          <Radio className="h-3 w-3 animate-pulse text-emerald-600" aria-hidden="true" />
          <span className="font-semibold">Worker Stream: Ready</span>
        </div>
      </div>

      {/* Right: Actions, Filters & CTA */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <Link
          href="/exports"
          className="flex items-center gap-1.5 rounded-xl border border-[#E6E4DD] bg-white px-3 py-1.5 text-xs font-semibold text-[#14151A] hover:bg-[#FAF9F5] hover:border-[#DCDAD2] transition-colors shadow-2xs"
        >
          <Download className="h-3.5 w-3.5 text-[#52545E]" aria-hidden="true" />
          <span className="hidden sm:inline">Exports</span>
          <span className="rounded-full bg-emerald-50 px-1.5 py-0.2 text-[10px] font-mono font-bold text-emerald-700 border border-emerald-200">
            2
          </span>
        </Link>

        <Link
          href="/brand-kit"
          className="hidden sm:flex items-center gap-1.5 rounded-xl border border-[#E6E4DD] bg-white px-3 py-1.5 text-xs font-semibold text-[#14151A] hover:bg-[#FAF9F5] hover:border-[#DCDAD2] transition-colors shadow-2xs"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-[#52545E]" aria-hidden="true" />
          <span>Brand Kit</span>
        </Link>

        <Link
          href="/editor/e1011111-1111-4111-8111-111111111111"
          className="flex items-center gap-1.5 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all active:scale-[0.98]"
        >
          <span>Open Studio</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
