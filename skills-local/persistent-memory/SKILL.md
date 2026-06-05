# Persistent Memory Skill

## Purpose
Structured memory system for AI agent context continuity across sessions. The #1 universal skill (28 appearances across skill stacks), providing the foundation for every skill stack, pipeline, and blueprint that requires state preservation between interactions.

## Install
```bash
npx skills add ropl-btc/agent-skills@persistent-memory -g -y
```

## Key Features
- Structured memory storage with semantic retrieval
- Session continuity: preserves context across conversation boundaries
- Memory categories: facts, decisions, preferences, learned patterns
- Recall mechanisms: semantic search, temporal queries, association chains
- Memory pruning: importance-based retention with decay curves
- Cross-session context: agent resumes with full awareness of prior work
- Integration point: every other skill benefits from persistent memory

## Architecture
Agent Input → Memory Recall (semantic search) → Context Assembly → LLM
Agent Output → Memory Store (categorize + index) → Persistence Layer (disk/DB)
