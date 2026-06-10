---
name: photography-ai
description: Professional visual engineering framework for AI-powered image and video creation. Covers prompt engineering, photographic literacy, strategic negation, identity preservation, batch post-processing, and agent orchestration. Use for photorealistic generation, cinematic sequences, and visual production pipelines.
---

# Photography AI - Professional Visual Engineering Skills Framework

> A comprehensive, structured reference for AI-powered visual creation, covering prompt engineering, photographic literacy, strategic negation, identity preservation, post-processing, and agent orchestration.

*Version: 3.0 | Last Updated: April 2026*

---

## Context

This skill is for anyone who uses AI to generate, refine, or orchestrate visual content. It treats AI image/video generation as a professional engineering discipline: systematic, physics-informed, quality-gated, and continuously improvable.

Use this skill when:
- Generating photorealistic or stylized images with AI
- Creating cinematic video sequences from text prompts
- Building multi-step visual production pipelines
- Designing AI agent workflows for creative teams
- Troubleshooting AI generation artifacts (skin, hands, anatomy)

---

## Instructions

### Step 1: Understand the Skill Synergy Map

Skills compound. The six categories build on each other:

```
FOUNDATION
  Technical Prompt Engineering + Photographic Literacy
       |                     |
       v                     v
CONSISTENCY LAYER      REFINEMENT LAYER
  Strategic Negation    Post-Processing &
  + Identity Preserv.     Hybrid Workflows
       |                     |
       v                     v
         ORCHESTRATION LAYER
      AI Agent Design + Production Deploy
```

### Step 2: Apply Technical Prompt Engineering

Structure prompts as blueprints, not keyword lists. Follow the **Scaffold Method**:

```
[Subject] + [Action] + [Lighting] + [Lens/Specs] + [Style] + [Quality]
```

**Rules:**
- Front-load critical elements (AI weights early tokens more heavily)
- Use precise photographic vocabulary over vague buzzwords
- Use active voice for iterative edits ("remove the background", "add a red hat")
- Stack semantic concepts in deliberate order to control interpretation hierarchy

### Step 3: Apply Photographic Literacy

Use real-world physics terminology:

| Concept | What to Prompt | Effect |
|---------|---------------|--------|
| **Lighting patterns** | Rembrandt, Butterfly, Rim, Split, Loop | Sculpt form, mood, dimension |
| **Lens selection** | 85mm portrait, 35mm standard, 24mm wide | Control perspective and compression |
| **Aperture control** | f/1.4 shallow DOF, f/11 full sharpness | Control subject isolation |
| **Advanced rendering** | Subsurface scattering, ambient occlusion, ray tracing | Realistic material response |
| **Anamorphic** | Horizontal flares, elliptical bokeh, 2.39:1 ratio | Cinematic widescreen look |

### Step 4: Apply Strategic Negation

Tell the AI what NOT to include:
```
PROMPT:  visible pores, fine vellus hair, subtle skin variation
NEGATE:  (plastic skin:1.4), (airbrushed:1.2), (cartoon:1.3)
```

### Step 5: Maintain Identity Preservation

For multi-generation consistency:
1. **Seed locking**: Fix initial noise pattern with `--seed 12345`
2. **Reference tools**: Use `--cref` (character) and `--sref` (style) references
3. **Character weight**: `--cw 80` preserves face + clothing

### Step 6: Post-Processing Workflow

1. **Iterative refinement**: Keep seed, change one variable at a time
2. **Inpainting**: Fix errors (hands, eyes) via targeted masked editing
3. **External enhancement**: Upscale with Topaz, color grade
4. **Quality checklist**: hands/feet anatomy, eye direction, lighting coherence

---

## Constraints

- NEVER treat AI generation as final output -- always plan for post-processing
- NEVER skip the negative prompt step -- uncontrolled generation produces artifacts
- NEVER use vague buzzwords when technical terms exist
- NEVER forget to test at the target platform's native resolution
- NEVER generate character series without seed locking or reference tools

---

## Examples

### Example 1: Professional Headshot
```
PROMPT: Corporate headshot of a CEO, confident expression with subtle warmth, corner lighting establishing authority, dark navy suit against library background, 85mm f/2.8 shallow depth of field, photorealistic, 4K native resolution

NEGATE: (plastic skin:1.4), (airbrushed:1.3), (symmetrical face:1.1), (cartoon:1.2)
```

### Example 2: Cinematic Video Scene
```
PROMPT: Protagonist discovers crucial clue in dim library, camera: slow dolly zoom from wide establishing shot to tight close-up, lighting: golden hour backlight through window with practical desk lamp fill, 24fps 4K native ProRes

NEGATE: (facial drift:1.4), (background flicker:1.3), (inconsistent props:1.2)
```