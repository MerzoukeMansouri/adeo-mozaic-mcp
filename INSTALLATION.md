# Installation Guide

This package provides **two installation modes**: Skills (recommended) and MCP Server.

## Interactive Mode (Easiest!)

```bash
npx mozaic-install
```

This launches an **interactive checkbox interface** where you can:
- ✅ Select which skills to install (or deselect to uninstall)
- ✅ Toggle MCP server on/off
- ✅ See what's currently installed
- ✅ Make changes and apply them all at once

Perfect for first-time installation or managing individual components!

## CLI Commands

For quick operations without prompts:

### Install Commands

```bash
# Install everything (skills + MCP server)
npx mozaic-install all

# Install only Claude Code skills
npx mozaic-install skills

# Install only MCP server for Claude Desktop
npx mozaic-install mcp
```

### Status & Help

```bash
# Check what's installed
npx mozaic-install list

# Show all available commands
npx mozaic-install --help
```

### Remove Commands

```bash
# Remove everything
npx mozaic-install remove all

# Remove only skills
npx mozaic-install remove skills

# Remove only MCP server
npx mozaic-install remove mcp
```

## What Gets Installed

### Skills Mode (`install-skills`)

The installer:
1. Copies 5 skills to `~/.claude/skills/`
2. Copies the Mozaic database to `~/.claude/mozaic.db`
3. Makes skills immediately available (no configuration needed)

**Installed skills:**
- `mozaic-vue-builder` - Interactive Vue 3 component generator
- `mozaic-react-builder` - Interactive React/TSX component generator
- `mozaic-design-tokens` - Design tokens and styling expert
- `mozaic-css-utilities` - CSS utilities and layout systems
- `mozaic-icons` - Icon search and integration

**Database location:** `~/.claude/mozaic.db` (8.3 MB)

**Total size:** ~15 MB

### MCP Server Mode (`install-mcp`)

The installer:
1. Adds MCP server configuration to `~/.claude/config.json`
2. Enables 11 MCP tools in Claude Desktop
3. Requires Claude Desktop restart

**Database location:** Uses the package's built-in database (not copied)

## Verify Installation

Check that files were installed:

```bash
# Check skills
ls ~/.claude/skills/

# Should show:
# mozaic-vue-builder
# mozaic-react-builder
# mozaic-design-tokens
# mozaic-css-utilities
# mozaic-icons

# Check database
ls -lh ~/.claude/mozaic.db

# Should show: mozaic.db (8.3M)
```

Skills will activate automatically in Claude Code based on context.

## Uninstallation

### Interactive Uninstall (Recommended)

```bash
npx mozaic-install
```

Use the same interactive installer to **deselect** components you want to remove. It shows what's currently installed - just uncheck items to uninstall them!

### Manual Uninstall - Remove Skills

```bash
npx mozaic-mcp-server uninstall-skills
```

This removes:
- All 5 skills from `~/.claude/skills/`
- Database from `~/.claude/mozaic.db`

### Manual Uninstall - Remove MCP Server

```bash
npx mozaic-mcp-server uninstall-mcp
```

This removes:
- MCP server configuration from `~/.claude/config.json`
- Requires Claude Desktop restart

## How It Works

### Skills Mode
1. **Installation**: `npx mozaic-mcp-server install-skills` runs the installer
2. **Skills**: Each skill contains a `skill.md` file and `scripts/` folder
3. **Scripts**: Bash scripts query the SQLite database and return JSON
4. **Database**: `~/.claude/mozaic.db` contains all Mozaic data (tokens, components, icons)
5. **No Server**: Everything runs locally - no MCP server configuration needed

### MCP Server Mode
1. **Installation**: `npx mozaic-mcp-server install-mcp` updates Claude Desktop config
2. **Server**: Runs as MCP server when Claude Desktop starts
3. **Tools**: Provides 11 MCP tools for component info, tokens, icons, etc.
4. **Database**: Uses package's built-in database

## Architecture

```
~/.claude/
├── skills/
│   ├── mozaic-vue-builder/
│   │   ├── skill.md
│   │   └── scripts/
│   │       ├── list-components.sh
│   │       ├── get-component.sh
│   │       ├── generate-component.sh
│   │       └── get-install-info.sh
│   ├── mozaic-react-builder/
│   │   ├── skill.md
│   │   └── scripts/ (same structure)
│   ├── mozaic-design-tokens/
│   │   ├── skill.md
│   │   └── scripts/
│   │       ├── get-tokens.sh
│   │       └── search-docs.sh
│   ├── mozaic-css-utilities/
│   │   ├── skill.md
│   │   └── scripts/
│   │       ├── list-utilities.sh
│   │       └── get-utility.sh
│   └── mozaic-icons/
│       ├── skill.md
│       └── scripts/
│           ├── search-icons.sh
│           └── get-icon.sh
└── mozaic.db (SQLite database)
```

## Database Contents

The `mozaic.db` SQLite database contains:

| Type                 | Count | Description                                                     |
| -------------------- | ----- | --------------------------------------------------------------- |
| **Design Tokens**    | 586   | Colors, typography, spacing, shadows, borders, screens, grid    |
| **Vue Components**   | 52    | Props, slots, events, examples                                  |
| **React Components** | 39    | Props, callbacks, examples                                      |
| **Icons**            | 1,473 | SVG icons in 15 categories (354 unique, 5 sizes each)           |
| **CSS Utilities**    | 6     | Flexy, Container, Margin, Padding, Ratio, Scroll (500+ classes) |
| **Documentation**    | 281   | MDX pages with full-text search                                 |

## Troubleshooting

### Skills Not Appearing

1. Verify installation:
   ```bash
   ls ~/.claude/skills/
   ```
   Should show 5 `mozaic-*` directories

2. Restart Claude Code

3. Check skill activation - skills activate automatically based on context

### Database Not Found

If skills report database errors:

```bash
# Check database exists
ls -lh ~/.claude/mozaic.db

# If missing, reinstall
npx mozaic-mcp-server install-skills
```

### Shell Scripts Not Executable

If you see permission errors:

```bash
# Make all scripts executable
find ~/.claude/skills/mozaic-*/scripts -name "*.sh" -exec chmod +x {} \;
```

### Database Errors

If the database is corrupted:

```bash
# Uninstall and reinstall
npx mozaic-mcp-server uninstall-skills
npx mozaic-mcp-server install-skills
```

## Requirements

- **Node.js**: ≥18.0.0
- **Claude Code**: Latest version
- **Disk Space**: ~15 MB
- **OS**: macOS, Linux, Windows (with bash/WSL)

## Upgrading

### Upgrade Skills

To upgrade to the latest version:

```bash
# Uninstall old version
npx mozaic-mcp-server uninstall-skills

# Clear npm cache (optional)
npx clear-npx-cache

# Install new version
npx mozaic-mcp-server install-skills
```

### Upgrade MCP Server

MCP server updates automatically when you restart Claude Desktop (it uses the latest npx version).

## Manual Installation

### Manual Skills Installation

If you prefer manual installation:

1. Clone the repository:
   ```bash
   git clone https://github.com/merzoukemansouri/adeo-mozaic-mcp.git
   cd adeo-mozaic-mcp
   ```

2. Install dependencies and build:
   ```bash
   pnpm install
   pnpm compile
   ```

3. Run the installer:
   ```bash
   node bin/install-skills.js install-skills
   ```

Alternatively, copy files manually:

```bash
# Copy skills
cp -r skills/* ~/.claude/skills/

# Copy database
cp data/mozaic.db ~/.claude/mozaic.db

# Make scripts executable
find ~/.claude/skills/mozaic-*/scripts -name "*.sh" -exec chmod +x {} \;
```

### Manual MCP Server Installation

1. Follow steps 1-2 above to build the project

2. Add to `~/.claude/config.json`:
   ```json
   {
     "mcpServers": {
       "mozaic": {
         "command": "node",
         "args": ["/path/to/adeo-mozaic-mcp/dist/index.js"]
       }
     }
   }
   ```

3. Restart Claude Desktop

## Next Steps

- Read [SKILLS.md](./SKILLS.md) for skill documentation and usage
- Read [README.md](./README.md) for project overview
- Try the [Web Playground](https://merzoukemansouri.github.io/adeo-mozaic-mcp/#/playground)

## Support

- **Issues**: https://github.com/merzoukemansouri/adeo-mozaic-mcp/issues
- **Documentation**: https://merzoukemansouri.github.io/adeo-mozaic-mcp/
- **Mozaic Design System**: https://mozaic.adeo.com/
