'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Radio,
  SlidersHorizontal,
  FileVideo,
  Download,
  ArrowRight,
  LogOut,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { signOutUser, getStoredUser } from '@/lib/auth';

interface HeaderProps {
  currentProjectTitle?: string;
  sourceDuration?: string;
  onOpenMobileNav?: () => void;
}

export function Header({
  currentProjectTitle = 'The AI Hardware Revolution & Future of Silicon',
  sourceDuration = '01:02:22',
  onOpenMobileNav,
}: HeaderProps): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string>('Creator');
  const [userEmail, setUserEmail] = useState<string>('creator@frameflow.dev');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (user?.name) setUserName(user.name);
    if (user?.email) setUserEmail(user.email);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[#E6E4DD] bg-white/90 px-3.5 sm:px-6 backdrop-blur-md text-[#14151A]">
      {/* Left: Hamburger (mobile) + Breadcrumbs & Source Duration */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onOpenMobileNav && (
          <button
            type="button"
            onClick={onOpenMobileNav}
            aria-label="Open mobile workspace navigation"
            className="lg:hidden p-1.5 -ml-1 rounded-xl text-[#52545E] hover:text-[#14151A] hover:bg-[#FAF9F5] border border-[#E6E4DD] transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-[#52545E] min-w-0">
          <FileVideo className="h-4 w-4 text-[#8C8E9A] shrink-0 hidden sm:block" aria-hidden="true" />
          <Link href="/dashboard" className="hover:text-[#14151A] font-medium transition-colors shrink-0">
            Projects
          </Link>
          <span className="text-[#C5C3BC] shrink-0">/</span>
          <span className="font-bold text-[#14151A] max-w-[120px] sm:max-w-[240px] md:max-w-[380px] truncate">
            {currentProjectTitle}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-[#FAF9F5] border border-[#E6E4DD] px-2.5 py-1 text-[11px] text-[#52545E] font-mono tabular-nums shrink-0">
          <span className="text-[#8C8E9A]">Length:</span>
          <span className="text-[#14151A] font-semibold">{sourceDuration}</span>
        </div>

        <div className="hidden xl:flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-[11px] text-emerald-700 font-mono shrink-0">
          <Radio className="h-3 w-3 animate-pulse text-emerald-600" aria-hidden="true" />
          <span className="font-semibold">Worker Stream: Ready</span>
        </div>
      </div>

      {/* Right: Actions, Filters & User Account Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Link
          href="/exports"
          className="hidden sm:flex items-center gap-1.5 rounded-xl border border-[#E6E4DD] bg-white px-3 py-1.5 text-xs font-semibold text-[#14151A] hover:bg-[#FAF9F5] hover:border-[#DCDAD2] transition-colors shadow-2xs"
        >
          <Download className="h-3.5 w-3.5 text-[#52545E]" aria-hidden="true" />
          <span>Exports</span>
          <span className="rounded-full bg-emerald-50 px-1.5 py-0.2 text-[10px] font-mono font-bold text-emerald-700 border border-emerald-200">
            2
          </span>
        </Link>

        <Link
          href="/brand-kit"
          className="hidden md:flex items-center gap-1.5 rounded-xl border border-[#E6E4DD] bg-white px-3 py-1.5 text-xs font-semibold text-[#14151A] hover:bg-[#FAF9F5] hover:border-[#DCDAD2] transition-colors shadow-2xs"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-[#52545E]" aria-hidden="true" />
          <span>Brand Kit</span>
        </Link>

        <Link
          href="/editor/e1011111-1111-4111-8111-111111111111"
          className="hidden sm:flex items-center gap-1.5 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all active:scale-[0.98]"
        >
          <span>Open Studio</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>

        {/* User Account / Profile Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            className="flex items-center gap-2 rounded-xl border border-[#E6E4DD] bg-white hover:bg-[#FAF9F5] hover:border-[#DCDAD2] p-1.5 pr-2.5 text-xs transition-colors shadow-2xs cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FAF3EE] border border-[#E84C2B]/30 text-[#E84C2B] font-bold text-xs shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline font-semibold text-xs text-[#14151A] max-w-[100px] truncate">
              {userName}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-[#8C8E9A]" aria-hidden="true" />
          </button>

          {/* Dropdown Panel */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#E6E4DD] bg-white p-1.5 shadow-[0_12px_32px_rgba(20,21,26,0.08)] z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-[#F0EFEA] mb-1">
                <p className="text-xs font-bold text-[#14151A] truncate">{userName}</p>
                <p className="text-[11px] text-[#52545E] truncate font-mono">{userEmail}</p>
              </div>

              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#52545E] hover:text-[#14151A] hover:bg-[#FAF9F5] transition-colors"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#8C8E9A]" aria-hidden="true" />
                <span>Workspace &amp; Billing</span>
              </Link>

              {/* Subtle #E6E4DD divider */}
              <div className="border-t border-[#E6E4DD] my-1" />

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void signOutUser();
                }}
                className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#52545E] hover:text-[#E84C2B] hover:bg-[#FFF8F6] transition-colors cursor-pointer text-left"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
