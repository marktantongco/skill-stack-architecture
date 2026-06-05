#!/usr/bin/env bash
# ============================================================================
# Openhuman Owl Install Proxy — Bootstrap Script
# Version: 1.0.0
# ============================================================================
#
# Automates installation and configuration of the OpenHuman billing proxy.
# Handles OAuth2 PKCE authentication, multi-tenant configuration, shadow mode,
# and automatic token refresh daemon setup.
#
# Usage:
#   chmod +x install.sh
#   ./install.sh --proxy-url https://proxy.example.com --tenant-id acme-team
#
# ============================================================================

set -euo pipefail

VERSION="1.0.0"
PROXY_URL="${OPENHUMAN_PROXY_URL:-}"
PROXY_TOKEN="${OPENHUMAN_PROXY_TOKEN:-}"
TENANT_ID="${OPENHUMAN_TENANT_ID:-default}"
PROXY_MODE="${OPENHUMAN_PROXY_MODE:-lenient}"
SHADOW_MODE="${OPENHUMAN_SHADOW_MODE:-off}"
INSTALL_DIR="${HOME}/.local/bin"
CONFIG_DIR="${HOME}/.config/openhuman-proxy"
PROXY_BIN_NAME="openhuman-proxy"
DAEMON_NAME="openhuman-proxy-watchdog"
VERBOSE=0
OAUTH_CLIENT_ID="${OPENHUMAN_OAUTH_CLIENT_ID:-}"
OAUTH_REDIRECT_PORT="${OPENHUMAN_OAUTH_PORT:-8400}"

# ---- Color Helpers ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

info()   { echo -e "${BLUE}[OWL-H]${NC} $*"; }
warn()   { echo -e "${YELLOW}[OWL-H-WARN]${NC} $*"; }
error()  { echo -e "${RED}[OWL-H-ERR]${NC} $*"; }
ok()     { echo -e "${GREEN}[OWL-H-OK]${NC} $*"; }
special(){ echo -e "${CYAN}[OWL-H]${NC} $*"; }

# ---- Argument Parsing ----
while [[ $# -gt 0 ]]; do
  case "$1" in
    --proxy-url)    PROXY_URL="$2"; shift 2 ;;
    --token)        PROXY_TOKEN="$2"; shift 2 ;;
    --tenant-id)    TENANT_ID="$2"; shift 2 ;;
    --mode)         PROXY_MODE="$2"; shift 2 ;;
    --shadow)       SHADOW_MODE="on"; shift ;;
    --oauth-client) OAUTH_CLIENT_ID="$2"; shift 2 ;;
    --install-dir)  INSTALL_DIR="$2"; shift 2 ;;
    --verbose)      VERBOSE=1; shift ;;
    --help|-h)
      echo "Usage: $0 [options]"
      echo "  --proxy-url URL       Billing proxy base URL"
      echo "  --token TOKEN         Pre-existing auth token (or start OAuth flow)"
      echo "  --tenant-id ID        Multi-tenant identifier (default: 'default')"
      echo "  --mode MODE           'strict' or 'lenient' (default: lenient)"
      echo "  --shadow              Enable shadow mode (dual-write) for validation"
      echo "  --oauth-client ID     OAuth2 client ID for PKCE flow"
      echo "  --install-dir DIR     Binary install directory"
      echo "  --verbose             Enable verbose output"
      echo "  --help                Show this help message"
      exit 0
      ;;
    *) error "Unknown option: $1"; exit 1 ;;
  esac
done

# ---- Pre-flight ----
info "Openhuman Owl Install Proxy v${VERSION}"
info "Tenant: ${TENANT_ID}"

if [[ -z "${PROXY_URL}" ]]; then
  error "No proxy URL provided. Use --proxy-url or set OPENHUMAN_PROXY_URL."
  exit 1
fi

# ---- OS Detection ----
detect_os() {
  local os_name="unknown" os_arch="unknown"
  case "$(uname -s)" in
    Linux*)   os_name="linux" ;;
    Darwin*)  os_name="darwin" ;;
    MINGW*|MSYS*|CYGWIN*) os_name="windows" ;;
    *)        os_name="$(uname -s | tr '[:upper:]' '[:lower:]')" ;;
  esac
  case "$(uname -m)" in
    x86_64|amd64) os_arch="amd64" ;;
    aarch64|arm64) os_arch="arm64" ;;
    *)            os_arch="$(uname -m)" ;;
  esac
  echo "${os_name}-${os_arch}"
}

PLATFORM="$(detect_os)"
info "Detected platform: ${PLATFORM}"

# ---- Download Binary ----
download_binary() {
  local download_url="${PROXY_URL}/releases/openhuman-proxy/${VERSION}/${PLATFORM}/openhuman-proxy"
  local target="${INSTALL_DIR}/${PROXY_BIN_NAME}"
  mkdir -p "${INSTALL_DIR}"

  info "Downloading openhuman-proxy binary..."
  if command -v curl &>/dev/null; then
    curl -fsSL -o "${target}" "${download_url}"
  else
    wget -q -O "${target}" "${download_url}"
  fi
  chmod +x "${target}"
  ok "Binary installed to ${target}"
}

if [[ -x "${INSTALL_DIR}/${PROXY_BIN_NAME}" ]]; then
  installed_version="$("${INSTALL_DIR}/${PROXY_BIN_NAME}" --version 2>/dev/null || echo 'unknown')"
  if [[ "${installed_version}" == "${VERSION}" ]]; then
    info "openhuman-proxy v${VERSION} already installed."
  else
    warn "Version mismatch (${installed_version} vs ${VERSION}). Re-downloading..."
    download_binary
  fi
else
  download_binary
fi

# ---- OAuth2 PKCE Flow ----
perform_oauth_pkce() {
  if [[ -z "${OAUTH_CLIENT_ID}" ]]; then
    warn "No OAuth client ID provided. Skipping OAuth2 PKCE flow."
    warn "You will need to manually set OPENHUMAN_PROXY_TOKEN."
    return
  fi

  info "Starting OAuth2 PKCE authentication flow..."

  # Generate PKCE verifier and challenge
  CODE_VERIFIER=$(openssl rand -base64 32 | tr -d '=/+' | head -c 43)
  CODE_CHALLENGE=$(printf '%s' "${CODE_VERIFIER}" | openssl dgst -sha256 -binary | openssl base64 -A | tr '+/' '-_' | tr -d '=')

  local auth_url="${PROXY_URL}/oauth/authorize?client_id=${OAUTH_CLIENT_ID}&response_type=code&redirect_uri=http://127.0.0.1:${OAUTH_REDIRECT_PORT}/callback&code_challenge=${CODE_CHALLENGE}&code_challenge_method=S256&tenant_id=${TENANT_ID}"

  info "Opening browser for OAuth2 consent..."
  info "Auth URL: ${auth_url}"

  # Try to open browser
  if command -v xdg-open &>/dev/null; then
    xdg-open "${auth_url}" 2>/dev/null &
  elif command -v open &>/dev/null; then
    open "${auth_url}" 2>/dev/null &
  elif command -v python3 &>/dev/null; then
    # Fallback: start a minimal HTTP server to capture the callback
    info "Starting callback listener on port ${OAUTH_REDIRECT_PORT}..."
    CALLBACK_SCRIPT=$(cat <<'PYEOF'
import http.server
import urllib.parse
import sys
import os

class CallbackHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        if 'code' in params:
            code = params['code'][0]
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(b'<html><body><h1>Authorization successful!</h1><p>You can close this tab.</p></body></html>')
            print(code)  # Output code to stdout
        else:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'Missing authorization code')
    def log_message(self, format, *args):
        pass  # Suppress log output

port = int(os.environ.get('OPENHUMAN_OAUTH_PORT', '8400'))
server = http.server.HTTPServer(('127.0.0.1', port), CallbackHandler)
server.handle_request()  # Handle exactly one request then exit
PYEOF
    )
    AUTH_CODE=$(OPENHUMAN_OAUTH_PORT="${OAUTH_REDIRECT_PORT}" python3 -c "${CALLBACK_SCRIPT}" &)
    wait $! 2>/dev/null || true

    if [[ -z "${AUTH_CODE}" ]]; then
      warn "OAuth callback did not receive authorization code."
      warn "Please manually obtain a token and re-run with --token <TOKEN>"
      return
    fi
  fi

  # Exchange code for token
  info "Exchanging authorization code for access token..."
  TOKEN_RESPONSE=$(curl -s -X POST "${PROXY_URL}/oauth/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "client_id=${OAUTH_CLIENT_ID}&grant_type=authorization_code&code=${AUTH_CODE}&redirect_uri=http://127.0.0.1:${OAUTH_REDIRECT_PORT}/callback&code_verifier=${CODE_VERIFIER}" 2>/dev/null || echo '{}')

  PROXY_TOKEN=$(echo "${TOKEN_RESPONSE}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || echo "")

  if [[ -z "${PROXY_TOKEN}" ]]; then
    error "Failed to obtain access token from OAuth2 flow."
    exit 1
  fi

  # Store refresh token
  REFRESH_TOKEN=$(echo "${TOKEN_RESPONSE}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('refresh_token',''))" 2>/dev/null || echo "")

  ok "OAuth2 authentication successful. Access token obtained."
}

# Only perform OAuth if no token was provided
if [[ -z "${PROXY_TOKEN}" && -n "${OAUTH_CLIENT_ID}" ]]; then
  perform_oauth_pkce
fi

if [[ -z "${PROXY_TOKEN}" ]]; then
  error "No authentication token available. Use --token or --oauth-client to authenticate."
  exit 1
fi

# ---- Write Configuration ----
mkdir -p "${CONFIG_DIR}"

cat > "${CONFIG_DIR}/config.env" <<EOF
# Openhuman Owl Proxy Configuration
# Auto-generated by openhuman-owl-install v${VERSION}

OPENHUMAN_PROXY_URL=${PROXY_URL}
OPENHUMAN_PROXY_TOKEN=${PROXY_TOKEN}
OPENHUMAN_TENANT_ID=${TENANT_ID}
OPENHUMAN_PROXY_MODE=${PROXY_MODE}
OPENHUMAN_SHADOW_MODE=${SHADOW_MODE}
EOF

if [[ -n "${REFRESH_TOKEN:-}" ]]; then
  echo "OPENHUMAN_REFRESH_TOKEN=${REFRESH_TOKEN}" >> "${CONFIG_DIR}/config.env"
fi

chmod 600 "${CONFIG_DIR}/config.env"
ok "Configuration written to ${CONFIG_DIR}/config.env"

# ---- Billing Tags Support ----
cat > "${CONFIG_DIR}/billing-tags.env" <<EOF
# Billing Tags — attach these key-value pairs to every request
# Uncomment and customize as needed:
# BILLING_TAG_PROJECT=acme-redesign
# BILLING_TAG_SPRINT=42
# BILLING_TAG_ENVIRONMENT=production
EOF

info "Billing tags template written to ${CONFIG_DIR}/billing-tags.env"
info "Edit billing-tags.env to add custom cost attribution tags."

# ---- Shell Profile Integration ----
inject_shell_profile() {
  local profile_file=""
  local shell_name="$(basename "${SHELL:-bash}")"

  case "${shell_name}" in
    zsh)  profile_file="${HOME}/.zshrc" ;;
    bash) profile_file="${HOME}/.bashrc" ;;
    fish) profile_file="${HOME}/.config/fish/config.fish" ;;
    *)    profile_file="${HOME}/.profile" ;;
  esac

  local marker="# >>> openhuman-owl-proxy >>>"
  local marker_end="# <<< openhuman-owl-proxy <<<"

  if grep -q "${marker}" "${profile_file}" 2>/dev/null; then
    sed -i.bak "/${marker}/,/${marker_end}/d" "${profile_file}"
  fi

  {
    echo ""
    echo "${marker}"
    echo "export OPENHUMAN_PROXY_URL=\"${PROXY_URL}\""
    echo "export OPENHUMAN_PROXY_TOKEN=\"${OPENHUMAN_PROXY_TOKEN:-}\""
    echo "export OPENHUMAN_TENANT_ID=\"${TENANT_ID}\""
    echo "export OPENHUMAN_PROXY_MODE=\"${PROXY_MODE}\""
    echo "export OPENHUMAN_SHADOW_MODE=\"${SHADOW_MODE}\""
    echo "export PATH=\"\${PATH}:${INSTALL_DIR}\""
    echo "${marker_end}"
  } >> "${profile_file}"

  ok "Shell profile (${profile_file}) updated"
}

inject_shell_profile

# ---- Token Refresh Daemon ----
setup_watchdog() {
  local watchdog_script="${CONFIG_DIR}/${DAEMON_NAME}.sh"

  cat > "${watchdog_script}" <<'DAEMON_EOF'
#!/usr/bin/env bash
# Openhuman Proxy Watchdog — Auto token refresh daemon
# Checks proxy health every 300s and refreshes tokens before expiry

CONFIG_DIR="${HOME}/.config/openhuman-proxy"
HEALTH_ENDPOINT="${OPENHUMAN_PROXY_URL}/health"
TOKEN_ENDPOINT="${OPENHUMAN_PROXY_URL}/oauth/token"

while true; do
  # Health check
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer ${OPENHUMAN_PROXY_TOKEN}" "${HEALTH_ENDPOINT}" 2>/dev/null || echo "000")

  if [[ "${HTTP_CODE}" == "401" ]]; then
    # Token expired — attempt refresh
    if [[ -n "${OPENHUMAN_REFRESH_TOKEN:-}" ]]; then
      NEW_TOKEN=$(curl -s -X POST "${TOKEN_ENDPOINT}" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "grant_type=refresh_token&refresh_token=${OPENHUMAN_REFRESH_TOKEN}" 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || echo "")

      if [[ -n "${NEW_TOKEN}" ]]; then
        export OPENHUMAN_PROXY_TOKEN="${NEW_TOKEN}"
        # Update config file
        sed -i "s/^OPENHUMAN_PROXY_TOKEN=.*/OPENHUMAN_PROXY_TOKEN=${NEW_TOKEN}/" "${CONFIG_DIR}/config.env"
      fi
    fi
  fi

  sleep 300
done
DAEMON_EOF

  chmod +x "${watchdog_script}"
  ok "Token refresh watchdog script written to ${watchdog_script}"
  info "To start the watchdog daemon, run: nohup ${watchdog_script} &"
}

setup_watchdog

# ---- Connectivity Validation ----
info "Validating proxy connectivity (tenant: ${TENANT_ID})..."

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer ${PROXY_TOKEN}" \
  -H "X-Tenant-ID: ${TENANT_ID}" \
  -H "Content-Type: application/json" \
  -d '{"model":"test","messages":[{"role":"user","content":"ping"}],"max_tokens":1}' \
  "${PROXY_URL}/v1/chat/completions" 2>/dev/null || echo "000")

case "${HTTP_CODE}" in
  200|201) ok "Proxy connectivity validated (HTTP ${HTTP_CODE}, tenant: ${TENANT_ID})" ;;
  401|403) error "Authentication failed (HTTP ${HTTP_CODE}). Token may be invalid for tenant ${TENANT_ID}."; exit 1 ;;
  404)     error "Proxy endpoint not found (HTTP 404). Check proxy URL."; exit 1 ;;
  429)     warn "Rate-limited (HTTP 429). Proxy is reachable but quota may be low." ;;
  000)     error "Cannot reach proxy at ${PROXY_URL}."
           [[ "${PROXY_MODE}" == "lenient" ]] && warn "Fail-open mode active." || { error "Strict mode — exiting."; exit 1; } ;;
  *)       warn "Unexpected response (HTTP ${HTTP_CODE})." ;;
esac

# ---- Shadow Mode Warning ----
if [[ "${SHADOW_MODE}" == "on" ]]; then
  special "SHADOW MODE ENABLED — All requests will be dual-written (proxy + direct)."
  special "This doubles API costs. Disable after 24-48 hours of validation."
  special "To disable: edit ${CONFIG_DIR}/config.env and set OPENHUMAN_SHADOW_MODE=off"
fi

# ---- Summary ----
echo ""
echo "===================================================="
ok "Openhuman Owl Install Proxy — Setup Complete"
echo "===================================================="
echo ""
echo "  Proxy URL:     ${PROXY_URL}"
echo "  Tenant ID:     ${TENANT_ID}"
echo "  Proxy Mode:    ${PROXY_MODE}"
echo "  Shadow Mode:   ${SHADOW_MODE}"
echo "  Binary:        ${INSTALL_DIR}/${PROXY_BIN_NAME}"
echo "  Config:        ${CONFIG_DIR}/config.env"
echo "  Billing Tags:  ${CONFIG_DIR}/billing-tags.env"
echo "  Watchdog:      ${CONFIG_DIR}/${DAEMON_NAME}.sh"
echo ""
echo "  Next steps:"
echo "    1. Source your shell profile"
echo "    2. Edit billing-tags.env with your cost attribution tags"
echo "    3. Start the watchdog: nohup ${CONFIG_DIR}/${DAEMON_NAME}.sh &"
echo "    4. Test: openhuman-proxy test-connection --tenant ${TENANT_ID}"
echo ""

exit 0
