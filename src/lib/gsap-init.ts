'use client';

/**
 * GSAP Centralized Initialization Module
 * ─────────────────────────────────────────
 * Single source of truth for all GSAP plugin registration.
 * Import from this file everywhere — never register plugins inline.
 *
 * Rules:
 * - gsap.registerPlugin() is idempotent — safe at module scope
 * - All GSAP-using components MUST be 'use client'
 * - Never animate the same CSS property on the same element with both GSAP and Framer Motion
 * - Use `useGSAP()` from @gsap/react for automatic cleanup
 * - Call `revert()` not `kill()` for cleanup
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { SplitText } from 'gsap/SplitText';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { useGSAP } from '@gsap/react';

// Register all plugins once at module scope (idempotent)
gsap.registerPlugin(
  ScrollTrigger,
  DrawSVGPlugin,
  SplitText,
  MotionPathPlugin,
  useGSAP,
);

export { gsap, ScrollTrigger, DrawSVGPlugin, SplitText, MotionPathPlugin, useGSAP };

// ─── GSAP + Framer Motion Coexistence Rules ───
//
// | Animation Type              | Use GSAP | Use Framer Motion |
// |-----------------------------|----------|-------------------|
// | Layout animations           | ❌       | ✅ layout prop     |
// | Exit animations             | ❌       | ✅ AnimatePresence |
// | Hover/tap gestures          | ⚠️       | ✅ whileHover/Tap  |
// | Timeline orchestration      | ✅        | ❌                |
// | ScrollTrigger + pinning     | ✅        | ❌                |
// | SVG path drawing            | ✅        | ❌                |
// | Text splitting/animation    | ✅        | ❌                |
// | Path-following animation    | ✅        | ❌                |
// | Scroll-driven narratives    | ✅        | ❌                |
// | Simple mount/unmount fades  | ⚠️       | ✅                 |

// ─── Shared GSAP Configuration ───

/** Default ScrollTrigger viewport config */
export const SCROLL_DEFAULTS = {
  start: 'top 85%',
  end: 'bottom 20%',
  toggleActions: 'play none none reverse',
} as const;

/** Pinned section ScrollTrigger config */
export const PINNED_SCROLL = {
  start: 'top top',
  end: '+=3000',
  pin: true,
  scrub: 1,
  anticipatePin: 1,
} as const;

/** Easing presets for infographic-motion */
export const infoEases = {
  /** Smooth deceleration — best for elements entering from off-screen */
  enter: 'power3.out',
  /** Smooth acceleration — best for elements exiting */
  exit: 'power3.in',
  /** Slight overshoot — best for emphasis moments */
  pop: 'back.out(1.7)',
  /** Elastic settle — best for playful interactions */
  elastic: 'elastic.out(1, 0.5)',
  /** Linear — best for scrub-based scroll animations */
  scrub: 'none',
  /** Bounce — best for data point highlights */
  bounce: 'bounce.out',
} as const;

/** Spring configs that map to Framer Motion springs for visual consistency */
export const gsapSprings = {
  snappy: { ease: 'power4.out', duration: 0.4 },
  gentle: { ease: 'power2.out', duration: 0.8 },
  bouncy: { ease: 'back.out(1.7)', duration: 0.6 },
  editorial: { ease: 'power3.out', duration: 0.5 },
} as const;

/** Stagger configs for infographic sections */
export const staggerConfigs = {
  /** Fast stagger for dense grids */
  grid: { each: 0.05, from: 'center' },
  /** Editorial stagger for sequential reveals */
  editorial: { each: 0.12, from: 'start' },
  /** Wave stagger for proxy flow diagrams */
  wave: { each: 0.08, from: 'start' },
  /** Radial stagger for skill trees */
  radial: { each: 0.06, from: 'center' },
} as const;
