const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, PageNumber, PageBreak,
  ShadingType, BorderStyle, WidthType, SectionType, NumberFormat,
  TableOfContents, ImageRun
} = require("docx");
const fs = require("fs");

// ─── PALETTE: Lapis Tech (Cool + Light + Active — Tech / AI / Innovation) ───
const P = {
  primary: "#1A1F36",
  body: "#2A2F4A",
  secondary: "#5A6080",
  accent: "#667eea",
  surface: "#F8F9FF",
  gradient: ["#667eea", "#764ba2"],
  cover: {
    bg: "#1A1F36",
    titleColor: "FFFFFF",
    subtitleColor: "C8CCF0",
    metaColor: "9DA3C8",
    footerColor: "7A80A8",
    accentLine: "#667eea",
  },
  table: {
    headerBg: "1A1F36",
    headerText: "FFFFFF",
    accentLine: "667eea",
    innerLine: "D0D4E8",
    surface: "F4F5FC",
  }
};

const c = (hex) => hex.replace("#", "");

// ─── HELPERS ───
function safeText(value, placeholder) {
  if (value === undefined || value === null || value === "" || String(value) === "NaN") {
    return placeholder || "N/A";
  }
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

function bodyBold(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 120 },
    children: [new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" }, bold: true })],
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

// ─── TABLE BUILDER ───
function buildTable(headers, rows) {
  const headerCells = headers.map(h => new TableCell({
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, size: 21, color: P.table.headerText, font: { ascii: "Times New Roman", eastAsia: "SimHei" } })] })],
    shading: { type: ShadingType.CLEAR, fill: P.table.headerBg },
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
  }));

  const dataRows = rows.map((row, idx) => new TableRow({
    children: row.map(cell => new TableCell({
      children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: safeText(cell), size: 21, color: c(P.body), font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } })] })],
      shading: idx % 2 === 0 ? { type: ShadingType.CLEAR, fill: P.table.surface } : { type: ShadingType.CLEAR, fill: "FFFFFF" },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
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

// ─── COVER (Recipe R3 — Centered Card Frame for creative/design) ───
function buildCover() {
  const accentBar = new Paragraph({
    spacing: { before: 0, after: 0 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: c(P.accent) } },
    children: [],
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: c(P.cover.bg) },
        verticalAlign: "top",
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
        children: [
          new Paragraph({ spacing: { before: 4200 }, children: [] }),
          accentBar,
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 600, after: 200 },
            children: [
              new TextRun({ text: "PROMPT REDESIGN OPTIONS", size: 56, bold: true, color: P.cover.titleColor, font: { ascii: "Times New Roman", eastAsia: "SimHei" } }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 200 },
            children: [
              new TextRun({ text: "Senior Design Architect", size: 36, color: P.cover.subtitleColor, font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({ text: "Interactive Web Mobile-First UI/UX", size: 28, color: P.cover.subtitleColor, font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } }),
            ],
          }),
          accentBar,
          new Paragraph({ spacing: { before: 800 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({ text: "Integrated Skill Stack", size: 22, color: P.cover.metaColor, font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: "Stitch Loop  |  Framer Motion Animator  |  UI/UX Pro Max  |  21st.dev Registry", size: 20, color: P.cover.metaColor, font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200 },
            children: [
              new TextRun({ text: "June 2026", size: 20, color: P.cover.footerColor, font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } }),
            ],
          }),
        ],
      })],
    })],
  });
}

// ═══════════════════════════════════════════════════════════════
// CONTENT SECTIONS
// ═══════════════════════════════════════════════════════════════

function sectionExecutiveSummary() {
  return [
    heading1("Executive Summary"),
    bodyPara("This document presents five distinct prompt redesign options for a senior design architect tasked with creating an interactive web, mobile-first, ultra-modern, sophisticated, and clean UI/UX that is both creative and bold. Each option integrates a carefully selected stack of four agent skills drawn from the Vercel Skills ecosystem and the broader open agent skills community, ensuring that every design decision is informed by AI-powered design intelligence, iterative generation, production-grade animation, and a rich component registry."),
    bodyPara("The four skills forming the integrated combination stack are: Stitch Loop from Google Labs, which provides autonomous iterative website generation through a baton-passing loop coordination pattern; Framer Motion Animator from patricio0312rev, which delivers production-ready React animations and micro-interactions with gesture recognition, spring physics, and scroll-driven effects; UI/UX Pro Max from nextlevelbuilder, which injects comprehensive design intelligence including 344+ searchable design resources spanning 57 UI styles, 161 color palettes, 57 font pairings, and 161 product type reasoning rules; and the 21st.dev Registry, which serves as the community-driven component registry enabling instant access to thousands of high-quality React UI components installable via a single CLI command."),
    bodyPara("Each option represents a fundamentally different design philosophy and creative direction, yet all five leverage the same four-skill stack. The difference lies in which skill takes the dominant role, how the skills interact and sequence, and what aesthetic and experiential priorities drive the design system. The options range from self-evolving autonomous design systems to motion-first interfaces, from chromatic minimalism to spatial glassmorphism, and from neo-industrial brutalism to refined architectural layering. Together, they provide the senior design architect with a comprehensive palette of creative directions, each fully grounded in the capabilities of the integrated skill stack."),
  ];
}

function sectionSkillStack() {
  return [
    heading1("Integrated Skill Stack Reference"),
    bodyPara("Before examining the five design options, it is essential to understand the capabilities and interaction models of each skill in the stack. The following table summarizes the four skills, their installation commands, and their primary functional contributions to the design process."),
    buildTable(
      ["Skill", "Install Command", "Primary Capability", "Design Role"],
      [
        ["Stitch Loop", "npx skills add https://www.skills.sh/google-labs-code/stitch-skills/stitch-loop", "Autonomous iterative website generation with baton-passing loop coordination", "Multi-page generation engine, cross-page design consistency, iterative refinement"],
        ["Framer Motion Animator", "npx skills add https://github.com/patricio0312rev/skills --skill framer-motion-animator", "Production-ready React animations, micro-interactions, gesture recognition, spring physics", "Motion design language, transition choreography, interaction feedback layer"],
        ["UI/UX Pro Max", "npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max", "344+ design resources: 57 styles, 161 palettes, 57 font pairings, UX validation/audit", "Design intelligence, style governance, accessibility compliance, creative brief engine"],
        ["21st.dev Registry", "npx @21st-dev/registry install-skill --global", "Community React component registry with shadcn CLI integration", "Component sourcing, structural scaffolding, rapid prototyping, design system implementation"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),
    heading2("Skill Interaction Model"),
    bodyPara("The four skills interact in a layered architecture. UI/UX Pro Max sits at the top as the design intelligence layer, establishing style governance, color palettes, typography decisions, and UX validation rules before any code is written. Stitch Loop operates as the orchestration layer, coordinating the iterative generation of pages and ensuring cross-page consistency through its baton-passing mechanism. The 21st.dev Registry functions as the component supply layer, providing the structural building blocks that the other skills compose into interfaces. Framer Motion Animator serves as the experience layer, adding the kinetic dimension that transforms static compositions into living, responsive interfaces. Each option in this document reconfigures the dominance, sequencing, and interaction patterns among these four layers to achieve a distinct design philosophy."),
  ];
}

function sectionOption1() {
  return [
    heading1("Option 1: The Autopoietic Canvas"),
    accentLine(),
    heading2("Design Philosophy"),
    bodyPara("The Autopoietic Canvas is a self-evolving design system where the interface builds and refines itself through iterative generation cycles. Inspired by biological autopoiesis, the concept envisions a design process where each iteration reads the current state, identifies gaps or improvement opportunities, and autonomously generates the next version. Stitch Loop is the dominant skill here, driving the baton-passing loop where each cycle produces a progressively more refined version of the site. The design does not start from a fixed blueprint; instead, it evolves from a seed brief into a fully realized interface through successive iterations, with UI/UX Pro Max providing the design intelligence that evaluates and guides each cycle, Framer Motion Animator animating the transitions between states, and the 21st.dev Registry supplying components as needed by each generation."),
    bodyPara("The visual language of this option is organic and adaptive. Colors shift subtly between iterations, typographic hierarchies refine themselves based on content density, and layout structures adapt based on the information architecture that emerges from the loop. The result is a design that feels alive, as if the interface is continuously optimizing itself for the user. This philosophy is particularly suited to products that evolve rapidly, where the design system must accommodate frequent content changes and new feature additions without requiring manual redesign. The mobile-first approach ensures that each iteration begins from the smallest viewport and expands outward, guaranteeing that the core experience is always optimized for touch-based interaction."),

    heading2("Skill Dominance Hierarchy"),
    buildTable(
      ["Priority", "Skill", "Role", "Contribution Weight"],
      [
        ["1 (Dominant)", "Stitch Loop", "Orchestration Engine", "40%"],
        ["2", "UI/UX Pro Max", "Design Intelligence Governor", "30%"],
        ["3", "Framer Motion Animator", "State Transition Animator", "15%"],
        ["4", "21st.dev Registry", "Component Supply on Demand", "15%"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),

    heading2("Prompt Architecture"),
    bodyPara("The prompt for this option is structured as a multi-phase generation cycle. In Phase 1, the Seed Brief, the architect provides a minimal description of the product, target audience, and desired emotional tone. UI/UX Pro Max interprets this brief into a DESIGN.md specification, selecting styles, palettes, and font pairings from its 344+ resource database. In Phase 2, the First Generation, Stitch Loop reads the DESIGN.md and generates the first iteration of the site, pulling structural components from the 21st.dev Registry. Framer Motion Animator applies entrance animations and micro-interactions to the generated components. In Phase 3, the Evaluation Loop, UI/UX Pro Max audits the generated output against its UX validation rules, checking contrast ratios, ARIA labels, focus states, and responsive breakpoints. It produces a refinement brief that identifies specific improvements. In Phase 4, the Refinement Cycle, Stitch Loop reads the refinement brief and generates the next iteration, with the loop continuing until the UX audit score reaches a threshold or the architect intervenes."),

    heading2("Mobile-First Strategy"),
    bodyPara("Every generation cycle begins at the 375px viewport width. The baton file includes a viewport-first directive that ensures components are selected and composed for touch interaction before being adapted for larger screens. Framer Motion Animator applies gesture-based interactions (tap, drag, swipe) as the primary interaction model, with hover and focus states added only as progressive enhancements for wider viewports. The 21st.dev Registry is queried with a mobile-first filter, prioritizing components that are natively responsive and touch-optimized. Layout compositions use a single-column base that expands to multi-column grids at breakpoints, following the design intelligence guidance from UI/UX Pro Max regarding content density thresholds for each viewport tier."),

    heading2("Visual Identity Parameters"),
    bulletItem("Color Evolution: ", "Color Evolution: "),
    bodyPara("Palettes evolve across iterations. The initial generation uses a conservative palette from UI/UX Pro Max, with each refinement cycle adjusting saturation, contrast, and accent distribution based on UX audit feedback. The result is a palette that has been computationally optimized for readability and emotional impact rather than arbitrarily chosen."),
    bulletItem("Typography: ", "Typography: "),
    bodyPara("A single type family with wide weight range (e.g., Inter or Satoshi) serves as the foundation. UI/UX Pro Max selects the specific weight distribution for headings, body, captions, and code blocks. As iterations progress, typographic scale adjusts based on content density analysis, ensuring optimal line lengths and vertical rhythm across all viewport sizes."),
    bulletItem("Motion Language: ", "Motion Language: "),
    bodyPara("Framer Motion Animator applies subtle, progressive animations. Entrance animations use spring physics with low stiffness for a natural feel. Micro-interactions are limited to direct manipulation feedback (button presses, drag responses, scroll reveals) to maintain the organic, self-evolving aesthetic without overwhelming the user with unnecessary motion."),

    heading2("Recommended For"),
    bodyPara("Products with rapidly evolving content and features, design systems that must scale without manual maintenance, and teams that prioritize computational optimization over hand-crafted visual decisions. This option excels when the product itself is a living system that changes frequently, requiring a design that can adapt autonomously rather than being rebuilt with each iteration."),
  ];
}

function sectionOption2() {
  return [
    heading1("Option 2: Kinetic Spatial"),
    accentLine(),
    heading2("Design Philosophy"),
    bodyPara("Kinetic Spatial is a motion-first design philosophy where movement is not an embellishment layered onto a static design, but the foundational language through which the interface communicates. In this paradigm, every spatial relationship, every state change, and every piece of information hierarchy is expressed through choreographed motion. Framer Motion Animator takes the dominant role, defining the motion vocabulary that governs how elements enter, exit, relate to each other, and respond to user interaction. The design begins not with layout grids or color palettes, but with a motion specification: how fast should the interface feel, what physical metaphors underpin the interaction model (springy, fluid, mechanical), and how does motion guide the user's attention through the information architecture."),
    bodyPara("The visual aesthetic of Kinetic Spatial is characterized by generous whitespace, elements that float and drift into position, and spatial relationships that are defined by motion paths rather than static grid positions. UI/UX Pro Max provides the style intelligence to ensure that the motion vocabulary is legible and accessible, selecting color palettes with sufficient contrast to be readable during animated transitions, choosing typography that maintains clarity during movement, and validating that motion durations respect accessibility guidelines for users sensitive to animation. The 21st.dev Registry supplies components that are motion-ready, prioritizing those with built-in Framer Motion integration. Stitch Loop coordinates multi-page consistency, ensuring that the motion vocabulary established on the first page propagates consistently across all subsequent pages through its baton-passing mechanism."),

    heading2("Skill Dominance Hierarchy"),
    buildTable(
      ["Priority", "Skill", "Role", "Contribution Weight"],
      [
        ["1 (Dominant)", "Framer Motion Animator", "Motion Vocabulary Architect", "40%"],
        ["2", "UI/UX Pro Max", "Motion-Aware Design Intelligence", "25%"],
        ["3", "Stitch Loop", "Cross-Page Motion Consistency", "20%"],
        ["4", "21st.dev Registry", "Motion-Ready Component Supply", "15%"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),

    heading2("Prompt Architecture"),
    bodyPara("The prompt begins with a Motion Brief rather than a visual brief. The architect defines the desired kinetic personality: should the interface feel quick and responsive (stiff springs, short durations), or fluid and contemplative (soft springs, longer durations with easing curves)? Should spatial transitions follow a Z-axis depth model (elements zooming in and out) or an X-Y axis planar model (elements sliding and transforming)? Framer Motion Animator translates this brief into a motion.config.ts specification that defines the global animation parameters, variant systems, and gesture response mappings. UI/UX Pro Max then operates within the motion vocabulary, selecting styles and palettes that complement the kinetic personality. Bright, high-saturation palettes for quick interfaces; muted, gradient-rich palettes for fluid interfaces. Stitch Loop uses the motion.config.ts as a baton file, ensuring each generated page inherits the same motion DNA. The 21st.dev Registry is queried with motion compatibility as a selection criterion."),

    heading2("Mobile-First Strategy"),
    bodyPara("Motion on mobile requires special consideration for performance and touch ergonomics. The kinetic specification includes a mobile motion profile that reduces spring stiffness and animation complexity to maintain 60fps on mid-range devices. Touch gestures replace hover-based interactions entirely: swipe to navigate, long-press for context menus, pull-to-refresh with elastic physics. Framer Motion Animator implements drag constraints that respect mobile viewport boundaries, preventing elements from being dragged off-screen. Layout animations use shared layout transitions (AnimatePresence with layoutId) to create seamless page-to-page continuity on mobile, where navigation transitions are the primary spatial experience. The 21st.dev Registry supplies mobile-optimized components with built-in touch handlers and Framer Motion variants pre-configured for mobile performance."),

    heading2("Visual Identity Parameters"),
    bulletItem("Motion Vocabulary: ", "Motion Vocabulary: "),
    bodyPara("A three-tier motion system defines the interface personality. Tier 1 (Macro) covers page transitions, section reveals, and major state changes with durations of 400-600ms. Tier 2 (Meso) handles component-level interactions like card flips, dropdown expansions, and modal presentations with durations of 200-350ms. Tier 3 (Micro) governs micro-interactions like button ripples, toggle switches, and hover feedback with durations of 80-150ms. Each tier uses spring physics with stiffness and damping values derived from the Motion Brief."),
    bulletItem("Spatial Model: ", "Spatial Model: "),
    bodyPara("Elements exist in a three-dimensional coordinate system even on a 2D screen. Z-axis depth is expressed through scale transforms, shadow depth, and parallax offsets. When elements transition between states, they move through 3D space rather than simply appearing and disappearing. This creates a visceral sense of physicality that makes the interface feel tangible and real, even on a flat display."),
    bulletItem("Color and Typography: ", "Color and Typography: "),
    bodyPara("UI/UX Pro Max selects palettes optimized for motion legibility. Colors must maintain sufficient contrast during animated transitions, when elements may be partially transparent or overlapping. Typography uses variable fonts with weight animations for emphasis shifts, and text is never animated in ways that reduce readability. The combination of motion and color creates a design where the user always knows where to look and what is happening."),

    heading2("Recommended For"),
    bodyPara("Product experiences where interaction quality is a core differentiator, immersive storytelling applications, creative portfolios and showcases, and any product where user delight through motion is a primary retention mechanism. This option excels when the product's value proposition includes the quality of the interactive experience itself, not just the information it delivers. It is particularly effective for applications targeting audiences that appreciate refined, Apple-level attention to interaction detail."),
  ];
}

function sectionOption3() {
  return [
    heading1("Option 3: Chromatic Minimal"),
    accentLine(),
    heading2("Design Philosophy"),
    bodyPara("Chromatic Minimal achieves ultra-modern sophistication through radical restraint. This is not the minimalism of emptiness, but the minimalism of precision, where every element, every color, and every pixel exists for a reason and can justify its presence. UI/UX Pro Max takes the dominant role, driving all design decisions through its design intelligence engine. The skill's 344+ design resources are filtered through a rigorous minimalism lens: palettes are reduced to two or three colors at most, typography is limited to a single type family with deliberate weight variation, and components are selected only when they serve a clear functional purpose. The result is a design that feels expensive, considered, and confident, where the absence of decoration is itself the most powerful design statement."),
    bodyPara("The visual language of Chromatic Minimal draws from the Swiss International Typographic Style, Japanese Ma (negative space as a design element), and contemporary luxury brand aesthetics. Whitespace is the primary compositional tool, used not as padding but as an active element that creates rhythm, hierarchy, and breathing room. Color is deployed surgically, often as a single accent that appears only on interactive elements or critical information. Framer Motion Animator contributes by ensuring that the few animations used are exquisitely crafted, since in a minimal design, every motion is visible and must be flawless. The 21st.dev Registry supplies only the most refined, well-engineered components, and Stitch Loop ensures that the minimalist consistency is maintained across every page, preventing the common failure mode where minimalism degrades into inconsistency as pages accumulate."),

    heading2("Skill Dominance Hierarchy"),
    buildTable(
      ["Priority", "Skill", "Role", "Contribution Weight"],
      [
        ["1 (Dominant)", "UI/UX Pro Max", "Design Intelligence Sovereign", "40%"],
        ["2", "Stitch Loop", "Minimalist Consistency Enforcer", "25%"],
        ["3", "Framer Motion Animator", "Precision Motion Craftsman", "20%"],
        ["4", "21st.dev Registry", "Curated Component Selection", "15%"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),

    heading2("Prompt Architecture"),
    bodyPara("The prompt begins with a Design Constraint Specification. Rather than describing what the design should include, the architect specifies what it must exclude. Maximum number of colors (typically 2-3), maximum number of font weights (typically 3-4), maximum number of animation types per page (typically 2-3), and minimum whitespace ratios. UI/UX Pro Max interprets these constraints into a DESIGN.md that is essentially a negative design system: a set of rules about what not to do. The skill's creative brief engine generates a brief that prioritizes elimination over addition, asking at every decision point whether an element can be removed without losing functionality. Stitch Loop uses this constrained brief as its baton file, with each generation cycle verifying compliance with the constraint specification. Framer Motion Animator operates in precision mode, applying only the most essential animations with exact timing curves and zero overshoot. The 21st.dev Registry is queried with strict quality filters, selecting only components with minimal visual footprint and clean, unopinionated styling."),

    heading2("Mobile-First Strategy"),
    bodyPara("Minimalism on mobile is both an aesthetic and a performance strategy. Fewer elements means faster rendering, smaller DOM trees, and better Core Web Vitals scores. The mobile-first approach in Chromatic Minimal begins with a single-column layout where content is presented in a strict vertical rhythm. Each content block is separated by generous vertical spacing, creating a scroll experience that feels like turning pages of a beautifully typeset book. Touch targets are large (minimum 48px) but visually understated, with hover states expressed through subtle opacity shifts rather than color changes. Framer Motion Animator implements scroll-triggered reveals that are so subtle they are almost subliminal, ensuring content appears just before the user needs it without drawing attention to the animation itself. Navigation is simplified to a minimal bottom bar or a single hamburger menu, reducing visual clutter on small screens."),

    heading2("Visual Identity Parameters"),
    bulletItem("Palette Strategy: ", "Palette Strategy: "),
    bodyPara("A two-color system with one neutral and one accent. The neutral occupies 95% of the visual field (typically a warm off-white like #FAFAF8 or a cool near-black like #1A1F36). The accent appears only on interactive elements, key metrics, or brand moments. UI/UX Pro Max selects accent colors with maximum chromatic impact against the neutral base, using its color science database to ensure the accent reads as intentional and confident rather than arbitrary."),
    bulletItem("Typography System: ", "Typography System: "),
    bodyPara("A single variable font family (e.g., Inter, SF Pro, or Geist) with a restricted weight range of three: Light (300) for captions and secondary text, Regular (400) for body, and Semibold (600) for headings. Type scale follows a strict mathematical ratio (1.25 or 1.333) with no exceptions. Line heights are generous (1.5-1.7 for body text) to reinforce the sense of considered spaciousness."),
    bulletItem("Motion Protocol: ", "Motion Protocol: "),
    bodyPara("Three animation types maximum per page: fade-in for content reveals, slide-up for scroll-triggered elements, and scale for interactive feedback. All animations use cubic-bezier easing with no spring physics, creating a controlled, predictable feel that matches the precision aesthetic. Durations are fixed at 300ms for reveals and 150ms for interactions, with no variation, reinforcing the systematic nature of the design."),

    heading2("Recommended For"),
    bodyPara("Luxury and premium brand experiences, professional services and consulting firms, editorial and publishing platforms, and any product where perceived quality and sophistication are primary competitive advantages. This option excels when the target audience values taste and discernment, and when the product must communicate confidence and authority through visual restraint rather than visual abundance. It is also ideal for content-heavy applications where readability and focus are paramount."),
  ];
}

function sectionOption4() {
  return [
    heading1("Option 4: Glass Depth"),
    accentLine(),
    heading2("Design Philosophy"),
    bodyPara("Glass Depth is an architectural design philosophy that treats the interface as a three-dimensional space constructed from translucent, layered surfaces. The screen becomes a window into a constructed environment where frosted glass panels float at different depths, creating a sense of spatial hierarchy that is both visually striking and functionally informative. Elements closer to the user appear sharper, more saturated, and more interactive, while elements deeper in the stack are progressively blurred and desaturated, communicating their relative importance and interactivity. This approach creates an interface that feels architectural and immersive, where the user's mental model of the information hierarchy maps directly onto the visual depth of the composition."),
    bodyPara("The 21st.dev Registry takes the dominant role in Glass Depth, because the entire visual system depends on having the right glassmorphic components: frosted glass cards, translucent overlays, depth-aware containers, and blur-capable surfaces. UI/UX Pro Max provides the depth palette, a carefully calibrated system of background colors, blur intensities, and opacity levels that create convincing depth without sacrificing readability. Framer Motion Animator handles the parallax and 3D transform animations that bring the spatial model to life, making depth perceptible through motion. Stitch Loop coordinates the spatial design system across pages, ensuring that the depth model is consistent and that elements maintain their z-position relationships throughout the navigation flow."),

    heading2("Skill Dominance Hierarchy"),
    buildTable(
      ["Priority", "Skill", "Role", "Contribution Weight"],
      [
        ["1 (Dominant)", "21st.dev Registry", "Glassmorphic Component Architect", "35%"],
        ["2", "UI/UX Pro Max", "Depth Palette and Readability Governor", "25%"],
        ["3", "Framer Motion Animator", "Parallax and 3D Transform Engine", "25%"],
        ["4", "Stitch Loop", "Spatial Consistency Coordinator", "15%"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),

    heading2("Prompt Architecture"),
    bodyPara("The prompt begins with a Spatial Depth Specification. The architect defines the number of depth layers (typically 3-5), the blur intensity at each layer (progressively increasing with depth), and the color tinting strategy (cool tones for deep layers, warm tones for surface layers). The 21st.dev Registry is queried for glassmorphic components matching these specifications, and the resulting component library forms the structural vocabulary of the entire interface. UI/UX Pro Max generates a depth-palette specification that maps colors, opacities, and blur values to each z-layer, ensuring that text remains readable at every depth level through contrast optimization. Framer Motion Animator creates a 3D transform system where elements respond to scroll position and mouse movement with parallax offsets proportional to their z-depth, creating a convincing sense of spatial layering. Stitch Loop embeds the spatial specification in its baton file, ensuring that every generated page respects the depth model and that navigation transitions maintain spatial coherence."),

    heading2("Mobile-First Strategy"),
    bodyPara("Glass Depth on mobile requires careful performance management, as backdrop-blur effects are computationally expensive. The mobile-first approach uses a reduced depth model with only 2-3 layers instead of the desktop 4-5, and substitutes gradient overlays for live blur on lower-powered devices. Framer Motion Animator implements tilt-based parallax on mobile, using the device accelerometer to create depth perception through subtle element offsets in response to device orientation. Touch interactions use depth as a feedback mechanism: pressing a card moves it closer (scale up, blur reduce, opacity increase), while swiping it away pushes it deeper (scale down, blur increase, opacity decrease). The 21st.dev Registry supplies mobile-optimized glassmorphic components that use CSS containment and will-change hints to minimize repaints and maintain smooth scrolling performance."),

    heading2("Visual Identity Parameters"),
    bulletItem("Depth Palette: ", "Depth Palette: "),
    bodyPara("A five-layer depth system with the following specifications. Layer 0 (Background) uses a deep gradient (e.g., #0F0C29 to #302B63 to #24243E) at full saturation. Layer 1 (Deep Content) applies a 20px blur with 40% white tint overlay. Layer 2 (Mid Content) uses 12px blur with 25% white tint. Layer 3 (Surface) has 6px blur with 15% white tint. Layer 4 (Foreground) is fully opaque with a subtle 2px shadow. UI/UX Pro Max ensures all layers maintain WCAG AA contrast for text content."),
    bulletItem("Glass Surfaces: ", "Glass Surfaces: "),
    bodyPara("All container elements use a combination of backdrop-filter: blur(), semi-transparent backgrounds (rgba with 0.4-0.8 alpha), and 1px semi-transparent borders (rgba with 0.1-0.2 alpha). This creates the frosted glass effect that is the signature visual element of this option. Shadows are soft and diffused, with large spread values to create the impression of light scattering through translucent surfaces."),
    bulletItem("Motion Language: ", "Motion Language: "),
    bodyPara("Framer Motion Animator implements a parallax scroll system where elements at different z-depths scroll at different rates, creating a natural depth perception. Mouse movement on desktop triggers subtle tilt transforms on glass panels, with the tilt magnitude proportional to the panel's z-depth. Page transitions use a zoom-through-depth model, where the current page pushes back into deeper layers while the new page slides forward from behind, creating a spatial navigation metaphor."),

    heading2("Recommended For"),
    bodyPara("Creative agency portfolios, music and entertainment platforms, fintech dashboards, and any product where visual impact and immersive experience are primary differentiators. This option excels when the product needs to feel premium, cutting-edge, and visually distinctive in a crowded market. It is particularly effective for products targeting younger demographics who associate glassmorphic aesthetics with modernity and technological sophistication, and for applications where the visual experience itself is a significant part of the value proposition."),
  ];
}

function sectionOption5() {
  return [
    heading1("Option 5: Neo-Industrial"),
    accentLine(),
    heading2("Design Philosophy"),
    bodyPara("Neo-Industrial is a bold, unapologetic design philosophy that draws from brutalist architecture, industrial design, and the raw aesthetics of engineering infrastructure. This option embraces visible structure, stark contrasts, heavy typography, and mechanical interactions to create an interface that feels powerful, honest, and deliberately confrontational. Unlike the polished minimalism of Option 3 or the ethereal depth of Option 4, Neo-Industrial celebrates the structural skeleton of the interface, making grids visible, embracing monospace typefaces, and using motion that feels mechanical rather than organic. The result is a design that commands attention through raw visual authority, communicating confidence and competence without relying on decorative refinement."),
    bodyPara("UI/UX Pro Max provides the brutalist style governance, selecting from its database of 57 styles those that align with industrial aesthetics: high-contrast color systems, grid-heavy layouts, and typography that prioritizes function over elegance. Framer Motion Animator contributes mechanical animations: snap transitions with no easing curves, robotic step functions, and abrupt state changes that feel like switches being thrown rather than organic motions. The 21st.dev Registry supplies structural components with minimal styling, serving as the raw steel beams that the design constructs upon. Stitch Loop enforces the industrial consistency across pages, ensuring that the mechanical interaction model and structural grid system are applied uniformly throughout the product."),

    heading2("Skill Dominance Hierarchy"),
    buildTable(
      ["Priority", "Skill", "Role", "Contribution Weight"],
      [
        ["1 (Dominant)", "UI/UX Pro Max", "Industrial Style Governance", "35%"],
        ["2", "Framer Motion Animator", "Mechanical Motion System", "30%"],
        ["3", "21st.dev Registry", "Structural Component Supply", "20%"],
        ["4", "Stitch Loop", "Industrial Consistency Enforcer", "15%"],
      ]
    ),
    new Paragraph({ spacing: { before: 200 }, children: [] }),

    heading2("Prompt Architecture"),
    bodyPara("The prompt begins with an Industrial Design Specification that defines the structural vocabulary. The architect specifies the grid system (typically a 12-column grid with visible gutters), the typographic approach (monospace with deliberate size contrasts), and the interaction model (mechanical, state-based rather than fluid, continuous). UI/UX Pro Max interprets this into a DESIGN.md that functions as an engineering specification rather than a creative brief, with precise measurements, color values, and component behaviors. Framer Motion Animator receives the mechanical motion specification and implements a motion system using steps() timing functions instead of cubic-bezier curves, creating animations that move in discrete increments rather than smooth transitions. The 21st.dev Registry is queried for unstyled, structural components that serve as the raw material for the industrial aesthetic. Stitch Loop treats the design specification as a manufacturing blueprint, ensuring each page is produced to specification with zero deviation."),

    heading2("Mobile-First Strategy"),
    bodyPara("Neo-Industrial on mobile translates the structural grid into a responsive column system that collapses from 12 columns to a single column while maintaining visible grid indicators. Gutters become more prominent on mobile, creating a deliberate sense of spatial organization. Typography scales aggressively: headings are disproportionately large on mobile, creating the dramatic size contrasts that define the industrial aesthetic. Touch interactions use a press-and-release model with haptic feedback, where buttons require a deliberate press duration (200ms minimum) to activate, mimicking the tactile experience of pressing a physical switch. Framer Motion Animator implements snap-scrolling with sections that lock into place with a mechanical click, and page transitions use a slide-and-lock mechanism where the new page slides in and locks with a visible grid alignment."),

    heading2("Visual Identity Parameters"),
    bulletItem("Color System: ", "Color System: "),
    bodyPara("A high-contrast, limited palette inspired by industrial safety colors. The primary palette uses near-black (#0A0A0A) and off-white (#F5F5F0) as the foundation, with a single safety accent color (typically a bold yellow #FFD600, safety orange #FF6B00, or industrial red #E63946) applied only to interactive elements and critical information. This creates the unmistakable visual signature of industrial signage and safety equipment, instantly communicating authority and purpose."),
    bulletItem("Typography: ", "Typography: "),
    bodyPara("A monospace type family (e.g., JetBrains Mono, IBM Plex Mono, or Space Mono) for all text, with size contrasts of 3:1 or greater between headings and body text. Headings use the heaviest weight at sizes of 48-72px, while body text uses regular weight at 14-16px. This extreme scale creates the typographic drama that is central to the industrial aesthetic. Data displays and code-like content use the monospace family at its natural spacing, reinforcing the engineering-precision feel."),
    bulletItem("Motion Language: ", "Motion Language: "),
    bodyPara("All animations use steps() timing functions, creating discrete, frame-by-frame movement rather than smooth interpolation. Element reveals use a typewriter-style appearance where content appears character by character or block by block. State transitions are binary: elements snap from one state to another with no intermediate frames, creating the mechanical on/off feel of industrial controls. Hover states use a visible border that appears instantly rather than fading in, mimicking the activation indicator on a physical switch."),
    bulletItem("Grid Visibility: ", "Grid Visibility: "),
    bodyPara("The 12-column grid is made visible through subtle vertical lines or column indicators, celebrating the structural foundation of the layout rather than hiding it. Gutters are generous (24-32px) and clearly delineated. Content blocks align strictly to the grid with no exceptions, creating the precision-engineered appearance that distinguishes this option from more organic design approaches."),

    heading2("Recommended For"),
    bodyPara("Developer tools and engineering platforms, cybersecurity and infrastructure products, creative studios and agencies wanting to project technical authority, and any product where the target audience values raw competence over polished aesthetics. This option excels when the product needs to communicate power, precision, and unapologetic confidence. It is particularly effective for tools and platforms used by technical professionals who associate visual refinement with superficiality and prefer interfaces that feel like they were built by engineers for engineers."),
  ];
}

function sectionComparison() {
  return [
    heading1("Comparative Analysis"),
    heading2("Design Philosophy Comparison"),
    buildTable(
      ["Dimension", "Autopoietic Canvas", "Kinetic Spatial", "Chromatic Minimal", "Glass Depth", "Neo-Industrial"],
      [
        ["Core Principle", "Self-evolving design", "Motion as language", "Precision restraint", "Architectural depth", "Raw structural power"],
        ["Dominant Skill", "Stitch Loop", "Framer Motion", "UI/UX Pro Max", "21st.dev Registry", "UI/UX Pro Max"],
        ["Motion Style", "Organic, spring-based", "Choreographed, multi-tier", "Minimal, precise", "Parallax, 3D transforms", "Mechanical, stepped"],
        ["Color Strategy", "Evolutionary palette", "Motion-legible palette", "Two-color system", "Depth-gradient palette", "Safety-color accent system"],
        ["Typography", "Adaptive scale", "Variable weight animated", "Single family, 3 weights", "Depth-aware sizing", "Monospace, extreme scale"],
        ["Mobile Approach", "Touch-first loop", "Gesture-driven motion", "Performance minimalism", "Reduced depth layers", "Snap-lock interaction"],
        ["Complexity", "High (systemic)", "High (choreographic)", "Low (constraint-driven)", "High (spatial)", "Medium (specification-driven)"],
        ["Emotional Tone", "Alive, adaptive", "Fluid, responsive", "Refined, confident", "Immersive, premium", "Powerful, direct"],
      ]
    ),
    new Paragraph({ spacing: { before: 300 }, children: [] }),

    heading2("Skill Utilization Matrix"),
    bodyPara("The following matrix shows how each option leverages the four skills differently, indicating the depth of utilization for each skill on a scale from 1 (minimal) to 5 (maximum exploitation of the skill's capabilities)."),
    buildTable(
      ["Option", "Stitch Loop", "Framer Motion", "UI/UX Pro Max", "21st.dev Registry"],
      [
        ["Autopoietic Canvas", "5", "3", "4", "3"],
        ["Kinetic Spatial", "3", "5", "3", "3"],
        ["Chromatic Minimal", "4", "3", "5", "3"],
        ["Glass Depth", "3", "4", "4", "5"],
        ["Neo-Industrial", "3", "4", "5", "4"],
      ]
    ),
    new Paragraph({ spacing: { before: 300 }, children: [] }),

    heading2("Decision Framework"),
    bodyPara("Selecting among the five options depends on three primary factors: the product's emotional positioning, the target audience's aesthetic expectations, and the development team's capacity for motion and interaction engineering. If the product needs to feel alive and self-improving, choose the Autopoietic Canvas. If the product's differentiation is the quality of interaction itself, choose Kinetic Spatial. If the product must communicate luxury and taste, choose Chromatic Minimal. If the product needs to be visually immersive and premium-feeling, choose Glass Depth. If the product needs to project technical authority and power, choose Neo-Industrial. These are not mutually exclusive; hybrid approaches can combine elements from multiple options, though doing so requires careful attention to the dominant skill hierarchy to avoid design system conflicts."),
    bodyPara("For teams new to the skill stack, Chromatic Minimal offers the lowest barrier to entry because its constraint-driven approach reduces the number of decisions that must be made. The Autopoietic Canvas and Kinetic Spatial have the highest implementation complexity, requiring deep familiarity with Stitch Loop's baton-passing mechanism and Framer Motion's animation APIs respectively. Glass Depth demands strong CSS engineering skills, particularly for performance optimization of backdrop-blur effects on mobile. Neo-Industrial sits in the middle, requiring precision in specification but using relatively straightforward animation techniques."),
  ];
}

function sectionImplementation() {
  return [
    heading1("Implementation Blueprint"),
    heading2("Skill Installation Sequence"),
    bodyPara("Regardless of which option is selected, the four skills should be installed in a specific sequence that respects their dependency relationships. UI/UX Pro Max is installed first because it establishes the design system foundation that all other skills reference. The 21st.dev Registry is installed second because it provides the component library that the generation and animation skills will compose. Stitch Loop is installed third because it references the design system and component library during its iterative generation cycles. Framer Motion Animator is installed last because it operates on the generated output, adding the motion layer that brings the static compositions to life. The installation commands are as follows:"),
    new Paragraph({ spacing: { before: 120 }, children: [] }),
    new Paragraph({
      spacing: { line: 312, after: 60 },
      indent: { left: 480 },
      children: [new TextRun({ text: "Step 1: npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max", size: 22, color: c(P.accent), font: { ascii: "Consolas", eastAsia: "Microsoft YaHei" } })],
    }),
    new Paragraph({
      spacing: { line: 312, after: 60 },
      indent: { left: 480 },
      children: [new TextRun({ text: "Step 2: npx @21st-dev/registry install-skill --global", size: 22, color: c(P.accent), font: { ascii: "Consolas", eastAsia: "Microsoft YaHei" } })],
    }),
    new Paragraph({
      spacing: { line: 312, after: 60 },
      indent: { left: 480 },
      children: [new TextRun({ text: "Step 3: npx skills add https://www.skills.sh/google-labs-code/stitch-skills/stitch-loop", size: 22, color: c(P.accent), font: { ascii: "Consolas", eastAsia: "Microsoft YaHei" } })],
    }),
    new Paragraph({
      spacing: { line: 312, after: 120 },
      indent: { left: 480 },
      children: [new TextRun({ text: "Step 4: npx skills add https://github.com/patricio0312rev/skills --skill framer-motion-animator", size: 22, color: c(P.accent), font: { ascii: "Consolas", eastAsia: "Microsoft YaHei" } })],
    }),

    heading2("Cross-Skill Integration Architecture"),
    bodyPara("The four skills integrate through a shared configuration layer and a baton-passing protocol. The shared configuration layer consists of three files: design.config.json (generated by UI/UX Pro Max, containing style, palette, typography, and UX rule specifications), motion.config.ts (generated by Framer Motion Animator, containing animation parameters, variant systems, and gesture mappings), and spatial.config.json (generated by the 21st.dev Registry and UI/UX Pro Max jointly, containing component selections, depth specifications, and layout grid parameters). Stitch Loop reads all three configuration files in its baton-passing loop, using them as constraints for each generation cycle. When UI/UX Pro Max detects an accessibility violation in the generated output, it updates design.config.json, which Stitch Loop picks up in the next iteration. When Framer Motion Animator identifies a performance bottleneck in the animation system, it adjusts motion.config.ts, which Stitch Loop incorporates in the next cycle. This feedback loop ensures that all four skills remain in sync throughout the design process."),

    heading2("Quality Assurance Protocol"),
    bodyPara("Each option should be validated against a three-layer quality assurance protocol. Layer 1, Automated UX Audit, uses UI/UX Pro Max's built-in validation engine to check contrast ratios, ARIA labels, focus states, and responsive breakpoints. This layer runs automatically after each Stitch Loop generation cycle. Layer 2, Motion Performance Audit, uses Framer Motion Animator's performance profiling to verify that all animations maintain 60fps on target devices, that spring animations resolve within 500ms, and that no animation creates layout thrashing. This layer runs after the motion layer is applied. Layer 3, Cross-Skill Coherence Audit, manually verifies that the design system defined by UI/UX Pro Max is faithfully implemented across all components supplied by the 21st.dev Registry, that Stitch Loop's generated pages maintain the design system consistently, and that Framer Motion Animator's motion vocabulary does not conflict with the design system's visual language. This layer runs as a final review before delivery."),
  ];
}

// ═══════════════════════════════════════════════════════════════
// DOCUMENT ASSEMBLY
// ═══════════════════════════════════════════════════════════════

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" },
          size: 24,
          color: c(P.body),
        },
        paragraph: {
          spacing: { line: 312 },
        },
      },
      heading1: {
        run: {
          font: { ascii: "Times New Roman", eastAsia: "SimHei" },
          size: 32,
          bold: true,
          color: c(P.primary),
        },
      },
      heading2: {
        run: {
          font: { ascii: "Times New Roman", eastAsia: "SimHei" },
          size: 28,
          bold: true,
          color: c(P.primary),
        },
      },
      heading3: {
        run: {
          font: { ascii: "Times New Roman", eastAsia: "SimHei" },
          size: 26,
          bold: true,
          color: c(P.accent),
        },
      },
    },
  },
  sections: [
    // ─── SECTION 1: COVER ───
    {
      properties: {
        page: {
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
        },
      },
      children: [buildCover()],
    },
    // ─── SECTION 2: BODY ───
    {
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: c(P.secondary) })],
            }),
          ],
        }),
      },
      children: [
        ...sectionExecutiveSummary(),
        ...sectionSkillStack(),
        ...sectionOption1(),
        ...sectionOption2(),
        ...sectionOption3(),
        ...sectionOption4(),
        ...sectionOption5(),
        ...sectionComparison(),
        ...sectionImplementation(),
      ],
    },
  ],
});

// ─── GENERATE ───
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("/home/z/my-project/download/Prompt_Redesign_Options_Senior_Design_Architect.docx", buf);
  console.log("Document generated successfully.");
});
