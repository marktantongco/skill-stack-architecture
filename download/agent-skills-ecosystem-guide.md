# Agent Skills Ecosystem Guide

## Standardized Protocol: Vercel Agent Skills Format (agentskills.io)

This project follows the Vercel Agent Skills open standard, compatible with `npx skills add` CLI.

### Standard Structure

Every skill follows this directory layout:

```
skill-name/
├── SKILL.md (required - YAML frontmatter + instructions)
├── scripts/ (optional - executable helpers)
├── references/ (optional - detailed docs, templates)
└── assets/ (optional - static files, images, configs)
```

### SKILL.md Frontmatter (Required)

```yaml
---
name: "skill-name"  # lowercase, hyphens only, MUST match directory
description: "What this skill does AND when to use it. Acts as routing rule."
metadata:
  category: "category-name"
  type: "instruction|sdk-wrapper|complex"
  version: "1.0.0"
  author: "Author Name"
license: "MIT|Proprietary"
tags:
  - tag1
  - tag2
---
```

### Key Rules

1. **name** must match the directory name (lowercase, hyphens only)
2. **description** is the routing rule - include what the skill does AND when to use it
3. **Progressive disclosure**: metadata (always) → body (on trigger) → resources (on demand)

## Skills CLI (skills.sh)

```bash
# List all skills
bash skills.sh list

# Find skills by keyword
bash skills.sh find chart

# Show skill details
bash skills.sh info pdf

# Add skill from GitHub
bash skills.sh add vercel-labs/agent-skills --skill web-design-guidelines

# Create new skill
bash skills.sh init my-new-skill

# Diagnose all skills
bash skills.sh doctor

# Re-standardize all skills
bash skills.sh update
```

### npx skills Compatibility

```bash
# Install skills from this project
npx skills add ./skills

# Install specific skill
npx skills add ./skills/pdf

# Install from GitHub (if published)
npx skills add your-org/agent-skills --skill pdf
```

## Skills Inventory: 99 Skills

### Agent (4 skills)

| Skill | Type | Description |
|-------|------|-------------|
| `agent-browser` | instruction | A fast Rust-based headless browser automation CLI with Node.js fallback that enables AI agents to na... |
| `ai-news-collectors` | instruction | AI 新闻聚合与热度排序工具。当用户询问 AI 领域最新动态时触发，如："今天有什么 AI 新闻？""总结一下这周的 AI 动态""最近有什么火的 AI 产品？""AI 圈最近在讨论什么？"。覆盖：新... |
| `browser-use` | instruction | Use when the user needs help with browser use related tasks. |
| `browser-use-owl` | instruction | Use when the user needs help with browser use owl related tasks. |

### Business (10 skills)

| Skill | Type | Description |
|-------|------|-------------|
| `blog-writer` | instruction | This skill should be used when writing blog posts, articles, or long-form content in the writer's di... |
| `content-strategy` | instruction | Build and execute a content marketing strategy for a solopreneur business. Use when planning what co... |
| `finance` | instruction | Comprehensive Finance API integration skill for real-time and historical financial data analysis, ma... |
| `gumroad-pipeline` | instruction | Use when the user needs help with gumroad pipeline related tasks. |
| `jobs-to-be-done` | instruction | Jobs to Be Done (JTBD) framework for understanding customer motivations and designing products peopl... |
| `market-research-reports` | instruction | Generate comprehensive market research reports (50+ pages) in the style of top consulting firms (McK... |
| `marketing-mode` | instruction | Use when the user needs help with marketing mode related tasks. |
| `seo-content-writer` | instruction | Use when the user asks to "write SEO content", "create a blog post", "write an article", "content wr... |
| `social-media-manager` | instruction | Use when the user needs help with social media manager related tasks. |
| `stock-analysis-skill` | instruction | Comprehensive stock market analysis skill covering A-share (China), Hong Kong, and US equities. Prio... |

### Career (6 skills)

| Skill | Type | Description |
|-------|------|-------------|
| `auto-target-tracker` | instruction | 自动目标进度追踪器。在对话中检测到目标相关图片（笔记、进度、截图、记录）时，自动调用 VLM 识别关键信息并记录到目标日记。适用于学习管理、健身追踪、工作进度、习惯养成、创作记录等所有目标管理场景。 |
| `interview-designer` | instruction | Analyze resumes and design interview strategies using evidence-based methodology. Transforms intervi... |
| `interview-prep` | instruction | 帮用户准备面试。基于目标 JD、公司、岗位方向，生成"高频面试题 + 参考回答 + 行为面 / 技术面 / Case 面分类题库"，并产出可打印的『面试备战手册』。当用户说"帮我准备面试""明天有面试... |
| `jd-resume-tailor` | instruction | 给定一份 JD 和一份现有简历，做"JD 拆解 + 简历定向改写"。拆 JD 抽出硬技能、软技能、加分项；对照简历做 gap 分析；产出针对该岗位重写后的简历，突出相关经验、补齐关键词缺口、并保留候选... |
| `job-intent-tracker` | instruction | 帮助用户梳理求职意向、生成目标岗位画像，并维护一份结构化的"岗位投递追踪表"。当用户说"我想换工作 / 不知道投什么岗 / 帮我看看我适合什么岗位 / 帮我管理投递进度 / 我投了好几家但记不住状态了... |
| `resume-builder` | instruction | 从零生成或全面优化一份中文简历，并导出 docx / pdf / markdown 多种格式。用 STAR 法则改写经历、做 ATS 关键词覆盖率检查、根据行业（互联网产品 / 技术 / 金融 / 通... |

### Creative (6 skills)

| Skill | Type | Description |
|-------|------|-------------|
| `dream-interpreter` | instruction | Use when the user needs help with dream interpreter related tasks. |
| `get-fortune-analysis` | instruction | 生成视觉华丽、内容详实、具有仪式感的流年运势报告（流金星象风格）。 |
| `gift-evaluator` | instruction | The PRIMARY tool for Spring Festival gift analysis and social interaction generation. Use this skill... |
| `mindfulness-meditation` | instruction | Build a meditation practice with guided sessions, streaks, and mindfulness reminders |
| `podcast-generate` | instruction | Generate podcast episodes from user-provided content or by searching the web for specified topics. I... |
| `storyboard-manager` | instruction | Assist writers with story planning, character development, plot structuring, chapter writing, timeli... |

### Design (8 skills)

| Skill | Type | Description |
|-------|------|-------------|
| `motion-system-playbook` | instruction | Use when the user needs help with motion system playbook related tasks. |
| `photography-ai` | instruction | AI-powered photography assistant covering 6 core categories - Composition, Lighting, Post-Processing... |
| `ui-ux-pro-max` | complex | UI/UX design intelligence and implementation guidance for building polished interfaces. Use when the... |
| `ui-ux-pro-max-v8-components` | complex | UI/UX Pro Max v8.0 — Components, Patterns & Validation. Use this file when the query is about React ... |
| `ui-ux-pro-max-v8-data` | complex | Data Lookup Engine for UI/UX PRO MAX v8.0. Provides programmatic access to style specifications, col... |
| `ui-ux-pro-max-v8-infra` | complex | UI/UX Pro Max v8.0 — Part A: Design & Style Infrastructure. Activate this skill when the query invol... |
| `visual-design-foundations` | instruction | Apply typography, color theory, spacing systems, and iconography principles to create cohesive visua... |
| `web-design-guidelines` | instruction | Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check acc... |

### Development (10 skills)

| Skill | Type | Description |
|-------|------|-------------|
| `coding-agent` | instruction | Coding workflow with planning, implementation, verification, and testing for clean software developm... |
| `composition-patterns` | instruction | React composition patterns that scale. Use when refactoring components with boolean prop proliferati... |
| `fullstack-dev` | instruction | Fullstack web development with Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Prisma ORM. Use wh... |
| `gsap-animations` | instruction | GSAP (GreenSock Animation Platform) skill for creating professional web animations. Covers all GSAP ... |
| `next-best-practices` | instruction | Next.js best practices - file conventions, RSC boundaries, data patterns, async APIs, metadata, erro... |
| `react-best-practices` | instruction | React and Next.js performance optimization guidelines from Vercel Engineering. This skill should be ... |
| `react-native-skills` | instruction | React Native and Expo best practices for building performant mobile apps. Use when building React Na... |
| `shadcn` | instruction | Manages shadcn components and projects — adding, searching, fixing, debugging, styling, and composin... |
| `simulation-sandbox` | instruction | Use when the user needs help with simulation sandbox related tasks. |
| `web-artifacts-builder` | instruction | Use when the user needs help with web artifacts builder related tasks. |

### Document (4 skills)

| Skill | Type | Description |
|-------|------|-------------|
| `docx` | complex | Comprehensive document creation, editing, and analysis with support for tracked changes, comments, f... |
| `pdf` | complex | Professional PDF toolkit with four production lines: (1) Report - structured documents via ReportLab... |
| `ppt` | complex | Presentation creation, editing, and analysis for .pptx files: (1) Creating new presentations, (2) Mo... |
| `xlsx` | complex | Use this skill any time a spreadsheet file is the primary input or output. This means any task where... |

### Education (3 skills)

| Skill | Type | Description |
|-------|------|-------------|
| `quiz-html` | instruction | 把题目数组生成一个**可独立运行的网页练习页**（HTML 文件）。当用户完成 quiz-mastery 的「从资料出题」或「从文件提取题目」流程后，应主动询问是否需要"在网页里练习"，确认后调用本 ... |
| `quiz-mastery` | instruction | 出题、测验、复习、掌握度追踪工具。**用户说"复习"、"巩固"、"回顾"任一关键词时优先触发本 skill**。当用户的请求与"题目/复习"相关时触发：把学习资料/PDF/材料转成题目练习（"给这个 ... |
| `study-buddy` | instruction | 智能督学助手，管理用户的长期学习项目工作流。当用户表达学习项目相关意图时触发：创建/制定学习计划（"我想学X"、"帮我制定计划"）、汇报学习进度（"学完了"、"今天搞定了"、"完成今日任务"）、查询计... |

### General (4 skills)

| Skill | Type | Description |
|-------|------|-------------|
| `asr` | instruction | Implement speech-to-text (ASR/automatic speech recognition) capabilities using the z-ai-web-dev-sdk.... |
| `llm` | instruction | Implement large language model (LLM) chat completions using the z-ai-web-dev-sdk. Use this skill whe... |
| `tts` | instruction | Implement text-to-speech (TTS) capabilities using the z-ai-web-dev-sdk. Use this skill when the user... |
| `vlm` | instruction | Implement vision-based AI chat capabilities using the z-ai-web-dev-sdk. Use this skill when the user... |

### Infrastructure (13 skills)

| Skill | Type | Description |
|-------|------|-------------|
| `api-gateway-skill` | instruction | Use when the user needs help with api gateway skill related tasks. |
| `combined-proxy-billing` | instruction | Use when the user needs help with combined proxy billing related tasks. |
| `deployment-manager` | instruction | Use when the user needs help with deployment manager related tasks. |
| `find-skills` | instruction | Helps users discover and install agent skills when they ask questions like "how do I do X", "find a ... |
| `mcp-builder` | instruction | Use when the user needs help with mcp builder related tasks. |
| `mcp-builder-billing` | instruction | Use when the user needs help with mcp builder billing related tasks. |
| `persistent-memory` | instruction | Use when the user needs help with persistent memory related tasks. |
| `skill-creator` | complex | Create new skills, modify and improve existing skills, and measure skill performance. Use when users... |
| `skill-finder-cn` | instruction | Skill 查找器 | Skill Finder. 帮助发现和安装 ClawHub Skills | Discover and install ClawHub Skills. 回答'有什么技能可以X'... |
| `skill-router` | instruction | Use when the user needs help with skill router related tasks. |
| `skill-scanner` | instruction | Scan agent skills for security issues. Use when asked to "scan a skill", "audit a skill", "review sk... |
| `skill-vetter` | instruction | Security-first skill vetting for AI agents. Use before installing any skill from ClawdHub, GitHub, o... |
| `supabase-postgres` | instruction | Postgres performance optimization and best practices from Supabase. Use this skill when writing, rev... |

### Research (6 skills)

| Skill | Type | Description |
|-------|------|-------------|
| `aminer-academic-search` | instruction | ACADEMIC PRIORITY: Activate whenever the user's query involves academic, scholarly, or research-rela... |
| `aminer-daily-paper` | instruction | Get personalized academic paper recommendations. Activate whenever the user asks for paper recommend... |
| `aminer-free-academic` | instruction | ACADEMIC PRIORITY: Activate this skill whenever the user's query involves any academic or research-r... |
| `deep-research` | instruction | Comprehensive multi-source research workflow that goes beyond simple web search. Uses parallel searc... |
| `multi-search-engine` | instruction | Multi search engine integration with 8 domestic (CN) search engines. Supports advanced search operat... |
| `qingyan-research` | instruction | Deep web research and HTML report generation. When GLM needs to conduct systematic information gathe... |

### Sdk-Api (7 skills)

| Skill | Type | Description |
|-------|------|-------------|
| `image-edit` | sdk-wrapper | Implement AI image editing and modification capabilities using the z-ai-web-dev-sdk. Use this skill ... |
| `image-generation` | sdk-wrapper | Implement AI image generation capabilities using the z-ai-web-dev-sdk. Use this skill when the user ... |
| `image-understand` | sdk-wrapper | Implement specialized image understanding capabilities using the z-ai-web-dev-sdk. Use this skill wh... |
| `video-generation` | sdk-wrapper | Implement AI-powered video generation capabilities using the z-ai-web-dev-sdk. Use this skill when t... |
| `video-understand` | sdk-wrapper | Implement specialized video understanding capabilities using the z-ai-web-dev-sdk. Use this skill wh... |
| `web-reader` | sdk-wrapper | Implement web page content extraction capabilities using the z-ai-web-dev-sdk. Use this skill when t... |
| `web-search` | sdk-wrapper | Implement web search capabilities using the z-ai-web-dev-sdk. Use this skill when the user needs to ... |

### Seo-Geo (1 skills)

| Skill | Type | Description |
|-------|------|-------------|
| `seo-geo` | instruction | SEO + GEO (Generative Engine Optimization) content strategy skill for optimizing content for both tr... |

### Specialized (4 skills)

| Skill | Type | Description |
|-------|------|-------------|
| `anti-pua` | instruction | 识别和分析PUA（Pickup Artist）及情感操纵行为的专业心理分析工具。具备人格分析、心理侧写、情感分析能力，能够识别情感操纵、煤气灯操纵、虐待等有毒关系模式，评估人格特质（如黑暗三人格、脆弱... |
| `superpowers` | instruction | Use when the user needs help with superpowers related tasks. |
| `task-review` | instruction | 当用户指令为高复杂度任务时触发，用于将刚完成的任务路径保存为可复用技能，生成相关的SKILL.md文档。 |
| `web-shader-extractor` | instruction | 从网页中提取 WebGL/Canvas/Shader 视觉特效代码，反混淆后移植为独立原生 JS 项目。 触发条件：用户提供网址并要求提取 shader、提取特效、提取动画效果、提取 canvas 效... |

### Thinking (5 skills)

| Skill | Type | Description |
|-------|------|-------------|
| `brainstorming` | instruction | You MUST use this before any creative work - creating features, building components, adding function... |
| `caveman` | instruction | Use when the user needs help with caveman related tasks. |
| `chain-of-thought` | instruction | Enables explicit step-by-step reasoning to solve complex problems. Use when the user needs structure... |
| `devils-advocate` | instruction | Use when the user needs help with devils advocate related tasks. |
| `socratic-method` | instruction | Guides the user to an answer through questioning rather than direct statements. Use when the user ne... |

### Visualization (1 skills)

| Skill | Type | Description |
|-------|------|-------------|
| `charts` | complex | Professional chart and diagram creation skill. Covers all types of visual data representation and st... |

### Writing (7 skills)

| Skill | Type | Description |
|-------|------|-------------|
| `cheat-sheet` | instruction | 将 PDF/Word/Markdown 学习资料转化为精炼的知识浓缩卡文档。支持三种风格（知识点速查卡/思维导图式/Q&A式），输出双栏小字 PDF。当用户说"生成知识浓缩卡"、"生成 Cheatsh... |
| `contentanalysis` | instruction | Content extraction and analysis — wisdom extraction from videos, podcasts, articles, and YouTube. US... |
| `context-compressor` | instruction | Use when the user needs help with context compressor related tasks. |
| `explained-code` | instruction | Use when the user needs help with explained code related tasks. |
| `humanizer` | instruction | Use when the user needs help with humanizer related tasks. |
| `output-formatter` | instruction | Use when the user needs help with output formatter related tasks. |
| `writing-plans` | instruction | Use when you have a spec or requirements for a multi-step task, before touching code |

## Standardization Process

The `standardize-skills.py` script applies the Vercel Agent Skills format to all skills:

1. **Frontmatter normalization**: Ensures every SKILL.md has proper YAML frontmatter
2. **Name normalization**: Converts skill names to lowercase-with-hyphens format
3. **Description routing**: Preserves original descriptions with routing info ("Use when...")
4. **Metadata enrichment**: Adds category, type, and version fields
5. **Registry generation**: Creates `skills.json` with complete inventory

### Skill Types

| Type | Description | Examples |
|------|-------------|---------|
| sdk-wrapper | Wraps z-ai-web-dev-sdk functionality | asr, llm, tts, vlm, web-search |
| complex | Multi-file skills with scripts/references | pdf, docx, ppt, xlsx, charts |
| instruction | Pure instruction skills (SKILL.md only) | brainstorming, deep-research |

### Categories

| Category | Count | Description |
|----------|-------|-------------|
| agent | 4 | Agent related skills |
| business | 10 | Business related skills |
| career | 6 | Career related skills |
| creative | 6 | Creative related skills |
| design | 8 | Design related skills |
| development | 10 | Development related skills |
| document | 4 | Document related skills |
| education | 3 | Education related skills |
| general | 4 | General related skills |
| infrastructure | 13 | Infrastructure related skills |
| research | 6 | Research related skills |
| sdk-api | 7 | Sdk-Api related skills |
| seo-geo | 1 | Seo-Geo related skills |
| specialized | 4 | Specialized related skills |
| thinking | 5 | Thinking related skills |
| visualization | 1 | Visualization related skills |
| writing | 7 | Writing related skills |

## Architecture

```
project-root/
├── skills.sh           # CLI entry point
├── standardize-skills.py  # Standardization script
├── skills.json          # Skills registry (auto-generated)
├── skills/              # 99 standardized skills
│   ├── asr/
│   │   └── SKILL.md     # Standardized frontmatter + instructions
│   ├── pdf/
│   │   ├── SKILL.md
│   │   ├── scripts/     # Python/Node helpers
│   │   ├── references/  # Detailed docs
│   │   └── ...
│   └── ...
├── skills-local/        # Custom/local skills
└── download/            # Generated reports and installers
```
