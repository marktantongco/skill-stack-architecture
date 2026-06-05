# Opencode Owl Install Proxy — Skill Profile

## Purpose

The Opencode Owl Install Proxy is a lightweight, self-bootstrapping proxy installation skill that automates the setup, configuration, and verification of OpenCode's billing-proxy integration layer. It acts as the "owl" — a watchful daemon that perches between the user's local OpenCode CLI and the upstream AI provider endpoints, intercepting API calls and routing them through a billing-aware proxy without requiring manual configuration editing. The skill handles environment detection (detecting whether the host runs macOS, Linux, or WSL), resolves the correct proxy binary for the platform, installs it into the user's PATH, writes the necessary environment variables (`OPENCODE_PROXY_URL`, `OPENCODE_PROXY_TOKEN`), and validates end-to-end connectivity with a test prompt. It is designed for developers and operators who want a zero-friction onboarding experience for proxying OpenCode's AI API calls through a centralized billing gateway, ensuring that quota tracking, rate-limiting, and cost attribution are enforced without the user needing to understand the underlying proxy architecture.

## Individual Use-Case

A solo developer or team lead who uses OpenCode CLI for AI-assisted coding wants to route all AI requests through a shared billing proxy so that costs are centrally tracked and rate-limits are enforced per-team rather than per-individual API key. Instead of manually downloading a proxy binary, editing shell profiles, and configuring environment variables, the developer runs the owl-install command, which auto-detects the OS, downloads the correct binary, installs it, writes the proxy configuration, and verifies connectivity — all in under 60 seconds. The proxy then transparently intercepts all OpenCode API calls, forwarding them to the upstream provider (e.g., Claude, GPT-4) while logging token usage, enforcing quota ceilings, and providing a `/usage` dashboard endpoint.

## Misconception

The most common misconception is that "Owl Install Proxy" is a VPN or network-layer tunnel that captures all outbound HTTPS traffic. In reality, it operates exclusively at the application layer — it only intercepts calls made by the OpenCode CLI (or SDK) by overriding the base URL that OpenCode uses for its API endpoint. It does not touch browser traffic, other CLI tools, or system-wide networking. Another misconception is that it provides encryption or security beyond what the upstream provider already offers; the proxy is a routing and billing layer, not a security boundary.

## Conspiracy

The conspiracy theory surrounding owl-install proxies is that they are a "man-in-the-middle attack by design" — that by inserting a proxy between the user and the AI provider, the proxy operator can read, log, or modify all prompts and completions in transit. While it is technically true that a proxy can inspect traffic (this is inherent to any proxy architecture), the Opencode Owl Install Proxy is designed to be self-hosted and auditable. The proxy does not exfiltrate data to third parties; all logs remain on the host machine unless the operator explicitly configures remote logging. The conspiracy conflates "capability" with "intent" — any proxy can inspect traffic, but the owl proxy's design goal is billing and quota management, not surveillance.

## Mostly Overlooked

What is mostly overlooked is the proxy's built-in quota pre-flight check. Before forwarding a request to the upstream provider, the proxy queries the billing backend to verify that the user or team has remaining quota. If the quota is exhausted, the proxy returns a structured error immediately — saving the round-trip to the upstream provider and preventing the user from incurring charges that would be rejected by the billing layer anyway. This "fail-fast on quota exhaustion" behavior is the most underrated feature because it prevents phantom charges, reduces latency on denied requests, and provides clear error messages that guide users to their usage dashboard. Additionally, the proxy's support for automatic retry with exponential backoff when upstream providers return 429 (rate-limit) responses is often missed — it silently handles transient rate-limits without surfacing errors to the end user.

## Contradictions

The primary contradiction is between transparency and control. The proxy is designed to be "invisible" to the end user (they should not need to know it exists), but it also needs to enforce quotas and rate-limits, which requires surfacing denial messages when limits are hit. This creates a UX tension: the proxy should be seamless when things work, but informative when they break. A second contradiction is between centralization and resilience — the proxy introduces a single point of failure (if the proxy is down, all OpenCode API calls fail), but its purpose is to centralize billing and quota management. The resolution is that the proxy must include a fail-open mode that bypasses the proxy and falls back to direct API calls when the proxy is unreachable, while logging the bypass event for audit purposes.

## Compatible Types

| Type | Compatibility | Reason |
|------|--------------|--------|
| api-gateway-skill | HIGH | The owl proxy is downstream of the API gateway; together they form a two-layer routing stack (gateway routes to provider, proxy tracks billing) |
| persistent-memory | HIGH | Proxy can store session tokens and quota state in persistent memory for cross-session continuity |
| deployment-manager | HIGH | Owl install can be triggered as part of a deployment pipeline, ensuring all deployed environments have the proxy configured |
| combined-proxy-billing | HIGH | The owl proxy provides the installation layer; combined-proxy-billing provides the multi-provider billing aggregation |
| mcp-builder | MEDIUM | MCP tools can be built to query the proxy's usage endpoint, providing billing visibility to AI agents |
| browser-use | MEDIUM | Browser-use can automate the OAuth flow required to obtain proxy tokens during installation |
| openrelay-go | MEDIUM | OpenRelay can serve as the upstream proxy that owl-install configures OpenCode to route through |

## Not Compatible Types

| Type | Incompatibility | Reason |
|------|----------------|--------|
| Direct API key usage | HIGH | If a user has hardcoded `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` in their environment, the owl proxy is bypassed entirely because OpenCode will use direct endpoints |
| VPN-level proxies (e.g., Clash, V2Ray) | MEDIUM | Network-layer proxies may intercept the proxy's own HTTPS connections, causing double-proxy issues and certificate validation failures |
| Static Docker images without entrypoint hooks | MEDIUM | Owl install modifies shell profiles and environment variables; immutable containers that don't execute shell profiles will lose the proxy configuration on restart |
| Multiple concurrent owl installs | HIGH | Running owl-install twice with different proxy URLs will overwrite the previous configuration without warning, leading to routing confusion |

## Stackable

**YES** — The Opencode Owl Install Proxy is stackable. It can be layered on top of an existing API gateway (the gateway handles provider selection, the proxy handles billing) and beneath a persistent-memory layer (the proxy's session state can be persisted). It stacks cleanly with deployment-manager (install as a pre-deploy step) and with combined-proxy-billing (install configures the local proxy, combined-proxy-billing manages the billing backend). The key stacking principle is that owl-install always operates at the outermost application layer — it configures the client, not the server.

## Stackable Best Combined To

| Combination | Synergy |
|-------------|---------|
| Owl Install + api-gateway-skill | Maximum: owl configures the client, gateway routes to provider, full-stack billing+routing |
| Owl Install + persistent-memory | High: proxy tokens and quota state survive shell restarts and machine reboots |
| Owl Install + deployment-manager | High: proxy installation becomes a repeatable, versioned deployment step |
| Owl Install + combined-proxy-billing | High: install provides the last-mile configuration, billing provides the centralized ledger |
| Owl Install + browser-use | Medium: browser-use automates the OAuth token acquisition during install |

## Stackable Worst Combined To

| Combination | Conflict |
|-------------|----------|
| Owl Install + VPN-level proxy | Double-proxy causes TLS failures and routing loops |
| Owl Install + hardcoded API keys | Keys bypass the proxy entirely, defeating its purpose |
| Owl Install + Openhuman Owl Install | Two competing owl proxies for different clients may write conflicting environment variables |
| Owl Install + immutable containers | Configuration lost on container restart unless baked into image |
