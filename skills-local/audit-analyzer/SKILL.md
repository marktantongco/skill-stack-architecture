---
name: audit-analyzer
description: Automates detection and prioritization of audit-related issues across the workspace. Scans for performance, accessibility, and monitoring signals. Use when analyzing audit errors or requesting actionable improvement patches.
---

# Audit Analyzer

## Context

Automates detection and prioritization of audit-related issues across the workspace. Scans documentation and code for performance, accessibility, and monitoring signals; outputs actionable improvements and small, safe patches. Triggers on phrases like "Analyze audit errors" or "Audit analysis".

---

## Instructions

1) Discover audit signals across the workspace
- Scan for common audit signals: Lighthouse performance hints (LCP, FID, CLS), Lighthouse scores, caching headers, accessibility hints (aria-labels, alt text), error monitoring (Sentry, uptime), and common deployment concerns (CI/CD, rollback, smoke tests).
- Identify files and sections referencing these signals.

2) Classify and prioritize improvements
- Group findings into categories: Performance, Accessibility, Monitoring/Errors, Build/Deployment.
- Score items by impact vs effort to get 80/20 high-leverage fixes.

3) Propose concrete patches (small, safe changes)
- For each high-priority item, provide a minimal patch snippet and the target file path.
- Include a short rationale and a quick test step.

4) Output format
- Return a compact plan with: Category, File, Patch Snippet, Why it helps, and Test steps.

5) Apply or stage changes
- Suggest applying changes directly or creating a patch file for review.
- Do not push to remote; leave review to user.

6) Optional: Create a new SKILL.md on success
- If user approves, codify this as a new skill under /workspace/skills/audit-analyzer/SKILL.md

---

## Constraints

- Do not perform destructive operations without explicit user approval.
- Focus on small, incremental changes that are safe and testable.
- Do not modify tests unless explicitly requested.
- Output only actionable patches and plan summaries.

---

## Examples

### Example 1: Missing Sentry integration
- Category: Monitoring/Errors
- File: src/main.jsx
- Patch:
```js
+import * as Sentry from '@sentry/react';
+Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
```
- Why it helps: enables error tracking and alerting; Test: ensure Sentry captures an error in a test route.

### Example 2: Large hero image causing slow LCP
- Category: Performance
- File: src/components/Hero.jsx
- Patch:
```jsx
+<img src={hero} alt="Hero" loading="lazy" />
```
- Why it helps: reduces LCP; Test: Lighthouse shows improved LCP after patch.

### Example 3: Missing alt text hurting accessibility
- Category: Accessibility
- File: src/components/Image.jsx
- Patch:
```jsx
+<img src={logo} alt="Company logo" />
```
- Why it helps: improves accessibility score; Test: axe or Lighthouse shows improved accessibility.