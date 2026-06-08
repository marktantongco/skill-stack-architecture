"use client";

import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animation-variants";
import { skills } from "@/lib/skill-data";
import { useState, useCallback } from "react";
import { copyToClipboard } from "@/lib/clipboard";

const tierNames: Record<number, string> = { 0: "Foundation", 1: "Interactive", 2: "Visual Asset", 3: "Portal" };
const tierAccents: Record<number, string> = {
  0: "text-primary",
  1: "text-accent",
  2: "text-chart-4",
  3: "text-chart-3",
};

export function ImplementationBlueprint() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const shouldReduce = useReducedMotion();
  const noMotion = shouldReduce ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } } : null;

  const handleCopyAll = useCallback(async () => {
    const script = skills.map(s => s.installCommand).join("\n");
    const success = await copyToClipboard(script);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  }, []);

  return (
    <section id="implementation" className="py-20 md:py-28 px-6 bg-muted/15" aria-label="Implementation Blueprint">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-14"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="md:col-span-8">
            <div className="flex items-baseline gap-4 mb-3">
              <span className="font-['Georgia',_serif] text-5xl md:text-6xl font-bold text-border leading-none" aria-hidden="true">06</span>
              <h2 className="font-['Georgia',_serif] text-2xl md:text-3xl font-bold text-foreground leading-tight">
                Implementation Blueprint
              </h2>
            </div>
            <div className="editorial-pullquote ml-0 md:ml-20">
              Install all 16 skills in dependency order — Tier 0 through Tier 3. Each tier builds on the previous layer.
            </div>
          </div>
        </motion.div>

        <hr className="editorial-rule-thick mb-10" />

        {/* Installation Sequence — Editorial Tiers */}
        <motion.div
          className="space-y-0 mb-14"
          variants={noMotion || staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {[0, 1, 2, 3].map(tier => (
            <motion.div
              key={tier}
              variants={noMotion || fadeInUp}
              className="border-t border-foreground/80 last:border-b last:border-foreground/80"
            >
              {/* Tier Header */}
              <div className="flex items-baseline justify-between py-4 px-1">
                <div className="flex items-baseline gap-3">
                  <span className={`font-['Georgia',_serif] text-2xl font-bold ${tierAccents[tier]} opacity-50`} aria-hidden="true">
                    T{tier}
                  </span>
                  <h3 className="font-['Georgia',_serif] text-lg font-bold text-foreground">
                    {tierNames[tier]}
                  </h3>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {skills.filter(s => s.tier === tier).length} skills
                </span>
              </div>

              {/* Skills in Tier */}
              <div className="divide-y divide-border/40">
                {skills.filter(s => s.tier === tier).map(skill => (
                  <motion.div
                    key={skill.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center py-3 px-1 hover:bg-muted/20 transition-colors"
                    whileHover={shouldReduce ? undefined : { x: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <div className="md:col-span-1">
                      <span className="text-xs font-mono text-muted-foreground">{skill.id}</span>
                    </div>
                    <div className="md:col-span-3">
                      <span className="text-sm font-medium text-foreground">{skill.name}</span>
                    </div>
                    <div className="md:col-span-8">
                      <code className="text-[11px] text-muted-foreground font-mono block truncate">
                        {skill.installCommand}
                      </code>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Full Install Script — Code Block */}
        <motion.div
          className="border border-border rounded overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b-2 border-foreground bg-muted/10">
            <span className="text-[11px] tracking-[0.15em] uppercase font-semibold text-foreground">
              install-all-skills.sh
            </span>
            <button
              onClick={handleCopyAll}
              className="min-h-[44px] text-[10px] tracking-[0.15em] uppercase text-primary hover:text-foreground transition-colors font-medium cursor-pointer"
              aria-label="Copy all install commands"
            >
              {copied ? "Copied ✓" : copyError ? "Failed" : "Copy All"}
            </button>
          </div>
          <pre className="p-5 text-xs font-mono text-muted-foreground overflow-x-auto leading-relaxed bg-card custom-scrollbar">
            <code>{`#!/bin/bash
# design-portal-skills installer — Complete 16-skill stack
# Usage: bash install-all-skills.sh

echo "=== Tier 0: Foundation Layer ==="
npx skills add google-labs-code/stitch-skills --skill stitch-design
npx skills add patricio0312rev/skills --skill framer-motion-animator
npx skills add nextlevelbuilder/ui-ux-pro-max-skill
npx skills add 21st-dev/registry

echo "=== Tier 1: Interactive Layer ==="
npx skills add greensock/gsap-skills
npx skills add remotion-dev/skills
npx skills add softaworks/agent-toolkit --skill mermaid-diagrams
npx skills add antvis/chart-visualization-skills

echo "=== Tier 2: Visual Asset Layer ==="
npx skills add inference-sh/skills --skill ai-image-generation
npx skills add shadcn-ui/ui --skill shadcn
npx skills add testdino-hq/playwright-skill
npx skills add antvis/chart-visualization-skills --skill chart-visualization

echo "=== Tier 3: Portal Layer (Custom) ==="
ORG_URL=https://github.com/marktantongco/skill-stack-architecture
npx skills add $ORG_URL --skill ai-portal-redirect
npx skills add $ORG_URL --skill stack-prioritizer
npx skills add $ORG_URL --skill matrix-engine
npx skills add $ORG_URL --skill design-algorithm

echo "=== All 16 skills installed ==="`}</code>
          </pre>
        </motion.div>

        {copyError && (
          <div className="mt-4 p-2 bg-destructive/10 border border-destructive/30 rounded text-sm text-destructive" role="alert">
            Failed to copy to clipboard. Please try again.
          </div>
        )}
      </div>
    </section>
  );
}
