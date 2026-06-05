#!/usr/bin/env python3
"""
Persistent Memory v2.0.0 — Cross-Session State Store
Async-first, encrypted, observable, production-grade.

Improvements over v1:
  1. aiohttp + aiosqlite for async I/O (no blocking per-request)
  2. AES-256-GCM encryption for sensitive namespace values
  3. Batch operations (multi-get, multi-put, multi-delete)
  4. Namespace listing and management endpoints
  5. Webhook-based change notifications
  6. Data export/import endpoints (JSON dump/restore)
  7. Atomic snapshot restore (single transaction)
  8. Prometheus-compatible /metrics endpoint
  9. Maximum value size limit (configurable, default 1 MiB)
  10. Graceful shutdown with signal handlers
  11. Connection pooling via aiosqlite shared connection
  12. Rate limiting on API endpoints

Usage:
  python3 pmem_v2.py [--port 6380] [--db pmem.db] [--durability async]
                     [--max-value-size 1048576] [--encryption-key <hex>]
                     [--rate-limit 100]

Endpoints:
  PUT    /v1/{namespace}/{key}          — Store a value
  GET    /v1/{namespace}/{key}          — Retrieve a value
  DEL    /v1/{namespace}/{key}          — Delete a value
  GET    /v1/{namespace}                — List all keys in a namespace
  POST   /v1/{namespace}/snapshot       — Create a namespace snapshot
  POST   /v1/{namespace}/restore        — Restore from a snapshot
  POST   /v1/{namespace}/subscribe      — Subscribe webhook to namespace changes
  POST   /v1/batch/get                  — Batch get multiple keys
  POST   /v1/batch/put                  — Batch put multiple keys
  POST   /v1/batch/delete               — Batch delete multiple keys
  GET    /v1/namespaces                 — List all namespaces with stats
  DEL    /v1/namespaces/{namespace}     — Delete an entire namespace
  POST   /v1/export                     — Export all data as JSON
  POST   /v1/import                     — Import data from JSON
  GET    /v1/health                     — Health check
  GET    /metrics                       — Prometheus-compatible metrics
"""

from __future__ import annotations

import argparse
import asyncio
import base64
import hashlib
import json
import logging
import os
import signal
import sqlite3
import time
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

import aiohttp
from aiohttp import web

try:
    import aiosqlite
except ImportError:
    aiosqlite = None  # type: ignore[assignment]

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
    from cryptography.hazmat.primitives import hashes
    HAS_CRYPTO = True
except ImportError:
    HAS_CRYPTO = False

# ============================================================================
# Constants
# ============================================================================

VERSION = "2.0.0"
DEFAULT_PORT = 6380
DEFAULT_DB = "pmem.db"
DEFAULT_DURABILITY = "async"
DEFAULT_MAX_VALUE_SIZE = 1 * 1024 * 1024  # 1 MiB
DEFAULT_RATE_LIMIT = 100  # requests per minute per IP
ENCRYPTED_PREFIX = "enc:v1:"
TTL_CLEANUP_INTERVAL = 60  # seconds
WAL_CHECKPOINT_INTERVAL = 300  # seconds
VACUUM_INTERVAL = 3600  # seconds

SCHEMA = """
CREATE TABLE IF NOT EXISTS kv_store (
    namespace TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    ttl_expires REAL DEFAULT 0,
    version INTEGER DEFAULT 1,
    created_at REAL NOT NULL,
    updated_at REAL NOT NULL,
    value_size INTEGER DEFAULT 0,
    encrypted INTEGER DEFAULT 0,
    PRIMARY KEY (namespace, key)
);

CREATE INDEX IF NOT EXISTS idx_ttl ON kv_store(ttl_expires) WHERE ttl_expires > 0;
CREATE INDEX IF NOT EXISTS idx_namespace ON kv_store(namespace);

CREATE TABLE IF NOT EXISTS snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    namespace TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at REAL NOT NULL,
    label TEXT,
    key_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS webhooks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    namespace TEXT NOT NULL,
    url TEXT NOT NULL,
    secret TEXT,
    created_at REAL NOT NULL,
    active INTEGER DEFAULT 1,
    UNIQUE(namespace, url)
);

CREATE TABLE IF NOT EXISTS namespace_meta (
    namespace TEXT PRIMARY KEY,
    encrypted INTEGER DEFAULT 0,
    created_at REAL NOT NULL,
    description TEXT DEFAULT ''
);
"""

logger = logging.getLogger("pmem")

# ============================================================================
# Encryption Engine
# ============================================================================

class EncryptionEngine:
    """AES-256-GCM encryption for namespace-level value protection.

    Each namespace gets a derived key from the master key + namespace salt.
    Values are encrypted with a random 12-byte nonce per operation.
    The stored format is: enc:v1:<base64(nonce||ciphertext||tag)>
    """

    def __init__(self, master_key_hex: Optional[str] = None):
        self._enabled = False
        self._master_key: Optional[bytes] = None
        if master_key_hex and HAS_CRYPTO:
            self._master_key = bytes.fromhex(master_key_hex)
            if len(self._master_key) != 32:
                raise ValueError("Encryption key must be 32 bytes (64 hex chars)")
            self._enabled = True
        elif master_key_hex and not HAS_CRYPTO:
            logger.warning("cryptography library not installed; encryption disabled")

    @property
    def enabled(self) -> bool:
        return self._enabled

    def _derive_namespace_key(self, namespace: str) -> bytes:
        """Derive a per-namespace key using PBKDF2."""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=f"pmem-ns-{namespace}".encode(),
            iterations=100_000,
        )
        return kdf.derive(self._master_key)  # type: ignore[arg-type]

    def encrypt(self, namespace: str, plaintext: str) -> str:
        """Encrypt a value for a namespace. Returns prefixed base64 string."""
        if not self._enabled:
            return plaintext
        ns_key = self._derive_namespace_key(namespace)
        aesgcm = AESGCM(ns_key)
        nonce = os.urandom(12)
        ciphertext = aesgcm.encrypt(nonce, plaintext.encode("utf-8"), None)
        payload = nonce + ciphertext
        return f"{ENCRYPTED_PREFIX}{base64.b64encode(payload).decode('ascii')}"

    def decrypt(self, namespace: str, stored: str) -> str:
        """Decrypt a value for a namespace. Handles both encrypted and plain."""
        if not stored.startswith(ENCRYPTED_PREFIX) or not self._enabled:
            return stored
        ns_key = self._derive_namespace_key(namespace)
        aesgcm = AESGCM(ns_key)
        payload = base64.b64decode(stored[len(ENCRYPTED_PREFIX):])
        nonce = payload[:12]
        ciphertext = payload[12:]
        return aesgcm.decrypt(nonce, ciphertext, None).decode("utf-8")


# ============================================================================
# Rate Limiter
# ============================================================================

class RateLimiter:
    """Token-bucket rate limiter per client IP."""

    def __init__(self, requests_per_minute: int = DEFAULT_RATE_LIMIT):
        self.rpm = requests_per_minute
        self._buckets: Dict[str, Tuple[float, float]] = {}  # ip -> (tokens, last_refill)
        self._lock = asyncio.Lock()

    async def allow(self, client_ip: str) -> bool:
        async with self._lock:
            now = time.monotonic()
            tokens, last_refill = self._buckets.get(client_ip, (float(self.rpm), now))
            elapsed = now - last_refill
            tokens = min(float(self.rpm), tokens + elapsed * (self.rpm / 60.0))
            if tokens >= 1.0:
                tokens -= 1.0
                self._buckets[client_ip] = (tokens, now)
                return True
            self._buckets[client_ip] = (tokens, now)
            return False

    async def cleanup_stale(self, max_age: float = 300.0):
        """Remove buckets inactive for > max_age seconds."""
        async with self._lock:
            now = time.monotonic()
            stale = [ip for ip, (_, last) in self._buckets.items() if now - last > max_age]
            for ip in stale:
                del self._buckets[ip]


# ============================================================================
# Metrics
# ============================================================================

class Metrics:
    """Prometheus-compatible metrics collector."""

    def __init__(self):
        self.request_count: Dict[str, int] = defaultdict(int)  # method_endpoint -> count
        self.request_latency: Dict[str, List[float]] = defaultdict(list)  # method_endpoint -> [latencies]
        self.error_count: Dict[str, int] = defaultdict(int)  # method_endpoint_status -> count
        self.db_operations: Dict[str, int] = defaultdict(int)  # operation -> count
        self.webhook_fired: int = 0
        self.webhook_failed: int = 0
        self.encryption_ops: int = 0
        self.start_time = time.time()
        self._active_connections: int = 0

    def record_request(self, method: str, endpoint: str, latency: float, status: int):
        key = f"{method}_{endpoint}"
        self.request_count[key] += 1
        self.request_latency[key].append(latency)
        # Keep only last 1000 latencies per key for percentile calculation
        if len(self.request_latency[key]) > 1000:
            self.request_latency[key] = self.request_latency[key][-1000:]
        if status >= 400:
            self.error_count[f"{key}_{status}"] += 1

    def record_db_op(self, operation: str):
        self.db_operations[operation] += 1

    def render(self, total_keys: int, total_namespaces: int, total_snapshots: int,
               expired_keys: int, active_webhooks: int) -> str:
        """Render metrics in Prometheus exposition format."""
        lines = []
        lines.append("# HELP pmem_info Build and runtime info")
        lines.append("# TYPE pmem_info gauge")
        lines.append(f'pmem_info{{version="{VERSION}"}} 1')
        lines.append("")
        lines.append("# HELP pmem_uptime_seconds Process uptime in seconds")
        lines.append("# TYPE pmem_uptime_seconds gauge")
        lines.append(f"pmem_uptime_seconds {time.time() - self.start_time:.0f}")
        lines.append("")
        lines.append("# HELP pmem_keys_total Total keys in store")
        lines.append("# TYPE pmem_keys_total gauge")
        lines.append(f"pmem_keys_total {total_keys}")
        lines.append("")
        lines.append("# HELP pmem_namespaces_total Total namespaces")
        lines.append("# TYPE pmem_namespaces_total gauge")
        lines.append(f"pmem_namespaces_total {total_namespaces}")
        lines.append("")
        lines.append("# HELP pmem_snapshots_total Total snapshots")
        lines.append("# TYPE pmem_snapshots_total gauge")
        lines.append(f"pmem_snapshots_total {total_snapshots}")
        lines.append("")
        lines.append("# HELP pmem_expired_keys_pending Expired keys pending cleanup")
        lines.append("# TYPE pmem_expired_keys_pending gauge")
        lines.append(f"pmem_expired_keys_pending {expired_keys}")
        lines.append("")
        lines.append("# HELP pmem_webhooks_active Active webhook subscriptions")
        lines.append("# TYPE pmem_webhooks_active gauge")
        lines.append(f"pmem_webhooks_active {active_webhooks}")
        lines.append("")
        lines.append("# HELP pmem_webhook_fired_total Total webhook notifications fired")
        lines.append("# TYPE pmem_webhook_fired_total counter")
        lines.append(f"pmem_webhook_fired_total {self.webhook_fired}")
        lines.append("")
        lines.append("# HELP pmem_webhook_failed_total Total webhook notifications failed")
        lines.append("# TYPE pmem_webhook_failed_total counter")
        lines.append(f"pmem_webhook_failed_total {self.webhook_failed}")
        lines.append("")
        lines.append("# HELP pmem_encryption_ops_total Total encryption/decryption operations")
        lines.append("# TYPE pmem_encryption_ops_total counter")
        lines.append(f"pmem_encryption_ops_total {self.encryption_ops}")
        lines.append("")
        lines.append("# HELP pmem_http_requests_total Total HTTP requests")
        lines.append("# TYPE pmem_http_requests_total counter")
        for key, count in sorted(self.request_count.items()):
            method, endpoint = key.split("_", 1)
            lines.append(f'pmem_http_requests_total{{method="{method}",endpoint="{endpoint}"}} {count}')
        lines.append("")
        lines.append("# HELP pmem_http_errors_total Total HTTP errors")
        lines.append("# TYPE pmem_http_errors_total counter")
        for key, count in sorted(self.error_count.items()):
            parts = key.rsplit("_", 1)
            method_ep = parts[0]
            status = parts[1] if len(parts) > 1 else "0"
            method, endpoint = method_ep.split("_", 1)
            lines.append(f'pmem_http_errors_total{{method="{method}",endpoint="{endpoint}",status="{status}"}} {count}')
        lines.append("")
        lines.append("# HELP pmem_db_operations_total Total database operations")
        lines.append("# TYPE pmem_db_operations_total counter")
        for op, count in sorted(self.db_operations.items()):
            lines.append(f'pmem_db_operations_total{{operation="{op}"}} {count}')
        lines.append("")
        lines.append("# HELP pmem_http_request_latency_seconds Request latency")
        lines.append("# TYPE pmem_http_request_latency_seconds summary")
        for key, latencies in sorted(self.request_latency.items()):
            method, endpoint = key.split("_", 1)
            if latencies:
                avg = sum(latencies) / len(latencies)
                p50 = sorted(latencies)[len(latencies) // 2]
                p99 = sorted(latencies)[int(len(latencies) * 0.99)]
                lines.append(f'pmem_http_request_latency_seconds{{method="{method}",endpoint="{endpoint}",quantile="0.5"}} {p50:.6f}')
                lines.append(f'pmem_http_request_latency_seconds{{method="{method}",endpoint="{endpoint}",quantile="0.99"}} {p99:.6f}')
                lines.append(f'pmem_http_request_latency_seconds_avg{{method="{method}",endpoint="{endpoint}"}} {avg:.6f}')
        lines.append("")
        return "\n".join(lines)


# ============================================================================
# Storage Engine (Async)
# ============================================================================

class PersistentMemoryStore:
    """Async persistent key-value store with TTL, encryption, batch ops, and webhooks."""

    def __init__(self, db_path: str, durability: str = "async",
                 max_value_size: int = DEFAULT_MAX_VALUE_SIZE,
                 encryption_engine: Optional[EncryptionEngine] = None):
        self.db_path = db_path
        self.durability = durability
        self.max_value_size = max_value_size
        self._encryption = encryption_engine or EncryptionEngine()
        self._db: Optional[aiosqlite.Connection] = None  # type: ignore[assignment]
        self._webhooks_cache: Dict[str, List[Dict]] = defaultdict(list)  # namespace -> [webhook]
        self._in_process_listeners: Dict[str, List] = defaultdict(list)
        self._metrics = Metrics()
        self._background_tasks: List[asyncio.Task] = []
        self._http_session: Optional[aiohttp.ClientSession] = None

    async def initialize(self):
        """Open the database connection, create schema, and start background tasks."""
        self._db = await aiosqlite.connect(self.db_path)
        self._db.row_factory = sqlite3.Row
        await self._db.executescript(SCHEMA)

        # Configure durability
        await self._db.execute("PRAGMA journal_mode=WAL")
        if self.durability == "sync":
            await self._db.execute("PRAGMA synchronous=FULL")
        elif self.durability == "async":
            await self._db.execute("PRAGMA synchronous=NORMAL")
        else:
            await self._db.execute("PRAGMA synchronous=OFF")

        # Load webhooks into cache
        await self._load_webhooks()

        # Start HTTP session for webhook delivery
        self._http_session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=5, connect=2),
        )

        # Start background tasks
        self._background_tasks.append(asyncio.create_task(self._ttl_cleanup_loop()))
        self._background_tasks.append(asyncio.create_task(self._wal_checkpoint_loop()))
        self._background_tasks.append(asyncio.create_task(self._vacuum_loop()))

    async def close(self):
        """Gracefully close the database and cancel background tasks."""
        for task in self._background_tasks:
            task.cancel()
        for task in self._background_tasks:
            try:
                await task
            except asyncio.CancelledError:
                pass

        if self._http_session:
            await self._http_session.close()

        if self._db:
            await self._db.close()

    async def _load_webhooks(self):
        """Load webhooks from DB into memory cache."""
        cursor = await self._db.execute("SELECT * FROM webhooks WHERE active = 1")
        rows = await cursor.fetchall()
        self._webhooks_cache.clear()
        for row in rows:
            wh = dict(row)
            self._webhooks_cache[wh["namespace"]].append(wh)

    # ---- Core CRUD ----

    async def put(self, namespace: str, key: str, value: Any,
                  ttl_seconds: int = 0, expected_version: int = 0) -> Dict:
        """Store a value with optional TTL and optimistic concurrency control."""
        self._metrics.record_db_op("put")
        now = time.time()
        value_str = json.dumps(value)

        # Value size limit
        if len(value_str) > self.max_value_size:
            return {"status": "error", "error": f"Value size {len(value_str)} exceeds limit {self.max_value_size}"}

        # Encrypt if namespace is encrypted
        encrypted = 0
        if self._encryption.enabled:
            # Check if namespace is marked encrypted
            cursor = await self._db.execute(  # type: ignore[union-attr]
                "SELECT encrypted FROM namespace_meta WHERE namespace = ?", (namespace,)
            )
            meta = await cursor.fetchone()
            if meta and meta["encrypted"]:
                value_str = self._encryption.encrypt(namespace, value_str)
                encrypted = 1
                self._metrics.encryption_ops += 1

        ttl_expires = now + ttl_seconds if ttl_seconds > 0 else 0

        async with self._db.execute("BEGIN IMMEDIATE"):  # type: ignore[union-attr]
            # Optimistic concurrency check
            if expected_version > 0:
                cursor = await self._db.execute(  # type: ignore[union-attr]
                    "SELECT version FROM kv_store WHERE namespace = ? AND key = ?",
                    (namespace, key)
                )
                current = await cursor.fetchone()
                if current and current["version"] != expected_version:
                    return {"status": "conflict", "expected_version": expected_version,
                            "current_version": current["version"]}
                elif not current:
                    return {"status": "not_found", "key": key}

            # Upsert
            cursor = await self._db.execute(  # type: ignore[union-attr]
                "SELECT version FROM kv_store WHERE namespace = ? AND key = ?",
                (namespace, key)
            )
            existing = await cursor.fetchone()

            if existing:
                new_version = existing["version"] + 1
                await self._db.execute(  # type: ignore[union-attr]
                    """UPDATE kv_store SET value = ?, ttl_expires = ?, version = ?, updated_at = ?,
                       value_size = ?, encrypted = ?
                       WHERE namespace = ? AND key = ?""",
                    (value_str, ttl_expires, new_version, now, len(value_str), encrypted,
                     namespace, key)
                )
            else:
                new_version = 1
                await self._db.execute(  # type: ignore[union-attr]
                    """INSERT INTO kv_store (namespace, key, value, ttl_expires, version,
                       created_at, updated_at, value_size, encrypted)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (namespace, key, value_str, ttl_expires, 1, now, now,
                     len(value_str), encrypted)
                )

            await self._db.commit()  # type: ignore[union-attr]

        # Notify
        await self._notify(namespace, key, value, "put")
        return {"status": "ok", "namespace": namespace, "key": key,
                "version": new_version, "ttl_expires": ttl_expires,
                "value_size": len(value_str), "encrypted": bool(encrypted)}

    async def get(self, namespace: str, key: str) -> Optional[Dict]:
        """Retrieve a value by namespace and key."""
        self._metrics.record_db_op("get")
        cursor = await self._db.execute(  # type: ignore[union-attr]
            "SELECT * FROM kv_store WHERE namespace = ? AND key = ?",
            (namespace, key)
        )
        row = await cursor.fetchone()

        if not row:
            return None

        # Check TTL
        if row["ttl_expires"] > 0 and row["ttl_expires"] < time.time():
            await self._db.execute(  # type: ignore[union-attr]
                "DELETE FROM kv_store WHERE namespace = ? AND key = ?",
                (namespace, key)
            )
            await self._db.commit()  # type: ignore[union-attr]
            return None

        # Decrypt if encrypted
        stored_value = row["value"]
        if row["encrypted"] and self._encryption.enabled:
            stored_value = self._encryption.decrypt(namespace, stored_value)
            self._metrics.encryption_ops += 1

        return {
            "namespace": row["namespace"],
            "key": row["key"],
            "value": json.loads(stored_value),
            "version": row["version"],
            "ttl_expires": row["ttl_expires"],
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
            "value_size": row["value_size"],
            "encrypted": bool(row["encrypted"]),
        }

    async def delete(self, namespace: str, key: str, expected_version: int = 0) -> Dict:
        """Delete a value with optional optimistic concurrency control."""
        self._metrics.record_db_op("delete")

        async with self._db.execute("BEGIN IMMEDIATE"):  # type: ignore[union-attr]
            if expected_version > 0:
                cursor = await self._db.execute(  # type: ignore[union-attr]
                    "SELECT version FROM kv_store WHERE namespace = ? AND key = ?",
                    (namespace, key)
                )
                current = await cursor.fetchone()
                if current and current["version"] != expected_version:
                    return {"status": "conflict"}
                elif not current:
                    return {"status": "not_found"}

            cursor = await self._db.execute(  # type: ignore[union-attr]
                "DELETE FROM kv_store WHERE namespace = ? AND key = ?",
                (namespace, key)
            )
            deleted = cursor.rowcount
            await self._db.commit()  # type: ignore[union-attr]

        await self._notify(namespace, key, None, "delete")
        return {"status": "ok" if deleted > 0 else "not_found"}

    async def list_keys(self, namespace: str) -> List[Dict]:
        """List all keys in a namespace with their metadata."""
        self._metrics.record_db_op("list_keys")
        now = time.time()
        cursor = await self._db.execute(  # type: ignore[union-attr]
            """SELECT namespace, key, version, ttl_expires, created_at, updated_at, value_size, encrypted
               FROM kv_store WHERE namespace = ? AND (ttl_expires = 0 OR ttl_expires > ?)
               ORDER BY key""",
            (namespace, now)
        )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]

    # ---- Batch Operations ----

    async def batch_get(self, items: List[Dict[str, str]]) -> Dict:
        """Batch get: items = [{"namespace": ..., "key": ...}, ...]"""
        self._metrics.record_db_op("batch_get")
        results = []
        now = time.time()
        for item in items:
            ns = item.get("namespace", "")
            key = item.get("key", "")
            cursor = await self._db.execute(  # type: ignore[union-attr]
                "SELECT * FROM kv_store WHERE namespace = ? AND key = ?",
                (ns, key)
            )
            row = await cursor.fetchone()
            if row and not (row["ttl_expires"] > 0 and row["ttl_expires"] < now):
                stored_value = row["value"]
                if row["encrypted"] and self._encryption.enabled:
                    stored_value = self._encryption.decrypt(ns, stored_value)
                    self._metrics.encryption_ops += 1
                results.append({
                    "namespace": ns, "key": key,
                    "value": json.loads(stored_value),
                    "version": row["version"],
                    "found": True,
                })
            else:
                results.append({"namespace": ns, "key": key, "found": False})
        return {"status": "ok", "results": results, "count": len(results)}

    async def batch_put(self, items: List[Dict]) -> Dict:
        """Batch put: items = [{"namespace", "key", "value", "ttl_seconds"}, ...]"""
        self._metrics.record_db_op("batch_put")
        results = []
        now = time.time()

        async with self._db.execute("BEGIN IMMEDIATE"):  # type: ignore[union-attr]
            for item in items:
                ns = item.get("namespace", "")
                key = item.get("key", "")
                value = item.get("value")
                ttl_seconds = item.get("ttl_seconds", 0)
                value_str = json.dumps(value)

                if len(value_str) > self.max_value_size:
                    results.append({"namespace": ns, "key": key, "status": "error",
                                    "error": "value too large"})
                    continue

                encrypted = 0
                # Check namespace encryption
                if self._encryption.enabled:
                    cursor = await self._db.execute(  # type: ignore[union-attr]
                        "SELECT encrypted FROM namespace_meta WHERE namespace = ?", (ns,)
                    )
                    meta = await cursor.fetchone()
                    if meta and meta["encrypted"]:
                        value_str = self._encryption.encrypt(ns, value_str)
                        encrypted = 1
                        self._metrics.encryption_ops += 1

                ttl_expires = now + ttl_seconds if ttl_seconds > 0 else 0

                cursor = await self._db.execute(  # type: ignore[union-attr]
                    "SELECT version FROM kv_store WHERE namespace = ? AND key = ?",
                    (ns, key)
                )
                existing = await cursor.fetchone()

                if existing:
                    new_version = existing["version"] + 1
                    await self._db.execute(  # type: ignore[union-attr]
                        """UPDATE kv_store SET value = ?, ttl_expires = ?, version = ?,
                           updated_at = ?, value_size = ?, encrypted = ?
                           WHERE namespace = ? AND key = ?""",
                        (value_str, ttl_expires, new_version, now, len(value_str),
                         encrypted, ns, key)
                    )
                else:
                    new_version = 1
                    await self._db.execute(  # type: ignore[union-attr]
                        """INSERT INTO kv_store (namespace, key, value, ttl_expires, version,
                           created_at, updated_at, value_size, encrypted)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (ns, key, value_str, ttl_expires, 1, now, now,
                         len(value_str), encrypted)
                    )

                results.append({"namespace": ns, "key": key, "status": "ok",
                                "version": new_version})

            await self._db.commit()  # type: ignore[union-attr]

        # Fire notifications
        for item, result in zip(items, results):
            if result["status"] == "ok":
                await self._notify(item["namespace"], item["key"], item.get("value"), "put")

        return {"status": "ok", "results": results, "count": len(results)}

    async def batch_delete(self, items: List[Dict[str, str]]) -> Dict:
        """Batch delete: items = [{"namespace": ..., "key": ...}, ...]"""
        self._metrics.record_db_op("batch_delete")
        results = []

        async with self._db.execute("BEGIN IMMEDIATE"):  # type: ignore[union-attr]
            for item in items:
                ns = item.get("namespace", "")
                key = item.get("key", "")
                cursor = await self._db.execute(  # type: ignore[union-attr]
                    "DELETE FROM kv_store WHERE namespace = ? AND key = ?",
                    (ns, key)
                )
                deleted = cursor.rowcount
                results.append({"namespace": ns, "key": key,
                                "status": "ok" if deleted > 0 else "not_found"})
            await self._db.commit()  # type: ignore[union-attr]

        # Fire notifications
        for item, result in zip(items, results):
            if result["status"] == "ok":
                await self._notify(item["namespace"], item["key"], None, "delete")

        return {"status": "ok", "results": results, "count": len(results)}

    # ---- Snapshots ----

    async def snapshot(self, namespace: str, label: str = "") -> Dict:
        """Create a point-in-time snapshot of a namespace."""
        self._metrics.record_db_op("snapshot")
        cursor = await self._db.execute(  # type: ignore[union-attr]
            "SELECT key, value, ttl_expires, version, encrypted FROM kv_store WHERE namespace = ?",
            (namespace,)
        )
        rows = await cursor.fetchall()
        data = json.dumps([dict(r) for r in rows])
        now = time.time()
        cursor = await self._db.execute(  # type: ignore[union-attr]
            "INSERT INTO snapshots (namespace, data, created_at, label, key_count) VALUES (?, ?, ?, ?, ?)",
            (namespace, data, now, label, len(rows))
        )
        await self._db.commit()  # type: ignore[union-attr]
        snap_id = cursor.lastrowid
        return {"status": "ok", "snapshot_id": snap_id, "namespace": namespace,
                "key_count": len(rows), "label": label}

    async def restore(self, namespace: str, snapshot_id: Optional[int] = None) -> Dict:
        """Restore a namespace from a snapshot — ATOMIC (single transaction)."""
        self._metrics.record_db_op("restore")

        async with self._db.execute("BEGIN IMMEDIATE"):  # type: ignore[union-attr]
            if snapshot_id:
                cursor = await self._db.execute(  # type: ignore[union-attr]
                    "SELECT * FROM snapshots WHERE id = ? AND namespace = ?",
                    (snapshot_id, namespace)
                )
            else:
                cursor = await self._db.execute(  # type: ignore[union-attr]
                    "SELECT * FROM snapshots WHERE namespace = ? ORDER BY created_at DESC LIMIT 1",
                    (namespace,)
                )
            snap = await cursor.fetchone()

            if not snap:
                # Rollback via not committing — but we need to end the transaction
                await self._db.rollback()  # type: ignore[union-attr]
                return {"status": "not_found", "error": "No snapshot found"}

            data = json.loads(snap["data"])
            now = time.time()

            # Clear + Insert in SAME transaction = atomic
            await self._db.execute(  # type: ignore[union-attr]
                "DELETE FROM kv_store WHERE namespace = ?", (namespace,)
            )
            for entry in data:
                await self._db.execute(  # type: ignore[union-attr]
                    """INSERT INTO kv_store (namespace, key, value, ttl_expires, version,
                       created_at, updated_at, value_size, encrypted)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (namespace, entry["key"], entry["value"], entry["ttl_expires"],
                     entry["version"], now, now,
                     len(entry.get("value", "")),
                     entry.get("encrypted", 0))
                )

            await self._db.commit()  # type: ignore[union-attr]

        return {"status": "ok", "restored_keys": len(data), "snapshot_id": snap["id"]}

    # ---- Namespace Management ----

    async def list_namespaces(self) -> List[Dict]:
        """List all namespaces with per-namespace stats."""
        self._metrics.record_db_op("list_namespaces")
        now = time.time()
        cursor = await self._db.execute(  # type: ignore[union-attr]
            """SELECT namespace, COUNT(*) as key_count,
               SUM(value_size) as total_size,
               SUM(CASE WHEN ttl_expires > 0 AND ttl_expires < ? THEN 1 ELSE 0 END) as expired_count,
               MAX(updated_at) as last_updated
               FROM kv_store GROUP BY namespace ORDER BY namespace""",
            (now,)
        )
        rows = await cursor.fetchall()
        result = []
        for row in rows:
            ns_data = dict(row)
            # Get namespace metadata
            cursor2 = await self._db.execute(  # type: ignore[union-attr]
                "SELECT encrypted, description FROM namespace_meta WHERE namespace = ?",
                (row["namespace"],)
            )
            meta = await cursor2.fetchone()
            ns_data["encrypted"] = bool(meta["encrypted"]) if meta else False
            ns_data["description"] = meta["description"] if meta else ""
            result.append(ns_data)
        return result

    async def create_namespace(self, namespace: str, encrypted: bool = False,
                               description: str = "") -> Dict:
        """Create/register a namespace with metadata."""
        self._metrics.record_db_op("create_namespace")
        now = time.time()
        await self._db.execute(  # type: ignore[union-attr]
            """INSERT OR REPLACE INTO namespace_meta (namespace, encrypted, created_at, description)
               VALUES (?, ?, ?, ?)""",
            (namespace, 1 if encrypted else 0, now, description)
        )
        await self._db.commit()  # type: ignore[union-attr]
        return {"status": "ok", "namespace": namespace, "encrypted": encrypted,
                "description": description}

    async def delete_namespace(self, namespace: str) -> Dict:
        """Delete an entire namespace and all its keys/snapshots."""
        self._metrics.record_db_op("delete_namespace")
        async with self._db.execute("BEGIN IMMEDIATE"):  # type: ignore[union-attr]
            cursor = await self._db.execute(  # type: ignore[union-attr]
                "SELECT COUNT(*) FROM kv_store WHERE namespace = ?", (namespace,)
            )
            key_count = (await cursor.fetchone())[0]

            await self._db.execute(  # type: ignore[union-attr]
                "DELETE FROM kv_store WHERE namespace = ?", (namespace,)
            )
            await self._db.execute(  # type: ignore[union-attr]
                "DELETE FROM snapshots WHERE namespace = ?", (namespace,)
            )
            await self._db.execute(  # type: ignore[union-attr]
                "DELETE FROM namespace_meta WHERE namespace = ?", (namespace,)
            )
            await self._db.execute(  # type: ignore[union-attr]
                "DELETE FROM webhooks WHERE namespace = ?", (namespace,)
            )
            await self._db.commit()  # type: ignore[union-attr]

        # Clear caches
        self._webhooks_cache.pop(namespace, None)
        return {"status": "ok", "namespace": namespace, "deleted_keys": key_count}

    # ---- Webhook Subscriptions ----

    async def subscribe_webhook(self, namespace: str, url: str,
                                secret: Optional[str] = None) -> Dict:
        """Register a webhook for namespace change notifications."""
        self._metrics.record_db_op("subscribe_webhook")
        now = time.time()
        try:
            await self._db.execute(  # type: ignore[union-attr]
                "INSERT OR IGNORE INTO webhooks (namespace, url, secret, created_at) VALUES (?, ?, ?, ?)",
                (namespace, url, secret, now)
            )
            await self._db.commit()  # type: ignore[union-attr]
        except Exception as e:
            return {"status": "error", "error": str(e)}

        await self._load_webhooks()
        return {"status": "ok", "namespace": namespace, "url": url}

    async def unsubscribe_webhook(self, namespace: str, url: str) -> Dict:
        """Remove a webhook subscription."""
        await self._db.execute(  # type: ignore[union-attr]
            "DELETE FROM webhooks WHERE namespace = ? AND url = ?",
            (namespace, url)
        )
        await self._db.commit()  # type: ignore[union-attr]
        await self._load_webhooks()
        return {"status": "ok", "namespace": namespace, "url": url}

    async def list_webhooks(self, namespace: str) -> List[Dict]:
        """List all webhooks for a namespace."""
        cursor = await self._db.execute(  # type: ignore[union-attr]
            "SELECT id, namespace, url, created_at, active FROM webhooks WHERE namespace = ?",
            (namespace,)
        )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]

    # ---- In-process Listeners ----

    def subscribe_in_process(self, namespace: str, callback):
        """Register an in-process change listener for a namespace."""
        self._in_process_listeners[namespace].append(callback)

    # ---- Export/Import ----

    async def export_data(self, namespaces: Optional[List[str]] = None) -> Dict:
        """Export all data (or specific namespaces) as JSON-compatible dict."""
        self._metrics.record_db_op("export")
        now = time.time()

        if namespaces:
            placeholders = ",".join("?" * len(namespaces))
            cursor = await self._db.execute(  # type: ignore[union-attr]
                f"SELECT * FROM kv_store WHERE namespace IN ({placeholders}) AND (ttl_expires = 0 OR ttl_expires > ?)",
                (*namespaces, now)
            )
        else:
            cursor = await self._db.execute(  # type: ignore[union-attr]
                "SELECT * FROM kv_store WHERE ttl_expires = 0 OR ttl_expires > ?",
                (now,)
            )
        rows = await cursor.fetchall()

        # Also export namespace metadata
        if namespaces:
            placeholders = ",".join("?" * len(namespaces))
            cursor2 = await self._db.execute(  # type: ignore[union-attr]
                f"SELECT * FROM namespace_meta WHERE namespace IN ({placeholders})",
                (*namespaces,)
            )
        else:
            cursor2 = await self._db.execute(  # type: ignore[union-attr]
                "SELECT * FROM namespace_meta"
            )
        meta_rows = await cursor2.fetchall()

        # Export snapshots
        if namespaces:
            placeholders = ",".join("?" * len(namespaces))
            cursor3 = await self._db.execute(  # type: ignore[union-attr]
                f"SELECT * FROM snapshots WHERE namespace IN ({placeholders})",
                (*namespaces,)
            )
        else:
            cursor3 = await self._db.execute(  # type: ignore[union-attr]
                "SELECT * FROM snapshots"
            )
        snap_rows = await cursor3.fetchall()

        return {
            "version": VERSION,
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "keys": [dict(r) for r in rows],
            "namespaces": [dict(r) for r in meta_rows],
            "snapshots": [dict(r) for r in snap_rows],
            "key_count": len(rows),
            "namespace_count": len(meta_rows),
        }

    async def import_data(self, data: Dict, mode: str = "merge") -> Dict:
        """Import data from JSON dict. mode: 'merge' (default) or 'replace'."""
        self._metrics.record_db_op("import")
        imported_keys = 0
        imported_namespaces = 0

        async with self._db.execute("BEGIN IMMEDIATE"):  # type: ignore[union-attr]
            # Import namespace metadata first
            for ns_meta in data.get("namespaces", []):
                await self._db.execute(  # type: ignore[union-attr]
                    """INSERT OR REPLACE INTO namespace_meta (namespace, encrypted, created_at, description)
                       VALUES (?, ?, ?, ?)""",
                    (ns_meta["namespace"], ns_meta.get("encrypted", 0),
                     ns_meta.get("created_at", time.time()), ns_meta.get("description", ""))
                )
                imported_namespaces += 1

            # Import keys
            for key_data in data.get("keys", []):
                ns = key_data["namespace"]
                key = key_data["key"]

                if mode == "replace":
                    await self._db.execute(  # type: ignore[union-attr]
                        "DELETE FROM kv_store WHERE namespace = ? AND key = ?",
                        (ns, key)
                    )

                await self._db.execute(  # type: ignore[union-attr]
                    """INSERT OR REPLACE INTO kv_store
                       (namespace, key, value, ttl_expires, version, created_at, updated_at, value_size, encrypted)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (ns, key, key_data["value"], key_data.get("ttl_expires", 0),
                     key_data.get("version", 1), key_data.get("created_at", time.time()),
                     key_data.get("updated_at", time.time()),
                     key_data.get("value_size", len(key_data.get("value", ""))),
                     key_data.get("encrypted", 0))
                )
                imported_keys += 1

            await self._db.commit()  # type: ignore[union-attr]

        return {"status": "ok", "imported_keys": imported_keys,
                "imported_namespaces": imported_namespaces, "mode": mode}

    # ---- Stats ----

    async def stats(self) -> Dict:
        """Return store statistics with per-namespace breakdown."""
        cursor = await self._db.execute("SELECT COUNT(*) FROM kv_store")  # type: ignore[union-attr]
        total_keys = (await cursor.fetchone())[0]

        cursor = await self._db.execute("SELECT COUNT(DISTINCT namespace) FROM kv_store")  # type: ignore[union-attr]
        total_namespaces = (await cursor.fetchone())[0]

        cursor = await self._db.execute("SELECT COUNT(*) FROM snapshots")  # type: ignore[union-attr]
        total_snapshots = (await cursor.fetchone())[0]

        cursor = await self._db.execute(  # type: ignore[union-attr]
            "SELECT COUNT(*) FROM kv_store WHERE ttl_expires > 0 AND ttl_expires < ?",
            (time.time(),)
        )
        expired_keys = (await cursor.fetchone())[0]

        cursor = await self._db.execute("SELECT COUNT(*) FROM webhooks WHERE active = 1")  # type: ignore[union-attr]
        active_webhooks = (await cursor.fetchone())[0]

        # Per-namespace breakdown
        namespaces = await self.list_namespaces()

        return {
            "total_keys": total_keys,
            "total_namespaces": total_namespaces,
            "total_snapshots": total_snapshots,
            "expired_keys_pending_cleanup": expired_keys,
            "active_webhooks": active_webhooks,
            "durability": self.durability,
            "db_path": self.db_path,
            "max_value_size": self.max_value_size,
            "encryption_enabled": self._encryption.enabled,
            "namespaces": namespaces,
        }

    # ---- Notification ----

    async def _notify(self, namespace: str, key: str, value: Any, action: str):
        """Fire in-process callbacks and webhook notifications."""
        # In-process listeners (synchronous callbacks)
        for callback in self._in_process_listeners.get(namespace, []):
            try:
                callback(namespace, key, value, action)
            except Exception:
                pass

        # Webhook notifications (async, fire-and-forget)
        webhooks = self._webhooks_cache.get(namespace, [])
        if webhooks and self._http_session:
            payload = {
                "namespace": namespace,
                "key": key,
                "action": action,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "value": value if action == "put" else None,
            }
            for wh in webhooks:
                asyncio.create_task(self._fire_webhook(wh, payload))

    async def _fire_webhook(self, webhook: Dict, payload: Dict):
        """Deliver a webhook notification (fire-and-forget with retry)."""
        url = webhook["url"]
        headers = {"Content-Type": "application/json"}
        if webhook.get("secret"):
            sig = hashlib.sha256(
                (webhook["secret"] + json.dumps(payload, sort_keys=True)).encode()
            ).hexdigest()
            headers["X-PMEM-Signature"] = f"sha256={sig}"

        for attempt in range(3):
            try:
                async with self._http_session.post(url, json=payload, headers=headers) as resp:  # type: ignore[union-attr]
                    if resp.status < 400:
                        self._metrics.webhook_fired += 1
                        return
            except Exception:
                pass
            if attempt < 2:
                await asyncio.sleep(0.5 * (attempt + 1))

        self._metrics.webhook_failed += 1
        logger.warning("Webhook delivery failed after 3 attempts: %s", url)

    # ---- Background Tasks ----

    async def _ttl_cleanup_loop(self):
        """Periodically clean up expired keys."""
        while True:
            try:
                now = time.time()
                cursor = await self._db.execute(  # type: ignore[union-attr]
                    "SELECT namespace, key FROM kv_store WHERE ttl_expires > 0 AND ttl_expires < ?",
                    (now,)
                )
                expired = await cursor.fetchall()
                if expired:
                    async with self._db.execute("BEGIN IMMEDIATE"):  # type: ignore[union-attr]
                        for row in expired:
                            await self._db.execute(  # type: ignore[union-attr]
                                "DELETE FROM kv_store WHERE namespace = ? AND key = ?",
                                (row["namespace"], row["key"])
                            )
                        await self._db.commit()  # type: ignore[union-attr]
                    logger.debug("Cleaned up %d expired keys", len(expired))
            except asyncio.CancelledError:
                raise
            except Exception as e:
                logger.error("TTL cleanup error: %s", e)
            await asyncio.sleep(TTL_CLEANUP_INTERVAL)

    async def _wal_checkpoint_loop(self):
        """Periodically checkpoint the WAL to prevent unbounded growth."""
        while True:
            try:
                await self._db.execute("PRAGMA wal_checkpoint(PASSIVE)")  # type: ignore[union-attr]
                logger.debug("WAL checkpoint completed")
            except asyncio.CancelledError:
                raise
            except Exception as e:
                logger.error("WAL checkpoint error: %s", e)
            await asyncio.sleep(WAL_CHECKPOINT_INTERVAL)

    async def _vacuum_loop(self):
        """Periodically vacuum the database to reclaim space from deleted keys."""
        while True:
            try:
                # Only vacuum if there's significant fragmentation
                cursor = await self._db.execute("PRAGMA page_count")  # type: ignore[union-attr]
                page_count = (await cursor.fetchone())[0]
                cursor = await self._db.execute("PRAGMA freelist_count")  # type: ignore[union-attr]
                freelist_count = (await cursor.fetchone())[0]
                if page_count > 0 and freelist_count / page_count > 0.25:
                    await self._db.execute("PRAGMA incremental_vacuum")  # type: ignore[union-attr]
                    logger.info("Incremental vacuum: reclaimed %d pages", freelist_count)
            except asyncio.CancelledError:
                raise
            except Exception as e:
                logger.error("Vacuum error: %s", e)
            await asyncio.sleep(VACUUM_INTERVAL)


# ============================================================================
# HTTP Application (aiohttp)
# ============================================================================

def create_app(store: PersistentMemoryStore, rate_limiter: RateLimiter) -> web.Application:
    """Create the aiohttp application with all routes."""

    async def _json_response(request: web.Request, data: Any, status: int = 200) -> web.Response:
        return web.json_response(data, status=status, dumps=lambda o: json.dumps(o, default=str))

    async def _read_body(request: web.Request) -> Dict:
        try:
            return await request.json()
        except Exception:
            return {}

    def _parse_path(path: str):
        """Parse /v1/{namespace}/{key} or /v1/{namespace}"""
        parts = path.strip("/").split("/")
        if len(parts) >= 3 and parts[0] == "v1":
            namespace = parts[1]
            remainder = parts[2:]
            return namespace, "/".join(remainder) if remainder else None
        elif len(parts) == 2 and parts[0] == "v1":
            return parts[1], None
        return None, None

    @web.middleware
    async def metrics_middleware(request: web.Request, handler):
        """Middleware to record request metrics and enforce rate limiting."""
        start = time.monotonic()
        client_ip = request.remote or "unknown"

        # Rate limiting
        if not await rate_limiter.allow(client_ip):
            return web.json_response(
                {"error": "Rate limit exceeded", "retry_after": 60},
                status=429
            )

        try:
            response = await handler(request)
            latency = time.monotonic() - start
            endpoint = request.path.split("/")[2] if len(request.path.split("/")) > 2 else "root"
            store._metrics.record_request(request.method, endpoint, latency, response.status)
            return response
        except web.HTTPException as e:
            latency = time.monotonic() - start
            endpoint = request.path.split("/")[2] if len(request.path.split("/")) > 2 else "root"
            store._metrics.record_request(request.method, endpoint, latency, e.status)
            raise
        except Exception as e:
            latency = time.monotonic() - start
            endpoint = request.path.split("/")[2] if len(request.path.split("/")) > 2 else "root"
            store._metrics.record_request(request.method, endpoint, latency, 500)
            return web.json_response({"error": str(e)}, status=500)

    # ---- Route Handlers ----

    async def health_handler(request: web.Request) -> web.Response:
        stats = await store.stats()
        return await _json_response(request, {"status": "healthy", "version": VERSION, "stats": stats})

    async def metrics_handler(request: web.Request) -> web.Response:
        stats = await store.stats()
        metrics_text = store._metrics.render(
            total_keys=stats["total_keys"],
            total_namespaces=stats["total_namespaces"],
            total_snapshots=stats["total_snapshots"],
            expired_keys=stats["expired_keys_pending_cleanup"],
            active_webhooks=stats["active_webhooks"],
        )
        return web.Response(text=metrics_text, content_type="text/plain")

    async def get_handler(request: web.Request) -> web.Response:
        namespace, key = _parse_path(request.path)
        if namespace and key:
            result = await store.get(namespace, key)
            if result:
                return await _json_response(request, result)
            return await _json_response(request, {"error": "Not found"}, 404)
        elif namespace:
            keys = await store.list_keys(namespace)
            return await _json_response(request, {"namespace": namespace, "keys": keys})
        return await _json_response(request, {"error": "Invalid path"}, 400)

    async def put_handler(request: web.Request) -> web.Response:
        namespace, key = _parse_path(request.path)
        if not namespace or not key:
            return await _json_response(request, {"error": "Namespace and key required"}, 400)

        body = await _read_body(request)
        result = await store.put(
            namespace=namespace,
            key=key,
            value=body.get("value"),
            ttl_seconds=body.get("ttl_seconds", 0),
            expected_version=body.get("expected_version", 0),
        )
        status = 409 if result.get("status") == "conflict" else 200
        if result.get("status") == "error":
            status = 413  # Payload Too Large for value size limit
        return await _json_response(request, result, status)

    async def delete_handler(request: web.Request) -> web.Response:
        namespace, key = _parse_path(request.path)
        if not namespace or not key:
            return await _json_response(request, {"error": "Namespace and key required"}, 400)

        body = await _read_body(request) if request.body_exists else {}
        result = await store.delete(
            namespace=namespace,
            key=key,
            expected_version=body.get("expected_version", 0),
        )
        return await _json_response(request, result)

    async def post_handler(request: web.Request) -> web.Response:
        namespace, key = _parse_path(request.path)
        if namespace and key == "snapshot":
            body = await _read_body(request)
            result = await store.snapshot(namespace, body.get("label", ""))
            return await _json_response(request, result, 201)
        elif namespace and key == "restore":
            body = await _read_body(request)
            result = await store.restore(namespace, body.get("snapshot_id"))
            return await _json_response(request, result)
        elif namespace and key == "subscribe":
            body = await _read_body(request)
            result = await store.subscribe_webhook(
                namespace, body.get("url", ""), body.get("secret")
            )
            return await _json_response(request, result, 201)
        return await _json_response(request, {"error": "Invalid path"}, 400)

    # ---- Batch Endpoints ----

    async def batch_get_handler(request: web.Request) -> web.Response:
        body = await _read_body(request)
        items = body.get("items", [])
        if not items:
            return await _json_response(request, {"error": "No items provided"}, 400)
        result = await store.batch_get(items)
        return await _json_response(request, result)

    async def batch_put_handler(request: web.Request) -> web.Response:
        body = await _read_body(request)
        items = body.get("items", [])
        if not items:
            return await _json_response(request, {"error": "No items provided"}, 400)
        result = await store.batch_put(items)
        return await _json_response(request, result)

    async def batch_delete_handler(request: web.Request) -> web.Response:
        body = await _read_body(request)
        items = body.get("items", [])
        if not items:
            return await _json_response(request, {"error": "No items provided"}, 400)
        result = await store.batch_delete(items)
        return await _json_response(request, result)

    # ---- Namespace Management Endpoints ----

    async def list_namespaces_handler(request: web.Request) -> web.Response:
        namespaces = await store.list_namespaces()
        return await _json_response(request, {"namespaces": namespaces})

    async def create_namespace_handler(request: web.Request) -> web.Response:
        namespace = request.match_info["namespace"]
        body = await _read_body(request)
        result = await store.create_namespace(
            namespace,
            encrypted=body.get("encrypted", False),
            description=body.get("description", ""),
        )
        return await _json_response(request, result, 201)

    async def delete_namespace_handler(request: web.Request) -> web.Response:
        namespace = request.match_info["namespace"]
        result = await store.delete_namespace(namespace)
        return await _json_response(request, result)

    async def list_namespace_webhooks_handler(request: web.Request) -> web.Response:
        namespace = request.match_info["namespace"]
        webhooks = await store.list_webhooks(namespace)
        return await _json_response(request, {"namespace": namespace, "webhooks": webhooks})

    async def unsubscribe_webhook_handler(request: web.Request) -> web.Response:
        namespace = request.match_info["namespace"]
        body = await _read_body(request)
        result = await store.unsubscribe_webhook(namespace, body.get("url", ""))
        return await _json_response(request, result)

    # ---- Export/Import Endpoints ----

    async def export_handler(request: web.Request) -> web.Response:
        body = await _read_body(request)
        namespaces = body.get("namespaces")
        result = await store.export_data(namespaces)
        return await _json_response(request, result)

    async def import_handler(request: web.Request) -> web.Response:
        body = await _read_body(request)
        result = await store.import_data(body, mode=body.get("mode", "merge"))
        return await _json_response(request, result)

    # ---- Build Application ----

    app = web.Application(middlewares=[metrics_middleware])

    # Core CRUD
    app.router.add_get("/v1/health", health_handler)
    app.router.add_get("/metrics", metrics_handler)
    app.router.add_get("/v1/{namespace}/{key:.*}", get_handler)
    app.router.add_get("/v1/{namespace}", get_handler)
    app.router.add_put("/v1/{namespace}/{key:.*}", put_handler)
    app.router.add_delete("/v1/{namespace}/{key:.*}", delete_handler)
    app.router.add_post("/v1/{namespace}/{key:.*}", post_handler)

    # Batch operations
    app.router.add_post("/v1/batch/get", batch_get_handler)
    app.router.add_post("/v1/batch/put", batch_put_handler)
    app.router.add_post("/v1/batch/delete", batch_delete_handler)

    # Namespace management
    app.router.add_get("/v1/namespaces", list_namespaces_handler)
    app.router.add_post("/v1/namespaces/{namespace}", create_namespace_handler)
    app.router.add_delete("/v1/namespaces/{namespace}", delete_namespace_handler)
    app.router.add_get("/v1/namespaces/{namespace}/webhooks", list_namespace_webhooks_handler)
    app.router.add_post("/v1/namespaces/{namespace}/unsubscribe", unsubscribe_webhook_handler)

    # Export/Import
    app.router.add_post("/v1/export", export_handler)
    app.router.add_post("/v1/import", import_handler)

    # Store reference for cleanup
    app["store"] = store
    app["rate_limiter"] = rate_limiter

    return app


# ============================================================================
# Main
# ============================================================================

async def async_main():
    parser = argparse.ArgumentParser(description=f"Persistent Memory v{VERSION} — Cross-Session State Store")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help=f"HTTP port (default: {DEFAULT_PORT})")
    parser.add_argument("--db", type=str, default=DEFAULT_DB, help="SQLite database path")
    parser.add_argument("--durability", choices=["sync", "async", "memory"],
                       default=DEFAULT_DURABILITY, help="Durability level (default: async)")
    parser.add_argument("--max-value-size", type=int, default=DEFAULT_MAX_VALUE_SIZE,
                       help=f"Max value size in bytes (default: {DEFAULT_MAX_VALUE_SIZE})")
    parser.add_argument("--encryption-key", type=str, default=None,
                       help="Master encryption key (64 hex chars for AES-256)")
    parser.add_argument("--rate-limit", type=int, default=DEFAULT_RATE_LIMIT,
                       help=f"Rate limit (requests/min/IP, default: {DEFAULT_RATE_LIMIT})")
    parser.add_argument("--log-level", type=str, default="INFO",
                       choices=["DEBUG", "INFO", "WARNING", "ERROR"],
                       help="Log level (default: INFO)")
    args = parser.parse_args()

    # Configure logging
    logging.basicConfig(
        level=getattr(logging, args.log_level),
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Initialize encryption engine
    encryption = EncryptionEngine(args.encryption_key)

    # Initialize store
    store = PersistentMemoryStore(
        db_path=args.db,
        durability=args.durability,
        max_value_size=args.max_value_size,
        encryption_engine=encryption,
    )
    await store.initialize()

    # Initialize rate limiter
    rate_limiter = RateLimiter(requests_per_minute=args.rate_limit)

    # Create app
    app = create_app(store, rate_limiter)

    # Print startup banner
    print(f"╔══════════════════════════════════════════════════╗")
    print(f"║  Persistent Memory v{VERSION}                       ║")
    print(f"╠══════════════════════════════════════════════════╣")
    print(f"║  Port:         {args.port:<33}║")
    print(f"║  Database:     {args.db:<33}║")
    print(f"║  Durability:   {args.durability:<33}║")
    print(f"║  Max Value:    {args.max_value_size:<33}║")
    print(f"║  Encryption:   {'YES (AES-256-GCM)' if encryption.enabled else 'NO':<33}║")
    print(f"║  Rate Limit:   {args.rate_limit}/min/IP{' ' * (24 - len(str(args.rate_limit)))}║")
    print(f"╠══════════════════════════════════════════════════╣")
    print(f"║  Core:   PUT/GET/DEL /v1/{{ns}}/{{key}}            ║")
    print(f"║  Batch:  POST /v1/batch/{{get|put|delete}}          ║")
    print(f"║  NS:     GET/POST/DEL /v1/namespaces/{{ns}}        ║")
    print(f"║  Hooks:  POST /v1/{{ns}}/subscribe                 ║")
    print(f"║  Data:   POST /v1/{{export|import}}                 ║")
    print(f"║  Ops:    GET /v1/health | GET /metrics           ║")
    print(f"╚══════════════════════════════════════════════════╝")
    print()

    # Graceful shutdown
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", args.port)
    await site.start()

    # Setup signal handlers for graceful shutdown
    loop = asyncio.get_running_loop()
    shutdown_event = asyncio.Event()

    def _signal_handler():
        logger.info("Shutdown signal received, cleaning up...")
        shutdown_event.set()

    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, _signal_handler)
        except NotImplementedError:
            # Windows doesn't support add_signal_handler
            pass

    print(f"Server running on http://0.0.0.0:{args.port}")
    print("Press Ctrl+C to shutdown gracefully")

    try:
        await shutdown_event.wait()
    except (KeyboardInterrupt, SystemExit):
        pass

    # Graceful cleanup
    logger.info("Shutting down gracefully...")
    await runner.cleanup()
    await store.close()
    logger.info("Shutdown complete.")


def main():
    """Entry point — handles the async event loop setup."""
    try:
        asyncio.run(async_main())
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
