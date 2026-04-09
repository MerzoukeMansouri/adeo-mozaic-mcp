# Mozaic MCP Server

[![npm version](https://img.shields.io/npm/v/mozaic-mcp-server.svg)](https://www.npmjs.com/package/mozaic-mcp-server)
[![npm downloads](https://img.shields.io/npm/dm/mozaic-mcp-server.svg)](https://www.npmjs.com/package/mozaic-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Documentation](https://img.shields.io/badge/docs-online-blue.svg)](https://merzoukemansouri.github.io/adeo-mozaic-mcp/)

Self-contained Claude Code skills and MCP server for the [Mozaic Design System](https://mozaic.adeo.cloud/) by ADEO.

**📚 [Documentation](https://merzoukemansouri.github.io/adeo-mozaic-mcp/) • 🎮 [MCP Playground](https://merzoukemansouri.github.io/adeo-mozaic-mcp/#/playground)**

## Overview

This package provides two complementary tools for working with the Mozaic Design System in AI assistants:

- **🤖 Claude Code Skills** - 7 interactive skills for guided component building and design token usage
- **🔌 MCP Server** - Model Context Protocol server with 17 tools for programmatic access to Mozaic resources

### What's Included

| Resource Type | Count | Description |
|--------------|-------|-------------|
| Design Tokens | 586 | Colors, typography, spacing, shadows, borders, breakpoints |
| Components | 131+ | Vue 3, React, Web Components, and Freemarker macros with full documentation |
| Icons | 1,473 | SVG icons across 15 categories |
| CSS Utilities | 6 | Flexy grid, Container, Margin, Padding, Ratio, Scroll |
| Documentation | 281 | Searchable usage guides and best practices |
| MCP Tools | 17 | Programmatic access to all resources |
| Claude Skills | 7 | Interactive workflows for Vue, React, Web Components, Freemarker, and agnostic use |

## Quick Start

### Interactive Installation (Recommended)

```bash
npx -p mozaic-mcp-server@latest adeo-mozaic-install-tools
```

Use arrow keys and space to select components, then press Enter to install.

### One-Command Installation

```bash
# Install everything (skills + MCP server)
npx -p mozaic-mcp-server@latest adeo-mozaic-install-tools all

# Install only skills (for Claude Code)
npx -p mozaic-mcp-server@latest adeo-mozaic-install-tools skills

# Install only MCP server (for Claude Desktop)
npx -p mozaic-mcp-server@latest adeo-mozaic-install-tools mcp
```

### Check Installation Status

```bash
npx -p mozaic-mcp-server@latest adeo-mozaic-install-tools list
```

### Try Before Installing

Test the MCP tools directly in your browser without installation:

**[🎮 Open MCP Playground](https://merzoukemansouri.github.io/adeo-mozaic-mcp/#/playground)**

The playground lets you:
- Test all 11 MCP tools interactively
- Browse components, tokens, and icons
- Generate code snippets
- Search documentation

## Claude Code Skills

6 self-contained skills that provide interactive workflows for building with Mozaic.

### Available Skills

| Skill | Description | Use Case |
|-------|-------------|----------|
| **mozaic-vue-builder** | Interactive Vue 3 component generator | Building Vue apps with Mozaic |
| **mozaic-react-builder** | Interactive React/TSX component generator | Building React apps with Mozaic |
| **mozaic-webcomponents-builder** | Interactive Web Components generator | Building framework-agnostic apps with native web components |
| **mozaic-freemarker-builder** | Interactive Freemarker macro generator | Building server-side templates with Freemarker |
| **mozaic-design-tokens** | Design tokens and styling expert | Accessing colors, typography, spacing |
| **mozaic-css-utilities** | CSS utility classes and layouts | Building responsive layouts |
| **mozaic-icons** | Icon search and integration | Finding and using Mozaic icons |

### How Skills Work

Skills are activated automatically in Claude Code based on context, or you can invoke them manually:

```
User: "I need a login form with Mozaic"
```

Claude Code will automatically activate the appropriate skill (Vue or React builder) and guide you through:
1. Component selection
2. Props configuration
3. Code generation
4. Installation instructions

**See [SKILLS.md](./SKILLS.md) for detailed documentation.**

## MCP Server Tools

14 programmatic tools for accessing Mozaic resources via the Model Context Protocol.

### Available Tools

| Tool | Category | Description |
|------|----------|-------------|
| `get_design_tokens` | Tokens | Query tokens by category (colors, typography, spacing, etc.) |
| `get_component_info` | Components | Get component props, slots, events, and documentation |
| `list_components` | Components | List components by category or framework |
| `generate_vue_component` | Code Gen | Generate Vue 3 SFC code with props |
| `generate_react_component` | Code Gen | Generate React/TSX code with TypeScript |
| **`generate_webcomponent`** | **Code Gen** | **Generate native Web Component HTML with imports** |
| **`get_webcomponent_info`** | **Web Components** | **Get attributes, slots, events, CSS properties** |
| **`list_webcomponents`** | **Web Components** | **List web components by category** |
| **`generate_freemarker`** | **Code Gen** | **Generate Freemarker macro code with configuration** |
| **`get_freemarker_info`** | **Freemarker** | **Get macro configuration options and usage** |
| **`list_freemarker`** | **Freemarker** | **List Freemarker macros by category** |
| `search_documentation` | Docs | Full-text search across 281 documentation pages |
| `get_css_utility` | CSS | Get CSS utility classes and examples |
| `list_css_utilities` | CSS | List available CSS utilities |
| `search_icons` | Icons | Search 1,473 icons by name, type, or category |
| `get_icon` | Icons | Get icon SVG and framework code |
| `get_install_info` | Install | Get npm/yarn/pnpm installation commands |

### Configuration

Add to your Claude Code or Claude Desktop settings:

**For Claude Code** (in `.claude/settings.json`):
```json
{
  "mcpServers": {
    "mozaic": {
      "command": "npx",
      "args": ["-y", "mozaic-mcp-server"]
    }
  }
}
```

**For Claude Desktop** (in `~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "mozaic": {
      "command": "npx",
      "args": ["-y", "mozaic-mcp-server"]
    }
  }
}
```

## Usage Examples

### Using Skills in Claude Code

Skills activate automatically based on your request:

```
You: "I need a responsive grid with 3 columns"
Claude: [activates mozaic-css-utilities skill]
        Here's the Flexy grid solution...
```

```
You: "Add a shopping cart icon"
Claude: [activates mozaic-icons skill]
        I found these cart icons...
```

### Using MCP Tools Programmatically

When configured, Claude can use MCP tools directly:

```
You: "What design tokens are available?"
Claude: [calls get_design_tokens tool]
        Found 586 tokens across 7 categories...
```

```
You: "Generate a React button component"
Claude: [calls get_component_info, then generate_react_component]
        Here's your Button component with TypeScript...
```

## CLI Commands

The `adeo-mozaic-install-tools` CLI provides several commands:

```bash
# Interactive mode (default)
npx -p mozaic-mcp-server@latest adeo-mozaic-install-tools

# Install all components
npx -p mozaic-mcp-server@latest adeo-mozaic-install-tools all

# Install skills only
npx -p mozaic-mcp-server@latest adeo-mozaic-install-tools skills

# Install MCP server only
npx -p mozaic-mcp-server@latest adeo-mozaic-install-tools mcp

# Check status
npx -p mozaic-mcp-server@latest adeo-mozaic-install-tools list

# Remove components
npx -p mozaic-mcp-server@latest adeo-mozaic-install-tools remove skills
npx -p mozaic-mcp-server@latest adeo-mozaic-install-tools remove mcp
npx -p mozaic-mcp-server@latest adeo-mozaic-install-tools remove all

# Show help
npx -p mozaic-mcp-server@latest adeo-mozaic-install-tools --help
```

## Architecture

```
┌─────────────────────────────────────┐
│   Claude Code / Claude Desktop      │
│                                     │
│   ┌─────────────┐  ┌─────────────┐ │
│   │   Skills    │  │ MCP Server  │ │
│   │  (5 total)  │  │ (11 tools)  │ │
│   └─────────────┘  └─────────────┘ │
│          │                │         │
└──────────┼────────────────┼─────────┘
           │                │
           ▼                ▼
    ┌──────────────────────────┐
    │  Shell Scripts (14)      │
    │  ↓ sqlite3 queries       │
    └──────────────────────────┘
               ▼
    ┌──────────────────────────┐
    │  SQLite Database         │
    │  ~/.claude/mozaic.db     │
    │                          │
    │  • 586 tokens            │
    │  • 91 components         │
    │  • 1,473 icons           │
    │  • 281 docs              │
    └──────────────────────────┘
```

## File Locations

After installation:

```
~/.claude/
├── mozaic.db                      # SQLite database (all Mozaic data)
├── skills/                        # Claude Code skills
│   ├── mozaic-vue-builder/
│   ├── mozaic-react-builder/
│   ├── mozaic-design-tokens/
│   ├── mozaic-css-utilities/
│   └── mozaic-icons/
└── (Claude Code settings.json)    # MCP server config

~/Library/Application Support/Claude/
└── claude_desktop_config.json     # Claude Desktop MCP config
```

## Development

### Prerequisites

- Node.js ≥25.2.0
- pnpm (recommended)

### Setup

```bash
# Clone the repository
git clone https://github.com/MerzoukeMansouri/adeo-mozaic-mcp.git
cd mozaic-mcp-server

# Install dependencies
pnpm install

# Build the project (compiles TypeScript + builds database)
pnpm build

# Run tests
pnpm test

# Start MCP server in debug mode
pnpm start:debug
```

### Project Structure

```
mozaic-mcp-server/
├── src/                    # TypeScript source code
│   ├── index.ts           # MCP server entry point
│   ├── tools/             # MCP tool implementations
│   └── database/          # Database utilities
├── skills/                # Claude Code skills
│   ├── mozaic-vue-builder/
│   │   ├── skill.md       # Skill instructions
│   │   └── scripts/       # Shell scripts (4)
│   └── ...                # Other skills
├── scripts/               # Build and utility scripts
│   ├── build-index.ts     # Database builder
│   └── generate-docs.ts   # Documentation generator
├── data/                  # Generated database
│   └── mozaic.db
├── repos/                 # Mozaic Design System repositories (git submodules)
│   ├── mozaic-design-system/
│   ├── mozaic-vue/
│   └── mozaic-react/
├── bin/                   # CLI entry points
│   └── install.js         # Installation CLI
└── website/               # Documentation website
```

### Building the Database

The SQLite database is built from the Mozaic Design System repositories:

```bash
# Update submodules
git submodule update --init --recursive

# Build database
pnpm build
```

This indexes:
- Design tokens from `mozaic-design-system/packages/tokens`
- Components from `mozaic-vue` and `mozaic-react`
- Icons from `mozaic-design-system/packages/icons`
- Documentation from all repositories

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org/)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We use semantic versioning with conventional commits:

- `feat:` - New feature (minor version bump)
- `fix:` - Bug fix (patch version bump)
- `feat!:` or `BREAKING CHANGE:` - Breaking change (major version bump)
- `chore:`, `docs:`, `style:`, `refactor:`, `test:` - No version bump

## Resources

### Documentation & Tools
- **📚 Documentation**: https://merzoukemansouri.github.io/adeo-mozaic-mcp/
- **🎮 MCP Playground**: https://merzoukemansouri.github.io/adeo-mozaic-mcp/#/playground
- **GitHub**: https://github.com/MerzoukeMansouri/adeo-mozaic-mcp
- **npm**: https://www.npmjs.com/package/mozaic-mcp-server

### Related Resources
- **Mozaic Design System**: https://mozaic.adeo.cloud/
- **MCP Protocol**: https://modelcontextprotocol.io/
- **Claude Code**: https://code.claude.com/

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For issues or questions:
- 📚 Read the [online documentation](https://merzoukemansouri.github.io/adeo-mozaic-mcp/)
- 🎮 Try the [MCP playground](https://merzoukemansouri.github.io/adeo-mozaic-mcp/#/playground)
- 🐛 Open an issue on [GitHub](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/issues)
- 📖 Check the [Skills documentation](SKILLS.md)
- 🎨 Review [Mozaic Design System docs](https://mozaic.adeo.cloud/)

---

**Built with ❤️ for the ADEO community**

*Mozaic Design System is maintained by ADEO*
