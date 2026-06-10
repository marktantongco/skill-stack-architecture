#!/usr/bin/env python3
"""
Skill Standardizer - Restructures all skills to follow the Vercel Agent Skills format.
https://agentskills.io/ | https://vercel.com/changelog/introducing-skills-the-open-agent-skills-ecosystem

Standard Protocol:
  - SKILL.md with YAML frontmatter (name + description REQUIRED)
  - name: lowercase letters/numbers/hyphens only, MUST match directory name
  - description: routing-quality (what it does + when to use it)
  - Optional frontmatter: metadata (version, author), license, allowed-tools
  - Optional directories: scripts/, references/, assets/
  - Progressive disclosure: metadata → body → bundled resources

Usage:
  python3 standardize-skills.py [--dry-run] [--skills-dir DIR]
"""

import os
import re
import sys
import json
import yaml
import shutil
from pathlib import Path
from typing import Optional, Dict, Any, List, Tuple

# ─── Configuration ───────────────────────────────────────────────────────────

PROJECT_ROOT = Path("/home/z/my-project")
DEFAULT_SKILLS_DIR = PROJECT_ROOT / "skills"
DRY_RUN = False

# Category mapping based on skill names
CATEGORY_MAP = {
    # SDK / API Skills
    "asr": "sdk-api", "llm": "sdk-api", "tts": "sdk-api", "vlm": "sdk-api",
    "web-search": "sdk-api", "web-reader": "sdk-api",
    "image-generation": "sdk-api", "image-edit": "sdk-api",
    "image-understand": "sdk-api", "video-generation": "sdk-api",
    "video-understand": "sdk-api",

    # Document Skills
    "pdf": "document", "docx": "document", "ppt": "document", "xlsx": "document",

    # Visualization Skills
    "charts": "visualization",

    # Development Skills
    "fullstack-dev": "development", "react-best-practices": "development",
    "react-native-skills": "development", "next-best-practices": "development",
    "shadcn": "development", "composition-patterns": "development",
    "gsap-animations": "development", "web-artifacts-builder": "development",
    "coding-agent": "development", "simulation-sandbox": "development",

    # Infrastructure Skills
    "api-gateway-skill": "infrastructure", "deployment-manager": "infrastructure",
    "mcp-builder": "infrastructure", "mcp-builder-billing": "infrastructure",
    "persistent-memory": "infrastructure", "combined-proxy-billing": "infrastructure",
    "supabase-postgres": "infrastructure", "skill-router": "infrastructure",
    "skill-scanner": "infrastructure", "skill-vetter": "infrastructure",
    "find-skills": "infrastructure", "skill-creator": "infrastructure",
    "skill-finder-cn": "infrastructure",

    # Research Skills
    "deep-research": "research", "aminer-academic-search": "research",
    "aminer-daily-paper": "research", "aminer-free-academic": "research",
    "qingyan-research": "research", "multi-search-engine": "research",

    # Design Skills
    "ui-ux-pro-max": "design", "ui-ux-pro-max-v8-components": "design",
    "ui-ux-pro-max-v8-data": "design", "ui-ux-pro-max-v8-infra": "design",
    "visual-design-foundations": "design", "web-design-guidelines": "design",
    "motion-system-playbook": "design", "photography-ai": "design",

    # Business Skills
    "finance": "business", "stock-analysis-skill": "business",
    "market-research-reports": "business", "marketing-mode": "business",
    "content-strategy": "business", "seo-geo": "seo-geo",
    "seo-content-writer": "business", "social-media-manager": "business",
    "gumroad-pipeline": "business", "jobs-to-be-done": "business",
    "blog-writer": "business",

    # Writing Skills
    "writing-plans": "writing", "humanizer": "writing",
    "output-formatter": "writing", "context-compressor": "writing",
    "contentanalysis": "writing", "cheat-sheet": "writing",
    "explained-code": "writing",

    # Thinking Skills
    "brainstorming": "thinking", "chain-of-thought": "thinking",
    "socratic-method": "thinking", "devils-advocate": "thinking",
    "caveman": "thinking",

    # Agent Skills
    "agent-browser": "agent", "browser-use": "agent", "browser-use-owl": "agent",
    "ai-news-collectors": "agent",

    # Interview & Career Skills
    "interview-designer": "career", "interview-prep": "career",
    "jd-resume-tailor": "career", "job-intent-tracker": "career",
    "resume-builder": "career", "auto-target-tracker": "career",

    # Education Skills
    "quiz-html": "education", "quiz-mastery": "education", "study-buddy": "education",

    # Creative Skills
    "dream-interpreter": "creative", "mindfulness-meditation": "creative",
    "podcast-generate": "creative", "storyboard-manager": "creative",
    "get-fortune-analysis": "creative", "gift-evaluator": "creative",

    # Specialized Skills
    "anti-pua": "specialized", "task-review": "specialized",
    "superpowers": "specialized", "web-shader-extractor": "specialized",
    "image-generation": "sdk-api",
}

# Known skill type patterns
SKILL_TYPE_MAP = {
    # SDK-wrapper skills (have scripts/*.ts using z-ai-web-dev-sdk)
    "sdk-wrapper": ["asr", "llm", "tts", "vlm", "web-search", "web-reader",
                    "image-generation", "image-edit", "image-understand",
                    "video-generation", "video-understand"],
    # Complex multi-file skills
    "complex": ["charts", "pdf", "docx", "ppt", "xlsx", "skill-creator",
                "ui-ux-pro-max", "ui-ux-pro-max-v8-components",
                "ui-ux-pro-max-v8-data", "ui-ux-pro-max-v8-infra"],
    # Instruction-only skills
    "instruction": ["deep-research", "brainstorming", "chain-of-thought",
                    "socratic-method", "devils-advocate", "caveman",
                    "composition-patterns", "writing-plans", "humanizer",
                    "context-compressor", "output-formatter", "superpowers"],
}


def normalize_name(dir_name: str) -> str:
    """Convert directory name to valid skill name (lowercase, hyphens only)."""
    name = dir_name.lower()
    name = re.sub(r'[^a-z0-9-]', '-', name)
    name = re.sub(r'-+', '-', name)
    name = name.strip('-')
    return name


def parse_frontmatter(content: str) -> Tuple[Optional[Dict], str]:
    """Parse YAML frontmatter from SKILL.md content. Returns (metadata, body).

    Handles edge cases:
    - Content before the frontmatter (e.g., # Title before ---)
    - Multiple --- separators
    - Missing frontmatter
    """
    # Find the first --- that starts a YAML block
    # Look for --- at start of line, possibly with preceding content
    lines = content.split('\n')
    fm_start = None
    fm_end = None

    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped == '---':
            if fm_start is None:
                fm_start = i
            else:
                fm_end = i
                break

    if fm_start is None or fm_end is None:
        return None, content

    # Extract parts
    preamble = '\n'.join(lines[:fm_start]).strip()
    yaml_content = '\n'.join(lines[fm_start + 1:fm_end])
    body = '\n'.join(lines[fm_end + 1:]).strip()

    try:
        metadata = yaml.safe_load(yaml_content)
        if not isinstance(metadata, dict):
            metadata = {}
        # If there was a preamble (title before frontmatter), prepend to body
        if preamble:
            body = f"{preamble}\n\n{body}"
        return metadata, body
    except yaml.YAMLError:
        return None, content


def build_frontmatter(name: str, description: str, existing: Optional[Dict] = None,
                      category: str = "", skill_type: str = "") -> str:
    """Build standardized YAML frontmatter."""
    fm = {}
    fm['name'] = name
    fm['description'] = description

    # Preserve useful existing fields
    if existing:
        if 'metadata' in existing and isinstance(existing['metadata'], dict):
            fm['metadata'] = existing['metadata']
        elif 'author' in existing or 'version' in existing:
            meta = {}
            if 'author' in existing:
                meta['author'] = existing['author']
            if 'version' in existing:
                meta['version'] = existing['version']
            if meta:
                fm['metadata'] = meta

        if 'license' in existing:
            fm['license'] = existing['license']
        if 'tags' in existing:
            fm['tags'] = existing['tags']
        if 'argument-hint' in existing:
            fm['argument-hint'] = existing['argument-hint']

    # Add standardized metadata if not present
    if 'metadata' not in fm:
        fm['metadata'] = {}

    if 'category' not in fm['metadata']:
        fm['metadata']['category'] = category if category else "general"
    if 'type' not in fm['metadata']:
        fm['metadata']['type'] = skill_type if skill_type else "instruction"
    if 'version' not in fm['metadata']:
        fm['metadata']['version'] = "1.0.0"

    # Build YAML string
    lines = ["---"]
    for key, val in fm.items():
        if key == 'description':
            # Multi-line description
            if '\n' in val or len(val) > 120:
                lines.append(f"{key}: >")
                for dline in val.strip().split('\n'):
                    lines.append(f"  {dline.strip()}")
            else:
                lines.append(f'{key}: "{val}"')
        elif key == 'tags' and isinstance(val, list):
            lines.append(f"{key}:")
            for tag in val:
                lines.append(f"  - {tag}")
        elif key == 'metadata' and isinstance(val, dict):
            lines.append(f"{key}:")
            for mk, mv in val.items():
                if isinstance(mv, str):
                    lines.append(f'  {mk}: "{mv}"')
                else:
                    lines.append(f"  {mk}: {mv}")
        elif isinstance(val, str):
            lines.append(f'{key}: "{val}"')
        else:
            lines.append(f"{key}: {val}")
    lines.append("---")
    return '\n'.join(lines)


def improve_description(name: str, existing_desc: str) -> str:
    """Improve description to be routing-quality if needed."""
    if not existing_desc:
        return f"Use when the user needs help with {name.replace('-', ' ')} related tasks."

    # Check if description already has "Use when" routing info
    has_routing = any(phrase in existing_desc.lower() for phrase in [
        'use when', 'use this when', 'applies when', 'trigger',
        'activate when', 'use this skill when'
    ])

    if has_routing and len(existing_desc) > 50:
        return existing_desc  # Already good

    return existing_desc


def get_skill_type(skill_name: str) -> str:
    """Determine skill type based on known patterns."""
    for stype, names in SKILL_TYPE_MAP.items():
        if skill_name in names:
            return stype
    return "instruction"


def standardize_skill(skill_dir: Path, dry_run: bool = False) -> Dict[str, Any]:
    """Standardize a single skill directory. Returns status dict."""
    result = {
        "name": skill_dir.name,
        "normalized_name": normalize_name(skill_dir.name),
        "status": "unchanged",
        "changes": [],
        "errors": []
    }

    skill_md_path = skill_dir / "SKILL.md"
    if not skill_md_path.exists():
        result["status"] = "missing_skill_md"
        result["errors"].append("No SKILL.md found")
        return result

    # Read current content
    content = skill_md_path.read_text(encoding='utf-8')
    metadata, body = parse_frontmatter(content)

    if metadata is None:
        # No frontmatter - need to add it
        result["status"] = "added_frontmatter"
        result["changes"].append("Added YAML frontmatter (was missing)")
        metadata = {}
        body = content  # Everything is body

    # Determine standardized name
    normalized = normalize_name(skill_dir.name)
    original_name = metadata.get('name', '')

    # Fix name if needed
    if original_name != normalized:
        result["changes"].append(f"name: '{original_name}' -> '{normalized}'")

    # Get category and type
    category = CATEGORY_MAP.get(skill_dir.name, "general")
    skill_type = get_skill_type(skill_dir.name)

    # Improve description
    existing_desc = metadata.get('description', '')
    new_desc = improve_description(normalized, existing_desc)

    # Build new frontmatter
    new_fm = build_frontmatter(
        name=normalized,
        description=new_desc,
        existing=metadata,
        category=category,
        skill_type=skill_type
    )

    # Compose new SKILL.md
    new_content = f"{new_fm}\n\n{body}\n"

    # Check if content changed
    if new_content.strip() != content.strip():
        if result["status"] == "unchanged":
            result["status"] = "updated"
        if not dry_run:
            # Backup original
            backup_path = skill_dir / "SKILL.md.bak"
            if not backup_path.exists():
                shutil.copy2(skill_md_path, backup_path)
            skill_md_path.write_text(new_content, encoding='utf-8')
    else:
        result["status"] = "unchanged"

    # Collect file inventory
    files = [f.name for f in skill_dir.iterdir() if f.is_file()]
    dirs = [d.name for d in skill_dir.iterdir() if d.is_dir()]
    result["files"] = files
    result["subdirs"] = dirs
    result["has_scripts"] = "scripts" in dirs
    result["has_references"] = "references" in dirs
    result["has_assets"] = "assets" in dirs
    result["category"] = category
    result["type"] = skill_type

    return result


def build_registry(results: List[Dict]) -> Dict:
    """Build the skills registry JSON from standardization results."""
    registry = {
        "version": "1.0.0",
        "format": "agentskills.io",
        "description": "AI Agent Skills Collection - Compatible with npx skills add",
        "skills": []
    }

    for r in results:
        if r["status"] == "missing_skill_md":
            continue

        skill_entry = {
            "name": r["normalized_name"],
            "directory": r["name"],
            "category": r.get("category", "general"),
            "type": r.get("type", "instruction"),
            "has_scripts": r.get("has_scripts", False),
            "has_references": r.get("has_references", False),
            "has_assets": r.get("has_assets", False),
            "files": r.get("files", []),
            "subdirs": r.get("subdirs", []),
        }

        # Read description from the standardized SKILL.md
        skill_md = DEFAULT_SKILLS_DIR / r["name"] / "SKILL.md"
        if skill_md.exists():
            content = skill_md.read_text(encoding='utf-8')
            meta, _ = parse_frontmatter(content)
            if meta:
                skill_entry["description"] = meta.get("description", "")
                if "metadata" in meta:
                    skill_entry["metadata"] = meta["metadata"]
                if "license" in meta:
                    skill_entry["license"] = meta["license"]
                if "tags" in meta:
                    skill_entry["tags"] = meta["tags"]

        registry["skills"].append(skill_entry)

    # Sort by category then name
    registry["skills"].sort(key=lambda s: (s["category"], s["name"]))
    return registry


def main():
    global DRY_RUN, DEFAULT_SKILLS_DIR

    if "--dry-run" in sys.argv:
        DRY_RUN = True
        print("🔍 DRY RUN - No files will be modified\n")

    if "--skills-dir" in sys.argv:
        idx = sys.argv.index("--skills-dir")
        if idx + 1 < len(sys.argv):
            DEFAULT_SKILLS_DIR = Path(sys.argv[idx + 1])

    print(f"📂 Skills directory: {DEFAULT_SKILLS_DIR}")
    print(f"🔧 Dry run: {DRY_RUN}")
    print()

    if not DEFAULT_SKILLS_DIR.exists():
        print(f"❌ Skills directory not found: {DEFAULT_SKILLS_DIR}")
        sys.exit(1)

    # Get all skill directories
    skill_dirs = sorted([d for d in DEFAULT_SKILLS_DIR.iterdir()
                         if d.is_dir() and not d.name.startswith('.')])

    print(f"Found {len(skill_dirs)} skill directories\n")

    results = []
    stats = {"updated": 0, "unchanged": 0, "missing_skill_md": 0, "errors": 0}

    for skill_dir in skill_dirs:
        result = standardize_skill(skill_dir, dry_run=DRY_RUN)
        results.append(result)
        stats[result["status"]] = stats.get(result["status"], 0) + 1

        # Print status
        status_icon = {"updated": "✅", "unchanged": "⏭️", "missing_skill_md": "❌"}.get(result["status"], "⚠️")
        print(f"{status_icon} {result['name']} → {result['normalized_name']} [{result['status']}]")
        for change in result.get("changes", []):
            print(f"   └─ {change}")
        for error in result.get("errors", []):
            print(f"   └─ ERROR: {error}")

    print(f"\n{'='*60}")
    print(f"📊 Standardization Summary:")
    print(f"   Updated:      {stats.get('updated', 0)}")
    print(f"   Unchanged:    {stats.get('unchanged', 0)}")
    print(f"   Missing SKILL.md: {stats.get('missing_skill_md', 0)}")
    print(f"   Errors:       {stats.get('errors', 0)}")

    # Build and save registry
    registry = build_registry(results)
    registry_path = PROJECT_ROOT / "skills.json"
    if not DRY_RUN:
        registry_path.write_text(json.dumps(registry, indent=2, ensure_ascii=False), encoding='utf-8')
        print(f"\n📋 Registry saved: {registry_path}")
    else:
        print(f"\n📋 Registry would be saved to: {registry_path}")

    # Category summary
    categories = {}
    for r in results:
        cat = r.get("category", "general")
        categories[cat] = categories.get(cat, 0) + 1

    print(f"\n📂 Category Breakdown:")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"   {cat}: {count} skills")

    return results


if __name__ == "__main__":
    main()
