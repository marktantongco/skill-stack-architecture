"use client";

import { motion } from "framer-motion";
import { intentRoutes, skills } from "@/lib/skill-data";
import { Badge } from "@/components/ui/badge";
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
    <section id="portal" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">AI Portal Gateway</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The entry point for AI agents — intent classification routes queries to the most relevant section
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mb-10"
        >
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Type an intent: e.g. 'animation', 'install skill', 'which option'..."
              className="w-full bg-card border border-border rounded-xl px-5 py-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/40 transition-colors"
            />
            {matchedRoute && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-xl p-4 shadow-xl z-10"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    {matchedRoute.confidence * 100}% confidence
                  </Badge>
                  <span className="text-sm font-medium text-foreground">{matchedRoute.category}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Redirect to: <span className="text-foreground font-medium">{matchedRoute.targetSection}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Fallback: {matchedRoute.fallback} | Keywords: {matchedRoute.keywords.join(", ")}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Intent Routing Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border border-border rounded-2xl overflow-hidden bg-card"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-3 font-semibold text-muted-foreground">Intent</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground">Keywords</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground">Target</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground">Confidence</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground">Fallback</th>
                </tr>
              </thead>
              <tbody>
                {intentRoutes.map((route, i) => (
                  <tr key={i} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                    <td className="p-3 font-medium text-foreground">{route.category}</td>
                    <td className="p-3 text-muted-foreground text-xs font-mono">{route.keywords.join(", ")}</td>
                    <td className="p-3">
                      <a href={`#${route.targetSection}`} className="text-sm text-emerald-400 hover:underline">{route.targetSection}</a>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-400" style={{ width: `${route.confidence * 100}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{(route.confidence * 100).toFixed(0)}%</span>
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
