'use client';

/**
 * SmoothScrollProvider — Lenis smooth scroll integrated with GSAP ScrollTrigger.
 * Source: gsap-animations SKILL.md §6.1 (Smooth Scroll) + ui-ux-pro-max-v7 §4.6
 *
 * Lenis intercepts wheel events and applies easing for buttery scroll.
 * ScrollTrigger.update is bound to Lenis's scroll event so they stay in sync.
 *
 * Respects prefers-reduced-motion (Lenis is not initialized when reduced).
 * Desktop-leaning but works on touch (Lenis handles touch internally).
 */

import { useEffect, type ReactNode } from 'react';
import { useIsClient, usePrefersReducedMotion, loadGsap } from '@/lib/gsap-hybrid';

interface SmoothScrollProviderProps {
  children: ReactNode;
  /** Lenis duration (default 1.2s). */
  duration?: number;
}

export function SmoothScrollProvider({
  children,
  duration = 1.2,
}: SmoothScrollProviderProps) {
  const isClient = useIsClient();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!isClient || reduced) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const [lenisMod, gsapMod] = await Promise.all([
          import('lenis'),
          loadGsap(),
        ]);
        if (cancelled) return;
        const Lenis = lenisMod.default;
        const { gsap } = gsapMod;
        const { ScrollTrigger } = await import('@/lib/gsap-init');
        if (cancelled) return;

        const lenis = new Lenis({
          duration,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });

        lenis.on('scroll', ScrollTrigger.update);
        const tickerFn = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tickerFn);
        gsap.ticker.lagSmoothing(0);

        cleanup = () => {
          gsap.ticker.remove(tickerFn);
          lenis.destroy();
        };
      } catch (err) {
        console.warn('[SmoothScrollProvider] init failed:', err);
      }
    })();

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, [isClient, reduced, duration]);

  return <>{children}</>;
}
