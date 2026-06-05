package config

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"

	"github.com/fsnotify/fsnotify"
	"sync"
	"github.com/sirupsen/logrus"
)

// Config represents the main application configuration
type Config struct {
	Port           int                      `json:"port"`
	Providers      []ProviderConfig         `json:"providers"`
	ModelGroups    map[string]ModelGroup    `json:"model_groups"`
	BillingProxy   BillingProxyConfig       `json:"billing_proxy"`
	ToolMappings   map[string]string        `json:"tool_mappings"`
	ReverseMappings map[string]string       `json:"reverse_mappings"`
	Replacements   [][2]string              `json:"replacements"`
	ReverseMap     [][2]string              `json:"reverse_map"`
	CredentialsPath string                  `json:"credentials_path"`
	LogLevel       string                   `json:"log_level"`

	mu     sync.RWMutex `json:"-"`
	loaded bool         `json:"-"`
}

// Safe accessors for hot-reload safety
func (c *Config) GetPort() int {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.Port
}

func (c *Config) GetBillingProxy() BillingProxyConfig {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.BillingProxy
}

func (c *Config) GetModelGroups() map[string]ModelGroup {
	c.mu.RLock()
	defer c.mu.RUnlock()
	result := make(map[string]ModelGroup, len(c.ModelGroups))
	for k, v := range c.ModelGroups {
		result[k] = v
	}
	return result
}

func (c *Config) GetProviders() []ProviderConfig {
	c.mu.RLock()
	defer c.mu.RUnlock()
	result := make([]ProviderConfig, len(c.Providers))
	copy(result, c.Providers)
	return result
}

// ProviderConfig defines an upstream AI provider
type ProviderConfig struct {
	Name        string            `json:"name"`
	Type        string            `json:"type"`
	BaseURL     string            `json:"base_url"`
	APIKey      string            `json:"api_key,omitempty"`
	AuthType    string            `json:"auth_type"`
	Models      []ModelConfig     `json:"models"`
	Priority    int               `json:"priority"`
	Enabled     bool              `json:"enabled"`
	Headers     map[string]string `json:"headers,omitempty"`
	RateLimit   *RateLimitConfig  `json:"rate_limit,omitempty"`
}

// ModelConfig defines a model exposed by a provider
type ModelConfig struct {
	ID            string `json:"id"`
	ContextWindow int    `json:"context_window"`
	MaxTokens     int    `json:"max_tokens"`
}

// ModelGroup defines a virtual model that combines multiple providers
type ModelGroup struct {
	Name      string   `json:"name"`
	Providers []string `json:"providers"`
	Strategy  string   `json:"strategy"` // "failover", "round_robin", "load_balance"
}

// RateLimitConfig defines rate limiting for a provider
type RateLimitConfig struct {
	RequestsPerMinute int `json:"requests_per_minute"`
	TokensPerMinute   int `json:"tokens_per_minute"`
}

// BillingProxyConfig defines the combined Hermes + OpenClaw billing proxy settings
type BillingProxyConfig struct {
	Enabled          bool              `json:"enabled"`
	Port             int               `json:"port"`
	CredentialsPath  string            `json:"credentials_path"`
	OAuthToken       string            `json:"oauth_token,omitempty"`
	BillingHeader    string            `json:"billing_header"`
	TriggerPhrases   []string          `json:"trigger_phrases"`
	ToolRenames      map[string]string `json:"tool_renames"`
	PropertyRenames  map[string]string `json:"property_renames"`
	StripDescriptions bool             `json:"strip_descriptions"`
	SystemTemplateBypass bool          `json:"system_template_bypass"`
	HermesMode       bool              `json:"hermes_mode"`
	OpenClawMode     bool              `json:"openclaw_mode"`
}

// Default returns a default configuration
func Default() *Config {
	home, _ := os.UserHomeDir()
	return &Config{
		Port: 18765,
		Providers: []ProviderConfig{},
		ModelGroups: make(map[string]ModelGroup),
		BillingProxy: BillingProxyConfig{
			Enabled:           false,
			Port:              18801,
			CredentialsPath:   filepath.Join(home, ".claude", ".credentials.json"),
			BillingHeader:     "x-anthropic-billing-header",
			TriggerPhrases:    defaultTriggerPhrases(),
			ToolRenames:       defaultToolRenames(),
			PropertyRenames:   defaultPropertyRenames(),
			StripDescriptions: true,
			SystemTemplateBypass: true,
			HermesMode:        true,
			OpenClawMode:      true,
		},
		CredentialsPath: filepath.Join(home, ".claude", ".credentials.json"),
		LogLevel:        "info",
	}
}

// Load reads configuration from file
func Load(path string) (*Config, error) {
	path = expandPath(path)
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, err
	}

	// Set up file watcher for hot reload
	go watchConfig(path, &cfg)

	return &cfg, nil
}

func watchConfig(path string, cfg *Config) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		logrus.WithError(err).Error("Failed to create config watcher")
		return
	}
	defer watcher.Close()

	dir := filepath.Dir(path)
	if err := watcher.Add(dir); err != nil {
		logrus.WithError(err).Error("Failed to watch config directory")
		return
	}

	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}
			if event.Has(fsnotify.Write) && event.Name == path {
				data, err := os.ReadFile(path)
				if err != nil {
					continue
				}
				var newCfg Config
				if err := json.Unmarshal(data, &newCfg); err != nil {
					logrus.WithError(err).Warn("Failed to reload config")
					continue
				}
				// Atomic update with lock
				cfg.mu.Lock()
				cfg.Port = newCfg.Port
				cfg.Providers = newCfg.Providers
				cfg.ModelGroups = newCfg.ModelGroups
				cfg.BillingProxy = newCfg.BillingProxy
				cfg.ToolMappings = newCfg.ToolMappings
				cfg.ReverseMappings = newCfg.ReverseMappings
				cfg.Replacements = newCfg.Replacements
				cfg.ReverseMap = newCfg.ReverseMap
				cfg.CredentialsPath = newCfg.CredentialsPath
				cfg.LogLevel = newCfg.LogLevel
				cfg.loaded = true
				cfg.mu.Unlock()
				logrus.Info("Configuration reloaded")
			}
		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			logrus.WithError(err).Error("Config watcher error")
		}
	}
}

func expandPath(path string) string {
	if strings.HasPrefix(path, "~/") {
		home, _ := os.UserHomeDir()
		path = filepath.Join(home, path[2:])
	}
	return path
}

func defaultTriggerPhrases() []string {
	return []string{
		"OpenClaw", "openclaw", "sessions_spawn", "sessions_list",
		"sessions_history", "sessions_send", "sessions_yield", "sessions_store",
		"HEARTBEAT_OK", "HEARTBEAT", "clawhub", "clawd", "hermes.md",
		"Hermes", "hermes", "running inside", "running on", "ocplatform",
		".openclaw/", ".hermes/", "claw_platform", "hermes_platform",
	}
}

func defaultToolRenames() map[string]string {
	return map[string]string{
		"exec":         "Bash",
		"lcm_grep":     "ContextGrep",
		"lcm_read":     "ReadFile",
		"lcm_write":    "WriteFile",
		"lcm_edit":     "EditFile",
		"lcm_ls":       "ListDir",
		"message":      "SendMessage",
		"sessions_spawn": "CreateTask",
		"sessions_list":  "ListTasks",
		"sessions_history": "GetHistory",
		"sessions_send":  "SendToTask",
		"sessions_yield": "YieldTask",
		"sessions_store": "StoreTask",
		"tool_use":     "ToolUse",
		"tool_result":  "ToolResult",
	}
}

func defaultPropertyRenames() map[string]string {
	return map[string]string{
		"session_id":  "thread_id",
		"claw_id":     "agent_id",
		"hermes_id":   "agent_id",
		"platform":    "environment",
		"workspace":   "project",
		"spawn":       "create",
		"yield":       "return_task",
	}
}
