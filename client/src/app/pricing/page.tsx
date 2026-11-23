'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Minus,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Info,
  Zap,
  Shield,
  Film,
  Layers,
  Key,
  Users,
  Building2,
  ChevronDown,
  CreditCard,
  Lock,
  CheckCircle2,
  X,
} from 'lucide-react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { launchPaddleCheckout, fetchBillingStatus } from '@/lib/paddle';

type BillingCycle = 'annual' | 'monthly';

interface PricingTier {
  id: string;
  name: string;
  badge?: string;
  isPopular?: boolean;
  isDark?: boolean;
  description: string;
  price: {
    annual: {
      monthlyEquivalent: string;
      originalPrice?: string;
      billedNote: string;
      savingsBadge?: string;
    };
    monthly: {
      amount: string;
      billedNote: string;
    };
  };
  credits: {
    annual: string;
    monthly: string;
    tooltip: string;
  };
  features: string[];
  cta: {
    label: string;
    href: string;
    primary?: boolean;
  };
}

const TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individual creators and podcasters publishing 1–2 videos weekly.',
    price: {
      annual: {
        monthlyEquivalent: '$12',
        originalPrice: '$15',
        billedNote: 'Billed annually at $144/year',
        savingsBadge: 'Save 20%',
      },
      monthly: {
        amount: '$15',
        billedNote: 'Billed monthly, cancel anytime',
      },
    },
    credits: {
      annual: '1,800 credits / yr (150/mo)',
      monthly: '150 credits / month',
      tooltip: '1 credit = 1 minute of source video processed. Unused credits roll over with an active subscription.',
    },
    features: [
      '150 processing credits / month',
      'Auto 9:16 Reframe & Face Tracking',
      'Hormozi, Karaoke & Cinema Captions',
      '1080p 60fps Clean Exports (No Watermark)',
      'Full Studio Timeline & Text Cut Editor',
      'Fast Cloud GPU Processing (Zero Local Load)',
      'Unused Credits Rollover Each Month',
      '1 Custom Brand Kit preset',
      'Standard Cloud Processing Queue',
    ],
    cta: {
      label: 'Get Starter',
      href: '/register?plan=starter',
      primary: false,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'MOST POPULAR • BEST VALUE',
    isPopular: true,
    description: 'For serious creators, growth channels, and editors delivering daily high-retention shorts.',
    price: {
      annual: {
        monthlyEquivalent: '$11.5',
        originalPrice: '$29',
        billedNote: 'Billed annually at $138/year',
        savingsBadge: 'Save 60%',
      },
      monthly: {
        amount: '$29',
        billedNote: 'Billed monthly, cancel anytime',
      },
    },
    credits: {
      annual: '3,600 credits / yr (300/mo)',
      monthly: '300 credits / month',
      tooltip: '1 credit = 1 minute of video processed. Includes high-priority GPU cloud rendering queue.',
    },
    features: [
      '300 processing credits / month (or 3,600/yr)',
      'Everything in Starter +',
      'AI Virality Score Engine & Hook Ranking (1–99)',
      'AI Image & Video B-Roll Generation',
      'Export to Premiere Pro (XML) & DaVinci Resolve (EDL)',
      'Auto Filler Word & Silence Removal',
      'Multi-speaker Active Switcher Layouts',
      'Unlimited Custom Brand Kits & Font Uploads',
      'Priority GPU Cloud Rendering Queue',
      '2 Team Seats included',
    ],
    cta: {
      label: 'Get Pro',
      href: '/register?plan=pro',
      primary: true,
    },
  },
  {
    id: 'business',
    name: 'Business',
    badge: 'TEAMS & AGENCIES',
    isDark: true,
    description: 'Fit for business, dressed in a tux. Custom volume, team collaboration, and dedicated processing.',
    price: {
      annual: {
        monthlyEquivalent: "Let's talk",
        billedNote: 'Custom annual contract with SLA',
        savingsBadge: 'Volume Discount',
      },
      monthly: {
        amount: "Let's talk",
        billedNote: 'Custom monthly invoicing available',
      },
    },
    credits: {
      annual: 'Unlimited or Tailored Credits',
      monthly: 'Custom Allocation (1,000+ mins)',
      tooltip: 'Dedicated custom GPU processing capacity and guaranteed SLAs for studios and media teams.',
    },
    features: [
      'Custom credit allocations (1,000+ mins/mo)',
      'Everything in Pro +',
      'Dedicated Slack / Discord VIP Channel',
      'Custom Watermark Presets & Multi-tenant Workspaces',
      'Shared Team Brand Assets & Approval Flows',
      'Custom AI Model Tuning & Vocabulary Prompts',
      '4K 60fps Master Export Options',
      'Custom MSA, Invoicing & Dedicated Account Manager',
      'Unlimited Team Seats & Granular Permissions',
    ],
    cta: {
      label: 'Contact Sales',
      href: '/register?plan=business',
      primary: false,
    },
  },
];

interface ComparisonCategory {
  category: string;
  items: {
    name: string;
    description?: string;
    free: string | boolean;
    starter: string | boolean;
    pro: string | boolean;
    business: string | boolean;
  }[];
}

const COMPARISON_CATEGORIES: ComparisonCategory[] = [
  {
    category: 'Ingest & Video Processing',
    items: [
      {
        name: 'Monthly Processing Credits',
        description: '1 credit = 1 minute of raw video ingested',
        free: '30 mins (free trial)',
        starter: '150 mins / mo',
        pro: '300 mins / mo',
        business: 'Custom (1,000+)',
      },
      {
        name: 'Max Video Upload Length',
        description: 'Per single raw file or YouTube link',
        free: '15 mins',
        starter: '60 mins',
        pro: '120 mins',
        business: 'Unlimited',
      },
      {
        name: 'Export Resolution & Framerate',
        free: '720p / 1080p 30fps',
        starter: '1080p 60fps',
        pro: '1080p 60fps Ultra',
        business: '4K 60fps Master',
      },
      {
        name: 'Watermark on Exports',
        free: false,
        starter: false,
        pro: false,
        business: false,
      },
      {
        name: 'Paddle Tax & Invoicing Compliance',
        description: 'Instant VAT receipts and compliant corporate invoices',
        free: 'Self-serve',
        starter: 'Automated VAT',
        pro: 'Automated VAT',
        business: 'Custom Invoicing & MSA',
      },
      {
        name: 'Cloud GPU Pipeline Speed',
        description: 'Serverless neural processing cluster',
        free: 'Standard Queue',
        starter: 'Fast Cloud GPU',
        pro: 'Priority GPU Cluster',
        business: 'Dedicated Multi-GPU Nodes',
      },
    ],
  },
  {
    category: 'AI Clipping & Studio Intelligence',
    items: [
      {
        name: 'AI Virality Score & Ranking (1–99)',
        free: 'Basic Preview',
        starter: 'Standard',
        pro: 'Full 3-Metric Audit',
        business: 'Custom Tuning',
      },
      {
        name: 'Face Tracking & Active Speaker Reframe',
        free: 'Single Speaker',
        starter: '1–2 Speakers',
        pro: 'Multi-Speaker Switcher',
        business: 'Custom Layouts',
      },
      {
        name: 'Signature Animated Captions',
        description: 'Hormozi, Karaoke, Clean Cinema & Minimal Top',
        free: '2 styles',
        starter: 'All 4 styles',
        pro: 'All 4 + Custom Fonts',
        business: 'Full Brand Styling',
      },
      {
        name: 'AI Image & Video B-Roll Generation',
        free: false,
        starter: false,
        pro: true,
        business: true,
      },
      {
        name: 'Filler Word & Silence Removal',
        description: 'Auto-cut "um", "uh", pauses, and stutters',
        free: false,
        starter: true,
        pro: true,
        business: true,
      },
    ],
  },
  {
    category: 'Studio Timeline & NLE Export',
    items: [
      {
        name: 'Full Multi-Track Studio Timeline Editor',
        description: 'Non-destructive trim, split, and reorder',
        free: true,
        starter: true,
        pro: true,
        business: true,
      },
      {
        name: 'Text-Based Transcript Cut Editor',
        free: true,
        starter: true,
        pro: true,
        business: true,
      },
      {
        name: 'Export to Adobe Premiere Pro (XML)',
        free: false,
        starter: false,
        pro: true,
        business: true,
      },
      {
        name: 'Export to DaVinci Resolve (EDL)',
        free: false,
        starter: false,
        pro: true,
        business: true,
      },
      {
        name: 'Brand Kit Presets',
        free: 'None',
        starter: '1 Brand Kit',
        pro: 'Unlimited',
        business: 'Multi-Tenant Kits',
      },
    ],
  },
  {
    category: 'Team Collaboration & Support',
    items: [
      {
        name: 'Team Seats',
        free: '1 seat',
        starter: '1 seat',
        pro: '2 seats included',
        business: 'Unlimited seats',
      },
      {
        name: 'Cloud Rendering Priority',
        free: 'Standard',
        starter: 'Standard',
        pro: 'Priority GPU',
        business: 'Dedicated Nodes',
      },
      {
        name: 'Customer Support',
        free: 'Community',
        starter: 'Email Support',
        pro: 'Priority Email',
        business: 'Dedicated Slack VIP',
      },
      {
        name: 'Security & Enterprise Contracts',
        free: false,
        starter: false,
        pro: false,
        business: true,
      },
    ],
  },
];

interface PricingFaq {
  q: string;
  a: string;
}

const PRICING_FAQS: PricingFaq[] = [
  {
    q: 'What is a credit and how does minute calculation work?',
    a: '1 credit equals 1 minute of source video processed by our cloud engine. For example, uploading a 30-minute podcast episode to generate 10 viral clips consumes 30 credits. Trimming, previewing, changing caption colors, or exporting your finished 9:16 shorts never consumes additional credits—you only pay once for ingest.',
  },
  {
    q: 'How does Paddle billing and global tax compliance work?',
    a: 'Paddle acts as our Merchant of Record. They automatically calculate and remit local VAT, sales tax, and GST across 200+ countries. Your payment details are encrypted with bank-level security, and official VAT invoices are delivered instantly via email upon checkout.',
  },
  {
    q: 'Can I cancel, upgrade, or switch plans at any time?',
    a: 'Yes, absolutely. You can upgrade, downgrade, or cancel your subscription anytime directly from your billing settings with a single click. If you cancel, your account remains active and retains all plan benefits and unused credits until the end of your current billing period.',
  },
  {
    q: 'What happens if I run out of credits mid-month?',
    a: 'You can purchase instant one-click top-up credit packs with zero penalty, or upgrade to Pro anytime. Unused credits roll over each billing cycle as long as your subscription remains active.',
  },
];

export default function PricingPage(): JSX.Element {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedCheckout, setSelectedCheckout] = useState<{ tier: PricingTier; interval: BillingCycle } | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'paypal'>('card');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleSelectTier = async (tier: PricingTier) => {
    const launched = await launchPaddleCheckout({
      planName: tier.name,
      interval: billingCycle,
      priceId:
        tier.id === 'pro'
          ? billingCycle === 'annual'
            ? 'pri_pro_annual'
            : 'pri_pro_monthly'
          : billingCycle === 'annual'
          ? 'pri_starter_annual'
          : 'pri_starter_monthly',
      onSuccess: () => {
        setSelectedCheckout({ tier, interval: billingCycle });
        setPaymentSuccess(true);
      },
    });

    if (!launched) {
      setSelectedCheckout({ tier, interval: billingCycle });
      setPaymentSuccess(false);
    }
  };

  const handleCompletePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 1100);
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#14151A] flex flex-col selection:bg-[#E84C2B] selection:text-white antialiased font-sans">
      <LandingNavbar />

      <main className="flex-1 py-16 sm:py-20 lg:py-24 space-y-20 lg:space-y-28">
        {/* ========================================================= */}
        {/* SECTION 1: HEADER & BILLING TOGGLE                        */}
        {/* ========================================================= */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E6E4DD] bg-white px-3.5 py-1 text-xs font-mono font-bold tracking-wider uppercase text-[#E84C2B] shadow-2xs">
              <Zap className="h-3.5 w-3.5" />
              <span>SIMPLE, TRANSPARENT PLANS</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-[-0.035em] text-[#14151A] leading-[1.08]">
              Pick a plan that scales with your{' '}
              <span className="font-editorial text-[#E84C2B] font-normal italic">
                upload schedule
              </span>
              .
            </h1>

            {/* Subcopy */}
            <p className="text-base sm:text-lg text-[#52545E] leading-relaxed max-w-[52ch] mx-auto">
              Start clipping in minutes. Upgrade, downgrade, or switch between monthly and annual billing anytime. Zero hidden credit traps.
            </p>

            {/* Interactive Billing Pill Toggle */}
            <div className="pt-4 flex items-center justify-center">
              <div className="relative inline-flex items-center rounded-2xl border border-[#E6E4DD] bg-white p-1.5 shadow-xs">
                {/* Monthly Option */}
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`relative px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-[#14151A] text-white shadow-xs'
                      : 'text-[#52545E] hover:text-[#14151A]'
                  }`}
                >
                  Monthly
                </button>

                {/* Annual Option (Default with Savings Pill) */}
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`relative flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                    billingCycle === 'annual'
                      ? 'bg-[#E84C2B] text-white shadow-xs'
                      : 'text-[#52545E] hover:text-[#14151A]'
                  }`}
                >
                  <span>Annual Billing</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase transition-colors ${
                      billingCycle === 'annual'
                        ? 'bg-white text-[#E84C2B]'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Save up to 60%
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: 3-COLUMN COMMERCIAL PRICING GRID               */}
        {/* ========================================================= */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-[1200px] mx-auto">
            {TIERS.map((tier) => {
              const isAnnual = billingCycle === 'annual';
              const priceData = isAnnual ? tier.price.annual : tier.price.monthly;
              const creditsText = isAnnual ? tier.credits.annual : tier.credits.monthly;

              return (
                <div
                  key={tier.id}
                  className={`rounded-2xl flex flex-col justify-between transition-all duration-200 relative ${
                    tier.isDark
                      ? 'bg-[#121318] border border-[#2A2C38] text-white p-7 sm:p-8 shadow-xl'
                      : tier.isPopular
                      ? 'bg-white border-2 border-[#E84C2B] text-[#14151A] p-7 sm:p-8 shadow-[0_12px_40px_rgba(232,76,43,0.08)]'
                      : 'bg-white border border-[#E6E4DD] text-[#14151A] p-7 sm:p-8 shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Floating Badge (Popular / Teams) */}
                  {tier.badge && (
                    <div
                      className={`absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-mono font-bold tracking-wider uppercase shadow-xs ${
                        tier.isPopular
                          ? 'bg-[#E84C2B] text-white'
                          : 'bg-[#2A2C38] text-white border border-white/10'
                      }`}
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>{tier.badge}</span>
                    </div>
                  )}

                  {/* Card Header & Pricing */}
                  <div className="space-y-6">
                    {/* Title & Description */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl sm:text-2xl font-bold tracking-[-0.02em]">
                          {tier.name}
                        </h3>
                        {isAnnual && tier.price.annual.savingsBadge && (
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {tier.price.annual.savingsBadge}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs leading-relaxed ${
                          tier.isDark ? 'text-[#9A9BA6]' : 'text-[#52545E]'
                        }`}
                      >
                        {tier.description}
                      </p>
                    </div>

                    {/* Price Numbers */}
                    <div className="space-y-1 pt-2 border-t border-dashed border-[#E6E4DD]/40">
                      <div className="flex items-baseline gap-2">
                        {isAnnual && tier.price.annual.originalPrice && (
                          <span
                            className={`text-lg line-through font-mono ${
                              tier.isDark ? 'text-[#6A6C7A]' : 'text-[#8C8E9A]'
                            }`}
                          >
                            {tier.price.annual.originalPrice}
                          </span>
                        )}
                        <span className="text-4xl sm:text-5xl font-black tracking-tight">
                          {isAnnual
                            ? tier.price.annual.monthlyEquivalent
                            : tier.price.monthly.amount}
                        </span>
                        {tier.id !== 'business' && (
                          <span
                            className={`text-xs font-mono font-semibold ${
                              tier.isDark ? 'text-[#8C8E9A]' : 'text-[#8C8E9A]'
                            }`}
                          >
                            USD / month
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs font-mono ${
                          tier.isDark ? 'text-[#8C8E9A]' : 'text-[#8C8E9A]'
                        }`}
                      >
                        {priceData.billedNote}
                      </p>
                    </div>

                    {/* Credits Callout Box with Interactive Tooltip */}
                    <div
                      className={`relative rounded-xl p-3.5 border transition-colors ${
                        tier.isDark
                          ? 'bg-[#1A1C24] border-[#2A2C38]'
                          : tier.isPopular
                          ? 'bg-[#FAF9F5] border-[#E84C2B]/30'
                          : 'bg-[#FAF9F5] border-[#E6E4DD]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Film
                            className={`h-4 w-4 ${
                              tier.isPopular ? 'text-[#E84C2B]' : 'text-[#10B981]'
                            }`}
                          />
                          <span className="text-xs font-bold font-mono">
                            {creditsText}
                          </span>
                        </div>

                        {/* Tooltip trigger */}
                        <div className="relative">
                          <button
                            type="button"
                            aria-label="Credits info"
                            onClick={() =>
                              setActiveTooltip(
                                activeTooltip === tier.id ? null : tier.id
                              )
                            }
                            onMouseEnter={() => setActiveTooltip(tier.id)}
                            onMouseLeave={() => setActiveTooltip(null)}
                            className="p-1 rounded-md text-[#8C8E9A] hover:text-[#14151A] transition-colors"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>

                          {/* Tooltip Popover */}
                          {activeTooltip === tier.id && (
                            <div className="absolute right-0 bottom-full mb-2 w-60 rounded-xl bg-[#14151A] text-white p-2.5 text-[11px] leading-snug shadow-xl z-20 border border-white/10 pointer-events-none">
                              {tier.credits.tooltip}
                              <div className="absolute top-full right-2.5 -mt-1 border-4 border-transparent border-t-[#14151A]" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 pt-2">
                      <div
                        className={`text-[11px] font-mono uppercase font-bold tracking-wider ${
                          tier.isDark ? 'text-[#8C8E9A]' : 'text-[#8C8E9A]'
                        }`}
                      >
                        Includes:
                      </div>

                      <ul className="space-y-2.5">
                        {tier.features.map((feat, fIdx) => (
                          <li
                            key={fIdx}
                            className="flex items-start gap-2.5 text-xs leading-relaxed"
                          >
                            <Check
                              className={`h-4 w-4 shrink-0 mt-0.5 ${
                                tier.isPopular
                                  ? 'text-[#E84C2B]'
                                  : 'text-emerald-500'
                              }`}
                            />
                            <span
                              className={
                                tier.isDark ? 'text-[#D3D4DC]' : 'text-[#14151A]'
                              }
                            >
                              {feat}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-8 space-y-2">
                    {tier.id === 'business' ? (
                      <Link
                        href={tier.cta.href}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-[0.98] bg-white hover:bg-[#FAF9F5] text-[#14151A]"
                      >
                        <span>{tier.cta.label}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectTier(tier)}
                        className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-[0.98] cursor-pointer ${
                          tier.isPopular
                            ? 'bg-[#E84C2B] hover:bg-[#D13B1C] text-white shadow-[0_4px_16px_rgba(232,76,43,0.3)]'
                            : 'bg-white hover:bg-[#FAF9F5] text-[#14151A] border border-[#E6E4DD] hover:border-[#14151A]'
                        }`}
                      >
                        <span>{tier.cta.label}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                    <p className="text-[10px] text-center font-mono text-[#8C8E9A]">
                      Secure checkout & tax compliance powered by Paddle
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paddle Billing & Compliance Reassurance Banner */}
          <div className="mt-8 max-w-[1200px] mx-auto rounded-2xl border border-[#E6E4DD] bg-white p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF3EE] text-[#E84C2B] border border-[#E84C2B]/20">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="space-y-0.5 text-left">
                <h4 className="text-sm font-bold text-[#14151A] flex items-center gap-2">
                  <span>Global Tax Compliance & Instant Activation Powered by Paddle</span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full">
                    Merchant of Record
                  </span>
                </h4>
                <p className="text-xs text-[#52545E]">
                  Paddle acts as our Merchant of Record. Pay securely via Credit Card, Apple Pay, Google Pay, or PayPal with automatic VAT and sales tax invoicing across 200+ countries.
                </p>
              </div>
            </div>

            <a
              href="#faq"
              className="shrink-0 text-xs font-bold text-[#E84C2B] hover:text-[#D13B1C] flex items-center gap-1.5"
            >
              <span>Learn About Billing & Refunds</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: FULL FEATURE COMPARISON TABLE                  */}
        {/* ========================================================= */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1200px] mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E6E4DD] bg-white px-3 py-1 text-xs font-mono font-bold tracking-wider uppercase text-[#E84C2B] shadow-2xs">
                <Layers className="h-3.5 w-3.5" />
                <span>DETAILED BREAKDOWN</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.035em] text-[#14151A]">
                Compare all features side by side.
              </h2>
              <p className="text-sm text-[#52545E]">
                Everything you need to produce viral short-form content at scale.
              </p>
            </div>

            {/* Desktop & Tablet Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#E6E4DD] bg-white shadow-sm">
              <table className="w-full text-left border-collapse min-w-[720px]">
                <thead>
                  <tr className="border-b border-[#E6E4DD] bg-[#FAF9F5]/70">
                    <th className="py-4 px-6 text-xs font-mono font-bold uppercase tracking-wider text-[#52545E] w-[34%]">
                      Features
                    </th>
                    <th className="py-4 px-4 text-xs font-mono font-bold uppercase tracking-wider text-[#52545E] w-[16%]">
                      Free Trial
                    </th>
                    <th className="py-4 px-4 text-xs font-mono font-bold uppercase tracking-wider text-[#52545E] w-[16%]">
                      Starter
                    </th>
                    <th className="py-4 px-4 text-xs font-mono font-bold uppercase tracking-wider text-[#E84C2B] w-[17%]">
                      Pro (Popular)
                    </th>
                    <th className="py-4 px-4 text-xs font-mono font-bold uppercase tracking-wider text-[#14151A] w-[17%]">
                      Business
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E6E4DD] text-xs">
                  {COMPARISON_CATEGORIES.map((cat, cIdx) => (
                    <React.Fragment key={cIdx}>
                      {/* Category Header Row */}
                      <tr className="bg-[#FAF9F5]/40 font-mono text-[11px] font-bold text-[#8C8E9A] uppercase tracking-wider">
                        <td colSpan={5} className="py-3 px-6">
                          {cat.category}
                        </td>
                      </tr>

                      {/* Item Rows */}
                      {cat.items.map((item, iIdx) => (
                        <tr
                          key={iIdx}
                          className="hover:bg-[#FAF9F5]/50 transition-colors"
                        >
                          <td className="py-3.5 px-6 space-y-0.5">
                            <div className="font-semibold text-[#14151A]">
                              {item.name}
                            </div>
                            {item.description && (
                              <div className="text-[11px] text-[#8C8E9A]">
                                {item.description}
                              </div>
                            )}
                          </td>

                          {/* Free column */}
                          <td className="py-3.5 px-4 text-[#52545E]">
                            {typeof item.free === 'boolean' ? (
                              item.free ? (
                                <Check className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <Minus className="h-4 w-4 text-[#8C8E9A]" />
                              )
                            ) : (
                              <span>{item.free}</span>
                            )}
                          </td>

                          {/* Starter column */}
                          <td className="py-3.5 px-4 text-[#14151A]">
                            {typeof item.starter === 'boolean' ? (
                              item.starter ? (
                                <Check className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <Minus className="h-4 w-4 text-[#8C8E9A]" />
                              )
                            ) : (
                              <span>{item.starter}</span>
                            )}
                          </td>

                          {/* Pro column (Highlighted) */}
                          <td className="py-3.5 px-4 font-semibold text-[#14151A] bg-[#E84C2B]/[0.02]">
                            {typeof item.pro === 'boolean' ? (
                              item.pro ? (
                                <Check className="h-4 w-4 text-[#E84C2B]" />
                              ) : (
                                <Minus className="h-4 w-4 text-[#8C8E9A]" />
                              )
                            ) : (
                              <span>{item.pro}</span>
                            )}
                          </td>

                          {/* Business column */}
                          <td className="py-3.5 px-4 font-semibold text-[#14151A]">
                            {typeof item.business === 'boolean' ? (
                              item.business ? (
                                <Check className="h-4 w-4 text-[#14151A]" />
                              ) : (
                                <Minus className="h-4 w-4 text-[#8C8E9A]" />
                              )
                            ) : (
                              <span>{item.business}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: PRICING & CREDITS FAQ ACCORDION                */}
        {/* ========================================================= */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E6E4DD] bg-white px-3 py-1 text-xs font-mono font-bold tracking-wider uppercase text-[#E84C2B] shadow-2xs">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>PRICING & CREDITS FAQ</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.035em] text-[#14151A]">
                Frequently asked billing questions.
              </h2>
              <p className="text-sm text-[#52545E]">
                Clear answers with zero runaround.
              </p>
            </div>

            <div className="space-y-3">
              {PRICING_FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#E6E4DD] bg-white transition-all overflow-hidden shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-[#FAF9F5]"
                    >
                      <span className="text-sm sm:text-base font-bold text-[#14151A] pr-4">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-[#8C8E9A] transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#E84C2B]' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#52545E] leading-relaxed border-t border-[#E6E4DD]/40">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================= */}
      {/* SIMULATED PADDLE CHECKOUT DRAWER / MODAL                  */}
      {/* ========================================================= */}
      {selectedCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14151A]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#E6E4DD] space-y-6">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between border-b border-[#F0EFEA] pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FAF3EE] text-[#E84C2B] border border-[#E84C2B]/30 font-bold text-xs">
                  P
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#14151A] flex items-center gap-1.5">
                    <span>Paddle Checkout</span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Merchant of Record
                    </span>
                  </h3>
                  <p className="text-[10px] text-[#8C8E9A] flex items-center gap-1">
                    <Lock className="h-2.5 w-2.5 text-emerald-600" />
                    <span>256-bit TLS Encrypted</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCheckout(null)}
                className="p-1.5 rounded-lg text-[#8C8E9A] hover:text-[#14151A] hover:bg-[#FAF9F5] transition-colors"
                aria-label="Close Checkout"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {paymentSuccess ? (
              /* Success Confirmation */
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-bold text-[#14151A]">
                    Payment Successful!
                  </h4>
                  <p className="text-xs text-[#52545E]">
                    Your <strong>{selectedCheckout.tier.name}</strong> subscription is active. Credits are immediately available in your workspace.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E6E4DD] text-xs font-mono text-[#14151A] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#8C8E9A]">Plan:</span>
                    <span className="font-bold">FrameFlow {selectedCheckout.tier.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C8E9A]">Credits Added:</span>
                    <span className="text-emerald-600 font-bold">
                      {selectedCheckout.tier.id === 'starter' ? '+150 Credits' : '+300 Credits/mo (3,600/yr)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C8E9A]">Invoice:</span>
                    <span>Delivered via email</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/dashboard"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] text-white py-3 text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    <span>Open Clip Generator</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSelectedCheckout(null)}
                    className="w-full py-2 text-xs font-semibold text-[#8C8E9A] hover:text-[#14151A]"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              /* Checkout Form */
              <div className="space-y-5">
                {/* Order Summary Box */}
                <div className="rounded-2xl border border-[#E6E4DD] bg-[#FAF9F5] p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#14151A]">
                    <span>FrameFlow {selectedCheckout.tier.name} Plan</span>
                    <span className="font-mono text-base font-black">
                      {selectedCheckout.interval === 'annual'
                        ? selectedCheckout.tier.price.annual.monthlyEquivalent
                        : selectedCheckout.tier.price.monthly.amount}
                      <span className="text-[10px] text-[#8C8E9A] font-normal"> /mo</span>
                    </span>
                  </div>

                  <div className="text-[11px] text-[#52545E] flex items-center justify-between font-mono">
                    <span>
                      {selectedCheckout.interval === 'annual'
                        ? selectedCheckout.tier.price.annual.billedNote
                        : selectedCheckout.tier.price.monthly.billedNote}
                    </span>
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      {selectedCheckout.interval === 'annual' ? 'Save up to 60%' : 'Cancel anytime'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#E6E4DD] flex items-center gap-2 text-xs text-[#14151A]">
                    <Zap className="h-3.5 w-3.5 text-[#E84C2B]" />
                    <span className="font-bold">
                      Instant Unlock: {selectedCheckout.interval === 'annual' ? selectedCheckout.tier.credits.annual : selectedCheckout.tier.credits.monthly}
                    </span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#14151A] block">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'card', label: 'Credit Card' },
                      { id: 'apple', label: 'Apple Pay' },
                      { id: 'paypal', label: 'PayPal' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as 'card' | 'apple' | 'paypal')}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          paymentMethod === m.id
                            ? 'border-[#E84C2B] bg-[#FAF3EE] text-[#E84C2B] shadow-2xs font-bold'
                            : 'border-[#E6E4DD] bg-white text-[#52545E] hover:border-[#14151A]'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mock Card Input Fields */}
                {paymentMethod === 'card' && (
                  <div className="space-y-2.5 rounded-xl border border-[#E6E4DD] bg-[#FAF9F5]/50 p-3 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-[#8C8E9A] uppercase block mb-1">
                        Card Number (Test Mode Active)
                      </span>
                      <div className="flex items-center gap-2 bg-white border border-[#DCDAD2] rounded-lg px-2.5 py-1.5 font-mono text-xs text-[#14151A]">
                        <CreditCard className="h-4 w-4 text-[#8C8E9A]" />
                        <span>•••• •••• •••• 4242</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-[#8C8E9A] uppercase block mb-1">Expires</span>
                        <div className="bg-white border border-[#DCDAD2] rounded-lg px-2.5 py-1.5 font-mono text-xs text-[#14151A]">
                          12 / 28
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#8C8E9A] uppercase block mb-1">CVC</span>
                        <div className="bg-white border border-[#DCDAD2] rounded-lg px-2.5 py-1.5 font-mono text-xs text-[#14151A]">
                          •••
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleCompletePayment}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#E84C2B] hover:bg-[#D13B1C] text-white py-3 px-4 text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessing ? (
                      <span>Processing securely via Paddle...</span>
                    ) : (
                      <>
                        <span>Complete Purchase & Activate Credits</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="text-[10px] text-center text-[#8C8E9A] leading-tight font-mono">
                    Secure checkout & global tax compliance powered by Paddle.
                  </div>

                  <div className="text-center pt-1 border-t border-[#F0EFEA]">
                    <Link
                      href={`/register?plan=${selectedCheckout.tier.id}`}
                      className="text-[11px] font-semibold text-[#52545E] hover:text-[#14151A] underline decoration-dotted"
                    >
                      Prefer to register an account first? Continue here &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
