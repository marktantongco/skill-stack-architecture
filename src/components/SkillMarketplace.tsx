'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { skills, skillCategories } from '@/lib/skill-data';
import { useSkillStore } from '@/lib/skill-store';
import { SkillCard } from './SkillCard';
import { SkillDetailDrawer } from './SkillDetailDrawer';
import { ClipboardPanel } from './ClipboardPanel';
import { BasketPanel } from './BasketPanel';
import { SkillGraph } from './SkillGraph';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ShoppingBasket, ClipboardList, X, Search, LayoutGrid, GitBranch } from 'lucide-react';

const tierColors: Record<number, string> = {
  0: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  1: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  2: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  3: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

type ViewMode = 'grid' | 'graph';

export function SkillMarketplace() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTier, setActiveTier] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { clipboardHistory, basket, showClipboard, showBasket, toggleClipboard, toggleBasket, selectedSkillId } = useSkillStore();

  const filtered = useMemo(() => {
    let result = skills;
    if (activeCategory) {
      result = result.filter((s) => s.category === activeCategory);
    }
    if (activeTier !== null) {
      result = result.filter((s) => s.tier === activeTier);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.primaryRole.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)) ||
          s.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeCategory, activeTier, search]);

  const selectedSkill = useMemo(
    () => skills.find((s) => s.id === selectedSkillId) || null,
    [selectedSkillId]
  );

  return (
    <section id="skill-marketplace" className="relative py-16 px-4 md:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2"
        >
          Skill Marketplace
        </motion.h2>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Browse, copy, and collect {skills.length} production-ready agent skills.
          Click any skill for details. Copy install commands instantly.
        </p>
      </div>

      {/* Search + Controls */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search skills by name, role, tag, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-background/60 backdrop-blur-sm border-border/50"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted/50 rounded-lg p-0.5">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                className="h-8 px-3 gap-1.5 text-xs"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'graph' ? 'default' : 'ghost'}
                className="h-8 px-3 gap-1.5 text-xs"
                onClick={() => setViewMode('graph')}
              >
                <GitBranch className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Graph</span>
              </Button>
            </div>
            <Button
              variant={showClipboard ? 'default' : 'outline'}
              size="sm"
              onClick={toggleClipboard}
              className="gap-1.5"
            >
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Clipboard</span>
              {clipboardHistory.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {clipboardHistory.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={showBasket ? 'default' : 'outline'}
              size="sm"
              onClick={toggleBasket}
              className="gap-1.5"
            >
              <ShoppingBasket className="h-4 w-4" />
              <span className="hidden sm:inline">Basket</span>
              {basket.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {basket.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="max-w-7xl mx-auto mb-6 overflow-x-auto">
        <div className="flex gap-2 pb-2 min-w-max">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              !activeCategory
                ? 'bg-foreground text-background'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            All ({skills.length})
          </button>
          {skillCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === cat.name
                  ? 'text-white'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
              style={
                activeCategory === cat.name
                  ? { backgroundColor: cat.color, color: '#1A1A1A' }
                  : {}
              }
            >
              <span>{cat.emoji}</span>
              {cat.name} ({cat.skills.length})
            </button>
          ))}
        </div>
      </div>

      {/* Tier Filter */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex gap-2">
          {[
            { tier: null, label: 'All Tiers' },
            { tier: 0, label: 'T0 Foundation' },
            { tier: 1, label: 'T1 Interactive' },
            { tier: 2, label: 'T2 Visual Asset' },
            { tier: 3, label: 'T3 Portal' },
          ].map(({ tier, label }) => (
            <button
              key={label}
              onClick={() => setActiveTier(tier === activeTier ? null : tier)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                activeTier === tier
                  ? tierColors[tier ?? 0] || 'bg-foreground text-background'
                  : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* View: Grid or Graph */}
      <div className="max-w-7xl mx-auto">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((skill, i) => (
                <motion.div
                  key={skill.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <SkillCard skill={skill} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <SkillGraph filteredSkills={filtered} />
        )}

        {filtered.length === 0 && viewMode === 'grid' && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No skills match your filters.</p>
            <button
              onClick={() => {
                setSearch('');
                setActiveCategory(null);
                setActiveTier(null);
              }}
              className="mt-2 text-primary underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Bottom Dock */}
      <div className="max-w-7xl mx-auto mt-8">
        <AnimatePresence>
          {showClipboard && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <ClipboardPanel />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showBasket && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <BasketPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skill Detail Drawer */}
      <SkillDetailDrawer skill={selectedSkill} />
    </section>
  );
}
