'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, LogOut, Menu, X } from 'lucide-react';
import { isUserAuthenticated, signOutUser } from '@/lib/auth';

export function LandingNavbar(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsAuthenticated(isUserAuthenticated());
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E6E4DD] bg-[#FAF9F5]/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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

        {/* Center: Clean Anchor Links (Desktop) */}
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

        {/* Right: Commercial Actions & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
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

          {/* Mobile Hamburger Toggle (md:hidden) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[#E6E4DD] bg-white text-[#14151A] hover:bg-[#FAF9F5] shadow-2xs transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E6E4DD] bg-[#FAF9F5] px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation Links">
            <a
              href="#virality-engine"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center min-h-[44px] px-3.5 rounded-xl text-sm font-semibold text-[#14151A] hover:bg-white hover:text-[#E84C2B] transition-colors"
            >
              Virality Audit
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center min-h-[44px] px-3.5 rounded-xl text-sm font-semibold text-[#14151A] hover:bg-white hover:text-[#E84C2B] transition-colors"
            >
              Dual Editor
            </a>
            <a
              href="#engine"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center min-h-[44px] px-3.5 rounded-xl text-sm font-semibold text-[#14151A] hover:bg-white hover:text-[#E84C2B] transition-colors"
            >
              Caption Styles
            </a>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center min-h-[44px] px-3.5 rounded-xl text-sm font-semibold text-[#14151A] hover:bg-white hover:text-[#E84C2B] transition-colors"
            >
              Pricing
            </Link>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center min-h-[44px] px-3.5 rounded-xl text-sm font-semibold text-[#14151A] hover:bg-white hover:text-[#E84C2B] transition-colors"
            >
              FAQ
            </a>
          </nav>

          <div className="border-t border-[#E6E4DD] pt-3.5 space-y-2.5">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 min-h-[44px] w-full rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] text-white font-bold text-sm shadow-sm transition-all"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    void signOutUser();
                  }}
                  className="flex items-center justify-center gap-2 min-h-[44px] w-full rounded-xl border border-[#E6E4DD] bg-white hover:bg-[#FFF8F6] text-[#52545E] hover:text-[#E84C2B] hover:border-[#E84C2B]/30 font-semibold text-sm transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 min-h-[44px] w-full rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] text-white font-bold text-sm shadow-sm transition-all"
                >
                  <span>Make My Shorts</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 min-h-[44px] w-full rounded-xl border border-[#E6E4DD] bg-white hover:bg-[#FAF9F5] text-[#14151A] font-semibold text-sm transition-all"
                >
                  <span>Log in</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
