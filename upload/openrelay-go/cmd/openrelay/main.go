package main

import (
	"context"
	"flag"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/openrelay/openrelay-go/internal/billingproxy"
	"github.com/openrelay/openrelay-go/internal/config"
	"github.com/openrelay/openrelay-go/internal/providers"
	"github.com/openrelay/openrelay-go/internal/server"
	"github.com/sirupsen/logrus"
)

var (
	configPath = flag.String("config", "~/.openrelay/config.json", "Path to configuration file")
	port       = flag.Int("port", 18765, "Server port")
	version    = "dev"
)

func main() {
	flag.Parse()
	logrus.SetFormatter(&logrus.TextFormatter{
		FullTimestamp: true,
	})
	logrus.SetLevel(logrus.InfoLevel)

	logrus.WithField("version", version).Info("OpenRelay Go starting...")

	// Load configuration
	cfg, err := config.Load(*configPath)
	if err != nil {
		logrus.WithError(err).Warn("Failed to load config, using defaults")
		cfg = config.Default()
	}

	// Initialize provider registry
	registry := providers.NewRegistry(cfg)
	go registry.Discover(context.Background())

	// Initialize billing proxy middleware
	bp := billingproxy.New(cfg.BillingProxy)

	// Create and start server
	srv := server.New(cfg, registry, bp)
	srv.SetPort(*port)

	go func() {
		if err := srv.Start(); err != nil && err != http.ErrServerClosed {
			logrus.WithError(err).Fatal("Server failed to start")
		}
	}()

	logrus.WithField("addr", fmt.Sprintf("http://localhost:%d", *port)).Info("OpenRelay ready")

	// Wait for interrupt
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logrus.Info("Shutting down OpenRelay...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logrus.WithError(err).Error("Server shutdown error")
	}

	logrus.Info("OpenRelay stopped")
}
