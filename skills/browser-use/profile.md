# Browser-Use — Skill Profile

## Purpose

Browser-Use is a natural-language browser automation skill that enables AI agents to interact with web pages using plain English commands instead of raw Playwright or Puppeteer scripts. It provides a high-level abstraction layer where the agent describes what it wants to do (e.g., "Log into the dashboard and download the monthly report"), and the skill automatically translates this intent into a sequence of browser actions (navigate, click, type, wait, extract). The skill handles common automation challenges automatically: waiting for dynamic content to load, dealing with CAPTCHAs (by pausing and requesting human intervention), managing session cookies across multi-step flows, and extracting structured data from unstructured HTML. In the context of AI billing proxy setups, Browser-Use is critical for automating the OAuth2 consent flows that both Opencode Owl and Openhuman Owl require during installation — it can open the OAuth consent page, wait for the user to authenticate, capture the redirect callback with the authorization code, and pass it back to the installation script. This eliminates the need for manual browser interaction during proxy setup.

## Individual Use-Case

A DevOps engineer needs to configure the Openhuman Owl Install Proxy on 15 developer machines. Each installation requires an OAuth2 PKCE flow where the developer must open a browser, navigate to the proxy's authorization endpoint, log in with their corporate SSO credentials, and consent to the proxy access. Instead of walking each developer through this process manually, the engineer uses Browser-Use to automate the flow: the skill opens the consent URL, waits for the developer to enter their SSO credentials (Browser-Use does not handle password entry for security reasons — it pauses and prompts the developer), captures the authorization code from the redirect, and passes it to the installation script. The entire process takes under 2 minutes per developer, compared to 10-15 minutes of manual setup.

## Misconception

The most common misconception is that Browser-Use is a web scraper — that its primary purpose is to extract data from web pages. While data extraction is one of its capabilities, Browser-Use is fundamentally an interaction automation tool. It can fill forms, click buttons, navigate through multi-step workflows, handle file downloads, and manage authentication sessions — all tasks that go far beyond scraping. A second misconception is that Browser-Use requires a headed browser (a visible browser window); in fact, it supports both headed and headless modes, and the headless mode is the default for production automation.

## Conspiracy

The conspiracy theory is that Browser-Use can be used to automate phishing attacks — by navigating to a legitimate website, overlaying a fake login form, and capturing credentials. While it is technically true that browser automation tools can be misused, Browser-Use includes built-in safeguards: it refuses to enter credentials into forms that are not on the expected domain (domain validation), it logs all actions for audit purposes, and it enforces a "no credential storage" policy — passwords are never saved, logged, or transmitted outside the immediate browser context. The skill is designed for legitimate automation, and its constraints are specifically designed to prevent credential harvesting.

## Mostly Overlooked

The most overlooked feature is Browser-Use's "session checkpoint and resume" capability. During long automation flows (e.g., a 20-step OAuth2 + consent + redirect + token exchange flow), if any step fails (e.g., network timeout, page crash), Browser-Use automatically saves the session state (cookies, localStorage, current URL) and can resume from the last successful checkpoint rather than restarting from scratch. This is critical for flaky web applications where intermittent failures are common. The second overlooked feature is the "visual assertion" capability — Browser-Use can take a screenshot at any point and compare it to a reference image, allowing the agent to verify that the page looks correct (not just that the DOM contains the expected elements). This catches visual regressions that DOM-based assertions would miss.

## Contradictions

The primary contradiction is between automation and security. Browser-Use wants to automate as much as possible (including authentication flows), but entering credentials automatically creates a security risk (credentials stored in scripts or configuration). The resolution is the "human-in-the-loop for credentials" pattern — Browser-Use automates everything except password entry, pausing at the login step and prompting the human to type their password. A second contradiction is between speed and reliability — the fastest automation runs without any waits or checks, but the most reliable automation waits for elements to be visible, interactive, and stable before acting on them. The resolution is adaptive wait strategies: Browser-Use uses smart waits (waiting for network idle, element visibility, and DOM stability) that balance speed and reliability.

## Compatible Types

| Type | Compatibility | Reason |
|------|--------------|--------|
| Opencode Owl Install Proxy | HIGH | Automates the OAuth2 PKCE flow during proxy installation |
| Openhuman Owl Install Proxy | HIGH | Automates the OAuth2 PKCE flow and consent screen |
| deployment-manager | MEDIUM | Can verify deployed web applications post-deployment |
| Combined Proxy Billing | LOW-MEDIUM | Can scrape billing dashboards that don't have APIs |
| api-gateway-skill | LOW | Can test gateway endpoints via browser |
| openrelay-go | LOW | Limited direct interaction |
| persistent-memory | MEDIUM | Session checkpoints and cookies can be persisted |
| mcp-builder | MEDIUM | Browser-use can be exposed as an MCP tool for AI agents |

## Not Compatible Types

| Type | Incompatibility | Reason |
|------|----------------|--------|
| Headless-only environments without display servers | MEDIUM | Some headed-browser features require a display server (X11/Wayland); headless mode works but with limitations |
| CAPTCHA-protected pages (without human intervention) | HIGH | Browser-Use cannot solve CAPTCHAs autonomously; it pauses and requests human help |
| Desktop applications (non-browser) | HIGH | Browser-Use only automates web browsers, not native desktop apps |
| Real-time collaboration tools (e.g., Figma, Miro) | MEDIUM | These tools use canvas/WebGL rendering that is difficult to automate |

## Stackable

**YES** — Browser-Use is stackable and serves as a "glue" skill that automates the interactive steps that other skills require. It stacks best with the owl install proxies (automating OAuth), deployment-manager (post-deployment verification), and mcp-builder (exposing browser automation as an MCP tool). The stacking principle is "browser-use as the hands" — other skills define what needs to happen, and browser-use executes the interactive parts.

## Stackable Best Combined To

| Combination | Synergy |
|-------------|---------|
| Browser-Use + Openhuman Owl Install | Maximum: fully automated OAuth2 PKCE installation |
| Browser-Use + Opencode Owl Install | High: automated proxy setup with OAuth |
| Browser-Use + persistent-memory | Medium: session state survives between automation runs |
| Browser-Use + deployment-manager | Medium: post-deployment UI smoke testing |
| Browser-Use + mcp-builder | Medium: browser automation exposed as MCP tool for AI agents |

## Stackable Worst Combined To

| Combination | Conflict |
|-------------|----------|
| Browser-Use + CAPTCHA-heavy sites | Requires constant human intervention, defeating automation purpose |
| Browser-Use + desktop automation tools | Different automation domains; no synergy |
| Browser-Use + headless-only environments | Some features require a headed browser |
| Browser-Use + high-frequency page interactions | Browser rendering is slow (1-3s per page); not suitable for sub-second automation |
