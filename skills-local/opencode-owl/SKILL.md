# Opencode OWL Proxy Defense Stack

## Purpose
Resilient HTTP proxy with automatic proxy rotation, caching, deduplication, rate limiting, and direct-connection fallback. Designed for OpenCode/Anthropic traffic resilience.

## Install
```bash
bash install.sh
# Installs to: $HOME/.owl-agent/
# Config: $HOME/.owl-agent/config/proxy_pool.json
# Cache: $HOME/.owl-agent/cache/http/
```

## Run
```bash
$HOME/.owl-agent/run.sh
# Or: source $HOME/.owl-agent/venv/bin/activate && python proxy_defense_fixed_v2.py
```

## Key Components
- ResilientClient: Main async HTTP client with retry + fallback
- ProxyRotator: Round-robin proxy selection with health tracking
- HTTPCache: In-memory + disk response cache (TTL-based)
- RequestDeduplicator: Coalesces identical in-flight requests
- DomainRateLimiter: Per-domain token bucket rate limiting
- ProxyPoolLoader: Loads from config + GitHub + public APIs

## Architecture
Request → Cache Check → Dedup Check → Rate Limit → Proxy Rotation → Retry (3x) → Direct Fallback
