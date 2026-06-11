'use client';

import { useMemo, useState } from 'react';
import { useSkillStore } from '@/lib/skill-store';
import { skills } from '@/lib/skill-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ShoppingBasket, X, Trash2, Download, ChevronDown, ChevronRight, Check, FileJson, Terminal, Copy } from 'lucide-react';

const tierConfig: Record<number, { label: string; color: string; bgColor: string }> = {
  0: { label: 'T0 Foundation', color: '#10b981', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  1: { label: 'T1 Interactive', color: '#3b82f6', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  2: { label: 'T2 Visual Asset', color: '#f59e0b', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  3: { label: 'T3 Portal', color: '#a855f7', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
};

function BasketItemRow({ skillId }: { skillId: string }) {
  const { removeFromBasket, setSelectedSkill } = useSkillStore();
  const [expanded, setExpanded] = useState(false);
  const skill = skills.find((s) => s.id === skillId);

  if (!skill) return null;

  return (
    <div
      className="rounded-lg bg-muted/30 overflow-hidden group hover:bg-muted/50 transition-colors"
      style={{ borderLeftWidth: '3px', borderLeftColor: skill.color }}
    >
      <div className="flex items-center gap-2 p-2.5">
        <span className="text-sm shrink-0">{skill.emoji}</span>
        <button
          onClick={() => setSelectedSkill(skill.id)}
          className="flex-1 min-w-0 text-left"
        >
          <p className="text-xs font-medium truncate hover:text-primary transition-colors">{skill.name}</p>
          <p className="text-[10px] text-muted-foreground">
            T{skill.tier} {skill.tierName} &middot; {skill.category}
          </p>
        </button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={() => removeFromBasket(skillId)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center gap-1 px-2.5 pb-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            {expanded ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}
            Install command
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-2.5 pb-2.5">
            <code className="text-[10px] font-mono text-muted-foreground break-all leading-relaxed block bg-muted/40 rounded p-1.5">
              {skill.installCommand}
            </code>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function BasketPanel() {
  const { basket, clearBasket } = useSkillStore();
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const tierGroups = useMemo(() => {
    const groups: Record<number, string[]> = { 0: [], 1: [], 2: [], 3: [] };
    basket.forEach((item) => {
      const skill = skills.find((s) => s.id === item.skillId);
      if (skill) {
        groups[skill.tier] = [...groups[skill.tier], item.skillId];
      }
    });
    return groups;
  }, [basket]);

  const handleExport = async (type: 'script' | 'commands' | 'json') => {
    let text = '';
    const basketSkills = basket
      .map((b) => skills.find((s) => s.id === b.skillId))
      .filter(Boolean) as typeof skills;

    if (type === 'script') {
      text = '#!/bin/bash\nset -e\n\n' + basketSkills.map((s) => s.installCommand).join('\n');
    } else if (type === 'commands') {
      text = basketSkills.map((s) => s.installCommand).join('\n');
    } else {
      text = JSON.stringify(
        basketSkills.map((s) => ({ id: s.id, name: s.name, installCommand: s.installCommand })),
        null,
        2
      );
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for insecure contexts (HTTP, iframe restrictions)
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 1500);
  };

  const tierSummary = useMemo(() => {
    return [0, 1, 2, 3]
      .map((t) => ({ tier: t, count: tierGroups[t].length }))
      .filter((t) => t.count > 0);
  }, [tierGroups]);

  return (
    <div className="border border-border/50 rounded-xl bg-background/60 backdrop-blur-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <ShoppingBasket className="h-4 w-4" />
          Skill Basket
          <Badge variant="secondary" className="text-xs h-5 px-1.5">
            {basket.length}
          </Badge>
        </h3>
        <div className="flex gap-2">
          {basket.length > 0 && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                    <Download className="h-3 w-3" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('script')}>
                    <Terminal className="h-3.5 w-3.5 mr-2" />
                    {copiedType === 'script' ? '✓ Copied!' : 'Copy Script'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('commands')}>
                    {copiedType === 'commands' ? <Check className="h-3.5 w-3.5 mr-2" /> : <Copy className="h-3.5 w-3.5 mr-2" />}
                    {copiedType === 'commands' ? 'Copied!' : 'Copy Commands'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('json')}>
                    <FileJson className="h-3.5 w-3.5 mr-2" />
                    {copiedType === 'json' ? '✓ Copied!' : 'Copy as JSON'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1 text-destructive"
                onClick={clearBasket}
              >
                <Trash2 className="h-3 w-3" /> Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {basket.length === 0 ? (
        <div className="text-center py-6">
          <ShoppingBasket className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No skills in basket.</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Click the basket icon on any skill card to collect skills for batch installation.
          </p>
        </div>
      ) : (
        <ScrollArea className="max-h-80">
          <div className="space-y-4 pr-2">
            {[0, 1, 2, 3].map((tier) => {
              const items = tierGroups[tier];
              if (items.length === 0) return null;
              const config = tierConfig[tier];
              return (
                <div key={tier}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: config.color }}
                    />
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {config.label}
                    </p>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1">
                      {items.length}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    {items.map((skillId) => (
                      <BasketItemRow key={skillId} skillId={skillId} />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Install Summary */}
            <div className="border-t border-border/50 pt-3 mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Install Summary
              </p>
              <div className="flex flex-wrap gap-2">
                {tierSummary.map(({ tier, count }) => (
                  <div
                    key={tier}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs ${tierConfig[tier].bgColor}`}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: tierConfig[tier].color }}
                    />
                    <span className="font-medium">T{tier}</span>
                    <span className="text-muted-foreground">×{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
