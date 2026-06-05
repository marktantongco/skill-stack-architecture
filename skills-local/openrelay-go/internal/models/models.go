package models

import (
	"encoding/json"
	"time"
)

// ChatCompletionRequest mirrors OpenAI's chat completion request
type ChatCompletionRequest struct {
	Model            string          `json:"model"`
	Messages         []Message       `json:"messages"`
	Temperature      *float64        `json:"temperature,omitempty"`
	MaxTokens        *int            `json:"max_tokens,omitempty"`
	Stream           bool            `json:"stream,omitempty"`
	TopP             *float64        `json:"top_p,omitempty"`
	FrequencyPenalty *float64        `json:"frequency_penalty,omitempty"`
	PresencePenalty  *float64        `json:"presence_penalty,omitempty"`
	Tools            []Tool          `json:"tools,omitempty"`
	ToolChoice       interface{}     `json:"tool_choice,omitempty"`
	ResponseFormat   interface{}     `json:"response_format,omitempty"`
}

// Message represents a chat message
type Message struct {
	Role       string          `json:"role"`
	Content    interface{}     `json:"content"`
	Name       string          `json:"name,omitempty"`
	ToolCalls  []ToolCall      `json:"tool_calls,omitempty"`
	ToolCallID string          `json:"tool_call_id,omitempty"`
}

// Tool represents an available tool
type Tool struct {
	Type     string          `json:"type"`
	Function FunctionDefinition `json:"function"`
}

// FunctionDefinition defines a tool function
type FunctionDefinition struct {
	Name        string          `json:"name"`
	Description string          `json:"description,omitempty"`
	Parameters  json.RawMessage `json:"parameters"`
}

// ToolCall represents a tool invocation
type ToolCall struct {
	ID       string          `json:"id"`
	Type     string          `json:"type"`
	Function ToolCallFunction `json:"function"`
}

// ToolCallFunction contains the function details
type ToolCallFunction struct {
	Name      string `json:"name"`
	Arguments string `json:"arguments"`
}

// ChatCompletionResponse mirrors OpenAI's response
type ChatCompletionResponse struct {
	ID      string   `json:"id"`
	Object  string   `json:"object"`
	Created int64    `json:"created"`
	Model   string   `json:"model"`
	Choices []Choice `json:"choices"`
	Usage   Usage    `json:"usage"`
}

// Choice represents a completion choice
type Choice struct {
	Index        int     `json:"index"`
	Message      Message `json:"message,omitempty"`
	Delta        *Message `json:"delta,omitempty"`
	FinishReason *string `json:"finish_reason"`
}

// Usage tracks token consumption
type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

// SSEChunk represents a server-sent event chunk
type SSEChunk struct {
	ID      string   `json:"id"`
	Object  string   `json:"object"`
	Created int64    `json:"created"`
	Model   string   `json:"model"`
	Choices []Choice `json:"choices"`
}

// Model represents a model in the /v1/models list
type Model struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	OwnedBy string `json:"owned_by"`
}

// ModelList is the response for /v1/models
type ModelList struct {
	Object string  `json:"object"`
	Data   []Model `json:"data"`
}

// ProviderStatus tracks provider health
type ProviderStatus struct {
	Name        string    `json:"name"`
	Type        string    `json:"type"`
	Available   bool      `json:"available"`
	LastChecked time.Time `json:"last_checked"`
	Latency     int64     `json:"latency_ms"`
	QuotaStatus string    `json:"quota_status"`
	Error       string    `json:"error,omitempty"`
}

// HealthResponse is the /health endpoint response
type HealthResponse struct {
	Status           string           `json:"status"`
	Version          string           `json:"version"`
	Uptime           string           `json:"uptime"`
	Providers        []ProviderStatus `json:"providers"`
	ActiveRequests   int64            `json:"active_requests"`
	TotalRequests    int64            `json:"total_requests"`
	BillingProxy     BillingProxyHealth `json:"billing_proxy,omitempty"`
}

// BillingProxyHealth tracks billing proxy status
type BillingProxyHealth struct {
	Enabled          bool   `json:"enabled"`
	Authenticated    bool   `json:"authenticated"`
	SubscriptionType string `json:"subscription_type,omitempty"`
	RequestCount     int64  `json:"request_count"`
	PatternCount     int    `json:"pattern_count"`
	Version          string `json:"version"`
	Layers           []string `json:"layers"`
}

// Credentials represents Claude Code credentials
type Credentials struct {
	AccessToken      string `json:"accessToken"`
	RefreshToken     string `json:"refreshToken"`
	SubscriptionType string `json:"subscriptionType,omitempty"`
	ExpiresAt        int64  `json:"expiresAt,omitempty"`
}
