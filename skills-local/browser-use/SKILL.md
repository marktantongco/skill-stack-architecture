# Browser-Use Skill

## Purpose
Automates browser interactions for web testing, form filling, screenshots, data extraction, and complex multi-step web workflows. Fast persistent browser automation with session continuity across sequential agent commands.

## Install
```bash
npx skills add browser-use/browser-use@browser-use -g -y
```

## Key Features
- Background daemon keeps browser open (~50ms latency per call)
- Three browser modes: headless Chromium, real Chrome with profile, cloud-hosted remote
- 20+ command categories: navigation, inspection, interaction, extraction, cookies, JS execution
- Core workflow: Navigate → Inspect (state) → Interact (by element index) → Verify → Repeat
- Cloud API for remote browsers and task automation
- Cloudflare tunneling for local dev servers
- Multi-session support for parallel workflows
- CLI aliases: bu, browser, browseruse

## Architecture
Agent → Browser Daemon (persistent) → Chromium/Chrome → Target Website
