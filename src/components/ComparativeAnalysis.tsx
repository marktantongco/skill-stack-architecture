"use client";

import { motion } from "framer-motion";
import { comparisonMatrix, options } from "@/lib/skill-data";
import { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";

const radarData = options.map(opt => {
  const entry: Record<string, string | number> = { name: opt.name };
  const labels = ["VD", "IR", "DC", "MN", "AW", "AR", "CR"];
  opt.sp7Vector.forEach((v, i) => { entry[labels[i]] = v; });
  return entry;
});

const optColors = ["#C23616", "#2C3E50", "#6B6B6B", "#5B7B6F", "#8B7355"];

export function ComparativeAnalysis() {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(options.map(o => o.id));
  const [view, setView] = useState<"matrix" | "radar">("radar");

  const toggleOption = (id: string) => {
    setSelectedOptions(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const radarFiltered = radarData.filter((_, i) => selectedOptions.includes(options[i].id));

  return (
    <section id="comparative" className="py-20 md:py-28 px-6 bg-muted/15">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-14">
          <div className="md:col-span-8">
            <div className="flex items-baseline gap-4 mb-3">
              <span className="font-['Georgia',_serif] text-5xl md:text-6xl font-bold text-border leading-none">04</span>
              <h2 className="font-['Georgia',_serif] text-2xl md:text-3xl font-bold text-foreground leading-tight">
                Comparative Analysis
              </h2>
            </div>
            <div className="editorial-pullquote ml-0 md:ml-20">
              Interactive comparison across 7 dimensions. Select options to overlay their profiles and reveal tradeoffs.
            </div>
          </div>
        </div>

        <hr className="editorial-rule-thick mb-8" />

        {/* Option Toggles — Editorial Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {options.map((opt, i) => (
            <button
              key={opt.id}
              onClick={() => toggleOption(opt.id)}
              className={`px-3 py-1.5 text-[11px] tracking-[0.1em] uppercase font-medium border transition-all ${
                selectedOptions.includes(opt.id)
                  ? "border-foreground/30 bg-foreground/5 text-foreground"
                  : "border-border bg-transparent text-muted-foreground hover:border-foreground/20"
              }`}
            >
              <span className="inline-block w-2 h-2 mr-1.5" style={{ backgroundColor: optColors[i] }} />
              {opt.name.replace("The ", "")}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex gap-0 mb-8 border-b border-border">
          <button
            onClick={() => setView("radar")}
            className={`px-4 py-2 text-[11px] tracking-[0.15em] uppercase font-medium border-b-2 -mb-px transition-all ${
              view === "radar" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            Radar Chart
          </button>
          <button
            onClick={() => setView("matrix")}
            className={`px-4 py-2 text-[11px] tracking-[0.15em] uppercase font-medium border-b-2 -mb-px transition-all ${
              view === "matrix" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            Matrix Table
          </button>
        </div>

        {view === "radar" ? (
          <div className="bg-card border border-border rounded p-6">
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
                  <PolarGrid stroke="#E0DDD5" />
                  <PolarAngleAxis dataKey="dim" tick={{ fill: "#6B6B6B", fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: "#6B6B6B", fontSize: 10 }} />
                  {radarFiltered.map((d, i) => (
                    <Radar
                      key={d.name}
                      name={d.name}
                      dataKey={d.name}
                      stroke={optColors[options.findIndex(o => o.name === d.name)]}
                      fill={optColors[options.findIndex(o => o.name === d.name)]}
                      fillOpacity={0.06}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
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
          </div>
        )}
      </div>
    </section>
  );
}
