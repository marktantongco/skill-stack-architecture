# MCP Builder Skill

## Purpose
Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Provides a four-phase development workflow: Research → Implementation → Testing → Evaluation.

## Install
```bash
npx skills add anthropics/skills@mcp-builder -g -y
```

## Key Features
- Four-phase development: Research → Implementation → Testing → Evaluation
- Language support: TypeScript (MCP SDK, recommended) and Python (FastMCP)
- Transport: Streamable HTTP (remote), stdio (local)
- Schema design: Zod (TS) / Pydantic (Python) for input; outputSchema + structuredContent
- Tool annotations: readOnlyHint, destructiveHint, idempotentHint, openWorldHint
- Evaluation framework: 10 independent, read-only, complex questions with verifiable answers
- Reference: MCP protocol spec, SDK docs, best practices guide

## Architecture
Research (API docs) → Design (tool schemas) → Implement (TS/Python MCP server)
→ Test (evaluation questions) → Deploy (stdio or HTTP transport)
