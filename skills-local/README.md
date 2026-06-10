# OpenCode Accomplishments — Skills Ecosystem

> **Kinetic Autopoiesis Design System** — A self-generating, self-maintaining AI agent skill ecosystem.

---

## Overview

This directory contains **48 AI agent skills** across **10 categories**, forming the complete skill ecosystem of the OpenCode Accomplishments platform. Each skill provides specialized instructions and workflows for AI agents.

### Quick Stats

| Metric | Value |
|--------|-------|
| Total Skills | 48 |
| Categories | 10 |
| Agent Modes | 7 |
| Pre-built MCP Stacks | 8 |
| Design Philosophy | Kinetic Autopoiesis |
| Framework | Next.js 16.1.3 |

---

## Skill Categories

### Design & UI (5 skills)
Skills for visual design, UI generation, and animation:
- `ui-ux-pro-max-v7` — AI-powered design intelligence (60 styles, 48 palettes)
- `anthropic-frontend-design` — Bold aesthetic principles for AI-native interfaces
- `gsap-animations` — Production-grade GSAP animation patterns
- `frontend-design` — shadcn/ui + Tailwind + React component generation
- `vercel-web-design-guidelines` — Accessibility-first UX rules and performance budgets

### Reasoning (4 skills)
Skills for structured thinking and analysis:
- `chain-of-thought` — Step-by-step reasoning framework
- `socratic-method` — Strategic questioning to uncover assumptions
- `devils-advocate` — Argue against premises to strengthen arguments
- `simulation-sandbox` — Test scenarios in safe simulated environments

### Development (7 skills)
Skills for building, deploying, and automating:
- `mcp-builder` — Build MCP servers with TypeScript + Python
- `superpowers` — Spec-first development with TDD and sub-agent delegation
- `deployment-manager` — Deploy across GitHub Pages, Vercel, Netlify
- `browser-use` — Headful browser automation
- `web-artifacts-builder` — Single-file HTML artifacts
- `vercel-react-best-practices` — Production-grade React architecture
- `explained-code` — Beginner-friendly code explanation

### Content (4 skills)
Skills for content creation and social media:
- `seo-content-writer` — SEO-optimized content with GEO optimization
- `humanizer` — Anti-AI-detection rewriting
- `social-media-manager` — Multi-platform post generation
- `social-content-pillars` — Monthly content calendars

### Strategy (4 skills)
Skills for product research and strategy:
- `jtbd-research` — Jobs to be Done research methodology
- `gumroad-pipeline` — Lead magnet to product launch workflow
- `feature-research` — Research before implementing features
- `skill-finder` — Skill discovery and evaluation

### System (6 skills)
Skills for system configuration and agent management:
- `persistent-memory` — Structured memory system for agent continuity
- `system-prompt-sync` — Auto-sync AGENTS.md across repos
- `feedback-loop` — Iterative improvement cycles
- `context-compressor` — Compress long contexts preserving key info
- `agent-roles` — Multi-agent role system
- `sample-hello-skill` — Hello-world demo for testing

### Data & Web (5 skills)
Skills for web research and data analysis:
- `web-reader` — Web page extraction and crawling
- `audit-analyzer` — Performance and accessibility audits
- `web-design-guidelines` — Design consistency audit checklist
- `code-research` — Open-source repository research
- `explore` — Codebase exploration with AI

### Creative (2 skills)
- `photography-ai` — Professional visual engineering framework
- `output-formatter` — Strict formatting for all output types

### MCP Servers (4 skills)
MCP protocol server skills:
- `pictoflux-ai` — Free unlimited AI image generation
- `mcp-stack-curator` — Intelligent MCP server stack builder
- `mcp-registry` — Curated directory of 78 free MCP servers
- `mcp-security-scanner` — Security-first MCP installation vetting

### Agent Modes (7 skills)
Cognitive thinking frameworks:
- `rabbit-multiply-ideas`, `owl-deep-analysis`, `ant-break-into-steps`
- `eagle-big-picture`, `dolphin-creative-solutions`, `beaver-build-systems`, `elephant-cross-field`

---

## 7 Agent Modes — Cognitive Framework

| Mode | Emoji | Thinking Style | Best For |
|------|-------|----------------|----------|
| Rabbit | 🐇 | Multiply Ideas | Brainstorming variations |
| Owl | 🦉 | Deep Analysis | Multi-perspective analysis |
| Ant | 🐜 | Break Into Steps | Decomposing complex goals |
| Eagle | 🦅 | Big Picture Strategy | Long-term thinking |
| Dolphin | 🐬 | Creative Solutions | Breaking patterns |
| Beaver | 🦫 | Build Systems | Practical process design |
| Elephant | 🐘 | Cross-Field Connections | Interdisciplinary insights |

---

## Architecture

The site is built with a **Kinetic Autopoiesis** design philosophy — a 4-layer spatial depth model with glassmorphic UI:

- **Layer 1 (Atmosphere)** — Ambient particles, gradients
- **Layer 2 (Foundation)** — Glass panels, navigation, cards
- **Layer 3 (Interactive)** — Buttons, inputs, hover states
- **Layer 4 (Overlay)** — Command palette, modals, tooltips

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16.1.3 (Turbopack) |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion v12 |
| State | Zustand (persist middleware) |
| UI Components | shadcn/ui (base-nova) |
| Icons | Lucide React |
| Deployment | GitHub Pages + Vercel |

### Design Tokens

- **5 Zone Colors**: Cyan (#08F7FE), Lime (#BFFF00), Magenta (#FF2E63), Violet (#C77DFF), Orange (#FF6B35)
- **Typography**: Plus Jakarta Sans (body), Outfit (display), JetBrains Mono (code)
- **Glassmorphism**: 3 levels of glass with backdrop-filter blur
- **Dark Theme**: Deep space black-blue (#0A0A0F) backdrop

---

## Development

### Prerequisites

- Node.js 22+
- npm 10+

### Setup

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Static export (GitHub Pages)
GITHUB_ACTIONS=true npx next build
```

### Build Output

```
Route (app)
├ ○ /
├ ○ /accomplishments
├ ○ /agent-modes
├ ○ /prompt-engineering
└ ○ /skill-ecosystem
```

---

## Deployment

### GitHub Pages
Push to `main` branch. GitHub Actions builds and deploys automatically.

### Vercel
```bash
npx vercel --prod
```

---

## License

MIT

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v7.0.0 | 2026-06-09 | Complete redesign: Next.js 16, Tailwind CSS 4, Framer Motion, glassmorphic design system, command palette, 5-zone architecture |
| v6.0.0 | 2026-05-26 | Interactive accomplishments page, data-driven skills, GSAP animations |
| v5.0.0 | 2026-05-19 | Added 7 Agent Modes, 41 to 48 skills |
| v4.0.0 | 2026-05-19 | Added MCP Servers, stacks.json, mcp-registry.json |
| v3.0.0 | 2026-05-06 | Neo-brutalist redesign, Web Components, JSON-LD |

---

*Built with Kinetic Autopoiesis — 48 skills, 7 agent modes, 8 MCP stacks*
