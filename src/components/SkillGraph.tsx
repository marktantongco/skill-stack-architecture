'use client';

import { useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { skills, skillCategories, Skill } from '@/lib/skill-data';
import { useSkillStore } from '@/lib/skill-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

interface NodePosition {
  skill: Skill;
  x: number;
  y: number;
}

interface Connection {
  source: NodePosition;
  target: NodePosition;
  sharedTags: number;
}

const TIER_RADII: Record<number, number> = { 0: 5, 1: 7, 2: 9, 3: 12 };
const SVG_SIZE = 800;
const CENTER = SVG_SIZE / 2;
const RING_RADIUS = 300;
const MIN_SHARED_TAGS = 2;

function computeLayout(filteredSkills: Skill[]): {
  nodes: NodePosition[];
  connections: Connection[];
} {
  // Group skills by category
  const catSkills: Record<string, Skill[]> = {};
  filteredSkills.forEach((s) => {
    if (!catSkills[s.category]) catSkills[s.category] = [];
    catSkills[s.category].push(s);
  });

  const activeCats = skillCategories.filter((c) => catSkills[c.name]?.length);
  const nodes: NodePosition[] = [];

  activeCats.forEach((cat, catIdx) => {
    const catSkillList = catSkills[cat.name] || [];
    const angleStart = (catIdx / activeCats.length) * Math.PI * 2 - Math.PI / 2;
    const angleSpan = (1 / activeCats.length) * Math.PI * 2;

    catSkillList.forEach((skill, skillIdx) => {
      const angleOffset = catSkillList.length === 1
        ? angleSpan / 2
        : (skillIdx / (catSkillList.length - 1)) * angleSpan;
      const angle = angleStart + angleOffset;
      const jitterX = (Math.cos(angle * 7 + skillIdx * 3) * 15);
      const jitterY = (Math.sin(angle * 5 + skillIdx * 2) * 15);
      const x = CENTER + Math.cos(angle) * RING_RADIUS + jitterX;
      const y = CENTER + Math.sin(angle) * RING_RADIUS + jitterY;
      nodes.push({ skill, x, y });
    });
  });

  // Compute connections for shared tags >= MIN_SHARED_TAGS
  const connections: Connection[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const shared = nodes[i].skill.tags.filter((t) => nodes[j].skill.tags.includes(t)).length;
      if (shared >= MIN_SHARED_TAGS) {
        connections.push({
          source: nodes[i],
          target: nodes[j],
          sharedTags: shared,
        });
      }
    }
  }

  return { nodes, connections };
}

interface SkillGraphProps {
  filteredSkills?: Skill[];
}

export function SkillGraph({ filteredSkills }: SkillGraphProps) {
  const { setSelectedSkill } = useSkillStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const displaySkills = filteredSkills || skills;

  const { nodes, connections } = useMemo(
    () => computeLayout(displaySkills),
    [displaySkills]
  );

  // Find connections for hovered node
  const hoveredConnections = useMemo(() => {
    if (!hoveredId) return new Set<string>();
    const connectedIds = new Set<string>();
    connectedIds.add(hoveredId);
    connections.forEach((conn) => {
      if (conn.source.skill.id === hoveredId) connectedIds.add(conn.target.skill.id);
      if (conn.target.skill.id === hoveredId) connectedIds.add(conn.source.skill.id);
    });
    return connectedIds;
  }, [hoveredId, connections]);

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(3, z + 0.25)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(0.5, z - 0.25)), []);
  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.5, Math.min(3, z - e.deltaY * 0.001)));
  }, []);

  // Handle drag to pan
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [dragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  return (
    <div className="relative w-full">
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50 p-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Categories</p>
        <div className="space-y-0.5">
          {skillCategories.map((cat) => {
            const count = displaySkills.filter((s) => s.category === cat.name).length;
            if (count === 0) return null;
            return (
              <div key={cat.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-[10px] text-foreground leading-tight">{cat.name}</span>
                <span className="text-[10px] text-muted-foreground">({count})</span>
              </div>
            );
          })}
        </div>
        <div className="border-t border-border/50 mt-1.5 pt-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Tier Size</p>
          <div className="flex items-center gap-3">
            {[0, 1, 2, 3].map((t) => (
              <div key={t} className="flex items-center gap-1">
                <div
                  className="rounded-full bg-muted-foreground/40"
                  style={{ width: TIER_RADII[t], height: TIER_RADII[t] }}
                />
                <span className="text-[10px] text-muted-foreground">T{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        className="w-full h-[500px] md:h-[600px] rounded-xl border border-border/50 bg-background/30 overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: dragging ? 'none' : 'transform 0.2s ease-out',
          }}
        >
          <defs>
            {skillCategories.map((cat) => (
              <radialGradient key={cat.name} id={`glow-${cat.name.replace(/[^a-zA-Z0-9]/g, '')}`}>
                <stop offset="0%" stopColor={cat.color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={cat.color} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* Connection Lines */}
          {connections.map((conn, i) => {
            const isHighlighted = hoveredId
              ? (conn.source.skill.id === hoveredId || conn.target.skill.id === hoveredId)
              : true;
            return (
              <line
                key={`conn-${i}`}
                x1={conn.source.x}
                y1={conn.source.y}
                x2={conn.target.x}
                y2={conn.target.y}
                stroke={isHighlighted ? conn.source.skill.color : 'currentColor'}
                strokeOpacity={isHighlighted ? 0.4 : 0.06}
                strokeWidth={isHighlighted ? Math.min(conn.sharedTags * 0.5, 2.5) : 0.5}
                strokeDasharray={isHighlighted ? 'none' : '2 4'}
              />
            );
          })}

          {/* Category Labels on Ring */}
          {(() => {
            const catSkillsMap: Record<string, Skill[]> = {};
            displaySkills.forEach((s) => {
              if (!catSkillsMap[s.category]) catSkillsMap[s.category] = [];
              catSkillsMap[s.category].push(s);
            });
            const activeCats = skillCategories.filter((c) => catSkillsMap[c.name]?.length);
            return activeCats.map((cat, catIdx) => {
              const angleStart = (catIdx / activeCats.length) * Math.PI * 2 - Math.PI / 2;
              const angleSpan = (1 / activeCats.length) * Math.PI * 2;
              const midAngle = angleStart + angleSpan / 2;
              const labelRadius = RING_RADIUS + 40;
              const lx = CENTER + Math.cos(midAngle) * labelRadius;
              const ly = CENTER + Math.sin(midAngle) * labelRadius;
              return (
                <text
                  key={`cat-label-${cat.name}`}
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={cat.color}
                  fontSize="9"
                  fontWeight="600"
                  opacity={0.7}
                >
                  {cat.emoji} {cat.name}
                </text>
              );
            });
          })()}

          {/* Skill Nodes */}
          {nodes.map((node) => {
            const { skill, x, y } = node;
            const r = TIER_RADII[skill.tier] || 5;
            const isHovered = hoveredId === skill.id;
            const isConnected = hoveredId ? hoveredConnections.has(skill.id) : true;
            const isDimmed = hoveredId ? !isConnected : false;

            return (
              <g key={skill.id}>
                {/* Glow on hover */}
                {isHovered && (
                  <circle
                    cx={x}
                    cy={y}
                    r={r + 8}
                    fill={`url(#glow-${skill.category.replace(/[^a-zA-Z0-9]/g, '')})`}
                  />
                )}
                <motion.circle
                  cx={x}
                  cy={y}
                  r={isHovered ? r + 2 : r}
                  fill={isDimmed ? 'currentColor' : skill.color}
                  fillOpacity={isDimmed ? 0.1 : isHovered ? 1 : 0.8}
                  stroke={isDimmed ? 'currentColor' : skill.color}
                  strokeWidth={isHovered ? 2 : 1}
                  strokeOpacity={isDimmed ? 0.1 : 0.6}
                  style={{ cursor: 'pointer' }}
                  whileHover={{ scale: 1.4 }}
                  onMouseEnter={() => setHoveredId(skill.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setSelectedSkill(skill.id)}
                />
                {/* Skill label (show on hover or if no hover) */}
                {(isHovered || !hoveredId) && (
                  <text
                    x={x}
                    y={y + r + 10}
                    textAnchor="middle"
                    dominantBaseline="hanging"
                    fill="currentColor"
                    fillOpacity={isDimmed ? 0.1 : 0.8}
                    fontSize="7"
                    fontWeight="500"
                    style={{ pointerEvents: 'none' }}
                  >
                    {skill.emoji} {skill.name.length > 14 ? skill.name.slice(0, 12) + '…' : skill.name}
                  </text>
                )}
                {/* Hovered tooltip detail */}
                {isHovered && (
                  <>
                    <rect
                      x={x - 70}
                      y={y - r - 42}
                      width={140}
                      height={30}
                      rx={6}
                      fill="hsl(var(--popover))"
                      stroke="hsl(var(--border))"
                      strokeWidth={0.5}
                    />
                    <text
                      x={x}
                      y={y - r - 32}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="hsl(var(--popover-foreground))"
                      fontSize="8"
                      fontWeight="600"
                    >
                      {skill.name}
                    </text>
                    <text
                      x={x}
                      y={y - r - 20}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="hsl(var(--muted-foreground))"
                      fontSize="7"
                    >
                      T{skill.tier} · {skill.category}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stats footer */}
      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
        <span>{nodes.length} nodes</span>
        <span>·</span>
        <span>{connections.length} connections</span>
        <span>·</span>
        <span>Zoom: {Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
}
