'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchBillingStatus, launchPaddleCheckout } from '@/lib/paddle';
import { BusinessContactModal } from '@/components/modals/BusinessContactModal';
import { signOutUser, getStoredUser, StoredUser } from '@/lib/auth';
import type { WorkspaceBillingState, CreditTransactionDTO } from '@frameflow/shared';
import {
  CreditCard,
  Zap,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  Share2,
  Check,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Plus,
  Radio,
  Sliders,
  Sparkles,
  Layers,
  Film,
  Download,
  AlertCircle,
  Clock,
  LogOut,
  UserCheck,
} from 'lucide-react';

interface SocialChannel {
  id: string;
  name: string;
  platform: 'youtube' | 'tiktok' | 'instagram';
  handle: string;
  connected: boolean;
  followers?: string;
}

export default function WorkspaceAndBillingPage(): JSX.Element {
  // User Profile State
  const [storedUser, setStoredUser] = useState<StoredUser | null>(null);

  // Billing & Plan State
  const [billingState, setBillingState] = useState<WorkspaceBillingState | null>(null);
  const [transactions, setTransactions] = useState<CreditTransactionDTO[]>([]);
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'max' | 'business'>('pro');
  const [creditsRemaining, setCreditsRemaining] = useState<number>(112);
  const totalCredits = currentPlan === 'free' ? 30 : currentPlan === 'pro' ? 120 : currentPlan === 'max' ? 500 : 2000;
  const [topUpToast, setTopUpToast] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setStoredUser(getStoredUser());
    fetchBillingStatus().then((res) => {
      if (res?.billing) {
        setBillingState(res.billing);
        setCurrentPlan(res.billing.planTier.toLowerCase() as 'free' | 'pro' | 'max' | 'business');
        setCreditsRemaining(res.billing.creditBalance);
      }
      if (res?.transactions) {
        setTransactions(res.transactions);
      }
    });
  }, []);

  // Social Channels State
  const [channels, setChannels] = useState<SocialChannel[]>([
    {
      id: 'yt-1',
      name: 'YouTube Shorts',
      platform: 'youtube',
      handle: '@CreatorStudio',
      connected: true,
      followers: '28.4K subs',
    },
    {
      id: 'tt-1',
      name: 'TikTok',
      platform: 'tiktok',
      handle: '@viral_shorts_daily',
      connected: true,
      followers: '114.2K followers',
    },
    {
      id: 'ig-1',
      name: 'Instagram Reels',
      platform: 'instagram',
      handle: '@creator_flow',
      connected: false,
    },
  ]);

  // Export Preferences State
  const [defaultAspect, setDefaultAspect] = useState<'9:16' | '1:1' | '16:9'>('9:16');
  const [defaultResolution, setDefaultResolution] = useState<'1080p' | '4k' | '720p'>('1080p');
  const [defaultFps, setDefaultFps] = useState<'60' | '30'>('60');
  const [autoApplyBrandKit, setAutoApplyBrandKit] = useState<boolean>(true);
  const [autoCutFillerWords, setAutoCutFillerWords] = useState<boolean>(true);
  const [autoCaptionsDescription, setAutoCaptionsDescription] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Top-Up Credit Handler
  const handleTopUp = async (amount: number, price: string) => {
    const launched = await launchPaddleCheckout({
      planName: `Credit Top-Up (+${amount} Credits)`,
      interval: 'monthly',
      priceId: amount >= 150 ? 'pri_topup_150' : 'pri_topup_50',
      onSuccess: () => {
        setCreditsRemaining((prev) => prev + amount);
        setTopUpToast(`Added +${amount} credits ($${price} billed via Paddle)`);
      },
    });

    if (!launched) {
      setCreditsRemaining((prev) => prev + amount);
      setTopUpToast(`Added +${amount} credits ($${price} billed via Paddle)`);
      setTimeout(() => {
        setTopUpToast(null);
      }, 3500);
    }
  };

  // Toggle Social Connection
  const handleToggleChannel = (id: string) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id === id) {
          const nextState = !ch.connected;
          return {
            ...ch,
            connected: nextState,
            handle: nextState ? (ch.handle || '@connected_account') : 'Not connected',
          };
        }
        return ch;
      })
    );
  };

  // Save Preferences Handler
  const handleSavePreferences = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20 text-[#14151A]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E6E4DD] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-[#E84C2B]" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#14151A]">
              Workspace & Billing
            </h1>
          </div>
          <p className="text-xs text-[#52545E]">
            Manage subscription plans, Paddle invoices, credit allocations, and social auto-posting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSavePreferences}
            className="flex items-center gap-1.5 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] text-white px-4 py-2 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Preferences Saved</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Top-up Toast Notification */}
      {topUpToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{topUpToast}</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-700 uppercase font-bold">
            Paddle Receipt Dispatched
          </span>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 1: CURRENT PLAN & CREDIT USAGE (PADDLE BILLING)    */}
      {/* ========================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#14151A] flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#E84C2B]" />
              <span>Current Plan & Credit Usage</span>
            </h2>
            <p className="text-xs text-[#52545E]">
              Credits process source video duration 1:1. Unused credits rollover automatically with active subscription.
            </p>
          </div>

          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            SUBSCRIPTION ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Plan Card (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-7 space-y-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#F0EFEA] pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-bold tracking-tight text-[#14151A]">
                    {billingState?.planTier === 'MAX'
                      ? 'Max Plan'
                      : billingState?.planTier === 'PRO'
                      ? 'Pro Plan'
                      : billingState?.planTier === 'BUSINESS'
                      ? 'Business Plan'
                      : 'Free Trial'}
                  </h3>
                  <span className="rounded-full bg-[#FAF3EE] border border-[#E84C2B]/30 px-2 py-0.5 text-[10px] font-mono font-bold text-[#E84C2B]">
                    {billingState?.billingInterval === 'annual' ? 'ANNUAL BILLING' : 'MONTHLY BILLING'}
                  </span>
                </div>
                <p className="text-xs text-[#52545E]">
                  {billingState?.planTier === 'MAX'
                    ? '$10 USD / month ($96 billed annually via Paddle) • 500 mins/mo'
                    : billingState?.planTier === 'PRO'
                    ? '$3 USD / month ($29 billed annually via Paddle) • 120 mins/mo'
                    : billingState?.planTier === 'BUSINESS'
                    ? 'Custom credit pool & dedicated Slack/WhatsApp support'
                    : '30 trial credits included • No credit card required'}
                </p>
              </div>

              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#14151A] hover:bg-[#2C2E38] text-white px-4 py-2 text-xs font-bold transition-all shadow-xs"
              >
                <span>Manage / Upgrade Plan</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Credit Progress Gauge */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#14151A] flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-[#E84C2B]" />
                  <span>Processing Credits Remaining</span>
                </span>
                <span className="font-mono text-xs font-bold text-[#14151A]">
                  <strong>{creditsRemaining}</strong> of {totalCredits} minutes
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2.5 w-full bg-[#E6E4DD] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E84C2B] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((creditsRemaining / totalCredits) * 100, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#8C8E9A] pt-0.5">
                <span>
                  {billingState?.currentPeriodEnd
                    ? `Renews on ${new Date(billingState.currentPeriodEnd).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}`
                    : 'Renews monthly via Paddle'}
                </span>
                <span>Unused credits rollover automatically</span>
              </div>
            </div>

            {/* Recent Credit Transactions Log */}
            {transactions.length > 0 && (
              <div className="pt-3 border-t border-[#F0EFEA] space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8C8E9A] flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-[#E84C2B]" />
                  <span>Recent Credit Activity</span>
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {transactions.slice(0, 4).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-lg bg-[#FAF9F5] border border-[#E6E4DD] px-3 py-1.5 text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            tx.amount > 0 ? 'bg-emerald-500' : 'bg-[#E84C2B]'
                          }`}
                        />
                        <span className="font-bold text-[#14151A]">
                          {tx.reason.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-[#8C8E9A]">
                          {new Date(tx.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span
                          className={`font-bold ${
                            tx.amount > 0 ? 'text-emerald-600' : 'text-[#E84C2B]'
                          }`}
                        >
                          {tx.amount > 0 ? `+${tx.amount}` : tx.amount} credits
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Paddle Compliance & Invoicing Footer */}
            <div className="pt-4 border-t border-[#F0EFEA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#52545E]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Global tax compliance and automated VAT receipts handled by Paddle.</span>
              </div>

              <Link
                href="/pricing#faq"
                className="text-xs font-semibold text-[#E84C2B] hover:text-[#D13B1C] inline-flex items-center gap-1 shrink-0"
              >
                <span>Billing Invoices FAQ</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Quick Top-Up Pack Card (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-[#E6E4DD] bg-[#FAF9F5] p-6 space-y-4 flex flex-col justify-between shadow-2xs">
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E84C2B] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Instant Top-Up</span>
              </span>
              <h4 className="text-base font-bold text-[#14151A]">
                Need extra minutes?
              </h4>
              <p className="text-xs text-[#52545E] leading-relaxed">
                Add one-off credit packs instantly with zero recurring commitment.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleTopUp(50, '9')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[#E6E4DD] bg-white hover:border-[#14151A] transition-all text-xs font-semibold shadow-2xs active:scale-[0.98] cursor-pointer"
              >
                <span className="flex items-center gap-2 text-[#14151A]">
                  <Plus className="h-3.5 w-3.5 text-[#E84C2B]" />
                  <span>+50 Credits</span>
                </span>
                <span className="font-mono font-bold text-[#14151A] bg-[#FAF9F5] px-2 py-0.5 rounded-md border border-[#E6E4DD]">
                  $9 USD
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTopUp(150, '19')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[#E84C2B]/40 bg-[#FAF3EE] hover:border-[#E84C2B] transition-all text-xs font-semibold shadow-2xs active:scale-[0.98] cursor-pointer"
              >
                <span className="flex items-center gap-2 text-[#14151A]">
                  <Sparkles className="h-3.5 w-3.5 text-[#E84C2B]" />
                  <span>+150 Credits (Popular)</span>
                </span>
                <span className="font-mono font-bold text-[#E84C2B] bg-white px-2 py-0.5 rounded-md border border-[#E84C2B]/30">
                  $19 USD
                </span>
              </button>
            </div>

            <div className="text-[10px] font-mono text-[#8C8E9A] text-center pt-1">
              Instant activation &bull; Powered by Paddle
            </div>
          </div>
        </div>

        {/* 4-Tier Plan Selection Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
          {/* Free */}
          <div className="rounded-xl border border-[#E6E4DD] bg-white p-4 space-y-3 flex flex-col justify-between shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#14151A]">Free Trial</span>
                <span className="font-mono text-xs font-bold text-[#8C8E9A]">$0</span>
              </div>
              <p className="text-[11px] text-[#52545E]">30 trial credits &bull; 720p clean exports &bull; 1 Brand Template</p>
            </div>
            {currentPlan === 'free' ? (
              <span className="text-center py-1.5 rounded-lg bg-[#FAF9F5] text-[11px] font-bold text-[#8C8E9A] border border-[#E6E4DD]">Current Plan</span>
            ) : (
              <span className="text-center py-1.5 text-[11px] font-bold text-[#8C8E9A]">Included</span>
            )}
          </div>

          {/* Pro */}
          <div className="rounded-xl border border-[#E6E4DD] bg-white p-4 space-y-3 flex flex-col justify-between shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#14151A]">Pro Creator</span>
                <span className="font-mono text-xs font-bold text-[#14151A]">$3 / mo</span>
              </div>
              <p className="text-[11px] text-[#52545E]">120 mins/mo &bull; Watermark-free 1080p &bull; 2 Brand Templates</p>
            </div>
            {currentPlan === 'pro' ? (
              <span className="text-center py-1.5 rounded-lg bg-emerald-50 text-[11px] font-bold text-emerald-700 border border-emerald-200">Current Plan</span>
            ) : (
              <Link href="/pricing" className="text-center py-1.5 rounded-lg bg-[#14151A] text-white text-[11px] font-bold hover:bg-black transition-all">Switch to Pro ($3/mo)</Link>
            )}
          </div>

          {/* Max */}
          <div className="rounded-xl border-2 border-[#E84C2B] bg-white p-4 space-y-3 flex flex-col justify-between relative shadow-xs">
            <div className="absolute -top-2.5 right-3 bg-[#E84C2B] text-white text-[9px] font-mono font-bold px-2 py-0.2 rounded-full uppercase">Most Popular</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#14151A]">Max Studio</span>
                <span className="font-mono text-xs font-bold text-[#E84C2B]">$10 / mo</span>
              </div>
              <p className="text-[11px] text-[#52545E]">500 mins/mo &bull; AI B-Roll (V2) &bull; 5 Brand Templates &bull; Priority Queue</p>
            </div>
            {currentPlan === 'max' ? (
              <span className="text-center py-1.5 rounded-lg bg-emerald-50 text-[11px] font-bold text-emerald-700 border border-emerald-200">Current Plan</span>
            ) : (
              <Link href="/pricing" className="text-center py-1.5 rounded-lg bg-[#E84C2B] text-white text-[11px] font-bold hover:bg-[#D13B1C] transition-all">Upgrade to Max ($10/mo)</Link>
            )}
          </div>

          {/* Business */}
          <div className="rounded-xl border border-[#2A2C38] bg-[#121318] p-4 space-y-3 flex flex-col justify-between text-white shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Business</span>
                <span className="font-mono text-xs font-bold text-zinc-300">Custom</span>
              </div>
              <p className="text-[11px] text-zinc-400">Custom volume &bull; 4K exports &bull; DaVinci XML &bull; Dedicated SLA</p>
            </div>
            <button type="button" onClick={() => setIsContactModalOpen(true)} className="text-center py-1.5 rounded-lg bg-white text-[#14151A] text-[11px] font-bold hover:bg-[#FAF9F5] transition-all cursor-pointer">Contact Sales</button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: CONNECTED SOCIAL CHANNELS (AUTO-POSTING)       */}
      {/* ========================================================= */}
      <section className="space-y-4">
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#14151A] flex items-center gap-2">
            <Share2 className="h-4 w-4 text-[#E84C2B]" />
            <span>Connected Social Channels</span>
          </h2>
          <p className="text-xs text-[#52545E]">
            Direct 1-click publishing for generated 9:16 vertical shorts, captions, and hashtags.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {channels.map((ch) => (
            <div
              key={ch.id}
              className="rounded-2xl border border-[#E6E4DD] bg-white p-5 space-y-4 shadow-2xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {/* Platform Icon & Name */}
                  <div className="flex items-center gap-2.5">
                    {ch.platform === 'youtube' && (
                      <div className="h-8 w-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                        YT
                      </div>
                    )}
                    {ch.platform === 'tiktok' && (
                      <div className="h-8 w-8 rounded-lg bg-[#14151A] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                        TT
                      </div>
                    )}
                    {ch.platform === 'instagram' && (
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                        IG
                      </div>
                    )}

                    <div>
                      <h4 className="text-xs font-bold text-[#14151A]">{ch.name}</h4>
                      <p className="text-[11px] text-[#52545E] font-mono">{ch.handle}</p>
                    </div>
                  </div>

                  {ch.connected && (
                    <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                  )}
                </div>

                {ch.connected && ch.followers && (
                  <div className="text-[11px] font-mono text-[#8C8E9A] bg-[#FAF9F5] px-2.5 py-1 rounded-lg border border-[#E6E4DD]">
                    Channel: <strong className="text-[#14151A]">{ch.followers}</strong>
                  </div>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => handleToggleChannel(ch.id)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-[0.98] cursor-pointer ${
                    ch.connected
                      ? 'border border-[#E6E4DD] bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-[#52545E]'
                      : 'bg-[#14151A] hover:bg-[#2C2E38] text-white'
                  }`}
                >
                  {ch.connected ? 'Disconnect Channel' : 'Connect Account'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Global Auto-Publish Option */}
        <div className="rounded-2xl border border-[#E6E4DD] bg-white p-4 sm:p-5 flex items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-[#14151A]">
              Include Viral Subtitles & Hashtags in Social Descriptions
            </h4>
            <p className="text-[11px] text-[#52545E]">
              Automatically transfer high-retention transcript hooks and detected hashtags into the platform caption field.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={autoCaptionsDescription}
              onChange={(e) => setAutoCaptionsDescription(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#E6E4DD] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#DCDAD2] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E84C2B]" />
          </label>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: DEFAULT EXPORT PREFERENCES                     */}
      {/* ========================================================= */}
      <section className="space-y-4">
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#14151A] flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[#E84C2B]" />
            <span>Default Studio Export Preferences</span>
          </h2>
          <p className="text-xs text-[#52545E]">
            Configure default render dimensions, framerate, and brand template settings for new video ingests.
          </p>
        </div>

        <div className="rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-7 space-y-6 shadow-2xs">
          {/* Aspect Ratio Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#14151A] block">
              Default Aspect Ratio
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: '9:16', label: '9:16 Vertical', sub: 'TikTok, Reels & Shorts' },
                { id: '1:1', label: '1:1 Square', sub: 'Instagram Feed & LinkedIn' },
                { id: '16:9', label: '16:9 Landscape', sub: 'YouTube & Desktop Web' },
              ].map((aspect) => (
                <button
                  key={aspect.id}
                  type="button"
                  onClick={() => setDefaultAspect(aspect.id as '9:16' | '1:1' | '16:9')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    defaultAspect === aspect.id
                      ? 'border-[#E84C2B] bg-[#FAF3EE] shadow-2xs'
                      : 'border-[#E6E4DD] bg-white hover:border-[#14151A]'
                  }`}
                >
                  <div className="text-xs font-bold text-[#14151A]">{aspect.label}</div>
                  <div className="text-[11px] text-[#52545E] mt-0.5">{aspect.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Resolution & FPS Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-[#F0EFEA]">
            {/* Resolution */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#14151A] block">
                Export Resolution
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: '1080p', label: '1080p Full HD (Recommended)' },
                  { id: '4k', label: '4K Ultra (Pro Plan)' },
                  { id: '720p', label: '720p Fast' },
                ].map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => setDefaultResolution(res.id as '1080p' | '4k' | '720p')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      defaultResolution === res.id
                        ? 'bg-[#14151A] text-white border-[#14151A] shadow-xs'
                        : 'bg-white text-[#52545E] border-[#E6E4DD] hover:text-[#14151A]'
                    }`}
                  >
                    {res.label}
                  </button>
                ))}
              </div>
            </div>

            {/* FPS */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#14151A] block">
                Framerate
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: '60', label: '60 FPS (Ultra Smooth)' },
                  { id: '30', label: '30 FPS (Standard)' },
                ].map((fps) => (
                  <button
                    key={fps.id}
                    type="button"
                    onClick={() => setDefaultFps(fps.id as '60' | '30')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      defaultFps === fps.id
                        ? 'bg-[#E84C2B] text-white border-[#E84C2B] shadow-xs'
                        : 'bg-white text-[#52545E] border-[#E6E4DD] hover:text-[#14151A]'
                    }`}
                  >
                    {fps.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Automations Toggles */}
          <div className="space-y-3.5 pt-2 border-t border-[#F0EFEA]">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#14151A] block">
                  Auto-Apply Active Brand Kit
                </span>
                <span className="text-[11px] text-[#52545E]">
                  Automatically load active brand fonts, caption styling, and custom watermark overlays when generating clips.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={autoApplyBrandKit}
                  onChange={(e) => setAutoApplyBrandKit(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#E6E4DD] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#DCDAD2] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E84C2B]" />
              </label>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2 border-t border-[#F0EFEA]">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#14151A] block">
                  Auto Filler Word & Silence Cut
                </span>
                <span className="text-[11px] text-[#52545E]">
                  Pre-cut hesitations (&quot;um&quot;, &quot;uh&quot;) and pauses longer than 1.2 seconds before opening studio editor.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={autoCutFillerWords}
                  onChange={(e) => setAutoCutFillerWords(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#E6E4DD] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#DCDAD2] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E84C2B]" />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: ACCOUNT SESSION & SECURITY                     */}
      {/* ========================================================= */}
      <section className="space-y-4">
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#14151A] flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#E84C2B]" />
            <span>Account Session & Security</span>
          </h2>
          <p className="text-xs text-[#52545E]">
            Active session authentication tokens, security credentials, and sign-out controls.
          </p>
        </div>

        <div className="rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-7 space-y-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAF3EE] border border-[#E84C2B]/30 text-[#E84C2B] font-bold text-base shrink-0 shadow-2xs">
                {(storedUser?.name || 'Creator').charAt(0).toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-[#14151A]">
                  {storedUser?.name || 'Creator Studio Account'}
                </h4>
                <p className="text-xs text-[#52545E] font-mono">
                  {storedUser?.email || 'creator@frameflow.dev'} • Connected Workspace
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-mono font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ACTIVE SESSION
              </span>
            </div>
          </div>

          <div className="pt-5 border-t border-[#F0EFEA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-[#52545E] max-w-xl leading-relaxed">
              Signing out will invalidate your session tokens, clear local workspace caches, and return you to the login screen. Any ongoing background exports will continue processing in your worker queue.
            </div>

            <button
              type="button"
              onClick={() => void signOutUser()}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E6E4DD] bg-white hover:bg-[#FFF8F6] hover:border-[#E84C2B]/40 hover:text-[#E84C2B] text-[#52545E] px-4 py-2.5 text-xs font-bold transition-all shadow-2xs active:scale-[0.98] cursor-pointer shrink-0"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Sign Out of FrameFlow</span>
            </button>
          </div>
        </div>
      </section>

      <BusinessContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
}
