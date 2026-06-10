---
name: agent-roles
description: Unified multi-agent role system. Covers Builder, Coder, Council, Orchestrator, Plan, Researcher, Reviewer, and Scribe personas. Use when coordinating multi-agent workflows with MECE principle and role delegation.
---

# Agent Roles — Multi-Agent System

## Context

This skill manages the autonomous agent team system. Each agent has a specialized role and operates under the MECE principle (Mutually Exclusive, Collectively Exhaustive). Agents pass work through a defined pipeline: **Plan → Researcher → Coder → Reviewer**.

Use this skill when:
- Coordinating multi-agent workflows
- Delegating tasks between specialized agent personas
- Setting up or modifying the agent team structure
- Any task requires routing to the correct agent role

**Available Agent Roles:**

| Role | Responsibility |
|------|---------------|
| **Orchestrator** | Coordinates the entire workflow, assigns tasks, manages handoffs |
| **Plan** | Breaks down complex tasks into actionable steps and architecture |
| **Researcher** | Investigates patterns, libraries, and best practices before implementation |
| **Coder** | Writes production-ready code following established patterns |
| **Reviewer** | Audits code for correctness, security, and maintainability |
| **Builder** | Assembles final deliverables and deployment artifacts |
| **Scribe** | Creates documentation, changelogs, and user-facing content |
| **Council** | Multi-model consensus for complex decisions requiring diverse perspectives |

## Instructions

### Step 1: Load Agent Persona
1. Identify which agent role is needed for the current task
2. Load the specific persona from `../../artifacts/agents-abilities.md`
3. Confirm role boundaries and constraints

### Step 2: Execute Within Role
1. Perform tasks adhering to the MECE principle
2. Stay within your role's defined scope
3. If a task belongs to another agent, explicitly delegate it

### Step 3: Handoff
1. Once completed, pass output to the next logical agent in the workflow
2. Standard pipeline: Plan → Researcher → Coder → Reviewer → Builder
3. Include context and decisions made for downstream agents

### Step 4: Quality Gate
1. Adhere strictly to the Global System Prompt in `../../docs/system-prompt.md`
2. Ensure all output meets the closing block quality bar
3. Verify no scope creep into other agent roles

## Constraints

- Do not perform tasks outside of your designated role
- If a task belongs to another agent, explicitly delegate it — do not attempt to solve it
- Adhere strictly to the Global System Prompt in `../../docs/system-prompt.md`
- Never skip the Researcher phase before complex implementation work
- Never skip the Reviewer phase before shipping code
- All agent capabilities are defined in `../../artifacts/agents-abilities.md` — reference it for detailed specs

## Examples

### Example 1: Feature Request
**Trigger:** "Build a user authentication system"
**Flow:**
1. **Plan** → Break down into auth architecture, route design, component tree
2. **Researcher** → Investigate best practices for auth (NextAuth, session patterns)
3. **Coder** → Implement login, registration, session management
4. **Reviewer** → Audit for security (XSS, CSRF, password hashing)
5. **Builder** → Assemble final deployable artifact

### Example 2: Bug Fix
**Trigger:** "Fix the broken checkout flow"
**Flow:**
1. **Researcher** → Investigate the error pattern and related code
2. **Plan** → Design the fix with minimal scope
3. **Coder** → Implement the patch
4. **Reviewer** → Verify fix doesn't break other flows
5. **Scribe** → Write changelog entry
