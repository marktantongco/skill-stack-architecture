'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBasket, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { skills } from '@/lib/skill-data';
import { useSkillStore } from '@/lib/skill-store';
import { copyToClipboard } from '@/lib/clipboard';
import { springs } from '@/lib/animation-variants';

const tierColors: Record<number, string> = {
  0: '#BFFF00',
  1: '#08F7FE',
  2: '#FF2E63',
  3: '#FFE600',
};

export function SkillBasket() {
  const { basket, removeFromBasket, clearBasket } = useSkillStore();

  const basketSkills = basket
    .map((b) => {
      const skill = skills.find((s) => s.id === b.skillId);
      return skill ? { ...skill, addedAt: b.addedAt } : null;
    })
    .filter(Boolean) as (typeof skills[number] & { addedAt: number })[];

  const handleExport = async () => {
    const script = basketSkills
      .map((s) => `# ${s.id} — ${s.name} (T${s.tier} ${s.tierName})\n${s.installCommand}`)
      .join('\n\n');

    const bashScript = `#!/bin/bash
# KDI Skill Stack — Export $(new Date).toISOString().slice(0,10)
# ${basketSkills.length} skills

set -e

${script}

echo "✅ All ${basketSkills.length} skills installed!"
`;

    const ok = await copyToClipboard(bashScript);
    if (ok) {
      // Could add a toast here
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShoppingBasket className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium">
            Basket
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            ({basketSkills.length})
          </span>
        </div>
        <div className="flex items-center gap-1">
          {basketSkills.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExport}
                className="h-7 text-[10px] text-muted-foreground hover:text-foreground"
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearBasket}
                className="h-7 text-[10px] text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {basketSkills.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-4 text-center">
          No skills in basket yet. Click &quot;+ Basket&quot; on a skill card.
        </p>
      ) : (
        <div className="flex-1 overflow-y-auto max-h-64 space-y-1.5 pr-1 custom-scrollbar">
          <AnimatePresence initial={false}>
            {basketSkills.map((skill) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.97 }}
                transition={springs.snappy}
                className="group flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border transition-colors"
              >
                <div
                  className="w-1 h-8 rounded-full shrink-0"
                  style={{ backgroundColor: skill.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {skill.id}
                    </span>
                    <Badge
                      className="text-[8px] px-1 py-0 h-4"
                      style={{
                        backgroundColor: tierColors[skill.tier] + '20',
                        color: tierColors[skill.tier],
                        borderColor: tierColors[skill.tier] + '40',
                      }}
                    >
                      T{skill.tier}
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground truncate">{skill.name}</p>
                </div>
                <button
                  onClick={() => removeFromBasket(skill.id)}
                  className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0 cursor-pointer"
                  aria-label={`Remove ${skill.name} from basket`}
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
