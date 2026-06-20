'use client';

/**
 * MagneticButton — GSAP-powered magnetic hover effect.
 * Source: gsap-animations SKILL.md §6.2 (Magnetic Button)
 *
 * The button drifts toward the cursor on hover, then springs back on leave.
 * Respects prefers-reduced-motion (no magnetic drift when reduced).
 * Preserves the Ink & Vermillion editorial palette.
 */

import { useRef, type ReactNode, type MouseEvent } from 'react';
import { gsap, useGSAP } from '@/lib/gsap-init';
import { usePrefersReducedMotion, useIsClient } from '@/lib/gsap-hybrid';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  /** Magnetic pull strength (0–1). 0.3 = 30% of cursor offset. */
  strength?: number;
  /** Hover spring config. */
  springConfig?: { ease: string; duration: number };
  onClick?: () => void;
  href?: string;
  'aria-label'?: string;
}

export function MagneticButton({
  children,
  className = '',
  strength = 0.3,
  springConfig = { ease: 'elastic.out(1, 0.3)', duration: 0.5 },
  onClick,
  href,
  'aria-label': ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const isClient = useIsClient();
  const reduced = usePrefersReducedMotion();
  const active = isClient && !reduced;

  useGSAP(
    () => {
      // No setup needed — handlers attached via React events
    },
    { scope: ref },
  );

  const handleMove = (e: MouseEvent<HTMLElement>) => {
    if (!active || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(ref.current, {
      x: x * strength,
      y: y * strength,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleLeave = () => {
    if (!active || !ref.current) return;
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      ...springConfig,
    });
  };

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={className}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type="button"
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
