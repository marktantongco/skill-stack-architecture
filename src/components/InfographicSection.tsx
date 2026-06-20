'use client';

import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { gsap, useGSAP, ScrollTrigger, splitText, drawPath } from '@/lib/gsap-init';

// ─── Types ───
interface InfographicSectionProps {
  title: string;
  subtitle?: string;
  steps: {
    label: string;
    description: string;
    emoji: string;
    metric?: string;
    metricLabel?: string;
  }[];
  pathD?: string; // SVG path for the connecting line
}

/**
 * ScrollTrigger-driven infographic section.
 * GSAP handles: scroll-triggered timeline, SVG path drawing, text splitting
 * Framer Motion handles: mount/unmount, hover micro-interactions
 */
export default function InfographicSection({
  title,
  subtitle,
  steps,
  pathD,
}: InfographicSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Default SVG path: a gentle S-curve
  const defaultPath = pathD || 'M60,20 C60,80 240,80 240,140 C240,200 420,200 420,260 C420,320 600,320 600,380';

  useGSAP(() => {
    if (prefersReducedMotion) return;

    // Animate title with free splitText utility (replaces paid SplitText plugin)
    const titleEl = containerRef.current?.querySelector('.info-title') as HTMLElement | null;
    if (titleEl) {
      const { chars } = splitText(titleEl, 'chars');
      gsap.from(chars, {
        y: 30,
        opacity: 0,
        rotationX: -60,
        stagger: 0.02,
        duration: 0.5,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '.info-title',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    }

    // Draw the SVG connector path on scroll (free strokeDashoffset technique)
    drawPath(gsap, '.info-svg-path', {
      duration: 1.5,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 70%',
        end: 'bottom 30%',
        scrub: 1,
      },
    });

    // Animate step cards
    gsap.from('.info-step', {
      x: (i: number) => (i % 2 === 0 ? -40 : 40),
      opacity: 0,
      stagger: 0.15,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.info-steps-container',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });

    // Animate metrics counters
    gsap.from('.info-metric', {
      scale: 0,
      opacity: 0,
      stagger: 0.1,
      duration: 0.4,
      ease: 'back.out(2)',
      scrollTrigger: {
        trigger: '.info-steps-container',
        start: 'top 60%',
        toggleActions: 'play none none reverse',
      },
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="w-full">
      {/* Title */}
      <div className="mb-8">
        <h3 className="info-title font-serif text-2xl font-bold mb-1">{title}</h3>
        {subtitle && (
          <p className="font-mono text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Main content: SVG path + step cards */}
      <div className="relative info-steps-container">
        {/* Background SVG path */}
        <svg
          viewBox="0 0 660 400"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className="info-svg-path"
            d={defaultPath}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* Step cards */}
        <div className="relative space-y-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              className={`info-step flex items-start gap-4 ${idx % 2 === 1 ? 'flex-row-reverse' : ''}`}
              whileHover={{ x: idx % 2 === 0 ? 4 : -4, transition: { duration: 0.2 } }}
            >
              {/* Step number indicator */}
              <div className="shrink-0 w-10 h-10 rounded-full border-2 border-muted flex items-center justify-center font-mono text-sm font-bold text-muted-foreground">
                {idx + 1}
              </div>

              {/* Card */}
              <div className="flex-1 max-w-md p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{step.emoji}</span>
                  <span className="font-serif font-semibold text-sm">{step.label}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>

                {/* Metric */}
                {step.metric && (
                  <div className="info-metric mt-2 flex items-baseline gap-1">
                    <span className="font-mono text-lg font-bold text-accent">{step.metric}</span>
                    {step.metricLabel && (
                      <span className="font-mono text-[10px] text-muted-foreground">{step.metricLabel}</span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
