#!/usr/bin/env bash
# ─── IndexNow Submission ─────────────────────────────────────────────────────
# Modern replacement for the deprecated Google/Bing ping endpoints.
# Submit URLs to Bing, Yandex, Naver, and other IndexNow participants.
#
# Usage:  ./scripts/indexnow-submit.sh [URL]
#   Default URL: https://skill-stack-architecture.vercel.app/
#
# Prerequisites:
#   - public/2c43e277e7a84bdf822191701758b5ad.txt must be deployed
#     (verifies key ownership)
#   - The same key must be in the <meta name="indexnow-key"> tag in layout.tsx

set -euo pipefail

KEY="2c43e277e7a84bdf822191701758b5ad"
KEY_LOCATION="https://skill-stack-architecture.vercel.app/${KEY}.txt"
SITE="https://skill-stack-architecture.vercel.app"
URL_TO_SUBMIT="${1:-${SITE}/}"

echo "Submitting to IndexNow..."
echo "  URL:        ${URL_TO_SUBMIT}"
echo "  Key:        ${KEY}"
echo "  Key file:   ${KEY_LOCATION}"
echo ""

# Submit single URL via GET (simplest)
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Content-Type: application/json; charset=utf-8" \
  "https://api.indexnow.org/IndexNow?url=${URL_TO_SUBMIT}&key=${KEY}&keyLocation=${KEY_LOCATION}")

echo "IndexNow response: HTTP ${RESPONSE}"
case "$RESPONSE" in
  200) echo "✓ URL submitted successfully (200 OK)" ;;
  202) echo "✓ URL accepted for processing (202 Accepted)" ;;
  400) echo "✗ Invalid request format (400)" ;;
  403) echo "✗ Key verification failed — is ${KEY_LOCATION} accessible?" ;;
  422) echo "✗ URL doesn't match the host of the key file (422)" ;;
  *)   echo "? Unexpected response — check https://www.indexnow.org/Documentation" ;;
esac

echo ""
echo "Note: IndexNow is supported by Bing, Yandex, Naver, Seznam, and Yep."
echo "Google does NOT participate in IndexNow — submit sitemap via GSC manually."
