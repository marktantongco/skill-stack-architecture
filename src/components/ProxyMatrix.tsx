'use client';

/**
 * ProxyMatrix.tsx — Creative comparison matrix for the 6 proxy types.
 * ────────────────────────────────────────────────────────────────────────────
 * Dolphin-designed centerpiece for the Proxy subpage. Five creative lenses
 * on the same 6 proxy types, switchable via tabs:
 *
 *   1. MATRIX     — Heatmap grid (proxy × dimension). Cell hue encodes score.
 *   2. SIGNAL     — Signal-to-noise metaphor. Each proxy shown as a radio
 *                   waveform; clean signal = transparent, noisy = mesh.
 *   3. TRAFFIC    — Traffic-light decision system. Each proxy gets R/Y/G
 *                   across 5 fit dimensions, with a verdict banner.
 *   4. GAUGES     — Speedometer-style performance gauges. Latency, complexity,
 *                   resilience, observability, trust.
 *   5. METAPHOR   — Side-by-side "what this proxy feels like" cards with
 *                   analogy artwork (psychology/economics/science).
 *
 * Hybrid motion:
 *  • GSAP: cell-by-cell heatmap reveal, gauge needle sweep, waveform draw.
 *  • Framer Motion: tab transition (AnimatePresence), card hover lift.
 */

import { useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGsapTimeline } from '@/lib/gsap-hybrid';
import {
  Globe, Shield, ArrowRight, Layers, Zap, Fingerprint,
  Activity, Gauge, Radio, TrafficCone, Sparkles, type LucideIcon,
} from 'lucide-react';

interface ProxyType {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  icon: LucideIcon;
  color: string;
  scores: {
    trust: number; latency: number; complexity: number;
    resilience: number; visibility: number; fit: number;
  };
  psychology: string;
  economics: string;
  science: string;
  strengths: string[];
  weaknesses: string[];
  howWeStandOut: string;
}

const proxyTypes: ProxyType[] = [
  {
    id: 'transparent',
    name: 'Transparent Proxy',
    shortName: 'Transparent',
    tagline: 'Full visibility, zero privacy',
    icon: Globe,
    color: '#10b981',
    scores: { trust: 5, latency: 1, complexity: 1, resilience: 2, visibility: 5, fit: 4 },
    psychology: 'Open-plan office. Panopticon effect — behavior changes when watched.',
    economics: 'Commodity market. Price competition dominates, margins compress.',
    science: 'Control variable in an experiment. Holds everything constant.',
    strengths: ['Zero config', 'Full visibility', 'Easy debugging', 'No trust boundary'],
    weaknesses: ['No privacy', 'Vulnerable to interception', 'Cannot bypass geo'],
    howWeStandOut: 'Our skill stack is a transparent proxy for AI intent — every routing decision is auditable.',
  },
  {
    id: 'reverse',
    name: 'Reverse Proxy',
    shortName: 'Reverse',
    tagline: 'Bouncer at the backend club',
    icon: Shield,
    color: '#3b82f6',
    scores: { trust: 4, latency: 2, complexity: 3, resilience: 4, visibility: 4, fit: 5 },
    psychology: 'Exclusive club bouncer. Controls who enters, confers authority, creates scarcity.',
    economics: 'Natural monopoly. AWS is the reverse proxy for millions. Value accrues to intermediary.',
    science: 'Cell membrane — selectively permeable. Actively transports molecules, consumes energy.',
    strengths: ['Load balancing', 'SSL termination', 'Caching layer', 'Security hardening'],
    weaknesses: ['Single point of failure', 'Added latency', 'Complex config'],
    howWeStandOut: 'SP-7 scoring is a reverse proxy for design decisions — intercepts raw selections, validates 7 dims.',
  },
  {
    id: 'forward',
    name: 'Forward Proxy',
    shortName: 'Forward',
    tagline: 'Anonymous outbound routing',
    icon: ArrowRight,
    color: '#f59e0b',
    scores: { trust: 3, latency: 3, complexity: 2, resilience: 3, visibility: 2, fit: 4 },
    psychology: 'Trusted mail intermediary. Plausible deniability, psychological safety, moral hazard.',
    economics: 'Marketplace for anonymity. Product is trust, not throughput. Premium for premium trust.',
    science: 'Catalyst in chemistry. Lowers activation energy, isn\'t consumed in the process.',
    strengths: ['Privacy protection', 'Geo-bypass', 'Access control', 'Content filtering'],
    weaknesses: ['Trust in intermediary', 'MITM risk', 'Performance overhead'],
    howWeStandOut: 'AI Portal Gateway is a forward proxy for skill discovery — describe intent, route to optimal skill.',
  },
  {
    id: 'mesh',
    name: 'Service Mesh',
    shortName: 'Mesh',
    tagline: 'Sidecar diplomacy everywhere',
    icon: Layers,
    color: '#a855f7',
    scores: { trust: 5, latency: 4, complexity: 5, resilience: 5, visibility: 5, fit: 3 },
    psychology: 'Diplomatic corps between nations. Each sidecar speaks for its service. Overhead justifies itself.',
    economics: 'Interstate highway system. Enormous upfront, unlocks 100x economic activity.',
    science: 'Extracellular matrix in biology. Non-cellular, structural, essential for multicellular life.',
    strengths: ['Zero-trust security', 'Observability', 'Circuit breaking', 'Gradual rollouts'],
    weaknesses: ['Massive complexity', 'Performance overhead', 'Steep learning curve'],
    howWeStandOut: '4-tier architecture (T0-T3) is a service mesh for AI skills — sidecar capabilities without Istio.',
  },
  {
    id: 'circuit',
    name: 'Circuit Breaker Proxy',
    shortName: 'Circuit',
    tagline: 'Sacrifices itself to save the system',
    icon: Zap,
    color: '#ef4444',
    scores: { trust: 3, latency: 2, complexity: 3, resilience: 5, visibility: 3, fit: 4 },
    psychology: 'Fuse box. Sacrifices itself to protect. Constant tripping creates learned helplessness.',
    economics: 'Insurance. Pay small premium (latency) to avoid catastrophic loss (outage).',
    science: 'Action potential threshold in neurons. Fires above threshold, then refractory period.',
    strengths: ['Prevents cascade failures', 'Graceful degradation', 'Fast recovery', 'Self-healing'],
    weaknesses: ['Premature trip risk', 'Config complexity', 'Cold start problems'],
    howWeStandOut: 'Basket export includes circuit-breaker logic — fail documents and continues, not halts.',
  },
  {
    id: 'identity',
    name: 'Identity-Aware Proxy',
    shortName: 'Identity',
    tagline: 'Passport control for every request',
    icon: Fingerprint,
    color: '#06b6d4',
    scores: { trust: 5, latency: 3, complexity: 4, resilience: 4, visibility: 4, fit: 5 },
    psychology: 'Passport control. In-group fast lanes, out-group scrutiny. Morally fraught.',
    economics: 'Two-sided market. Credit score becomes the product, more valuable than underlying service.',
    science: 'MHC molecules in immune system. Present fragments to T-cells. Misidentification = autoimmunity.',
    strengths: ['Zero-trust architecture', 'Fine-grained access', 'Audit trail', 'Compliance ready'],
    weaknesses: ['Identity sprawl', 'SSO risk', 'Privacy trade-offs'],
    howWeStandOut: 'Skill tagging IS the identity layer — tags determine routing, scoring, compatibility.',
  },
];

interface DimDef {
  id: string;
  label: string;
  icon: LucideIcon;
  inverted?: boolean;
}

const dimensions: DimDef[] = [
  { id: 'trust', label: 'Trust', icon: Shield },
  { id: 'latency', label: 'Latency', icon: Activity, inverted: true }, // lower is better
  { id: 'complexity', label: 'Complexity', icon: Layers, inverted: true },
  { id: 'resilience', label: 'Resilience', icon: Zap },
  { id: 'visibility', label: 'Visibility', icon: Globe },
  { id: 'fit', label: 'Stack Fit', icon: Sparkles },
];

type TabId = 'matrix' | 'signal' | 'traffic' | 'gauges' | 'metaphor';
const tabs: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'matrix', label: 'Heat Matrix', icon: Layers },
  { id: 'signal', label: 'Signal / Noise', icon: Radio },
  { id: 'traffic', label: 'Traffic Light', icon: TrafficCone },
  { id: 'gauges', label: 'Performance', icon: Gauge },
  { id: 'metaphor', label: 'Metaphor', icon: Sparkles },
];

export function ProxyMatrix() {
  const [activeTab, setActiveTab] = useState<TabId>('matrix');
  const [selectedProxy, setSelectedProxy] = useState<string>('reverse');

  return (
    <div className="proxy-matrix space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="text-2xl font-serif font-semibold tracking-tight">
            6 Proxy Types · 5 Creative Lenses
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Same data, different ways to see it. Switch lenses to discover which proxy fits your
            architecture — each tab reveals a different truth.
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/60 border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="proxy-tab-bg"
                    className="absolute inset-0 rounded-md bg-foreground"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10 hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'matrix' && <HeatMatrixView onSelect={setSelectedProxy} selected={selectedProxy} />}
          {activeTab === 'signal' && <SignalNoiseView />}
          {activeTab === 'traffic' && <TrafficLightView />}
          {activeTab === 'gauges' && <GaugeView />}
          {activeTab === 'metaphor' && <MetaphorView />}
        </motion.div>
      </AnimatePresence>

      {/* Selected proxy detail card — persistent across tabs */}
      <SelectedProxyDetail proxyId={selectedProxy} />
    </div>
  );
}

// ─── 1. Heat Matrix ────────────────────────────────────────────────────────────
function HeatMatrixView({ onSelect, selected }: { onSelect: (id: string) => void; selected: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGsapTimeline(
    ref as React.RefObject<HTMLDivElement | null>,
    (gsap) => {
      gsap.from('.heat-cell', {
        scale: 0.6,
        opacity: 0,
        duration: 0.35,
        stagger: { each: 0.025, from: 'start' },
        ease: 'back.out(1.6)',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      });
    },
    { dependencies: [] },
  );

  // Map score (1-5) to a hue: low=warm red, high=cool green
  const scoreColor = (score: number, inverted = false) => {
    const adj = inverted ? 6 - score : score;
    const hue = (adj - 1) * 37.5; // 0=red → 150=green
    const sat = 65;
    const light = 50 - (5 - adj) * 4;
    return `hsl(${hue}, ${sat}%, ${light}%)`;
  };

  return (
    <div ref={ref} className="overflow-x-auto -mx-2 px-2">
      <table className="w-full border-separate border-spacing-1 min-w-[640px]">
        <thead>
          <tr>
            <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground p-2 sticky left-0 bg-background">
              Proxy Type
            </th>
            {dimensions.map((d) => {
              const Icon = d.icon;
              return (
                <th key={d.id} className="p-2 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {d.label}
                    </span>
                  </div>
                </th>
              );
            })}
            <th className="p-2 text-center">
              <div className="flex flex-col items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {proxyTypes.map((p) => {
            const avg = Math.round(
              (Object.values(p.scores).reduce((a, b) => a + b, 0) / Object.values(p.scores).length) * 10,
            ) / 10;
            const isSelected = selected === p.id;
            return (
              <tr
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={`cursor-pointer transition-all ${isSelected ? 'bg-foreground/5' : 'hover:bg-muted/40'}`}
              >
                <td className={`p-2 rounded-l-md ${isSelected ? 'bg-foreground/5' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0"
                      style={{ backgroundColor: `${p.color}22`, color: p.color }}
                    >
                      <p.icon className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold leading-tight">{p.shortName}</div>
                      <div className="text-[10px] text-muted-foreground leading-tight">{p.tagline}</div>
                    </div>
                  </div>
                </td>
                {dimensions.map((d) => {
                  const score = p.scores[d.id as keyof typeof p.scores];
                  return (
                    <td key={d.id} className="p-1 text-center">
                      <div
                        className="heat-cell w-10 h-10 mx-auto rounded-md flex items-center justify-center font-mono text-sm font-bold text-white"
                        style={{ backgroundColor: scoreColor(score, d.inverted) }}
                        title={`${d.label}: ${score}/5${d.inverted ? ' (lower is better)' : ''}`}
                      >
                        {score}
                      </div>
                    </td>
                  );
                })}
                <td className="p-2 rounded-r-md text-center">
                  <div className="font-mono text-sm font-bold">{avg.toFixed(1)}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-3 flex items-center justify-end gap-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span>Score:</span>
          {[1, 3, 5].map((s) => (
            <div key={s} className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: scoreColor(s) }} />
              <span>{s}</span>
            </div>
          ))}
        </div>
        <span className="text-muted-foreground/60">·</span>
        <span>Lower is better for Latency &amp; Complexity</span>
      </div>
    </div>
  );
}

// ─── 2. Signal / Noise ──────────────────────────────────────────────────────────
function SignalNoiseView() {
  const ref = useRef<HTMLDivElement>(null);

  useGsapTimeline(
    ref as React.RefObject<HTMLDivElement | null>,
    (gsap) => {
      gsap.utils.toArray<SVGPathElement>('.signal-path').forEach((path) => {
        const total = path.getTotalLength();
        path.style.strokeDasharray = `${total * 0.3} ${total * 0.7}`;
        path.style.strokeDashoffset = `${total}`;
      });
      gsap.to('.signal-path', {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: 'power2.inOut',
        stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: 'top 75%' },
      });
      // Continuous flow
      gsap.to('.signal-path', {
        strokeDashoffset: '-=200',
        duration: 4,
        ease: 'none',
        repeat: -1,
      });
    },
    { dependencies: [] },
  );

  // Generate a waveform path: clean = low amplitude sine, noisy = high amplitude + noise
  const generateWave = (noise: number, width = 280, height = 60) => {
    const points: string[] = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width;
      const phase = (i / steps) * Math.PI * 6;
      const clean = Math.sin(phase) * (height / 4);
      const noiseAmp = (Math.sin(phase * 7.3) + Math.sin(phase * 3.1)) * (height / 8) * noise;
      const y = height / 2 + clean + noiseAmp;
      points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return points.join(' ');
  };

  // Noise level by proxy (higher = worse signal-to-noise)
  const noiseLevels: Record<string, number> = {
    transparent: 0.05,
    reverse: 0.25,
    forward: 0.55,
    mesh: 0.85,
    circuit: 0.4,
    identity: 0.15,
  };

  return (
    <div ref={ref} className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Each proxy visualized as a radio waveform. Clean signal = predictable routing. Noisy signal =
        complex, opaque, harder to debug. <strong>Transparent</strong> is crystal-clear;
        <strong> Mesh</strong> is full-spectrum noise.
      </p>
      <div className="space-y-2">
        {proxyTypes.map((p) => {
          const noise = noiseLevels[p.id] ?? 0.3;
          const snr = Math.round((1 - noise) * 100);
          return (
            <div
              key={p.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card/30 hover:bg-card/60 transition-colors"
            >
              <div className="flex items-center gap-2 w-32 flex-shrink-0">
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-md"
                  style={{ backgroundColor: `${p.color}22`, color: p.color }}
                >
                  <p.icon className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-semibold truncate">{p.shortName}</span>
              </div>
              <div className="flex-1 min-w-0">
                <svg width="100%" height="60" viewBox="0 0 280 60" preserveAspectRatio="none">
                  <path
                    d={generateWave(noise)}
                    className="signal-path"
                    fill="none"
                    stroke={p.color}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="w-20 text-right flex-shrink-0">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">SNR</div>
                <div className="font-mono text-sm font-bold" style={{ color: p.color }}>
                  {snr}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 3. Traffic Light ───────────────────────────────────────────────────────────
function TrafficLightView() {
  const ref = useRef<HTMLDivElement>(null);

  useGsapTimeline(
    ref as React.RefObject<HTMLDivElement | null>,
    (gsap) => {
      gsap.from('.traffic-light', {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        stagger: { each: 0.04, from: 'start' },
        ease: 'back.out(2)',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      });
    },
    { dependencies: [] },
  );

  // Convert score to traffic light: 1-2=red, 3=yellow, 4-5=green (inverted dims flip)
  const trafficColor = (score: number, inverted = false) => {
    const adj = inverted ? 6 - score : score;
    if (adj <= 2) return { color: '#ef4444', label: 'GO-CAUTION', bg: 'bg-red-500' };
    if (adj === 3) return { color: '#f59e0b', label: 'YIELD', bg: 'bg-amber-500' };
    return { color: '#10b981', label: 'GO', bg: 'bg-emerald-500' };
  };

  const fitDims = dimensions.slice(0, 5); // skip 'fit' for individual assessment

  return (
    <div ref={ref} className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Decision matrix: each cell is a verdict. <strong>Green = go</strong>, <strong>yellow = yield</strong>,
        <strong> red = caution</strong>. Latency &amp; Complexity are inverted (low score = bad).
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {proxyTypes.map((p) => {
          const verdicts = fitDims.map((d) => ({
            dim: d,
            ...trafficColor(p.scores[d.id as keyof typeof p.scores], d.inverted),
            score: p.scores[d.id as keyof typeof p.scores],
          }));
          const greenCount = verdicts.filter((v) => v.label === 'GO').length;
          const verdict =
            greenCount >= 4 ? 'RECOMMENDED' : greenCount >= 3 ? 'VIABLE' : greenCount >= 2 ? 'CONDITIONAL' : 'AVOID';
          const verdictColor =
            verdict === 'RECOMMENDED' ? '#10b981' :
            verdict === 'VIABLE' ? '#08F7FE' :
            verdict === 'CONDITIONAL' ? '#f59e0b' : '#ef4444';

          return (
            <div
              key={p.id}
              className="p-4 rounded-lg border bg-card/40 hover:bg-card/70 transition-colors"
              style={{ borderTopColor: p.color, borderTopWidth: 3 }}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md"
                    style={{ backgroundColor: `${p.color}22`, color: p.color }}
                  >
                    <p.icon className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{p.shortName}</div>
                    <div className="text-[10px] text-muted-foreground">{p.tagline}</div>
                  </div>
                </div>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${verdictColor}22`, color: verdictColor }}
                >
                  {verdict}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {verdicts.map((v) => (
                  <div key={v.dim.id} className="text-center">
                    <div
                      className="traffic-light w-7 h-7 mx-auto rounded-full flex items-center justify-center text-[10px] font-mono font-bold text-white"
                      style={{ backgroundColor: v.color }}
                      title={`${v.dim.label}: ${v.score}/5`}
                    >
                      {v.score}
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-1 truncate">{v.dim.label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 4. Gauges ─────────────────────────────────────────────────────────────────
function GaugeView() {
  const ref = useRef<HTMLDivElement>(null);

  useGsapTimeline(
    ref as React.RefObject<HTMLDivElement | null>,
    (gsap) => {
      gsap.utils.toArray<SVGPathElement>('.gauge-arc').forEach((arc) => {
        const total = arc.getTotalLength();
        arc.style.strokeDasharray = `${total}`;
        arc.style.strokeDashoffset = `${total}`;
      });
      gsap.to('.gauge-arc', {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: 'power2.out',
        stagger: 0.08,
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      });
      // Sweep needle
      gsap.utils.toArray<SVGLineElement>('.gauge-needle').forEach((needle) => {
        const target = needle.dataset.rotation ?? '0';
        gsap.fromTo(
          needle,
          { rotation: -90, transformOrigin: '50% 100%' },
          {
            rotation: Number(target),
            duration: 1.6,
            ease: 'power3.out',
            stagger: 0.08,
            scrollTrigger: { trigger: ref.current, start: 'top 80%' },
          },
        );
      });
    },
    { dependencies: [] },
  );

  // Render a single gauge (semicircle speedometer)
  const renderGauge = (label: string, value: number, color: string, max = 5) => {
    const pct = Math.min(100, (value / max) * 100);
    const size = 110;
    const r = 42;
    const cx = size / 2;
    const cy = size / 2 + 8;
    const needleAngle = -90 + (pct / 100) * 180;
    return (
      <div className="flex flex-col items-center">
        <svg width={size} height={size / 2 + 24} viewBox={`0 0 ${size} ${size / 2 + 24}`}>
          {/* Track arc (background) */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={6}
            strokeLinecap="round"
          />
          {/* Fill arc */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            className="gauge-arc"
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
          />
          {/* Needle */}
          <line
            className="gauge-needle"
            data-rotation={needleAngle}
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - r + 4}
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          {/* Hub */}
          <circle cx={cx} cy={cy} r={4} fill={color} />
          {/* Value text */}
          <text
            x={cx}
            y={cy - 12}
            textAnchor="middle"
            className="text-[14px] font-bold fill-foreground font-mono"
          >
            {value.toFixed(1)}
          </text>
        </svg>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground -mt-1">{label}</span>
      </div>
    );
  };

  return (
    <div ref={ref} className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Performance speedometers. Needles sweep from 0 to actual score on scroll. Higher = better
        (Latency &amp; Complexity are inverted for visual consistency).
      </p>
      <div className="space-y-3">
        {proxyTypes.map((p) => (
          <div key={p.id} className="p-4 rounded-lg border bg-card/30">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-md"
                style={{ backgroundColor: `${p.color}22`, color: p.color }}
              >
                <p.icon className="w-4 h-4" />
              </span>
              <div>
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="text-[10px] text-muted-foreground">{p.tagline}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {dimensions.map((d) => {
                const val = p.scores[d.id as keyof typeof p.scores];
                const displayVal = d.inverted ? 6 - val : val;
                return (
                  <div key={d.id}>
                    {renderGauge(d.label, displayVal, p.color)}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 5. Metaphor Cards ──────────────────────────────────────────────────────────
function MetaphorView() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Three lenses on each proxy type: <strong>Psychology</strong> (how it feels),
        <strong> Economics</strong> (how value flows), <strong>Science</strong> (what it resembles in nature).
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {proxyTypes.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="p-4 rounded-lg border bg-card/40 relative overflow-hidden"
            style={{ borderTopColor: p.color, borderTopWidth: 3 }}
          >
            {/* Background gradient accent */}
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-12 translate-x-12"
              style={{ backgroundColor: p.color }}
            />

            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="inline-flex items-center justify-center w-9 h-9 rounded-md"
                  style={{ backgroundColor: `${p.color}22`, color: p.color }}
                >
                  <p.icon className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-sm font-bold">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground italic">{p.tagline}</div>
                </div>
              </div>

              <div className="space-y-3">
                <MetaphorBlock label="Psychology" content={p.psychology} color="#FF2E63" />
                <MetaphorBlock label="Economics" content={p.economics} color="#08F7FE" />
                <MetaphorBlock label="Science" content={p.science} color="#FFD600" />
              </div>

              <div className="mt-4 pt-3 border-t border-dashed">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  How We Stand Out
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{p.howWeStandOut}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MetaphorBlock({ label, content, color }: { label: string; content: string; color: string }) {
  return (
    <div className="flex gap-2">
      <div
        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded h-fit flex-shrink-0 mt-0.5"
        style={{ backgroundColor: `${color}22`, color }}
      >
        {label}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{content}</p>
    </div>
  );
}

// ─── Selected proxy detail (persistent) ─────────────────────────────────────────
function SelectedProxyDetail({ proxyId }: { proxyId: string }) {
  const proxy = useMemo(() => proxyTypes.find((p) => p.id === proxyId) ?? proxyTypes[0], [proxyId]);
  const Icon = proxy.icon;

  return (
    <motion.div
      key={proxy.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-5 rounded-lg border-2"
      style={{ borderColor: `${proxy.color}40`, backgroundColor: `${proxy.color}08` }}
    >
      <div className="flex items-start gap-4 flex-wrap">
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-lg flex-shrink-0"
          style={{ backgroundColor: `${proxy.color}22`, color: proxy.color }}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-serif font-semibold">{proxy.name}</div>
          <p className="text-xs text-muted-foreground mt-0.5">{proxy.tagline}</p>
        </div>
        <div className="flex gap-4 text-center">
          {Object.entries(proxy.scores).map(([dim, score]) => (
            <div key={dim}>
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground capitalize">{dim}</div>
              <div className="font-mono text-lg font-bold" style={{ color: proxy.color }}>{score}/5</div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
            Strengths
          </div>
          <ul className="space-y-1">
            {proxy.strengths.map((s) => (
              <li key={s} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-emerald-500 mt-0.5">+</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-red-600 dark:text-red-400 mb-1.5">
            Weaknesses
          </div>
          <ul className="space-y-1">
            {proxy.weaknesses.map((w) => (
              <li key={w} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-red-500 mt-0.5">−</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
