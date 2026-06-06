"use client";

import { motion } from "framer-motion";
import { options, dimensions, heatmapData, sectionLabels } from "@/lib/skill-data";

const optColors = ["#667eea", "#f5576c", "#dfe6e9", "#2C5364", "#FFD600"];

export function HeatmapViz() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Skill Utilization Heatmap</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            How frequently each skill is utilized across all 12 sections — intensity from 0 (unused) to 5 (primary driver)
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border border-border rounded-2xl overflow-hidden bg-card"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left p-2 font-medium text-muted-foreground sticky left-0 bg-muted/20 min-w-[140px]">Skill</th>
                  {sectionLabels.map(l => (
                    <th key={l} className="p-2 font-medium text-muted-foreground text-center min-w-[40px]">{l}</th>
                  ))}
                  <th className="p-2 font-medium text-foreground text-center min-w-[40px]">Sum</th>
                </tr>
              </thead>
              <tbody>
                {heatmapData.map((row, i) => {
                  const total = row.values.reduce((a, b) => a + b, 0);
                  return (
                    <tr key={row.skill} className="border-b border-border/30 hover:bg-muted/5">
                      <td className="p-2 font-mono text-muted-foreground sticky left-0 bg-card">{row.skill}</td>
                      {row.values.map((v, j) => (
                        <td key={j} className="p-1 text-center">
                          <div
                            className="w-6 h-6 rounded mx-auto flex items-center justify-center text-[10px] font-bold"
                            style={{
                              backgroundColor: v === 0 ? "transparent" : `rgba(212, 175, 55, ${0.1 + (v / 5) * 0.7})`,
                              color: v >= 3 ? "#0F2027" : v > 0 ? "hsl(var(--muted-foreground))" : "transparent",
                            }}
                          >
                            {v > 0 ? v : ""}
                          </div>
                        </td>
                      ))}
                      <td className="p-2 text-center font-bold text-foreground">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-center gap-4 p-3 border-t border-border text-xs text-muted-foreground">
            <span>Intensity:</span>
            {[0, 1, 2, 3, 4, 5].map(v => (
              <div key={v} className="flex items-center gap-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: v === 0 ? "transparent" : `rgba(212, 175, 55, ${0.1 + (v / 5) * 0.7})`, border: "1px solid hsl(var(--border))" }} />
                <span>{v}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
