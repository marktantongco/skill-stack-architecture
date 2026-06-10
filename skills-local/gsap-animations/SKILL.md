---
name: gsap-animations
description: Production-grade GSAP animation patterns with ScrollTrigger, Flip plugin, and React integration. Use for scroll-driven animations, complex timelines, React-safe GSAP patterns, and performance optimization.
---

# GSAP Animations Skill

**Version:** 1.1  
**Scope:** Production-grade animation patterns with GSAP, ScrollTrigger, Flip plugin, and React integration.  
**Works with:** React, Next.js, Vue, vanilla JS, Remotion  
**Word Count:** ~11,000 | **Embedded Data:** 24 animation patterns, 16 ScrollTrigger configs, 12 easing references, 8 React integration patterns, 6 performance rules

---

## MODULE 0: Philosophy & Setup

### 0.1 What This Skill Provides

This skill embeds GSAP animation expertise directly into your AI assistant. It covers **scroll-driven animations**, **complex timelines**, **React integration**, and **performance optimization**.

**Key differentiators:**
- ScrollTrigger patterns for every common scroll effect
- React-safe GSAP patterns (cleanup, refs, strict mode)
- Performance-first animation strategies
- Production-ready code (no memory leaks, no jank)

### 0.2 Installation

Core GSAP installation and React integration:
```bash
# Core
npm install gsap

# With React integration
npm install gsap @gsap/react

# All plugins included in gsap package (registered on demand)
```

### 0.3 Registration Pattern

```typescript
// lib/gsap.ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { TextPlugin } from 'gsap/TextPlugin';
import { SplitText } from 'gsap/SplitText';

// Register plugins once
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, Flip, TextPlugin, SplitText);
}

export { gsap, ScrollTrigger, Flip, TextPlugin, SplitText };
```

### 0.4 Core Philosophy

**Animate transforms and opacity only.** These are the only properties the browser can animate at 60fps without layout thrashing.

| Animate These | Avoid These |
|--------------|-------------|
| `transform: translateX/Y/Z()` | `left`, `top`, `right`, `bottom` |
| `transform: scale()` | `width`, `height` |
| `transform: rotate()` | `margin`, `padding` |
| `opacity` | `filter: blur()` (on scroll) |
| `clip-path` (sparingly) | `box-shadow` (animate opacity of pseudo instead) |

### 0.5 Skill Selector — Decision Tree

**Route users to the right skill based on project type:**

```
START: What are you building?
│
├─ AI Chat Interface → Anthropic Frontend Design (Trust patterns)
│                      + UI/UX Pro Max v7.1 (Components)
│
├─ Marketing/Landing Page → UI/UX Pro Max v7.1 (CSS animations)
│                        + THIS SKILL (ScrollTrigger, complex motion)
│
├─ Dashboard/SaaS App → UI/UX Pro Max v7.1 (Micro-interactions)
│                    + Vercel React Best Practices (Architecture)
│
├─ Animation-Heavy Portfolio → THIS SKILL (Primary)
│                              + UI/UX Pro Max v7.1 (Design tokens)
│
├─ Accessible Site → Vercel Web Design Guidelines (WCAG)
│                  + UI/UX Pro Max v7.1 (Components)
│
└─ Full Production App → ALL FIVE SKILLS
```

### 0.6 Version Compatibility

| This Skill | Works With | Not Compatible With |
|------------|------------|------------------|
| v1.1 | UI/UX Pro Max v7.1+ | Pre-v7.1 |
| v1.1 | GSAP 3.x | GSAP 2.x |
| v1.1 | React 18+ | React 17 |

### 0.7 Cross-Skill Integration Quick Reference

| You Need | Use This Skill | Then Add |
|---------|----------------|----------|
| Complex timelines, ScrollTrigger | gsap-animations | UI/UX Pro Max |
| Flip plugin, layout transitions | gsap-animations | UI/UX Pro Max |
| React useGSAP integration | gsap-animations | UI/UX Pro Max |
| Production components | UI/UX Pro Max | This skill |
| Design tokens | UI/UX Pro Max | Any |

---

## MODULE 1: Core Animation Patterns

### 1.1 The Basic Tween

```typescript
import { gsap } from '@/lib/gsap';

// Single element
gsap.to('.box', {
  x: 200,
  rotation: 360,
  duration: 1,
  ease: 'power2.out',
});

// Multiple elements (staggered)
gsap.to('.box', {
  x: 200,
  stagger: 0.1,
  duration: 0.8,
  ease: 'power2.out',
});

// From (animate FROM values TO current)
gsap.from('.box', {
  y: 100,
  opacity: 0,
  duration: 1,
});

// FromTo (explicit start and end)
gsap.fromTo('.box',
  { x: -100, opacity: 0 },
  { x: 0, opacity: 1, duration: 1 }
);
```

### 1.2 Easing Reference

```typescript
// Power easings (most common)
'power1.out'      // Gentle deceleration
'power2.out'      // Medium deceleration (default)
'power3.out'      // Strong deceleration
'power4.out'      // Aggressive deceleration

'power1.in'       // Gentle acceleration
'power2.inOut'    // Symmetric ease

// Special easings
'elastic.out(1, 0.3)'      // Bouncy
'bounce.out'               // Gravity bounce
'back.out(1.7)'            // Overshoot
'slow(0.7, 0.7, false)'    // Slow motion
'steps(12)'                // Frame-by-frame

// Expo (dramatic)
'expo.out'         // Fast start, slow end
'expo.in'          // Slow start, fast end

// Circ (circular)
'circ.out'         // Circular deceleration

// Sine (subtle)
'sine.out'         // Very gentle

// Custom bezier
cubicBezier: '0.16, 1, 0.3, 1'  // Expo-like custom
```

### 1.3 Timeline Mastery

```typescript
// Basic timeline
const tl = gsap.timeline({
  defaults: { ease: 'power2.out', duration: 0.8 },
  onComplete: () => console.log('done'),
});

tl.to('.hero-title', { y: 0, opacity: 1 })
  .to('.hero-subtitle', { y: 0, opacity: 1 }, '-=0.4') // Overlap by 0.4s
  .to('.hero-cta', { scale: 1, opacity: 1 }, '<')       // Start with previous
  .to('.hero-image', { y: 0, opacity: 1 }, '<0.2');     // 0.2s after previous starts

// Position parameters explained:
// Absolute: 1 (at 1 second)
// Relative: '+=1' (1 second after end)
// Relative: '-=1' (1 second before end)
// Label: 'myLabel' (at label position)
// Label offset: 'myLabel+=1'
// Previous: '<' (start with previous)
// Previous offset: '<0.5' (0.5s after previous starts)

// Timeline with labels
const tl = gsap.timeline();
tl.addLabel('start')
  .to('.a', { x: 100 }, 'start')
  .to('.b', { x: 200 }, 'start+=0.5')
  .addLabel('middle')
  .to('.c', { x: 300 }, 'middle');

// Controlling playback
 tl.pause();
tl.play();
tl.reverse();
tl.seek(2);        // Go to 2 seconds
 tl.progress(0.5);  // Halfway
 tl.timeScale(2);   // 2x speed
```

### 1.4 Stagger Patterns

```typescript
// Basic stagger
gsap.to('.item', {
  y: 0,
  opacity: 1,
  stagger: 0.1,
});

// Object stagger config
gsap.to('.item', {
  y: 0,
  opacity: 1,
  stagger: {
    each: 0.1,           // Time between each
    from: 'start',       // 'start', 'end', 'center', 'edges', 'random', index
    grid: 'auto',        // For grid-based staggers
    axis: 'y',           // Stagger along axis
    amount: 1,           // Total time for all staggers (alternative to each)
  },
});

// Grid stagger (cards layout)
gsap.to('.card', {
  scale: 1,
  opacity: 1,
  stagger: {
    grid: [3, 4],        // 3 rows, 4 columns
    from: 'center',
    amount: 0.5,
  },
});
```

---

## MODULE 2: ScrollTrigger

### 2.1 Basic ScrollTrigger

```typescript
import { gsap, ScrollTrigger } from '@/lib/gsap';

// Fade in on scroll
gsap.to('.element', {
  scrollTrigger: {
    trigger: '.element',
    start: 'top 80%',      // When top of element hits 80% of viewport
    end: 'top 20%',        // When top of element hits 20% of viewport
    scrub: true,           // Animation tied to scroll position
    markers: true,         // Debug markers (remove in production)
    toggleActions: 'play none none reverse',
    // onEnter, onLeave, onEnterBack, onLeaveBack
    // Values: play, pause, resume, reverse, restart, reset, complete, none
  },
  y: 0,
  opacity: 1,
  duration: 1,
});
```

### 2.2 ScrollTrigger Configurations

```typescript
// Pin section (sticky scroll)
ScrollTrigger.create({
  trigger: '.section',
  start: 'top top',
  end: '+=500',           // Pin for 500px of scroll
  pin: true,
  pinSpacing: true,       // Add spacer for pinned element
});

// Scrub animation (scroll-driven)
gsap.to('.element', {
  x: 500,
  scrollTrigger: {
    trigger: '.container',
    start: 'top center',
    end: 'bottom center',
    scrub: 1,             // 1 second smoothing (0 for direct)
  },
});

// Batch animation (group elements)
ScrollTrigger.batch('.card', {
  onEnter: (elements) => {
    gsap.from(elements, {
      y: 50,
      opacity: 0,
      stagger: 0.1,
    });
  },
  start: 'top 85%',
});

// Refresh on resize
ScrollTrigger.addEventListener('refreshInit', () => {
  // Code to run before refresh
});

// Kill on cleanup
const trigger = ScrollTrigger.create({...});
trigger.kill();
```

### 2.3 Parallax Patterns

```typescript
// Simple parallax
gsap.to('.parallax-bg', {
  yPercent: 50,
  ease: 'none',
  scrollTrigger: {
    trigger: '.section',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
  },
});

// Multi-layer parallax
const layers = [
  { selector: '.layer-1', speed: 0.2 },
  { selector: '.layer-2', speed: 0.5 },
  { selector: '.layer-3', speed: 0.8 },
];

layers.forEach(({ selector, speed }) => {
  gsap.to(selector, {
    y: () => window.innerHeight * speed,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });
});

// Horizontal scroll section
const container = document.querySelector('.horizontal-section');
const scrollWidth = container.scrollWidth - window.innerWidth;

gsap.to(container, {
  x: -scrollWidth,
  ease: 'none',
  scrollTrigger: {
    trigger: container,
    start: 'top top',
    end: () => `+=${scrollWidth}`,
    pin: true,
    scrub: 1,
    invalidateOnRefresh: true,
  },
});
```

### 2.4 Scroll-Driven Text Effects

```typescript
// Character reveal
const split = new SplitText('.reveal-text', { type: 'chars' });

gsap.from(split.chars, {
  opacity: 0.1,
  stagger: 0.05,
  scrollTrigger: {
    trigger: '.reveal-text',
    start: 'top 80%',
    end: 'top 20%',
    scrub: true,
  },
});

// Word highlight
const words = new SplitText('.highlight-text', { type: 'words' });

gsap.to(words.words, {
  color: '#000',
  stagger: 0.1,
  scrollTrigger: {
    trigger: '.highlight-text',
    start: 'top 60%',
    end: 'top 20%',
    scrub: true,
  },
});

// Line mask reveal
const lines = new SplitText('.line-reveal', { type: 'lines' });

gsap.from(lines.lines, {
  yPercent: 100,
  stagger: 0.1,
  scrollTrigger: {
    trigger: '.line-reveal',
    start: 'top 75%',
    toggleActions: 'play none none reverse',
  },
});
```

### 2.5 Progress Indicators

```typescript
// Reading progress bar
gsap.to('.progress-bar', {
  scaleX: 1,
  ease: 'none',
  scrollTrigger: {
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
  },
});

// Section progress
gsap.to('.section-indicator', {
  '--progress': 1,
  ease: 'none',
  scrollTrigger: {
    trigger: '.section',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
  },
});
```

---

## MODULE 3: React Integration

### 3.1 The useGSAP Hook

```tsx
// components/animated-section.tsx
'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';

export function AnimatedSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // This context automatically handles cleanup
    gsap.from('.animate-item', {
      y: 50,
      opacity: 0,
      stagger: 0.1,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
      },
    });
  }, { scope: containerRef }); // Scoped to container

  return (
    <div ref={containerRef}>
      <div className="animate-item">Item 1</div>
      <div className="animate-item">Item 2</div>
      <div className="animate-item">Item 3</div>
    </div>
  );
}
```

### 3.2 Timeline in React

```tsx
// components/hero.tsx
'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tlRef.current = tl;

    tl.from('.hero-title', { y: 100, opacity: 0, duration: 1 })
      .from('.hero-subtitle', { y: 50, opacity: 0 }, '-=0.6')
      .from('.hero-cta', { scale: 0.8, opacity: 0 }, '-=0.4');

    // Store timeline for external control
    return () => {
      tl.kill();
    };
  }, { scope: containerRef });

  const handleReplay = () => {
    tlRef.current?.restart();
  };

  return (
    <div ref={containerRef} className="hero">
      <h1 className="hero-title">Title</h1>
      <p className="hero-subtitle">Subtitle</p>
      <button className="hero-cta" onClick={handleReplay}>Replay</button>
    </div>
  );
}
```

### 3.3 ScrollTrigger in React

```tsx
// components/scroll-reveal.tsx
'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export function ScrollReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(ref.current, {
      y: 60,
      opacity: 0,
      duration: 1,
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  }, { scope: ref });

  return <div ref={ref}>{children}</div>;
}

// Horizontal scroll gallery
export function HorizontalGallery({ items }: { items: Item[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const scrollWidth = scrollRef.current!.scrollWidth - window.innerWidth;

    gsap.to(scrollRef.current, {
      x: -scrollWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: () => `+=${scrollWidth}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="h-screen overflow-hidden">
      <div ref={scrollRef} className="flex gap-8 h-full items-center">
        {items.map(item => (
          <div key={item.id} className="flex-shrink-0 w-[60vw] h-[80vh]">
            <GalleryCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3.4 Flip Plugin in React

```tsx
// components/layout-switcher.tsx
'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, Flip } from '@/lib/gsap';

export function LayoutSwitcher() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  useGSAP(() => {
    if (!containerRef.current) return;

    // Get initial state
    const state = Flip.getState('.card');

    // Apply new layout class
    containerRef.current.classList.toggle('grid-layout', layout === 'grid');
    containerRef.current.classList.toggle('list-layout', layout === 'list');

    // Animate from old state to new
    Flip.from(state, {
      duration: 0.6,
      ease: 'power3.inOut',
      stagger: 0.05,
      absolute: true,
      zIndex: 10,
    });
  }, { dependencies: [layout], scope: containerRef });

  return (
    <div>
      <button onClick={() => setLayout('grid')}>Grid</button>
      <button onClick={() => setLayout('list')}>List</button>
      <div ref={containerRef} className="grid-layout">
        {items.map(item => (
          <div key={item.id} className="card">{item.title}</div>
        ))}
      </div>
    </div>
  );
}
```

### 3.5 Cleanup Patterns

```tsx
// Proper cleanup is CRITICAL
'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export function SafeAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // useGSAP automatically creates a context that cleans up
    // But for manual triggers/timelines:

    const triggers: ScrollTrigger[] = [];

    const tween = gsap.to('.element', {
      x: 100,
      scrollTrigger: {
        trigger: '.element',
        start: 'top center',
      },
    });

    if (tween.scrollTrigger) {
      triggers.push(tween.scrollTrigger);
    }

    // Return cleanup function
    return () => {
      triggers.forEach(t => t.kill());
    };
  }, { scope: containerRef });

  return <div ref={containerRef}>...</div>;
}
```

---

## MODULE 4: Advanced Patterns

### 4.1 MorphSVG

```typescript
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';

gsap.to('#shape1', {
  morphSVG: '#shape2',
  duration: 1,
  ease: 'power2.inOut',
});

// Morph to specific path data
gsap.to('#shape1', {
  morphSVG: { shape: '#shape2', shapeIndex: 'auto' },
  duration: 1,
});
```

### 4.2 DrawSVG

```typescript
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

// Draw line animation
gsap.from('.line-path', {
  drawSVG: '0%',           // Start from nothing
  duration: 2,
  ease: 'power2.out',
});

// Draw from center
gsap.from('.line-path', {
  drawSVG: '50% 50%',      // Start from center
  duration: 2,
});
```

### 4.3 Physics2D

```typescript
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';

// Particle explosion
gsap.to('.particle', {
  physics2D: {
    velocity: 300,
    angle: 'random(0, 360)',
    gravity: 500,
  },
  duration: 2,
});
```

### 4.4 MotionPath

```typescript
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

// Animate along SVG path
gsap.to('.rocket', {
  motionPath: {
    path: '#orbit-path',
    align: '#orbit-path',
    alignOrigin: [0.5, 0.5],
    autoRotate: true,
  },
  duration: 5,
  ease: 'none',
  repeat: -1,
});
```

---

## MODULE 5: Performance

### 5.1 The Performance Rules

```typescript
// 1. Use transform and opacity only
gsap.to('.element', {
  x: 100,        // ✅ GPU accelerated
  opacity: 0.5,  // ✅ GPU accelerated
  // left: 100,  // ❌ Layout thrashing
  // width: 200, // ❌ Layout thrashing
});

// 2. Batch DOM reads/writes
gsap.to('.element', {
  x: 100,
  onUpdate: function() {
    // Avoid reading DOM here
    // const rect = element.getBoundingClientRect(); // ❌
  },
});

// 3. Use will-change sparingly
// Add before animation, remove after
element.style.willChange = 'transform';
gsap.to(element, {
  x: 100,
  onComplete: () => {
    element.style.willChange = 'auto';
  },
});

// 4. Avoid animating blur on scroll
gsap.to('.element', {
  filter: 'blur(10px)',  // ❌ Expensive on scroll
  scrollTrigger: { scrub: true },
});

// Instead, animate opacity of blurred duplicate
gsap.to('.blurred-duplicate', {
  opacity: 1,  // ✅ Cheap
  scrollTrigger: { scrub: true },
});

// 5. Use lazy rendering for off-screen
ScrollTrigger.create({
  trigger: '.section',
  start: 'top bottom',
  onEnter: () => gsap.to('.element', { opacity: 1 }),
  once: true,
});

// 6. Debounce resize handlers
let resizeTimer: NodeJS.Timeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 250);
});
```

### 5.2 Reduced Motion

```typescript
// Respect user preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Instant state changes
  gsap.set('.element', { opacity: 1, y: 0 });
} else {
  // Full animation
  gsap.from('.element', { opacity: 0, y: 50, duration: 1 });
}

// Or use conditional config
const animationConfig = prefersReducedMotion
  ? { duration: 0 }
  : { duration: 1, ease: 'power2.out' };

gsap.to('.element', { x: 100, ...animationConfig });
```

---

## MODULE 6: Common Effects Library

### 6.1 Smooth Scroll

```typescript
// Lenis + GSAP integration
import Lenis from '@studio-freight/lenis';

const lenis = new Lenis({
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);
```

### 6.2 Magnetic Button

```typescript
function magneticButton(element: HTMLElement) {
  element.addEventListener('mousemove', (e) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(element, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.3,
      ease: 'power2.out',
    });
  });

  element.addEventListener('mouseleave', () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)',
    });
  });
}
```

### 6.3 Text Scramble

```typescript
function scrambleText(element: HTMLElement, finalText: string) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let iteration = 0;

  const interval = setInterval(() => {
    element.innerText = finalText
      .split('')
      .map((char, index) => {
        if (index < iteration) return finalText[index];
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join('');

    if (iteration >= finalText.length) clearInterval(interval);
    iteration += 1 / 3;
  }, 30);
}
```

### 6.4 Image Reveal

```typescript
function imageReveal(image: HTMLElement, direction: 'up' | 'down' | 'left' | 'right' = 'up') {
  const mask = document.createElement('div');
  mask.style.position = 'absolute';
  mask.style.inset = '0';
  mask.style.background = 'currentColor';
  image.parentElement!.style.position = 'relative';
  image.parentElement!.appendChild(mask);

  const axis = direction === 'up' || direction === 'down' ? 'y' : 'x';
  const sign = direction === 'up' || direction === 'left' ? -1 : 1;

  const tl = gsap.timeline();
  tl.set(image, { [axis]: `${sign * 100}%`, scale: 1.2 })
    .to(mask, { [axis]: `${sign * 100}%`, duration: 1, ease: 'power3.inOut' })
    .to(image, { [axis]: '0%', duration: 1, ease: 'power3.inOut' }, '<')
    .to(image, { scale: 1, duration: 1.5, ease: 'power2.out' }, '<');

  return tl;
}
```

### 6.5 Cursor Follower

```typescript
function cursorFollower(cursor: HTMLElement) {
  gsap.set(cursor, { xPercent: -50, yPercent: -50 });

  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const mouse = { x: pos.x, y: pos.y };
  const speed = 0.1;

  const xSet = gsap.quickSetter(cursor, 'x', 'px');
  const ySet = gsap.quickSetter(cursor, 'y', 'px');

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  gsap.ticker.add(() => {
    pos.x += (mouse.x - pos.x) * speed;
    pos.y += (mouse.y - pos.y) * speed;
    xSet(pos.x);
    ySet(pos.y);
  });
}
```

---

## MODULE 7: Integration

### 7.1 With UI/UX Pro Max

| This Skill Adds | Pro Max Adds |
|-----------------|--------------|
| GSAP-specific patterns | CSS animation presets |
| ScrollTrigger configs | Design tokens |
| Timeline orchestration | Component library |
| React integration | Industry heuristics |

**Usage:** Use Pro Max for design tokens and base components. Use this skill for complex scroll animations, page transitions, and interactive effects.

### 7.2 With Remotion

GSAP can drive Remotion animations using `useCurrentFrame()`:

```tsx
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { gsap } from 'gsap';

export function GSAPRemotion() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    gsap.set(ref.current, { x: 0 });
    gsap.to(ref.current, {
      x: 500,
      duration: 2,
      ease: 'power2.out',
    });

    // Seek to current frame
    gsap.globalTimeline.time(frame / fps);
  }, [frame, fps]);

  return <div ref={ref}>Animated</div>;
}
```

### 7.3 Shared Pattern Reference

These patterns appear in multiple skills:

| Pattern | Primary Source | Also In |
|---------|-------------|---------|
| useGSAP hook | This skill | UI/UX Pro Max 4.6 |
| ScrollTrigger config | This skill | UI/UX Pro Max 4.6 |
| Lenis smooth scroll | This skill | UI/UX Pro Max 4.6 |
| prefers-reduced-motion | Vercel Web Design Guidelines | ALL SKILLS |

**Cross-reference rule:** When duplicating a pattern, add a forward reference to the primary source. Do not duplicate implementation details.

---

## MODULE 8: Remotion Video Templates

### 8.1 GSAP + Remotion Integration

```tsx
// remotion/gsap-sequence.tsx
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { gsap } from 'gsap';

export const GSAPSequence: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Reset and animate based on current frame
    gsap.set(ref.current, { scale: 1, opacity: 1 });
    
    // Calculate progress (0 to 1)
    const progress = frame / (duration * fps);
    
    gsap.to(ref.current, {
      scale: 1 + progress,
      opacity: 1 - progress * 0.5,
      duration: duration,
      ease: 'power2.out',
    });

    // Seek GSAP timeline to current frame time
    gsap.globalTimeline.time(frame / fps);
  }, [frame, fps, duration]);

  return (
    <AbsoluteFill>
      <div ref={ref} style={{ width: '100%', height: '100%' }}>
        Animated Content
      </div>
    </AbsoluteFill>
  );
};
```

### 8.2 Template: Kinetic Text

```tsx
// remotion/templates/kinetic-text.tsx
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

export const KineticText: React.FC<{ text: string }> = ({ text }) => {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  useEffect(() => {
    if (!ref.current) return;
    
    const split = new SplitText(ref.current, { type: 'chars' });
    const time = frame / fps;

    gsap.set(split.chars, { opacity: 0, y: 50 });
    gsap.to(split.chars, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.05,
      ease: 'back.out(1.7)',
    });

    gsap.globalTimeline.time(time);
  }, [frame, fps, text]);

  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div ref={ref} style={{ fontSize: '80px', fontWeight: 'bold' }}>
        {text}
      </div>
    </AbsoluteFill>
  );
};
```

### 8.3 Template: Logo Reveal

```tsx
// remotion/templates/logo-reveal.tsx
import { useCurrentFrame, AbsoluteFill } from 'remotion';
import { gsap } from 'gsap';

export const LogoReveal: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const frame = useCurrentFrame();

  useEffect(() => {
    if (!containerRef.current || !logoRef.current) return;

    const tl = gsap.timeline();
    
    // Mask reveal
    tl.fromTo(logoRef.current,
      { clipPath: 'circle(0% at 50% 50%)' },
      { clipPath: 'circle(70% at 50% 50%)', duration: 1.5, ease: 'power3.inOut' }
    )
    .fromTo(logoRef.current,
      { filter: 'blur(20px)' },
      { filter: 'blur(0px)', duration: 1, ease: 'power2.out' },
      '<'
    )
    .to(logoRef.current,
      { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1, ease: 'power1.inOut' },
      '>'
    );

    gsap.globalTimeline.time(frame / 30); // Assuming 30fps
  }, [frame]);

  return (
    <AbsoluteFill ref={containerRef} style={{ background: '#000' }}>
      <div ref={logoRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Your logo path here */}
          <circle cx="100" cy="100" r="80" fill="#fff" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
```

### 8.4 Template: Cinematic Parallax

```tsx
// remotion/templates/cinematic-parallax.tsx
import { useCurrentFrame, AbsoluteFill } from 'remotion';
import { gsap } from 'gsap';

export const CinematicParallax: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
  const layersRef = useRef<HTMLDivElement>(null);
  const frame = useCurrentFrame();

  useEffect(() => {
    if (!layersRef.current) return;

    const layers = layersRef.current.querySelectorAll('.parallax-layer');
    
    layers.forEach((layer, i) => {
      const speed = [0.2, 0.5, 0.8][i] || 0.5;
      const y = frame * speed;
      gsap.set(layer, { y: -y });
    });

    const tl = gsap.timeline();
    tl.fromTo(layersRef.current.querySelector('.bg'),
      { scale: 1.3 },
      { scale: 1, duration: 5, ease: 'power1.out' }
    )
    .fromTo(layersRef.current.querySelector('.content'),
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.5, ease: 'power3.out' },
      '-=3'
    );

    gsap.globalTimeline.time(frame / 30);
  }, [frame]);

  return (
    <AbsoluteFill ref={layersRef}>
      <div className="parallax-layer bg" style={{ width: '100%', height: '100%', position: 'absolute' }}>
        <img src={imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div className="parallax-layer content" style={{ width: '100%', height: '100%', position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '80px', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          Cinematic Title
        </h1>
      </div>
    </AbsoluteFill>
  );
};
```

### 8.5 GSAP Cinematic Effects (New)

#### Cinematic Reveal

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

#### Cinematic Parallax Depth

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

#### Cinematic Text Reveal

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

*GSAP Animations Skill v1.1 — Motion that performs. Scroll that tells stories.*
