#!/usr/bin/env python3
"""
Skill & Skill Stack Architecture — Deep Audit PDF Generator
Comprehensive multi-perspective analysis document.
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'skills', 'pdf', 'scripts'))

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, mm
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, CondPageBreak, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ── Fonts ──
pdfmetrics.registerFont(TTFont('DejaVuSerif', '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSerif-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Carlito', '/usr/share/fonts/truetype/english/Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Carlito-Bold', '/usr/share/fonts/truetype/english/Carlito-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf'))
registerFontFamily('DejaVuSerif', normal='DejaVuSerif', bold='DejaVuSerif-Bold')
registerFontFamily('Carlito', normal='Carlito', bold='Carlito-Bold')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans-Bold')

# ── Palette ──
ACCENT       = colors.HexColor('#582ed8')
TEXT_PRIMARY  = colors.HexColor('#21201e')
TEXT_MUTED    = colors.HexColor('#827d75')
BG_SURFACE   = colors.HexColor('#e1deda')
BG_PAGE      = colors.HexColor('#eeedea')
TABLE_HEADER_COLOR = ACCENT
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = BG_SURFACE

# ── Page Setup ──
PAGE_W, PAGE_H = A4
LEFT_MARGIN = 1.0 * inch
RIGHT_MARGIN = 1.0 * inch
TOP_MARGIN = 0.8 * inch
BOTTOM_MARGIN = 0.8 * inch
AVAILABLE_W = PAGE_W - LEFT_MARGIN - RIGHT_MARGIN

# ── Styles ──
styles = getSampleStyleSheet()

h1_style = ParagraphStyle(
    'H1Custom', fontName='DejaVuSerif', fontSize=20, leading=28,
    textColor=ACCENT, spaceBefore=18, spaceAfter=10, alignment=TA_LEFT
)
h2_style = ParagraphStyle(
    'H2Custom', fontName='DejaVuSerif', fontSize=14, leading=20,
    textColor=TEXT_PRIMARY, spaceBefore=14, spaceAfter=8, alignment=TA_LEFT
)
h3_style = ParagraphStyle(
    'H3Custom', fontName='DejaVuSerif', fontSize=12, leading=17,
    textColor=TEXT_PRIMARY, spaceBefore=10, spaceAfter=6, alignment=TA_LEFT
)
body_style = ParagraphStyle(
    'BodyCustom', fontName='DejaVuSerif', fontSize=10.5, leading=16,
    textColor=TEXT_PRIMARY, spaceBefore=0, spaceAfter=6, alignment=TA_JUSTIFY
)
muted_style = ParagraphStyle(
    'MutedCustom', fontName='DejaVuSerif', fontSize=9.5, leading=14,
    textColor=TEXT_MUTED, spaceBefore=0, spaceAfter=4, alignment=TA_LEFT
)
callout_style = ParagraphStyle(
    'CalloutCustom', fontName='DejaVuSerif', fontSize=11, leading=17,
    textColor=ACCENT, spaceBefore=8, spaceAfter=8, alignment=TA_LEFT,
    leftIndent=18, borderPadding=6
)
code_style = ParagraphStyle(
    'CodeCustom', fontName='DejaVuSans', fontSize=8.5, leading=13,
    textColor=colors.HexColor('#c7254e'), spaceBefore=4, spaceAfter=4,
    alignment=TA_LEFT, backColor=colors.HexColor('#f9f2f4'),
    leftIndent=12, rightIndent=12, borderPadding=4
)
header_cell_style = ParagraphStyle(
    'HeaderCell', fontName='DejaVuSerif', fontSize=9.5, leading=13,
    textColor=TABLE_HEADER_TEXT, alignment=TA_CENTER
)
cell_style = ParagraphStyle(
    'CellStyle', fontName='DejaVuSerif', fontSize=9, leading=13,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT
)
cell_center = ParagraphStyle(
    'CellCenter', fontName='DejaVuSerif', fontSize=9, leading=13,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER
)
confidence_high = ParagraphStyle(
    'ConfHigh', fontName='DejaVuSerif', fontSize=9, leading=13,
    textColor=colors.HexColor('#16a34a'), alignment=TA_CENTER
)
confidence_med = ParagraphStyle(
    'ConfMed', fontName='DejaVuSerif', fontSize=9, leading=13,
    textColor=colors.HexColor('#d97706'), alignment=TA_CENTER
)
confidence_low = ParagraphStyle(
    'ConfLow', fontName='DejaVuSerif', fontSize=9, leading=13,
    textColor=colors.HexColor('#dc2626'), alignment=TA_CENTER
)

def conf_style(level):
    if level >= 8: return confidence_high
    elif level >= 5: return confidence_med
    return confidence_low

def make_table(data, col_widths, has_header=True):
    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
    ]
    if has_header:
        style_cmds += [
            ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
            ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ]
        for i in range(1, len(data)):
            bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
            style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t

def hr():
    return HRFlowable(width='100%', thickness=0.5, color=TEXT_MUTED, spaceBefore=8, spaceAfter=8)

def section_break():
    return Spacer(1, 18)

# ── Build Document ──
output_path = '/home/z/my-project/download/skill_stack_deep_audit.pdf'

doc = SimpleDocTemplate(
    output_path, pagesize=A4,
    leftMargin=LEFT_MARGIN, rightMargin=RIGHT_MARGIN,
    topMargin=TOP_MARGIN, bottomMargin=BOTTOM_MARGIN,
    title='Skill & Skill Stack Architecture - Deep Audit',
    author='Z.ai', creator='Z.ai'
)

story = []

# ══════════════════════════════════════════════════════════════
# SECTION 1: COVER
# ══════════════════════════════════════════════════════════════
story.append(Spacer(1, 120))
story.append(Paragraph('<b>SKILL &amp; SKILL STACK ARCHITECTURE</b>', ParagraphStyle(
    'CoverTitle', fontName='DejaVuSerif', fontSize=32, leading=40,
    textColor=ACCENT, alignment=TA_LEFT, spaceAfter=12
)))
story.append(Paragraph('<b>Deep Audit</b>', ParagraphStyle(
    'CoverSubtitle', fontName='DejaVuSerif', fontSize=22, leading=28,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceAfter=24
)))
story.append(HRFlowable(width='60%', thickness=2, color=ACCENT, spaceBefore=0, spaceAfter=20))
story.append(Paragraph('Multi-Perspective Analysis: Contrarian Review, Staff Engineer Code Review, YC Partner Assessment, Bottleneck Profiling, Decision Trees, and 3 Wildly Different Architectures', ParagraphStyle(
    'CoverDesc', fontName='DejaVuSerif', fontSize=11, leading=17,
    textColor=TEXT_MUTED, alignment=TA_LEFT, spaceAfter=36
)))
story.append(Paragraph('June 2026 | Version 1.0 | Confidential', ParagraphStyle(
    'CoverMeta', fontName='DejaVuSerif', fontSize=10, leading=14,
    textColor=TEXT_MUTED, alignment=TA_LEFT
)))
story.append(PageBreak())

# ══════════════════════════════════════════════════════════════
# SECTION 2: EXECUTIVE SUMMARY
# ══════════════════════════════════════════════════════════════
story.append(Paragraph('<b>1. Executive Summary</b>', h1_style))
story.append(hr())

story.append(Paragraph('<b>Is the skill and skill stack system working?</b>', h2_style))

story.append(Paragraph(
    'Working is doing a lot of heavy lifting in that question. The system renders 64 skills, provides search/filter/graph views, and copies install commands to clipboard. That works. But the deeper question is whether the architecture serves its stated purpose as a "Skill Stack Architecture" or whether it is, in practice, a skill catalog with delusions of orchestration. The honest answer: it is a catalog. The "stack" part is a fiction. The "pipeline" is a clipboard copy. There is no composition, no execution, no feedback loop, and no persistence beyond localStorage. The 8 MCP stacks in stacks.json are completely disconnected from the UI. Skills are hardcoded in a TypeScript file that requires a code change and redeploy to update. The entire "pipeline" is a bash script generation feature that copies text to the clipboard. If the user pastes it into a terminal and runs it, there is zero feedback, zero status tracking, and zero error handling for what happens after the clipboard.', body_style
))

story.append(Paragraph('<b>The #1 Bottleneck (Profile Before You Optimize)</b>', h2_style))

story.append(Paragraph(
    'The bottleneck is not performance. The bottleneck is architectural: there is no skill execution runtime. The system has no way to know whether a skill was installed successfully, whether it is being used, or whether it conflicts with another skill. The "pipeline" is purely a text-generation feature. This means the system cannot provide the one thing that would make it genuinely useful: confidence that a skill stack works as a coherent unit. The SP-7 scoring algorithm, the heatmap, the radar charts, the design options, the compatibility matrix in stacks.json — all of these are sophisticated analysis tools that produce recommendations which the system itself cannot validate or enforce. The gap between "recommending a stack" and "verifying a stack works" is the entire value gap.', body_style
))

story.append(Paragraph('<b>The 80/20 Version</b>', h2_style))

data_8020 = [
    [Paragraph('<b>Component</b>', header_cell_style), Paragraph('<b>Value Delivered</b>', header_cell_style), Paragraph('<b>Complexity Cost</b>', header_cell_style), Paragraph('<b>Keep?</b>', header_cell_style)],
    [Paragraph('Skill catalog + search', cell_style), Paragraph('Core value: discover and copy install commands', cell_style), Paragraph('Low', cell_center), Paragraph('YES', cell_center)],
    [Paragraph('Tier architecture', cell_style), Paragraph('Dependency ordering prevents broken installs', cell_style), Paragraph('Low', cell_center), Paragraph('YES', cell_center)],
    [Paragraph('Basket + clipboard', cell_style), Paragraph('Batch install workflow', cell_style), Paragraph('Low', cell_center), Paragraph('YES', cell_center)],
    [Paragraph('Skill detail drawer', cell_style), Paragraph('SKILL.md content, related skills', cell_style), Paragraph('Medium', cell_center), Paragraph('YES', cell_center)],
    [Paragraph('Graph view', cell_style), Paragraph('Visual, but tag-overlap connections are weak signal', cell_style), Paragraph('High', cell_center), Paragraph('MAYBE', cell_center)],
    [Paragraph('SP-7 scoring + radar', cell_style), Paragraph('Looks sophisticated, but vectors are derived, not measured', cell_style), Paragraph('High', cell_center), Paragraph('NO', cell_center)],
    [Paragraph('Design options (5)', cell_style), Paragraph('Opinionated presets, but no one can act on them', cell_style), Paragraph('High', cell_center), Paragraph('NO', cell_center)],
    [Paragraph('Heatmap (16 skills)', cell_style), Paragraph('Only covers S01-S16, not S17-S64', cell_style), Paragraph('Medium', cell_center), Paragraph('NO', cell_center)],
    [Paragraph('MCP stacks (stacks.json)', cell_style), Paragraph('Zero UI integration. Dead data.', cell_style), Paragraph('Medium', cell_center), Paragraph('NO (as-is)', cell_center)],
    [Paragraph('AI Portal Gateway', cell_style), Paragraph('Keyword routing table. Not AI.', cell_style), Paragraph('Medium', cell_center), Paragraph('NO', cell_center)],
]
story.append(make_table(data_8020, [AVAILABLE_W*0.22, AVAILABLE_W*0.38, AVAILABLE_W*0.15, AVAILABLE_W*0.12]))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 1: 80/20 Analysis — What delivers value vs. what costs complexity', muted_style))

story.append(Paragraph(
    'The 80/20 version is: a searchable skill catalog with tier ordering, a basket for batch install, and a detail drawer that shows SKILL.md content. Everything else — the SP-7 engine, the design options, the heatmap, the AI portal, the graph view — is decorative complexity that creates the appearance of sophistication without the substance. Remove those five sections and the system loses zero core functionality while shedding approximately 60% of its code complexity.', body_style
))

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════
# SECTION 3: SYSTEM ARCHITECTURE MAP
# ══════════════════════════════════════════════════════════════
story.append(Paragraph('<b>2. System Architecture Map</b>', h1_style))
story.append(hr())

story.append(Paragraph('<b>Live Data Paths (Active)</b>', h2_style))

data_arch_live = [
    [Paragraph('<b>Source</b>', header_cell_style), Paragraph('<b>Consumer</b>', header_cell_style), Paragraph('<b>Transport</b>', header_cell_style), Paragraph('<b>Status</b>', header_cell_style)],
    [Paragraph('skill-data.ts (64 skills)', cell_style), Paragraph('SkillMarketplace, SkillReference, TierArchitecture, DesignAlgorithm, AIPortalGateway, SectionMapping, ImplementationBlueprint', cell_style), Paragraph('Static import', cell_center), Paragraph('ACTIVE', cell_center)],
    [Paragraph('skill-store.ts (Zustand)', cell_style), Paragraph('SkillCard, SkillDetailDrawer, ClipboardPanel, BasketPanel, SkillMarketplace', cell_style), Paragraph('React context', cell_center), Paragraph('ACTIVE', cell_center)],
    [Paragraph('skills-local/*/SKILL.md', cell_style), Paragraph('SkillMarkdownRenderer', cell_style), Paragraph('API fetch + filesystem', cell_center), Paragraph('ACTIVE', cell_center)],
]
story.append(make_table(data_arch_live, [AVAILABLE_W*0.25, AVAILABLE_W*0.35, AVAILABLE_W*0.18, AVAILABLE_W*0.12]))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 2: Active data paths in the system', muted_style))

story.append(Spacer(1, 12))
story.append(Paragraph('<b>Dead Data Paths (No UI Consumer)</b>', h2_style))

data_arch_dead = [
    [Paragraph('<b>Source</b>', header_cell_style), Paragraph('<b>Records</b>', header_cell_style), Paragraph('<b>Consumer</b>', header_cell_style), Paragraph('<b>Status</b>', header_cell_style)],
    [Paragraph('skills-local/stacks.json', cell_style), Paragraph('8 MCP stacks', cell_center), Paragraph('NONE', cell_center), Paragraph('DEAD', cell_center)],
    [Paragraph('skills-local/mcp-registry.json', cell_style), Paragraph('78 MCP servers', cell_center), Paragraph('NONE', cell_center), Paragraph('DEAD', cell_center)],
    [Paragraph('skills.json (root)', cell_style), Paragraph('50+ skill manifests', cell_center), Paragraph('NONE', cell_center), Paragraph('DEAD', cell_center)],
    [Paragraph('prisma/schema.prisma', cell_style), Paragraph('User/Post models', cell_center), Paragraph('db.ts stub (unused)', cell_center), Paragraph('DEAD', cell_center)],
    [Paragraph('upload/skills_trending.json', cell_style), Paragraph('Scraped HTML', cell_center), Paragraph('NONE', cell_center), Paragraph('DEAD', cell_center)],
]
story.append(make_table(data_arch_dead, [AVAILABLE_W*0.28, AVAILABLE_W*0.18, AVAILABLE_W*0.25, AVAILABLE_W*0.12]))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 3: Dead data paths — data exists but no component consumes it', muted_style))

story.append(Spacer(1, 12))
story.append(Paragraph(
    'The architecture has a striking imbalance: 4 active data paths serving 12+ components, but 5 dead data paths containing the most potentially valuable data (MCP stacks, MCP registry, full skill manifests, database schema). The stacks.json file contains 8 carefully curated MCP server combinations with compatibility matrices, synergy rules, and conflict detection — none of which is surfaced in the UI. The mcp-registry.json has 78 MCP servers with ratings and download counts — again, invisible to users. The Prisma schema is a stub that logs a warning when initialized. These represent the largest untapped value in the codebase.', body_style
))

story.append(Paragraph('<b>The Two-Registry Problem</b>', h2_style))

story.append(Paragraph(
    'There are two completely independent skill registries that are never synchronized: skill-data.ts (64 curated skills with tier/category/tag metadata) and skills.json at the project root (50+ skills in the agentskills.io format with directory/type/has_scripts metadata). These use different schemas, different ID systems, and different categorization schemes. Any change to one must be manually replicated to the other, and there is no validation that they stay in sync. This is a classic dual-write problem that will silently diverge over time.', body_style
))

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════
# SECTION 4: THE CONTRARIAN VIEW
# ══════════════════════════════════════════════════════════════
story.append(Paragraph('<b>3. The Contrarian View</b>', h1_style))
story.append(hr())

story.append(Paragraph('<b>Find the Flaw First</b>', h2_style))

story.append(Paragraph(
    'The fundamental flaw: this system confuses curation with orchestration. It treats skills as catalog items to be browsed and collected, when their actual value comes from composition and execution. A skill is not a product you add to a shopping cart. A skill is a behavioral contract — it specifies how an AI agent should think and act in a particular domain. The current architecture has no model for what happens when skills interact, conflict, or compose. The tier system (T0-T3) implies dependency ordering, but the system never enforces or even checks these dependencies at install time. The "pipeline" generates a bash script with "set -e" and hopes for the best.', body_style
))

story.append(Paragraph('<b>What a Contrarian Would Say</b>', h2_style))

data_contrarian = [
    [Paragraph('<b>Contrarian Claim</b>', header_cell_style), Paragraph('<b>Confidence</b>', header_cell_style), Paragraph('<b>Second-Order Effect</b>', header_cell_style)],
    [Paragraph('"This is a brochure, not a product. Nobody needs a brochure for CLI commands."', cell_style), Paragraph('9/10', conf_style(9)), Paragraph('Users will copy the install command once and never return — zero retention', cell_style)],
    [Paragraph('"The SP-7 scoring is numerology. The vectors are derived from tier+category, not measured from anything real."', cell_style), Paragraph('9/10', conf_style(9)), Paragraph('If someone relies on SP-7 for decisions, they are optimizing a phantom', cell_style)],
    [Paragraph('"The \'pipeline\' is an insult to the word. It generates a bash script. That is not a pipeline."', cell_style), Paragraph('8/10', conf_style(8)), Paragraph('Users who expect pipeline semantics (stages, status, rollback) will be confused and disappointed', cell_style)],
    [Paragraph('"64 skills is not a marketplace. It is a curated list. Calling it a marketplace implies supply/demand dynamics that do not exist."', cell_style), Paragraph('7/10', conf_style(7)), Paragraph('The label creates expectations of community contribution, ratings, reviews — none of which exist', cell_style)],
    [Paragraph('"The MCP stacks in stacks.json are the most valuable data in the repo, and they are completely invisible. This is like hiding your best product."', cell_style), Paragraph('9/10', conf_style(9)), Paragraph('The stacks could be the killer feature, but they are invisible and decaying', cell_style)],
    [Paragraph('"Hardcoding 64 skills in a TypeScript file is a deployment bottleneck. Every skill update requires a full rebuild and redeploy."', cell_style), Paragraph('8/10', conf_style(8)), Paragraph('Skill authors cannot self-publish; the system cannot scale beyond manual curation', cell_style)],
]
story.append(make_table(data_contrarian, [AVAILABLE_W*0.38, AVAILABLE_W*0.12, AVAILABLE_W*0.40]))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 4: Contrarian claims with confidence levels and second-order effects', muted_style))

story.append(Spacer(1, 12))
story.append(Paragraph('<b>Steelmanning the Opposite View</b>', h2_style))

story.append(Paragraph(
    'The strongest argument against the contrarian: this is a specification and reference architecture, not a production SaaS. It is designed to be a living, navigable specification that demonstrates how skills should be organized, scored, and selected. The 13-section page is a design document that happens to be executable. The SP-7 vectors are not meant to be empirically measured — they are design intent encoded as numbers, a common pattern in architecture decision records. The hardcoded skills ensure consistency and quality control that a dynamic registry would not. The "pipeline" is intentionally minimal because the actual execution happens in the AI agent\'s environment, not in this web app. The brochure IS the product — it is a specification that other implementations follow.', body_style
))

story.append(Paragraph(
    'Counter to the steelman: Even as a specification, the system should demonstrate the behaviors it prescribes. A specification for skill stack orchestration that cannot orchestrate skill stacks is a specification with unimplemented requirements. The gap between specification and demonstration undermines credibility. If you are going to prescribe SP-7 scoring, the scores should be reproducible and empirically grounded, not decorative. If you are going to define MCP stacks with compatibility matrices, the UI should render those stacks and validate them. A specification that ignores its own recommendations is not authoritative — it is aspirational.', body_style
))

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════
# SECTION 5: PROFILING BEFORE OPTIMIZATION
# ══════════════════════════════════════════════════════════════
story.append(Paragraph('<b>4. Profile Before You Optimize — The Actual Bottleneck</b>', h1_style))
story.append(hr())

story.append(Paragraph('<b>EXPLAIN ANALYZE Output Interpretation</b>', h2_style))

story.append(Paragraph(
    'If we ran EXPLAIN ANALYZE on the skill system, the query plan would look like this: the most expensive operation is not the SKILL.md fetch (one API call, filesystem read, cached by browser for the session), not the Zustand store updates (in-memory, synchronous), and not the search/filter (client-side array operations on 64 items). The most expensive operation is the gap between recommendation and action. Every piece of sophisticated analysis (SP-7 scores, design options, compatibility matrices) produces a recommendation that the user must manually interpret, manually execute, and manually verify. The cost is not computational — it is cognitive. The user does the work that the system should do.', body_style
))

data_explain = [
    [Paragraph('<b>Operation</b>', header_cell_style), Paragraph('<b>Cost</b>', header_cell_style), Paragraph('<b>Rows</b>', header_cell_style), Paragraph('<b>Bottleneck Type</b>', header_cell_style), Paragraph('<b>Actual Time</b>', header_cell_style)],
    [Paragraph('Skill catalog render', cell_style), Paragraph('0.01', cell_center), Paragraph('64', cell_center), Paragraph('Static import', cell_style), Paragraph('<1ms', cell_center)],
    [Paragraph('Search/filter', cell_style), Paragraph('0.02', cell_center), Paragraph('0-64', cell_center), Paragraph('Client array scan', cell_style), Paragraph('<1ms', cell_center)],
    [Paragraph('SKILL.md fetch', cell_style), Paragraph('1.00', cell_center), Paragraph('1', cell_center), Paragraph('Network + filesystem', cell_style), Paragraph('50-200ms', cell_center)],
    [Paragraph('Zustand store update', cell_style), Paragraph('0.01', cell_center), Paragraph('1', cell_center), Paragraph('In-memory', cell_style), Paragraph('<1ms', cell_center)],
    [Paragraph('SP-7 vector compute', cell_style), Paragraph('0.05', cell_center), Paragraph('7', cell_center), Paragraph('Tier+category lookup', cell_style), Paragraph('<1ms', cell_center)],
    [Paragraph('Pipeline script gen', cell_style), Paragraph('0.01', cell_center), Paragraph('1', cell_center), Paragraph('String template', cell_style), Paragraph('<1ms', cell_center)],
    [Paragraph('<b>User interprets recommendation and executes manually</b>', cell_style), Paragraph('<b>INFINITE</b>', conf_style(3)), Paragraph('<b>?</b>', cell_center), Paragraph('<b>Cognitive gap</b>', cell_style), Paragraph('<b>Minutes-hours</b>', cell_center)],
]
story.append(make_table(data_explain, [AVAILABLE_W*0.28, AVAILABLE_W*0.10, AVAILABLE_W*0.08, AVAILABLE_W*0.24, AVAILABLE_W*0.14]))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 5: EXPLAIN ANALYZE — the real bottleneck is cognitive, not computational', muted_style))

story.append(Spacer(1, 12))
story.append(Paragraph('<b>Metrics a Data Engineer Would Add</b>', h2_style))

story.append(Paragraph(
    'The current system has zero observability. No events are tracked. No metrics are collected. No dashboards exist. A data engineer would look at this and immediately identify that you cannot improve what you do not measure. The following metrics are ranked by impact — implementing the top 3 would provide 80% of the observability value with 20% of the instrumentation effort.', body_style
))

data_metrics = [
    [Paragraph('<b>Metric</b>', header_cell_style), Paragraph('<b>Event Type</b>', header_cell_style), Paragraph('<b>Impact Rank</b>', header_cell_style), Paragraph('<b>Schema Field</b>', header_cell_style)],
    [Paragraph('skill_install_initiated', cell_style), Paragraph('Button click', cell_center), Paragraph('1', cell_center), Paragraph('{skillId, source, timestamp}', cell_style)],
    [Paragraph('skill_detail_opened', cell_style), Paragraph('Drawer open', cell_center), Paragraph('2', cell_center), Paragraph('{skillId, tab, timestamp}', cell_style)],
    [Paragraph('basket_export_format', cell_style), Paragraph('Export click', cell_center), Paragraph('3', cell_center), Paragraph('{format, skillCount, skillIds[], timestamp}', cell_style)],
    [Paragraph('search_query', cell_style), Paragraph('Input change', cell_center), Paragraph('4', cell_center), Paragraph('{query, resultCount, filters, timestamp}', cell_style)],
    [Paragraph('skill_md_fetch_duration', cell_style), Paragraph('API response', cell_center), Paragraph('5', cell_center), Paragraph('{skillDir, duration, status, contentLength}', cell_style)],
    [Paragraph('graph_node_clicked', cell_style), Paragraph('SVG click', cell_center), Paragraph('6', cell_center), Paragraph('{skillId, connectionCount, timestamp}', cell_style)],
    [Paragraph('pipeline_run_clicked', cell_style), Paragraph('Button click', cell_center), Paragraph('7', cell_center), Paragraph('{skillCount, skillIds[], timestamp}', cell_style)],
    [Paragraph('category_filter_applied', cell_style), Paragraph('Tab click', cell_center), Paragraph('8', cell_center), Paragraph('{category, resultCount, timestamp}', cell_style)],
    [Paragraph('clipboard_copy_success', cell_style), Paragraph('API result', cell_center), Paragraph('9', cell_center), Paragraph('{method (clipboard/fallback), skillId, timestamp}', cell_style)],
    [Paragraph('design_option_selected', cell_style), Paragraph('Card click', cell_center), Paragraph('10', cell_center), Paragraph('{optionId, timestamp}', cell_style)],
]
story.append(make_table(data_metrics, [AVAILABLE_W*0.22, AVAILABLE_W*0.14, AVAILABLE_W*0.12, AVAILABLE_W*0.40]))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 6: Data engineer metrics schema, ranked by impact', muted_style))

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════
# SECTION 6: 3 WILDLY DIFFERENT APPROACHES
# ══════════════════════════════════════════════════════════════
story.append(Paragraph('<b>5. Three Wildly Different Approaches</b>', h1_style))
story.append(hr())

story.append(Paragraph('<b>Approach A: The Registry (Current, Refined)</b>', h2_style))

story.append(Paragraph(
    'Keep the catalog model but make it authoritative. Move skills from hardcoded TypeScript to a database (Prisma + SQLite). Add a CRUD API. Surface the MCP stacks from stacks.json in the UI. Add install tracking (did the npx command succeed?). Add user ratings and usage counts. The "pipeline" becomes an install orchestrator that runs commands and reports status. This is the path of least resistance — it preserves 90% of the existing code while filling the largest gaps. The 80/20 version of this approach: add Prisma models for skills/stacks, migrate the 64 skills to seed data, create 3 API endpoints (list, detail, install-status), and render the 8 MCP stacks as a new section.', body_style
))

story.append(Paragraph('<b>Approach B: The Runtime (Composition Engine)</b>', h2_style))

story.append(Paragraph(
    'Abandon the catalog metaphor entirely. Instead of listing skills, the system becomes a composition engine that takes a user goal as input and produces a validated skill stack as output. The user describes what they want to build ("I need a content marketing pipeline with image generation and SEO"), and the system uses the compatibility matrix from stacks.json, the tag overlap data, and the tier dependencies to generate a recommended stack, validate it against known conflicts, and output a single install command. This is the "paved path" approach — opinionated, validated, and safe. The user never browses 64 skills because the system does the composition for them. The 80/20 version: a single input field that maps user intent to one of the 8 pre-built MCP stacks using the intentRoutes table, with conflict validation and a one-click install button.', body_style
))

story.append(Paragraph('<b>Approach C: The Protocol (Decentralized Registry)</b>', h2_style))

story.append(Paragraph(
    'Abandon the monolith entirely. Publish skills as individual npm packages following a standard skill schema (the agentskills.io format already defined in skills.json). The web app becomes a thin registry client that fetches skill metadata from npm, renders it, and delegates installation to the user\'s package manager. MCP stacks are published as meta-packages (e.g., @skill-stacks/creative-studio) that declare skill dependencies. This is the most scalable approach — it allows community contribution, version management, and dependency resolution via existing npm tooling. The 80/20 version: publish the 64 skills as npm packages with the existing SKILL.md as the README, and replace the hardcoded skill-data.ts with a dynamic fetch from the npm registry API.', body_style
))

story.append(Spacer(1, 12))
data_approaches = [
    [Paragraph('<b>Dimension</b>', header_cell_style), Paragraph('<b>A: Registry (Refined)</b>', header_cell_style), Paragraph('<b>B: Runtime (Composition)</b>', header_cell_style), Paragraph('<b>C: Protocol (Decentralized)</b>', header_cell_style)],
    [Paragraph('Core metaphor', cell_style), Paragraph('Enhanced catalog', cell_style), Paragraph('Goal-to-stack engine', cell_style), Paragraph('npm-like registry', cell_style)],
    [Paragraph('Scalability', cell_style), Paragraph('Limited (manual curation)', cell_style), Paragraph('Medium (fixed stack presets)', cell_style), Paragraph('Unlimited (community)', cell_style)],
    [Paragraph('Implementation effort', cell_style), Paragraph('Low (2-3 weeks)', cell_style), Paragraph('Medium (4-6 weeks)', cell_style), Paragraph('High (8-12 weeks)', cell_style)],
    [Paragraph('User complexity', cell_style), Paragraph('Browse + select (familiar)', cell_style), Paragraph('Describe goal (low friction)', cell_style), Paragraph('npm install (developer-familiar)', cell_style)],
    [Paragraph('Validation capability', cell_style), Paragraph('Post-install status only', cell_style), Paragraph('Pre-install conflict check', cell_style), Paragraph('npm dependency resolution', cell_style)],
    [Paragraph('Moat', cell_style), Paragraph('Low (anyone can curate)', cell_style), Paragraph('Medium (compatibility data)', cell_style), Paragraph('High (network effects)', cell_style)],
    [Paragraph('Confidence this works', cell_style), Paragraph('9/10', conf_style(9)), Paragraph('7/10', conf_style(7)), Paragraph('5/10', conf_style(5))],
    [Paragraph('Steelmanned opposite', cell_style), Paragraph('Does not solve the composition problem; still a catalog', cell_style), Paragraph('Hard to cover edge cases; AI intent parsing is unreliable', cell_style), Paragraph('Community may not materialize; npm is not designed for skills', cell_style)],
    [Paragraph('Second-order effect', cell_style), Paragraph('Maintenance burden grows with skill count', cell_style), Paragraph('Users trust the system and stop thinking critically about stack choices', cell_style), Paragraph('Skills become packages; versioning hell, breaking changes propagate', cell_style)],
]
story.append(make_table(data_approaches, [AVAILABLE_W*0.18, AVAILABLE_W*0.26, AVAILABLE_W*0.28, AVAILABLE_W*0.28]))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 7: Three wildly different approaches — comparison matrix', muted_style))

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════
# SECTION 7: DECISION TREE
# ══════════════════════════════════════════════════════════════
story.append(Paragraph('<b>6. Decision Tree: If X Then Y</b>', h1_style))
story.append(hr())

story.append(Paragraph(
    'The following decision tree maps every branch for skill and skill stack operations. Each branch represents a distinct execution path through the system, traced from user interaction through state changes to final output.', body_style
))

data_dt = [
    [Paragraph('<b>If</b>', header_cell_style), Paragraph('<b>Then</b>', header_cell_style), Paragraph('<b>State Change</b>', header_cell_style), Paragraph('<b>External Dep</b>', header_cell_style)],
    [Paragraph('User clicks skill card', cell_style), Paragraph('Open detail drawer', cell_style), Paragraph('selectedSkillId = skill.id', cell_style), Paragraph('None', cell_center)],
    [Paragraph('User clicks SKILL.md tab', cell_style), Paragraph('Fetch markdown from API', cell_style), Paragraph('fetchReducer: FETCH_START then FETCH_SUCCESS', cell_style), Paragraph('/api/skill-content', cell_center)],
    [Paragraph('API returns 404 for SKILL.md', cell_style), Paragraph('Show "No SKILL.md available" with retry button', cell_style), Paragraph('fetchReducer: FETCH_ERROR', cell_style), Paragraph('Filesystem', cell_center)],
    [Paragraph('User clicks Copy on skill card', cell_style), Paragraph('Copy installCommand to clipboard', cell_style), Paragraph('addToClipboard() + setCopied(true)', cell_style), Paragraph('navigator.clipboard', cell_center)],
    [Paragraph('Clipboard API unavailable (HTTP)', cell_style), Paragraph('Fallback: textarea + execCommand', cell_style), Paragraph('Same state change', cell_style), Paragraph('document.execCommand', cell_center)],
    [Paragraph('User clicks Add to Basket', cell_style), Paragraph('Add skillId to basket array', cell_style), Paragraph('addToBasket(skillId)', cell_style), Paragraph('None', cell_center)],
    [Paragraph('Skill already in basket', cell_style), Paragraph('No-op (dedup)', cell_style), Paragraph('No state change', cell_style), Paragraph('None', cell_center)],
    [Paragraph('User clicks Run Pipeline', cell_style), Paragraph('Generate bash script from basket', cell_style), Paragraph('setCopied(true)', cell_style), Paragraph('navigator.clipboard', cell_center)],
    [Paragraph('Basket is empty', cell_style), Paragraph('No-op (button disabled)', cell_style), Paragraph('No state change', cell_style), Paragraph('None', cell_center)],
    [Paragraph('User clicks Export in Basket', cell_style), Paragraph('Format as script/commands/JSON', cell_style), Paragraph('setCopiedType(format)', cell_style), Paragraph('navigator.clipboard', cell_center)],
    [Paragraph('User searches by keyword', cell_style), Paragraph('Filter skills array by name/role/tags/category', cell_style), Paragraph('search state update triggers useMemo recompute', cell_style), Paragraph('None', cell_center)],
    [Paragraph('User switches to Graph view', cell_style), Paragraph('Render SVG force-directed graph', cell_style), Paragraph('viewMode = "graph"', cell_style), Paragraph('None', cell_center)],
    [Paragraph('User switches to Pipeline view', cell_style), Paragraph('Render tier-grouped flow', cell_style), Paragraph('viewMode = "pipeline"', cell_style), Paragraph('None', cell_center)],
    [Paragraph('User selects category tab', cell_style), Paragraph('Filter by category', cell_style), Paragraph('activeCategory update', cell_style), Paragraph('None', cell_center)],
    [Paragraph('User clicks MCP stack (CURRENTLY IMPOSSIBLE)', cell_style), Paragraph('No UI exists for stacks.json', cell_style), Paragraph('No state change', cell_style), Paragraph('N/A', cell_center)],
]
story.append(make_table(data_dt, [AVAILABLE_W*0.28, AVAILABLE_W*0.24, AVAILABLE_W*0.28, AVAILABLE_W*0.15]))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 8: Decision tree — all branches mapped', muted_style))

story.append(Spacer(1, 12))
story.append(Paragraph(
    'The decision tree reveals that 15 of the 16 branches are fully client-side with no external dependencies beyond the clipboard API and the single /api/skill-content endpoint. This means the system has extremely low coupling to external services, which is a strength for reliability but a weakness for value creation — there is no feedback loop from the real world. The system cannot know if a skill install succeeded, if a stack works together, or if a user found the recommendation useful. The 16th branch (MCP stack interaction) is currently impossible because no UI component consumes stacks.json.', body_style
))

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════
# SECTION 8: END-TO-END SIMULATION TRACE
# ══════════════════════════════════════════════════════════════
story.append(Paragraph('<b>7. End-to-End Simulation Trace</b>', h1_style))
story.append(hr())

story.append(Paragraph(
    'Trace one complete execution path: a user wants to install a GSAP Animations skill as part of a creative workflow.', body_style
))

data_trace = [
    [Paragraph('<b>Step</b>', header_cell_style), Paragraph('<b>Action</b>', header_cell_style), Paragraph('<b>Component</b>', header_cell_style), Paragraph('<b>State/API</b>', header_cell_style)],
    [Paragraph('1', cell_center), Paragraph('User types "gsap" in search field', cell_style), Paragraph('SkillMarketplace', cell_style), Paragraph('setSearch("gsap") triggers useMemo', cell_style)],
    [Paragraph('2', cell_center), Paragraph('useMemo filters skills array: name.includes("gsap") or tags.includes("gsap")', cell_style), Paragraph('SkillMarketplace', cell_style), Paragraph('filtered = [S05, S63] (2 results)', cell_style)],
    [Paragraph('3', cell_center), Paragraph('AnimatePresence renders 2 SkillCard components with motion.div wrappers', cell_style), Paragraph('SkillCard (x2)', cell_style), Paragraph('Each card: skill prop + useSkillStore', cell_style)],
    [Paragraph('4', cell_center), Paragraph('User clicks S05 "GSAP Animations" card', cell_style), Paragraph('SkillCard', cell_style), Paragraph('setSelectedSkill("S05")', cell_style)],
    [Paragraph('5', cell_center), Paragraph('Sheet drawer opens, selectedSkill resolved via skills.find()', cell_style), Paragraph('SkillDetailDrawer', cell_style), Paragraph('skill = skills[4] (S05)', cell_style)],
    [Paragraph('6', cell_center), Paragraph('User clicks SKILL.md tab', cell_style), Paragraph('SkillDetailDrawer', cell_style), Paragraph('Tab switch renders SkillMarkdownRenderer', cell_style)],
    [Paragraph('7', cell_center), Paragraph('skillDir derived from installCommand: "gsap-animations"', cell_style), Paragraph('SkillDetailDrawer', cell_style), Paragraph('skillDir passed as prop', cell_style)],
    [Paragraph('8', cell_center), Paragraph('useEffect triggers fetch: GET /api/skill-content?skill=gsap-animations', cell_style), Paragraph('SkillMarkdownRenderer', cell_style), Paragraph('dispatch(FETCH_START), AbortController created', cell_style)],
    [Paragraph('9', cell_center), Paragraph('API sanitizes skill name (regex check), reads skills-local/gsap-animations/SKILL.md', cell_style), Paragraph('/api/skill-content', cell_style), Paragraph('readFile() returns UTF-8 string', cell_style)],
    [Paragraph('10', cell_center), Paragraph('Response: {skill, content, length} dispatched to reducer', cell_style), Paragraph('SkillMarkdownRenderer', cell_style), Paragraph('dispatch(FETCH_SUCCESS, {content, length})', cell_style)],
    [Paragraph('11', cell_center), Paragraph('ReactMarkdown renders content with remark-gfm + prose styling', cell_style), Paragraph('SkillMarkdownRenderer', cell_style), Paragraph('DOM update: SKILL.md content visible', cell_style)],
    [Paragraph('12', cell_center), Paragraph('User clicks "Copy Command" toolbar button', cell_style), Paragraph('SkillMarkdownRenderer', cell_style), Paragraph('handleCopyCommand() called', cell_style)],
    [Paragraph('13', cell_center), Paragraph('try: navigator.clipboard.writeText(installCommand)', cell_style), Paragraph('SkillMarkdownRenderer', cell_style), Paragraph('Clipboard API call', cell_style)],
    [Paragraph('14', cell_center), Paragraph('User clicks "Add to Basket" button in Overview tab', cell_style), Paragraph('SkillDetailDrawer', cell_style), Paragraph('addToBasket("S05")', cell_style)],
    [Paragraph('15', cell_center), Paragraph('Zustand persist writes basket to localStorage key "skill-marketplace-store"', cell_style), Paragraph('skill-store.ts', cell_style), Paragraph('localStorage.setItem()', cell_style)],
    [Paragraph('16', cell_center), Paragraph('User navigates to Pipeline view, clicks "Run Pipeline"', cell_style), Paragraph('PipelineView', cell_style), Paragraph('handleRunPipeline() generates bash script', cell_style)],
    [Paragraph('17', cell_center), Paragraph('Script copied to clipboard. User pastes into terminal. System has zero visibility into what happens next.', cell_style), Paragraph('N/A', cell_style), Paragraph('SYSTEM BOUNDARY — NO FEEDBACK', cell_style)],
]
story.append(make_table(data_trace, [AVAILABLE_W*0.06, AVAILABLE_W*0.32, AVAILABLE_W*0.20, AVAILABLE_W*0.32]))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 9: End-to-end simulation trace — GSAP skill install path', muted_style))

story.append(Paragraph(
    'The trace reveals the critical boundary at step 17: the system loses all visibility once the user copies the script to their clipboard. There is no callback, no webhook, no status check, no follow-up. The system has invested significant complexity in recommending and composing skill stacks, but has zero ability to verify whether those recommendations were correct. This is the architectural equivalent of a GPS that gives directions but never learns whether you reached your destination.', body_style
))

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════
# SECTION 9: STAFF ENGINEER CODE REVIEW
# ══════════════════════════════════════════════════════════════
story.append(Paragraph('<b>8. Staff Engineer Code Review</b>', h1_style))
story.append(hr())

story.append(Paragraph('<b>Design &amp; Visual Critique</b>', h2_style))

data_design = [
    [Paragraph('<b>Element</b>', header_cell_style), Paragraph('<b>Current State</b>', header_cell_style), Paragraph('<b>Verdict</b>', header_cell_style), Paragraph('<b>Confidence</b>', header_cell_style)],
    [Paragraph('Skill card icons (emoji)', cell_style), Paragraph('11 categories x 1 emoji each. Emoji rendering inconsistent across browsers/OS.', cell_style), Paragraph('Replace with SVG icons or category color dots. Emoji is amateur-hour.', cell_style), Paragraph('8/10', conf_style(8))],
    [Paragraph('Typography', cell_style), Paragraph('font-serif for headings (browser serif), font-sans for body. No defined type scale.', cell_style), Paragraph('No typographic hierarchy. Pick 2 fonts, define a modular scale, enforce consistently.', cell_style), Paragraph('9/10', conf_style(9))],
    [Paragraph('Color system', cell_style), Paragraph('11 category colors. Some nearly identical (System #A8B2D8, Utility #A8B2D8). No dark mode strategy.', cell_style), Paragraph('Reduce to 4-5 colors. Derive variants from base. The 11-color palette is visual noise.', cell_style), Paragraph('8/10', conf_style(8))],
    [Paragraph('Green pulse dot on cards', cell_style), Paragraph('animate-ping on a 2px dot to indicate "copyable". Animated element per card x 64 cards.', cell_style), Paragraph('Remove. It is distracting and serves no information purpose that a static indicator would not.', cell_style), Paragraph('9/10', conf_style(9))],
    [Paragraph('Graph view (SVG)', cell_style), Paragraph('800x800 SVG. Categories in a ring. Tag-overlap connections. Zoom/pan/drag.', cell_style), Paragraph('Most complex component with weakest signal. Tag overlap >= 2 is noisy. Consider removing.', cell_style), Paragraph('6/10', conf_style(6))],
    [Paragraph('SP-7 radar chart', cell_style), Paragraph('Recharts RadarChart in detail drawer. 7 dimensions derived from tier+category.', cell_style), Paragraph('Chart shows derived data, not measurements. Misleading. Remove or label as "estimated".', cell_style), Paragraph('8/10', conf_style(8))],
]
story.append(make_table(data_design, [AVAILABLE_W*0.16, AVAILABLE_W*0.30, AVAILABLE_W*0.36, AVAILABLE_W*0.10]))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 10: Design and visual critique', muted_style))

story.append(Spacer(1, 12))
story.append(Paragraph('<b>Code-Level Findings</b>', h2_style))

data_code = [
    [Paragraph('<b>Finding</b>', header_cell_style), Paragraph('<b>Severity</b>', header_cell_style), Paragraph('<b>File</b>', header_cell_style), Paragraph('<b>Fix</b>', header_cell_style)],
    [Paragraph('Clipboard pattern duplicated 9x inline instead of using shared copyToClipboard()', cell_style), Paragraph('Medium', cell_center), Paragraph('SkillCard, SkillDetailDrawer, SkillMarkdownRenderer (x2), ClipboardPanel (x2), PipelineView, BasketPanel, SkillMarketplace', cell_style), Paragraph('Replace all inline patterns with import from @/lib/clipboard', cell_style)],
    [Paragraph('tierColors defined independently in SkillMarketplace and SkillCard', cell_style), Paragraph('Low', cell_center), Paragraph('SkillMarketplace.tsx, SkillCard.tsx', cell_style), Paragraph('Extract to shared constant', cell_style)],
    [Paragraph('SP-7 vectors computed at runtime from tierBaseVectors + categoryAdjustments, not stored on Skill object', cell_style), Paragraph('Medium', cell_center), Paragraph('SkillDetailDrawer.tsx', cell_style), Paragraph('Pre-compute and store on Skill, or remove SP-7 entirely', cell_style)],
    [Paragraph('Mock install counts ("500K+", "200K+") presented as real data', cell_style), Paragraph('High', cell_center), Paragraph('SkillDetailDrawer.tsx (tierInstallCounts)', cell_style), Paragraph('Remove or clearly label as estimates', cell_style)],
    [Paragraph('No caching on SKILL.md content — every drawer open is a fresh fetch', cell_style), Paragraph('Medium', cell_center), Paragraph('SkillMarkdownRenderer.tsx', cell_style), Paragraph('Add SWR/React Query with stale-while-revalidate', cell_style)],
    [Paragraph('No rate limiting on /api/skill-content', cell_style), Paragraph('Medium', cell_center), Paragraph('api/skill-content/route.ts', cell_style), Paragraph('Add simple rate limit middleware (e.g., 60 req/min per IP)', cell_style)],
    [Paragraph('heatmapData only covers S01-S16 (16 of 64 skills)', cell_style), Paragraph('Medium', cell_center), Paragraph('skill-data.ts', cell_style), Paragraph('Either extend to all 64 skills or remove the heatmap section', cell_style)],
    [Paragraph('BasketPanel resolves skills via skills.find() with silent .filter(Boolean) for missing', cell_style), Paragraph('Low', cell_center), Paragraph('BasketPanel.tsx', cell_style), Paragraph('Log warning when skill ID not found in registry', cell_style)],
]
story.append(make_table(data_code, [AVAILABLE_W*0.26, AVAILABLE_W*0.10, AVAILABLE_W*0.28, AVAILABLE_W*0.30]))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 11: Staff engineer code review findings', muted_style))

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════
# SECTION 10: YC PARTNER REVIEW
# ══════════════════════════════════════════════════════════════
story.append(Paragraph('<b>9. YC Partner Review</b>', h1_style))
story.append(hr())

story.append(Paragraph(
    'Is this idea investable? No — not in its current form. Here is why, and what would change the answer.', body_style
))

data_yc = [
    [Paragraph('<b>Question</b>', header_cell_style), Paragraph('<b>Assessment</b>', header_cell_style), Paragraph('<b>Confidence</b>', header_cell_style)],
    [Paragraph('Is there a real problem?', cell_style), Paragraph('Yes. AI agent skill discovery and composition is genuinely hard. Developers waste hours finding, evaluating, and debugging skill combinations. The MCP stack compatibility problem is real and getting worse as the ecosystem grows.', cell_style), Paragraph('8/10', conf_style(8))],
    [Paragraph('Is this the right solution?', cell_style), Paragraph('Partially. A skill registry is necessary but not sufficient. The current implementation is a catalog, not a platform. The value is in validation and composition, not in listing.', cell_style), Paragraph('7/10', conf_style(7))],
    [Paragraph('Is there a moat?', cell_style), Paragraph('Currently, no. Anyone can curate a list of 64 skills. The compatibility matrix in stacks.json is the beginning of a moat, but it is hidden and unvalidated. The moat would be: validated stacks with install success rates, community contributions, and integration depth with AI agent frameworks.', cell_style), Paragraph('6/10', conf_style(6))],
    [Paragraph('Can this scale?', cell_style), Paragraph('Not with hardcoded TypeScript. The system cannot accept community contributions, cannot handle version conflicts, and cannot grow beyond manual curation. A database-backed registry with a contribution pipeline is table stakes for scale.', cell_style), Paragraph('9/10', conf_style(9))],
    [Paragraph('What is the business model?', cell_style), Paragraph('Unclear. Free skill curation has no revenue. Premium validated stacks? Enterprise skill governance? Skill marketplace with transaction fees? The current system does not suggest any of these.', cell_style), Paragraph('7/10', conf_style(7))],
    [Paragraph('What would change the answer?', cell_style), Paragraph('Three things: (1) Validate stacks with real install success rates, creating data that nobody else has. (2) Open skill contribution to the community, creating network effects. (3) Integrate with AI agent frameworks (OpenCode, Claude Code, Cursor) as the default skill discovery layer, creating distribution.', cell_style), Paragraph('7/10', conf_style(7))],
]
story.append(make_table(data_yc, [AVAILABLE_W*0.20, AVAILABLE_W*0.62, AVAILABLE_W*0.10]))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 12: YC partner assessment', muted_style))

story.append(Spacer(1, 12))
story.append(Paragraph('<b>What Am I Missing or Not Asking?</b>', h2_style))

story.append(Paragraph(
    'The questions not being asked are more revealing than the ones that are. Here are the six questions this audit has not addressed that would materially change the analysis:', body_style
))

story.append(Paragraph(
    '<b>1. Who is the actual user?</b> The system seems designed for developers who use AI coding agents (OpenCode, Claude Code). But it is built as a web app, which developers visit briefly and leave. The real integration point is inside the agent, not the browser. Why is this a website instead of an MCP server that agents can query directly?', body_style
))
story.append(Paragraph(
    '<b>2. What happens after install?</b> The system treats skill installation as the end of the journey. But the real value of a skill is in how it changes agent behavior. Is there any mechanism to verify that an installed skill actually affects agent behavior? If not, the entire pipeline is faith-based.', body_style
))
story.append(Paragraph(
    '<b>3. How do skills conflict?</b> The stacks.json has a conflict matrix for MCP servers. But what about skill-level conflicts? Can two skills give contradictory instructions to an agent? What happens when "Chromatic Minimal" and "Neo-Industrial" are both installed? The system has no model for skill-level conflicts.', body_style
))
story.append(Paragraph(
    '<b>4. What is the update story?</b> Skills are installed via npx, which fetches the latest version. But the web app shows a static snapshot. If a skill author updates their SKILL.md, the web app will not reflect it until the next code deploy. There is no webhook, no polling, no freshness indicator.', body_style
))
story.append(Paragraph(
    '<b>5. What is the uninstall story?</b> The system has no concept of uninstall. If a skill causes problems, the user is on their own. A registry that cannot help you undo what it helped you do is dangerous.', body_style
))
story.append(Paragraph(
    '<b>6. Where is the telemetry?</b> Not analytics for the sake of analytics, but operational telemetry. Which skills are actually installed and working? Which stacks fail? Which skills are never used? Without this feedback loop, curation is blind guessing.', body_style
))

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════
# SECTION 11: WHAT CAN BE DELETED
# ══════════════════════════════════════════════════════════════
story.append(Paragraph('<b>10. What Can Be Deleted Without Losing Value</b>', h1_style))
story.append(hr())

data_delete = [
    [Paragraph('<b>Component</b>', header_cell_style), Paragraph('<b>Lines of Code (est.)</b>', header_cell_style), Paragraph('<b>Value Lost</b>', header_cell_style), Paragraph('<b>Confidence</b>', header_cell_style)],
    [Paragraph('DesignAlgorithm.tsx (SP-7 scoring engine)', cell_style), Paragraph('~300', cell_center), Paragraph('Decorative — scores are derived, not measured. No one acts on them.', cell_style), Paragraph('9/10', conf_style(9))],
    [Paragraph('Options Showcase section (5 design options)', cell_style), Paragraph('~200', cell_center), Paragraph('Opinionated presets with no enforcement mechanism. Pure display.', cell_style), Paragraph('8/10', conf_style(8))],
    [Paragraph('Heatmap section (16 skills only)', cell_style), Paragraph('~150', cell_center), Paragraph('Covers only 25% of skills. Incomplete = misleading.', cell_style), Paragraph('9/10', conf_style(9))],
    [Paragraph('AIPortalGateway.tsx (keyword routing)', cell_style), Paragraph('~200', cell_center), Paragraph('A static keyword matching table pretending to be AI. No actual AI.', cell_style), Paragraph('8/10', conf_style(8))],
    [Paragraph('ComparisonMatrix section', cell_style), Paragraph('~100', cell_center), Paragraph('Compares 5 design options that cannot be acted upon. Display only.', cell_style), Paragraph('7/10', conf_style(7))],
    [Paragraph('SkillGraph.tsx (SVG graph)', cell_style), Paragraph('~250', cell_center), Paragraph('Weakest signal (tag overlap >= 2 is noisy). Most complex component.', cell_style), Paragraph('6/10', conf_style(6))],
    [Paragraph('Mock install counts (tierInstallCounts)', cell_style), Paragraph('~5', cell_center), Paragraph('Fake data presented as real. Actively misleading.', cell_style), Paragraph('10/10', conf_style(10))],
    [Paragraph('Prisma schema (User/Post models)', cell_style), Paragraph('~30', cell_center), Paragraph('Completely unused stub. db.ts logs a warning.', cell_style), Paragraph('10/10', conf_style(10))],
    [Paragraph('skills.json at root (agentskills.io format)', cell_style), Paragraph('~2000', cell_center), Paragraph('Duplicate registry, different schema, no consumer. Source of confusion.', cell_style), Paragraph('8/10', conf_style(8))],
    [Paragraph('upload/skills_trending.json', cell_style), Paragraph('~5000', cell_center), Paragraph('Scraped HTML payload. No consumer. No processing.', cell_style), Paragraph('10/10', conf_style(10))],
]
story.append(make_table(data_delete, [AVAILABLE_W*0.28, AVAILABLE_W*0.12, AVAILABLE_W*0.42, AVAILABLE_W*0.10]))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 13: Deletion candidates — what can be removed without losing core value', muted_style))

story.append(Spacer(1, 12))
story.append(Paragraph(
    'Total estimated code reduction: approximately 8,235 lines of code, configuration, and data files. The remaining system would be: skill-data.ts (64 skills), SkillMarketplace (grid view + search/filter/tier tabs), SkillCard, SkillDetailDrawer (overview + SKILL.md tabs), BasketPanel, ClipboardPanel, SkillReference table, ImplementationBlueprint, TierArchitecture, and the /api/skill-content endpoint. This is a focused, high-value system that does one thing well: help developers discover, evaluate, and install AI agent skills. Everything else is scope creep that dilutes the core value proposition.', body_style
))

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════
# SECTION 12: DATA ENGINEER METRICS SCHEMA
# ══════════════════════════════════════════════════════════════
story.append(Paragraph('<b>11. Data Engineer Metrics Schema</b>', h1_style))
story.append(hr())

story.append(Paragraph(
    'The current Prisma schema has only User and Post models, neither of which is used. A data engineer would replace these with models that capture the actual domain: skills, stacks, installations, and user interactions. The following schema is ranked by implementation impact — the top 3 models provide 80% of the analytical value.', body_style
))

data_schema = [
    [Paragraph('<b>Model</b>', header_cell_style), Paragraph('<b>Key Fields</b>', header_cell_style), Paragraph('<b>Impact Rank</b>', header_cell_style), Paragraph('<b>Enables</b>', header_cell_style)],
    [Paragraph('SkillInstall', cell_style), Paragraph('skillId, userId, status (success/fail), duration, error, timestamp', cell_style), Paragraph('1', cell_center), Paragraph('Install success rates, failure patterns, skill reliability scoring', cell_style)],
    [Paragraph('SkillView', cell_style), Paragraph('skillId, userId, source (search/browse/detail), tab, duration, timestamp', cell_style), Paragraph('2', cell_center), Paragraph('Discovery funnel, skill popularity, time-on-page analytics', cell_style)],
    [Paragraph('StackComposition', cell_style), Paragraph('stackId, skillIds[], userId, validationStatus, conflicts[], timestamp', cell_style), Paragraph('3', cell_center), Paragraph('Stack usage patterns, conflict frequency, composition validation', cell_style)],
    [Paragraph('SearchEvent', cell_style), Paragraph('query, filters, resultCount, clickedSkillId, timestamp', cell_style), Paragraph('4', cell_center), Paragraph('Search quality, zero-result rate, intent classification training data', cell_style)],
    [Paragraph('SkillFeedback', cell_style), Paragraph('skillId, userId, rating (1-5), review, timestamp', cell_style), Paragraph('5', cell_center), Paragraph('Community quality signals, curation validation, ranking improvements', cell_style)],
    [Paragraph('SkillVersion', cell_style), Paragraph('skillId, version, changelog, breakingChanges, timestamp', cell_style), Paragraph('6', cell_center), Paragraph('Version management, breaking change detection, compatibility tracking', cell_style)],
    [Paragraph('ConflictReport', cell_style), Paragraph('skillA, skillB, conflictType, severity, description, timestamp', cell_style), Paragraph('7', cell_center), Paragraph('Empirical conflict data replacing theoretical compatibility matrix', cell_style)],
]
story.append(make_table(data_schema, [AVAILABLE_W*0.16, AVAILABLE_W*0.30, AVAILABLE_W*0.10, AVAILABLE_W*0.36]))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 14: Data engineer metrics schema, ranked by impact', muted_style))

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════
# SECTION 13: EXTERNAL DEPENDENCIES & SUB-AGENT BREAKDOWN
# ══════════════════════════════════════════════════════════════
story.append(Paragraph('<b>12. External Dependencies &amp; Sub-Agent Breakdown</b>', h1_style))
story.append(hr())

story.append(Paragraph('<b>External API and Service Dependencies</b>', h2_style))

data_deps = [
    [Paragraph('<b>Dependency</b>', header_cell_style), Paragraph('<b>Type</b>', header_cell_style), Paragraph('<b>Risk</b>', header_cell_style), Paragraph('<b>Failure Mode</b>', header_cell_style)],
    [Paragraph('navigator.clipboard API', cell_style), Paragraph('Browser API', cell_center), Paragraph('Low', cell_center), Paragraph('Unavailable in HTTP/iframe; fallback to textarea works', cell_style)],
    [Paragraph('/api/skill-content (filesystem read)', cell_style), Paragraph('Internal API', cell_center), Paragraph('Low', cell_center), Paragraph('Returns 404 if SKILL.md missing; graceful degradation in UI', cell_style)],
    [Paragraph('localStorage (Zustand persist)', cell_style), Paragraph('Browser storage', cell_center), Paragraph('Low', cell_center), Paragraph('Quota exceeded on 20 clipboard + N basket items; unlikely', cell_style)],
    [Paragraph('npx skills add (external CLI)', cell_style), Paragraph('External CLI', cell_center), Paragraph('High', cell_center), Paragraph('Network failure, npm registry downtime, package not found — NO FEEDBACK', cell_style)],
    [Paragraph('Framer Motion', cell_style), Paragraph('npm package', cell_center), Paragraph('Low', cell_center), Paragraph('Bundle size; animation jank on low-end devices', cell_style)],
    [Paragraph('Recharts', cell_style), Paragraph('npm package', cell_center), Paragraph('Low', cell_center), Paragraph('Used only for radar chart in detail drawer; could be replaced with CSS', cell_style)],
    [Paragraph('react-markdown + remark-gfm', cell_style), Paragraph('npm package', cell_center), Paragraph('Low', cell_center), Paragraph('XSS risk if SKILL.md contains malicious HTML; currently no sanitization', cell_style)],
]
story.append(make_table(data_deps, [AVAILABLE_W*0.24, AVAILABLE_W*0.12, AVAILABLE_W*0.08, AVAILABLE_W*0.46]))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 15: External dependencies and failure modes', muted_style))

story.append(Spacer(1, 12))
story.append(Paragraph('<b>Sub-Agent Task Breakdown</b>', h2_style))

story.append(Paragraph(
    'If this audit were executed by autonomous sub-agents, the following decomposition would maximize parallelism while minimizing coordination overhead. Each agent has a specialized role with clear inputs and outputs.', body_style
))

data_agents = [
    [Paragraph('<b>Agent</b>', header_cell_style), Paragraph('<b>Role</b>', header_cell_style), Paragraph('<b>Input</b>', header_cell_style), Paragraph('<b>Output</b>', header_cell_style)],
    [Paragraph('Profiler', cell_style), Paragraph('Identify actual performance bottlenecks via measurement', cell_style), Paragraph('Running app URL, Chrome DevTools', cell_style), Paragraph('Flame chart, slowest components, render counts, bundle size analysis', cell_style)],
    [Paragraph('Architect', cell_style), Paragraph('Evaluate structural integrity and propose refinements', cell_style), Paragraph('Source code, data flow map', cell_style), Paragraph('Architecture diagram, coupling metrics, dead code report, migration plan', cell_style)],
    [Paragraph('Security', cell_style), Paragraph('Audit for XSS, path traversal, injection, and data exposure', cell_style), Paragraph('API routes, component props, user inputs', cell_style), Paragraph('Vulnerability report, severity ratings, fix recommendations', cell_style)],
    [Paragraph('Data', cell_style), Paragraph('Design metrics schema and validate data integrity', cell_style), Paragraph('Current Prisma schema, runtime data', cell_style), Paragraph('New schema, seed data, migration scripts, analytical queries', cell_style)],
    [Paragraph('UX', cell_style), Paragraph('Evaluate user flow, accessibility, and information architecture', cell_style), Paragraph('Running app, component tree', cell_style), Paragraph('Heuristic evaluation, accessibility audit (WCAG), flow optimization', cell_style)],
    [Paragraph('Simplifier', cell_style), Paragraph('Identify and remove unnecessary complexity', cell_style), Paragraph('Full codebase', cell_style), Paragraph('Deletion candidates, complexity metrics, 80/20 analysis, reduced scope proposal', cell_style)],
]
story.append(make_table(data_agents, [AVAILABLE_W*0.12, AVAILABLE_W*0.26, AVAILABLE_W*0.26, AVAILABLE_W*0.30]))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 16: Sub-agent task breakdown', muted_style))

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════
# SECTION 14: CONSOLIDATED FINDINGS
# ══════════════════════════════════════════════════════════════
story.append(Paragraph('<b>13. Consolidated Findings &amp; Impact Rankings</b>', h1_style))
story.append(hr())

data_consolidated = [
    [Paragraph('<b>#</b>', header_cell_style), Paragraph('<b>Finding</b>', header_cell_style), Paragraph('<b>Impact</b>', header_cell_style), Paragraph('<b>Confidence</b>', header_cell_style), Paragraph('<b>Priority</b>', header_cell_style)],
    [Paragraph('1', cell_center), Paragraph('No skill execution runtime — system cannot validate its own recommendations', cell_style), Paragraph('Critical', cell_center), Paragraph('9/10', conf_style(9)), Paragraph('P0', cell_center)],
    [Paragraph('2', cell_center), Paragraph('MCP stacks (stacks.json) are dead data — zero UI integration', cell_style), Paragraph('Critical', cell_center), Paragraph('10/10', conf_style(10)), Paragraph('P0', cell_center)],
    [Paragraph('3', cell_center), Paragraph('Hardcoded skills require code deploy to update', cell_style), Paragraph('High', cell_center), Paragraph('9/10', conf_style(9)), Paragraph('P1', cell_center)],
    [Paragraph('4', cell_center), Paragraph('Two-registry problem (skill-data.ts vs skills.json)', cell_style), Paragraph('High', cell_center), Paragraph('8/10', conf_style(8)), Paragraph('P1', cell_center)],
    [Paragraph('5', cell_center), Paragraph('Mock install counts presented as real data', cell_style), Paragraph('High', cell_center), Paragraph('10/10', conf_style(10)), Paragraph('P1', cell_center)],
    [Paragraph('6', cell_center), Paragraph('No caching on SKILL.md fetch', cell_style), Paragraph('Medium', cell_center), Paragraph('8/10', conf_style(8)), Paragraph('P2', cell_center)],
    [Paragraph('7', cell_center), Paragraph('Clipboard pattern duplicated 9x instead of using shared utility', cell_style), Paragraph('Medium', cell_center), Paragraph('9/10', conf_style(9)), Paragraph('P2', cell_center)],
    [Paragraph('8', cell_center), Paragraph('Heatmap covers only 16/64 skills', cell_style), Paragraph('Medium', cell_center), Paragraph('9/10', conf_style(9)), Paragraph('P2', cell_center)],
    [Paragraph('9', cell_center), Paragraph('No rate limiting on API routes', cell_style), Paragraph('Medium', cell_center), Paragraph('7/10', conf_style(7)), Paragraph('P2', cell_center)],
    [Paragraph('10', cell_center), Paragraph('SP-7 scoring is derived, not measured — potentially misleading', cell_style), Paragraph('Medium', cell_center), Paragraph('9/10', conf_style(9)), Paragraph('P2', cell_center)],
    [Paragraph('11', cell_center), Paragraph('No skill-level conflict detection (only MCP server conflicts)', cell_style), Paragraph('Medium', cell_center), Paragraph('7/10', conf_style(7)), Paragraph('P2', cell_center)],
    [Paragraph('12', cell_center), Paragraph('react-markdown renders SKILL.md without XSS sanitization', cell_style), Paragraph('Medium', cell_center), Paragraph('6/10', conf_style(6)), Paragraph('P2', cell_center)],
    [Paragraph('13', cell_center), Paragraph('5 sections (SP-7, options, heatmap, AI portal, comparison) deliver low value for high complexity', cell_style), Paragraph('Low', cell_center), Paragraph('8/10', conf_style(8)), Paragraph('P3', cell_center)],
    [Paragraph('14', cell_center), Paragraph('11-category color palette with duplicates; no dark mode', cell_style), Paragraph('Low', cell_center), Paragraph('7/10', conf_style(7)), Paragraph('P3', cell_center)],
]
story.append(make_table(data_consolidated, [AVAILABLE_W*0.04, AVAILABLE_W*0.42, AVAILABLE_W*0.10, AVAILABLE_W*0.10, AVAILABLE_W*0.10]))
story.append(Spacer(1, 6))
story.append(Paragraph('Table 17: Consolidated findings ranked by impact with confidence levels', muted_style))

story.append(Spacer(1, 18))
story.append(Paragraph('<b>Priority Recommendations</b>', h2_style))

story.append(Paragraph(
    '<b>P0 — Fix Immediately (Week 1):</b> Surface the 8 MCP stacks from stacks.json as a new UI section. This is the highest-value, lowest-effort change: the data already exists, the compatibility matrix already exists, and the stacks already represent validated compositions. A simple card grid showing stack name, servers, synergy description, and install button would transform the system from a catalog into a stack recommendation engine. Simultaneously, remove the mock install counts — fake data erodes trust.', body_style
))

story.append(Paragraph(
    '<b>P1 — Fix Soon (Weeks 2-3):</b> Migrate skills from hardcoded TypeScript to a Prisma database with seed data. This enables CRUD APIs, community contribution pipelines, and eliminates the deploy bottleneck. Consolidate the two registries into a single source of truth. Add install-status tracking via a simple POST endpoint that receives success/failure callbacks from the CLI.', body_style
))

story.append(Paragraph(
    '<b>P2 — Fix Eventually (Month 2):</b> Add SWR caching for SKILL.md content. Consolidate the 9 inline clipboard patterns into the shared copyToClipboard utility. Extend the heatmap to cover all 64 skills or remove it. Add rate limiting to API routes. Add a "derived/estimated" label to SP-7 scores if kept. Implement basic XSS sanitization for SKILL.md content rendering.', body_style
))

story.append(Paragraph(
    '<b>P3 — Consider (Month 3+):</b> Evaluate whether the 5 low-value sections (SP-7 engine, design options, heatmap, AI portal, comparison matrix) should be removed or redesigned. Reduce the color palette from 11 categories to 4-5 with derived variants. Implement dark mode. Replace emoji icons with SVG. These are polish items that should only be addressed after the P0-P2 items are resolved.', body_style
))

story.append(Spacer(1, 18))
story.append(Paragraph(
    'The version a senior dev would write: a searchable skill catalog backed by a database, with tier-enforced dependency ordering, a basket that generates validated install scripts, a detail drawer that shows real SKILL.md content, and an MCP stacks section that surfaces the most valuable data in the repository. Everything else is scope creep. Ship that, measure what users actually do with it, and iterate based on data — not based on what looks sophisticated in a demo.', body_style
))

# ── Build ──
doc.build(story)
print(f'PDF generated: {output_path}')
