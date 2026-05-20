# Mozaic MCP Server - Deployment Guide

This guide covers deploying the Mozaic MCP Server with NestJS and Docker.

## Architecture

The deployment consists of:
- **NestJS HTTP Server**: Provides REST/JSON-RPC endpoints for v0 integration
- **MCP Stdio Process**: Original MCP server running as child process
- **SQLite Database**: Contains Mozaic design system data (586 tokens, 131+ components, 1,473 icons)

## Prerequisites

- Docker 24+ and Docker Compose
- pnpm 9+ (for local development)
- Node.js 22+ (for local development)

## Quick Start

### 1. Build Docker Image

```bash
# Option A: Using the build script (recommended)
./scripts/docker-build.sh

# Option B: Manual build
cp ~/.claude/mozaic.db ./mozaic.db
docker build -t mozaic-mcp-server:latest .
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Generate secure token
openssl rand -base64 32

# Edit .env with your settings
nano .env
```

Required environment variables:
- `AUTH_TOKEN`: Bearer token for API authentication
- `DATABASE_PATH`: Path to SQLite database (default: /app/data/mozaic.db)
- `CORS_ORIGINS`: Allowed origins for CORS (include v0.dev)

### 3. Deploy with Docker Compose

```bash
# Start the service
docker-compose up -d

# Check logs
docker-compose logs -f

# Verify health
curl http://localhost:3000/health
```

## Deployment Options

### Option 1: Dokploy Deployment

Since you're using Dokploy, the service is configured with Dokploy labels:

1. **Push to Git Repository**
   ```bash
   git add .
   git commit -m "Add NestJS wrapper for MCP server"
   git push origin main
   ```

2. **Configure in Dokploy**
   - Add new service from Git repository
   - Set build type: Docker
   - Configure environment variables
   - Enable SSL if needed
   - Deploy

3. **Dokploy Environment Variables**
   ```
   AUTH_TOKEN=your-secure-token
   NODE_ENV=production
   CORS_ORIGINS=https://v0.dev,https://*.v0.dev,https://your-domain.com
   ```

### Option 2: Manual Docker Deployment

```bash
# Run standalone container
docker run -d \
  --name mozaic-mcp-server \
  -p 3000:3000 \
  -e AUTH_TOKEN=your-token \
  -e NODE_ENV=production \
  -v mozaic-data:/app/data \
  --restart unless-stopped \
  mozaic-mcp-server:latest
```

### Option 3: Kubernetes Deployment

Create deployment and service manifests:

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mozaic-mcp-server
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mozaic-mcp
  template:
    metadata:
      labels:
        app: mozaic-mcp
    spec:
      containers:
      - name: mozaic-mcp
        image: mozaic-mcp-server:latest
        ports:
        - containerPort: 3000
        env:
        - name: AUTH_TOKEN
          valueFrom:
            secretKeyRef:
              name: mozaic-secrets
              key: auth-token
        volumeMounts:
        - name: data
          mountPath: /app/data
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: mozaic-data
```

## API Endpoints

Once deployed, the following endpoints are available:

### Public Endpoints
- `GET /health` - Health check
- `GET /api` - Swagger documentation

### Protected Endpoints (requires Bearer token)
- `POST /mcp` - Main MCP JSON-RPC endpoint
- `GET /mcp/info` - Server information
- `POST /mcp/list-tools` - List available tools
- `POST /mcp/call-tool` - Call specific tool

### Example API Calls

```bash
# Health check
curl http://localhost:3000/health

# List tools (with auth)
curl -X POST http://localhost:3000/mcp/list-tools \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Call a tool
curl -X POST http://localhost:3000/mcp/call-tool \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "get_component_info",
    "arguments": {
      "component": "Button"
    }
  }'
```

## v0 Integration

### Connect to v0.dev

1. **Navigate to v0 Settings**
   - Go to https://v0.dev
   - Open Settings → MCP Servers

2. **Add Custom MCP Server**
   ```
   Name: Mozaic Design System
   URL: https://your-deployed-url.com/mcp
   Auth Type: Bearer Token
   Token: your-auth-token
   ```

3. **Test Connection**
   - Try prompt: "List Mozaic components"
   - Should return component list

### Using in v0

Example prompts for v0:
- "Create a login form using Mozaic components"
- "Show me all Mozaic button variations"
- "Generate a Vue component with Mozaic design tokens"
- "What icons are available in Mozaic?"

## Monitoring

### Health Checks

Docker Compose includes automatic health checks:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Logs

```bash
# View all logs
docker-compose logs

# Follow logs
docker-compose logs -f

# Filter by service
docker-compose logs mozaic-mcp-server
```

### Debugging

Enable debug mode:
```bash
# Set in .env
MCP_DEBUG=true

# Or via Docker
docker run -e MCP_DEBUG=true ...
```

## Security Considerations

1. **Authentication**
   - Always use strong bearer tokens in production
   - Rotate tokens regularly
   - Store tokens securely (environment variables, secrets management)

2. **CORS**
   - Configure CORS origins explicitly
   - Only allow trusted domains
   - v0.dev domains are pre-configured

3. **Database**
   - Database is read-only in container
   - Mounted as volume for persistence
   - Regular backups recommended

4. **Network**
   - Use HTTPS in production (SSL/TLS)
   - Configure firewall rules
   - Limit exposed ports

## Troubleshooting

### Common Issues

1. **Database not found**
   ```bash
   # Ensure database exists
   ls -la ~/.claude/mozaic.db

   # Copy to project
   cp ~/.claude/mozaic.db ./mozaic.db
   ```

2. **Port already in use**
   ```bash
   # Change port in docker-compose.yml
   ports:
     - "3001:3000"
   ```

3. **MCP server not starting**
   ```bash
   # Check logs
   docker-compose logs | grep ERROR

   # Verify paths
   docker exec mozaic-mcp-server ls -la /app/dist/index.js
   ```

4. **Authentication failing**
   ```bash
   # Test with curl
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:3000/mcp/info
   ```

## Production Checklist

- [ ] Strong AUTH_TOKEN configured
- [ ] SSL/TLS enabled
- [ ] CORS origins configured correctly
- [ ] Database backup strategy in place
- [ ] Monitoring/alerting configured
- [ ] Resource limits set (CPU/memory)
- [ ] Logging configured
- [ ] Health checks working
- [ ] Firewall rules configured
- [ ] Secrets management system used

## Support

For issues or questions:
- Check logs: `docker-compose logs`
- Review API docs: `http://localhost:3000/api`
- GitHub issues: [your-repo-url]

## Updates

To update the server:

```bash
# Pull latest changes
git pull origin main

# Rebuild image
./scripts/docker-build.sh

# Restart service
docker-compose down
docker-compose up -d
```