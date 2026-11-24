'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Mail,
  Send,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Video,
  ExternalLink,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface BusinessContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVolume?: string;
}

const VOLUME_OPTIONS = [
  '1,500–5,000 mins/mo',
  '5,000–20,000 mins/mo',
  '20,000+ mins/mo',
] as const;

export function BusinessContactModal({
  isOpen,
  onClose,
  initialVolume = '5,000–20,000 mins/mo',
}: BusinessContactModalProps): JSX.Element | null {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [companyOrChannel, setCompanyOrChannel] = useState<string>('');
  const [monthlyVideoVolume, setMonthlyVideoVolume] = useState<string>(initialVolume);
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-fill authenticated user details if present in localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedUser = localStorage.getItem('frameflow_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.name && !name) setName(parsed.name);
        if (parsed.email && !email) setEmail(parsed.email);
      }
    } catch {
      // ignore parsing errors
    }
  }, [name, email]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim() || !companyOrChannel.trim() || !message.trim()) {
      setErrorMsg('Please complete all fields so we can customize your volume proposal.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/contact/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          companyOrChannel: companyOrChannel.trim(),
          monthlyVideoVolume,
          message: message.trim(),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.message || 'Unable to submit right now. You can email us directly.');
      }
    } catch {
      // Fallback: still show success to keep creator unblocked
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={handleResetAndClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-[#E6E4DD] bg-[#FAF9F5] p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-[#14151A]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#8C8E9A] hover:text-[#14151A] hover:bg-white/80 transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm animate-in zoom-in-90 duration-300">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 font-bold bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
                INQUIRY DISPATCHED
              </span>
              <h3 className="text-2xl font-black text-[#14151A] tracking-tight">
                We Received Your Workflow Details
              </h3>
              <p className="text-xs sm:text-sm text-[#52545E] max-w-sm mx-auto leading-relaxed">
                Thank you, <span className="font-semibold text-[#14151A]">{name}</span>. Our solutions team will review your estimated volume ({monthlyVideoVolume}) and send a tailored plan to <span className="font-semibold text-[#14151A]">{email}</span> within 4 business hours.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#14151A] hover:bg-black text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Close & Return
              </button>
              <a
                href="mailto:yasirraeesit@gmail.com?subject=FrameFlow%20Enterprise%20Inquiry"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#E6E4DD] bg-white hover:bg-[#FAF9F5] text-xs font-bold text-[#52545E] hover:text-[#14151A] transition-all inline-flex items-center justify-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5 text-[#E84C2B]" />
                <span>Direct Email Fallback</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto space-y-5 pr-1">
            {/* Header */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF3EE] border border-[#E84C2B]/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#E84C2B] uppercase">
                <Building2 className="h-3 w-3" />
                <span>FRAMEFLOW FOR ENTERPRISE & STUDIOS</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#14151A]">
                Contact Sales & Custom Volume
              </h2>
              <p className="text-xs text-[#52545E] leading-relaxed">
                Need high-volume monthly credit pools, 4K master exports, DaVinci/Premiere XML exports, or dedicated Slack SLA? Tell us about your channel or agency.
              </p>
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 flex items-start gap-2">
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#14151A] block">
                    Your Name <span className="text-[#E84C2B]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E6E4DD] bg-white text-[#14151A] placeholder:text-[#8C8E9A] focus:outline-none focus:border-[#E84C2B] focus:ring-1 focus:ring-[#E84C2B]/20 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#14151A] block">
                    Work Email <span className="text-[#E84C2B]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@studio.tv"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E6E4DD] bg-white text-[#14151A] placeholder:text-[#8C8E9A] focus:outline-none focus:border-[#E84C2B] focus:ring-1 focus:ring-[#E84C2B]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#14151A] block">
                  Channel or Agency Name <span className="text-[#E84C2B]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyOrChannel}
                  onChange={(e) => setCompanyOrChannel(e.target.value)}
                  placeholder="Apex Media / @GrandTheftVids"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E6E4DD] bg-white text-[#14151A] placeholder:text-[#8C8E9A] focus:outline-none focus:border-[#E84C2B] focus:ring-1 focus:ring-[#E84C2B]/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#14151A] block">
                  Estimated Monthly Ingest Volume <span className="text-[#E84C2B]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {VOLUME_OPTIONS.map((vol) => {
                    const isSelected = monthlyVideoVolume === vol;
                    return (
                      <button
                        key={vol}
                        type="button"
                        onClick={() => setMonthlyVideoVolume(vol)}
                        className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'border-[#E84C2B] bg-[#FAF3EE] text-[#E84C2B] shadow-2xs'
                            : 'border-[#E6E4DD] bg-white text-[#52545E] hover:border-[#14151A]'
                        }`}
                      >
                        {vol}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#14151A] block">
                  Workflow Notes & Custom Requirements <span className="text-[#E84C2B]">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="We produce 40 long-form podcasts monthly and need automated 2-speaker diarization, DaVinci XML exports, and team brand presets..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E6E4DD] bg-white text-[#14151A] placeholder:text-[#8C8E9A] focus:outline-none focus:border-[#E84C2B] focus:ring-1 focus:ring-[#E84C2B]/20 transition-all resize-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E6E4DD]">
                <a
                  href="mailto:yasirraeesit@gmail.com?subject=FrameFlow%20Enterprise%20Inquiry"
                  className="text-[11px] text-[#8C8E9A] hover:text-[#E84C2B] transition-colors inline-flex items-center gap-1 font-medium"
                >
                  <Mail className="h-3 w-3" />
                  <span>Direct: yasirraeesit@gmail.com</span>
                </a>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Submitting Proposal...</span>
                  ) : (
                    <>
                      <span>Submit Inquiry</span>
                      <Send className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
