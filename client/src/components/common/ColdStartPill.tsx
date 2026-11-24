'use client';

import React, { useEffect, useState } from 'react';
import { subscribeColdStart, ColdStartStatus } from '@/lib/api';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export function ColdStartPill(): JSX.Element | null {
  const [status, setStatus] = useState<ColdStartStatus>('idle');

  useEffect(() => {
    return subscribeColdStart((newStatus) => {
      setStatus(newStatus);
    });
  }, []);

  if (status === 'idle') {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full border border-[#E6E4DD] bg-[#FAF9F5] px-4 py-2 text-xs font-semibold text-[#14151A] shadow-lg shadow-black/5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
    >
      {status === 'waking' ? (
        <>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E84C2B] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#E84C2B]" />
          </span>
          <span className="tracking-tight">Waking up AI engine (~20s)...</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-emerald-800">AI engine connected</span>
        </>
      )}
    </div>
  );
}
