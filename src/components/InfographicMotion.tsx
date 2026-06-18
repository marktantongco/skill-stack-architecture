'use client';

/**
 * InfographicMotion.tsx — Reusable infographic-motion primitives.
 * ────────────────────────────────────────────────────────────────────────────
 * A small library of animated infographic primitives that combine GSAP and
 * Framer Motion in the patterns established in gsap-hybrid.ts:
 *
 *   • <AnimatedCounter>      — GSAP-tweened number counter, scroll-triggered.
 *   • <ProgressArc>          — Circular SVG progress with stroke-draw animation.
 *   • <StatBlock>            — Big number + label + delta, infographic style.
 *   • <BarMeter>             — Horizontal bar with scroll-reveal fill.
 *   • <OrbitingDots>         — Decorative orbital motion for hero pieces.
 *   • <Marquee>              — Infinite-scrolling text/element strip.
 *
 * All components honor prefers-reduced-motion (via useGsapTimeline).
 */

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useGsapTimeline } from '@/lib/gsap-hybrid';
import { TrendingUp, TrendingDown } from 'lucide-react';

// ─── AnimatedCounter ─────────────────────────────────────────────────────────
interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 2,
  className = '',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGsapTimeline(
    ref as React.RefObject<HTMLSpanElement | null>,
    (gsap) => {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: value,
        duration,
        ease: 'power1.out',
        scrollTrigger: { trigger: ref.current, start: 'top 85%' },
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = `${prefix}${obj.val.toFixed(decimals)}${suffix}`;
          }
        },
      });
    },
    { dependencies: [value, decimals, suffix, prefix, duration] },
  );

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}

// ─── ProgressArc ──────────────────────────────────────────────────────────────
interface ProgressArcProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
}

export function ProgressArc({
  value,
  size = 120,
  strokeWidth = 8,
  color = '#08F7FE',
  trackColor = 'currentColor',
  label,
  sublabel,
}: ProgressArcProps) {
  const ref = useRef<HTMLDivElement>(null);
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  useGsapTimeline(
    ref as React.RefObject<HTMLDivElement | null>,
    (gsap) => {
      gsap.fromTo(
        '.progress-arc-fill',
        { strokeDashoffset: circumference },
        {
          strokeDashoffset: circumference - (circumference * Math.min(100, Math.max(0, value))) / 100,
          duration: 1.6,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: ref.current, start: 'top 80%' },
        },
      );
    },
    { dependencies: [value, circumference] },
  );

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible">
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeOpacity={0.1}
            strokeWidth={strokeWidth}
          />
          <circle
            className="progress-arc-fill"
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedCounter value={value} suffix="%" className="text-xl font-mono font-bold" />
          {sublabel && (
            <span className="text-[10px] text-muted-foreground mt-0.5">{sublabel}</span>
          )}
        </div>
      </div>
      {label && (
        <span className="text-xs font-medium text-muted-foreground mt-2">{label}</span>
      )}
    </div>
  );
}

// ─── StatBlock ────────────────────────────────────────────────────────────────
interface StatBlockProps {
  value: number;
  label: string;
  delta?: number; // positive/negative percentage change
  suffix?: string;
  prefix?: string;
  decimals?: number;
  accentColor?: string;
}

export function StatBlock({
  value,
  label,
  delta,
  suffix = '',
  prefix = '',
  decimals = 0,
  accentColor = 'text-foreground',
}: StatBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="p-4 rounded-lg border bg-card/50"
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <AnimatedCounter
          value={value}
          suffix={suffix}
          prefix={prefix}
          decimals={decimals}
          className={`text-2xl font-mono font-bold ${accentColor}`}
        />
        {typeof delta === 'number' && (
          <span
            className={`inline-flex items-center text-xs font-medium ${
              delta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {delta >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── BarMeter ──────────────────────────────────────────────────────────────────
interface BarMeterProps {
  value: number; // 0-100
  label: string;
  valueLabel?: string;
  color?: string;
  height?: number;
}

export function BarMeter({
  value,
  label,
  valueLabel,
  color = '#08F7FE',
  height = 8,
}: BarMeterProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGsapTimeline(
    ref as React.RefObject<HTMLDivElement | null>,
    (gsap) => {
      gsap.fromTo(
        '.bar-meter-fill',
        { width: '0%' },
        {
          width: `${Math.min(100, Math.max(0, value))}%`,
          duration: 1.4,
          ease: 'power2.out',
          scrollTrigger: { trigger: ref.current, start: 'top 85%' },
        },
      );
    },
    { dependencies: [value] },
  );

  return (
    <div ref={ref}>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-xs font-mono text-muted-foreground">{valueLabel ?? `${value}%`}</span>
      </div>
      <div
        className="w-full bg-muted rounded-full overflow-hidden"
        style={{ height }}
      >
        <div
          className="bar-meter-fill h-full rounded-full"
          style={{ backgroundColor: color, width: '0%' }}
        />
      </div>
    </div>
  );
}

// ─── OrbitingDots ──────────────────────────────────────────────────────────────
interface OrbitingDotsProps {
  count?: number;
  radius?: number;
  size?: number;
  color?: string;
  duration?: number;
}

export function OrbitingDots({
  count = 3,
  radius = 32,
  size = 4,
  color = '#FF2E63',
  duration = 12,
}: OrbitingDotsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGsapTimeline(
    ref as React.RefObject<HTMLDivElement | null>,
    (gsap) => {
      gsap.to('.orbiting-group', {
        rotation: 360,
        duration,
        ease: 'none',
        repeat: -1,
        transformOrigin: 'center center',
      });
    },
    { requiresMotion: true },
  );

  return (
    <div ref={ref} className="relative" style={{ width: radius * 2 + size, height: radius * 2 + size }}>
      <div
        className="orbiting-group absolute"
        style={{
          width: radius * 2,
          height: radius * 2,
          left: size / 2,
          top: size / 2,
        }}
      >
        {Array.from({ length: count }).map((_, i) => {
          const angle = (i / count) * Math.PI * 2;
          const x = radius + Math.cos(angle) * radius - size / 2;
          const y = radius + Math.sin(angle) * radius - size / 2;
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                backgroundColor: color,
                left: x,
                top: y,
                boxShadow: `0 0 8px ${color}`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Marquee ───────────────────────────────────────────────────────────────────
interface MarqueeProps {
  children: React.ReactNode;
  speed?: number; // seconds per loop
  reverse?: boolean;
  className?: string;
}

export function Marquee({ children, speed = 20, reverse = false, className = '' }: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGsapTimeline(
    ref as React.RefObject<HTMLDivElement | null>,
    (gsap) => {
      gsap.to('.marquee-track', {
        x: reverse ? '0%' : '-50%',
        duration: speed,
        ease: 'none',
        repeat: -1,
      });
    },
    { requiresMotion: true, dependencies: [speed, reverse] },
  );

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <div className="marquee-track flex gap-4 w-max" style={{ transform: 'translateX(0%)' }}>
        {children}
        {children}
      </div>
    </div>
  );
}

// ─── InfographicDashboard (composed demo) ──────────────────────────────────────
export function InfographicDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-serif font-semibold tracking-tight mb-1">Infographic Motion System</h3>
        <p className="text-sm text-muted-foreground">
          Reusable primitives combining GSAP scroll-triggered tweens with Framer Motion entrance/exit.
          Every component respects <code className="text-xs">prefers-reduced-motion</code>.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBlock label="Skills Indexed" value={64} delta={12} suffix="" />
        <StatBlock label="Avg Latency" value={284} suffix="ms" delta={-8} accentColor="text-emerald-600 dark:text-emerald-400" />
        <StatBlock label="Success Rate" value={98.4} suffix="%" decimals={1} delta={2} accentColor="text-cyan-600 dark:text-cyan-400" />
        <StatBlock label="Bundle KB" value={32.4} suffix="KB" decimals={1} delta={-15} accentColor="text-amber-600 dark:text-amber-400" />
      </div>

      <div className="grid md:grid-cols-3 gap-4 p-6 rounded-lg border bg-card/30">
        <div className="flex flex-col items-center">
          <ProgressArc value={87} label="Test Coverage" sublabel="lines" color="#10b981" />
        </div>
        <div className="flex flex-col items-center">
          <ProgressArc value={64} label="Type Safety" sublabel="strict" color="#08F7FE" />
        </div>
        <div className="flex flex-col items-center">
          <ProgressArc value={92} label="A11y Score" sublabel="WCAG" color="#FF2E63" />
        </div>
      </div>

      <div className="space-y-3 p-4 rounded-lg border">
        <div className="text-xs font-semibold text-muted-foreground mb-2">Skill Distribution by Category</div>
        <BarMeter label="Design & UI" value={28} valueLabel="18 skills" color="#BFFF00" />
        <BarMeter label="Reasoning" value={18} valueLabel="12 skills" color="#08F7FE" />
        <BarMeter label="Development" value={22} valueLabel="14 skills" color="#00FF9D" />
        <BarMeter label="Content" value={14} valueLabel="9 skills" color="#FF2E63" />
        <BarMeter label="Strategy" value={10} valueLabel="6 skills" color="#FFE600" />
        <BarMeter label="System" value={8} valueLabel="5 skills" color="#A8B2D8" />
      </div>
    </div>
  );
}
