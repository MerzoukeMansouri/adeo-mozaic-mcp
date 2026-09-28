# Mozaic MCP Server

[![npm version](https://img.shields.io/npm/v/mozaic-mcp-server.svg)](https://www.npmjs.com/package/mozaic-mcp-server)
[![npm downloads](https://img.shields.io/npm/dm/mozaic-mcp-server.svg)](https://www.npmjs.com/package/mozaic-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Documentation](https://img.shields.io/badge/docs-online-blue.svg)](https://merzoukemansouri.github.io/adeo-mozaic-mcp/)

MCP server and agent skills for the [Mozaic Design System](https://mozaic.adeo.cloud/) by ADEO, for any coding agent: Claude Code, Codex, Cursor, GitHub Copilot, Gemini CLI, ...

**📚 [Documentation](https://merzoukemansouri.github.io/adeo-mozaic-mcp/) • 🎮 [MCP Playground](https://merzoukemansouri.github.io/adeo-mozaic-mcp/#/playground) • 🌐 [Website](https://merzoukemansouri.github.io/adeo-mozaic-mcp/)**

## Overview

This package provides two complementary tools for working with the Mozaic Design System in coding agents:

- **🤖 Agent Skills** - 8 interactive skills for guided component building and design token usage
- **🔌 MCP Server** - Model Context Protocol server with 19 tools for programmatic access to Mozaic resources

## HTTP API

> **Coding agents should use the local stdio server** (`npx -y mozaic-mcp-server@2`, see [Quick Start](#quick-start)). The HTTP API is a separate, token-protected server for web tools (e.g. v0) that cannot spawn a local process.

Public server: **https://mozaic-mcp.m14i.com** ([Swagger](https://mozaic-mcp.m14i.com/api))

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/health` | Health check (public) |
| GET | `/api` | Swagger UI (public) |
| POST | `/mcp` | JSON-RPC 2.0 MCP endpoint, full 19 tools |
| GET | `/mcp/info` | Server info |
| POST | `/mcp/list-tools` | List the 19 tools |
| POST | `/mcp/call-tool` | Call a tool |
| POST | `/mcp/light` | JSON-RPC 2.0 "MCP Light" endpoint (`initialize`, `initialized`, `tools/list`, `tools/call`) |
| POST | `/mcp/light/list-tools` | List the 5 light tools |
| POST | `/mcp/light/call-tool` | Call a light tool |

**Full vs light:** the full endpoints proxy to a spawned stdio MCP server and expose all 19 tools. The light endpoints read SQLite directly (no subprocess, faster) and expose only 5 tools: `get_design_tokens`, `list_css_utilities`, `get_css_utility`, `search_icons`, `get_icon`.

**Authentication:** `Authorization: Bearer <token>` on every route except `/health` and `/api`. [Contact me](https://adeo-tech-community.slack.com/archives/D05E2CXR8TB) on Slack for a token.

**Call a tool:** body is `{"name": "<tool>", "arguments": {...}}`.

```bash
curl -X POST https://mozaic-mcp.m14i.com/mcp/light/call-tool \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"search_icons","arguments":{"query":"arrow","limit":5}}'
```

**Self-hosting env vars:** `PORT` (3000), `AUTH_TOKEN`, `DATABASE_PATH` (`/app/data/mozaic.db`), `MCP_SERVER_PATH` (`/app/dist/index.js`), `MCP_DEBUG`. See [DEPLOYMENT.md](./DEPLOYMENT.md).

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

### Install

Two standard, agent-agnostic CLIs. Each detects your agents and writes to the **current project** by default:

```bash
npx skills add MerzoukeMansouri/adeo-mozaic-mcp        # 8 skills -> .agents/skills/, .claude/skills/, ...
npx add-mcp mozaic-mcp-server@2 --name mozaic           # MCP server -> .mcp.json, .cursor/mcp.json, .vscode/mcp.json, .codex/config.toml, ...
```

- [`npx skills`](https://github.com/vercel-labs/skills) and [`npx add-mcp`](https://github.com/neondatabase/add-mcp) both accept `-g` (your user instead of the project), `-a <agent>` (target specific agents) and `-y` (no prompts).
- The skills' scripts install their database (`~/.mozaic/mozaic.db`) on first use. Refresh it any time with `npx -y -p mozaic-mcp-server@2 mozaic-db`.
- Remove: `npx skills remove <skill>` and `npx add-mcp remove mozaic`.

### Project or global?

- **Project (default, recommended):** commit the generated files so the whole team gets the same setup, and skills are only loaded in Mozaic projects.
- **Global (`-g`):** for your user across every project, nothing to commit.
- Never `npm i -g`: agents run the server with `npx -y mozaic-mcp-server@2`, which stays on major version 2 and picks up fixes.

### Try Before Installing

Test all 19 MCP tools directly in your browser, without installation:

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

The agent activates the appropriate skill (e.g. Vue or React builder) and guides you through:
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

VS Code uses a `servers` key in `.vscode/mcp.json`; Codex uses `[mcp_servers.mozaic]` in `.codex/config.toml`.

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
        Found 586 tokens across 8 categories...
```

```
You: "Generate a React button component"
Agent: [calls get_component_info, then generate_react_component]
        Here's your Button component with TypeScript...
```

## Architecture

```
            Any coding agent
     ┌──────────────┴──────────────┐
     ▼                             ▼
 Skills (8)                  MCP server (19 tools, stdio)
 22 shell scripts + sqlite3  npx -y mozaic-mcp-server@2
     │                             │
     ▼                             ▼
 ~/.mozaic/mozaic.db         data/mozaic.db (packaged)
```

Both are the same SQLite database: 586 tokens, 191 components, 1,473 icons, 309 docs, 16 style guides. `mozaic-style-guide` has no scripts; it calls the MCP server's style-guide tools.

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
cd adeo-mozaic-mcp

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
│   ├── index.ts           # stdio MCP server entry point
│   ├── main.ts            # NestJS HTTP server entry point
│   ├── tools/             # MCP tool implementations
│   ├── mcp/               # HTTP controllers (full + light)
│   ├── parsers/           # Source repo parsers
│   └── db/                # Schema and queries
├── skills/                # Agent Skills (SKILL.md)
│   ├── mozaic-vue-builder/
│   │   ├── SKILL.md       # Skill instructions
│   │   └── scripts/       # Shell scripts
│   └── ...                # Other skills
├── scripts/               # Build and utility scripts
│   ├── build-index.ts     # Database builder
│   ├── sanity-check.ts    # Database sanity check
│   └── generate-docs.ts   # Documentation generator
├── data/                  # Generated database
│   └── mozaic.db
├── repos/                 # Source repos, cloned by `pnpm build` (gitignored)
├── style-guides/          # Hand-authored patterns (meta.json + screenshot.png)
├── bin/mozaic-db.js       # installs the skills database to ~/.mozaic/mozaic.db
└── website/               # Documentation website
```

### Building the Database

`pnpm build` compiles TypeScript, then clones (or pulls) the source repos into `repos/` and builds `data/mozaic.db`:
- `adeo/mozaic-design-system` (public): tokens, icons, docs
- `adeo/mozaic-vue`, `mozaic-react`, `mozaic-web-components`, `mozaic-freemarker` (private, need GitHub access)
- `style-guides/<slug>/` (in this repo)

Check it with `pnpm database:sanity`.

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
- **Agent Skills spec**: https://agentskills.io/specification

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
