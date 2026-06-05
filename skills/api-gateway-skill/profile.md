# API Gateway Skill — Skill Profile

## Purpose

The API Gateway Skill is a request routing, rate limiting, and provider selection middleware that sits between AI client applications and upstream AI provider APIs. Unlike OpenRelay Go which operates at the network/transport layer, the API Gateway operates at the application layer — it receives explicit API requests (typically OpenAI-compatible format), inspects the request payload (model, messages, parameters), and routes the request to the optimal upstream provider based on a configurable routing policy. The routing policy can consider: model availability (which provider supports the requested model), cost optimization (which provider offers the lowest price for the requested model), latency optimization (which provider has the lowest response time), and geographic routing (which provider is closest to the user). The gateway also provides rate limiting (per-user, per-team, per-model), request queuing with priority levels, and response caching for idempotent requests. It exposes a single OpenAI-compatible API endpoint, allowing clients to use a single base URL regardless of which upstream provider ultimately handles the request.

## Individual Use-Case

A SaaS company offers an AI writing assistant that uses GPT-4o for English content and Claude for French content (due to Claude's superior French language performance). Instead of maintaining two separate API client configurations, the company deploys the API Gateway with a routing rule: "If the request language is French, route to Claude; otherwise, route to GPT-4o." The writing assistant sends all requests to the gateway's single endpoint, and the gateway automatically routes each request to the correct provider based on language detection in the prompt. The gateway also enforces rate limits (100 requests/minute per user) and caches common queries (e.g., "translate this to English" for frequently-seen phrases), reducing costs by serving cached responses instead of forwarding to the upstream provider.

## Misconception

The most common misconception is that the API Gateway is a "load balancer" that distributes requests across multiple providers for the same model. In reality, it is a "smart router" — it selects the single best provider for each request based on the routing policy, rather than round-robin distributing across providers. Load balancing across providers for the same model is supported but is not the primary use-case, because different providers have different model behaviors (a request to GPT-4o and Claude will produce different outputs for the same prompt). The gateway routes to the provider that matches the request's intent, not the provider with the most available capacity.

## Conspiracy

The conspiracy theory is that the API Gateway's "cost optimization" routing is actually a mechanism for routing requests to the cheapest (and therefore lowest-quality) provider to maximize the operator's profit margin, while charging the user as if the request went to a premium provider. While it is true that cost optimization can route to cheaper providers, the gateway's routing policy is fully configurable and transparent — the operator chooses whether to optimize for cost, quality, or latency, and the routing decision for each request is logged and auditable. The gateway does not misrepresent which provider handled the request; the response includes the actual provider and model used.

## Mostly Overlooked

The most overlooked feature is the gateway's "semantic caching" capability. Unlike traditional HTTP caching which uses exact URL matching, the gateway can cache responses based on semantic similarity of the prompt. If two users send prompts that are semantically equivalent but phrased differently (e.g., "Summarize this article" vs "Give me a summary of this text"), the gateway can recognize the semantic overlap and serve the cached response, reducing upstream API costs. This is powered by a lightweight embedding model that generates prompt embeddings and compares them using cosine similarity. The second overlooked feature is the gateway's "request priority queue" — when the gateway is at capacity (all upstream connections are busy), incoming requests are queued and prioritized by their priority level (critical > normal > low). Critical requests (e.g., real-time chat) jump to the front of the queue, while low-priority requests (e.g., batch processing) wait until capacity is available.

## Contradictions

The central contradiction is between single-endpoint simplicity and multi-provider complexity. The gateway's value proposition is that clients use a single endpoint, but the routing logic required to correctly select among multiple providers is inherently complex and error-prone. A misconfigured routing rule can send requests to the wrong provider, producing unexpected outputs. The resolution is a "routing policy simulator" that allows operators to test routing rules against sample requests before deploying them to production. A second contradiction is between caching (which saves costs) and freshness (which ensures accuracy) — cached responses may be stale or incorrect for prompts that require real-time information. The resolution is configurable cache TTL and a "bypass cache" header that clients can set for time-sensitive requests.

## Compatible Types

| Type | Compatibility | Reason |
|------|--------------|--------|
| Combined Proxy Billing | HIGH | Gateway routes requests; billing tracks costs per provider — together they provide full-stack routing + billing |
| Openrelay Go | HIGH | OpenRelay handles network-level interception; gateway handles application-level routing — complementary layers |
| Opencode Owl Install Proxy | HIGH | Owl install configures clients to point to the gateway; gateway routes to providers |
| Openhuman Owl Install Proxy | HIGH | Same as Opencode owl — gateway is the upstream that the owl proxy points to |
| persistent-memory | MEDIUM | Routing policies, cache state, and rate limit counters can be persisted |
| deployment-manager | MEDIUM | Gateway can be deployed as a containerized service |
| mcp-builder | MEDIUM | MCP tools can query the gateway's routing and cache status |
| browser-use | LOW | Limited use — could automate gateway dashboard access |

## Not Compatible Types

| Type | Incompatibility | Reason |
|------|----------------|--------|
| Direct provider SDKs that bypass HTTP | MEDIUM | SDKs that use gRPC or proprietary protocols cannot be routed through an HTTP gateway |
| Applications with hardcoded provider URLs | HIGH | If the application doesn't use the gateway's URL, the gateway is bypassed |
| Real-time streaming with sub-100ms requirements | MEDIUM | Gateway adds 5-20ms routing latency; may be unacceptable for ultra-low-latency applications |
| Multi-model ensembling (multiple providers simultaneously) | LOW | Gateway routes to one provider per request; ensembling requires custom middleware |

## Stackable

**YES** — The API Gateway is a core stackable skill that serves as the "spine" of an AI proxy architecture. It can be combined with any client-side proxy (owl-install) as the upstream target, with OpenRelay as a complementary network-layer interceptor, and with Combined Proxy Billing as the billing backend. The stacking principle is "gateway as hub" — all other skills connect to or through the gateway.

## Stackable Best Combined To

| Combination | Synergy |
|-------------|---------|
| API Gateway + Combined Proxy Billing | Maximum: routing + billing = complete AI API management |
| API Gateway + OpenRelay Go | High: network interception + application routing = defense in depth |
| API Gateway + Opencode Owl | High: owl configures client to use gateway; gateway routes to provider |
| API Gateway + persistent-memory | Medium: routing policies and cache survive restarts |
| API Gateway + deployment-manager | Medium: automated deployment of the gateway service |

## Stackable Worst Combined To

| Combination | Conflict |
|-------------|----------|
| API Gateway + another API Gateway | Routing loops — two gateways routing to each other |
| API Gateway + direct SDK clients | SDK clients bypass the gateway entirely |
| API Gateway + ultra-low-latency streaming | Gateway latency (5-20ms) is unacceptable for sub-100ms requirements |
| API Gateway + hardcoded provider URLs | Application bypasses the gateway |
