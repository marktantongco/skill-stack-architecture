'use client';

/**
 * SP7Radar.tsx — Animated SP-7 dimensional radar visualization.
 * ────────────────────────────────────────────────────────────────────────────
 * Why SVG instead of Recharts here?
 *  • Recharts' Radar component animates the whole polygon at once.
 *  • SVG path lets us draw the perimeter stroke from 0 → full (GSAP strokeDashoffset),
 *    then fade in the fill, then pulse the data points one-by-one.
 *  • We get pixel-precise hover tooltips on each axis vertex.
 *
 * Hybrid motion:
 *  • GSAP: scroll-driven perimeter draw + vertex pulse stagger.
 *  • Framer Motion: tooltip fade-in/out on hover (AnimatePresence).
 */

import { useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGsapTimeline, drawPathRecipe } from '@/lib/gsap-hybrid';
import { dimensions, options, weightProfiles, type SP7Dimension } from '@/lib/skill-data';

interface Overlay {
  id: string;
  label: string;
  vector: number[];
  color: string;
  fill: string;
}

interface Props {
  /** Optional fixed overlays — defaults to opt1 (Stitch) + opt3 (UI/UX Pro Max). */
  overlays?: Overlay[];
  /** Show weight profile selector. */
  showWeightProfile?: boolean;
  /** Compact mode for embedding in dashboard grids. */
  compact?: boolean;
}

const defaultOverlays: Overlay[] = [
  {
    id: 'opt1',
    label: 'Stitch Design',
    vector: options[0].sp7Vector,
    color: '#08F7FE',
    fill: 'rgba(8, 247, 254, 0.12)',
  },
  {
    id: 'opt3',
    label: 'UI/UX Pro Max',
    vector: options[2].sp7Vector,
    color: '#FF2E63',
    fill: 'rgba(255, 46, 99, 0.12)',
  },
];

export function SP7Radar({ overlays = defaultOverlays, showWeightProfile = true, compact = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredDim, setHoveredDim] = useState<number | null>(null);
  const [profileIdx, setProfileIdx] = useState(0);

  const size = compact ? 320 : 460;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 60;

  // Pre-compute axis angles (start at -90deg = top)
  const axisAngles = useMemo(
    () => dimensions.map((_, i) => (-90 + (360 / dimensions.length) * i) * (Math.PI / 180)),
    [],
  );

  // Pre-compute grid ring points
  const gridRings = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Build polygon path for a vector
  const buildPath = (vec: number[], scale = 1) => {
    return vec
      .map((v, i) => {
        const r = (Math.min(Math.max(v, 0), 5) / 5) * radius * scale;
        const x = cx + Math.cos(axisAngles[i]) * r;
        const y = cy + Math.sin(axisAngles[i]) * r;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ') + ' Z';
  };

  // Compute weighted score for the active profile
  const profile = weightProfiles[profileIdx];
  const weightedScores = overlays.map((o) => {
    const w = profile.weights;
    const total = o.vector.reduce((acc, v, i) => acc + v * (w[i] ?? 0), 0);
    return { id: o.id, label: o.label, score: total };
  });

  // GSAP timeline — draw perimeter rings + each overlay's polygon stroke
  useGsapTimeline(
    svgRef as React.RefObject<SVGSVGElement | null>,
    (gsap) => {
      // Draw concentric rings
      gridRings.forEach((_, i) => {
        drawPathRecipe(gsap, `.sp7-grid-ring-${i}`, {
          start: 'top 85%',
          end: 'bottom 60%',
          duration: 0.8,
          ease: 'power2.out',
          scrub: false,
        });
      });
      // Draw each overlay polygon stroke
      overlays.forEach((_, i) => {
        drawPathRecipe(gsap, `.sp7-poly-${i}`, {
          start: 'top 80%',
          end: 'bottom 30%',
          duration: 1.4,
          ease: 'power2.inOut',
          scrub: 0.6,
        });
      });
      // Pulse vertices
      gsap.from('.sp7-vertex', {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: 'back.out(2)',
        scrollTrigger: { trigger: containerRef.current, start: 'top 70%' },
      });
    },
    { dependencies: [overlays.length, profileIdx] },
  );

  return (
    <div ref={containerRef} className="sp7-radar relative">
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <h3 className="text-xl font-serif font-semibold tracking-tight">SP-7 Dimensional Radar</h3>
          <p className="text-sm text-muted-foreground mt-1">
            7-axis evaluation of design density, interactivity, motion, accessibility & reusability.
          </p>
        </div>
        {showWeightProfile && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground mr-1">Weight Profile:</span>
            {weightProfiles.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setProfileIdx(i)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  i === profileIdx
                    ? 'bg-foreground text-background'
                    : 'bg-muted hover:bg-muted/70 text-muted-foreground'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-[1fr_180px] gap-4 items-start">
        {/* SVG radar */}
        <div className="flex justify-center">
          <svg
            ref={svgRef}
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="overflow-visible"
            role="img"
            aria-label="SP-7 dimensional radar chart"
          >
            {/* Grid rings (concentric polygons) */}
            {gridRings.map((ring, i) => (
              <path
                key={`ring-${i}`}
                className={`sp7-grid-ring-${i}`}
                d={buildPath([5, 5, 5, 5, 5, 5, 5], ring)}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.15}
                strokeWidth={1}
              />
            ))}

            {/* Axis lines */}
            {axisAngles.map((a, i) => {
              const x = cx + Math.cos(a) * radius;
              const y = cy + Math.sin(a) * radius;
              return (
                <line
                  key={`axis-${i}`}
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  strokeWidth={1}
                />
              );
            })}

            {/* Axis labels */}
            {dimensions.map((dim: SP7Dimension, i) => {
              const labelR = radius + 28;
              const x = cx + Math.cos(axisAngles[i]) * labelR;
              const y = cy + Math.sin(axisAngles[i]) * labelR;
              const anchor =
                Math.abs(Math.cos(axisAngles[i])) < 0.3
                  ? 'middle'
                  : Math.cos(axisAngles[i]) > 0
                    ? 'start'
                    : 'end';
              return (
                <g key={`label-${dim.id}`}>
                  <text
                    x={x}
                    y={y - 4}
                    textAnchor={anchor}
                    className="text-[11px] font-semibold fill-foreground"
                  >
                    {dim.shortName}
                  </text>
                  <text
                    x={x}
                    y={y + 8}
                    textAnchor={anchor}
                    className="text-[9px] fill-muted-foreground"
                  >
                    {dim.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}

            {/* Overlay polygons */}
            {overlays.map((o, i) => (
              <g key={`poly-${o.id}`}>
                <path
                  className={`sp7-poly-${i}`}
                  d={buildPath(o.vector)}
                  fill={o.fill}
                  stroke={o.color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
                {/* Vertices */}
                {o.vector.map((v, vi) => {
                  const r = (Math.min(Math.max(v, 0), 5) / 5) * radius;
                  const x = cx + Math.cos(axisAngles[vi]) * r;
                  const y = cy + Math.sin(axisAngles[vi]) * r;
                  return (
                    <circle
                      key={`v-${o.id}-${vi}`}
                      className="sp7-vertex origin-center"
                      cx={x}
                      cy={y}
                      r={hoveredDim === vi ? 6 : 4}
                      fill={o.color}
                      stroke="white"
                      strokeWidth={1.5}
                      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                    />
                  );
                })}
              </g>
            ))}

            {/* Hover hit-areas on axis labels */}
            {dimensions.map((dim, i) => {
              const labelR = radius + 28;
              const x = cx + Math.cos(axisAngles[i]) * labelR;
              const y = cy + Math.sin(axisAngles[i]) * labelR;
              return (
                <rect
                  key={`hit-${dim.id}`}
                  x={x - 28}
                  y={y - 14}
                  width={56}
                  height={28}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredDim(i)}
                  onMouseLeave={() => setHoveredDim(null)}
                />
              );
            })}
          </svg>
        </div>

        {/* Side panel: legend + scores + hovered dimension detail */}
        <div className="space-y-3">
          <div className="space-y-2">
            {overlays.map((o, i) => (
              <div key={o.id} className="flex items-center gap-2 text-xs">
                <span
                  className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: o.color }}
                />
                <span className="font-medium truncate">{o.label}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Weighted Score · {profile.name}
            </div>
            {weightedScores.map((s) => {
              const maxPossible = 5 * profile.weights.reduce((a, b) => a + b, 0);
              const pct = Math.round((s.score / maxPossible) * 100);
              return (
                <div key={s.id} className="space-y-0.5">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="truncate pr-2">{s.label}</span>
                    <span className="font-mono font-semibold">{s.score.toFixed(1)}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: overlays.find(o => o.id === s.id)?.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {hoveredDim !== null && (
              <motion.div
                key={hoveredDim}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="border-t pt-3 text-xs"
              >
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  {dimensions[hoveredDim].shortName} · {dimensions[hoveredDim].name}
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {dimensions[hoveredDim].description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
