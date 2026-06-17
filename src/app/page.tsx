'use client';

import { HeroSection } from '@/components/HeroSection';
import { SkillMarketplace } from '@/components/SkillMarketplace';
import { ProxyComparison } from '@/components/ProxyComparison';
import { ProxyMatrix } from '@/components/ProxyMatrix';
import { SP7Radar } from '@/components/SP7Radar';
import { SkillPipeline } from '@/components/SkillPipeline';
import { ArchitectureTree } from '@/components/ArchitectureTree';
import { InfographicDashboard } from '@/components/InfographicMotion';
import { DecisionTree } from '@/components/DecisionTree';
import { VisualGallery } from '@/components/VisualGallery';
import { ComparativeAnalysis } from '@/components/ComparativeAnalysis';
import { TierArchitecture } from '@/components/TierArchitecture';
import { AIPortalGateway } from '@/components/AIPortalGateway';
import { SkillReference } from '@/components/SkillReference';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { EditorialReveal } from '@/components/EditorialReveal';
import { OptionsShowcase } from '@/components/OptionsShowcase';
import { DesignAlgorithm } from '@/components/DesignAlgorithm';
import { SectionMapping } from '@/components/SectionMapping';
import { ImplementationBlueprint } from '@/components/ImplementationBlueprint';
import { InteractiveHeatmap } from '@/components/InteractiveHeatmap';
import { HeatmapViz } from '@/components/HeatmapViz';
import { ClipboardHistory } from '@/components/ClipboardHistory';
import { gsapMotionRules } from '@/lib/gsap-hybrid';
import { options, dimensions } from '@/lib/skill-data';
import { staggerContainer, fadeInUp, dividerVariant, hoverNavItem } from '@/lib/animation-variants';
import { copyToClipboard } from '@/lib/clipboard';
import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Moon, Sun, ArrowUp, Home, Shield, Paintbrush, Globe,
  Layers, ShoppingBag, BookOpen, Eye, Wrench, ChevronDown,
  ChevronRight, CheckCircle2, XCircle, AlertTriangle, Copy, Check,
  Zap, ShieldCheck, Activity, RefreshCcw, ArrowRight,
  Clock, BarChart3, Search, Filter, Play, Pause, RotateCcw,
  TrendingUp, Gauge, CircleDot,
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';

// ─── Types ───
type Subpage = 'home' | 'audit' | 'frontend' | 'proxy' | 'architecture' | 'marketplace' | 'docs';

// ─── Tab Config ───
const tabs: { id: Subpage; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
  { id: 'audit', label: 'Audit', icon: <Eye className="w-4 h-4" /> },
  { id: 'frontend', label: 'Frontend', icon: <Paintbrush className="w-4 h-4" /> },
  { id: 'proxy', label: 'Proxy', icon: <Globe className="w-4 h-4" /> },
  { id: 'architecture', label: 'Arch', icon: <Layers className="w-4 h-4" /> },
  { id: 'marketplace', label: 'Market', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'docs', label: 'Docs', icon: <BookOpen className="w-4 h-4" /> },
];

// ─── Audit: Error Patterns Data ───
const errorPatterns = [
  {
    name: 'navigator.clipboard Fallback',
    severity: 'Critical' as const,
    before: `await navigator.clipboard.writeText(text);`,
    after: `try {\n  await navigator.clipboard.writeText(text);\n} catch {\n  // textarea fallback\n  const ta = document.createElement('textarea');\n  ta.value = text;\n  document.body.appendChild(ta);\n  ta.select();\n  document.execCommand('copy');\n  document.body.removeChild(ta);\n}`,
    description: 'navigator.clipboard fails in insecure contexts (HTTP, iframes). The textarea fallback pattern ensures copy always works.',
  },
  {
    name: 'setState-in-Effect Violation',
    severity: 'High' as const,
    before: `useEffect(() => { setState(value); }, [value]);`,
    after: `const [state, dispatch] = useReducer(reducer, init);\n// State transitions are explicit, predictable, traceable`,
    description: 'react-hooks/set-state-in-effect lint violations indicate implicit state transitions. useReducer makes state machines explicit.',
  },
  {
    name: 'AbortController for Fetch Lifecycle',
    severity: 'Medium' as const,
    before: `const data = await fetch(url);\n// No way to cancel on unmount`,
    after: `const controller = new AbortController();\nuseEffect(() => () => controller.abort(), []);\nconst data = await fetch(url, { signal: controller.signal });`,
    description: 'Without AbortController, in-flight requests continue after component unmount, causing memory leaks and stale state updates.',
  },
  {
    name: 'ErrorBoundary Per-Section Isolation',
    severity: 'High' as const,
    before: `<App />\n// Any render crash = white screen`,
    after: `<ErrorBoundary section="Hero">\n  <HeroSection />\n</ErrorBoundary>\n<ErrorBoundary section="Gallery">\n  <VisualGallery />\n</ErrorBoundary>`,
    description: 'Section-level ErrorBoundary prevents cascade failures. One section crashing does not take down the entire page.',
  },
];

const severityColor: Record<string, string> = {
  Critical: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30',
  High: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30',
  Medium: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30',
};

// ─── Audit: Error Layers Data ───
const errorLayers = [
  { layer: 1, name: 'Section-level ErrorBoundary', desc: 'Catches render crashes per section. Prevents cascade failures from propagating up the component tree.', icon: <Shield className="w-5 h-5" /> },
  { layer: 2, name: 'Clipboard Resilience', desc: 'try/catch + textarea fallback pattern. Ensures copy-to-clipboard works in all browser contexts including insecure origins.', icon: <Copy className="w-5 h-5" /> },
  { layer: 3, name: 'AbortController', desc: 'Cancellable fetch lifecycle. Prevents memory leaks and stale updates from in-flight requests after component unmount.', icon: <Activity className="w-5 h-5" /> },
  { layer: 4, name: 'useReducer Migration', desc: 'Explicit state machine replacing useState. Makes state transitions predictable and eliminates set-state-in-effect lint violations.', icon: <RefreshCcw className="w-5 h-5" /> },
];

// ─── Audit: Scorecard Data ───
const scorecardRows = [
  { component: 'SkillMarkdownRenderer', clipboard: true, abort: true, boundary: 'parent', reducer: true },
  { component: 'ClipboardPanel', clipboard: true, abort: null, boundary: 'parent', reducer: null },
  { component: 'SkillMarketplace', clipboard: true, abort: null, boundary: true, reducer: null },
  { component: 'BasketPanel', clipboard: true, abort: null, boundary: 'parent', reducer: null },
  { component: 'SkillReference', clipboard: true, abort: null, boundary: true, reducer: null },
  { component: 'ImplementationBlueprint', clipboard: true, abort: null, boundary: true, reducer: null },
  { component: 'AIPortalGateway', clipboard: false, abort: null, boundary: true, reducer: null },
];

// ─── Audit: Error Simulation Scenarios ───
const simScenarios = [
  {
    id: 'clipboard-insecure',
    title: 'Clipboard in Insecure Context',
    icon: <Copy className="w-4 h-4" />,
    trigger: 'navigator.clipboard.writeText() called on HTTP page or inside iframe',
    resolution: 'try/catch wraps the call. On failure, a hidden textarea is created, text is selected, and document.execCommand("copy") is executed as fallback.',
    layer: 'Layer 2 — Clipboard Resilience',
    beforeLabel: 'Unprotected call',
    afterLabel: 'Resilient with fallback',
    beforeCode: `navigator.clipboard.writeText(text)\n  .then(() => console.log('copied'))\n  .catch(() => console.error('failed'));`,
    afterCode: `try {\n  await navigator.clipboard.writeText(text);\n} catch {\n  const ta = document.createElement('textarea');\n  ta.value = text;\n  ta.style.position = 'fixed';\n  ta.style.left = '-9999px';\n  document.body.appendChild(ta);\n  ta.select();\n  document.execCommand('copy');\n  document.body.removeChild(ta);\n}`,
  },
  {
    id: 'render-crash',
    title: 'Render Crash',
    icon: <XCircle className="w-4 h-4" />,
    trigger: 'Component throws during render (e.g., accessing property of undefined)',
    resolution: 'ErrorBoundary catches the error at the section boundary. The crashed section shows a recovery UI while the rest of the page continues working.',
    layer: 'Layer 1 — ErrorBoundary',
    beforeLabel: 'Without boundary',
    afterLabel: 'With section isolation',
    beforeCode: `<App>\n  <Hero />\n  <Gallery />\n  <Contact />\n</App>\n// Any crash = full white screen`,
    afterCode: `<App>\n  <ErrorBoundary section="Hero">\n    <Hero />\n  </ErrorBoundary>\n  <ErrorBoundary section="Gallery">\n    <Gallery />\n  </ErrorBoundary>\n  <ErrorBoundary section="Contact">\n    <Contact />\n  </ErrorBoundary>\n</App>`,
  },
  {
    id: 'abandoned-fetch',
    title: 'Abandoned Fetch',
    icon: <Activity className="w-4 h-4" />,
    trigger: 'Component unmounts while fetch is still in-flight',
    resolution: 'AbortController is created in useEffect. On cleanup, controller.abort() cancels the request, preventing stale state updates and memory leaks.',
    layer: 'Layer 3 — AbortController',
    beforeLabel: 'No cancellation',
    afterLabel: 'With AbortController',
    beforeCode: `useEffect(() => {\n  fetch('/api/data')\n    .then(res => res.json())\n    .then(data => setState(data));\n  // No cleanup — leak on unmount\n}, []);`,
    afterCode: `useEffect(() => {\n  const controller = new AbortController();\n  fetch('/api/data', { signal: controller.signal })\n    .then(res => res.json())\n    .then(data => setState(data))\n    .catch(err => {\n      if (err.name !== 'AbortError') throw err;\n    });\n  return () => controller.abort();\n}, []);`,
  },
  {
    id: 'race-condition',
    title: 'Race Condition',
    icon: <RefreshCcw className="w-4 h-4" />,
    trigger: 'Multiple rapid dispatches cause stale state reads inside effects',
    resolution: 'useReducer replaces useState. All state transitions are explicit dispatches — no stale closures, no implicit set-state-in-effect violations.',
    layer: 'Layer 4 — useReducer',
    beforeLabel: 'Stale closure',
    afterLabel: 'Explicit dispatch',
    beforeCode: 'const [value, setValue] = useState(0);\nuseEffect(() => {\n  // Reads stale `value` if another update\n  // happened between render and effect\n  setValue(compute(value));\n}, [value]);',
    afterCode: `const [state, dispatch] = useReducer(\n  (prev, action) => {\n    switch (action.type) {\n      case 'COMPUTE':\n        return { ...prev, value: compute(prev.value) };\n      default: return prev;\n    }\n  },\n  { value: 0 }\n);\n// dispatch always sees latest state`,
  },
];

// ─── Proxy: Cross-Domain Data ───
const proxyTypes = [
  { id: 'transparent', name: 'Transparent Proxy', psychology: 'Open-plan office — everyone sees everything. Builds trust through radical transparency, but creates self-monitoring anxiety (panopticon effect).', economics: 'Commodity market — low switching costs, price competition dominates, margins compress. Value from volume, not differentiation.', science: 'Glass microscope slide — complete visibility of the specimen. Nothing hidden, everything observable, but the act of observation may alter behavior.', strengths: ['Full visibility for debugging', 'No hidden transformations', 'Easy compliance auditing'], weaknesses: ['No privacy for users', 'No caching benefit', 'Vulnerable to traffic analysis'], differentiator: 'Our transparent proxy adds request telemetry without modifying payloads — observability without opacity.' },
  { id: 'anonymous', name: 'Anonymous Proxy', psychology: 'Masquerade ball — identity is hidden behind masks. Freedom through anonymity, but trust requires verification beyond the mask.', economics: 'Black market — anonymity enables both privacy and fraud. Premium pricing for verified anonymity vs. unverified.', science: 'Dark matter — we know it exists by its gravitational effects, but cannot observe it directly. Influence without visibility.', strengths: ['User privacy protection', 'Bypass geo-restrictions', 'Identity shielding'], weaknesses: ['Cannot verify user intent', 'Potential for abuse', 'Performance overhead from stripping headers'], differentiator: 'Our anonymous proxy uses rotating exit nodes with zero-log verification — anonymity with accountability hashes.' },
  { id: 'reverse', name: 'Reverse Proxy', psychology: 'Concierge desk — a single point of contact that routes to the right specialist. Controls access, manages flow, and shields the interior.', economics: 'Distributor — sits between producers and consumers, aggregating demand and managing supply. Value from distribution efficiency.', science: 'Cell membrane — selective permeability that controls what enters and exits. Protects the nucleus while enabling nutrient flow.', strengths: ['Load balancing', 'SSL termination', 'DDoS protection'], weaknesses: ['Single point of failure', 'Added latency', 'Configuration complexity'], differentiator: 'Our reverse proxy uses predictive routing with circuit breaker patterns — fails fast, recovers faster.' },
  { id: 'forward', name: 'Forward Proxy', psychology: 'Travel agent — intermediates between you and the destination. Simplifies complex bookings, but adds a layer between intent and outcome.', economics: 'Broker — connects buyers and sellers, extracting commission. Value from matchmaking and market knowledge.', science: 'Enzyme catalyst — lowers activation energy without being consumed. Accelerates reactions that would otherwise be too slow.', strengths: ['Access control', 'Content filtering', 'Bandwidth optimization'], weaknesses: ['Client configuration required', 'Potential bottleneck', 'Privacy concerns for operator'], differentiator: 'Our forward proxy auto-discovers provider endpoints with zero-config — no manual setup needed.' },
  { id: 'ssl', name: 'SSL/TLS Proxy', psychology: 'Vault — security through layers of protection. The contents are safe, but accessing them requires the right keys and authority.', economics: 'Insurance — you pay for protection against worst-case scenarios. Value is in risk reduction, not daily utility.', science: 'Immune system — identifies and neutralizes threats before they reach vital systems. Adaptive defense that learns from attacks.', strengths: ['End-to-end encryption', 'Certificate management', 'Man-in-the-middle prevention'], weaknesses: ['Performance overhead from encryption', 'Certificate renewal complexity', 'Cannot inspect encrypted traffic for threats'], differentiator: 'Our TLS proxy uses automated certificate rotation with hardware acceleration — security without the performance tax.' },
  { id: 'caching', name: 'Caching Proxy', psychology: 'Librarian — remembers what you\'ve asked for before and has it ready. Anticipates needs, but may serve outdated information.', economics: 'Inventory buffer — stores goods closer to consumers. Reduces delivery time but ties up capital in stored inventory.', science: 'Ribosome — stores and translates instructions into proteins on demand. Efficiency through reuse of cached templates.', strengths: ['Dramatic latency reduction', 'Bandwidth savings', 'Offline resilience'], weaknesses: ['Cache invalidation is hard', 'Stale data risk', 'Storage costs'], differentiator: 'Our caching proxy uses stale-while-revalidate with predictive pre-warming — fresh content with instant response.' },
];

// ─── Proxy: Comparison Matrix Data ───
const proxyMatrix = [
  { type: 'Transparent', latency: 'Low', privacy: 'None', complexity: 'Low', score: 6 },
  { type: 'Anonymous', latency: 'Medium', privacy: 'High', complexity: 'Medium', score: 7 },
  { type: 'Reverse', latency: 'Low', privacy: 'Medium', complexity: 'High', score: 8 },
  { type: 'Forward', latency: 'Medium', privacy: 'Medium', complexity: 'Medium', score: 6 },
  { type: 'SSL/TLS', latency: 'High', privacy: 'High', complexity: 'High', score: 9 },
  { type: 'Caching', latency: 'Very Low', privacy: 'Low', complexity: 'Medium', score: 7 },
];

const matrixIndicatorColor = (val: string): string => {
  const low = ['Low', 'Very Low', 'None'];
  const high = ['High'];
  if (low.includes(val)) return 'bg-emerald-500';
  if (high.includes(val)) return 'bg-red-400';
  return 'bg-amber-400';
};

const matrixCellLabel = (val: string): string => {
  const colors: Record<string, string> = {
    'Very Low': 'text-emerald-600 dark:text-emerald-400',
    'Low': 'text-emerald-600 dark:text-emerald-400',
    'Medium': 'text-amber-600 dark:text-amber-400',
    'High': 'text-red-600 dark:text-red-400',
    'None': 'text-red-600 dark:text-red-400',
  };
  return colors[val] || 'text-muted-foreground';
};

// ─── Architecture: Telemetry Data ───
const telemetryMetrics = { totalInvocations: 847, successRate: 94.7, p99Latency: 142, activeConflicts: 2 };
const recentInvocations = [
  { skill: 'Stitch Design', status: 'success', duration: 89, tier: 'T0' },
  { skill: 'GSAP Animations', status: 'success', duration: 156, tier: 'T1' },
  { skill: 'Framer Motion', status: 'failed', duration: 0, tier: 'T0' },
  { skill: 'shadcn/ui', status: 'success', duration: 45, tier: 'T2' },
  { skill: 'AI Portal', status: 'success', duration: 234, tier: 'T3' },
  { skill: 'MCP Builder', status: 'success', duration: 67, tier: 'T3' },
  { skill: 'Recharts Viz', status: 'success', duration: 123, tier: 'T1' },
  { skill: 'Skill Finder', status: 'failed', duration: 0, tier: 'T3' },
  { skill: 'Playwright', status: 'success', duration: 345, tier: 'T2' },
  { skill: 'Deep Research', status: 'success', duration: 567, tier: 'T3' },
];

// ─── Docs: PDF Reports (with category) ───
const pdfReports = [
  { title: 'Comprehensive Code Audit Report', desc: 'Full-stack code quality analysis across all 13 sections', size: '2.4 MB', category: 'audit' },
  { title: 'OWL Agent Audit3 Comprehensive Report', desc: 'Deep-dive error handling and resilience audit by the OWL agent', size: '1.8 MB', category: 'audit' },
  { title: 'AI Billing Proxy Integration Analysis', desc: 'Proxy billing models, tier routing, and cost optimization', size: '3.1 MB', category: 'architecture' },
  { title: 'Skill Definition Analysis Report', desc: 'Analysis of 64 skill definitions, conflicts, and dependencies', size: '1.2 MB', category: 'architecture' },
  { title: 'Security Audit Report', desc: 'Vulnerability assessment and penetration testing results', size: '2.7 MB', category: 'security' },
  { title: 'AI Stack Ecosystem Guide', desc: 'Complete guide to the 64-skill ecosystem with install commands', size: '4.5 MB', category: 'architecture' },
  { title: 'Skill Reference Compendium', desc: 'Comprehensive reference for all skill APIs and configurations', size: '3.3 MB', category: 'design' },
];

// ─── Docs: Research Images (with category) ───
const researchImages = [
  { name: 'Architecture Comparison', file: 'architecture-comparison.png', desc: 'Side-by-side comparison of current vs proposed architecture', category: 'architecture' },
  { name: 'Decision Matrix', file: 'architecture-decision-matrix.png', desc: 'Weighted decision matrix for design option selection', category: 'architecture' },
  { name: 'Approaches Radar', file: 'approaches-radar.png', desc: 'Radar chart overlay of all 5 design approaches', category: 'design' },
  { name: 'Decision Tree', file: 'decision-tree.png', desc: 'Interactive decision tree flowchart', category: 'architecture' },
  { name: 'Data Model Evolution', file: 'data-model-evolution.png', desc: 'Migration from flat ordered list to I/O piping model', category: 'architecture' },
  { name: 'I/O Piping Flow', file: 'io-piping-flow.png', desc: 'Skill invocation piping diagram with telemetry', category: 'architecture' },
  { name: 'Severity Findings', file: 'severity-findings.png', desc: 'Error severity distribution across codebase', category: 'audit' },
  { name: 'Severity Matrix', file: 'severity-matrix.png', desc: 'Component × error-type severity heatmap', category: 'audit' },
];

const docsCategories = ['all', 'architecture', 'audit', 'design', 'security'] as const;

// ─── Radar Chart Data for Frontend Tab ───
const radarData = dimensions.map((dim) => {
  const entry: Record<string, string | number> = { name: dim.shortName, fullName: dim.name };
  options.forEach((opt) => {
    const idx = dimensions.findIndex((d) => d.id === dim.id);
    entry[opt.name.replace('The ', '')] = opt.sp7Vector[idx] ?? 0;
  });
  return entry;
});

const optColors = ['#C23616', '#2C3E50', '#6B6B6B', '#5B7B6F', '#8B7355'];

// ─── Shared Sub-Components ───
function SectionHeader({ num, title, subtitle }: { num: string; title: string; subtitle: string }) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-10"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
    >
      <div className="md:col-span-8">
        <div className="flex items-baseline gap-4 mb-3">
          <span className="font-['Georgia',_serif] text-5xl md:text-6xl font-bold text-border leading-none" aria-hidden="true">{num}</span>
          <h2 className="font-['Georgia',_serif] text-2xl md:text-3xl font-bold text-foreground leading-tight">{title}</h2>
        </div>
        <div className="editorial-pullquote ml-0 md:ml-20">{subtitle}</div>
      </div>
    </motion.div>
  );
}

function EditorialDivider({ thick = false }: { thick?: boolean }) {
  return (
    <div className="max-w-[1200px] mx-auto px-6">
      <motion.hr
        className={thick ? 'editorial-rule-thick' : 'editorial-rule'}
        variants={dividerVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      />
    </div>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const ok = await copyToClipboard(code);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };
  return (
    <div className="relative group">
      {label && <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground font-mono">{label}</span>}
      <pre className="bg-muted/60 border border-border rounded p-3 text-xs font-mono overflow-x-auto custom-scrollbar text-foreground/80 mt-1">
        <code>{code}</code>
      </pre>
      <button onClick={handleCopy} className="absolute top-2 right-2 min-w-[32px] min-h-[32px] flex items-center justify-center rounded hover:bg-muted cursor-pointer" aria-label="Copy code">
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SUBPAGE: HOME
// ═══════════════════════════════════════════════════════════
function HomeSubpage({ onNavigate }: { onNavigate: (tab: Subpage) => void }) {
  const shouldReduce = useReducedMotion();
  const navCards: { tab: Subpage; icon: React.ReactNode; title: string; desc: string }[] = [
    { tab: 'audit', icon: <Eye className="w-5 h-5" />, title: 'Audit', desc: 'Error handling deep dive — Owl sees patterns, Beaver builds resilience' },
    { tab: 'frontend', icon: <Paintbrush className="w-5 h-5" />, title: 'Frontend Design', desc: 'Creative exploration & strategic design option comparison' },
    { tab: 'proxy', icon: <Globe className="w-5 h-5" />, title: 'Proxy Architecture', desc: 'Cross-domain intelligence from psychology, economics, and science' },
    { tab: 'architecture', icon: <Layers className="w-5 h-5" />, title: 'Architecture', desc: 'Decision trees, tier models, and data model evolution' },
    { tab: 'marketplace', icon: <ShoppingBag className="w-5 h-5" />, title: 'Marketplace', desc: 'Browse, search, and install 64 production-ready skills' },
    { tab: 'docs', icon: <BookOpen className="w-5 h-5" />, title: 'Documentation', desc: 'Research gallery, PDF reports, and skill reference' },
  ];

  return (
    <>
      <ErrorBoundary section="Hero"><HeroSection /></ErrorBoundary>
      <EditorialDivider thick />

      {/* Architecture Overview */}
      <motion.section className="py-16 md:py-24 px-6" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }} aria-label="Architecture overview">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            <div className="md:col-span-7">
              <p className="text-xs tracking-[0.25em] uppercase text-primary font-medium mb-4">Architecture Overview</p>
              <h2 className="font-['Georgia',_serif] text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-[1.15] mb-6">
                A living, navigable architecture that serves as build specification, AI guidance portal, and publishable skill repository
              </h2>
              <div className="editorial-pullquote mb-6">Every component is also an installable skill. The architecture is the product, and the product is the architecture.</div>
              <p className="text-base text-muted-foreground leading-relaxed editorial-dropcap">
                This interactive web experience translates the Skill Stack Architecture into a living specification. It serves three simultaneous purposes: a build specification that any AI agent can follow, a self-referencing portal for design guidance, and a publishable repository where every component is installable via npx skills add.
              </p>
            </div>
            <div className="md:col-span-5 md:border-l md:border-border md:pl-8">
              <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-medium mb-6">The Stack at a Glance</p>
              <div className="space-y-6">
                {[
                  { tier: 'T0', name: 'Foundation', count: 8, desc: 'Design intelligence, generation, animation, components, accessibility' },
                  { tier: 'T1', name: 'Interactive', count: 15, desc: 'Scroll animation, video, diagrams, data viz, reasoning, development' },
                  { tier: 'T2', name: 'Visual Asset', count: 17, desc: 'Image generation, component styling, testing, custom viz, content' },
                  { tier: 'T3', name: 'Portal', count: 24, desc: 'AI redirect, prioritization, matrix engine, strategy, agents, systems' },
                ].map((t) => (
                  <motion.div key={t.tier} className="group" whileHover={shouldReduce ? undefined : { scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="font-['Georgia',_serif] text-lg font-bold text-foreground"><span className="text-primary">{t.tier}</span> {t.name}</h3>
                      <span className="text-2xl font-['Georgia',_serif] font-bold text-border group-hover:text-primary transition-colors">{t.count}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                    <hr className="editorial-rule mt-4" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <EditorialDivider />

      {/* Navigation Cards */}
      <section className="py-16 px-6" aria-label="Quick navigation">
        <div className="max-w-[1200px] mx-auto">
          <EditorialReveal>
            <p className="text-xs tracking-[0.25em] uppercase text-primary font-medium mb-3">Explore the Blueprint</p>
            <h2 className="font-['Georgia',_serif] text-2xl md:text-3xl font-bold text-foreground mb-10">Seven Dimensions of the Architecture</h2>
          </EditorialReveal>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
            {navCards.map((card) => (
              <motion.div key={card.tab} variants={fadeInUp} whileHover={shouldReduce ? undefined : { scale: 1.02, y: -2 }} whileTap={shouldReduce ? undefined : { scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                <button onClick={() => onNavigate(card.tab)} className="w-full text-left min-h-[44px] p-5 border border-border rounded hover:border-primary/30 hover:bg-muted/20 transition-colors cursor-pointer group" aria-label={`Navigate to ${card.title}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-primary group-hover:scale-110 transition-transform">{card.icon}</span>
                    <h3 className="font-['Georgia',_serif] text-base font-bold text-foreground group-hover:text-primary transition-colors">{card.title}</h3>
                    <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:translate-x-1 group-hover:text-primary transition-all" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// SUBPAGE: AUDIT
// ═══════════════════════════════════════════════════════════
function AuditSubpage() {
  const shouldReduce = useReducedMotion();
  const [openLayer, setOpenLayer] = useState<number | null>(null);
  const [simScenario, setSimScenario] = useState<string | null>(null);

  return (
    <div className="max-w-[1200px] mx-auto px-6">
      {/* Title */}
      <motion.div className="py-16 md:py-20" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="text-xs tracking-[0.25em] uppercase text-primary font-medium mb-3">Owl &middot; Beaver</p>
        <h1 className="font-['Georgia',_serif] text-3xl md:text-5xl font-bold text-foreground leading-[1.1] mb-4">
          Impeccable Audit<br /><span className="text-primary">Error Fix Handler</span>
        </h1>
        <div className="editorial-pullquote">The Owl sees hidden error patterns. The Beaver builds systematic resilience. Together, they create an architecture that fails gracefully and recovers autonomously.</div>
      </motion.div>

      <hr className="editorial-rule-thick mb-12" />

      {/* Section 1 — The Owl Sees */}
      <section className="mb-20" aria-label="Error patterns">
        <SectionHeader num="01" title="The Owl Sees: Hidden Error Patterns" subtitle="Four critical error patterns discovered across the codebase — each with a proven fix." />
        <motion.div className="space-y-6" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
          {errorPatterns.map((pattern, i) => (
            <motion.div key={i} variants={fadeInUp} className="border border-border rounded p-5 hover:border-foreground/20 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-['Georgia',_serif] text-lg font-bold text-foreground">{pattern.name}</h3>
                <span className={`px-2.5 py-1 rounded text-[10px] tracking-[0.12em] uppercase font-bold ${severityColor[pattern.severity]}`}>{pattern.severity}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{pattern.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CodeBlock code={pattern.before} label="Before" />
                <CodeBlock code={pattern.after} label="After" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <EditorialDivider />

      {/* Section 2 — The Beaver Builds */}
      <section className="mb-20 py-8" aria-label="Error architecture">
        <SectionHeader num="02" title="The Beaver Builds: Systematic Error Architecture" subtitle="Four defensive layers, each catching what the layer above missed." />
        <div className="space-y-2">
          {errorLayers.map((layer) => (
            <div key={layer.layer} className="border border-border rounded overflow-hidden">
              <button onClick={() => setOpenLayer(openLayer === layer.layer ? null : layer.layer)} className="w-full flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors cursor-pointer min-h-[44px]" aria-expanded={openLayer === layer.layer} aria-label={`Layer ${layer.layer}: ${layer.name}`}>
                <span className="font-['Georgia',_serif] text-2xl font-bold text-primary w-8">{layer.layer}</span>
                <span className="text-primary">{layer.icon}</span>
                <span className="font-['Georgia',_serif] text-base font-bold text-foreground flex-1 text-left">{layer.name}</span>
                <motion.span animate={{ rotate: openLayer === layer.layer ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="w-4 h-4 text-muted-foreground" /></motion.span>
              </button>
              <AnimatePresence>
                {openLayer === layer.layer && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground leading-relaxed">{layer.desc}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Error Recovery Flow */}
        <div className="mt-10 p-5 bg-muted/20 border border-border rounded">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mb-4">Error Recovery Flow</p>
          <div className="font-mono text-xs text-muted-foreground leading-loose">
            <p>┌─ Render Error?</p>
            <p>│  └─ Yes → ErrorBoundary catches → Retry/Go Home</p>
            <p>│  └─ No ↓</p>
            <p>├─ Clipboard Fails?</p>
            <p>│  └─ Yes → try/catch → textarea fallback → document.execCommand(&apos;copy&apos;)</p>
            <p>│  └─ No ↓</p>
            <p>├─ Fetch In-Flight?</p>
            <p>│  └─ Unmount? → AbortController.abort() → Cancel request</p>
            <p>│  └─ Continue ↓</p>
            <p>└─ State Update?</p>
            <p>   └─ useReducer dispatch → Explicit transition → Predictable state</p>
          </div>
        </div>
      </section>

      <EditorialDivider />

      {/* Section 3 — Error Resilience Scorecard */}
      <section className="mb-16 py-8" aria-label="Error resilience scorecard">
        <SectionHeader num="03" title="Error Resilience Scorecard" subtitle="Component-level audit of error handling coverage across all four defensive layers." />
        <div className="overflow-x-auto custom-scrollbar border border-border rounded">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b-2 border-foreground bg-muted/10">
                <th className="text-left p-3 text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground">Component</th>
                <th className="text-center p-3 text-[10px] tracking-[0.15em] uppercase font-semibold text-muted-foreground">Clipboard Fallback</th>
                <th className="text-center p-3 text-[10px] tracking-[0.15em] uppercase font-semibold text-muted-foreground">AbortController</th>
                <th className="text-center p-3 text-[10px] tracking-[0.15em] uppercase font-semibold text-muted-foreground">ErrorBoundary</th>
                <th className="text-center p-3 text-[10px] tracking-[0.15em] uppercase font-semibold text-muted-foreground">useReducer</th>
              </tr>
            </thead>
            <tbody>
              {scorecardRows.map((row) => (
                <tr key={row.component} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="p-3 font-medium text-foreground">{row.component}</td>
                  <td className="p-3 text-center">{row.clipboard ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}</td>
                  <td className="p-3 text-center">{row.abort === null ? <span className="text-[10px] text-muted-foreground">N/A</span> : row.abort ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}</td>
                  <td className="p-3 text-center">{typeof row.boundary === 'string' ? <span className="flex items-center justify-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span className="text-[10px] text-muted-foreground">({row.boundary})</span></span> : row.boundary ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}</td>
                  <td className="p-3 text-center">{row.reducer === null ? <span className="text-[10px] text-muted-foreground">N/A</span> : row.reducer ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <EditorialDivider />

      {/* ── Enhancement 1: Interactive Error Simulation Panel ── */}
      <section className="mb-16 py-8" aria-label="Error simulation">
        <SectionHeader num="04" title="Interactive Error Simulation" subtitle="Trigger simulated errors and see how each defensive layer handles them in real time." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {simScenarios.map((scenario) => (
            <motion.button
              key={scenario.id}
              onClick={() => setSimScenario(simScenario === scenario.id ? null : scenario.id)}
              className={`text-left min-h-[44px] p-4 border rounded cursor-pointer transition-colors ${simScenario === scenario.id ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/20 hover:bg-muted/10'}`}
              whileHover={shouldReduce ? undefined : { scale: 1.01 }}
              whileTap={shouldReduce ? undefined : { scale: 0.99 }}
              aria-expanded={simScenario === scenario.id}
              aria-label={scenario.title}
            >
              <div className="flex items-center gap-3">
                <span className="text-primary">{scenario.icon}</span>
                <span className="font-['Georgia',_serif] text-sm font-bold text-foreground">{scenario.title}</span>
                <motion.span className="ml-auto" animate={{ rotate: simScenario === scenario.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </motion.span>
              </div>
            </motion.button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {simScenario && (() => {
            const s = simScenarios.find((sc) => sc.id === simScenario);
            if (!s) return null;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="border border-primary/30 bg-primary/5 rounded p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-primary">{s.icon}</span>
                  <h3 className="font-['Georgia',_serif] text-lg font-bold text-foreground">{s.title}</h3>
                  <span className="text-[10px] tracking-[0.15em] uppercase font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">{s.layer}</span>
                </div>
                <div className="mb-4">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mb-1">Trigger</p>
                  <p className="text-sm text-muted-foreground">{s.trigger}</p>
                </div>
                <div className="mb-4">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-emerald-600 dark:text-emerald-400 font-semibold mb-1">Resolution</p>
                  <p className="text-sm text-muted-foreground">{s.resolution}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CodeBlock code={s.beforeCode} label={s.beforeLabel} />
                  <CodeBlock code={s.afterCode} label={s.afterLabel} />
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SUBPAGE: FRONTEND DESIGN
// ═══════════════════════════════════════════════════════════
function FrontendSubpage({ mounted }: { mounted: boolean }) {
  const shouldReduce = useReducedMotion();
  const [compareMode, setCompareMode] = useState(false);
  const [selectedOpts, setSelectedOpts] = useState<string[]>(options.map((o) => o.id));
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const toggleOpt = (id: string) => {
    setSelectedOpts((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const filteredRadar = radarData.map((d) => {
    const entry: Record<string, string | number> = { name: d.name, fullName: d.fullName };
    options.forEach((opt) => {
      const key = opt.name.replace('The ', '');
      if (selectedOpts.includes(opt.id)) entry[key] = d[key] as number;
    });
    return entry;
  });

  const selectedOpt = selectedOption ? options.find((o) => o.id === selectedOption) : null;

  // Get top 5 skills from skillWeights
  const getTopSkills = (opt: typeof options[0]) => {
    return Object.entries(opt.skillWeights)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([skillId, weight]) => {
        const skillName = options.find((o) => o.dominantSkillId === skillId)?.dominantSkill || skillId;
        return { id: skillId, name: skillName, weight: weight as number };
      });
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6">
      {/* Title */}
      <motion.div className="py-16 md:py-20" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="text-xs tracking-[0.25em] uppercase text-primary font-medium mb-3">Dolphin &middot; Eagle</p>
        <h1 className="font-['Georgia',_serif] text-3xl md:text-5xl font-bold text-foreground leading-[1.1] mb-4">
          Frontend Design<br /><span className="text-primary">Creative &amp; Strategic</span>
        </h1>
        <div className="editorial-pullquote">The Dolphin plays with creative solutions. The Eagle sees long-term strategy. Five design options, one SP-7 scoring algorithm.</div>
      </motion.div>

      <hr className="editorial-rule-thick mb-12" />

      {/* Section 1 — The Dolphin Plays */}
      <section className="mb-20" aria-label="Design options">
        <SectionHeader num="01" title="The Dolphin Plays: Creative Solutions" subtitle="Five distinct design philosophies — each with its own motion language, color strategy, and typographic identity." />
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setCompareMode(!compareMode)} className={`min-h-[44px] px-4 py-2 text-[11px] tracking-[0.12em] uppercase font-medium border rounded cursor-pointer transition-colors ${compareMode ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-foreground/30'}`} aria-pressed={compareMode}>
            {compareMode ? '✓ Compare Mode' : 'Compare Mode'}
          </button>
        </div>
        <motion.div className={`grid gap-4 ${compareMode ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`} variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
          {options.map((opt, i) => (
            <motion.div
              key={opt.id}
              variants={fadeInUp}
              whileHover={shouldReduce ? undefined : { scale: 1.01 }}
              onClick={() => setSelectedOption(selectedOption === opt.id ? null : opt.id)}
              className={`border rounded p-5 cursor-pointer transition-colors ${selectedOption === opt.id ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/20'}`}
              role="button"
              tabIndex={0}
              aria-pressed={selectedOption === opt.id}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedOption(selectedOption === opt.id ? null : opt.id); } }}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-['Georgia',_serif] text-3xl font-bold text-border" aria-hidden="true">{i + 1}</span>
                <h3 className="font-['Georgia',_serif] text-lg font-bold text-foreground">{opt.name}</h3>
              </div>
              <p className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground font-medium mb-3">{opt.tagline}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{opt.philosophy.slice(0, 150)}…</p>
              <div className="space-y-2 text-xs">
                <div className="flex gap-2"><span className="text-primary font-semibold w-20 shrink-0">Motion</span><span className="text-muted-foreground">{opt.motionStyle}</span></div>
                <div className="flex gap-2"><span className="text-primary font-semibold w-20 shrink-0">Color</span><span className="text-muted-foreground">{opt.colorStrategy}</span></div>
                <div className="flex gap-2"><span className="text-primary font-semibold w-20 shrink-0">Typography</span><span className="text-muted-foreground">{opt.typography}</span></div>
                <div className="flex gap-2"><span className="text-primary font-semibold w-20 shrink-0">Dominant</span><span className="text-muted-foreground">{opt.dominantSkill}</span></div>
              </div>
              {compareMode && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex gap-1">{opt.sp7Vector.map((v, j) => (
                    <span key={j} className="flex-1 text-center text-[10px] font-mono" title={dimensions[j]?.name}>
                      <span className="block font-bold text-foreground">{v}</span>
                      <span className="text-muted-foreground">{dimensions[j]?.shortName}</span>
                    </span>
                  ))}</div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Enhancement 4: Design Option Deep-Dive Panel ── */}
      <AnimatePresence>
        {selectedOpt && (
          <motion.section
            key={selectedOpt.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden mb-12"
            aria-label={`${selectedOpt.name} deep-dive`}
          >
            <div className="border border-primary/30 bg-primary/5 rounded p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-['Georgia',_serif] text-xl font-bold text-foreground">{selectedOpt.name}</h3>
                  <p className="text-[11px] tracking-[0.12em] uppercase text-primary font-medium">{selectedOpt.tagline}</p>
                </div>
                <button onClick={() => setSelectedOption(null)} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded hover:bg-muted cursor-pointer" aria-label="Close deep-dive">
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">{selectedOpt.philosophy}</p>

              {/* SP-7 Vector Bar Chart */}
              <div className="mb-6">
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mb-3">SP-7 Dimension Vector</p>
                <div className="space-y-2">
                  {selectedOpt.sp7Vector.map((v, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-muted-foreground w-8 shrink-0" title={dimensions[i]?.name}>{dimensions[i]?.shortName}</span>
                      <div className="flex-1 h-4 bg-muted/40 rounded overflow-hidden">
                        <motion.div
                          className="h-full bg-primary/70 rounded"
                          initial={{ width: 0 }}
                          animate={{ width: `${(v / 5) * 100}%` }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-foreground w-4 text-right">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Weight Distribution */}
              <div className="mb-6">
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mb-3">Skill Weight Distribution (Top 5)</p>
                <div className="space-y-2">
                  {getTopSkills(selectedOpt).map((skill) => (
                    <div key={skill.id} className="flex items-center gap-3">
                      <span className="text-xs text-foreground font-medium flex-1">{skill.name}</span>
                      <div className="w-24 h-2 bg-muted/40 rounded overflow-hidden">
                        <motion.div
                          className="h-full bg-accent/60 rounded"
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.weight}%` }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{skill.weight}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Use Case */}
              <div className="mb-4">
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mb-1">Recommended Use Case</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedOpt.recommended}</p>
              </div>

              {/* Motion Style Demo */}
              <div className="flex items-center gap-3 p-3 bg-muted/20 border border-border rounded">
                <motion.div
                  className="w-3 h-3 rounded-full bg-primary"
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold">Motion Style</p>
                  <p className="text-sm text-foreground">{selectedOpt.motionStyle}</p>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <EditorialDivider />

      {/* Section 2 — The Eagle Sees */}
      <section className="mb-20 py-8" aria-label="SP-7 strategy">
        <SectionHeader num="02" title="The Eagle Sees: Long-Term Strategy" subtitle="How the pieces connect across the design system — SP-7 dimension vectors visualized." />
        <div className="flex flex-wrap gap-2 mb-6">
          {options.map((opt, i) => (
            <button key={opt.id} onClick={() => toggleOpt(opt.id)} className={`min-h-[44px] px-3 py-1.5 text-[11px] tracking-[0.1em] uppercase font-medium border cursor-pointer transition-colors ${selectedOpts.includes(opt.id) ? 'border-foreground/30 bg-foreground/5 text-foreground' : 'border-border bg-transparent text-muted-foreground hover:border-foreground/20'}`} aria-pressed={selectedOpts.includes(opt.id)}>
              <span className="inline-block w-2 h-2 mr-1.5 rounded-full" style={{ backgroundColor: optColors[i] }} aria-hidden="true" />{opt.name.replace('The ', '')}
            </button>
          ))}
        </div>
        {mounted && (
          <div className="bg-card border border-border rounded p-4 md:p-6">
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={filteredRadar}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 5]} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {options.map((opt, i) => selectedOpts.includes(opt.id) && (
                  <Radar key={opt.id} name={opt.name.replace('The ', '')} dataKey={opt.name.replace('The ', '')} stroke={optColors[i]} fill={optColors[i]} fillOpacity={0.1} />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <EditorialDivider />

      {/* Section 3 — Comparative Analysis */}
      <section className="mb-16 py-8" aria-label="Comparative analysis">
        <ErrorBoundary section="Comparative Analysis"><ComparativeAnalysis /></ErrorBoundary>
      </section>

      <EditorialDivider />

      {/* Section 4 — Research Archive (wired-up orphan components) */}
      <section className="mb-16 py-8" aria-label="Research archive">
        <SectionHeader num="04" title="Research Archive · Original Visualizations" subtitle="Earlier visualization passes — Options Showcase, Design Algorithm, Section Mapping, Implementation Blueprint. Kept for reference and contrast with the new infographic system." />
        <div className="space-y-8">
          <ErrorBoundary section="Options Showcase">
            <div className="border border-border rounded p-4 bg-card/20">
              <OptionsShowcase />
            </div>
          </ErrorBoundary>
          <ErrorBoundary section="Design Algorithm">
            <div className="border border-border rounded p-4 bg-card/20">
              <DesignAlgorithm />
            </div>
          </ErrorBoundary>
          <ErrorBoundary section="Section Mapping">
            <div className="border border-border rounded p-4 bg-card/20">
              <SectionMapping />
            </div>
          </ErrorBoundary>
          <ErrorBoundary section="Implementation Blueprint">
            <div className="border border-border rounded p-4 bg-card/20">
              <ImplementationBlueprint />
            </div>
          </ErrorBoundary>
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SUBPAGE: PROXY
// ═══════════════════════════════════════════════════════════
function ProxySubpage() {
  const shouldReduce = useReducedMotion();
  const [activeProxy, setActiveProxy] = useState('transparent');
  const [selectedMatrixRow, setSelectedMatrixRow] = useState<number | null>(null);
  const active = proxyTypes.find((p) => p.id === activeProxy)!;

  return (
    <div className="max-w-[1200px] mx-auto px-6">
      {/* Title */}
      <motion.div className="py-16 md:py-20" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="text-xs tracking-[0.25em] uppercase text-primary font-medium mb-3">Elephant &middot; Dolphin &middot; Eagle</p>
        <h1 className="font-['Georgia',_serif] text-3xl md:text-5xl font-bold text-foreground leading-[1.1] mb-4">
          Proxy Architecture<br /><span className="text-primary">Cross-Domain Intelligence</span>
        </h1>
        <div className="editorial-pullquote">The Elephant remembers cross-field connections. Each proxy type maps to psychology, economics, and science — revealing hidden structure.</div>
      </motion.div>

      <hr className="editorial-rule-thick mb-12" />

      {/* Section 1 — The Elephant Remembers */}
      <section className="mb-20" aria-label="Cross-field connections">
        <SectionHeader num="01" title="The Elephant Remembers: Cross-Field Connections" subtitle="Six proxy types, each illuminated through three disciplinary lenses." />
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
          {proxyTypes.map((proxy) => (
            <motion.div key={proxy.id} variants={fadeInUp} whileHover={shouldReduce ? undefined : { scale: 1.01 }} className={`border rounded p-5 cursor-pointer transition-colors ${activeProxy === proxy.id ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/20'}`} onClick={() => setActiveProxy(proxy.id)} role="button" tabIndex={0} aria-label={`Select ${proxy.name}`} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveProxy(proxy.id); } }}>
              <h3 className="font-['Georgia',_serif] text-base font-bold text-foreground mb-3">{proxy.name}</h3>
              <div className="space-y-3 text-xs">
                <div><span className="text-primary font-semibold">Psychology</span><p className="text-muted-foreground mt-0.5 leading-relaxed">{proxy.psychology.slice(0, 120)}…</p></div>
                <div><span className="text-accent font-semibold">Economics</span><p className="text-muted-foreground mt-0.5 leading-relaxed">{proxy.economics.slice(0, 120)}…</p></div>
                <div><span className="text-chart-4 font-semibold">Science</span><p className="text-muted-foreground mt-0.5 leading-relaxed">{proxy.science.slice(0, 120)}…</p></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <EditorialDivider />

      {/* Section 2 — How We Stand Out */}
      <section className="mb-20 py-8" aria-label="Differentiators">
        <SectionHeader num="02" title="How We Stand Out" subtitle="Strengths, weaknesses, and our differentiator for each proxy type." />
        <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Proxy type selector">
          {proxyTypes.map((proxy) => (
            <button key={proxy.id} onClick={() => setActiveProxy(proxy.id)} role="tab" aria-selected={activeProxy === proxy.id} className={`min-h-[44px] px-3 py-2 text-[11px] tracking-[0.1em] uppercase font-medium border rounded cursor-pointer transition-colors ${activeProxy === proxy.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-foreground/20'}`}>{proxy.name.replace(' Proxy', '')}</button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={active.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="border border-border rounded p-6">
            <h3 className="font-['Georgia',_serif] text-xl font-bold text-foreground mb-4">{active.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div><p className="text-[10px] tracking-[0.2em] uppercase text-primary font-semibold mb-2">Psychology</p><p className="text-sm text-muted-foreground leading-relaxed">{active.psychology}</p></div>
              <div><p className="text-[10px] tracking-[0.2em] uppercase text-accent font-semibold mb-2">Economics</p><p className="text-sm text-muted-foreground leading-relaxed">{active.economics}</p></div>
              <div><p className="text-[10px] tracking-[0.2em] uppercase text-chart-4 font-semibold mb-2">Science</p><p className="text-sm text-muted-foreground leading-relaxed">{active.science}</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border">
              <div><p className="text-[10px] tracking-[0.2em] uppercase text-emerald-600 font-semibold mb-2">Strengths</p><ul className="space-y-1">{active.strengths.map((s, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />{s}</li>)}</ul></div>
              <div><p className="text-[10px] tracking-[0.2em] uppercase text-red-600 font-semibold mb-2">Weaknesses</p><ul className="space-y-1">{active.weaknesses.map((w, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />{w}</li>)}</ul></div>
              <div><p className="text-[10px] tracking-[0.2em] uppercase text-primary font-semibold mb-2">Differentiator</p><p className="text-sm text-muted-foreground leading-relaxed">{active.differentiator}</p></div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      <EditorialDivider />

      {/* ── Enhancement 2: Interactive Comparison Matrix ── */}
      <section className="mb-20 py-8" aria-label="Proxy comparison matrix">
        <SectionHeader num="03" title="Proxy Comparison Matrix" subtitle="Side-by-side comparison across latency, privacy, complexity, and our weighted score." />
        <div className="overflow-x-auto custom-scrollbar border border-border rounded">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b-2 border-foreground bg-muted/10">
                <th className="text-left p-3 text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground">Proxy Type</th>
                <th className="text-center p-3 text-[10px] tracking-[0.15em] uppercase font-semibold text-muted-foreground">Latency</th>
                <th className="text-center p-3 text-[10px] tracking-[0.15em] uppercase font-semibold text-muted-foreground">Privacy</th>
                <th className="text-center p-3 text-[10px] tracking-[0.15em] uppercase font-semibold text-muted-foreground">Complexity</th>
                <th className="text-center p-3 text-[10px] tracking-[0.15em] uppercase font-semibold text-muted-foreground">Our Score</th>
              </tr>
            </thead>
            <tbody>
              {proxyMatrix.map((row, i) => (
                <tr
                  key={row.type}
                  className={`border-b border-border/40 cursor-pointer transition-colors ${selectedMatrixRow === i ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/10'}`}
                  onClick={() => setSelectedMatrixRow(selectedMatrixRow === i ? null : i)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${row.type} proxy`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedMatrixRow(selectedMatrixRow === i ? null : i); } }}
                >
                  <td className="p-3 font-['Georgia',_serif] font-bold text-foreground">{row.type}</td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${matrixIndicatorColor(row.latency)}`} aria-hidden="true" />
                      <span className={matrixCellLabel(row.latency)}>{row.latency}</span>
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${matrixIndicatorColor(row.privacy)}`} aria-hidden="true" />
                      <span className={matrixCellLabel(row.privacy)}>{row.privacy}</span>
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${matrixIndicatorColor(row.complexity)}`} aria-hidden="true" />
                      <span className={matrixCellLabel(row.complexity)}>{row.complexity}</span>
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center justify-center gap-1">
                      <span className="font-['Georgia',_serif] text-lg font-bold text-primary">{row.score}</span>
                      <span className="text-[10px] text-muted-foreground">/10</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Expanded row details */}
        <AnimatePresence>
          {selectedMatrixRow !== null && (() => {
            const row = proxyMatrix[selectedMatrixRow];
            const proxy = proxyTypes.find((p) => p.id === row.type.toLowerCase() || p.name.toLowerCase().includes(row.type.toLowerCase()));
            return (
              <motion.div
                key={row.type}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 border border-primary/30 bg-primary/5 rounded p-5">
                  <h4 className="font-['Georgia',_serif] text-lg font-bold text-foreground mb-3">{row.type} Proxy — Detailed Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-3 border border-border rounded">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mb-1">Latency Impact</p>
                      <p className="text-sm text-foreground">{row.latency} latency — {row.latency === 'Very Low' || row.latency === 'Low' ? 'excellent for real-time applications' : row.latency === 'Medium' ? 'acceptable for most use cases, consider caching' : 'significant overhead, best for non-real-time security'}</p>
                    </div>
                    <div className="p-3 border border-border rounded">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mb-1">Privacy Level</p>
                      <p className="text-sm text-foreground">{row.privacy} privacy — {row.privacy === 'None' ? 'all traffic visible to proxy operator' : row.privacy === 'Low' ? 'minimal obfuscation of client identity' : row.privacy === 'Medium' ? 'partial identity protection with some metadata visible' : 'strong identity shielding and traffic encryption'}</p>
                    </div>
                    <div className="p-3 border border-border rounded">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mb-1">Implementation Complexity</p>
                      <p className="text-sm text-foreground">{row.complexity} complexity — {row.complexity === 'Low' ? 'quick setup, minimal configuration' : row.complexity === 'Medium' ? 'moderate configuration, requires monitoring' : 'significant infrastructure, needs dedicated expertise'}</p>
                    </div>
                  </div>
                  {proxy && (
                    <div className="p-3 border border-primary/20 bg-primary/5 rounded">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-primary font-semibold mb-1">Our Differentiator</p>
                      <p className="text-sm text-muted-foreground">{proxy.differentiator}</p>
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold">Score Calculation:</span>
                    <span className="text-xs text-muted-foreground">strengths({proxy?.strengths.length ?? 0}) − weaknesses({proxy?.weaknesses.length ?? 0}) + differentiator bonus({row.score - (proxy ? proxy.strengths.length - proxy.weaknesses.length : 0) >= 0 ? '+' : ''}{row.score - (proxy ? proxy.strengths.length - proxy.weaknesses.length : 0)}) = <span className="font-bold text-primary">{row.score}/10</span></span>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </section>

      <EditorialDivider />

      {/* Section 4 — The Eagle Sees */}
      <section className="mb-16 py-8" aria-label="Proxy strategy">
        <SectionHeader num="04" title="The Eagle Sees: Long-Term Strategy" subtitle="How proxies compose together in the architecture." />
        <ErrorBoundary section="Proxy Comparison"><ProxyComparison /></ErrorBoundary>
      </section>

      <EditorialDivider />

      {/* Section 5 — Creative Proxy Matrix (dolphin-designed centerpiece) */}
      <section className="mb-16 py-8" aria-label="Creative proxy comparison matrix">
        <SectionHeader num="05" title="Creative Comparison Lab" subtitle="Five lenses on six proxy types — heatmap, signal/noise, traffic lights, gauges, and metaphor cards. Same data, different truths." />
        <ErrorBoundary section="Proxy Matrix"><ProxyMatrix /></ErrorBoundary>
      </section>

      <EditorialDivider />

      {/* Section 6 — Infographic Motion (proxy performance dashboard) */}
      <section className="mb-16 py-8" aria-label="Infographic motion dashboard">
        <SectionHeader num="06" title="Infographic Motion" subtitle="GSAP + Framer Motion hybrid — animated counters, progress arcs, bar meters, all scroll-triggered and reduced-motion aware." />
        <ErrorBoundary section="Infographic Dashboard"><InfographicDashboard /></ErrorBoundary>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SUBPAGE: ARCHITECTURE
// ═══════════════════════════════════════════════════════════
function ArchitectureSubpage() {
  const shouldReduce = useReducedMotion();
  const [animCount, setAnimCount] = useState(0);

  // Animate counter on mount
  useEffect(() => {
    let frame = 0;
    const target = telemetryMetrics.totalInvocations;
    const duration = 1500;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto px-6">
      {/* Title */}
      <motion.div className="py-16 md:py-20" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="text-xs tracking-[0.25em] uppercase text-primary font-medium mb-3">Decision &amp; Data Model</p>
        <h1 className="font-['Georgia',_serif] text-3xl md:text-5xl font-bold text-foreground leading-[1.1] mb-4">
          Architecture<br /><span className="text-primary">Decision &amp; Data Model</span>
        </h1>
        <div className="editorial-pullquote">From decision trees to data models — every architectural choice documented, every dependency visualized.</div>
      </motion.div>

      <hr className="editorial-rule-thick mb-12" />

      {/* Decision Tree */}
      <section className="mb-12" aria-label="Decision tree">
        <ErrorBoundary section="Decision Tree"><DecisionTree /></ErrorBoundary>
      </section>

      <EditorialDivider thick />

      {/* Tier Architecture */}
      <section className="mb-12 py-8" aria-label="Tier architecture">
        <ErrorBoundary section="Tier Architecture"><TierArchitecture /></ErrorBoundary>
      </section>

      <EditorialDivider />

      {/* Data Model Evolution */}
      <section className="mb-16 py-8" aria-label="Data model evolution">
        <SectionHeader num="DM" title="Data Model Evolution" subtitle="From flat ordered list to I/O piping with telemetry — a more resilient architecture." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 rounded p-5">
            <p className="text-[10px] tracking-[0.2em] uppercase text-red-600 dark:text-red-400 font-semibold mb-3">Current — Flat Ordered List</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />Sequential execution, no branching</li>
              <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />No error recovery between stages</li>
              <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />No telemetry or observability</li>
              <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />Budget tracking at orchestration level only</li>
              <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />Rollback semantics — all or nothing</li>
            </ul>
          </div>
          <div className="border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 rounded p-5">
            <p className="text-[10px] tracking-[0.2em] uppercase text-emerald-600 dark:text-emerald-400 font-semibold mb-3">Proposed — I/O Piping with Telemetry</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />Independent skill invocation with standard I/O</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />Failures don&apos;t cascade — errors piped forward</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />Telemetry buffer with batch flush to API</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />Version pinning and schema hash change detection</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />Shell pipeline model: skill1 | skill2 | skill3</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Current Skills', current: '16', proposed: '64' },
            { label: 'Execution Model', current: 'Sequential', proposed: 'Pipe + Parallel' },
            { label: 'Error Recovery', current: 'Rollback', proposed: 'Pipe Forward' },
            { label: 'Telemetry', current: 'None', proposed: 'Batch Flush' },
          ].map((row) => (
            <div key={row.label} className="text-center p-3 border border-border rounded">
              <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-semibold mb-1">{row.label}</p>
              <p className="text-xs text-red-500 line-through">{row.current}</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{row.proposed}</p>
            </div>
          ))}
        </div>
      </section>

      <EditorialDivider />

      {/* ── Enhancement 3: Telemetry Dashboard ── */}
      <section className="mb-16 py-8" aria-label="Telemetry dashboard">
        <SectionHeader num="TL" title="Live Telemetry Dashboard" subtitle="Simulated skill invocation metrics — real-time observability into the pipeline." />

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Total Invocations */}
          <motion.div
            className="border border-border rounded p-4 bg-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold">Invocations</span>
            </div>
            <p className="font-['Georgia',_serif] text-3xl font-bold text-foreground">{animCount.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />+12% this week
            </p>
          </motion.div>

          {/* Success Rate */}
          <motion.div
            className="border border-border rounded p-4 bg-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold">Success Rate</span>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-['Georgia',_serif] text-3xl font-bold text-foreground">{telemetryMetrics.successRate}%</p>
              <svg width="40" height="40" viewBox="0 0 40 40" className="shrink-0" aria-hidden="true">
                <circle cx="20" cy="20" r="16" fill="none" stroke="var(--border)" strokeWidth="3" />
                <circle cx="20" cy="20" r="16" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={`${(telemetryMetrics.successRate / 100) * 100.53} 100.53`} strokeLinecap="round" transform="rotate(-90 20 20)" />
              </svg>
            </div>
          </motion.div>

          {/* P99 Latency */}
          <motion.div
            className="border border-border rounded p-4 bg-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold">P99 Latency</span>
            </div>
            <p className="font-['Georgia',_serif] text-3xl font-bold text-foreground">{telemetryMetrics.p99Latency}<span className="text-sm text-muted-foreground ml-1">ms</span></p>
            <div className="mt-2 h-1.5 bg-muted/40 rounded overflow-hidden">
              <div className="h-full bg-amber-500 rounded" style={{ width: `${(telemetryMetrics.p99Latency / 500) * 100}%` }} />
            </div>
          </motion.div>

          {/* Active Conflicts */}
          <motion.div
            className="border border-border rounded p-4 bg-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold">Conflicts</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-['Georgia',_serif] text-3xl font-bold text-foreground">{telemetryMetrics.activeConflicts}</p>
              <span className="px-1.5 py-0.5 text-[9px] tracking-[0.12em] uppercase font-bold bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded">Warning</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">skill dependency conflicts</p>
          </motion.div>
        </div>

        {/* Invocation Timeline */}
        <div className="border border-border rounded p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold">Recent Invocations (Last 10)</p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" /> Success</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-red-400" aria-hidden="true" /> Failed</span>
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
            {recentInvocations.map((inv, i) => (
              <motion.div
                key={i}
                className={`flex items-center gap-4 p-3 rounded border transition-colors ${inv.status === 'success' ? 'border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/10' : 'border-red-200 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10'}`}
                initial={shouldReduce ? false : { opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${inv.status === 'success' ? 'bg-emerald-500' : 'bg-red-400'}`} aria-hidden="true" />
                <span className="text-sm font-medium text-foreground flex-1">{inv.skill}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${inv.tier === 'T0' ? 'bg-primary/10 text-primary' : inv.tier === 'T1' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : inv.tier === 'T2' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'}`}>{inv.tier}</span>
                <span className={`text-xs font-mono ${inv.status === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                  {inv.status === 'success' ? `${inv.duration}ms` : 'FAILED'}
                </span>
                {inv.status === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <EditorialDivider />

      {/* ── SP-7 Dimensional Radar ── */}
      <section className="mb-16 py-8" aria-label="SP-7 dimensional radar">
        <SectionHeader num="R7" title="SP-7 Dimensional Radar" subtitle="Seven-axis evaluation of every design option — Visual Density, Interactivity, Data Complexity, Motion Need, Accessibility, AI Redirect, Component Reusability. Switch weight profiles to see how scoring shifts." />
        <ErrorBoundary section="SP-7 Radar">
          <div className="border border-border rounded p-6 bg-card/30">
            <SP7Radar />
          </div>
        </ErrorBoundary>
      </section>

      <EditorialDivider />

      {/* ── Skill Invocation Pipeline ── */}
      <section className="mb-16 py-8" aria-label="Skill invocation pipeline">
        <SectionHeader num="PL" title="Skill Invocation Pipeline" subtitle="The I/O piping pattern in action — each skill's JSON output is fed to the next. GSAP draws the connectors stroke-by-stroke on scroll; flowing dashes indicate live data." />
        <ErrorBoundary section="Skill Pipeline">
          <div className="border border-border rounded p-6 bg-card/30">
            <SkillPipeline />
          </div>
        </ErrorBoundary>
      </section>

      <EditorialDivider />

      {/* ── Architecture Tree ── */}
      <section className="mb-16 py-8" aria-label="Architecture tree">
        <SectionHeader num="AT" title="Minimal Flat Registry · Architecture Tree" subtitle="Radial tree of the 4-tier architecture. AI Portal at the center, T0-T3 tiers as concentric rings. Hover any node to see its install command; click a tier label to expand its description." />
        <ErrorBoundary section="Architecture Tree">
          <div className="border border-border rounded p-6 bg-card/30">
            <ArchitectureTree />
          </div>
        </ErrorBoundary>
      </section>

      <EditorialDivider />

      {/* ── Skill Utilization Heatmaps ── */}
      <section className="mb-16 py-8" aria-label="Skill utilization heatmaps">
        <SectionHeader num="HM" title="Skill Utilization Heatmaps" subtitle="Two visualization passes on the same data — which skills power which sections. Interactive heatmap on top, animated grid below." />
        <div className="space-y-6">
          <ErrorBoundary section="Interactive Heatmap">
            <div className="border border-border rounded p-4 bg-card/30">
              <InteractiveHeatmap />
            </div>
          </ErrorBoundary>
          <ErrorBoundary section="Heatmap Viz">
            <div className="border border-border rounded p-4 bg-card/30">
              <HeatmapViz />
            </div>
          </ErrorBoundary>
        </div>
      </section>

      <EditorialDivider />

      {/* ── GSAP + Framer Motion Compatibility Rules ── */}
      <section className="mb-16 py-8" aria-label="GSAP motion compatibility rules">
        <SectionHeader num="GS" title="GSAP × Framer Motion · Compatibility Charter" subtitle="Six non-negotiable rules for using both libraries on the same page without conflict. Owl-observed, eagle-strategic, beaver-guardrailed, dolphin-creative." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gsapMotionRules.map((rule, i) => (
            <motion.div
              key={rule.rule}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="p-4 border border-border rounded bg-card/40 hover:bg-card/70 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 text-primary font-mono font-bold text-xs flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h4 className="font-['Georgia',_serif] text-sm font-bold text-foreground mb-1">{rule.rule}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rule.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SUBPAGE: MARKETPLACE (wrapper)
// ═══════════════════════════════════════════════════════════
function MarketplaceSubpage() {
  return (
    <div>
      <motion.div className="py-16 md:py-20 px-6 max-w-[1200px] mx-auto" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="text-xs tracking-[0.25em] uppercase text-primary font-medium mb-3">Skill Registry</p>
        <h1 className="font-['Georgia',_serif] text-3xl md:text-5xl font-bold text-foreground leading-[1.1] mb-4">
          Skill <span className="text-primary">Marketplace</span>
        </h1>
        <div className="editorial-pullquote">Browse, search, filter, and collect 64 production-ready agent skills. Every skill installable via npx skills add.</div>
      </motion.div>
      <ErrorBoundary section="Skill Marketplace"><SkillMarketplace /></ErrorBoundary>

      {/* Clipboard History panel */}
      <section className="max-w-[1200px] mx-auto px-6 py-12" aria-label="Clipboard history">
        <SectionHeader num="CH" title="Clipboard History" subtitle="A live record of every copied skill command from the marketplace — restore, re-copy, or clear. Demonstrates the resilient clipboard pattern from the audit." />
        <ErrorBoundary section="Clipboard History">
          <div className="border border-border rounded p-4 bg-card/30">
            <ClipboardHistory />
          </div>
        </ErrorBoundary>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SUBPAGE: DOCS
// ═══════════════════════════════════════════════════════════
function DocsSubpage() {
  const shouldReduce = useReducedMotion();
  const [docsSearch, setDocsSearch] = useState('');
  const [docsCategory, setDocsCategory] = useState<string>('all');

  const filteredImages = researchImages.filter((img) => {
    const matchesSearch = docsSearch === '' || img.name.toLowerCase().includes(docsSearch.toLowerCase()) || img.desc.toLowerCase().includes(docsSearch.toLowerCase());
    const matchesCategory = docsCategory === 'all' || img.category === docsCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredReports = pdfReports.filter((report) => {
    const matchesSearch = docsSearch === '' || report.title.toLowerCase().includes(docsSearch.toLowerCase()) || report.desc.toLowerCase().includes(docsSearch.toLowerCase());
    const matchesCategory = docsCategory === 'all' || report.category === docsCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-[1200px] mx-auto px-6">
      {/* Title */}
      <motion.div className="py-16 md:py-20" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="text-xs tracking-[0.25em] uppercase text-primary font-medium mb-3">Research &amp; Reference</p>
        <h1 className="font-['Georgia',_serif] text-3xl md:text-5xl font-bold text-foreground leading-[1.1] mb-4">
          Documentation<br /><span className="text-primary">&amp; Research</span>
        </h1>
        <div className="editorial-pullquote">Visual research gallery, comprehensive PDF reports, skill reference registry, and AI portal routing table.</div>
      </motion.div>

      <hr className="editorial-rule-thick mb-12" />

      {/* ── Enhancement 5: Search & Filter Bar ── */}
      <div className="mb-8 p-4 border border-border rounded bg-muted/10">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search research images and PDF reports…"
              value={docsSearch}
              onChange={(e) => setDocsSearch(e.target.value)}
              className="w-full min-h-[44px] pl-10 pr-4 py-2 text-sm bg-background border border-border rounded focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
              aria-label="Search documentation"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
            {docsCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setDocsCategory(cat)}
                className={`min-h-[36px] px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase font-medium border rounded cursor-pointer transition-colors ${docsCategory === cat ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-foreground/20'}`}
                aria-pressed={docsCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        {(docsSearch || docsCategory !== 'all') && (
          <p className="text-[10px] text-muted-foreground mt-2">
            Showing {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''} and {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
            {docsSearch && <span> matching &ldquo;{docsSearch}&rdquo;</span>}
            {docsCategory !== 'all' && <span> in <span className="text-primary">{docsCategory}</span></span>}
          </p>
        )}
      </div>

      {/* Visual Gallery */}
      <section className="mb-16" aria-label="Visual gallery">
        <ErrorBoundary section="Visual Gallery"><VisualGallery /></ErrorBoundary>
      </section>

      <EditorialDivider />

      {/* Research Images List */}
      <section className="mb-16 py-8" aria-label="Research images">
        <SectionHeader num="RI" title="Research Images" subtitle="Generated analysis visuals from the architecture deep-dive." />
        {filteredImages.length === 0 ? (
          <div className="text-center py-10 border border-border rounded">
            <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No images match your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" role="list">
            {filteredImages.map((img) => (
              <div key={img.file} className="border border-border rounded p-4 hover:border-foreground/20 transition-colors" role="listitem">
                <div className="flex items-start gap-2 mb-2">
                  <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <h4 className="font-['Georgia',_serif] text-sm font-bold text-foreground">{img.name}</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{img.desc}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] font-mono text-muted-foreground/60">{img.file}</span>
                  <span className="text-[9px] tracking-[0.12em] uppercase font-medium px-1.5 py-0.5 bg-muted/40 rounded text-muted-foreground">{img.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <EditorialDivider />

      {/* PDF Reports */}
      <section className="mb-16 py-8" aria-label="PDF reports">
        <SectionHeader num="PDF" title="PDF Reports" subtitle="Comprehensive analysis reports available for download." />
        {filteredReports.length === 0 ? (
          <div className="text-center py-10 border border-border rounded">
            <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No reports match your search criteria.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredReports.map((report, i) => (
              <motion.div key={i} className="flex items-center gap-4 p-4 border border-border rounded hover:border-foreground/20 hover:bg-muted/10 transition-colors group cursor-pointer" whileHover={shouldReduce ? undefined : { x: 2 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
                <BookOpen className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{report.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">{report.desc}</p>
                </div>
                <span className="text-[9px] tracking-[0.12em] uppercase font-medium px-1.5 py-0.5 bg-muted/40 rounded text-muted-foreground shrink-0">{report.category}</span>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">{report.size}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <EditorialDivider />

      {/* Skill Reference */}
      <section className="mb-16 py-8" aria-label="Skill reference">
        <ErrorBoundary section="Skill Reference"><SkillReference /></ErrorBoundary>
      </section>

      <EditorialDivider />

      {/* AI Portal Gateway */}
      <section className="mb-16 py-8" aria-label="AI portal gateway">
        <ErrorBoundary section="AI Portal Gateway"><AIPortalGateway /></ErrorBoundary>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function SkillStackApp() {
  const [activeTab, setActiveTab] = useState<Subpage>('home');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setTheme } = useTheme();
  const shouldReduce = useReducedMotion();

  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: 'smooth' }), []);

  const navigateTo = useCallback((tab: Subpage) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleTheme = useCallback(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) document.documentElement.classList.add('theme-transition');
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    if (!prefersReduced) {
      const cleanup = () => { document.documentElement.classList.remove('theme-transition'); document.documentElement.removeEventListener('transitionend', cleanup); };
      document.documentElement.addEventListener('transitionend', cleanup);
      setTimeout(cleanup, 400);
    }
  }, [setTheme]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border" aria-label="Main navigation">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 flex items-center justify-between h-12">
          {/* Logo */}
          <motion.button onClick={() => navigateTo('home')} className="flex items-center gap-3 cursor-pointer" whileHover={shouldReduce ? undefined : { scale: 1.02 }} whileTap={shouldReduce ? undefined : { scale: 0.98 }} aria-label="Go to home">
            <div className="w-5 h-5 bg-primary flex items-center justify-center" aria-hidden="true"><span className="text-[8px] font-bold text-primary-foreground leading-none">SP</span></div>
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-foreground hidden sm:block">Skill Stack</span>
          </motion.button>

          {/* Desktop Tabs */}
          <div className="hidden md:flex items-center gap-1" role="tablist" aria-label="Section tabs">
            {tabs.map((tab) => (
              <motion.button key={tab.id} onClick={() => navigateTo(tab.id)} role="tab" aria-selected={activeTab === tab.id} className={`min-h-[44px] px-3 flex items-center gap-1.5 text-[10px] tracking-[0.12em] uppercase font-medium cursor-pointer rounded-sm transition-colors relative ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`} whileHover={shouldReduce ? undefined : hoverNavItem.whileHover} transition={hoverNavItem.transition}>
                <span className="hidden lg:inline">{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" layoutId="activeTab" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            {mounted && (
              <motion.button onClick={toggleTheme} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md hover:bg-muted cursor-pointer" aria-label="Toggle dark mode" whileHover={shouldReduce ? undefined : { scale: 1.1 }} whileTap={shouldReduce ? undefined : { scale: 0.9 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
                <Sun className="w-4 h-4 text-foreground hidden dark:block" />
                <Moon className="w-4 h-4 text-foreground block dark:hidden" />
              </motion.button>
            )}

            {/* Mobile Hamburger */}
            <motion.button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer" aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileMenuOpen} whileHover={shouldReduce ? undefined : { scale: 1.05 }} whileTap={shouldReduce ? undefined : { scale: 0.95 }}>
              {mobileMenuOpen ? <XCircle className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="md:hidden border-t border-border bg-background overflow-hidden">
              <div className="max-w-[1200px] mx-auto px-4 py-3 space-y-1">
                {tabs.map((tab, i) => (
                  <motion.button key={tab.id} onClick={() => navigateTo(tab.id)} className={`flex items-center gap-3 w-full text-left min-h-[44px] py-2 text-sm tracking-[0.1em] uppercase font-medium cursor-pointer transition-colors rounded ${activeTab === tab.id ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'}`} initial={shouldReduce ? false : { opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04, duration: 0.2 }}>
                    {tab.icon}
                    {tab.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main id="main-content" className="flex-1 section-below-fold">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}>
            {activeTab === 'home' && <HomeSubpage onNavigate={navigateTo} />}
            {activeTab === 'audit' && <AuditSubpage />}
            {activeTab === 'frontend' && <FrontendSubpage mounted={mounted} />}
            {activeTab === 'proxy' && <ProxySubpage />}
            {activeTab === 'architecture' && <ArchitectureSubpage />}
            {activeTab === 'marketplace' && <MarketplaceSubpage />}
            {activeTab === 'docs' && <DocsSubpage />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-foreground py-10 px-6 bg-background mt-auto" role="contentinfo">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 bg-primary flex items-center justify-center" aria-hidden="true"><span className="text-[8px] font-bold text-primary-foreground leading-none">SP</span></div>
                <span className="text-xs font-medium tracking-[0.2em] uppercase text-foreground">Skill Stack Architecture</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">64 Skills &middot; 4 Tiers &middot; 5 Options &middot; SP-7 Dimensions &middot; 11 Categories</p>
            </div>
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium mb-3">Stack Summary</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>T0 (8): Foundation — design, animation, components</p>
                <p>T1 (15): Interactive — motion, diagrams, data</p>
                <p>T2 (17): Visual Asset — images, testing, content</p>
                <p>T3 (24): Portal — AI routing, strategy, agents</p>
              </div>
            </div>
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium mb-3">Install</p>
              <p className="text-sm text-muted-foreground">Every item installable via <code className="text-primary font-mono text-xs bg-muted px-1.5 py-0.5">npx skills add</code></p>
              <p className="text-xs text-muted-foreground mt-2">GitHub Staging Ready &middot; AI Portal Gateway Enabled</p>
            </div>
          </div>
          <hr className="editorial-rule my-6" />
          <p className="text-[11px] text-muted-foreground tracking-wider text-center">SKILL STACK ARCHITECTURE BLUEPRINT &mdash; EDITORIAL EDITION</p>
        </div>
      </footer>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={scrollToTop} className="fixed bottom-6 right-6 z-50 min-w-[44px] min-h-[44px] bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 cursor-pointer" aria-label="Scroll back to top" whileHover={shouldReduce ? undefined : { scale: 1.1 }} whileTap={shouldReduce ? undefined : { scale: 0.9 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
