# Combined Proxy Billing — Skill Profile

## Purpose

The Combined Proxy Billing skill is a centralized billing aggregation and cost management layer that unifies billing data from multiple AI provider proxies (OpenCode, OpenHuman, OpenRelay, and direct API providers) into a single ledger. It solves the problem of fragmented billing: when an organization uses multiple AI providers (Claude, GPT-4, Gemini, Mistral) through different proxy configurations, each proxy tracks its own usage independently, making it impossible to answer questions like "How much did we spend on AI last month?" or "Which team is approaching their quota across all providers?" The Combined Proxy Billing skill ingests usage events from all connected proxies via webhooks, normalizes them into a common schema (provider, model, tokens_in, tokens_out, cost_usd, team_id, timestamp), stores them in a SQLite or PostgreSQL database, and exposes REST API endpoints for querying aggregated costs, generating reports, and setting cross-provider quota ceilings. It also provides a real-time dashboard that shows spending trends, per-team breakdowns, and proactive alerts when teams approach their combined quota limits.

## Individual Use-Case

A startup uses Claude for code generation (via Opencode Owl Proxy), GPT-4 for content writing (via direct API), and Gemini for data analysis (via OpenRelay). Each provider has its own billing cycle, pricing model, and usage dashboard. The engineering manager needs a single view of total AI spending across all providers, with per-team attribution and cross-provider quota enforcement. The Combined Proxy Billing skill is deployed as a lightweight service that receives webhook events from all three proxy configurations, normalizes the data, and provides a unified dashboard. The manager can see that Team A spent $340 across Claude ($200) and GPT-4 ($140) this month, and that Team B is at 85% of its $500 combined quota. When Team B hits 100%, the Combined Proxy Billing skill sends a webhook to all connected proxies to enforce a hard stop on Team B's API calls across all providers simultaneously.

## Misconception

The most common misconception is that Combined Proxy Billing replaces individual proxy billing systems. In reality, it is an aggregation layer — it does not replace the billing tracking in each proxy; it consumes billing events from each proxy and adds cross-provider intelligence on top. Individual proxies continue to track their own usage for request-level enforcement, while Combined Proxy Billing provides organization-level visibility and cross-provider quota management. A second misconception is that it requires all proxies to use the same billing backend; in fact, it is designed to ingest heterogeneous billing events from proxies with different schemas, normalizing them at the ingestion layer.

## Conspiracy

The conspiracy theory is that Combined Proxy Billing is a mechanism for an organization to underreport AI usage to providers — by centralizing billing data, the organization could theoretically manipulate usage records before they are reconciled with provider invoices. While it is true that the billing data in Combined Proxy Billing is self-reported by the proxies (not independently verified by the providers), the skill is designed for cost management, not fraud. The billing events are append-only and tamper-evident (each event is hashed and chained to the previous event), making post-hoc manipulation detectable. Furthermore, the ultimate billing authority remains with the AI providers — their invoices are the ground truth, and Combined Proxy Billing is a management tool, not a billing substitution.

## Mostly Overlooked

The most overlooked feature is the skill's support for "cost anomaly detection." Using a simple statistical model (exponential moving average of daily spending per team), the skill automatically detects when a team's spending deviates significantly from its historical pattern (e.g., a sudden 5x spike) and sends an alert before the team's quota is exhausted. This is critical because quota ceilings are typically set based on expected usage patterns, and a sudden spike may indicate a misconfigured agent loop, a leaked API key, or a runaway workflow. The second overlooked feature is the skill's support for "budget forecasting" — based on historical spending patterns, it projects when each team will exhaust its quota and estimates the projected end-of-month spend, allowing managers to proactively adjust quotas or negotiate volume discounts with providers.

## Contradictions

The primary contradiction is between real-time enforcement and eventual consistency. The Combined Proxy Billing skill wants to enforce cross-provider quotas in real-time (e.g., immediately block a team's API calls when their combined quota is exhausted), but the billing events from different proxies arrive with different latencies (some proxies report events within seconds, others batch-report every 5 minutes). This means the quota check may be based on stale data, allowing a team to temporarily exceed their quota. The resolution is a "soft limit + hard limit" model: the soft limit triggers alerts and slows down requests (adding artificial latency), while the hard limit (set 10-15% above the soft limit) triggers an immediate hard stop. A second contradiction is between granularity and performance — storing per-request billing events enables detailed analysis but creates a large database; aggregating events per-hour or per-day improves performance but loses granularity. The resolution is tiered storage: recent events are stored at full granularity, and events older than 30 days are aggregated to hourly summaries.

## Compatible Types

| Type | Compatibility | Reason |
|------|--------------|--------|
| Opencode Owl Install Proxy | HIGH | Opencode owl sends billing events to combined-proxy-billing via webhooks |
| Openhuman Owl Install Proxy | HIGH | Openhuman owl sends per-tenant billing events with attribution metadata |
| Openrelay Go | HIGH | OpenRelay auto-discovers quotas and can report usage events to combined billing |
| api-gateway-skill | HIGH | API gateway can route billing queries to the combined billing service |
| persistent-memory | MEDIUM | Billing state and quota thresholds can be persisted for crash recovery |
| deployment-manager | MEDIUM | Combined billing service can be deployed and managed via deployment-manager |
| mcp-builder | MEDIUM | MCP tools can be built to query billing data from the combined ledger |
| browser-use | LOW | Limited applicability — could automate billing dashboard access |

## Not Compatible Types

| Type | Incompatibility | Reason |
|------|----------------|--------|
| Provider-native billing dashboards | MEDIUM | Native dashboards (e.g., Anthropic Console) don't integrate with custom billing aggregation |
| Direct API key usage (no proxy) | HIGH | Without a proxy, there are no billing events to aggregate |
| Multiple competing combined billing services | HIGH | Two combined billing services would double-count events, producing inaccurate totals |
| Real-time trading/bidding systems | MEDIUM | Billing aggregation has eventual consistency; not suitable for sub-second financial decisions |

## Stackable

**YES** — Combined Proxy Billing is fundamentally a stackable skill. It sits at the aggregation layer, consuming events from multiple proxy installations (Opencode Owl, Openhuman Owl, OpenRelay) and providing a unified view on top. It stacks with api-gateway-skill (gateway routes billing queries), persistent-memory (persist billing state), and deployment-manager (deploy the billing service). It is the "top of the stack" for billing — everything else feeds into it.

## Stackable Best Combined To

| Combination | Synergy |
|-------------|---------|
| Combined Billing + Opencode Owl + Openhuman Owl | Maximum: full billing coverage across coding and workflow AI |
| Combined Billing + Openrelay Go | High: OpenRelay provides quota discovery, Combined Billing provides cross-provider enforcement |
| Combined Billing + api-gateway-skill | High: gateway exposes billing APIs to other services |
| Combined Billing + persistent-memory | Medium: billing state survives service restarts |
| Combined Billing + deployment-manager | Medium: automated deployment of the billing service |

## Stackable Worst Combined To

| Combination | Conflict |
|-------------|----------|
| Combined Billing + another Combined Billing instance | Double-counting of billing events |
| Combined Billing + direct API keys (no proxy) | Missing billing events create incomplete data |
| Combined Billing + provider-native billing only | Native billing is not webhook-driven, cannot feed into aggregation |
| Combined Billing + high-frequency trading systems | Eventual consistency is insufficient for financial-grade real-time |
