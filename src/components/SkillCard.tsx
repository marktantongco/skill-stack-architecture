'use client';

import { motion } from 'framer-motion';
import { Skill } from '@/lib/skill-data';
import { useSkillStore } from '@/lib/skill-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, ShoppingBasket, Check, Eye } from 'lucide-react';
import { useState, useCallback } from 'react';

const tierColors: Record<number, string> = {
  0: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
  1: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  2: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  3: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
};

interface SkillCardProps {
  skill: Skill;
}

export function SkillCard({ skill }: SkillCardProps) {
  const { addToClipboard, addToBasket, removeFromBasket, isInBasket, setSelectedSkill, basket } = useSkillStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(skill.installCommand);
      addToClipboard({ id: skill.id, command: skill.installCommand, skillName: skill.name });
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for insecure contexts (HTTP, iframe restrictions)
      const textarea = document.createElement('textarea');
      textarea.value = skill.installCommand;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      addToClipboard({ id: skill.id, command: skill.installCommand, skillName: skill.name });
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [skill, addToClipboard]);

  const handleBasket = useCallback(() => {
    if (isInBasket(skill.id)) {
      removeFromBasket(skill.id);
    } else {
      addToBasket(skill.id);
    }
  }, [skill.id, isInBasket, addToBasket, removeFromBasket]);

  const inBasket = isInBasket(skill.id);

  return (
    <div
      className="group relative rounded-xl border border-border/50 bg-background/60 backdrop-blur-sm p-4 transition-all hover:border-border hover:shadow-md hover:bg-background/80"
      style={{ borderLeftWidth: '3px', borderLeftColor: skill.color }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <button
            onClick={() => setSelectedSkill(skill.id)}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate block w-full text-left"
          >
            {skill.emoji} {skill.name}
          </button>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${tierColors[skill.tier]}`}>
              T{skill.tier}
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0"
              style={{ borderColor: skill.color + '60', color: skill.color }}
            >
              {skill.category}
            </Badge>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
        {skill.primaryRole}
      </p>

      {/* Install Command Preview with green pulse indicator */}
      <div className="bg-muted/50 rounded-md p-2 mb-3 font-mono text-[10px] text-muted-foreground overflow-hidden relative">
        <code className="truncate block pr-4">{skill.installCommand}</code>
        {/* Green pulse dot indicating one-click copyable */}
        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={copied ? 'default' : 'outline'}
          className="flex-1 h-8 text-xs gap-1"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <Button
          size="sm"
          variant={inBasket ? 'default' : 'outline'}
          className="h-8 text-xs gap-1 relative"
          onClick={handleBasket}
          style={inBasket ? { backgroundColor: skill.color, color: '#1A1A1A' } : {}}
        >
          <ShoppingBasket className="h-3 w-3" />
          {/* Basket count badge when in basket */}
          {inBasket && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {basket.findIndex(b => b.skillId === skill.id) + 1}
            </span>
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs"
          onClick={() => setSelectedSkill(skill.id)}
        >
          <Eye className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
