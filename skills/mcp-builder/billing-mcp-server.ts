/**
 * MCP Builder — Billing MCP Server Template
 * Version: 1.0.0
 *
 * A Model Context Protocol server that exposes billing and proxy management
 * tools for AI agents. Built with @modelcontextprotocol/sdk for TypeScript.
 *
 * Usage:
 *   npm install @modelcontextprotocol/sdk zod
 *   npx tsc billing-mcp-server.ts
 *   node billing-mcp-server.js
 *
 * Tools exposed:
 *   get_spending       — Query current month's spending by provider
 *   check_quota        — Check quota status for a team
 *   suggest_optimization — Analyze spending and suggest cost-saving alternatives
 *   update_routing_policy — Update the API gateway's routing policy
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ============================================================================
// Configuration
// ============================================================================

const BILLING_SERVICE_URL = process.env.BILLING_SERVICE_URL || "http://localhost:8090";
const BILLING_SERVICE_TOKEN = process.env.BILLING_SERVICE_TOKEN || "";
const GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:8000";

// ============================================================================
// Helper: HTTP Client
// ============================================================================

async function fetchFromBilling(path: string, options: RequestInit = {}): Promise<any> {
  const url = `${BILLING_SERVICE_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (BILLING_SERVICE_TOKEN) {
    headers["Authorization"] = `Bearer ${BILLING_SERVICE_TOKEN}`;
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    throw new Error(`Billing service error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function fetchFromGateway(path: string, options: RequestInit = {}): Promise<any> {
  const url = `${GATEWAY_URL}${path}`;
  const response = await fetch(url, { ...options });
  if (!response.ok) {
    throw new Error(`Gateway error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// ============================================================================
// MCP Server Definition
// ============================================================================

const server = new McpServer({
  name: "billing-proxy-mcp",
  version: "1.0.0",
});

// ---- Tool: get_spending ----
// Returns current month's spending broken down by provider and team.
// Safe: read-only, idempotent, not destructive.
server.tool(
  "get_spending",
  "Query current month's AI spending broken down by provider and team. " +
  "Returns total cost, token usage, and per-provider breakdown.",
  {
    team_id: z.string().optional().describe("Filter by team ID (omit for all teams)"),
    provider: z.string().optional().describe("Filter by provider (e.g., 'anthropic', 'openai')"),
    start_date: z.string().optional().describe("Start date (YYYY-MM-DD)"),
    end_date: z.string().optional().describe("End date (YYYY-MM-DD)"),
  },
  async ({ team_id, provider, start_date, end_date }) => {
    try {
      const params = new URLSearchParams();
      if (team_id) params.set("team_id", team_id);
      if (provider) params.set("provider", provider);
      if (start_date) params.set("start_date", start_date);
      if (end_date) params.set("end_date", end_date);

      const data = await fetchFromBilling(`/usage?${params.toString()}`);

      // Format for readability
      const summary = data.map((row: any) =>
        `${row.team_id} / ${row.provider} (${row.date}): ` +
        `$${row.total_cost_usd?.toFixed(2) || '0.00'} ` +
        `(${row.total_tokens_in || 0} in, ${row.total_tokens_out || 0} out, ` +
        `${row.event_count || 0} requests)`
      ).join("\n");

      return {
        content: [{
          type: "text" as const,
          text: summary || "No spending data found for the specified filters.",
        }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text" as const, text: `Error fetching spending data: ${error.message}` }],
        isError: true,
      };
    }
  },
  { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
);

// ---- Tool: check_quota ----
// Returns quota status for teams (current spend vs limits).
// Safe: read-only, idempotent, not destructive.
server.tool(
  "check_quota",
  "Check quota status for one or all teams. Returns current spend, " +
  "soft/hard limits, percentage used, and status (normal/warning/throttled/blocked).",
  {
    team_id: z.string().optional().describe("Team ID to check (omit for all teams)"),
  },
  async ({ team_id }) => {
    try {
      const params = team_id ? `?team_id=${team_id}` : "";
      const data = await fetchFromBilling(`/quota/status${params}`);

      const statusLines = data.map((team: any) =>
        `[${team.status?.toUpperCase()}] ${team.team_id}: ` +
        `$${team.spent_usd?.toFixed(2) || '0.00'} / ` +
        `$${team.soft_limit_usd?.toFixed(2) || '0.00'} (soft) / ` +
        `$${team.hard_limit_usd?.toFixed(2) || '0.00'} (hard) ` +
        `— ${team.soft_pct || 0}%/${team.hard_pct || 0}% used`
      ).join("\n");

      return {
        content: [{
          type: "text" as const,
          text: statusLines || "No quota data found.",
        }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text" as const, text: `Error checking quota: ${error.message}` }],
        isError: true,
      };
    }
  },
  { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
);

// ---- Tool: suggest_optimization ----
// Analyzes spending patterns and suggests cost-saving alternatives.
// Safe: read-only, idempotent, not destructive.
server.tool(
  "suggest_optimization",
  "Analyze spending patterns and suggest cost-saving model alternatives. " +
  "Compares current model usage with cheaper alternatives that offer similar quality.",
  {
    team_id: z.string().optional().describe("Team ID to analyze (omit for all teams)"),
  },
  async ({ team_id }) => {
    try {
      const params = team_id ? `?team_id=${team_id}` : "";
      const forecast = await fetchFromBilling(`/forecast${params}`);
      const usage = await fetchFromBilling("/usage/teams");

      // Model cost optimization suggestions
      const modelSuggestions: Record<string, { alternative: string; savings_pct: number; tradeoff: string }> = {
        "claude-3-opus": { alternative: "claude-3-sonnet", savings_pct: 80, tradeoff: "Slightly less capable for complex reasoning" },
        "gpt-4o": { alternative: "gpt-4o-mini", savings_pct: 60, tradeoff: "Less capable for complex code generation" },
        "gemini-1.5-pro": { alternative: "gemini-1.5-flash", savings_pct: 75, tradeoff: "Lower quality for long-context tasks" },
      };

      let suggestions: string[] = [];

      for (const entry of usage) {
        const modelKey = entry.provider?.toLowerCase();
        if (modelSuggestions[modelKey]) {
          const s = modelSuggestions[modelKey];
          suggestions.push(
            `${entry.team_id}: Consider switching from ${modelKey} to ${s.alternative} ` +
            `(${s.savings_pct}% savings, tradeoff: ${s.tradeoff}). ` +
            `Current spend: $${entry.total_cost?.toFixed(2) || '0.00'}`
          );
        }
      }

      // Budget forecast
      for (const f of forecast) {
        suggestions.push(
          `${f.team_id}: Projected end-of-month spend: $${f.projected_total_eom?.toFixed(2) || '0.00'} ` +
          `(avg daily: $${f.avg_daily_spend?.toFixed(2) || '0.00'}, ` +
          `current: $${f.current_spend?.toFixed(2) || '0.00'})`
        );
      }

      return {
        content: [{
          type: "text" as const,
          text: suggestions.join("\n") || "No optimization suggestions available.",
        }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text" as const, text: `Error generating suggestions: ${error.message}` }],
        isError: true,
      };
    }
  },
  { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
);

// ---- Tool: update_routing_policy ----
// Updates the API gateway's routing policy.
// DESTRUCTIVE: Changes routing behavior, requires human confirmation.
server.tool(
  "update_routing_policy",
  "Update the API gateway's routing policy. " +
  "Changes how requests are routed to AI providers. " +
  "REQUIRES HUMAN CONFIRMATION before execution.",
  {
    policy: z.enum(["cost", "latency", "priority", "round_robin"])
      .describe("Routing policy: cost (cheapest), latency (fastest), priority (manual), round_robin (distribute)"),
    provider: z.string().optional().describe("Provider to adjust priority for"),
  },
  async ({ policy, provider }) => {
    try {
      // This is a destructive operation — in production, add confirmation logic
      const result = await fetchFromGateway(`/routing/policy`, {
        method: "POST",
        body: JSON.stringify({ policy, provider }),
      });

      return {
        content: [{
          type: "text" as const,
          text: `Routing policy updated to '${policy}'${provider ? ` for provider '${provider}'` : ''}. ` +
                `Result: ${JSON.stringify(result)}`,
        }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text" as const, text: `Error updating routing policy: ${error.message}` }],
        isError: true,
      };
    }
  },
  { readOnlyHint: false, destructiveHint: true, idempotentHint: false }
);

// ============================================================================
// Start Server
// ============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Billing MCP Server v1.0.0 started on stdio");
  console.error(`  Billing Service: ${BILLING_SERVICE_URL}`);
  console.error(`  API Gateway: ${GATEWAY_URL}`);
  console.error("  Tools: get_spending, check_quota, suggest_optimization, update_routing_policy");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
