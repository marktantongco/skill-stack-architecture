#!/usr/bin/env python3
"""
API Gateway Skill — Smart AI Provider Router
Version: 1.0.0

An application-layer API gateway that receives OpenAI-compatible requests,
inspects the payload, and routes to the optimal upstream AI provider
based on configurable routing policies (cost, latency, model availability).

Usage:
  python3 gateway.py [--port 8000] [--config gateway.json]

Endpoints:
  POST /v1/chat/completions    — Route and proxy chat completion requests
  POST /v1/embeddings          — Route embedding requests
  GET  /v1/models              — List available models across all providers
  GET  /routing/status         — Show current routing policy and stats
  GET  /cache/stats            — Semantic cache statistics
  GET  /health                 — Health check
"""

import argparse
import hashlib
import json
import time
import threading
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from collections import defaultdict
from typing import Optional, Dict, List, Any
import urllib.request
import urllib.error

# ============================================================================
# Configuration
# ============================================================================

class Provider:
    def __init__(self, name: str, base_url: str, api_key: str, models: List[str],
                 cost_per_1k_input: float = 0.0, cost_per_1k_output: float = 0.0,
                 priority: int = 0, latency_ms: int = 100, region: str = "us"):
        self.name = name
        self.base_url = base_url
        self.api_key = api_key
        self.models = models
        self.cost_per_1k_input = cost_per_1k_input
        self.cost_per_1k_output = cost_per_1k_output
        self.priority = priority
        self.latency_ms = latency_ms
        self.region = region


class RoutingPolicy:
    COST = "cost"
    LATENCY = "latency"
    PRIORITY = "priority"
    ROUND_ROBIN = "round_robin"


class RateLimit:
    def __init__(self, requests_per_minute: int = 100, requests_per_day: int = 10000):
        self.rpm = requests_per_minute
        self.rpd = requests_per_day
        self.minute_counts: Dict[str, List[float]] = defaultdict(list)
        self.day_counts: Dict[str, int] = defaultdict(int)
        self._lock = threading.Lock()

    def check(self, key: str) -> bool:
        """Returns True if the request is allowed, False if rate-limited."""
        now = time.time()
        with self._lock:
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
        self.cache_ttl: int = 3600  # 1 hour
        self.cache_max_size: int = 1000
        self.listen_port: int = 8000

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
            )
        self.routing_policy = data.get("routing_policy", RoutingPolicy.COST)
        rl = data.get("rate_limits", {})
        self.rate_limits = RateLimit(
            requests_per_minute=rl.get("rpm", 100),
            requests_per_day=rl.get("rpd", 10000),
        )
        self.cache_enabled = data.get("cache_enabled", True)
        self.cache_ttl = data.get("cache_ttl", 3600)
        self.listen_port = data.get("port", 8000)


# ============================================================================
# Semantic Cache
# ============================================================================

class SemanticCache:
    """Simple hash-based cache for API responses. For true semantic caching,
    replace the hash comparison with embedding similarity."""

    def __init__(self, max_size: int = 1000, ttl: int = 3600):
        self.max_size = max_size
        self.ttl = ttl
        self._cache: Dict[str, Dict] = {}
        self._lock = threading.Lock()
        self.hits = 0
        self.misses = 0

    def _hash_key(self, model: str, messages: List[Dict], params: Dict) -> str:
        content = json.dumps({"model": model, "messages": messages, "params": params}, sort_keys=True)
        return hashlib.sha256(content.encode()).hexdigest()

    def get(self, model: str, messages: List[Dict], params: Dict) -> Optional[Dict]:
        key = self._hash_key(model, messages, params)
        with self._lock:
            entry = self._cache.get(key)
            if entry and time.time() - entry["cached_at"] < self.ttl:
                self.hits += 1
                return entry["response"]
            if entry:
                del self._cache[key]
            self.misses += 1
            return None

    def put(self, model: str, messages: List[Dict], params: Dict, response: Dict):
        key = self._hash_key(model, messages, params)
        with self._lock:
            if len(self._cache) >= self.max_size:
                # Evict oldest entry
                oldest_key = min(self._cache, key=lambda k: self._cache[k]["cached_at"])
                del self._cache[oldest_key]
            self._cache[key] = {"response": response, "cached_at": time.time()}

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
# Router
# ============================================================================

class Router:
    def __init__(self, config: GatewayConfig):
        self.config = config
        self._rr_index = 0
        self._rr_lock = threading.Lock()
        self.routing_stats: Dict[str, int] = defaultdict(int)

    def select_provider(self, model: str, user_region: str = "us") -> Optional[Provider]:
        """Select the best provider for a given model based on routing policy."""
        candidates = []
        for p in self.config.providers.values():
            if model in p.models or any(m.endswith("*") and model.startswith(m[:-1]) for m in p.models):
                candidates.append(p)

        if not candidates:
            # Try partial match (e.g., "gpt-4o" matches provider that lists "gpt-4*")
            for p in self.config.providers.values():
                if any(model.startswith(m.split("*")[0]) for m in p.models if "*" in m):
                    candidates.append(p)

        if not candidates:
            return None

        policy = self.config.routing_policy

        if policy == RoutingPolicy.COST:
            candidates.sort(key=lambda p: p.cost_per_1k_input)
        elif policy == RoutingPolicy.LATENCY:
            candidates.sort(key=lambda p: p.latency_ms)
        elif policy == RoutingPolicy.PRIORITY:
            candidates.sort(key=lambda p: -p.priority)
        elif policy == RoutingPolicy.ROUND_ROBIN:
            with self._rr_lock:
                idx = self._rr_index % len(candidates)
                self._rr_index += 1
            return candidates[idx]

        selected = candidates[0]
        self.routing_stats[selected.name] += 1
        return selected


# ============================================================================
# Proxy
# ============================================================================

class UpstreamProxy:
    """Forwards requests to upstream AI providers."""

    @staticmethod
    def forward(provider: Provider, path: str, body: bytes, headers: Dict) -> Dict:
        """Forward a request to the upstream provider and return the response."""
        url = f"{provider.base_url.rstrip('/')}{path}"

        req_headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {provider.api_key}",
        }
        # Copy select headers from original request
        for h in ["X-Team-ID", "X-Request-ID", "X-Cache-Bypass"]:
            if h in headers:
                req_headers[h] = headers[h]

        req = urllib.request.Request(url, data=body, headers=req_headers, method="POST")

        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                response_data = resp.read().decode()
                return {
                    "status": resp.status,
                    "body": json.loads(response_data) if response_data else {},
                    "provider": provider.name,
                }
        except urllib.error.HTTPError as e:
            error_body = e.read().decode() if e.fp else ""
            return {
                "status": e.code,
                "body": {"error": error_body},
                "provider": provider.name,
            }
        except Exception as e:
            return {
                "status": 502,
                "body": {"error": str(e)},
                "provider": provider.name,
            }


# ============================================================================
# HTTP Handler
# ============================================================================

class GatewayHandler(BaseHTTPRequestHandler):
    config: GatewayConfig = None
    router: Router = None
    cache: SemanticCache = None
    rate_limits: RateLimit = None

    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("X-Powered-By", "api-gateway-skill/1.0.0")
        self.end_headers()
        self.wfile.write(json.dumps(data, default=str).encode())

    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        return self.rfile.read(length) if length > 0 else b""

    def do_GET(self):
        if self.path == "/health":
            self._send_json({"status": "healthy", "timestamp": time.time()})
        elif self.path == "/v1/models":
            models = []
            for p in self.config.providers.values():
                for m in p.models:
                    models.append({"id": m, "provider": p.name, "region": p.region})
            self._send_json({"object": "list", "data": models})
        elif self.path == "/routing/status":
            self._send_json({
                "policy": self.config.routing_policy,
                "providers": list(self.config.providers.keys()),
                "stats": dict(self.router.routing_stats),
            })
        elif self.path == "/cache/stats":
            self._send_json(self.cache.stats())
        else:
            self._send_json({"error": "Not found"}, 404)

    def do_POST(self):
        body = self._read_body()

        if self.path == "/v1/chat/completions":
            self._handle_chat(body)
        elif self.path == "/v1/embeddings":
            self._handle_embeddings(body)
        else:
            self._send_json({"error": "Not found"}, 404)

    def _handle_chat(self, body: bytes):
        try:
            request_data = json.loads(body)
        except json.JSONDecodeError:
            self._send_json({"error": "Invalid JSON"}, 400)
            return

        model = request_data.get("model", "gpt-4o")
        messages = request_data.get("messages", [])
        team_id = self.headers.get("X-Team-ID", "default")

        # Rate limit check
        if not self.rate_limits.check(team_id):
            self._send_json({
                "error": {
                    "type": "rate_limit_exceeded",
                    "message": f"Rate limit exceeded for team '{team_id}'",
                }
            }, 429)
            return

        # Check cache
        cache_bypass = self.headers.get("X-Cache-Bypass", "false") == "true"
        if self.config.cache_enabled and not cache_bypass:
            cached = self.cache.get(model, messages, request_data.get("temperature", 1))
            if cached:
                cached["_cached"] = True
                self._send_json(cached)
                return

        # Route to provider
        provider = self.router.select_provider(model)
        if not provider:
            self._send_json({
                "error": {
                    "type": "model_not_found",
                    "message": f"No provider available for model '{model}'",
                }
            }, 404)
            return

        # Forward request
        result = UpstreamProxy.forward(provider, "/v1/chat/completions", body, dict(self.headers))

        if result["status"] >= 400:
            self._send_json(result["body"], result["status"])
            return

        # Add routing metadata
        response = result["body"]
        if isinstance(response, dict):
            response["_provider"] = result["provider"]
            response["_routed_at"] = time.time()

        # Cache the response
        if self.config.cache_enabled and not cache_bypass:
            self.cache.put(model, messages, request_data.get("temperature", 1), response)

        self._send_json(response, result["status"])

    def _handle_embeddings(self, body: bytes):
        try:
            request_data = json.loads(body)
        except json.JSONDecodeError:
            self._send_json({"error": "Invalid JSON"}, 400)
            return

        model = request_data.get("model", "text-embedding-3-small")
        provider = self.router.select_provider(model)

        if not provider:
            self._send_json({"error": f"No provider for model '{model}'"}, 404)
            return

        result = UpstreamProxy.forward(provider, "/v1/embeddings", body, dict(self.headers))
        self._send_json(result["body"], result["status"])

    def log_message(self, format, *args):
        pass


# ============================================================================
# Main
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description="API Gateway Skill — Smart AI Provider Router")
    parser.add_argument("--port", type=int, default=8000, help="HTTP port (default: 8000)")
    parser.add_argument("--config", type=str, default="", help="Path to gateway config JSON")
    args = parser.parse_args()

    config = GatewayConfig()
    if args.config:
        config.load_from_file(args.config)
    config.listen_port = args.port

    # Default providers if none configured
    if not config.providers:
        config.providers = {
            "openai": Provider("openai", "https://api.openai.com", "", ["gpt-4o", "gpt-4o-mini", "text-embedding-3-small"], 0.0025, 0.01, 10, 80, "us"),
            "anthropic": Provider("anthropic", "https://api.anthropic.com", "", ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"], 0.015, 0.075, 20, 100, "us"),
            "google": Provider("google", "https://generativelanguage.googleapis.com", "", ["gemini-pro", "gemini-1.5-flash"], 0.00125, 0.005, 5, 60, "us"),
        }

    router = Router(config)
    cache = SemanticCache(config.cache_max_size, config.cache_ttl)

    GatewayHandler.config = config
    GatewayHandler.router = router
    GatewayHandler.cache = cache
    GatewayHandler.rate_limits = config.rate_limits

    server = HTTPServer(("0.0.0.0", config.listen_port), GatewayHandler)
    print(f"API Gateway Skill v1.0.0")
    print(f"  Port: {config.listen_port}")
    print(f"  Policy: {config.routing_policy}")
    print(f"  Providers: {', '.join(config.providers.keys())}")
    print(f"  Cache: {'enabled' if config.cache_enabled else 'disabled'}")
    print(f"  Endpoints: /v1/chat/completions, /v1/embeddings, /v1/models, /routing/status, /cache/stats, /health")
    print()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.server_close()


if __name__ == "__main__":
    main()
