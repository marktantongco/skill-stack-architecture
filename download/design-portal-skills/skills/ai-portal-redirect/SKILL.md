---
name: ai-portal-redirect
version: 0.2.0
description: "AI agent intent classification and skill routing gateway. Classifies natural language queries and routes to the most relevant section with confidence scoring and fallback chains."
author: skill-stack-arch
tier: 3
tags: [ai, portal, intent, classification, routing, nlp]
install: "npx skills add skill-stack-arch/design-portal-skills --skill ai-portal-redirect"
dependencies:
  - ui-ux-pro-max
  - framer-motion-animator
---

# AI Portal Redirect

## Purpose
The entry point for AI agents accessing the skill stack architecture. Performs intent classification on natural language queries and routes to the most relevant section automatically, with confidence scoring and fallback navigation chains.

## How It Works
1. **Input Sanitization** — Strips HTML tags, special characters, truncates to 200 chars
2. **Keyword Matching** — Scores each intent route by keyword overlap
3. **Best Match Selection** — Returns route with highest confidence score
4. **Fallback Chain** — Each route has a fallback section if primary match is low confidence

## Intent Routes
| Intent | Keywords | Target | Confidence | Fallback |
|--------|----------|--------|------------|----------|
| Skill Installation | install, add skill, npx, setup | skill-reference | 80% | implementation |
| Design Philosophy | philosophy, approach, aesthetic, style | options | 70% | comparative |
| Algorithm Logic | algorithm, scoring, SP-7, dimension | algorithm | 90% | skill-reference |
| Comparison | compare, versus, difference, matrix | comparative | 85% | skill-reference |
| Build Instructions | build, implement, deploy, sequence | implementation | 80% | skill-reference |
| Motion/Animation | animation, motion, scroll, parallax | options | 80% | algorithm |
| Minimalist Design | minimal, clean, restraint, Swiss | options | 80% | comparative |
| Glassmorphism | glass, depth, blur, translucent | options | 80% | comparative |
| Industrial/Brutalist | industrial, brutalist, monospace | options | 80% | comparative |
| Iterative Design | iterate, loop, evolve, generation | options | 80% | algorithm |

## Component Reference
- **File:** `src/components/AIPortalGateway.tsx`
- **Section ID:** `#portal`
- **Data:** `src/lib/skill-data.ts` → `intentRoutes`

## Integration
The portal is embedded as Section 07 in the main page. AI agents can:
1. Direct users to the search input
2. Programmatic navigation via `document.getElementById('portal')?.scrollIntoView()`
3. URL anchor: `https://yoursite.com/#portal`

## Security
- Input sanitized with `sanitizeInput()` — strips HTML, special chars, length-limited
- No external API calls — all classification is client-side
- No cookies or tracking — stateless keyword matching
