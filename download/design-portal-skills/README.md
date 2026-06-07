# Design Portal Skills

> 16 Skills · 4 Tiers · 5 Options · SP-7 Algorithm · Editorial Design System

A living, navigable architecture that serves as build specification, AI guidance portal, and publishable skill repository. Every component is also an installable skill via `npx skills add`.

## Quick Start

### Install All 16 Skills
```bash
npx skills add skill-stack-arch/design-portal-skills --skill design-portal-skills
```

### Install Individual Skills
```bash
# Tier 3 — Custom Portal Skills
npx skills add skill-stack-arch/design-portal-skills --skill ai-portal-redirect
npx skills add skill-stack-arch/design-portal-skills --skill stack-prioritizer
npx skills add skill-stack-arch/design-portal-skills --skill matrix-engine
npx skills add skill-stack-arch/design-portal-skills --skill design-algorithm
```

## Architecture

### 4-Tier Skill Stack

```
┌─────────────────────────────────────────┐
│  T3 — Portal (Custom Intelligence)      │
│  AI Portal · Prioritizer · Matrix · Algo│
├─────────────────────────────────────────┤
│  T2 — Visual Asset (Generation)          │
│  AI Image · shadcn · Playwright · D3.js  │
├─────────────────────────────────────────┤
│  T1 — Interactive (Motion & Data)        │
│  GSAP · Remotion · Mermaid · AntV        │
├─────────────────────────────────────────┤
│  T0 — Foundation (Design Intelligence)   │
│  Stitch Loop · Framer Motion · UX Max    │
│  21st.dev Registry                       │
└─────────────────────────────────────────┘
```

### SP-7 Scoring Algorithm
7 dimensions that evaluate each section:
- **VD** — Visual Density
- **IR** — Interactivity Requirement
- **DC** — Data Complexity
- **MN** — Motion Need
- **AW** — Accessibility Weight
- **AR** — AI Redirect Value
- **CR** — Component Reusability

### 5 Design Options
1. **The Autopoietic Canvas** — Self-evolving design (Stitch Loop dominant)
2. **Kinetic Spatial** — Motion-first language (Framer Motion dominant)
3. **Chromatic Minimal** — Precision through restraint (UI/UX Pro Max dominant)
4. **Glass Depth** — Architectural layered surfaces (21st.dev dominant)
5. **Neo-Industrial** — Raw structural power (UI/UX Pro Max + FM)

## Design System — Ink & Vermillion

| Token | Light | Dark |
|-------|-------|------|
| Background | `#FAFAF5` Cream | `#0F0F0E` |
| Foreground | `#1A1A1A` Ink | `#E8E6DF` |
| Primary | `#C23616` Vermillion | `#E74C3C` |

## Tech Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Framer Motion 12
- Recharts 3
- next-themes (light/dark)

## Security Audit
All 6 findings resolved:
- ✅ 2-hop latency — No redirect chains
- ✅ Silent billing bypass — No billing routes
- ✅ Dual OAuth — `next-auth` removed
- ✅ Config path divergence — Dead Tailwind v3 config deleted
- ✅ kiro-cli unversioned — No references found
- ✅ Missing health check — `/api/health` endpoint created

## Structure
```
skills/
├── ai-portal-redirect/SKILL.md   # S13 — Intent classification gateway
├── stack-prioritizer/SKILL.md    # S14 — SP-7 scoring algorithm
├── matrix-engine/SKILL.md        # S15 — Comparative matrix engine
└── design-algorithm/SKILL.md     # S16 — Decision tree + mapping
SKILL.md                          # Master skill definition
package.json                      # NPM/skills registry metadata
```

## License
MIT
