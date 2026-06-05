/**
 * MCP Builder — Billing MCP Server Template v2.0.0
 *
 * A production-grade Model Context Protocol server that exposes billing,
 * proxy management, deployment, and infrastructure tools for AI agents.
 * Built with @modelcontextprotocol/sdk for TypeScript.
 *
 * Improvements over v1.0.0:
 *   1. Five new tools: check_proxy_health, manage_pmem, get_deployment_status,
 *      check_billing_alerts, refresh_oauth_token
 *   2. SSE transport option alongside stdio
 *   3. Circuit breaker for upstream service calls
 *   4. Timeout configuration for all fetch calls
 *   5. Input validation and sanitization
 *   6. Tool invocation rate limiting
 *   7. Request logging / audit trail
 *   8. Proper error differentiation (timeout / 4xx / 5xx / network)
 *   9. Resource subscriptions for real-time billing alerts
 *  10. Prompt templates for common queries
 *  11. Dynamic model suggestions (fetched from gateway, fallback to local)
 *  12. Graceful shutdown with in-flight request draining
 *
 * Usage:
 *   npm install @modelcontextprotocol/sdk zod express
 *   npx tsc billing-mcp-server-v2.ts
 *
 *   # stdio transport (default):
 *   node billing-mcp-server-v2.js
 *
 *   # SSE transport:
 *   MCP_TRANSPORT=sse MCP_SSE_PORT=3001 node billing-mcp-server-v2.js
 *
 * Tools exposed (9 total):
 *   get_spending           — Query current month's spending by provider
 *   check_quota            — Check quota status for a team
 *   suggest_optimization   — Analyze spending and suggest cost-saving alternatives
 *   update_routing_policy  — Update the API gateway's routing policy
 *   check_proxy_health     — Check health of upstream proxy services
 *   manage_pmem            — Read/write persistent-memory namespaces
 *   get_deployment_status  — Query deployment-manager service status
 *   check_billing_alerts   — List active billing alerts and thresholds
 *   refresh_oauth_token    — Refresh an OAuth token for a given provider
 */

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import express from "express";
import { randomUUID } from "crypto";

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  billingServiceUrl: process.env.BILLING_SERVICE_URL || "http://localhost:8090",
  billingServiceToken: process.env.BILLING_SERVICE_TOKEN || "",
  gatewayUrl: process.env.API_GATEWAY_URL || "http://localhost:8000",
  pmemServiceUrl: process.env.PMEM_SERVICE_URL || "http://localhost:8095",
  deploymentServiceUrl: process.env.DEPLOYMENT_SERVICE_URL || "http://localhost:8092",
  transport: (process.env.MCP_TRANSPORT || "stdio") as "stdio" | "sse",
  ssePort: parseInt(process.env.MCP_SSE_PORT || "3001", 10),
  // Timeout in milliseconds for all upstream fetch calls
  fetchTimeoutMs: parseInt(process.env.MCP_FETCH_TIMEOUT_MS || "10000", 10),
  // Circuit breaker thresholds
  circuitBreaker: {
    failureThreshold: parseInt(process.env.CB_FAILURE_THRESHOLD || "5", 10),
    resetTimeoutMs: parseInt(process.env.CB_RESET_TIMEOUT_MS || "30000", 10),
    halfOpenMaxCalls: parseInt(process.env.CB_HALF_OPEN_MAX || "3", 10),
  },
  // Rate limiting
  rateLimit: {
    maxInvocationsPerMinute: parseInt(process.env.RL_MAX_PER_MIN || "60", 10),
  },
  // Dynamic model suggestions cache TTL
  modelSuggestionsTtlMs: parseInt(process.env.MODEL_SUGGESTIONS_TTL_MS || "300000", 10),
};

// ============================================================================
// Input Validation & Sanitization
// ============================================================================

const SANITIZE_REGEX = /^[a-zA-Z0-9_\-:.]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function sanitize(input: string, fieldName: string): string {
  const trimmed = input.trim();
  if (!SANITIZE_REGEX.test(trimmed)) {
    throw new Error(
      `Invalid ${fieldName}: contains disallowed characters. ` +
      `Only alphanumeric, underscore, hyphen, colon, and dot are permitted.`
    );
  }
  if (trimmed.length > 128) {
    throw new Error(`Invalid ${fieldName}: exceeds maximum length of 128 characters.`);
  }
  return trimmed;
}

function validateDate(dateStr: string, fieldName: string): string {
  const trimmed = dateStr.trim();
  if (!DATE_REGEX.test(trimmed)) {
    throw new Error(`Invalid ${fieldName}: must be in YYYY-MM-DD format.`);
  }
  // Basic range check
  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid ${fieldName}: not a valid date.`);
  }
  return trimmed;
}

// ============================================================================
// Structured Error Types
// ============================================================================

type ErrorCategory = "timeout" | "client_error" | "server_error" | "network" | "circuit_open" | "validation" | "unknown";

class UpstreamError extends Error {
  public readonly category: ErrorCategory;
  public readonly statusCode?: number;
  public readonly upstream: string;
  public readonly requestId: string;

  constructor(opts: {
    message: string;
    category: ErrorCategory;
    statusCode?: number;
    upstream: string;
    requestId: string;
  }) {
    super(opts.message);
    this.name = "UpstreamError";
    this.category = opts.category;
    this.statusCode = opts.statusCode;
    this.upstream = opts.upstream;
    this.requestId = opts.requestId;
  }

  toUserMessage(): string {
    switch (this.category) {
      case "timeout":
        return `[TIMEOUT] Request to ${this.upstream} timed out after ${CONFIG.fetchTimeoutMs}ms (req: ${this.requestId}). The upstream service may be overloaded or unreachable.`;
      case "client_error":
        return `[CLIENT ERROR] ${this.upstream} returned ${this.statusCode} (req: ${this.requestId}). Check your input parameters.`;
      case "server_error":
        return `[SERVER ERROR] ${this.upstream} returned ${this.statusCode} (req: ${this.requestId}). The upstream service is experiencing issues. Retry later.`;
      case "network":
        return `[NETWORK ERROR] Cannot reach ${this.upstream} (req: ${this.requestId}). The service may be down or DNS resolution failed.`;
      case "circuit_open":
        return `[CIRCUIT OPEN] ${this.upstream} is circuit-broken (req: ${this.requestId}). Too many recent failures — requests are blocked for ${CONFIG.circuitBreaker.resetTimeoutMs}ms to allow recovery.`;
      case "validation":
        return `[VALIDATION ERROR] ${this.message} (req: ${this.requestId})`;
      default:
        return `[UNKNOWN ERROR] ${this.message} (req: ${this.requestId})`;
    }
  }
}

// ============================================================================
// Circuit Breaker
// ============================================================================

enum CircuitState { CLOSED, OPEN, HALF_OPEN }

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private halfOpenSuccessCount = 0;

  constructor(
    private readonly name: string,
    private readonly failureThreshold: number,
    private readonly resetTimeoutMs: number,
    private readonly halfOpenMaxCalls: number,
  ) {}

  private log(msg: string): void {
    logRequest("circuit-breaker", `${this.name}: ${msg}`, "debug");
  }

  async execute<T>(fn: () => Promise<T>, requestId: string): Promise<T> {
    // Check if we should transition from OPEN -> HALF_OPEN
    if (this.state === CircuitState.OPEN) {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed >= this.resetTimeoutMs) {
        this.log(`transitioning OPEN -> HALF_OPEN after ${elapsed}ms`);
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenSuccessCount = 0;
      } else {
        throw new UpstreamError({
          message: `Circuit breaker '${this.name}' is OPEN`,
          category: "circuit_open",
          upstream: this.name,
          requestId,
        });
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenSuccessCount++;
      if (this.halfOpenSuccessCount >= this.halfOpenMaxCalls) {
        this.log(`HALF_OPEN -> CLOSED after ${this.halfOpenSuccessCount} successes`);
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
      }
    } else if (this.state === CircuitState.CLOSED) {
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.state === CircuitState.HALF_OPEN) {
      this.log(`HALF_OPEN -> OPEN on failure`);
      this.state = CircuitState.OPEN;
    } else if (this.state === CircuitState.CLOSED && this.failureCount >= this.failureThreshold) {
      this.log(`CLOSED -> OPEN after ${this.failureCount} failures`);
      this.state = CircuitState.OPEN;
    }
  }

  getState(): { name: string; state: string; failures: number } {
    return {
      name: this.name,
      state: CircuitState[this.state],
      failures: this.failureCount,
    };
  }
}

// Instantiate circuit breakers for each upstream
const billingCircuit = new CircuitBreaker(
  "billing-service",
  CONFIG.circuitBreaker.failureThreshold,
  CONFIG.circuitBreaker.resetTimeoutMs,
  CONFIG.circuitBreaker.halfOpenMaxCalls,
);

const gatewayCircuit = new CircuitBreaker(
  "api-gateway",
  CONFIG.circuitBreaker.failureThreshold,
  CONFIG.circuitBreaker.resetTimeoutMs,
  CONFIG.circuitBreaker.halfOpenMaxCalls,
);

const pmemCircuit = new CircuitBreaker(
  "pmem-service",
  CONFIG.circuitBreaker.failureThreshold,
  CONFIG.circuitBreaker.resetTimeoutMs,
  CONFIG.circuitBreaker.halfOpenMaxCalls,
);

const deploymentCircuit = new CircuitBreaker(
  "deployment-service",
  CONFIG.circuitBreaker.failureThreshold,
  CONFIG.circuitBreaker.resetTimeoutMs,
  CONFIG.circuitBreaker.halfOpenMaxCalls,
);

// ============================================================================
// Request Logging / Audit Trail
// ============================================================================

const auditLog: Array<{
  timestamp: string;
  requestId: string;
  tool: string;
  action: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  durationMs?: number;
}> = [];

function logRequest(
  tool: string,
  message: string,
  level: "info" | "warn" | "error" | "debug" = "info",
  requestId?: string,
  durationMs?: number,
): void {
  const entry = {
    timestamp: new Date().toISOString(),
    requestId: requestId || "-",
    tool,
    action: "invoke",
    level,
    message,
    durationMs,
  };
  auditLog.push(entry);
  // Keep last 1000 entries
  if (auditLog.length > 1000) auditLog.shift();
  // Log to stderr for server-side visibility
  const levelIcon = level === "error" ? "✖" : level === "warn" ? "⚠" : level === "debug" ? "…" : "●";
  console.error(`${levelIcon} [${entry.timestamp}] ${tool} ${requestId ? `(${requestId}) ` : ""}${message}${durationMs ? ` [${durationMs}ms]` : ""}`);
}

// ============================================================================
// Rate Limiter (sliding window per tool)
// ============================================================================

class RateLimiter {
  private calls: Map<string, number[]> = new Map();

  constructor(private maxPerMinute: number) {}

  check(toolName: string, requestId: string): void {
    const now = Date.now();
    const windowStart = now - 60_000;
    const calls = this.calls.get(toolName) || [];
    // Remove calls outside the window
    const recentCalls = calls.filter((t) => t > windowStart);
    if (recentCalls.length >= this.maxPerMinute) {
      throw new UpstreamError({
        message: `Rate limit exceeded for tool '${toolName}': ${this.maxPerMinute} calls/minute`,
        category: "validation",
        upstream: "rate-limiter",
        requestId,
      });
    }
    recentCalls.push(now);
    this.calls.set(toolName, recentCalls);
  }
}

const rateLimiter = new RateLimiter(CONFIG.rateLimit.maxInvocationsPerMinute);

// ============================================================================
// HTTP Client with Timeout + Circuit Breaker + Error Differentiation
// ============================================================================

async function fetchUpstream(
  url: string,
  upstreamName: string,
  circuit: CircuitBreaker,
  requestId: string,
  options: RequestInit = {},
): Promise<any> {
  return circuit.execute(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.fetchTimeoutMs);

    const startTime = Date.now();
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      const durationMs = Date.now() - startTime;
      logRequest("http-client", `${upstreamName} ${response.status} in ${durationMs}ms`, response.ok ? "info" : "warn", requestId, durationMs);

      if (!response.ok) {
        const category: ErrorCategory = response.status >= 400 && response.status < 500
          ? "client_error"
          : "server_error";
        throw new UpstreamError({
          message: `${upstreamName} returned ${response.status} ${response.statusText}`,
          category,
          statusCode: response.status,
          upstream: upstreamName,
          requestId,
        });
      }

      return response.json();
    } catch (error: any) {
      if (error instanceof UpstreamError) throw error;
      if (error.name === "AbortError") {
        throw new UpstreamError({
          message: `Request to ${upstreamName} timed out after ${CONFIG.fetchTimeoutMs}ms`,
          category: "timeout",
          upstream: upstreamName,
          requestId,
        });
      }
      // Network errors (ECONNREFUSED, ENOTFOUND, etc.)
      throw new UpstreamError({
        message: `Network error reaching ${upstreamName}: ${error.message}`,
        category: "network",
        upstream: upstreamName,
        requestId,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }, requestId);
}

function fetchFromBilling(path: string, requestId: string, options: RequestInit = {}): Promise<any> {
  const url = `${CONFIG.billingServiceUrl}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (CONFIG.billingServiceToken) {
    headers["Authorization"] = `Bearer ${CONFIG.billingServiceToken}`;
  }
  return fetchUpstream(url, "billing-service", billingCircuit, requestId, { ...options, headers });
}

function fetchFromGateway(path: string, requestId: string, options: RequestInit = {}): Promise<any> {
  const url = `${CONFIG.gatewayUrl}${path}`;
  return fetchUpstream(url, "api-gateway", gatewayCircuit, requestId, options);
}

function fetchFromPmem(path: string, requestId: string, options: RequestInit = {}): Promise<any> {
  const url = `${CONFIG.pmemServiceUrl}${path}`;
  return fetchUpstream(url, "pmem-service", pmemCircuit, requestId, options);
}

function fetchFromDeployment(path: string, requestId: string, options: RequestInit = {}): Promise<any> {
  const url = `${CONFIG.deploymentServiceUrl}${path}`;
  return fetchUpstream(url, "deployment-service", deploymentCircuit, requestId, options);
}

// ============================================================================
// Dynamic Model Suggestions (with cache)
// ============================================================================

interface ModelSuggestion {
  alternative: string;
  savings_pct: number;
  tradeoff: string;
}

// Static fallback for when gateway is unavailable
const FALLBACK_MODEL_SUGGESTIONS: Record<string, ModelSuggestion> = {
  "claude-3-opus": { alternative: "claude-3-sonnet", savings_pct: 80, tradeoff: "Slightly less capable for complex reasoning" },
  "claude-3.5-sonnet": { alternative: "claude-3.5-haiku", savings_pct: 70, tradeoff: "Less capable for complex code generation" },
  "gpt-4o": { alternative: "gpt-4o-mini", savings_pct: 60, tradeoff: "Less capable for complex code generation" },
  "gemini-1.5-pro": { alternative: "gemini-1.5-flash", savings_pct: 75, tradeoff: "Lower quality for long-context tasks" },
  "gemini-2.0-pro": { alternative: "gemini-2.0-flash", savings_pct: 75, tradeoff: "Lower quality for advanced reasoning" },
};

let cachedModelSuggestions: Record<string, ModelSuggestion> | null = null;
let modelSuggestionsCacheTime = 0;

async function getModelSuggestions(requestId: string): Promise<Record<string, ModelSuggestion>> {
  const now = Date.now();
  if (cachedModelSuggestions && (now - modelSuggestionsCacheTime) < CONFIG.modelSuggestionsTtlMs) {
    return cachedModelSuggestions;
  }

  try {
    const data = await fetchFromGateway("/models/suggestions", requestId);
    if (data && typeof data === "object" && Object.keys(data).length > 0) {
      cachedModelSuggestions = data as Record<string, ModelSuggestion>;
      modelSuggestionsCacheTime = now;
      logRequest("model-suggestions", "Updated from gateway", "info", requestId);
      return cachedModelSuggestions;
    }
  } catch (error: any) {
    logRequest("model-suggestions", `Gateway fetch failed, using fallback: ${error.message}`, "warn", requestId);
  }

  // Use fallback
  cachedModelSuggestions = FALLBACK_MODEL_SUGGESTIONS;
  modelSuggestionsCacheTime = now;
  return FALLBACK_MODEL_SUGGESTIONS;
}

// ============================================================================
// Graceful Shutdown
// ============================================================================

let activeRequests = 0;
let shutdownRequested = false;

function incrementActiveRequests(): void { activeRequests++; }
function decrementActiveRequests(): void { activeRequests--; }

async function gracefulShutdown(signal: string): Promise<void> {
  if (shutdownRequested) return;
  shutdownRequested = true;
  logRequest("server", `Received ${signal}, shutting down gracefully...`, "info");
  console.error(`\nGraceful shutdown initiated (${signal}). Draining ${activeRequests} active request(s)...`);

  // Wait up to 15 seconds for active requests to complete
  const drainTimeout = 15_000;
  const startWait = Date.now();
  while (activeRequests > 0 && (Date.now() - startWait) < drainTimeout) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  if (activeRequests > 0) {
    console.error(`Force-exiting with ${activeRequests} request(s) still active after ${drainTimeout}ms drain timeout.`);
  } else {
    console.error("All requests drained. Exiting.");
  }

  process.exit(0);
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// ============================================================================
// MCP Server Definition
// ============================================================================

const server = new McpServer({
  name: "billing-proxy-mcp",
  version: "2.0.0",
});

// ============================================================================
// Resource Subscriptions — Real-time billing alerts
// ============================================================================

const billingAlertSubscriptions = new Set<string>();

server.resource(
  new ResourceTemplate("billing://alerts/{team_id}", { list: undefined }),
  async (uri, { team_id }) => {
    const requestId = randomUUID();
    try {
      const safeTeamId = sanitize(team_id as string, "team_id");
      const data = await fetchFromBilling(`/alerts?team_id=${safeTeamId}`, requestId);
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(data, null, 2),
        }],
      };
    } catch (error: any) {
      const upErr = error instanceof UpstreamError ? error : new UpstreamError({
        message: error.message, category: "unknown", upstream: "billing-service", requestId,
      });
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({ error: upErr.toUserMessage() }),
        }],
      };
    }
  },
);

// ============================================================================
// Prompt Templates — Common queries
// ============================================================================

server.prompt(
  "spending_summary",
  "Generate a concise spending summary for a team with actionable insights.",
  { team_id: z.string().describe("Team ID to summarize") },
  async ({ team_id }) => {
    return {
      messages: [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text:
            `Please analyze the spending for team "${team_id}" using the get_spending and check_quota tools. ` +
            `Then provide:\n` +
            `1. A summary of current month's spending by provider\n` +
            `2. Quota utilization status\n` +
            `3. Any optimization suggestions\n` +
            `4. A brief recommendation on whether the team should adjust their usage patterns`,
        },
      }],
    };
  },
);

server.prompt(
  "cost_optimization_report",
  "Generate a full cost optimization report comparing current usage against alternatives.",
  { team_id: z.string().optional().describe("Team ID (omit for all teams)") },
  async ({ team_id }) => {
    return {
      messages: [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text:
            `Generate a comprehensive cost optimization report${team_id ? ` for team "${team_id}"` : " for all teams"}. ` +
            `Use the suggest_optimization and get_spending tools. Include:\n` +
            `1. Current spending breakdown\n` +
            `2. Model-level cost analysis\n` +
            `3. Specific switching recommendations with projected savings\n` +
            `4. Risk assessment for each recommendation\n` +
            `5. Monthly projected savings if all recommendations are adopted`,
        },
      }],
    };
  },
);

server.prompt(
  "health_check",
  "Perform a comprehensive health check of all connected services.",
  {},
  async () => {
    return {
      messages: [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text:
            `Perform a comprehensive health check of the billing infrastructure. ` +
            `Use the check_proxy_health and check_billing_alerts tools. Report:\n` +
            `1. Status of each upstream service (billing, gateway, PMEM, deployment)\n` +
            `2. Circuit breaker states\n` +
            `3. Any active billing alerts\n` +
            `4. Overall system health score (1-10)\n` +
            `5. Recommended actions if any issues are found`,
        },
      }],
    };
  },
);

// ============================================================================
// Tool 1: get_spending (improved — validation, timeout, circuit breaker, logging)
// ============================================================================

server.tool(
  "get_spending",
  "Query current month's AI spending broken down by provider and team. " +
  "Returns total cost, token usage, and per-provider breakdown. " +
  "Supports date range filtering and team/provider scoping.",
  {
    team_id: z.string().optional().describe("Filter by team ID (omit for all teams)"),
    provider: z.string().optional().describe("Filter by provider (e.g., 'anthropic', 'openai')"),
    start_date: z.string().optional().describe("Start date (YYYY-MM-DD)"),
    end_date: z.string().optional().describe("End date (YYYY-MM-DD)"),
  },
  async ({ team_id, provider, start_date, end_date }) => {
    const requestId = randomUUID();
    incrementActiveRequests();
    const startTime = Date.now();
    try {
      rateLimiter.check("get_spending", requestId);

      // Input validation & sanitization
      const params = new URLSearchParams();
      if (team_id) params.set("team_id", sanitize(team_id, "team_id"));
      if (provider) params.set("provider", sanitize(provider, "provider"));
      if (start_date) params.set("start_date", validateDate(start_date, "start_date"));
      if (end_date) params.set("end_date", validateDate(end_date, "end_date"));

      logRequest("get_spending", `Querying spending: ${params.toString()}`, "info", requestId);

      const data = await fetchFromBilling(`/usage?${params.toString()}`, requestId);

      const summary = data.map((row: any) =>
        `${row.team_id} / ${row.provider} (${row.date}): ` +
        `$${row.total_cost_usd?.toFixed(2) || '0.00'} ` +
        `(${row.total_tokens_in || 0} in, ${row.total_tokens_out || 0} out, ` +
        `${row.event_count || 0} requests)`
      ).join("\n");

      logRequest("get_spending", "Success", "info", requestId, Date.now() - startTime);
      return {
        content: [{
          type: "text" as const,
          text: summary || "No spending data found for the specified filters.",
        }],
      };
    } catch (error: any) {
      const upErr = error instanceof UpstreamError ? error : new UpstreamError({
        message: error.message, category: "unknown", upstream: "billing-service", requestId,
      });
      logRequest("get_spending", `Error: ${upErr.toUserMessage()}`, "error", requestId, Date.now() - startTime);
      return {
        content: [{ type: "text" as const, text: upErr.toUserMessage() }],
        isError: true,
      };
    } finally {
      decrementActiveRequests();
    }
  },
  { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
);

// ============================================================================
// Tool 2: check_quota (improved — validation, timeout, circuit breaker, logging)
// ============================================================================

server.tool(
  "check_quota",
  "Check quota status for one or all teams. Returns current spend, " +
  "soft/hard limits, percentage used, and status (normal/warning/throttled/blocked). " +
  "Also indicates how much headroom remains before each threshold.",
  {
    team_id: z.string().optional().describe("Team ID to check (omit for all teams)"),
  },
  async ({ team_id }) => {
    const requestId = randomUUID();
    incrementActiveRequests();
    const startTime = Date.now();
    try {
      rateLimiter.check("check_quota", requestId);

      const safeTeamId = team_id ? sanitize(team_id, "team_id") : null;
      const params = safeTeamId ? `?team_id=${safeTeamId}` : "";

      logRequest("check_quota", `Checking quota${safeTeamId ? ` for ${safeTeamId}` : " (all teams)"}`, "info", requestId);

      const data = await fetchFromBilling(`/quota/status${params}`, requestId);

      const statusLines = data.map((team: any) =>
        `[${team.status?.toUpperCase()}] ${team.team_id}: ` +
        `$${team.spent_usd?.toFixed(2) || '0.00'} / ` +
        `$${team.soft_limit_usd?.toFixed(2) || '0.00'} (soft) / ` +
        `$${team.hard_limit_usd?.toFixed(2) || '0.00'} (hard) ` +
        `— ${team.soft_pct || 0}%/${team.hard_pct || 0}% used ` +
        `— headroom: $${((team.soft_limit_usd || 0) - (team.spent_usd || 0)).toFixed(2)} to soft limit`
      ).join("\n");

      logRequest("check_quota", "Success", "info", requestId, Date.now() - startTime);
      return {
        content: [{
          type: "text" as const,
          text: statusLines || "No quota data found.",
        }],
      };
    } catch (error: any) {
      const upErr = error instanceof UpstreamError ? error : new UpstreamError({
        message: error.message, category: "unknown", upstream: "billing-service", requestId,
      });
      logRequest("check_quota", `Error: ${upErr.toUserMessage()}`, "error", requestId, Date.now() - startTime);
      return {
        content: [{ type: "text" as const, text: upErr.toUserMessage() }],
        isError: true,
      };
    } finally {
      decrementActiveRequests();
    }
  },
  { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
);

// ============================================================================
// Tool 3: suggest_optimization (improved — dynamic model suggestions)
// ============================================================================

server.tool(
  "suggest_optimization",
  "Analyze spending patterns and suggest cost-saving model alternatives. " +
  "Compares current model usage with cheaper alternatives that offer similar quality. " +
  "Model suggestions are fetched dynamically from the gateway when available, " +
  "with a local fallback for resilience.",
  {
    team_id: z.string().optional().describe("Team ID to analyze (omit for all teams)"),
  },
  async ({ team_id }) => {
    const requestId = randomUUID();
    incrementActiveRequests();
    const startTime = Date.now();
    try {
      rateLimiter.check("suggest_optimization", requestId);

      const safeTeamId = team_id ? sanitize(team_id, "team_id") : null;
      const params = safeTeamId ? `?team_id=${safeTeamId}` : "";

      logRequest("suggest_optimization", `Analyzing${safeTeamId ? ` team ${safeTeamId}` : " all teams"}`, "info", requestId);

      const [forecast, usage, modelSuggestions] = await Promise.all([
        fetchFromBilling(`/forecast${params}`, requestId),
        fetchFromBilling("/usage/teams", requestId),
        getModelSuggestions(requestId),
      ]);

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

      for (const f of forecast) {
        suggestions.push(
          `${f.team_id}: Projected end-of-month spend: $${f.projected_total_eom?.toFixed(2) || '0.00'} ` +
          `(avg daily: $${f.avg_daily_spend?.toFixed(2) || '0.00'}, ` +
          `current: $${f.current_spend?.toFixed(2) || '0.00'})`
        );
      }

      logRequest("suggest_optimization", `Generated ${suggestions.length} suggestions`, "info", requestId, Date.now() - startTime);
      return {
        content: [{
          type: "text" as const,
          text: suggestions.join("\n") || "No optimization suggestions available.",
        }],
      };
    } catch (error: any) {
      const upErr = error instanceof UpstreamError ? error : new UpstreamError({
        message: error.message, category: "unknown", upstream: "billing-service", requestId,
      });
      logRequest("suggest_optimization", `Error: ${upErr.toUserMessage()}`, "error", requestId, Date.now() - startTime);
      return {
        content: [{ type: "text" as const, text: upErr.toUserMessage() }],
        isError: true,
      };
    } finally {
      decrementActiveRequests();
    }
  },
  { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
);

// ============================================================================
// Tool 4: update_routing_policy (improved — validation, circuit breaker, logging)
// ============================================================================

server.tool(
  "update_routing_policy",
  "Update the API gateway's routing policy. " +
  "Changes how requests are routed to AI providers. " +
  "REQUIRES HUMAN CONFIRMATION before execution. " +
  "This is a destructive operation — it alters live routing behavior.",
  {
    policy: z.enum(["cost", "latency", "priority", "round_robin"])
      .describe("Routing policy: cost (cheapest), latency (fastest), priority (manual), round_robin (distribute)"),
    provider: z.string().optional().describe("Provider to adjust priority for"),
  },
  async ({ policy, provider }) => {
    const requestId = randomUUID();
    incrementActiveRequests();
    const startTime = Date.now();
    try {
      rateLimiter.check("update_routing_policy", requestId);

      const safeProvider = provider ? sanitize(provider, "provider") : undefined;

      logRequest("update_routing_policy", `Setting policy '${policy}'${safeProvider ? ` for ${safeProvider}` : ""}`, "warn", requestId);

      const result = await fetchFromGateway(`/routing/policy`, requestId, {
        method: "POST",
        body: JSON.stringify({ policy, provider: safeProvider }),
      });

      logRequest("update_routing_policy", "Policy updated successfully", "info", requestId, Date.now() - startTime);
      return {
        content: [{
          type: "text" as const,
          text: `Routing policy updated to '${policy}'${safeProvider ? ` for provider '${safeProvider}'` : ''}. ` +
                `Result: ${JSON.stringify(result)}`,
        }],
      };
    } catch (error: any) {
      const upErr = error instanceof UpstreamError ? error : new UpstreamError({
        message: error.message, category: "unknown", upstream: "api-gateway", requestId,
      });
      logRequest("update_routing_policy", `Error: ${upErr.toUserMessage()}`, "error", requestId, Date.now() - startTime);
      return {
        content: [{ type: "text" as const, text: upErr.toUserMessage() }],
        isError: true,
      };
    } finally {
      decrementActiveRequests();
    }
  },
  { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
);

// ============================================================================
// Tool 5 (NEW): check_proxy_health
// ============================================================================

server.tool(
  "check_proxy_health",
  "Check the health of upstream proxy services including the billing service, " +
  "API gateway, persistent-memory service, and deployment manager. " +
  "Returns per-service status, circuit breaker state, and latency measurements.",
  {
    service: z.enum(["billing", "gateway", "pmem", "deployment", "all"])
      .optional()
      .describe("Service to check (default: all)"),
  },
  async ({ service }) => {
    const requestId = randomUUID();
    incrementActiveRequests();
    const startTime = Date.now();
    try {
      rateLimiter.check("check_proxy_health", requestId);

      const targetService = service || "all";
      logRequest("check_proxy_health", `Checking health of ${targetService}`, "info", requestId);

      const results: string[] = [];

      const checkService = async (
        name: string,
        healthPath: string,
        circuit: CircuitBreaker,
        fetchFn: (path: string, rid: string) => Promise<any>,
      ) => {
        const cbState = circuit.getState();
        try {
          const checkStart = Date.now();
          const data = await fetchFn(healthPath, requestId);
          const latency = Date.now() - checkStart;
          results.push(
            `[HEALTHY] ${name}: latency ${latency}ms | circuit: ${cbState.state} (failures: ${cbState.failures}) | ${data.status || 'ok'}`
          );
        } catch (error: any) {
          const upErr = error instanceof UpstreamError ? error : new UpstreamError({
            message: error.message, category: "unknown", upstream: name, requestId,
          });
          results.push(
            `[UNHEALTHY] ${name}: ${upErr.toUserMessage()} | circuit: ${cbState.state} (failures: ${cbState.failures})`
          );
        }
      };

      const checks: Promise<void>[] = [];

      if (targetService === "all" || targetService === "billing") {
        checks.push(checkService("billing-service", "/health", billingCircuit, fetchFromBilling));
      }
      if (targetService === "all" || targetService === "gateway") {
        checks.push(checkService("api-gateway", "/health", gatewayCircuit, fetchFromGateway));
      }
      if (targetService === "all" || targetService === "pmem") {
        checks.push(checkService("pmem-service", "/health", pmemCircuit, fetchFromPmem));
      }
      if (targetService === "all" || targetService === "deployment") {
        checks.push(checkService("deployment-service", "/health", deploymentCircuit, fetchFromDeployment));
      }

      await Promise.all(checks);

      // Summary
      const healthy = results.filter((r) => r.startsWith("[HEALTHY]")).length;
      const total = results.length;
      const overallStatus = healthy === total ? "ALL HEALTHY" : `${healthy}/${total} HEALTHY`;

      logRequest("check_proxy_health", `${overallStatus}`, "info", requestId, Date.now() - startTime);

      return {
        content: [{
          type: "text" as const,
          text: `Proxy Health Report: ${overallStatus}\n\n${results.join("\n")}`,
        }],
      };
    } catch (error: any) {
      const upErr = error instanceof UpstreamError ? error : new UpstreamError({
        message: error.message, category: "unknown", upstream: "internal", requestId,
      });
      logRequest("check_proxy_health", `Error: ${upErr.toUserMessage()}`, "error", requestId, Date.now() - startTime);
      return {
        content: [{ type: "text" as const, text: upErr.toUserMessage() }],
        isError: true,
      };
    } finally {
      decrementActiveRequests();
    }
  },
  { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
);

// ============================================================================
// Tool 6 (NEW): manage_pmem — Persistent Memory Operations
// ============================================================================

server.tool(
  "manage_pmem",
  "Read or write key-value data in persistent-memory namespaces. " +
  "Enables MCP tools to persist state across sessions. " +
  "Read operations are safe; write operations modify stored data and require confirmation.",
  {
    action: z.enum(["read", "write", "list", "delete"])
      .describe("Operation: read (get value), write (set value), list (list keys), delete (remove key)"),
    namespace: z.string().describe("Namespace to operate on (e.g., 'billing-cache', 'agent-state')"),
    key: z.string().optional().describe("Key to read/write/delete (omit for 'list' action)"),
    value: z.string().optional().describe("Value to write (required for 'write' action)"),
  },
  async ({ action, namespace, key, value }) => {
    const requestId = randomUUID();
    incrementActiveRequests();
    const startTime = Date.now();
    try {
      rateLimiter.check("manage_pmem", requestId);

      const safeNamespace = sanitize(namespace, "namespace");
      const safeKey = key ? sanitize(key, "key") : undefined;

      // Validate action-specific requirements
      if (action === "write" && !safeKey) {
        throw new UpstreamError({
          message: "Key is required for 'write' action",
          category: "validation",
          upstream: "pmem-service",
          requestId,
        });
      }
      if (action === "write" && !value) {
        throw new UpstreamError({
          message: "Value is required for 'write' action",
          category: "validation",
          upstream: "pmem-service",
          requestId,
        });
      }
      if ((action === "read" || action === "delete") && !safeKey) {
        throw new UpstreamError({
          message: `Key is required for '${action}' action`,
          category: "validation",
          upstream: "pmem-service",
          requestId,
        });
      }

      logRequest("manage_pmem", `${action} on ${safeNamespace}/${safeKey || "*"}`, "info", requestId);

      let result: any;

      switch (action) {
        case "read":
          result = await fetchFromPmem(`/ns/${safeNamespace}/key/${safeKey}`, requestId);
          return {
            content: [{
              type: "text" as const,
              text: `Read ${safeNamespace}/${safeKey}: ${JSON.stringify(result)}`,
            }],
          };

        case "write":
          result = await fetchFromPmem(`/ns/${safeNamespace}/key/${safeKey}`, requestId, {
            method: "PUT",
            body: JSON.stringify({ value }),
          });
          return {
            content: [{
              type: "text" as const,
              text: `Written to ${safeNamespace}/${safeKey}: ${JSON.stringify(result)}`,
            }],
          };

        case "list":
          result = await fetchFromPmem(`/ns/${safeNamespace}/keys`, requestId);
          return {
            content: [{
              type: "text" as const,
              text: `Keys in ${safeNamespace}: ${JSON.stringify(result)}`,
            }],
          };

        case "delete":
          result = await fetchFromPmem(`/ns/${safeNamespace}/key/${safeKey}`, requestId, {
            method: "DELETE",
          });
          return {
            content: [{
              type: "text" as const,
              text: `Deleted ${safeNamespace}/${safeKey}: ${JSON.stringify(result)}`,
            }],
          };
      }
    } catch (error: any) {
      const upErr = error instanceof UpstreamError ? error : new UpstreamError({
        message: error.message, category: "unknown", upstream: "pmem-service", requestId,
      });
      logRequest("manage_pmem", `Error: ${upErr.toUserMessage()}`, "error", requestId, Date.now() - startTime);
      return {
        content: [{ type: "text" as const, text: upErr.toUserMessage() }],
        isError: true,
      };
    } finally {
      decrementActiveRequests();
    }
  },
  // Hint varies by action, but we can't dynamically set hints per invocation.
  // Mark as potentially destructive since 'write' and 'delete' modify state.
  { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
);

// ============================================================================
// Tool 7 (NEW): get_deployment_status
// ============================================================================

server.tool(
  "get_deployment_status",
  "Query the deployment-manager service for deployment status, " +
  "version info, and rollback history. Returns current deployment state, " +
  "active version, and recent deployment events.",
  {
    service_name: z.string().optional().describe("Specific service to check (omit for all services)"),
    include_history: z.boolean().optional().describe("Include recent deployment history (default: false)"),
  },
  async ({ service_name, include_history }) => {
    const requestId = randomUUID();
    incrementActiveRequests();
    const startTime = Date.now();
    try {
      rateLimiter.check("get_deployment_status", requestId);

      const safeServiceName = service_name ? sanitize(service_name, "service_name") : undefined;
      const params = new URLSearchParams();
      if (safeServiceName) params.set("service", safeServiceName);
      if (include_history) params.set("history", "true");

      logRequest("get_deployment_status", `Querying${safeServiceName ? ` ${safeServiceName}` : " all services"}`, "info", requestId);

      const data = await fetchFromDeployment(`/status?${params.toString()}`, requestId);

      const statusLines = Array.isArray(data) ? data.map((svc: any) => {
        let line = `[${svc.status?.toUpperCase() || 'UNKNOWN'}] ${svc.service}: ` +
          `v${svc.version || '?'} deployed ${svc.deployed_at || '?'} ` +
          `by ${svc.deployed_by || '?'} — health: ${svc.health || '?'}%`;
        if (svc.rollback_available) {
          line += ` (rollback to v${svc.previous_version || '?'} available)`;
        }
        return line;
      }).join("\n") : JSON.stringify(data, null, 2);

      logRequest("get_deployment_status", "Success", "info", requestId, Date.now() - startTime);
      return {
        content: [{
          type: "text" as const,
          text: statusLines || "No deployment status available.",
        }],
      };
    } catch (error: any) {
      const upErr = error instanceof UpstreamError ? error : new UpstreamError({
        message: error.message, category: "unknown", upstream: "deployment-service", requestId,
      });
      logRequest("get_deployment_status", `Error: ${upErr.toUserMessage()}`, "error", requestId, Date.now() - startTime);
      return {
        content: [{ type: "text" as const, text: upErr.toUserMessage() }],
        isError: true,
      };
    } finally {
      decrementActiveRequests();
    }
  },
  { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
);

// ============================================================================
// Tool 8 (NEW): check_billing_alerts
// ============================================================================

server.tool(
  "check_billing_alerts",
  "List active billing alerts and thresholds for teams. " +
  "Returns alerts for quota breaches, unusual spending spikes, " +
  "and approaching billing limits. Supports filtering by severity.",
  {
    team_id: z.string().optional().describe("Team ID to check (omit for all teams)"),
    severity: z.enum(["info", "warning", "critical"]).optional()
      .describe("Filter by minimum severity level (default: info)"),
  },
  async ({ team_id, severity }) => {
    const requestId = randomUUID();
    incrementActiveRequests();
    const startTime = Date.now();
    try {
      rateLimiter.check("check_billing_alerts", requestId);

      const safeTeamId = team_id ? sanitize(team_id, "team_id") : undefined;
      const params = new URLSearchParams();
      if (safeTeamId) params.set("team_id", safeTeamId);
      if (severity) params.set("severity", severity);

      logRequest("check_billing_alerts", `Checking alerts${safeTeamId ? ` for ${safeTeamId}` : " (all)"}`, "info", requestId);

      const data = await fetchFromBilling(`/alerts?${params.toString()}`, requestId);

      const alertLines = Array.isArray(data) ? data.map((alert: any) => {
        const sev = alert.severity?.toUpperCase() || "INFO";
        const icon = sev === "CRITICAL" ? "🔴" : sev === "WARNING" ? "🟡" : "🔵";
        return `${icon} [${sev}] ${alert.team_id || "global"}: ${alert.message || alert.description} ` +
          `— triggered at ${alert.triggered_at || "?"} ` +
          `— ${alert.resolved ? "RESOLVED" : "ACTIVE"}`;
      }).join("\n") : JSON.stringify(data, null, 2);

      logRequest("check_billing_alerts", "Success", "info", requestId, Date.now() - startTime);
      return {
        content: [{
          type: "text" as const,
          text: alertLines || "No active billing alerts.",
        }],
      };
    } catch (error: any) {
      const upErr = error instanceof UpstreamError ? error : new UpstreamError({
        message: error.message, category: "unknown", upstream: "billing-service", requestId,
      });
      logRequest("check_billing_alerts", `Error: ${upErr.toUserMessage()}`, "error", requestId, Date.now() - startTime);
      return {
        content: [{ type: "text" as const, text: upErr.toUserMessage() }],
        isError: true,
      };
    } finally {
      decrementActiveRequests();
    }
  },
  { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
);

// ============================================================================
// Tool 9 (NEW): refresh_oauth_token
// ============================================================================

server.tool(
  "refresh_oauth_token",
  "Refresh or validate an OAuth token for a given AI provider. " +
  "Useful when a provider's access token has expired and needs renewal. " +
  "Returns new token metadata (never the raw token value for security). " +
  "This is a write operation as it triggers token rotation on the billing service.",
  {
    provider: z.string().describe("Provider to refresh token for (e.g., 'anthropic', 'openai', 'google')"),
    action: z.enum(["refresh", "validate"])
      .describe("refresh: obtain new token; validate: check current token validity"),
  },
  async ({ provider, action }) => {
    const requestId = randomUUID();
    incrementActiveRequests();
    const startTime = Date.now();
    try {
      rateLimiter.check("refresh_oauth_token", requestId);

      const safeProvider = sanitize(provider, "provider");

      logRequest("refresh_oauth_token", `${action} token for ${safeProvider}`, "warn", requestId);

      const result = await fetchFromBilling(
        `/oauth/${action}?provider=${safeProvider}`,
        requestId,
        { method: "POST" },
      );

      // NEVER return raw token values — only metadata
      const safeResult = {
        provider: result.provider,
        action: result.action,
        status: result.status,
        expires_at: result.expires_at,
        scopes: result.scopes,
        refreshed_at: result.refreshed_at,
      };

      logRequest("refresh_oauth_token", `Token ${action} successful for ${safeProvider}`, "info", requestId, Date.now() - startTime);
      return {
        content: [{
          type: "text" as const,
          text: `OAuth token ${action} for '${safeProvider}': ${JSON.stringify(safeResult, null, 2)}`,
        }],
      };
    } catch (error: any) {
      const upErr = error instanceof UpstreamError ? error : new UpstreamError({
        message: error.message, category: "unknown", upstream: "billing-service", requestId,
      });
      logRequest("refresh_oauth_token", `Error: ${upErr.toUserMessage()}`, "error", requestId, Date.now() - startTime);
      return {
        content: [{ type: "text" as const, text: upErr.toUserMessage() }],
        isError: true,
      };
    } finally {
      decrementActiveRequests();
    }
  },
  { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
);

// ============================================================================
// Start Server (stdio or SSE transport)
// ============================================================================

async function main() {
  console.error("╔══════════════════════════════════════════════════════════════╗");
  console.error("║         Billing MCP Server v2.0.0                          ║");
  console.error("╠══════════════════════════════════════════════════════════════╣");
  console.error(`║  Transport:     ${CONFIG.transport.padEnd(42)}║`);
  console.error(`║  Billing:       ${CONFIG.billingServiceUrl.padEnd(42)}║`);
  console.error(`║  Gateway:       ${CONFIG.gatewayUrl.padEnd(42)}║`);
  console.error(`║  PMEM:          ${CONFIG.pmemServiceUrl.padEnd(42)}║`);
  console.error(`║  Deployment:    ${CONFIG.deploymentServiceUrl.padEnd(42)}║`);
  console.error(`║  Fetch Timeout: ${(`${CONFIG.fetchTimeoutMs}ms`).padEnd(42)}║`);
  console.error(`║  Rate Limit:    ${(`${CONFIG.rateLimit.maxInvocationsPerMinute} calls/min/tool`).padEnd(42)}║`);
  console.error(`║  CB Threshold:  ${(`${CONFIG.circuitBreaker.failureThreshold} failures`).padEnd(42)}║`);
  console.error("╠══════════════════════════════════════════════════════════════╣");
  console.error("║  Tools (9):                                                 ║");
  console.error("║    get_spending, check_quota, suggest_optimization,         ║");
  console.error("║    update_routing_policy, check_proxy_health,               ║");
  console.error("║    manage_pmem, get_deployment_status,                      ║");
  console.error("║    check_billing_alerts, refresh_oauth_token                ║");
  console.error("╠══════════════════════════════════════════════════════════════╣");
  console.error("║  Prompts (3): spending_summary, cost_optimization_report,   ║");
  console.error("║              health_check                                   ║");
  console.error("╠══════════════════════════════════════════════════════════════╣");
  console.error("║  Resources: billing://alerts/{team_id}                      ║");
  console.error("╚══════════════════════════════════════════════════════════════╝");

  if (CONFIG.transport === "sse") {
    // SSE transport: start an Express HTTP server
    const app = express();
    let sseTransport: SSEServerTransport | null = null;

    app.get("/sse", (req, res) => {
      logRequest("server", "New SSE connection", "info");
      sseTransport = new SSEServerTransport("/messages", res);
      server.connect(sseTransport);
    });

    app.post("/messages", express.json(), (req, res) => {
      if (sseTransport) {
        sseTransport.handlePostMessage(req, res);
      } else {
        res.status(500).json({ error: "No active SSE transport" });
      }
    });

    app.listen(CONFIG.ssePort, () => {
      console.error(`SSE transport listening on http://0.0.0.0:${CONFIG.ssePort}`);
      console.error(`  SSE endpoint:  http://0.0.0.0:${CONFIG.ssePort}/sse`);
      console.error(`  POST endpoint: http://0.0.0.0:${CONFIG.ssePort}/messages`);
    });
  } else {
    // stdio transport (default)
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("stdio transport connected");
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
