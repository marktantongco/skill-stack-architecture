// ─── Core Data Types ───
export interface Skill {
  id: string;
  name: string;
  tier: number;
  tierName: string;
  installCommand: string;
  primaryRole: string;
  isCustom: boolean;
  category: string;
  color: string;
  emoji: string;
  tags: string[];
}

export interface SkillCategory {
  name: string;
  color: string;
  emoji: string;
  skills: Skill[];
}

export interface DesignOption {
  id: string;
  name: string;
  tagline: string;
  dominantSkill: string;
  dominantSkillId: string;
  philosophy: string;
  skillWeights: Record<string, number>;
  sp7Vector: number[];
  sp7Weighted: number;
  colorFrom: string;
  colorTo: string;
  accentColor: string;
  motionStyle: string;
  colorStrategy: string;
  typography: string;
  mobileApproach: string;
  recommended: string;
}

export interface SP7Dimension {
  id: string;
  name: string;
  shortName: string;
  description: string;
}

export interface WeightProfile {
  name: string;
  weights: number[];
}

export interface IntentRoute {
  category: string;
  keywords: string[];
  targetSection: string;
  confidence: number;
  fallback: string;
}

// ─── Category Definitions ───
const CATEGORIES: Record<string, { color: string; emoji: string }> = {
  'Design & UI': { color: '#BFFF00', emoji: '🎨' },
  'Reasoning': { color: '#08F7FE', emoji: '🧠' },
  'Development': { color: '#00FF9D', emoji: '⚡' },
  'Content': { color: '#FF2E63', emoji: '✍️' },
  'Strategy': { color: '#FFE600', emoji: '🎯' },
  'System': { color: '#A8B2D8', emoji: '⚙️' },
  'Data & Web': { color: '#64FFDA', emoji: '🌐' },
  'Creative': { color: '#FF9FF3', emoji: '🎭' },
  'MCP Servers': { color: '#C77DFF', emoji: '🔌' },
  'Agent Modes': { color: '#FF6B35', emoji: '🦊' },
  'Utility': { color: '#A8B2D8', emoji: '🔧' },
};

// ─── Core + OpenCode Skills (61 total) ───
export const skills: Skill[] = [
  // ─── T0: Foundation (Third-Party) ─── Design & UI
  { id: 'S01', name: 'Stitch Design', tier: 0, tierName: 'Foundation', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill stitch-design', primaryRole: 'Autonomous iterative website generation with baton-passing design loop', isCustom: false, category: 'Design & UI', color: '#BFFF00', emoji: '🎨', tags: ['design-ui', 'generation', 'iterative', 'autonomous'] },
  { id: 'S02', name: 'Framer Motion Animator', tier: 0, tierName: 'Foundation', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill framer-motion-animator', primaryRole: 'Production-ready React animations, micro-interactions, spring physics', isCustom: false, category: 'Design & UI', color: '#BFFF00', emoji: '🎨', tags: ['design-ui', 'animation', 'motion', 'react', 'spring-physics'] },
  { id: 'S03', name: 'UI/UX Pro Max v7', tier: 0, tierName: 'Foundation', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill ui-ux-pro-max-v7', primaryRole: 'AI design intelligence — 60 styles, 48 palettes, 36 fonts, 24 industry rules, production-grade components', isCustom: false, category: 'Design & UI', color: '#BFFF00', emoji: '🎨', tags: ['design-ui', 'styles', 'palettes', 'fonts', 'components'] },
  { id: 'S04', name: '21st.dev Registry', tier: 0, tierName: 'Foundation', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill 21st-dev-registry', primaryRole: 'Community React component registry with shadcn CLI', isCustom: false, category: 'Design & UI', color: '#BFFF00', emoji: '🎨', tags: ['design-ui', 'components', 'registry', 'shadcn'] },

  // ─── T1: Interactive (Third-Party) ─── Design & UI
  { id: 'S05', name: 'GSAP Animations', tier: 1, tierName: 'Interactive', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill gsap-animations', primaryRole: 'Production-grade GSAP animation patterns — 24 patterns, ScrollTrigger, Flip plugin, React integration', isCustom: false, category: 'Design & UI', color: '#BFFF00', emoji: '🎨', tags: ['design-ui', 'gsap', 'scrolltrigger', 'animation', 'flip'] },
  { id: 'S06', name: 'Remotion Skills', tier: 1, tierName: 'Interactive', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill remotion', primaryRole: 'Programmatic infographic-motion video generation', isCustom: false, category: 'Design & UI', color: '#BFFF00', emoji: '🎨', tags: ['design-ui', 'video', 'infographic', 'motion'] },
  { id: 'S07', name: 'Mermaid Diagrams', tier: 1, tierName: 'Interactive', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill mermaid-diagrams', primaryRole: 'Text-based schematic diagram rendering', isCustom: false, category: 'Design & UI', color: '#BFFF00', emoji: '🎨', tags: ['design-ui', 'diagrams', 'flowchart', 'schematic'] },
  { id: 'S08', name: 'AntV Chart Viz', tier: 1, tierName: 'Interactive', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill antv-chart-viz', primaryRole: '26+ interactive chart types, radar, heatmap, treemap', isCustom: false, category: 'Design & UI', color: '#BFFF00', emoji: '🎨', tags: ['design-ui', 'charts', 'visualization', 'data'] },

  // ─── T2: Visual Asset (Third-Party) ─── Design & UI / Creative
  { id: 'S09', name: 'AI Image Gen', tier: 2, tierName: 'Visual Asset', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill ai-image-generation', primaryRole: '50+ AI models for hero images, mockups, visual assets', isCustom: false, category: 'Creative', color: '#FF9FF3', emoji: '🎭', tags: ['creative', 'image-gen', 'ai', 'visual', 'mockup'] },
  { id: 'S10', name: 'shadcn/ui Skill', tier: 2, tierName: 'Visual Asset', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill shadcn-ui', primaryRole: 'Interactive table, data table, component scaffolding', isCustom: false, category: 'Design & UI', color: '#BFFF00', emoji: '🎨', tags: ['design-ui', 'shadcn', 'components', 'table'] },
  { id: 'S11', name: 'Playwright Visual', tier: 2, tierName: 'Visual Asset', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill playwright-visual', primaryRole: 'Screenshot capture, visual regression, cross-browser testing', isCustom: false, category: 'Development', color: '#00FF9D', emoji: '⚡', tags: ['development', 'testing', 'visual-regression', 'playwright'] },
  { id: 'S12', name: 'Chart Visualization', tier: 2, tierName: 'Visual Asset', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill chart-visualization', primaryRole: 'Custom interactive visualizations, radar charts, heatmaps, force graphs', isCustom: false, category: 'Design & UI', color: '#BFFF00', emoji: '🎨', tags: ['design-ui', 'charts', 'd3', 'visualization'] },

  // ─── T3: Portal (Custom) ─── Strategy
  { id: 'S13', name: 'AI Portal Redirect', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/skill-stack-architecture --skill ai-portal-redirect', primaryRole: 'AI agent intent classification, skill routing, guided navigation', isCustom: true, category: 'Strategy', color: '#FFE600', emoji: '🎯', tags: ['strategy', 'routing', 'intent', 'navigation'] },
  { id: 'S14', name: 'Stack Prioritizer', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/skill-stack-architecture --skill stack-prioritizer', primaryRole: '7-dimension scoring algorithm, dependency resolver', isCustom: true, category: 'Strategy', color: '#FFE600', emoji: '🎯', tags: ['strategy', 'scoring', 'prioritization', 'dependency'] },
  { id: 'S15', name: 'Matrix Engine', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/skill-stack-architecture --skill matrix-engine', primaryRole: 'Comparative matrix rendering, interactive filters, radar viz', isCustom: true, category: 'Strategy', color: '#FFE600', emoji: '🎯', tags: ['strategy', 'matrix', 'comparison', 'radar'] },
  { id: 'S16', name: 'Design Algorithm', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/skill-stack-architecture --skill design-algorithm', primaryRole: 'Stack prioritization computation, result visualization, decision tree', isCustom: true, category: 'Strategy', color: '#FFE600', emoji: '🎯', tags: ['strategy', 'algorithm', 'visualization', 'decision-tree'] },

  // ─── OpenCode-Accomplishments Skills: Design & UI ───
  { id: 'S17', name: 'Anthropic Frontend Design', tier: 0, tierName: 'Foundation', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill anthropic-frontend-design', primaryRole: 'Bold aesthetics for AI-native interfaces, conversational UI, trust-forward design', isCustom: false, category: 'Design & UI', color: '#BFFF00', emoji: '🎨', tags: ['design-ui', 'ai-native', 'conversational', 'trust'] },
  { id: 'S18', name: 'Frontend Design', tier: 0, tierName: 'Foundation', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill frontend-design', primaryRole: 'shadcn/ui + Tailwind + React component generation for production-ready UI', isCustom: false, category: 'Design & UI', color: '#BFFF00', emoji: '🎨', tags: ['design-ui', 'shadcn', 'tailwind', 'react'] },
  { id: 'S19', name: 'Vercel Web Design Guidelines', tier: 0, tierName: 'Foundation', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill vercel-web-design-guidelines', primaryRole: 'Comprehensive accessibility-first UX rules and performance budgets', isCustom: false, category: 'Design & UI', color: '#BFFF00', emoji: '🎨', tags: ['design-ui', 'accessibility', 'ux', 'performance'] },

  // ─── OpenCode-Accomplishments Skills: Reasoning ───
  { id: 'S20', name: 'Chain of Thought', tier: 1, tierName: 'Interactive', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill chain-of-thought', primaryRole: 'Step-by-step reasoning framework for complex problems', isCustom: false, category: 'Reasoning', color: '#08F7FE', emoji: '🧠', tags: ['reasoning', 'logic', 'step-by-step', 'analysis'] },
  { id: 'S21', name: 'Socratic Method', tier: 1, tierName: 'Interactive', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill socratic-method', primaryRole: 'Strategic questioning to uncover assumptions and guide discovery', isCustom: false, category: 'Reasoning', color: '#08F7FE', emoji: '🧠', tags: ['reasoning', 'questioning', 'assumptions', 'discovery'] },
  { id: 'S22', name: 'Devils Advocate', tier: 1, tierName: 'Interactive', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill devils-advocate', primaryRole: 'Argue against premises to strengthen arguments and prevent confirmation bias', isCustom: false, category: 'Reasoning', color: '#08F7FE', emoji: '🧠', tags: ['reasoning', 'debate', 'bias', 'arguments'] },
  { id: 'S23', name: 'Simulation Sandbox', tier: 1, tierName: 'Interactive', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill simulation-sandbox', primaryRole: 'Test scenarios in safe simulated environments without real-world consequences', isCustom: false, category: 'Reasoning', color: '#08F7FE', emoji: '🧠', tags: ['reasoning', 'simulation', 'testing', 'scenarios'] },

  // ─── OpenCode-Accomplishments Skills: Development ───
  { id: 'S24', name: 'MCP Builder', tier: 1, tierName: 'Interactive', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill mcp-builder', primaryRole: 'Build MCP servers with TypeScript + Python, full lifecycle planning', isCustom: false, category: 'Development', color: '#00FF9D', emoji: '⚡', tags: ['development', 'mcp', 'typescript', 'python'] },
  { id: 'S25', name: 'Superpowers', tier: 1, tierName: 'Interactive', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill superpowers', primaryRole: 'Spec-first development with TDD and sub-agent delegation', isCustom: false, category: 'Development', color: '#00FF9D', emoji: '⚡', tags: ['development', 'tdd', 'spec-first', 'sub-agent'] },
  { id: 'S26', name: 'Deployment Manager', tier: 1, tierName: 'Interactive', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill deployment-manager', primaryRole: 'Deploy, monitor, update across GitHub Pages, Vercel, Netlify', isCustom: false, category: 'Development', color: '#00FF9D', emoji: '⚡', tags: ['development', 'deployment', 'vercel', 'netlify'] },
  { id: 'S27', name: 'Browser Use', tier: 1, tierName: 'Interactive', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill browser-use', primaryRole: 'Headful browser automation with natural language control', isCustom: false, category: 'Development', color: '#00FF9D', emoji: '⚡', tags: ['development', 'browser', 'automation', 'nlp'] },
  { id: 'S28', name: 'Web Artifacts Builder', tier: 2, tierName: 'Visual Asset', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill web-artifacts-builder', primaryRole: 'Single-file HTML artifacts with React + Tailwind, zero dependencies', isCustom: false, category: 'Development', color: '#00FF9D', emoji: '⚡', tags: ['development', 'artifacts', 'html', 'zero-deps'] },
  { id: 'S29', name: 'Vercel React Best Practices', tier: 1, tierName: 'Interactive', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill vercel-react-best-practices', primaryRole: 'Production-grade React architecture, hooks patterns, SSR/SSG strategies', isCustom: false, category: 'Development', color: '#00FF9D', emoji: '⚡', tags: ['development', 'react', 'ssr', 'architecture'] },
  { id: 'S30', name: 'Explained Code', tier: 1, tierName: 'Interactive', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill explained-code', primaryRole: 'Beginner-friendly code explanation with analogies and diagrams', isCustom: false, category: 'Development', color: '#00FF9D', emoji: '⚡', tags: ['development', 'education', 'explanation', 'diagrams'] },

  // ─── OpenCode-Accomplishments Skills: Content ───
  { id: 'S31', name: 'SEO Content Writer', tier: 2, tierName: 'Visual Asset', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill seo-content-writer', primaryRole: 'SEO-optimized content creation with GEO optimization for AI answer engines', isCustom: false, category: 'Content', color: '#FF2E63', emoji: '✍️', tags: ['content', 'seo', 'geo', 'writing'] },
  { id: 'S32', name: 'Humanizer', tier: 2, tierName: 'Visual Asset', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill humanizer', primaryRole: 'Strip AI writing patterns for human-like copy — anti-AI-detection rewriting', isCustom: false, category: 'Content', color: '#FF2E63', emoji: '✍️', tags: ['content', 'humanizer', 'anti-detection', 'rewriting'] },
  { id: 'S33', name: 'Social Media Manager', tier: 2, tierName: 'Visual Asset', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill social-media-manager', primaryRole: 'Platform-appropriate post generation for 30 days across LinkedIn, Twitter, Instagram, TikTok', isCustom: false, category: 'Content', color: '#FF2E63', emoji: '✍️', tags: ['content', 'social-media', 'post-generation', 'multi-platform'] },
  { id: 'S34', name: 'Social Content Pillars', tier: 2, tierName: 'Visual Asset', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill social-content-pillars', primaryRole: 'Monthly content calendar for multi-brand social media with 90-day editorial plan', isCustom: false, category: 'Content', color: '#FF2E63', emoji: '✍️', tags: ['content', 'calendar', 'editorial', 'multi-brand'] },

  // ─── OpenCode-Accomplishments Skills: Strategy ───
  { id: 'S35', name: 'JTBD Research', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill jtbd-research', primaryRole: '8-step Jobs to be Done product research methodology', isCustom: false, category: 'Strategy', color: '#FFE600', emoji: '🎯', tags: ['strategy', 'jtbd', 'research', 'product'] },
  { id: 'S36', name: 'Gumroad Pipeline', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill gumroad-pipeline', primaryRole: 'Lead magnet to funnel to product launch workflow for digital products', isCustom: false, category: 'Strategy', color: '#FFE600', emoji: '🎯', tags: ['strategy', 'gumroad', 'funnel', 'product-launch'] },
  { id: 'S37', name: 'Feature Research', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill feature-research', primaryRole: 'Research existing architecture before implementing a complex feature', isCustom: false, category: 'Strategy', color: '#FFE600', emoji: '🎯', tags: ['strategy', 'feature', 'research', 'architecture'] },
  { id: 'S38', name: 'Skill Finder', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill skill-finder', primaryRole: 'Skill discovery, evaluation, and installation meta-skill with security vetting', isCustom: false, category: 'Strategy', color: '#FFE600', emoji: '🎯', tags: ['strategy', 'skill-finder', 'evaluation', 'security'] },

  // ─── OpenCode-Accomplishments Skills: System ───
  { id: 'S39', name: 'Persistent Memory', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill persistent-memory', primaryRole: 'Structured memory system for agent context continuity', isCustom: false, category: 'System', color: '#A8B2D8', emoji: '⚙️', tags: ['system', 'memory', 'context', 'continuity'] },
  { id: 'S40', name: 'System Prompt Sync', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill system-prompt-sync', primaryRole: 'Auto-sync AGENTS.md across all git repos on version tags', isCustom: false, category: 'System', color: '#A8B2D8', emoji: '⚙️', tags: ['system', 'sync', 'agents', 'git'] },
  { id: 'S41', name: 'Feedback Loop', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill feedback-loop', primaryRole: 'Iterative improvement cycles from metrics to research', isCustom: false, category: 'System', color: '#A8B2D8', emoji: '⚙️', tags: ['system', 'feedback', 'metrics', 'improvement'] },
  { id: 'S42', name: 'Context Compressor', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill context-compressor', primaryRole: 'Compress long contexts preserving critical information', isCustom: false, category: 'System', color: '#A8B2D8', emoji: '⚙️', tags: ['system', 'compression', 'context', 'efficiency'] },
  { id: 'S43', name: 'Agent Roles', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill agent-roles', primaryRole: 'Unified multi-agent role system — Builder, Coder, Council, Orchestrator, Plan, Researcher, Reviewer, Scribe', isCustom: false, category: 'System', color: '#A8B2D8', emoji: '⚙️', tags: ['system', 'agents', 'roles', 'orchestration'] },

  // ─── OpenCode-Accomplishments Skills: Data & Web ───
  { id: 'S44', name: 'Web Reader', tier: 2, tierName: 'Visual Asset', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill web-reader', primaryRole: 'Web page extraction with site crawling and spidering capabilities', isCustom: false, category: 'Data & Web', color: '#64FFDA', emoji: '🌐', tags: ['data-web', 'scraping', 'crawling', 'extraction'] },
  { id: 'S45', name: 'Audit Analyzer', tier: 2, tierName: 'Visual Asset', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill audit-analyzer', primaryRole: 'Detect and prioritize audit issues — performance, accessibility, monitoring', isCustom: false, category: 'Data & Web', color: '#64FFDA', emoji: '🌐', tags: ['data-web', 'audit', 'performance', 'accessibility'] },
  { id: 'S46', name: 'Web Design Guidelines', tier: 2, tierName: 'Visual Asset', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill web-design-guidelines', primaryRole: 'Quick self-audit checklist for design consistency — typography, color, spacing, accessibility', isCustom: false, category: 'Data & Web', color: '#64FFDA', emoji: '🌐', tags: ['data-web', 'design', 'guidelines', 'audit'] },
  { id: 'S47', name: 'Code Research', tier: 2, tierName: 'Visual Asset', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill code-research', primaryRole: 'Research open-source repositories to understand how something is built', isCustom: false, category: 'Data & Web', color: '#64FFDA', emoji: '🌐', tags: ['data-web', 'research', 'open-source', 'codebase'] },
  { id: 'S48', name: 'Explore', tier: 2, tierName: 'Visual Asset', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill explore', primaryRole: 'Search a codebase using codebase_search tool — saves time and tokens over grep', isCustom: false, category: 'Data & Web', color: '#64FFDA', emoji: '🌐', tags: ['data-web', 'search', 'codebase', 'efficiency'] },

  // ─── OpenCode-Accomplishments Skills: Creative ───
  { id: 'S49', name: 'Photography AI', tier: 2, tierName: 'Visual Asset', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill photography-ai', primaryRole: 'Professional visual engineering framework with batch processing, prompt engineering, cinematic sequences', isCustom: false, category: 'Creative', color: '#FF9FF3', emoji: '🎭', tags: ['creative', 'photography', 'visual', 'prompt-engineering'] },
  { id: 'S50', name: 'Output Formatter', tier: 2, tierName: 'Visual Asset', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill output-formatter', primaryRole: 'Strict formatting rules for all output types — JSON, tables, markdown', isCustom: false, category: 'Creative', color: '#FF9FF3', emoji: '🎭', tags: ['creative', 'formatting', 'json', 'markdown'] },

  // ─── OpenCode-Accomplishments Skills: MCP Servers ───
  { id: 'S51', name: 'MCP Stack Curator', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill mcp-stack-curator', primaryRole: 'Intelligent MCP server stack builder — recommends optimal 4-server combinations with synergy analysis', isCustom: false, category: 'MCP Servers', color: '#C77DFF', emoji: '🔌', tags: ['mcp-servers', 'curation', 'stack', 'synergy'] },
  { id: 'S52', name: 'MCP Registry', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill mcp-registry', primaryRole: 'Curated directory of 78+ free MCP servers across 14 categories with deduplication and ratings', isCustom: false, category: 'MCP Servers', color: '#C77DFF', emoji: '🔌', tags: ['mcp-servers', 'registry', 'directory', 'ratings'] },
  { id: 'S53', name: 'MCP Security Scanner', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill mcp-security-scanner', primaryRole: 'Security-first vetting for MCP server installations — red flag detection, permission auditing, scope analysis', isCustom: false, category: 'MCP Servers', color: '#C77DFF', emoji: '🔌', tags: ['mcp-servers', 'security', 'vetting', 'audit'] },

  // ─── OpenCode-Accomplishments Skills: Agent Modes ───
  { id: 'S54', name: 'Rabbit — Multiply Ideas', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill rabbit-multiply-ideas', primaryRole: 'Rapid ideation — take an idea and multiply it into 10 different variations with different angles, audiences, and formats', isCustom: false, category: 'Agent Modes', color: '#FF6B35', emoji: '🐇', tags: ['agent-modes', 'ideation', 'brainstorming', 'divergent'] },
  { id: 'S55', name: 'Owl — Deep Analysis', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill owl-deep-analysis', primaryRole: 'Systematic decomposition — examine problems from multiple perspectives and identify hidden factors', isCustom: false, category: 'Agent Modes', color: '#FF6B35', emoji: '🦉', tags: ['agent-modes', 'analysis', 'decomposition', 'convergent'] },
  { id: 'S56', name: 'Ant — Break Into Steps', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill ant-break-into-steps', primaryRole: 'Task decomposition — break goals into the smallest possible steps someone could realistically complete', isCustom: false, category: 'Agent Modes', color: '#FF6B35', emoji: '🐜', tags: ['agent-modes', 'decomposition', 'steps', 'incremental'] },
  { id: 'S57', name: 'Eagle — Big Picture', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill eagle-big-picture', primaryRole: 'Strategic vision — see the long-term strategy and explain how all the pieces connect from a birds-eye view', isCustom: false, category: 'Agent Modes', color: '#FF6B35', emoji: '🦅', tags: ['agent-modes', 'strategy', 'vision', 'cross-domain'] },
  { id: 'S58', name: 'Dolphin — Creative Solutions', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill dolphin-creative-solutions', primaryRole: 'Lateral thinking — generate curious, playful, and inventive solutions that most people would not normally consider', isCustom: false, category: 'Agent Modes', color: '#FF6B35', emoji: '🐬', tags: ['agent-modes', 'creative', 'lateral', 'inventive'] },
  { id: 'S59', name: 'Beaver — Build Systems', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill beaver-build-systems', primaryRole: 'Systems design — design practical systems that solve problems step by step, like a beaver building a dam', isCustom: false, category: 'Agent Modes', color: '#FF6B35', emoji: '🦫', tags: ['agent-modes', 'systems', 'architecture', 'builder'] },
  { id: 'S60', name: 'Elephant — Cross-Field', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill elephant-cross-field', primaryRole: 'Interdisciplinary bridging — connect ideas to insights from other fields such as psychology, economics, science, or history', isCustom: false, category: 'Agent Modes', color: '#FF6B35', emoji: '🐘', tags: ['agent-modes', 'interdisciplinary', 'synthesis', 'bridging'] },

  // ─── OpenCode-Accomplishments Skills: Utility ───
  { id: 'S61', name: 'Sample Hello Skill', tier: 0, tierName: 'Foundation', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill sample-hello-skill', primaryRole: 'Hello-world demo skill for testing skill activation and validation', isCustom: false, category: 'Utility', color: '#A8B2D8', emoji: '🔧', tags: ['utility', 'demo', 'testing', 'validation'] },

  // ─── New Skills (S62-S64) ───
  { id: 'S62', name: 'PictoFlux AI', tier: 2, tierName: 'Visual Asset', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill pictoflux-ai', primaryRole: 'Free unlimited AI image generation via MCP protocol — text-to-image, style transfer, batch generation', isCustom: false, category: 'MCP Servers', color: '#C77DFF', emoji: '🖼️', tags: ['mcp-servers', 'image-gen', 'ai', 'visual', 'style-transfer'] },
  { id: 'S63', name: 'Stitch Loop', tier: 1, tierName: 'Interactive', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill stitch-loop', primaryRole: 'Autonomous iterative site-building loop — baton-passing system for continuous Stitch-powered web development', isCustom: false, category: 'Design & UI', color: '#BFFF00', emoji: '🔄', tags: ['design-ui', 'generation', 'iterative', 'autonomous', 'loop'] },
  { id: 'S64', name: 'Skill Architect', tier: 3, tierName: 'Portal', installCommand: 'npx skills add marktantongco/opencode-accomplishments --skill skill-architect', primaryRole: 'Create, design, refactor, and optimize AI agent skills following the Agent Skills open standard', isCustom: false, category: 'Development', color: '#00FF9D', emoji: '🏗️', tags: ['development', 'skill-creation', 'design', 'optimization', 'standard'] },
];

// ─── Skill Categories (grouped from skills array) ───
export const skillCategories: SkillCategory[] = Object.values(CATEGORIES).map(cat => cat).length > 0
  ? Object.entries(CATEGORIES).map(([name, { color, emoji }]) => ({
      name,
      color,
      emoji,
      skills: skills.filter(s => s.category === name),
    })).filter(c => c.skills.length > 0)
  : [];

// ─── 5 Design Options ───
export const options: DesignOption[] = [
  {
    id: 'opt1',
    name: 'The Autopoietic Canvas',
    tagline: 'Self-Evolving Design System',
    dominantSkill: 'Stitch Design',
    dominantSkillId: 'S01',
    philosophy: 'A self-evolving design where each iteration reads the current state, identifies gaps, and autonomously generates the next version. The interface builds and refines itself through iterative generation cycles inspired by biological autopoiesis.',
    skillWeights: { S01: 40, S03: 30, S02: 15, S04: 15 },
    sp7Vector: [5, 4, 3, 5, 2, 3, 3],
    sp7Weighted: 27.0,
    colorFrom: '#667eea',
    colorTo: '#764ba2',
    accentColor: '#667eea',
    motionStyle: 'Organic, spring-based — progressive refinement animations',
    colorStrategy: 'Evolutionary palette — adjusts across iterations based on UX audit',
    typography: 'Adaptive scale — Inter/Satoshi with wide weight range',
    mobileApproach: 'Touch-first loop — single-column base expanding outward',
    recommended: 'Products with rapidly evolving content, design systems that must scale without manual maintenance',
  },
  {
    id: 'opt2',
    name: 'Kinetic Spatial',
    tagline: 'Motion-First Design Language',
    dominantSkill: 'Framer Motion Animator',
    dominantSkillId: 'S02',
    philosophy: 'Motion IS the design language. Every spatial relationship and information hierarchy is expressed through choreographed motion. The design begins with a Motion Brief, not a visual brief.',
    skillWeights: { S02: 40, S03: 25, S01: 20, S04: 15 },
    sp7Vector: [5, 5, 3, 5, 2, 3, 3],
    sp7Weighted: 28.5,
    colorFrom: '#f093fb',
    colorTo: '#f5576c',
    accentColor: '#f5576c',
    motionStyle: 'Choreographed multi-tier — Macro (400-600ms), Meso (200-350ms), Micro (80-150ms)',
    colorStrategy: 'Motion-legible palette — sufficient contrast during animated transitions',
    typography: 'Variable weight animated — weight shifts for emphasis',
    mobileApproach: 'Gesture-driven — swipe, long-press, pull-to-refresh with elastic physics',
    recommended: 'Products where interaction quality is a core differentiator, immersive storytelling',
  },
  {
    id: 'opt3',
    name: 'Chromatic Minimal',
    tagline: 'Precision Through Restraint',
    dominantSkill: 'UI/UX Pro Max',
    dominantSkillId: 'S03',
    philosophy: 'Ultra-modern sophistication through radical restraint. Every element exists for a reason. Two-color system, restricted typography, minimal animations — the absence of decoration is the design statement.',
    skillWeights: { S03: 40, S01: 25, S02: 20, S04: 15 },
    sp7Vector: [3, 3, 2, 2, 4, 3, 4],
    sp7Weighted: 17.7,
    colorFrom: '#2d3436',
    colorTo: '#636e72',
    accentColor: '#dfe6e9',
    motionStyle: 'Precision — 3 animation types max per page, cubic-bezier only, fixed durations',
    colorStrategy: 'Two-color system — 95% neutral, 5% accent on interactive elements only',
    typography: 'Single variable font — Light/Regular/Semibold only, strict 1.25 scale ratio',
    mobileApproach: 'Performance minimalism — fewer elements = faster rendering, generous touch targets',
    recommended: 'Luxury brands, professional services, editorial platforms, content-heavy apps',
  },
  {
    id: 'opt4',
    name: 'Glass Depth',
    tagline: 'Architectural Layered Surfaces',
    dominantSkill: '21st.dev Registry',
    dominantSkillId: 'S04',
    philosophy: 'The interface as a 3D space of translucent, layered surfaces. Frosted glass panels float at different depths, creating spatial hierarchy. Elements closer appear sharper and more interactive.',
    skillWeights: { S04: 35, S03: 25, S02: 25, S01: 15 },
    sp7Vector: [5, 4, 3, 5, 2, 3, 3],
    sp7Weighted: 27.0,
    colorFrom: '#0F2027',
    colorTo: '#2C5364',
    accentColor: '#667eea',
    motionStyle: 'Parallax & 3D transforms — depth-driven motion with tilt response',
    colorStrategy: 'Depth-gradient palette — 5 layers from deep blur to sharp foreground',
    typography: 'Depth-aware sizing — larger at surface, smaller at depth layers',
    mobileApproach: 'Reduced depth (2-3 layers), tilt parallax via accelerometer, gradient-over-blur fallback',
    recommended: 'Creative agencies, music/entertainment, fintech dashboards, premium visual impact',
  },
  {
    id: 'opt5',
    name: 'Neo-Industrial',
    tagline: 'Raw Structural Power',
    dominantSkill: 'UI/UX Pro Max + Framer Motion',
    dominantSkillId: 'S03+S02',
    philosophy: 'Bold, unapologetic design from brutalist architecture and industrial aesthetics. Visible grids, stark contrasts, heavy typography, mechanical interactions. Confidence through raw visual authority.',
    skillWeights: { S03: 35, S02: 30, S04: 20, S01: 15 },
    sp7Vector: [4, 4, 3, 4, 3, 3, 3],
    sp7Weighted: 23.5,
    colorFrom: '#0A0A0A',
    colorTo: '#1A1A1A',
    accentColor: '#FFD600',
    motionStyle: 'Mechanical — steps() timing, snap transitions, typewriter reveals',
    colorStrategy: 'Safety-color accent — near-black/off-white with single bold yellow/orange/red',
    typography: 'Monospace family — JetBrains Mono/IBM Plex Mono, extreme 3:1+ size contrasts',
    mobileApproach: 'Snap-lock scroll, press-and-release (200ms hold), visible grid indicators',
    recommended: 'Developer tools, cybersecurity, creative studios projecting technical authority',
  },
];

// ─── SP-7 Dimensions ───
export const dimensions: SP7Dimension[] = [
  { id: 'VD', name: 'Visual Density', shortName: 'VD', description: 'How much visual information the section must convey' },
  { id: 'IR', name: 'Interactivity Requirement', shortName: 'IR', description: 'Degree of active user engagement beyond passive scrolling' },
  { id: 'DC', name: 'Data Complexity', shortName: 'DC', description: 'Structural complexity of data the section must display' },
  { id: 'MN', name: 'Motion Need', shortName: 'MN', description: 'Degree to which animation benefits the section' },
  { id: 'AW', name: 'Accessibility Weight', shortName: 'AW', description: 'Importance of WCAG compliance and inclusive design' },
  { id: 'AR', name: 'AI Redirect Value', shortName: 'AR', description: 'How likely an AI agent is to redirect here for guidance' },
  { id: 'CR', name: 'Component Reusability', shortName: 'CR', description: 'How likely components are to be reused across projects' },
];

// ─── Weight Profiles ───
export const weightProfiles: WeightProfile[] = [
  { name: 'Visual', weights: [0.25, 0.20, 0.15, 0.20, 0.05, 0.05, 0.10] },
  { name: 'Reference', weights: [0.10, 0.10, 0.20, 0.05, 0.15, 0.30, 0.10] },
  { name: 'Comparison', weights: [0.15, 0.25, 0.25, 0.10, 0.05, 0.10, 0.10] },
  { name: 'Portal', weights: [0.10, 0.15, 0.10, 0.05, 0.20, 0.30, 0.10] },
];

// ─── Intent Routes ───
export const intentRoutes: IntentRoute[] = [
  { category: 'Skill Installation', keywords: ['install', 'add skill', 'npx', 'setup', 'configure'], targetSection: 'skill-reference', confidence: 0.8, fallback: 'implementation' },
  { category: 'Design Philosophy', keywords: ['philosophy', 'approach', 'aesthetic', 'style', 'visual'], targetSection: 'options', confidence: 0.7, fallback: 'comparative' },
  { category: 'Algorithm Logic', keywords: ['algorithm', 'scoring', 'prioritization', 'SP-7', 'dimension'], targetSection: 'algorithm', confidence: 0.9, fallback: 'skill-reference' },
  { category: 'Comparison', keywords: ['compare', 'versus', 'difference', 'matrix', 'which option'], targetSection: 'comparative', confidence: 0.85, fallback: 'skill-reference' },
  { category: 'Build Instructions', keywords: ['build', 'implement', 'deploy', 'sequence', 'QA'], targetSection: 'implementation', confidence: 0.8, fallback: 'skill-reference' },
  { category: 'Motion/Animation', keywords: ['animation', 'motion', 'scroll', 'parallax', 'spring'], targetSection: 'options', confidence: 0.8, fallback: 'algorithm' },
  { category: 'Minimalist Design', keywords: ['minimal', 'clean', 'restraint', 'Swiss', 'luxury'], targetSection: 'options', confidence: 0.8, fallback: 'comparative' },
  { category: 'Glassmorphism', keywords: ['glass', 'depth', 'blur', 'translucent', 'frosted'], targetSection: 'options', confidence: 0.8, fallback: 'comparative' },
  { category: 'Industrial/Brutalist', keywords: ['industrial', 'brutalist', 'monospace', 'mechanical'], targetSection: 'options', confidence: 0.8, fallback: 'comparative' },
  { category: 'Iterative Design', keywords: ['iterate', 'loop', 'evolve', 'generation', 'baton'], targetSection: 'options', confidence: 0.8, fallback: 'algorithm' },
];

// ─── Comparison matrix data ───
export const comparisonMatrix = [
  { dimension: 'Core Principle', opt1: 'Self-evolving design', opt2: 'Motion as language', opt3: 'Precision restraint', opt4: 'Architectural depth', opt5: 'Raw structural power' },
  { dimension: 'Dominant Skill', opt1: 'Stitch Design', opt2: 'Framer Motion', opt3: 'UI/UX Pro Max', opt4: '21st.dev Registry', opt5: 'UI/UX Pro Max + FM' },
  { dimension: 'Motion Style', opt1: 'Organic, spring-based', opt2: 'Choreographed, multi-tier', opt3: 'Minimal, precise', opt4: 'Parallax, 3D transforms', opt5: 'Mechanical, stepped' },
  { dimension: 'Color Strategy', opt1: 'Evolutionary palette', opt2: 'Motion-legible palette', opt3: 'Two-color system', opt4: 'Depth-gradient palette', opt5: 'Safety-color accent' },
  { dimension: 'Typography', opt1: 'Adaptive scale', opt2: 'Variable weight animated', opt3: 'Single family, 3 weights', opt4: 'Depth-aware sizing', opt5: 'Monospace, extreme scale' },
  { dimension: 'Mobile Approach', opt1: 'Touch-first loop', opt2: 'Gesture-driven motion', opt3: 'Performance minimalism', opt4: 'Reduced depth layers', opt5: 'Snap-lock interaction' },
  { dimension: 'Complexity', opt1: 'High (systemic)', opt2: 'High (choreographic)', opt3: 'Low (constraint-driven)', opt4: 'High (spatial)', opt5: 'Medium (spec-driven)' },
  { dimension: 'Emotional Tone', opt1: 'Alive, adaptive', opt2: 'Fluid, responsive', opt3: 'Refined, confident', opt4: 'Immersive, premium', opt5: 'Powerful, direct' },
];

// ─── Skill utilization heatmap ───
export const heatmapData = [
  { skill: 'S01 Stitch Design', values: [0,0,1,0,5,1,0,1,0,0,1,0] },
  { skill: 'S02 Framer Motion', values: [3,2,0,0,3,5,3,3,5,0,0,0] },
  { skill: 'S03 UI/UX Pro Max', values: [3,3,2,1,2,2,5,2,3,1,1,1] },
  { skill: 'S04 21st.dev Reg', values: [0,0,1,0,1,1,1,3,0,0,1,0] },
  { skill: 'S05 GSAP Skills', values: [5,2,0,0,3,3,0,5,3,0,0,0] },
  { skill: 'S06 Remotion', values: [0,3,0,0,3,3,0,3,0,0,0,0] },
  { skill: 'S07 Mermaid', values: [0,2,3,5,1,0,0,0,3,1,3,3] },
  { skill: 'S08 AntV Chart', values: [0,0,3,3,0,0,0,0,0,5,0,2] },
  { skill: 'S09 AI Image Gen', values: [5,0,0,0,5,5,3,5,3,0,0,0] },
  { skill: 'S10 shadcn/ui', values: [0,0,5,0,0,0,3,1,0,5,3,0] },
  { skill: 'S11 Playwright', values: [0,0,0,0,0,0,2,0,0,0,1,0] },
  { skill: 'S12 Chart Viz', values: [0,0,0,0,0,0,0,0,0,3,0,0] },
  { skill: 'S13 AI Portal', values: [0,0,3,0,0,0,0,0,0,0,1,5] },
  { skill: 'S14 Stack Prior.', values: [0,0,0,3,0,0,0,0,0,0,3,0] },
  { skill: 'S15 Matrix Engine', values: [0,0,5,2,0,0,0,0,0,5,0,0] },
  { skill: 'S16 Design Algo', values: [0,0,0,5,0,0,0,0,0,0,0,3] },
];

export const sectionLabels = ['Hero', 'Exec', 'Ref', 'Algo', 'Opt1', 'Opt2', 'Opt3', 'Opt4', 'Opt5', 'Comp', 'Impl', 'Portal'];
