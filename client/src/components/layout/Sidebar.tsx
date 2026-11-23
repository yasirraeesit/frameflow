'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Film,
  Palette,
  DownloadCloud,
  ChevronDown,
  Layers,
  Sparkles,
  Zap,
  CreditCard,
  SlidersHorizontal,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Clip Generator', href: '/dashboard', icon: Film },
  { label: 'Brand Templates', href: '/brand-kit', icon: Palette },
  { label: 'Exports', href: '/exports', icon: DownloadCloud, badge: '2 Ready' },
  { label: 'Workspace & Billing', href: '/settings', icon: SlidersHorizontal },
];

export function Sidebar(): JSX.Element {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-40 flex w-64 flex-col border-r border-[#E6E4DD] bg-white text-[#14151A]"
      aria-label="Sidebar Navigation Rail"
    >
      {/* Brand & Workspace Logo */}
      <div className="flex h-16 items-center justify-between border-b border-[#E6E4DD] px-5 bg-white">
        <Link href="/" className="flex items-center gap-2.5 group">
          {/* Custom geometric FrameFlow viewfinder mark */}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-[#E6E4DD] shadow-xs group-hover:border-[#E84C2B]/60 transition-colors">
            <div className="absolute top-1 left-1 h-1.5 w-1.5 border-t-2 border-l-2 border-[#E84C2B]" />
            <div className="absolute top-1 right-1 h-1.5 w-1.5 border-t-2 border-r-2 border-[#E84C2B]" />
            <div className="absolute bottom-1 left-1 h-1.5 w-1.5 border-b-2 border-l-2 border-[#E84C2B]" />
            <div className="absolute bottom-1 right-1 h-1.5 w-1.5 border-b-2 border-r-2 border-[#E84C2B]" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#E84C2B]" />
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-[-0.03em] text-[#14151A] flex items-center gap-1.5">
              FrameFlow
              <span className="rounded-full bg-[#FAF3EE] border border-[#E84C2B]/30 px-1.5 py-0.2 text-[9px] font-mono font-bold text-[#E84C2B]">
                STUDIO
              </span>
            </span>
            <span className="text-[11px] text-[#52545E]">AI Video Repurposing</span>
          </div>
        </Link>
      </div>

      {/* Active Project Switcher Pill */}
      <div className="p-3 border-b border-[#E6E4DD] bg-white">
        <div className="flex items-center justify-between rounded-xl bg-[#FAF9F5] border border-[#E6E4DD] hover:border-[#DCDAD2] px-3 py-2 text-xs transition-colors cursor-pointer group">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-[#E6E4DD] text-[#E84C2B] shrink-0 shadow-2xs">
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <div className="truncate text-left">
              <p className="font-semibold text-[#14151A] truncate text-[11px] group-hover:text-[#E84C2B] transition-colors">
                Hardware Revolution
              </p>
              <p className="text-[10px] text-[#52545E] tabular-nums font-mono">
                8 Shorts Ranked • 58m
              </p>
            </div>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-[#8C8E9A] group-hover:text-[#14151A] transition-colors shrink-0" aria-hidden="true" />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3 py-4 bg-white" aria-label="Main Navigation">
        <p className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#8C8E9A] font-semibold">
          Studio Workspace
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#FAF3EE] text-[#E84C2B] border border-[#E84C2B]/25 shadow-2xs'
                  : 'text-[#52545E] hover:bg-[#FAF9F5] hover:text-[#14151A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive ? 'text-[#E84C2B]' : 'text-[#8C8E9A] group-hover:text-[#14151A]'
                  }`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                    isActive
                      ? 'bg-[#E84C2B] text-white'
                      : 'bg-[#FAF3EE] border border-[#E84C2B]/20 text-[#E84C2B]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Credit Balance & Subscription Widget */}
      <div className="border-t border-[#E6E4DD] p-4 space-y-2.5 bg-[#FAF9F5]">
        <div className="rounded-xl border border-[#E6E4DD] bg-white p-3 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#14151A]">
            <span className="flex items-center gap-1.5 font-bold">
              <Zap className="h-3.5 w-3.5 text-[#E84C2B]" />
              Credit Balance
            </span>
            <Link
              href="/pricing"
              className="rounded-lg bg-[#E84C2B] hover:bg-[#D13B1C] text-white text-[10px] font-bold px-2 py-0.5 transition-all shadow-2xs active:scale-95"
            >
              Upgrade
            </Link>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-mono font-bold text-[#14151A]">142 / 150</span>
              <span className="text-[10px] font-mono text-[#8C8E9A]">Starter Plan</span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 w-full bg-[#E6E4DD] rounded-full overflow-hidden">
              <div className="h-full bg-[#E84C2B] rounded-full" style={{ width: '94%' }} />
            </div>
          </div>

          <div className="pt-1 border-t border-[#F0EFEA] flex items-center justify-between text-[10px] font-mono text-[#8C8E9A]">
            <span>Resets in 18 days</span>
            <span className="text-emerald-600 font-semibold">Active</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 text-[10px] text-[#8C8E9A] font-mono">
          <span>Powered by Paddle</span>
          <Link href="/pricing" className="hover:text-[#14151A] underline decoration-dotted">
            Tax compliant
          </Link>
        </div>
      </div>
    </aside>
  );
}
