# Installation Guide

Complete setup guide for Mozaic Design System MCP Server and Skills.

## Overview

The Mozaic ecosystem has two components:

1. **MCP Server** - Provides database access and tools (required)
2. **Skills** - Provides interactive workflows (optional, but recommended)

## Complete Setup (Recommended)

### Step 1: Install Skills

**Using npx** (fastest):
```bash
npx mozaic-mcp-server install
```

This installs 5 skills to `~/.claude/skills/`:
- `mozaic-vue-builder`
- `mozaic-react-builder`
- `mozaic-design-tokens`
- `mozaic-css-utilities`
- `mozaic-icons`

### Step 2: Configure MCP Server

Add the MCP server to your Claude Code settings:

**Option A: Using npx** (no installation needed):
```json
{
  "mcpServers": {
    "mozaic": {
      "command": "npx",
      "args": ["mozaic-mcp-server"]
    }
  }
}
```

**Option B: Using local installation**:
```bash
# Clone and build
git clone https://github.com/merzoukemansouri/adeo-mozaic-mcp.git
cd adeo-mozaic-mcp
pnpm install
pnpm build

# Configure in Claude Code settings
```

```json
{
  "mcpServers": {
    "mozaic": {
      "command": "node",
      "args": ["/absolute/path/to/adeo-mozaic-mcp/dist/index.js"]
    }
  }
}
```

**Option C: Using global installation**:
```bash
npm install -g mozaic-mcp-server

# Configure in Claude Code settings
```

```json
{
  "mcpServers": {
    "mozaic": {
      "command": "mozaic-mcp-server"
    }
  }
}
```

### Step 3: Verify Installation

Restart Claude Code and verify:

1. **MCP Server**: Check that tools are available (e.g., `mcp__mozaic__list_components`)
2. **Skills**: Skills should appear in skills list and activate automatically

## Skills Only (Lightweight)

If you only want the skills (without MCP server):

```bash
npx mozaic-mcp-server install
```

**Note**: Skills will reference MCP tools, but won't function without the MCP server configured.

## MCP Server Only

If you only want the MCP server:

```bash
# Using npx
npx mozaic-mcp-server

# Or install locally
git clone https://github.com/merzoukemansouri/adeo-mozaic-mcp.git
cd adeo-mozaic-mcp
pnpm install
pnpm build
pnpm start
```

Then configure in Claude Code settings (see Step 2 above).

## Uninstallation

### Remove Skills
```bash
npx mozaic-mcp-server uninstall
```

### Remove MCP Server Configuration
Remove the `mozaic` entry from your Claude Code settings.

### Remove Local Installation
```bash
# If installed globally
npm uninstall -g mozaic-mcp-server

# If cloned locally
rm -rf /path/to/adeo-mozaic-mcp
```

## Troubleshooting

### Skills Not Appearing

1. Verify installation:
   ```bash
   ls ~/.claude/skills/
   ```
   Should show: `mozaic-vue-builder`, `mozaic-react-builder`, etc.

2. Restart Claude Code

3. Check skill frontmatter in `.md` files

### MCP Tools Not Working

1. Verify MCP server configuration in Claude Code settings

2. Test MCP server directly:
   ```bash
   npx mozaic-mcp-server
   # Should start without errors
   ```

3. Check Claude Code logs for MCP connection errors

### Database Errors

If using local installation:

```bash
cd adeo-mozaic-mcp
pnpm build  # Rebuilds database
```

If using npx, the database is bundled with the package.

## What Gets Installed

### Skills (6.5 MB total)

```
~/.claude/skills/
├── mozaic-vue-builder/       (~1.3 MB)
├── mozaic-react-builder/     (~1.4 MB)
├── mozaic-design-tokens/     (~1.2 MB)
├── mozaic-css-utilities/     (~1.5 MB)
└── mozaic-icons/            (~1.1 MB)
```

### MCP Server (varies by method)

- **npx**: ~50 MB (downloaded on first run, cached)
- **Local**: ~150 MB (includes node_modules, source, database)
- **Global**: ~50 MB (npm global packages)

## Requirements

- **Node.js**: ≥25.0.0
- **Claude Code**: Latest version
- **Disk Space**: ~60 MB for complete setup

## Architecture

```
┌─────────────────────────────────────────┐
│           Claude Code                    │
├─────────────────────────────────────────┤
│  Skills (Workflows)                      │
│  ├─ mozaic-vue-builder                  │
│  ├─ mozaic-react-builder                │
│  ├─ mozaic-design-tokens                │
│  ├─ mozaic-css-utilities                │
│  └─ mozaic-icons                        │
│                                          │
│  Uses ↓                                  │
│                                          │
│  MCP Server (Data Access)               │
│  ├─ 11 Tools                            │
│  └─ SQLite Database (586 tokens,        │
│     52 Vue components, 39 React         │
│     components, 1473 icons, etc.)       │
└─────────────────────────────────────────┘
```

## Next Steps

- Read [SKILLS.md](./SKILLS.md) for skill documentation
- Read [README.md](./README.md) for MCP server details
- Try the [Web Playground](https://merzoukemansouri.github.io/adeo-mozaic-mcp/#/playground)

## Support

- **Issues**: https://github.com/merzoukemansouri/adeo-mozaic-mcp/issues
- **Documentation**: https://merzoukemansouri.github.io/adeo-mozaic-mcp/
- **Mozaic Design System**: https://mozaic.adeo.com/
