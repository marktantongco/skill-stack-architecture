"use client";

import { motion } from "framer-motion";
import { comparisonMatrix, options } from "@/lib/skill-data";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";

const radarData = options.map(opt => {
  const entry: Record<string, string | number> = { name: opt.name };
  const labels = ["VD", "IR", "DC", "MN", "AW", "AR", "CR"];
  opt.sp7Vector.forEach((v, i) => { entry[labels[i]] = v; });
  return entry;
});

const optColors = ["#667eea", "#f5576c", "#dfe6e9", "#2C5364", "#FFD600"];

export function ComparativeAnalysis() {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(options.map(o => o.id));
  const [view, setView] = useState<"matrix" | "radar">("radar");

  const toggleOption = (id: string) => {
    setSelectedOptions(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const filteredRadar = radarData.filter(d => selectedOptions.includes(d.name === "The Autopoietic Canvas" ? "opt1" : d.name === "Kinetic Spatial" ? "opt2" : d.name === "Chromatic Minimal" ? "opt3" : d.name === "Glass Depth" ? "opt4" : "opt5"));
  const radarFiltered = radarData.filter((_, i) => selectedOptions.includes(options[i].id));

  return (
    <section id="comparative" className="py-20 px-4 bg-muted/5">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Comparative Analysis</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Interactive comparison across 8 dimensions — select options to overlay
          </p>
        </motion.div>

        {/* Option toggles */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {options.map((opt, i) => (
            <button
              key={opt.id}
              onClick={() => toggleOption(opt.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${selectedOptions.includes(opt.id) ? "border-foreground/30 bg-foreground/10 text-foreground" : "border-transparent bg-muted/30 text-muted-foreground"}`}
            >
              <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: optColors[i] }} />
              {opt.name.replace("The ", "").replace("The ", "")}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setView("radar")}
            className={`px-4 py-1.5 rounded-lg text-sm ${view === "radar" ? "bg-foreground text-background" : "bg-muted/50 text-muted-foreground"}`}
          >
            Radar Chart
          </button>
          <button
            onClick={() => setView("matrix")}
            className={`px-4 py-1.5 rounded-lg text-sm ${view === "matrix" ? "bg-foreground text-background" : "bg-muted/50 text-muted-foreground"}`}
          >
            Matrix Table
          </button>
        </div>

        {view === "radar" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-border rounded-2xl p-6 bg-card"
          >
            <div className="h-[400px] md:h-[500px] w-full">
              <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <RadarChart data={[
                  { dim: "Visual Density", ...Object.fromEntries(radarFiltered.map((d, i) => [d.name, d["VD"]])) },
                  { dim: "Interactivity", ...Object.fromEntries(radarFiltered.map((d, i) => [d.name, d["IR"]])) },
                  { dim: "Data Complexity", ...Object.fromEntries(radarFiltered.map((d, i) => [d.name, d["DC"]])) },
                  { dim: "Motion Need", ...Object.fromEntries(radarFiltered.map((d, i) => [d.name, d["MN"]])) },
                  { dim: "Accessibility", ...Object.fromEntries(radarFiltered.map((d, i) => [d.name, d["AW"]])) },
                  { dim: "AI Redirect", ...Object.fromEntries(radarFiltered.map((d, i) => [d.name, d["AR"]])) },
                  { dim: "Reusability", ...Object.fromEntries(radarFiltered.map((d, i) => [d.name, d["CR"]])) },
                ]}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="dim" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  {radarFiltered.map((d, i) => (
                    <Radar key={d.name} name={d.name} dataKey={d.name} stroke={optColors[options.findIndex(o => o.name === d.name)]} fill={optColors[options.findIndex(o => o.name === d.name)]} fillOpacity={0.1} strokeWidth={2} />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-border rounded-2xl overflow-hidden bg-card"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-semibold text-muted-foreground sticky left-0 bg-card">Dimension</th>
                    <th className="text-left p-3 font-semibold text-violet-400">Autopoietic</th>
                    <th className="text-left p-3 font-semibold text-pink-400">Kinetic</th>
                    <th className="text-left p-3 font-semibold text-slate-400">Chromatic</th>
                    <th className="text-left p-3 font-semibold text-cyan-400">Glass</th>
                    <th className="text-left p-3 font-semibold text-yellow-400">Industrial</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonMatrix.map((row, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/10">
                      <td className="p-3 font-medium text-foreground sticky left-0 bg-card">{row.dimension}</td>
                      <td className="p-3 text-muted-foreground">{row.opt1}</td>
                      <td className="p-3 text-muted-foreground">{row.opt2}</td>
                      <td className="p-3 text-muted-foreground">{row.opt3}</td>
                      <td className="p-3 text-muted-foreground">{row.opt4}</td>
                      <td className="p-3 text-muted-foreground">{row.opt5}</td>
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
