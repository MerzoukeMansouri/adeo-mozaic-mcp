# Mozaic MCP Server - HTTP Deployment

How to deploy the NestJS HTTP server (`src/main.ts`) with Docker. This server is for web tools (e.g. v0) that cannot run a local process. **Coding agents should use the local stdio server instead** (`npx -y mozaic-mcp-server@2`, see [README.md](./README.md#quick-start)).

A public instance runs at https://mozaic-mcp.m14i.com ([Swagger](https://mozaic-mcp.m14i.com/api)).

## Architecture

- **NestJS HTTP server**: REST + JSON-RPC endpoints, Bearer token auth
- **Full endpoints** (`/mcp*`): proxy to a spawned stdio MCP server (`MCP_SERVER_PATH`), all 19 tools
- **Light endpoints** (`/mcp/light*`): read SQLite directly, no subprocess, 5 tools (tokens, CSS utilities, icons)
- **SQLite database**: the repo's `data/mozaic.db`, built by `pnpm build` (586 tokens, 191 components, 1,473 icons, 309 docs, 16 style guides)

## Prerequisites

- Docker and Docker Compose
- `data/mozaic.db` present (run `pnpm build`; it needs access to the private Mozaic repos)

## Quick Start

```bash
# Build the image (copies data/mozaic.db into the build context, then docker build)
./scripts/docker-build.sh

# Generate a token and export it (never commit it)
export AUTH_TOKEN=$(openssl rand -base64 32)

# Start
docker-compose up -d
curl http://localhost:3000/health
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port |
| `AUTH_TOKEN` | `change-me-in-production` | Bearer token required on protected routes. Always set it. |
| `DATABASE_PATH` | `/app/data/mozaic.db` | SQLite database (light endpoints read it; passed to the stdio subprocess) |
| `MCP_SERVER_PATH` | `/app/dist/index.js` | stdio MCP server spawned by the full endpoints |
| `MCP_DEBUG` | `false` | Verbose MCP logging |
| `CORS_ORIGINS` | `https://v0.dev,https://*.v0.dev` | Read by the config, but currently **not applied**: `src/main.ts` hardcodes v0.dev, *.v0.dev, localhost:3000/3001 |

If `NODE_ENV=development` and no token is configured, auth is skipped.

## Deployment Options

### Docker Compose / Dokploy

`docker-compose.yml` includes Traefik and Dokploy labels. In Dokploy: add the Git repository as a Docker service, set `AUTH_TOKEN` (and optionally `MCP_DEBUG`), enable SSL, deploy.

### Plain Docker

```bash
docker run -d --name mozaic-mcp-server -p 3000:3000 \
  -e AUTH_TOKEN="$AUTH_TOKEN" -e NODE_ENV=production \
  --restart unless-stopped mozaic-mcp-server:latest
```

Note: the compose file mounts a named volume on `/app/data`. Docker only seeds it from the image on first creation, so after rebuilding with a new database, recreate the volume (`docker-compose down -v`) or the old DB stays.

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/health` | public | Health check |
| GET | `/api` | public | Swagger UI |
| POST | `/mcp` | Bearer | JSON-RPC 2.0 MCP endpoint (19 tools) |
| GET | `/mcp/info` | Bearer | Server info |
| POST | `/mcp/list-tools` | Bearer | List the 19 tools |
| POST | `/mcp/call-tool` | Bearer | Call a tool |
| POST | `/mcp/light` | Bearer | JSON-RPC 2.0 MCP Light (`initialize`, `initialized`, `tools/list`, `tools/call`) |
| POST | `/mcp/light/list-tools` | Bearer | List the 5 light tools |
| POST | `/mcp/light/call-tool` | Bearer | Call a light tool |

Light tools: `get_design_tokens`, `list_css_utilities`, `get_css_utility`, `search_icons`, `get_icon`.

`call-tool` body: `{"name": "<tool>", "arguments": {...}}`

```bash
curl -X POST http://localhost:3000/mcp/call-tool \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"get_component_info","arguments":{"component":"Button"}}'

curl -X POST http://localhost:3000/mcp/light/call-tool \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"search_icons","arguments":{"query":"arrow","limit":5}}'
```

## v0 Integration

In v0 settings, add a custom MCP server:

```
URL:   https://your-deployed-url/mcp        (or /mcp/light for the lighter 5-tool server)
Auth:  Bearer token
```

## Troubleshooting

- **Database not found**: run `pnpm build`, then rebuild the image with `./scripts/docker-build.sh`.
- **Full endpoints fail, light ones work**: check the subprocess path: `docker exec mozaic-mcp-server ls -la /app/dist/index.js`, set `MCP_DEBUG=true`.
- **401**: header must be `Authorization: Bearer <AUTH_TOKEN>`; test with `GET /mcp/info`.
- **Port in use**: change the host port in `docker-compose.yml` (`"3001:3000"`).

## Updating

```bash
git pull origin main
pnpm build                 # refresh data/mozaic.db
./scripts/docker-build.sh
docker-compose down -v && docker-compose up -d
```
