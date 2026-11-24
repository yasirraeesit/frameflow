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
  Film,
  CreditCard,
  Lock,
  CheckCircle2,
  X,
  ChevronDown,
  Building2,
  Mail,
} from 'lucide-react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { BusinessContactModal } from '@/components/modals/BusinessContactModal';
import { launchPaddleCheckout } from '@/lib/paddle';

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
    id: 'free',
    name: 'Free',
    description: 'Explore FrameFlow with 30 one-time trial credits and full text timeline editing.',
    price: {
      annual: {
        monthlyEquivalent: '$0',
        billedNote: 'Free forever trial',
      },
      monthly: {
        amount: '$0',
        billedNote: 'No credit card required',
      },
    },
    credits: {
      annual: '30 trial credits',
      monthly: '30 trial credits',
      tooltip: '1 credit = 1 minute of raw video processed. 30 one-time credits on registration.',
    },
    features: [
      '30 trial credits (30 mins of video)',
      '720p Clean Exports',
      'Gaming & GTA 6 hybrid detector',
      '1 Brand Template preset',
      'Full Multi-Track Timeline & Word Cut Editor',
      'Solo & 2-Speaker split layouts',
      'Standard cloud processing queue',
    ],
    cta: {
      label: 'Start Free',
      href: '/register',
      primary: false,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Essential toolkit for active creators and streamers publishing consistent short-form videos.',
    price: {
      annual: {
        monthlyEquivalent: '$2.40',
        originalPrice: '$3.00',
        billedNote: 'Billed annually at $29/year',
        savingsBadge: 'Save 20%',
      },
      monthly: {
        amount: '$3.00',
        billedNote: 'Billed monthly, cancel anytime',
      },
    },
    credits: {
      annual: '1,440 credits / yr (120/mo)',
      monthly: '120 credits / month',
      tooltip: '1 credit = 1 minute of video processed. Unused credits roll over each month with active subscription.',
    },
    features: [
      '120 video minutes / month (1,440/yr)',
      'Watermark-free 1080p 60fps exports',
      '2 Custom Brand Templates',
      'Voiceover Hook Teleprompter & Mic Recorder',
      'Auto filler word & silence removal',
      'Hormozi, Karaoke & Vice Neon captions',
      'Unused credits rollover automatically',
    ],
    cta: {
      label: 'Get Pro — $3/mo',
      href: '/register?plan=pro',
      primary: false,
    },
  },
  {
    id: 'max',
    name: 'Max',
    badge: 'MOST POPULAR • BEST VALUE',
    isPopular: true,
    description: 'Our flagship studio tier for professional creators, podcasters, and daily content agencies.',
    price: {
      annual: {
        monthlyEquivalent: '$8.00',
        originalPrice: '$10.00',
        billedNote: 'Billed annually at $96/year',
        savingsBadge: 'Save 20%',
      },
      monthly: {
        amount: '$10.00',
        billedNote: 'Billed monthly, cancel anytime',
      },
    },
    credits: {
      annual: '6,000 credits / yr (500/mo)',
      monthly: '500 credits / month',
      tooltip: '1 credit = 1 minute of video processed. Includes priority cloud rendering queue.',
    },
    features: [
      '500 video minutes / month (6,000/yr)',
      'AI B-Roll (V2) image & video overlays',
      'Watermark-free 1080p 60fps exports',
      '5 Brand Templates + Custom Fonts & Logos',
      'Priority GPU cloud rendering queue',
      'Full 3-metric AI Virality Score Engine',
      'Multi-speaker active switching layouts',
    ],
    cta: {
      label: 'Get Max — $10/mo',
      href: '/register?plan=max',
      primary: true,
    },
  },
  {
    id: 'business',
    name: 'Business',
    badge: 'STUDIOS & NETWORKS',
    isDark: true,
    description: 'Custom volume, 4K exports, and dedicated workflow integrations for media companies.',
    price: {
      annual: {
        monthlyEquivalent: 'Custom',
        billedNote: 'Custom annual contract & SLA',
        savingsBadge: 'Volume Pricing',
      },
      monthly: {
        amount: 'Custom',
        billedNote: 'Tailored monthly billing available',
      },
    },
    credits: {
      annual: 'Custom credit quota (1,000+ mins)',
      monthly: 'Custom monthly credit pool',
      tooltip: 'Dedicated custom GPU processing capacity and guaranteed SLAs for studios and media teams.',
    },
    features: [
      'Custom monthly credit allocation',
      '4K master exports',
      'Unlimited Brand Templates',
      'Premiere Pro & DaVinci Resolve XML export',
      'Dedicated Slack / WhatsApp VIP support',
      'Custom AI vocabulary & prompt tuning',
      'Shared multi-seat team workspace',
    ],
    cta: {
      label: 'Contact Sales',
      href: '#contact-sales',
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
    pro: string | boolean;
    max: string | boolean;
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
        free: '30 mins (trial)',
        pro: '120 mins / mo',
        max: '500 mins / mo',
        business: 'Custom (1,000+)',
      },
      {
        name: 'Max Video Upload Length',
        description: 'Per single raw file or YouTube link',
        free: '15 mins',
        pro: '60 mins',
        max: '120 mins',
        business: 'Unlimited',
      },
      {
        name: 'Export Resolution & Framerate',
        free: '720p',
        pro: '1080p 60fps',
        max: '1080p 60fps',
        business: '4K 60fps Master',
      },
      {
        name: 'Watermark on Exports',
        free: 'Has Watermark',
        pro: 'Watermark-Free',
        max: 'Watermark-Free',
        business: 'Watermark-Free',
      },
      {
        name: 'Paddle Tax & Invoicing Compliance',
        description: 'Instant VAT receipts and compliant corporate invoices',
        free: 'Self-serve',
        pro: 'Automated VAT',
        max: 'Automated VAT',
        business: 'Custom Invoicing & MSA',
      },
      {
        name: 'Cloud GPU Pipeline Speed',
        description: 'Serverless neural processing cluster',
        free: 'Standard Queue',
        pro: 'Fast Cloud GPU',
        max: 'Priority Queue',
        business: 'Dedicated GPU Nodes',
      },
    ],
  },
  {
    category: 'AI Clipping & Studio Intelligence',
    items: [
      {
        name: 'AI Virality Score & Ranking (1–99)',
        free: 'Basic Preview',
        pro: 'Standard Audit',
        max: 'Full 3-Metric Audit',
        business: 'Custom Tuning',
      },
      {
        name: 'Face Tracking & Active Speaker Reframe',
        free: 'Solo & 2-Split',
        pro: 'Solo & 2-Split',
        max: 'Multi-Speaker Switcher',
        business: 'Custom Multi-Cam',
      },
      {
        name: 'Signature Animated Captions',
        description: 'Hormozi, Karaoke, Clean Cinema, Vice Neon & Minimal Top',
        free: '2 styles',
        pro: 'All 5 styles',
        max: 'All 5 + Custom Fonts',
        business: 'Full Brand Styling',
      },
      {
        name: 'AI B-Roll (V2) Overlays',
        description: 'Contextual image and video overlay detection',
        free: false,
        pro: false,
        max: true,
        business: true,
      },
      {
        name: 'Filler Word & Silence Removal',
        description: 'Auto-cut "um", "uh", pauses, and stutters',
        free: false,
        pro: true,
        max: true,
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
        pro: true,
        max: true,
        business: true,
      },
      {
        name: 'Text-Based Transcript Cut Editor',
        free: true,
        pro: true,
        max: true,
        business: true,
      },
      {
        name: 'Export to Adobe Premiere Pro & DaVinci XML',
        free: false,
        pro: false,
        max: false,
        business: true,
      },
      {
        name: 'Brand Kit Templates',
        free: '1 Template',
        pro: '2 Templates',
        max: '5 Templates',
        business: 'Unlimited (99)',
      },
    ],
  },
  {
    category: 'Team Collaboration & Support',
    items: [
      {
        name: 'Team Seats',
        free: '1 seat',
        pro: '1 seat',
        max: '2 seats included',
        business: 'Unlimited seats',
      },
      {
        name: 'Cloud Rendering Priority',
        free: 'Standard',
        pro: 'Standard',
        max: 'Priority GPU',
        business: 'Dedicated Nodes',
      },
      {
        name: 'Customer Support',
        free: 'Community',
        pro: 'Email Support',
        max: 'Priority Support',
        business: 'Dedicated Slack VIP',
      },
      {
        name: 'Security & Enterprise Contracts',
        free: false,
        pro: false,
        max: false,
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
    a: '1 credit equals 1 minute of source video processed by our cloud engine. For example, processing a 30-minute podcast episode to generate viral shorts consumes 30 credits. Trimming, previewing, changing caption styles, and exporting your final 9:16 shorts never costs extra credits—you only pay once on ingest.',
  },
  {
    q: 'How does Paddle billing and global tax compliance work?',
    a: 'Paddle acts as our Merchant of Record. They automatically calculate and remit local VAT, sales tax, and GST across 200+ countries. Official compliant invoices are delivered instantly via email upon checkout.',
  },
  {
    q: 'What is the difference between Pro ($3/mo) and Max ($10/mo)?',
    a: 'Pro ($3/mo or $29/yr) includes 120 minutes of video processing, watermark-free 1080p exports, and 2 Brand Templates. Max ($10/mo or $96/yr) increases capacity to 500 minutes and unlocks V2 AI B-Roll generation, custom fonts/logos, and priority cloud rendering.',
  },
  {
    q: 'Can I cancel, upgrade, or switch plans at any time?',
    a: 'Yes, absolutely. You can upgrade, downgrade, or cancel your subscription anytime directly from your billing settings with a single click. Unused credits roll over with an active subscription.',
  },
  {
    q: 'How do enterprise teams use the Business plan?',
    a: 'The Business plan is tailored for podcast networks, agencies, and high-volume gaming channels. It offers custom credit pools (1,000+ mins), 4K master exports, DaVinci Resolve & Premiere Pro XML exports, and dedicated Slack/WhatsApp support.',
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
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);

  const handleSelectTier = async (tier: PricingTier) => {
    if (tier.id === 'free') {
      window.location.assign('/register');
      return;
    }

    if (tier.id === 'business') {
      setIsContactModalOpen(true);
      return;
    }

    const priceId =
      tier.id === 'max'
        ? billingCycle === 'annual'
          ? process.env.NEXT_PUBLIC_PADDLE_MAX_ANNUAL_PRICE_ID || 'pri_max_annual'
          : process.env.NEXT_PUBLIC_PADDLE_MAX_PRICE_ID || 'pri_max_monthly'
        : billingCycle === 'annual'
        ? process.env.NEXT_PUBLIC_PADDLE_PRO_ANNUAL_PRICE_ID || 'pri_pro_annual'
        : process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID || 'pri_pro_monthly';

    const launched = await launchPaddleCheckout({
      planName: tier.name,
      interval: billingCycle,
      priceId,
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
        {/* SECTION 1: HEADER & BILLING CYCLE TOGGLE                   */}
        {/* ========================================================= */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E6E4DD] bg-white px-3.5 py-1 text-xs font-mono font-bold tracking-wider uppercase text-[#E84C2B] shadow-2xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>HONEST PRICING & ZERO MINUTE EXTORTION</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[-0.04em] text-[#14151A] leading-[1.08] max-w-4xl mx-auto">
            Plans built for creators.{' '}
            <span className="font-serif italic font-normal text-[#E84C2B]">
              Starting at $3/month.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#52545E] max-w-2xl mx-auto leading-relaxed">
            Other clipping tools charge $49–$99/mo for expiring minutes and lock you in single-track editors. FrameFlow gives you full timeline precision with fair, creator-first pricing.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-2 flex justify-center">
            <div className="inline-flex items-center rounded-2xl border border-[#E6E4DD] bg-white p-1.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`relative px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-[#14151A] text-white shadow-xs'
                    : 'text-[#52545E] hover:text-[#14151A]'
                }`}
              >
                <span>Annual Billing</span>
                <span className="ml-2 inline-block rounded-md bg-[#E84C2B] px-1.5 py-0.5 text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                  Save 20%
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-[#14151A] text-white shadow-xs'
                    : 'text-[#52545E] hover:text-[#14151A]'
                }`}
              >
                <span>Monthly Billing</span>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: 4-COLUMN COMMERCIAL PRICING GRID               */}
        {/* ========================================================= */}
        <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
            {TIERS.map((tier) => {
              const isAnnual = billingCycle === 'annual';
              const priceData = isAnnual ? tier.price.annual : tier.price.monthly;
              const creditsText = isAnnual ? tier.credits.annual : tier.credits.monthly;

              return (
                <div
                  key={tier.id}
                  className={`rounded-2xl flex flex-col justify-between transition-all duration-200 relative ${
                    tier.isDark
                      ? 'bg-[#121318] border border-[#2A2C38] text-white p-6 shadow-xl'
                      : tier.isPopular
                      ? 'bg-white border-2 border-[#E84C2B] text-[#14151A] p-6 shadow-[0_12px_40px_rgba(232,76,43,0.08)] ring-1 ring-[#E84C2B]/10'
                      : 'bg-white border border-[#E6E4DD] text-[#14151A] p-6 shadow-xs hover:shadow-md'
                  }`}
                >
                  {/* Floating Badge (Popular / Studios) */}
                  {tier.badge && (
                    <div
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase shadow-xs ${
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
                  <div className="space-y-5">
                    {/* Title & Description */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold tracking-tight">
                          {tier.name}
                        </h3>
                        {isAnnual && tier.price.annual.savingsBadge && (
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {tier.price.annual.savingsBadge}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs leading-relaxed min-h-[36px] ${
                          tier.isDark ? 'text-[#9A9BA6]' : 'text-[#52545E]'
                        }`}
                      >
                        {tier.description}
                      </p>
                    </div>

                    {/* Price Numbers */}
                    <div className="space-y-1 pt-2 border-t border-dashed border-[#E6E4DD]/50">
                      <div className="flex items-baseline gap-1.5">
                        {isAnnual && tier.price.annual.originalPrice && (
                          <span
                            className={`text-sm line-through font-mono ${
                              tier.isDark ? 'text-[#6A6C7A]' : 'text-[#8C8E9A]'
                            }`}
                          >
                            {tier.price.annual.originalPrice}
                          </span>
                        )}
                        <span className="text-3xl sm:text-4xl font-black tracking-tight">
                          {isAnnual
                            ? tier.price.annual.monthlyEquivalent
                            : tier.price.monthly.amount}
                        </span>
                        {tier.id !== 'business' && (
                          <span
                            className={`text-xs font-mono ${
                              tier.isDark ? 'text-[#8C8E9A]' : 'text-[#8C8E9A]'
                            }`}
                          >
                            / mo
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[11px] font-mono ${
                          tier.isDark ? 'text-[#8C8E9A]' : 'text-[#8C8E9A]'
                        }`}
                      >
                        {priceData.billedNote}
                      </p>
                    </div>

                    {/* Credits Callout Box with Interactive Tooltip */}
                    <div
                      className={`relative rounded-xl p-3 border transition-colors ${
                        tier.isDark
                          ? 'bg-[#1A1C24] border-[#2A2C38]'
                          : tier.isPopular
                          ? 'bg-[#FAF9F5] border-[#E84C2B]/30'
                          : 'bg-[#FAF9F5] border-[#E6E4DD]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Film
                            className={`h-3.5 w-3.5 shrink-0 ${
                              tier.isPopular ? 'text-[#E84C2B]' : 'text-[#10B981]'
                            }`}
                          />
                          <span className="text-xs font-bold font-mono truncate">
                            {creditsText}
                          </span>
                        </div>

                        {/* Tooltip trigger */}
                        <div className="relative shrink-0">
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
                    <div className="space-y-2.5 pt-1">
                      <div
                        className={`text-[10px] font-mono uppercase font-bold tracking-wider ${
                          tier.isDark ? 'text-[#8C8E9A]' : 'text-[#8C8E9A]'
                        }`}
                      >
                        Included:
                      </div>

                      <ul className="space-y-2 text-xs">
                        {tier.features.map((feat, fIdx) => (
                          <li
                            key={fIdx}
                            className="flex items-start gap-2 leading-relaxed"
                          >
                            <Check
                              className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${
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
                  <div className="pt-6 space-y-2">
                    {tier.id === 'business' ? (
                      <button
                        type="button"
                        onClick={() => setIsContactModalOpen(true)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold transition-all shadow-sm active:scale-[0.98] bg-white hover:bg-[#FAF9F5] text-[#14151A] cursor-pointer"
                      >
                        <span>{tier.cta.label}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ) : tier.id === 'free' ? (
                      <Link
                        href={tier.cta.href}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold transition-all shadow-sm active:scale-[0.98] bg-white hover:bg-[#FAF9F5] text-[#14151A] border border-[#E6E4DD] hover:border-[#14151A]"
                      >
                        <span>{tier.cta.label}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectTier(tier)}
                        className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold transition-all shadow-sm active:scale-[0.98] cursor-pointer ${
                          tier.isPopular
                            ? 'bg-[#E84C2B] hover:bg-[#D13B1C] text-white shadow-[0_4px_16px_rgba(232,76,43,0.3)]'
                            : 'bg-[#14151A] hover:bg-black text-white'
                        }`}
                      >
                        <span>{tier.cta.label}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <p className="text-[10px] text-center font-mono text-[#8C8E9A]">
                      {tier.id === 'business'
                        ? 'Custom SLA & Invoicing'
                        : 'Instant access via Paddle Checkout'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paddle Billing & Compliance Reassurance Banner */}
          <div className="mt-8 max-w-[1400px] mx-auto rounded-2xl border border-[#E6E4DD] bg-white p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF3EE] text-[#E84C2B] border border-[#E84C2B]/20">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="space-y-0.5 text-left">
                <h4 className="text-sm font-bold text-[#14151A] flex items-center gap-2 flex-wrap">
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
              className="text-xs font-mono font-bold text-[#E84C2B] hover:underline whitespace-nowrap self-start sm:self-auto"
            >
              Billing FAQs &darr;
            </a>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: 4-COLUMN FEATURE COMPARISON MATRIX              */}
        {/* ========================================================= */}
        <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#14151A]">
              Detailed Plan Feature Matrix
            </h2>
            <p className="text-xs sm:text-sm text-[#52545E]">
              Compare exact limits across Free ($0), Pro ($3), Max ($10), and Business.
            </p>
          </div>

          {/* Desktop & Mobile Responsive Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#E6E4DD] bg-white shadow-sm">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-[#E6E4DD] bg-[#FAF9F5]/70">
                  <th className="sticky left-0 bg-[#FAF9F5] z-20 py-4 px-6 text-xs font-mono font-bold uppercase tracking-wider text-[#52545E] w-[32%] shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                    Features & Limits
                  </th>
                  <th className="py-4 px-4 text-xs font-mono font-bold uppercase tracking-wider text-[#52545E] w-[17%]">
                    Free ($0)
                  </th>
                  <th className="py-4 px-4 text-xs font-mono font-bold uppercase tracking-wider text-[#14151A] w-[17%]">
                    Pro ($3)
                  </th>
                  <th className="py-4 px-4 text-xs font-mono font-bold uppercase tracking-wider text-[#E84C2B] w-[17%] bg-[#E84C2B]/[0.03]">
                    Max ($10 — Popular)
                  </th>
                  <th className="py-4 px-4 text-xs font-mono font-bold uppercase tracking-wider text-[#14151A] w-[17%]">
                    Business (Custom)
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E6E4DD] text-xs">
                {COMPARISON_CATEGORIES.map((cat, cIdx) => (
                  <React.Fragment key={cIdx}>
                    {/* Category Header Row */}
                    <tr className="bg-[#FAF9F5]/60 font-mono text-[11px] font-bold text-[#8C8E9A] uppercase tracking-wider">
                      <td colSpan={5} className="sticky left-0 bg-[#FAF9F5] py-3 px-6 z-10">
                        {cat.category}
                      </td>
                    </tr>

                    {/* Item Rows */}
                    {cat.items.map((item, iIdx) => (
                      <tr
                        key={iIdx}
                        className="hover:bg-[#FAF9F5]/50 transition-colors"
                      >
                        <td className="sticky left-0 bg-white z-10 py-3 px-6 space-y-0.5 shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                          <div className="font-semibold text-[#14151A]">
                            {item.name}
                          </div>
                          {item.description && (
                            <div className="text-[10px] text-[#8C8E9A]">
                              {item.description}
                            </div>
                          )}
                        </td>

                        {/* Free column */}
                        <td className="py-3 px-4 text-[#52545E]">
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

                        {/* Pro column */}
                        <td className="py-3 px-4 text-[#14151A] font-medium">
                          {typeof item.pro === 'boolean' ? (
                            item.pro ? (
                              <Check className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Minus className="h-4 w-4 text-[#8C8E9A]" />
                            )
                          ) : (
                            <span>{item.pro}</span>
                          )}
                        </td>

                        {/* Max column (Highlighted) */}
                        <td className="py-3 px-4 font-bold text-[#14151A] bg-[#E84C2B]/[0.02]">
                          {typeof item.max === 'boolean' ? (
                            item.max ? (
                              <Check className="h-4 w-4 text-[#E84C2B]" />
                            ) : (
                              <Minus className="h-4 w-4 text-[#8C8E9A]" />
                            )
                          ) : (
                            <span>{item.max}</span>
                          )}
                        </td>

                        {/* Business column */}
                        <td className="py-3 px-4 font-semibold text-[#14151A]">
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
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: PRICING & CREDITS FAQ ACCORDION                */}
        {/* ========================================================= */}
        <section id="faq" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                      className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-[#FAF9F5] cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14151A]/60 backdrop-blur-xs animate-in fade-in duration-200">
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
                className="p-1.5 rounded-lg text-[#8C8E9A] hover:text-[#14151A] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
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
                      {selectedCheckout.tier.id === 'pro'
                        ? selectedCheckout.interval === 'annual'
                          ? '+1,440 Credits / yr'
                          : '+120 Credits / mo'
                        : selectedCheckout.interval === 'annual'
                        ? '+6,000 Credits / yr'
                        : '+500 Credits / mo'}
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
                    <span>Open Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSelectedCheckout(null)}
                    className="w-full py-2 text-xs font-semibold text-[#8C8E9A] hover:text-[#14151A] cursor-pointer"
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
                      {selectedCheckout.interval === 'annual' ? 'Save 20%' : 'Cancel anytime'}
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

      {/* Business Contact Sales Modal */}
      <BusinessContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      <SiteFooter />
    </div>
  );
}
