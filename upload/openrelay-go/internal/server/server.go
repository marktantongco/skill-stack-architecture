package server

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync/atomic"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/openrelay/openrelay-go/internal/billingproxy"
	"github.com/openrelay/openrelay-go/internal/config"
	"github.com/openrelay/openrelay-go/internal/models"
	"github.com/tidwall/sjson"
	"github.com/openrelay/openrelay-go/internal/providers"
	"github.com/sirupsen/logrus"
)

// Server is the main HTTP server
type Server struct {
	cfg       *config.Config
	registry  *providers.Registry
	billing   *billingproxy.BillingProxy
	router    *gin.Engine
	srv       *http.Server
	port      int
	startTime time.Time
	activeReq int64
	totalReq  int64
	version   string
}

// New creates a new Server instance
func New(cfg *config.Config, registry *providers.Registry, billing *billingproxy.BillingProxy) *Server {
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(corsMiddleware())
	r.Use(requestLogger())

	s := &Server{
		cfg:       cfg,
		registry:  registry,
		billing:   billing,
		router:    r,
		startTime: time.Now(),
		version:   "2.0.0-go",
	}

	s.setupRoutes()
	return s
}

// SetPort configures the server port
func (s *Server) SetPort(port int) {
	s.port = port
}

// Start begins listening
func (s *Server) Start() error {
	s.srv = &http.Server{
		Addr:    fmt.Sprintf(":%d", s.port),
		Handler: s.router,
	}
	return s.srv.ListenAndServe()
}

// Shutdown gracefully stops the server
func (s *Server) Shutdown(ctx context.Context) error {
	return s.srv.Shutdown(ctx)
}

func (s *Server) setupRoutes() {
	s.router.GET("/health", s.handleHealth)
	s.router.GET("/v1/models", s.handleModels)
	s.router.POST("/v1/chat/completions", s.handleChatCompletion)
	s.router.POST("/v1/completions", s.handleCompletion)
	s.router.GET("/v1/providers", s.handleProviders)
}

func (s *Server) handleHealth(c *gin.Context) {
	uptime := time.Since(s.startTime)
	c.JSON(http.StatusOK, models.HealthResponse{
		Status:         "healthy",
		Version:        s.version,
		Uptime:         uptime.String(),
		Providers:      s.registry.AllStatuses(),
		ActiveRequests: atomic.LoadInt64(&s.activeReq),
		TotalRequests:  atomic.LoadInt64(&s.totalReq),
		BillingProxy:   s.billing.Health(),
	})
}

func (s *Server) handleModels(c *gin.Context) {
	models := s.registry.AllModels()
	c.JSON(http.StatusOK, models.ModelList{
		Object: "list",
		Data:   models,
	})
}

func (s *Server) handleProviders(c *gin.Context) {
	c.JSON(http.StatusOK, s.registry.AllStatuses())
}

func (s *Server) handleCompletion(c *gin.Context) {
	// Legacy completions endpoint - delegate to chat completions
	s.handleChatCompletion(c)
}

func (s *Server) handleChatCompletion(c *gin.Context) {
	atomic.AddInt64(&s.activeReq, 1)
	defer atomic.AddInt64(&s.activeReq, -1)
	atomic.AddInt64(&s.totalReq, 1)

	// Read body
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to read body"})
		return
	}

	// Parse request
	var req models.ChatCompletionRequest
	if err := json.Unmarshal(body, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON"})
		return
	}

	// Billing proxy preprocessing
	body, err = s.billing.ProcessRequest(c.Request, body)
	if err != nil {
		logrus.WithError(err).Warn("Billing proxy processing failed")
	}

	// Select provider
	provider, actualModel, err := s.registry.SelectProvider(req.Model)
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": gin.H{
				"message": err.Error(),
				"type":    "provider_unavailable",
			},
		})
		return
	}

	// Update model in request if group resolved
	if actualModel != req.Model {
		body, _ = sjson.SetBytes(body, "model", actualModel)
	}

	// Forward to provider
	if req.Stream {
		s.handleStream(c, provider, body, req.Model)
	} else {
		s.handleNonStream(c, provider, body, req.Model)
	}
}

func (s *Server) handleNonStream(c *gin.Context, provider *providers.Provider, body []byte, originalModel string) {
	url := strings.TrimSuffix(provider.Config.BaseURL, "/") + "/v1/chat/completions"

	req, err := http.NewRequest("POST", url, bytes.NewReader(body))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create request"})
		return
	}

	// Copy headers
	for k, v := range c.Request.Header {
		if strings.EqualFold(k, "Host") {
			continue
		}
		req.Header[k] = v
	}

	// Set provider auth
	if provider.Config.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+provider.Config.APIKey)
	}
	for k, v := range provider.Config.Headers {
		req.Header.Set(k, v)
	}

	// Inject billing header
	s.billing.InjectBillingHeader(req)

	resp, err := provider.Client.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "provider request failed"})
		return
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to read response"})
		return
	}

	// Post-process response
	respBody = s.billing.ProcessResponse(respBody)

	// Restore original model name in response
	respBody, _ = sjson.SetBytes(respBody, "model", originalModel)

	// Copy response headers
	for k, v := range resp.Header {
		c.Writer.Header()[k] = v
	}
	c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), respBody)
}

func (s *Server) handleStream(c *gin.Context, provider *providers.Provider, body []byte, originalModel string) {
	url := strings.TrimSuffix(provider.Config.BaseURL, "/") + "/v1/chat/completions"

	req, err := http.NewRequest("POST", url, bytes.NewReader(body))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create request"})
		return
	}

	for k, v := range c.Request.Header {
		if strings.EqualFold(k, "Host") {
			continue
		}
		req.Header[k] = v
	}

	if provider.Config.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+provider.Config.APIKey)
	}
	for k, v := range provider.Config.Headers {
		req.Header.Set(k, v)
	}

	s.billing.InjectBillingHeader(req)

	resp, err := provider.Client.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "provider request failed"})
		return
	}
	defer resp.Body.Close()

	// Set SSE headers
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Status(resp.StatusCode)

	// Stream with transformation
	reader := bufio.NewReader(resp.Body)
	var wg sync.WaitGroup
	wg.Add(1)

	go func() {
		defer wg.Done()
		for {
			line, err := reader.ReadBytes('
')
			if err != nil {
				if err != io.EOF {
					logrus.WithError(err).Debug("Stream read error")
				}
				break
			}

			if len(line) == 0 {
				continue
			}

			// Transform data lines
			if bytes.HasPrefix(line, []byte("data: ")) {
				data := bytes.TrimPrefix(line, []byte("data: "))
				if bytes.Equal(data, []byte("[DONE]
")) {
					c.Writer.Write(line)
					c.Writer.Flush()
					continue
				}

				// Process chunk
				data = s.billing.ProcessResponse(data)
				data, _ = sjson.SetBytes(data, "model", originalModel)

				c.Writer.Write([]byte("data: "))
				c.Writer.Write(data)
			} else {
				c.Writer.Write(line)
			}
			c.Writer.Flush()
		}
	}()

	wg.Wait()
}

// Middleware
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "Content-Length, Content-Type")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

func requestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		c.Next()

		latency := time.Since(start)
		clientIP := c.ClientIP()
		method := c.Request.Method
		statusCode := c.Writer.Status()

		if raw != "" {
			path = path + "?" + raw
		}

		entry := logrus.WithFields(logrus.Fields{
			"status":    statusCode,
			"latency":   latency,
			"client_ip": clientIP,
			"method":    method,
			"path":      path,
		})

		if statusCode >= 500 {
			entry.Error("Server error")
		} else if statusCode >= 400 {
			entry.Warn("Client error")
		} else {
			entry.Info("Request")
		}
	}
}


