'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animation-variants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Copy, Check, ArrowRight, Zap, Shield, Globe, Layers, TrendingUp, Fingerprint } from 'lucide-react';

/* ─── Proxy Type Definitions ─── */
interface ProxyType {
  id: string;
  name: string;
  tagline: string;
  icon: React.ReactNode;
  color: string;
  bgClass: string;
  psychology: string;
  economics: string;
  science: string;
  strengths: string[];
  weaknesses: string[];
  howWeStandOut: string;
  installHint: string;
}

const proxyTypes: ProxyType[] = [
  {
    id: 'transparent',
    name: 'Transparent Proxy',
    tagline: 'Passes requests through with full visibility',
    icon: <Globe className="h-5 w-5" />,
    color: '#10b981',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    psychology: 'Like an open-plan office — everyone sees everything. Builds trust through radical transparency, but creates self-monitoring anxiety (panopticon effect). Users behave differently when they know they\'re observed.',
    economics: 'Low switching costs, low vendor lock-in. Like a commodity market — price competition dominates, margins compress. Value comes from volume, not differentiation.',
    science: 'Functions like a control variable in an experiment. It holds everything constant so you can measure what changes. But you can\'t discover emergent properties if everything is visible.',
    strengths: ['Zero config required', 'Full request visibility', 'Easy debugging', 'No trust boundary needed', 'Compliant with most regulations'],
    weaknesses: ['No privacy protection', 'Vulnerable to interception', 'Cannot bypass geo-restrictions', 'Zero competitive moat', 'Single point of failure'],
    howWeStandOut: 'Our skill stack operates as a transparent proxy for AI agent intent — every routing decision is visible, auditable, and reversible. Unlike network proxies that merely forward packets, we forward understanding.',
    installHint: 'npx skills add marktantongco/skill-stack-architecture --skill ai-portal-redirect',
  },
  {
    id: 'reverse',
    name: 'Reverse Proxy',
    tagline: 'Intercepts and controls traffic to backend services',
    icon: <Shield className="h-5 w-5" />,
    color: '#3b82f6',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    psychology: 'Like a bouncer at an exclusive club — controls who enters, creates perceived scarcity and desirability. The gatekeeper role confers authority, but also creates resentment when access is denied unfairly.',
    economics: 'High switching costs once integrated. Creates a natural monopoly position — like AWS being the reverse proxy for millions of services. Value accrues to the intermediary, not the endpoints.',
    science: 'Acts as a membrane in cell biology — selectively permeable. It doesn\'t just filter; it actively transports specific molecules (requests) while blocking others, consuming energy (compute) to maintain the gradient.',
    strengths: ['Load balancing', 'SSL termination', 'Caching layer', 'Security hardening', 'Rate limiting'],
    weaknesses: ['Single point of failure', 'Added latency', 'Complex configuration', 'Debugging difficulty', 'Vendor dependency'],
    howWeStandOut: 'Our SP-7 scoring algorithm acts as a reverse proxy for design decisions — it intercepts raw skill selections and routes them through 7 validation dimensions before they reach the implementation layer.',
    installHint: 'npx skills add marktantongco/skill-stack-architecture --skill stack-prioritizer',
  },
  {
    id: 'forward',
    name: 'Forward Proxy',
    tagline: 'Routes outbound traffic through an intermediary',
    icon: <ArrowRight className="h-5 w-5" />,
    color: '#f59e0b',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    psychology: 'Like sending mail through a trusted intermediary — you reveal your message but not your address. Creates plausible deniability and psychological safety, but also enables moral hazard (what would you do if nobody could trace it back?).',
    economics: 'Creates a marketplace for anonymity. Like a VPN market — the product is trust, not throughput. Premium pricing for premium trust, commodity pricing for basic forwarding.',
    science: 'Functions like a catalyst in chemistry — it enables reactions that wouldn\'t otherwise occur by lowering the activation energy (access barrier), but isn\'t consumed in the process.',
    strengths: ['Privacy protection', 'Geo-bypass capability', 'Access control', 'Content filtering', 'Bandwidth optimization'],
    weaknesses: ['Trust in intermediary required', 'Potential for MITM', 'Performance overhead', 'Legal gray areas', 'Black-box routing'],
    howWeStandOut: 'Our AI Portal Gateway acts as a forward proxy for skill discovery — you describe your intent, and we route you to the optimal skill without exposing your full workflow to every provider.',
    installHint: 'npx skills add marktantongco/opencode-accomplishments --skill skill-finder',
  },
  {
    id: 'mesh',
    name: 'Service Mesh',
    tagline: 'Sidecar proxies that manage service-to-service communication',
    icon: <Layers className="h-5 w-5" />,
    color: '#a855f7',
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    psychology: 'Like a diplomatic corps between nations — each sidecar speaks for its service, creating protocol where there was only chaos. The overhead is justified by the reduction in diplomatic incidents (runtime errors). But too many diplomats and nothing gets done.',
    economics: 'High infrastructure cost, massive operational leverage. Like the interstate highway system — enormous upfront investment, but it unlocks economic activity worth 100x the cost. The mesh becomes the economy.',
    science: 'Functions like the extracellular matrix in biology — the non-cellular material that provides structural and biochemical support to surrounding cells. It\'s not the cell itself, but without it, multicellular life is impossible.',
    strengths: ['Zero-trust security', 'Observability', 'Traffic management', 'Circuit breaking', 'Gradual rollouts'],
    weaknesses: ['Massive complexity', 'Performance overhead', 'Steep learning curve', 'Debugging nightmare', 'Overkill for small systems'],
    howWeStandOut: 'Our 4-tier architecture (T0-T3) acts as a service mesh for AI skills — each tier provides sidecar-like capabilities (validation, routing, scoring) without the operational burden of a full Istio/Linkerd deployment.',
    installHint: 'npx skills add marktantongco/skill-stack-architecture --skill matrix-engine',
  },
  {
    id: 'circuit',
    name: 'Circuit Breaker Proxy',
    tagline: 'Fails fast and recovers gracefully under stress',
    icon: <Zap className="h-5 w-5" />,
    color: '#ef4444',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    psychology: 'Like a fuse box in your house — it sacrifices itself to protect the system. Creates psychological safety through guaranteed bounded failure. But constant tripping creates learned helplessness — "why try if it\'s just going to fail again?"',
    economics: 'Prevents cascade failures that cost millions. Like insurance — you pay a small premium (latency) to avoid catastrophic loss (outage). The ROI is invisible until the crisis hits, making it chronically underfunded.',
    science: 'Functions like action potential thresholds in neurons — they fire only when stimulation exceeds a threshold, and then enter a refractory period. This prevents signal amplification into seizures (cascading failures).',
    strengths: ['Prevents cascade failures', 'Graceful degradation', 'Fast recovery', 'Observable failure modes', 'Self-healing'],
    weaknesses: ['Premature trip risk', 'Configuration complexity', 'Cold start problems', 'Monitoring overhead', 'Difficult to test'],
    howWeStandOut: 'Our basket export system includes circuit-breaker logic — if a skill install fails, the pipeline documents the failure and continues rather than halting the entire installation sequence.',
    installHint: 'npx skills add marktantongco/opencode-accomplishments --skill deployment-manager',
  },
  {
    id: 'identity',
    name: 'Identity-Aware Proxy',
    tagline: 'Authenticates and authorizes every request by identity',
    icon: <Fingerprint className="h-5 w-5" />,
    color: '#06b6d4',
    bgClass: 'bg-cyan-100 dark:bg-cyan-900/30',
    psychology: 'Like a passport control — your identity determines your access. Creates belonging and status hierarchies. In-group members get fast lanes; out-group members face scrutiny. This is psychologically efficient but morally fraught.',
    economics: 'Creates a two-sided market between identity providers and service consumers. Like credit scores — the scoring itself becomes the product, more valuable than the underlying service it protects.',
    science: 'Functions like MHC molecules in the immune system — they present protein fragments (identity tokens) to T-cells (authorization services) to determine self vs. non-self. Misidentification causes autoimmune disorders (false positives) or infections (false negatives).',
    strengths: ['Zero-trust architecture', 'Fine-grained access', 'Audit trail', 'Compliance ready', 'Context-aware routing'],
    weaknesses: ['Identity sprawl', 'Single sign-on risk', 'Privacy trade-offs', 'Token management', 'Revocation latency'],
    howWeStandOut: 'Our skill tagging system acts as an identity layer — each skill\'s tag profile determines its access to routing decisions, compatibility scoring, and dependency resolution. Tags ARE the identity tokens.',
    installHint: 'npx skills add marktantongco/opencode-accomplishments --skill mcp-security-scanner',
  },
];

const comparisonDimensions = [
  { id: 'trust', label: 'Trust Model', desc: 'How trust is established and maintained' },
  { id: 'latency', label: 'Latency Impact', desc: 'Performance overhead introduced' },
  { id: 'complexity', label: 'Complexity', desc: 'Operational and cognitive load' },
  { id: 'resilience', label: 'Resilience', desc: 'Ability to withstand failures' },
  { id: 'visibility', label: 'Observability', desc: 'Insight into traffic and decisions' },
  { id: 'fit', label: 'Skill Stack Fit', desc: 'How well this maps to our architecture' },
];

// Comparative scores (1-5) for each proxy type × dimension
const scores: Record<string, Record<string, number>> = {
  transparent: { trust: 5, latency: 1, complexity: 1, resilience: 2, visibility: 5, fit: 4 },
  reverse:     { trust: 4, latency: 2, complexity: 3, resilience: 4, visibility: 4, fit: 5 },
  forward:     { trust: 3, latency: 3, complexity: 2, resilience: 3, visibility: 2, fit: 4 },
  mesh:        { trust: 5, latency: 4, complexity: 5, resilience: 5, visibility: 5, fit: 3 },
  circuit:     { trust: 3, latency: 2, complexity: 3, resilience: 5, visibility: 3, fit: 4 },
  identity:    { trust: 5, latency: 3, complexity: 4, resilience: 4, visibility: 4, fit: 5 },
};

export function ProxyComparison() {
  const [selectedProxy, setSelectedProxy] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'compare' | 'insights'>('overview');
  const shouldReduce = useReducedMotion();
  const noMotion = shouldReduce ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } } : null;

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  return (
    <section id="proxy-comparison" className="py-20 md:py-28 px-6" aria-label="Proxy Architecture Comparison">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-14"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="md:col-span-8">
            <div className="flex items-baseline gap-4 mb-3">
              <span className="font-['Georgia',_serif] text-5xl md:text-6xl font-bold text-border leading-none" aria-hidden="true">
                13
              </span>
              <h2 className="font-['Georgia',_serif] text-2xl md:text-3xl font-bold text-foreground leading-tight">
                Proxy Architecture Comparison
              </h2>
            </div>
            <div className="editorial-pullquote ml-0 md:ml-20">
              Six proxy paradigms examined through psychology, economics, and science — and how this skill stack stands apart from each.
            </div>
          </div>
        </motion.div>

        <hr className="editorial-rule-thick mb-8" />

        {/* Tab Navigation */}
        <div className="flex gap-0 mb-8 border-b border-border" role="tablist">
          {[
            { id: 'overview' as const, label: 'Overview' },
            { id: 'compare' as const, label: 'Compare' },
            { id: 'insights' as const, label: 'Cross-Field' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`min-h-[44px] px-4 py-2 text-[11px] tracking-[0.15em] uppercase font-medium border-b-2 -mb-px cursor-pointer ${
                activeTab === tab.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Overview Tab ─── */}
        {activeTab === 'overview' && (
          <motion.div
            variants={noMotion || staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {proxyTypes.map((proxy) => (
              <motion.div
                key={proxy.id}
                variants={noMotion || fadeInUp}
                whileHover={shouldReduce ? undefined : { y: -2 }}
                className={`group rounded-xl border border-border/50 p-5 cursor-pointer transition-all hover:border-border hover:shadow-md ${
                  selectedProxy === proxy.id ? 'ring-2 ring-primary border-primary' : ''
                }`}
                onClick={() => setSelectedProxy(selectedProxy === proxy.id ? null : proxy.id)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${proxy.bgClass}`} style={{ color: proxy.color }}>
                    {proxy.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{proxy.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{proxy.tagline}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-3">
                  {proxy.howWeStandOut}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {proxy.strengths.slice(0, 3).map((s) => (
                    <Badge key={s} variant="secondary" className="text-[9px] h-5">{s}</Badge>
                  ))}
                </div>

                {/* Mini score bars */}
                <div className="space-y-1.5">
                  {comparisonDimensions.slice(0, 4).map((dim) => (
                    <div key={dim.id} className="flex items-center gap-2">
                      <span className="text-[9px] text-muted-foreground w-14 shrink-0">{dim.label}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(scores[proxy.id][dim.id] / 5) * 100}%`,
                            backgroundColor: proxy.color,
                          }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-muted-foreground w-3">{scores[proxy.id][dim.id]}</span>
                    </div>
                  ))}
                </div>

                {/* Expanded detail */}
                {selectedProxy === proxy.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-border/50 space-y-3"
                  >
                    <div>
                      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Strengths</h4>
                      <div className="flex flex-wrap gap-1">
                        {proxy.strengths.map((s) => (
                          <Badge key={s} variant="outline" className="text-[9px] h-5 border-emerald-300 text-emerald-700 dark:text-emerald-300">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Weaknesses</h4>
                      <div className="flex flex-wrap gap-1">
                        {proxy.weaknesses.map((w) => (
                          <Badge key={w} variant="outline" className="text-[9px] h-5 border-red-300 text-red-700 dark:text-red-300">{w}</Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={copiedId === proxy.id ? 'default' : 'outline'}
                      className="w-full h-7 text-xs gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(proxy.id, proxy.installHint);
                      }}
                    >
                      {copiedId === proxy.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedId === proxy.id ? 'Copied!' : 'Copy Install Command'}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ─── Compare Tab ─── */}
        {activeTab === 'compare' && (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b-2 border-foreground bg-muted/10">
                  <th className="text-left p-3 text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground sticky left-0 bg-muted/10 min-w-[120px]">
                    Dimension
                  </th>
                  {proxyTypes.map((p) => (
                    <th key={p.id} className="text-center p-3 text-[10px] tracking-[0.15em] uppercase font-semibold min-w-[100px]" style={{ color: p.color }}>
                      {p.name.replace(' Proxy', '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonDimensions.map((dim) => (
                  <tr key={dim.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                    <td className="p-3 text-xs font-medium text-foreground sticky left-0 bg-background">
                      {dim.label}
                      <p className="text-[9px] text-muted-foreground font-normal mt-0.5">{dim.desc}</p>
                    </td>
                    {proxyTypes.map((p) => {
                      const score = scores[p.id][dim.id];
                      return (
                        <td key={p.id} className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(score / 5) * 100}%`,
                                  backgroundColor: p.color,
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground">{score}</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── Cross-Field Insights Tab ─── */}
        {activeTab === 'insights' && (
          <motion.div
            variants={noMotion || staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
              Every proxy pattern maps onto principles from other fields. Understanding these cross-field connections reveals
              why certain architectures fail in unexpected ways — and how to design systems that transcend the limitations
              of any single paradigm.
            </p>

            {proxyTypes.map((proxy) => (
              <motion.div
                key={proxy.id}
                variants={noMotion || fadeInUp}
                className="rounded-xl border border-border/50 p-6 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${proxy.bgClass}`} style={{ color: proxy.color }}>
                    {proxy.icon}
                  </div>
                  <h3 className="font-['Georgia',_serif] text-lg font-bold text-foreground">{proxy.name}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Psychology
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{proxy.psychology}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Economics
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{proxy.economics}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Science
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{proxy.science}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/30">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    How This Skill Stack Stands Out
                  </h4>
                  <p className="text-xs text-foreground leading-relaxed">{proxy.howWeStandOut}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
