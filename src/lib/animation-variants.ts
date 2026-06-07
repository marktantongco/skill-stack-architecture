/**
 * Shared animation variants for the Skill Stack Architecture.
 *
 * Consolidates duplicate variant definitions from all 11 section components.
 * Uses LazyMotion-compatible patterns (no LazyMotion wrapper needed — variants
 * work with both `motion` and `m` components).
 *
 * Phase 2 — Motion Animator Skill: extracted per skill recommendation.
 * Phase 2 v2 — Added editorial-specific variants, layout transitions,
 * scroll-linked effects, and micro-interaction presets.
 *
 * Bundle: sharing variants saves ~2KB across 11 files (no repeated object literals).
 */

/* ─── Container Variants ─── */

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

/** Editorial stagger — slower, more dramatic for hero sections */
export const staggerContainerEditorial = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
} as const;

/* ─── Item Variants ─── */

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

/** Editorial divider entrance — subtle fade + scale */
export const dividerVariant = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
} as const;

/** Card expand/collapse for detail panels */
export const expandVariant = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
} as const;

/* ─── Micro-interaction Presets ─── */

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

/** Nav item hover — underline-style with subtle Y shift */
export const hoverNavItem = {
  whileHover: { y: -1 },
  transition: { type: "spring" as const, stiffness: 500, damping: 30 },
};

/** Button press — satisfying scale-down with spring */
export const hoverButtonPress = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring" as const, stiffness: 500, damping: 25 },
};

/* ─── Viewport Config ─── */

/** Viewport observer config — consistent across all sections */
export const viewportOnce = { once: true, margin: "-100px" } as const;

/** Viewport config for elements that should re-animate on re-entry */
export const viewportRepeat = { once: false, margin: "-50px" } as const;

/* ─── Layout Transition Config ─── */

/** Shared layout transition for FLIP animations */
export const layoutTransition = {
  layout: true,
  transition: { type: "spring" as const, stiffness: 300, damping: 30 },
};

/* ─── Spring Presets ─── */

export const springs = {
  /** Snappy — for button presses, toggles */
  snappy: { type: "spring" as const, stiffness: 500, damping: 25 },
  /** Gentle — for content reveals, fades */
  gentle: { type: "spring" as const, stiffness: 200, damping: 24 },
  /** Bouncy — for playful interactions, badges */
  bouncy: { type: "spring" as const, stiffness: 400, damping: 15 },
  /** Editorial — for section transitions, dividers */
  editorial: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
} as const;
