---
name: web-design-guidelines
description: Quick self-audit checklist for Vercel best practices: typography, color, spacing, responsiveness, and accessibility. Use in tandem with frontend-design to prevent design inconsistencies. For comprehensive guidelines, see vercel-web-design-guidelines.
---

# web-design-guidelines

## context
This skill ensures every frontend you build follows Vercel's best practices for typography, color, spacing, and accessibility. Use it in tandem with `frontend-design` to prevent design inconsistencies across projects.

## instructions
1. Before starting any UI work, load these guidelines automatically as a reference.
2. When generating a component, check:  
   - **Typography**: Use a single type scale with at most 2 font families (system fonts preferred).  
   - **Colors**: Stick to a 7‑color palette (primary, secondary, accent, background, text, success, error). No custom hex values without a token.  
   - **Spacing**: Follow an 8px grid; margins and paddings should be multiples of 8.  
   - **Responsiveness**: Design mobile‑first, then add breakpoints at 640px, 768px, 1024px.  
   - **Accessibility**: Color contrast ratio ≥ 4.5:1, focus indicators visible, form labels always present.
3. After building a component, run a quick self‑audit using these rules and report any violations.

## constraints
- This is a design system rulebook, not a code generator.
- Never override these guidelines unless you have a specific brand‑identity override documented.
- Violations must be noted explicitly when they occur, with a reason.

## examples
1. Component: Button. Check: font size from type scale (16px), primary color from palette, padding 8px 16px (multiple of 8), focus ring visible, contrast yes.