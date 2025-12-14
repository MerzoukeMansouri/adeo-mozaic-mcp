# Mozaic MCP Server

> ⚠️ **Work In Progress**: This project is currently in draft stage and under active development. Feel free to collaborate and contribute!

An MCP (Model Context Protocol) server that exposes the **Mozaic Design System** (by ADEO) to Claude and other AI assistants.

## Project Status

🚧 **This is a WIP (Work In Progress) draft project** - The implementation is functional but still being refined. Contributions, suggestions, and collaborations are welcome!

## Features

- **Design Tokens** (586+): Colors, typography, spacing (Magic Unit), shadows, borders, screens, grid
  - Organized by category and subcategory for precise queries
  - Multiple value formats (raw, computed, CSS/SCSS variables)
  - Composite token properties (shadow x, y, blur, spread, opacity)
  - Grid system tokens (gutters, magic-unit, rem values)
- **Components** (97+): Vue 3, React, and HTML/CSS-only components
  - Vue & React: props, slots, events, examples
  - CSS-only: Flexy (flexbox grid), Container, Margin, Padding, Ratio, Scroll utilities
  - 500+ CSS classes with responsive variants
- **Documentation** (247+): Full-text search across Mozaic docs
- **Code Generation**: Generate Vue/React/HTML component code snippets

## Quick Start

```bash
pnpm install
pnpm build   # Compile TypeScript & build database (clones repos automatically)
pnpm start   # Start MCP server
```

## Architecture

### Statistics Summary

<a href="./docs/doc.md">
  <img src="./docs/assets/stats-summary.svg" width="100%" alt="Statistics Summary">
</a>

### Data Flow

<a href="./docs/doc.md">
  <img src="./docs/assets/dataflow.svg" width="100%" alt="Data Flow">
</a>

[View full documentation](./docs/doc.md)

## MCP Tools

| Tool                       | Description                                            |
| -------------------------- | ------------------------------------------------------ |
| `get_design_tokens`        | Get design tokens (colors, typography, spacing, shadows, borders, screens, grid) |
| `get_component_info`       | Get component details (props, slots, events, CSS classes, examples) - supports Vue, React, and HTML/CSS-only |
| `list_components`          | List available components by category (includes layout utilities) |
| `generate_vue_component`   | Generate Vue component code                            |
| `generate_react_component` | Generate React component code                          |
| `search_documentation`     | Full-text search Mozaic docs                           |

## Token Categories

| Category | Count | Description |
|----------|-------|-------------|
| color | 482 | Component colors organized by subcategory (button, primary, badge, etc.) |
| typography | 60 | Font sizes and line heights |
| spacing | 19 | Magic Unit system (mu025 to mu1000) |
| screen | 12 | Breakpoint definitions |
| border | 3 | Border widths |
| radius | 3 | Border radius values |
| shadow | 3 | Box shadows with composite properties |
| grid | 4 | Grid gutters, magic-unit, and rem values |

## Component Types

| Type | Count | Description |
|------|-------|-------------|
| Vue | 52 | Vue 3 components with props, slots, events |
| React | 39 | React components with props, callbacks |
| HTML/CSS | 6 | CSS-only utilities: Flexy, Container, Margin, Padding, Ratio, Scroll |

## License

MIT
