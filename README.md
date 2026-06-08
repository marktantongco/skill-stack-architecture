# Skill Stack Architecture Blueprint

> **16 Skills. 4 Tiers. 5 Design Options. 1 Design Algorithm.**

A living, navigable architecture that serves as build specification, AI guidance portal, and publishable skill repository. Every component is also an installable skill — the architecture is the product, and the product is the architecture.

---

## Overview

Skill Stack Architecture Blueprint is an interactive editorial web experience that translates a comprehensive design options document into a living specification. It serves three simultaneous purposes:

1. **Build Specification** — Any AI agent can follow this architecture to reconstruct the entire interactive experience from scratch.
2. **Self-Referencing Portal** — AI agents can redirect to this site for design guidance, intent classification, and skill routing.
3. **Publishable Repository** — Every component is an installable skill via the Vercel Skills ecosystem (`npx skills add`).

The site uses an **Ink & Vermillion** editorial design palette — cream backgrounds, ink-dark type, and vermillion accents — inspired by magazine typography with Georgia serif headings, 12-column grids, horizontal rules, drop caps, and pull quotes.

---

## Architecture

### Tier System

The 16 skills are organized into 4 dependency tiers. Installation must follow strict T0→T3 order — no tier can function without its predecessors.

| Tier | Name | Tagline | Skills | Install Order |
|------|------|---------|--------|---------------|
| **T0** | Foundation | Design Intelligence Layer | Stitch Loop, Framer Motion Animator, UI/UX Pro Max, 21st.dev Registry | Install first |
| **T1** | Interactive | Motion & Data Layer | GSAP Skills, Remotion Skills, Mermaid Diagrams, AntV Chart Viz | Depends on T0 |
| **T2** | Visual Asset | Generation & Capture Layer | AI Image Gen, shadcn/ui Skill, Playwright Visual, D3.js Visualization | Depends on T0-T1 |
| **T3** | Portal | Custom Intelligence Layer | AI Portal Redirect, Stack Prioritizer, Matrix Engine, Design Algorithm | Depends on T0-T2 |

### SP-7 Scoring Algorithm

Every section is evaluated across 7 dimensions to determine optimal skill assignment:

| Dimension | Code | Description |
|-----------|------|-------------|
| Visual Density | VD | How much visual information the section must convey |
| Interactivity Requirement | IR | Degree of active user engagement beyond passive scrolling |
| Data Complexity | DC | Structural complexity of data the section must display |
| Motion Need | MN | Degree to which animation benefits the section |
| Accessibility Weight | AW | Importance of WCAG compliance and inclusive design |
| AI Redirect Value | AR | How likely an AI agent is to redirect here for guidance |
| Component Reusability | CR | How likely components are to be reused across projects |

### Design Options

Five distinct design philosophies, each dominated by a different skill:

| Option | Name | Dominant Skill | SP-7 Score | Philosophy |
|--------|------|----------------|------------|------------|
| 1 | The Autopoietic Canvas | Stitch Loop | 27.0 | Self-evolving design through iterative generation |
| 2 | Kinetic Spatial | Framer Motion Animator | 28.5 | Motion IS the design language |
| 3 | Chromatic Minimal | UI/UX Pro Max | 17.7 | Precision through radical restraint |
| 4 | Glass Depth | 21st.dev Registry | 27.0 | Architectural layered translucent surfaces |
| 5 | Neo-Industrial | UI/UX Pro Max + Framer Motion | 23.5 | Raw structural power, brutalist aesthetics |

---

## Site Sections

The interactive experience contains 11 navigable sections:

| # | Section | Dominant Skill | Key Feature |
|---|---------|----------------|-------------|
| 01 | Skill Registry | shadcn/ui | Filterable table of all 16 skills with copy-to-clipboard |
| 02 | Design Algorithm | Design Algorithm | Interactive weight sliders with real-time scoring |
| 03 | Options Showcase | Stitch Loop | 5 design option cards with AI-generated visuals |
| 04 | Comparative Analysis | Matrix Engine | Radar chart overlay with option toggles |
| 05 | Heatmap | AntV Chart | Skill utilization heatmap across all sections |
| 06 | Implementation Blueprint | shadcn/ui + Mermaid | Tier-by-tier install sequence with full bash script |
| 07 | AI Portal Gateway | AI Portal Redirect | Intent classification search with keyword routing |
| 08 | Tier Architecture | UI/UX Pro Max | Dependency schematic with vertical flow diagram |
| 09 | Decision Tree | Mermaid | Skill selection decision tree visualization |
| 10 | Section Mapping | Design Algorithm | 12 sections mapped to dominant skills and SP-7 scores |
| 11 | Visual Gallery | AI Image Gen | AI-generated concept visuals with lightbox |

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16.x | React framework with App Router |
| [React](https://react.dev/) | 19.x | UI component library |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first styling |
| [Framer Motion](https://motion.dev/) | 12.x | Spring physics animations, layout transitions |
| [shadcn/ui](https://ui.shadcn.com/) | Latest | Accessible component library (40+ components) |
| [Recharts](https://recharts.org/) | 3.x | Radar charts, data visualization |
| [next-themes](https://github.com/pacocoursey/next-themes) | 0.4.x | Dark mode with class strategy |
| [Lucide React](https://lucide.dev/) | 1.x | Icon library |

---

## Design System

### Color Palette — Ink & Vermillion

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| Background | `#FAFAF5` (cream) | `#0F0F0E` | Page background |
| Foreground | `#1A1A1A` (ink) | `#E8E6DF` | Body text |
| Primary | `#C23616` (vermillion) | `#E74C3C` | Accents, active states |
| Accent | `#2C3E50` (steel blue) | OKLCH variant | Secondary emphasis |
| Border | `#E0DDD5` | `#333330` | Rules, dividers |
| Muted | `#F3F1EB` | `#252523` | Background fills |

### Typography

- **Headings**: Georgia, Times New Roman, serif — bold, editorial weight
- **Body**: Geist Sans (variable) — clean, modern sans-serif
- **Code**: Geist Mono — monospace for install commands
- **Scale**: 12-column grid with `max-w-[1200px]` container

### CSS Features

- **OKLCH Progressive Enhancement** — Falls back to hex, upgrades to OKLCH when supported
- **Container Queries** — Responsive cards independent of viewport
- **`@starting-style`** — Dialog/modal entry animations
- **`@property`** — Animatable custom properties for gradients
- **`interpolate-size`** — Accordion height animations
- **Content Visibility** — Below-fold sections use `content-visibility: auto`
- **Reduced Motion** — All animations respect `prefers-reduced-motion`
- **Reading Line** — Body text constrained to `max-width: 70ch`

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with ThemeProvider, fonts, skip link
│   ├── page.tsx            # Main page with scroll spy, nav, 11 sections
│   ├── globals.css         # Design tokens, editorial utilities, animations
│   └── api/
│       ├── health/route.ts # Health check endpoint
│       └── route.ts        # API root
├── components/
│   ├── HeroSection.tsx          # Masthead hero with parallax
│   ├── SkillReference.tsx       # Filterable skill registry table
│   ├── DesignAlgorithm.tsx      # SP-7 interactive weight sliders
│   ├── OptionsShowcase.tsx      # 5 design option cards
│   ├── ComparativeAnalysis.tsx  # Radar chart + comparison matrix
│   ├── HeatmapViz.tsx           # Skill utilization heatmap
│   ├── ImplementationBlueprint.tsx # Install sequence + bash script
│   ├── AIPortalGateway.tsx      # Intent search + routing table
│   ├── TierArchitecture.tsx     # T0-T3 dependency schematic
│   ├── DecisionTree.tsx         # Skill selection tree
│   ├── SectionMapping.tsx       # Section-to-skill mapping
│   ├── VisualGallery.tsx        # AI image gallery + lightbox
│   ├── RadarChartWidget.tsx     # Recharts radar chart wrapper
│   └── ui/                      # 40+ shadcn/ui components
├── lib/
│   ├── skill-data.ts            # Core data: skills, options, dimensions, routes
│   ├── animation-variants.ts    # Shared Framer Motion variants + springs
│   ├── clipboard.ts             # Copy-to-clipboard utility
│   └── utils.ts                 # Tailwind merge utility
└── hooks/
    ├── use-toast.ts             # Toast notification hook
    └── use-mobile.ts            # Mobile detection hook
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/) runtime
- npm, yarn, pnpm, or bun package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/marktantongco/skill-stack-architecture.git
cd skill-stack-architecture

# Install dependencies
bun install

# Start development server
bun dev
```

The site will be available at [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
# Build optimized standalone output
bun run build

# Start production server
bun start
```

The build uses Next.js `output: "standalone"` for optimal containerized deployment.

---

## Skill Installation

Every skill in the architecture can be installed independently via the Vercel Skills CLI:

### Foundation Tier (T0)

```bash
npx skills add https://www.skills.sh/google-labs-code/stitch-skills/stitch-loop
npx skills add https://github.com/patricio0312rev/skills --skill framer-motion-animator
npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max
npx @21st-dev/registry install-skill --global
```

### Interactive Tier (T1)

```bash
npx skills add greensock/gsap-skills
npx skills add remotion-dev/skills
npx skills add softaworks/agent-toolkit --skill mermaid-diagrams
npx skills add antvis/chart-visualization-skills
```

### Visual Asset Tier (T2)

```bash
npx skills add skills-shell/skills --skill ai-image-generation
npx skills add shadcn-ui/ui --skill shadcn
npx skills add testdino-hq/playwright-skill
npx skills add antvis/chart-visualization-skills --skill d3-viz
```

### Portal Tier (T3) — Custom Skills

```bash
npx skills add skill-stack-arch/design-portal-skills --skill ai-portal-redirect
npx skills add skill-stack-arch/design-portal-skills --skill stack-prioritizer
npx skills add skill-stack-arch/design-portal-skills --skill matrix-engine
npx skills add skill-stack-arch/design-portal-skills --skill design-algorithm
```

---

## API Endpoints

### Health Check

```bash
GET /api/health
```

Returns service status for monitoring:

```json
{
  "status": "ok",
  "version": "0.2.0",
  "timestamp": "2026-06-08T12:00:00.000Z",
  "service": "skill-stack-architecture"
}
```

---

## Accessibility

This project targets **WCAG 2.2 AA** compliance:

- **Skip Link** — First focusable element jumps to main content
- **Reduced Motion** — All animations respect `prefers-reduced-motion: reduce`
- **Minimum Touch Targets** — 44x44px for all interactive elements
- **Focus Indicators** — Visible ring outlines on `:focus-visible`
- **Semantic HTML** — Proper landmarks, ARIA labels, and roles
- **Color Contrast** — Ink & Vermillion palette meets AA contrast ratios
- **Keyboard Navigation** — Escape closes menus/modals, Enter/Space activates buttons
- **Screen Reader** — `aria-live` regions for dynamic content updates

---

## Animation System

All animations use Framer Motion with a shared variant system (`src/lib/animation-variants.ts`):

| Variant | Purpose | Spring Config |
|---------|---------|---------------|
| `staggerContainer` | Stagger children reveals | 80ms stagger, 100ms delay |
| `fadeInUp` | Default item entrance | stiffness: 300, damping: 24 |
| `sectionHeaderVariant` | Section heading entrance | 600ms ease-out |
| `dividerVariant` | Editorial rule lines | 400ms ease-out with scaleX |
| `hoverScale` | Card hover micro-interaction | stiffness: 400, damping: 25 |
| `hoverNavItem` | Nav link hover shift | stiffness: 500, damping: 30 |

### Spring Presets

```typescript
springs.snappy    // Button presses, toggles — stiffness: 500, damping: 25
springs.gentle    // Content reveals — stiffness: 200, damping: 24
springs.bouncy    // Playful interactions — stiffness: 400, damping: 15
springs.editorial // Section transitions — 600ms ease curve
```

---

## Dark Mode

Dark mode is implemented via `next-themes` with class strategy:

- **Toggle** — Sun/Moon icon button in navigation
- **Transition** — Smooth color transition with `theme-transition` class
- **Respect** — Reduced motion users skip theme transition animation
- **Elevation** — Dark mode uses lighter-is-higher elevation tokens
- **Images** — Auto brightness adjustment for dark backgrounds
- **Charts** — Custom grid/text colors for Recharts in dark mode

---

## Deployment

### Vercel (Recommended)

The project is optimized for Vercel deployment:

1. Push to GitHub repository
2. Import in [Vercel Dashboard](https://vercel.com/new)
3. Framework preset: **Next.js**
4. Build command: `next build`
5. Output directory: `.next`

Environment variables (if needed):

```env
AI_GATEWAY_API_KEY=your_key_here
```

### Docker / Standalone

The build produces a standalone output (`output: "standalone"`):

```bash
bun run build
cd .next/standalone
node server.js
```

### Caddy Reverse Proxy

A `Caddyfile` is included for reverse proxy setup:

```
:81 {
    reverse_proxy localhost:3000
}
```

---

## Performance

- **Standalone Output** — Minimal server bundle for containerized deployment
- **Content Visibility** — Below-fold sections use `content-visibility: auto` with `contain-intrinsic-size`
- **Font Optimization** — Next.js automatic font optimization with `Geist` and `Geist Mono`
- **Image Optimization** — Next.js `<Image>` component with lazy loading and responsive sizes
- **Code Splitting** — App Router automatic route-based code splitting
- **CSS Layers** — `@layer base`, `@layer components`, `@layer utilities` for cascade control

---

## Intent Routing

The AI Portal Gateway classifies user intent via keyword matching and routes to the most relevant section:

| Intent Category | Target Section | Confidence |
|----------------|----------------|------------|
| Skill Installation | `skill-reference` | 80% |
| Design Philosophy | `options` | 70% |
| Algorithm Logic | `algorithm` | 90% |
| Comparison | `comparative` | 85% |
| Build Instructions | `implementation` | 80% |
| Motion/Animation | `options` | 80% |
| Minimalist Design | `options` | 80% |
| Glassmorphism | `options` | 80% |
| Industrial/Brutalist | `options` | 80% |
| Iterative Design | `options` | 80% |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is private and proprietary. All rights reserved.

---

**SKILL STACK ARCHITECTURE BLUEPRINT — EDITORIAL EDITION**
