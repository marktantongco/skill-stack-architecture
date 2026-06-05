# Openhuman Owl Install Proxy — Skill Profile

## Purpose

The Openhuman Owl Install Proxy is the companion installation skill to the Opencode Owl Install Proxy, specifically designed for the OpenHuman platform — a human-in-the-loop AI orchestration framework that pairs AI agents with human reviewers for quality-gated workflows. While the Opencode variant focuses on CLI-based coding assistance, the Openhuman variant handles the more complex authentication and session management requirements of human-AI collaborative environments. The skill automates the installation of a proxy daemon that sits between OpenHuman's agent runtime and upstream AI providers, intercepting all API calls to enforce billing attribution per-human-reviewer, per-agent, and per-workflow. It manages OAuth2 PKCE flows for human identity, supports multi-tenant proxy configurations (different teams can have different proxy endpoints), and includes a built-in health-check daemon that monitors proxy connectivity and automatically re-authenticates when tokens expire. The Openhuman owl proxy also supports "shadow mode" — a dual-write mode where requests are sent both to the proxy and directly to the upstream provider, allowing operators to validate proxy accuracy without risking service disruption.

## Individual Use-Case

A product team uses OpenHuman to run AI-assisted content moderation workflows where AI agents draft moderation decisions and human reviewers approve or override them. Each workflow invocation consumes AI tokens, and costs must be attributed to the specific team, workflow, and human reviewer. The Openhuman Owl Install Proxy is installed on each agent runtime host, configuring the OpenHuman SDK to route all AI API calls through the billing proxy. The proxy enriches each request with metadata (team_id, workflow_id, reviewer_id) before forwarding it upstream, and the billing backend uses this metadata to generate per-team cost reports. The team lead can then see exactly how much each workflow costs, which reviewers trigger the most expensive AI calls, and whether any agents are approaching their quota limits. The owl install handles the entire setup — including the OAuth flow that authenticates the human reviewer's identity — in a single command.

## Misconception

The primary misconception is that "Openhuman" means the proxy is designed for human-level API access (i.e., humans making API calls directly). In reality, OpenHuman refers to the platform's human-in-the-loop architecture — the proxy serves AI agent calls, but attributes billing to the human reviewers who are part of the workflow. A second misconception is that the Openhuman owl proxy is simply a renamed version of the Opencode owl proxy; while they share the same installation framework, the Openhuman variant includes significant additional functionality for OAuth2 PKCE, multi-tenant routing, and shadow-mode dual-write that the Opencode variant does not have.

## Conspiracy

The conspiracy theory is that the Openhuman Owl Install Proxy's shadow mode (dual-write to both proxy and direct endpoint) is a mechanism for secretly duplicating all AI prompts and completions to a second destination — essentially a built-in data exfiltration channel. While shadow mode does send requests to two endpoints, both endpoints are configured by the operator (not hardcoded), and the feature is explicitly opt-in with clear logging. The conspiracy also suggests that the "per-human-reviewer billing attribution" is actually a surveillance mechanism that tracks which humans interact with which AI outputs, building a behavioral profile. While the billing attribution does create audit trails of human-AI interactions, this is a feature, not a bug — it is necessary for compliance in regulated industries (healthcare, finance) where every AI-assisted decision must be traceable to a human reviewer.

## Mostly Overlooked

The most overlooked feature is the proxy's automatic token refresh with zero-downtime re-authentication. When the OAuth2 access token expires (typically every 60 minutes), the proxy automatically uses the stored refresh token to obtain a new access token without interrupting any in-flight requests. This is critical for long-running OpenHuman workflows that may take hours to complete — without automatic token refresh, the workflow would fail mid-execution when the token expires. The second overlooked feature is the proxy's support for "billing tags" — arbitrary key-value pairs that can be attached to any request and are propagated through to the billing backend. This allows teams to tag requests with metadata like `project:acme-redesign` or `sprint:42` and then generate cost reports grouped by these tags, enabling granular cost attribution that goes beyond team or workflow level.

## Contradictions

The central contradiction is between auditability and privacy. The proxy's design goal is to create detailed audit trails of every AI interaction (who triggered it, what was sent, what was returned, how much it cost), but this creates a privacy concern — especially in human-AI workflows where the human's identity and actions are recorded. The resolution is that the proxy supports configurable audit granularity: operators can choose to log full request/response bodies (for regulated industries), metadata only (for cost tracking), or aggregate statistics only (for privacy-sensitive environments). A second contradiction is between shadow mode's reliability benefits and its cost: dual-write doubles API costs during shadow mode operation, which is counterproductive for a billing management tool. The resolution is that shadow mode is intended as a temporary validation tool, not a permanent operating mode — it should be enabled for 24-48 hours when onboarding a new proxy configuration and then disabled.

## Compatible Types

| Type | Compatibility | Reason |
|------|--------------|--------|
| Opencode Owl Install Proxy | HIGH | Both can coexist on the same host, serving different client applications (OpenCode CLI vs OpenHuman runtime) |
| combined-proxy-billing | HIGH | Openhuman owl provides the installation and authentication layer; combined-proxy-billing handles the multi-provider billing aggregation |
| persistent-memory | HIGH | OAuth tokens, refresh tokens, and billing tags can be persisted across sessions |
| api-gateway-skill | MEDIUM | API gateway can route to the correct upstream provider; Openhuman proxy handles billing and attribution |
| deployment-manager | MEDIUM | Installation can be integrated into deployment pipelines for OpenHuman runtime environments |
| browser-use | HIGH | Browser-use automates the OAuth2 PKCE flow during installation, handling the interactive consent screen |
| mcp-builder | MEDIUM | MCP tools can query the proxy's billing and audit endpoints |
| openrelay-go | LOW | OpenRelay's auto-discovery may conflict with Openhuman's explicit multi-tenant routing |

## Not Compatible Types

| Type | Incompatibility | Reason |
|------|----------------|--------|
| VPN-level proxies | MEDIUM | VPN proxies intercept HTTPS connections, causing certificate validation failures for the OAuth2 flow |
| Static service accounts without refresh tokens | HIGH | Openhuman proxy relies on refresh tokens for zero-downtime re-auth; service accounts that only support API keys cannot use the OAuth flow |
| Single-tenant billing systems | MEDIUM | The proxy's multi-tenant routing is wasted if the billing backend cannot attribute costs per-tenant |
| Hardcoded direct API endpoints in OpenHuman config | HIGH | If the OpenHuman SDK is configured with direct provider URLs, the owl proxy is bypassed entirely |

## Stackable

**YES** — The Openhuman Owl Install Proxy is stackable and is specifically designed to coexist with the Opencode Owl Install Proxy on the same host. They use different environment variable prefixes (`OPENCODE_PROXY_*` vs `OPENHUMAN_PROXY_*`) and different configuration directories (`~/.config/opencode-proxy/` vs `~/.config/openhuman-proxy/`). The Openhuman proxy also stacks with persistent-memory (for token persistence), browser-use (for OAuth automation), and combined-proxy-billing (for centralized billing). The stacking principle is "install layer on top of billing layer" — the owl proxy handles installation and authentication, while other skills handle the downstream billing and routing.

## Stackable Best Combined To

| Combination | Synergy |
|-------------|---------|
| Openhuman Owl + Opencode Owl | Maximum: both AI coding and human-AI workflow billing covered on same host |
| Openhuman Owl + browser-use | High: browser-use automates the OAuth2 PKCE consent flow during install |
| Openhuman Owl + persistent-memory | High: tokens, billing tags, and quota state survive process restarts |
| Openhuman Owl + combined-proxy-billing | High: install configures the client, billing aggregates costs across providers |
| Openhuman Owl + api-gateway-skill | Medium: gateway routes, proxy tracks — two-layer observability |

## Stackable Worst Combined To

| Combination | Conflict |
|-------------|----------|
| Openhuman Owl + VPN-level proxy | OAuth2 PKCE fails through VPN due to redirect interception |
| Openhuman Owl + service-account-only auth | No refresh tokens available, automatic re-auth fails |
| Openhuman Owl + single-tenant billing backend | Multi-tenant routing adds overhead with no benefit |
| Openhuman Owl + hardcoded direct URLs | Proxy bypassed entirely, no billing attribution |
