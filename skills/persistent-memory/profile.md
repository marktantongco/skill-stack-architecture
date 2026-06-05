# Persistent Memory — Skill Profile

## Purpose

Persistent Memory is a cross-session state persistence skill that enables AI agents and automation tools to store, retrieve, and manage state data that survives process restarts, shell session terminations, and machine reboots. It provides a key-value store with namespacing, TTL (time-to-live) expiration, atomic operations, and change notifications. In the context of AI billing proxy infrastructure, Persistent Memory is the glue that holds everything together: it stores OAuth2 tokens and refresh tokens (so the Openhuman Owl proxy can re-authenticate without user interaction), quota thresholds and current spend (so the Combined Billing service can enforce limits without re-fetching from the database), routing policies and cache state (so the API Gateway can resume with its previous configuration after a restart), and connection pool state (so OpenRelay Go can re-establish connections quickly). Persistent Memory is not a database replacement — it is a lightweight, low-latency state store optimized for the specific patterns of AI proxy infrastructure: frequent reads, infrequent writes, TTL-based expiration (for tokens), and namespace isolation (so different skills don't accidentally overwrite each other's state).

## Individual Use-Case

The Openhuman Owl Install Proxy needs to store the OAuth2 access token and refresh token so that the token refresh watchdog daemon can automatically obtain new access tokens when the current one expires. Currently, these tokens are stored in a flat file (`~/.config/openhuman-proxy/config.env`), which is fragile — if the file is accidentally deleted or corrupted, the proxy loses its authentication and the user must manually re-authenticate. By using Persistent Memory, the tokens are stored in a structured, atomic, and replicated store. If the file is deleted, Persistent Memory can restore it from its own storage. If the token is updated by the watchdog daemon, Persistent Memory atomically updates both its internal store and the config file, ensuring consistency. The watchdog daemon can also subscribe to change notifications, so it is immediately notified if the token is updated externally (e.g., by a manual re-authentication).

## Misconception

The most common misconception is that Persistent Memory is "just Redis" or "just SQLite." While it shares some characteristics with both (key-value operations like Redis, durability like SQLite), Persistent Memory is specifically designed for AI agent state management — it includes features that neither Redis nor SQLite provides out-of-the-box: namespace isolation per skill (so the API Gateway's state doesn't collide with Combined Billing's state), TTL with automatic cleanup (so expired tokens are automatically removed), change notification via webhooks (so skills can react to state changes in real-time), and a schema validation layer (so malformed state data is rejected before it corrupts the store). A second misconception is that Persistent Memory replaces databases — it does not; it is a cache and state store, not a primary data store.

## Conspiracy

The conspiracy theory is that Persistent Memory is a surveillance tool that records everything an AI agent does across sessions, creating a permanent record of all interactions. While it is true that Persistent Memory stores state data, it stores only what the skills explicitly choose to persist — it does not automatically record all agent interactions. The data stored is operational state (tokens, quotas, routing policies), not conversation logs or user behavior. Furthermore, Persistent Memory supports per-namespace TTL, so sensitive data (like tokens) automatically expires and is deleted after a configurable period.

## Mostly Overlooked

The most overlooked feature is Persistent Memory's support for "optimistic concurrency control" (OCC). When multiple skills or processes try to update the same key simultaneously, OCC ensures that only one update succeeds and the others are rejected with a "conflict" error, preventing race conditions. This is critical for the Combined Billing service, where multiple proxy instances may try to update the same team's spend counter simultaneously. Without OCC, concurrent updates could be lost, leading to inaccurate billing. The second overlooked feature is "state snapshots" — Persistent Memory can take a point-in-time snapshot of its entire state (or a specific namespace) and restore from it later. This is useful for creating "known-good" configurations that can be restored if a deployment goes wrong.

## Contradictions

The central contradiction is between durability and performance. The most durable store writes every update to disk before acknowledging it (fsync on every write), but this is slow (1-10ms per write). The fastest store keeps everything in memory and writes to disk asynchronously, but this risks data loss on crash. Persistent Memory resolves this with configurable durability levels: "sync" (fsync on every write, slow but safe), "async" (batch writes every 100ms, fast but may lose up to 100ms of data on crash), and "memory" (no disk writes, fastest but volatile). A second contradiction is between shared access and isolation — multiple skills need to share the same store, but they also need isolation to prevent accidental interference. The resolution is namespace isolation with configurable access control.

## Compatible Types

| Type | Compatibility | Reason |
|------|--------------|--------|
| Opencode Owl Install Proxy | HIGH | Stores proxy tokens, configuration state, and connectivity status |
| Openhuman Owl Install Proxy | HIGH | Stores OAuth2 tokens, refresh tokens, tenant configuration |
| Combined Proxy Billing | HIGH | Stores quota thresholds, current spend, and enforcement state |
| api-gateway-skill | HIGH | Stores routing policies, cache state, and rate limit counters |
| openrelay-go | MEDIUM | Stores connection pool state, registry cache, and failover preferences |
| deployment-manager | MEDIUM | Stores deployment state, rollback points, and canary configuration |
| browser-use | MEDIUM | Stores session checkpoints, cookies, and automation state |
| mcp-builder | LOW | MCP tools can use persistent memory for tool state |

## Not Compatible Types

| Type | Incompatibility | Reason |
|------|----------------|--------|
| Large binary data (images, videos) | HIGH | Persistent Memory is optimized for small key-value state; use object storage for large binaries |
| High-throughput event streams | MEDIUM | Not designed for streaming; use a message queue (Kafka, RabbitMQ) |
| Multi-datacenter replication | MEDIUM | Persistent Memory is single-node; for multi-DC, use a distributed store |
| Full-text search | HIGH | No indexing or search capabilities; use Elasticsearch or similar |

## Stackable

**YES** — Persistent Memory is the most universally stackable skill. Virtually every other skill benefits from persisting its state through Persistent Memory. It serves as the "foundation layer" that all other skills can build on. The stacking principle is "persistent-memory as the substrate" — it provides the state management that makes other skills reliable across restarts.

## Stackable Best Combined To

| Combination | Synergy |
|-------------|---------|
| Persistent Memory + Openhuman Owl | Maximum: OAuth tokens survive watchdog restarts, automatic re-auth works |
| Persistent Memory + Combined Proxy Billing | High: quota state and enforcement survive service restarts |
| Persistent Memory + API Gateway | High: routing policies and cache survive gateway restarts |
| Persistent Memory + Deployment Manager | Medium: deployment state and rollback points are durable |
| Persistent Memory + Browser-Use | Medium: session checkpoints survive between automation runs |

## Stackable Worst Combined To

| Combination | Conflict |
|-------------|----------|
| Persistent Memory + large binary storage | Not designed for large objects; causes memory pressure |
| Persistent Memory + high-throughput event streaming | Wrong tool; use a message queue instead |
| Persistent Memory + multi-DC distributed store | Single-node; conflicts with distributed consistency requirements |
| Persistent Memory + full-text search engine | No search capabilities; use a dedicated search engine |
