# MCP Builder — Skill Profile

## Purpose

The MCP Builder is a Model Context Protocol server construction toolkit that enables developers to create, test, and deploy MCP servers — standardized interfaces that expose tools, resources, and prompts to AI agents. MCP (Model Context Protocol) is an open standard developed by Anthropic that defines how AI agents discover and interact with external capabilities. The MCP Builder provides the scaffolding, code generation, testing framework, and deployment patterns needed to build production-grade MCP servers. In the context of AI billing proxy infrastructure, the MCP Builder is used to create MCP servers that expose billing and proxy management capabilities as AI-agent-consumable tools — for example, an MCP tool that allows an AI agent to query current spending, check quota status, or update routing policies. This enables AI agents (like Claude in an IDE) to proactively manage billing and routing without requiring the human operator to switch to a separate dashboard or CLI tool.

## Individual Use-Case

A team uses Claude Code (Claude's IDE extension) for AI-assisted development. They want Claude to be able to check the team's AI spending, alert them when they're approaching their quota, and suggest cost-saving optimizations (e.g., switching from Claude Opus to Claude Sonnet for routine tasks). They use the MCP Builder to create an MCP server that exposes three tools: `get_spending` (returns current month's spending by provider), `check_quota` (returns quota status for the team), and `suggest_optimization` (analyzes spending patterns and suggests cheaper model alternatives). After building and deploying the MCP server, they configure Claude Code to connect to it. Now, during a coding session, Claude can proactively say "I notice your team has used 85% of this month's Claude Opus quota. Would you like me to switch to Claude Sonnet for routine completions to save costs?" — all powered by the MCP tools built with MCP Builder.

## Misconception

The most common misconception is that MCP Builder creates AI chatbots or AI agents. In reality, it creates the server-side interface that AI agents connect to — it defines the tools and resources that an AI agent can invoke, but it does not implement the AI agent itself. An MCP server is more like an API (specifically, a JSON-RPC API) that an AI agent calls to perform actions. A second misconception is that MCP is Anthropic-specific and only works with Claude; in reality, MCP is an open standard that any AI agent can implement, and there are MCP clients for Claude, GPT, and open-source LLMs.

## Conspiracy

The conspiracy theory is that MCP is a mechanism for Anthropic to control the AI agent ecosystem — by defining the standard protocol for agent-tool interaction, Anthropic can steer which tools are available, how they are described, and which agents can access them. While it is true that Anthropic originated the MCP specification, it is an open standard (published on GitHub with a permissive license), and any provider or developer can implement MCP clients and servers. The MCP Builder itself is tool-agnostic — it generates MCP servers that work with any compliant MCP client, not just Claude.

## Mostly Overlooked

The most overlooked feature is the MCP Builder's support for "tool annotations" — metadata that describes a tool's behavior characteristics (readOnly, destructive, idempotent). These annotations are critical for AI agent safety: a tool marked as `destructiveHint: true` signals to the AI agent that it should ask for human confirmation before invoking the tool, while a tool marked as `readOnlyHint: true` can be called freely without risk. In the billing context, `get_spending` would be marked as readOnly (safe to call anytime), while `update_quota` would be marked as destructive (should require human confirmation). The second overlooked feature is the MCP Builder's "evaluation mode" — a built-in testing framework that automatically validates MCP servers against the specification, checking that all tools have descriptions, that schemas are valid, that error responses use the correct format, and that destructive tools have the appropriate annotations.

## Contradictions

The central contradiction is between standardization and flexibility. MCP's value is that it provides a standard interface for agent-tool interaction, but standardization inherently limits flexibility — if every tool must conform to the MCP schema, then tools with unique interaction patterns (e.g., streaming responses, binary data, multi-step workflows) must be shoehorned into the MCP format. The resolution is MCP's support for "resource subscriptions" and "prompt templates" — extension points that allow non-standard interactions while maintaining protocol compliance. A second contradiction is between agent autonomy and safety — MCP tools enable AI agents to take actions autonomously, but some actions (like updating billing quotas) should require human approval. The resolution is the annotation system (destructiveHint, readOnlyHint) and the MCP client's responsibility to enforce confirmation for destructive operations.

## Compatible Types

| Type | Compatibility | Reason |
|------|--------------|--------|
| Combined Proxy Billing | HIGH | Expose billing data as MCP tools that AI agents can query |
| api-gateway-skill | MEDIUM | Expose routing policies and cache status as MCP tools |
| persistent-memory | MEDIUM | MCP tools can read/write persistent memory for cross-session state |
| deployment-manager | LOW-MEDIUM | Expose deployment status and rollback as MCP tools |
| browser-use | LOW | Browser automation could be wrapped as an MCP tool |
| Opencode Owl Install Proxy | LOW | Limited — install proxy doesn't expose runtime APIs |
| Openhuman Owl Install Proxy | LOW-MEDIUM | Expose tenant management as MCP tools |
| openrelay-go | LOW-MEDIUM | Expose relay status and registry as MCP tools |

## Not Compatible Types

| Type | Incompatibility | Reason |
|------|----------------|--------|
| Non-MCP AI agent frameworks | MEDIUM | MCP servers only work with MCP-compliant clients |
| Real-time streaming protocols (WebSocket, SSE) | MEDIUM | MCP is request-response; streaming requires workarounds |
| Binary data processing | MEDIUM | MCP is text-based; binary data must be base64-encoded |
| Low-latency control loops | MEDIUM | JSON-RPC overhead adds latency; not suitable for sub-millisecond control |

## Stackable

**YES** — MCP Builder is a meta-skill that creates integration points for other skills. It stacks with Combined Proxy Billing (to expose billing as MCP tools), api-gateway-skill (to expose routing as MCP tools), and persistent-memory (to provide state to MCP tools). The stacking principle is "MCP as the API layer" — it makes other skills' capabilities accessible to AI agents through a standard protocol.

## Stackable Best Combined To

| Combination | Synergy |
|-------------|---------|
| MCP Builder + Combined Proxy Billing | Maximum: billing data becomes AI-agent-queryable |
| MCP Builder + api-gateway-skill | High: routing policies become AI-agent-manageable |
| MCP Builder + persistent-memory | Medium: MCP tools can persist state across sessions |
| MCP Builder + Openhuman Owl | Medium: tenant management exposed to AI agents |
| MCP Builder + deployment-manager | Medium: deployment status visible to AI agents |

## Stackable Worst Combined To

| Combination | Conflict |
|-------------|----------|
| MCP Builder + non-MCP agent frameworks | MCP servers can't communicate with non-compliant clients |
| MCP Builder + real-time streaming systems | Request-response model conflicts with streaming |
| MCP Builder + binary data pipelines | Base64 overhead and size limits cause issues |
| MCP Builder + ultra-low-latency systems | JSON-RPC serialization adds unacceptable latency |
