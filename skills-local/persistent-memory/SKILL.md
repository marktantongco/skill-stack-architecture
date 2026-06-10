---
name: persistent-memory-manager
description: Initializes and maintains the structured memory system for agent context continuity.
---

# Persistent Memory Manager

## Context
Use this skill to ensure the AI agent retains context across crashes, pauses, and long-running sessions. The memory system relies on `JARVIS_MEMORY.md` to track active state, and `.antigravityignore` to keep token counts optimized.

## Instructions
1. **Initialize**: Check if `JARVIS_MEMORY.md` and `.antigravityignore` exist in the workspace root. If missing, create them using standard scaffolding.
2. **Restore**: At the beginning of a session, read `JARVIS_MEMORY.md`. Acknowledge the last task and crash marker.
3. **Log Progress**: After completing a major task, update the `[ ]` checkboxes to `[x]` in `JARVIS_MEMORY.md`.
4. **Update Timestamp**: Update the `Last Timestamp` field to the current time.
5. **Extract Permanent Knowledge**: If a task reveals a new structural rule or codebase pattern, append it to `NOTES_TECHNIQUES.md` and remove it from `JARVIS_MEMORY.md` to avoid bloat.

## Constraints
- **NEVER** store raw logs or large code snippets in `JARVIS_MEMORY.md`.
- **NEVER** index directories listed in `.antigravityignore` unless explicitly overridden by the user.
- **NEVER** let `JARVIS_MEMORY.md` exceed 100 lines. Refactor old tasks out if it grows too large.

## Examples
### Ideal JARVIS_MEMORY.md Update
```markdown
# Active Session
- Last Timestamp: 2026-05-05T21:30:00+08:00
- Crash Marker: Clean exit

# Current Focus
- [x] Implement login component
- [ ] Connect login to auth API
```
