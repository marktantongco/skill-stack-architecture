#!/usr/bin/env bash
# ─── Build for GitHub Pages ──────────────────────────────────────────────────
# GitHub Pages serves only static files, so we cannot ship API routes
# (which require a server runtime).  This script:
#   1. Temporarily moves src/app/api → src/app/api.disabled
#   2. Runs `next build` with DEPLOY_TARGET=gh-pages
#   3. Restores src/app/api regardless of build success
#
# Usage:  ./scripts/build-gh-pages.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

API_DIR="src/app/api"
API_DISABLED=".api-disabled-backup"

# Trap errors so we always restore api/
trap '{
  if [ -d "$API_DISABLED" ]; then
    rm -rf "$API_DIR"
    mv "$API_DISABLED" "$API_DIR"
    echo "Restored $API_DIR after error"
  fi
} 1>/dev/null 2>&1' EXIT

# 1. Move api aside
if [ -d "$API_DIR" ]; then
  echo "Temporarily moving $API_DIR -> $API_DISABLED"
  mv "$API_DIR" "$API_DISABLED"
fi

# 2. Build
echo "Building for GitHub Pages (DEPLOY_TARGET=gh-pages)..."
DEPLOY_TARGET=gh-pages npx next build
BUILD_EXIT=$?

# 3. Restore api/
if [ -d "$API_DISABLED" ]; then
  echo "Restoring $API_DIR"
  rm -rf "$API_DIR"
  mv "$API_DISABLED" "$API_DIR"
fi

# Clear trap so it doesn't double-restore
trap - EXIT

# Add .nojekyll (prevents GitHub Pages from processing _next/ with Jekyll)
if [ -d "out" ]; then
  touch out/.nojekyll
  echo "Added out/.nojekyll"
fi

exit $BUILD_EXIT
