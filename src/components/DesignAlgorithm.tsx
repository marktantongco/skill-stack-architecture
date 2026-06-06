"use client";

import { motion } from "framer-motion";
import { dimensions, options, weightProfiles } from "@/lib/skill-data";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

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
    <section id="algorithm" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">SP-7 Design Algorithm</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            7-dimension scoring engine that evaluates every section to produce optimal skill-to-section mapping
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weight Profile Selector */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="border border-border rounded-2xl p-6 bg-card"
          >
            <h3 className="text-lg font-semibold mb-4">Weight Profile</h3>
            <div className="flex gap-2 mb-6">
              {weightProfiles.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => { setActiveProfile(i); setCustomWeights(p.weights); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeProfile === i ? "bg-foreground text-background" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {dimensions.map((dim, i) => (
                <div key={dim.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{dim.shortName}: {dim.name}</span>
                    <span className="text-xs font-mono text-muted-foreground">{(customWeights[i] * 100).toFixed(0)}%</span>
                  </div>
                  <Slider
                    value={[customWeights[i] * 100]}
                    min={0}
                    max={50}
                    step={5}
                    onValueChange={(v) => {
                      const newW = [...customWeights];
                      newW[i] = v[0] / 100;
                      setCustomWeights(newW);
                    }}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Scored Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="border border-border rounded-2xl p-6 bg-card"
          >
            <h3 className="text-lg font-semibold mb-4">Prioritized Results</h3>
            <div className="space-y-3">
              {scoredOptions.map((opt, i) => (
                <motion.div
                  key={opt.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setSelectedOption(selectedOption === opt.id ? null : opt.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono text-muted-foreground w-4">#{i + 1}</span>
                    <span className="text-sm font-medium text-foreground flex-1">{opt.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {opt.score.toFixed(1)}
                    </Badge>
                  </div>
                  <div className="ml-7 h-2 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(opt.score / maxScore) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${opt.colorFrom}, ${opt.colorTo})` }}
                    />
                  </div>
                  {selectedOption === opt.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="ml-7 mt-2 grid grid-cols-7 gap-1"
                    >
                      {opt.sp7Vector.map((v, j) => (
                        <div key={j} className="text-center">
                          <div className="h-8 bg-muted/30 rounded flex items-center justify-center">
                            <span className="text-xs font-bold" style={{ color: opt.accentColor }}>{v}</span>
                          </div>
                          <span className="text-[9px] text-muted-foreground">{dimensions[j].shortName}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
