'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap-init';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PipeStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  durationMs?: number;
  skillEmoji: string;
}

export interface PipelineFlowProps {
  steps: PipeStep[];
  title?: string;
  subtitle?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<PipeStep['status'], string> = {
  pending: '#94A3B8',
  running: '#3B82F6',
  success: '#10B981',
  failed: '#EF4444',
};

const NODE_WIDTH = 120;
const NODE_HEIGHT = 60;
const STEP_SPACING = 160;
const SVG_PADDING_X = 40;
const SVG_PADDING_Y = 30;
const VERTICAL_STEP_SPACING = 100;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(ms?: number): string {
  if (ms == null) return '';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function useMediaQuery(query: string): boolean {
  const getMatches = useCallback((q: string): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(q).matches;
  }, []);

  const [matches, setMatches] = useState(() => getMatches(query));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);

    // Subscribe to changes — the callback is async (event-driven)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// ─── Node Component ──────────────────────────────────────────────────────────

interface PipeNodeProps {
  step: PipeStep;
  x: number;
  y: number;
  isVertical: boolean;
  reducedMotion: boolean;
  index: number;
}

function PipeNode({ step, x, y, isVertical, reducedMotion, index }: PipeNodeProps) {
  const statusColor = STATUS_COLORS[step.status];
  const nodeId = `node-${step.id}`;
  const isRunning = step.status === 'running';
  const isFailed = step.status === 'failed';

  // Centered position (x/y is the center of the node)
  const rx = x - NODE_WIDTH / 2;
  const ry = y - NODE_HEIGHT / 2;

  return (
    <motion.g
      id={nodeId}
      tabIndex={0}
      role="button"
      aria-label={`${step.label}: ${step.status}${step.durationMs ? `, duration ${formatDuration(step.durationMs)}` : ''}`}
      className="pipe-node"
      data-status={step.status}
      data-index={index}
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      animate={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      whileHover={!reducedMotion ? { scale: 1.05, y: -4 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: index * 0.05 }}
      style={{ originX: `${x}px`, originY: `${y}px` }}
    >
      {/* Glow filter for running state */}
      <defs>
        <filter id={`glow-${step.id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Node background */}
      <rect
        x={rx}
        y={ry}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={12}
        ry={12}
        fill="var(--card)"
        stroke={statusColor}
        strokeWidth={isRunning ? 2.5 : 1.5}
        filter={isRunning ? `url(#glow-${step.id})` : undefined}
        className="transition-stroke duration-300"
      />

      {/* Pulsing ring for running status */}
      {isRunning && !reducedMotion && (
        <rect
          x={rx - 4}
          y={ry - 4}
          width={NODE_WIDTH + 8}
          height={NODE_HEIGHT + 8}
          rx={16}
          ry={16}
          fill="none"
          stroke={statusColor}
          strokeWidth={1}
          opacity={0.4}
          className="animate-pulse"
        />
      )}

      {/* Emoji icon */}
      <text
        x={rx + 16}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={18}
        aria-hidden="true"
      >
        {step.skillEmoji}
      </text>

      {/* Label */}
      <text
        x={rx + 44}
        y={y - 6}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
        fill="var(--foreground)"
        className="truncate"
        aria-hidden="true"
      >
        {step.label.length > 10 ? step.label.slice(0, 9) + '…' : step.label}
      </text>

      {/* Status indicator dot */}
      <circle
        cx={rx + 44}
        cy={y + 12}
        r={4}
        fill={statusColor}
        aria-hidden="true"
      />

      {/* Status text */}
      <text
        x={rx + 54}
        y={y + 12}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={8}
        fill="var(--muted-foreground)"
        className="font-mono"
        aria-hidden="true"
      >
        {step.status}
      </text>

      {/* Duration badge */}
      {step.durationMs != null && (
        <g>
          <rect
            x={rx + NODE_WIDTH - 40}
            y={ry + NODE_HEIGHT - 16}
            width={34}
            height={12}
            rx={4}
            fill={statusColor}
            opacity={0.15}
            aria-hidden="true"
          />
          <text
            x={rx + NODE_WIDTH - 23}
            y={ry + NODE_HEIGHT - 10}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={7}
            fill={statusColor}
            className="font-mono"
            aria-hidden="true"
          >
            {formatDuration(step.durationMs)}
          </text>
        </g>
      )}

      {/* Failed X marker */}
      {isFailed && (
        <g aria-hidden="true">
          <line
            x1={rx + NODE_WIDTH - 14}
            y1={ry + 6}
            x2={rx + NODE_WIDTH - 6}
            y2={ry + 14}
            stroke="#EF4444"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <line
            x1={rx + NODE_WIDTH - 6}
            y1={ry + 6}
            x2={rx + NODE_WIDTH - 14}
            y2={ry + 14}
            stroke="#EF4444"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </g>
      )}
    </motion.g>
  );
}

// ─── Connector Component ─────────────────────────────────────────────────────

interface PipeConnectorProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  status: PipeStep['status'];
  isVertical: boolean;
  stepId: string;
  index: number;
  reducedMotion: boolean;
}

function PipeConnector({
  fromX,
  fromY,
  toX,
  toY,
  status,
  isVertical,
  stepId,
  index,
  reducedMotion,
}: PipeConnectorProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const isFailed = status === 'failed';
  const isRunning = status === 'running';

  // Build path with a slight curve
  const pathD = useMemo(() => {
    if (isVertical) {
      const midY = (fromY + toY) / 2;
      return `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
    }
    const midX = (fromX + toX) / 2;
    return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
  }, [fromX, fromY, toX, toY, isVertical]);

  const strokeColor = isFailed ? '#EF4444' : isRunning ? '#3B82F6' : '#94A3B8';

  return (
    <g aria-label={`Connector to step ${index + 1}`}>
      <path
        ref={pathRef}
        id={`connector-${stepId}`}
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeDasharray="6 4"
        className={`pipe-connector ${isRunning && !reducedMotion ? 'animate-pulse' : ''}`}
        data-connector-index={index}
        aria-hidden="true"
      />
    </g>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PipelineFlow({ steps, title, subtitle }: PipelineFlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const reducedMotion = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isVertical = isMobile;

  // Calculate SVG dimensions
  const viewBox = useMemo(() => {
    if (isVertical) {
      const height = SVG_PADDING_Y * 2 + (steps.length - 1) * VERTICAL_STEP_SPACING + NODE_HEIGHT;
      const width = SVG_PADDING_X * 2 + NODE_WIDTH;
      return `0 0 ${width} ${height}`;
    }
    const width = SVG_PADDING_X * 2 + (steps.length - 1) * STEP_SPACING + NODE_WIDTH;
    const height = SVG_PADDING_Y * 2 + NODE_HEIGHT;
    return `0 0 ${width} ${height}`;
  }, [steps, isVertical]);

  // Compute node positions (centers)
  const positions = useMemo(() => {
    if (isVertical) {
      const cx = SVG_PADDING_X + NODE_WIDTH / 2;
      return steps.map((_, i) => ({
        x: cx,
        y: SVG_PADDING_Y + NODE_HEIGHT / 2 + i * VERTICAL_STEP_SPACING,
      }));
    }
    return steps.map((_, i) => ({
      x: SVG_PADDING_X + NODE_WIDTH / 2 + i * STEP_SPACING,
      y: SVG_PADDING_Y + NODE_HEIGHT / 2,
    }));
  }, [steps, isVertical]);

  // ─── GSAP Animations ────────────────────────────────────────────────────────

  useGSAP(
    () => {
      if (reducedMotion) return;
      if (!svgRef.current) return;

      const ctx = gsap.context(() => {
        // Animate nodes sliding in from bottom with stagger
        const nodes = svgRef.current!.querySelectorAll('.pipe-node');
        gsap.fromTo(
          nodes,
          { y: '+=30', opacity: 0 },
          {
            y: '+=0',
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.12,
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Draw connectors using free strokeDashoffset technique (replaces paid DrawSVG)
        const connectors = svgRef.current!.querySelectorAll('.pipe-connector');
        connectors.forEach((connector, i) => {
          const path = connector as SVGPathElement;
          const total = path.getTotalLength ? path.getTotalLength() : 1;
          path.style.strokeDasharray = `${total}`;
          path.style.strokeDashoffset = `${total}`;
          gsap.to(path, {
            strokeDashoffset: 0,
            duration: 0.8,
            ease: 'power2.inOut',
            delay: i * 0.12 + 0.2,
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          });
        });

        // Running node pulse animation
        const runningNodes = svgRef.current!.querySelectorAll('.pipe-node[data-status="running"]');
        runningNodes.forEach((node) => {
          gsap.to(node, {
            scale: 1.02,
            opacity: 1,
            duration: 0.8,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            transformOrigin: 'center center',
          });
        });
      }, svgRef);

      return () => ctx.revert();
    },
    { scope: svgRef, dependencies: [steps, reducedMotion, isVertical] }
  );

  // ─── Flowing dash animation for connectors ──────────────────────────────────

  useEffect(() => {
    if (reducedMotion) return;
    if (!svgRef.current) return;

    const connectors = svgRef.current.querySelectorAll('.pipe-connector');
    const animators: gsap.core.Tween[] = [];

    connectors.forEach((connector) => {
      const tween = gsap.to(connector, {
        strokeDashoffset: -20,
        duration: 1,
        repeat: -1,
        ease: 'none',
      });
      animators.push(tween);
    });

    return () => {
      animators.forEach((t) => t.kill());
    };
  }, [steps, reducedMotion, isVertical]);

  // ─── Keyboard handler for nodes ─────────────────────────────────────────────

  const handleNodeKeyDown = useCallback(
    (e: React.KeyboardEvent, step: PipeStep) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Announce status to screen readers
        const announcement = `${step.label} — status: ${step.status}${step.durationMs ? `, duration: ${formatDuration(step.durationMs)}` : ''}`;
        const el = document.createElement('div');
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        el.className = 'sr-only';
        el.textContent = announcement;
        document.body.appendChild(el);
        setTimeout(() => document.body.removeChild(el), 1000);
      }
    },
    []
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (steps.length === 0) return null;

  return (
    <motion.div
      ref={containerRef}
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full"
    >
      {/* Title / Subtitle */}
      <AnimatePresence>
        {title && (
          <motion.h3
            initial={reducedMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="text-lg font-semibold mb-1"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {title}
          </motion.h3>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {subtitle && (
          <motion.p
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="font-mono text-xs text-muted-foreground mb-4"
          >
            {subtitle}
          </motion.p>
        )}
      </AnimatePresence>

      {/* SVG Pipeline Diagram */}
      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label={`Pipeline flow diagram with ${steps.length} steps: ${steps.map((s) => s.label).join(', ')}`}
        style={{ maxHeight: isVertical ? `${steps.length * VERTICAL_STEP_SPACING + 80}px` : '120px' }}
      >
        {/* Defs for filters and markers */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#94A3B8" />
          </marker>
          <marker
            id="arrowhead-running"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#3B82F6" />
          </marker>
          <marker
            id="arrowhead-failed"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#EF4444" />
          </marker>
        </defs>

        {/* Connectors (rendered first, behind nodes) */}
        {positions.slice(0, -1).map((pos, i) => {
          const nextPos = positions[i + 1];
          const nextStep = steps[i + 1];
          const connectorEndOffset = isVertical ? -NODE_HEIGHT / 2 : -NODE_WIDTH / 2;
          const connectorStartOffset = isVertical ? NODE_HEIGHT / 2 : NODE_WIDTH / 2;

          return (
            <PipeConnector
              key={`connector-${steps[i].id}`}
              fromX={isVertical ? pos.x : pos.x + connectorStartOffset}
              fromY={isVertical ? pos.y + connectorStartOffset : pos.y}
              toX={isVertical ? nextPos.x : nextPos.x + connectorEndOffset}
              toY={isVertical ? nextPos.y + connectorEndOffset : nextPos.y}
              status={nextStep.status}
              isVertical={isVertical}
              stepId={steps[i].id}
              index={i}
              reducedMotion={reducedMotion ?? false}
            />
          );
        })}

        {/* Nodes */}
        {positions.map((pos, i) => (
          <g
            key={`node-wrapper-${steps[i].id}`}
            onKeyDown={(e) => handleNodeKeyDown(e as unknown as React.KeyboardEvent, steps[i])}
          >
            <PipeNode
              step={steps[i]}
              x={pos.x}
              y={pos.y}
              isVertical={isVertical}
              reducedMotion={reducedMotion ?? false}
              index={i}
            />
          </g>
        ))}
      </svg>

      {/* Step legend (visible on mobile for clarity) */}
      {isVertical && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {steps.map((step) => (
            <span key={step.id} className="flex items-center gap-1">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[step.status] }}
              />
              {step.label}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
