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
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[#28282F] bg-[#0C0C0E]/95 px-6 backdrop-blur-md">
      {/* Left: Breadcrumbs & Source Duration */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-[#9E9EA8]">
          <FileVideo className="h-4 w-4 text-[#71717A]" aria-hidden="true" />
          <Link href="/dashboard" className="hover:text-white transition-colors">Projects</Link>
          <span className="text-[#3E3E47]">/</span>
          <span className="font-medium text-[#F4F4F6] max-w-[280px] sm:max-w-[420px] truncate">
            {currentProjectTitle}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 rounded-md bg-[#1E1E23] border border-[#28282F] px-2 py-0.5 text-[11px] text-[#9E9EA8] font-mono tabular-nums">
          <span className="text-[#71717A]">Length:</span>
          <span className="text-white">{sourceDuration}</span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 rounded-md bg-[#1E1E23] border border-[#28282F] px-2 py-0.5 text-[11px] text-[#10B981] font-mono">
          <Radio className="h-3 w-3 animate-pulse" aria-hidden="true" />
          <span>Worker Stream: Ready</span>
        </div>
      </div>

      {/* Right: Actions, Filters & CTA */}
      <div className="flex items-center gap-3">
        <Link
          href="/exports"
          className="flex items-center gap-1.5 rounded-lg border border-[#28282F] bg-[#141417] px-3 py-1.5 text-xs font-medium text-[#F4F4F6] hover:bg-[#1E1E23] hover:border-[#3E3E47] transition-colors"
        >
          <Download className="h-3.5 w-3.5 text-[#9E9EA8]" aria-hidden="true" />
          <span className="hidden sm:inline">Exports</span>
          <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-mono text-[#10B981] border border-emerald-500/20">
            2
          </span>
        </Link>

        <Link
          href="/brand-kit"
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[#28282F] bg-[#141417] px-3 py-1.5 text-xs font-medium text-[#F4F4F6] hover:bg-[#1E1E23] hover:border-[#3E3E47] transition-colors"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-[#9E9EA8]" aria-hidden="true" />
          <span>Preset</span>
        </Link>

        <Link
          href="/editor/e1011111-1111-4111-8111-111111111111"
          className="flex items-center gap-1.5 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] px-3.5 py-1.5 text-xs font-bold text-[#0C0C0E] shadow-sm transition-all active:scale-[0.98]"
        >
          <span>Open Studio</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
