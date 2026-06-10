---
name: design-algorithm
version: 0.2.0
description: "The complete design decision algorithm: 3-question decision tree, SP-7 scoring, and skill-to-section mapping. Guides users to their optimal design option through interactive questioning."
author: skill-stack-arch
tier: 3
tags: [algorithm, decision-tree, design, scoring, mapping]
install: "npx skills add skill-stack-arch/design-portal-skills --skill design-algorithm"
dependencies:
  - ui-ux-pro-max
  - framer-motion-animator
  - stack-prioritizer
---

# Design Algorithm

## Purpose
The complete design decision engine combining three interactive components:

1. **Decision Tree** — 3-question guided questionnaire that maps user preferences to one of 5 design options
2. **SP-7 Scoring Engine** — 7-dimension weight-based algorithm for stack prioritization
3. **Section-to-Skill Mapping** — 12 sections mapped to dominant skills with SP-7 scores

## Decision Tree Logic
```
Start → What is your primary design priority?
  ├─ Motion & Animation → How should motion express hierarchy?
  │   ├─ Choreographed multi-tier → Kinetic Spatial (opt2)
  │   └─ Organic, spring-based → The Autopoietic Canvas (opt1)
  ├─ Restraint & Precision → What level of animation?
  │   ├─ Max 3 types per page → Chromatic Minimal (opt3)
  │   └─ Mechanical, step-based → Neo-Industrial (opt5)
  ├─ Spatial Depth → How should depth express on mobile?
  │   ├─ Reduced 2-3 layers with parallax → Glass Depth (opt4)
  │   └─ Snap-lock with visible grids → Neo-Industrial (opt5)
  ├─ Raw Power → What visual language conveys authority?
  │   ├─ Monospace + safety-color accents → Neo-Industrial (opt5)
  │   └─ Depth-driven premium surfaces → Glass Depth (opt4)
  └─ Self-Evolution → How should the system evolve?
      ├─ Autonomous iterative loops → The Autopoietic Canvas (opt1)
      └─ Choreographed animation sequences → Kinetic Spatial (opt2)
```

## Section-to-Skill Mapping
| Section | Dominant Skill | SP-7 Score |
|---------|---------------|------------|
| Hero / Masthead | Stitch Loop | 24.5 |
| Executive Summary | UI/UX Pro Max | 17.7 |
| Skill Registry | shadcn/ui | 18.0 |
| SP-7 Algorithm | Design Algorithm | 22.5 |
| Design Options 1-5 | Various | 17.7-28.5 |
| Comparative Analysis | Matrix Engine | 24.5 |
| Implementation Blueprint | shadcn + Mermaid | 18.5 |
| AI Portal Gateway | AI Portal Redirect | 21.0 |

## Component References
- **Decision Tree:** `src/components/DecisionTree.tsx` (Section 09)
- **SP-7 Algorithm:** `src/components/DesignAlgorithm.tsx` (Section 02)
- **Section Mapping:** `src/components/SectionMapping.tsx` (Section 10)
- **Data:** `src/lib/skill-data.ts`

## Interactive Features
- Decision tree with breadcrumb path tracking
- Back navigation to previous questions
- Reset to start over
- Expandable section mapping cards with SP-7 breakdown
- Keyboard navigation support (Enter/Space for choices, Escape for modals)
