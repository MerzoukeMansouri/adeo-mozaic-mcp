# Mozaic Design System Skills

Agent skills for working with the Mozaic Design System, usable by any agent that supports the [Agent Skills](https://agentskills.io) format. Most skills run locally with bash scripts and a SQLite database; `mozaic-style-guide` uses the MCP server.

## Overview

**7 Self-Contained Skills** that use **local shell scripts** (22 scripts total, `sqlite3`; some also `jq`) to query a SQLite database, plus **1 MCP-tool skill** (`mozaic-style-guide`) that calls the MCP server directly to return an image content block.

**Architecture Pattern**: Skills provide workflows + data access through bash scripts → local database (or, for `mozaic-style-guide`, through MCP tool calls)

## Skills Summary

| Skill | Type | Description | Shell Scripts |
|-------|------|-------------|---------------|
| `mozaic-vue-builder` | Framework | Interactive Vue 3 component generator | 4 scripts |
| `mozaic-react-builder` | Framework | Interactive React/TSX component generator | 4 scripts |
| `mozaic-webcomponents-builder` | Framework | Interactive native Web Components generator | 4 scripts |
| `mozaic-freemarker-builder` | Framework | Interactive Freemarker macro generator | 4 scripts |
| `mozaic-design-tokens` | Agnostic | Design tokens and styling expert | 2 scripts |
| `mozaic-css-utilities` | Agnostic | CSS utility classes and layouts | 2 scripts |
| `mozaic-icons` | Both | Icon search and integration | 2 scripts |
| `mozaic-style-guide` | Agnostic | Composed-pattern catalog (compliance/reference layer) | MCP tools (no scripts) |

**Total**: 8 skills; 7 self-contained with 22 shell scripts querying `~/.mozaic/mozaic.db`, 1 (`mozaic-style-guide`) calling MCP tools directly

---

## Skill 1: mozaic-vue-builder

**Location**: `skills/mozaic-vue-builder/SKILL.md`

### Purpose
Interactive assistant for building Vue 3 applications with Mozaic Design System.

### Shell Scripts
- `list-components.sh` - Browse Vue components by category
- `get-component.sh` - Get component props, slots, events
- `generate-component.sh` - Generate Vue 3 SFC code
- `get-install-info.sh` - Get installation commands

### Key Features
- Browse components by category (forms, navigation, feedback, layout, etc.)
- Interactive component selection with proposals
- Generate complete Vue 3 SFC code
- Props configuration with v-model bindings
- Installation commands (npm/yarn/pnpm)

### Example Usage
```
User: "I need a login form"
Skill: Proposes TextInput + Button combinations → Generates Vue code
```

### Use When
- Building Vue 3 UI components
- Need component props and slots guidance
- Want installation instructions
- Building forms, modals, navigation

---

## Skill 2: mozaic-react-builder

**Location**: `skills/mozaic-react-builder/SKILL.md`

### Purpose
Interactive assistant for building React applications with Mozaic Design System and full TypeScript support.

### Shell Scripts
- `list-components.sh` - Browse React components by category
- `get-component.sh` - Get component props, events, TypeScript types
- `generate-component.sh` - Generate React/TSX code
- `get-install-info.sh` - Get installation commands with TypeScript config

### Key Features
- Browse React components by category
- Interactive component selection
- Generate TypeScript/React code
- Full type safety with interfaces
- Installation commands + TypeScript config

### Example Usage
```
User: "I need a registration form with TypeScript"
Skill: Proposes components with TypeScript interfaces → Generates typed React code
```

### Use When
- Building React UI components
- Need TypeScript type definitions
- Want framework-specific props guidance
- Building forms, modals, tables

---

## Skill 3: mozaic-webcomponents-builder

**Location**: `skills/mozaic-webcomponents-builder/SKILL.md`

### Purpose
Interactive assistant for building framework-agnostic applications with native Web Components (Custom Elements v1) using Mozaic Design System.

### Shell Scripts
- `list-components.sh` - Browse Web Components by category
- `get-component.sh` - Get component attributes, slots, events, CSS properties
- `search-components.sh` - Search web components by name or description
- `generate-component.sh` - Generate web component usage code

### Key Features
- Browse native web components by category
- Interactive component selection with examples
- Generate HTML with ES module imports
- Attributes and CustomEvent handling
- Slot-based content projection
- CSS custom properties for theming
- Progressive enhancement patterns
- Server-side rendering friendly

### Example Usage
```
User: "I need a contact form using web components"
Skill: Proposes mozaic-input + mozaic-button → Generates HTML with imports and event listeners
```

### Use When
- Building framework-agnostic applications
- Need components that work across frameworks (React, Vue, Angular, Svelte)
- Building micro-frontends
- Adding progressive enhancement to server-rendered apps
- Want lightweight, standards-based components
- Building with vanilla JavaScript

### Web Component Features
- **Custom Elements**: `<mozaic-button>`, `<mozaic-input>`, etc.
- **Attributes**: HTML attributes for configuration
- **Properties**: JavaScript properties for complex data
- **Events**: CustomEvents for component interactions
- **Slots**: Content projection with named slots
- **CSS Properties**: Theming with CSS custom properties

---

## Skill 4: mozaic-freemarker-builder

**Location**: `skills/mozaic-freemarker-builder/SKILL.md`

### Purpose
Interactive assistant for building server-side templates with Freemarker macros using Mozaic Design System.

### Shell Scripts
- `list-components.sh` - Browse Freemarker macros by category
- `get-component.sh` - Get macro configuration options
- `search-components.sh` - Search macros by name or description
- `generate-component.sh` - Generate Freemarker macro code

### Key Features
- Browse Freemarker macros by category
- Configuration object examples
- Import statements and macro invocation
- Nested content handling
- Maven/Java integration examples
- i18n locale support

### Use When
- Server-side rendered pages with Freemarker (.ftl) templates
- Java/Spring projects using Mozaic macros

---

## Skill 5: mozaic-design-tokens

**Location**: `skills/mozaic-design-tokens/SKILL.md`

### Purpose
Expert for working with Mozaic design tokens (colors, typography, spacing, shadows, borders, breakpoints, grid).

### Shell Scripts
- `get-tokens.sh` - Get tokens by category and format (JSON, SCSS, CSS, JS)
- `search-docs.sh` - Search Mozaic documentation

### Key Features
- Browse tokens by category
- Multiple formats (JSON, SCSS, CSS, JS)
- Responsive breakpoint values
- Usage examples for Vue & React
- Consistent styling guidance

### Token Categories
- **Colors**: Brand, semantic, component colors
- **Typography**: Font sizes, weights, line heights
- **Spacing**: Magic unit scale (4px base)
- **Shadows**: Elevation levels
- **Borders**: Widths, radius, colors
- **Screens**: Responsive breakpoints
- **Grid**: Gutters, columns, containers

### Example Usage
```
User: "What are the brand colors?"
Skill: Returns colors in requested format (SCSS/CSS/JS) with usage examples
```

### Use When
- Need brand or semantic colors
- Want consistent typography scale
- Need spacing values
- Working with responsive breakpoints
- Need shadows or border values

---

## Skill 6: mozaic-css-utilities

**Location**: `skills/mozaic-css-utilities/SKILL.md`

### Purpose
Expert for Mozaic CSS-only utility classes (no framework needed).

### Shell Scripts
- `list-utilities.sh` - Browse CSS utilities by category
- `get-utility.sh` - Get utility classes, examples, documentation

### Key Features
- Flexy grid system (flexbox-based)
- Container utilities
- Margin and Padding utilities
- Ratio utilities (aspect ratios)
- Scroll utilities
- Responsive modifiers

### Available Utilities
- **Flexy**: Responsive grid (12-column)
- **Container**: Centered containers
- **Margin**: Spacing utilities (m-*, mt-*, mb-*, etc.)
- **Padding**: Padding utilities (p-*, pt-*, pb-*, etc.)
- **Ratio**: Aspect ratio containers (16:9, 4:3, 1:1, etc.)
- **Scroll**: Scroll behavior control

### Example Usage
```
User: "I need a 3-column responsive grid"
Skill: Returns Flexy grid HTML with responsive breakpoints
```

### Use When
- Building responsive layouts
- Need consistent spacing
- Want utility-first CSS approach
- Don't want to write custom CSS
- Building grids, containers, aspect ratios

---

## Skill 7: mozaic-icons

**Location**: `skills/mozaic-icons/SKILL.md`

### Purpose
Icon search and integration for Vue & React applications.

### Shell Scripts
- `search-icons.sh` - Search icons by name, type, or size
- `get-icon.sh` - Get icon SVG and framework code (Vue/React)

### Key Features
- Search icons by keyword
- Browse by type (navigation, media, payment, social, etc.)
- Filter by size (16, 24, 32, 48, 64)
- Generate Vue or React code
- Raw SVG output
- Accessibility guidance

### Icon Types
1,473 icons (354 unique) across 15 types: device, instruction, logotypes, media, navigation, payment, product, project, promise, service, social, store, universe, user, various.

### Example Usage
```
User: "I need a shopping cart icon"
Skill: Shows cart icons → User selects size/framework → Generates code
```

### Use When
- Finding icons for UI
- Need icons in specific sizes
- Want Vue or React icon components
- Building navigation, actions, social links

---

## Skill 8: mozaic-style-guide

**Location**: `skills/mozaic-style-guide/SKILL.md`

### Purpose
Framework-agnostic compliance/reference layer: a catalog of real, composed Mozaic UI patterns (not single components) so any coding agent can see how components are combined correctly before generating code, then hand off to the matching framework builder skill.

### MCP Tools
- `list_style_guides(category?, site?)` - List patterns, optionally filtered by category and/or source site (no full-text search, the table stays small)
- `get_style_guide(slug)` - Returns the pattern's screenshot as a base64 image content block, its relative path as text, its source site, and the linked component slugs

### Key Features
- Browse patterns by category (modal-confirm, nav-header, search-filter, data-table, master-detail, calendar-view, onboarding-stepper, cascading-column-browser, form) and/or by source site (elo, sop)
- Visual reference: the agent actually sees the composed screenshot, not just a text description
- Lists the component slugs used in the pattern, to cross-reference component docs
- Hands off code generation to `mozaic-react-builder` / `mozaic-vue-builder` / `mozaic-webcomponents-builder` / `mozaic-freemarker-builder` depending on the target stack

### Example Usage
```
User: "I need a confirmation modal like the rest of the app"
Skill: Calls list_style_guides(category: "modal-confirm") → get_style_guide("sales-mode-modal")
       Shows the screenshot + linked components (modal, radiogroup, button) → hands off to the
       framework builder skill matching the project's stack to generate the actual code
```

### Use When
- Building a UI that should match an established Mozaic pattern, not just a single component
- Unsure how components compose into a real screen (modal + button + form, header + nav, etc.)
- Need a compliance check against real internal examples before generating code
- Working in any framework - React, Vue, Web Components, or Freemarker

### Authoring a Style Guide Entry
Contributors add new patterns as a hand-authored folder (not parsed from a vendored repo):
```
style-guides/<slug>/
├── meta.json       # { name, category, site, description, components: string[] }
└── screenshot.png  # Reference screenshot of the composed pattern
```
`category` is the pattern shape (reusable across sites); `site` is which app it was captured from (e.g. `elo`, `sop`) — both open strings, both filterable. `components` lists component **slugs** (matching the `components` table), used to cross-link to builder skills. The build step fails fast on a missing/malformed folder or an unknown component slug.

---

## How Skills Work

### Architecture

Skills are **self-contained** and use bash scripts to query the local database:

1. Each skill has a `SKILL.md` file (instructions) and `scripts/` folder (bash scripts)
2. Scripts query `~/.mozaic/mozaic.db` (SQLite database, installed on first use)
3. Scripts return JSON data for processing
4. Skills provide guided workflows and interactive experiences
5. No MCP server needed (except `mozaic-style-guide`)

### Example: mozaic-vue-builder Workflow

```
1. User: "I need a form"
2. Skill runs `list-components.sh form` → Shows form components
3. User selects components
4. Skill runs `get-component.sh TextInput` → Gets props/details
5. Skill proposes 2-3 combinations
6. User refines selection
7. Skill runs `generate-component.sh TextInput` → Generates Vue code
8. Skill runs `get-install-info.sh TextInput` → Installation commands
```

---

## Installation

Skills follow the [Agent Skills](https://agentskills.io/specification) format, so they work in any compatible agent (Claude Code, Codex, Cursor, GitHub Copilot, Gemini CLI, OpenCode, ...):

```
skills/
└── <skill-name>/
    ├── SKILL.md      # frontmatter (name, description, compatibility, allowed-tools, metadata) + instructions
    ├── scripts/      # bash scripts querying the SQLite database (arguments are SQL-escaped)
    └── references/   # longer examples, loaded only when needed (keeps SKILL.md < 500 lines)
```

### Install

Standard [`npx skills`](https://github.com/vercel-labs/skills) CLI:

```bash
npx skills add MerzoukeMansouri/adeo-mozaic-mcp            # current project
npx skills add MerzoukeMansouri/adeo-mozaic-mcp -g         # your user
npx skills remove mozaic-icons                             # remove a skill
```

### Database

Script-based skills read `~/.mozaic/mozaic.db` (override with `MOZAIC_DB_PATH`). If it is missing, the first script run installs it with `npx -y -p mozaic-mcp-server@2 mozaic-db`; run that command again to refresh it.

### MCP Server

Only `mozaic-style-guide` needs the MCP server, registered under the name `mozaic`:

```bash
npx add-mcp mozaic-mcp-server@2 --name mozaic
```

---

## Skill Activation

Skills activate automatically based on context, or you can invoke them:

- **Auto-activation**: When user mentions relevant keywords
- **Manual**: depends on the agent (e.g. `/mozaic-vue-builder` in Claude Code)

---

## Cross-Skill Integration

Skills work well together:

1. **mozaic-design-tokens** → Get colors
2. **mozaic-vue-builder** → Build component with those colors
3. **mozaic-css-utilities** → Add Flexy grid layout
4. **mozaic-icons** → Add icons to the component

---

## Development

### File Structure
Each skill follows the [Agent Skills spec](https://agentskills.io/specification):
```markdown
---
name: mozaic-vue-builder          # must match the folder name
description: ...                  # what it does and when to use it
compatibility: Requires bash, sqlite3 and jq, ...
allowed-tools: Bash
metadata:
  version: "2.0.0"
---

# Skill instructions (workflow, scripts to run, examples)
```

### Adding New Skills

1. Create skill directory: `skills/new-skill/` (`name` in frontmatter must match the folder name)
2. Create `SKILL.md` with frontmatter following the [Agent Skills spec](https://agentskills.io/specification)
3. Reference MCP tools by their plain name (e.g. `get_style_guide`), not an agent-specific prefix
4. Provide interactive workflows
5. Include examples and best practices

---

## Resources

- **Skills**: `skills/<name>/` in this repo
- **Database**: `data/mozaic.db` (built by `pnpm build`), installed for skills at `~/.mozaic/mozaic.db`
- **Website**: https://merzoukemansouri.github.io/adeo-mozaic-mcp/#/skills
- **MCP server**: [README.md](./README.md)
- **Agent Skills spec**: https://agentskills.io/specification

**License**: MIT
