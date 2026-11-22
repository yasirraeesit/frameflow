import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="min-h-screen bg-[#0C0C0E] text-[#F4F4F6] flex">
      {/* Persistent Left Sidebar Navigation Rail */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 pl-64 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
