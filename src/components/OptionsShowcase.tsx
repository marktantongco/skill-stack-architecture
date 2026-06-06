"use client";

import { motion, AnimatePresence } from "framer-motion";
import { options, type DesignOption } from "@/lib/skill-data";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const optionColors = [
  { bg: "from-violet-600/20 to-purple-600/20", border: "border-violet-500/30", text: "text-violet-300", badge: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
  { bg: "from-pink-600/20 to-rose-600/20", border: "border-pink-500/30", text: "text-pink-300", badge: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
  { bg: "from-slate-600/20 to-gray-600/20", border: "border-slate-500/30", text: "text-slate-300", badge: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
  { bg: "from-cyan-600/20 to-blue-600/20", border: "border-cyan-500/30", text: "text-cyan-300", badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  { bg: "from-yellow-600/20 to-amber-600/20", border: "border-yellow-500/30", text: "text-yellow-300", badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
];

const dimLabels = ["VD", "IR", "DC", "MN", "AW", "AR", "CR"];

export function OptionCard({ option, index, onExpand }: { option: DesignOption; index: number; onExpand: (id: string) => void }) {
  const c = optionColors[index];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={() => onExpand(option.id)}
      className={`cursor-pointer rounded-2xl border ${c.border} bg-gradient-to-br ${c.bg} backdrop-blur-sm p-6 hover:scale-[1.02] transition-transform`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className={`text-lg font-bold ${c.text}`}>{option.name}</h3>
          <p className="text-sm text-muted-foreground">{option.tagline}</p>
        </div>
        <Badge variant="outline" className={c.badge}>SP-7: {option.sp7Weighted}</Badge>
      </div>
      <div className="flex gap-1 mb-4">
        {option.sp7Vector.map((v, i) => (
          <div key={i} className="flex-1">
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(v / 5) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.05 + 0.3 }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${option.colorFrom}, ${option.colorTo})` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground/60 mt-0.5 block text-center">{dimLabels[i]}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">{option.philosophy}</p>
    </motion.div>
  );
}

export function OptionExpanded({ option, index, onClose }: { option: DesignOption; index: number; onClose: () => void }) {
  const c = optionColors[index];
  const dimNames = ["Visual Density", "Interactivity", "Data Complexity", "Motion Need", "Accessibility", "AI Redirect", "Reusability"];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${c.text}`}>{option.name}</h2>
            <p className="text-muted-foreground">{option.tagline}</p>
          </div>
          <Badge variant="outline" className={c.badge}>SP-7 Score: {option.sp7Weighted}</Badge>
        </div>

        <div className="space-y-5">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Design Philosophy</h4>
            <p className="text-sm text-muted-foreground">{option.philosophy}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">SP-7 Dimension Scores</h4>
            <div className="grid grid-cols-7 gap-2">
              {option.sp7Vector.map((v, i) => (
                <div key={i} className="text-center">
                  <div className="relative h-20 bg-muted/30 rounded-lg overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(v / 5) * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08 }}
                      className="absolute bottom-0 w-full rounded-lg"
                      style={{ background: `linear-gradient(to top, ${option.colorFrom}, ${option.colorTo})` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
                      {v}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">{dimLabels[i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Skill Dominance</h4>
            <div className="space-y-2">
              {Object.entries(option.skillWeights).sort(([,a],[,b]) => b-a).map(([skillId, weight]) => {
                const skillName = skillId === 'S01' ? 'Stitch Loop' : skillId === 'S02' ? 'Framer Motion' : skillId === 'S03' ? 'UI/UX Pro Max' : '21st.dev Registry';
                return (
                  <div key={skillId} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-28 shrink-0">{skillName}</span>
                    <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${weight}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${option.colorFrom}, ${option.colorTo})` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-10 text-right">{weight}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div><span className="text-muted-foreground">Motion:</span><br/><span className="text-foreground">{option.motionStyle}</span></div>
            <div><span className="text-muted-foreground">Color:</span><br/><span className="text-foreground">{option.colorStrategy}</span></div>
            <div><span className="text-muted-foreground">Typography:</span><br/><span className="text-foreground">{option.typography}</span></div>
            <div><span className="text-muted-foreground">Mobile:</span><br/><span className="text-foreground">{option.mobileApproach}</span></div>
          </div>

          <div className="pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">Recommended For:</span>
            <p className="text-sm text-foreground mt-1">{option.recommended}</p>
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

  return (
    <section id="options" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Five Design Options</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Each option integrates all four skills with a unique dominant hierarchy, creating a distinct design philosophy
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {options.map((opt, i) => (
            <OptionCard key={opt.id} option={opt} index={i} onExpand={setExpandedId} />
          ))}
        </div>
      </div>
      <AnimatePresence>
        {expandedOption && (
          <OptionExpanded option={expandedOption} index={expandedIndex} onClose={() => setExpandedId(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
