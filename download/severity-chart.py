#!/usr/bin/env python3
"""Severity Findings: Staff Engineer Code Review — horizontal bar chart."""

import matplotlib
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np
import os

# ── Font Setup ──
fm.fontManager.addfont('/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf')
fm.fontManager.addfont('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
plt.rcParams['font.sans-serif'] = ['Noto Serif SC', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False

# ── Color Constants ──
G900, G700, G500, G400, G300, G200, G100, G50 = \
    '#111827', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F3F4F6', '#F9FAFB'
C_RED = '#EF4444'
C_AMBER = '#F59E0B'
C_GREEN = '#10B981'
C_BLUE = '#3B82F6'

# ── Data ──
findings = [
    ('No success/failure telemetry\non skill execution', 'HIGH', 9),
    ('Skill stack = ordered list,\nno DAG, no dependency tracking', 'HIGH', 8),
    ('No partial-failure semantics\nfor stack execution', 'MED', 6),
    ('No skill version pinning\nin stacks', 'MED', 5),
    ('No cost/latency budget\nper stack', 'MED', 5),
    ('No conflict detection\nbetween stacked skills', 'MED', 5),
    ('Clipboard fallback coverage', 'RESOLVED', 2),
    ('Build/lint cleanliness', 'RESOLVED', 1),
]

labels = [f[0] for f in findings]
severities = [f[1] for f in findings]
values = [f[2] for f in findings]

# Sort by value ascending (bottom = highest)
sorted_pairs = sorted(zip(labels, values, severities), key=lambda x: x[1])
labels_s, values_s, sevs_s = zip(*sorted_pairs)

# ── Colors by severity ──
severity_colors = {
    'HIGH': C_RED,
    'MED': C_AMBER,
    'RESOLVED': C_GREEN,
}
bar_colors = [severity_colors[s] for s in sevs_s]

# ── Chart ──
fig, ax = plt.subplots(figsize=(12, 7))

bars = ax.barh(range(len(labels_s)), values_s, color=bar_colors,
               height=0.6, zorder=3, edgecolor='white', linewidth=0.5, alpha=0.85)

# Value labels
for i, (bar, val, sev) in enumerate(zip(bars, values_s, sevs_s)):
    ax.text(bar.get_width() + 0.15, bar.get_y() + bar.get_height()/2,
            f'{sev}', va='center', fontsize=9,
            color=bar_colors[i], fontweight='bold')

ax.set_yticks(range(len(labels_s)))
ax.set_yticklabels(labels_s, fontsize=10)
ax.set_xlabel('Severity Score (1-10)', fontsize=11, color=G500)
ax.set_title('Staff Engineer Audit: Findings by Severity', loc='left',
             fontsize=16, fontweight='bold', color=G900, pad=16)

ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['bottom'].set_color(G200)
ax.spines['left'].set_color(G200)
ax.xaxis.grid(True, alpha=0.08, color=G300)
ax.set_axisbelow(True)
ax.set_xlim(0, max(values_s) * 1.25)
ax.xaxis.set_visible(False)

# Legend
from matplotlib.patches import Patch
legend_elements = [
    Patch(facecolor=C_RED, alpha=0.85, label='High Severity'),
    Patch(facecolor=C_AMBER, alpha=0.85, label='Medium Severity'),
    Patch(facecolor=C_GREEN, alpha=0.85, label='Resolved'),
]
ax.legend(handles=legend_elements, loc='lower right', frameon=False, fontsize=10)

fig.tight_layout()
fig.savefig('/home/z/my-project/download/severity-findings.png', dpi=200,
            facecolor='white', bbox_inches='tight')
plt.close(fig)
print('✅ /home/z/my-project/download/severity-findings.png')
