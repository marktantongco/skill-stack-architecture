# Design Operating System — Master Index v1.1

**Five interconnected skills that compose into a complete design operating system.**

---

## Quick Reference Tables

### Skill Overview

| Skill | Version | Lines | Word Count | Primary Focus |
|-------|---------|-------|------------|----------------|
| anthropic-frontend-design | v1.1 | 943 | ~8,000 | AI-native UI, trust patterns, conversation design |
| gsap-animations | v1.1 | 1,037 | ~11,000 | Production animation, ScrollTrigger, React integration |
| UI/UX Pro Max | v7.1 | 2,859 | ~18,000 | Design system, 60 styles, 48 palettes, 14 components |
| vercel-react-best-practices | v1.1 | 1,097 | ~10,000 | React architecture, state management, performance |
| vercel-web-design-guidelines | v1.1 | 891 | ~9,000 | Accessibility, performance budgets, SEO, security |

### Embedded Data (UI/UX Pro Max v7.1)

| Category | Count | Location in File |
|----------|-------|------------------|
| UI Styles | 60 | Module 7.1 |
| Color Palettes | 48 | Module 7.2 |
| Font Pairings | 36 | Module 7.3 |
| Industry Rules | 24 | Module 7.4 |
| Animation Presets | 24 | Module 4 |
| React Components | 14 | Module 3.3 |
| Remotion Templates | 4 | Module 5 |
| Design Token Schemas | 2 | Module 2.7, 3.1 |

### Component Library (14 Components in UI/UX Pro Max)

| ID | Component | Lines | Variant |
|----|-----------|-------|---------|
| C01 | Button | 596-653 | default, destructive, outline, secondary, ghost, link |
| C02 | Input | 660-722 | with Zod validation, left/right icons |
| C03 | Card | 728-771 | default, feature, pricing, testimonial |
| C04 | Modal/Dialog | 777-889 | sm, md, lg, xl + focus trap |
| C05 | Navbar | 896-975 | default, transparent, sticky + skip link |
| C06 | Badge | 982-1017 | default, secondary, success, warning, error, outline |
| C07 | Toast | 1022-1096 | success, error, warning, info + progress |
| C08 | Skeleton | 1102-1163 | text, card, chart, avatar (SSR-safe) |
| C09 | Tabs | 1170-1317 | default, pill, vertical + keyboard nav |
| C10 | Accordion | 1321-1418 | single/multiple + keyboard nav |
| C11 | Table | 1425-1511 | sortable, render props |
| C12 | StatCard | 1518-1554 | with trend indicator |
| C13 | ThinkingIndicator | 1559-1576 | from Anthropic skill |
| C14 | UncertaintyNotice | 1580-1620 | from Anthropic skill |

---

## Skill Dependency Graph

### Load Order (Recommended)

```
1. anthropic-frontend-design  (creative direction, trust patterns)
   ↓
2. UI/UX Pro Max v7.1          (design system, tokens, components)
   ↓
3. vercel-web-design-guidelines  (accessibility, performance, SEO)
   ↓
4. vercel-react-best-practices   (architecture, state, testing)
   ↓
5. gsap-animations             (complex motion, ScrollTrigger)
```

### Integration Matrix

| When you need... | Load first... | Then add... |
|------------------|--------------|-------------|
| AI chat interface | anthropic-frontend-design | UI/UX Pro Max |
| Marketing landing | UI/UX Pro Max | gsap-animations |
| Dashboard/SaaS | vercel-react-best-practices | UI/UX Pro Max + vercel-web |
| Animation-heavy | gsap-animations | UI/UX Pro Max |
| Accessible gov/health | vercel-web-design-guidelines | UI/UX Pro Max |
| Full production app | ALL FIVE (in load order) | — |

---

## Duplicate Content — Cross-Reference Map

Instead of duplicating, use forward references:

| Pattern | Primary Source | Duplicate Locations | Action |
|---------|---------------|-------------------|--------|
| Server/Client Components | vercel-react-best-practices:0.2 | anthropic:3.2, UX-Pro-Max:3.2 | Add "See vercel-react:0.2" |
| prefers-reduced-motion | vercel-web-design-guidelines:1.5 | ALL skills | Add "See vercel-web:1.5" |
| Container Queries | vercel-web-design-guidelines:3.2 | UX-Pro-Max:2.6 | Add "See vercel-web:3.2" |
| Fluid Typography | vercel-web-design-guidelines:3.1 | anthropic:2.1, UX-Pro-Max:2.2 | Add "See vercel-web:3.1" |
| useId() | vercel-react-best-practices:1.1 | UX-Pro-Max:3.3 | Add "See vercel-react:1.1" |
| Error Boundary | vercel-react-best-practices:6.1 | UX-Pro-Max (C04 Modal) | Add "See vercel-react:6.1" |

---

## Migration Guides

### UI/UX Pro Max: v5.0 → v7.1

| Change | v5.0 | v7.1 | Action |
|-------|------|------|--------|
| File name | SKILL.md | UX-Pro-Max-v7.0-SKILL.md | Rename file |
| Version header | v5.0.0 | v7.1 | Update |
| Components | 12 | 14 | Add C13, C14 |
| OKLCH colors | No | Yes | Use `oklch()` function |
| React 19 patterns | No | Yes | Remove forwardRef |
| Remotion templates | 0 | 4 | See Module 5 |

### All Skills: v1.0 → v1.1

| Change | Action |
|-------|--------|
| Update version in compat tables | Change "v1.0" → "v1.1" |
| Update UI/UX Pro Max reference | Change "v7.0+" → "v7.1+" |
| Add new cross-references | See Integration Matrix |

---

## Performance Benchmarks

### Animation Performance (gsap-animations)

| Property | GPU Accelerated | Layout Thrashing | Verdict |
|----------|------------------|-------------------|----------|
| transform: translateX/Y/Z | ✅ | ❌ | Use always |
| transform: scale/rotate | ✅ | ❌ | Use always |
| opacity | ✅ | ❌ | Use always |
| left/top/right/bottom | ❌ | ✅ | Never animate |
| width/height | ❌ | ✅ | Never animate |
| filter: blur() on scroll | ❌ | ✅ | Use opacity of duplicate |

### Core Web Vitals Budgets (vercel-web-design-guidelines)

| Metric | Budget | Priority | Technique |
|--------|--------|----------|-----------|
| FCP | < 1.8s | Critical | Preload, optimize TTFB |
| LCP | < 2.5s | Critical | Optimize hero image, preload |
| FID | < 100ms | Critical | Minimize JS, use web workers |
| CLS | < 0.1 | Critical | Set image dimensions, reserve space |
| INP | < 200ms | Critical | Debounce handlers, optimize React |

---

## Troubleshooting Common Issues

### Integration Issues

| Symptom | Cause | Fix |
|----------|-------|-----|
| GSAP ScrollTrigger not working | Missing cleanup | Use useGSAP hook (gsap:3.1) |
| Modal focus trap broken | Missing aria-modal | Add to Modal (UX-Pro-Max:C04) |
| Hydration mismatch | Math.random() in render | Use deterministic IDs (UX-Pro-Max:C08) |
| Accessibility audit fails | Missing skip link | Add to Navbar (UX-Pro-Max:C05) |
| Performance budget exceeded | Too much JS | Code split (vercel-react:2.3) |

### Version Mismatch Errors

| Error | Fix |
|-------|-----|
| "Works with UI/UX Pro Max v7.0+" | Update to "v7.1+" |
| Compat table shows v1.0 | Update to v1.1 |
| Component C13 not found | Update cross-references |

---

## GSAP Cinematic Effects (New — Add to gsap-animations.md)

### Cinematic Reveal

```typescript
// Cinematic letterbox reveal
function cinematicReveal(element: HTMLElement) {
  const tl = gsap.timeline();
  
  // Create letterbox bars
  const topBar = document.createElement('div');
  const bottomBar = document.createElement('div');
  [topBar, bottomBar].forEach(bar => {
    Object.assign(bar.style, {
      position: 'fixed',
      left: '0',
      width: '100%',
      height: '0%',
      background: '#000',
      zIndex: '9999',
    });
  });
  topBar.style.top = '0';
  bottomBar.style.bottom = '0';
  document.body.appendChild(topBar);
  document.body.appendChild(bottomBar);

  tl.to([topBar, bottomBar], {
    height: '15%',
    duration: 0.8,
    ease: 'power2.inOut',
  })
  .from(element, {
    scale: 1.1,
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out',
  }, '-=0.4')
  .to([topBar, bottomBar], {
    height: '0%',
    duration: 0.6,
    ease: 'power2.inOut',
    delay: 0.5,
    onComplete: () => {
      topBar.remove();
      bottomBar.remove();
    }
  });

  return tl;
}
```

### Cinematic Parallax Depth

```typescript
// Multi-layer parallax for cinematic depth
function cinematicParallax(container: HTMLElement) {
  const layers = [
    { selector: '.layer-bg', speed: 0.2, scale: 1.1 },
    { selector: '.layer-mid', speed: 0.5, scale: 1.05 },
    { selector: '.layer-fg', speed: 0.8, scale: 1.0 },
  ];

  layers.forEach(({ selector, speed, scale }) => {
    const el = container.querySelector(selector);
    if (!el) return;

    gsap.to(el, {
      y: () => window.innerHeight * speed,
      scale,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}
```

### Cinematic Text Reveal

```typescript
// Dramatic text reveal with mask
function cinematicTextReveal(element: HTMLElement) {
  const split = new SplitText(element, { type: 'lines' });
  
  gsap.from(split.lines, {
    opacity: 0,
    y: 100,
    rotationX: -80,
    transformOrigin: '50% 0%',
    stagger: 0.1,
    duration: 1.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  });
}
```

---

## Skill File Checklist

Before committing any skill file, verify:

- [ ] Version number in header matches compat tables
- [ ] Cross-references point to correct version (v7.1+, v1.1)
- [ ] No duplicate content (use forward references)
- [ ] Code examples are syntactically valid
- [ ] CSS custom properties have closing `]`
- [ ] All `'use client'` directives have quotes
- [ ] Component keys use stable identifiers (not index)
- [ ] Accessibility attributes present (aria-*, role)
- [ ] prefers-reduced-motion respected
- [ ] Performance budgets listed (vercel-web)
- [ ] Integration matrix updated

---

*Design Operating System Master Index v1.1 — Because the whole is greater than the sum of its skills.*
