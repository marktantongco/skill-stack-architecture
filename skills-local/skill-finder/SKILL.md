# Skill Finder - AI Agent Skills Discovery and Evaluation Meta-Skill

## Context

This skill is for finding and evaluating new AI agent skills from external sources. It prevents skill duplication, ensures security vetting, and maintains MECE discipline.

Use this skill when:
- You need a capability that doesn't exist in your current skills library
- You want to discover what skills the community has created
- Someone shares a skill URL or recommendation
- You want to audit and expand your skills library

---

## Instructions

### Step 1: Check Existing Skills First (MANDATORY)

Before searching externally, ALWAYS check `/home/hive/workspace/skills/` for existing coverage:

```
- Scan all SKILL.md files in /home/hive/workspace/skills/
- Search for keywords related to the needed capability
- Check if existing skill partially covers need (extend, don't duplicate)
- If found → EXTEND. If not → proceed to discovery.
```

### Step 2: Search External Sources

**Primary Sources:**
| Source | URL |
|--------|-----|
| skills.sh | https://skills.sh/trending |
| GitHub search | `github.com search: SKILL.md` |
| Awesome Claude Code | github.com/.../awesome-claude-code |
| Anthropic Academy | anthropic.skilljar.com/claude-code-skills |

### Step 3: Evaluate Each Candidate Skill

```
SKILL EVALUATION SCORECARD

1. RELEVANCE (0-10) - Does it solve a real, recurring need?
2. QUALITY (0-10) - Clear context/instructions/constraints/examples?
3. COMPATIBILITY (0-10) - Works with our environment?
4. SECURITY (0-10) - No suspicious patterns?
5. MAINTAINABILITY (0-10) - Actively maintained?

TOTAL SCORE: __/50 | MINIMUM TO INSTALL: 30/50
```

### Step 4: Vet for Security (MANDATORY)

```
SECURITY RED FLAGS (any ONE = rejection)
- Requests filesystem access outside project directory
- Executes arbitrary shell commands without confirmation
- Makes network requests to unknown domains
- Contains obfuscated or minified code
- Has hardcoded credentials or API keys
```

### Step 5: Install the Skill

1. Create directory: `mkdir -p /home/hive/workspace/skills/{skill-name}/`
2. Save SKILL.md with: context, instructions, constraints, examples
3. Log installation with skill name, source, date, evaluation score

### Step 6: Verify Installation

- SKILL.md exists at correct path
- All 4 required sections present
- No conflicts with existing skills

---

## Constraints

- NEVER install skill without security vet
- NEVER install skill that duplicates >50% of existing skill
- NEVER install skill scoring below 30/50
- NEVER skip "check existing skills first" step
- NEVER install without testing with sample input

---

## Examples

### Example: Finding JTBD Research Skill

**Step 1:** Check existing... No product research skill found. **RESULT: PROCEED**

**Step 2:** Search → Found `snowtema/ajtbd-skills` on GitHub

**Step 3:** Evaluate: Relevance 9/10, Quality 8/10, Compatibility 6/10, Security 9/10, Maintainability 7/10 → Total: 39/50 **PASS**

**Step 4:** Security: No red flags

**Step 5:** Install to `/home/hive/workspace/skills/jtbd-research/SKILL.md`