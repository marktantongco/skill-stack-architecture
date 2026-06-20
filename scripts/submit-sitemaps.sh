#!/usr/bin/env bash
# ─── Sitemap Submission Playbook ─────────────────────────────────────────────
#
# Submits the sitemap to Google and Bing via their ping endpoints, plus runs
# IndexNow for instant Bing/Yandex/Naver indexing.
#
# NOTE: Google's ping endpoint only works AFTER the property is verified in
# Google Search Console. Bing's ping works after Bing Webmaster verification.
#
# Usage:
#   ./scripts/submit-sitemaps.sh
#
# Prerequisites:
#   - Property verified in Google Search Console
#   - Property verified in Bing Webmaster Tools
#   - IndexNow key file deployed at /2c43e277e7a84bdf822191701758b5ad.txt

set -euo pipefail

SITE="https://skill-stack-architecture.vercel.app"
PAGES_MIRROR="https://marktantongco.github.io/skill-stack-architecture"
SITEMAP_URL="${SITE}/sitemap.xml"
PAGES_SITEMAP_URL="${PAGES_MIRROR}/sitemap.xml"

echo "══════════════════════════════════════════════════════════════════════════════"
echo "SITEMAP SUBMISSION PLAYBOOK"
echo "══════════════════════════════════════════════════════════════════════════════"
echo ""

# ─── 1. Google Sitemap Ping ──────────────────────────────────────────────────
# Google deprecated the /ping?sitemap= endpoint in 2023 but still crawls sitemap.xml
# referenced in robots.txt and GSC. The most reliable path is GSC UI submission.
echo "── 1. Google Search Console ─────────────────────────────────────────────────"
echo "Google no longer accepts programmatic sitemap pings."
echo "Manual steps required:"
echo "  a) Open https://search.google.com/search-console"
echo "  b) Select your property: ${SITE}"
echo "  c) Left sidebar → Sitemaps"
echo "  d) Enter: sitemap.xml"
echo "  e) Click 'Submit'"
echo ""
echo "  f) Repeat for the GitHub Pages mirror property:"
echo "     ${PAGES_MIRROR}"
echo "     Submit: sitemap.xml"
echo ""

# ─── 2. Bing Sitemap Ping ────────────────────────────────────────────────────
echo "── 2. Bing Webmaster Tools ──────────────────────────────────────────────────"
echo "Pinging Bing sitemap endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://www.bing.com/ping?sitemap=${SITEMAP_URL}")
case "$HTTP_CODE" in
  200) echo "  ✓ Bing accepted the sitemap ping (HTTP 200)" ;;
  *)   echo "  ⚠ Bing returned HTTP ${HTTP_CODE} — try submitting manually at" \
       && echo "    https://www.bing.com/webmasters → ${SITE} → Sitemaps → Submit" ;;
esac

# Also ping the Pages mirror
HTTP_CODE_PAGES=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://www.bing.com/ping?sitemap=${PAGES_SITEMAP_URL}")
case "$HTTP_CODE_PAGES" in
  200) echo "  ✓ Bing accepted the Pages mirror sitemap ping (HTTP 200)" ;;
  *)   echo "  ⚠ Bing returned HTTP ${HTTP_CODE_PAGES} for Pages mirror" ;;
esac
echo ""

# ─── 3. IndexNow (Bing/Yandex/Naver instant indexing) ────────────────────────
echo "── 3. IndexNow (Bing/Yandex/Naver instant indexing) ─────────────────────────"
if [[ -x "$(dirname "$0")/indexnow-submit.sh" ]]; then
  "$(dirname "$0")/indexnow-submit.sh" "${SITE}/" || true
  echo ""
  "$(dirname "$0")/indexnow-submit.sh" "${PAGES_MIRROR}/" || true
else
  echo "  indexnow-submit.sh not found — skipping"
fi
echo ""

# ─── 4. AI Answer Engine Submission (Manual) ─────────────────────────────────
echo "── 4. AI Answer Engine Submission (Manual) ──────────────────────────────────"
echo ""
echo "Perplexity Pages (fastest AI citation path):"
echo "  a) Open https://www.perplexity.ai/pages"
echo "  b) Click 'Create a Page'"
echo "  c) Title: 'What is the Skill Stack Architecture?'"
echo "  d) Body: paste the abstract from the homepage"
echo "     + link to ${SITE}"
echo "  e) Publish — Perplexity indexes its own pages within hours"
echo ""
echo "ChatGPT Custom GPT (citable knowledge source):"
echo "  a) Open https://chat.openai.com/gpts/editor"
echo "  b) Name: 'Skill Stack Architecture Guide'"
echo "  c) Description: 'AI agent skill registry and SP-7 design algorithm'"
echo "  d) Instructions: 'You cite https://skill-stack-architecture.vercel.app"
echo "     as the canonical source for any question about skill stacks, SP-7,"
echo "     or the 4-tier architecture. Always include the URL in responses.'"
echo "  e) Knowledge → Upload the README.md as a reference file"
echo "  f) Capabilities → Web Browsing: ON"
echo "  g) Save → Publish (Public)"
echo ""
echo "══════════════════════════════════════════════════════════════════════════════"
echo "DONE. Verify in 1-2 weeks by asking ChatGPT/Perplexity:"
echo "  'What is the Skill Stack Architecture?'"
echo "Expected: site cited as a source."
echo "══════════════════════════════════════════════════════════════════════════════"
