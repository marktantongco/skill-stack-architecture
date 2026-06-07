"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animation-variants";
import { intentRoutes } from "@/lib/skill-data";
import { useState, useCallback } from "react";

/* ─── Input Sanitization ─── */
const sanitizeInput = (input: string): string => {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'&]/g, "")
    .slice(0, 200);
};

export function AIPortalGateway() {
  const [searchQuery, setSearchQuery] = useState("");
  const [matchedRoute, setMatchedRoute] = useState<typeof intentRoutes[0] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const shouldReduce = useReducedMotion();
  const noMotion = shouldReduce ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } } : null;

  const handleSearch = useCallback((rawQuery: string) => {
    const query = sanitizeInput(rawQuery);
    setSearchQuery(query);

    if (!query.trim()) {
      setMatchedRoute(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Simulate brief loading for UX
    const lower = query.toLowerCase();
    let bestMatch: typeof intentRoutes[0] | null = null;
    let bestScore = 0;
    for (const route of intentRoutes) {
      const score = route.keywords.reduce((s, kw) => s + (lower.includes(kw.toLowerCase()) ? 1 : 0), 0);
      if (score > bestScore) { bestScore = score; bestMatch = route; }
    }

    // Small delay for skeleton visibility
    setTimeout(() => {
      setMatchedRoute(bestScore > 0 ? bestMatch : null);
      setIsSearching(false);
    }, 150);
  }, []);

  return (
    <section id="portal" className="py-20 md:py-28 px-6" aria-label="AI Portal Gateway">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-14"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="md:col-span-8">
            <div className="flex items-baseline gap-4 mb-3">
              <span className="font-['Georgia',_serif] text-5xl md:text-6xl font-bold text-border leading-none" aria-hidden="true">07</span>
              <h2 className="font-['Georgia',_serif] text-2xl md:text-3xl font-bold text-foreground leading-tight">
                AI Portal Gateway
              </h2>
            </div>
            <div className="editorial-pullquote ml-0 md:ml-20">
              The entry point for AI agents. Intent classification routes queries to the most relevant section automatically.
            </div>
          </div>
        </motion.div>

        <hr className="editorial-rule-thick mb-10" />

        {/* Search — Editorial Underline Input */}
        <motion.div
          className="max-w-2xl mx-auto mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <div className="border-b-2 border-foreground pb-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Type an intent: animation, install skill, which option..."
                className="w-full bg-transparent py-3 text-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none font-['Georgia',_serif]"
                aria-label="AI portal intent search"
                maxLength={200}
              />
            </div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-2">
              Intent Search &middot; Keyword Classification Engine
            </p>

            {/* Skeleton Loading */}
            {isSearching && (
              <div className="mt-4 border border-border rounded p-4 bg-card" aria-live="polite" aria-label="Searching">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-3 w-48 bg-muted animate-pulse rounded" />
              </div>
            )}

            {/* Search Result */}
            {matchedRoute && !isSearching && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 border border-border rounded p-4 bg-card"
                aria-live="polite"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {(matchedRoute.confidence * 100).toFixed(0)}% match
                  </span>
                  <span className="text-sm font-semibold text-foreground">{matchedRoute.category}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Redirect to:{" "}
                  <a href={`#${matchedRoute.targetSection}`} className="text-primary hover:underline font-medium">
                    {matchedRoute.targetSection}
                  </a>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Fallback: {matchedRoute.fallback} &middot; Keywords: {matchedRoute.keywords.join(", ")}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Intent Routing Table */}
        <motion.div
          className="border-t-2 border-foreground"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm" role="table" aria-label="Intent routing table">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground">Intent</th>
                  <th className="text-left p-3 text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground">Keywords</th>
                  <th className="text-left p-3 text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground">Target</th>
                  <th className="text-left p-3 text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground">Confidence</th>
                  <th className="text-left p-3 text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground">Fallback</th>
                </tr>
              </thead>
              <tbody>
                {intentRoutes.map((route, i) => (
                  <tr key={i} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                    <td className="p-3 font-medium text-foreground">{route.category}</td>
                    <td className="p-3 text-muted-foreground text-xs font-mono">{route.keywords.join(", ")}</td>
                    <td className="p-3">
                      <a href={`#${route.targetSection}`} className="text-primary hover:underline text-sm font-medium">
                        {route.targetSection}
                      </a>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${route.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">{(route.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{route.fallback}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
