# Global Skills Access Guide

This file documents how to access the skills library from global locations.

## Skills Locations

| Location | Purpose | Access |
|----------|---------|--------|
| `/home/hive/workspace/skills/` | Local workspace skills | Direct access |
| `/workspace/skills/` | Global/shared skills | Via symlink or copy |
| `/home/hive/workspace/workflows/` | Workflows (local) | Direct access |

## Symlink Setup

To make skills globally accessible, create a symlink:

```bash
# Option 1: Symlink (recommended)
sudo ln -s /home/hive/workspace/skills /workspace/skills
sudo ln -s /home/hive/workspace/workflows /workspace/workflows

# Option 2: Copy (if symlink not possible)
sudo cp -r /home/hive/workspace/skills/* /workspace/skills/
sudo cp -r /home/hive/workspace/workflows /workspace/
```

## Usage

### From Any Project
```bash
# List available skills
ls /workspace/skills/

# Read a skill
cat /workspace/skills/superpowers/SKILL.md
```

### In OpenCode/Claude
```yaml
# In your agent config
skills_path: /workspace/skills/
workflows_path: /workspace/workflows/
```

## Trigger Commands

| Command | Workflow | Location |
|---------|----------|----------|
| `/launch` | Zero-to-Revenue | /workspace/workflows/zero-to-revenue.md |
| `/quality` | Bulletproof Quality | /workspace/workflows/bulletproof-quality.md |
| `/team` | Autonomous Team | /workspace/workflows/autonomous-team.md |
| `/feedback` | Feedback Loop | /home/hive/workspace/skills/feedback-loop/SKILL.md |

## Skills Index (27 Total)

```
/workspace/skills/
├── superpowers/          # Orchestrator - spec-first + TDD + delegation
├── browser-use/           # Browser automation via natural language
├── chain-of-thought/      # Step-by-step reasoning
├── context-compressor/    # Conversation compression
├── deployment-manager/  # Deploy to Vercel/Netlify/GitHub Pages
├── devils-advocate/       # Critical challenge
├── explained-code/       # Beginner-friendly code explanations
├── feedback-loop/        # Iterative improvement cycle
├── frontend-design/      # React + Tailwind + shadcn UI
├── gumroad-pipeline/     # Digital product launches
├── humanizer/           # AI text humanization
├── jtbd-research/      # Jobs-to-be-Done research
├── mcp-builder/         # MCP server building
├── nvidia-build/        # NVIDIA NIM API calls
├── output-formatter/     # Structured output formatting
├── photography-ai/      # Photography AI guidance
├── seo-content-writer/  # SEO content creation
├── simulation-sandbox/  # Scenario testing
├── skill-finder/        # External skill discovery
├── social-content-pillars/  # Content strategy (90-day)
├── social-media-manager/   # Platform-specific posts
├── socratic-method/     # Guided questioning
├── web-artifacts-builder/   # Single-file HTML apps
├── web-design-guidelines/   # Design system rules
├── web-reader/           # Web content fetching
└── audit-analyzer/       # Code audit + patches
```

---

*Last updated: April 2026*