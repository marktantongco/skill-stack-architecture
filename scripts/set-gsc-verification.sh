#!/usr/bin/env bash
# ─── Set Google Search Console Verification Token ────────────────────────────
#
# Sets GOOGLE_SITE_VERIFICATION (and optionally BING_SITE_VERIFICATION) as Vercel
# env vars in production, then triggers a redeploy so the meta tag goes live.
#
# This is the PREFERRED path (Option A) — it keeps secrets out of git.
#
# Usage:
#   ./scripts/set-gsc-verification.sh <google-token> [bing-token]
#
# Example:
#   ./scripts/set-gsc-verification.sh abc123DEF456ghi789jkl012mno345pqr678
#
# Prerequisites:
#   - Vercel CLI installed: npm i -g vercel
#   - VERCEL_TOKEN env var set (or run `vercel login` for interactive auth)
#   - Project already linked (run `vercel link` once if not)

set -euo pipefail

# ─── Args ────────────────────────────────────────────────────────────────────
if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <google-token> [bing-token]"
  echo ""
  echo "Example:"
  echo "  $0 abc123DEF456ghi789jkl012mno345pqr678"
  echo "  $0 abc123DEF456... bingMSvalidate01Token..."
  exit 1
fi

GSC_TOKEN="$1"
BING_TOKEN="${2:-}"

# ─── Vercel auth ─────────────────────────────────────────────────────────────
if [[ -n "${VERCEL_TOKEN:-}" ]]; then
  VERCEL_FLAGS=(--token "$VERCEL_TOKEN")
  echo "✓ Using VERCEL_TOKEN from environment"
else
  echo "⚠ VERCEL_TOKEN not set — falling back to interactive auth"
  echo "  (set VERCEL_TOKEN to skip the prompt: export VERCEL_TOKEN=vcp_xxx)"
  VERCEL_FLAGS=()
fi

# Sanity: ensure vercel CLI is available
if ! command -v vercel >/dev/null 2>&1; then
  echo "✗ vercel CLI not found. Install: npm i -g vercel"
  exit 1
fi

# ─── Set GOOGLE_SITE_VERIFICATION ────────────────────────────────────────────
echo ""
echo "Setting GOOGLE_SITE_VERIFICATION on Vercel (production environment)..."
echo "$GSC_TOKEN" | vercel env add GOOGLE_SITE_VERIFICATION production "${VERCEL_FLAGS[@]}"

# ─── Optionally set BING_SITE_VERIFICATION ───────────────────────────────────
if [[ -n "$BING_TOKEN" ]]; then
  echo ""
  echo "Setting BING_SITE_VERIFICATION on Vercel (production environment)..."
  echo "$BING_TOKEN" | vercel env add BING_SITE_VERIFICATION production "${VERCEL_FLAGS[@]}"
fi

# ─── Trigger production redeploy ─────────────────────────────────────────────
echo ""
echo "Triggering production redeploy to apply the new env vars..."
vercel --prod "${VERCEL_FLAGS[@]}"

# ─── Post-deploy verification ────────────────────────────────────────────────
echo ""
echo "Waiting 10s for deployment to settle..."
sleep 10

echo "Verifying meta tag is live on https://skill-stack-architecture.vercel.app/ ..."
META_TAG=$(curl -s https://skill-stack-architecture.vercel.app/ \
  | grep -oE '<meta name="google-site-verification" content="[^"]+"' || true)

if [[ -z "$META_TAG" ]]; then
  echo "✗ Meta tag not found yet — Vercel may still be deploying. Wait 30s and re-check:"
  echo "  curl -s https://skill-stack-architecture.vercel.app/ | grep google-site-verification"
  exit 1
fi

echo ""
echo "✓ Meta tag is LIVE:"
echo "  $META_TAG"

if [[ -n "$BING_TOKEN" ]]; then
  BING_TAG=$(curl -s https://skill-stack-architecture.vercel.app/ \
    | grep -oE '<meta name="msvalidate\.01" content="[^"]+"' || true)
  if [[ -n "$BING_TAG" ]]; then
    echo "  $BING_TAG"
  fi
fi

echo ""
echo "────────────────────────────────────────────────────────────────────────────"
echo "NEXT STEPS:"
echo "────────────────────────────────────────────────────────────────────────────"
echo "1. Go to https://search.google.com/search-console"
echo "   → Click your property (https://skill-stack-architecture.vercel.app)"
echo "   → Settings → Verification → Click 'Verify'"
echo "   → Status should change to 'Verified'"
echo ""
echo "2. Submit your sitemap:"
echo "   → Search Console → Sitemaps (left sidebar)"
echo "   → Enter: sitemap.xml"
echo "   → Click 'Submit'"
echo ""
echo "3. Add GitHub Pages mirror as a second property (Tactical backup):"
echo "   → Search Console → Add Property → URL prefix"
echo "   → https://marktantongco.github.io/skill-stack-architecture/"
echo "   → Verify with the same meta-tag method"
echo "   (the meta tag is already deployed to the Pages mirror)"
echo ""
echo "4. Run IndexNow to ping Bing/Yandex/Naver instantly:"
echo "   ./scripts/indexnow-submit.sh"
echo ""
echo "5. Submit sitemap to Bing Webmaster Tools:"
echo "   → https://www.bing.com/webmasters → Add site"
echo "   → Enter: https://skill-stack-architecture.vercel.app"
echo "   → Verify (meta tag is already live)"
echo "   → Submit sitemap: sitemap.xml"
echo "────────────────────────────────────────────────────────────────────────────"
