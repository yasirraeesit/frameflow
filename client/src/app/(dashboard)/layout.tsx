import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#14151A] flex">
      {/* Persistent Left Sidebar Navigation Rail */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 pl-64 flex flex-col min-w-0 bg-[#FAF9F5]">
        <Header />
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
