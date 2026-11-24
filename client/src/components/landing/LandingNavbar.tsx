'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, LogOut } from 'lucide-react';
import { isUserAuthenticated, signOutUser } from '@/lib/auth';

export function LandingNavbar(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    setIsAuthenticated(isUserAuthenticated());
  }, []);
  return (
    <header className="sticky top-0 z-50 h-[64px] w-full border-b border-[#E6E4DD] bg-[#FAF9F5]/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Viewfinder Mark + Wordmark + BETA Badge */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Custom geometric FrameFlow viewfinder mark */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-[#E6E4DD] shadow-xs group-hover:border-[#E84C2B]/60 transition-colors">
              {/* Corner brackets */}
              <div className="absolute top-1 left-1 h-1.5 w-1.5 border-t-2 border-l-2 border-[#E84C2B]" />
              <div className="absolute top-1 right-1 h-1.5 w-1.5 border-t-2 border-r-2 border-[#E84C2B]" />
              <div className="absolute bottom-1 left-1 h-1.5 w-1.5 border-b-2 border-l-2 border-[#E84C2B]" />
              <div className="absolute bottom-1 right-1 h-1.5 w-1.5 border-b-2 border-r-2 border-[#E84C2B]" />
              {/* Center cinema coral dot */}
              <div className="h-1.5 w-1.5 rounded-full bg-[#E84C2B]" />
            </div>

            <span className="text-base font-bold tracking-[-0.03em] text-[#14151A]">
              FrameFlow
            </span>
          </Link>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#E6E4DD] px-2.5 py-0.5 text-[10px] font-mono tracking-wider font-semibold uppercase text-[#52545E] shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E84C2B] animate-pulse" />
            <span>BETA</span>
          </span>
        </div>

        {/* Center: Clean Anchor Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#52545E]" aria-label="Main Navigation">
          <a
            href="#virality-engine"
            className="hover:text-[#14151A] transition-colors"
          >
            Virality Audit
          </a>
          <a
            href="#how-it-works"
            className="hover:text-[#14151A] transition-colors"
          >
            Dual Editor
          </a>
          <a
            href="#engine"
            className="hover:text-[#14151A] transition-colors"
          >
            Caption Styles
          </a>
          <Link
            href="/pricing"
            className="hover:text-[#14151A] transition-colors"
          >
            Pricing
          </Link>
          <a
            href="#faq"
            className="hover:text-[#14151A] transition-colors"
          >
            FAQ
          </a>
        </nav>

        {/* Right: Commercial Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => void signOutUser()}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#52545E] hover:text-[#E84C2B] hover:bg-[#FFF8F6] border border-transparent hover:border-[#E84C2B]/20 transition-all px-3 py-1.5 rounded-xl cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Sign Out</span>
              </button>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] text-white px-4 py-2 text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-semibold text-[#52545E] hover:text-[#14151A] transition-colors px-2.5 py-1"
              >
                Log in
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] text-white px-4 py-2 text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
              >
                <span>Make My Shorts</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
