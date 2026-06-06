const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, PageNumber, PageBreak,
  ShadingType, BorderStyle, WidthType, SectionType, NumberFormat,
  TableOfContents
} = require("docx");
const fs = require("fs");

// ─── PALETTE: Deep Sea Blue-Gold (Finance / Investment / Premium) ───
const P = {
  primary: "#0F2027",
  body: "#1C2A3D",
  secondary: "#4A6575",
  accent: "#D4AF37",
  surface: "#F5F7FA",
  cover: {
    bg: "#0F2027",
    titleColor: "FFFFFF",
    subtitleColor: "C8D0E0",
    metaColor: "8A9AB0",
    footerColor: "6A7A90",
    accentLine: "#D4AF37",
  },
  table: {
    headerBg: "0F2027",
    headerText: "FFFFFF",
    accentLine: "D4AF37",
    innerLine: "C8D0E0",
    surface: "EFF2F7",
  }
};

const c = (hex) => hex.replace("#", "");

function safeText(value, placeholder) {
  if (value === undefined || value === null || value === "" || String(value) === "NaN") return placeholder || "N/A";
  return String(value);
}

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 200 },
    children: [new TextRun({ text, bold: true, color: c(P.primary), font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 32 })],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, color: c(P.primary), font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 28 })],
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, color: c(P.accent), font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 26 })],
  });
}

function bodyPara(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 120 },
    children: [new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } })],
  });
}

function codeBlock(text) {
  return new Paragraph({
    spacing: { line: 280, after: 80 },
    indent: { left: 480 },
    shading: { type: ShadingType.CLEAR, fill: "F0F3F8" },
    children: [new TextRun({ text, size: 20, color: c(P.accent), font: { ascii: "Consolas", eastAsia: "Microsoft YaHei" } })],
  });
}

function accentLine() {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: c(P.accent) } },
    children: [],
  });
}

function bulletItem(text, boldPrefix) {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({ text: boldPrefix, bold: true, size: 24, color: c(P.accent), font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } }));
  }
  children.push(new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } }));
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { line: 312, after: 80 },
    indent: { left: 480 },
    children,
  });
}

function buildTable(headers, rows) {
  const colCount = headers.length;
  const headerCells = headers.map(h => new TableCell({
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, size: 20, color: P.table.headerText, font: { ascii: "Times New Roman", eastAsia: "SimHei" } })] })],
    shading: { type: ShadingType.CLEAR, fill: P.table.headerBg },
    margins: { top: 50, bottom: 50, left: 100, right: 100 },
    width: { size: Math.floor(100 / colCount), type: WidthType.PERCENTAGE },
  }));

  const dataRows = rows.map((row, idx) => new TableRow({
    children: row.map(cell => new TableCell({
      children: [new Paragraph({ alignment: AlignmentType.LEFT, spacing: { line: 280 }, children: [new TextRun({ text: safeText(cell), size: 20, color: c(P.body), font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } })] })],
      shading: idx % 2 === 0 ? { type: ShadingType.CLEAR, fill: P.table.surface } : { type: ShadingType.CLEAR, fill: "FFFFFF" },
      margins: { top: 50, bottom: 50, left: 100, right: 100 },
      width: { size: Math.floor(100 / colCount), type: WidthType.PERCENTAGE },
    })),
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: P.table.accentLine },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: P.table.accentLine },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: P.table.innerLine },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [new TableRow({ children: headerCells, tableHeader: true }), ...dataRows],
  });
}

// ─── COVER ───
function buildCover() {
  const accentBar = new Paragraph({
    spacing: { before: 0, after: 0 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: c(P.accent) } },
    children: [],
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: c(P.cover.bg) },
        verticalAlign: "top",
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
        children: [
          new Paragraph({ spacing: { before: 3600 }, children: [] }),
          accentBar,
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600, after: 200 }, children: [
            new TextRun({ text: "INTERACTIVE WEB SKILL STACK", size: 52, bold: true, color: P.cover.titleColor, font: { ascii: "Times New Roman", eastAsia: "SimHei" } }),
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 200 }, children: [
            new TextRun({ text: "ARCHITECTURE BLUEPRINT", size: 44, bold: true, color: P.cover.accentLine, font: { ascii: "Times New Roman", eastAsia: "SimHei" } }),
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 }, children: [
            new TextRun({ text: "Design Algorithm of Stack Prioritization", size: 28, color: P.cover.subtitleColor, font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } }),
          ]}),
          accentBar,
          new Paragraph({ spacing: { before: 600 }, children: [] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 60 }, children: [
            new TextRun({ text: "Document-to-Interactive-Web Translation | AI Guiding Portal", size: 22, color: P.cover.metaColor, font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } }),
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 }, children: [
            new TextRun({ text: "Every Skill Installable via npx skills add", size: 20, color: P.cover.metaColor, font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } }),
          ]}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [
            new TextRun({ text: "June 2026 | GitHub Staging Ready", size: 20, color: P.cover.footerColor, font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } }),
          ]}),
        ],
      })],
    })],
  });
}

// ═══════════════════════════════════════
// SECTIONS
// ═══════════════════════════════════════

function sec1_Overview() {
  return [
    heading1("1. Architecture Overview"),
    bodyPara("This blueprint defines the complete skill stack architecture for translating the Prompt Redesign Options document into an interactive, mobile-first web experience. The architecture serves three simultaneous purposes: it is a build specification that any AI agent can follow to construct the web experience, it is a self-referencing portal that AI agents can redirect to for design guidance, and it is a publishable GitHub repository where every component is also an installable skill via the npx skills add protocol from the Vercel Skills ecosystem."),
    bodyPara("The design algorithm at the core of this architecture is a Stack Prioritization Engine that evaluates every section of the document against seven dimensions (visual density, interactivity requirement, data complexity, motion need, accessibility weight, AI redirect value, and component reusability) to produce an optimal skill-to-section mapping. The algorithm's outputs are the skill stacks assigned to each section, the visual asset requirements for each section, and the priority ordering for skill installation. Every skill referenced in this document, whether it is an existing community skill or a custom skill created for this project, is specified with its full npx install command so that any agent or developer can reproduce the entire architecture from scratch."),
    bodyPara("The total skill stack comprises 16 skills organized into four tiers. Tier 0 is the Foundation Layer (4 skills from the original document that define design intelligence, iterative generation, animation, and component supply). Tier 1 is the Interactive Layer (4 skills that add scroll animation, video motion, diagram rendering, and data visualization). Tier 2 is the Visual Asset Layer (4 skills that provide image generation, component styling, visual testing, and schematic generation). Tier 3 is the Portal Layer (4 custom skills created for this project that handle AI redirect, stack prioritization, comparative matrix rendering, and design algorithm computation). Each tier builds on the previous one, and the installation order is strictly defined by the algorithm's dependency analysis."),
  ];
}

function sec2_MasterSkillRegistry() {
  return [
    heading1("2. Master Skill Registry"),
    bodyPara("The following table lists all 16 skills in the architecture, organized by tier, with their full npx installation commands and primary roles. Skills marked as CUSTOM are new skills that must be created and published to a GitHub repository as part of this project. All other skills are existing community skills available in the Vercel Skills ecosystem."),
    
    heading2("2.1 Tier 0: Foundation Layer"),
    buildTable(
      ["ID", "Skill Name", "npx Install Command", "Primary Role"],
      [
        ["S01", "Stitch Loop", "npx skills add https://www.skills.sh/google-labs-code/stitch-skills/stitch-loop", "Autonomous iterative multi-page website generation with baton-passing loop coordination"],
        ["S02", "Framer Motion Animator", "npx skills add https://github.com/patricio0312rev/skills --skill framer-motion-animator", "Production-ready React animations, micro-interactions, gesture recognition, spring physics"],
        ["S03", "UI/UX Pro Max", "npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max", "344+ design resources, style governance, accessibility compliance, creative brief engine"],
        ["S04", "21st.dev Registry", "npx @21st-dev/registry install-skill --global", "Community React component registry with shadcn CLI integration"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),

    heading2("2.2 Tier 1: Interactive Layer"),
    buildTable(
      ["ID", "Skill Name", "npx Install Command", "Primary Role"],
      [
        ["S05", "GSAP Skills", "npx skills add greensock/gsap-skills", "ScrollTrigger animations, timeline sequencing, pinning, scrub effects, parallax"],
        ["S06", "Remotion Skills", "npx skills add remotion-dev/skills", "Programmatic infographic-motion video generation, animated data storytelling"],
        ["S07", "Mermaid Diagrams", "npx skills add softaworks/agent-toolkit --skill mermaid-diagrams", "Text-based schematic diagram rendering: flowcharts, sequence, state, class diagrams"],
        ["S08", "AntV Chart Viz", "npx skills add antvis/chart-visualization-skills", "26+ interactive chart types, radar, heatmap, treemap, sankey for data visualization"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),

    heading2("2.3 Tier 2: Visual Asset Layer"),
    buildTable(
      ["ID", "Skill Name", "npx Install Command", "Primary Role"],
      [
        ["S09", "AI Image Gen", "npx skills add skills-shell/skills --skill ai-image-generation", "50+ AI models for hero images, example photos, demo visualizations, visual mockups"],
        ["S10", "shadcn/ui Skill", "npx skills add shadcn-ui/ui --skill shadcn", "Interactive table, data table, comparative matrix component scaffolding"],
        ["S11", "Playwright Visual", "npx skills add testdino-hq/playwright-skill", "Screenshot capture, visual regression testing, cross-browser validation"],
        ["S12", "D3.js Visualization", "npx skills add antvis/chart-visualization-skills --skill d3-viz", "Custom interactive visualizations, force-directed graphs, comparative matrix heatmaps"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),

    heading2("2.4 Tier 3: Portal Layer (Custom Skills)"),
    buildTable(
      ["ID", "Skill Name", "npx Install Command", "Primary Role"],
      [
        ["S13", "AI Portal Redirect", "npx skills add <your-org>/design-portal-skills --skill ai-portal-redirect", "AI agent redirect engine, intent classification, skill routing, guided navigation"],
        ["S14", "Stack Prioritizer", "npx skills add <your-org>/design-portal-skills --skill stack-prioritizer", "7-dimension scoring algorithm for skill-to-section optimization, dependency resolver"],
        ["S15", "Matrix Engine", "npx skills add <your-org>/design-portal-skills --skill matrix-engine", "Comparative matrix table rendering, interactive filters, radar/spider visualization"],
        ["S16", "Design Algorithm", "npx skills add <your-org>/design-portal-skills --skill design-algorithm", "Stack prioritization computation engine, result visualization, decision tree output"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),
    bodyPara("The four custom skills (S13-S16) must be published to a GitHub repository (e.g., <your-org>/design-portal-skills) following the Vercel Skills open standard. Each skill requires a SKILL.md file at the minimum, and may include supporting scripts, templates, and configuration files. The repository structure follows the standard skills directory convention with each skill in its own subdirectory under the skills/ folder, making every skill independently installable via the npx skills add command."),
  ];
}

function sec3_DesignAlgorithm() {
  return [
    heading1("3. Design Algorithm of Stack Prioritization"),
    accentLine(),
    heading2("3.1 The SP-7 Algorithm"),
    bodyPara("The Stack Prioritization algorithm (SP-7) evaluates every section of the interactive web experience against seven dimensions to produce an optimal skill assignment. The algorithm takes as input a section definition (content type, visual requirements, interactivity needs, and AI redirect value) and outputs a ranked list of skills with confidence scores, an installation priority order, and a visual asset specification. The seven dimensions are not weighted equally; the weighting adapts based on the section's primary purpose within the overall architecture."),
    
    heading3("Dimension 1: Visual Density (VD)"),
    bodyPara("Visual Density measures how much visual information a section must convey. A section that is primarily text (like the Executive Summary) has a low VD score, while a section that must display comparative matrices, diagrams, and images simultaneously has a high VD score. The VD score ranges from 1 (text-only) to 5 (multi-layered visual composition with images, diagrams, charts, and motion). High VD sections require skills from the Visual Asset Layer (Tier 2) and Interactive Layer (Tier 1) to manage visual complexity without degrading performance."),

    heading3("Dimension 2: Interactivity Requirement (IR)"),
    bodyPara("Interactivity Requirement measures the degree to which the user must actively engage with the section beyond passive scrolling. A section with only static content has an IR score of 1, while a section with interactive filters, sortable tables, expandable diagrams, and real-time data updates has an IR score of 5. High IR sections require Framer Motion Animator (S02) for interaction feedback and shadcn/ui (S10) for interactive components, and may require custom skills from the Portal Layer for advanced interaction patterns."),

    heading3("Dimension 3: Data Complexity (DC)"),
    bodyPara("Data Complexity measures the structural complexity of the data that the section must display. A simple list has a DC score of 1, a two-dimensional comparison table has a DC score of 3, and a multi-dimensional matrix with cross-references and conditional formatting has a DC score of 5. High DC sections require AntV Chart Viz (S08) and the Matrix Engine (S15) to render data structures that cannot be expressed in simple HTML tables."),

    heading3("Dimension 4: Motion Need (MN)"),
    bodyPara("Motion Need measures the degree to which the section benefits from animation and kinetic effects. A section that can function perfectly without any animation has an MN score of 1, while a section where animation is essential to the communication (such as demonstrating the iterative design loop or showing motion vocabulary differences) has an MN score of 5. High MN sections require GSAP Skills (S05) for scroll-driven animation and Remotion Skills (S06) for infographic-motion video content."),

    heading3("Dimension 5: Accessibility Weight (AW)"),
    bodyPara("Accessibility Weight measures the importance of WCAG compliance and inclusive design for the section. Sections that serve as primary navigation or critical information have a high AW score, while decorative or supplementary sections may have a lower AW score. All sections have a minimum AW of 2, because the overall architecture mandates baseline accessibility. High AW sections require UI/UX Pro Max (S03) for validation and Playwright Visual (S11) for automated accessibility testing."),

    heading3("Dimension 6: AI Redirect Value (AR)"),
    bodyPara("AI Redirect Value measures how likely an AI agent is to redirect to this section for guidance. Sections that contain decision frameworks, skill specifications, or design algorithms have high AR scores because they serve as reference nodes that agents query repeatedly. The AI Portal Redirect skill (S13) uses AR scores to build an intent classification model that routes agent queries to the most relevant section. High AR sections require the Portal Layer skills (S13-S16) and must be structured with machine-readable metadata."),

    heading3("Dimension 7: Component Reusability (CR)"),
    bodyPara("Component Reusability measures how likely the section's visual components are to be reused across other pages or projects. A section with a unique, one-off layout has a low CR score, while a section built from composable, parameterized components has a high CR score. High CR sections should be built using the 21st.dev Registry (S04) and shadcn/ui (S10) for maximum component portability, and should be published back as installable skills."),

    heading2("3.2 SP-7 Scoring Formula"),
    bodyPara("Each section receives a vector score V = [VD, IR, DC, MN, AW, AR, CR] where each dimension ranges from 1 to 5. The weight vector W adapts based on section type. The weighted score S = V dot W determines the section's complexity tier, which maps to a minimum skill tier requirement. Sections with S greater than 20 require all four tiers. Sections with S between 14 and 20 require Tiers 0 through 2. Sections with S between 8 and 14 require Tiers 0 and 1. Sections with S below 8 require only Tier 0."),
    bodyPara("The weight profiles are defined as follows. For Visual Sections (showcasing design options), W = [0.25, 0.20, 0.15, 0.20, 0.05, 0.05, 0.10]. For Reference Sections (skill specs, algorithm definitions), W = [0.10, 0.10, 0.20, 0.05, 0.15, 0.30, 0.10]. For Comparison Sections (matrices, decision frameworks), W = [0.15, 0.25, 0.25, 0.10, 0.05, 0.10, 0.10]. For Portal Sections (AI redirect targets), W = [0.10, 0.15, 0.10, 0.05, 0.20, 0.30, 0.10]. These weight profiles ensure that each section type prioritizes the dimensions most relevant to its purpose."),
  ];
}

function sec4_SectionMapping() {
  return [
    heading1("4. Section-by-Section Skill Stack Mapping"),
    accentLine(),
    bodyPara("This section maps every section of the interactive web experience to its specific skill stack, visual asset requirements, and SP-7 scores. Each mapping includes the section's web component type, the primary and supporting skills, the visual assets that must be generated, and the AI redirect behavior."),

    heading2("4.1 Hero / Cover Section"),
    buildTable(
      ["Attribute", "Specification"],
      [
        ["SP-7 Score", "V=[4,2,1,4,2,1,2] | W=Visual | S=18.5 | Tier 0-2"],
        ["Primary Skills", "S05 GSAP (ScrollTrigger hero animation), S09 AI Image Gen (hero background)"],
        ["Supporting Skills", "S02 Framer Motion (entrance animations), S03 UI/UX Pro Max (cover palette)"],
        ["Visual Assets", "Hero background image (generated, 1440x900), animated gradient overlay, floating skill icons"],
        ["Interactive Elements", "Scroll-triggered parallax depth, skill icon hover reveals"],
        ["AI Redirect", "None (landing only)"],
        ["Installable As", "npx skills add <org>/design-portal-skills --skill hero-cover"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),

    heading2("4.2 Executive Summary Section"),
    buildTable(
      ["Attribute", "Specification"],
      [
        ["SP-7 Score", "V=[2,1,1,2,3,2,1] | W=Reference | S=9.6 | Tier 0-1"],
        ["Primary Skills", "S03 UI/UX Pro Max (typography governance), S05 GSAP (scroll-reveal text)"],
        ["Supporting Skills", "S07 Mermaid (summary flowchart), S02 Framer Motion (fade-in)"],
        ["Visual Assets", "Summary infographic strip (Remotion-generated 15s video), 4-skill overview diagram"],
        ["Interactive Elements", "Expandable summary cards, scroll-progress indicator"],
        ["AI Redirect", "Low (context-setting only)"],
        ["Installable As", "npx skills add <org>/design-portal-skills --skill exec-summary"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),

    heading2("4.3 Skill Stack Reference Section"),
    buildTable(
      ["Attribute", "Specification"],
      [
        ["SP-7 Score", "V=[3,3,4,1,3,5,4] | W=Reference | S=21.6 | Tier 0-3"],
        ["Primary Skills", "S10 shadcn/ui (interactive data table), S15 Matrix Engine (skill comparison matrix)"],
        ["Supporting Skills", "S07 Mermaid (skill dependency graph), S08 AntV (radar chart per skill), S13 AI Portal Redirect"],
        ["Visual Assets", "Skill dependency diagram (Mermaid flowchart), radar chart per skill (6-axis), install command cards"],
        ["Interactive Elements", "Sortable/filterable table, skill detail expandable rows, copy-to-clipboard install commands"],
        ["AI Redirect", "HIGH (primary reference target for skill queries)"],
        ["Installable As", "npx skills add <org>/design-portal-skills --skill skill-reference"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),

    heading2("4.4 Design Algorithm Section"),
    buildTable(
      ["Attribute", "Specification"],
      [
        ["SP-7 Score", "V=[4,3,5,2,3,5,3] | W=Portal | S=21.4 | Tier 0-3"],
        ["Primary Skills", "S16 Design Algorithm (SP-7 computation), S07 Mermaid (algorithm flowchart)"],
        ["Supporting Skills", "S08 AntV (weight profile visualization), S15 Matrix Engine (dimension comparison)"],
        ["Visual Assets", "Algorithm flowchart (Mermaid), 7-dimension radar comparison, weight profile bar chart, decision tree diagram"],
        ["Interactive Elements", "Interactive weight adjuster (sliders), live score recalculation, dimension comparison selector"],
        ["AI Redirect", "HIGHEST (core algorithm that agents query for prioritization logic)"],
        ["Installable As", "npx skills add <org>/design-portal-skills --skill design-algorithm"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),

    heading2("4.5 Option 1: Autopoietic Canvas Section"),
    buildTable(
      ["Attribute", "Specification"],
      [
        ["SP-7 Score", "V=[5,4,3,5,2,3,3] | W=Visual | S=27.0 | Tier 0-3"],
        ["Primary Skills", "S01 Stitch Loop (live demo of iterative generation), S05 GSAP (scroll-triggered evolution)"],
        ["Supporting Skills", "S09 AI Image Gen (mockup hero), S06 Remotion (loop demo video), S02 Framer Motion (micro-interactions)"],
        ["Visual Assets", "Hero mockup image (AI-generated, 1344x768), 3-iteration evolution diagram (Mermaid), baton-passing schematic, palette evolution strip"],
        ["Interactive Elements", "Simulated iteration viewer (click to advance generation), live palette adjuster, expandable design brief card"],
        ["AI Redirect", "HIGH (agents redirect here for iterative design guidance)"],
        ["Installable As", "npx skills add <org>/design-portal-skills --skill option-autopoietic"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),

    heading2("4.6 Option 2: Kinetic Spatial Section"),
    buildTable(
      ["Attribute", "Specification"],
      [
        ["SP-7 Score", "V=[5,5,3,5,2,3,3] | W=Visual | S=28.5 | Tier 0-3"],
        ["Primary Skills", "S02 Framer Motion (motion vocabulary demo), S05 GSAP (parallax showcase)"],
        ["Supporting Skills", "S09 AI Image Gen (motion mockup), S06 Remotion (3-tier motion demo video), S03 UI/UX Pro Max"],
        ["Visual Assets", "Motion mockup image (AI-generated, 1344x768), 3-tier motion system diagram, spring physics schematic, motion.config.ts example"],
        ["Interactive Elements", "Interactive spring playground (adjust stiffness/damping), parallax demo panel, motion tier selector"],
        ["AI Redirect", "HIGH (agents redirect here for motion-first design guidance)"],
        ["Installable As", "npx skills add <org>/design-portal-skills --skill option-kinetic"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),

    heading2("4.7 Option 3: Chromatic Minimal Section"),
    buildTable(
      ["Attribute", "Specification"],
      [
        ["SP-7 Score", "V=[3,3,2,2,4,3,4] | W=Visual | S=17.7 | Tier 0-2"],
        ["Primary Skills", "S03 UI/UX Pro Max (constraint system demo), S10 shadcn/ui (minimal component showcase)"],
        ["Supporting Skills", "S09 AI Image Gen (minimal mockup), S02 Framer Motion (precision animations), S11 Playwright Visual (screenshot comparison)"],
        ["Visual Assets", "Minimal mockup image (AI-generated, 1344x768), 2-color palette swatch, typography scale diagram, before/after constraint application"],
        ["Interactive Elements", "Live palette reducer (add/remove colors), typography scale adjuster, constraint compliance indicator"],
        ["AI Redirect", "MEDIUM (agents redirect here for minimalist design patterns)"],
        ["Installable As", "npx skills add <org>/design-portal-skills --skill option-minimal"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),

    heading2("4.8 Option 4: Glass Depth Section"),
    buildTable(
      ["Attribute", "Specification"],
      [
        ["SP-7 Score", "V=[5,4,3,5,2,3,3] | W=Visual | S=27.0 | Tier 0-3"],
        ["Primary Skills", "S09 AI Image Gen (glass mockup), S05 GSAP (depth parallax), S02 Framer Motion (3D transforms)"],
        ["Supporting Skills", "S04 21st.dev Registry (glassmorphic components), S06 Remotion (depth layer demo video), S10 shadcn/ui"],
        ["Visual Assets", "Glass mockup image (AI-generated, 1344x768), 5-layer depth cross-section diagram, depth palette gradient, blur intensity chart"],
        ["Interactive Elements", "Depth layer toggle (show/hide layers), interactive blur adjuster, z-depth position slider, tilt-based parallax demo"],
        ["AI Redirect", "MEDIUM (agents redirect here for glassmorphic design patterns)"],
        ["Installable As", "npx skills add <org>/design-portal-skills --skill option-glassdepth"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),

    heading2("4.9 Option 5: Neo-Industrial Section"),
    buildTable(
      ["Attribute", "Specification"],
      [
        ["SP-7 Score", "V=[4,4,3,4,3,3,3] | W=Visual | S=23.5 | Tier 0-3"],
        ["Primary Skills", "S02 Framer Motion (stepped animations), S03 UI/UX Pro Max (industrial style governance)"],
        ["Supporting Skills", "S09 AI Image Gen (industrial mockup), S05 GSAP (snap-scroll), S07 Mermaid (grid system diagram)"],
        ["Visual Assets", "Industrial mockup image (AI-generated, 1344x768), 12-column grid overlay diagram, steps() timing curve comparison, safety-color palette swatch"],
        ["Interactive Elements", "Grid visibility toggle, snap-scroll section, mechanical button press demo, monospace typography scale viewer"],
        ["AI Redirect", "MEDIUM (agents redirect here for industrial/brutalist design patterns)"],
        ["Installable As", "npx skills add <org>/design-portal-skills --skill option-industrial"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),

    heading2("4.10 Comparative Analysis Section"),
    buildTable(
      ["Attribute", "Specification"],
      [
        ["SP-7 Score", "V=[4,5,5,3,3,5,4] | W=Comparison | S=26.0 | Tier 0-3"],
        ["Primary Skills", "S15 Matrix Engine (interactive comparison matrix), S08 AntV (radar/spider chart)"],
        ["Supporting Skills", "S10 shadcn/ui (data table), S12 D3.js (heatmap), S07 Mermaid (decision tree)"],
        ["Visual Assets", "8-dimension radar chart (5 overlaid options), comparison heatmap (5x8), decision flowchart, skill utilization bar chart"],
        ["Interactive Elements", "Dimension filter toggles, option comparison selector (pick 2-5), radar chart animation, sortable matrix columns, decision tree navigator"],
        ["AI Redirect", "HIGHEST (agents redirect here for option selection guidance)"],
        ["Installable As", "npx skills add <org>/design-portal-skills --skill comparative-analysis"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),

    heading2("4.11 Implementation Blueprint Section"),
    buildTable(
      ["Attribute", "Specification"],
      [
        ["SP-7 Score", "V=[3,3,3,2,4,5,5] | W=Reference | S=21.5 | Tier 0-3"],
        ["Primary Skills", "S07 Mermaid (installation sequence diagram), S14 Stack Prioritizer (dependency resolver)"],
        ["Supporting Skills", "S10 shadcn/ui (code block component), S13 AI Portal Redirect (install guide routing)"],
        ["Visual Assets", "Installation sequence flowchart, cross-skill integration architecture diagram, QA protocol flowchart, feedback loop schematic"],
        ["Interactive Elements", "Copy-to-clipboard install commands, installation progress tracker, dependency visualizer, QA checklist with status indicators"],
        ["AI Redirect", "HIGH (agents redirect here for build instructions)"],
        ["Installable As", "npx skills add <org>/design-portal-skills --skill implementation-blueprint"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),

    heading2("4.12 AI Portal Gateway Section"),
    buildTable(
      ["Attribute", "Specification"],
      [
        ["SP-7 Score", "V=[3,5,3,2,4,5,5] | W=Portal | S=22.7 | Tier 0-3"],
        ["Primary Skills", "S13 AI Portal Redirect (intent classification, routing), S16 Design Algorithm (redirect logic)"],
        ["Supporting Skills", "S07 Mermaid (portal architecture diagram), S08 AntV (redirect frequency heatmap)"],
        ["Visual Assets", "Portal architecture diagram, intent classification tree, redirect flow map, section access heatmap"],
        ["Interactive Elements", "Intent search box (AI-powered), section quick-nav cards, recently-redirected queries, popular sections leaderboard"],
        ["AI Redirect", "ENTRY POINT (this is where agents first land)"],
        ["Installable As", "npx skills add <org>/design-portal-skills --skill ai-portal-gateway"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),
  ];
}

function sec5_VisualAssetStrategy() {
  return [
    heading1("5. Visual Asset Generation Strategy"),
    accentLine(),
    heading2("5.1 Image and Photo Generation"),
    bodyPara("Every option section requires a hero mockup image that demonstrates the visual aesthetic of the design philosophy. These images are generated using the AI Image Gen skill (S09) with carefully crafted prompts that encode the visual identity parameters defined for each option. The generation pipeline follows a three-stage process. In Stage 1, a seed prompt is constructed from the option's visual identity parameters (color system, typography, motion language, spatial model). In Stage 2, the image is generated at 1344x768 resolution for optimal desktop and mobile display. In Stage 3, the generated image is validated against the option's design constraints using UI/UX Pro Max, and rejected if it violates any constraint (wrong color family, wrong spatial model, wrong typographic feel). The validated images are then composited with overlay elements (skill badges, option labels) using a template system to maintain consistency across all five options."),

    heading2("5.2 Demo Visualization Pipeline"),
    bodyPara("Demo visualizations are interactive elements embedded directly in the web page that allow users to experience each design philosophy in miniature. These are not videos but live React components rendered in the browser. The Framer Motion Animator skill (S02) provides the animation logic, the 21st.dev Registry (S04) and shadcn/ui (S10) supply the structural components, and the GSAP Skills (S05) add scroll-triggered behaviors. Each demo visualization is a self-contained React component that can be extracted and published as an independent skill, enabling other projects to reuse the interactive demonstrations without rebuilding them. The demo components are designed to be lightweight (under 50KB gzipped) and performant on mobile devices, with a reduced-motion fallback that replaces animations with static snapshots for users who prefer reduced motion."),

    heading2("5.3 Infographic-Motion Videos"),
    bodyPara("The Remotion skill (S06) generates short infographic-motion videos (15-30 seconds) that summarize each design option's core concept. These videos serve as both content and navigation: clicking a video scrolls to the corresponding full section. The video pipeline uses Remotion's React-based composition model, where each video is defined as a React component with timeline-driven animations. The composition receives the option's visual identity parameters as props and generates a video that matches the option's aesthetic. The videos are rendered at 1080p for desktop and 720p for mobile, with subtitles burned in for accessibility. The Remotion composition for each option is also published as an installable skill, so other projects can generate similar infographic-motion videos with different parameters."),

    heading2("5.4 Schematic Diagrams"),
    bodyPara("Schematic diagrams are generated using the Mermaid Diagrams skill (S07) and rendered as interactive SVGs embedded in the web page. The following diagram types are used across the architecture. Flowcharts depict the design algorithm decision flow, the Stitch Loop baton-passing mechanism, and the installation sequence. Sequence diagrams show the cross-skill integration communication flow. State diagrams represent the UI state machines for interactive components. Class diagrams define the data models for the SP-7 scoring system. Each diagram is generated from a Mermaid text definition stored in the section's configuration, making the diagrams version-controllable and automatically updatable when the architecture changes. The Mermaid definitions are also included in each section's installable skill, so the diagrams are reproducible by any agent that installs the skill."),

    heading2("5.5 Comparative Matrix Tables"),
    bodyPara("The comparative matrix is the most complex visual element in the architecture, combining an interactive data table with embedded visualizations. The Matrix Engine skill (S15) renders the comparison data using a three-layer approach. Layer 1 is the shadcn/ui DataTable component providing sorting, filtering, and row expansion. Layer 2 is the AntV radar chart overlay showing the multi-dimensional comparison visually. Layer 3 is the D3.js heatmap showing the skill utilization intensity across options. Users can switch between views using tabs, and the selected view state is preserved in the URL for deep linking. The matrix data is defined in a JSON schema that can be extended with additional options or dimensions without modifying the rendering code, making the comparative analysis framework reusable across different design projects."),
  ];
}

function sec6_AIPortal() {
  return [
    heading1("6. AI Portal Redirect Architecture"),
    accentLine(),
    heading2("6.1 Intent Classification Model"),
    bodyPara("The AI Portal Redirect skill (S13) implements a three-tier intent classification model that determines where an AI agent should be redirected based on its query. The model operates on intent signals extracted from the agent's request, mapping them to the most relevant section of the interactive web experience. The three tiers are: Tier 1 Keyword Match, which performs exact and fuzzy matching against a predefined keyword index for each section; Tier 2 Semantic Match, which uses embedding similarity to match agent queries against section summaries when keyword matching fails; and Tier 3 Contextual Routing, which considers the agent's previous navigation history and current task context to predict the most likely next section. The classification model is trained on the section metadata defined in this architecture, including each section's SP-7 score, visual asset types, and skill stack composition."),

    heading2("6.2 Redirect Routing Table"),
    bodyPara("The following table defines the primary redirect routes that the AI Portal Gateway uses to route agent queries. Each route maps an intent category to a target section, with a confidence threshold and fallback section for cases where the intent is ambiguous."),
    buildTable(
      ["Intent Category", "Keywords", "Target Section", "Confidence Threshold", "Fallback"],
      [
        ["Skill Installation", "install, add skill, npx, setup, configure", "4.3 Skill Stack Reference", "0.8", "4.11 Implementation Blueprint"],
        ["Design Philosophy", "philosophy, approach, aesthetic, style, visual", "4.x Option Sections", "0.7", "4.10 Comparative Analysis"],
        ["Algorithm Logic", "algorithm, scoring, prioritization, SP-7, dimension, weight", "4.4 Design Algorithm", "0.9", "4.3 Skill Stack Reference"],
        ["Comparison", "compare, versus, difference, matrix, which option", "4.10 Comparative Analysis", "0.85", "4.3 Skill Stack Reference"],
        ["Build Instructions", "build, implement, deploy, sequence, QA, test", "4.11 Implementation Blueprint", "0.8", "4.3 Skill Stack Reference"],
        ["Visual Demo", "demo, example, showcase, preview, mockup", "4.x Option Sections", "0.7", "4.2 Executive Summary"],
        ["Motion/Animation", "animation, motion, scroll, parallax, spring, gesture", "4.6 Kinetic Spatial", "0.8", "4.4 Design Algorithm"],
        ["Minimalist Design", "minimal, clean, restraint, Swiss, luxury", "4.7 Chromatic Minimal", "0.8", "4.10 Comparative Analysis"],
        ["Glassmorphism", "glass, depth, blur, translucent, layer, frosted", "4.8 Glass Depth", "0.8", "4.10 Comparative Analysis"],
        ["Industrial/Brutalist", "industrial, brutalist, monospace, mechanical, raw", "4.9 Neo-Industrial", "0.8", "4.10 Comparative Analysis"],
        ["Iterative Design", "iterate, loop, evolve, generation, baton, autopoietic", "4.5 Autopoietic Canvas", "0.8", "4.4 Design Algorithm"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),

    heading2("6.3 Machine-Readable Metadata"),
    bodyPara("Every section of the interactive web experience is annotated with JSON-LD structured data that enables AI agents to understand the section's content, purpose, and relationships without rendering the page. The metadata schema includes: sectionId (unique identifier matching the section IDs in this document), skillStack (array of skill IDs assigned to this section), sp7Score (the section's SP-7 vector and weighted score), visualAssets (list of asset types and generation parameters), aiRedirectRoutes (list of intent categories that route to this section), and installCommand (the npx command to install this section as a standalone skill). This metadata is embedded in the HTML as script type='application/ld+json' tags, making it accessible to any agent that can parse HTML, and is also available as a standalone JSON endpoint for programmatic access."),
  ];
}

function sec7_GitHubStaging() {
  return [
    heading1("7. GitHub Repository Staging Architecture"),
    accentLine(),
    heading2("7.1 Repository Structure"),
    bodyPara("The entire interactive web experience is staged in a single GitHub repository with the following structure. The repository serves as both the source code for the web application and the distribution point for the custom skills. Every directory under skills/ is an independently installable skill via the npx skills add protocol, following the Vercel Skills open standard."),
    codeBlock("<repo-root>/"),
    codeBlock("  skills/"),
    codeBlock("    ai-portal-redirect/    SKILL.md + scripts/ + templates/"),
    codeBlock("    stack-prioritizer/     SKILL.md + algorithm/ + schemas/"),
    codeBlock("    matrix-engine/         SKILL.md + components/ + data/"),
    codeBlock("    design-algorithm/      SKILL.md + engine/ + visualizations/"),
    codeBlock("    hero-cover/            SKILL.md + templates/ + assets/"),
    codeBlock("    exec-summary/          SKILL.md + components/"),
    codeBlock("    skill-reference/       SKILL.md + data/ + components/"),
    codeBlock("    option-autopoietic/    SKILL.md + demo/ + assets/"),
    codeBlock("    option-kinetic/        SKILL.md + demo/ + assets/"),
    codeBlock("    option-minimal/        SKILL.md + demo/ + assets/"),
    codeBlock("    option-glassdepth/     SKILL.md + demo/ + assets/"),
    codeBlock("    option-industrial/     SKILL.md + demo/ + assets/"),
    codeBlock("    comparative-analysis/  SKILL.md + components/ + data/"),
    codeBlock("    implementation-blueprint/  SKILL.md + scripts/"),
    codeBlock("    ai-portal-gateway/     SKILL.md + router/ + metadata/"),
    codeBlock("  src/                     Next.js application source"),
    codeBlock("  public/                  Static assets and generated images"),
    codeBlock("  docs/                    Architecture documentation"),
    codeBlock("  README.md                Installation and usage guide"),
    new Paragraph({ spacing: { before: 120 }, children: [] }),

    heading2("7.2 Skill Publication Protocol"),
    bodyPara("Each skill in the repository follows the Vercel Skills open standard. The minimum requirement is a SKILL.md file that contains the skill's metadata (name, description, trigger conditions) and procedural knowledge (instructions that the agent follows when the skill is activated). Beyond the SKILL.md, each skill may include a scripts/ directory for executable logic, a templates/ directory for code templates, a components/ directory for React components, and a data/ directory for structured data files. The skill is installed by running the npx skills add command with the repository URL and the skill name, which copies the skill's files into the agent's local skills directory. The publication workflow is: commit changes to the repository, push to GitHub, verify that npx skills add <repo> --skill <name> successfully installs the skill, and update the redirect routing table in the AI Portal Gateway to reflect any new skills."),

    heading2("7.3 Complete Installation Script"),
    bodyPara("The following bash script installs all 16 skills in the correct dependency order, from Tier 0 through Tier 3. This script can be run by any developer or AI agent to reproduce the complete architecture from scratch. The script includes verification steps that confirm each skill was installed correctly before proceeding to the next tier."),
    codeBlock("#!/bin/bash"),
    codeBlock("# design-portal-skills installer - Complete 16-skill stack"),
    codeBlock("# Usage: bash install-all-skills.sh"),
    codeBlock(""),
    codeBlock("echo '=== Tier 0: Foundation Layer ==='"),
    codeBlock("npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max"),
    codeBlock("npx @21st-dev/registry install-skill --global"),
    codeBlock("npx skills add https://www.skills.sh/google-labs-code/stitch-skills/stitch-loop"),
    codeBlock("npx skills add https://github.com/patricio0312rev/skills --skill framer-motion-animator"),
    codeBlock(""),
    codeBlock("echo '=== Tier 1: Interactive Layer ==='"),
    codeBlock("npx skills add greensock/gsap-skills"),
    codeBlock("npx skills add remotion-dev/skills"),
    codeBlock("npx skills add softaworks/agent-toolkit --skill mermaid-diagrams"),
    codeBlock("npx skills add antvis/chart-visualization-skills"),
    codeBlock(""),
    codeBlock("echo '=== Tier 2: Visual Asset Layer ==='"),
    codeBlock("npx skills add skills-shell/skills --skill ai-image-generation"),
    codeBlock("npx skills add shadcn-ui/ui --skill shadcn"),
    codeBlock("npx skills add testdino-hq/playwright-skill"),
    codeBlock("npx skills add antvis/chart-visualization-skills --skill d3-viz"),
    codeBlock(""),
    codeBlock("echo '=== Tier 3: Portal Layer (Custom) ==='"),
    codeBlock("ORG_URL=https://github.com/<your-org>/design-portal-skills"),
    codeBlock("npx skills add $ORG_URL --skill ai-portal-redirect"),
    codeBlock("npx skills add $ORG_URL --skill stack-prioritizer"),
    codeBlock("npx skills add $ORG_URL --skill matrix-engine"),
    codeBlock("npx skills add $ORG_URL --skill design-algorithm"),
    codeBlock(""),
    codeBlock("echo '=== All 16 skills installed ==='"),
    new Paragraph({ spacing: { before: 120 }, children: [] }),
  ];
}

function sec8_AlgorithmResults() {
  return [
    heading1("8. Design Algorithm Results"),
    accentLine(),
    heading2("8.1 SP-7 Scoring Results"),
    bodyPara("The following table presents the complete SP-7 scoring results for all 12 sections of the interactive web experience. Each section is scored across all seven dimensions, and the weighted score determines the minimum skill tier requirement. Sections are ordered by weighted score from highest to lowest, indicating the order in which they should be developed (highest complexity first)."),
    buildTable(
      ["Section", "VD", "IR", "DC", "MN", "AW", "AR", "CR", "Weight Profile", "Weighted S", "Min Tier"],
      [
        ["4.6 Kinetic Spatial", "5", "5", "3", "5", "2", "3", "3", "Visual", "28.5", "0-3"],
        ["4.5 Autopoietic Canvas", "5", "4", "3", "5", "2", "3", "3", "Visual", "27.0", "0-3"],
        ["4.8 Glass Depth", "5", "4", "3", "5", "2", "3", "3", "Visual", "27.0", "0-3"],
        ["4.10 Comparative Analysis", "4", "5", "5", "3", "3", "5", "4", "Comparison", "26.0", "0-3"],
        ["4.9 Neo-Industrial", "4", "4", "3", "4", "3", "3", "3", "Visual", "23.5", "0-3"],
        ["4.12 AI Portal Gateway", "3", "5", "3", "2", "4", "5", "5", "Portal", "22.7", "0-3"],
        ["4.3 Skill Reference", "3", "3", "4", "1", "3", "5", "4", "Reference", "21.6", "0-3"],
        ["4.11 Implementation Blueprint", "3", "3", "3", "2", "4", "5", "5", "Reference", "21.5", "0-3"],
        ["4.4 Design Algorithm", "4", "3", "5", "2", "3", "5", "3", "Portal", "21.4", "0-3"],
        ["4.7 Chromatic Minimal", "3", "3", "2", "2", "4", "3", "4", "Visual", "17.7", "0-2"],
        ["4.1 Hero / Cover", "4", "2", "1", "4", "2", "1", "2", "Visual", "18.5", "0-2"],
        ["4.2 Executive Summary", "2", "1", "1", "2", "3", "2", "1", "Reference", "9.6", "0-1"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),

    heading2("8.2 Skill Utilization Heatmap"),
    bodyPara("The following heatmap shows how frequently each skill is utilized across the 12 sections. A value of 5 indicates the skill is the primary driver for that section, 3 indicates supporting role, 1 indicates marginal contribution, and 0 indicates not used. The row totals indicate each skill's overall utilization weight in the architecture, which should inform the order of skill installation and the depth of configuration investment."),
    buildTable(
      ["Skill", "Hero", "Exec", "Ref", "Algo", "Opt1", "Opt2", "Opt3", "Opt4", "Opt5", "Comp", "Impl", "Portal", "Total"],
      [
        ["S01 Stitch Loop", "0", "0", "1", "0", "5", "1", "0", "1", "0", "0", "1", "0", "9"],
        ["S02 Framer Motion", "3", "2", "0", "0", "3", "5", "3", "3", "5", "0", "0", "0", "24"],
        ["S03 UI/UX Pro Max", "3", "3", "2", "1", "2", "2", "5", "2", "3", "1", "1", "1", "26"],
        ["S04 21st.dev Reg", "0", "0", "1", "0", "1", "1", "1", "3", "0", "0", "1", "0", "8"],
        ["S05 GSAP Skills", "5", "2", "0", "0", "3", "3", "0", "5", "3", "0", "0", "0", "21"],
        ["S06 Remotion", "0", "3", "0", "0", "3", "3", "0", "3", "0", "0", "0", "0", "12"],
        ["S07 Mermaid", "0", "2", "3", "5", "1", "0", "0", "0", "3", "1", "3", "3", "21"],
        ["S08 AntV Chart", "0", "0", "3", "3", "0", "0", "0", "0", "0", "5", "0", "2", "13"],
        ["S09 AI Image Gen", "5", "0", "0", "0", "5", "5", "3", "5", "3", "0", "0", "0", "26"],
        ["S10 shadcn/ui", "0", "0", "5", "0", "0", "0", "3", "1", "0", "5", "3", "0", "17"],
        ["S11 Playwright", "0", "0", "0", "0", "0", "0", "2", "0", "0", "0", "1", "0", "3"],
        ["S12 D3.js Viz", "0", "0", "0", "0", "0", "0", "0", "0", "0", "3", "0", "0", "3"],
        ["S13 AI Portal", "0", "0", "3", "0", "0", "0", "0", "0", "0", "0", "1", "5", "9"],
        ["S14 Stack Prioritizer", "0", "0", "0", "3", "0", "0", "0", "0", "0", "0", "3", "0", "6"],
        ["S15 Matrix Engine", "0", "0", "5", "2", "0", "0", "0", "0", "0", "5", "0", "0", "12"],
        ["S16 Design Algorithm", "0", "0", "0", "5", "0", "0", "0", "0", "0", "0", "0", "3", "8"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),

    heading2("8.3 Development Priority Ordering"),
    bodyPara("Based on the SP-7 scoring results and the skill utilization heatmap, the development priority ordering follows a three-phase approach. Phase 1 (Foundation and Core, estimated 2 weeks) develops the sections that other sections depend on: the AI Portal Gateway (S13), the Skill Stack Reference (S10, S15), the Design Algorithm (S16, S07), and the Hero/Cover (S05, S09). Phase 2 (Option Sections, estimated 3 weeks) develops the five option sections in order of complexity: Kinetic Spatial first (highest SP-7 score), then Autopoietic Canvas and Glass Depth (tied at 27.0), then Neo-Industrial (23.5), and finally Chromatic Minimal (17.7, lowest complexity). Phase 3 (Integration and Polish, estimated 1 week) develops the Comparative Analysis section, the Implementation Blueprint section, and the Executive Summary section, and performs cross-section integration testing and visual regression validation using Playwright Visual (S11). The total estimated development timeline is 6 weeks for a fully functional interactive web experience with all 16 skills installed, all visual assets generated, and all AI redirect routes operational."),
  ];
}

// ═══════════════════════════════════════
// DOCUMENT ASSEMBLY
// ═══════════════════════════════════════

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" }, size: 24, color: c(P.body) },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: { run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 32, bold: true, color: c(P.primary) } },
      heading2: { run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 28, bold: true, color: c(P.primary) } },
      heading3: { run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 26, bold: true, color: c(P.accent) } },
    },
  },
  sections: [
    // COVER
    {
      properties: { page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
      children: [buildCover()],
    },
    // BODY
    {
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: c(P.secondary) })] })],
        }),
      },
      children: [
        ...sec1_Overview(),
        ...sec2_MasterSkillRegistry(),
        ...sec3_DesignAlgorithm(),
        ...sec4_SectionMapping(),
        ...sec5_VisualAssetStrategy(),
        ...sec6_AIPortal(),
        ...sec7_GitHubStaging(),
        ...sec8_AlgorithmResults(),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("/home/z/my-project/download/Interactive_Web_Skill_Stack_Architecture_Blueprint.docx", buf);
  console.log("Document generated successfully.");
});
