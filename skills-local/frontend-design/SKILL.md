# frontend-design

## context
Use this skill when you need to turn a design idea into a polished, responsive user interface. It leverages shadcn/ui, Tailwind CSS, and React to produce production‑ready frontend code, not just wireframes.

## instructions
1. Provide a description of the UI, a Figma link, or a screenshot.
2. The skill analyses the design and extracts the core components, layout, and interactions.
3. It generates a complete, single‑file React component using Tailwind and shadcn/ui primitives.
4. The output includes: responsive breakpoints, dark mode support, and accessibility attributes (`aria`).
5. Additionally, it produces a Storybook story for the component to enable independent testing.

## constraints
- Never output plain HTML/CSS; always use React + Tailwind + shadcn.
- All components must be functional, not placeholder.
- Include explicit `alt` texts for images and keyboard navigation for interactive elements.
- Do not add unnecessary dependencies beyond shadcn/ui and Tailwind.

## examples
1. Input: "A pricing page with three tiers (free, pro, enterprise), a toggle for annual/monthly, and a FAQ accordion below."  
   Output: A single `<Pricing />` component with state for billing period, dynamic price display, and an accordion.