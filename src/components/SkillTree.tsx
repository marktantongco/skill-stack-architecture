'use client';

import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { gsap, useGSAP, ScrollTrigger, DrawSVGPlugin } from '@/lib/gsap-init';

// ─── Types ───
export interface SkillTreeNode {
  id: string;
  name: string;
  tier: number;
  tierName: string;
  emoji: string;
  category: string;
  color: string;
  children?: SkillTreeNode[];
}

interface SkillTreeProps {
  nodes: SkillTreeNode[];
  title?: string;
}

// ─── Tier color mapping ───
const TIER_COLORS: Record<number, string> = {
  0: '#64748B', // Foundation — slate
  1: '#3B82F6', // Interactive — blue
  2: '#8B5CF6', // Visual Asset — violet
  3: '#F59E0B', // Portal — amber
};

const TIER_LABELS: Record<number, string> = {
  0: 'T0',
  1: 'T1',
  2: 'T2',
  3: 'T3',
};

export default function SkillTree({ nodes, title = 'Skill Dependency Tree' }: SkillTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Group nodes by tier
  const tiers = [0, 1, 2, 3].map((t) => nodes.filter((n) => n.tier === t));

  // GSAP: Animate tiers and connectors on scroll
  useGSAP(() => {
    if (prefersReducedMotion) return;

    // Animate each tier row
    tiers.forEach((tierNodes, tierIdx) => {
      gsap.from(`.tier-row-${tierIdx} .tree-node`, {
        x: -40,
        opacity: 0,
        stagger: 0.06,
        duration: 0.5,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: `.tier-row-${tierIdx}`,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    // Draw connector lines
    gsap.from('.tree-connector', {
      drawSVG: '0%',
      stagger: 0.03,
      duration: 0.8,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="w-full">
      {title && (
        <motion.h3
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-lg font-semibold mb-4"
        >
          {title}
        </motion.h3>
      )}

      <div className="space-y-3">
        {tiers.map((tierNodes, tierIdx) => (
          <div key={tierIdx} className={`tier-row-${tierIdx} flex items-center gap-3`}>
            {/* Tier badge */}
            <div
              className="shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono font-bold text-white"
              style={{ backgroundColor: TIER_COLORS[tierIdx] }}
            >
              {TIER_LABELS[tierIdx]}
              <span className="hidden sm:inline text-[9px] font-normal opacity-80">
                {tierNodes[0]?.tierName || ''}
              </span>
            </div>

            {/* Skill nodes */}
            <div className="flex flex-wrap gap-2">
              {tierNodes.map((node) => (
                <SkillTreeNodePill
                  key={node.id}
                  node={node}
                  tierColor={TIER_COLORS[tierIdx]}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Dependency connectors as a small SVG legend */}
      <div className="mt-4 flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1">
          <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#64748B" strokeWidth="1.5" strokeDasharray="4 3" className="tree-connector" /></svg>
          enhances
        </span>
        <span className="flex items-center gap-1">
          <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#3B82F6" strokeWidth="2" /></svg>
          requires
        </span>
        <span className="flex items-center gap-1">
          <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="2 2" /></svg>
          conflicts
        </span>
      </div>
    </div>
  );
}

// ─── Individual Node Pill ───
function SkillTreeNodePill({
  node,
  tierColor,
}: {
  node: SkillTreeNode;
  tierColor: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="tree-node relative cursor-default"
      whileHover={{ scale: 1.08, y: -2 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border"
        style={{
          borderColor: tierColor,
          backgroundColor: `${tierColor}15`,
        }}
      >
        <span className="text-sm">{node.emoji}</span>
        <span className="max-w-[100px] truncate">{node.name}</span>
      </div>

      {/* Tooltip */}
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-popover text-popover-foreground text-[10px] font-mono shadow-lg border pointer-events-none whitespace-nowrap"
        >
          {node.id} · {node.category}
        </motion.div>
      )}
    </motion.div>
  );
}
