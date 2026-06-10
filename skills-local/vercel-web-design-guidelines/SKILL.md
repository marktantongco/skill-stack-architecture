---
name: vercel-web-design-guidelines
description: Accessibility-first UX rules, performance budgets, responsive patterns, and web platform best practices. Use when building web applications to ensure WCAG compliance, Core Web Vitals optimization, and progressive enhancement.
---

# Vercel Web Design Guidelines Skill

**Version:** 1.1  
**Scope:** Accessibility-first UX rules, performance budgets, responsive patterns, and web platform best practices.  
**Works with:** Next.js, React, Vue, Svelte, Astro, HTML  
**Word Count:** ~9,000 | **Embedded Data:** 32 accessibility rules, 16 performance budgets, 12 responsive patterns, 8 form validation procedures, 6 SEO checklists

---

## MODULE 0: Foundation

### 0.1 What This Skill Provides

Production-grade web design rules derived from Vercel's platform experience. Focuses on **performance as design**, **accessibility as default**, and **progressive enhancement**.

**Core competencies:**
- WCAG 2.2 AA/AAA compliance procedures
- Core Web Vitals optimization
- Mobile-first responsive architecture
- Form validation and error handling
- SEO and metadata patterns
- Security headers and CSP

### 0.2 The Performance Budget

**Every project starts with a budget. No exceptions.**

| Metric | Budget | Priority |
|--------|--------|----------|
| First Contentful Paint (FCP) | < 1.8s | Critical |
| Largest Contentful Paint (LCP) | < 2.5s | Critical |
| First Input Delay (FID) | < 100ms | Critical |
| Cumulative Layout Shift (CLS) | < 0.1 | Critical |
| Time to First Byte (TTFB) | < 600ms | High |
| Total Blocking Time (TBT) | < 200ms | High |
| Speed Index | < 3.4s | Medium |
| Interaction to Next Paint (INP) | < 200ms | Critical |

**Resource budgets:**
- JavaScript: < 200KB gzipped (initial)
- CSS: < 50KB gzipped (initial)
- Images: < 500KB total above fold
- Fonts: < 100KB total
- Third-party scripts: < 100KB total

### 0.3 Skill Selector — Decision Tree

**Route users to the right skill based on project type:**

```
START: What are you building?
│
├─ AI Chat Interface → Anthropic Frontend Design (Trust patterns)
│                      + UI/UX Pro Max v7.1 (Components)
│
├─ Marketing/Landing Page → UI/UX Pro Max v7.1 (Design system)
│                    + GSAP Animations (Motion)
│
├─ Dashboard/SaaS App → UI/UX Pro Max v7.1 (Components)
│                    + Vercel React Best Practices (Architecture)
│                    + THIS SKILL (Primary - Accessibility)
│
├─ Animation-Heavy Site → GSAP Animations (Complex motion)
│                      + UI/UX Pro Max v7.1 (Design tokens)
│
├─ Accessible Gov/Health → THIS SKILL (Primary - WCAG)
│                        + UI/UX Pro Max v7.1 (Components)
│
└─ Full Production App → ALL FIVE SKILLS
```

### 0.4 Version Compatibility

| This Skill | Works With | Not Compatible With |
|------------|------------|------------------|
| v1.1 | Next.js 14+ | Next.js 13 |
| v1.1 | React 18+ | React 17 |
| v1.1 | UI/UX Pro Max v7.1+ | Pre-v7.1 |
| v1.1 | All v1.1 skills | — |

### 0.5 Cross-Skill Integration Quick Reference

| You Need | Use This Skill | Then Add |
|---------|----------------|----------|
| Accessibility validation (WCAG) | vercel-web-design-guidelines | UI/UX Pro Max |
| Performance budgets | vercel-web-design-guidelines | UI/UX Pro Max |
| SEO patterns | vercel-web-design-guidelines | UI/UX Pro Max |
| Security headers | vercel-web-design-guidelines | UI/UX Pro Max |
| Design tokens | UI/UX Pro Max | This skill |
| Component library | UI/UX Pro Max | This skill |
| Creative direction | Anthropic Frontend Design | This skill |

---

## MODULE 1: Accessibility (A11y)

### 1.1 The WCAG 2.2 Checklist

**Level AA (Required):**

```
□ 1.1.1 Non-text Content — All images have alt text
□ 1.2.2 Captions (Prerecorded) — Videos have captions
□ 1.3.1 Info and Relationships — Semantic HTML used
□ 1.3.2 Meaningful Sequence — Content order is logical
□ 1.3.3 Sensory Characteristics — Instructions don't rely on color/shape alone
□ 1.3.4 Orientation — Content works in any orientation
□ 1.3.5 Identify Input Purpose — Autocomplete attributes used
□ 1.4.1 Use of Color — Information not conveyed by color alone
□ 1.4.3 Contrast (Minimum) — 4.5:1 for normal text, 3:1 for large text
□ 1.4.4 Resize Text — 200% zoom without horizontal scroll
□ 1.4.5 Images of Text — Text used instead of images when possible
□ 1.4.10 Reflow — 320px viewport without horizontal scroll
□ 1.4.11 Non-text Contrast — UI components have 3:1 contrast
□ 1.4.12 Text Spacing — No content loss at increased spacing
□ 1.4.13 Content on Hover/Focus — Dismissible, hoverable, persistent
□ 2.1.1 Keyboard — All functionality available via keyboard
□ 2.1.2 No Keyboard Trap — Keyboard users can navigate away
□ 2.1.4 Character Key Shortcuts — Can be turned off or remapped
□ 2.2.1 Timing Adjustable — Users can extend time limits
□ 2.2.2 Pause, Stop, Hide — Moving content can be controlled
□ 2.4.3 Focus Order — Logical tab order
□ 2.4.4 Link Purpose (In Context) — Link text makes sense
□ 2.4.5 Multiple Ways — Multiple ways to find pages
□ 2.4.6 Headings and Labels — Descriptive headings
□ 2.4.7 Focus Visible — Visible focus indicators
□ 2.5.1 Pointer Gestures — Single pointer alternatives
□ 2.5.2 Pointer Cancellation — No down-event activation
□ 2.5.3 Label in Name — Accessible name contains visible text
□ 2.5.4 Motion Actuation — Motion can be disabled
□ 2.5.7 Dragging Movements — Single pointer alternative
□ 2.5.8 Target Size (Minimum) — 24×24px minimum target size
□ 3.1.1 Language of Page — Lang attribute set
□ 3.1.2 Language of Parts — Foreign language marked
□ 3.2.1 On Focus — Focus doesn't change context
□ 3.2.2 On Input — Input doesn't change context unexpectedly
□ 3.2.3 Consistent Navigation — Nav is consistent
□ 3.2.4 Consistent Identification — Components identified consistently
□ 3.3.1 Error Identification — Errors identified in text
□ 3.3.2 Labels or Instructions — Input labels present
□ 3.3.3 Error Suggestion — Suggestions for error correction
□ 3.3.4 Error Prevention (Legal, Financial, Data) — Review and confirm
□ 3.3.7 Redundant Entry — Auto-populate known data
□ 3.3.8 Accessible Authentication — No cognitive function tests
□ 4.1.1 Parsing — Valid HTML
□ 4.1.2 Name, Role, Value — Components have names and roles
□ 4.1.3 Status Messages — Status messages announced
```

### 1.2 Focus Management

```css
/* Visible focus — NEVER remove this */
:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Skip link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-text);
  color: var(--color-bg);
  padding: 8px 16px;
  z-index: 100;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 0;
}

/* Focus trap for modals */
.modal:focus-within {
  /* Modal container receives focus */
}
```

### 1.3 Screen Reader Patterns

```tsx
// Visually hidden but accessible
export const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <span className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 clip-rect">
    {children}
  </span>
);

// Live region for dynamic content
export const LiveRegion = ({ message }: { message: string }) => (
  <div 
    role="status" 
    aria-live="polite" 
    aria-atomic="true"
    className="sr-only"
  >
    {message}
  </div>
);

// Descriptive labels
<button 
  aria-label="Close dialog"
  aria-describedby="dialog-description"
>
  <XIcon />
</button>

// Complex component labeling
<nav aria-label="Main navigation">
  <ul role="menubar">
    <li role="none">
      <a role="menuitem" href="/">Home</a>
    </li>
  </ul>
</nav>
```

### 1.4 Color Contrast Validation

```typescript
// WCAG contrast ratio calculation
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Usage
const ratio = getContrastRatio('#1C1917', '#FAFAF8'); // 15.8:1 — AAA
const passesAA = ratio >= 4.5;
const passesAAA = ratio >= 7;
```

### 1.5 Reduced Motion

```css
/* Respect user preference ALWAYS */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Progressive enhancement approach */
.animated {
  /* Base: no animation */
}

@media (prefers-reduced-motion: no-preference) {
  .animated {
    animation: fadeIn 0.3s ease-out;
  }
}
```

---

## MODULE 2: Performance

### 2.1 Image Optimization

```tsx
// Next.js Image component (preferred)
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Product showcase"
  width={1200}
  height={600}
  priority // Above-fold images only
  sizes="(max-width: 768px) 100vw, 50vw"
  quality={85}
/>

// Manual responsive images
<picture>
  <source 
    srcSet="/image.avif" 
    type="image/avif"
  />
  <source 
    srcSet="/image.webp" 
    type="image/webp"
  />
  <img 
    src="/image.jpg" 
    alt="Description"
    loading="lazy"
    decoding="async"
    width="800"
    height="600"
  />
</picture>
```

**Image rules:**
- Use AVIF when possible, WebP as fallback, JPEG as last resort
- Always specify width and height to prevent CLS
- Lazy load below-fold images
- Use `priority` only for LCP images
- Compress to 80-85% quality
- Serve at 2x max for retina (not 3x)

### 2.2 Font Loading

```css
/* Critical font display */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-weight: 400;
  font-display: swap; /* Never use block */
  unicode-range: U+0000-00FF; /* Latin only initially */
}

/* Font subsetting strategy */
/* 1. Load critical subset (Latin) with swap */
/* 2. Preload woff2 in <head> */
/* 3. Load extended subsets asynchronously */

/* Preconnect to font CDN */
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

### 2.3 Code Splitting

```tsx
// Route-based splitting (automatic in Next.js)
// Component-level splitting
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Only client-side
});

// Conditional loading
const MapComponent = dynamic(() => import('./Map'), {
  ssr: false,
});

// Usage
{showMap && <MapComponent />}
```

### 2.4 Caching Strategy

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(js|css)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### 2.5 Third-Party Script Management

```tsx
// next/script for optimized loading
import Script from 'next/script';

// Analytics — load after interactive
<Script
  src="https://analytics.com/script.js"
  strategy="afterInteractive"
/>

// Non-critical — lazy load
<Script
  src="https://chat-widget.com/widget.js"
  strategy="lazyOnload"
/>

// Critical — before interactive
<Script
  src="https://security.com/verify.js"
  strategy="beforeInteractive"
/>
```

---

## MODULE 3: Responsive Design

### 3.1 The Fluid Type Scale

```css
/* Clamp-based fluid typography */
:root {
  --step--2: clamp(0.64rem, 0.66rem + -0.09vw, 0.57rem);
  --step--1: clamp(0.8rem, 0.79rem + 0.05vw, 0.85rem);
  --step-0: clamp(1rem, 0.93rem + 0.33vw, 1.25rem);
  --step-1: clamp(1.25rem, 1.08rem + 0.83vw, 1.85rem);
  --step-2: clamp(1.56rem, 1.23rem + 1.65vw, 2.75rem);
  --step-3: clamp(1.95rem, 1.36rem + 2.96vw, 4.06rem);
  --step-4: clamp(2.44rem, 1.44rem + 5.01vw, 6rem);
  --step-5: clamp(3.05rem, 1.42rem + 8.17vw, 8.86rem);
}
```

### 3.2 Container Queries

```css
/* Component-level responsive */
.card-grid {
  container-type: inline-size;
  container-name: cards;
}

@container cards (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
  }
}

@container cards (min-width: 700px) {
  .card-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### 3.3 The Responsive Grid

```css
/* Auto-fitting grid */
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: clamp(1rem, 3vw, 2rem);
}

/* Sidebar layout */
.sidebar-layout {
  display: grid;
  grid-template-columns: 1fr;
}

@media (min-width: 64rem) {
  .sidebar-layout {
    grid-template-columns: 280px 1fr;
  }
}

/* Content with breakout */
.content-grid {
  --padding: 1rem;
  --content: 65ch;
  --breakout: 80ch;

  display: grid;
  grid-template-columns:
    [full-start] minmax(var(--padding), 1fr)
    [breakout-start] minmax(0, calc((var(--breakout) - var(--content)) / 2))
    [content-start] min(var(--content), 100% - var(--padding) * 2) [content-end]
    minmax(0, calc((var(--breakout) - var(--content)) / 2)) [breakout-end]
    minmax(var(--padding), 1fr) [full-end];
}

.content-grid > * {
  grid-column: content;
}

.content-grid > .breakout {
  grid-column: breakout;
}

.content-grid > .full {
  grid-column: full;
}
```

### 3.4 Touch Targets

```css
/* Minimum 44×44px for all interactive elements */
button,
a,
input,
select,
textarea,
[role="button"] {
  min-height: 44px;
  min-width: 44px;
}

/* Compact mode for dense UIs */
@media (pointer: fine) {
  .compact button,
  .compact a {
    min-height: 32px;
    min-width: 32px;
  }
}
```

---

## MODULE 4: Forms & Validation

### 4.1 The Accessible Form

```tsx
interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

export const FormField = ({ label, name, type = 'text', required, error, hint }: FormFieldProps) => {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="space-y-1.5">
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-[var(--color-text)]"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>

      {hint && (
        <p id={hintId} className="text-xs text-[var(--color-text-secondary)]">
          {hint}
        </p>
      )}

      <input
        id={id}
        name={name}
        type={type}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={cn(error && errorId, hint && hintId)}
        className={cn(
          "w-full px-3 py-2 rounded-lg border bg-white",
          error 
            ? "border-red-500 focus:ring-red-500" 
            : "border-gray-300 focus:ring-blue-500"
        )}
      />

      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
```

### 4.2 Validation Patterns

```typescript
// Zod schema validation
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Real-time validation hook
function useFormValidation<T extends z.ZodType>(schema: T) {
  const [errors, setErrors] = useState<Partial<Record<keyof z.infer<T>, string>>>({});

  const validate = (data: unknown): data is z.infer<T> => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const formatted: typeof errors = {};
      result.error.errors.forEach(err => {
        const path = err.path[0] as keyof z.infer<T>;
        formatted[path] = err.message;
      });
      setErrors(formatted);
      return false;
    }
    setErrors({});
    return true;
  };

  return { errors, validate };
}
```

### 4.3 Error Recovery

```tsx
export const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div role="alert" className="p-6 rounded-lg bg-red-50 border border-red-200">
        <h2 className="text-lg font-semibold text-red-800">Something went wrong</h2>
        <p className="mt-2 text-red-600">
          We've encountered an error. Please try refreshing the page.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
```

---

## MODULE 5: SEO & Metadata

### 5.1 The Metadata Template

```tsx
// Next.js metadata API
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Site Name',
    template: '%s | Site Name',
  },
  description: 'Site description for search engines.',
  keywords: ['keyword1', 'keyword2'],
  authors: [{ name: 'Author Name' }],
  creator: 'Company Name',
  publisher: 'Company Name',

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://example.com',
    siteName: 'Site Name',
    title: 'Page Title',
    description: 'Page description',
    images: [{
      url: 'https://example.com/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Image description',
    }],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Page Title',
    description: 'Page description',
    images: ['https://example.com/twitter-image.jpg'],
    creator: '@username',
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verification
  verification: {
    google: 'google-site-verification-code',
  },

  // Alternates
  alternates: {
    canonical: 'https://example.com/page',
    languages: {
      'en-US': 'https://example.com/en-US/page',
      'es-ES': 'https://example.com/es-ES/page',
    },
  },
};
```

### 5.2 Structured Data

```tsx
// JSON-LD structured data
export const StructuredData = () => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Company Name',
    url: 'https://example.com',
    logo: 'https://example.com/logo.png',
    sameAs: [
      'https://twitter.com/company',
      'https://linkedin.com/company',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-234-567-8900',
      contactType: 'customer service',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};
```

---

## MODULE 6: Security

### 6.1 Security Headers

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data:",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};
```

### 6.2 Input Sanitization

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML content
const clean = DOMPurify.sanitize(dirtyHtml, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  ALLOWED_ATTR: ['href', 'target'],
});

// URL validation
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
```

---

## MODULE 7: Integration

### 7.1 With UI/UX Pro Max

| This Skill Adds | Pro Max Adds |
|-----------------|--------------|
| Accessibility validation | Creative direction |
| Performance budgets | Component library |
| SEO patterns | Animation presets |
| Security headers | Industry heuristics |

### 7.2 With Anthropic Frontend Design

This skill provides the "how" (technical implementation). Anthropic skill provides the "what" (design philosophy).

### 7.3 With Vercel React Best Practices

This skill covers web platform concerns. React Best Practices covers component architecture.

### 7.4 Shared Pattern Reference

These patterns appear in multiple skills:

| Pattern | Primary Source | Also In |
|---------|-------------|---------|
| WCAG 2.2 checklist | This skill | All skills |
| Focus management | This skill | UI/UX Pro Max |
| prefers-reduced-motion | This skill | ALL SKILLS |
| fluid typography | This skill | UI/UX Pro Max |
| Form validation | This skill | UI/UX Pro Max v7.1, Vercel React |
| Security headers | This skill | UI/UX Pro Max |

**Cross-reference rule:** This skill serves as the primary source for accessibility, performance, and security patterns. Forward-reference from other skills rather than duplicating.

---

## MODULE 8: Testing & Quality Assurance

### 8.1 Accessibility Testing

```typescript
// Automated accessibility testing with jest-axe
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('has no a11y violations', async () => {
    const { container } = render(<ComponentUnderTest />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

```typescript
// Playwright accessibility testing
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('should not have any automatically detectable accessibility issues', async ({ page }) => {
  await page.goto('https://example.com');
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### 8.2 Performance Testing

```typescript
// Core Web Vitals monitoring
import { getCLS, getFID, getLCP } from 'web-vitals';

function sendToAnalytics(metric: any) {
  const body = JSON.stringify(metric);
  navigator.sendBeacon('/api/analytics', body);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
```

```typescript
// Lighthouse CI configuration
// .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      startServerCommand: 'npm run start',
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
  },
};
```

### 8.3 Cross-Browser Testing Checklist

```
□ Chrome (latest 2 versions)
□ Firefox (latest 2 versions)
□ Safari (latest 2 versions)
□ Edge (latest 2 versions)
□ Mobile Safari (iOS latest)
□ Chrome Android (latest)
□ Prefers-reduced-motion respected
□ Dark mode supported
□ 320px viewport (reflow)
□ 200% zoom (no horizontal scroll)
□ Keyboard navigation (Tab, Shift+Tab, Enter, Escape)
□ Screen reader announces dynamic content
```

### 8.4 Visual Regression Testing

```typescript
// Percy example
import { percySnapshot } from '@percy/playwright';

test('homepage visual test', async ({ page }) => {
  await page.goto('https://example.com');
  await percySnapshot(page, 'Homepage');
});

// Chromatic example
import { chromatic } from 'chromatic';

export default {
  stories: ['**/*.stories.@(js|jsx|ts|tsx)'],
  chromatic: {
    viewports: [320, 768, 1024, 1440],
    modes: [
      { name: 'Light', viewport: 1024 },
      { name: 'Dark', viewport: 1024, prefersColorScheme: 'dark' },
    ],
  },
};
```

### 8.5 Security Testing

```typescript
// CSP violation reporting
// Add to next.config.js headers
{
  key: 'Content-Security-Policy-Report-Only',
  value: "default-src 'self'; report-uri /api/csp-report"
}

// Report endpoint
// pages/api/csp-report.ts
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    console.log('CSP Violation:', req.body);
    // Send to monitoring service
  }
  res.status(200).end();
}
```

### 8.6 Skill Validation Script

Run the included `validate-skills.sh` script to automatically check all skill files for version mismatches and formatting errors:

```bash
cd /home/hive/Documents/opencode/skills
chmod +x validate-skills.sh
./validate-skills.sh
```

The script checks for:
- Version consistency (v1.1, v7.1)
- Cross-reference validity
- Code syntax errors
- Required sections

---

*Vercel Web Design Guidelines v1.1 — Performance is design. Accessibility is default.*
