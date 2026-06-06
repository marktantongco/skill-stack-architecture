"use client";

import { motion } from "framer-motion";
import { skills } from "@/lib/skill-data";

const tierNames: Record<number, string> = { 0: "Foundation", 1: "Interactive", 2: "Visual Asset", 3: "Portal" };
const tierAccents: Record<number, string> = {
  0: "text-primary",
  1: "text-accent",
  2: "text-chart-4",
  3: "text-chart-3",
};

export function ImplementationBlueprint() {
  return (
    <section id="implementation" className="py-20 md:py-28 px-6 bg-muted/15">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-14">
          <div className="md:col-span-8">
            <div className="flex items-baseline gap-4 mb-3">
              <span className="font-['Georgia',_serif] text-5xl md:text-6xl font-bold text-border leading-none">06</span>
              <h2 className="font-['Georgia',_serif] text-2xl md:text-3xl font-bold text-foreground leading-tight">
                Implementation Blueprint
              </h2>
            </div>
            <div className="editorial-pullquote ml-0 md:ml-20">
              Install all 16 skills in dependency order — Tier 0 through Tier 3. Each tier builds on the previous layer.
            </div>
          </div>
        </div>

        <hr className="editorial-rule-thick mb-10" />

        {/* Installation Sequence — Editorial Tiers */}
        <div className="space-y-0 mb-14">
          {[0, 1, 2, 3].map(tier => (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: tier * 0.06 }}
              className="border-t border-foreground/80 last:border-b last:border-foreground/80"
            >
              {/* Tier Header */}
              <div className="flex items-baseline justify-between py-4 px-1">
                <div className="flex items-baseline gap-3">
                  <span className={`font-['Georgia',_serif] text-2xl font-bold ${tierAccents[tier]} opacity-50`}>
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
                  <div
                    key={skill.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center py-3 px-1 hover:bg-muted/20 transition-colors"
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
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Full Install Script — Code Block */}
        <div className="border border-border rounded overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b-2 border-foreground bg-muted/10">
            <span className="text-[11px] tracking-[0.15em] uppercase font-semibold text-foreground">
              install-all-skills.sh
            </span>
            <button
              onClick={() => {
                const script = skills.map(s => s.installCommand).join("\n");
                navigator.clipboard.writeText(script);
              }}
              className="text-[10px] tracking-[0.15em] uppercase text-primary hover:text-foreground transition-colors font-medium"
            >
              Copy All
            </button>
          </div>
          <pre className="p-5 text-xs font-mono text-muted-foreground overflow-x-auto leading-relaxed bg-card">
            <code>{`#!/bin/bash
# design-portal-skills installer — Complete 16-skill stack
# Usage: bash install-all-skills.sh

echo "=== Tier 0: Foundation Layer ==="
npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max
npx @21st-dev/registry install-skill --global
npx skills add https://www.skills.sh/google-labs-code/stitch-skills/stitch-loop
npx skills add https://github.com/patricio0312rev/skills --skill framer-motion-animator

echo "=== Tier 1: Interactive Layer ==="
npx skills add greensock/gsap-skills
npx skills add remotion-dev/skills
npx skills add softaworks/agent-toolkit --skill mermaid-diagrams
npx skills add antvis/chart-visualization-skills

echo "=== Tier 2: Visual Asset Layer ==="
npx skills add skills-shell/skills --skill ai-image-generation
npx skills add shadcn-ui/ui --skill shadcn
npx skills add testdino-hq/playwright-skill
npx skills add antvis/chart-visualization-skills --skill d3-viz

echo "=== Tier 3: Portal Layer (Custom) ==="
ORG_URL=https://github.com/<your-org>/design-portal-skills
npx skills add $ORG_URL --skill ai-portal-redirect
npx skills add $ORG_URL --skill stack-prioritizer
npx skills add $ORG_URL --skill matrix-engine
npx skills add $ORG_URL --skill design-algorithm

echo "=== All 16 skills installed ==="`}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
