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
 *
 * Phase 6 — Motion Redesign:
 * - Removed paid GSAP Club plugins (DrawSVGPlugin, SplitText, MotionPathPlugin)
 *   These plugins are not in the public npm `gsap` package and silently fail
 *   or crash production builds. Replaced with free equivalents:
 *     - DrawSVG  → strokeDashoffset technique (see drawPathRecipe in gsap-hybrid.ts)
 *     - SplitText → manual <span> splitting in JSX + wordRevealRecipe
 *     - MotionPath → CSS offset-path or GSAP timeline with x/y interpolation
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register free plugins once at module scope (idempotent)
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };

// ─── GSAP + Framer Motion Coexistence Rules ───
//
// | Animation Type              | Use GSAP | Use Framer Motion |
// |-----------------------------|----------|-------------------|
// | Layout animations           | ❌       | ✅ layout prop     |
// | Exit animations             | ❌       | ✅ AnimatePresence |
// | Hover/tap gestures          | ⚠️       | ✅ whileHover/Tap  |
// | Timeline orchestration      | ✅        | ❌                |
// | ScrollTrigger + pinning     | ✅        | ❌                |
// | SVG path drawing            | ✅ (free) | ❌                |
// | Text splitting/animation    | ✅ (free) | ❌                |
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

// ─── Free SVG path drawing utility (replaces DrawSVGPlugin) ───
/**
 * Animates strokeDashoffset from full length → 0 to "draw" an SVG path.
 * Drop-in replacement for the paid DrawSVG plugin.
 *
 * Usage:
 *   drawPath(gsap, '.info-svg-path', { scrollTrigger: {...} });
 */
export function drawPath(
  gsapInstance: typeof gsap,
  selector: string,
  options: {
    duration?: number;
    ease?: string;
    scrollTrigger?: object;
  } = {},
) {
  const { duration = 1.5, ease = 'power2.inOut', scrollTrigger } = options;
  const paths = gsapInstance.utils.toArray<SVGPathElement>(selector);
  paths.forEach((path) => {
    const total = path.getTotalLength ? path.getTotalLength() : 1;
    path.style.strokeDasharray = `${total}`;
    path.style.strokeDashoffset = `${total}`;
  });
  return gsapInstance.to(selector, {
    strokeDashoffset: 0,
    duration,
    ease,
    scrollTrigger,
  });
}

// ─── Free text splitting utility (replaces SplitText) ───
/**
 * Splits text content into per-character <span> elements for staggered animation.
 * Drop-in replacement for the paid SplitText plugin.
 *
 * Usage in JSX:
 *   <h1 ref={titleRef}>Title</h1>
 *   splitText(titleRef.current, 'chars');
 *   gsap.from(`${titleRef.current} .split-char`, { y: 30, stagger: 0.02, ... });
 */
export function splitText(
  element: HTMLElement | null,
  type: 'chars' | 'words' = 'chars',
): { chars: HTMLElement[]; words: HTMLElement[] } {
  if (!element) return { chars: [], words: [] };

  const text = element.textContent ?? '';
  element.textContent = '';
  element.setAttribute('aria-label', text);

  const chars: HTMLElement[] = [];
  const words: HTMLElement[] = [];

  const wordsArray = text.split(/(\s+)/);
  wordsArray.forEach((word) => {
    if (/^\s+$/.test(word)) {
      element.appendChild(document.createTextNode(word));
      return;
    }
    const wordSpan = document.createElement('span');
    wordSpan.className = 'split-word';
    wordSpan.style.display = 'inline-block';
    wordSpan.style.whiteSpace = 'nowrap';

    for (const char of word) {
      const charSpan = document.createElement('span');
      charSpan.className = 'split-char';
      charSpan.style.display = 'inline-block';
      charSpan.textContent = char;
      wordSpan.appendChild(charSpan);
      chars.push(charSpan);
    }
    element.appendChild(wordSpan);
    words.push(wordSpan);
  });

  return { chars, words };
}
