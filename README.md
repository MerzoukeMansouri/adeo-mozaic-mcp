# Mozaic MCP Server

[![npm version](https://img.shields.io/npm/v/mozaic-mcp-server.svg)](https://www.npmjs.com/package/mozaic-mcp-server)
[![npm downloads](https://img.shields.io/npm/dm/mozaic-mcp-server.svg)](https://www.npmjs.com/package/mozaic-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Documentation](https://img.shields.io/badge/docs-online-blue.svg)](https://merzoukemansouri.github.io/adeo-mozaic-mcp/)

MCP server and agent skills for the [Mozaic Design System](https://mozaic.adeo.cloud/) by ADEO, for any coding agent: Claude Code, Codex, Cursor, GitHub Copilot, Gemini CLI, ...

**📚 [Documentation](https://merzoukemansouri.github.io/adeo-mozaic-mcp/) • 🎮 [MCP Playground](https://merzoukemansouri.github.io/adeo-mozaic-mcp/#/playground) • 🌐 [Website](https://merzoukemansouri.github.io/adeo-mozaic-mcp/)**

## Overview

This package provides two complementary tools for working with the Mozaic Design System in AI assistants:

- **🤖 Agent Skills** - 8 interactive skills for guided component building and design token usage
- **🔌 MCP Server** - Model Context Protocol server with 17 tools for programmatic access to Mozaic resources

## HTTP API

Public MCP server available at **https://mozaic-mcp.m14i.com**

**Endpoints:**
- `GET /health` - Health check
- `POST /mcp/list-tools` - List available tools
- `POST /mcp/call-tool` - Call a specific tool
- `GET /api` - [Swagger documentation](https://mozaic-mcp.m14i.com/api)

**Authentication:** Bearer token required. [Contact me](https://adeo-tech-community.slack.com/archives/D05E2CXR8TB) on Slack for access.

**Example:**
```bash
curl -X POST https://mozaic-mcp.m14i.com/mcp/list-tools \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

<details>
<summary>Example Response (17 MCP Tools)</summary>

```json
{
  "tools": [
    {
      "name": "get_design_tokens",
      "description": "Get Mozaic design tokens with CSS/SCSS variables. Categories: colors (brand, semantic, component), typography (font sizes, weights, line heights), spacing (magic unit scale), shadows, borders, screens (breakpoints), grid (gutters)."
    },
    {
      "name": "get_component_info",
      "description": "Get Vue/React component details: props (types, defaults, required), slots, events, and code examples."
    },
    {
      "name": "list_components",
      "description": "List Mozaic Vue/React components by category."
    },
    {
      "name": "generate_vue_component",
      "description": "Generate ready-to-use Vue 3 code with Mozaic components (@mozaic-ds/vue-3)."
    },
    {
      "name": "generate_react_component",
      "description": "Generate ready-to-use React/TSX code with Mozaic components (@mozaic-ds/react)."
    },
    {
      "name": "search_documentation",
      "description": "Search Mozaic Design System documentation for installation guides, component usage, configuration, styling, tokens, patterns, and best practices."
    },
    {
      "name": "get_css_utility",
      "description": "Get CSS utility classes and examples for Mozaic layout and spacing utilities."
    },
    {
      "name": "list_css_utilities",
      "description": "List Mozaic CSS-only utilities (no framework needed)."
    },
    {
      "name": "search_icons",
      "description": "Search Mozaic Design System icons by name or type."
    },
    {
      "name": "get_icon",
      "description": "Get a specific Mozaic icon by name with SVG markup and ready-to-use code for React/Vue."
    },
    {
      "name": "get_install_info",
      "description": "Get installation commands and import statements for a Mozaic component."
    },
    {
      "name": "generate_webcomponent",
      "description": "Generate ready-to-use Web Component code using Mozaic Design System (@adeo/mozaic-web-components)."
    },
    {
      "name": "get_webcomponent_info",
      "description": "Get detailed information about a Mozaic Web Component including attributes, slots, events, CSS custom properties, and usage examples."
    },
    {
      "name": "list_webcomponents",
      "description": "List available Mozaic Web Components by category."
    },
    {
      "name": "generate_freemarker",
      "description": "Generate ready-to-use Freemarker macro code with import statements and configuration examples for Mozaic components."
    },
    {
      "name": "get_freemarker_info",
      "description": "Get detailed information about a Freemarker component including configuration options, CSS classes, and usage examples."
    },
    {
      "name": "list_freemarker",
      "description": "List available Mozaic Freemarker macros by category."
    }
  ]
}
```
</details>

### What's Included

| Resource Type | Count | Description |
|--------------|-------|-------------|
| Design Tokens | 586 | Colors, typography, spacing, shadows, borders, breakpoints |
| Components | 191 | Vue 3, React, Web Components, and Freemarker macros with full documentation |
| Icons | 1,473 | SVG icons across 15 categories |
| CSS Utilities | 6 | Flexy grid, Container, Margin, Padding, Ratio, Scroll |
| Documentation | 309 | Searchable usage guides and best practices |
| MCP Tools | 19 | Programmatic access to all resources |
| Agent Skills | 8 | Interactive workflows for Vue, React, Web Components, Freemarker, and agnostic use |
| Style Guides | 16 | Composed screen patterns with screenshots |

## Quick Start

Works with any coding agent that supports [Agent Skills](https://agentskills.io) and/or MCP: Claude Code, Codex, Cursor, GitHub Copilot, Gemini CLI, OpenCode, Windsurf, VS Code, ...

### One command

```bash
npx -y -p mozaic-mcp-server@2 adeo-mozaic-install-tools
```

It detects your agents and installs, **in the current project** by default:
- the 8 skills, through [`npx skills`](https://github.com/vercel-labs/skills) (`.agents/skills/`, `.claude/skills/`, ...)
- the MCP server, through [`npx add-mcp`](https://github.com/neondatabase/add-mcp) (`.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`, `.codex/config.toml`, ...)
- the database used by the skills' scripts (`~/.mozaic/mozaic.db`)

Add `-g` to install for your user instead, `-a <agent>` to target specific agents, `-y` to skip prompts.

### Or use the standard CLIs directly

```bash
npx skills add MerzoukeMansouri/adeo-mozaic-mcp        # skills
npx add-mcp mozaic-mcp-server@2 --name mozaic           # MCP server
```

### Project or global?

- **Project (default, recommended):** commit the generated files so the whole team gets the same setup, and skills are only loaded in Mozaic projects.
- **Global (`-g`):** for your user across every project, nothing to commit.
- Never `npm i -g`: agents run the server with `npx -y mozaic-mcp-server@2`, which stays on major version 2 and picks up fixes.

### Try Before Installing

Test the MCP tools directly in your browser without installation:

**[🎮 Open MCP Playground](https://merzoukemansouri.github.io/adeo-mozaic-mcp/#/playground)**

## Agent Skills

8 skills that provide interactive workflows for building with Mozaic.

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
| **mozaic-style-guide** | Composed-pattern catalog (framework-agnostic) | Reference real Mozaic-compliant screens before building (modals, dashboards, tables, ...) |

### How Skills Work

Skills follow the [Agent Skills](https://agentskills.io/specification) format (`skills/<name>/SKILL.md`), so any compatible agent activates them automatically based on context:

```
User: "I need a login form with Mozaic"
```

The agent activates the appropriate skill (Vue or React builder) and guide you through:
1. Component selection
2. Props configuration
3. Code generation
4. Installation instructions

**See [SKILLS.md](./SKILLS.md) for detailed documentation.**

## MCP Server Tools

19 programmatic tools for accessing Mozaic resources via the Model Context Protocol.

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
| `search_documentation` | Docs | Full-text search across 309 documentation pages |
| `get_css_utility` | CSS | Get CSS utility classes and examples |
| `list_css_utilities` | CSS | List available CSS utilities |
| `search_icons` | Icons | Search 1,473 icons by name, type, or category |
| `get_icon` | Icons | Get icon SVG and framework code |
| `get_install_info` | Install | Get npm/yarn/pnpm installation commands |
| `list_style_guides` | Style Guides | List composed-pattern examples, filter by category and/or site |
| `get_style_guide` | Style Guides | Get a pattern's screenshot (image) + linked component slugs |

### Configuration

`npx add-mcp mozaic-mcp-server@2 --name mozaic` writes the right file for each agent. The server name must be `mozaic` (the `mozaic-style-guide` skill expects it). Manual setup, for example `.mcp.json` (Claude Code) or `.cursor/mcp.json` (Cursor):

```json
{
  "mcpServers": {
    "mozaic": {
      "command": "npx",
      "args": ["-y", "mozaic-mcp-server@2"]
    }
  }
}
```

The server is also published to the [MCP Registry](https://registry.modelcontextprotocol.io) as `io.github.MerzoukeMansouri/mozaic`.

## Usage Examples

### Using Skills

Skills activate automatically based on your request:

```
You: "I need a responsive grid with 3 columns"
Agent: [activates mozaic-css-utilities skill]
        Here's the Flexy grid solution...
```

```
You: "Add a shopping cart icon"
Agent: [activates mozaic-icons skill]
        I found these cart icons...
```

### Using MCP Tools Programmatically

When configured, the agent can use MCP tools directly:

```
You: "What design tokens are available?"
Agent: [calls get_design_tokens tool]
        Found 586 tokens across 7 categories...
```

```
You: "Generate a React button component"
Agent: [calls get_component_info, then generate_react_component]
        Here's your Button component with TypeScript...
```

## CLI Commands

```bash
npx -y -p mozaic-mcp-server@2 adeo-mozaic-install-tools [command] [-g] [-a <agent>] [-y]

  all (default)        Skills + MCP server + database
  skills               Skills (and the database their scripts use)
  mcp                  MCP server config
  db                   Install/refresh ~/.mozaic/mozaic.db
  list                 Installed skills and MCP servers
  remove [skills|mcp]  Remove skills, the MCP server, or both
```

## Architecture

```
┌─────────────────────────────────────┐
│   Any MCP client / coding agent     │
│                                     │
│   ┌─────────────┐  ┌─────────────┐ │
│   │   Skills    │  │ MCP Server  │ │
│   │  (8 total)  │  │ (19 tools)  │ │
│   └─────────────┘  └─────────────┘ │
│          │                │         │
└──────────┼────────────────┼─────────┘
           │                │
           ▼                ▼
    ┌──────────────────────────┐
    │  Shell Scripts (22)      │
    │  ↓ sqlite3 queries       │
    └──────────────────────────┘
               ▼
    ┌──────────────────────────┐
    │  SQLite Database         │
    │  ~/.mozaic/mozaic.db     │
    │                          │
    │  • 586 tokens            │
    │  • 191 components        │
    │  • 1,473 icons           │
    │  • 309 docs              │
    │  • 16 style guides       │
    └──────────────────────────┘
```

## File Locations

| What | Project (default) | Global (`-g`) |
|------|-------------------|---------------|
| Skills | `.agents/skills/`, `.claude/skills/`, ... per agent | `~/.claude/skills/`, `~/.codex/skills/`, `~/.cursor/skills/`, ... |
| MCP config | `.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`, `.codex/config.toml`, ... | `~/.claude.json`, `~/.cursor/mcp.json`, `~/.codex/config.toml`, ... |
| Skills database | `~/.mozaic/mozaic.db` (override with `MOZAIC_DB_PATH`) | same |

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
├── skills/                # Agent Skills (SKILL.md)
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
- **🌐 Website**: https://merzoukemansouri.github.io/adeo-mozaic-mcp/
- **📚 Documentation**: https://merzoukemansouri.github.io/adeo-mozaic-mcp/#/docs
- **🎮 MCP Playground**: https://merzoukemansouri.github.io/adeo-mozaic-mcp/#/playground
- **🎨 Skills Guide**: https://merzoukemansouri.github.io/adeo-mozaic-mcp/#/skills
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
- 🌐 Visit the [website](https://merzoukemansouri.github.io/adeo-mozaic-mcp/)
- 📚 Read the [documentation](https://merzoukemansouri.github.io/adeo-mozaic-mcp/#/docs)
- 🎮 Try the [MCP playground](https://merzoukemansouri.github.io/adeo-mozaic-mcp/#/playground)
- 🐛 Open an issue on [GitHub](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/issues)
- 📖 Check the [Skills guide](https://merzoukemansouri.github.io/adeo-mozaic-mcp/#/skills)
- 🎨 Review [Mozaic Design System docs](https://mozaic.adeo.cloud/)

---

**Built with ❤️ for the ADEO community**

*Mozaic Design System is maintained by ADEO*
