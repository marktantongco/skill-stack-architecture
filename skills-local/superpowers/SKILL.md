# superpowers

## context
Use this skill when starting any development project. It orchestrates spec‑first architecture, test‑driven development, and sub‑agent delegation — replacing a staff engineer, QA planner, and release manager in one integrated workflow.

## instructions
1. **Specload**: Before writing any code, extract or create a detailed specification (user stories, data models, figma links). Output the spec as a referenceable artifact.
2. **Architecture Review**: Analyse the spec and design the system architecture (component tree, data flow, route design). Identify edge cases and failure points.
3. **Plan**: Break the work into small, testable steps. Assign each step to a "sub‑agent" (e.g., "UI Agent", "API Agent").
4. **Test First**: For each step, write the acceptance criteria and, where possible, automated tests before implementing.
5. **Build**: Implement the code, ensuring all tests pass.
6. **Ship**: Generate release notes, changelog, and deployment checklist. Hand off to the Deployment Manager skill if available.

## constraints
- Never skip spec generation, even for small changes.
- Architecture review must happen before any code is written.
- Every step must have a clear definition of done.
- Do not merge sub‑agents; keep them independent to avoid context pollution.

## examples
1. Project: Build a task management app.  
   - Spec: User can create/update/delete tasks, tasks have due dates, drag‑and‑drop reordering.  
   - Architecture: React frontend with Drag & Drop context, Node.js API with SQLite, JWT auth.  
   - Plan: 1) Scaffold frontend and backend, 2) Implement auth, 3) Build task CRUD, 4) Add drag‑and‑drop.  
   - Each step tested with Vitest & Playwright before moving on.