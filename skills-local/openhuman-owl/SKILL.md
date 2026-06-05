# OpenHuman + OWL Proxy Defense Stack

## Purpose
Full-stack installer combining OpenHuman desktop AI app with the OWL proxy defense system. Creates systemd service, unified launcher, and environment integration for system-wide proxy routing.

## Install
```bash
sudo bash install.sh                  # Full install
sudo bash install.sh --owl-only       # Proxy stack only
sudo bash install.sh --openhuman-only # OpenHuman only
sudo bash install.sh --proxy-port 3128 # Custom port
```

## Key Components
- OpenHuman Desktop App (signed apt repo)
- OWL Proxy Defense Stack v4.0 (with HTTP server mode)
- Systemd service: owl-proxy.service
- Unified launcher: openhuman-owl
- Environment toggle: owl-proxy-env

## Services
- `owl-proxy start|stop|restart|status|logs|test|stats`
- `owl-proxy-env enable|disable|show`
- `openhuman-owl` (launch both), `openhuman-owl --no-proxy`, `openhuman-owl --proxy-only`

## Architecture
OpenHuman → OWL Proxy Server (:8080) → Proxy Pool → Upstream
                                     ↳ Direct Fallback (if all proxies fail)
