# API Gateway Skill

## Purpose
Managed API routing for 100+ third-party services through a single API key. Provides unified access to Slack, HubSpot, Salesforce, Google Workspace, Shopify, Stripe, Notion, Jira, Airtable, Twilio, LinkedIn, Microsoft Teams, Zoom, WhatsApp, Trello, Zendesk, and more.

## Install
```bash
npx skills add maton-ai/api-gateway-skill@api-gateway -g -y
```

## Key Features
- 100+ service integrations via Maton-managed API routes
- Connection management (OAuth/API key per service)
- Safety protocol: non-GET requests require explicit user approval
- Least-privilege OAuth scopes enforced
- Rate limits: 10 req/sec per account
- CLI + Python/JS SDK

## Security
- MATON_API_KEY treated as secret
- Auto-cleanup of unused connections
- Read-first approach (start with GET before mutations)
