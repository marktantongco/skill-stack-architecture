"use client";

import { HeroSection } from "@/components/HeroSection";
import { SkillReference } from "@/components/SkillReference";
import { DesignAlgorithm } from "@/components/DesignAlgorithm";
import { OptionsShowcase } from "@/components/OptionsShowcase";
import { ComparativeAnalysis } from "@/components/ComparativeAnalysis";
import { HeatmapViz } from "@/components/HeatmapViz";
import { ImplementationBlueprint } from "@/components/ImplementationBlueprint";
import { AIPortalGateway } from "@/components/AIPortalGateway";
import { motion } from "framer-motion";
import { useState } from "react";

const navItems = [
  { id: "skill-reference", label: "Skills" },
  { id: "algorithm", label: "Algorithm" },
  { id: "options", label: "Options" },
  { id: "comparative", label: "Compare" },
  { id: "heatmap", label: "Heatmap" },
  { id: "implementation", label: "Install" },
  { id: "portal", label: "AI Portal" },
];

export default function Home() {
  const [activeNav, setActiveNav] = useState("");

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#667eea] flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">SP</span>
            </div>
            <span className="text-sm font-semibold hidden sm:block">Skill Stack Architecture</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <HeroSection />

      {/* Executive Summary */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Architecture Overview</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              This interactive web experience translates the Prompt Redesign Options document into a living,
              navigable architecture. It serves three simultaneous purposes: a build specification that any AI agent
              can follow, a self-referencing portal that AI agents can redirect to for design guidance, and a
              publishable GitHub repository where every component is also an installable skill.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { tier: "T0", name: "Foundation", count: 4, desc: "Design intelligence, generation, animation, components", color: "border-amber-500/30 bg-amber-500/5" },
              { tier: "T1", name: "Interactive", count: 4, desc: "Scroll animation, video, diagrams, data viz", color: "border-emerald-500/30 bg-emerald-500/5" },
              { tier: "T2", name: "Visual Asset", count: 4, desc: "Image gen, component styling, testing, custom viz", color: "border-sky-500/30 bg-sky-500/5" },
              { tier: "T3", name: "Portal", count: 4, desc: "AI redirect, prioritization, matrix, algorithm", color: "border-fuchsia-500/30 bg-fuchsia-500/5" },
            ].map(t => (
              <div key={t.tier} className={`border rounded-xl p-4 text-center ${t.color}`}>
                <div className="text-2xl font-bold text-foreground">{t.count}</div>
                <div className="text-sm font-medium text-foreground">{t.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{t.desc}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Skill Reference */}
      <SkillReference />

      {/* Design Algorithm */}
      <DesignAlgorithm />

      {/* Options Showcase */}
      <OptionsShowcase />

      {/* Comparative Analysis */}
      <ComparativeAnalysis />

      {/* Heatmap */}
      <HeatmapViz />

      {/* Implementation Blueprint */}
      <ImplementationBlueprint />

      {/* AI Portal Gateway */}
      <AIPortalGateway />

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 bg-muted/5">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#D4AF37] to-[#667eea] flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">SP</span>
            </div>
            <span className="text-sm font-semibold text-foreground">Skill Stack Architecture Blueprint</span>
          </div>
          <p className="text-xs text-muted-foreground">
            16 Skills | 4 Tiers | 5 Design Options | SP-7 Algorithm | AI Portal Gateway
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Every item installable via <code className="text-[#D4AF37]/70">npx skills add</code> | GitHub Staging Ready
          </p>
        </div>
      </footer>
    </div>
  );
}
