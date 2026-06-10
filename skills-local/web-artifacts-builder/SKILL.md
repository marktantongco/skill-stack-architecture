# Web Artifacts Builder

## Context

Use this skill to create a single-file HTML artifact: a fully self-contained interactive web app that works by opening the file directly in a browser with zero dependencies.

**Trigger phrases:** "create an HTML artifact," "single-file web app," "self-contained HTML," "build an interactive demo."

---

## Instructions

### Step 1: Initialize the Project

1. **Create Vite + React + TypeScript project:**
   ```bash
   npm create vite@latest artifact -- --template react-ts && cd artifact
   npm install tailwindcss @tailwindcss/vite lucide-react class-variance-authority clsx tailwind-merge
   ```
2. **Configure Tailwind** in `vite.config.ts`: add `tailwindcss()` plugin.

### Step 2: Develop Components

3. **Build with React** using functional components and hooks (`useState`, `useReducer`, `useRef`).
4. **Style with Tailwind only.** No external CSS. Use `cn()` helper for conditional classes.
5. **Icons from Lucide React** only.
6. **Make it responsive.** Test at 375px, 768px, and 1280px.
7. **Wire up interactivity.** The artifact must DO something: calculations, visualizations, games, data exploration.
8. **Use semantic HTML:** `<main>`, `<section>`, `<header>`, `<nav>`. Include `aria-label` where needed.
9. **Handle edge cases:** empty states, loading states, error states. Show inline messages, never blank screens.

### Step 3: Bundle into Single HTML

10. **Build:** `npm run build`
11. **Inline all resources** into the single HTML:
    - Small CSS → inline `<style>` block
    - Small JS → inline `<script>` block
    - Images → base64 data URIs or inline SVGs
    - Fonts → system fonts (no Google Fonts CDN)
12. **Test offline:** open HTML directly in browser. Verify no 404s.
13. **Optimize:** remove unused code, ensure < 2MB total.

---

## Constraints

- Final output MUST be a single HTML file that works offline
- NEVER use external CDNs, API calls, or network resources
- NEVER use `alert()`, `prompt()`, or `confirm()` — use inline UI instead
- NEVER use purple gradients or excessive backdrop blur as design crutches
- Design MUST serve content. Every visual element needs a reason.
- Icons MUST be Lucide React (bundled). No external icon services.
- Must be immediately useful when opened. No splash screens or loading spinners.

---

## Examples

### Example 1: Personal Finance Dashboard
- Month-by-month expense tracker with add/delete transactions
- Input form (category, amount, date, optional note)
- Donut chart (inline SVG) showing spending by category
- Summary cards: total income, expenses, net savings
- Dark charcoal background (#1a1a2e) with warm amber accent (#f0a500)
- Single column mobile, two columns desktop

### Example 2: Sorting Algorithm Visualizer
- Bar chart visualization of array values
- Algorithm selector: Bubble Sort, Quick Sort, Merge Sort
- "Generate New Array" button with randomized values
- Speed control slider
- Bars animate: red for comparing, green for swapped
- Monochrome palette with teal accent (#14b8a6)