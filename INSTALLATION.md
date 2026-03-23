# Installation Guide

Simple, self-contained installation for Mozaic Design System Skills in Claude Code.

## Quick Install

**One command to install everything:**

```bash
npx mozaic-mcp-server install
```

That's it! Skills are now available in Claude Code.

## What Gets Installed

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

Remove all skills and database:

```bash
npx mozaic-mcp-server uninstall
```

This removes:
- All 5 skills from `~/.claude/skills/`
- Database from `~/.claude/mozaic.db`

## How It Works

1. **Installation**: `npx mozaic-mcp-server install` runs the installer
2. **Skills**: Each skill contains a `skill.md` file and `scripts/` folder
3. **Scripts**: Bash scripts query the SQLite database and return JSON
4. **Database**: `~/.claude/mozaic.db` contains all Mozaic data (tokens, components, icons)
5. **No Server**: Everything runs locally - no MCP server configuration needed

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
npx mozaic-mcp-server install
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
npx mozaic-mcp-server uninstall
npx mozaic-mcp-server install
```

## Requirements

- **Node.js**: ≥18.0.0
- **Claude Code**: Latest version
- **Disk Space**: ~15 MB
- **OS**: macOS, Linux, Windows (with bash/WSL)

## Upgrading

To upgrade to the latest version:

```bash
# Uninstall old version
npx mozaic-mcp-server uninstall

# Clear npm cache (optional)
npx clear-npx-cache

# Install new version
npx mozaic-mcp-server install
```

## Manual Installation

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

3. Copy skills:
   ```bash
   cp -r skills/* ~/.claude/skills/
   ```

4. Copy database:
   ```bash
   cp data/mozaic.db ~/.claude/mozaic.db
   ```

5. Make scripts executable:
   ```bash
   find ~/.claude/skills/mozaic-*/scripts -name "*.sh" -exec chmod +x {} \;
   ```

## Next Steps

- Read [SKILLS.md](./SKILLS.md) for skill documentation and usage
- Read [README.md](./README.md) for project overview
- Try the [Web Playground](https://merzoukemansouri.github.io/adeo-mozaic-mcp/#/playground)

## Support

- **Issues**: https://github.com/merzoukemansouri/adeo-mozaic-mcp/issues
- **Documentation**: https://merzoukemansouri.github.io/adeo-mozaic-mcp/
- **Mozaic Design System**: https://mozaic.adeo.com/
