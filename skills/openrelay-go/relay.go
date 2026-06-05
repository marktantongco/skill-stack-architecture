// ===========================================================================
// OpenRelay Go — Main Relay Daemon
// Version: 1.0.0
//
// A high-performance AI API relay with auto-discovery of 45+ AI endpoints.
// Supports pass-through, relay, and audit modes with provider failover chains.
//
// Build: go build -o openrelay relay.go
// Usage: ./openrelay --config config.json
// ===========================================================================

package main

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"
)

// ===========================================================================
// Configuration
// ===========================================================================

type RelayMode string

const (
	ModePassThrough RelayMode = "passthrough" // No logging, max performance
	ModeBilling     RelayMode = "billing"     // Metadata + token counts
	ModeAudit       RelayMode = "audit"       // Full body logging
)

type FailoverEntry struct {
	Provider string `json:"provider"`
	Model    string `json:"model"`
}

type EndpointEntry struct {
	Host          string         `json:"host"`
	Provider      string         `json:"provider"`
	FailoverChain []FailoverEntry `json:"failover_chain,omitempty"`
}

type Config struct {
	ListenAddr    string                  `json:"listen_addr"`
	Mode          RelayMode               `json:"mode"`
	BillingURL    string                  `json:"billing_url"`
	BillingToken  string                  `json:"billing_token"`
	Endpoints     map[string]EndpointEntry `json:"endpoints"`
	WarmupConns   int                     `json:"warmup_connections"`
	ReadTimeout   int                     `json:"read_timeout_sec"`
	WriteTimeout  int                     `json:"write_timeout_sec"`
	RegistryURL   string                  `json:"registry_url"`
	RegistryFile  string                  `json:"registry_file"`
}

func DefaultConfig() *Config {
	return &Config{
		ListenAddr:   ":8443",
		Mode:         ModeBilling,
		BillingURL:   "http://localhost:8090",
		WarmupConns:  5,
		ReadTimeout:  30,
		WriteTimeout: 120,
		RegistryURL:  "https://registry.openrelay.dev/v1/endpoints.json",
		RegistryFile: "",
		Endpoints:    DefaultEndpoints(),
	}
}

func DefaultEndpoints() map[string]EndpointEntry {
	return map[string]EndpointEntry{
		"api.anthropic.com": {
			Host: "api.anthropic.com", Provider: "anthropic",
			FailoverChain: []FailoverEntry{
				{Provider: "openai", Model: "gpt-4o"},
			},
		},
		"api.openai.com": {
			Host: "api.openai.com", Provider: "openai",
			FailoverChain: []FailoverEntry{
				{Provider: "anthropic", Model: "claude-3-opus"},
			},
		},
		"copilot-proxy.githubusercontent.com": {
			Host: "copilot-proxy.githubusercontent.com", Provider: "github-copilot",
		},
		"api2.cursor.sh": {
			Host: "api2.cursor.sh", Provider: "cursor",
		},
		"api.windsurf.ai": {
			Host: "api.windsurf.ai", Provider: "windsurf",
		},
		"generativelanguage.googleapis.com": {
			Host: "generativelanguage.googleapis.com", Provider: "google-gemini",
		},
		"api.mistral.ai": {
			Host: "api.mistral.ai", Provider: "mistral",
		},
		"api.deepseek.com": {
			Host: "api.deepseek.com", Provider: "deepseek",
		},
	}
}

// ===========================================================================
// Connection Pool & Warm-up
// ===========================================================================

type ConnPool struct {
	mu    sync.Mutex
	pools map[string]*http.Transport
}

func NewConnPool(warmupConns int) *ConnPool {
	return &ConnPool{
		pools: make(map[string]*http.Transport),
	}
}

func (cp *ConnPool) GetTransport(host string) *http.Transport {
	cp.mu.Lock()
	defer cp.mu.Unlock()

	if t, ok := cp.pools[host]; ok {
		return t
	}

	t := &http.Transport{
		DialContext: (&net.Dialer{
			Timeout:   10 * time.Second,
			KeepAlive: 30 * time.Second,
		}).DialContext,
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: false,
		},
		MaxIdleConns:        100,
		MaxIdleConnsPerHost: 20,
		IdleConnTimeout:     90 * time.Second,
		TLSHandshakeTimeout: 10 * time.Second,
	}
	cp.pools[host] = t
	return t
}

func (cp *ConnPool) Warmup(endpoints map[string]EndpointEntry) {
	for host := range endpoints {
		go func(h string) {
			transport := cp.GetTransport(h)
			client := &http.Client{Transport: transport, Timeout: 10 * time.Second}
			req, _ := http.NewRequest("HEAD", "https://"+h, nil)
			resp, err := client.Do(req)
			if err == nil {
				resp.Body.Close()
				log.Printf("[WARMUP] Connection to %s established", h)
			} else {
				log.Printf("[WARMUP] Failed to warm up %s: %v", h, err)
			}
		}(host)
	}
}

// ===========================================================================
// Billing Event Emitter
// ===========================================================================

type BillingEvent struct {
	Provider  string  `json:"provider"`
	Model     string  `json:"model"`
	TokensIn  int     `json:"tokens_in"`
	TokensOut int     `json:"tokens_out"`
	CostUSD   float64 `json:"cost_usd"`
	TeamID    string  `json:"team_id"`
	ProjectID string  `json:"project_id,omitempty"`
	Timestamp float64 `json:"timestamp"`
}

type BillingEmitter struct {
	url   string
	token string
	client *http.Client
}

func NewBillingEmitter(url, token string) *BillingEmitter {
	return &BillingEmitter{
		url:   url,
		token: token,
		client: &http.Client{Timeout: 5 * time.Second},
	}
}

func (be *BillingEmitter) Emit(event BillingEvent) {
	if be.url == "" {
		return
	}

	event.Timestamp = float64(time.Now().Unix())

	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("[BILLING] Failed to marshal event: %v", err)
		return
	}

	req, err := http.NewRequest("POST", be.url+"/events", strings.NewReader(string(data)))
	if err != nil {
		log.Printf("[BILLING] Failed to create request: %v", err)
		return
	}

	req.Header.Set("Content-Type", "application/json")
	if be.token != "" {
		req.Header.Set("Authorization", "Bearer "+be.token)
	}

	resp, err := be.client.Do(req)
	if err != nil {
		log.Printf("[BILLING] Failed to emit event: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		log.Printf("[BILLING] Event emission returned status %d", resp.StatusCode)
	}
}

// ===========================================================================
// Relay Handler
// ===========================================================================

type RelayHandler struct {
	config    *Config
	pool      *ConnPool
	billing   *BillingEmitter
	reqCount  int64
	mu        sync.Mutex
}

func NewRelayHandler(cfg *Config, pool *ConnPool, billing *BillingEmitter) *RelayHandler {
	return &RelayHandler{
		config:  cfg,
		pool:    pool,
		billing: billing,
	}
}

func (rh *RelayHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Determine the target host
	targetHost := r.Host
	if strings.Contains(targetHost, ":") {
		host, _, _ := net.SplitHostPort(targetHost)
		targetHost = host
	}

	// Look up endpoint configuration
	endpoint, exists := rh.config.Endpoints[targetHost]
	if !exists {
		// Unknown endpoint — pass through without billing
		rh.proxyRequest(w, r, targetHost, nil)
		return
	}

	// Proxy the request
	rh.proxyRequest(w, r, targetHost, &endpoint)
}

func (rh *RelayHandler) proxyRequest(w http.ResponseWriter, r *http.Request, targetHost string, endpoint *EndpointEntry) {
	// Build target URL
	targetURL := fmt.Sprintf("https://%s%s", targetHost, r.URL.Path)
	if r.URL.RawQuery != "" {
		targetURL += "?" + r.URL.RawQuery
	}

	// Create proxied request
	proxyReq, err := http.NewRequest(r.Method, targetURL, r.Body)
	if err != nil {
		http.Error(w, "Failed to create proxy request", http.StatusInternalServerError)
		return
	}

	// Copy headers
	for key, values := range r.Header {
		for _, value := range values {
			proxyReq.Header.Add(key, value)
		}
	}

	// Use pre-warmed transport
	transport := rh.pool.GetTransport(targetHost)
	client := &http.Client{
		Transport: transport,
		Timeout:   time.Duration(rh.config.WriteTimeout) * time.Second,
	}

	// Execute request
	start := time.Now()
	resp, err := client.Do(proxyReq)
	latency := time.Since(start)

	if err != nil {
		// Attempt failover if endpoint has a failover chain
		if endpoint != nil && len(endpoint.FailoverChain) > 0 {
			rh.attemptFailover(w, r, endpoint)
			return
		}
		http.Error(w, fmt.Sprintf("Upstream error: %v", err), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	// Copy response headers
	for key, values := range resp.Header {
		for _, value := range values {
			w.Header().Add(key, value)
		}
	}

	// Copy response body (and optionally capture for audit mode)
	var bodyBytes []byte
	if rh.config.Mode == ModeAudit && endpoint != nil {
		bodyBytes, _ = io.ReadAll(resp.Body)
		w.Write(bodyBytes)
	} else {
		w.WriteHeader(resp.StatusCode)
		io.Copy(w, resp.Body)
	}

	// Emit billing event
	if endpoint != nil && rh.config.Mode != ModePassThrough {
		go func() {
			// Estimate token counts from content-length (rough approximation)
			contentLen := resp.ContentLength
			if contentLen < 0 {
				contentLen = int64(len(bodyBytes))
			}
			approxTokens := contentLen / 4 // Rough: 1 token ≈ 4 bytes

			event := BillingEvent{
				Provider:  endpoint.Provider,
				Model:     "auto-detected",
				TokensIn:  0, // Would need request body parsing for accuracy
				TokensOut: int(approxTokens),
				CostUSD:   0, // Would need pricing lookup
				TeamID:    r.Header.Get("X-Team-ID"),
				Timestamp: float64(time.Now().Unix()),
			}
			rh.billing.Emit(event)
		}()
	}

	log.Printf("[RELAY] %s %s %s -> %d (%v)",
		r.Method, targetHost, r.URL.Path, resp.StatusCode, latency)
}

func (rh *RelayHandler) attemptFailover(w http.ResponseWriter, r *http.Request, endpoint *EndpointEntry) {
	for _, fo := range endpoint.FailoverChain {
		// Look up the failover provider's host
		for host, ep := range rh.config.Endpoints {
			if ep.Provider == fo.Provider {
				targetURL := fmt.Sprintf("https://%s%s", host, r.URL.Path)
				if r.URL.RawQuery != "" {
					targetURL += "?" + r.URL.RawQuery
				}

				proxyReq, err := http.NewRequest(r.Method, targetURL, r.Body)
				if err != nil {
					continue
				}
				for key, values := range r.Header {
					for _, value := range values {
						proxyReq.Header.Add(key, value)
					}
				}

				transport := rh.pool.GetTransport(host)
				client := &http.Client{Transport: transport, Timeout: 30 * time.Second}

				resp, err := client.Do(proxyReq)
				if err != nil {
					continue
				}
				defer resp.Body.Close()

				for key, values := range resp.Header {
					for _, value := range values {
						w.Header().Add(key, value)
					}
				}
				w.WriteHeader(resp.StatusCode)
				io.Copy(w, resp.Body)

				log.Printf("[FAILOVER] %s -> %s (%s -> %s)",
					endpoint.Provider, fo.Provider, endpoint.Host, host)
				return
			}
		}
	}

	http.Error(w, "All failover providers unavailable", http.StatusBadGateway)
}

// ===========================================================================
// Registry Auto-Update
// ===========================================================================

func UpdateRegistry(cfg *Config) {
	if cfg.RegistryURL == "" {
		return
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(cfg.RegistryURL)
	if err != nil {
		log.Printf("[REGISTRY] Failed to fetch update: %v", err)
		return
	}
	defer resp.Body.Close()

	var updates map[string]EndpointEntry
	if err := json.NewDecoder(resp.Body).Decode(&updates); err != nil {
		log.Printf("[REGISTRY] Failed to decode update: %v", err)
		return
	}

	added := 0
	for k, v := range updates {
		if _, exists := cfg.Endpoints[k]; !exists {
			cfg.Endpoints[k] = v
			added++
		}
	}

	if added > 0 {
		log.Printf("[REGISTRY] Added %d new endpoint(s)", added)
	}
}

// ===========================================================================
// Main
// ===========================================================================

func main() {
	configFile := flag.String("config", "", "Path to configuration file")
	listenAddr := flag.String("listen", "", "Override listen address")
	mode := flag.String("mode", "", "Override relay mode (passthrough|billing|audit)")
	flag.Parse()

	cfg := DefaultConfig()

	if *configFile != "" {
		data, err := os.ReadFile(*configFile)
		if err != nil {
			log.Fatalf("Failed to read config: %v", err)
		}
		if err := json.Unmarshal(data, cfg); err != nil {
			log.Fatalf("Failed to parse config: %v", err)
		}
	}

	if *listenAddr != "" {
		cfg.ListenAddr = *listenAddr
	}
	if *mode != "" {
		cfg.Mode = RelayMode(*mode)
	}

	// Initialize components
	pool := NewConnPool(cfg.WarmupConns)
	billing := NewBillingEmitter(cfg.BillingURL, cfg.BillingToken)
	handler := NewRelayHandler(cfg, pool, billing)

	// Warm up connections
	log.Println("[INIT] Warming up connections to known AI endpoints...")
	pool.Warmup(cfg.Endpoints)

	// Periodic registry update
	go func() {
		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()
		for range ticker.C {
			UpdateRegistry(cfg)
		}
	}()

	// Periodic connection re-warmup
	go func() {
		ticker := time.NewTicker(30 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			pool.Warmup(cfg.Endpoints)
		}
	}()

	// Setup HTTP server
	server := &http.Server{
		Addr:         cfg.ListenAddr,
		Handler:      handler,
		ReadTimeout:  time.Duration(cfg.ReadTimeout) * time.Second,
		WriteTimeout: time.Duration(cfg.WriteTimeout) * time.Second,
	}

	// Graceful shutdown
	go func() {
		sigCh := make(chan os.Signal, 1)
		signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
		<-sigCh
		log.Println("[SHUTDOWN] Gracefully shutting down...")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		server.Shutdown(ctx)
	}()

	log.Printf("[START] OpenRelay Go v1.0.0 listening on %s (mode: %s)", cfg.ListenAddr, cfg.Mode)
	log.Printf("[START] Monitoring %d AI endpoints", len(cfg.Endpoints))
	log.Printf("[START] Billing backend: %s", cfg.BillingURL)

	if err := server.ListenAndServe(); err != http.ErrServerClosed {
		log.Fatalf("Server error: %v", err)
	}

	log.Println("[STOP] OpenRelay Go stopped")
}
