# Deployment Manager Skill

## Purpose
Deploy, monitor, and update applications across multiple platforms (GitHub Pages, Vercel, Netlify, Docker registries). Provides unified deployment workflow with rollback support and environment management.

## Install
```bash
npx skills add marktantongco/deployment-manager -g -y
# Alternative: npx skills add expo/skills/expo-deployment -g -y
# Alternative: npx skills add railwayapp/railway-skills/deployment -g -y
```

## Key Features
- Multi-platform deployment (GitHub Pages, Vercel, Netlify, Docker)
- Environment management (dev, staging, production)
- Rollback support
- Health monitoring post-deployment
- Build pipeline integration
- CDN cache invalidation

## Architecture
Source Code → Build Pipeline → Deployment Manager → Target Platform
                                            ↳ Health Check → Verify → Rollback (if needed)
