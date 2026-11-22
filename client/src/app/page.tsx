import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroOverlappingStage } from '@/components/landing/HeroOverlappingStage';
import { AsymmetricWorkflowShowcase } from '@/components/landing/AsymmetricWorkflowShowcase';
import { StaggeredBento } from '@/components/landing/StaggeredBento';
import { PricingComparison } from '@/components/landing/PricingComparison';
import { FaqAndCtaBanner } from '@/components/landing/FaqAndCtaBanner';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function LandingPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#14151A] flex flex-col selection:bg-[#E84C2B] selection:text-white antialiased font-sans">
      <LandingNavbar />
      <main className="flex-1">
        <HeroOverlappingStage />
        <AsymmetricWorkflowShowcase />
        <StaggeredBento />
        <PricingComparison />
        <FaqAndCtaBanner />
      </main>
      <LandingFooter />
    </div>
  );
}
