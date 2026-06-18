'use client';

import { useState } from 'react';
import { Treemap, ResponsiveContainer } from 'recharts';
import { motion, useReducedMotion } from 'framer-motion';

// ─── Types ───
export interface TreemapDataItem {
  name: string;
  size: number;
  color: string;
  emoji: string;
  category: string;
}

interface TreemapChartProps {
  data: TreemapDataItem[];
  title?: string;
  subtitle?: string;
}

// ─── Custom Treemap Cell ───
interface CustomContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  emoji?: string;
  color?: string;
  depth?: number;
  index?: number;
}

function CustomTreemapContent(props: CustomContentProps) {
  const { x = 0, y = 0, width = 0, height = 0, name = '', emoji = '', color = '#64748B', depth = 0 } = props;
  const [hovered, setHovered] = useState(false);

  if (depth !== 1 || width < 30 || height < 20) return null;

  // Auto-contrast: dark text on light fills, light text on dark fills
  const isLight = isLightColor(color);
  const textColor = isLight ? '#1e293b' : '#ffffff';
  const bgOpacity = hovered ? 0.55 : 0.3;

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
    >
      <rect
        x={x + 2}
        y={y + 2}
        width={width - 4}
        height={height - 4}
        rx={4}
        ry={4}
        fill={color}
        fillOpacity={bgOpacity}
        stroke={color}
        strokeWidth={hovered ? 2 : 1}
      />
      {width > 60 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2 - 4}
          textAnchor="middle"
          dominantBaseline="central"
          fill={textColor}
          fontSize={11}
          fontFamily="monospace"
          fontWeight={600}
        >
          {emoji}
        </text>
      )}
      {width > 80 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 10}
          textAnchor="middle"
          dominantBaseline="central"
          fill={textColor}
          fontSize={9}
          fontFamily="monospace"
          fontWeight={400}
        >
          {name.length > 12 ? name.slice(0, 11) + '…' : name}
        </text>
      )}
    </g>
  );
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

// ─── Main Component ───
export default function TreemapChart({ data, title, subtitle }: TreemapChartProps) {
  const prefersReducedMotion = useReducedMotion();

  // Wrap data in Recharts treemap format
  const treemapData = [
    {
      name: 'Skills',
      children: data.map((item) => ({
        name: item.name,
        size: item.size,
        color: item.color,
        emoji: item.emoji,
        category: item.category,
      })),
    },
  ];

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {title && (
        <h3 className="font-serif text-lg font-semibold mb-1">{title}</h3>
      )}
      {subtitle && (
        <p className="font-mono text-xs text-muted-foreground mb-3">{subtitle}</p>
      )}

      <div className="w-full h-[300px] sm:h-[360px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <Treemap
            data={treemapData}
            dataKey="size"
            aspectRatio={4 / 3}
            content={<CustomTreemapContent />}
            animationDuration={prefersReducedMotion ? 0 : 600}
            animationEasing="ease-out"
          />
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
