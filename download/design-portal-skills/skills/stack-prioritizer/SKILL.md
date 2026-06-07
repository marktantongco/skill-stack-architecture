---
name: stack-prioritizer
version: 0.2.0
description: "7-dimension scoring algorithm (SP-7) that evaluates skill stacks against weight profiles. Interactive weight sliders with real-time recalculation and prioritized result rendering."
author: skill-stack-arch
tier: 3
tags: [algorithm, scoring, prioritization, sp7, dimensions, weights]
install: "npx skills add skill-stack-arch/design-portal-skills --skill stack-prioritizer"
dependencies:
  - ui-ux-pro-max
  - framer-motion-animator
---

# Stack Prioritizer

## Purpose
Implements the SP-7 (7-dimension) scoring algorithm that evaluates skill stacks against customizable weight profiles. Each design option receives a weighted score across Visual Density, Interactivity, Data Complexity, Motion Need, Accessibility, AI Redirect Value, and Component Reusability.

## SP-7 Dimensions
| ID | Name | Description |
|----|------|-------------|
| VD | Visual Density | How much visual information the section must convey |
| IR | Interactivity Requirement | Degree of active user engagement beyond passive scrolling |
| DC | Data Complexity | Structural complexity of data the section must display |
| MN | Motion Need | Degree to which animation benefits the section |
| AW | Accessibility Weight | Importance of WCAG compliance and inclusive design |
| AR | AI Redirect Value | How likely an AI agent is to redirect here for guidance |
| CR | Component Reusability | How likely components are to be reused across projects |

## Weight Profiles
4 preset profiles with customizable overrides:
- **Visual** (VD=25%, IR=20%, MN=20% weighted high)
- **Reference** (DC=20%, AR=30% weighted high)
- **Comparison** (IR=25%, DC=25% weighted high)
- **Portal** (AW=20%, AR=30% weighted high)

## Scoring Formula
```
score = Σ(vector[i] × weights[i]) for i in 0..6
```

Options are sorted by descending score. The highest-scoring option is the recommended stack for that weight profile.

## Component Reference
- **File:** `src/components/DesignAlgorithm.tsx`
- **Section ID:** `#algorithm`
- **Data:** `src/lib/skill-data.ts` → `dimensions`, `weightProfiles`, `options`

## Interactive Features
- Range sliders for each dimension (0-50%, step 5%)
- Real-time score recalculation on weight change
- Expandable result cards with SP-7 vector breakdown
- Animated score bars with progressive reveal
