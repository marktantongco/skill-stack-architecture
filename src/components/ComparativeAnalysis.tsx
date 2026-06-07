"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animation-variants";
import { comparisonMatrix, options } from "@/lib/skill-data";
import { useState } from "react";

const radarData = options.map(opt => {
  const entry: { name: string; [key: string]: string | number } = { name: opt.name };
  const labels = ["VD", "IR", "DC", "MN", "AW", "AR", "CR"];
  opt.sp7Vector.forEach((v, i) => { entry[labels[i]] = v; });
  return entry;
});

const optColors = ["#C23616", "#2C3E50", "#6B6B6B", "#5B7B6F", "#8B7355"];

/* ─── Dynamic import for Recharts — avoids SSR width/height warning ─── */
const RadarChartWidget = dynamic(
  () => import("./RadarChartWidget"),
  { ssr: false, loading: () => <div className="h-[400px] md:h-[500px] w-full flex items-center justify-center text-muted-foreground text-sm">Loading chart…</div> }
);

export function ComparativeAnalysis() {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(options.map(o => o.id));
  const [view, setView] = useState<"matrix" | "radar">("radar");
  const shouldReduce = useReducedMotion();
  const noMotion = shouldReduce ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } } : null;

  const toggleOption = (id: string) => {
    setSelectedOptions(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const radarFiltered = radarData.filter((_, i) => selectedOptions.includes(options[i].id));

  return (
    <section id="comparative" className="py-20 md:py-28 px-6 bg-muted/15" aria-label="Comparative Analysis">
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
              <span className="font-['Georgia',_serif] text-5xl md:text-6xl font-bold text-border leading-none" aria-hidden="true">04</span>
              <h2 className="font-['Georgia',_serif] text-2xl md:text-3xl font-bold text-foreground leading-tight">
                Comparative Analysis
              </h2>
            </div>
            <div className="editorial-pullquote ml-0 md:ml-20">
              Interactive comparison across 7 dimensions. Select options to overlay their profiles and reveal tradeoffs.
            </div>
          </div>
        </motion.div>

        <hr className="editorial-rule-thick mb-8" />

        {/* Option Toggles — Editorial Tags */}
        <motion.div
          className="flex flex-wrap gap-2 mb-8"
          variants={noMotion || staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {options.map((opt, i) => (
            <motion.button
              key={opt.id}
              variants={noMotion || fadeInUp}
              whileHover={shouldReduce ? undefined : { scale: 1.05 }}
              whileTap={shouldReduce ? undefined : { scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => toggleOption(opt.id)}
              className={`min-h-[44px] px-3 py-1.5 text-[11px] tracking-[0.1em] uppercase font-medium border cursor-pointer ${
                selectedOptions.includes(opt.id)
                  ? "border-foreground/30 bg-foreground/5 text-foreground"
                  : "border-border bg-transparent text-muted-foreground hover:border-foreground/20"
              }`}
              aria-pressed={selectedOptions.includes(opt.id)}
              aria-label={`Toggle ${opt.name} in comparison`}
            >
              <span className="inline-block w-2 h-2 mr-1.5" style={{ backgroundColor: optColors[i] }} aria-hidden="true" />
              {opt.name.replace("The ", "")}
            </motion.button>
          ))}
        </motion.div>

        {/* View Toggle */}
        <div className="flex gap-0 mb-8 border-b border-border" role="tablist" aria-label="View mode">
          <button
            onClick={() => setView("radar")}
            role="tab"
            aria-selected={view === "radar"}
            className={`min-h-[44px] px-4 py-2 text-[11px] tracking-[0.15em] uppercase font-medium border-b-2 -mb-px cursor-pointer ${
              view === "radar" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            Radar Chart
          </button>
          <button
            onClick={() => setView("matrix")}
            role="tab"
            aria-selected={view === "matrix"}
            className={`min-h-[44px] px-4 py-2 text-[11px] tracking-[0.15em] uppercase font-medium border-b-2 -mb-px cursor-pointer ${
              view === "matrix" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            Matrix Table
          </button>
        </div>

        {view === "radar" ? (
          <motion.div
            className="bg-card border border-border rounded p-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <RadarChartWidget radarFiltered={radarFiltered} options={options} optColors={optColors} />
          </motion.div>
        ) : (
          <motion.div
            className="bg-card border border-border rounded overflow-hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="border-b-2 border-foreground bg-muted/10">
                    <th className="text-left p-3 text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground sticky left-0 bg-muted/10">
                      Dimension
                    </th>
                    {options.map((opt, i) => (
                      <th key={opt.id} className="text-left p-3 text-[10px] tracking-[0.15em] uppercase font-semibold" style={{ color: optColors[i] }}>
                        {opt.name.replace("The ", "")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonMatrix.map((row, i) => (
                    <tr key={i} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                      <td className="p-3 text-sm font-medium text-foreground sticky left-0 bg-card">{row.dimension}</td>
                      <td className="p-3 text-sm text-muted-foreground">{row.opt1}</td>
                      <td className="p-3 text-sm text-muted-foreground">{row.opt2}</td>
                      <td className="p-3 text-sm text-muted-foreground">{row.opt3}</td>
                      <td className="p-3 text-sm text-muted-foreground">{row.opt4}</td>
                      <td className="p-3 text-sm text-muted-foreground">{row.opt5}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
