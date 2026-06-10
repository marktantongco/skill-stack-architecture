"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { heatmapData, sectionLabels } from "@/lib/skill-data";

const intensityColors = [
  "var(--muted)",       // 0
  "#fde8e4",            // 1 - very light vermillion
  "#f8c5bc",            // 2
  "#f09080",            // 3
  "#e0604c",            // 4
  "#C23616",            // 5 - full vermillion
];

export function InteractiveHeatmap() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [hoveredCell, setHoveredCell] = useState<{ skill: string; section: string; value: number } | null>(null);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  const cellW = 48;
  const cellH = 28;
  const labelW = 120;
  const headerH = 40;
  const totalW = labelW + sectionLabels.length * cellW;
  const totalH = headerH + heatmapData.length * cellH;

  return (
    <div ref={ref} className="relative">
      {/* Tooltip */}
      {hoveredCell && (
        <div className="absolute z-20 bg-foreground text-background px-3 py-2 rounded text-[11px] pointer-events-none shadow-lg" style={{
          top: -8,
          left: "50%",
          transform: "translateX(-50%)",
        }}>
          <span className="font-semibold">{hoveredCell.skill}</span>
          {" → "}
          <span className="font-semibold">{hoveredCell.section}</span>
          {": "}
          <span className="text-primary font-bold">{hoveredCell.value}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <svg width={totalW} height={totalH} viewBox={`0 0 ${totalW} ${totalH}`}>
          {/* Section labels (top) */}
          {sectionLabels.map((label, i) => (
            <text
              key={i}
              x={labelW + i * cellW + cellW / 2}
              y={headerH / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--muted-foreground)"
              fontSize={9}
              fontWeight={600}
              letterSpacing="0.05em"
            >
              {label}
            </text>
          ))}

          {/* Skill rows */}
          {heatmapData.map((row, ri) => {
            const isHighlighted = activeSkill === row.skill.split(" ")[0];
            return (
              <g key={ri}>
                {/* Skill label */}
                <text
                  x={labelW - 8}
                  y={headerH + ri * cellH + cellH / 2}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill={isHighlighted ? "var(--primary)" : "var(--muted-foreground)"}
                  fontSize={9}
                  fontWeight={isHighlighted ? 700 : 500}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setActiveSkill(row.skill.split(" ")[0])}
                  onMouseLeave={() => setActiveSkill(null)}
                >
                  {row.skill}
                </text>

                {/* Cells */}
                {row.values.map((v, ci) => (
                  <motion.rect
                    key={ci}
                    x={labelW + ci * cellW + 1}
                    y={headerH + ri * cellH + 1}
                    width={cellW - 2}
                    height={cellH - 2}
                    rx={2}
                    fill={intensityColors[v]}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ duration: 0.2, delay: ri * 0.02 + ci * 0.01 }}
                    style={{ cursor: "crosshair" }}
                    onMouseEnter={() => setHoveredCell({ skill: row.skill, section: sectionLabels[ci], value: v })}
                    onMouseLeave={() => setHoveredCell(null)}
                  />
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 justify-center">
        <span className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground">Usage</span>
        {intensityColors.map((color, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: color, border: "1px solid var(--border)" }} />
            <span className="text-[9px] text-muted-foreground">{i}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
