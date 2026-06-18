'use client';

/**
 * SkillPipeline.tsx — Animated SVG pipeline diagram showing skill invocation flow.
 * ────────────────────────────────────────────────────────────────────────────
 * Visualizes the I/O piping pattern: Skill A → Skill B → Skill C
 * with status indicators, duration badges, and a flowing data pulse along the
 * connecting paths (GSAP-driven).
 *
 * Hybrid motion:
 *  • GSAP: strokeDashoffset draw on connectors + flowing dash animation.
 *  • Framer Motion: node card entrance stagger + status change transitions.
 */

import { useRef, useState, useEffect } from 'react';
import { useGsapTimeline } from '@/lib/gsap-hybrid';
import { skills, type SkillInvocation } from '@/lib/skill-data';
import { Play, Pause, RotateCcw, CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';

// Sample invocation chain — demonstrates the I/O piping pattern
const sampleInvocations: SkillInvocation[] = [
  {
    id: 'inv-1',
    skillId: 'S15',
    input: { prompt: 'Generate hero section for fintech dashboard' },
    output: { heroLayout: 'split-screen', recommendedSkills: ['S02', 'S03'] },
    status: 'success',
    durationMs: 1240,
    invokedAt: Date.now() - 5000,
    completedAt: Date.now() - 3760,
  },
  {
    id: 'inv-2',
    skillId: 'S16',
    input: { heroLayout: 'split-screen', recommendedSkills: ['S02', 'S03'] },
    output: { sp7Scores: [5, 4, 3, 5, 2, 3, 3], weightedScore: 27.0 },
    status: 'success',
    durationMs: 890,
    invokedAt: Date.now() - 3500,
    completedAt: Date.now() - 2610,
  },
  {
    id: 'inv-3',
    skillId: 'S14',
    input: { sp7Scores: [5, 4, 3, 5, 2, 3, 3], weightedScore: 27.0 },
    output: { rankedSkills: ['S02', 'S03', 'S05'], installOrder: ['S03', 'S02', 'S05'] },
    status: 'success',
    durationMs: 450,
    invokedAt: Date.now() - 2000,
    completedAt: Date.now() - 1550,
  },
  {
    id: 'inv-4',
    skillId: 'S03',
    input: { rankedSkills: ['S02', 'S03', 'S05'], installOrder: ['S03', 'S02', 'S05'] },
    output: { designSystem: { palette: 'Editorial', typography: 'Inter + Playfair' } },
    status: 'running',
    invokedAt: Date.now() - 1000,
  },
  {
    id: 'inv-5',
    skillId: 'S02',
    input: {},
    status: 'pending',
    invokedAt: Date.now(),
  },
];

interface StatusCfg {
  color: string;
  bg: string;
  icon: typeof Clock;
  label: string;
  spin?: boolean;
}

const statusConfig: Record<SkillInvocation['status'], StatusCfg> = {
  pending: { color: '#94a3b8', bg: 'bg-slate-100 dark:bg-slate-900/40', icon: Clock, label: 'Pending' },
  running: { color: '#08F7FE', bg: 'bg-cyan-50 dark:bg-cyan-950/30', icon: Loader2, label: 'Running', spin: true },
  success: { color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-950/30', icon: CheckCircle2, label: 'Success' },
  failed: { color: '#ef4444', bg: 'bg-red-50 dark:bg-red-950/30', icon: XCircle, label: 'Failed' },
};

export function SkillPipeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [running, setRunning] = useState(false);
  const [pulseIdx, setPulseIdx] = useState(0);

  const pipeline = sampleInvocations;
  const nodeCount = pipeline.length;
  const nodeWidth = 200;
  const nodeHeight = 110;
  const nodeGap = 80;
  const totalWidth = nodeCount * nodeWidth + (nodeCount - 1) * nodeGap;
  const svgHeight = nodeHeight + 80;

  // GSAP: animate flowing dashes along the connectors
  useGsapTimeline(
    svgRef as React.RefObject<SVGSVGElement | null>,
    (gsap) => {
      // Draw connector lines
      gsap.utils.toArray<SVGPathElement>('.pipeline-connector').forEach((path) => {
        const total = path.getTotalLength();
        path.style.strokeDasharray = `${total * 0.4} ${total * 0.6}`;
        path.style.strokeDashoffset = `${total}`;
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.2,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: containerRef.current, start: 'top 75%' },
        });
      });
      // Continuous flowing pulse along connectors
      gsap.to('.pipeline-connector', {
        strokeDashoffset: '-=100',
        duration: 3,
        ease: 'none',
        repeat: -1,
      });
      // Node entrance
      gsap.from('.pipeline-node', {
        opacity: 0,
        y: 24,
        scale: 0.85,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.4)',
        scrollTrigger: { trigger: containerRef.current, start: 'top 70%' },
      });
    },
    { dependencies: [nodeCount] },
  );

  // Cycle pulse position for live indicator
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setPulseIdx((p) => (p + 1) % nodeCount);
    }, 1200);
    return () => clearInterval(interval);
  }, [running, nodeCount]);

  return (
    <div ref={containerRef} className="skill-pipeline">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h3 className="text-xl font-serif font-semibold tracking-tight">Skill Invocation Pipeline</h3>
          <p className="text-sm text-muted-foreground mt-1">
            I/O piping pattern — each skill&apos;s output is fed to the next as JSON. The Minimal Flat Registry
            model: no orchestrator, no stack, just standard input/output.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRunning(!running)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            {running ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {running ? 'Pause' : 'Run'}
          </button>
          <button
            onClick={() => setPulseIdx(0)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-muted hover:bg-muted/70 text-muted-foreground transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2 px-2 pb-4">
        <svg
          ref={svgRef}
          width={totalWidth}
          height={svgHeight}
          viewBox={`0 0 ${totalWidth} ${svgHeight}`}
          className="overflow-visible min-w-full"
          role="img"
          aria-label="Skill invocation pipeline diagram"
        >
          {/* Definitions: gradient for connectors */}
          <defs>
            <linearGradient id="connector-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#08F7FE" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#08F7FE" stopOpacity="1" />
              <stop offset="100%" stopColor="#08F7FE" stopOpacity="0.4" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connectors between nodes */}
          {pipeline.slice(0, -1).map((_, i) => {
            const x1 = (i + 1) * nodeWidth + i * nodeGap;
            const x2 = (i + 1) * nodeWidth + i * nodeGap + nodeGap;
            const y = nodeHeight / 2 + 20;
            const midX = (x1 + x2) / 2;
            const path = `M ${x1} ${y} C ${midX} ${y}, ${midX} ${y}, ${x2} ${y}`;
            return (
              <g key={`conn-${i}`}>
                <path
                  d={path}
                  className="pipeline-connector"
                  fill="none"
                  stroke="url(#connector-grad)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
                {/* Arrow head */}
                <polygon
                  points={`${x2 - 6},${y - 4} ${x2},${y} ${x2 - 6},${y + 4}`}
                  fill="#08F7FE"
                  opacity={0.8}
                />
              </g>
            );
          })}

          {/* Node cards (foreignObject lets us use HTML/Tailwind inside SVG) */}
          {pipeline.map((inv, i) => {
            const skill = skills.find((s) => s.id === inv.skillId);
            const x = i * (nodeWidth + nodeGap);
            const y = 20;
            const status = statusConfig[inv.status];
            const StatusIcon = status.icon;
            const isActive = pulseIdx === i && running;
            return (
              <foreignObject
                key={inv.id}
                x={x}
                y={y}
                width={nodeWidth}
                height={nodeHeight}
                className={`pipeline-node ${status.bg}`}
              >
                <div
                  className={`h-full w-full rounded-lg border-2 p-3 flex flex-col justify-between transition-all ${
                    isActive ? 'border-cyan-400 shadow-[0_0_24px_rgba(8,247,254,0.35)]' : 'border-current/10'
                  }`}
                  style={{ borderColor: isActive ? status.color : undefined }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base flex-shrink-0" aria-hidden>{skill?.emoji ?? '?'}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-mono text-muted-foreground">{inv.skillId}</div>
                        <div className="text-sm font-semibold truncate">
                          {skill?.name.split('–')[0].trim() ?? 'Unknown'}
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ backgroundColor: `${status.color}20`, color: status.color }}
                    >
                      <StatusIcon className={`w-3 h-3 ${status.spin && inv.status === 'running' ? 'animate-spin' : ''}`} />
                      {status.label}
                    </div>
                  </div>

                  <div className="space-y-1 text-[10px] text-muted-foreground">
                    {inv.durationMs ? (
                      <div className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span className="font-mono">{inv.durationMs}ms</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 opacity-50">
                        <Clock className="w-2.5 h-2.5" />
                        <span className="font-mono">—</span>
                      </div>
                    )}
                    {inv.output ? (
                      <div className="truncate font-mono text-[9px]">
                        → {Object.keys(inv.output).slice(0, 2).join(', ')}
                        {Object.keys(inv.output).length > 2 ? '...' : ''}
                      </div>
                    ) : (
                      <div className="truncate font-mono text-[9px] opacity-50">→ (pending)</div>
                    )}
                  </div>
                </div>
              </foreignObject>
            );
          })}
        </svg>
      </div>

      {/* Stats footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-4 border-t">
        <Stat label="Total Skills" value={String(nodeCount)} accent="text-foreground" />
        <Stat
          label="Success Rate"
          value={`${Math.round((pipeline.filter((p) => p.status === 'success').length / pipeline.length) * 100)}%`}
          accent="text-emerald-600 dark:text-emerald-400"
        />
        <Stat
          label="Avg Duration"
          value={`${Math.round(pipeline.filter((p) => p.durationMs).reduce((a, p) => a + (p.durationMs ?? 0), 0) / Math.max(1, pipeline.filter((p) => p.durationMs).length))}ms`}
          accent="text-cyan-600 dark:text-cyan-400"
        />
        <Stat
          label="Pipeline Status"
          value={pipeline.some((p) => p.status === 'running') ? 'Active' : pipeline.every((p) => p.status === 'success') ? 'Complete' : 'Paused'}
          accent="text-amber-600 dark:text-amber-400"
        />
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</div>
      <div className={`text-lg font-mono font-bold ${accent}`}>{value}</div>
    </div>
  );
}
