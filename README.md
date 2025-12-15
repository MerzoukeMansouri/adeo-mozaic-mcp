# Mozaic MCP Server

An MCP (Model Context Protocol) server that exposes the **Mozaic Design System** by ADEO to Claude and other AI assistants.

> **Note**: This project is under active development. Contributions and feedback are welcome!

## What It Does

This server indexes the entire Mozaic Design System and makes it queryable through MCP tools. AI assistants can:

- Look up design tokens (colors, spacing, typography, etc.)
- Get component documentation with props, slots, events, and examples
- Search and retrieve icons with SVG/React/Vue code
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
| **Icons**            | 1,473 | SVG icons in 15 categories (354 unique, 5 sizes each)           |
| **CSS Utilities**    | 6     | Flexy, Container, Margin, Padding, Ratio, Scroll (500+ classes) |
| **Documentation**    | 281   | MDX pages with full-text search                                 |

Documentation sources:
- Design System docs (220 pages)
- Vue Storybook docs (58 pages) - Getting Started, Usage guides
- React Storybook docs (3 pages) - Getting Started, Usage guides

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

### Icon Tools

| Tool           | Description                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| `search_icons` | Search icons by name, type (navigation, media, social), or size (16-64px)   |
| `get_icon`     | Get icon details with SVG markup and ready-to-use React/Vue code            |

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
│  │  tokens | components | icons | css_utilities | docs │   │
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

## Next Steps

### Benchmarking: MCP vs Claude Skills

Compare performance and effectiveness of MCP server approach vs native Claude skills:

- [ ] Define benchmark scenarios (component lookup, code generation, documentation search)
- [ ] Measure response accuracy and completeness
- [ ] Compare token usage and latency
- [ ] Evaluate context window efficiency
- [ ] Document trade-offs and recommendations

### Release Process

Steps to publish the MCP server:

- [ ] **npm registry**: Publish to npm (`npm publish`)
- [ ] **Smithery**: Submit to [smithery.ai](https://smithery.ai) MCP marketplace
- [ ] **GitHub release**: Create tagged release with changelog
- [ ] **Claude Desktop config**: Document installation in `claude_desktop_config.json`
- [ ] **Version strategy**: Define semver policy for database schema changes

### Future Improvements

- [ ] Incremental database updates (avoid full rebuild)
- [ ] Watch mode for local development
- [ ] Caching layer for frequently accessed data
- [ ] Support for custom/extended tokens
- [ ] Multi-language documentation support

## Version History

Compatibility with Mozaic Design System versions:

| MCP Server | Mozaic Version | Date       | Changes                                      |
| ---------- | -------------- | ---------- | -------------------------------------------- |
| `1.0.0`    | `2.x`          | 2024-12    | Initial release with Vue 3, React, CSS utils |

### Mozaic Repositories Indexed

| Repository              | Branch | Description              |
| ----------------------- | ------ | ------------------------ |
| `mozaic-design-system`  | main   | Tokens, docs, styles     |
| `mozaic-vue`            | main   | Vue 3 components         |
| `mozaic-react`          | main   | React components         |

### Updating for New Mozaic Versions

When a new Mozaic version is released:

1. Pull latest changes: `pnpm build` (clones/updates repos automatically)
2. Run sanity check: `pnpm database:sanity`
3. Run tests: `pnpm test`
4. Update version table above
5. Tag release: `git tag vX.Y.Z`

## License

MIT
