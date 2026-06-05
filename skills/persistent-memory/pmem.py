#!/usr/bin/env python3
"""
Persistent Memory — Cross-Session State Store
Version: 1.0.0

A lightweight, namespaced key-value store with TTL, atomic operations,
change notifications, and configurable durability levels.

Usage:
  python3 pmem.py [--port 6380] [--db pmem.db] [--durability async]

Endpoints:
  PUT  /v1/{namespace}/{key}     — Store a value
  GET  /v1/{namespace}/{key}     — Retrieve a value
  DEL  /v1/{namespace}/{key}     — Delete a value
  GET  /v1/{namespace}           — List all keys in a namespace
  POST /v1/{namespace}/snapshot  — Create a namespace snapshot
  POST /v1/{namespace}/restore   — Restore from a snapshot
  GET  /v1/health                — Health check
"""

import argparse
import copy
import json
import os
import sqlite3
import threading
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from typing import Optional, Dict, Any, List
from datetime import datetime

# ============================================================================
# Storage Engine
# ============================================================================

SCHEMA = """
CREATE TABLE IF NOT EXISTS kv_store (
    namespace TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    ttl_expires REAL DEFAULT 0,
    version INTEGER DEFAULT 1,
    created_at REAL NOT NULL,
    updated_at REAL NOT NULL,
    PRIMARY KEY (namespace, key)
);

CREATE INDEX IF NOT EXISTS idx_ttl ON kv_store(ttl_expires) WHERE ttl_expires > 0;

CREATE TABLE IF NOT EXISTS snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    namespace TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at REAL NOT NULL,
    label TEXT
);
"""


class PersistentMemoryStore:
    """Thread-safe persistent key-value store with TTL and snapshots."""

    def __init__(self, db_path: str, durability: str = "async"):
        self.db_path = db_path
        self.durability = durability
        self._lock = threading.Lock()
        self._change_listeners: Dict[str, List] = {}
        self._init_db()
        self._start_ttl_cleanup()

    def _init_db(self):
        with self._get_conn() as conn:
            conn.executescript(SCHEMA)

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        if self.durability == "sync":
            conn.execute("PRAGMA synchronous=FULL")
        elif self.durability == "async":
            conn.execute("PRAGMA synchronous=NORMAL")
        else:
            conn.execute("PRAGMA synchronous=OFF")
        return conn

    def _start_ttl_cleanup(self):
        """Background thread to clean up expired keys."""
        def cleanup():
            while True:
                try:
                    with self._get_conn() as conn:
                        now = time.time()
                        expired = conn.execute(
                            "SELECT namespace, key FROM kv_store WHERE ttl_expires > 0 AND ttl_expires < ?",
                            (now,)
                        ).fetchall()
                        for row in expired:
                            conn.execute(
                                "DELETE FROM kv_store WHERE namespace = ? AND key = ?",
                                (row["namespace"], row["key"])
                            )
                        if expired:
                            conn.commit()
                except Exception:
                    pass
                time.sleep(60)  # Check every minute

        t = threading.Thread(target=cleanup, daemon=True)
        t.start()

    def put(self, namespace: str, key: str, value: Any,
            ttl_seconds: int = 0, expected_version: int = 0) -> Dict:
        """Store a value with optional TTL and optimistic concurrency control."""
        with self._lock:
            now = time.time()
            ttl_expires = now + ttl_seconds if ttl_seconds > 0 else 0
            value_str = json.dumps(value)

            with self._get_conn() as conn:
                # Optimistic concurrency check
                if expected_version > 0:
                    current = conn.execute(
                        "SELECT version FROM kv_store WHERE namespace = ? AND key = ?",
                        (namespace, key)
                    ).fetchone()
                    if current and current["version"] != expected_version:
                        return {"status": "conflict", "expected_version": expected_version,
                                "current_version": current["version"]}
                    elif not current:
                        return {"status": "not_found", "key": key}

                # Upsert
                existing = conn.execute(
                    "SELECT version FROM kv_store WHERE namespace = ? AND key = ?",
                    (namespace, key)
                ).fetchone()

                if existing:
                    new_version = existing["version"] + 1
                    conn.execute(
                        """UPDATE kv_store SET value = ?, ttl_expires = ?, version = ?, updated_at = ?
                           WHERE namespace = ? AND key = ?""",
                        (value_str, ttl_expires, new_version, now, namespace, key)
                    )
                else:
                    new_version = 1
                    conn.execute(
                        """INSERT INTO kv_store (namespace, key, value, ttl_expires, version, created_at, updated_at)
                           VALUES (?, ?, ?, ?, ?, ?, ?)""",
                        (namespace, key, value_str, ttl_expires, 1, now, now)
                    )

            # Notify change listeners
            self._notify(namespace, key, value, "put")
            return {"status": "ok", "namespace": namespace, "key": key,
                    "version": new_version, "ttl_expires": ttl_expires}

    def get(self, namespace: str, key: str) -> Optional[Dict]:
        """Retrieve a value by namespace and key."""
        with self._get_conn() as conn:
            row = conn.execute(
                "SELECT * FROM kv_store WHERE namespace = ? AND key = ?",
                (namespace, key)
            ).fetchone()

            if not row:
                return None

            # Check TTL
            if row["ttl_expires"] > 0 and row["ttl_expires"] < time.time():
                conn.execute(
                    "DELETE FROM kv_store WHERE namespace = ? AND key = ?",
                    (namespace, key)
                )
                return None

            return {
                "namespace": row["namespace"],
                "key": row["key"],
                "value": json.loads(row["value"]),
                "version": row["version"],
                "ttl_expires": row["ttl_expires"],
                "created_at": row["created_at"],
                "updated_at": row["updated_at"],
            }

    def delete(self, namespace: str, key: str, expected_version: int = 0) -> Dict:
        """Delete a value with optional optimistic concurrency control."""
        with self._lock:
            with self._get_conn() as conn:
                if expected_version > 0:
                    current = conn.execute(
                        "SELECT version FROM kv_store WHERE namespace = ? AND key = ?",
                        (namespace, key)
                    ).fetchone()
                    if current and current["version"] != expected_version:
                        return {"status": "conflict"}
                    elif not current:
                        return {"status": "not_found"}

                conn.execute(
                    "DELETE FROM kv_store WHERE namespace = ? AND key = ?",
                    (namespace, key)
                )
                deleted = conn.total_changes

            self._notify(namespace, key, None, "delete")
            return {"status": "ok" if deleted > 0 else "not_found"}

    def list_keys(self, namespace: str) -> List[Dict]:
        """List all keys in a namespace with their metadata."""
        with self._get_conn() as conn:
            now = time.time()
            rows = conn.execute(
                """SELECT namespace, key, version, ttl_expires, created_at, updated_at
                   FROM kv_store WHERE namespace = ? AND (ttl_expires = 0 OR ttl_expires > ?)
                   ORDER BY key""",
                (namespace, now)
            ).fetchall()
            return [dict(r) for r in rows]

    def snapshot(self, namespace: str, label: str = "") -> Dict:
        """Create a point-in-time snapshot of a namespace."""
        with self._lock:
            with self._get_conn() as conn:
                rows = conn.execute(
                    "SELECT key, value, ttl_expires, version FROM kv_store WHERE namespace = ?",
                    (namespace,)
                ).fetchall()
                data = json.dumps([dict(r) for r in rows])
                now = time.time()
                conn.execute(
                    "INSERT INTO snapshots (namespace, data, created_at, label) VALUES (?, ?, ?, ?)",
                    (namespace, data, now, label)
                )
                snap_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
            return {"status": "ok", "snapshot_id": snap_id, "namespace": namespace,
                    "key_count": len(rows), "label": label}

    def restore(self, namespace: str, snapshot_id: Optional[int] = None) -> Dict:
        """Restore a namespace from a snapshot."""
        with self._lock:
            with self._get_conn() as conn:
                if snapshot_id:
                    snap = conn.execute(
                        "SELECT * FROM snapshots WHERE id = ? AND namespace = ?",
                        (snapshot_id, namespace)
                    ).fetchone()
                else:
                    snap = conn.execute(
                        "SELECT * FROM snapshots WHERE namespace = ? ORDER BY created_at DESC LIMIT 1",
                        (namespace,)
                    ).fetchone()

                if not snap:
                    return {"status": "not_found", "error": "No snapshot found"}

                data = json.loads(snap["data"])
                now = time.time()

                # Clear existing keys
                conn.execute("DELETE FROM kv_store WHERE namespace = ?", (namespace,))

                # Restore from snapshot
                for entry in data:
                    conn.execute(
                        """INSERT INTO kv_store (namespace, key, value, ttl_expires, version, created_at, updated_at)
                           VALUES (?, ?, ?, ?, ?, ?, ?)""",
                        (namespace, entry["key"], entry["value"], entry["ttl_expires"],
                         entry["version"], now, now)
                    )

                return {"status": "ok", "restored_keys": len(data), "snapshot_id": snap["id"]}

    def subscribe(self, namespace: str, callback):
        """Register a change listener for a namespace."""
        if namespace not in self._change_listeners:
            self._change_listeners[namespace] = []
        self._change_listeners[namespace].append(callback)

    def _notify(self, namespace: str, key: str, value: Any, action: str):
        """Notify change listeners."""
        for callback in self._change_listeners.get(namespace, []):
            try:
                callback(namespace, key, value, action)
            except Exception:
                pass

    def stats(self) -> Dict:
        """Return store statistics."""
        with self._get_conn() as conn:
            total_keys = conn.execute("SELECT COUNT(*) FROM kv_store").fetchone()[0]
            total_namespaces = conn.execute("SELECT COUNT(DISTINCT namespace) FROM kv_store").fetchone()[0]
            total_snapshots = conn.execute("SELECT COUNT(*) FROM snapshots").fetchone()[0]
            expired_keys = conn.execute(
                "SELECT COUNT(*) FROM kv_store WHERE ttl_expires > 0 AND ttl_expires < ?",
                (time.time(),)
            ).fetchone()[0]
            return {
                "total_keys": total_keys,
                "total_namespaces": total_namespaces,
                "total_snapshots": total_snapshots,
                "expired_keys_pending_cleanup": expired_keys,
                "durability": self.durability,
                "db_path": self.db_path,
            }


# ============================================================================
# HTTP Handler
# ============================================================================

class PMemHandler(BaseHTTPRequestHandler):
    store: PersistentMemoryStore = None

    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data, default=str).encode())

    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(length)) if length > 0 else {}

    def _parse_path(self):
        """Parse /v1/{namespace}/{key} or /v1/{namespace}"""
        parts = self.path.strip("/").split("/")
        if len(parts) >= 3 and parts[0] == "v1":
            namespace = parts[1]
            remainder = parts[2:]
            return namespace, "/".join(remainder) if remainder else None
        elif len(parts) == 2 and parts[0] == "v1":
            return parts[1], None
        return None, None

    def do_GET(self):
        if self.path == "/v1/health":
            self._send_json({"status": "healthy", "stats": self.store.stats()})
            return

        namespace, key = self._parse_path()
        if namespace and key:
            result = self.store.get(namespace, key)
            if result:
                self._send_json(result)
            else:
                self._send_json({"error": "Not found"}, 404)
        elif namespace:
            keys = self.store.list_keys(namespace)
            self._send_json({"namespace": namespace, "keys": keys})
        else:
            self._send_json({"error": "Invalid path"}, 400)

    def do_PUT(self):
        namespace, key = self._parse_path()
        if not namespace or not key:
            self._send_json({"error": "Namespace and key required"}, 400)
            return

        body = self._read_body()
        result = self.store.put(
            namespace=namespace,
            key=key,
            value=body.get("value"),
            ttl_seconds=body.get("ttl_seconds", 0),
            expected_version=body.get("expected_version", 0),
        )
        status = 409 if result.get("status") == "conflict" else 200
        self._send_json(result, status)

    def do_DELETE(self):
        namespace, key = self._parse_path()
        if not namespace or not key:
            self._send_json({"error": "Namespace and key required"}, 400)
            return

        body = self._read_body() if self.headers.get("Content-Length") else {}
        result = self.store.delete(
            namespace=namespace,
            key=key,
            expected_version=body.get("expected_version", 0),
        )
        self._send_json(result)

    def do_POST(self):
        namespace, key = self._parse_path()
        if namespace and key == "snapshot":
            body = self._read_body()
            result = self.store.snapshot(namespace, body.get("label", ""))
            self._send_json(result, 201)
        elif namespace and key == "restore":
            body = self._read_body()
            result = self.store.restore(namespace, body.get("snapshot_id"))
            self._send_json(result)
        else:
            self._send_json({"error": "Invalid path"}, 400)

    def log_message(self, format, *args):
        pass


# ============================================================================
# Main
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description="Persistent Memory — Cross-Session State Store")
    parser.add_argument("--port", type=int, default=6380, help="HTTP port (default: 6380)")
    parser.add_argument("--db", type=str, default="pmem.db", help="SQLite database path")
    parser.add_argument("--durability", choices=["sync", "async", "memory"],
                       default="async", help="Durability level (default: async)")
    args = parser.parse_args()

    store = PersistentMemoryStore(args.db, args.durability)
    PMemHandler.store = store

    server = HTTPServer(("0.0.0.0", args.port), PMemHandler)
    print(f"Persistent Memory v1.0.0")
    print(f"  Port: {args.port}")
    print(f"  Database: {args.db}")
    print(f"  Durability: {args.durability}")
    print(f"  Endpoints: PUT/GET/DEL /v1/{{namespace}}/{{key}}")
    print(f"             POST /v1/{{namespace}}/snapshot")
    print(f"             POST /v1/{{namespace}}/restore")
    print(f"             GET  /v1/health")
    print()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.server_close()


if __name__ == "__main__":
    main()
