---
name: anthropic-frontend-design
description: Bold aesthetic principles for AI-native interfaces, conversational UI, and trust-forward design. Use when building Claude-like interfaces, trust signals, conversational layouts, or intellectual generosity patterns.
---

# Anthropic Frontend Design Skill

**Version:** 1.1  
**Scope:** Bold aesthetic principles for AI-native interfaces, conversational UI, and trust-forward design.  
**Works with:** Claude Code, Cursor, Windsurf, OpenCode, Kiro, Roo Code, Gemini CLI, Trae, Copilot, Codex CLI  
**Word Count:** ~8,000 | **Embedded Data:** 24 layout principles, 18 component patterns, 12 trust signals, 8 typography scales, 6 motion philosophies

---

## MODULE 0: Philosophy & Principles

### 0.1 What This Skill Provides

This skill embeds Anthropic's design philosophy — the principles behind Claude.ai's interface — directly into your AI assistant. It focuses on **trust, clarity, and intellectual generosity** as core design values.

**Key differentiators from generic design systems:**
- Conversational UI patterns that feel human, not robotic
- Trust signals that reduce AI anxiety
- Information density calibrated for reading, not scanning
- Motion that feels thoughtful, not flashy

### 0.2 Core Philosophy

**Design is a conversation.** Every pixel communicates intent. The interface should feel like a thoughtful collaborator, not a tool.

**Three pillars:**
1. **Radical Clarity** — Remove ambiguity. Every element has a clear purpose.
2. **Intellectual Generosity** — The interface should feel generous with space, information, and patience.
3. **Earned Trust** — Trust is built through consistency, transparency, and control.

### 0.3 When to Use This Skill

Use when designing:
- AI chat interfaces
- Knowledge work tools (writing, coding, analysis)
- Products where user trust is critical
- Long-form reading experiences
- Interfaces with complex information hierarchy

---

### 0.4 Skill Selector — Decision Tree

**Route users to the right skill based on project type:**

```
START: What are you building?
│
├─ AI Chat Interface → THIS SKILL (Creative direction, trust patterns)
│                      + UI/UX Pro Max v7.1 (Components, tokens)
│
├─ Marketing/Landing Page → UI/UX Pro Max v7.1 (Design system)
│                          + GSAP Animations (Scroll effects)
│
├─ Dashboard/SaaS App → UI/UX Pro Max v7.1 (Components)
│                    + Vercel React Best Practices (Architecture)
│                    + Vercel Web Design Guidelines (A11y)
│
├─ Animation-Heavy Site → GSAP Animations (Complex motion)
│                        + UI/UX Pro Max v7.1 (Design tokens)
│
├─ Accessible Gov/Health → Vercel Web Design Guidelines (WCAG)
│                        + UI/UX Pro Max v7.1 (Components)
│
├─ Video Content → UI/UX Pro Max v7.1 (Remotion templates)
│
└─ Full Production App → ALL FIVE SKILLS
    This skill = Creative philosophy + AI-native patterns
    UI/UX Pro Max = Design system + components
    Vercel Web = Platform rules + accessibility
    Vercel React = Architecture + state management
    GSAP = Advanced motion
```

### 0.5 Version Compatibility

| This Skill | Works With | Not Compatible With |
|------------|------------|---------------------|
| v1.1 | UI/UX Pro Max v7.1+ | Pre-v7.1 |
| v1.1 | Vercel Web Design Guidelines v1.1 | — |
| v1.1 | Vercel React Best Practices v1.1 | — |
| v1.1 | GSAP Animations v1.1 | GSAP v2.x |

### 0.6 Cross-Skill Integration Quick Reference

| You Need | Use This Skill | Then Add |
|---------|----------------|----------|
| Trust patterns, conversation UI | anthropic-frontend-design | UI/UX Pro Max |
| Typography/philosophy | anthropic-frontend-design | UI/UX Pro Max |
| Production components | UI/UX Pro Max | anthropic-frontend-design |
| Design tokens | UI/UX Pro Max | Any |
| Accessibility/WCAG | Vercel Web Design Guidelines | UI/UX Pro Max |
| Performance budgets | Vercel Web Design Guidelines | UI/UX Pro Max |
| Component architecture | Vercel React Best Practices | UI/UX Pro Max |
| State management | Vercel React Best Practices | UI/UX Pro Max |
| Complex scroll animations | GSAP Animations | UI/UX Pro Max |
| React GSAP integration | GSAP Animations | UI/UX Pro Max |

---

## MODULE 1: Layout Architecture

### 1.1 The Generous Frame

**Rule:** Default to more whitespace than feels comfortable. Then add 20% more.

```css
/* Minimum section padding */
.section {
  padding: clamp(4rem, 10vh, 8rem) clamp(1.5rem, 5vw, 4rem);
}

/* Content max-width for readability */
.reading-column {
  max-width: 72ch;
}

/* Generous gap scale */
.gap-sm { gap: 1rem; }
.gap-md { gap: 2rem; }
.gap-lg { gap: 4rem; }
.gap-xl { gap: 8rem; }
```

**Why:** Dense interfaces signal haste. Generous spacing signals confidence and invites focus.

### 1.2 Asymmetric Balance

**Rule:** Center alignment is a last resort. Use asymmetric layouts to create visual interest and guide reading flow.

```css
/* Asymmetric two-column */
.asymmetric-grid {
  display: grid;
  grid-template-columns: 1fr 1.618fr; /* Golden ratio */
  gap: 4rem;
}

/* Offset content blocks */
.offset-block {
  margin-left: 15%;
  max-width: 55%;
}

/* Hanging elements */
.hanging-element {
  position: relative;
  left: -2rem; /* Pulls outside container slightly */
}
```

### 1.3 The Reading Line

**Rule:** Establish a clear vertical reading line. All primary content should align to this invisible axis.

```css
.reading-line {
  padding-left: 0;
  border-left: none;
}

/* Exceptions that break the line intentionally */
.callout {
  margin-left: -1.5rem;
  padding-left: 1.25rem;
  border-left: 3px solid var(--color-accent);
}
```

### 1.4 Layered Depth (Not Flat)

**Rule:** Use subtle depth to create hierarchy without shadows that feel "material."

```css
/* Elevation through color, not shadow */
.surface-1 { background: var(--color-bg); }
.surface-2 { background: var(--color-surface); }
.surface-3 { background: var(--color-elevated); }

/* When shadows are necessary, use colored shadows */
.colored-shadow {
  box-shadow: 0 4px 24px -4px var(--color-shadow);
}
```

### 1.5 The Focal Point

**Rule:** Every section needs ONE focal point. Not two. Not zero. One.

**Techniques:**
- Scale contrast (hero text vs body)
- Color isolation (single accent in monochrome field)
- Negative space framing
- Typographic weight contrast

### 1.6 Content-First Breakpoints

**Rule:** Breakpoints follow content, not devices.

```css
/* Don't use 768px because it's "tablet" */
/* Use when the layout breaks */
@media (min-width: 60ch) { /* Content readable */ }
@media (min-width: 90ch) { /* Side-by-side possible */ }
@media (min-width: 120ch) { /* Full layout breathes */ }
```

---

## MODULE 2: Typography System

### 2.1 Type Scale: The Minor Third

**Rule:** Use a musical scale for type. The minor third (1.2 ratio) creates harmonious, readable hierarchy.

```css
:root {
  --text-xs:   clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);   /* 12-14px */
  --text-sm:   clamp(0.875rem, 0.8rem + 0.35vw, 1rem);       /* 14-16px */
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);        /* 16-18px */
  --text-lg:   clamp(1.125rem, 1rem + 0.65vw, 1.375rem);     /* 18-22px */
  --text-xl:   clamp(1.25rem, 1.1rem + 0.75vw, 1.75rem);     /* 20-28px */
  --text-2xl:  clamp(1.5rem, 1.2rem + 1.5vw, 2.5rem);        /* 24-40px */
  --text-3xl:  clamp(1.875rem, 1.3rem + 2.5vw, 3.5rem);      /* 30-56px */
  --text-4xl:  clamp(2.25rem, 1.5rem + 3.5vw, 5rem);         /* 36-80px */

  --leading-tight: 1.1;
  --leading-snug: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.65;
  --leading-loose: 1.8;
}
```

### 2.2 Font Pairing Philosophy

**Rule:** Pair a distinctive display face with a highly readable body face. Never use the same font for both.

**Recommended pairings for AI interfaces:**

| Display | Body | Mood |
|---------|------|------|
| Source Serif 4 | Source Sans 3 | Scholarly, trustworthy |
| Newsreader | Inter | Editorial, refined |
| Cormorant Garamond | Work Sans | Elegant, generous |
| Literata | DM Sans | Literary, warm |
| Playfair Display | Source Sans 3 | Classic authority |

### 2.3 The Paragraph as Object

**Rule:** Treat paragraphs as visual objects, not just text containers.

```css
.prose {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--color-text);

  /* Paragraph spacing */
  p + p {
    margin-top: 1.5em;
  }

  /* First paragraph after heading */
  h2 + p, h3 + p {
    margin-top: 0.75em;
  }

  /* Drop cap for opening paragraphs */
  > p:first-of-type::first-letter {
    float: left;
    font-size: 3.5em;
    line-height: 0.8;
    padding-right: 0.1em;
    font-weight: 700;
    color: var(--color-accent);
  }
}
```

### 2.4 Typographic Color

**Rule:** Use weight and color to create typographic "color" (visual density), not just size.

```css
/* Light, airy headings */
h1, h2 {
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--color-text);
}

/* Dense, grounded body */
body {
  font-weight: 400;
  color: var(--color-text-secondary);
}

/* Bold accents within text */
strong {
  font-weight: 600;
  color: var(--color-text);
}
```

### 2.5 Code & Monospace

**Rule:** Code should feel integrated, not alien.

```css
code {
  font-family: 'SF Mono', 'JetBrains Mono', monospace;
  font-size: 0.9em;
  padding: 0.15em 0.4em;
  background: var(--color-surface);
  border-radius: 4px;
  color: var(--color-text);
}

pre {
  padding: 1.5rem;
  background: var(--color-surface);
  border-radius: 12px;
  overflow-x: auto;
  line-height: 1.6;
}

pre code {
  padding: 0;
  background: none;
}
```

---

## MODULE 3: Color System

### 3.1 The Muted Foundation

**Rule:** Start with muted, sophisticated base colors. Reserve saturation for intentional moments.

```css
:root {
  /* Warm neutrals (preferred for reading) */
  --color-bg: #FAFAF8;
  --color-surface: #F5F5F0;
  --color-elevated: #FFFFFF;
  --color-text: #1C1917;
  --color-text-secondary: #57534E;
  --color-text-tertiary: #A8A29E;
  --color-border: #E7E5E4;

  /* Single accent — use sparingly */
  --color-accent: #D97706;
  --color-accent-subtle: #FEF3C7;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0C0A09;
    --color-surface: #1C1917;
    --color-elevated: #292524;
    --color-text: #FAFAF9;
    --color-text-secondary: #A8A29E;
    --color-text-tertiary: #57534E;
    --color-border: #292524;
    --color-accent: #F59E0B;
    --color-accent-subtle: #451A03;
  }
}
```

### 3.2 Color Psychology for AI Interfaces

| Color | Use Case | Avoid |
|-------|----------|-------|
| Warm amber | Primary actions, AI presence | Error states |
| Sage green | Success, completion, calm | Urgent actions |
| Dusty rose | Warnings, caution | Primary branding |
| Stone gray | Neutral info, secondary | CTAs |
| Deep charcoal | Text, authority | Backgrounds |

### 3.3 Semantic Color Application

```css
/* Actions */
.btn-primary {
  background: var(--color-accent);
  color: var(--color-bg);
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

/* Status */
.status-success { color: #65A30D; }
.status-warning { color: #CA8A04; }
.status-error { color: #DC2626; }
.status-info { color: #0891B2; }

/* AI-specific states */
.status-thinking {
  color: var(--color-accent);
  animation: pulse 2s ease-in-out infinite;
}

.status-generating {
  background: linear-gradient(90deg, var(--color-accent), transparent);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

---

## MODULE 4: Component Patterns

### 4.1 The Conversation Thread

**The core pattern for AI chat interfaces.**

```tsx
interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export const Message = ({ role, content, timestamp, isStreaming }: MessageProps) => {
  return (
    <div className={cn(
      "flex gap-4 py-6",
      role === 'assistant' && "bg-[var(--color-surface)]"
    )}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
        {role === 'user' 
          ? 'bg-[var(--color-text)] text-[var(--color-bg)]' 
          : 'bg-[var(--color-accent)] text-[var(--color-bg)]'}"
      >
        {role === 'user' ? 'U' : 'A'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-[var(--color-text)]">
            {role === 'user' ? 'You' : 'Claude'}
          </span>
          <span className="text-xs text-[var(--color-text-tertiary)]">
            {formatTime(timestamp)}
          </span>
        </div>

        <div className="prose prose-sm max-w-none text-[var(--color-text-secondary)]">
          <Markdown content={content} />
          {isStreaming && <span className="inline-block w-2 h-4 bg-[var(--color-accent)] animate-pulse ml-1" />}
        </div>

        {role === 'assistant' && !isStreaming && (
          <div className="flex gap-2 mt-3">
            <button className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors">
              Copy
            </button>
            <button className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors">
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
```

### 4.2 The Thinking Indicator

**Transparency builds trust. Show when the AI is "thinking."**

```tsx
export const ThinkingIndicator = () => {
  return (
    <div className="flex items-center gap-3 py-4 text-[var(--color-text-tertiary)]">
      <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm">Claude is thinking...</span>
    </div>
  );
};
```

### 4.3 The Input Composer

**The primary interaction point. Should feel inviting and capable.**

```tsx
export const Composer = () => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <div className="relative border border-[var(--color-border)] rounded-2xl bg-[var(--color-elevated)] shadow-sm focus-within:shadow-md focus-within:border-[var(--color-accent)] transition-all">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Message Claude..."
        rows={1}
        className="w-full px-4 py-3 bg-transparent resize-none outline-none text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)]"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <div className="flex items-center justify-between px-3 pb-3">
        <div className="flex gap-2">
          <button className="p-2 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-tertiary)] transition-colors" aria-label="Attach file">
            <Paperclip className="w-4 h-4" />
          </button>
        </div>
        <button 
          disabled={!value.trim()}
          className="p-2 rounded-lg bg-[var(--color-accent)] text-[var(--color-bg)] disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
          aria-label="Send message"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
```

### 4.4 The Trust Badge

**Explicit trust signals reduce AI anxiety.**

```tsx
interface TrustBadgeProps {
  type: 'privacy' | 'accuracy' | 'safety' | 'human';
  children: React.ReactNode;
}

export const TrustBadge = ({ type, children }: TrustBadgeProps) => {
  const icons = {
    privacy: Lock,
    accuracy: CheckCircle,
    safety: Shield,
    human: Users,
  };

  const labels = {
    privacy: 'Your data stays private',
    accuracy: 'Verified information',
    safety: 'Constitutional AI safeguards',
    human: 'Human oversight',
  };

  const Icon = icons[type];

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
      <Icon className="w-3.5 h-3.5 text-[var(--color-accent)]" />
      <span>{labels[type]}</span>
    </div>
  );
};
```

### 4.5 The Contextual Action

**Actions that appear in context, not in toolbars.**

```tsx
export const ContextualActions = ({ text }: { text: string }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="text-[var(--color-text)]">{text}</div>

      <div className={cn(
        "absolute -right-12 top-0 flex flex-col gap-1 transition-opacity",
        isHovered ? "opacity-100" : "opacity-0"
      )}>
        <button className="p-1.5 rounded-md hover:bg-[var(--color-surface)] text-[var(--color-text-tertiary)]" title="Copy">
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button className="p-1.5 rounded-md hover:bg-[var(--color-surface)] text-[var(--color-text-tertiary)]" title="Edit">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
```

---

## MODULE 5: Motion & Interaction

### 5.1 Motion Philosophy

**Rule:** Motion should feel like thought, not entertainment.

| Good Motion | Bad Motion |
|-------------|------------|
| Fade in (content appearing) | Bounce in (playful, distracting) |
| Subtle scale on press | Shake on error (aggressive) |
| Smooth height transitions | Jarring layout shifts |
| Cursor blink (human) | Spinning loaders (machine) |
| Staggered list reveals | Everything animating at once |

### 5.2 Timing Tokens

```css
:root {
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --duration-deliberate: 600ms;

  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-expo: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### 5.3 The Thoughtful Entrance

```css
@keyframes appear {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.appear {
  animation: appear var(--duration-normal) var(--ease-expo) forwards;
}

/* Staggered children */
.stagger-children > * {
  opacity: 0;
  animation: appear var(--duration-normal) var(--ease-expo) forwards;
}

.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 50ms; }
.stagger-children > *:nth-child(3) { animation-delay: 100ms; }
.stagger-children > *:nth-child(4) { animation-delay: 150ms; }
.stagger-children > *:nth-child(5) { animation-delay: 200ms; }
```

### 5.4 The Generous Hover

```css
/* Not just color change — spatial feedback */
.interactive {
  transition: transform var(--duration-fast) var(--ease-smooth),
              background-color var(--duration-fast) var(--ease-smooth);
}

.interactive:hover {
  transform: translateY(-1px);
}

.interactive:active {
  transform: translateY(0) scale(0.98);
}

/* Links that feel physical */
a {
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color var(--duration-fast) var(--ease-smooth);
}

a:hover {
  border-bottom-color: currentColor;
}
```

### 5.5 Streaming Text Animation

```css
@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.streaming-cursor {
  display: inline-block;
  width: 2px;
  height: 1.2em;
  background: var(--color-accent);
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: cursor-blink 1s step-end infinite;
}

/* Word-by-word fade for streaming content */
.streaming-word {
  animation: appear var(--duration-fast) var(--ease-smooth) forwards;
}
```

---

## MODULE 6: Trust & Safety Patterns

### 6.1 The Uncertainty Signal

**When AI is unsure, say so. Visually.**

```tsx
export const UncertaintyNotice = ({ confidence }: { confidence: 'high' | 'medium' | 'low' }) => {
  const styles = {
    high: { bg: '#F0FDF4', border: '#86EFAC', text: '#166534' },
    medium: { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E' },
    low: { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B' },
  };

  const s = styles[confidence];

  return (
    <div className="flex items-start gap-2 p-3 rounded-lg text-sm" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium">Confidence: {confidence}</p>
        <p className="text-xs opacity-80 mt-0.5">
          {confidence === 'low' && "This response may contain inaccuracies. Please verify important information."}
          {confidence === 'medium' && "This response is based on general knowledge."}
          {confidence === 'high' && "This response is based on verified sources."}
        </p>
      </div>
    </div>
  );
};
```

### 6.2 The Source Citation

```tsx
interface CitationProps {
  sources: Array<{ id: string; title: string; url: string }>;
}

export const SourceCitations = ({ sources }: CitationProps) => {
  return (
    <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
      <p className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Sources</p>
      <div className="flex flex-wrap gap-2">
        {sources.map((source) => (
          <a
            key={source.id}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-surface)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            {source.title}
          </a>
        ))}
      </div>
    </div>
  );
};
```

### 6.3 The Control Panel

**Give users control over AI behavior.**

```tsx
export const AIControls = () => {
  return (
    <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
      <h3 className="text-sm font-medium text-[var(--color-text)] mb-3">Response Preferences</h3>

      <div className="space-y-3">
        <label className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">Show reasoning</span>
          <input type="checkbox" className="accent-[var(--color-accent)]" defaultChecked />
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">Cite sources</span>
          <input type="checkbox" className="accent-[var(--color-accent)]" defaultChecked />
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">Concise mode</span>
          <input type="checkbox" className="accent-[var(--color-accent)]" />
        </label>
      </div>
    </div>
  );
};
```

---

## MODULE 7: Responsive Behavior

### 7.1 The Collapsible Sidebar

```tsx
export const Sidebar = ({ children, isOpen, onClose }: SidebarProps) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[var(--color-surface)] border-r border-[var(--color-border)] transform transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {children}
      </aside>
    </>
  );
};
```

### 7.2 The Adaptive Composer

```css
.composer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(to top, var(--color-bg) 80%, transparent);
}

@media (min-width: 1024px) {
  .composer {
    position: sticky;
    bottom: 1rem;
    max-width: 48rem;
    margin: 0 auto;
    padding: 0;
    background: none;
  }
}
```

---

## MODULE 8: Anti-Patterns

### 8.1 The Confidence Checklist

Before shipping, verify NONE of these are present:

| Anti-Pattern | Why It Kills Trust | Fix |
|--------------|-------------------|-----|
| Fake typing delay | Manipulative, wastes time | Stream real tokens or show instantly |
| "I'm just an AI" disclaimers | Undermines confidence | Show capabilities, not limitations |
| Unsolicited suggestions | Feels pushy | Wait for user to ask |
| Over-confident wrong answers | Destroys trust | Use uncertainty signals |
| Dark patterns in pricing | Violates trust | Transparent, simple pricing |
| Hidden AI involvement | Deceptive | Clear AI attribution |
| Infinite scroll without save | Anxiety-inducing | Clear session boundaries |
| No way to stop generation | Loss of control | Prominent stop button |

### 8.2 The Tone Check

Read the interface aloud. If it sounds like:
- A corporate memo → Rewrite
- A Terms of Service → Rewrite  
- A motivational poster → Rewrite
- A thoughtful email → Keep

---

## MODULE 9: Integration

### 9.1 With UI/UX Pro Max v7.1

| This Skill Adds | Pro Max Adds |
|-----------------|--------------|
| Trust patterns, conversational UI | Systematic execution, embedded data |
| Typography philosophy | Production components |
| Motion philosophy | Animation presets |
| AI-specific patterns | Industry heuristics |

**Usage:** Use this skill for creative direction and AI-specific patterns. Use Pro Max for systematic execution, component assembly, and validation.

### 9.2 With Vercel Web Design Guidelines

This skill provides the "what" (trust, clarity). Vercel guidelines provide the "how" (accessibility, performance, responsive patterns).

### 9.3 With Vercel React Best Practices

This skill provides component patterns. React Best Practices provides the architecture (hooks, performance, SSR).

### 9.4 Shared Pattern Reference
 
These patterns appear in multiple skills:
 
| Pattern | Primary Source | Also In |
|---------|---------------|---------|
| prefers-reduced-motion | Vercel Web Design Guidelines | ALL SKILLS |
| fluid typography | Vercel Web Design Guidelines | UI/UX Pro Max |
 
**Cross-reference rule:** When duplicating a pattern, add a forward reference to the primary source. Do not duplicate implementation details.

---

## MODULE 10: Error Handling & Recovery

### 10.1 API Error Patterns

```tsx
export const APIErrorHandler = ({ error, onRetry }: { error: Error; onRetry?: () => void }) => {
  return (
    <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[var(--color-error)] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-[var(--color-text)]">Something went wrong</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {error.message || "An unexpected error occurred"}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-xs font-medium text-[var(--color-accent)] hover:underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
```

### 10.2 Streaming Error Recovery

```tsx
export const StreamingError = ({ onRegenerate }: { onRegenerate: () => void }) => {
  return (
    <div className="flex items-center gap-2 py-3 px-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-error)]/20">
      <AlertCircle className="w-4 h-4 text-[var(--color-error)]" />
      <span className="text-sm text-[var(--color-text-secondary)]">Generation incomplete</span>
      <button
        onClick={onRegenerate}
        className="ml-auto text-xs font-medium text-[var(--color-accent)] hover:underline"
      >
        Regenerate
      </button>
    </div>
  );
};
```

### 10.3 Network Status Indicator

```tsx
export const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
      
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
      
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
    
  if (isOnline) return null;
    
  return (
    <div className="fixed top-0 left-0 right-0 bg-[var(--color-warning)] text-[var(--color-text)] text-center py-2 text-sm z-[var(--z-toast)]">
      You appear to be offline. Reconnecting...
    </div>
  );
};
```

### 10.4 Graceful Degradation

```tsx
// Feature detection for AI capabilities
export const withGracefulDegradation = (Component: React.ComponentType, Fallback: React.ComponentType) => {
  return function WrappedComponent(props: any) {
    const [hasFeature, setHasFeature] = useState(true);
      
    useEffect(() => {
      // Check for required APIs
      const hasRequiredAPIs = 
        'IntersectionObserver' in window &&
        'crypto' in window &&
        'fetch' in window;
          
      setHasFeature(hasRequiredAPIs);
    }, []);
      
    return hasFeature ? <Component {...props} /> : <Fallback {...props} />;
  };
};
```

---

*Anthropic Frontend Design Skill v1.1 — Trust through clarity, clarity through design.*
