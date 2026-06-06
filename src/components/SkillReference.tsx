"use client";

import { motion } from "framer-motion";
import { skills } from "@/lib/skill-data";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const tierColors: Record<number, string> = {
  0: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  1: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  2: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  3: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
};

const tierNames: Record<number, string> = {
  0: "Foundation",
  1: "Interactive",
  2: "Visual Asset",
  3: "Portal",
};

export function SkillReference() {
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const filtered = selectedTier !== null ? skills.filter(s => s.tier === selectedTier) : skills;

  const handleCopy = (id: string, cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="skill-reference" className="py-20 px-4 bg-muted/5">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Master Skill Registry</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            16 skills across 4 tiers — every item installable via <code className="text-sm bg-muted px-2 py-0.5 rounded">npx skills add</code>
          </p>
        </motion.div>

        {/* Tier filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setSelectedTier(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTier === null ? "bg-foreground text-background" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
          >
            All ({skills.length})
          </button>
          {[0, 1, 2, 3].map(t => (
            <button
              key={t}
              onClick={() => setSelectedTier(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTier === t ? "bg-foreground text-background" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
            >
              Tier {t}: {tierNames[t]} ({skills.filter(s => s.tier === t).length})
            </button>
          ))}
        </div>

        {/* Skill cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((skill, i) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="border border-border rounded-xl p-5 bg-card hover:border-foreground/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{skill.id}</span>
                  <h3 className="font-semibold text-foreground">{skill.name}</h3>
                  {skill.isCustom && <Badge variant="outline" className="text-[10px] bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30">CUSTOM</Badge>}
                </div>
                <Badge variant="outline" className={tierColors[skill.tier]}>Tier {skill.tier}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{skill.primaryRole}</p>
              <button
                onClick={() => handleCopy(skill.id, skill.installCommand)}
                className="w-full text-left bg-muted/40 rounded-lg px-3 py-2 font-mono text-xs text-muted-foreground hover:bg-muted transition-colors flex items-center justify-between group"
              >
                <span className="truncate mr-2">{skill.installCommand}</span>
                <span className="shrink-0 text-[10px] opacity-50 group-hover:opacity-100 transition-opacity">
                  {copiedId === skill.id ? "✓ Copied" : "Copy"}
                </span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
