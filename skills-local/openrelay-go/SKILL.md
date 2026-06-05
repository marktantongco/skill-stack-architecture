# OpenRelay Go

## Purpose
Go-based unified billing proxy and API gateway combining romgX/openrelay (multi-provider routing) with Hermes billing proxy and OpenClaw billing proxy layers. Production-grade, single-binary deployment.

## Build & Run
```bash
cd openrelay-go
go mod tidy
go build -o openrelay ./cmd/openrelay
./openrelay -config config.example.json -port 18765
```

## Key Components
- HTTP Server (Gin): /health, /v1/models, /v1/chat/completions, /v1/providers
- BillingProxy: Combined Hermes + OpenClaw bidirectional transform pipeline
- Provider Registry: Health checks (30s), failover, round-robin, load-balance
- Config: Hot reload, model groups (virtual models), rate limit tracking

## Billing Proxy Layers
- Hermes Layer: Auth injection, billing header, system template bypass
- OpenClaw Layer: Tool renaming, property renaming, trigger phrase masking, description stripping
- Reverse mapping on responses

## Architecture
Client → HTTP Server → BillingProxy.ProcessRequest → Provider Registry → Upstream
Upstream → BillingProxy.ProcessResponse → Client
