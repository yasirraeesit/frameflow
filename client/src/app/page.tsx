import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroOverlappingStage } from '@/components/landing/HeroOverlappingStage';
import { ViralityScoreExplorer } from '@/components/landing/ViralityScoreExplorer';
import { AsymmetricWorkflowShowcase } from '@/components/landing/AsymmetricWorkflowShowcase';
import { StaggeredBento } from '@/components/landing/StaggeredBento';
import { FaqAndCtaBanner } from '@/components/landing/FaqAndCtaBanner';
import { SiteFooter } from '@/components/layout/SiteFooter';

export default function LandingPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#14151A] flex flex-col selection:bg-[#E84C2B] selection:text-white antialiased font-sans">
      <LandingNavbar />
      <main className="flex-1">
        <HeroOverlappingStage />
        <ViralityScoreExplorer />
        <AsymmetricWorkflowShowcase />
        <StaggeredBento />
        <FaqAndCtaBanner />
      </main>
      <SiteFooter />
    </div>
  );
}
