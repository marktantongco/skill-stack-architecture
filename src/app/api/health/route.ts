import { NextResponse } from "next/server";

/**
 * Health check endpoint.
 *
 * Phase 4 — Security Audit: fixes "Missing health check (LOW)" finding.
 * Returns service status, version, and timestamp for monitoring.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      version: "0.2.0",
      timestamp: new Date().toISOString(),
      service: "skill-stack-architecture",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
