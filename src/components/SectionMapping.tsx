"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animation-variants";
import { useState } from "react";

interface SectionMap {
  id: string;
  name: string;
  dominantSkill: string;
  dominantSkillId: string;
  sp7Vector: number[];
  sp7Score: number;
  description: string;
  visualAsset: string;
}

const sectionMappings: SectionMap[] = [
  { id: "sec01", name: "Hero / Masthead", dominantSkill: "Stitch Loop", dominantSkillId: "S01", sp7Vector: [5, 3, 1, 5, 2, 3, 2], sp7Score: 24.5, description: "Full-viewport immersive entry with animated gradient, floating skill badges, and progressive reveal. Stitch Loop generates the initial layout, GSAP drives scroll animations.", visualAsset: "AI-generated hero image, animated gradient overlay" },
  { id: "sec02", name: "Executive Summary", dominantSkill: "UI/UX Pro Max", dominantSkillId: "S03", sp7Vector: [3, 3, 2, 2, 4, 3, 4], sp7Score: 17.7, description: "Two-column editorial lead with pull quote and tier summary sidebar. UI/UX Pro Max governs the typography system and spacing scale.", visualAsset: "Pull quote typography, tier summary cards" },
  { id: "sec03", name: "Skill Registry", dominantSkill: "shadcn/ui", dominantSkillId: "S10", sp7Vector: [2, 4, 4, 1, 3, 2, 5], sp7Score: 18.0, description: "Interactive filterable table of all 16 skills with copy-to-clipboard install commands. shadcn/ui provides the table and filter components.", visualAsset: "Sortable table, filter pills, copy buttons" },
  { id: "sec04", name: "SP-7 Algorithm", dominantSkill: "Design Algorithm", dominantSkillId: "S16", sp7Vector: [2, 5, 5, 2, 2, 4, 3], sp7Score: 22.5, description: "Interactive weight sliders that recalculate prioritized results in real-time. The custom Design Algorithm skill drives the scoring engine.", visualAsset: "Slider controls, animated result bars, score badges" },
  { id: "sec05", name: "Design Option 1", dominantSkill: "Stitch Loop", dominantSkillId: "S01", sp7Vector: [5, 4, 3, 5, 2, 3, 3], sp7Score: 27.0, description: "The Autopoietic Canvas — self-evolving design with iterative generation. AI Image Gen creates visual assets, GSAP adds scroll animations.", visualAsset: "AI-generated concept image, SP-7 bar chart, skill weights" },
  { id: "sec06", name: "Design Option 2", dominantSkill: "Framer Motion", dominantSkillId: "S02", sp7Vector: [5, 5, 3, 5, 2, 3, 3], sp7Score: 28.5, description: "Kinetic Spatial — motion-first design language. Framer Motion creates choreographed animations, Remotion generates demo video.", visualAsset: "Motion demo, AI-generated hero, SP-7 profile" },
  { id: "sec07", name: "Design Option 3", dominantSkill: "UI/UX Pro Max", dominantSkillId: "S03", sp7Vector: [3, 3, 2, 2, 4, 3, 4], sp7Score: 17.7, description: "Chromatic Minimal — precision through restraint. Minimal animation, strict typography, two-color system.", visualAsset: "Minimalist layout demo, strict grid visualization" },
  { id: "sec08", name: "Design Option 4", dominantSkill: "21st.dev Registry", dominantSkillId: "S04", sp7Vector: [5, 4, 3, 5, 2, 3, 3], sp7Score: 27.0, description: "Glass Depth — architectural layered surfaces. 21st.dev provides glass-morphism components, Framer Motion adds parallax.", visualAsset: "Glassmorphism mockup, depth layer diagram" },
  { id: "sec09", name: "Design Option 5", dominantSkill: "UI/UX Pro Max + FM", dominantSkillId: "S03+S02", sp7Vector: [4, 4, 3, 4, 3, 3, 3], sp7Score: 23.5, description: "Neo-Industrial — raw structural power. Monospace typography, mechanical animations, safety-color accents.", visualAsset: "Brutalist layout demo, industrial schematic" },
  { id: "sec10", name: "Comparative Analysis", dominantSkill: "Matrix Engine", dominantSkillId: "S15", sp7Vector: [4, 5, 5, 2, 2, 3, 4], sp7Score: 24.5, description: "Radar chart overlay and matrix table with option toggles. AntV and the custom Matrix Engine drive the comparative visualization.", visualAsset: "Radar chart, comparative matrix table, toggle filters" },
  { id: "sec11", name: "Implementation Blueprint", dominantSkill: "shadcn/ui + Mermaid", dominantSkillId: "S10+S07", sp7Vector: [3, 3, 4, 1, 3, 2, 4], sp7Score: 18.5, description: "Tier-by-tier install sequence with full bash script. Mermaid renders the dependency graph, shadcn/ui provides the code block.", visualAsset: "Dependency graph diagram, code block with syntax" },
  { id: "sec12", name: "AI Portal Gateway", dominantSkill: "AI Portal Redirect", dominantSkillId: "S13", sp7Vector: [2, 4, 3, 1, 3, 5, 3], sp7Score: 21.0, description: "Intent classification search with keyword routing table. The custom AI Portal Redirect skill drives the routing engine.", visualAsset: "Search interface, routing table, confidence bars" },
];

const dimShort = ["VD", "IR", "DC", "MN", "AW", "AR", "CR"];

export function SectionMapping() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const shouldReduce = useReducedMotion();
  const noMotion = shouldReduce ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } } : null;

  return (
    <section id="section-mapping" className="py-20 md:py-28 px-6 bg-muted/15" aria-label="Section-to-Skill Mapping">
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
              <span className="font-['Georgia',_serif] text-5xl md:text-6xl font-bold text-border leading-none" aria-hidden="true">10</span>
              <h2 className="font-['Georgia',_serif] text-2xl md:text-3xl font-bold text-foreground leading-tight">
                Section-to-Skill Mapping
              </h2>
            </div>
            <div className="editorial-pullquote ml-0 md:ml-20">
              12 sections, each mapped to its dominant skill and scored across 7 SP-7 dimensions. Every section is also an installable skill.
            </div>
          </div>
        </motion.div>

        <hr className="editorial-rule-thick mb-10" />

        {/* Section Mapping Table */}
        <motion.div
          className="space-y-0 divide-y divide-border"
          variants={noMotion || staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {sectionMappings.map((sec) => {
            const isExpanded = expandedSection === sec.id;
            return (
              <motion.div
                key={sec.id}
                variants={noMotion || fadeInUp}
                className="group"
              >
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : sec.id)}
                  className="w-full text-left min-h-[44px] py-4 hover:bg-muted/10 transition-colors -mx-2 px-2 cursor-pointer"
                  aria-expanded={isExpanded}
                  aria-controls={`mapping-${sec.id}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-baseline">
                    <div className="md:col-span-1">
                      <span className="font-['Georgia',_serif] text-sm font-bold text-border group-hover:text-primary transition-colors" aria-hidden="true">
                        {sec.id.replace("sec", "")}
                      </span>
                    </div>
                    <div className="md:col-span-3">
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {sec.name}
                      </span>
                    </div>
                    <div className="md:col-span-3">
                      <span className="text-[11px] text-primary font-medium">{sec.dominantSkill}</span>
                    </div>
                    <div className="md:col-span-4">
                      <div className="flex gap-1">
                        {sec.sp7Vector.map((v, j) => (
                          <div key={j} className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary/50 rounded-full"
                              style={{ width: `${(v / 5) * 100}%` }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-1 text-right">
                      <span className="text-sm font-mono font-bold text-primary">{sec.sp7Score}</span>
                    </div>
                  </div>
                </button>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      id={`mapping-${sec.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pb-5 ml-0 md:ml-8"
                      role="region"
                      aria-label={`${sec.name} details`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-l-2 border-primary pl-5">
                        <div>
                          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mb-2">Description</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{sec.description}</p>
                        </div>
                        <div>
                          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mb-2">Visual Assets</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{sec.visualAsset}</p>
                          <div className="mt-3 grid grid-cols-7 gap-1.5">
                            {sec.sp7Vector.map((v, j) => (
                              <div key={j} className="text-center">
                                <div className="h-8 bg-muted border border-border rounded flex items-center justify-center">
                                  <span className="text-xs font-bold text-foreground">{v}</span>
                                </div>
                                <span className="text-[8px] text-muted-foreground mt-0.5 block">{dimShort[j]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
