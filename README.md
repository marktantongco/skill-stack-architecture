# Skill Stack Architecture Blueprint

> **45 Skills · 4 Tiers · 5 Design Options · 1 SP-7 Design Algorithm · 6 Proxy Types**

A living, navigable architecture that serves as build specification, AI guidance portal, and publishable skill repository. Every component is also an installable skill — **the architecture is the product, and the product is the architecture.**

[![Deployed on Vercel](https://img.shields.io/badge/Vercel-Live-bright.svg?logo=vercel)](https://skill-stack-architecture.vercel.app)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Mirror-blue.svg?logo=github)](https://marktantongco.github.io/skill-stack-architecture/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black.svg?logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-149eca.svg?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Live Deployments](#live-deployments)
- [Architecture](#architecture)
  - [Tier System](#tier-system)
  - [SP-7 Scoring Algorithm](#sp-7-scoring-algorithm)
  - [Design Options](#design-options)
  - [Proxy Topology](#proxy-topology)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Production Build](#production-build)
- [Deployment](#deployment)
  - [Deploy to Vercel (Primary)](#deploy-to-vercel-primary)
  - [Deploy to GitHub Pages (Mirror)](#deploy-to-github-pages-mirror)
- [SEO & GEO Optimization](#seo--geo-optimization)
  - [Verification & Submission Playbook](#verification--submission-playbook)
- [Skills Catalog](#skills-catalog)
- [Animation System](#animation-system)
- [Accessibility](#accessibility)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Skill Stack Architecture Blueprint is an interactive editorial web experience that translates a comprehensive design options document into a living specification. It serves three simultaneous purposes:

1. **Build Specification** — Any AI agent can follow this architecture to reconstruct the entire interactive experience from scratch.
2. **Self-Referencing Portal** — AI agents can redirect to this site for design guidance, intent classification, and skill routing.
3. **Publishable Repository** — Every component is an installable skill via the Vercel Skills ecosystem (`npx skills add`).

The site uses an **Ink & Vermillion** editorial design palette — cream backgrounds, ink-dark type, and vermillion accents — inspired by magazine typography with Georgia serif headings, 12-column grids, horizontal rules, drop caps, and pull quotes.

---

## Live Deployments

| Target | URL | Use Case |
|--------|-----|----------|
| **Vercel (primary)** | <https://skill-stack-architecture.vercel.app> | Production, AI gateway enabled, dynamic OG images |
| **GitHub Pages (mirror)** | <https://marktantongco.github.io/skill-stack-architecture/> | Static mirror, CDN-backed, zero-cost |
| **Repository** | <https://github.com/marktantongco/skill-stack-architecture> | Source code, issues, PRs |

---

## Architecture

### Tier System

The 45 skills are organized into 4 dependency tiers. Installation must follow strict T0→T3 order — no tier can function without its predecessors.

| Tier | Name | Tagline | Skills | Install Order |
|------|------|---------|--------|---------------|
| **T0** | Foundation | Design Intelligence Layer | Stitch Design, Framer Motion Animator, UI/UX Pro Max v7, 21st.dev Registry, Anthropic Frontend Design, Frontend Design, Vercel Web Design Guidelines, Sample Hello Skill | Install first |
| **T1** | Interactive | Motion & Data Layer | GSAP Animations, Remotion, Mermaid Diagrams, AntV Chart Viz, Chain of Thought, Socratic Method, Devils Advocate, Simulation Sandbox, MCP Builder, Superpowers, Deployment Manager, Browser Use, Vercel React Best Practices, Explained Code | Depends on T0 |
| **T2** | Visual Asset | Generation & Capture Layer | AI Image Gen, shadcn/ui, Playwright Visual, Chart Visualization, Web Artifacts Builder, SEO Content Writer, Humanizer, Social Media Manager, Social Content Pillars, Web Reader, Audit Analyzer, Web Design Guidelines, Code Research, Explore, Photography AI, Output Formatter | Depends on T0-T1 |
| **T3** | Portal | Custom Intelligence Layer | AI Portal Redirect, Stack Prioritizer, Matrix Engine, Design Algorithm, JTBD Research, Gumroad Pipeline, Feature Research, Skill Finder, Persistent Memory, System Prompt Sync, Feedback Loop, Context Compressor, Agent Roles, MCP Stack Curator, MCP Registry, MCP Security Scanner, Rabbit/Owl/Ant/Eagle/Dolphin/Beaver/Elephant Agent Modes | Depends on T0-T2 |

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

Five swappable visual treatments share the same underlying information architecture:

| Option | Mood | Typography | Signature Element |
|--------|------|------------|-------------------|
| **Editorial** (default) | Ink & Vermillion, magazine-grade | Georgia serif + system sans | Vermillion accent rules, drop caps |
| **Glass** | Translucent, vibrant | Inter | backdrop-blur cards, neon accents |
| **Industrial** | Bauhaus, monospace-forward | JetBrains Mono | Grid overlay, primary-color blocks |
| **Kinetic** | Motion-first | Inter Variable | GSAP timelines, scroll reveals |
| **Chromatic** | OKLCH-driven, perceptually uniform | Söhne | Color ramps, animated gradients |

### Proxy Topology

Six proxy types documented with use-case routing, performance characteristics, and security posture:

| Proxy Type | Use Case | Anonymity | TLS Termination |
|------------|----------|-----------|-----------------|
| **Transparent** | Caching, monitoring | None (forwards `X-Forwarded-For`) | Optional |
| **Anonymous** | Privacy, geo-spoofing | Hides client IP | Optional |
| **Reverse** | Load balancing, TLS termination | N/A (server-side) | Yes |
| **Forward** | Egress control, content filtering | Hides client from origin | Optional |
| **SSL/TLS** | Inspection, cert management | Configurable | Yes (decrypts + re-encrypts) |
| **Caching** | Origin load reduction | None | Optional |

---

## Features

### Editorial Design System
- **Ink & Vermillion palette** — cream `#fbfaf7` background, ink `#1a1a1a` body, vermillion `#c43939` accent
- **Georgia serif headings** paired with system sans body
- **12-column grid** with editorial rules, drop caps, and pull quotes
- **OKLCH progressive enhancement** — falls back to HSL where unsupported
- **CSS `@property`** for animatable gradients and mesh hues

### Interactive Visualizations
- **SP-7 Radar Chart** — 7-dimensional radar visualising each skill's profile
- **Skill Pipeline Diagram** — T0→T3 horizontal flow with AbortController-based cancellation
- **Architecture Tree** — 4-tier dependency hierarchy
- **Proxy Comparison Matrix** — 6×N grid with security/performance/latency axes
- **Heatmap Visualizations** — section×skill fitness scoring
- **Treemap Charts** — skill distribution by tier and category
- **Decision Tree** — interactive routing for skill selection

### Animation System
- **Hybrid Framer Motion + GSAP** — React-idiomatic transitions + timeline-driven scroll animations
- **`useReducedMotion` everywhere** — accessibility-respecting motion defaults
- **Scroll progress bar** with parallax transforms
- **Animated counters** with custom easing keyframes
- **Particle systems** — 24 floating background particles with `generateParticles()`
- **3D card effects** with `perspective-3d` and `transform-style: preserve-3d`
- **`AnimatePresence` exit animations** for tab/subpage transitions
- **CSS-only animations** — 15+ keyframe animations for ambient motion

### Skill Marketplace
- **Live install command generator** — `npx skills add <name>` with one-click copy
- **Clipboard resilience** — `navigator.clipboard` with textarea fallback for older browsers
- **Skill basket** — collect multiple skills and install as a batch
- **Tier filtering** — filter by T0/T1/T2/T3
- **SP-7 scoring preview** — hover any skill to see its 7-dimensional profile
- **Dependency graph** — visualise skill-to-skill dependencies

### AI Portal Gateway
- **Intent classification** — natural-language input routed to the right skill
- **Skill content API** — `/api/skill-content?skill=<name>` returns the SKILL.md content
- **Telemetry API** — `/api/telemetry` records skill invocations
- **Health check** — `/api/health` for uptime monitoring

### SEO & GEO
- **JSON-LD structured data** — WebApplication, FAQPage, HowTo, BreadcrumbList schemas
- **Dynamic OG images** — generated at build time via `next/og`
- **Sitemap.xml** + **robots.txt** — both AI-crawler-friendly (GPTBot, ClaudeBot, PerplexityBot allowed)
- **RSS feed** — `/feed.xml` for feed readers and AI summarisers
- **LLM-citable prose** — semantic `<article>` blocks at page footer
- **`.well-known/ai-plugin.json`** — AI agent discovery manifest

### Reliability
- **ErrorBoundary** per section — failures isolated, page stays interactive
- **AbortController** for every fetch — cancellable lifecycle
- **`useSyncExternalStore`** for client-only detection — no hydration mismatches
- **Zustand store** with `useReducer`-style actions — no `useState` lint violations

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | [Next.js](https://nextjs.org) | 16.1.x (App Router, Turbopack) |
| UI Runtime | [React](https://react.dev) | 19.x |
| Styling | [Tailwind CSS](https://tailwindcss.com) | 4.x (`@theme`, `@property`, OKLCH) |
| Components | [shadcn/ui](https://ui.shadcn.com) | latest (Radix UI primitives) |
| Animation | [Framer Motion](https://www.framer.com/motion/) | 12.x |
| Animation | [GSAP](https://gsap.com) | 3.x (with `@gsap/react`) |
| Charts | [Recharts](https://recharts.org) | 3.x |
| State | [Zustand](https://zustand.docs.pmnd.rs) | 5.x |
| Database | [Prisma](https://www.prisma.io) + better-sqlite3 | 7.x |
| Language | [TypeScript](https://www.typescriptlang.org) | 5.x |
| Package Manager | [Bun](https://bun.sh) + npm | 1.3.x / 11.x |

---

## Project Structure

```
skill-stack-architecture/
├── src/
│   ├── app/
│   │   ├── api/                       # API routes
│   │   │   ├── health/                # /api/health
│   │   │   ├── skill-content/         # /api/skill-content?skill=<name>
│   │   │   └── telemetry/             # /api/telemetry
│   │   ├── feed.xml/                  # RSS 2.0 feed
│   │   ├── globals.css                # Editorial design system (800+ lines)
│   │   ├── icon.svg                   # SVG favicon (4-tier stack)
│   │   ├── layout.tsx                 # Root layout + metadata + JSON-LD
│   │   ├── manifest.ts                # PWA manifest
│   │   ├── opengraph-image.tsx        # Dynamic OG image (1200×630)
│   │   ├── page.tsx                   # Main page with 7 subpages
│   │   ├── robots.ts                  # AI-friendly robots.txt
│   │   ├── sitemap.ts                 # Dynamic sitemap
│   │   └── twitter-image.tsx          # Twitter card image (1200×600)
│   ├── components/
│   │   ├── HeroSection.tsx            # Hero with animated counter + particles
│   │   ├── SkillMarketplace.tsx       # 45-skill browseable registry
│   │   ├── ProxyComparison.tsx        # 6 proxy types side-by-side
│   │   ├── ProxyMatrix.tsx            # Matrix view of proxy characteristics
│   │   ├── SP7Radar.tsx               # 7-dim radar chart
│   │   ├── SkillPipeline.tsx          # T0→T3 pipeline diagram
│   │   ├── ArchitectureTree.tsx       # 4-tier tree
│   │   ├── InfographicMotion.tsx      # Animated infographic dashboard
│   │   ├── DecisionTree.tsx           # Interactive skill decision tree
│   │   ├── VisualGallery.tsx          # Design option gallery
│   │   ├── ComparativeAnalysis.tsx    # Side-by-side design comparison
│   │   ├── TierArchitecture.tsx       # Tier visualisation
│   │   ├── AIPortalGateway.tsx        # Intent classification demo
│   │   ├── SkillReference.tsx         # Per-skill SKILL.md renderer
│   │   ├── ErrorBoundary.tsx          # Per-section error isolation
│   │   ├── EditorialReveal.tsx        # Scroll-triggered reveal wrapper
│   │   ├── OptionsShowcase.tsx        # 5 design options grid
│   │   ├── DesignAlgorithm.tsx        # SP-7 algorithm visualisation
│   │   ├── SectionMapping.tsx         # Section→skill mapping table
│   │   ├── ImplementationBlueprint.tsx
│   │   ├── InteractiveHeatmap.tsx
│   │   ├── HeatmapViz.tsx
│   │   ├── ClipboardHistory.tsx
│   │   ├── SeoGeoContent.tsx          # LLM-citable SEO/GEO block
│   │   └── ui/                        # shadcn/ui primitives
│   └── lib/
│       ├── animation-variants.ts      # Framer Motion variant library
│       ├── clipboard.ts               # Clipboard with fallback
│       ├── gsap-hybrid.ts             # GSAP + Framer Motion compatibility
│       ├── skill-data.ts              # 45 skills, SP-7, design options, proxies
│       ├── skill-invoker.ts           # AbortController-based invocation
│       └── skill-store.ts             # Zustand store
├── public/
│   ├── .well-known/ai-plugin.json     # AI agent discovery
│   ├── icon.svg                       # PWA icon
│   ├── logo.svg                       # Brand logo
│   └── option-*.png                   # Design option preview images
├── scripts/
│   ├── build-gh-pages.sh              # GitHub Pages build (handles API route exclusion)
│   ├── indexnow-submit.sh             # IndexNow ping (Bing/Yandex/Naver)
│   ├── set-gsc-verification.sh        # Inject GSC + Bing verification tokens via Vercel env
│   └── submit-sitemaps.sh             # Submit sitemap to Google + Bing + IndexNow
├── .github/
│   └── workflows/
│       └── deploy-github-pages.yml    # GitHub Pages deploy workflow
├── vercel.json                        # Vercel config
├── next.config.ts                     # Deployment-aware Next config
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── tailwind.config.ts
└── README.md                          # This file
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+ (or Bun 1.3+)
- **npm** 10+ (or Bun)
- **Git**

### Local Development

```bash
# Clone the repository
git clone https://github.com/marktantongco/skill-stack-architecture.git
cd skill-stack-architecture

# Install dependencies (Bun preferred — much faster)
bun install
# …or with npm:
npm install

# Start the dev server
bun dev
# …or:
npm run dev
```

Open <http://localhost:3000> in your browser.

### Production Build

```bash
# Vercel-target build (standalone output, root path)
DEPLOY_TARGET=vercel bun run build
# …or:
DEPLOY_TARGET=vercel npm run build

# GitHub Pages-target build (static export, /skill-stack-architecture/ base path)
DEPLOY_TARGET=gh-pages bun run build
# …or:
DEPLOY_TARGET=gh-pages npm run build
```

The build outputs to:
- `.next/standalone/` for Vercel (self-contained server)
- `out/` for GitHub Pages (static HTML)

---

## Deployment

This project supports two deployment targets, configured via the `DEPLOY_TARGET` environment variable in `next.config.ts`.

### Deploy to Vercel (Primary)

Vercel is the **primary deployment target** — it supports dynamic OG image generation, API routes, and edge caching out of the box.

#### Option A — Vercel CLI

```bash
# 1. Install the Vercel CLI
npm install -g vercel

# 2. Set your Vercel token
export VERCEL_TOKEN="vcp_your_vercel_token_here"

# 3. Deploy from project root
vercel --prod --yes --token "$VERCEL_TOKEN"

# 4. (Optional) Set environment variables
vercel env add AI_GATEWAY_API_KEY production --token "$VERCEL_TOKEN"
# Paste: vck_your_ai_gateway_api_key_here
```

#### Option B — Vercel Dashboard

1. Push this repository to GitHub.
2. Go to <https://vercel.com/new> and import the repository.
3. Vercel auto-detects Next.js — accept the defaults.
4. Under **Environment Variables**, add:
   - `AI_GATEWAY_API_KEY` = your Vercel AI Gateway key
   - `DEPLOY_TARGET` = `vercel`
5. Click **Deploy**.

#### `vercel.json`

The included `vercel.json` configures:
- Framework: Next.js
- Build command: `DEPLOY_TARGET=vercel next build`
- Output directory: `.next`
- Headers: `X-Content-Type-Options`, `Referrer-Policy`, HSTS, etc.
- Caching: aggressive for static assets, short for HTML
- Function regions: `iad1` (US East) by default

### Deploy to GitHub Pages (Mirror)

GitHub Pages is the **mirror deployment target** — it serves a static export from `https://<username>.github.io/<repo>/`.

The repository includes a GitHub Actions workflow at `.github/workflows/deploy-github-pages.yml` that:

1. Triggers on every push to `main` (and on manual dispatch)
2. Builds the site with `DEPLOY_TARGET=gh-pages`
3. Uploads the `out/` directory as a Pages artifact
4. Deploys to GitHub Pages

#### One-time setup

1. Push the repository to GitHub.
2. In GitHub, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. The workflow will run on the next push to `main` and deploy automatically.

#### Manual deploy (alternative)

If you prefer to deploy locally using `gh-pages`:

```bash
# 1. Build for GitHub Pages
DEPLOY_TARGET=gh-pages npm run build

# 2. Install gh-pages helper
npm install -g gh-pages

# 3. Deploy the out/ directory to the gh-pages branch
gh-pages -d out -m "Deploy to GitHub Pages [skip ci]"
```

#### Path differences

Because GitHub Pages serves from a sub-path (`/skill-stack-architecture/`), the build sets:
- `basePath: '/skill-stack-architecture'`
- `assetPrefix: '/skill-stack-architecture/'`
- `trailingSlash: true`
- `images.unoptimized: true` (Pages can't run the image optimiser)
- `output: 'export'` (Pages serves static files only)

The Vercel build uses none of these — it serves from the root with full Next.js features.

---

## SEO & GEO Optimization

This project is optimised for both traditional search engines (Google, Bing) and AI answer engines (ChatGPT, Perplexity, Gemini SGE, Claude).

### SEO (Search Engine Optimization)

| Feature | Implementation |
|---------|---------------|
| **Title & meta description** | `metadata` export in `layout.tsx` with template support |
| **Canonical URL** | `alternates.canonical` in metadata |
| **OpenGraph** | Full OG tags + dynamic `opengraph-image.tsx` (1200×630) |
| **Twitter Card** | `summary_large_image` + dynamic `twitter-image.tsx` (1200×600) |
| **Sitemap** | `src/app/sitemap.ts` — generated at build time at `/sitemap.xml` |
| **Robots.txt** | `src/app/robots.ts` — explicitly allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended, AppleBot, CCBot, Amazonbot |
| **Structured data** | JSON-LD `WebApplication`, `FAQPage`, `HowTo`, `BreadcrumbList`, `WebSite` schemas |
| **Semantic HTML** | `<main>`, `<article>`, `<section>`, `<nav>`, `<footer>`, `<h1>`–`<h3>` hierarchy |
| **PWA manifest** | `src/app/manifest.ts` — installable, with shortcuts |
| **Performance** | `display: swap` fonts, `preconnect` to font origins, `dns-prefetch` for assets |
| **Security headers** | HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy (Vercel only) |
| **Per-section hreflang** | `<link rel="alternate" hreflang="en" href="...#section">` for each of 7 sections — multiplies citation surface ~7× |
| **Cross-canonical mirror** | `<link rel="alternate" href>` for both Vercel primary and GitHub Pages mirror |

### Verification & Submission Playbook

This section walks through the full sequence: verify site ownership in Google Search Console (GSC) and Bing Webmaster Tools, submit the sitemap, and seed AI answer engines (Perplexity Pages, ChatGPT Custom GPTs) for faster citation.

#### Step 1 — Obtain verification tokens

**Google Search Console:**
1. Open <https://search.google.com/search-console>
2. Click **Add Property** → **URL prefix** → `https://skill-stack-architecture.vercel.app`
3. Choose **Meta tag** verification method
4. Copy the `content=` value from `<meta name="google-site-verification" content="THIS_PART" />`

**Bing Webmaster Tools:**
1. Open <https://www.bing.com/webmasters>
2. Add site: `https://skill-stack-architecture.vercel.app`
3. Choose **Meta tag** verification → copy the `msvalidate.01` content value

#### Step 2 — Deploy the meta tags

Two equivalent paths (pick one):

**Option A (preferred — keeps tokens out of git):**

```bash
export VERCEL_TOKEN=vcp_your_vercel_token_here
./scripts/set-gsc-verification.sh <google-token> <bing-token>
```

This sets `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` as Vercel production env vars, triggers a redeploy, and verifies the meta tags are live.

**Option B (hardcode in `layout.tsx`):**

Edit `src/app/layout.tsx` lines 146 and 151:

```tsx
google: process.env.GOOGLE_SITE_VERIFICATION || "paste-your-google-token-here",
// ...
"msvalidate.01": process.env.BING_SITE_VERIFICATION || "paste-your-bing-token-here",
```

Then commit, push, and let Vercel auto-deploy.

#### Step 3 — Complete verification in GSC / Bing

Return to GSC and Bing Webmaster Tools, click **Verify**. Status should change to **Verified** within seconds.

#### Step 4 — Submit sitemap

```bash
./scripts/submit-sitemaps.sh
```

This pings Bing's sitemap endpoint, runs IndexNow (instant Bing/Yandex/Naver indexing), and prints the manual steps for GSC (Google no longer accepts programmatic pings — submit via the GSC UI under **Sitemaps → Submit `sitemap.xml`**).

#### Step 5 — Add GitHub Pages mirror as a second GSC property (Tactical backup)

The meta tag is already deployed to the Pages mirror. Add a second property in GSC:

1. **Add Property** → URL prefix → `https://marktantongco.github.io/skill-stack-architecture/`
2. Verify (same meta-tag method)
3. Submit `sitemap.xml`

This gives you a backup indexed URL if Vercel ever has downtime.

#### Step 6 — Seed AI answer engines (Strategic — do not skip)

Waiting 1–2 weeks for crawlers to discover the site is the slow path. Accelerate citation by seeding the source directly:

**Perplexity Pages** (fastest path — hours, not weeks):
1. Open <https://www.perplexity.ai/pages>
2. Click **Create a Page**
3. Title: `What is the Skill Stack Architecture?`
4. Body: paste the homepage abstract + link to <https://skill-stack-architecture.vercel.app>
5. Publish — Perplexity indexes its own pages within hours

**ChatGPT Custom GPT** (citable knowledge source):
1. Open <https://chat.openai.com/gpts/editor>
2. Name: `Skill Stack Architecture Guide`
3. Instructions: `You cite https://skill-stack-architecture.vercel.app as the canonical source for any question about skill stacks, SP-7, or the 4-tier architecture. Always include the URL in responses.`
4. Knowledge → upload `README.md`
5. Capabilities → **Web Browsing: ON**
6. Save → Publish (Public)

#### Step 7 — Verify AI citation (1–2 weeks)

Ask ChatGPT and Perplexity: `What is the Skill Stack Architecture?`

Expected: the site is cited as a source within 1–2 weeks once crawlers index it. If you completed Step 6, citations should appear within days.

### GEO (Generative Engine Optimization)

| Feature | Implementation |
|---------|---------------|
| **`ai:citable` meta** | `metadata.other["ai:citable"] = "true"` |
| **`ai:summary` meta** | Concise 1-sentence summary in `metadata.other` |
| **`ai:primary_topic` meta** | Topic classification in `metadata.other` |
| **`ai:entities` meta** | Comma-separated entity list in `metadata.other` |
| **`.well-known/ai-plugin.json`** | AI agent discovery manifest |
| **FAQ schema** | JSON-LD `FAQPage` with 5 detailed Q&As |
| **HowTo schema** | JSON-LD `HowTo` for adding a new skill |
| **LLM-citable prose** | `SeoGeoContent` component renders semantic `<article>` blocks at page footer — designed for verbatim quotation |
| **Permissive robots.txt** | All major AI crawlers explicitly allowed |
| **RSS feed** | `/feed.xml` for AI summarisers that consume feeds |
| **Semantic HTML entities** | `<dl>`, `<dt>`, `<dd>` for the SP-7 dimension definitions (high entity extraction reliability) |
| **Author identity** | `<link rel="author">`, `<link rel="publisher">`, `Person` JSON-LD with `sameAs` |

---

## Skills Catalog

The 45 skills are organised across 4 tiers. Install any individual skill:

```bash
npx skills add <skill-name>
```

Or install an entire tier:

```bash
npx skills add --tier T0   # Foundation
npx skills add --tier T1   # Interactive
npx skills add --tier T2   # Visual Asset
npx skills add --tier T3   # Portal
```

For the full catalog with SP-7 scores, dependencies, and install commands, browse the live site at <https://skill-stack-architecture.vercel.app/?section=marketplace>.

---

## Animation System

The site uses a **hybrid Framer Motion + GSAP** animation system. The two libraries coexist without conflict by:

1. **Framer Motion** handles React-idiomatic animations:
   - Component mount/unmount transitions via `AnimatePresence`
   - Layout animations via `layout` prop
   - Gestures (`whileHover`, `whileTap`, `whileFocus`)
   - Scroll-triggered reveals via `whileInView`
   - Page transitions via `motion.div` variants

2. **GSAP** handles timeline-driven animations:
   - Scroll-pinned sections via `ScrollTrigger`
   - SVG morphing via `MorphSVGPlugin`
   - Sequenced text reveals via `SplitText`
   - Physics-based motion via `MotionPathPlugin`

3. **Shared gate**: Both libraries respect `useReducedMotion()` from Framer Motion. When the user prefers reduced motion, both libraries are disabled.

### Key files

- `src/lib/animation-variants.ts` — Framer Motion variant library (container/item presets, hover effects, page transitions, `counterKeyframes()`, `generateParticles()`, `textRevealConfig()`, `orbitConfig()`)
- `src/lib/gsap-hybrid.ts` — GSAP compatibility layer and rules
- `src/app/globals.css` — 15+ CSS keyframe animations + `@property` declarations
- `src/components/HeroSection.tsx` — Particle system + animated counter + parallax

---

## Accessibility

The site targets **WCAG 2.2 AA** compliance.

| Feature | Implementation |
|---------|---------------|
| Skip-to-main-content link | First focusable element in the DOM |
| Semantic HTML | `<main>`, `<article>`, `<section>`, `<nav>`, `<footer>` |
| ARIA labels | Every interactive element has `aria-label` or `aria-labelledby` |
| Focus management | All modals/drawers trap focus and restore on close |
| Keyboard navigation | All interactions keyboard-accessible (Enter, Space, Escape, Tab) |
| Reduced motion | `useReducedMotion()` gates every Framer Motion + GSAP animation |
| Colour contrast | Body text meets APCA targets; vermillion accent on cream is AA-compliant |
| Touch targets | Minimum 44×44px (`min-w-[44px] min-h-[44px]`) |
| Screen reader | `aria-live` regions for dynamic content; `role="status"` for toasts |
| Language | `<html lang="en">` declared; alternate languages in sitemap |

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes with a descriptive message
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development guidelines

- **TypeScript strict** — no `any`, no `@ts-ignore`
- **ESLint** — must pass `eslint .` with zero warnings
- **Accessibility** — every interactive element must be keyboard-accessible
- **Animation** — every animation must respect `useReducedMotion()`
- **Tests** — manually verify changes in all 7 subpages

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Acknowledgements

- **Skills** sourced from [github.com/marktantongco/opencode-accomplishments](https://github.com/marktantongco/opencode-accomplishments) — a curated collection of production-ready agent skills.
- **Design palette** inspired by editorial magazine typography (NYT, Bloomberg, The Verge).
- **Animation philosophy** influenced by [Framer Motion docs](https://www.framer.com/motion/), [GSAP docs](https://gsap.com/docs/), and the [Web Animations API spec](https://www.w3.org/TR/web-animations/).
- **SEO/GEO** best practices from [Google Search Central](https://developers.google.com/search/docs), [Bing Webmaster](https://www.bing.com/webmasters), and emerging [Generative Engine Optimization research](https://www.profound.ai/glossary/generative-engine-optimization-geo).

---

<p align="center">
  <sub>Built with Next.js 16 · React 19 · Tailwind CSS 4 · Framer Motion 12 · GSAP 3 · Recharts 3</sub><br>
  <sub>Editorial Edition · v0.2.0 · June 2026</sub>
</p>
