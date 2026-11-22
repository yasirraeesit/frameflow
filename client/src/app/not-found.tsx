import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound(): JSX.Element {
  return (
    <div className="min-h-screen bg-[#0C0C0E] text-[#F4F4F6] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-[#28282F] bg-[#141417] p-8 text-center space-y-4 shadow-xl">
        <div className="text-4xl font-extrabold font-mono text-[#F59E0B]">404</div>
        <h1 className="text-lg font-bold text-white">Page Not Found</h1>
        <p className="text-xs text-[#9E9EA8]">
          The clip or page you requested does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0C0C0E] px-4 py-2 text-xs font-bold transition-all shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
