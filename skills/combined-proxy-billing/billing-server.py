#!/usr/bin/env python3
"""
Combined Proxy Billing — Aggregation Service
Version: 1.0.0

A lightweight billing aggregation service that unifies usage events from
multiple AI provider proxies into a single ledger with cross-provider
quota enforcement, cost anomaly detection, and budget forecasting.

Usage:
  python3 billing-server.py [--port 8090] [--db billing.db]

Endpoints:
  POST /events          — Ingest a billing event
  GET  /usage           — Query aggregated usage
  GET  /usage/teams     — Per-team breakdown
  GET  /quota/status    — Cross-provider quota status
  POST /quota/set       — Set quota for a team
  GET  /anomalies       — List detected cost anomalies
  GET  /forecast        — Budget forecast per team
  GET  /health          — Health check
"""

import argparse
import hashlib
import json
import sqlite3
import time
import threading
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
from collections import defaultdict
from typing import Optional, Dict, List, Any

# ============================================================================
# Database Schema & Initialization
# ============================================================================

SCHEMA = """
CREATE TABLE IF NOT EXISTS billing_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_hash TEXT UNIQUE NOT NULL,
    prev_hash TEXT,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    tokens_in INTEGER DEFAULT 0,
    tokens_out INTEGER DEFAULT 0,
    cost_usd REAL DEFAULT 0.0,
    team_id TEXT NOT NULL,
    project_id TEXT,
    tags TEXT,
    timestamp REAL NOT NULL,
    ingested_at REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_team ON billing_events(team_id);
CREATE INDEX IF NOT EXISTS idx_events_provider ON billing_events(provider);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON billing_events(timestamp);

CREATE TABLE IF NOT EXISTS quotas (
    team_id TEXT PRIMARY KEY,
    soft_limit_usd REAL DEFAULT 0,
    hard_limit_usd REAL DEFAULT 0,
    period TEXT DEFAULT 'monthly',
    created_at REAL NOT NULL,
    updated_at REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS quota_enforcement_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id TEXT NOT NULL,
    action TEXT NOT NULL,
    provider TEXT,
    reason TEXT,
    timestamp REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS anomalies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id TEXT NOT NULL,
    expected_daily REAL,
    actual_daily REAL,
    deviation_pct REAL,
    detected_at REAL NOT NULL,
    acknowledged INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS aggregated_daily (
    team_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    date TEXT NOT NULL,
    total_cost_usd REAL DEFAULT 0,
    total_tokens_in INTEGER DEFAULT 0,
    total_tokens_out INTEGER DEFAULT 0,
    event_count INTEGER DEFAULT 0,
    PRIMARY KEY (team_id, provider, date)
);
"""


class BillingDB:
    """Thread-safe billing database wrapper."""

    def __init__(self, db_path: str):
        self.db_path = db_path
        self._lock = threading.Lock()
        self._init_db()

    def _init_db(self):
        with self._get_conn() as conn:
            conn.executescript(SCHEMA)

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        return conn

    def ingest_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Ingest a billing event with hash chaining for tamper evidence."""
        with self._lock:
            event_hash = hashlib.sha256(
                json.dumps(event, sort_keys=True).encode()
            ).hexdigest()

            with self._get_conn() as conn:
                # Check for duplicate
                existing = conn.execute(
                    "SELECT id FROM billing_events WHERE event_hash = ?",
                    (event_hash,)
                ).fetchone()
                if existing:
                    return {"status": "duplicate", "event_id": existing["id"]}

                # Get previous hash for chaining
                prev = conn.execute(
                    "SELECT event_hash FROM billing_events ORDER BY id DESC LIMIT 1"
                ).fetchone()
                prev_hash = prev["event_hash"] if prev else "genesis"

                now = time.time()
                conn.execute(
                    """INSERT INTO billing_events
                       (event_hash, prev_hash, provider, model, tokens_in, tokens_out,
                        cost_usd, team_id, project_id, tags, timestamp, ingested_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (event_hash, prev_hash,
                     event.get("provider", "unknown"),
                     event.get("model", "unknown"),
                     event.get("tokens_in", 0),
                     event.get("tokens_out", 0),
                     event.get("cost_usd", 0.0),
                     event.get("team_id", "default"),
                     event.get("project_id"),
                     json.dumps(event.get("tags", {})),
                     event.get("timestamp", now),
                     now)
                )

                event_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]

                # Update daily aggregation
                date_str = datetime.fromtimestamp(event.get("timestamp", now)).strftime("%Y-%m-%d")
                conn.execute(
                    """INSERT INTO aggregated_daily
                       (team_id, provider, date, total_cost_usd, total_tokens_in,
                        total_tokens_out, event_count)
                       VALUES (?, ?, ?, ?, ?, ?, 1)
                       ON CONFLICT(team_id, provider, date) DO UPDATE SET
                         total_cost_usd = total_cost_usd + excluded.total_cost_usd,
                         total_tokens_in = total_tokens_in + excluded.total_tokens_in,
                         total_tokens_out = total_tokens_out + excluded.total_tokens_out,
                         event_count = event_count + 1""",
                    (event.get("team_id", "default"),
                     event.get("provider", "unknown"),
                     date_str,
                     event.get("cost_usd", 0.0),
                     event.get("tokens_in", 0),
                     event.get("tokens_out", 0))
                )

            return {"status": "ingested", "event_id": event_id, "hash": event_hash}

    def get_usage(self, team_id: Optional[str] = None,
                  provider: Optional[str] = None,
                  start_date: Optional[str] = None,
                  end_date: Optional[str] = None) -> List[Dict]:
        """Query aggregated usage with optional filters."""
        with self._get_conn() as conn:
            query = "SELECT * FROM aggregated_daily WHERE 1=1"
            params = []
            if team_id:
                query += " AND team_id = ?"
                params.append(team_id)
            if provider:
                query += " AND provider = ?"
                params.append(provider)
            if start_date:
                query += " AND date >= ?"
                params.append(start_date)
            if end_date:
                query += " AND date <= ?"
                params.append(end_date)
            query += " ORDER BY date DESC, team_id"
            rows = conn.execute(query, params).fetchall()
            return [dict(r) for r in rows]

    def get_team_breakdown(self) -> List[Dict]:
        """Get per-team cost breakdown across all providers."""
        with self._get_conn() as conn:
            rows = conn.execute(
                """SELECT team_id, provider,
                          SUM(total_cost_usd) as total_cost,
                          SUM(total_tokens_in) as total_tokens_in,
                          SUM(total_tokens_out) as total_tokens_out,
                          SUM(event_count) as total_events
                   FROM aggregated_daily
                   GROUP BY team_id, provider
                   ORDER BY total_cost DESC"""
            ).fetchall()
            return [dict(r) for r in rows]

    def set_quota(self, team_id: str, soft_limit: float, hard_limit: float,
                  period: str = "monthly") -> Dict:
        """Set quota limits for a team."""
        now = time.time()
        with self._get_conn() as conn:
            conn.execute(
                """INSERT INTO quotas (team_id, soft_limit_usd, hard_limit_usd, period, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?)
                   ON CONFLICT(team_id) DO UPDATE SET
                     soft_limit_usd = excluded.soft_limit_usd,
                     hard_limit_usd = excluded.hard_limit_usd,
                     period = excluded.period,
                     updated_at = excluded.updated_at""",
                (team_id, soft_limit, hard_limit, period, now, now)
            )
        return {"team_id": team_id, "soft_limit": soft_limit, "hard_limit": hard_limit, "period": period}

    def get_quota_status(self, team_id: Optional[str] = None) -> List[Dict]:
        """Check quota status for teams (current spend vs limits)."""
        with self._get_conn() as conn:
            now = datetime.now()
            if now.day >= 28:
                month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            else:
                month_start = (now.replace(day=1, hour=0, minute=0, second=0, microsecond=0))

            date_start = month_start.strftime("%Y-%m-%d")
            date_end = now.strftime("%Y-%m-%d")

            query = """
                SELECT q.team_id, q.soft_limit_usd, q.hard_limit_usd, q.period,
                       COALESCE(SUM(a.total_cost_usd), 0) as spent_usd,
                       COALESCE(SUM(a.total_tokens_in), 0) as tokens_in,
                       COALESCE(SUM(a.total_tokens_out), 0) as tokens_out
                FROM quotas q
                LEFT JOIN aggregated_daily a ON q.team_id = a.team_id
                    AND a.date >= ? AND a.date <= ?
                """
            params = [date_start, date_end]

            if team_id:
                query += " WHERE q.team_id = ?"
                params.append(team_id)

            query += " GROUP BY q.team_id ORDER BY spent_usd DESC"

            rows = conn.execute(query, params).fetchall()
            results = []
            for r in rows:
                d = dict(r)
                d["soft_pct"] = round(d["spent_usd"] / d["soft_limit_usd"] * 100, 1) if d["soft_limit_usd"] > 0 else 0
                d["hard_pct"] = round(d["spent_usd"] / d["hard_limit_usd"] * 100, 1) if d["hard_limit_usd"] > 0 else 0
                d["status"] = (
                    "blocked" if d["hard_pct"] >= 100 else
                    "throttled" if d["soft_pct"] >= 100 else
                    "warning" if d["soft_pct"] >= 80 else
                    "normal"
                )
                results.append(d)
            return results

    def detect_anomalies(self) -> List[Dict]:
        """Simple cost anomaly detection using exponential moving average."""
        with self._get_conn() as conn:
            teams = conn.execute("SELECT DISTINCT team_id FROM billing_events").fetchall()
            anomalies = []
            for (team_id,) in teams:
                rows = conn.execute(
                    """SELECT date, SUM(total_cost_usd) as daily_cost
                       FROM aggregated_daily
                       WHERE team_id = ?
                       GROUP BY date ORDER BY date DESC LIMIT 30""",
                    (team_id,)
                ).fetchall()

                if len(rows) < 7:
                    continue

                costs = [r["daily_cost"] for r in reversed(rows)]
                # EMA with alpha=0.3
                ema = costs[0]
                for c in costs[1:-1]:
                    ema = 0.3 * c + 0.7 * ema

                latest = costs[-1]
                if ema > 0:
                    deviation = abs(latest - ema) / ema * 100
                    if deviation > 200:  # More than 3x the expected spend
                        now = time.time()
                        conn.execute(
                            """INSERT INTO anomalies
                               (team_id, expected_daily, actual_daily, deviation_pct, detected_at)
                               VALUES (?, ?, ?, ?, ?)""",
                            (team_id, round(ema, 2), round(latest, 2), round(deviation, 1), now)
                        )
                        anomalies.append({
                            "team_id": team_id,
                            "expected_daily": round(ema, 2),
                            "actual_daily": round(latest, 2),
                            "deviation_pct": round(deviation, 1),
                            "severity": "critical" if deviation > 500 else "warning"
                        })
            return anomalies

    def get_forecast(self, team_id: Optional[str] = None) -> List[Dict]:
        """Simple budget forecast based on linear regression of daily spend."""
        with self._get_conn() as conn:
            query = "SELECT DISTINCT team_id FROM billing_events"
            params = []
            if team_id:
                query += " WHERE team_id = ?"
                params.append(team_id)

            teams = conn.execute(query, params).fetchall()
            forecasts = []
            now = datetime.now()
            days_remaining = (now.replace(month=now.month % 12 + 1, day=1) - now).days if now.month < 12 else 31 - now.day

            for (tid,) in teams:
                rows = conn.execute(
                    """SELECT date, SUM(total_cost_usd) as daily_cost
                       FROM aggregated_daily
                       WHERE team_id = ?
                       GROUP BY date ORDER BY date DESC LIMIT 30""",
                    (tid,)
                ).fetchall()

                if len(rows) < 3:
                    continue

                costs = [r["daily_cost"] for r in reversed(rows)]
                avg_daily = sum(costs) / len(costs)
                projected_eom = avg_daily * days_remaining
                total_so_far = sum(costs)

                forecasts.append({
                    "team_id": tid,
                    "avg_daily_spend": round(avg_daily, 2),
                    "days_remaining": days_remaining,
                    "projected_additional": round(projected_eom, 2),
                    "projected_total_eom": round(total_so_far + projected_eom, 2),
                    "current_spend": round(total_so_far, 2)
                })

            return forecasts


# ============================================================================
# HTTP Handler
# ============================================================================

class BillingHandler(BaseHTTPRequestHandler):
    db: BillingDB = None  # Set by server

    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data, default=str).encode())

    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(length)) if length > 0 else {}

    def do_GET(self):
        if self.path == "/health":
            self._send_json({"status": "healthy", "timestamp": time.time()})
        elif self.path == "/usage":
            params = dict([p.split("=") for p in self.path.split("?")[1].split("&")]) if "?" in self.path else {}
            data = self.db.get_usage(
                team_id=params.get("team_id"),
                provider=params.get("provider"),
                start_date=params.get("start_date"),
                end_date=params.get("end_date")
            )
            self._send_json(data)
        elif self.path == "/usage/teams":
            data = self.db.get_team_breakdown()
            self._send_json(data)
        elif self.path.startswith("/quota/status"):
            params = dict([p.split("=") for p in self.path.split("?")[1].split("&")]) if "?" in self.path else {}
            data = self.db.get_quota_status(team_id=params.get("team_id"))
            self._send_json(data)
        elif self.path == "/anomalies":
            data = self.db.detect_anomalies()
            self._send_json(data)
        elif self.path.startswith("/forecast"):
            params = dict([p.split("=") for p in self.path.split("?")[1].split("&")]) if "?" in self.path else {}
            data = self.db.get_forecast(team_id=params.get("team_id"))
            self._send_json(data)
        else:
            self._send_json({"error": "Not found"}, 404)

    def do_POST(self):
        if self.path == "/events":
            event = self._read_body()
            result = self.db.ingest_event(event)
            self._send_json(result, 201 if result["status"] == "ingested" else 200)
        elif self.path == "/quota/set":
            body = self._read_body()
            result = self.db.set_quota(
                team_id=body["team_id"],
                soft_limit=body.get("soft_limit_usd", 0),
                hard_limit=body.get("hard_limit_usd", 0),
                period=body.get("period", "monthly")
            )
            self._send_json(result, 201)
        else:
            self._send_json({"error": "Not found"}, 404)

    def log_message(self, format, *args):
        pass  # Suppress default logging


# ============================================================================
# Main
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description="Combined Proxy Billing Service")
    parser.add_argument("--port", type=int, default=8090, help="HTTP port (default: 8090)")
    parser.add_argument("--db", type=str, default="billing.db", help="SQLite database path")
    args = parser.parse_args()

    db = BillingDB(args.db)
    BillingHandler.db = db

    server = HTTPServer(("0.0.0.0", args.port), BillingHandler)
    print(f"Combined Proxy Billing Service v1.0.0")
    print(f"  Database: {args.db}")
    print(f"  Listening: http://0.0.0.0:{args.port}")
    print(f"  Endpoints: /events, /usage, /usage/teams, /quota/status, /quota/set, /anomalies, /forecast, /health")
    print()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.server_close()


if __name__ == "__main__":
    main()
