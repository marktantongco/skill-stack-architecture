"use client";

import { motion } from "framer-motion";
import { dimensions, options, weightProfiles } from "@/lib/skill-data";
import { useState } from "react";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function DesignAlgorithm() {
  const [activeProfile, setActiveProfile] = useState(0);
  const [customWeights, setCustomWeights] = useState(weightProfiles[0].weights);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const computeScore = (vector: number[], weights: number[]) => {
    return vector.reduce((sum, v, i) => sum + v * weights[i], 0);
  };

  const scoredOptions = options.map(opt => ({
    ...opt,
    score: computeScore(opt.sp7Vector, customWeights),
  })).sort((a, b) => b.score - a.score);

  const maxScore = Math.max(...scoredOptions.map(o => o.score));

  return (
    <section id="algorithm" className="py-20 md:py-28 px-6" aria-label="SP-7 Design Algorithm">
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
              <span className="font-['Georgia',_serif] text-5xl md:text-6xl font-bold text-border leading-none" aria-hidden="true">02</span>
              <h2 className="font-['Georgia',_serif] text-2xl md:text-3xl font-bold text-foreground leading-tight">
                SP-7 Design Algorithm
              </h2>
            </div>
            <div className="editorial-pullquote ml-0 md:ml-20">
              7-dimension scoring engine that evaluates every section to produce optimal
              skill-to-section mapping. Adjust weights to see how priority shifts.
            </div>
          </div>
        </motion.div>

        <hr className="editorial-rule-thick mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Weight Profile — Left */}
          <div className="lg:col-span-5">
            <h3 className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-semibold mb-5">
              Weight Profile
            </h3>

            {/* Profile Tabs */}
            <div className="flex flex-wrap gap-0 mb-8 border-b border-border" role="tablist" aria-label="Weight profiles">
              {weightProfiles.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => { setActiveProfile(i); setCustomWeights(p.weights); }}
                  role="tab"
                  aria-selected={activeProfile === i}
                  className={`min-h-[44px] px-3 py-2 text-[11px] tracking-[0.12em] uppercase font-medium transition-all border-b-2 -mb-px cursor-pointer ${
                    activeProfile === i
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* Dimension Controls */}
            <motion.div
              className="space-y-5"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {dimensions.map((dim, i) => (
                <motion.div key={dim.id} variants={fadeInUp} className="group/dim">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-foreground">
                      <span className="font-mono text-primary text-xs mr-2 font-bold">{dim.shortName}</span>
                      {dim.name}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {(customWeights[i] * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="relative">
                    <div className="h-1 bg-border rounded-full overflow-hidden">
                      <motion.div
                        className="absolute left-0 top-0 h-full bg-primary/70 rounded-full"
                        animate={{ width: `${customWeights[i] * 200}%` }}
                        transition={{ duration: 0.25 }}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      step={5}
                      value={customWeights[i] * 100}
                      onChange={(e) => {
                        const newW = [...customWeights];
                        newW[i] = Number(e.target.value) / 100;
                        setCustomWeights(newW);
                      }}
                      className="w-full accent-primary absolute top-[-6px] left-0 h-5 cursor-pointer opacity-0"
                      aria-label={`Weight for ${dim.name}`}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground/70 mt-1 leading-relaxed">{dim.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Scored Results — Right */}
          <div className="lg:col-span-7 lg:border-l lg:border-border lg:pl-12">
            <h3 className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-semibold mb-6">
              Prioritized Results
            </h3>

            <motion.div
              className="space-y-5"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {scoredOptions.map((opt, i) => (
                <motion.div
                  key={opt.id}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  onClick={() => setSelectedOption(selectedOption === opt.id ? null : opt.id)}
                  className="cursor-pointer group/res"
                  role="button"
                  tabIndex={0}
                  aria-expanded={selectedOption === opt.id}
                  aria-label={`${opt.name} — score ${opt.score.toFixed(1)}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedOption(selectedOption === opt.id ? null : opt.id);
                    }
                  }}
                >
                  <div className="flex items-baseline gap-4 mb-1.5">
                    <span className="font-['Georgia',_serif] text-xl font-bold text-border group-hover/res:text-primary transition-colors">
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-foreground flex-1">{opt.name}</span>
                    <span className="text-sm font-mono font-bold text-primary">
                      {opt.score.toFixed(1)}
                    </span>
                  </div>
                  <div className="ml-9 h-1 bg-border/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(opt.score / maxScore) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: i * 0.08 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>

                  {selectedOption === opt.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="ml-9 mt-3 overflow-hidden"
                    >
                      <div className="grid grid-cols-7 gap-2 mb-3">
                        {opt.sp7Vector.map((v, j) => (
                          <div key={j} className="text-center">
                            <div className="h-10 bg-muted border border-border rounded flex items-center justify-center">
                              <span className="text-xs font-bold text-foreground">{v}</span>
                            </div>
                            <span className="text-[9px] tracking-wider uppercase text-muted-foreground mt-1 block">
                              {dimensions[j].shortName}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-primary pl-3">
                        {opt.philosophy}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
