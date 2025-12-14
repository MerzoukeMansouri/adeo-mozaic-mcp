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

| Type                 | Count | Description                                                     |
| -------------------- | ----- | --------------------------------------------------------------- |
| **Design Tokens**    | 586   | Colors, typography, spacing, shadows, borders, screens, grid    |
| **Vue Components**   | 52    | Props, slots, events, examples                                  |
| **React Components** | 39    | Props, callbacks, examples                                      |
| **CSS Utilities**    | 6     | Flexy, Container, Margin, Padding, Ratio, Scroll (500+ classes) |
| **Documentation**    | 247   | MDX pages with full-text search                                 |

## MCP Tools

### Component Tools

| Tool                       | Description                                                      |
| -------------------------- | ---------------------------------------------------------------- |
| `get_component_info`       | Get Vue/React component details (props, slots, events, examples) |
| `list_components`          | List framework components by category                            |
| `generate_vue_component`   | Generate Vue component code                                      |
| `generate_react_component` | Generate React component code                                    |

### CSS Utility Tools

| Tool                 | Description                                                |
| -------------------- | ---------------------------------------------------------- |
| `get_css_utility`    | Get CSS utility classes and examples (Flexy, Margin, etc.) |
| `list_css_utilities` | List available CSS utilities by category (layout, utility) |

### Other Tools

| Tool                   | Description                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `get_design_tokens`    | Query tokens by category (color, spacing, typography, shadow, border, screen, grid) |
| `search_documentation` | Full-text search across all docs                                                    |

## Token Categories

| Category   | Count | Examples                                           |
| ---------- | ----- | -------------------------------------------------- |
| color      | 482   | `--color-primary-01-100`, `--color-button-solid-*` |
| typography | 60    | `--font-size-*`, `--line-height-*`                 |
| spacing    | 19    | `$mu025` to `$mu1000` (Magic Unit system)          |
| screen     | 12    | Breakpoints: `s`, `m`, `l`, `xl`, `xxl`            |
| shadow     | 3     | Box shadows with x, y, blur, spread, opacity       |
| border     | 3     | Border widths                                      |
| radius     | 3     | Border radius values                               |
| grid       | 4     | Gutters, magic-unit, rem values                    |

## CSS Utilities

CSS-only layout and utility classes (no Vue/React wrapper). Use `get_css_utility` tool to get full class lists and examples.

| Utility       | Category | Description                                    |
| ------------- | -------- | ---------------------------------------------- |
| **Flexy**     | layout   | Flexbox 12-column grid with responsive classes |
| **Container** | layout   | Responsive container with max-width            |
| **Margin**    | utility  | Margin utilities using Magic Unit scale        |
| **Padding**   | utility  | Padding utilities using Magic Unit scale       |
| **Ratio**     | utility  | Aspect ratio utilities (16:9, 4:3, 1:1, etc.)  |
| **Scroll**    | utility  | Scroll prevention utility                      |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Claude Desktop                          │
└─────────────────────────┬───────────────────────────────────┘
                          │ stdio
┌─────────────────────────▼───────────────────────────────────┐
│                    MCP Server                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Tools: get_component_info, get_css_utility, ...     │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            │                                │
│  ┌─────────────────────────▼───────────────────────────┐   │
│  │                 SQLite Database                     │   │
│  │  tokens | components | css_utilities | documentation│   │
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

| Script            | Description                           |
| ----------------- | ------------------------------------- |
| `pnpm build`      | Compile TypeScript and build database |
| `pnpm build:docs` | Generate documentation diagrams       |
| `pnpm start`      | Start the MCP server                  |
| `pnpm dev`        | Development mode with watch           |
| `pnpm clean`      | Remove dist and database              |
| `pnpm test`       | Run unit tests                        |
| `pnpm database:sanity` | Validate database integrity         |

## Documentation

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Architecture diagrams and statistics
- [docs/TEST.md](./docs/TEST.md) - Testing guide

## License

MIT
