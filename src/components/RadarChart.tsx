"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { dimensions, options } from "@/lib/skill-data";

interface RadarChartProps {
  vectors: number[][];
  labels: string[];
  colors: string[];
  size?: number;
  showLabels?: boolean;
}

function polarToCartesian(angle: number, radius: number, cx: number, cy: number) {
  return {
    x: cx + radius * Math.cos(angle - Math.PI / 2),
    y: cy + radius * Math.sin(angle - Math.PI / 2),
  };
}

export function RadarChart({ vectors, labels, colors, size = 300, showLabels = true }: RadarChartProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 40;
  const n = dimensions.length;
  const angleStep = (2 * Math.PI) / n;

  // Grid rings (5 levels)
  const rings = [1, 2, 3, 4, 5];

  return (
    <div ref={ref} className="relative inline-block">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {rings.map((level) => {
          const r = (level / 5) * maxR;
          const points = Array.from({ length: n }, (_, i) => {
            const { x, y } = polarToCartesian(i * angleStep, r, cx, cy);
            return `${x},${y}`;
          }).join(" ");
          return (
            <polygon
              key={level}
              points={points}
              fill="none"
              stroke="var(--border)"
              strokeWidth={level === 5 ? 1 : 0.5}
              opacity={level === 5 ? 0.6 : 0.3}
            />
          );
        })}

        {/* Axis lines */}
        {dimensions.map((_, i) => {
          const { x, y } = polarToCartesian(i * angleStep, maxR, cx, cy);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="var(--border)"
              strokeWidth={0.5}
              opacity={0.4}
            />
          );
        })}

        {/* Dimension labels */}
        {showLabels && dimensions.map((dim, i) => {
          const labelR = maxR + 22;
          const { x, y } = polarToCartesian(i * angleStep, labelR, cx, cy);
          return (
            <text
              key={dim.id}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--muted-foreground)"
              fontSize={9}
              fontWeight={600}
              letterSpacing="0.05em"
            >
              {dim.shortName}
            </text>
          );
        })}

        {/* Data polygons */}
        {vectors.map((vector, vi) => {
          const points = vector.map((v, i) => {
            const r = (v / 5) * maxR;
            const { x, y } = polarToCartesian(i * angleStep, r, cx, cy);
            return `${x},${y}`;
          }).join(" ");

          return (
            <motion.polygon
              key={vi}
              points={points}
              fill={colors[vi]}
              fillOpacity={hoveredIdx !== null ? (hoveredIdx === vi ? 0.25 : 0.05) : 0.15}
              stroke={colors[vi]}
              strokeWidth={hoveredIdx === vi ? 2 : 1}
              strokeOpacity={hoveredIdx !== null ? (hoveredIdx === vi ? 1 : 0.3) : 0.7}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: vi * 0.15 }}
            />
          );
        })}

        {/* Data points */}
        {vectors.map((vector, vi) =>
          vector.map((v, i) => {
            const r = (v / 5) * maxR;
            const { x, y } = polarToCartesian(i * angleStep, r, cx, cy);
            return (
              <motion.circle
                key={`${vi}-${i}`}
                cx={x}
                cy={y}
                r={hoveredIdx === vi ? 4 : 2.5}
                fill={colors[vi]}
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{ duration: 0.3, delay: vi * 0.15 + i * 0.03 }}
              />
            );
          })
        )}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 justify-center">
        {labels.map((label, i) => (
          <button
            key={i}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase transition-opacity"
            style={{ opacity: hoveredIdx !== null ? (hoveredIdx === i ? 1 : 0.4) : 0.8 }}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[i] }} />
            <span className="text-muted-foreground">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Full comparative radar section
export function ComparativeRadar() {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([0, 1]);

  const toggleOption = (idx: number) => {
    setSelectedOptions((prev) =>
      prev.includes(idx)
        ? prev.length > 1 ? prev.filter((i) => i !== idx) : prev
        : [...prev, idx]
    );
  };

  const radarColors = [
    "#C23616", // vermillion
    "#2C3E50", // navy
    "#8B7355", // warm brown
    "#5B7B6F", // sage
    "#D4A574", // sand
  ];

  return (
    <div>
      {/* Toggle buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {options.map((opt, i) => (
          <button
            key={opt.id}
            onClick={() => toggleOption(i)}
            className={`px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase font-medium border transition-all ${
              selectedOptions.includes(i)
                ? "border-primary text-primary bg-primary/5"
                : "border-border text-muted-foreground hover:border-foreground/20"
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: radarColors[i] }} />
            {opt.name.replace("The ", "")}
          </button>
        ))}
      </div>

      {/* Radar chart */}
      <div className="flex justify-center">
        <RadarChart
          vectors={selectedOptions.map((i) => options[i].sp7Vector)}
          labels={selectedOptions.map((i) => options[i].name.replace("The ", ""))}
          colors={selectedOptions.map((i) => radarColors[i])}
          size={380}
        />
      </div>
    </div>
  );
}
