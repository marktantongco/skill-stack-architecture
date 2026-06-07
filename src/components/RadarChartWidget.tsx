"use client";

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import type { DesignOption } from "@/lib/skill-data";

interface RadarChartWidgetProps {
  radarFiltered: { name: string; [key: string]: string | number }[];
  options: DesignOption[];
  optColors: string[];
}

export default function RadarChartWidget({ radarFiltered, options, optColors }: RadarChartWidgetProps) {
  return (
    <div className="h-[400px] md:h-[500px] w-full">
      <ResponsiveContainer width="100%" height="100%" minHeight={300}>
        <RadarChart data={[
          { dim: "Visual Density", ...Object.fromEntries(radarFiltered.map((d) => [d.name, d["VD"]])) },
          { dim: "Interactivity", ...Object.fromEntries(radarFiltered.map((d) => [d.name, d["IR"]])) },
          { dim: "Data Complexity", ...Object.fromEntries(radarFiltered.map((d) => [d.name, d["DC"]])) },
          { dim: "Motion Need", ...Object.fromEntries(radarFiltered.map((d) => [d.name, d["MN"]])) },
          { dim: "Accessibility", ...Object.fromEntries(radarFiltered.map((d) => [d.name, d["AW"]])) },
          { dim: "AI Redirect", ...Object.fromEntries(radarFiltered.map((d) => [d.name, d["AR"]])) },
          { dim: "Reusability", ...Object.fromEntries(radarFiltered.map((d) => [d.name, d["CR"]])) },
        ]}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="dim" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
          {radarFiltered.map((d) => (
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
  );
}
