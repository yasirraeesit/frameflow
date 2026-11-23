'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ArrowRight,
  HelpCircle,
  Shield,
  Zap,
  Sparkles,
} from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'How does the free trial work?',
    a: 'Every new creator receives 30 free trial credits automatically—no credit card required. You can paste a YouTube link or upload an MP4, generate up to 10 viral shorts with animated captions, and export watermark-free 1080p clips immediately.',
  },
  {
    q: 'What if the AI cuts off the punchline?',
    a: 'That is exactly why we built a real timeline underneath. Unlike tools that spit out a baked, uneditable video file, you can literally drag the clip handle 2 seconds to the right or delete a filler word in the transcript. You have full creative control.',
  },
  {
    q: 'Does it handle two people yelling on a podcast?',
    a: 'Yes. Our speaker diarization separates voices and detects active speakers. If two people are going back and forth, it can automatically generate a clean 2-speaker vertical split so nobody gets awkwardly cropped out.',
  },
  {
    q: 'Can I upload giant 4K files without my browser crashing?',
    a: 'Yes. FrameFlow uses resumable chunked uploads. Even a 6GB 4K file uploads in small background parts. If your Wi-Fi hiccups, it resumes right where it left off.',
  },
];

export function FaqAndCtaBanner(): JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="border-t border-[#E6E4DD] bg-[#FAF9F5] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20">
        {/* ========================================================= */}
        {/* 1. COMPACT FAQ ACCORDION                                  */}
        {/* ========================================================= */}
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E6E4DD] bg-white px-3 py-1 text-xs font-mono tracking-wider uppercase text-[#E84C2B] shadow-2xs">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>REAL QUESTIONS CREATORS ASK</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.035em] text-[#14151A]">
              Real questions creators ask us.
            </h2>
            <p className="text-[15px] text-[#52545E]">
              Zero corporate fluff. Clear, honest answers about credits, editing control, and video privacy.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-[#E6E4DD] bg-white overflow-hidden shadow-2xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-[#14151A] hover:text-[#E84C2B] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#E84C2B] transition-transform duration-200 shrink-0 ml-4 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-[#52545E] leading-relaxed border-t border-[#E6E4DD]/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
