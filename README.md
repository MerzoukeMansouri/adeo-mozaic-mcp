# Mozaic MCP Server

An MCP (Model Context Protocol) server that exposes the **Mozaic Design System** by ADEO to Claude and other AI assistants.

> **Note**: This project is under active development. Contributions and feedback are welcome!

## What It Does

This server indexes the entire Mozaic Design System and makes it queryable through MCP tools. AI assistants can:

- Look up design tokens (colors, spacing, typography, etc.)
- Get component documentation with props, slots, events, and examples
- Search documentation pages
- Generate component code snippets

## Quick Start

```bash
pnpm install
pnpm build   # Compiles TypeScript & builds the database
pnpm start   # Starts the MCP server
```

## What's Indexed

| Type | Count | Description |
|------|-------|-------------|
| **Design Tokens** | 586 | Colors, typography, spacing, shadows, borders, screens, grid |
| **Vue Components** | 52 | Props, slots, events, examples |
| **React Components** | 39 | Props, callbacks, examples |
| **HTML/CSS Utilities** | 6 | Flexy, Container, Margin, Padding, Ratio, Scroll |
| **Documentation** | 247 | MDX pages with full-text search |

## MCP Tools

| Tool | Description |
|------|-------------|
| `get_design_tokens` | Query tokens by category (color, spacing, typography, shadow, border, screen, grid) |
| `get_component_info` | Get component details - works for Vue, React, and CSS-only components |
| `list_components` | List components by category |
| `generate_vue_component` | Generate Vue component code |
| `generate_react_component` | Generate React component code |
| `search_documentation` | Full-text search across all docs |

## Token Categories

| Category | Count | Examples |
|----------|-------|----------|
| color | 482 | `--color-primary-01-100`, `--color-button-solid-*` |
| typography | 60 | `--font-size-*`, `--line-height-*` |
| spacing | 19 | `$mu025` to `$mu1000` (Magic Unit system) |
| screen | 12 | Breakpoints: `s`, `m`, `l`, `xl`, `xxl` |
| shadow | 3 | Box shadows with x, y, blur, spread, opacity |
| border | 3 | Border widths |
| radius | 3 | Border radius values |
| grid | 4 | Gutters, magic-unit, rem values |

## CSS-Only Components

These layout and utility components are HTML/CSS only (no Vue/React wrapper):

| Component | Category | Description |
|-----------|----------|-------------|
| **Flexy** | layout | Flexbox 12-column grid with responsive classes |
| **Container** | layout | Responsive container with max-width |
| **Margin** | utility | Margin utilities using Magic Unit scale |
| **Padding** | utility | Padding utilities using Magic Unit scale |
| **Ratio** | utility | Aspect ratio utilities (16:9, 4:3, 1:1, etc.) |
| **Scroll** | utility | Scroll prevention utility |

Example CSS classes:
```css
.ml-flexy
.ml-flexy__col--6of12
.ml-flexy__col--4of12@from-m
.ml-container
.mu-m-100
.mu-p-200
.mu-ratio--16x9
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Claude Desktop                          │
└─────────────────────────┬───────────────────────────────────┘
                          │ stdio
┌─────────────────────────▼───────────────────────────────────┐
│                    MCP Server                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Tools: get_design_tokens, get_component_info, ...   │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            │                                │
│  ┌─────────────────────────▼───────────────────────────┐   │
│  │              SQLite Database                        │   │
│  │  tokens | components | documentation | examples     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ▲
                          │ build
┌─────────────────────────┴───────────────────────────────────┐
│                    Source Repositories                      │
│  mozaic-design-system  │  mozaic-vue  │  mozaic-react      │
└─────────────────────────────────────────────────────────────┘
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm build` | Compile TypeScript and build database |
| `pnpm build:docs` | Generate documentation diagrams |
| `pnpm start` | Start the MCP server |
| `pnpm dev` | Development mode with watch |
| `pnpm clean` | Remove dist and database |

## Documentation

See [docs/doc.md](./docs/doc.md) for detailed architecture diagrams and statistics.

## License

MIT
