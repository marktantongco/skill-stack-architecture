"use client";

import { motion } from "framer-motion";
import { intentRoutes } from "@/lib/skill-data";
import { useState } from "react";

export function AIPortalGateway() {
  const [searchQuery, setSearchQuery] = useState("");
  const [matchedRoute, setMatchedRoute] = useState<typeof intentRoutes[0] | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) { setMatchedRoute(null); return; }
    const lower = query.toLowerCase();
    let bestMatch: typeof intentRoutes[0] | null = null;
    let bestScore = 0;
    for (const route of intentRoutes) {
      const score = route.keywords.reduce((s, kw) => s + (lower.includes(kw.toLowerCase()) ? 1 : 0), 0);
      if (score > bestScore) { bestScore = score; bestMatch = route; }
    }
    setMatchedRoute(bestScore > 0 ? bestMatch : null);
  };

  return (
    <section id="portal" className="py-20 md:py-28 px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-14">
          <div className="md:col-span-8">
            <div className="flex items-baseline gap-4 mb-3">
              <span className="font-['Georgia',_serif] text-5xl md:text-6xl font-bold text-border leading-none">07</span>
              <h2 className="font-['Georgia',_serif] text-2xl md:text-3xl font-bold text-foreground leading-tight">
                AI Portal Gateway
              </h2>
            </div>
            <div className="editorial-pullquote ml-0 md:ml-20">
              The entry point for AI agents. Intent classification routes queries to the most relevant section automatically.
            </div>
          </div>
        </div>

        <hr className="editorial-rule-thick mb-10" />

        {/* Search — Editorial Underline Input */}
        <div className="max-w-2xl mx-auto mb-14">
          <div className="relative">
            <div className="border-b-2 border-foreground pb-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Type an intent: animation, install skill, which option..."
                className="w-full bg-transparent py-3 text-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none font-['Georgia',_serif]"
              />
            </div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-2">
              Intent Search &middot; Keyword Classification Engine
            </p>

            {matchedRoute && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 border border-border rounded p-4 bg-card"
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
        </div>

        {/* Intent Routing Table */}
        <div className="border-t-2 border-foreground">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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
        </div>
      </div>
    </section>
  );
}
