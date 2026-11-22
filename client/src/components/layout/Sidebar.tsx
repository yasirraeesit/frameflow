'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Film,
  Palette,
  DownloadCloud,
  Cpu,
  ChevronDown,
  Layers,
  Flame,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: Film },
  { label: 'Brand Kit', href: '/brand-kit', icon: Palette },
  { label: 'Exports', href: '/exports', icon: DownloadCloud, badge: '2 Active' },
  { label: 'BYOK AI Providers', href: '/settings', icon: Cpu, badge: '5 Free' },
];

export function Sidebar(): JSX.Element {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-40 flex w-64 flex-col border-r border-[#28282F] bg-[#141417] text-[#F4F4F6]"
      aria-label="Sidebar Navigation Rail"
    >
      {/* Brand & Workspace Logo */}
      <div className="flex h-16 items-center justify-between border-b border-[#28282F] px-5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E1E23] border border-[#28282F] shadow-sm group-hover:border-[#F59E0B]/50 transition-colors">
            <div className="absolute inset-1.5 rounded border border-[#F59E0B]/70" />
            <div className="h-2 w-2 rounded-sm bg-[#F59E0B]" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-[#F4F4F6] flex items-center gap-1.5">
              FrameFlow
              <span className="rounded bg-[#1E1E23] border border-[#28282F] px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#10B981]">
                PRO
              </span>
            </span>
            <span className="text-[11px] text-[#9E9EA8]">Shorts Studio</span>
          </div>
        </Link>
      </div>

      {/* Active Project Switcher Pill */}
      <div className="p-3 border-b border-[#28282F]">
        <div className="flex items-center justify-between rounded-lg bg-[#1E1E23] border border-[#28282F] px-3 py-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Layers className="h-4 w-4 text-[#9E9EA8] shrink-0" aria-hidden="true" />
            <div className="truncate">
              <p className="font-medium text-[#F4F4F6] truncate text-[11px]">Hardware Revolution</p>
              <p className="text-[10px] text-[#71717A] tabular-nums font-mono">8 Shorts Ranked</p>
            </div>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-[#71717A] shrink-0" aria-hidden="true" />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main Navigation">
        <p className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
          Workspace
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#1E1E23] text-white border border-[#28282F] shadow-inner font-semibold'
                  : 'text-[#9E9EA8] hover:bg-[#1E1E23]/60 hover:text-[#F4F4F6]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive ? 'text-[#F59E0B]' : 'text-[#71717A] group-hover:text-[#F4F4F6]'
                  }`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="rounded bg-[#1E1E23] border border-[#28282F] px-1.5 py-0.5 text-[10px] font-mono text-[#F59E0B]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="border-t border-[#28282F] p-4 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-[#9E9EA8]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            BYOK Engine
          </span>
          <span className="font-mono text-[#10B981]">5 Models Ready</span>
        </div>
        <div className="text-[10px] font-mono text-[#71717A]">
          Local FFmpeg 7.0 NVENC
        </div>
      </div>
    </aside>
  );
}
