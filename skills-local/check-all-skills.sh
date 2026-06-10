#!/bin/bash

# Wrapper script to check all skills in /workspace/skills/
# Runs the health check and outputs results

SKILLS_DIR="/workspace/skills"
STARTUP_CHECK="$SKILLS_DIR/system-prompt-sync/startup-check.sh"

if [ ! -f "$STARTUP_CHECK" ]; then
  echo "Error: startup-check.sh not found at $STARTUP_CHECK"
  exit 1
fi

bash "$STARTUP_CHECK"

# Display results
if [ -f "/tmp/skill-health.json" ]; then
  echo ""
  echo "=== Skill Health Report ==="
  cat /tmp/skill-health.json | python3 -m json.tool 2>/dev/null || cat /tmp/skill-health.json
fi
