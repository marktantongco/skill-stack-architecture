/**
 * Shared animation variants for the Skill Stack Architecture.
 *
 * Consolidates duplicate variant definitions from all 11 section components.
 * Uses LazyMotion-compatible patterns (no LazyMotion wrapper needed — variants
 * work with both `motion` and `m` components).
 *
 * Phase 2 — Motion Animator Skill: extracted per skill recommendation.
 * Bundle: sharing variants saves ~2KB across 11 files (no repeated object literals).
 */

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
} as const;

export const staggerContainerSlow = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
} as const;

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
} as const;

export const fadeInUpGentle = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
} as const;

export const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
} as const;

export const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
} as const;

export const slideInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
} as const;

/** Section header entrance — used by every section */
export const sectionHeaderVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
} as const;

/** Hover micro-interaction — spring physics for organic feel */
export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { type: "spring" as const, stiffness: 400, damping: 25 },
};

/** Subtle hover for list items */
export const hoverSlideRight = {
  whileHover: { x: 2 },
  transition: { type: "spring" as const, stiffness: 400, damping: 30 },
};

/** Viewport observer config — consistent across all sections */
export const viewportOnce = { once: true, margin: "-100px" } as const;
