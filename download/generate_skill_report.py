#!/usr/bin/env python3
"""
Generate the Master Skill Analysis PDF Report
Covers all 9 skills with cross-skill comparison tables.
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether
)

OUTPUT_PATH = "/home/z/my-project/download/Skill_Definition_Analysis_Report.pdf"

# Color palette
DARK_BG = HexColor("#1a1a2e")
ACCENT = HexColor("#0f3460")
HIGHLIGHT = HexColor("#e94560")
TABLE_HEADER_BG = HexColor("#16213e")
TABLE_ALT_BG = HexColor("#1a1a2e")
LIGHT_BG = HexColor("#f0f0f5")
TEXT_COLOR = HexColor("#333333")
LINK_COLOR = HexColor("#0f3460")

styles = getSampleStyleSheet()

# Custom styles
styles.add(ParagraphStyle(
    'CoverTitle', parent=styles['Title'],
    fontSize=28, leading=34, textColor=ACCENT,
    spaceAfter=12, alignment=TA_CENTER
))
styles.add(ParagraphStyle(
    'CoverSubtitle', parent=styles['Normal'],
    fontSize=14, leading=18, textColor=TEXT_COLOR,
    spaceAfter=6, alignment=TA_CENTER
))
styles.add(ParagraphStyle(
    'SectionHeader', parent=styles['Heading1'],
    fontSize=18, leading=22, textColor=ACCENT,
    spaceBefore=18, spaceAfter=10, borderWidth=0,
    borderPadding=0
))
styles.add(ParagraphStyle(
    'SubHeader', parent=styles['Heading2'],
    fontSize=14, leading=18, textColor=HexColor("#0f3460"),
    spaceBefore=12, spaceAfter=6
))
styles.add(ParagraphStyle(
    'BodyText2', parent=styles['Normal'],
    fontSize=9.5, leading=13, textColor=TEXT_COLOR,
    alignment=TA_JUSTIFY, spaceAfter=6,
    firstLineIndent=0
))
styles.add(ParagraphStyle(
    'SmallBody', parent=styles['Normal'],
    fontSize=8.5, leading=11, textColor=TEXT_COLOR,
    alignment=TA_LEFT, spaceAfter=4
))
styles.add(ParagraphStyle(
    'TableCell', parent=styles['Normal'],
    fontSize=7.5, leading=10, textColor=TEXT_COLOR,
    alignment=TA_LEFT, spaceAfter=0
))
styles.add(ParagraphStyle(
    'TableHeader', parent=styles['Normal'],
    fontSize=8, leading=10, textColor=white,
    alignment=TA_CENTER, spaceAfter=0
))

def make_table(headers, rows, col_widths=None):
    """Create a styled table."""
    header_row = [Paragraph(h, styles['TableHeader']) for h in headers]
    data_rows = []
    for row in rows:
        data_rows.append([Paragraph(str(cell), styles['TableCell']) for cell in row])

    all_data = [header_row] + data_rows
    t = Table(all_data, colWidths=col_widths, repeatRows=1)

    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#cccccc")),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]
    for i in range(1, len(all_data)):
        if i % 2 == 0:
            style_cmds.append(('BACKGROUND', (0, i), (-1, i), LIGHT_BG))

    t.setStyle(TableStyle(style_cmds))
    return t


def build_report():
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=letter,
        topMargin=0.7*inch,
        bottomMargin=0.7*inch,
        leftMargin=0.7*inch,
        rightMargin=0.7*inch
    )

    elements = []

    # ---- Cover Page ----
    elements.append(Spacer(1, 2*inch))
    elements.append(Paragraph("Skill Definition & Analysis Report", styles['CoverTitle']))
    elements.append(Spacer(1, 0.3*inch))
    elements.append(Paragraph("AI Billing Proxy Infrastructure", styles['CoverSubtitle']))
    elements.append(Paragraph("9 Skills — 11 Analysis Dimensions Each", styles['CoverSubtitle']))
    elements.append(Spacer(1, 0.5*inch))
    elements.append(Paragraph("Cross-Skill Compatibility, Stackability & Integration Mapping", styles['CoverSubtitle']))
    elements.append(Spacer(1, 1*inch))
    elements.append(Paragraph("Generated: 2026-06-02", styles['CoverSubtitle']))
    elements.append(PageBreak())

    # ---- Table of Contents ----
    elements.append(Paragraph("Table of Contents", styles['SectionHeader']))
    toc_items = [
        "1. Executive Summary",
        "2. Skill Inventory & Quick Reference",
        "3. Purpose & Individual Use-Case Comparison",
        "4. Misconception & Conspiracy Analysis",
        "5. Mostly Overlooked Features",
        "6. Contradictions & Resolutions",
        "7. Compatibility Matrix (Compatible Types)",
        "8. Incompatibility Matrix (Not Compatible Types)",
        "9. Stackability Analysis",
        "10. Best Combination Synergies",
        "11. Worst Combination Conflicts",
        "12. Integration Architecture Diagrams",
        "13. File Inventory & Local Storage Map",
    ]
    for item in toc_items:
        elements.append(Paragraph(item, styles['BodyText2']))
    elements.append(PageBreak())

    # ---- 1. Executive Summary ----
    elements.append(Paragraph("1. Executive Summary", styles['SectionHeader']))
    elements.append(Paragraph(
        "This report defines and analyzes nine critical skills for an AI billing proxy infrastructure. "
        "Each skill has been profiled across eleven analysis dimensions: purpose, individual use-case, "
        "misconception, conspiracy, mostly overlooked features, contradictions, compatible types, "
        "incompatible types, stackability, stackable best combined to, and stackable worst combined to. "
        "The nine skills span three functional layers: the client layer (Opencode Owl Install Proxy, "
        "Openhuman Owl Install Proxy), the service layer (Combined Proxy Billing, API Gateway Skill, "
        "OpenRelay Go), the infrastructure layer (Deployment Manager, Persistent Memory), and the "
        "integration layer (Browser-Use, MCP Builder). Together, they form a complete stack for "
        "managing AI API billing, routing, and observability across multiple providers and clients.",
        styles['BodyText2']
    ))
    elements.append(Paragraph(
        "The analysis reveals three key findings. First, Persistent Memory is the most universally "
        "compatible skill — every other skill benefits from state persistence, making it the "
        "foundation of the stack. Second, Combined Proxy Billing and API Gateway Skill form the "
        "core service duo: billing tracks costs, gateway routes requests, and together they provide "
        "full-stack AI API management. Third, the owl install proxies (Opencode and Openhuman) are "
        "the entry points that connect end-user tools to the infrastructure, while Browser-Use and "
        "MCP Builder serve as glue skills that automate workflows and expose capabilities to AI agents.",
        styles['BodyText2']
    ))
    elements.append(Spacer(1, 0.2*inch))

    # ---- 2. Skill Inventory ----
    elements.append(Paragraph("2. Skill Inventory & Quick Reference", styles['SectionHeader']))
    elements.append(make_table(
        ["Skill", "Layer", "Language", "Port", "Key Function"],
        [
            ["Opencode Owl Install", "Client", "Bash", "N/A", "Auto-config OpenCode CLI for billing proxy"],
            ["Openhuman Owl Install", "Client", "Bash", "8400", "Auto-config OpenHuman runtime for billing proxy + OAuth2 PKCE"],
            ["Combined Proxy Billing", "Service", "Python", "8090", "Multi-provider billing aggregation + quota enforcement"],
            ["OpenRelay Go", "Service", "Go", "8443", "Network-level AI API relay with auto-discovery of 45+ endpoints"],
            ["API Gateway Skill", "Service", "Python", "8000", "Application-layer smart routing + rate limiting + caching"],
            ["Browser-Use", "Integration", "JS/Node", "N/A", "Natural-language browser automation for OAuth flows"],
            ["Deployment Manager", "Infrastructure", "YAML/Bash", "N/A", "Full-lifecycle deployment orchestration + canary + rollback"],
            ["Persistent Memory", "Infrastructure", "Python", "6380", "Cross-session state store with TTL + OCC + snapshots"],
            ["MCP Builder", "Integration", "TypeScript", "stdio", "MCP server construction for AI agent tool exposure"],
        ],
        col_widths=[1.2*inch, 0.9*inch, 0.7*inch, 0.5*inch, 3.2*inch]
    ))
    elements.append(Spacer(1, 0.2*inch))

    # ---- 3. Purpose & Use-Case ----
    elements.append(Paragraph("3. Purpose & Individual Use-Case Comparison", styles['SectionHeader']))
    elements.append(make_table(
        ["Skill", "Purpose (1-line)", "Primary Use-Case"],
        [
            ["Opencode Owl Install",
             "Zero-friction client-side proxy configuration for OpenCode CLI",
             "Solo dev or team routes all OpenCode AI calls through a shared billing proxy in under 60 seconds"],
            ["Openhuman Owl Install",
             "Client-side proxy install with OAuth2 PKCE for human-AI workflows",
             "Product team attributes AI costs per-human-reviewer across OpenHuman moderation workflows"],
            ["Combined Proxy Billing",
             "Centralized multi-provider billing aggregation and cross-provider quota enforcement",
             "Startup with 3 AI providers sees unified spend dashboard with per-team quota alerts"],
            ["OpenRelay Go",
             "Network-level AI API relay with auto-discovery of 45+ AI endpoints",
             "Agency with 20 devs using different AI tools tracks spending via single network proxy"],
            ["API Gateway Skill",
             "Smart request routing, rate limiting, and provider selection middleware",
             "SaaS routes French requests to Claude, English to GPT-4o via single gateway endpoint"],
            ["Browser-Use",
             "Natural-language browser automation for interactive web flows",
             "DevOps automates OAuth2 consent flow across 15 developer machines in under 2 min each"],
            ["Deployment Manager",
             "Full-lifecycle deployment orchestration with canary and rollback",
             "Platform team deploys billing service to staging, smoke tests, promotes to production automatically"],
            ["Persistent Memory",
             "Cross-session state persistence with TTL and optimistic concurrency",
             "Token refresh watchdog survives restarts; quota state persists across billing service restarts"],
            ["MCP Builder",
             "MCP server toolkit to expose tools/resources/prompts to AI agents",
             "Claude Code queries spending, checks quotas, and suggests optimizations via MCP tools"],
        ],
        col_widths=[1.1*inch, 2.1*inch, 3.3*inch]
    ))
    elements.append(PageBreak())

    # ---- 4. Misconception & Conspiracy ----
    elements.append(Paragraph("4. Misconception & Conspiracy Analysis", styles['SectionHeader']))
    elements.append(make_table(
        ["Skill", "Top Misconception", "Conspiracy Theory"],
        [
            ["Opencode Owl",
             "It is a VPN/network tunnel capturing all outbound traffic",
             "It is a MITM attack by design that logs all prompts and completions"],
            ["Openhuman Owl",
             "It is for humans making API calls directly; it is just a renamed Opencode owl",
             "Shadow mode is a built-in data exfiltration channel; per-reviewer billing is surveillance"],
            ["Combined Billing",
             "It replaces individual proxy billing systems",
             "It enables organizations to underreport AI usage to providers via billing manipulation"],
            ["OpenRelay Go",
             "It is a crack/keygen providing free AI API access",
             "Auto-discovery is a network surveillance tool monitoring 45+ endpoints for employee activity"],
            ["API Gateway",
             "It is a load balancer distributing requests across providers for the same model",
             "Cost optimization routes to cheapest provider while charging premium prices"],
            ["Browser-Use",
             "It is a web scraper; it requires a headed browser",
             "It can automate phishing attacks to capture credentials"],
            ["Deployment Mgr",
             "It is only for frontend deployment (Vercel/Netlify)",
             "Automatic rollback is a mechanism to secretly revert security patches"],
            ["Persistent Memory",
             "It is just Redis or just SQLite",
             "It records everything an AI agent does, creating permanent surveillance records"],
            ["MCP Builder",
             "It creates AI chatbots; it only works with Claude",
             "MCP is Anthropic's mechanism to control the AI agent ecosystem"],
        ],
        col_widths=[1.1*inch, 2.5*inch, 2.9*inch]
    ))
    elements.append(Spacer(1, 0.2*inch))

    # ---- 5. Mostly Overlooked ----
    elements.append(Paragraph("5. Mostly Overlooked Features", styles['SectionHeader']))
    elements.append(make_table(
        ["Skill", "Overlooked Feature 1", "Overlooked Feature 2"],
        [
            ["Opencode Owl",
             "Quota pre-flight check: fails fast on exhausted quota, saving round-trips",
             "Automatic retry with exponential backoff on upstream 429 responses"],
            ["Openhuman Owl",
             "Zero-downtime token refresh: auto re-auth without interrupting in-flight requests",
             "Billing tags: arbitrary KV pairs for granular cost attribution beyond team/workflow level"],
            ["Combined Billing",
             "Cost anomaly detection: alerts on spending spikes using exponential moving average",
             "Budget forecasting: projects end-of-month spend based on historical patterns"],
            ["OpenRelay Go",
             "Provider failover chains: transparent fallback to alternate provider when primary is down",
             "Connection warm-up: pre-establishes TLS connections at startup for 200-500ms latency reduction"],
            ["API Gateway",
             "Semantic caching: serves cached responses for semantically similar prompts using embeddings",
             "Request priority queue: critical requests jump to front when at capacity"],
            ["Browser-Use",
             "Session checkpoint and resume: resumes from last successful step on failure",
             "Visual assertion: screenshot comparison for visual regression detection"],
            ["Deployment Mgr",
             "Canary deployments: routes 5% traffic to new version, auto-promotes or rolls back",
             "Deployment dry-run: validates configuration without actually deploying"],
            ["Persistent Memory",
             "Optimistic concurrency control: prevents race conditions on concurrent key updates",
             "State snapshots: point-in-time capture for restore after failed deployments"],
            ["MCP Builder",
             "Tool annotations: readOnlyHint/destructiveHint signal AI agents to confirm before dangerous ops",
             "Evaluation mode: auto-validates MCP servers against the specification"],
        ],
        col_widths=[1.1*inch, 2.7*inch, 2.7*inch]
    ))
    elements.append(PageBreak())

    # ---- 6. Contradictions ----
    elements.append(Paragraph("6. Contradictions & Resolutions", styles['SectionHeader']))
    elements.append(make_table(
        ["Skill", "Core Contradiction", "Resolution"],
        [
            ["Opencode Owl",
             "Transparency (invisible to user) vs. Control (must surface quota denials)",
             "Fail-open mode: seamless when working, informative when broken; bypass logging for audit"],
            ["Openhuman Owl",
             "Auditability (detailed trails) vs. Privacy (recording human identity and actions)",
             "Configurable audit granularity: full bodies / metadata only / aggregate stats only"],
            ["Combined Billing",
             "Real-time enforcement vs. eventual consistency (events arrive with different latencies)",
             "Soft limit + hard limit model: soft triggers alerts, hard triggers immediate block"],
            ["OpenRelay Go",
             "Transparency (invisible) vs. Control (admin can route/throttle/block without consent)",
             "Configurable observability: audit / billing / passthrough modes"],
            ["API Gateway",
             "Single-endpoint simplicity vs. multi-provider routing complexity",
             "Routing policy simulator: test rules against sample requests before production deploy"],
            ["Browser-Use",
             "Automation (automate as much as possible) vs. Security (credential entry risk)",
             "Human-in-the-loop for credentials: automates everything except password entry"],
            ["Deployment Mgr",
             "Automation speed vs. Safety (fastest deploy skips all checks)",
             "Configurable speeds: express (minimal) / standard (auto-approve) / careful (human approval)"],
            ["Persistent Memory",
             "Durability (fsync on every write) vs. Performance (async writes)",
             "Configurable durability: sync / async / memory levels"],
            ["MCP Builder",
             "Standardization (MCP schema limits) vs. Flexibility (unique tool patterns)",
             "Resource subscriptions + prompt templates as extension points"],
        ],
        col_widths=[1.1*inch, 2.4*inch, 3*inch]
    ))
    elements.append(Spacer(1, 0.2*inch))

    # ---- 7. Compatibility Matrix ----
    elements.append(Paragraph("7. Compatibility Matrix (Compatible Types)", styles['SectionHeader']))
    compat_data = [
        ["Opencode Owl", "api-gateway HIGH", "persistent-mem HIGH", "deploy-mgr HIGH", "combined-bill HIGH", "mcp-builder MED", "browser-use MED", "openrelay MED"],
        ["Openhuman Owl", "opencode-owl HIGH", "combined-bill HIGH", "persistent-mem HIGH", "browser-use HIGH", "api-gateway MED", "deploy-mgr MED", "mcp-builder MED"],
        ["Combined Billing", "opencode-owl HIGH", "openhuman-owl HIGH", "openrelay HIGH", "api-gateway HIGH", "persistent-mem MED", "deploy-mgr MED", "mcp-builder MED"],
        ["OpenRelay Go", "combined-bill HIGH", "api-gateway HIGH", "deploy-mgr HIGH", "persistent-mem MED", "opencode-owl MED", "openhuman-owl MED", "browser-use LOW"],
        ["API Gateway", "combined-bill HIGH", "openrelay HIGH", "opencode-owl HIGH", "openhuman-owl HIGH", "persistent-mem MED", "deploy-mgr MED", "browser-use LOW"],
        ["Browser-Use", "opencode-owl HIGH", "openhuman-owl HIGH", "deploy-mgr MED", "persistent-mem MED", "mcp-builder MED", "combined-bill LOW-MED", "api-gateway LOW"],
        ["Deployment Mgr", "combined-bill HIGH", "api-gateway HIGH", "openrelay HIGH", "opencode-owl MED", "openhuman-owl MED", "persistent-mem MED", "browser-use MED"],
        ["Persistent Memory", "opencode-owl HIGH", "openhuman-owl HIGH", "combined-bill HIGH", "api-gateway HIGH", "openrelay MED", "deploy-mgr MED", "browser-use MED"],
        ["MCP Builder", "combined-bill HIGH", "api-gateway MED", "persistent-mem MED", "openhuman-owl LOW-MED", "openrelay LOW-MED", "deploy-mgr LOW-MED", "browser-use LOW"],
    ]
    elements.append(make_table(
        ["Skill", "Match 1", "Match 2", "Match 3", "Match 4", "Match 5", "Match 6", "Match 7"],
        compat_data,
        col_widths=[1.1*inch, 0.9*inch, 0.9*inch, 0.9*inch, 0.9*inch, 0.9*inch, 0.9*inch, 0.9*inch]
    ))
    elements.append(PageBreak())

    # ---- 8. Incompatibility Matrix ----
    elements.append(Paragraph("8. Incompatibility Matrix (Not Compatible Types)", styles['SectionHeader']))
    elements.append(make_table(
        ["Skill", "Incompatible With", "Severity", "Reason"],
        [
            ["Opencode Owl", "Hardcoded API keys", "HIGH", "Keys bypass proxy entirely"],
            ["Opencode Owl", "VPN-level proxies", "MEDIUM", "Double-proxy TLS failures"],
            ["Openhuman Owl", "Service accounts without refresh tokens", "HIGH", "No refresh tokens = no auto re-auth"],
            ["Openhuman Owl", "VPN proxies (OAuth)", "MEDIUM", "OAuth2 PKCE redirect fails through VPN"],
            ["Combined Billing", "Direct API keys (no proxy)", "HIGH", "No billing events to aggregate"],
            ["Combined Billing", "Another combined billing instance", "HIGH", "Double-counting of events"],
            ["OpenRelay Go", "TLS certificate pinning", "HIGH", "Pinned apps reject TLS interception"],
            ["OpenRelay Go", "VPN tunnels to AI providers", "MEDIUM", "VPN bypasses network interception"],
            ["API Gateway", "Another API gateway", "HIGH", "Routing loops between two gateways"],
            ["API Gateway", "Hardcoded provider URLs", "HIGH", "Application bypasses gateway"],
            ["Browser-Use", "CAPTCHA-protected pages", "HIGH", "Cannot solve CAPTCHAs autonomously"],
            ["Browser-Use", "Desktop (non-browser) apps", "HIGH", "Only automates web browsers"],
            ["Deployment Mgr", "Manual deployment processes", "HIGH", "Conflicting deployment paradigms"],
            ["Deployment Mgr", "Another deployment manager", "HIGH", "Two systems fighting for control"],
            ["Persistent Memory", "Large binary data", "HIGH", "Causes memory pressure; use object storage"],
            ["Persistent Memory", "High-throughput event streams", "MEDIUM", "Use a message queue instead"],
            ["MCP Builder", "Non-MCP agent frameworks", "MEDIUM", "MCP servers only work with MCP clients"],
            ["MCP Builder", "Real-time streaming protocols", "MEDIUM", "Request-response model; no streaming"],
        ],
        col_widths=[1.1*inch, 1.6*inch, 0.7*inch, 3.1*inch]
    ))
    elements.append(Spacer(1, 0.2*inch))

    # ---- 9. Stackability ----
    elements.append(Paragraph("9. Stackability Analysis", styles['SectionHeader']))
    elements.append(Paragraph(
        "All nine skills are stackable. None is inherently unstackable — each can be combined with "
        "others to form a more capable system. However, the stacking principles differ by layer: "
        "client-layer skills (owl installs) stack by coexisting on the same host with separate env vars; "
        "service-layer skills (billing, gateway, relay) stack by forming a processing pipeline "
        "(relay intercepts, gateway routes, billing tracks); infrastructure-layer skills (deployment, "
        "persistent memory) stack as the foundation that everything else depends on; and integration-layer "
        "skills (browser-use, MCP builder) stack as glue that automates workflows and exposes capabilities.",
        styles['BodyText2']
    ))
    elements.append(Spacer(1, 0.15*inch))
    elements.append(make_table(
        ["Skill", "Stackable?", "Stacking Principle", "Key Stack Position"],
        [
            ["Opencode Owl", "YES", "Outermost application layer: configures the client", "Entry point (client side)"],
            ["Openhuman Owl", "YES", "Coexists with Opencode owl via separate env vars", "Entry point (client side)"],
            ["Combined Billing", "YES", "Top of the billing stack: consumes events from all proxies", "Aggregation layer"],
            ["OpenRelay Go", "YES (caveats)", "Network layer: intercepts before application layer", "Interception layer"],
            ["API Gateway", "YES", "Hub/spine: all other skills connect to or through it", "Routing hub"],
            ["Browser-Use", "YES", "Glue skill: automates interactive steps for other skills", "Automation glue"],
            ["Deployment Mgr", "YES", "Floor/infrastructure: everything else builds on top", "Infrastructure base"],
            ["Persistent Memory", "YES", "Substrate/foundation: provides state for all skills", "State foundation"],
            ["MCP Builder", "YES", "API layer: makes other skills' capabilities agent-accessible", "Agent interface"],
        ],
        col_widths=[1.1*inch, 0.7*inch, 2.3*inch, 1.5*inch]
    ))
    elements.append(PageBreak())

    # ---- 10. Best Combination Synergies ----
    elements.append(Paragraph("10. Best Combination Synergies", styles['SectionHeader']))
    elements.append(make_table(
        ["Combination", "Synergy Level", "Why It Works"],
        [
            ["Persistent Memory + ALL skills", "CRITICAL", "Every skill benefits from state persistence; PM is the universal substrate"],
            ["Combined Billing + API Gateway", "MAXIMUM", "Billing tracks costs, gateway routes requests = full-stack AI API management"],
            ["Opencode Owl + Openhuman Owl", "MAXIMUM", "Both AI coding and human-AI workflow billing covered on same host"],
            ["API Gateway + OpenRelay Go", "HIGH", "Network interception + application routing = defense in depth"],
            ["Opencode Owl + API Gateway", "HIGH", "Owl configures client to use gateway; gateway routes to provider"],
            ["Openhuman Owl + Browser-Use", "HIGH", "Browser-use automates OAuth2 PKCE consent during install"],
            ["Combined Billing + OpenRelay Go", "HIGH", "OpenRelay intercepts, Combined Billing aggregates = complete visibility"],
            ["Deployment Mgr + All services", "HIGH", "Automated deployment + monitoring of billing, gateway, and relay services"],
            ["MCP Builder + Combined Billing", "HIGH", "Billing data becomes AI-agent-queryable via MCP tools"],
            ["Persistent Memory + Openhuman Owl", "HIGH", "OAuth tokens survive watchdog restarts, auto re-auth works"],
        ],
        col_widths=[2*inch, 1*inch, 3.5*inch]
    ))
    elements.append(Spacer(1, 0.2*inch))

    # ---- 11. Worst Combination Conflicts ----
    elements.append(Paragraph("11. Worst Combination Conflicts", styles['SectionHeader']))
    elements.append(make_table(
        ["Combination", "Conflict Level", "Why It Fails"],
        [
            ["OpenRelay Go + TLS pinning apps", "FATAL", "Pinned apps reject OpenRelay's TLS interception entirely"],
            ["Combined Billing + Another billing instance", "CRITICAL", "Double-counting produces inaccurate totals"],
            ["API Gateway + Another API Gateway", "CRITICAL", "Routing loops between two gateways"],
            ["Deployment Mgr + Manual deployments", "CRITICAL", "Conflicting paradigms cause inconsistent state"],
            ["Openhuman Owl + VPN (OAuth)", "SEVERE", "OAuth2 PKCE redirect fails through VPN interception"],
            ["Browser-Use + CAPTCHA-heavy sites", "SEVERE", "Constant human intervention defeats automation purpose"],
            ["Persistent Memory + Large binaries", "SEVERE", "Memory pressure; use object storage instead"],
            ["Opencode Owl + Hardcoded API keys", "HIGH", "Keys bypass the proxy entirely, defeating its purpose"],
            ["OpenRelay Go + VPN tunnels", "HIGH", "VPN bypasses OpenRelay's network interception"],
            ["MCP Builder + Non-MCP frameworks", "HIGH", "MCP servers cannot communicate with non-compliant clients"],
        ],
        col_widths=[2*inch, 1*inch, 3.5*inch]
    ))
    elements.append(PageBreak())

    # ---- 12. Integration Architecture ----
    elements.append(Paragraph("12. Integration Architecture — Layered Stack Diagram", styles['SectionHeader']))
    elements.append(Paragraph(
        "The nine skills form a layered architecture with four distinct layers. The diagram below "
        "shows how data flows from client applications through the infrastructure stack and back.",
        styles['BodyText2']
    ))
    elements.append(Spacer(1, 0.15*inch))

    # Architecture diagram as a table
    arch_data = [
        [Paragraph("<b>LAYER 4: AGENT INTERFACE</b>", styles['TableHeader']),
         Paragraph("MCP Builder (billing tools, routing tools, quota tools)", styles['TableCell'])],
        [Paragraph("<b>LAYER 3: SERVICES</b>", styles['TableHeader']),
         Paragraph("API Gateway (routing, rate limiting, caching) + Combined Billing (aggregation, quotas, anomalies) + OpenRelay Go (network interception, failover)", styles['TableCell'])],
        [Paragraph("<b>LAYER 2: CLIENT CONFIG</b>", styles['TableHeader']),
         Paragraph("Opencode Owl Install (OpenCode CLI proxy config) + Openhuman Owl Install (OpenHuman runtime proxy config + OAuth2 PKCE)", styles['TableCell'])],
        [Paragraph("<b>LAYER 1: INFRASTRUCTURE</b>", styles['TableHeader']),
         Paragraph("Persistent Memory (tokens, quotas, policies, state) + Deployment Manager (build, deploy, monitor, rollback) + Browser-Use (OAuth automation, UI testing)", styles['TableCell'])],
    ]
    arch_table = Table(arch_data, colWidths=[2*inch, 4.5*inch])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), TABLE_HEADER_BG),
        ('TEXTCOLOR', (0, 0), (0, -1), white),
        ('BACKGROUND', (1, 0), (1, 0), HexColor("#e8f5e9")),
        ('BACKGROUND', (1, 1), (1, 1), HexColor("#e3f2fd")),
        ('BACKGROUND', (1, 2), (1, 2), HexColor("#fff3e0")),
        ('BACKGROUND', (1, 3), (1, 3), HexColor("#fce4ec")),
        ('GRID', (0, 0), (-1, -1), 1, HexColor("#cccccc")),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(arch_table)
    elements.append(Spacer(1, 0.2*inch))

    # Data flow diagram
    elements.append(Paragraph("Data Flow: Request Lifecycle", styles['SubHeader']))
    flow_data = [
        [Paragraph("<b>Step</b>", styles['TableHeader']),
         Paragraph("<b>Component</b>", styles['TableHeader']),
         Paragraph("<b>Action</b>", styles['TableHeader']),
         Paragraph("<b>Skill Responsible</b>", styles['TableHeader'])],
        [Paragraph("1", styles['TableCell']), Paragraph("Client (OpenCode/OpenHuman)", styles['TableCell']),
         Paragraph("User sends AI request", styles['TableCell']), Paragraph("Owl Install Proxy (configured endpoint)", styles['TableCell'])],
        [Paragraph("2", styles['TableCell']), Paragraph("Network Intercept", styles['TableCell']),
         Paragraph("OpenRelay intercepts outbound HTTPS to AI endpoint", styles['TableCell']), Paragraph("OpenRelay Go", styles['TableCell'])],
        [Paragraph("3", styles['TableCell']), Paragraph("API Gateway", styles['TableCell']),
         Paragraph("Routes to optimal provider based on policy", styles['TableCell']), Paragraph("API Gateway Skill", styles['TableCell'])],
        [Paragraph("4", styles['TableCell']), Paragraph("Upstream Provider", styles['TableCell']),
         Paragraph("Processes request, returns response", styles['TableCell']), Paragraph("External (Claude, GPT-4, etc.)", styles['TableCell'])],
        [Paragraph("5", styles['TableCell']), Paragraph("Billing Aggregation", styles['TableCell']),
         Paragraph("Ingests billing event, updates quota, checks anomalies", styles['TableCell']), Paragraph("Combined Proxy Billing", styles['TableCell'])],
        [Paragraph("6", styles['TableCell']), Paragraph("State Persistence", styles['TableCell']),
         Paragraph("Persists tokens, quotas, routing policies", styles['TableCell']), Paragraph("Persistent Memory", styles['TableCell'])],
        [Paragraph("7", styles['TableCell']), Paragraph("Agent Interface", styles['TableCell']),
         Paragraph("AI agent queries spending/quota via MCP tools", styles['TableCell']), Paragraph("MCP Builder", styles['TableCell'])],
    ]
    flow_table = Table(flow_data, colWidths=[0.5*inch, 1.5*inch, 2.5*inch, 2*inch])
    flow_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#cccccc")),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ] + [('BACKGROUND', (0, i), (-1, i), LIGHT_BG) for i in range(2, 8, 2)]))
    elements.append(flow_table)
    elements.append(PageBreak())

    # ---- 13. File Inventory ----
    elements.append(Paragraph("13. File Inventory & Local Storage Map", styles['SectionHeader']))
    elements.append(Paragraph(
        "All skill definitions and scripts have been written to local storage under "
        "/home/z/my-project/skills/. Each skill directory contains a profile.md "
        "(11-dimension analysis) and a main script (install.sh, billing-server.py, relay.go, "
        "gateway.py, pmem.py, or billing-mcp-server.ts). Existing SKILL.md files "
        "(browser-use, deployment-manager, mcp-builder) have been preserved.",
        styles['BodyText2']
    ))
    elements.append(Spacer(1, 0.15*inch))
    elements.append(make_table(
        ["Skill Directory", "Files Written", "Script Type"],
        [
            ["opencode-owl-install-proxy/", "profile.md, install.sh", "Bash (bootstrap + OS detection + validation)"],
            ["openhuman-owl-install-proxy/", "profile.md, install.sh", "Bash (bootstrap + OAuth2 PKCE + watchdog daemon)"],
            ["combined-proxy-billing/", "profile.md, billing-server.py", "Python HTTP server (SQLite + events + quotas + anomalies)"],
            ["openrelay-go/", "profile.md, relay.go", "Go daemon (auto-discovery + failover + warmup + registry)"],
            ["api-gateway-skill/", "profile.md, gateway.py", "Python HTTP server (routing + rate limiting + caching)"],
            ["browser-use/", "profile.md (+ existing SKILL.md)", "Natural-language browser automation"],
            ["deployment-manager/", "profile.md (+ existing SKILL.md)", "Full-lifecycle deployment orchestration"],
            ["persistent-memory/", "profile.md, pmem.py", "Python HTTP server (KV store + TTL + OCC + snapshots)"],
            ["mcp-builder/", "profile.md, billing-mcp-server.ts (+ existing SKILL.md)", "TypeScript MCP server (4 billing tools)"],
        ],
        col_widths=[1.8*inch, 1.8*inch, 2.9*inch]
    ))

    # Build the document
    doc.build(elements)
    print(f"Report generated: {OUTPUT_PATH}")


if __name__ == "__main__":
    build_report()
