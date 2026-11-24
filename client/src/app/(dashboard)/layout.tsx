'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#14151A] flex overflow-x-hidden">
      {/* Persistent Left Sidebar (Desktop fixed + Mobile slide-over drawer) */}
      <Sidebar
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 w-full max-w-full bg-[#FAF9F5] overflow-x-hidden">
        <Header onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 w-full max-w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
