'use client';

/**
 * TextScramble — GSAP-powered text scramble effect.
 * Source: gsap-animations SKILL.md §6.3 (Text Scramble)
 *
 * On trigger (hover, mount, or programmatic), the text scrambles through
 * random characters and resolves to the final text letter by letter.
 * Respects prefers-reduced-motion (instant reveal when reduced).
 */

import { useRef, useEffect, type ReactNode } from 'react';
import { useIsClient, usePrefersReducedMotion } from '@/lib/gsap-hybrid';

interface TextScrambleProps {
  /** The final text to display. */
  text: string;
  /** Trigger: 'mount' = animate once on mount; 'hover' = animate on hover. */
  trigger?: 'mount' | 'hover';
  /** Scramble speed (ms per frame). */
  speed?: number;
  /** Characters to use for scrambling. */
  chars?: string;
  className?: string;
  children?: ReactNode;
}

export function TextScramble({
  text,
  trigger = 'mount',
  speed = 30,
  chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  className = '',
  children,
}: TextScrambleProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isClient = useIsClient();
  const reduced = usePrefersReducedMotion();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runScramble = () => {
    if (!ref.current) return;
    if (reduced || !isClient) {
      ref.current.textContent = text;
      return;
    }
    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!ref.current) return;
      ref.current.textContent = text
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';
          if (index < iteration) return text[index];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
      if (iteration >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      iteration += 1 / 3;
    }, speed);
  };

  useEffect(() => {
    if (trigger === 'mount') runScramble();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, trigger, isClient, reduced]);

  if (trigger === 'hover') {
    return (
      <span
        ref={ref}
        className={className}
        onMouseEnter={runScramble}
      >
        {children ?? text}
      </span>
    );
  }
  return <span ref={ref} className={className}>{text}</span>;
}
