"use client";

import { HeroSection } from "@/components/HeroSection";
import { SkillReference } from "@/components/SkillReference";
import { DesignAlgorithm } from "@/components/DesignAlgorithm";
import { OptionsShowcase } from "@/components/OptionsShowcase";
import { ComparativeAnalysis } from "@/components/ComparativeAnalysis";
import { HeatmapViz } from "@/components/HeatmapViz";
import { ImplementationBlueprint } from "@/components/ImplementationBlueprint";
import { AIPortalGateway } from "@/components/AIPortalGateway";
import { useState } from "react";

const navItems = [
  { id: "skill-reference", label: "Registry", num: "01" },
  { id: "algorithm", label: "Algorithm", num: "02" },
  { id: "options", label: "Options", num: "03" },
  { id: "comparative", label: "Analysis", num: "04" },
  { id: "heatmap", label: "Heatmap", num: "05" },
  { id: "implementation", label: "Install", num: "06" },
  { id: "portal", label: "AI Portal", num: "07" },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Editorial Masthead Navigation */}
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-12">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-primary flex items-center justify-center">
              <span className="text-[8px] font-bold text-primary-foreground leading-none">SP</span>
            </div>
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-foreground hidden sm:block">
              Skill Stack Architecture
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                <span className="text-primary/60 mr-1">{item.num}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5"
          >
            <span className={`block w-5 h-0.5 bg-foreground transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-foreground transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-foreground transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="max-w-[1200px] mx-auto px-6 py-4 space-y-3">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="block w-full text-left text-sm tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="text-primary/60 mr-2">{item.num}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero / Masthead */}
      <HeroSection />

      {/* Editorial Divider */}
      <div className="max-w-[1200px] mx-auto px-6">
        <hr className="editorial-rule-thick" />
      </div>

      {/* Executive Summary — Editorial Lead */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            {/* Left Column — Lead Text */}
            <div className="md:col-span-7">
              <p className="text-xs tracking-[0.25em] uppercase text-primary font-medium mb-4">
                Architecture Overview
              </p>
              <h2 className="font-['Georgia',_serif] text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-[1.15] mb-6">
                A living, navigable architecture that serves as build specification, AI guidance portal, and publishable skill repository
              </h2>
              <div className="editorial-pullquote mb-6">
                Every component is also an installable skill. The architecture is the product, and the product is the architecture.
              </div>
              <p className="text-base text-muted-foreground leading-relaxed editorial-dropcap">
                This interactive web experience translates the Prompt Redesign Options document into a living specification.
                It serves three simultaneous purposes: a build specification that any AI agent can follow, a self-referencing
                portal that AI agents can redirect to for design guidance, and a publishable GitHub repository where every
                component is also an installable skill via the Vercel Skills ecosystem.
              </p>
            </div>

            {/* Right Column — Tier Summary */}
            <div className="md:col-span-5 md:border-l md:border-border md:pl-8">
              <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-medium mb-6">
                The Stack at a Glance
              </p>
              <div className="space-y-6">
                {[
                  { tier: "T0", name: "Foundation", count: 4, desc: "Design intelligence, generation, animation, components" },
                  { tier: "T1", name: "Interactive", count: 4, desc: "Scroll animation, video, diagrams, data visualization" },
                  { tier: "T2", name: "Visual Asset", count: 4, desc: "Image generation, component styling, testing, custom viz" },
                  { tier: "T3", name: "Portal", count: 4, desc: "AI redirect, prioritization, matrix engine, algorithm" },
                ].map(t => (
                  <div key={t.tier} className="group">
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="font-['Georgia',_serif] text-lg font-bold text-foreground">
                        <span className="text-primary">{t.tier}</span> {t.name}
                      </h3>
                      <span className="text-2xl font-['Georgia',_serif] font-bold text-border group-hover:text-primary transition-colors">
                        {t.count}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                    <hr className="editorial-rule mt-4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="max-w-[1200px] mx-auto px-6">
        <hr className="editorial-rule" />
      </div>

      {/* Skill Reference */}
      <SkillReference />

      <div className="max-w-[1200px] mx-auto px-6">
        <hr className="editorial-rule" />
      </div>

      {/* Design Algorithm */}
      <DesignAlgorithm />

      <div className="max-w-[1200px] mx-auto px-6">
        <hr className="editorial-rule" />
      </div>

      {/* Options Showcase */}
      <OptionsShowcase />

      <div className="max-w-[1200px] mx-auto px-6">
        <hr className="editorial-rule" />
      </div>

      {/* Comparative Analysis */}
      <ComparativeAnalysis />

      <div className="max-w-[1200px] mx-auto px-6">
        <hr className="editorial-rule" />
      </div>

      {/* Heatmap */}
      <HeatmapViz />

      <div className="max-w-[1200px] mx-auto px-6">
        <hr className="editorial-rule" />
      </div>

      {/* Implementation Blueprint */}
      <ImplementationBlueprint />

      <div className="max-w-[1200px] mx-auto px-6">
        <hr className="editorial-rule" />
      </div>

      {/* AI Portal Gateway */}
      <AIPortalGateway />

      {/* Editorial Footer — Colophon */}
      <footer className="border-t-3 border-foreground py-12 px-6 bg-background">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 bg-primary flex items-center justify-center">
                  <span className="text-[8px] font-bold text-primary-foreground leading-none">SP</span>
                </div>
                <span className="text-xs font-medium tracking-[0.2em] uppercase text-foreground">
                  Skill Stack Architecture
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A design algorithm for interactive web skill stack architecture.
                16 Skills &middot; 4 Tiers &middot; 5 Options &middot; SP-7 Dimensions.
              </p>
            </div>
            <div className="md:col-span-4">
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium mb-3">
                Stack Summary
              </p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>T0: Stitch Loop, Framer Motion, UI/UX Pro Max, 21st.dev</p>
                <p>T1: GSAP, Remotion, Mermaid, AntV</p>
                <p>T2: AI Image, shadcn, Playwright, D3.js</p>
                <p>T3: AI Portal, Prioritizer, Matrix, Algorithm</p>
              </div>
            </div>
            <div className="md:col-span-4">
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium mb-3">
                Install
              </p>
              <p className="text-sm text-muted-foreground">
                Every item installable via <code className="text-primary font-mono text-xs bg-muted px-1.5 py-0.5">npx skills add</code>
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                GitHub Staging Ready &middot; AI Portal Gateway Enabled
              </p>
            </div>
          </div>
          <hr className="editorial-rule my-6" />
          <p className="text-[11px] text-muted-foreground tracking-wider text-center">
            SKILL STACK ARCHITECTURE BLUEPRINT &mdash; EDITORIAL EDITION
          </p>
        </div>
      </footer>
    </div>
  );
}
