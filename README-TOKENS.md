# Mozaic Design Tokens - Lightweight Servers

Lightweight servers focused on design tokens, CSS utilities, and icons. No component generation.

## Two Options

### 1. MCP Server (for Claude Code)

Direct integration with v0 and other MCP clients.

**Start:**
```bash
pnpm build
pnpm start:tokens-mcp
```

**Claude Code Config (~/.claude/config.json):**
```json
{
  "mcpServers": {
    "mozaic-tokens": {
      "command": "mozaic-tokens-mcp",
      "env": {
        "DATABASE_PATH": "/absolute/path/to/data/mozaic.db"
      }
    }
  }
}
```

**Tools (5):**
- `get_design_tokens` - Tokens in JSON/SCSS/CSS/JS
- `list_css_utilities` - List CSS utilities
- `get_css_utility` - Get utility classes + examples
- `search_icons` - Search icons by name/type
- `get_icon` - Get icon SVG

### 2. REST API Server (for v0)

HTTP endpoint for v0 or any client.

**Start:**
```bash
DATABASE_PATH=./data/mozaic.db AUTH_TOKEN=your-token pnpm start:tokens-api
```

**Environment:**
- `PORT` - Server port (default: 3000)
- `DATABASE_PATH` - Path to mozaic.db
- `AUTH_TOKEN` - Bearer token for auth
- `CORS_ORIGINS` - Comma-separated origins (default: https://v0.dev,https://*.v0.dev)
- `NODE_ENV` - Set to "development" to skip auth with default token

**Endpoints:**

```bash
# Design Tokens
POST /tokens
Body: {"category": "colors", "format": "json"}

# CSS Utilities
GET /utilities
GET /utilities/flexy?includeClasses=true

# Icons
GET /icons/search?query=arrow&type=navigation&size=24
GET /icons/ArrowArrowBottom16?format=svg
```

**Examples:**

```bash
# Tokens (JSON)
curl -X POST http://localhost:3000/tokens \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"category": "colors", "format": "json"}'

# CSS Utilities
curl http://localhost:3000/utilities \
  -H "Authorization: Bearer your-token"

curl http://localhost:3000/utilities/flexy \
  -H "Authorization: Bearer your-token"

# Icons
curl "http://localhost:3000/icons/search?query=arrow" \
  -H "Authorization: Bearer your-token"

curl "http://localhost:3000/icons/ArrowArrowBottom16?format=svg" \
  -H "Authorization: Bearer your-token"
```

## What's Included

**Both servers provide:**
- **Design Tokens** - Colors, typography, spacing, shadows, borders, screens, grid
- **CSS Utilities** - Flexy grid, Container, Margin, Padding, Ratio, Scroll
- **Icons** - Search + SVG export (800+ icons)

**Not included** (use main server):
- Component generation (React/Vue/Web Components)
- Framework-specific code
- Documentation search
- Freemarker templates

## Why Use This vs Main Server?

**Tokens servers:**
- Lighter, faster
- Focused API
- Perfect for v0, design tools, static sites

**Main server:**
- Full component generation
- Framework integrations
- Documentation
