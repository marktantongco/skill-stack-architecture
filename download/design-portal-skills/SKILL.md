---
name: design-portal-skills
version: 0.2.0
description: "16-skill, 4-tier, 5-option interactive web architecture with SP-7 scoring algorithm, AI portal gateway, and editorial design system. Every component is also an installable skill."
author: skill-stack-arch
tier: 3
tags: [architecture, design-system, editorial, animation, sp7, skill-stack, ai-portal, framer-motion]
install: "npx skills add skill-stack-arch/design-portal-skills --skill design-portal-skills"
dependencies:
  - ui-ux-pro-max
  - framer-motion-animator
  - stitch-loop
  - 21st-dev-registry
---

# Design Portal Skills — Skill Stack Architecture Blueprint

## Overview

A living, navigable architecture that serves as build specification, AI guidance portal, and publishable skill repository. This skill implements the complete "Ink & Vermillion" editorial design system with 16 skills across 4 tiers, 5 design options, and a 7-dimension scoring algorithm (SP-7).

**Core Metrics:** 16 Skills · 4 Tiers · 5 Options · SP-7 Dimensions · 11 Sections

## Architecture

### Tier 0 — Foundation (4 Skills)
| ID | Skill | Role |
|----|-------|------|
| S01 | Stitch Loop | Autonomous iterative website generation with baton-passing loop |
| S02 | Framer Motion Animator | Production-ready React animations, micro-interactions, spring physics |
| S03 | UI/UX Pro Max | 344+ design resources, style governance, accessibility, creative briefs |
| S04 | 21st.dev Registry | Community React component registry with shadcn CLI |

### Tier 1 — Interactive (4 Skills)
| ID | Skill | Role |
|----|-------|------|
| S05 | GSAP Skills | ScrollTrigger animations, timeline sequencing, pinning, parallax |
| S06 | Remotion Skills | Programmatic infographic-motion video generation |
| S07 | Mermaid Diagrams | Text-based schematic diagram rendering |
| S08 | AntV Chart Viz | 26+ interactive chart types, radar, heatmap, treemap |

### Tier 2 — Visual Asset (4 Skills)
| ID | Skill | Role |
|----|-------|------|
| S09 | AI Image Gen | 50+ AI models for hero images, mockups, visual assets |
| S10 | shadcn/ui Skill | Interactive table, data table, component scaffolding |
| S11 | Playwright Visual | Screenshot capture, visual regression, cross-browser testing |
| S12 | D3.js Visualization | Custom interactive visualizations, force graphs, heatmaps |

### Tier 3 — Portal (4 Skills — Custom)
| ID | Skill | Role |
|----|-------|------|
| S13 | AI Portal Redirect | AI agent intent classification, skill routing, guided navigation |
| S14 | Stack Prioritizer | 7-dimension scoring algorithm, dependency resolver |
| S15 | Matrix Engine | Comparative matrix rendering, interactive filters, radar viz |
| S16 | Design Algorithm | Stack prioritization computation, result visualization, decision tree |

## SP-7 Scoring Algorithm

7 dimensions that evaluate each section's requirements:

| ID | Dimension | Description |
|----|-----------|-------------|
| VD | Visual Density | How much visual information the section must convey |
| IR | Interactivity Requirement | Degree of active user engagement beyond passive scrolling |
| DC | Data Complexity | Structural complexity of data the section must display |
| MN | Motion Need | Degree to which animation benefits the section |
| AW | Accessibility Weight | Importance of WCAG compliance and inclusive design |
| AR | AI Redirect Value | How likely an AI agent is to redirect here for guidance |
| CR | Component Reusability | How likely components are to be reused across projects |

### Weight Profiles
- **Visual:** VD=25%, IR=20%, DC=15%, MN=20%, AW=5%, AR=5%, CR=10%
- **Reference:** VD=10%, IR=10%, DC=20%, MN=5%, AW=15%, AR=30%, CR=10%
- **Comparison:** VD=15%, IR=25%, DC=25%, MN=10%, AW=5%, AR=10%, CR=10%
- **Portal:** VD=10%, IR=15%, DC=10%, MN=5%, AW=20%, AR=30%, CR=10%

## 5 Design Options

| # | Name | Dominant Skill | Philosophy |
|---|------|---------------|------------|
| 1 | The Autopoietic Canvas | Stitch Loop (40%) | Self-evolving design through iterative generation cycles |
| 2 | Kinetic Spatial | Framer Motion (40%) | Motion IS the design language — choreographed interaction |
| 3 | Chromatic Minimal | UI/UX Pro Max (40%) | Precision through restraint — radical minimalism |
| 4 | Glass Depth | 21st.dev Registry (35%) | Architectural layered translucent surfaces |
| 5 | Neo-Industrial | UI/UX Pro Max + FM | Raw structural power — brutalist confidence |

## Design System — Ink & Vermillion Editorial

### Color Palette
| Token | Light | Dark |
|-------|-------|------|
| Background | #FAFAF5 (Cream) | #0F0F0E |
| Foreground | #1A1A1A (Ink) | #E8E6DF |
| Primary | #C23616 (Vermillion) | #E74C3C |
| Accent | #2C3E50 | oklch(0.7 0.12 230) |
| Border | #E0DDD5 | #333330 |
| Muted | #F3F1EB | #252523 |

### Typography
- **Headings:** Georgia, 'Times New Roman', serif
- **Body:** Geist Sans (variable), system sans-serif
- **Code:** Geist Mono, monospace
- **Scale:** Editorial 12-column grid with `max-width: 1200px`

### Animation System
- **Spring Presets:** Snappy (500/25), Gentle (200/24), Bouncy (400/15), Editorial (0.6s cubic-bezier)
- **Reduced Motion:** Full `useReducedMotion()` support across all 13 components
- **Micro-interactions:** Spring-based hover/tap on all interactive elements
- **Scroll-linked:** Progress bar with `useSpring`, hero parallax with `useTransform`
- **Layout Transitions:** `layoutId` for active nav indicator, `AnimatePresence` for modals

### CSS Features (2026 Modern)
- OKLCH progressive enhancement with fallback
- Container queries for card components
- `content-visibility: auto` for below-fold sections
- `@starting-style` for dialog/modal animations
- `interpolate-size: allow-keywords` for accordion expand
- `@property` for animatable custom properties
- `@scope` for component isolation
- `text-wrap: balance/pretty` for modern typography

## 11 Interactive Sections

| # | Section | Component | Dominant Skill |
|---|---------|-----------|---------------|
| 01 | Master Skill Registry | `SkillReference.tsx` | shadcn/ui |
| 02 | SP-7 Design Algorithm | `DesignAlgorithm.tsx` | Design Algorithm |
| 03 | Five Design Options | `OptionsShowcase.tsx` | Stitch Loop |
| 04 | Comparative Analysis | `ComparativeAnalysis.tsx` | Matrix Engine |
| 05 | Skill Utilization Heatmap | `HeatmapViz.tsx` | AntV Chart |
| 06 | Implementation Blueprint | `ImplementationBlueprint.tsx` | shadcn + Mermaid |
| 07 | AI Portal Gateway | `AIPortalGateway.tsx` | AI Portal Redirect |
| 08 | Tier Architecture | `TierArchitecture.tsx` | UI/UX Pro Max |
| 09 | Decision Tree | `DecisionTree.tsx` | Design Algorithm |
| 10 | Section-to-Skill Mapping | `SectionMapping.tsx` | Stack Prioritizer |
| 11 | Visual Asset Gallery | `VisualGallery.tsx` | AI Image Gen |

## Security Audit — 6 Findings Resolution

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | 2-hop latency | HIGH | Not present — no redirect chains |
| 2 | Silent billing bypass | HIGH | Not applicable — no billing/proxy routes |
| 3 | Dual OAuth | MEDIUM | Fixed — `next-auth` removed from dependencies |
| 4 | Config path divergence | MEDIUM | Fixed — `tailwind.config.ts` deleted (v3 dead config) |
| 5 | kiro-cli unversioned | MEDIUM | Not present — no references found |
| 6 | Missing health check | LOW | Fixed — `/api/health` endpoint with Cache-Control |

## Installation

### Install All 16 Skills
```bash
#!/bin/bash
# design-portal-skills installer — Complete 16-skill stack

echo "=== Tier 0: Foundation Layer ==="
npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max
npx @21st-dev/registry install-skill --global
npx skills add https://www.skills.sh/google-labs-code/stitch-skills/stitch-loop
npx skills add https://github.com/patricio0312rev/skills --skill framer-motion-animator

echo "=== Tier 1: Interactive Layer ==="
npx skills add greensock/gsap-skills
npx skills add remotion-dev/skills
npx skills add softaworks/agent-toolkit --skill mermaid-diagrams
npx skills add antvis/chart-visualization-skills

echo "=== Tier 2: Visual Asset Layer ==="
npx skills add skills-shell/skills --skill ai-image-generation
npx skills add shadcn-ui/ui --skill shadcn
npx skills add testdino-hq/playwright-skill
npx skills add antvis/chart-visualization-skills --skill d3-viz

echo "=== Tier 3: Portal Layer (Custom) ==="
ORG_URL=https://github.com/skill-stack-arch/design-portal-skills
npx skills add $ORG_URL --skill ai-portal-redirect
npx skills add $ORG_URL --skill stack-prioritizer
npx skills add $ORG_URL --skill matrix-engine
npx skills add $ORG_URL --skill design-algorithm

echo "=== All 16 skills installed ==="
```

### Install This Skill Only
```bash
npx skills add skill-stack-arch/design-portal-skills --skill design-portal-skills
```

## Tech Stack
- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Animation:** Framer Motion 12
- **Charts:** Recharts 3 (dynamic import, ssr: false)
- **Theme:** next-themes (light/dark with smooth transitions)
- **Accessibility:** WCAG 2.2, `useReducedMotion()`, skip links, focus management

## File Structure
```
src/
├── app/
│   ├── page.tsx           # Main page with nav, sections, footer
│   ├── layout.tsx         # Root layout, fonts, metadata, ThemeProvider
│   ├── globals.css        # Design tokens, editorial CSS, dark mode
│   └── api/
│       ├── health/route.ts  # Health check endpoint
│       └── route.ts         # API root
├── components/
│   ├── HeroSection.tsx      # 01 — Hero masthead with parallax
│   ├── SkillReference.tsx   # 01 — Master skill registry
│   ├── DesignAlgorithm.tsx  # 02 — SP-7 scoring engine
│   ├── OptionsShowcase.tsx  # 03 — Five design options
│   ├── ComparativeAnalysis.tsx # 04 — Radar chart + matrix
│   ├── HeatmapViz.tsx       # 05 — Skill utilization heatmap
│   ├── ImplementationBlueprint.tsx # 06 — Install sequence
│   ├── AIPortalGateway.tsx  # 07 — Intent classification
│   ├── TierArchitecture.tsx # 08 — 4-tier architecture
│   ├── DecisionTree.tsx     # 09 — 3-question decision tree
│   ├── SectionMapping.tsx   # 10 — Section-to-skill mapping
│   ├── VisualGallery.tsx    # 11 — AI-generated concept gallery
│   ├── RadarChartWidget.tsx # Recharts radar (dynamic import)
│   └── ui/                  # shadcn/ui components
└── lib/
    ├── animation-variants.ts # Shared motion variants + springs
    ├── clipboard.ts          # Shared clipboard utility
    ├── skill-data.ts         # All data: skills, options, SP-7, routes
    └── utils.ts              # cn() utility
```
