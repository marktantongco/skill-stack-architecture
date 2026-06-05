# OpenRelay Go

A Go rewrite of **romgX/openrelay** (TypeScript) combined with billing proxy layers from **avaclawl/hermes-billing-proxy** and **vitalemazo/openclaw-billing-proxy**.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenRelay Go v2.0                         │
├─────────────────────────────────────────────────────────────┤
│  HTTP Server (Gin)                                          │
│    ├── /health      → Provider health + billing proxy status│
│    ├── /v1/models   → Aggregated model list                 │
│    ├── /v1/chat/completions → Proxy with streaming SSE      │
│    └── /v1/providers → Provider status dashboard            │
├─────────────────────────────────────────────────────────────┤
│  Billing Proxy (Combined Hermes + OpenClaw)                 │
│    ┌──────────────┐  ┌──────────────┐                       │
│    │ Hermes Layer │→ │ OpenClaw     │                       │
│    │              │  │ Layer        │                       │
│    │ • Auth inj   │  │ • Tool rename│                       │
│    │ • Billing hdr│  │ • Prop rename│                       │
│    │ • Sys bypass │  │ • Trigger mask│                       │
│    └──────────────┘  └──────────────┘                       │
├─────────────────────────────────────────────────────────────┤
│  Provider Registry                                          │
│    • Health checks (30s interval)                           │
│    • Failover / Round-Robin / Load-Balance                  │
│    • Model groups (virtual models)                          │
│    • Rate limit tracking                                    │
├─────────────────────────────────────────────────────────────┤
│  Upstream Providers (OpenAI, Anthropic, Ollama, etc.)       │
└─────────────────────────────────────────────────────────────┘
```

## Features

### From romgX/openrelay
- **Multi-provider routing** — Route requests to OpenAI, Anthropic, Ollama, or any OpenAI-compatible endpoint
- **Model groups** — Virtual models like `smart` (failover) or `fast` (round-robin)
- **Health monitoring** — Automatic provider health checks with latency tracking
- **Streaming SSE** — Full support for streaming chat completions
- **Hot config reload** — Watch filesystem for configuration changes
- **CORS enabled** — Ready for browser-based clients

### From avaclawl/hermes-billing-proxy
- **Credential loading** — Reads `~/.claude/.credentials.json` for Claude Code tokens
- **Billing header injection** — Injects `x-anthropic-billing-header` with OAuth token
- **System template bypass** — Prevents platform identification leakage in system prompts

### From vitalemazo/openclaw-billing-proxy
- **Tool renaming** — Maps internal tool names to standardized names (e.g., `exec` → `Bash`)
- **Property renaming** — Renames JSON properties (e.g., `session_id` → `thread_id`)
- **Trigger phrase detection** — Masks known platform trigger phrases in message content
- **Description stripping** — Optionally strips tool descriptions to reduce token usage
- **Reverse mapping** — Restores original names on response bodies

## Quick Start

```bash
# Clone and build
cd openrelay-go
go mod tidy
go build -o openrelay ./cmd/openrelay

# Run with default config
./openrelay -config config.example.json -port 18765

# Or with environment variables
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
./openrelay
```

## Configuration

See `config.example.json` for a full example. Key sections:

| Section | Purpose |
|---------|---------|
| `providers` | Upstream AI endpoints with auth, models, rate limits |
| `model_groups` | Virtual models combining multiple providers |
| `billing_proxy` | Hermes + OpenClaw proxy settings |
| `tool_mappings` | Forward tool name mappings |
| `reverse_mappings` | Reverse tool name mappings |

### Billing Proxy Settings

```json
{
  "billing_proxy": {
    "enabled": true,
    "credentials_path": "~/.claude/.credentials.json",
    "billing_header": "x-anthropic-billing-header",
    "hermes_mode": true,
    "openclaw_mode": true,
    "strip_descriptions": true,
    "system_template_bypass": true,
    "trigger_phrases": ["OpenClaw", "hermes", "clawhub"],
    "tool_renames": {"exec": "Bash", "lcm_read": "ReadFile"},
    "property_renames": {"session_id": "thread_id"}
  }
}
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health, provider status, billing proxy state |
| `/v1/models` | GET | List all available models (including virtual groups) |
| `/v1/chat/completions` | POST | Proxy chat completions with streaming support |
| `/v1/completions` | POST | Legacy completions (delegates to chat) |
| `/v1/providers` | GET | Detailed provider status and latency |

## Usage with Claude Code / OpenClaw

```bash
# Point Claude Code at OpenRelay
export CLAUDE_CODE_API_URL=http://localhost:18765/v1
claude

# Or configure OpenClaw to use the relay
openclaw --api-base http://localhost:18765
```

## Project Structure

```
openrelay-go/
├── cmd/openrelay/          # Main entry point
│   └── main.go
├── internal/
│   ├── server/             # HTTP handlers, SSE streaming
│   │   └── server.go
│   ├── providers/          # Provider registry, health checks
│   │   └── registry.go
│   ├── billingproxy/       # Combined Hermes + OpenClaw proxy
│   │   └── proxy.go
│   ├── config/             # Config loading, hot reload
│   │   └── config.go
│   └── models/             # Shared data structures
│       └── models.go
├── pkg/utils/              # Utility functions
│   └── utils.go
├── go.mod
├── config.example.json
└── README.md
```

## License

MIT — inherits from original romgX/openrelay, avaclawl/hermes-billing-proxy, and vitalemazo/openclaw-billing-proxy.
