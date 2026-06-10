#!/bin/bash

SKILLS_DIR="/workspace/skills"
HEALTH_OUTPUT="/tmp/skill-health.json"
WEB_OUTPUT="/workspace/skills/skill-health.json"

check_all_skills() {
  local json_entries=()
  for skill_dir in "$SKILLS_DIR"/*/; do
    [ -d "$skill_dir" ] || continue
    skill_name=$(basename "${skill_dir%/}")
    skill_md="$skill_dir/SKILL.md"
    reason=""
    status="fail"

    if [ ! -f "$skill_md" ]; then
      reason="Missing SKILL.md"
      json_entries+=("{\"name\": \"$skill_name\", \"status\": \"fail\", \"reason\": \"$reason\"}")
      continue
    fi

    required_sections=("context" "instructions" "constraints" "examples")
    missing_sections=()
    for section in "${required_sections[@]}"; do
      grep -q "^## $section" "$skill_md" || grep -q "^$section:" "$skill_md" || missing_sections+=("$section")
    done

    if [ ${#missing_sections[@]} -eq 0 ]; then
      status="pass"
      reason="All required sections present"
    else
      status="fail"
      reason="Missing sections: $(IFS=,; echo "${missing_sections[*]}")"
    fi

    reason_escaped=$(echo "$reason" | sed 's/"/\\"/g')
    json_entries+=("{\"name\": \"$skill_name\", \"status\": \"$status\", \"reason\": \"$reason_escaped\"}")
  done

  local json_content=$(printf "[\n  %s\n]\n" "$(IFS=$'\n'; echo "${json_entries[*]}" | sed 's/$/,/' | sed '$s/,$//')")
  echo "$json_content" > "$HEALTH_OUTPUT"
  echo "$json_content" > "$WEB_OUTPUT"
  echo "Health check complete. Output: $HEALTH_OUTPUT"
}

check_all_skills
