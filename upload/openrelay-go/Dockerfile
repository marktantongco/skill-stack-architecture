# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o openrelay ./cmd/openrelay

# Runtime stage
FROM alpine:latest
RUN apk --no-cache add ca-certificates

WORKDIR /root/
COPY --from=builder /app/openrelay .
COPY --from=builder /app/config.example.json ./config.json

EXPOSE 18765 18801

ENTRYPOINT ["./openrelay"]
CMD ["-config", "config.json", "-port", "18765"]
