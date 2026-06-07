"use client";

import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animation-variants";
import { skills } from "@/lib/skill-data";

const tierData = [
  {
    tier: 0,
    name: "Foundation",
    tagline: "Design Intelligence Layer",
    color: "bg-primary",
    textColor: "text-primary",
    borderColor: "border-primary/40",
    bgColor: "bg-primary/5",
    description: "Core design skills that provide the creative and technical foundation. These skills generate UI, govern style, create animations, and supply component libraries.",
    dependency: "No dependencies — install first",
  },
  {
    tier: 1,
    name: "Interactive",
    tagline: "Motion & Data Layer",
    color: "bg-accent",
    textColor: "text-accent",
    borderColor: "border-accent/40",
    bgColor: "bg-accent/5",
    description: "Skills that add interactivity, motion sequences, schematic diagrams, and data visualizations. They build on Foundation components to create engaging, data-rich sections.",
    dependency: "Depends on Tier 0",
  },
  {
    tier: 2,
    name: "Visual Asset",
    tagline: "Generation & Capture Layer",
    color: "bg-chart-4",
    textColor: "text-chart-4",
    borderColor: "border-chart-4/40",
    bgColor: "bg-chart-4/5",
    description: "Skills for generating images, scaffolding UI components, capturing visual regression screenshots, and building custom interactive visualizations beyond standard charts.",
    dependency: "Depends on Tiers 0-1",
  },
  {
    tier: 3,
    name: "Portal",
    tagline: "Custom Intelligence Layer",
    color: "bg-chart-3",
    textColor: "text-chart-3",
    borderColor: "border-chart-3/40",
    bgColor: "bg-chart-3/5",
    description: "Custom-built skills specific to this architecture: AI portal redirect, stack prioritization algorithm, comparative matrix engine, and the design algorithm itself.",
    dependency: "Depends on Tiers 0-2",
  },
];

export function TierArchitecture() {
  const shouldReduce = useReducedMotion();
  const noMotion = shouldReduce ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } } : null;

  return (
    <section id="tier-architecture" className="py-20 md:py-28 px-6 bg-muted/15" aria-label="Tier Architecture">
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
              <span className="font-['Georgia',_serif] text-5xl md:text-6xl font-bold text-border leading-none" aria-hidden="true">08</span>
              <h2 className="font-['Georgia',_serif] text-2xl md:text-3xl font-bold text-foreground leading-tight">
                Tier Architecture
              </h2>
            </div>
            <div className="editorial-pullquote ml-0 md:ml-20">
              Four dependency layers, each building on the previous. Install in strict T0→T3 order — no tier can function without its predecessors.
            </div>
          </div>
        </motion.div>

        <hr className="editorial-rule-thick mb-10" />

        {/* Architecture Schematic */}
        <div className="relative">
          {/* Vertical dependency line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border hidden md:block" aria-hidden="true" />

          <motion.div
            variants={noMotion || staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {tierData.map((tier, i) => {
              const tierSkills = skills.filter(s => s.tier === tier.tier);
              return (
                <motion.div
                  key={tier.tier}
                  variants={noMotion || fadeInUp}
                  whileHover={shouldReduce ? undefined : { scale: 1.005 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="mb-8 last:mb-0"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                    {/* Left — Tier Info */}
                    <div className="md:col-span-5 md:text-right md:pr-8">
                      <div className={`${tier.bgColor} border ${tier.borderColor} rounded p-5 card-container`}>
                        <div className="flex items-baseline gap-2 md:justify-end mb-2">
                          <span className={`font-['Georgia',_serif] text-2xl font-bold ${tier.textColor}`} aria-hidden="true">T{tier.tier}</span>
                          <h3 className="font-['Georgia',_serif] text-lg font-bold text-foreground">{tier.name}</h3>
                        </div>
                        <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium mb-2">
                          {tier.tagline}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{tier.description}</p>
                        <p className="text-[10px] tracking-[0.12em] uppercase text-muted-foreground/60 mt-3 font-mono">
                          {tier.dependency}
                        </p>
                      </div>
                    </div>

                    {/* Center — Connector dot */}
                    <div className="hidden md:flex md:col-span-2 items-center justify-center">
                      <div className={`w-8 h-8 rounded-full ${tier.color} flex items-center justify-center z-10`} aria-hidden="true">
                        <span className="text-[10px] font-bold text-white">{tier.tier}</span>
                      </div>
                    </div>

                    {/* Right — Skills List */}
                    <div className="md:col-span-5 md:pl-8">
                      <div className="space-y-0 divide-y divide-border/40 border border-border rounded overflow-hidden">
                        {tierSkills.map(skill => (
                          <motion.div
                            key={skill.id}
                            className="flex items-center gap-2 px-3 py-2.5 hover:bg-muted/20"
                            whileHover={shouldReduce ? undefined : { x: 2 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          >
                            <span className={`text-[10px] font-mono ${tier.textColor} font-bold w-7`}>{skill.id}</span>
                            <span className="text-sm text-foreground font-medium flex-1">{skill.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono hidden sm:block truncate max-w-[180px]">
                              {skill.installCommand.split('--skill ')[1] || skill.installCommand.split('/').slice(-1)[0]}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Data Flow Annotation */}
        <motion.div
          className="mt-10 border-t border-border pt-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <motion.div whileHover={shouldReduce ? undefined : { scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              <p className="font-['Georgia',_serif] text-2xl font-bold text-primary">4</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">Dependency Layers</p>
            </motion.div>
            <motion.div whileHover={shouldReduce ? undefined : { scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              <p className="font-['Georgia',_serif] text-2xl font-bold text-foreground">16</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">Installable Skills</p>
            </motion.div>
            <motion.div whileHover={shouldReduce ? undefined : { scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              <p className="font-['Georgia',_serif] text-2xl font-bold text-chart-3">T0→T3</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">Strict Install Order</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
