package providers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/openrelay/openrelay-go/internal/config"
	"github.com/openrelay/openrelay-go/internal/models"
	"github.com/sirupsen/logrus"
)

// Registry manages AI provider discovery and routing
type Registry struct {
	mu        sync.RWMutex
	providers map[string]*Provider
	cfg       *config.Config
	statuses  map[string]models.ProviderStatus
	reqCount  int64
	rrIndex   int64 // dedicated round-robin counter
}

// Provider wraps a configured upstream provider
type Provider struct {
	Config   config.ProviderConfig
	Client   *http.Client
	Healthy  bool
	LastUsed time.Time
	Failures int
}

// NewRegistry creates a new provider registry
func NewRegistry(cfg *config.Config) *Registry {
	r := &Registry{
		providers: make(map[string]*Provider),
		cfg:       cfg,
		statuses:  make(map[string]models.ProviderStatus),
	}
	for _, p := range cfg.Providers {
		r.addProvider(p)
	}
	return r
}

func (r *Registry) addProvider(pc config.ProviderConfig) {
	client := &http.Client{
		Timeout: 120 * time.Second,
		Transport: &http.Transport{
			MaxIdleConns:        100,
			MaxIdleConnsPerHost: 10,
			IdleConnTimeout:     90 * time.Second,
		},
	}
	r.providers[pc.Name] = &Provider{
		Config:  pc,
		Client:  client,
		Healthy: pc.Enabled,
	}
}

// Discover runs continuous provider health checks
func (r *Registry) Discover(ctx context.Context) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	// Initial discovery
	r.checkAll()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			r.checkAll()
		}
	}
}

func (r *Registry) checkAll() {
	var wg sync.WaitGroup
	for name, p := range r.providers {
		wg.Add(1)
		go func(n string, prov *Provider) {
			defer wg.Done()
			r.checkProvider(n, prov)
		}(name, p)
	}
	wg.Wait()
}

func (r *Registry) checkProvider(name string, p *Provider) {
	start := time.Now()
	status := models.ProviderStatus{
		Name:        name,
		Type:        p.Config.Type,
		LastChecked: time.Now(),
	}

	// Simple health check - try HEAD on base URL first, fallback to GET /v1/models
	base := strings.TrimSuffix(p.Config.BaseURL, "/")
	url := base + "/v1/models"
	method := "GET"

	// For providers that may not expose /v1/models, try base URL HEAD first
	if p.Config.Type == "anthropic" || p.Config.Type == "claude" {
		url = base
		method = "HEAD"
	}

	req, err := http.NewRequest(method, url, nil)
	if err != nil {
		status.Error = err.Error()
		status.Available = false
		r.updateStatus(name, status)
		return
	}

	if p.Config.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+p.Config.APIKey)
	}

	resp, err := p.Client.Do(req)
	if err != nil {
		status.Error = err.Error()
		status.Available = false
		p.Healthy = false
		p.Failures++
	} else {
		defer resp.Body.Close()
		status.Latency = time.Since(start).Milliseconds()
		if resp.StatusCode == http.StatusOK {
			status.Available = true
			p.Healthy = true
			p.Failures = 0
			// Parse quota info if available
			if limit := resp.Header.Get("x-ratelimit-remaining"); limit != "" {
				status.QuotaStatus = limit + " remaining"
			} else {
				status.QuotaStatus = "active"
			}
		} else {
			status.Available = false
			status.Error = fmt.Sprintf("HTTP %d", resp.StatusCode)
			p.Healthy = false
			p.Failures++
		}
	}

	r.updateStatus(name, status)
}

func (r *Registry) updateStatus(name string, status models.ProviderStatus) {
	r.mu.Lock()
	r.statuses[name] = status
	r.mu.Unlock()
}

// GetProvider returns a provider by name
func (r *Registry) GetProvider(name string) (*Provider, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	p, ok := r.providers[name]
	return p, ok
}

// SelectProvider chooses a provider based on model ID or group
func (r *Registry) SelectProvider(modelID string) (*Provider, string, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	// Check if it's a model group
	if group, ok := r.cfg.ModelGroups[modelID]; ok {
		return r.selectFromGroup(group)
	}

	// Direct model mapping
	for _, p := range r.providers {
		if !p.Healthy || !p.Config.Enabled {
			continue
		}
		for _, m := range p.Config.Models {
			if m.ID == modelID {
				return p, modelID, nil
			}
		}
	}

	// Fallback: use first available provider
	for _, p := range r.providers {
		if p.Healthy && p.Config.Enabled {
			return p, modelID, nil
		}
	}

	return nil, "", fmt.Errorf("no available provider for model: %s", modelID)
}

func (r *Registry) selectFromGroup(group config.ModelGroup) (*Provider, string, error) {
	switch group.Strategy {
	case "round_robin":
		return r.roundRobin(group.Providers)
	case "load_balance":
		return r.leastLoaded(group.Providers)
	default: // failover
		return r.failover(group.Providers)
	}
}

func (r *Registry) failover(names []string) (*Provider, string, error) {
	for _, name := range names {
		if p, ok := r.providers[name]; ok && p.Healthy && p.Config.Enabled {
			return p, name, nil
		}
	}
	return nil, "", fmt.Errorf("all providers in group unavailable")
}

func (r *Registry) roundRobin(names []string) (*Provider, string, error) {
	idx := int(atomic.AddInt64(&r.rrIndex, 1)) % len(names)
	for i := 0; i < len(names); i++ {
		name := names[(idx+i)%len(names)]
		if p, ok := r.providers[name]; ok && p.Healthy && p.Config.Enabled {
			return p, name, nil
		}
	}
	return nil, "", fmt.Errorf("all providers in group unavailable")
}

func (r *Registry) leastLoaded(names []string) (*Provider, string, error) {
	var best *Provider
	var bestName string
	var bestTime time.Time

	r.mu.RLock()
	for _, name := range names {
		p, ok := r.providers[name]
		if !ok || !p.Healthy || !p.Config.Enabled {
			continue
		}
		if best == nil || p.LastUsed.Before(best.LastUsed) {
			best = p
			bestName = name
			bestTime = p.LastUsed
		}
	}
	r.mu.RUnlock()

	if best == nil {
		return nil, "", fmt.Errorf("all providers in group unavailable")
	}

	// Update LastUsed with write lock to avoid race
	r.mu.Lock()
	best.LastUsed = time.Now()
	r.mu.Unlock()

	return best, bestName, nil
}

// AllStatuses returns current provider statuses
func (r *Registry) AllStatuses() []models.ProviderStatus {
	r.mu.RLock()
	defer r.mu.RUnlock()
	result := make([]models.ProviderStatus, 0, len(r.statuses))
	for _, s := range r.statuses {
		result = append(result, s)
	}
	return result
}

// AllModels returns all available models
func (r *Registry) AllModels() []models.Model {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var models []models.Model
	now := time.Now().Unix()
	seen := make(map[string]bool)

	for _, p := range r.providers {
		if !p.Healthy || !p.Config.Enabled {
			continue
		}
		for _, m := range p.Config.Models {
			if seen[m.ID] {
				continue
			}
			seen[m.ID] = true
			models = append(models, models.Model{
				ID:      m.ID,
				Object:  "model",
				Created: now,
				OwnedBy: p.Config.Name,
			})
		}
	}

	// Add virtual model groups
	for name := range r.cfg.ModelGroups {
		if seen[name] {
			continue
		}
		seen[name] = true
		models = append(models, models.Model{
			ID:      name,
			Object:  "model",
			Created: now,
			OwnedBy: "openrelay",
		})
	}

	return models
}

// IncrementRequests atomically increments request counter
func (r *Registry) IncrementRequests() int64 {
	return atomic.AddInt64(&r.reqCount, 1)
}

// GetRequestCount returns total requests
func (r *Registry) GetRequestCount() int64 {
	return atomic.LoadInt64(&r.reqCount)
}
