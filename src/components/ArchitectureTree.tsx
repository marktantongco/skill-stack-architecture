'use client';

/**
 * ArchitectureTree.tsx — Radial tree diagram of the Minimal Flat Registry.
 * ────────────────────────────────────────────────────────────────────────────
 * Visualizes the 4-tier skill architecture (T0-T3) as a radial tree, with the
 * AI Portal Gateway at the center and tiers as concentric rings.
 *
 * Each tier has its sample skills placed around it. Hovering a skill highlights
 * its tier and shows a tooltip with install command.
 *
 * Hybrid motion:
 *  • GSAP: scroll-triggered grow-from-center reveal — branches draw outward,
 *    nodes pop in with staggered scale.
 *  • Framer Motion: hover lift + tooltip fade.
 */

import { useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGsapTimeline, drawPathRecipe } from '@/lib/gsap-hybrid';
import { skills } from '@/lib/skill-data';

interface TierNode {
  id: string;
  name: string;
  description: string;
  color: string;
  skills: { id: string; name: string; emoji: string; install: string }[];
}

const tiers: TierNode[] = [
  {
    id: 'T0',
    name: 'Foundation',
    description: 'Third-party packages. Installed via standard package managers. The bedrock everything else depends on.',
    color: '#94a3b8',
    skills: [
      { id: 'S02', name: 'Framer Motion', emoji: '🎬', install: 'bun add framer-motion' },
      { id: 'S05', name: 'GSAP', emoji: '⚡', install: 'bun add gsap @gsap/react' },
      { id: 'S10', name: 'shadcn/ui', emoji: '🧩', install: 'bunx shadcn-ui@latest init' },
      { id: 'S07', name: 'Mermaid', emoji: '🌊', install: 'bun add mermaid' },
    ],
  },
  {
    id: 'T1',
    name: 'Core Skills',
    description: 'First-party skills owned by the team. Composable, versioned, installable via `npx skills add`.',
    color: '#08F7FE',
    skills: [
      { id: 'S15', name: 'Matrix Engine', emoji: '🔢', install: 'npx skills add matrix-engine' },
      { id: 'S16', name: 'Design Algo', emoji: '🧮', install: 'npx skills add design-algorithm' },
      { id: 'S14', name: 'Stack Prioritizer', emoji: '📊', install: 'npx skills add stack-prioritizer' },
      { id: 'S13', name: 'AI Portal', emoji: '🚪', install: 'npx skills add ai-portal-gateway' },
      { id: 'S11', name: 'Playwright', emoji: '🎭', install: 'npx skills add playwright-e2e' },
    ],
  },
  {
    id: 'T2',
    name: 'Composition',
    description: 'Skills that consume T1 outputs and orchestrate them. Use the I/O piping pattern, no orchestrator.',
    color: '#FF2E63',
    skills: [
      { id: 'S51', name: 'MCP Curator', emoji: '🎭', install: 'npx skills add mcp-stack-curator' },
      { id: 'S38', name: 'Skill Finder', emoji: '🔍', install: 'npx skills add skill-finder' },
      { id: 'S26', name: 'Deployment', emoji: '🚀', install: 'npx skills add deployment-manager' },
    ],
  },
  {
    id: 'T3',
    name: 'Domain',
    description: 'Domain-specific skills. Highest tier — these compose T2 outputs into end-user value.',
    color: '#FFD600',
    skills: [
      { id: 'S01', name: 'Stitch Design', emoji: '🪡', install: 'npx skills add stitch-design' },
      { id: 'S03', name: 'UI/UX Pro Max', emoji: '🎨', install: 'npx skills add ui-ux-pro-max' },
      { id: 'S06', name: 'Remotion', emoji: '🎥', install: 'npx skills add remotion-studio' },
    ],
  },
];

export function ArchitectureTree() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredSkill, setHoveredSkill] = useState<{ tierId: string; skillId: string } | null>(null);
  const [activeTier, setActiveTier] = useState<string | null>(null);

  const size = 560;
  const cx = size / 2;
  const cy = size / 2;

  // Tier ring radii
  const tierRadii = [80, 150, 220, 270];

  // Pre-compute skill positions on each tier ring
  const tierLayout = useMemo(() => {
    return tiers.map((tier, ti) => {
      const r = tierRadii[ti];
      const count = tier.skills.length;
      const spread = Math.PI * 1.4; // 252deg arc, leaving top open
      const startAngle = -Math.PI / 2 - spread / 2; // centered at top
      return {
        tier,
        radius: r,
        positions: tier.skills.map((skill, si) => {
          const angle = startAngle + (count > 1 ? (spread / (count - 1)) * si : 0);
          return {
            skill,
            x: cx + Math.cos(angle) * r,
            y: cy + Math.sin(angle) * r,
            angle,
            radius: r,
          };
        }),
      };
    });
  }, []);

  // GSAP: draw tier rings + branch connectors + node stagger
  useGsapTimeline(
    svgRef as React.RefObject<SVGSVGElement | null>,
    (gsap) => {
      // Draw tier ring outlines
      tiers.forEach((_, i) => {
        drawPathRecipe(gsap, `.arch-ring-${i}`, {
          start: 'top 85%',
          end: 'bottom 40%',
          duration: 1.2,
          ease: 'power2.out',
          scrub: 0.4,
        });
      });
      // Draw branch connectors from center → each tier → each skill
      gsap.utils.toArray<SVGPathElement>('.arch-branch').forEach((path) => {
        const total = path.getTotalLength();
        path.style.strokeDasharray = `${total}`;
        path.style.strokeDashoffset = `${total}`;
      });
      gsap.to('.arch-branch', {
        strokeDashoffset: 0,
        duration: 1,
        ease: 'power2.inOut',
        stagger: 0.03,
        scrollTrigger: { trigger: containerRef.current, start: 'top 70%' },
      });
      // Pop-in skill nodes
      gsap.from('.arch-skill-node', {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        stagger: 0.04,
        ease: 'back.out(2)',
        scrollTrigger: { trigger: containerRef.current, start: 'top 65%' },
      });
      // Center hub pulse
      gsap.to('.arch-hub', {
        scale: 1.08,
        duration: 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    },
    { dependencies: [tiers.length] },
  );

  return (
    <div ref={containerRef} className="architecture-tree">
      <div className="mb-6">
        <h3 className="text-xl font-serif font-semibold tracking-tight">Minimal Flat Registry · 4-Tier Architecture</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Each tier is an independent ring of skills — no inheritance, no orchestrator. Skills communicate
          via standard I/O piping. Hover any node to see its install command.
        </p>
      </div>

      <div className="grid md:grid-cols-[1fr_240px] gap-6 items-start">
        {/* SVG Tree */}
        <div className="flex justify-center">
          <svg
            ref={svgRef}
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="overflow-visible max-w-full h-auto"
            role="img"
            aria-label="Minimal flat registry architecture tree"
          >
            <defs>
              <radialGradient id="hub-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF2E63" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#FF2E63" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Tier rings (concentric circles) */}
            {tierRadii.map((r, i) => (
              <circle
                key={`ring-${i}`}
                className={`arch-ring-${i}`}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={tiers[i].color}
                strokeOpacity={0.2}
                strokeWidth={1.5}
                strokeDasharray="2 4"
              />
            ))}

            {/* Tier labels (top of each ring) */}
            {tiers.map((tier, i) => {
              const r = tierRadii[i];
              const x = cx;
              const y = cy - r - 8;
              return (
                <text
                  key={`tier-label-${tier.id}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  className="text-[11px] font-bold fill-foreground"
                  style={{ fill: tier.color }}
                >
                  {tier.id} · {tier.name}
                </text>
              );
            })}

            {/* Branch connectors: hub → tier ring center point → skill */}
            {tierLayout.map(({ tier, positions }) =>
              positions.map((pos, pi) => {
                // Two-segment branch: from hub (cx,cy) → midpoint on tier ring → skill
                const midR = pos.radius * 0.5;
                const midX = cx + Math.cos(pos.angle) * midR;
                const midY = cy + Math.sin(pos.angle) * midR;
                const path = `M ${cx} ${cy} L ${midX} ${midY} L ${pos.x} ${pos.y}`;
                const isActive = hoveredSkill?.skillId === pos.skill.id;
                return (
                  <path
                    key={`branch-${tier.id}-${pi}`}
                    d={path}
                    className="arch-branch"
                    fill="none"
                    stroke={tier.color}
                    strokeWidth={isActive ? 2.5 : 1}
                    strokeOpacity={isActive ? 0.8 : 0.3}
                  />
                );
              }),
            )}

            {/* Skill nodes */}
            {tierLayout.map(({ tier, positions }) =>
              positions.map((pos, pi) => {
                const isHovered = hoveredSkill?.skillId === pos.skill.id;
                return (
                  <g
                    key={`skill-${tier.id}-${pi}`}
                    className="arch-skill-node origin-center cursor-pointer"
                    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                    onMouseEnter={() => setHoveredSkill({ tierId: tier.id, skillId: pos.skill.id })}
                    onMouseLeave={() => setHoveredSkill(null)}
                    onClick={() => setActiveTier(activeTier === tier.id ? null : tier.id)}
                  >
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isHovered ? 22 : 18}
                      fill={tier.color}
                      fillOpacity={isHovered ? 0.25 : 0.15}
                      stroke={tier.color}
                      strokeWidth={2}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[14px] pointer-events-none"
                    >
                      {pos.skill.emoji}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 32}
                      textAnchor="middle"
                      className="text-[9px] font-mono fill-muted-foreground pointer-events-none"
                    >
                      {pos.skill.id}
                    </text>
                  </g>
                );
              }),
            )}

            {/* Center hub: AI Portal Gateway */}
            <g className="arch-hub origin-center" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
              <circle cx={cx} cy={cy} r={50} fill="url(#hub-grad)" />
              <circle
                cx={cx}
                cy={cy}
                r={32}
                fill="#0a0a0a"
                stroke="#FF2E63"
                strokeWidth={2}
              />
              <text
                x={cx}
                y={cy - 4}
                textAnchor="middle"
                className="text-[10px] font-bold fill-white"
              >
                AI PORTAL
              </text>
              <text
                x={cx}
                y={cy + 8}
                textAnchor="middle"
                className="text-[9px] fill-muted-foreground"
              >
                Gateway
              </text>
            </g>
          </svg>
        </div>

        {/* Side panel: tier info + hovered skill detail */}
        <div className="space-y-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Tiers</div>
          {tiers.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setActiveTier(activeTier === tier.id ? null : tier.id)}
              className={`w-full text-left p-2.5 rounded-md border transition-all ${
                activeTier === tier.id
                  ? 'border-foreground/30 bg-foreground/5'
                  : 'border-transparent hover:border-foreground/10 hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: tier.color }}
                />
                <span className="text-xs font-mono font-bold">{tier.id}</span>
                <span className="text-xs font-semibold">{tier.name}</span>
              </div>
              {activeTier === tier.id && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-[11px] text-muted-foreground leading-relaxed mt-1"
                >
                  {tier.description}
                </motion.p>
              )}
            </button>
          ))}

          <AnimatePresence mode="wait">
            {hoveredSkill && (
              <motion.div
                key={hoveredSkill.skillId}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="border-t pt-3"
              >
                {(() => {
                  const tier = tiers.find((t) => t.id === hoveredSkill.tierId);
                  const skill = tier?.skills.find((s) => s.id === hoveredSkill.skillId);
                  if (!tier || !skill) return null;
                  return (
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {tier.id} · {tier.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{skill.emoji}</span>
                        <div>
                          <div className="text-sm font-semibold">{skill.name}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{skill.id}</div>
                        </div>
                      </div>
                      <code className="block text-[10px] font-mono bg-muted p-2 rounded-md break-all">
                        {skill.install}
                      </code>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer stat: total skills per tier */}
      <div className="grid grid-cols-4 gap-3 mt-6 pt-4 border-t">
        {tiers.map((tier) => (
          <div key={`stat-${tier.id}`}>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: tier.color }}
              />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{tier.id}</span>
            </div>
            <div className="text-lg font-mono font-bold">{tier.skills.length}</div>
            <div className="text-[10px] text-muted-foreground">skills</div>
          </div>
        ))}
      </div>
    </div>
  );
}
