"use client";

import { motion } from "framer-motion";
import { heatmapData, sectionLabels } from "@/lib/skill-data";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.02 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0 },
};

export function HeatmapViz() {
  return (
    <section id="heatmap" className="py-20 md:py-28 px-6" aria-label="Skill Utilization Heatmap">
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
              <span className="font-['Georgia',_serif] text-5xl md:text-6xl font-bold text-border leading-none" aria-hidden="true">05</span>
              <h2 className="font-['Georgia',_serif] text-2xl md:text-3xl font-bold text-foreground leading-tight">
                Skill Utilization Heatmap
              </h2>
            </div>
            <div className="editorial-pullquote ml-0 md:ml-20">
              How frequently each skill is utilized across all 12 sections. Intensity from 0 (unused) to 5 (primary driver).
            </div>
          </div>
        </motion.div>

        <hr className="editorial-rule-thick mb-10" />

        <motion.div
          className="bg-card border border-border rounded overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs" role="table" aria-label="Skill utilization heatmap">
              <thead>
                <tr className="border-b-2 border-foreground bg-muted/10">
                  <th className="text-left p-2.5 text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground sticky left-0 bg-muted/10 min-w-[140px]">
                    Skill
                  </th>
                  {sectionLabels.map(l => (
                    <th key={l} className="p-2.5 text-[10px] tracking-[0.15em] uppercase font-semibold text-muted-foreground text-center min-w-[38px]">
                      {l}
                    </th>
                  ))}
                  <th className="p-2.5 text-[10px] tracking-[0.15em] uppercase font-semibold text-foreground text-center min-w-[38px]">
                    Sum
                  </th>
                </tr>
              </thead>
              <motion.tbody
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                {heatmapData.map((row) => {
                  const total = row.values.reduce((a, b) => a + b, 0);
                  return (
                    <motion.tr
                      key={row.skill}
                      variants={fadeInUp}
                      className="border-b border-border/30 hover:bg-muted/10 transition-colors"
                    >
                      <td className="p-2.5 font-mono text-muted-foreground text-[11px] sticky left-0 bg-card">
                        {row.skill}
                      </td>
                      {row.values.map((v, j) => (
                        <td key={j} className="p-1.5 text-center">
                          <motion.div
                            className="w-6 h-6 rounded mx-auto flex items-center justify-center text-[10px] font-bold transition-colors"
                            style={{
                              backgroundColor: v === 0 ? "transparent" : `rgba(194, 54, 22, ${0.05 + (v / 5) * 0.3})`,
                              color: v >= 3 ? "#C23616" : v > 0 ? "#6B6B6B" : "transparent",
                            }}
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: j * 0.01, type: "spring", stiffness: 300, damping: 20 }}
                          >
                            {v > 0 ? v : ""}
                          </motion.div>
                        </td>
                      ))}
                      <td className="p-2.5 text-center font-bold text-foreground text-xs">{total}</td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-4 p-3 border-t border-border text-[10px] text-muted-foreground">
            <span className="tracking-[0.15em] uppercase">Intensity:</span>
            {[0, 1, 2, 3, 4, 5].map(v => (
              <div key={v} className="flex items-center gap-1">
                <div
                  className="w-4 h-4 rounded"
                  style={{
                    backgroundColor: v === 0 ? "transparent" : `rgba(194, 54, 22, ${0.05 + (v / 5) * 0.3})`,
                    border: "1px solid var(--border)",
                  }}
                  aria-hidden="true"
                />
                <span>{v}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
