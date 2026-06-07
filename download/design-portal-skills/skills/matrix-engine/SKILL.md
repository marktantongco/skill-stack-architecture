---
name: matrix-engine
version: 0.2.0
description: "Comparative matrix rendering engine with radar chart overlay, interactive option toggles, and switchable table/chart views. Powers the Comparative Analysis section."
author: skill-stack-arch
tier: 3
tags: [matrix, comparison, radar, chart, visualization, recharts]
install: "npx skills add skill-stack-arch/design-portal-skills --skill matrix-engine"
dependencies:
  - ui-ux-pro-max
  - framer-motion-animator
  - antv-chart-viz
---

# Matrix Engine

## Purpose
Renders the comparative analysis section with dual views: an interactive radar chart overlay and a detailed matrix comparison table. Users can toggle individual options on/off to isolate and compare design philosophies.

## Views

### Radar Chart View
- 7-axis radar plot (VD, IR, DC, MN, AW, AR, CR)
- Up to 5 overlaid option profiles with distinct colors
- Legend with option names
- Dynamic import with `ssr: false` to avoid Recharts SSR warning

### Matrix Table View
- 8-row comparison across all 5 options
- Dimensions: Core Principle, Dominant Skill, Motion Style, Color Strategy, Typography, Mobile Approach, Complexity, Emotional Tone
- Sticky left column for dimension labels
- Color-coded option headers

## Color Mapping
| Option | Color |
|--------|-------|
| Autopoietic Canvas | #C23616 (Vermillion) |
| Kinetic Spatial | #2C3E50 (Dark Blue) |
| Chromatic Minimal | #6B6B6B (Muted) |
| Glass Depth | #5B7B6F (Sage) |
| Neo-Industrial | #8B7355 (Warm Brown) |

## Component Reference
- **File:** `src/components/ComparativeAnalysis.tsx` (main)
- **Widget:** `src/components/RadarChartWidget.tsx` (Recharts radar)
- **Section ID:** `#comparative`
- **Data:** `src/lib/skill-data.ts` → `comparisonMatrix`, `options`

## Interactive Features
- Toggle buttons to show/hide each option in radar
- View mode switch (Radar Chart / Matrix Table)
- Responsive design with horizontal scroll on mobile
