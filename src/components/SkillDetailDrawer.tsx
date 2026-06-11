'use client';

import { useState, useMemo } from 'react';
import { Skill, skills, dimensions, options } from '@/lib/skill-data';
import { useSkillStore } from '@/lib/skill-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, ShoppingBasket, Check, FileText, BarChart3, Lightbulb, Eye, Users, Link2, Layers } from 'lucide-react';
import { SkillMarkdownRenderer } from './SkillMarkdownRenderer';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface SkillDetailDrawerProps {
  skill: Skill | null;
}

// SP-7 base vectors by tier
const tierBaseVectors: Record<number, number[]> = {
  0: [3, 2, 2, 3, 4, 2, 3],
  1: [4, 3, 3, 4, 3, 3, 3],
  2: [4, 4, 4, 3, 2, 2, 4],
  3: [3, 2, 3, 2, 3, 5, 2],
};

// Category adjustments: indices are [VD, IR, DC, MN, AW, AR, CR]
const categoryAdjustments: Record<string, number[]> = {
  'Design & UI': [1, 0, 0, 1, 0, 0, 0],
  'Reasoning': [0, 0, 0, 0, 0, 1, 0],
  'Development': [0, 0, 0, 0, 0, 0, 1],
  'Content': [0, 0, 0, 0, 0, 0, 0],
  'Strategy': [0, 0, 1, 0, 0, 1, 0],
  'System': [0, 0, 1, 0, 0, 0, 1],
  'Data & Web': [0, 0, 1, 0, 0, 0, 0],
  'Creative': [1, 0, 0, 1, 0, 0, 0],
  'MCP Servers': [0, 0, 0, 0, 1, 0, 1],
  'Agent Modes': [0, 1, 0, 0, 0, 1, 0],
  'Utility': [0, 0, 0, 0, 0, 0, 1],
};

// Mock install counts by tier
const tierInstallCounts: Record<number, string> = {
  0: '500K+',
  1: '200K+',
  2: '100K+',
  3: '50K+',
};

function generateSP7Vector(skill: Skill): number[] {
  const base = tierBaseVectors[skill.tier] || tierBaseVectors[0];
  const adj = categoryAdjustments[skill.category] || [0, 0, 0, 0, 0, 0, 0];
  return base.map((v, i) => Math.min(5, v + adj[i]));
}

export function SkillDetailDrawer({ skill }: SkillDetailDrawerProps) {
  const { setSelectedSkill, addToClipboard, addToBasket, removeFromBasket, isInBasket } = useSkillStore();
  const [copied, setCopied] = useState(false);

  const open = skill !== null;

  const handleCopy = async () => {
    if (!skill) return;
    try {
      await navigator.clipboard.writeText(skill.installCommand);
      addToClipboard({ id: skill.id, command: skill.installCommand, skillName: skill.name });
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for insecure contexts
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
  };

  const handleBasket = () => {
    if (!skill) return;
    if (isInBasket(skill.id)) {
      removeFromBasket(skill.id);
    } else {
      addToBasket(skill.id);
    }
  };

  // Insights computations
  const categorySkills = useMemo(() => {
    if (!skill) return [];
    return skills.filter((s) => s.category === skill.category && s.id !== skill.id);
  }, [skill]);

  const tierSkills = useMemo(() => {
    if (!skill) return [];
    return skills.filter((s) => s.tier === skill.tier && s.id !== skill.id);
  }, [skill]);

  const relatedSkills = useMemo(() => {
    if (!skill) return [];
    return skills
      .filter((s) => s.id !== skill.id)
      .map((s) => ({
        skill: s,
        overlap: s.tags.filter((t) => skill.tags.includes(t)).length,
      }))
      .filter((r) => r.overlap >= 1)
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, 6);
  }, [skill]);

  // Dependencies: skills with tag overlap >= 2
  const dependencies = useMemo(() => {
    if (!skill) return [];
    return skills
      .filter((s) => s.id !== skill.id)
      .map((s) => ({
        skill: s,
        overlap: s.tags.filter((t) => skill.tags.includes(t)).length,
      }))
      .filter((r) => r.overlap >= 2)
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, 8);
  }, [skill]);

  // Compatibility: which design options use this skill
  const compatibleOptions = useMemo(() => {
    if (!skill) return [];
    return options.filter((opt) => skill.id in opt.skillWeights);
  }, [skill]);

  const tagCloud = useMemo(() => {
    if (!skill) return [];
    const tagCounts: Record<string, number> = {};
    skills.forEach((s) => {
      s.tags.forEach((t) => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });
    return skill.tags.map((t) => ({ tag: t, count: tagCounts[t] || 0 }));
  }, [skill]);

  // Radar chart data
  const radarData = useMemo(() => {
    if (!skill) return [];
    const vector = generateSP7Vector(skill);
    return dimensions.map((dim, i) => ({
      dimension: dim.shortName,
      fullName: dim.name,
      value: vector[i],
    }));
  }, [skill]);

  if (!skill) return null;

  const inBasket = isInBasket(skill.id);
  const sp7Vector = generateSP7Vector(skill);

  // Compute skillDir for the markdown renderer
  const skillDir = skill.installCommand.includes('--skill ')
    ? skill.installCommand.split('--skill ')[1].trim()
    : skill.name.toLowerCase().replace(/\s+/g, '-');

  return (
    <Sheet open={open} onOpenChange={(o) => !o && setSelectedSkill(null)}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="p-4 pb-0">
          <SheetTitle className="flex items-center gap-2">
            <span className="text-2xl">{skill.emoji}</span>
            {skill.name}
          </SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="overview" className="gap-1 text-xs">
                <Eye className="h-3 w-3" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="skillmd" className="gap-1 text-xs">
                <FileText className="h-3 w-3" />
                <span className="hidden sm:inline">SKILL.md</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="gap-1 text-xs">
                <Lightbulb className="h-3 w-3" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
              <TabsTrigger value="radar" className="gap-1 text-xs">
                <BarChart3 className="h-3 w-3" />
                <span className="hidden sm:inline">Radar</span>
              </TabsTrigger>
            </TabsList>

            {/* ─── Tab 1: Overview ─── */}
            <TabsContent value="overview" className="mt-4 space-y-5">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  style={{ borderColor: skill.color + '60', color: skill.color }}
                >
                  {skill.category}
                </Badge>
                <Badge
                  variant="outline"
                  style={{ borderColor: skill.color + '40', color: skill.color }}
                >
                  T{skill.tier} {skill.tierName}
                </Badge>
                {skill.isCustom && (
                  <Badge variant="outline" className="border-red-400 text-red-500">
                    Custom
                  </Badge>
                )}
                {/* Install Count Badge */}
                <Badge variant="secondary" className="gap-1">
                  <Users className="h-3 w-3" />
                  {tierInstallCounts[skill.tier]} installs
                </Badge>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{skill.primaryRole}</p>
              </div>

              {/* Install Command */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Install Command</h3>
                <div className="bg-muted/70 rounded-lg p-3 font-mono text-xs break-all relative">
                  <code className="text-foreground">{skill.installCommand}</code>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant={copied ? 'default' : 'outline'}
                    className="flex-1 gap-1.5"
                    onClick={handleCopy}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy Command'}
                  </Button>
                  <Button
                    size="sm"
                    variant={inBasket ? 'default' : 'outline'}
                    className="gap-1.5"
                    onClick={handleBasket}
                    style={inBasket ? { backgroundColor: skill.color, color: '#1A1A1A' } : {}}
                  >
                    <ShoppingBasket className="h-4 w-4" />
                    {inBasket ? 'In Basket' : 'Add'}
                  </Button>
                </div>
              </div>

              {/* Dependencies Section */}
              {dependencies.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <Link2 className="h-3.5 w-3.5" />
                    Dependencies
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">Skills with strong tag overlap (≥2 shared tags)</p>
                  <ScrollArea className="max-h-32">
                    <div className="flex flex-wrap gap-1.5">
                      {dependencies.map(({ skill: dep, overlap }) => (
                        <button
                          key={dep.id}
                          onClick={() => setSelectedSkill(dep.id)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-muted/50 hover:bg-muted text-foreground transition-colors"
                        >
                          <span>{dep.emoji}</span>
                          {dep.name}
                          <Badge variant="secondary" className="text-[9px] h-4 px-1 ml-0.5">{overlap}</Badge>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Compatibility Section */}
              {compatibleOptions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    Design Compatibility
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">Design options that leverage this skill</p>
                  <div className="space-y-1.5">
                    {compatibleOptions.map((opt) => (
                      <div
                        key={opt.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                      >
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ background: `linear-gradient(135deg, ${opt.colorFrom}, ${opt.colorTo})` }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{opt.name}</p>
                          <p className="text-[10px] text-muted-foreground">{opt.tagline}</p>
                        </div>
                        {opt.skillWeights[skill.id] && (
                          <Badge variant="secondary" className="text-[10px] shrink-0">
                            {opt.skillWeights[skill.id]}% weight
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {skill.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ─── Tab 2: SKILL.md (Rich Markdown Renderer) ─── */}
            <TabsContent value="skillmd" className="mt-4">
              <SkillMarkdownRenderer skillId={skill.id} skillDir={skillDir} />
            </TabsContent>

            {/* ─── Tab 3: Insights ─── */}
            <TabsContent value="insights" className="mt-4 space-y-5">
              {/* Category Breakdown */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Same Category ({skill.category}) — {categorySkills.length + 1} skills
                </h3>
                <ScrollArea className="max-h-32">
                  <div className="flex flex-wrap gap-1.5">
                    {categorySkills.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSkill(s.id)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-muted/50 hover:bg-muted text-foreground transition-colors"
                      >
                        <span>{s.emoji}</span>
                        {s.name}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Tier Analysis */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Same Tier (T{skill.tier} {skill.tierName}) — {tierSkills.length + 1} skills
                </h3>
                <ScrollArea className="max-h-32">
                  <div className="flex flex-wrap gap-1.5">
                    {tierSkills.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSkill(s.id)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-muted/50 hover:bg-muted text-foreground transition-colors"
                      >
                        <span>{s.emoji}</span>
                        {s.name}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Related Skills */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Related Skills</h3>
                {relatedSkills.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No related skills found.</p>
                ) : (
                  <div className="space-y-1.5">
                    {relatedSkills.map(({ skill: rs, overlap }) => (
                      <button
                        key={rs.id}
                        onClick={() => setSelectedSkill(rs.id)}
                        className="w-full flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors text-left"
                      >
                        <span className="text-sm">{rs.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{rs.name}</p>
                          <p className="text-[10px] text-muted-foreground">{rs.category}</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {overlap} shared
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tag Cloud */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Tag Cloud</h3>
                <div className="flex flex-wrap gap-2 items-baseline">
                  {tagCloud.map(({ tag, count }) => (
                    <span
                      key={tag}
                      className="text-muted-foreground hover:text-foreground transition-colors cursor-default"
                      style={{ fontSize: `${Math.max(12, Math.min(24, 10 + count * 2))}px` }}
                    >
                      {tag}
                      <span className="text-[10px] text-muted-foreground/60 ml-0.5">({count})</span>
                    </span>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ─── Tab 4: Radar ─── */}
            <TabsContent value="radar" className="mt-4 space-y-4">
              <div className="w-full aspect-square max-w-sm mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="currentColor" strokeOpacity={0.15} />
                    <PolarAngleAxis
                      dataKey="dimension"
                      tick={{ fontSize: 11, fill: 'currentColor', fillOpacity: 0.6 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 5]}
                      tick={{ fontSize: 9, fill: 'currentColor', fillOpacity: 0.4 }}
                      tickCount={6}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={((value: number, _name: string, props: { payload?: { fullName: string } }) => [
                        `${value}/5`,
                        props?.payload?.fullName || '',
                      ]) as never}
                    />
                    <Radar
                      name={skill.name}
                      dataKey="value"
                      stroke={skill.color}
                      fill={skill.color}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Dimension Table */}
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 font-semibold">Dim</th>
                      <th className="text-left p-2 font-semibold">Name</th>
                      <th className="text-center p-2 font-semibold">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dimensions.map((dim, i) => (
                      <tr key={dim.id} className="border-t border-border/30">
                        <td className="p-2 font-mono text-muted-foreground">{dim.shortName}</td>
                        <td className="p-2">{dim.name}</td>
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(sp7Vector[i] / 5) * 100}%`,
                                  backgroundColor: skill.color,
                                }}
                              />
                            </div>
                            <span className="font-mono w-4 text-right">{sp7Vector[i]}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
