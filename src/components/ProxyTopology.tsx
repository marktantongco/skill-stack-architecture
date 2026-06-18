'use client';

import { useRef, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap-init';

// ─── Types ───
export interface ProxyNode {
  id: string;
  name: string;
  type: string;
  emoji: string;
  color: string;
  description: string;
  metrics: { label: string; value: number; max: number }[];
}

interface ProxyTopologyProps {
  proxies: ProxyNode[];
  title?: string;
}

// ─── Layout constants ───
const NODE_RADIUS = 36;
const CENTER_RADIUS = 52;

export default function ProxyTopology({ proxies, title = 'Proxy Architecture Topology' }: ProxyTopologyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Calculate positions in a radial layout
  const centerX = 300;
  const centerY = 220;
  const orbitRadius = 150;

  const positions = proxies.map((proxy, i) => {
    const angle = (i / proxies.length) * Math.PI * 2 - Math.PI / 2;
    return {
      x: centerX + Math.cos(angle) * orbitRadius,
      y: centerY + Math.sin(angle) * orbitRadius,
      ...proxy,
      angle,
    };
  });

  const selectedProxy = positions.find((p) => p.id === selected);

  // GSAP: Animate nodes in and pulse connectors
  useGSAP(() => {
    if (prefersReducedMotion) return;

    gsap.from('.proxy-node', {
      scale: 0,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });

    gsap.from('.proxy-connector', {
      strokeDashoffset: 200,
      stagger: 0.08,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 85%',
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

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox="0 0 600 440"
          className="w-full max-w-2xl mx-auto"
          role="img"
          aria-label="Proxy architecture topology diagram"
        >
          <defs>
            <filter id="proxy-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <radialGradient id="center-grad">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.05" />
            </radialGradient>
          </defs>

          {/* Center hub */}
          <circle cx={centerX} cy={centerY} r={CENTER_RADIUS} fill="url(#center-grad)" stroke="var(--accent)" strokeWidth="1.5" opacity="0.8" />
          <text x={centerX} y={centerY - 6} textAnchor="middle" fill="var(--foreground)" fontSize="11" fontWeight="600" fontFamily="serif">Skill</text>
          <text x={centerX} y={centerY + 10} textAnchor="middle" fill="var(--foreground)" fontSize="11" fontWeight="600" fontFamily="serif">Router</text>

          {/* Connectors from center to each proxy */}
          {positions.map((pos) => (
            <line
              key={`conn-${pos.id}`}
              className="proxy-connector"
              x1={centerX}
              y1={centerY}
              x2={pos.x}
              y2={pos.y}
              stroke={pos.color}
              strokeWidth="1.5"
              strokeDasharray="6 4"
              opacity={selected && selected !== pos.id ? 0.2 : 0.6}
              style={{ transition: 'opacity 0.3s ease' }}
            />
          ))}

          {/* Proxy nodes */}
          {positions.map((pos) => (
            <g
              key={pos.id}
              className="proxy-node"
              style={{ cursor: 'pointer' }}
              onClick={() => setSelected(selected === pos.id ? null : pos.id)}
              role="button"
              tabIndex={0}
              aria-label={`${pos.name}: ${pos.type} proxy`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelected(selected === pos.id ? null : pos.id);
                }
              }}
            >
              {/* Glow ring */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={NODE_RADIUS + 4}
                fill="none"
                stroke={pos.color}
                strokeWidth="1"
                opacity={selected === pos.id ? 0.6 : 0.2}
                style={{ transition: 'opacity 0.3s ease' }}
              />
              {/* Node circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={NODE_RADIUS}
                fill={`${pos.color}20`}
                stroke={pos.color}
                strokeWidth={selected === pos.id ? 2.5 : 1.5}
                style={{ transition: 'stroke-width 0.2s ease' }}
              />
              {/* Emoji */}
              <text
                x={pos.x}
                y={pos.y - 4}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="18"
              >
                {pos.emoji}
              </text>
              {/* Label */}
              <text
                x={pos.x}
                y={pos.y + 14}
                textAnchor="middle"
                fill="var(--foreground)"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="500"
              >
                {pos.name.length > 10 ? pos.name.slice(0, 9) + '…' : pos.name}
              </text>
            </g>
          ))}

          {/* Inter-proxy connections (selected) */}
          {selected && positions
            .filter((p) => p.id !== selected)
            .map((p) => (
              <line
                key={`inter-${selected}-${p.id}`}
                x1={positions.find((x) => x.id === selected)?.x}
                y1={positions.find((x) => x.id === selected)?.y}
                x2={p.x}
                y2={p.y}
                stroke={p.color}
                strokeWidth="0.5"
                strokeDasharray="2 3"
                opacity="0.3"
              />
            ))}
        </svg>

        {/* Selected proxy detail panel */}
        <AnimatePresence>
          {selectedProxy && (
            <motion.div
              initial={{ opacity: 0, y: 8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="mt-3 p-4 rounded-lg border"
              style={{ borderColor: selectedProxy.color + '40', backgroundColor: selectedProxy.color + '08' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{selectedProxy.emoji}</span>
                <span className="font-serif font-semibold">{selectedProxy.name}</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted">{selectedProxy.type}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{selectedProxy.description}</p>

              {/* Mini metric bars */}
              <div className="space-y-2">
                {selectedProxy.metrics.map((m) => (
                  <div key={m.label} className="flex items-center gap-2">
                    <span className="font-mono text-[10px] w-20 text-right text-muted-foreground">{m.label}</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(m.value / m.max) * 100}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: selectedProxy.color }}
                      />
                    </div>
                    <span className="font-mono text-[10px] w-8">{m.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
