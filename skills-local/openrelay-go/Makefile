BINARY_NAME=openrelay
BUILD_DIR=./build
CMD_PATH=./cmd/openrelay

.PHONY: all build clean test run install docker

all: build

build:
	mkdir -p $(BUILD_DIR)
	go build -ldflags "-s -w -X main.version=$$(git describe --tags --always 2>/dev/null || echo dev)" 		-o $(BUILD_DIR)/$(BINARY_NAME) $(CMD_PATH)

clean:
	rm -rf $(BUILD_DIR)

test:
	go test -v ./...

run:
	go run $(CMD_PATH) -config config.example.json

install:
	go install $(CMD_PATH)

docker:
	docker build -t openrelay-go:latest .

fmt:
	go fmt ./...

lint:
	golangci-lint run ./...

deps:
	go mod tidy
	go mod download
