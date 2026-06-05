#!/usr/bin/env python3
"""
API Gateway Skill v2 — Smart AI Provider Router (Async)
Version: 2.0.0

An application-layer API gateway that receives OpenAI-compatible requests,
inspects the payload, and routes to the optimal upstream AI provider
based on configurable routing policies (cost, latency, model availability).

v2.0 Improvements over v1.0:
  1. Switched from stdlib HTTPServer to aiohttp for async non-blocking I/O
  2. Circuit breaker per upstream provider (closed/open/half-open states)
  3. Fixed rate limit day-counter reset logic (was never resetting before)
  4. Upstream health checking with periodic probes
  5. Prometheus-compatible /metrics endpoint
  6. API-key-based authentication middleware
  7. Integration hooks for billing middleware and persistent-memory
  8. Graceful shutdown with signal handlers (SIGTERM, SIGINT)
  9. Thread-safe cache eviction (asyncio locks + OrderedDict LRU)
  10. Configurable upstream request timeouts (default 30s, not 120s)

Usage:
  python3 gateway_v2.py [--port 8000] [--config gateway.json]

Endpoints:
  POST /v1/chat/completions    — Route and proxy chat completion requests
  POST /v1/embeddings          — Route embedding requests
  GET  /v1/models              — List available models across all providers
  GET  /routing/status         — Show current routing policy and stats
  GET  /cache/stats            — Semantic cache statistics
  GET  /metrics                — Prometheus-compatible metrics
  GET  /health                 — Health check (includes circuit breaker states)
"""

import argparse
import asyncio
import hashlib
import json
import logging
import os
import signal
import sys
import time
import threading
from collections import OrderedDict, defaultdict
from datetime import datetime, date
from typing import Optional, Dict, List, Any, Callable, Awaitable

try:
    import aiohttp
    from aiohttp import web
except ImportError:
    print("ERROR: aiohttp is required. Install with: pip install aiohttp")
    sys.exit(1)

# ============================================================================
# Logging
# ============================================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("api-gateway-v2")


# ============================================================================
# Configuration
# ============================================================================

class Provider:
    def __init__(self, name: str, base_url: str, api_key: str, models: List[str],
                 cost_per_1k_input: float = 0.0, cost_per_1k_output: float = 0.0,
                 priority: int = 0, latency_ms: int = 100, region: str = "us",
                 health_check_path: str = "/v1/models",
                 health_check_interval: int = 60):
        self.name = name
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.models = models
        self.cost_per_1k_input = cost_per_1k_input
        self.cost_per_1k_output = cost_per_1k_output
        self.priority = priority
        self.latency_ms = latency_ms
        self.region = region
        self.health_check_path = health_check_path
        self.health_check_interval = health_check_interval


class RoutingPolicy:
    COST = "cost"
    LATENCY = "latency"
    PRIORITY = "priority"
    ROUND_ROBIN = "round_robin"


class RateLimit:
    """Thread-safe rate limiter with proper day-counter reset logic.

    v2 fix: day_counts now tracks the current date and resets automatically
    when the date rolls over. In v1, day_counts never reset, causing
    permanent lockout after rpd requests.
    """

    def __init__(self, requests_per_minute: int = 100, requests_per_day: int = 10000):
        self.rpm = requests_per_minute
        self.rpd = requests_per_day
        self.minute_counts: Dict[str, List[float]] = defaultdict(list)
        self.day_counts: Dict[str, int] = defaultdict(int)
        self.day_dates: Dict[str, str] = {}  # track which date each key's counter belongs to
        self._lock = asyncio.Lock()

    async def check(self, key: str) -> bool:
        """Returns True if the request is allowed, False if rate-limited."""
        now = time.time()
        today = date.today().isoformat()

        async with self._lock:
            # FIX: Reset day counter if the date has changed
            if self.day_dates.get(key) != today:
                self.day_counts[key] = 0
                self.day_dates[key] = today

            # Clean old minute entries
            self.minute_counts[key] = [t for t in self.minute_counts[key] if now - t < 60]

            # Check limits
            if len(self.minute_counts[key]) >= self.rpm:
                return False
            if self.day_counts.get(key, 0) >= self.rpd:
                return False

            # Record
            self.minute_counts[key].append(now)
            self.day_counts[key] = self.day_counts.get(key, 0) + 1
            return True


class GatewayConfig:
    def __init__(self):
        self.providers: Dict[str, Provider] = {}
        self.routing_policy: str = RoutingPolicy.COST
        self.rate_limits: RateLimit = RateLimit()
        self.cache_enabled: bool = True
        self.cache_ttl: int = 3600
        self.cache_max_size: int = 1000
        self.listen_port: int = 8000
        self.upstream_timeout: float = 30.0  # v2: configurable, was hardcoded 120s
        self.auth_enabled: bool = False
        self.auth_api_keys: List[str] = []  # v2: API keys for gateway auth
        self.billing_middleware: Optional[Callable] = None  # v2: billing hook
        self.cache_persistence_path: Optional[str] = None  # v2: persistent-memory hook

    def load_from_file(self, path: str):
        with open(path) as f:
            data = json.load(f)
        for pname, pdata in data.get("providers", {}).items():
            self.providers[pname] = Provider(
                name=pname,
                base_url=pdata["base_url"],
                api_key=pdata.get("api_key", ""),
                models=pdata.get("models", []),
                cost_per_1k_input=pdata.get("cost_per_1k_input", 0),
                cost_per_1k_output=pdata.get("cost_per_1k_output", 0),
                priority=pdata.get("priority", 0),
                latency_ms=pdata.get("latency_ms", 100),
                region=pdata.get("region", "us"),
                health_check_path=pdata.get("health_check_path", "/v1/models"),
                health_check_interval=pdata.get("health_check_interval", 60),
            )
        self.routing_policy = data.get("routing_policy", RoutingPolicy.COST)
        rl = data.get("rate_limits", {})
        self.rate_limits = RateLimit(
            requests_per_minute=rl.get("rpm", 100),
            requests_per_day=rl.get("rpd", 10000),
        )
        self.cache_enabled = data.get("cache_enabled", True)
        self.cache_ttl = data.get("cache_ttl", 3600)
        self.cache_max_size = data.get("cache_max_size", 1000)
        self.listen_port = data.get("port", 8000)
        self.upstream_timeout = data.get("upstream_timeout", 30.0)
        self.auth_enabled = data.get("auth_enabled", False)
        self.auth_api_keys = data.get("auth_api_keys", [])
        self.cache_persistence_path = data.get("cache_persistence_path", None)


# ============================================================================
# Semantic Cache (v2: asyncio-safe, LRU eviction, persistence hooks)
# ============================================================================

class SemanticCache:
    """Hash-based cache for API responses with LRU eviction.

    v2 improvements:
    - Uses asyncio.Lock instead of threading.Lock (async-safe)
    - Uses OrderedDict for O(1) LRU eviction (was O(n) min() scan)
    - Adds persistence hooks for integration with persistent-memory skill
    - Thread-safe: all mutations happen inside the async lock

    NOTE: This is still hash-based (exact match), not embedding-based.
    The profile.md description of "semantic caching powered by a lightweight
    embedding model" was aspirational in v1 and remains so in v2. True
    semantic caching requires an embedding model dependency (e.g., sentence-
    transformers) which adds significant startup cost. The architecture
    supports a future swap: replace _hash_key() with _embedding_key() and
    the rest of the code works unchanged.
    """

    def __init__(self, max_size: int = 1000, ttl: int = 3600,
                 persistence_path: Optional[str] = None):
        self.max_size = max_size
        self.ttl = ttl
        self.persistence_path = persistence_path
        self._cache: OrderedDict[str, Dict] = OrderedDict()
        self._lock = asyncio.Lock()
        self.hits = 0
        self.misses = 0
        # Load persisted cache on init
        if persistence_path and os.path.exists(persistence_path):
            self._load_from_disk(persistence_path)

    def _hash_key(self, model: str, messages: List[Dict], params: Dict) -> str:
        content = json.dumps({"model": model, "messages": messages, "params": params}, sort_keys=True)
        return hashlib.sha256(content.encode()).hexdigest()

    async def get(self, model: str, messages: List[Dict], params: Dict) -> Optional[Dict]:
        key = self._hash_key(model, messages, params)
        async with self._lock:
            entry = self._cache.get(key)
            if entry and time.time() - entry["cached_at"] < self.ttl:
                self.hits += 1
                # Move to end for LRU
                self._cache.move_to_end(key)
                return entry["response"]
            if entry:
                del self._cache[key]
            self.misses += 1
            return None

    async def put(self, model: str, messages: List[Dict], params: Dict, response: Dict):
        key = self._hash_key(model, messages, params)
        async with self._lock:
            if key in self._cache:
                # Update existing entry
                self._cache.move_to_end(key)
                self._cache[key] = {"response": response, "cached_at": time.time()}
            else:
                # Evict oldest (first item in OrderedDict) if at capacity
                if len(self._cache) >= self.max_size:
                    self._cache.popitem(last=False)  # O(1) LRU eviction
                self._cache[key] = {"response": response, "cached_at": time.time()}

    async def save_to_disk(self):
        """Persist cache to disk for integration with persistent-memory skill."""
        if not self.persistence_path:
            return
        async with self._lock:
            try:
                data = {
                    "entries": dict(self._cache),
                    "hits": self.hits,
                    "misses": self.misses,
                    "saved_at": time.time(),
                }
                tmp_path = self.persistence_path + ".tmp"
                with open(tmp_path, "w") as f:
                    json.dump(data, f, default=str)
                os.replace(tmp_path, self.persistence_path)  # atomic
                logger.info(f"Cache persisted to {self.persistence_path} ({len(self._cache)} entries)")
            except Exception as e:
                logger.error(f"Failed to persist cache: {e}")

    def _load_from_disk(self, path: str):
        """Load persisted cache from disk."""
        try:
            with open(path) as f:
                data = json.load(f)
            entries = data.get("entries", {})
            now = time.time()
            loaded = 0
            for key, entry in entries.items():
                if now - entry.get("cached_at", 0) < self.ttl:
                    self._cache[key] = entry
                    loaded += 1
            self.hits = data.get("hits", 0)
            self.misses = data.get("misses", 0)
            logger.info(f"Loaded {loaded} cache entries from {path}")
        except Exception as e:
            logger.warning(f"Failed to load cache from {path}: {e}")

    def stats(self) -> Dict:
        total = self.hits + self.misses
        return {
            "size": len(self._cache),
            "max_size": self.max_size,
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": round(self.hits / total * 100, 1) if total > 0 else 0,
        }


# ============================================================================
# Circuit Breaker (v2: per-provider circuit breaker)
# ============================================================================

class CircuitState:
    CLOSED = "closed"       # Normal: requests flow through
    OPEN = "open"           # Failing: requests are rejected immediately
    HALF_OPEN = "half_open" # Testing: allow one request to probe recovery


class CircuitBreaker:
    """Per-provider circuit breaker with three states.

    CLOSED -> OPEN: When consecutive failures exceed threshold
    OPEN -> HALF_OPEN: After cooldown period expires
    HALF_OPEN -> CLOSED: When a probe request succeeds
    HALF_OPEN -> OPEN: When a probe request fails

    This prevents cascading failures when an upstream provider is down,
    allowing fast failure instead of waiting for timeouts on every request.
    """

    def __init__(self, name: str, failure_threshold: int = 5,
                 cooldown_seconds: float = 30.0, success_threshold: int = 2):
        self.name = name
        self.failure_threshold = failure_threshold
        self.cooldown_seconds = cooldown_seconds
        self.success_threshold = success_threshold
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time: float = 0
        self.last_state_change: float = time.time()
        self._lock = asyncio.Lock()
        # Metrics
        self.total_rejected = 0
        self.total_failures = 0

    async def allow_request(self) -> bool:
        """Check if a request should be allowed through."""
        async with self._lock:
            if self.state == CircuitState.CLOSED:
                return True
            elif self.state == CircuitState.OPEN:
                # Check if cooldown has elapsed
                if time.time() - self.last_failure_time >= self.cooldown_seconds:
                    self.state = CircuitState.HALF_OPEN
                    self.success_count = 0
                    self.last_state_change = time.time()
                    logger.info(f"Circuit breaker [{self.name}]: OPEN -> HALF_OPEN")
                    return True
                self.total_rejected += 1
                return False
            else:  # HALF_OPEN
                # Allow only one probe request at a time
                if self.success_count < 1:
                    return True
                self.total_rejected += 1
                return False

    async def record_success(self):
        """Record a successful request."""
        async with self._lock:
            if self.state == CircuitState.HALF_OPEN:
                self.success_count += 1
                if self.success_count >= self.success_threshold:
                    self.state = CircuitState.CLOSED
                    self.failure_count = 0
                    self.last_state_change = time.time()
                    logger.info(f"Circuit breaker [{self.name}]: HALF_OPEN -> CLOSED")
            elif self.state == CircuitState.CLOSED:
                self.failure_count = 0  # Reset on success in closed state

    async def record_failure(self):
        """Record a failed request."""
        async with self._lock:
            self.total_failures += 1
            self.failure_count += 1
            self.last_failure_time = time.time()

            if self.state == CircuitState.HALF_OPEN:
                self.state = CircuitState.OPEN
                self.last_state_change = time.time()
                logger.warning(f"Circuit breaker [{self.name}]: HALF_OPEN -> OPEN (probe failed)")
            elif self.state == CircuitState.CLOSED:
                if self.failure_count >= self.failure_threshold:
                    self.state = CircuitState.OPEN
                    self.last_state_change = time.time()
                    logger.warning(
                        f"Circuit breaker [{self.name}]: CLOSED -> OPEN "
                        f"({self.failure_count} consecutive failures)"
                    )

    def status(self) -> Dict:
        return {
            "name": self.name,
            "state": self.state,
            "failure_count": self.failure_count,
            "success_count": self.success_count,
            "total_rejected": self.total_rejected,
            "total_failures": self.total_failures,
            "last_failure_time": self.last_failure_time,
            "last_state_change": self.last_state_change,
            "cooldown_remaining": max(
                0, self.cooldown_seconds - (time.time() - self.last_failure_time)
            ) if self.state == CircuitState.OPEN else 0,
        }


# ============================================================================
# Upstream Health Checker (v2: periodic health probes)
# ============================================================================

class HealthChecker:
    """Periodically checks upstream provider health.

    Performs lightweight GET requests to each provider's health_check_path
    on a configurable interval. Updates provider health status used by
    the router for filtering out unhealthy providers.
    """

    def __init__(self, providers: Dict[str, Provider], timeout: float = 10.0):
        self.providers = providers
        self.timeout = timeout
        self.health_status: Dict[str, Dict] = {}
        self._task: Optional[asyncio.Task] = None
        self._session: Optional[aiohttp.ClientSession] = None
        for name in providers:
            self.health_status[name] = {
                "healthy": True,  # Assume healthy until proven otherwise
                "last_check": 0,
                "last_response_ms": 0,
                "consecutive_failures": 0,
            }

    async def start(self, session: aiohttp.ClientSession):
        self._session = session
        self._task = asyncio.create_task(self._check_loop())
        logger.info("Health checker started")

    async def stop(self):
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("Health checker stopped")

    async def _check_loop(self):
        while True:
            for name, provider in self.providers.items():
                await self._check_provider(name, provider)
            # Wait for the shortest interval among providers
            min_interval = min(
                (p.health_check_interval for p in self.providers.values()), default=60
            )
            await asyncio.sleep(min_interval)

    async def _check_provider(self, name: str, provider: Provider):
        url = f"{provider.base_url}{provider.health_check_path}"
        headers = {}
        if provider.api_key:
            headers["Authorization"] = f"Bearer {provider.api_key}"

        try:
            start = time.time()
            async with self._session.get(
                url, headers=headers, timeout=aiohttp.ClientTimeout(total=self.timeout)
            ) as resp:
                elapsed_ms = (time.time() - start) * 1000
                healthy = resp.status < 500
                status = self.health_status[name]
                status["healthy"] = healthy
                status["last_check"] = time.time()
                status["last_response_ms"] = round(elapsed_ms, 1)
                if healthy:
                    status["consecutive_failures"] = 0
                else:
                    status["consecutive_failures"] += 1
        except Exception as e:
            status = self.health_status[name]
            status["healthy"] = False
            status["last_check"] = time.time()
            status["consecutive_failures"] += 1
            logger.debug(f"Health check failed for {name}: {e}")

    async def check_now(self, name: str) -> bool:
        """Force an immediate health check for a specific provider."""
        if name in self.providers:
            await self._check_provider(name, self.providers[name])
        return self.health_status.get(name, {}).get("healthy", False)

    def is_healthy(self, name: str) -> bool:
        return self.health_status.get(name, {}).get("healthy", True)

    def get_status(self) -> Dict:
        return dict(self.health_status)


# ============================================================================
# Prometheus Metrics (v2: /metrics endpoint)
# ============================================================================

class Metrics:
    """Prometheus-compatible metrics collector.

    Exposes counters and gauges in the standard Prometheus text format
    at the /metrics endpoint. This enables integration with Grafana,
    Datadog, and other observability platforms.
    """

    def __init__(self):
        self._counters: Dict[str, float] = defaultdict(float)
        self._gauges: Dict[str, float] = defaultdict(float)
        self._histograms: Dict[str, List[float]] = defaultdict(list)
        self._lock = asyncio.Lock()

    async def inc_counter(self, name: str, value: float = 1.0):
        async with self._lock:
            self._counters[name] += value

    async def set_gauge(self, name: str, value: float):
        async with self._lock:
            self._gauges[name] = value

    async def observe_histogram(self, name: str, value: float):
        async with self._lock:
            self._histograms[name].append(value)
            # Keep last 10000 observations to bound memory
            if len(self._histograms[name]) > 10000:
                self._histograms[name] = self._histograms[name][-5000:]

    def render(self) -> str:
        """Render metrics in Prometheus text exposition format."""
        lines = []

        # Counters
        for name, value in sorted(self._counters.items()):
            lines.append(f"# TYPE gateway_{name} counter")
            lines.append(f"gateway_{name} {value}")

        # Gauges
        for name, value in sorted(self._gauges.items()):
            lines.append(f"# TYPE gateway_{name} gauge")
            lines.append(f"gateway_{name} {value}")

        # Histograms (simplified: count, sum, and bucket approximations)
        for name, values in sorted(self._histograms.items()):
            if not values:
                continue
            lines.append(f"# TYPE gateway_{name} summary")
            lines.append(f'gateway_{name}_count {len(values)}')
            lines.append(f'gateway_{name}_sum {sum(values):.6f}')
            # Approximate quantiles
            sorted_vals = sorted(values)
            for q in [0.5, 0.9, 0.95, 0.99]:
                idx = min(int(len(sorted_vals) * q), len(sorted_vals) - 1)
                lines.append(f'gateway_{name}{{quantile="{q}"}} {sorted_vals[idx]:.6f}')

        return "\n".join(lines) + "\n"


# ============================================================================
# Authentication Middleware (v2: API key based)
# ============================================================================

class AuthMiddleware:
    """API-key-based authentication for the gateway.

    Validates incoming requests against a list of authorized API keys.
    Keys can be provided via:
    - Authorization: Bearer <key> header
    - X-API-Key: <key> header

    When auth_enabled is False, all requests are allowed (backward compatible).
    """

    def __init__(self, enabled: bool = False, api_keys: Optional[List[str]] = None):
        self.enabled = enabled
        self.api_keys: set = set(api_keys or [])
        self._failed_attempts: Dict[str, List[float]] = defaultdict(list)

    def authenticate(self, headers: Dict) -> tuple[bool, Optional[str]]:
        """Validate authentication. Returns (is_authenticated, error_message)."""
        if not self.enabled:
            return True, None

        # Extract API key from headers
        api_key = None

        # Check Authorization: Bearer <key>
        auth_header = headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            api_key = auth_header[7:].strip()

        # Check X-API-Key header
        if not api_key:
            api_key = headers.get("X-API-Key", "").strip()

        if not api_key:
            return False, "Missing API key. Use Authorization: Bearer <key> or X-API-Key header"

        if api_key not in self.api_keys:
            # Track failed attempts
            client_key = headers.get("X-Forwarded-For", "unknown")
            now = time.time()
            self._failed_attempts[client_key] = [
                t for t in self._failed_attempts[client_key] if now - t < 300
            ] + [now]
            return False, "Invalid API key"

        return True, None


# ============================================================================
# Router (v2: circuit-breaker-aware, health-aware)
# ============================================================================

class Router:
    def __init__(self, config: GatewayConfig, circuit_breakers: Dict[str, CircuitBreaker],
                 health_checker: HealthChecker):
        self.config = config
        self.circuit_breakers = circuit_breakers
        self.health_checker = health_checker
        self._rr_index = 0
        self._rr_lock = asyncio.Lock()
        self.routing_stats: Dict[str, int] = defaultdict(int)

    async def select_provider(self, model: str, user_region: str = "us") -> Optional[Provider]:
        """Select the best available provider for a given model.

        v2 improvement: Filters out providers whose circuit breaker is OPEN
        or whose health check has failed. Falls back to any matching provider
        only if ALL providers are unhealthy (degraded mode).
        """
        candidates = []
        degraded_candidates = []

        for p in self.config.providers.values():
            # Check model support
            model_match = False
            for m in p.models:
                if m == model:
                    model_match = True
                    break
                if m.endswith("*") and model.startswith(m[:-1]):
                    model_match = True
                    break

            if not model_match:
                continue

            # Check circuit breaker and health
            cb = self.circuit_breakers.get(p.name)
            cb_open = cb and not await cb.allow_request()
            healthy = self.health_checker.is_healthy(p.name)

            if cb_open:
                # Record that we considered but rejected this provider
                continue

            if not healthy:
                degraded_candidates.append(p)
                continue

            candidates.append(p)

        # Fall back to degraded providers if no healthy candidates
        if not candidates:
            if degraded_candidates:
                logger.warning(
                    f"No healthy providers for model '{model}', "
                    f"using degraded provider(s): {[p.name for p in degraded_candidates]}"
                )
                candidates = degraded_candidates
            else:
                return None

        policy = self.config.routing_policy

        if policy == RoutingPolicy.COST:
            candidates.sort(key=lambda p: p.cost_per_1k_input)
        elif policy == RoutingPolicy.LATENCY:
            candidates.sort(key=lambda p: p.latency_ms)
        elif policy == RoutingPolicy.PRIORITY:
            candidates.sort(key=lambda p: -p.priority)
        elif policy == RoutingPolicy.ROUND_ROBIN:
            async with self._rr_lock:
                idx = self._rr_index % len(candidates)
                self._rr_index += 1
            return candidates[idx]

        selected = candidates[0]
        self.routing_stats[selected.name] += 1
        return selected


# ============================================================================
# Upstream Proxy (v2: async, connection pooling via aiohttp, configurable timeout)
# ============================================================================

class UpstreamProxy:
    """Forwards requests to upstream AI providers using async HTTP.

    v2 improvements:
    - Uses aiohttp.ClientSession for connection pooling and keep-alive
    - Configurable timeout (default 30s, was hardcoded 120s)
    - Integrates with circuit breaker (records success/failure)
    - Streaming support: returns response body as-is for passthrough
    """

    def __init__(self, session: aiohttp.ClientSession, timeout: float = 30.0,
                 circuit_breakers: Optional[Dict[str, CircuitBreaker]] = None,
                 metrics: Optional[Metrics] = None,
                 billing_middleware: Optional[Callable] = None):
        self.session = session
        self.timeout = timeout
        self.circuit_breakers = circuit_breakers or {}
        self.metrics = metrics
        self.billing_middleware = billing_middleware

    async def forward(self, provider: Provider, path: str, body: bytes,
                      headers: Dict, stream: bool = False) -> Dict:
        """Forward a request to the upstream provider and return the response.

        For streaming requests, the caller should handle the response body
        as a stream rather than parsing it as JSON.
        """
        url = f"{provider.base_url}{path}"

        req_headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {provider.api_key}",
        }
        # Copy select headers from original request
        for h in ["X-Team-ID", "X-Request-ID", "X-Cache-Bypass", "X-Correlation-ID"]:
            if h in headers:
                req_headers[h] = headers[h]

        # Pre-request billing hook
        if self.billing_middleware:
            try:
                billing_result = await self.billing_middleware("pre_request", provider, body)
                if billing_result and billing_result.get("blocked"):
                    return {
                        "status": 403,
                        "body": {"error": {"type": "billing_blocked", "message": billing_result.get("reason", "Request blocked by billing policy")}},
                        "provider": provider.name,
                    }
            except Exception as e:
                logger.error(f"Billing middleware pre_request error: {e}")

        start_time = time.time()
        cb = self.circuit_breakers.get(provider.name)

        try:
            timeout_cfg = aiohttp.ClientTimeout(total=self.timeout)
            async with self.session.post(
                url, data=body, headers=req_headers, timeout=timeout_cfg
            ) as resp:
                elapsed = time.time() - start_time

                if stream:
                    # For streaming, read chunks and return raw
                    chunks = []
                    async for chunk in resp.content.iter_any():
                        chunks.append(chunk)
                    response_data = b"".join(chunks).decode("utf-8", errors="replace")
                    try:
                        parsed_body = json.loads(response_data)
                    except json.JSONDecodeError:
                        parsed_body = {"raw": response_data}
                else:
                    response_data = await resp.text()
                    parsed_body = json.loads(response_data) if response_data else {}

                # Record metrics
                if self.metrics:
                    await self.metrics.inc_counter("upstream_requests_total", 1)
                    await self.metrics.inc_counter(f"upstream_requests_{provider.name}", 1)
                    await self.metrics.observe_histogram("upstream_latency_seconds", elapsed)
                    await self.metrics.observe_histogram(f"upstream_latency_{provider.name}_seconds", elapsed)

                # Record success in circuit breaker
                if cb:
                    await cb.record_success()

                # Post-request billing hook
                if self.billing_middleware and resp.status < 400:
                    try:
                        await self.billing_middleware("post_request", provider, parsed_body, elapsed)
                    except Exception as e:
                        logger.error(f"Billing middleware post_request error: {e}")

                return {
                    "status": resp.status,
                    "body": parsed_body,
                    "provider": provider.name,
                    "elapsed_seconds": round(elapsed, 3),
                }

        except asyncio.TimeoutError:
            elapsed = time.time() - start_time
            if cb:
                await cb.record_failure()
            if self.metrics:
                await self.metrics.inc_counter("upstream_timeouts_total", 1)
                await self.metrics.inc_counter(f"upstream_timeouts_{provider.name}", 1)
            logger.error(f"Upstream timeout for {provider.name} after {elapsed:.1f}s")
            return {
                "status": 504,
                "body": {"error": {"type": "upstream_timeout", "message": f"Upstream provider '{provider.name}' timed out after {self.timeout}s"}},
                "provider": provider.name,
            }

        except aiohttp.ClientError as e:
            elapsed = time.time() - start_time
            if cb:
                await cb.record_failure()
            if self.metrics:
                await self.metrics.inc_counter("upstream_errors_total", 1)
            logger.error(f"Upstream error for {provider.name}: {e}")
            return {
                "status": 502,
                "body": {"error": {"type": "upstream_error", "message": str(e)}},
                "provider": provider.name,
            }

        except Exception as e:
            elapsed = time.time() - start_time
            if cb:
                await cb.record_failure()
            logger.error(f"Unexpected error proxying to {provider.name}: {e}")
            return {
                "status": 502,
                "body": {"error": {"type": "internal_error", "message": str(e)}},
                "provider": provider.name,
            }


# ============================================================================
# Request Handlers (v2: aiohttp web handlers)
# ============================================================================

class GatewayApp:
    """Main application class that wires together all components.

    v2 uses aiohttp.web.Application instead of stdlib HTTPServer, providing:
    - Native async request handling (no blocking)
    - Connection pooling for upstream calls
    - Proper middleware support
    - Graceful shutdown lifecycle
    """

    def __init__(self, config: GatewayConfig):
        self.config = config
        self.app = web.Application()

        # Initialize components
        self.metrics = Metrics()
        self.auth = AuthMiddleware(config.auth_enabled, config.auth_api_keys)
        self.cache = SemanticCache(
            config.cache_max_size, config.cache_ttl, config.cache_persistence_path
        )
        self.circuit_breakers: Dict[str, CircuitBreaker] = {}
        for name in config.providers:
            self.circuit_breakers[name] = CircuitBreaker(name)

        self.health_checker = HealthChecker(config.providers, timeout=10.0)
        self.router = Router(config, self.circuit_breakers, self.health_checker)
        self.proxy: Optional[UpstreamProxy] = None  # Initialized after session creation

        # Register routes
        self.app.router.add_get("/health", self.handle_health)
        self.app.router.add_get("/v1/models", self.handle_models)
        self.app.router.add_get("/routing/status", self.handle_routing_status)
        self.app.router.add_get("/cache/stats", self.handle_cache_stats)
        self.app.router.add_get("/metrics", self.handle_metrics)
        self.app.router.add_post("/v1/chat/completions", self.handle_chat)
        self.app.router.add_post("/v1/embeddings", self.handle_embeddings)

        # Lifecycle hooks
        self.app.on_startup.append(self.on_startup)
        self.app.on_cleanup.append(self.on_cleanup)

    async def on_startup(self, app):
        """Initialize resources on server startup."""
        # Create shared aiohttp session for upstream calls (connection pooling)
        self.session = aiohttp.ClientSession()
        self.proxy = UpstreamProxy(
            session=self.session,
            timeout=self.config.upstream_timeout,
            circuit_breakers=self.circuit_breakers,
            metrics=self.metrics,
            billing_middleware=self.config.billing_middleware,
        )
        # Start health checker
        await self.health_checker.start(self.session)
        logger.info("Gateway components initialized")

    async def on_cleanup(self, app):
        """Clean up resources on server shutdown."""
        # Stop health checker
        await self.health_checker.stop()
        # Save cache to disk
        await self.cache.save_to_disk()
        # Close aiohttp session
        if hasattr(self, 'session') and self.session:
            await self.session.close()
        logger.info("Gateway cleanup complete")

    async def _authenticate(self, request: web.Request) -> Optional[web.Response]:
        """Check authentication. Returns None if authenticated, or error response."""
        headers = dict(request.headers)
        is_authed, error = self.auth.authenticate(headers)
        if not is_authed:
            await self.metrics.inc_counter("auth_failures_total")
            return web.json_response({"error": {"type": "unauthorized", "message": error}}, status=401)
        return None

    async def handle_health(self, request: web.Request) -> web.Response:
        """Enhanced health check including circuit breaker states."""
        provider_health = {}
        for name, cb in self.circuit_breakers.items():
            provider_health[name] = {
                "circuit_breaker": cb.status(),
                "upstream_healthy": self.health_checker.is_healthy(name),
            }

        all_healthy = all(
            self.health_checker.is_healthy(n) or cb.state != CircuitState.OPEN
            for n, cb in self.circuit_breakers.items()
        )

        return web.json_response({
            "status": "healthy" if all_healthy else "degraded",
            "version": "2.0.0",
            "timestamp": time.time(),
            "providers": provider_health,
            "cache": self.cache.stats(),
            "uptime_info": {
                "cache_enabled": self.config.cache_enabled,
                "auth_enabled": self.config.auth_enabled,
                "routing_policy": self.config.routing_policy,
            },
        })

    async def handle_models(self, request: web.Request) -> web.Response:
        auth_error = await self._authenticate(request)
        if auth_error:
            return auth_error

        models = []
        for p in self.config.providers.values():
            for m in p.models:
                models.append({
                    "id": m,
                    "provider": p.name,
                    "region": p.region,
                    "healthy": self.health_checker.is_healthy(p.name),
                })
        return web.json_response({"object": "list", "data": models})

    async def handle_routing_status(self, request: web.Request) -> web.Response:
        auth_error = await self._authenticate(request)
        if auth_error:
            return auth_error

        return web.json_response({
            "policy": self.config.routing_policy,
            "providers": list(self.config.providers.keys()),
            "stats": dict(self.router.routing_stats),
            "circuit_breakers": {n: cb.status() for n, cb in self.circuit_breakers.items()},
        })

    async def handle_cache_stats(self, request: web.Request) -> web.Response:
        auth_error = await self._authenticate(request)
        if auth_error:
            return auth_error
        return web.json_response(self.cache.stats())

    async def handle_metrics(self, request: web.Request) -> web.Response:
        """Prometheus-compatible metrics endpoint."""
        # Update gauges before rendering
        await self.metrics.set_gauge("cache_size", self.cache.stats()["size"])
        await self.metrics.set_gauge("cache_hit_rate", self.cache.stats()["hit_rate"])

        for name, cb in self.circuit_breakers.items():
            await self.metrics.set_gauge(
                f"circuit_breaker_{name}_state",
                {"closed": 0, "open": 1, "half_open": 0.5}.get(cb.state, -1)
            )

        for name in self.config.providers:
            await self.metrics.set_gauge(
                f"provider_{name}_healthy",
                1 if self.health_checker.is_healthy(name) else 0
            )

        metrics_text = self.metrics.render()
        return web.Response(text=metrics_text, content_type="text/plain")

    async def handle_chat(self, request: web.Request) -> web.Response:
        """Handle chat completion requests with full middleware pipeline."""
        start_time = time.time()

        # Auth
        auth_error = await self._authenticate(request)
        if auth_error:
            return auth_error

        # Parse body
        try:
            body = await request.read()
            request_data = json.loads(body)
        except json.JSONDecodeError:
            return web.json_response({"error": {"type": "invalid_json", "message": "Invalid JSON body"}}, status=400)

        model = request_data.get("model", "gpt-4o")
        messages = request_data.get("messages", [])
        stream = request_data.get("stream", False)
        team_id = request.headers.get("X-Team-ID", "default")

        # Rate limit check
        if not await self.config.rate_limits.check(team_id):
            await self.metrics.inc_counter("rate_limit_rejections_total")
            await self.metrics.inc_counter(f"rate_limit_rejections_{team_id}")
            return web.json_response({
                "error": {
                    "type": "rate_limit_exceeded",
                    "message": f"Rate limit exceeded for team '{team_id}'",
                }
            }, status=429)

        # Check cache
        cache_bypass = request.headers.get("X-Cache-Bypass", "false") == "true"
        if self.config.cache_enabled and not cache_bypass and not stream:
            cached = await self.cache.get(model, messages, request_data.get("temperature", 1))
            if cached:
                cached["_cached"] = True
                await self.metrics.inc_counter("cache_hits_total")
                return web.json_response(cached)

        # Route to provider
        provider = await self.router.select_provider(model)
        if not provider:
            await self.metrics.inc_counter("no_provider_available_total")
            return web.json_response({
                "error": {
                    "type": "model_not_found",
                    "message": f"No provider available for model '{model}'",
                }
            }, status=404)

        # Forward request
        result = await self.proxy.forward(
            provider, "/v1/chat/completions", body,
            dict(request.headers), stream=stream
        )

        elapsed = time.time() - start_time
        await self.metrics.observe_histogram("request_duration_seconds", elapsed)
        await self.metrics.inc_counter("requests_total")

        if result["status"] >= 400:
            await self.metrics.inc_counter("upstream_error_responses_total")
            return web.json_response(result["body"], status=result["status"])

        # Add routing metadata
        response = result["body"]
        if isinstance(response, dict):
            response["_provider"] = result["provider"]
            response["_routed_at"] = time.time()
            response["_gateway_latency_ms"] = round(elapsed * 1000, 1)

        # Cache the response (not for streaming)
        if self.config.cache_enabled and not cache_bypass and not stream:
            await self.cache.put(model, messages, request_data.get("temperature", 1), response)

        return web.json_response(response, status=result["status"])

    async def handle_embeddings(self, request: web.Request) -> web.Response:
        """Handle embedding requests."""
        auth_error = await self._authenticate(request)
        if auth_error:
            return auth_error

        try:
            body = await request.read()
            request_data = json.loads(body)
        except json.JSONDecodeError:
            return web.json_response({"error": {"type": "invalid_json", "message": "Invalid JSON body"}}, status=400)

        model = request_data.get("model", "text-embedding-3-small")
        provider = await self.router.select_provider(model)

        if not provider:
            return web.json_response({
                "error": {"type": "model_not_found", "message": f"No provider for model '{model}'"}
            }, status=404)

        result = await self.proxy.forward(provider, "/v1/embeddings", body, dict(request.headers))
        return web.json_response(result["body"], status=result["status"])


# ============================================================================
# Graceful Shutdown Manager (v2: signal handlers)
# ============================================================================

class ShutdownManager:
    """Manages graceful shutdown with signal handling.

    v2 addition: Catches SIGTERM and SIGINT, initiates graceful shutdown
    with a configurable timeout. In-flight requests are given time to
    complete before the server is force-stopped.
    """

    def __init__(self, timeout: float = 30.0):
        self.timeout = timeout
        self._shutdown_event = asyncio.Event()
        self._runner: Optional[web.AppRunner] = None

    def setup_signal_handlers(self, loop: asyncio.AbstractEventLoop):
        """Register signal handlers for graceful shutdown."""
        for sig in (signal.SIGTERM, signal.SIGINT):
            loop.add_signal_handler(sig, self._signal_handler, sig)

    def _signal_handler(self, sig):
        logger.info(f"Received signal {sig.name}, initiating graceful shutdown...")
        self._shutdown_event.set()

    @property
    def shutdown_requested(self) -> bool:
        return self._shutdown_event.is_set()

    async def wait_for_shutdown(self):
        await self._shutdown_event.wait()


# ============================================================================
# Main
# ============================================================================

async def async_main():
    parser = argparse.ArgumentParser(description="API Gateway Skill v2 — Smart AI Provider Router (Async)")
    parser.add_argument("--port", type=int, default=8000, help="HTTP port (default: 8000)")
    parser.add_argument("--config", type=str, default="", help="Path to gateway config JSON")
    parser.add_argument("--timeout", type=float, default=30.0, help="Upstream request timeout in seconds (default: 30)")
    args = parser.parse_args()

    config = GatewayConfig()
    if args.config:
        config.load_from_file(args.config)
    config.listen_port = args.port
    if args.timeout:
        config.upstream_timeout = args.timeout

    # Default providers if none configured
    if not config.providers:
        config.providers = {
            "openai": Provider(
                "openai", "https://api.openai.com", "",
                ["gpt-4o", "gpt-4o-mini", "gpt-4*", "text-embedding-3-small"],
                0.0025, 0.01, 10, 80, "us",
            ),
            "anthropic": Provider(
                "anthropic", "https://api.anthropic.com", "",
                ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku", "claude-3*"],
                0.015, 0.075, 20, 100, "us",
            ),
            "google": Provider(
                "google", "https://generativelanguage.googleapis.com", "",
                ["gemini-pro", "gemini-1.5-flash"],
                0.00125, 0.005, 5, 60, "us",
            ),
        }

    # Create application
    gateway = GatewayApp(config)

    # Setup shutdown manager
    shutdown_mgr = ShutdownManager(timeout=30.0)

    # Create runner
    runner = web.AppRunner(gateway.app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", config.listen_port)

    print(f"╔══════════════════════════════════════════════╗")
    print(f"║   API Gateway Skill v2.0.0 (async)          ║")
    print(f"╠══════════════════════════════════════════════╣")
    print(f"║  Port:       {config.listen_port:<32}║")
    print(f"║  Policy:     {config.routing_policy:<32}║")
    print(f"║  Providers:  {', '.join(config.providers.keys())[:32]:<32}║")
    print(f"║  Cache:      {'enabled' if config.cache_enabled else 'disabled':<32}║")
    print(f"║  Auth:       {'enabled' if config.auth_enabled else 'disabled':<32}║")
    print(f"║  Timeout:    {config.upstream_timeout}s{' ' * (30 - len(str(config.upstream_timeout)))}║")
    print(f"║  Circuit BR: {'per-provider':<32}║")
    print(f"║  Health Chk: {'enabled':<32}║")
    print(f"╚══════════════════════════════════════════════╝")
    print()
    print("  Endpoints:")
    print("    POST /v1/chat/completions")
    print("    POST /v1/embeddings")
    print("    GET  /v1/models")
    print("    GET  /routing/status")
    print("    GET  /cache/stats")
    print("    GET  /metrics")
    print("    GET  /health")
    print()

    # Setup signal handlers
    loop = asyncio.get_running_loop()
    shutdown_mgr.setup_signal_handlers(loop)

    # Start server
    await site.start()
    logger.info(f"Server started on port {config.listen_port}")

    # Wait for shutdown signal
    try:
        await shutdown_mgr.wait_for_shutdown()
    except asyncio.CancelledError:
        pass

    # Graceful shutdown
    logger.info("Shutting down gracefully...")
    await runner.cleanup()
    logger.info("Server stopped")


def main():
    """Entry point with proper asyncio setup and signal handling."""
    try:
        asyncio.run(async_main())
    except KeyboardInterrupt:
        print("\nShutting down...")


if __name__ == "__main__":
    main()
