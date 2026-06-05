# Deployment Manager — Skill Profile

## Purpose

The Deployment Manager is a full-lifecycle deployment orchestration skill that automates the building, testing, deploying, monitoring, and rolling back of web applications and services. It provides a standardized workflow that covers the entire deployment pipeline: from local build verification (unit tests, lint, bundle size check) through CI/CD integration (GitHub Actions, GitLab CI) to platform deployment (Vercel, Netlify, GitHub Pages, Docker, Kubernetes) and post-deployment monitoring (uptime checks, error tracking, performance auditing). In the context of AI billing proxy infrastructure, the Deployment Manager is responsible for deploying and managing the Combined Proxy Billing service, the API Gateway, and the OpenRelay Go daemon — ensuring that each component is correctly built, configured, deployed, and monitored, and that any deployment failure triggers an automatic rollback to the last known-good version. It also handles environment-specific configuration (development, staging, production), secrets management (proxy tokens, API keys), and multi-region deployment for globally distributed proxy networks.

## Individual Use-Case

A platform engineering team manages the AI billing proxy infrastructure (Combined Billing + API Gateway + OpenRelay) for their organization. When a new version of the billing service is released, the Deployment Manager automatically runs the full pipeline: builds the Python service, runs unit and integration tests, builds a Docker image, pushes it to the container registry, deploys it to the staging Kubernetes cluster, runs smoke tests against the staging environment, and if all tests pass, promotes the deployment to production. If any step fails, the deployment is automatically rolled back to the previous version, and the team is notified via Slack. The entire process is automated and repeatable, eliminating the risk of manual deployment errors and ensuring that every change goes through the same quality gate.

## Misconception

The most common misconception is that the Deployment Manager is only for frontend deployment (Vercel/Netlify/GitHub Pages). While it does support these platforms, it is equally capable of deploying backend services (Docker containers, Kubernetes pods, systemd services) and managing the full infrastructure lifecycle. A second misconception is that it replaces CI/CD tools like GitHub Actions; in reality, it works alongside them — the Deployment Manager provides the high-level orchestration and platform-specific deployment logic, while CI/CD tools handle the build and test execution.

## Conspiracy

The conspiracy theory is that the Deployment Manager's "automatic rollback" feature is a mechanism for secretly reverting security patches or feature updates without the team's knowledge. While it is true that automated rollbacks can undo changes, the rollback is triggered by explicit failure conditions (failed health checks, error rate spikes, smoke test failures) and is always logged and notified. The team is immediately alerted when a rollback occurs, and the rollback reason is recorded. The deployment manager cannot initiate a rollback without a failure trigger — it does not randomly revert deployments.

## Mostly Overlooked

The most overlooked feature is the Deployment Manager's support for "canary deployments." Instead of deploying a new version to all instances simultaneously, canary deployment routes a small percentage of traffic (e.g., 5%) to the new version while the rest continues to use the old version. The Deployment Manager monitors the canary instances for error rates, latency, and billing accuracy, and if the canary performs well for a configurable period (e.g., 30 minutes), it gradually increases the canary percentage until 100% of traffic is on the new version. If the canary shows problems, it is immediately rolled back without affecting the majority of users. The second overlooked feature is "deployment dry-run" — the ability to run through the entire deployment pipeline without actually deploying, allowing teams to validate their configuration and catch issues before they affect production.

## Contradictions

The central contradiction is between automation speed and safety. The fastest deployment is one that skips all checks and pushes directly to production, but the safest deployment is one that runs every check and waits for human approval at each gate. The Deployment Manager resolves this with configurable "deployment speeds": "express" (minimal checks, auto-approve), "standard" (all checks, auto-approve if passing), and "careful" (all checks, human approval required at each gate). A second contradiction is between infrastructure-as-code (declarative configuration) and imperative deployment steps (run this script, then that script). The Deployment Manager supports both paradigms but prefers declarative configuration for reproducibility.

## Compatible Types

| Type | Compatibility | Reason |
|------|--------------|--------|
| Combined Proxy Billing | HIGH | Deploys and manages the billing service |
| api-gateway-skill | HIGH | Deploys the API gateway as a containerized service |
| openrelay-go | HIGH | Deploys OpenRelay as a Docker container or systemd service |
| Opencode Owl Install Proxy | MEDIUM | Owl install can be triggered as a pre-deploy step |
| Openhuman Owl Install Proxy | MEDIUM | Same as Opencode owl |
| persistent-memory | MEDIUM | Deployment state and configuration can be persisted |
| browser-use | MEDIUM | Post-deployment UI verification |
| mcp-builder | LOW | Limited direct interaction |

## Not Compatible Types

| Type | Incompatibility | Reason |
|------|----------------|--------|
| Manual deployment processes | HIGH | Manual deployments cannot be managed by an automated deployment manager |
| On-premises bare metal without containerization | MEDIUM | Deployment manager is optimized for container and cloud deployments; bare metal requires custom scripts |
| Serverless functions (AWS Lambda) | LOW-MEDIUM | Requires platform-specific adapters; not natively supported |
| Legacy monoliths without health check endpoints | MEDIUM | Without health checks, the deployment manager cannot verify deployment success |

## Stackable

**YES** — The Deployment Manager is a foundational stackable skill that serves as the "infrastructure backbone" for all other skills. Every skill that runs as a service (Combined Billing, API Gateway, OpenRelay) depends on the Deployment Manager for reliable deployment. It stacks with persistent-memory (persisting deployment state), browser-use (post-deploy verification), and all the proxy skills (as deployment targets). The stacking principle is "deployment-manager as the floor" — everything else is built on top of it.

## Stackable Best Combined To

| Combination | Synergy |
|-------------|---------|
| Deployment Manager + Combined Proxy Billing | Maximum: automated deployment + monitoring of the billing service |
| Deployment Manager + API Gateway | High: automated gateway deployment with canary support |
| Deployment Manager + OpenRelay Go | High: automated relay deployment with health checks |
| Deployment Manager + persistent-memory | Medium: deployment state survives process restarts |
| Deployment Manager + browser-use | Medium: post-deployment smoke testing |

## Stackable Worst Combined To

| Combination | Conflict |
|-------------|----------|
| Deployment Manager + manual deployment process | Conflicting deployment paradigms |
| Deployment Manager + bare metal without containerization | Requires custom adapters, adds complexity |
| Deployment Manager + another deployment manager | Double-deployment risk — two systems fighting for control |
| Deployment Manager + legacy monoliths | Health check and rollback mechanisms may not work |
