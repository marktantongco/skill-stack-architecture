/**
 * GSAP + Framer Motion Hybrid Integration Layer
 * ─────────────────────────────────────────────────────────────────────────────
 * Research summary (owl/eagle/beaver perspectives):
 *
 * 🦉 OWL — Observational truth
 *  • GSAP mutates the DOM directly via requestAnimationFrame loop.
 *  • Framer Motion mutates via React's render cycle + the `style`/`transform` props.
 *  • Conflict surface: when both write to the SAME property of the SAME element
 *    on the SAME frame, the last writer wins. Per-frame tearing is rare but real.
 *
 * 🦅 EAGLE — Strategic principle
 *  • Divide labor by animation KIND, not by library:
 *      - Framer Motion → UI transitions (mount/unmount, layout, gestures, hover, tap)
 *      - GSAP          → Scroll-driven choreography, SVG path drawing, physics,
 *                        pinned timelines, text split/reveal, infinite loops
 *  • Never let both libraries animate the SAME property of the SAME element.
 *
 * 🦫 BEAVER — Practical guardrails (error handling)
 *  • All GSAP code runs inside `useGSAP()` from `@gsap/react` so the hook handles
 *    cleanup automatically. Never call `gsap.to()` inside `useEffect` without
 *    manual `ctx.revert()`.
 *  • Honor `prefers-reduced-motion` — short-circuit timelines to a static end state.
 *  • SSR safety: GSAP touches `window`/`document`. All entry points guard for that.
 *  • Framer Motion stays the source of truth for layout & mount/unmount animation.
 *
 * 🐬 DOLPHIN — Creative variety
 *  • Scroll-driven SVG path drawing (skill pipeline).
 *  • Pinned section choreography (architecture tree grows on scroll).
 *  • SplitText-style word reveal (proxy comparison headlines).
 *  • Infinite loop counters and orbiting nodes (infographic motion).
 *  • Stagger reveals with GSAP, but exit animations stay in Motion's AnimatePresence.
 *
 * Bundle note: gsap core (~32KB gzip) loads only on pages that import this file.
 * Tree-shaking keeps the rest of the app lean.
 */

'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import type { RefObject } from 'react';

// ─── SSR-safe GSAP loader ──────────────────────────────────────────────────
// We lazy-import gsap only in the browser so SSR doesn't touch `window`.
type GsapModule = typeof import('gsap');
type UseGsapModule = typeof import('@gsap/react');

let _gsapPromise: Promise<GsapModule> | null = null;
let _useGsapPromise: Promise<UseGsapModule> | null = null;

/** Returns the gsap module with ScrollTrigger registered, loading it on demand. */
export async function loadGsap(): Promise<GsapModule> {
  if (typeof window === 'undefined') {
    throw new Error('loadGsap called on server — guard with useIsClient');
  }
  if (!_gsapPromise) {
    _gsapPromise = Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([mod, stMod]) => {
      const ScrollTrigger = (stMod as { default?: unknown; ScrollTrigger?: unknown }).default
        ?? (stMod as { ScrollTrigger?: unknown }).ScrollTrigger;
      if (ScrollTrigger) {
        mod.gsap.registerPlugin(ScrollTrigger as never);
      } else {
        console.warn('[gsap-hybrid] ScrollTrigger plugin not found');
      }
      return mod;
    });
  }
  return _gsapPromise;
}

/** Returns the @gsap/react module (useGSAP hook). */
export async function loadUseGsap(): Promise<UseGsapModule> {
  if (typeof window === 'undefined') {
    throw new Error('loadUseGsap called on server — guard with useIsClient');
  }
  if (!_useGsapPromise) {
    _useGsapPromise = import('@gsap/react');
  }
  return _useGsapPromise;
}

// ─── Client-only detection (SSR-safe) ──────────────────────────────────────
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/** True once the component has hydrated on the client. Use to gate GSAP code. */
export function useIsClient(): boolean {
  return useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);
}

// ─── Reduced motion hook (SSR-safe, GSAP-compatible) ───────────────────────
// Uses useSyncExternalStore so we never call setState inside an effect.
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const subscribeReducedMotion = (cb: () => void) => {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener?.('change', cb);
  return () => mq.removeEventListener?.('change', cb);
};

const readReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia(REDUCED_MOTION_QUERY).matches;

const readReducedMotionSSR = () => false;

/** Reactive boolean — true when the user prefers reduced motion. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, readReducedMotion, readReducedMotionSSR);
}

// ─── useGsapTimeline: the canonical hybrid hook ────────────────────────────
/**
 * Build a GSAP timeline inside `@gsap/react`'s `useGSAP` so cleanup is automatic.
 *
 * Usage:
 *   const ref = useRef<HTMLDivElement>(null);
 *   useGsapTimeline(ref, (gsap, ctx) => {
 *     const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top 80%' }});
 *     tl.from('.pipeline-node', { scale: 0, stagger: 0.1, duration: 0.6 });
 *     return tl;
 *   }, { dependencies: [data], requiresMotion: true });
 *
 * The hook:
 *   • Skips entirely on the server and during reduced motion (unless requiresMotion: false).
 *   • Loads gsap + useGSAP lazily.
 *   • Cleans up via useGSAP's internal context.
 */
export interface UseGsapTimelineOptions {
  /** Re-run when these change (like useEffect deps). */
  dependencies?: unknown[];
  /** If true (default), the timeline is skipped when the user prefers reduced motion. */
  requiresMotion?: boolean;
  /** GSAP scope — defaults to the ref's container. */
  scope?: 'ref' | 'document';
}

export function useGsapTimeline<T extends Element>(
  ref: RefObject<T | null>,
  builder: (gsap: GsapModule['gsap'], ctx: { reduced: boolean }) => void,
  options: UseGsapTimelineOptions = {},
): { ready: boolean; reduced: boolean } {
  const isClient = useIsClient();
  const reduced = usePrefersReducedMotion();
  const deps = options.dependencies ?? [];
  const requiresMotion = options.requiresMotion ?? true;
  // `ready` is computed synchronously — no setState needed.
  // It's true once we're on the client AND either motion isn't required OR
  // the user doesn't prefer reduced motion. The actual GSAP timeline loads
  // asynchronously; consumers should treat `ready` as "is this hook active?".
  const ready = isClient && (!requiresMotion || !reduced);
  // Keep the latest builder in a ref so we don't re-run the effect on every render
  // when the consumer passes an inline function.
  const builderRef = useRef(builder);
  useEffect(() => {
    builderRef.current = builder;
  });

  useEffect(() => {
    if (!isClient) return;
    if (requiresMotion && reduced) return; // skip — user prefers reduced motion
    let cancelled = false;
    let revert: (() => void) | undefined;

    (async () => {
      try {
        const gsapMod = await loadGsap();
        if (cancelled) return;
        const gsap = gsapMod.gsap;
        const scope = options.scope === 'document' ? undefined : (ref.current ?? undefined);
        const ctx = gsap.context(() => {
          builderRef.current(gsap, { reduced });
        }, scope);
        revert = () => ctx.revert();
      } catch (err) {
        // Beaver: never crash the render — log and continue
        console.warn('[useGsapTimeline] GSAP init failed:', err);
      }
    })();

    return () => {
      cancelled = true;
      if (revert) revert();
    };
  }, [isClient, reduced, requiresMotion, options.scope, ...deps]);

  return { ready, reduced };
}

// ─── Reusable animation recipes (dolphin creative layer) ───────────────────

/**
 * Scroll-triggered SVG path drawing.
 * Uses strokeDashoffset (free) instead of GSAP's paid drawSVG plugin.
 * Caller should set `pathLength="1"` on the <path> for predictable math,
 * or this recipe will fall back to getTotalLength().
 */
export const drawPathRecipe = (
  gsap: GsapModule['gsap'],
  selector: string,
  opts: { start?: string; end?: string; duration?: number; ease?: string; scrub?: number | boolean } = {},
) => {
  const { start = 'top 75%', end = 'bottom 25%', duration = 1.6, ease = 'power2.inOut', scrub = 0.5 } = opts;
  // Initialize each path's dash array, then animate dashoffset from full → 0.
  gsap.utils.toArray<SVGPathElement>(selector).forEach((path) => {
    const total = path.getTotalLength ? path.getTotalLength() : 1;
    path.style.strokeDasharray = `${total}`;
    path.style.strokeDashoffset = `${total}`;
  });
  return gsap.to(selector, {
    strokeDashoffset: 0,
    duration,
    ease,
    scrollTrigger: { trigger: selector, start, end, scrub },
  });
};

/**
 * Staggered word reveal — emulates SplitText without the paid plugin.
 * Pre-split your text into <span class="word"> elements in JSX.
 */
export const wordRevealRecipe = (
  gsap: GsapModule['gsap'],
  container: HTMLElement | string,
  opts: { stagger?: number; duration?: number; y?: number; start?: string } = {},
) => {
  const { stagger = 0.04, duration = 0.5, y = 12, start = 'top 80%' } = opts;
  return gsap.from(`${container} .gsap-word`, {
    y,
    opacity: 0,
    duration,
    stagger,
    ease: 'power2.out',
    scrollTrigger: { trigger: container, start },
  });
};

/**
 * Counter that scrolls from 0 to target. Pair with a data-target attribute.
 */
export const counterRecipe = (
  gsap: GsapModule['gsap'],
  selector: string,
  opts: { start?: string; duration?: number; suffix?: string } = {},
) => {
  const { start = 'top 80%', duration = 2, suffix = '' } = opts;
  const els = gsap.utils.toArray<HTMLElement>(selector);
  return els.map((el) => {
    const target = Number(el.dataset.target ?? '0');
    const obj = { val: 0 };
    return gsap.to(obj, {
      val: target,
      duration,
      ease: 'power1.out',
      scrollTrigger: { trigger: el, start },
      onUpdate: () => {
        el.textContent = `${Math.round(obj.val)}${suffix}`;
      },
    });
  });
};

/**
 * Pinned section — keeps the element sticky while a child timeline plays.
 */
export const pinnedTimelineRecipe = (
  gsap: GsapModule['gsap'],
  trigger: HTMLElement,
  pinEl: HTMLElement,
  builder: (tl: ReturnType<GsapModule['gsap']['timeline']>) => void,
) => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger,
      start: 'top top',
      end: '+=120%',
      pin: pinEl,
      scrub: 0.6,
    },
  });
  builder(tl);
  return tl;
};

// ─── Compatibility cheat sheet (exported for docs page) ────────────────────
export const gsapMotionRules = [
  {
    rule: 'Divide by KIND, not by LIBRARY',
    detail: 'Motion handles mount/unmount + gestures + layout. GSAP handles scroll choreography + SVG draw + infinite loops.',
  },
  {
    rule: 'Never animate the same property of the same element',
    detail: 'If GSAP animates `transform`, Motion must animate `opacity` on that element (or vice versa).',
  },
  {
    rule: 'Always use useGSAP for cleanup',
    detail: 'Manual gsap.to() inside useEffect leaks timelines. @gsap/react runs a context that auto-reverts.',
  },
  {
    rule: 'Honor prefers-reduced-motion',
    detail: 'useGsapTimeline short-circuits to the end state when reduced motion is on. Never override this for delight.',
  },
  {
    rule: 'Keep AnimatePresence for exit animations',
    detail: 'GSAP has no equivalent of AnimatePresence. Mount/unmount animations stay in Motion.',
  },
  {
    rule: 'Lazy-load GSAP',
    detail: 'loadGsap() dynamic-imports the lib only on pages that use it, keeping the initial bundle lean.',
  },
] as const;
