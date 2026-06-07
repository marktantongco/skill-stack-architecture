"use client";

import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animation-variants";
import { skills } from "@/lib/skill-data";
import { useState, useCallback } from "react";
import { copyToClipboard } from "@/lib/clipboard";

const tierAccents: Record<number, string> = {
  0: "text-primary",
  1: "text-accent",
  2: "text-chart-4",
  3: "text-chart-3",
};

const tierDots: Record<number, string> = {
  0: "bg-primary",
  1: "bg-accent",
  2: "bg-chart-4",
  3: "bg-chart-3",
};

const tierNames: Record<number, string> = {
  0: "Foundation",
  1: "Interactive",
  2: "Visual Asset",
  3: "Portal",
};

export function SkillReference() {
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const filtered = selectedTier !== null ? skills.filter(s => s.tier === selectedTier) : skills;
  const shouldReduce = useReducedMotion();
  const noMotion = shouldReduce ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } } : null;

  const handleCopy = useCallback(async (id: string, cmd: string) => {
    setCopyError(null);
    const success = await copyToClipboard(cmd);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      setCopyError(id);
      setTimeout(() => setCopyError(null), 3000);
    }
  }, []);

  return (
    <section id="skill-reference" className="py-20 md:py-28 px-6" aria-label="Master Skill Registry">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header — 2-column editorial */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-14"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="md:col-span-8">
            <div className="flex items-baseline gap-4 mb-3">
              <span className="font-['Georgia',_serif] text-5xl md:text-6xl font-bold text-border leading-none" aria-hidden="true">01</span>
              <h2 className="font-['Georgia',_serif] text-2xl md:text-3xl font-bold text-foreground leading-tight">
                Master Skill Registry
              </h2>
            </div>
            <div className="editorial-pullquote ml-0 md:ml-20">
              16 skills across 4 tiers — every item installable via{" "}
              <code className="text-xs font-mono text-primary bg-muted px-1.5 py-0.5 not-italic">npx skills add</code>.
              The foundation of the entire architecture.
            </div>
          </div>
          <div className="md:col-span-4 flex items-end justify-end">
            <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
              16 Items &middot; 4 Tiers &middot; Dependency-Ordered
            </p>
          </div>
        </motion.div>

        <hr className="editorial-rule-thick mb-8" />

        {/* Tier Filter Tabs — Underline editorial style */}
        <div className="flex flex-wrap gap-0 mb-10 border-b border-border" role="tablist" aria-label="Filter by tier">
          <button
            onClick={() => setSelectedTier(null)}
            role="tab"
            aria-selected={selectedTier === null}
            className={`min-h-[44px] px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase font-medium transition-all border-b-2 -mb-px cursor-pointer ${
              selectedTier === null
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            All <span className="ml-1 opacity-40">{skills.length}</span>
          </button>
          {[0, 1, 2, 3].map(t => (
            <button
              key={t}
              onClick={() => setSelectedTier(t)}
              role="tab"
              aria-selected={selectedTier === t}
              className={`min-h-[44px] px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase font-medium transition-all border-b-2 -mb-px cursor-pointer ${
                selectedTier === t
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${tierDots[t]}`} aria-hidden="true" />
              T{t} {tierNames[t]} <span className="ml-1 opacity-40">{skills.filter(s => s.tier === t).length}</span>
            </button>
          ))}
        </div>

        {/* Copy Error */}
        {copyError && (
          <div className="mb-4 p-2 bg-destructive/10 border border-destructive/30 rounded text-sm text-destructive" role="alert">
            Failed to copy to clipboard. Please try again.
          </div>
        )}

        {/* Skill Rows — Editorial table */}
        <motion.div
          className="divide-y divide-border/60"
          variants={noMotion || staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {filtered.map((skill) => (
            <motion.div
              key={skill.id}
              variants={noMotion || fadeInUp}
              whileHover={shouldReduce ? undefined : { scale: 1.005, backgroundColor: "var(--muted)" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="group py-4 -mx-2 px-2 rounded"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                {/* ID + Tier dot + Name */}
                <div className="md:col-span-4 flex items-center gap-2.5">
                  <span className={`text-[10px] font-mono ${tierAccents[skill.tier]} font-bold`}>{skill.id}</span>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tierDots[skill.tier]}`} aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-foreground">{skill.name}</h3>
                </div>

                {/* Description */}
                <div className="md:col-span-4">
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{skill.primaryRole}</p>
                </div>

                {/* Install Command */}
                <div className="md:col-span-4">
                  <button
                    onClick={() => handleCopy(skill.id, skill.installCommand)}
                    className="w-full text-left min-h-[44px] bg-muted/40 border border-transparent hover:border-border rounded px-3 py-1.5 font-mono text-[11px] text-muted-foreground hover:bg-muted transition-colors flex items-center justify-between group/cmd cursor-pointer"
                    aria-label={`Copy install command for ${skill.name}`}
                  >
                    <span className="truncate mr-2">{skill.installCommand}</span>
                    <span className="shrink-0 text-[10px] opacity-0 group-hover/cmd:opacity-100 transition-opacity text-primary">
                      {copiedId === skill.id ? "Copied ✓" : "Copy"}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
