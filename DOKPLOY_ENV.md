# Dokploy Environment Variables

Copy these to Dokploy app environment:

```
NODE_ENV=production
PORT=3000
AUTH_TOKEN=/Jm+BVoNVCWAK9S6NUGvE9rjPhmIjlpKVdfzfjDgiP0=
DATABASE_PATH=/app/data/mozaic.db
MCP_DEBUG=false
MCP_SERVER_PATH=/app/dist/index.js
CORS_ORIGINS=https://v0.dev,https://*.v0.dev
```

## Deployment URL
https://mozaic-mcp.m14i.com

## v0 Configuration
1. Go to https://v0.dev → Settings → MCP Servers
2. Add Custom Server:
   - Name: Mozaic Design System
   - URL: https://mozaic-mcp.m14i.com/mcp
   - Auth Type: Bearer Token
   - Token: `/Jm+BVoNVCWAK9S6NUGvE9rjPhmIjlpKVdfzfjDgiP0=`

## Test Endpoints
- Health: https://mozaic-mcp.m14i.com/health
- API Docs: https://mozaic-mcp.m14i.com/api

## Test with curl
```bash
# Health check (no auth)
curl https://mozaic-mcp.m14i.com/health

# List tools (with auth)
curl -X POST https://mozaic-mcp.m14i.com/mcp/list-tools \
  -H "Authorization: Bearer /Jm+BVoNVCWAK9S6NUGvE9rjPhmIjlpKVdfzfjDgiP0=" \
  -H "Content-Type: application/json"
```
