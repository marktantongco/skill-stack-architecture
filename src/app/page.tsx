"use client";

import { HeroSection } from "@/components/HeroSection";
import { SkillReference } from "@/components/SkillReference";
import { DesignAlgorithm } from "@/components/DesignAlgorithm";
import { OptionsShowcase } from "@/components/OptionsShowcase";
import { ComparativeAnalysis } from "@/components/ComparativeAnalysis";
import { HeatmapViz } from "@/components/HeatmapViz";
import { ImplementationBlueprint } from "@/components/ImplementationBlueprint";
import { AIPortalGateway } from "@/components/AIPortalGateway";
import { TierArchitecture } from "@/components/TierArchitecture";
import { DecisionTree } from "@/components/DecisionTree";
import { SectionMapping } from "@/components/SectionMapping";
import { VisualGallery } from "@/components/VisualGallery";
import { SkillMarketplace } from "@/components/SkillMarketplace";
import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { Moon, Sun, ArrowUp, Menu, X } from "lucide-react";
import { dividerVariant, hoverNavItem } from "@/lib/animation-variants";

const navItems = [
  { id: "skill-reference", label: "Registry", num: "01" },
  { id: "skill-marketplace", label: "Marketplace", num: "12" },
  { id: "algorithm", label: "Algorithm", num: "02" },
  { id: "options", label: "Options", num: "03" },
  { id: "comparative", label: "Analysis", num: "04" },
  { id: "heatmap", label: "Heatmap", num: "05" },
  { id: "implementation", label: "Install", num: "06" },
  { id: "portal", label: "AI Portal", num: "07" },
  { id: "tier-architecture", label: "Architecture", num: "08" },
  { id: "decision-tree", label: "Decision", num: "09" },
  { id: "section-mapping", label: "Mapping", num: "10" },
  { id: "visual-gallery", label: "Gallery", num: "11" },
];

/* ─── Scroll Spy Hook ─── */
function useScrollSpy(sectionIds: string[]) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}

/* ─── Editorial Divider Component ─── */
function EditorialDivider({ thick = false }: { thick?: boolean }) {
  return (
    <div className="max-w-[1200px] mx-auto px-6">
      <motion.hr
        className={thick ? "editorial-rule-thick" : "editorial-rule"}
        variants={dividerVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      />
    </div>
  );
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { setTheme } = useTheme();
  const shouldReduce = useReducedMotion();

  // Use useSyncExternalStore for client-only detection (avoids setState-in-effect lint)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const activeSection = useScrollSpy(navItems.map((n) => n.id));

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleTheme = useCallback(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) {
      document.documentElement.classList.add('theme-transition');
    }
    const currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setTheme(currentTheme === "dark" ? "light" : "dark");
    if (!prefersReduced) {
      const cleanup = () => {
        document.documentElement.classList.remove('theme-transition');
        document.documentElement.removeEventListener('transitionend', cleanup);
      };
      document.documentElement.addEventListener('transitionend', cleanup);
      setTimeout(cleanup, 400);
    }
  }, [setTheme]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Scroll Progress Bar */}
      <motion.div
        className="scroll-progress"
        style={{ scaleX }}
      />

      {/* Editorial Masthead Navigation */}
      <nav
        className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border"
        aria-label="Main navigation"
      >
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-12">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-5 h-5 bg-primary flex items-center justify-center"
              aria-hidden="true"
              whileHover={shouldReduce ? undefined : { scale: 1.1 }}
              whileTap={shouldReduce ? undefined : { scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <span className="text-[8px] font-bold text-primary-foreground leading-none">SP</span>
            </motion.div>
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-foreground hidden sm:block">
              Skill Stack Architecture
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-5" aria-label="Section navigation">
            {navItems.map((item) => (
              <motion.a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(item.id);
                }}
                className={`text-[10px] tracking-[0.12em] uppercase font-medium cursor-pointer min-h-[44px] flex items-center relative ${
                  activeSection === item.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-current={activeSection === item.id ? "true" : undefined}
                whileHover={shouldReduce ? undefined : hoverNavItem.whileHover}
                transition={hoverNavItem.transition}
              >
                <span className="text-primary/50 mr-0.5">{item.num}</span>
                {item.label}
                {/* Active indicator line */}
                {activeSection === item.id && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    layoutId="activeNav"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            {mounted && (
              <motion.button
                onClick={toggleTheme}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md hover:bg-muted cursor-pointer"
                aria-label="Toggle dark mode"
                whileHover={shouldReduce ? undefined : { scale: 1.1 }}
                whileTap={shouldReduce ? undefined : { scale: 0.9 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <Sun className="w-4 h-4 text-foreground hidden dark:block" />
                <Moon className="w-4 h-4 text-foreground block dark:hidden" />
              </motion.button>
            )}

            {/* Mobile Hamburger */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              whileHover={shouldReduce ? undefined : { scale: 1.05 }}
              whileTap={shouldReduce ? undefined : { scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-foreground" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-border bg-background overflow-hidden"
            >
              <div className="max-w-[1200px] mx-auto px-6 py-4 space-y-1">
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={`block w-full text-left min-h-[44px] py-2 text-sm tracking-[0.1em] uppercase font-medium cursor-pointer transition-colors ${
                      activeSection === item.id
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    initial={shouldReduce ? false : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                  >
                    <span className="text-primary/60 mr-2">{item.num}</span>
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main id="main-content" className="flex-1 section-below-fold">
        {/* Hero / Masthead */}
        <HeroSection />

        <EditorialDivider thick />

        {/* Executive Summary — Editorial Lead */}
        <motion.section
          className="py-16 md:py-24 px-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          aria-label="Architecture overview"
        >
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
                  ].map((t) => (
                    <motion.div
                      key={t.tier}
                      className="group"
                      whileHover={shouldReduce ? undefined : { scale: 1.02 }}
                      whileTap={shouldReduce ? undefined : { scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
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
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <EditorialDivider />

        {/* 01 — Skill Reference */}
        <SkillReference />
        <EditorialDivider />

        {/* 12 — KDI Skill Marketplace */}
        <SkillMarketplace />
        <EditorialDivider />

        {/* 02 — Design Algorithm */}
        <DesignAlgorithm />
        <EditorialDivider />

        {/* 03 — Options Showcase */}
        <OptionsShowcase />
        <EditorialDivider />

        {/* 04 — Comparative Analysis */}
        <ComparativeAnalysis />
        <EditorialDivider />

        {/* 05 — Heatmap */}
        <HeatmapViz />
        <EditorialDivider />

        {/* 06 — Implementation Blueprint */}
        <ImplementationBlueprint />
        <EditorialDivider />

        {/* 07 — AI Portal Gateway */}
        <AIPortalGateway />
        <EditorialDivider />

        {/* 08 — Tier Architecture */}
        <TierArchitecture />
        <EditorialDivider />

        {/* 09 — Decision Tree */}
        <DecisionTree />
        <EditorialDivider />

        {/* 10 — Section-to-Skill Mapping */}
        <SectionMapping />
        <EditorialDivider />

        {/* 11 — Visual Asset Gallery */}
        <VisualGallery />
      </main>

      {/* Editorial Footer — Colophon */}
      <footer className="border-t-2 border-foreground py-12 px-6 bg-background mt-auto" role="contentinfo">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 bg-primary flex items-center justify-center" aria-hidden="true">
                  <span className="text-[8px] font-bold text-primary-foreground leading-none">SP</span>
                </div>
                <span className="text-xs font-medium tracking-[0.2em] uppercase text-foreground">
                  Skill Stack Architecture
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A design algorithm for interactive web skill stack architecture.
                16 Skills &middot; 4 Tiers &middot; 5 Options &middot; SP-7 Dimensions &middot; 11 Sections.
              </p>
            </div>
            <div className="md:col-span-4">
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium mb-3">
                Stack Summary
              </p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>T0: Stitch Design, Framer Motion, UI/UX Pro Max, 21st.dev</p>
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

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 min-w-[44px] min-h-[44px] bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 cursor-pointer"
            aria-label="Scroll back to top"
            whileHover={shouldReduce ? undefined : { scale: 1.1 }}
            whileTap={shouldReduce ? undefined : { scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
