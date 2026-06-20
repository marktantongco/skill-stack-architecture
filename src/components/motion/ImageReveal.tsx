'use client';

/**
 * ImageReveal — GSAP-powered image reveal with mask.
 * Source: gsap-animations SKILL.md §6.4 (Image Reveal)
 *
 * Image slides up into view behind a mask, then the mask wipes away.
 * Respects prefers-reduced-motion (instant reveal when reduced).
 */

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@/lib/gsap-init';
import { gsap } from '@/lib/gsap-init';
import { useIsClient, usePrefersReducedMotion } from '@/lib/gsap-hybrid';

interface ImageRevealProps {
  children: ReactNode;
  className?: string;
  /** Reveal direction. */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Trigger start position. */
  start?: string;
}

export function ImageReveal({
  children,
  className = '',
  direction = 'up',
  start = 'top 80%',
}: ImageRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isClient = useIsClient();
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const image = containerRef.current.querySelector('.image-reveal-img');
      const mask = containerRef.current.querySelector('.image-reveal-mask');
      if (!image || !mask) return;

      if (reduced) {
        gsap.set(image, { x: 0, y: 0, scale: 1 });
        gsap.set(mask, { x: 0, y: 0, opacity: 0 });
        return;
      }

      const axis = direction === 'up' || direction === 'down' ? 'y' : 'x';
      const sign = direction === 'up' || direction === 'left' ? -1 : 1;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start,
          toggleActions: 'play none none reverse',
        },
      });

      tl.set(image, { [axis]: `${sign * 100}%`, scale: 1.2 })
        .to(mask, { [axis]: `${sign * 100}%`, duration: 1, ease: 'power3.inOut' })
        .to(image, { [axis]: '0%', duration: 1, ease: 'power3.inOut' }, '<')
        .to(image, { scale: 1, duration: 1.5, ease: 'power2.out' }, '<');
    },
    { scope: containerRef, dependencies: [reduced, direction, start] },
  );

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ position: 'relative' }}
    >
      <div className="image-reveal-img" style={{ willChange: 'transform' }}>
        {children}
      </div>
      <div
        className="image-reveal-mask"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--foreground)',
          pointerEvents: 'none',
          willChange: 'transform',
        }}
      />
    </div>
  );
}
