"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animation-variants";
import { options, type DesignOption } from "@/lib/skill-data";
import { useState, useEffect } from "react";

const dimLabels = ["VD", "IR", "DC", "MN", "AW", "AR", "CR"];

export function OptionCard({ option, index, onExpand }: { option: DesignOption; index: number; onExpand: (id: string) => void }) {
  const shouldReduce = useReducedMotion();
  const noMotion = shouldReduce ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } } : null;

  return (
    <motion.div
      layout
      variants={noMotion || fadeInUp}
      whileHover={shouldReduce ? undefined : { scale: 1.01 }}
      whileTap={shouldReduce ? undefined : { scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={() => onExpand(option.id)}
      className="cursor-pointer group"
      role="button"
      tabIndex={0}
      aria-label={`Expand ${option.name} details`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onExpand(option.id);
        }
      }}
    >
      {/* Option Number — Large */}
      <div className="flex items-baseline gap-3 mb-2">
        <span className="font-['Georgia',_serif] text-4xl font-bold text-border group-hover:text-primary transition-colors leading-none" aria-hidden="true">
          {index + 1}
        </span>
        <div>
          <h3 className="font-['Georgia',_serif] text-lg font-bold text-foreground leading-tight">
            {option.name}
          </h3>
          <p className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground font-medium">
            Dominant: {option.dominantSkill}
          </p>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{option.tagline}</p>

      {/* SP-7 Mini Visualization */}
      <div className="flex gap-1.5 mb-3">
        {option.sp7Vector.map((v, i) => (
          <div key={i} className="flex-1 text-center">
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(v / 5) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.04 + 0.2 }}
                className="h-full bg-primary/70 rounded-full"
              />
            </div>
            <span className="text-[8px] text-muted-foreground/50 mt-0.5 block">{dimLabels[i]}</span>
          </div>
        ))}
      </div>

      {/* Philosophy excerpt */}
      <p className="text-xs text-muted-foreground/70 line-clamp-2 italic border-l-2 border-primary/30 pl-2">
        {option.philosophy}
      </p>

      <hr className="editorial-rule mt-4" />
    </motion.div>
  );
}

export function OptionExpanded({ option, index, onClose }: { option: DesignOption; index: number; onClose: () => void }) {
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-foreground/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${option.name} details`}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-background border border-border rounded max-w-2xl w-full max-h-[85vh] overflow-y-auto custom-scrollbar"
      >
        {/* Modal Header */}
        <div className="border-b-2 border-foreground p-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-['Georgia',_serif] text-3xl font-bold text-border" aria-hidden="true">{index + 1}</span>
              <h2 className="font-['Georgia',_serif] text-2xl font-bold text-foreground -mt-1">{option.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{option.tagline}</p>
            </div>
            <button
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground text-2xl leading-none cursor-pointer rounded hover:bg-muted transition-colors"
              aria-label="Close dialog"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-semibold mb-3">
              Design Philosophy
            </h4>
            <div className="editorial-pullquote">
              {option.philosophy}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-semibold mb-3">
              SP-7 Dimension Scores
            </h4>
            <div className="grid grid-cols-7 gap-2">
              {option.sp7Vector.map((v, i) => (
                <div key={i} className="text-center">
                  <div className="relative h-14 bg-muted/50 border border-border rounded flex items-end justify-center overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(v / 5) * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className="w-full bg-primary/60 rounded-t"
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                      {v}
                    </span>
                  </div>
                  <span className="text-[9px] tracking-wider uppercase text-muted-foreground mt-1 block">{dimLabels[i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-semibold mb-3">
              Skill Dominance
            </h4>
            <div className="space-y-2.5">
              {Object.entries(option.skillWeights).sort(([,a],[,b]) => b-a).map(([skillId, weight]) => {
                const skillName = skillId === 'S01' ? 'Stitch Design' : skillId === 'S02' ? 'Framer Motion' : skillId === 'S03' ? 'UI/UX Pro Max' : '21st.dev Registry';
                return (
                  <div key={skillId} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-28 shrink-0">{skillName}</span>
                    <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${weight}%` }}
                        transition={{ duration: 0.7 }}
                        className="h-full bg-primary/70 rounded-full"
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-10 text-right">{weight}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm border-t border-border pt-5">
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium">Motion</span>
              <p className="text-foreground mt-1 text-sm">{option.motionStyle}</p>
            </div>
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium">Color</span>
              <p className="text-foreground mt-1 text-sm">{option.colorStrategy}</p>
            </div>
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium">Typography</span>
              <p className="text-foreground mt-1 text-sm">{option.typography}</p>
            </div>
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium">Mobile</span>
              <p className="text-foreground mt-1 text-sm">{option.mobileApproach}</p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium">Recommended For</span>
            <p className="text-sm text-foreground mt-2 leading-relaxed">{option.recommended}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function OptionsShowcase() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const expandedOption = expandedId ? options.find(o => o.id === expandedId) : null;
  const expandedIndex = expandedId ? options.findIndex(o => o.id === expandedId) : 0;
  const shouldReduce = useReducedMotion();
  const noMotion = shouldReduce ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } } : null;

  return (
    <section id="options" className="py-20 md:py-28 px-6" aria-label="Five Design Options">
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
              <span className="font-['Georgia',_serif] text-5xl md:text-6xl font-bold text-border leading-none" aria-hidden="true">03</span>
              <h2 className="font-['Georgia',_serif] text-2xl md:text-3xl font-bold text-foreground leading-tight">
                Five Design Options
              </h2>
            </div>
            <div className="editorial-pullquote ml-0 md:ml-20">
              Each option integrates all four skills with a unique dominant hierarchy,
              creating a distinct design philosophy and interaction model.
            </div>
          </div>
        </motion.div>

        <hr className="editorial-rule-thick mb-10" />

        {/* Options as editorial list */}
        <motion.div
          className="divide-y divide-border"
          variants={noMotion || staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {options.map((opt, i) => (
            <OptionCard key={opt.id} option={opt} index={i} onExpand={setExpandedId} />
          ))}
        </motion.div>
      </div>
      <AnimatePresence>
        {expandedOption && (
          <OptionExpanded option={expandedOption} index={expandedIndex} onClose={() => setExpandedId(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
