#!/usr/bin/env bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# skills.sh — Agent Skills CLI
# Compatible with: https://agentskills.io/ | npx skills add
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Usage:
#   ./skills.sh add <source> [--skill <name>] [--agent <agent>] [--global] [--copy]
#   ./skills.sh list [--global] [--agent <agent>]
#   ./skills.sh find [query]
#   ./skills.sh remove <skill-name> [--global]
#   ./skills.sh update [skill-name]
#   ./skills.sh init [name]
#   ./skills.sh info <skill-name>
#   ./skills.sh doctor
#
# Standards: https://vercel.com/changelog/introducing-skills-the-open-agent-skills-ecosystem
# Format: SKILL.md with YAML frontmatter (name + description required)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -euo pipefail

VERSION="1.0.0"
SKILLS_DIR="$(cd "$(dirname "$0")" && pwd)/skills"
SKILLS_LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)/skills-local"
REGISTRY_FILE="$(cd "$(dirname "$0")" && pwd)/skills.json"
DOWNLOAD_DIR="$(cd "$(dirname "$0")" && pwd)/download"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ─── Helper Functions ────────────────────────────────────────────────────────

print_banner() {
  echo -e "${CYAN}╔══════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║${NC}  ${BOLD}Agent Skills CLI${NC} v${VERSION}                        ${CYAN}║${NC}"
  echo -e "${CYAN}║${NC}  Compatible with npx skills add                     ${CYAN}║${NC}"
  echo -e "${CYAN}╚══════════════════════════════════════════════════════╝${NC}"
}

log_info()  { echo -e "${BLUE}ℹ${NC} $*"; }
log_ok()    { echo -e "${GREEN}✓${NC} $*"; }
log_warn()  { echo -e "${YELLOW}⚠${NC} $*"; }
log_err()   { echo -e "${RED}✗${NC} $*"; }

# Parse YAML frontmatter from SKILL.md
parse_frontmatter() {
  local file="$1"
  local field="$2"

  if [[ ! -f "$file" ]]; then
    echo ""
    return 1
  fi

  # Extract value from YAML frontmatter
  python3 -c "
import yaml, sys
try:
    with open('$file') as f:
        content = f.read()
    lines = content.split('\n')
    start = end = None
    for i, line in enumerate(lines):
        if line.strip() == '---':
            if start is None: start = i
            else: end = i; break
    if start is not None and end is not None:
        meta = yaml.safe_load('\n'.join(lines[start+1:end]))
        if isinstance(meta, dict):
            # Support nested fields like metadata.category
            parts = '$field'.split('.')
            val = meta
            for p in parts:
                val = val.get(p, '') if isinstance(val, dict) else ''
            print(val if val is not None else '')
except: pass
" 2>/dev/null
}

# ─── Commands ────────────────────────────────────────────────────────────────

cmd_list() {
  local scope="project"
  local filter_agent=""
  local filter_category=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      -g|--global) scope="global" ;;
      -a|--agent)  shift; filter_agent="$1" ;;
      -c|--category) shift; filter_category="$1" ;;
    esac
    shift
  done

  print_banner
  echo ""

  local search_dir="$SKILLS_DIR"
  if [[ "$scope" == "global" ]]; then
    search_dir="$HOME/.agent-skills/skills"
  fi

  if [[ ! -d "$search_dir" ]]; then
    log_err "Skills directory not found: $search_dir"
    return 1
  fi

  local count=0
  local categories=()

  echo -e "${BOLD}$(printf '%-30s' 'SKILL NAME') $(printf '%-15s' 'CATEGORY') $(printf '%-12s' 'TYPE') DESCRIPTION${NC}"
  echo "─────────────────────────────────────────────────────────────────────────────────"

  for skill_dir in "$search_dir"/*/; do
    [[ ! -d "$skill_dir" ]] && continue
    local name="$(basename "$skill_dir")"
    local skill_md="${skill_dir}SKILL.md"
    [[ ! -f "$skill_md" ]] && continue

    local sname=$(parse_frontmatter "$skill_md" "name" 2>/dev/null || echo "$name")
    local desc=$(parse_frontmatter "$skill_md" "description" 2>/dev/null | head -c 80)
    local cat=$(parse_frontmatter "$skill_md" "metadata.category" 2>/dev/null || echo "general")
    local type=$(parse_frontmatter "$skill_md" "metadata.type" 2>/dev/null || echo "instruction")

    # Apply filters
    if [[ -n "$filter_category" && "$cat" != "$filter_category" ]]; then
      continue
    fi

    # Truncate description
    desc="${desc:0:70}..."

    printf "${GREEN}%-30s${NC} ${CYAN}%-15s${NC} ${YELLOW}%-12s${NC} %s\n" "$sname" "$cat" "$type" "$desc"
    ((count++))
  done

  echo ""
  log_info "Total: $count skills"

  # Category summary
  echo ""
  echo -e "${BOLD}Categories:${NC}"
  for cat_dir in "$search_dir"/*/; do
    local skill_md="${cat_dir}SKILL.md"
    [[ ! -f "$skill_md" ]] && continue
    local cat=$(parse_frontmatter "$skill_md" "metadata.category" 2>/dev/null || echo "general")
    if [[ ! " ${categories[*]} " =~ " ${cat} " ]]; then
      categories+=("$cat")
    fi
  done

  for cat in "${categories[@]}"; do
    local cat_count=$(find "$search_dir" -name "SKILL.md" -exec grep -l "category.*$cat" {} \; 2>/dev/null | wc -l)
    printf "  %-20s %d\n" "$cat" "$cat_count"
  done
}

cmd_find() {
  local query="${1:-}"

  if [[ -z "$query" ]]; then
    # Interactive mode - list all
    cmd_list
    return
  fi

  print_banner
  echo ""
  log_info "Searching for: $query"
  echo ""

  local found=0
  for skill_dir in "$SKILLS_DIR"/*/; do
    [[ ! -d "$skill_dir" ]] && continue
    local name="$(basename "$skill_dir")"
    local skill_md="${skill_dir}SKILL.md"
    [[ ! -f "$skill_md" ]] && continue

    local sname=$(parse_frontmatter "$skill_md" "name" 2>/dev/null || echo "$name")
    local desc=$(parse_frontmatter "$skill_md" "description" 2>/dev/null || echo "")
    local cat=$(parse_frontmatter "$skill_md" "metadata.category" 2>/dev/null || echo "general")

    # Search in name, description, and category
    if echo "$sname $desc $cat" | grep -qi "$query"; then
      local short_desc="${desc:0:100}..."
      printf "${GREEN}%-30s${NC} ${CYAN}%-15s${NC} %s\n" "$sname" "$cat" "$short_desc"
      ((found++))
    fi
  done

  echo ""
  if [[ $found -eq 0 ]]; then
    log_warn "No skills found matching '$query'"
  else
    log_ok "Found $found matching skills"
  fi
}

cmd_info() {
  local skill_name="${1:-}"

  if [[ -z "$skill_name" ]]; then
    log_err "Usage: skills.sh info <skill-name>"
    return 1
  fi

  local skill_dir="$SKILLS_DIR/$skill_name"
  local skill_md="$skill_dir/SKILL.md"

  # Try case-insensitive match
  if [[ ! -f "$skill_md" ]]; then
    for d in "$SKILLS_DIR"/*/; do
      if [[ "$(basename "$d" | tr '[:upper:]' '[:lower:]')" == "$(echo "$skill_name" | tr '[:upper:]' '[:lower:]')" ]]; then
        skill_dir="$d"
        skill_md="${d}SKILL.md"
        break
      fi
    done
  fi

  if [[ ! -f "$skill_md" ]]; then
    log_err "Skill not found: $skill_name"
    return 1
  fi

  print_banner
  echo ""

  local sname=$(parse_frontmatter "$skill_md" "name" 2>/dev/null || echo "$skill_name")
  local desc=$(parse_frontmatter "$skill_md" "description" 2>/dev/null || echo "No description")
  local cat=$(parse_frontmatter "$skill_md" "metadata.category" 2>/dev/null || echo "general")
  local type=$(parse_frontmatter "$skill_md" "metadata.type" 2>/dev/null || echo "instruction")
  local ver=$(parse_frontmatter "$skill_md" "metadata.version" 2>/dev/null || echo "1.0.0")
  local lic=$(parse_frontmatter "$skill_md" "license" 2>/dev/null || echo "N/A")

  echo -e "${BOLD}Name:${NC}        $sname"
  echo -e "${BOLD}Category:${NC}    $cat"
  echo -e "${BOLD}Type:${NC}        $type"
  echo -e "${BOLD}Version:${NC}     $ver"
  echo -e "${BOLD}License:${NC}     $lic"
  echo -e "${BOLD}Path:${NC}        $skill_dir"
  echo ""
  echo -e "${BOLD}Description:${NC}"
  echo "  $desc"
  echo ""

  # File inventory
  echo -e "${BOLD}Files:${NC}"
  if [[ -d "$skill_dir" ]]; then
    for f in "$skill_dir"/*; do
      local fname="$(basename "$f")"
      local ftype=""
      [[ "$fname" == "SKILL.md" ]] && ftype=" (entry point)"
      [[ "$fname" == *.py ]] && ftype=" (Python script)"
      [[ "$fname" == *.ts ]] && ftype=" (TypeScript script)"
      [[ "$fname" == *.sh ]] && ftype=" (Shell script)"
      [[ "$fname" == *.bak ]] && continue
      echo "  📄 $fname$ftype"
    done
    for d in "$skill_dir"/*/; do
      [[ ! -d "$d" ]] && continue
      local dname="$(basename "$d")"
      local dcount=$(find "$d" -type f 2>/dev/null | wc -l)
      echo "  📁 $dname/ ($dcount files)"
    done
  fi
  echo ""

  # Install command
  echo -e "${BOLD}Install via npx skills:${NC}"
  echo "  npx skills add ./skills/$sname"
}

cmd_add() {
  local source=""
  local skill_filter=""
  local agent_filter=""
  local global=false
  local copy_mode=false
  local yes=false

  while [[ $# -gt 0 ]]; do
    case "$1" in
      -s|--skill)   shift; skill_filter="$1" ;;
      -a|--agent)   shift; agent_filter="$1" ;;
      -g|--global)  global=true ;;
      --copy)       copy_mode=true ;;
      -y|--yes)     yes=true ;;
      -*)           log_err "Unknown option: $1"; return 1 ;;
      *)            source="$1" ;;
    esac
    shift
  done

  if [[ -z "$source" ]]; then
    log_err "Usage: skills.sh add <source> [--skill <name>] [--agent <agent>] [--global]"
    log_info "Sources: GitHub owner/repo, URL, or local path"
    return 1
  fi

  print_banner
  echo ""

  # Resolve source
  local target_dir=""

  # Local path
  if [[ -d "$source" ]]; then
    target_dir="$(cd "$source" && pwd)"
    log_info "Installing from local path: $target_dir"

  # GitHub shorthand (owner/repo)
  elif [[ "$source" =~ ^[a-zA-Z0-9_-]+/[a-zA-Z0-9_.-]+$ ]]; then
    local repo_url="https://github.com/$source"
    log_info "Cloning from GitHub: $repo_url"
    local tmp_dir=$(mktemp -d)
    git clone --depth 1 "$repo_url" "$tmp_dir/repo" 2>/dev/null || {
      log_err "Failed to clone $repo_url"
      rm -rf "$tmp_dir"
      return 1
    }
    target_dir="$tmp_dir/repo"

  # GitHub URL
  elif [[ "$source" =~ ^https://github.com/ ]]; then
    log_info "Cloning from URL: $source"
    local tmp_dir=$(mktemp -d)
    git clone --depth 1 "$source" "$tmp_dir/repo" 2>/dev/null || {
      log_err "Failed to clone $source"
      rm -rf "$tmp_dir"
      return 1
    }
    target_dir="$tmp_dir/repo"

  else
    log_err "Unsupported source format: $source"
    log_info "Supported: local path, GitHub owner/repo, GitHub URL"
    return 1
  fi

  # Find skills in source
  local skills_found=()
  if [[ -f "$target_dir/SKILL.md" ]]; then
    skills_found+=("$target_dir")
  fi
  for d in "$target_dir"/*/; do
    [[ -f "${d}SKILL.md" ]] && skills_found+=("$d")
  done
  # Also check skills/ subdirectory (Vercel pattern)
  if [[ -d "$target_dir/skills" ]]; then
    for d in "$target_dir/skills"/*/; do
      [[ -f "${d}SKILL.md" ]] && skills_found+=("$d")
    done
  fi

  if [[ ${#skills_found[@]} -eq 0 ]]; then
    log_err "No skills found in source (no SKILL.md files)"
    return 1
  fi

  log_ok "Found ${#skills_found[@]} skill(s)"
  echo ""

  # Determine install destination
  local install_base
  if $global; then
    install_base="$HOME/.agent-skills/skills"
  else
    install_base="$SKILLS_DIR"
  fi
  mkdir -p "$install_base"

  # Install each skill
  local installed=0
  for skill_path in "${skills_found[@]}"; do
    local sname=$(parse_frontmatter "${skill_path}/SKILL.md" "name" 2>/dev/null || echo "$(basename "$skill_path")")

    # Apply skill filter
    if [[ -n "$skill_filter" && "$sname" != "$skill_filter" && "$(basename "$skill_path")" != "$skill_filter" ]]; then
      continue
    fi

    local dest="$install_base/$sname"

    if [[ -d "$dest" ]]; then
      log_warn "Skill already exists: $sname (use --copy to overwrite)"
      if ! $yes; then
        read -p "Overwrite? [y/N] " -n 1 -r
        echo
        [[ ! $REPLY =~ ^[Yy]$ ]] && continue
      fi
      rm -rf "$dest"
    fi

    if $copy_mode; then
      cp -r "$skill_path" "$dest"
      log_ok "Copied: $sname → $dest"
    else
      ln -s "$skill_path" "$dest"
      log_ok "Symlinked: $sname → $dest"
    fi
    ((installed++))
  done

  echo ""
  log_ok "Installed $installed skill(s)"

  # Also try npx skills add for compatibility
  echo ""
  log_info "Tip: For native npx skills compatibility, run:"
  echo "  npx skills add $source"
}

cmd_remove() {
  local skill_name=""
  local global=false

  while [[ $# -gt 0 ]]; do
    case "$1" in
      -g|--global) global=true ;;
      *) skill_name="$1" ;;
    esac
    shift
  done

  if [[ -z "$skill_name" ]]; then
    log_err "Usage: skills.sh remove <skill-name>"
    return 1
  fi

  local install_base
  if $global; then
    install_base="$HOME/.agent-skills/skills"
  else
    install_base="$SKILLS_DIR"
  fi

  local dest="$install_base/$skill_name"
  if [[ ! -e "$dest" ]]; then
    log_err "Skill not found: $skill_name"
    return 1
  fi

  rm -rf "$dest"
  log_ok "Removed: $skill_name"
}

cmd_init() {
  local skill_name="${1:-}"

  if [[ -z "$skill_name" ]]; then
    read -p "Skill name: " skill_name
  fi

  # Normalize name
  skill_name=$(echo "$skill_name" | tr '[:upper:]' '[:lower:]' | tr ' _' '--' | sed 's/[^a-z0-9-]//g')

  local skill_dir="$SKILLS_DIR/$skill_name"
  mkdir -p "$skill_dir/scripts" "$skill_dir/references" "$skill_dir/assets"

  cat > "$skill_dir/SKILL.md" << SKILLEOF
---
name: "$skill_name"
description: "Use when the user needs help with ${skill_name//-/ } related tasks."
metadata:
  category: "general"
  type: "instruction"
  version: "1.0.0"
---

# ${skill_name^^}

## When to Use

- Describe when this skill should be activated
- Include specific user phrases or contexts that trigger this skill

## When NOT to Use

- Describe scenarios where this skill should not be used

## Instructions

1. Step-by-step instructions go here
2. Be specific and actionable
3. Include examples where helpful

## Examples

**Input:** "Example user request"
**Output:** Example expected response

## References

- See \`references/\` for detailed documentation
- See \`scripts/\` for executable helpers
SKILLEOF

  log_ok "Created skill: $skill_dir/SKILL.md"
  log_info "Edit the SKILL.md to add your instructions"
}

cmd_update() {
  local skill_name="${1:-}"

  print_banner
  echo ""

  if [[ -n "$skill_name" ]]; then
    # Update specific skill
    local skill_dir="$SKILLS_DIR/$skill_name"
    if [[ ! -d "$skill_dir" ]]; then
      log_err "Skill not found: $skill_name"
      return 1
    fi
    log_info "Updating: $skill_name"
    python3 "$(cd "$(dirname "$0")" && pwd)/standardize-skills.py" --skills-dir "$SKILLS_DIR" 2>/dev/null
    log_ok "Updated: $skill_name"
  else
    # Update all skills
    log_info "Re-standardizing all skills..."
    python3 "$(cd "$(dirname "$0")" && pwd)/standardize-skills.py" 2>/dev/null
    log_ok "All skills re-standardized"
  fi
}

cmd_doctor() {
  print_banner
  echo ""
  log_info "Running diagnostics..."
  echo ""

  local issues=0
  local total=0

  # Check each skill
  for skill_dir in "$SKILLS_DIR"/*/; do
    [[ ! -d "$skill_dir" ]] && continue
    local name="$(basename "$skill_dir")"
    local skill_md="${skill_dir}SKILL.md"
    ((total++))

    # Check SKILL.md exists
    if [[ ! -f "$skill_md" ]]; then
      log_err "$name: Missing SKILL.md"
      ((issues++))
      continue
    fi

    # Check frontmatter
    local has_fm=$(head -1 "$skill_md" | grep -c '^---')
    if [[ "$has_fm" -eq 0 ]]; then
      log_warn "$name: Missing YAML frontmatter"
      ((issues++))
      continue
    fi

    # Check required fields
    local sname=$(parse_frontmatter "$skill_md" "name" 2>/dev/null)
    local sdesc=$(parse_frontmatter "$skill_md" "description" 2>/dev/null)

    if [[ -z "$sname" ]]; then
      log_warn "$name: Missing 'name' in frontmatter"
      ((issues++))
    fi

    if [[ -z "$sdesc" ]]; then
      log_warn "$name: Missing 'description' in frontmatter"
      ((issues++))
    fi

    # Check name matches directory
    local normalized=$(echo "$sname" | tr '[:upper:]' '[:lower:]' | tr ' _' '--' | sed 's/[^a-z0-9-]//g')
    if [[ "$normalized" != "$name" ]]; then
      log_warn "$name: name '$sname' doesn't match directory (expected '$normalized')"
      ((issues++))
    fi

    # Check description has routing info
    local has_routing=$(echo "$sdesc" | grep -ci 'use when\|applies when\|trigger\|activate')
    if [[ "$has_routing" -eq 0 ]]; then
      log_warn "$name: Description lacks routing info ('Use when...' pattern)"
      # Not counting as issue - just advisory
    fi
  done

  echo ""
  if [[ $issues -eq 0 ]]; then
    log_ok "All $total skills pass validation! ✓"
  else
    log_warn "$issues issues found across $total skills"
    log_info "Run './skills.sh update' to fix automatically"
  fi

  # Check npx skills compatibility
  echo ""
  log_info "npx skills compatibility check:"
  if command -v npx &>/dev/null; then
    log_ok "npx is available"
  else
    log_warn "npx not found - install Node.js for npx skills add compatibility"
  fi

  if [[ -f "$REGISTRY_FILE" ]]; then
    local skill_count=$(python3 -c "import json; d=json.load(open('$REGISTRY_FILE')); print(len(d['skills']))" 2>/dev/null || echo "0")
    log_ok "Registry: $skill_count skills indexed ($REGISTRY_FILE)"
  else
    log_warn "No skills.json registry found - run './skills.sh update' to generate"
  fi
}

# ─── Main ────────────────────────────────────────────────────────────────────

main() {
  local cmd="${1:-help}"
  shift 2>/dev/null || true

  case "$cmd" in
    add|install)     cmd_add "$@" ;;
    list|ls)         cmd_list "$@" ;;
    find|search)     cmd_find "$@" ;;
    remove|rm)       cmd_remove "$@" ;;
    update)          cmd_update "$@" ;;
    init|create)     cmd_init "$@" ;;
    info|show)       cmd_info "$@" ;;
    doctor|check)    cmd_doctor ;;
    version|-v)      echo "skills.sh v$VERSION" ;;
    help|--help|-h)
      print_banner
      echo ""
      echo "Usage: skills.sh <command> [options]"
      echo ""
      echo "Commands:"
      echo "  add <source>         Install skills from GitHub repo or local path"
      echo "  list                 List all installed skills"
      echo "  find [query]         Search skills by keyword"
      echo "  remove <name>        Remove an installed skill"
      echo "  update [name]        Re-standardize skill(s)"
      echo "  init [name]          Create a new skill from template"
      echo "  info <name>          Show detailed skill information"
      echo "  doctor               Run diagnostics on all skills"
      echo "  version              Show version"
      echo ""
      echo "Options:"
      echo "  --skill <name>       Install specific skill by name"
      echo "  --agent <agent>      Target specific agent (claude-code, opencode, etc.)"
      echo "  --global, -g         Install/remove to user directory"
      echo "  --copy               Copy files instead of symlinking"
      echo "  --yes, -y            Skip confirmation prompts"
      echo ""
      echo "Standards: https://agentskills.io/"
      echo "Format: SKILL.md with YAML frontmatter (name + description required)"
      echo ""
      echo "Examples:"
      echo "  ./skills.sh list"
      echo "  ./skills.sh list --category sdk-api"
      echo "  ./skills.sh find chart"
      echo "  ./skills.sh info pdf"
      echo "  ./skills.sh add vercel-labs/agent-skills --skill web-design-guidelines"
      echo "  ./skills.sh init my-new-skill"
      echo "  ./skills.sh doctor"
      ;;
    *)
      log_err "Unknown command: $cmd"
      log_info "Run './skills.sh help' for usage"
      return 1
      ;;
  esac
}

main "$@"
