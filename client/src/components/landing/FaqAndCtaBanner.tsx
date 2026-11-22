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
    q: 'Wait—how can I use this for free?',
    a: 'We let you plug in your own free developer keys from Groq (for Whisper transcription) and Google AI Studio (for Gemini hook discovery). They give generous free quotas that cover hours of raw footage without paying us a cent for AI compute.',
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
              Zero corporate fluff. Clear, honest answers about BYOK keys, editing control, and video privacy.
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

        {/* ========================================================= */}
        {/* 2. HIGH-CONTRAST CLOSING BANNER (Dark Charcoal Frame)     */}
        {/* ========================================================= */}
        <div className="relative rounded-3xl border border-[#2A2B35] bg-[#14151A] p-8 sm:p-12 lg:p-16 text-center text-white overflow-hidden shadow-2xl">
          {/* Subtle Cinema Coral radial glow */}
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[320px] bg-[#E84C2B]/12 blur-[110px] rounded-full"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.035em] text-white leading-tight">
              Your long videos are{' '}
              <span className="font-editorial text-[#E84C2B] font-normal italic text-4xl sm:text-5xl lg:text-6xl px-1">
                sitting on a goldmine.
              </span>
            </h2>

            <p className="text-[15px] sm:text-base text-zinc-300 leading-relaxed">
              Stop letting hours of great podcast conversations gather dust on YouTube. Turn them into 15 high-retention shorts in 2 minutes.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] text-white px-7 py-3.5 text-sm font-bold shadow-lg transition-all active:scale-[0.98]"
              >
                <span>Start Clipping Free</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <Link
                href="/projects/demo-1"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#343644] bg-[#23242E] hover:bg-[#2C2E3B] text-white px-6 py-3.5 text-sm font-semibold transition-colors"
              >
                <span>Explore Demo Project</span>
                <ArrowRight className="h-4 w-4 text-[#E84C2B]" />
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-[#10B981]" />
                100% Private Video Data
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-[#E84C2B]" />
                Zero Credit Lock-In
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                Commercial 1080p MP4
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
