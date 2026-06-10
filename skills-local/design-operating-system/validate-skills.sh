#!/bin/bash
# validate-skills.sh - Validate all skill files for consistency

SKILLS_DIR="/home/hive/workspace/skills"
ERRORS=0

echo "=========================================="
echo "  Design Operating System - Skill Validator"
echo "=========================================="
echo ""

# Check 1: Version consistency
echo "CHECK 1: Version consistency in compat tables..."
for skill_dir in "$SKILLS_DIR"/anthropic-frontend-design "$SKILLS_DIR"/gsap-animations "$SKILLS_DIR"/ui-ux-pro-max-v7 "$SKILLS_DIR"/vercel-react-best-practices "$SKILLS_DIR"/vercel-web-design-guidelines; do
  skill_file="$skill_dir/SKILL.md"
  if [[ ! -f "$skill_file" ]]; then
    echo "  ❌ Missing: $skill_dir/SKILL.md"
    ((ERRORS++))
    continue
  fi
  
  filename=$(basename "$skill_dir")
  echo "  Checking $filename..."
  
  # Check for v1.0 references (should be v1.1)
  if grep -q "v1\.0" "$skill_file" 2>/dev/null; then
    echo "    ⚠️  Found v1.0 reference (should be v1.1)"
    ((ERRORS++))
  fi
  
  # Check for v7.0 references (should be v7.1)
  if grep -q "v7\.0" "$skill_file" 2>/dev/null; then
    echo "    ⚠️  Found v7.0 reference (should be v7.1)"
    ((ERRORS++))
  fi
done

# Check 2: File naming consistency
echo ""
echo "CHECK 2: File naming consistency..."
if [[ -d "$SKILLS_DIR/ui-ux-pro-max-v7" && -f "$SKILLS_DIR/ui-ux-pro-max-v7/SKILL.md" ]]; then
  echo "  ✅ UI/UX Pro Max v7 folder structure correct"
else
  echo "  ❌ UI/UX Pro Max v7 folder structure mismatch"
  ((ERRORS++))
fi

# Check 3: Cross-references
echo ""
echo "CHECK 3: Cross-reference validity..."
if grep -q "C13\|C14" "$SKILLS_DIR/anthropic-frontend-design/SKILL.md" 2>/dev/null; then
  echo "  ⚠️  anthropic-frontend-design still has C13/C14 references"
  ((ERRORS++))
else
  echo "  ✅ anthropic-frontend-design cross-references clean"
fi

# Check 4: Code syntax
echo ""
echo "CHECK 4: Code syntax validation..."
for skill_file in "$SKILLS_DIR/anthropic-frontend-design/SKILL.md" "$SKILLS_DIR/ui-ux-pro-max-v7/SKILL.md"; do
  filename=$(basename "$(dirname "$skill_file")")
  
  # Check for unclosed CSS variable brackets
  if grep -q 'bg-\[var(--[^\]]*$\|text-\[var(--[^\]]*$\|border-\[var(--[^\]]*$' "$skill_file" 2>/dev/null; then
    echo "  ⚠️  $filename has unclosed CSS variable brackets"
    ((ERRORS++))
  fi
done

# Check 5: Required sections
echo ""
echo "CHECK 5: Required sections..."
for skill_dir in "$SKILLS_DIR"/anthropic-frontend-design "$SKILLS_DIR"/gsap-animations "$SKILLS_DIR"/ui-ux-pro-max-v7 "$SKILLS_DIR"/vercel-react-best-practices "$SKILLS_DIR"/vercel-web-design-guidelines; do
  skill_file="$skill_dir/SKILL.md"
  if [[ ! -f "$skill_file" ]]; then
    continue
  fi
  
  filename=$(basename "$skill_dir")
  
  if ! grep -q "MODULE 0" "$skill_file" 2>/dev/null; then
    echo "  ⚠️  $filename missing MODULE 0"
    ((ERRORS++))
  fi
done

# Summary
echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
  echo "  ✅ ALL CHECKS PASSED"
else
  echo "  ⚠️  Found $ERRORS error(s)"
fi
echo "=========================================="

exit $ERRORS
