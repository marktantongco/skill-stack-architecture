#!/bin/bash
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  🦉🧠 OpenHuman + OWL-AGENT Proxy Defense Stack — Ubuntu Installer v1.0   ║
# ║  Integrates tinyhumansai/openhuman with the OWL proxy defense stack       ║
# ║  for resilient, privacy-first AI agent networking on Ubuntu/Debian.       ║
# ╚═══════════════════════════════════════════════════════════════════════════╝
set -euo pipefail

# ─── Colors ───
if [ -t 1 ]; then
  RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'
  CYAN='\033[0;36m'; BLUE='\033[0;34m'; MAGENTA='\033[0;35m'; NC='\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; CYAN=''; BLUE=''; MAGENTA=''; NC=''
fi

log_info()  { echo -e "${CYAN}→${NC} $*"; }
log_ok()    { echo -e "${GREEN}✓${NC} $*"; }
log_warn()  { echo -e "${YELLOW}!${NC} $*"; }
log_err()   { echo -e "${RED}✗${NC} $*" >&2; }
log_owl()   { echo -e "${MAGENTA}🦉${NC} $*"; }
log_brain() { echo -e "${BLUE}🧠${NC} $*"; }

# ─── Detect Environment ───
INSTALL_OWL=true
INSTALL_OPENHUMAN=true
OWL_ONLY=false
OH_ONLY=false
PROXY_PORT=8080

usage() {
  cat <<'EOF'
Usage: install.sh [OPTIONS]

Options:
  --owl-only        Install only the OWL proxy defense stack
  --openhuman-only  Install only OpenHuman (official apt repo)
  --proxy-port N    Local proxy server port (default: 8080)
  --help            Show this help

Examples:
  sudo ./install.sh                  # Full install (recommended)
  sudo ./install.sh --owl-only       # Proxy stack only
  sudo ./install.sh --proxy-port 3128  # Custom proxy port
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --owl-only)        INSTALL_OPENHUMAN=false; OWL_ONLY=true; shift ;;
    --openhuman-only)  INSTALL_OWL=false; OH_ONLY=true; shift ;;
    --proxy-port)      PROXY_PORT="${2:-8080}"; shift 2 ;;
    --help|-h)         usage; exit 0 ;;
    *)                 log_err "Unknown option: $1"; usage; exit 1 ;;
  esac
done

# ─── Preflight Checks ───
if [[ "$EUID" -ne 0 ]]; then
  log_err "This installer must run as root (use sudo)."
  exit 1
fi

if ! grep -qE 'Ubuntu|Debian' /etc/os-release 2>/dev/null; then
  log_warn "This script is designed for Ubuntu/Debian. Continuing anyway..."
fi

UBUNTU_VERSION=$(grep VERSION_ID /etc/os-release | cut -d'"' -f2 || echo "unknown")
log_info "Detected OS: $(grep PRETTY_NAME /etc/os-release | cut -d'"' -f2)"

# ─── Install Phase 1: System Dependencies ───
log_brain "[1/7] Updating system and installing base dependencies..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq --no-install-recommends \
  ca-certificates curl wget gnupg2 lsb-release \
  software-properties-common apt-transport-https \
  python3 python3-pip python3-venv python3-dev \
  libffi-dev libssl-dev build-essential git \
  pkg-config cmake ninja-build libgtk-3-dev \
  libwebkit2gtk-4.1-dev libappindicator3-dev \
  librsvg2-dev libayatana-appindicator3-dev \
  libxdo3 libxdo-dev libssl-dev \
  jq sqlite3 ripgrep 2>&1 | grep -v "^Selecting\|^Preparing\|^Unpacking\|^Setting up\|^Processing\|^Scanning\|^Building\|^Reading\|^Expanding" || true

log_ok "System dependencies ready"

# ═══════════════════════════════════════════════════════════════════════════
#  PHASE 2: OpenHuman Desktop App (Official Signed Apt Repo)
# ═══════════════════════════════════════════════════════════════════════════
if [[ "$INSTALL_OPENHUMAN" == true ]]; then
  log_brain "[2/7] Installing OpenHuman via signed apt repository..."

  # Add OpenHuman GPG key
  if [[ ! -f /etc/apt/keyrings/openhuman.gpg ]]; then
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://tinyhumansai.github.io/openhuman/apt/KEY.gpg | \
      gpg --dearmor -o /etc/apt/keyrings/openhuman.gpg
    log_ok "OpenHuman GPG key added"
  fi

  # Add apt repo
  if [[ ! -f /etc/apt/sources.list.d/openhuman.list ]]; then
    echo "deb [signed-by=/etc/apt/keyrings/openhuman.gpg arch=amd64] \
https://tinyhumansai.github.io/openhuman/apt stable main" | \
      tee /etc/apt/sources.list.d/openhuman.list >/dev/null
    log_ok "OpenHuman apt repository configured"
  fi

  apt-get update -qq
  apt-get install -y -qq openhuman 2>&1 | tail -n 5 || {
    log_warn "Package install produced warnings (common for first-time setup)"
  }

  # Verify installation
  if command -v openhuman >/dev/null 2>&1 || [ -f /usr/bin/openhuman ] || [ -f /usr/local/bin/openhuman ]; then
    log_ok "OpenHuman installed successfully"
  else
    log_warn "OpenHuman binary not in PATH immediately — may need re-login or .deb placed it in /opt"
  fi

  # Create desktop entry if missing
  if [[ ! -f /usr/share/applications/openhuman.desktop ]]; then
    cat > /usr/share/applications/openhuman.desktop <<'DESKTOP'
[Desktop Entry]
Name=OpenHuman
Comment=Your Personal AI super intelligence
Exec=/usr/bin/openhuman
Icon=openhuman
Type=Application
Categories=AI;Utility;Network;
Terminal=false
StartupNotify=true
DESKTOP
    log_ok "Desktop entry created"
  fi
fi

# ═══════════════════════════════════════════════════════════════════════════
#  PHASE 3: OWL-AGENT Proxy Defense Stack
# ═══════════════════════════════════════════════════════════════════════════
if [[ "$INSTALL_OWL" == true ]]; then
  log_owl "[3/7] Installing OWL-AGENT Proxy Defense Stack..."

  OWL_DIR="/opt/owl-agent"
  OWL_VENV="$OWL_DIR/venv"
  OWL_CONFIG="$OWL_DIR/config"
  OWL_CACHE="$OWL_DIR/cache/http"
  OWL_LOGS="$OWL_DIR/logs"

  mkdir -p "$OWL_DIR" "$OWL_CONFIG" "$OWL_CACHE" "$OWL_LOGS"

  # Create Python virtual environment
  if [[ ! -d "$OWL_VENV" ]]; then
    python3 -m venv "$OWL_VENV"
    log_ok "OWL virtual environment created"
  fi

  # Install Python dependencies
  "$OWL_VENV/bin/pip" install --upgrade pip -q
  "$OWL_VENV/bin/pip" install -q \
    'httpx[http2]' aiohttp aiohttp-socks aiofiles curl_cffi 2>&1 | tail -n 3
  log_ok "OWL Python dependencies installed"

  # ─── Write proxy_defense.py (enhanced with local HTTP proxy server) ───
  cat > "$OWL_DIR/proxy_defense.py" <<'PYEOF'
#!/usr/bin/env python3
"""
🦉 OWL-AGENT PROXY DEFENSE STACK v4.0 (OpenHuman Integrated)
- Immediate proxy ban on any connection error
- Automatic fallback to direct connection when all proxies fail
- Local HTTP proxy server for system-wide routing
- Caching, deduplication, rate limiting, token bucket
"""

import asyncio
import hashlib
import json
import time
import random
import logging
import argparse
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Optional, Dict, Any, Callable, Awaitable, List
from pathlib import Path
from urllib.parse import urlparse

import aiohttp
import aiofiles
from aiohttp import web

try:
    import httpx
    HTTP2_AVAILABLE = True
except ImportError:
    HTTP2_AVAILABLE = False

try:
    from curl_cffi.requests import Session as CurlSession
    JA3_AVAILABLE = True
except ImportError:
    JA3_AVAILABLE = False

# ─── Paths ───
OWL_DIR = Path("/opt/owl-agent")
CACHE_DIR = OWL_DIR / "cache" / "http"
CACHE_DIR.mkdir(parents=True, exist_ok=True)
CONFIG_DIR = OWL_DIR / "config"
PROXY_POOL_FILE = CONFIG_DIR / "proxy_pool.json"
LOG_DIR = OWL_DIR / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_TTL = 300
DEFAULT_RATE = 1.0
MAX_RETRIES = 3
PROXY_PORT = 8080

# ─── Logging ───
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.FileHandler(LOG_DIR / "owl-proxy.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("owl-agent.proxy")

# ─── Data Classes ───
@dataclass
class CachedResponse:
    status: int
    content: bytes
    headers: Dict[str, str]
    timestamp: float
    ttl: int
    protocol: str = "http/1.1"
    def is_fresh(self) -> bool:
        return time.time() - self.timestamp < self.ttl

@dataclass
class TokenBucket:
    rate: float
    capacity: float
    tokens: float = 0.0
    last_update: float = field(default_factory=time.time)
    lock: asyncio.Lock = field(default_factory=asyncio.Lock)
    async def _replenish(self):
        now = time.time()
        elapsed = now - self.last_update
        async with self.lock:
            self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)
            self.last_update = now
    async def acquire(self, tokens: float = 1.0) -> bool:
        await self._replenish()
        async with self.lock:
            if self.tokens >= tokens:
                self.tokens -= tokens
                return True
        wait_time = (tokens - self.tokens) / self.rate
        await asyncio.sleep(wait_time)
        return await self.acquire(tokens)

@dataclass
class ProxyEntry:
    url: str
    proxy_type: str
    protocol: str
    source: str
    tier: int
    healthy: bool = True
    last_check: float = 0.0
    fail_count: int = 0
    ban_until: float = 0.0
    latency_ms: float = 9999.0
    def is_banned(self) -> bool:
        return time.time() < self.ban_until
    def mark_failed(self):
        self.fail_count += 1
        self.ban_until = time.time() + 60
        self.healthy = False
        logger.warning(f"Proxy banned (60s): {self.url}")
    def mark_success(self, latency_ms: float):
        self.fail_count = 0
        self.healthy = True
        self.latency_ms = latency_ms
        self.last_check = time.time()

# ─── Proxy Pool Loader ───
class ProxyPoolLoader:
    def __init__(self, pool_file: Path = PROXY_POOL_FILE):
        self.pool_file = pool_file
    def load(self) -> List[ProxyEntry]:
        if not self.pool_file.exists():
            return []
        try:
            with open(self.pool_file) as f:
                config = json.load(f)
        except Exception:
            return []
        proxies = []
        for provider in config.get("tier_1_managed_free", {}).get("providers", []):
            for proxy in provider.get("proxies", []):
                proxies.append(ProxyEntry(
                    url=proxy["url"],
                    proxy_type=proxy.get("type", "datacenter"),
                    protocol=proxy.get("protocols", ["HTTP"])[0].lower(),
                    source=provider["name"],
                    tier=1
                ))
        return proxies
    async def fetch_github_proxies(self, session: aiohttp.ClientSession) -> List[ProxyEntry]:
        proxies = []
        sources = [("https://cdn.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/all/data.json", "json")]
        for url, fmt in sources:
            try:
                async with session.get(url, timeout=30) as resp:
                    if resp.status != 200: continue
                    if fmt == "json":
                        data = await resp.json()
                        items = data.get("data", []) if isinstance(data, dict) else data
                        for item in items[:50]:
                            ip = item.get("ip", item.get("host", ""))
                            port = item.get("port", "")
                            if ip and port:
                                proxies.append(ProxyEntry(
                                    url=f"http://{ip}:{port}", proxy_type="public", protocol=item.get("protocol", "http").lower(),
                                    source="github", tier=2
                                ))
                    else:
                        text = await resp.text()
                        for line in text.strip().split("\n")[:50]:
                            if ":" in line and not line.startswith("#"):
                                proxies.append(ProxyEntry(url=f"http://{line.strip()}", proxy_type="public", protocol="http", source="github", tier=2))
                break
            except Exception as e:
                logger.warning(f"GitHub fetch failed: {e}")
        return proxies
    async def fetch_public_api_proxies(self, session: aiohttp.ClientSession) -> List[ProxyEntry]:
        proxies = []
        apis = ["https://api.proxyscrape.com/v4/free-proxy-list/get?request=display_proxies&proxy_format=protocolipport&format=text&limit=100"]
        for url in apis:
            try:
                async with session.get(url, timeout=30) as resp:
                    if resp.status != 200: continue
                    text = await resp.text()
                    for line in text.strip().split("\n")[:50]:
                        if line.strip():
                            proxies.append(ProxyEntry(url=line.strip(), proxy_type="public", protocol="http", source="api", tier=3))
                break
            except Exception as e:
                logger.warning(f"API fetch failed: {e}")
        return proxies

# ─── HTTP Cache ───
class HTTPCache:
    def __init__(self, ttl: int = DEFAULT_TTL):
        self.ttl = ttl
        self._memory: Dict[str, CachedResponse] = {}
        self._lock = asyncio.Lock()
    def _key(self, method: str, url: str, params: Optional[Dict] = None, protocol: str = "http/1.1") -> str:
        return hashlib.sha256(f"{method}:{url}:{json.dumps(params or {}, sort_keys=True)}:{protocol}".encode()).hexdigest()
    async def get(self, method: str, url: str, params: Optional[Dict] = None, protocol: str = "http/1.1") -> Optional[CachedResponse]:
        key = self._key(method, url, params, protocol)
        if key in self._memory and self._memory[key].is_fresh():
            return self._memory[key]
        path = CACHE_DIR / f"{key}.json"
        if path.exists():
            try:
                async with aiofiles.open(path, 'r') as f:
                    data = json.loads(await f.read())
                cached = CachedResponse(
                    status=data["status"], content=data["content"].encode('utf-8', errors='replace'),
                    headers=data["headers"], timestamp=data["timestamp"], ttl=data["ttl"], protocol=data.get("protocol", "http/1.1")
                )
                if cached.is_fresh():
                    async with self._lock:
                        self._memory[key] = cached
                    return cached
                else:
                    path.unlink()
            except Exception:
                pass
        return None
    async def set(self, method: str, url: str, response: CachedResponse, params: Optional[Dict] = None):
        key = self._key(method, url, params, response.protocol)
        async with self._lock:
            self._memory[key] = response
        path = CACHE_DIR / f"{key}.json"
        data = {"status": response.status, "content": response.content.decode('utf-8', errors='replace'), "headers": response.headers,
                "timestamp": response.timestamp, "ttl": response.ttl, "protocol": response.protocol}
        async with aiofiles.open(path, 'w') as f:
            await f.write(json.dumps(data))

# ─── Request Deduplicator ───
class RequestDeduplicator:
    def __init__(self):
        self._in_flight: Dict[str, asyncio.Future] = {}
        self._lock = asyncio.Lock()
    def _key(self, method: str, url: str, params: Optional[Dict] = None, protocol: str = "http/1.1") -> str:
        return hashlib.sha256(f"{method}:{url}:{json.dumps(params or {}, sort_keys=True)}:{protocol}".encode()).hexdigest()
    async def execute(self, method: str, url: str, params: Optional[Dict], protocol: str, factory: Callable[[], Awaitable[CachedResponse]]) -> CachedResponse:
        key = self._key(method, url, params, protocol)
        async with self._lock:
            if key in self._in_flight:
                return await self._in_flight[key]
            future = asyncio.Future()
            self._in_flight[key] = future
        try:
            result = await factory()
            future.set_result(result)
            return result
        except Exception as e:
            future.set_exception(e)
            raise
        finally:
            async with self._lock:
                self._in_flight.pop(key, None)

# ─── Domain Rate Limiter ───
class DomainRateLimiter:
    def __init__(self, default_rate: float = DEFAULT_RATE):
        self.default_rate = default_rate
        self._buckets: Dict[str, TokenBucket] = {}
        self._lock = asyncio.Lock()
    async def acquire(self, url: str, tokens: float = 1.0):
        domain = urlparse(url).netloc or url
        async with self._lock:
            if domain not in self._buckets:
                self._buckets[domain] = TokenBucket(rate=self.default_rate, capacity=5.0, tokens=5.0)
        await self._buckets[domain].acquire(tokens)

# ─── Proxy Rotator ───
class ProxyRotator:
    def __init__(self):
        self.proxies: List[ProxyEntry] = []
        self._index = 0
        self._lock = asyncio.Lock()
        self._loader = ProxyPoolLoader()
    async def load_all_sources(self, session: aiohttp.ClientSession):
        self.proxies = self._loader.load()
        self.proxies.extend(await self._loader.fetch_github_proxies(session))
        self.proxies.extend(await self._loader.fetch_public_api_proxies(session))
        logger.info(f"Loaded {len(self.proxies)} proxies")
    async def get_proxy(self) -> Optional[ProxyEntry]:
        async with self._lock:
            healthy = [p for p in self.proxies if not p.is_banned()]
            if not healthy:
                return None
            p = healthy[self._index % len(healthy)]
            self._index += 1
            return p
    async def mark_banned(self, proxy: ProxyEntry):
        proxy.mark_failed()

# ─── Resilient Client ───
class ResilientClient:
    def __init__(self, cache_ttl: int = DEFAULT_TTL, rate_limit: float = DEFAULT_RATE, max_retries: int = MAX_RETRIES):
        self.cache = HTTPCache(cache_ttl)
        self.dedup = RequestDeduplicator()
        self.limiter = DomainRateLimiter(rate_limit)
        self.rotator = ProxyRotator()
        self.max_retries = max_retries
        self._session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self):
        connector = aiohttp.TCPConnector(force_close=True, enable_cleanup_closed=True, limit=10)
        self._session = aiohttp.ClientSession(connector=connector)
        await self.rotator.load_all_sources(self._session)
        return self

    async def __aexit__(self, *args):
        if self._session:
            await self._session.close()

    async def request(self, method: str, url: str, params: Optional[Dict] = None, headers: Optional[Dict] = None, **kwargs) -> CachedResponse:
        cached = await self.cache.get(method, url, params)
        if cached:
            return cached
        async def factory():
            return await self._execute_with_retry(method, url, params, headers, **kwargs)
        return await self.dedup.execute(method, url, params, "http/1.1", factory)

    async def _execute_with_retry(self, method, url, params, headers, **kwargs):
        for attempt in range(self.max_retries):
            await self.limiter.acquire(url)
            proxy = await self.rotator.get_proxy()
            proxy_url = proxy.url if proxy else None
            try:
                start = time.time()
                async with self._session.request(method, url, params=params, headers=headers,
                                                 proxy=proxy_url, timeout=aiohttp.ClientTimeout(total=30), **kwargs) as resp:
                    content = await resp.read()
                latency = (time.time() - start) * 1000
                response = CachedResponse(status=resp.status, content=content, headers=dict(resp.headers), timestamp=time.time(), ttl=self.cache.ttl)
                if proxy:
                    proxy.mark_success(latency)
                await self.cache.set(method, url, response, params)
                if resp.status in (429, 403, 407):
                    if proxy:
                        await self.rotator.mark_banned(proxy)
                    continue
                return response
            except (aiohttp.ClientOSError, aiohttp.ClientProxyConnectionError, aiohttp.ServerDisconnectedError, ConnectionResetError) as e:
                if proxy:
                    await self.rotator.mark_banned(proxy)
                logger.warning(f"Proxy failed ({proxy_url}): {e}, retry {attempt+1}/{self.max_retries}")
                continue
            except Exception as e:
                if proxy:
                    await self.rotator.mark_banned(proxy)
                logger.warning(f"Error with proxy {proxy_url}: {e}, retrying")
                continue

        # All proxies failed, try direct
        logger.info("All proxies exhausted, attempting direct connection...")
        try:
            async with self._session.request(method, url, params=params, headers=headers,
                                             timeout=aiohttp.ClientTimeout(total=30)) as resp:
                content = await resp.read()
            response = CachedResponse(status=resp.status, content=content, headers=dict(resp.headers), timestamp=time.time(), ttl=self.cache.ttl)
            await self.cache.set(method, url, response, params)
            return response
        except Exception as e:
            raise RuntimeError(f"Direct connection also failed: {e}")

    async def get_stats(self):
        healthy = sum(1 for p in self.rotator.proxies if not p.is_banned())
        return {"proxies_total": len(self.rotator.proxies), "proxies_healthy": healthy}

# ─── Local HTTP Proxy Server ───
class ProxyServer:
    def __init__(self, port: int = 8080):
        self.port = port
        self.client: Optional[ResilientClient] = None
        self.app = web.Application()
        self.app.router.add_route('*', '/{path:.*}', self.handle_request)
        self.app.router.add_get('/__owl__/health', self.health_check)
        self.app.router.add_get('/__owl__/stats', self.stats_endpoint)

    async def start(self):
        self.client = ResilientClient()
        await self.client.__aenter__()
        runner = web.AppRunner(self.app)
        await runner.setup()
        site = web.TCPSite(runner, '0.0.0.0', self.port)
        await site.start()
        logger.info(f"🦉 OWL Proxy Server listening on 0.0.0.0:{self.port}")
        print(f"🦉 OWL Proxy Server running on http://0.0.0.0:{self.port}")
        print(f"   Health check: http://localhost:{self.port}/__owl__/health")
        print(f"   Stats:        http://localhost:{self.port}/__owl__/stats")
        # Keep running
        while True:
            await asyncio.sleep(3600)

    async def health_check(self, request: web.Request) -> web.Response:
        return web.json_response({"status": "ok", "owl": "proxy-defense-v4.0"})

    async def stats_endpoint(self, request: web.Request) -> web.Response:
        stats = await self.client.get_stats()
        return web.json_response(stats)

    async def handle_request(self, request: web.Request) -> web.Response:
        target_url = request.path_qs
        if request.path.startswith('/__owl__/'):
            return web.Response(status=404)
        # Reconstruct full URL from Host header or query param
        host = request.headers.get('Host', f'localhost:{self.port}')
        # For CONNECT (HTTPS proxy) we would need different handling;
        # for HTTP proxy we forward the request
        if not target_url.startswith('http'):
            # Assume http if no scheme
            target_url = f"http://{host}{target_url}"

        method = request.method
        headers = dict(request.headers)
        headers.pop('Host', None)
        headers.pop('Proxy-Connection', None)

        try:
            body = await request.read()
            resp = await self.client.request(method, target_url, headers=headers if headers else None)
            return web.Response(
                status=resp.status,
                body=resp.content,
                headers={k: v for k, v in resp.headers.items() if k.lower() not in ('transfer-encoding', 'content-encoding')}
            )
        except Exception as e:
            logger.error(f"Proxy request failed: {e}")
            return web.Response(status=502, text=f"OWL Proxy Error: {e}")

    async def stop(self):
        if self.client:
            await self.client.__aexit__(None, None, None)

async def main():
    parser = argparse.ArgumentParser(description="OWL-AGENT Proxy Defense Stack")
    parser.add_argument("--port", type=int, default=8080, help="Local proxy port")
    parser.add_argument("--mode", choices=["server", "client", "test"], default="server", help="Run mode")
    args = parser.parse_args()

    if args.mode == "server":
        server = ProxyServer(port=args.port)
        try:
            await server.start()
        except KeyboardInterrupt:
            await server.stop()
    elif args.mode == "test":
        print("🦉 OWL-AGENT Proxy Defense Stack v4.0 (Direct Fallback Enabled)")
        async with ResilientClient() as client:
            stats = await client.get_stats()
            print(f"Proxy pool: {stats['proxies_total']} total, {stats['proxies_healthy']} healthy")
            try:
                resp = await client.request("GET", "https://api.github.com/users/octocat")
                print(f"✅ Success! Status: {resp.status}, content length: {len(resp.content)} bytes")
                if resp.status == 200:
                    data = json.loads(resp.content)
                    print(f"   User: {data.get('login')} - {data.get('name')}")
            except Exception as e:
                print(f"❌ All attempts failed: {e}")
    else:
        print("Client mode not yet implemented. Use --mode server or --mode test.")

if __name__ == "__main__":
    asyncio.run(main())
PYEOF

  chmod +x "$OWL_DIR/proxy_defense.py"
  log_ok "OWL proxy defense engine written to $OWL_DIR/proxy_defense.py"

  # ─── Default proxy pool config ───
  if [[ ! -f "$OWL_CONFIG/proxy_pool.json" ]]; then
    cat > "$OWL_CONFIG/proxy_pool.json" <<'CONFIG'
{
  "tier_1_managed_free": { "providers": [] },
  "comment": "Add your own proxies here or rely on auto-fetched public ones."
}
CONFIG
    log_ok "Default proxy pool config created"
  fi

  # ─── Create systemd service for OWL proxy ───
  cat > /etc/systemd/system/owl-proxy.service <<'SERVICE'
[Unit]
Description=🦉 OWL-AGENT Proxy Defense Stack
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/owl-agent
Environment="PATH=/opt/owl-agent/venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
Environment="PYTHONUNBUFFERED=1"
ExecStart=/opt/owl-agent/venv/bin/python /opt/owl-agent/proxy_defense.py --mode server --port 8080
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=5
StandardOutput=append:/opt/owl-agent/logs/owl-proxy.log
StandardError=append:/opt/owl-agent/logs/owl-proxy.log

[Install]
WantedBy=multi-user.target
SERVICE

  systemctl daemon-reload
  systemctl enable owl-proxy.service
  log_ok "OWL proxy systemd service created and enabled"

  # ─── Create wrapper scripts ───
  cat > /usr/local/bin/owl-proxy <<'WRAPPER'
#!/bin/bash
# OWL Proxy Control Script
CMD="${1:-status}"
case "$CMD" in
  start)   sudo systemctl start owl-proxy ;;
  stop)    sudo systemctl stop owl-proxy ;;
  restart) sudo systemctl restart owl-proxy ;;
  status)  sudo systemctl status owl-proxy ;;
  logs)    sudo tail -f /opt/owl-agent/logs/owl-proxy.log ;;
  test)    /opt/owl-agent/venv/bin/python /opt/owl-agent/proxy_defense.py --mode test ;;
  stats)   curl -s http://localhost:8080/__owl__/stats | jq . ;;
  *)       echo "Usage: owl-proxy {start|stop|restart|status|logs|test|stats}" ;;
esac
WRAPPER
  chmod +x /usr/local/bin/owl-proxy
  log_ok "OWL proxy control script installed at /usr/local/bin/owl-proxy"
fi

# ═══════════════════════════════════════════════════════════════════════════
#  PHASE 4: Integration & Environment Setup
# ═══════════════════════════════════════════════════════════════════════════
log_brain "[4/7] Configuring OpenHuman ↔ OWL integration..."

# Create environment profile snippet
mkdir -p /etc/profile.d
cat > /etc/profile.d/owl-openhuman.sh <<'ENV'
# OWL-AGENT + OpenHuman Integration Environment
# Set these to route OpenHuman/web requests through the OWL proxy:
# export HTTP_PROXY=http://localhost:8080
# export HTTPS_PROXY=http://localhost:8080
# export NO_PROXY=localhost,127.0.0.1,::1
#
# To enable, uncomment the lines above or run:
#   sudo owl-proxy enable-env
ENV

# Create helper to toggle proxy env
 cat > /usr/local/bin/owl-proxy-env <<'ENVSCRIPT'
#!/bin/bash
ACTION="${1:-show}"
PROFILE="/etc/profile.d/owl-openhuman.sh"
case "$ACTION" in
  enable)
    sudo sed -i 's/^# export HTTP_PROXY/export HTTP_PROXY/' "$PROFILE"
    sudo sed -i 's/^# export HTTPS_PROXY/export HTTPS_PROXY/' "$PROFILE"
    sudo sed -i 's/^# export NO_PROXY/export NO_PROXY/' "$PROFILE"
    echo "✅ OWL proxy environment enabled. Log out and back in to apply."
    ;;
  disable)
    sudo sed -i 's/^export HTTP_PROXY/# export HTTP_PROXY/' "$PROFILE"
    sudo sed -i 's/^export HTTPS_PROXY/# export HTTPS_PROXY/' "$PROFILE"
    sudo sed -i 's/^export NO_PROXY/# export NO_PROXY/' "$PROFILE"
    echo "🚫 OWL proxy environment disabled. Log out and back in to apply."
    ;;
  show)
    grep -E '^(export|# export)' "$PROFILE" || echo "No proxy env configured."
    ;;
  *)
    echo "Usage: owl-proxy-env {enable|disable|show}"
    ;;
esac
ENVSCRIPT
chmod +x /usr/local/bin/owl-proxy-env

log_ok "Integration environment configured"

# ═══════════════════════════════════════════════════════════════════════════
#  PHASE 5: Unified Launcher
# ═══════════════════════════════════════════════════════════════════════════
log_brain "[5/7] Creating unified launcher..."

cat > /usr/local/bin/openhuman-owl <<'LAUNCHER'
#!/bin/bash
# 🦉🧠 OpenHuman + OWL Proxy Unified Launcher

OWL_STATUS=$(systemctl is-active owl-proxy 2>/dev/null || echo "inactive")

start_owl() {
  if [[ "$OWL_STATUS" != "active" ]]; then
    echo "🦉 Starting OWL proxy defense stack..."
    sudo systemctl start owl-proxy
    sleep 2
  fi
}

case "${1:-}" in
  --no-proxy)
    echo "🧠 Launching OpenHuman without OWL proxy..."
    openhuman "$@"
    ;;
  --proxy-only)
    start_owl
    echo "🦉 OWL proxy running at http://localhost:8080"
    echo "   Health:  http://localhost:8080/__owl__/health"
    echo "   Stats:   http://localhost:8080/__owl__/stats"
    ;;
  --status)
    echo "🦉 OWL Proxy: $(systemctl is-active owl-proxy 2>/dev/null || echo 'unknown')"
    echo "🧠 OpenHuman: $(command -v openhuman >/dev/null 2>&1 && echo 'installed' || echo 'not found')"
    ;;
  --help|-h)
    echo "Usage: openhuman-owl [OPTION]"
    echo ""
    echo "Options:"
    echo "  (none)        Start OWL proxy + OpenHuman (default)"
    echo "  --no-proxy    Start OpenHuman only"
    echo "  --proxy-only  Start OWL proxy only"
    echo "  --status      Show service status"
    echo "  --help        Show this help"
    ;;
  *)
    start_owl
    echo "🧠 Launching OpenHuman..."
    openhuman "$@" &
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║  🦉 OWL Proxy:  http://localhost:8080                        ║"
    echo "║  🧠 OpenHuman:   Desktop app launched                        ║"
    echo "║                                                              ║"
    echo "║  Commands:                                                   ║"
    echo "║    owl-proxy status      → Check proxy health                ║"
    echo "║    owl-proxy stats       → View proxy pool stats             ║"
    echo "║    owl-proxy logs        → Tail proxy logs                   ║"
    echo "║    owl-proxy-env enable  → Enable system-wide proxy routing  ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    ;;
esac
LAUNCHER
chmod +x /usr/local/bin/openhuman-owl

# Update desktop entry to use unified launcher
if [[ -f /usr/share/applications/openhuman.desktop ]]; then
  sed -i 's|Exec=/usr/bin/openhuman|Exec=/usr/local/bin/openhuman-owl|g' /usr/share/applications/openhuman.desktop
  log_ok "Desktop entry updated to use unified launcher"
fi

log_ok "Unified launcher installed at /usr/local/bin/openhuman-owl"

# ═══════════════════════════════════════════════════════════════════════════
#  PHASE 6: Start Services
# ═══════════════════════════════════════════════════════════════════════════
log_brain "[6/7] Starting services..."

if [[ "$INSTALL_OWL" == true ]]; then
  systemctl start owl-proxy || true
  sleep 2
  if systemctl is-active --quiet owl-proxy; then
    log_ok "OWL proxy service is active on port 8080"
  else
    log_warn "OWL proxy service failed to start immediately (may need network)"
    log_warn "Check with: sudo owl-proxy status"
  fi
fi

# ═══════════════════════════════════════════════════════════════════════════
#  PHASE 7: Verification & Summary
# ═══════════════════════════════════════════════════════════════════════════
log_brain "[7/7] Running verification..."

if [[ "$INSTALL_OWL" == true ]]; then
  if curl -s --max-time 5 http://localhost:8080/__owl__/health >/dev/null 2>&1; then
    log_ok "OWL proxy health check passed"
    curl -s http://localhost:8080/__owl__/stats 2>/dev/null | jq -r '. | "   Proxies: \(.proxies_total) total, \(.proxies_healthy) healthy"' || true
  else
    log_warn "OWL proxy health check failed (service may still be initializing)"
  fi
fi

if [[ "$INSTALL_OPENHUMAN" == true ]]; then
  if dpkg -l | grep -q openhuman; then
    log_ok "OpenHuman package verified in dpkg"
  fi
fi

# ─── Final Banner ───
cat <<'BANNER'

╔═══════════════════════════════════════════════════════════════════════════╗
║                    ✅ INSTALLATION COMPLETE                               ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  🧠 OpenHuman                                                             ║
║     Launch:        openhuman-owl                                          ║
║     Desktop:       openhuman-owl --status                               ║
║     App:           /usr/bin/openhuman (or /opt if AppImage)               ║
║                                                                           ║
║  🦉 OWL-AGENT Proxy Defense Stack                                         ║
║     Service:       sudo systemctl {start|stop|status} owl-proxy           ║
║     Control:       owl-proxy {start|stop|restart|status|logs|test}      ║
║     Stats:         curl http://localhost:8080/__owl__/stats               ║
║     Health:        curl http://localhost:8080/__owl__/health               ║
║                                                                           ║
║  🔗 Integration                                                           ║
║     Enable proxy env:   sudo owl-proxy-env enable                         ║
║     Disable proxy env:  sudo owl-proxy-env disable                        ║
║     View env:           sudo owl-proxy-env show                           ║
║                                                                           ║
║  📁 Directories                                                           ║
║     OWL config:    /opt/owl-agent/config/                                 ║
║     OWL cache:     /opt/owl-agent/cache/http/                             ║
║     OWL logs:      /opt/owl-agent/logs/                                   ║
║     Add proxies:   /opt/owl-agent/config/proxy_pool.json                  ║
║                                                                           ║
║  🚀 Quick Start                                                           ║
║     1. Start everything:  openhuman-owl                                   ║
║     2. Or just proxy:     openhuman-owl --proxy-only                      ║
║     3. Or just OpenHuman: openhuman-owl --no-proxy                        ║
║                                                                           ║
║  📝 Notes                                                                 ║
║     • Free proxies auto-fetched on first run (GitHub + ProxyScrape)       ║
║     • Add your own proxies in proxy_pool.json for reliability             ║
║     • OWL proxy runs as systemd service, auto-starts on boot              ║
║     • OpenHuman uses managed backend by default; OWL proxy is optional    ║
║       system-wide HTTP proxy for advanced privacy/routing needs          ║
╚═══════════════════════════════════════════════════════════════════════════╝

BANNER

if [[ "$OWL_ONLY" == true ]]; then
  echo "🦉 OWL-only install complete. Run 'owl-proxy start' to begin."
elif [[ "$OH_ONLY" == true ]]; then
  echo "🧠 OpenHuman-only install complete. Run 'openhuman' to begin."
else
  echo "🦉🧠 Full stack installed. Run 'openhuman-owl' to launch both."
fi
