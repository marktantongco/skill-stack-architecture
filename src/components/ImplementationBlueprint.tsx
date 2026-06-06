"use client";

import { motion } from "framer-motion";
import { skills } from "@/lib/skill-data";

const tierNames: Record<number, string> = { 0: "Foundation", 1: "Interactive", 2: "Visual Asset", 3: "Portal" };
const tierColors: Record<number, string> = {
  0: "border-amber-500/40 bg-amber-500/5",
  1: "border-emerald-500/40 bg-emerald-500/5",
  2: "border-sky-500/40 bg-sky-500/5",
  3: "border-fuchsia-500/40 bg-fuchsia-500/5",
};
const tierAccents: Record<number, string> = {
  0: "text-amber-400",
  1: "text-emerald-400",
  2: "text-sky-400",
  3: "text-fuchsia-400",
};

export function ImplementationBlueprint() {
  return (
    <section id="implementation" className="py-20 px-4 bg-muted/5">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Implementation Blueprint</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Install all 16 skills in dependency order — Tier 0 through Tier 3
          </p>
        </motion.div>

        {/* Installation Sequence */}
        <div className="space-y-6 mb-12">
          {[0, 1, 2, 3].map(tier => (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: tier * 0.1 }}
              className={`border rounded-2xl p-6 ${tierColors[tier]}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center">
                  <span className={`text-sm font-bold ${tierAccents[tier]}`}>T{tier}</span>
                </div>
                <div>
                  <h3 className={`font-semibold ${tierAccents[tier]}`}>Tier {tier}: {tierNames[tier]}</h3>
                  <p className="text-sm text-muted-foreground">{skills.filter(s => s.tier === tier).length} skills</p>
                </div>
              </div>
              <div className="space-y-2">
                {skills.filter(s => s.tier === tier).map(skill => (
                  <div key={skill.id} className="flex items-center gap-3 bg-card/50 rounded-lg px-4 py-2">
                    <span className="text-xs font-mono text-muted-foreground w-8">{skill.id}</span>
                    <span className="text-sm text-foreground flex-1">{skill.name}</span>
                    <code className="text-[11px] text-muted-foreground font-mono hidden md:block max-w-md truncate">
                      {skill.installCommand}
                    </code>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Full Install Script */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border border-border rounded-2xl overflow-hidden bg-card"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
            <span className="text-sm font-medium text-foreground">install-all-skills.sh</span>
            <button
              onClick={() => {
                const script = skills.map(s => s.installCommand).join("\n");
                navigator.clipboard.writeText(script);
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Copy All
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-muted-foreground overflow-x-auto leading-relaxed">
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
        </motion.div>
      </div>
    </section>
  );
}
