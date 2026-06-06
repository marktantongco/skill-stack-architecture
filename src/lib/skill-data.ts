// ─── Core Data Types ───
export interface Skill {
  id: string;
  name: string;
  tier: number;
  tierName: string;
  installCommand: string;
  primaryRole: string;
  isCustom: boolean;
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

// ─── 16 Skills ───
export const skills: Skill[] = [
  { id: 'S01', name: 'Stitch Loop', tier: 0, tierName: 'Foundation', installCommand: 'npx skills add https://www.skills.sh/google-labs-code/stitch-skills/stitch-loop', primaryRole: 'Autonomous iterative website generation with baton-passing loop', isCustom: false },
  { id: 'S02', name: 'Framer Motion Animator', tier: 0, tierName: 'Foundation', installCommand: 'npx skills add https://github.com/patricio0312rev/skills --skill framer-motion-animator', primaryRole: 'Production-ready React animations, micro-interactions, spring physics', isCustom: false },
  { id: 'S03', name: 'UI/UX Pro Max', tier: 0, tierName: 'Foundation', installCommand: 'npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max', primaryRole: '344+ design resources, style governance, accessibility, creative briefs', isCustom: false },
  { id: 'S04', name: '21st.dev Registry', tier: 0, tierName: 'Foundation', installCommand: 'npx @21st-dev/registry install-skill --global', primaryRole: 'Community React component registry with shadcn CLI', isCustom: false },
  { id: 'S05', name: 'GSAP Skills', tier: 1, tierName: 'Interactive', installCommand: 'npx skills add greensock/gsap-skills', primaryRole: 'ScrollTrigger animations, timeline sequencing, pinning, parallax', isCustom: false },
  { id: 'S06', name: 'Remotion Skills', tier: 1, tierName: 'Interactive', installCommand: 'npx skills add remotion-dev/skills', primaryRole: 'Programmatic infographic-motion video generation', isCustom: false },
  { id: 'S07', name: 'Mermaid Diagrams', tier: 1, tierName: 'Interactive', installCommand: 'npx skills add softaworks/agent-toolkit --skill mermaid-diagrams', primaryRole: 'Text-based schematic diagram rendering', isCustom: false },
  { id: 'S08', name: 'AntV Chart Viz', tier: 1, tierName: 'Interactive', installCommand: 'npx skills add antvis/chart-visualization-skills', primaryRole: '26+ interactive chart types, radar, heatmap, treemap', isCustom: false },
  { id: 'S09', name: 'AI Image Gen', tier: 2, tierName: 'Visual Asset', installCommand: 'npx skills add skills-shell/skills --skill ai-image-generation', primaryRole: '50+ AI models for hero images, mockups, visual assets', isCustom: false },
  { id: 'S10', name: 'shadcn/ui Skill', tier: 2, tierName: 'Visual Asset', installCommand: 'npx skills add shadcn-ui/ui --skill shadcn', primaryRole: 'Interactive table, data table, component scaffolding', isCustom: false },
  { id: 'S11', name: 'Playwright Visual', tier: 2, tierName: 'Visual Asset', installCommand: 'npx skills add testdino-hq/playwright-skill', primaryRole: 'Screenshot capture, visual regression, cross-browser testing', isCustom: false },
  { id: 'S12', name: 'D3.js Visualization', tier: 2, tierName: 'Visual Asset', installCommand: 'npx skills add antvis/chart-visualization-skills --skill d3-viz', primaryRole: 'Custom interactive visualizations, force graphs, heatmaps', isCustom: false },
  { id: 'S13', name: 'AI Portal Redirect', tier: 3, tierName: 'Portal', installCommand: 'npx skills add <your-org>/design-portal-skills --skill ai-portal-redirect', primaryRole: 'AI agent intent classification, skill routing, guided navigation', isCustom: true },
  { id: 'S14', name: 'Stack Prioritizer', tier: 3, tierName: 'Portal', installCommand: 'npx skills add <your-org>/design-portal-skills --skill stack-prioritizer', primaryRole: '7-dimension scoring algorithm, dependency resolver', isCustom: true },
  { id: 'S15', name: 'Matrix Engine', tier: 3, tierName: 'Portal', installCommand: 'npx skills add <your-org>/design-portal-skills --skill matrix-engine', primaryRole: 'Comparative matrix rendering, interactive filters, radar viz', isCustom: true },
  { id: 'S16', name: 'Design Algorithm', tier: 3, tierName: 'Portal', installCommand: 'npx skills add <your-org>/design-portal-skills --skill design-algorithm', primaryRole: 'Stack prioritization computation, result visualization, decision tree', isCustom: true },
];

// ─── 5 Design Options ───
export const options: DesignOption[] = [
  {
    id: 'opt1',
    name: 'The Autopoietic Canvas',
    tagline: 'Self-Evolving Design System',
    dominantSkill: 'Stitch Loop',
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
  { category: 'Motion/Animation', keywords: ['animation', 'motion', 'scroll', 'parallax', 'spring'], targetSection: 'opt2', confidence: 0.8, fallback: 'algorithm' },
  { category: 'Minimalist Design', keywords: ['minimal', 'clean', 'restraint', 'Swiss', 'luxury'], targetSection: 'opt3', confidence: 0.8, fallback: 'comparative' },
  { category: 'Glassmorphism', keywords: ['glass', 'depth', 'blur', 'translucent', 'frosted'], targetSection: 'opt4', confidence: 0.8, fallback: 'comparative' },
  { category: 'Industrial/Brutalist', keywords: ['industrial', 'brutalist', 'monospace', 'mechanical'], targetSection: 'opt5', confidence: 0.8, fallback: 'comparative' },
  { category: 'Iterative Design', keywords: ['iterate', 'loop', 'evolve', 'generation', 'baton'], targetSection: 'opt1', confidence: 0.8, fallback: 'algorithm' },
];

// ─── Comparison matrix data ───
export const comparisonMatrix = [
  { dimension: 'Core Principle', opt1: 'Self-evolving design', opt2: 'Motion as language', opt3: 'Precision restraint', opt4: 'Architectural depth', opt5: 'Raw structural power' },
  { dimension: 'Dominant Skill', opt1: 'Stitch Loop', opt2: 'Framer Motion', opt3: 'UI/UX Pro Max', opt4: '21st.dev Registry', opt5: 'UI/UX Pro Max + FM' },
  { dimension: 'Motion Style', opt1: 'Organic, spring-based', opt2: 'Choreographed, multi-tier', opt3: 'Minimal, precise', opt4: 'Parallax, 3D transforms', opt5: 'Mechanical, stepped' },
  { dimension: 'Color Strategy', opt1: 'Evolutionary palette', opt2: 'Motion-legible palette', opt3: 'Two-color system', opt4: 'Depth-gradient palette', opt5: 'Safety-color accent' },
  { dimension: 'Typography', opt1: 'Adaptive scale', opt2: 'Variable weight animated', opt3: 'Single family, 3 weights', opt4: 'Depth-aware sizing', opt5: 'Monospace, extreme scale' },
  { dimension: 'Mobile Approach', opt1: 'Touch-first loop', opt2: 'Gesture-driven motion', opt3: 'Performance minimalism', opt4: 'Reduced depth layers', opt5: 'Snap-lock interaction' },
  { dimension: 'Complexity', opt1: 'High (systemic)', opt2: 'High (choreographic)', opt3: 'Low (constraint-driven)', opt4: 'High (spatial)', opt5: 'Medium (spec-driven)' },
  { dimension: 'Emotional Tone', opt1: 'Alive, adaptive', opt2: 'Fluid, responsive', opt3: 'Refined, confident', opt4: 'Immersive, premium', opt5: 'Powerful, direct' },
];

// ─── Skill utilization heatmap ───
export const heatmapData = [
  { skill: 'S01 Stitch Loop', values: [0,0,1,0,5,1,0,1,0,0,1,0] },
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
  { skill: 'S12 D3.js Viz', values: [0,0,0,0,0,0,0,0,0,3,0,0] },
  { skill: 'S13 AI Portal', values: [0,0,3,0,0,0,0,0,0,0,1,5] },
  { skill: 'S14 Stack Prior.', values: [0,0,0,3,0,0,0,0,0,0,3,0] },
  { skill: 'S15 Matrix Engine', values: [0,0,5,2,0,0,0,0,0,5,0,0] },
  { skill: 'S16 Design Algo', values: [0,0,0,5,0,0,0,0,0,0,0,3] },
];

export const sectionLabels = ['Hero', 'Exec', 'Ref', 'Algo', 'Opt1', 'Opt2', 'Opt3', 'Opt4', 'Opt5', 'Comp', 'Impl', 'Portal'];
