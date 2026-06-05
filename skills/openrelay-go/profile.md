# Openrelay Go — Skill Profile

## Purpose

OpenRelay Go is a high-performance, Go-based AI API relay and auto-discovery daemon that transparently intercepts API calls to 45+ AI applications (Claude, ChatGPT, Cursor, Windsurf, Copilot, and more) and routes them through a centralized proxy layer. Unlike the owl-install proxies which are client-side configuration tools, OpenRelay Go operates at the network/service layer — it runs as a system daemon or Docker container that listens on a local port, intercepts outbound HTTPS connections to known AI provider endpoints, and either forwards them directly (pass-through mode) or routes them through a billing-aware backend (relay mode). Its signature feature is "auto-discovery": it ships with a regularly-updated registry of AI application endpoints (e.g., `api.anthropic.com`, `api.openai.com`, `copilot-proxy.githubusercontent.com`) and automatically configures interception rules for all of them. This means that when a new AI tool is installed on the machine, OpenRelay automatically starts proxying its API calls without any manual configuration. The Go implementation provides sub-millisecond relay overhead, connection pooling, and graceful degradation when the billing backend is unreachable.

## Individual Use-Case

A development agency has 20 developers each using a different combination of AI coding tools (some use Cursor, some use Windsurf, some use Copilot, some use Claude CLI). The agency needs to track and limit AI spending per-developer across all tools, but each tool has its own API endpoint and authentication mechanism. Instead of configuring each tool individually (which would require 20 developers × 4 tools = 80 configurations), the agency deploys OpenRelay Go as a Docker container on the office network. OpenRelay automatically discovers and intercepts all AI API calls from all tools, routes them through the billing backend, and enforces per-developer quotas. A developer who hits their quota is blocked across all tools simultaneously — their Cursor, Copilot, and Claude CLI all stop working at once, rather than each tool independently hitting its own provider-level rate limit.

## Misconception

The most dangerous misconception is that OpenRelay Go is a "crack" or "keygen" that provides free access to paid AI APIs. In reality, OpenRelay is a routing and billing proxy — it does not bypass authentication, generate API keys, or circumvent provider access controls. Users must still have valid API keys or subscriptions with each AI provider. OpenRelay routes existing authenticated requests through a billing layer; it does not create unauthorized access. A second misconception is that auto-discovery means the proxy automatically knows about every AI tool ever created; in reality, the registry must be periodically updated (OpenRelay ships with a default registry and supports custom entries, but newly-released tools require a registry update).

## Conspiracy

The conspiracy theory is that OpenRelay's auto-discovery feature is actually a network surveillance tool — by intercepting connections to 45+ AI endpoints, it can monitor which employees are using which AI tools, what prompts they are sending, and what responses they are receiving, creating a comprehensive surveillance dataset. While it is technically true that a proxy can inspect all traffic passing through it, OpenRelay's default configuration operates in "metadata-only" mode — it logs the destination, timing, and token counts of requests but does not log request/response bodies. Full-body logging is available but is explicitly opt-in and disabled by default. The conspiracy also suggests that the registry of 45+ endpoints is a list of "targets" for exploitation; in reality, it is simply a list of known AI API endpoints that OpenRelay can intercept, similar to a hosts file or a PAC configuration.

## Mostly Overlooked

The most overlooked feature is OpenRelay's support for "provider failover chains." When a primary AI provider is down or rate-limiting, OpenRelay can automatically fall back to a secondary provider that offers a compatible model. For example, if `claude-3-opus` is unavailable (429 or 503), OpenRelay can automatically route the request to `gpt-4o` with the same prompt, and the response is returned to the client application as if it came from the original provider. This failover is transparent to the end user — their Cursor or Copilot session continues working even when the primary provider is down. The second overlooked feature is OpenRelay's "connection warm-up" — it pre-establishes TLS connections and connection pools to all known AI endpoints at startup, so the first request to any endpoint has no TLS handshake latency. This reduces cold-start latency by 200-500ms per connection.

## Contradictions

The central contradiction is between transparency and control. OpenRelay's auto-discovery makes it invisible to end users (they don't need to configure anything), but this invisibility is also a control mechanism — the network administrator can route, throttle, or block AI traffic without the user's knowledge or consent. This is by design in enterprise environments where the organization owns the network and the AI spending, but it creates an ethical tension in personal or shared environments. A second contradiction is between performance and observability — the fastest relay is one that does nothing (pass-through with no logging), but the purpose of the proxy is to provide billing and usage visibility, which requires at least metadata logging. The resolution is configurable observability levels: "audit" (full body logging), "billing" (metadata + token counts), and "pass-through" (no logging, maximum performance).

## Compatible Types

| Type | Compatibility | Reason |
|------|--------------|--------|
| Combined Proxy Billing | HIGH | OpenRelay generates billing events; Combined Billing aggregates them |
| api-gateway-skill | HIGH | API gateway handles provider selection; OpenRelay handles network-level interception |
| deployment-manager | HIGH | OpenRelay can be deployed as a Docker container via deployment-manager |
| persistent-memory | MEDIUM | Connection state, registry cache, and failover chain preferences can be persisted |
| Opencode Owl Install Proxy | MEDIUM | Opencode owl configures the client; OpenRelay intercepts at the network level — they can coexist |
| Openhuman Owl Install Proxy | MEDIUM | Same as Opencode owl; both can coexist with OpenRelay |
| mcp-builder | LOW | MCP tools could query OpenRelay's status endpoint |
| browser-use | LOW | Limited use — could automate registry updates |

## Not Compatible Types

| Type | Incompatibility | Reason |
|------|----------------|--------|
| TLS certificate pinning | HIGH | Applications that pin provider certificates will reject OpenRelay's TLS interception |
| Direct VPN tunnels to AI providers | MEDIUM | VPN bypasses OpenRelay's network-level interception |
| Client-side proxy configuration (e.g., owl-install) | LOW-MEDIUM | Not strictly incompatible, but creates double-proxy overhead if both are active |
| Zero-trust network architectures | MEDIUM | OpenRelay's MITM-like interception conflicts with zero-trust principles |

## Stackable

**YES** — OpenRelay Go is stackable, but with caveats. It operates at the network layer and can coexist with client-side proxy configurations (owl-install), though doing so creates double-proxy overhead. It stacks best with Combined Proxy Billing (as the event source), api-gateway-skill (as the routing layer), and deployment-manager (for deployment automation). The key stacking principle is "network layer + application layer" — OpenRelay handles interception, and other skills handle what happens after interception.

## Stackable Best Combined To

| Combination | Synergy |
|-------------|---------|
| OpenRelay + Combined Proxy Billing | Maximum: OpenRelay intercepts, Billing aggregates — complete visibility |
| OpenRelay + api-gateway-skill | High: network interception + intelligent routing |
| OpenRelay + deployment-manager | High: automated containerized deployment |
| OpenRelay + persistent-memory | Medium: connection state survives restarts |
| OpenRelay + Opencode Owl | Medium: client + network dual coverage (with overhead) |

## Stackable Worst Combined To

| Combination | Conflict |
|-------------|----------|
| OpenRelay + TLS pinning apps | Complete failure — pinned apps reject interception |
| OpenRelay + VPN to AI providers | VPN bypasses OpenRelay entirely |
| OpenRelay + another network proxy (Clash, V2Ray) | Double-interception causes routing loops and TLS failures |
| OpenRelay + zero-trust architecture | Architectural conflict — interception vs verification |
