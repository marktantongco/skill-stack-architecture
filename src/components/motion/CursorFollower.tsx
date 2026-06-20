'use client';

/**
 * CursorFollower — GSAP-powered custom cursor follower.
 * Source: gsap-animations SKILL.md §6.5 (Cursor Follower)
 *
 * A small dot follows the cursor with smooth GSAP quickSetter interpolation.
 * Desktop-only (pointer: fine), respects prefers-reduced-motion.
 * Uses Ink & Vermillion accent color (#C23616 vermillion) — subtle on cream.
 */

import { useEffect, useRef } from 'react';
import { loadGsap } from '@/lib/gsap-hybrid';
import { useIsClient, usePrefersReducedMotion } from '@/lib/gsap-hybrid';

export function CursorFollower() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const isClient = useIsClient();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!isClient || reduced) return;
    // Skip on touch devices
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (!cursorRef.current) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const { gsap } = await loadGsap();
        if (cancelled || !cursorRef.current) return;
        const cursor = cursorRef.current;

        gsap.set(cursor, { xPercent: -50, yPercent: -50, opacity: 0 });

        const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const mouse = { x: pos.x, y: pos.y };
        const speed = 0.12;

        const xSet = gsap.quickSetter(cursor, 'x', 'px');
        const ySet = gsap.quickSetter(cursor, 'y', 'px');

        const onMouseMove = (e: MouseEvent) => {
          mouse.x = e.x;
          mouse.y = e.y;
          gsap.to(cursor, { opacity: 0.7, duration: 0.3 });
        };
        const onMouseLeave = () => {
          gsap.to(cursor, { opacity: 0, duration: 0.3 });
        };

        const tickerFn = () => {
          pos.x += (mouse.x - pos.x) * speed;
          pos.y += (mouse.y - pos.y) * speed;
          xSet(pos.x);
          ySet(pos.y);
        };

        window.addEventListener('mousemove', onMouseMove);
        document.body.addEventListener('mouseleave', onMouseLeave);
        gsap.ticker.add(tickerFn);

        cleanup = () => {
          window.removeEventListener('mousemove', onMouseMove);
          document.body.removeEventListener('mouseleave', onMouseLeave);
          gsap.ticker.remove(tickerFn);
        };
      } catch (err) {
        console.warn('[CursorFollower] init failed:', err);
      }
    })();

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, [isClient, reduced]);

  if (!isClient || reduced) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: 'var(--primary)',
        pointerEvents: 'none',
        zIndex: 9999,
        mixBlendMode: 'multiply',
        willChange: 'transform, opacity',
        opacity: 0,
      }}
    />
  );
}
