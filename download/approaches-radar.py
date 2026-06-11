#!/usr/bin/env python3
"""Three Approaches Radar: Comparing A (DAG), B (Market), C (Flat Registry)."""

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

# ── Colors ──
C_BLUE = '#3B82F6'
C_AMBER = '#F59E0B'
C_GREEN = '#10B981'
G200 = '#E5E7EB'
G900 = '#111827'

# ── Data ──
categories = [
    'Composability',
    'Simplicity',
    'Auditability',
    'User Control',
    'Scalability',
    'Cost Efficiency',
    'Debuggability',
    'Flexibility',
]

# Scores 0-10 for each approach across each dimension
approach_a = [9, 3, 9, 6, 8, 4, 5, 6]   # Event-Sourced DAG
approach_b = [7, 5, 4, 3, 7, 6, 3, 8]   # Market-Driven
approach_c = [4, 9, 3, 9, 5, 9, 8, 9]   # Minimal Flat Registry

datasets = [approach_a, approach_b, approach_c]
series_names = ['A: Event-Sourced DAG', 'B: Market-Driven', 'C: Minimal Flat']
colors = [C_BLUE, C_AMBER, C_GREEN]

N = len(categories)
angles = np.linspace(0, 2*np.pi, N, endpoint=False).tolist()
angles += angles[:1]  # Close the polygon

fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(polar=True))
ax.set_theta_offset(np.pi / 2)
ax.set_theta_direction(-1)

ax.set_xticks(angles[:-1])
ax.set_xticklabels(categories, fontsize=10, color=G900)
ax.yaxis.set_visible(False)

# Grid beautification
ax.spines['polar'].set_color(G200)
ax.grid(color=G200, linewidth=0.5, alpha=0.5)

for data, name, color in zip(datasets, series_names, colors):
    vals = data + data[:1]  # Close the polygon
    ax.plot(angles, vals, color=color, linewidth=2.5, label=name, zorder=3)
    ax.fill(angles, vals, color=color, alpha=0.08)

# Add value labels for each point
for data, color in zip(datasets, colors):
    vals = data + data[:1]
    for i, (angle, val) in enumerate(zip(angles, vals)):
        if i < N:  # Don't label the closing point
            ax.text(angle, val + 0.35, str(val), ha='center', va='center',
                    fontsize=9, fontweight='bold', color=color, zorder=4)

ax.legend(loc='upper right', bbox_to_anchor=(1.35, 1.1), frameon=False, fontsize=10)
ax.set_title('Three Architectural Approaches Compared', pad=30,
             fontsize=16, fontweight='bold', color=G900)

fig.tight_layout()
fig.savefig('/home/z/my-project/download/approaches-radar.png', dpi=200,
            facecolor='white', bbox_inches='tight')
plt.close(fig)
print('✅ /home/z/my-project/download/approaches-radar.png')
