'use client';

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area, CartesianGrid,
  ComposedChart, Line,
} from 'recharts';
import { motion, useReducedMotion } from 'framer-motion';

// ─── Shared types ───
type ChartDataItem = Record<string, string | number>;

interface ChartDashboardProps {
  /** Title for the dashboard */
  title: string;
  /** Subtitle / description */
  subtitle?: string;
  /** Category distribution data for pie chart (needs name + value) */
  categoryData: ChartDataItem[];
  /** SP-7 dimension data for radar chart (needs dimension + series) */
  radarData: ChartDataItem[];
  /** Tier skill count for bar chart (needs name + count + avg) */
  tierData: ChartDataItem[];
  /** Invocation timeline for area chart (needs time + invocations + failures) */
  timelineData: ChartDataItem[];
  /** Color for chart accents */
  accentColor?: string;
}

// ─── Color palette ───
const CHART_COLORS = [
  '#64748B', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981',
  '#EF4444', '#06B6D4', '#EC4899', '#84CC16', '#F97316',
];

export default function ChartDashboard({
  title,
  subtitle,
  categoryData,
  radarData,
  tierData,
  timelineData,
  accentColor = 'var(--accent)',
}: ChartDashboardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeChart, setActiveChart] = useState<string>('all');

  const charts = [
    { id: 'all', label: 'All Charts' },
    { id: 'category', label: 'Category' },
    { id: 'radar', label: 'SP-7 Radar' },
    { id: 'tier', label: 'Tier Bars' },
    { id: 'timeline', label: 'Timeline' },
  ];

  const animDuration = prefersReducedMotion ? 0 : 600;

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="mb-4">
        <h3 className="font-serif text-lg font-semibold">{title}</h3>
        {subtitle && <p className="font-mono text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>

      {/* Chart type tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {charts.map((chart) => (
          <button
            key={chart.id}
            onClick={() => setActiveChart(chart.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-mono whitespace-nowrap transition-colors ${
              activeChart === chart.id
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {chart.label}
          </button>
        ))}
      </div>

      {/* Charts grid */}
      <div className={`grid gap-4 ${
        activeChart === 'all' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
      }`}>
        {/* Category Distribution Pie */}
        {(activeChart === 'all' || activeChart === 'category') && (
          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-mono text-xs font-semibold text-muted-foreground mb-2">Skill Distribution by Category</h4>
            <div className={activeChart === 'all' ? 'h-[240px]' : 'h-[360px]'}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={activeChart === 'all' ? 40 : 60}
                    outerRadius={activeChart === 'all' ? 70 : 100}
                    dataKey="value"
                    nameKey="name"
                    animationDuration={animDuration}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  />
                  {activeChart !== 'all' && <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />}
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* SP-7 Radar */}
        {(activeChart === 'all' || activeChart === 'radar') && (
          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-mono text-xs font-semibold text-muted-foreground mb-2">SP-7 Dimension Comparison</h4>
            <div className={activeChart === 'all' ? 'h-[240px]' : 'h-[360px]'}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <RechartsRadar cx="50%" cy="50%" outerRadius={activeChart === 'all' ? 70 : 100} data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 9, fontFamily: 'monospace', fill: 'var(--muted-foreground)' }} />
                  <PolarRadiusAxis tick={{ fontSize: 8 }} />
                  {Object.keys(radarData[0] || {}).filter((k) => k !== 'dimension').map((key, i) => (
                    <Radar
                      key={key}
                      name={key}
                      dataKey={key}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                      fillOpacity={0.15}
                      strokeWidth={1.5}
                      animationDuration={animDuration}
                    />
                  ))}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  />
                </RechartsRadar>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tier Bar Chart */}
        {(activeChart === 'all' || activeChart === 'tier') && (
          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-mono text-xs font-semibold text-muted-foreground mb-2">Skills per Tier</h4>
            <div className={activeChart === 'all' ? 'h-[240px]' : 'h-[360px]'}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <ComposedChart data={tierData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontFamily: 'monospace' }} width={80} />
                  <Bar dataKey="count" fill={accentColor} fillOpacity={0.7} radius={[0, 4, 4, 0]} animationDuration={animDuration} />
                  <Line dataKey="avg" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} animationDuration={animDuration} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Invocation Timeline Area Chart */}
        {(activeChart === 'all' || activeChart === 'timeline') && (
          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-mono text-xs font-semibold text-muted-foreground mb-2">Invocation Timeline</h4>
            <div className={activeChart === 'all' ? 'h-[240px]' : 'h-[360px]'}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fontFamily: 'monospace' }} />
                  <YAxis tick={{ fontSize: 9, fontFamily: 'monospace' }} />
                  <Area
                    type="monotone"
                    dataKey="invocations"
                    stroke={accentColor}
                    fill={accentColor}
                    fillOpacity={0.15}
                    strokeWidth={2}
                    animationDuration={animDuration}
                  />
                  <Area
                    type="monotone"
                    dataKey="failures"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.1}
                    strokeWidth={1.5}
                    animationDuration={animDuration}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
