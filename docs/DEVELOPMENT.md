# Mozaic Design System MCP Server

> Development guide and technical specification for the Mozaic MCP Server.
> For architecture diagrams and statistics, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Table of Contents

- [Project Overview](#project-overview)
- [Source Repositories](#source-repositories)
- [Architecture](#architecture)
  - [Recommended Stack](#recommended-stack)
  - [Project Structure](#project-structure)
- [MCP Tools (current, 19)](#mcp-tools-current)
- [HTTP Server](#http-server-nestjs)
- [Original Plan: Tool Specs (historical)](#original-plan-tool-specs-historical)
- [Data Extraction Strategy](#data-extraction-strategy)
  - [Phase 1: Clone Repositories](#phase-1-clone-and-parse-repositories)
  - [Phase 2: Extract Tokens](#phase-2-extract-design-tokens)
  - [Phase 3: Extract Components](#phase-3-extract-components)
  - [Phase 4: Extract Documentation](#phase-4-extract-documentation)
- [SQLite Database Schema](#sqlite-database-schema)
- [Building the Database](#building-and-refreshing-the-database)
- [Running Locally](#running-locally)
- [CI/CD](#cicd)
- [Debugging](#debugging)
- [Testing](#testing)
- [Resources](#resources)

---

## Project Overview

An MCP (Model Context Protocol) server that exposes the **Mozaic Design System** (by ADEO) to any MCP-capable coding agent (Claude Code, Codex, Cursor, GitHub Copilot, Gemini CLI, ...). The repo also ships 8 [Agent Skills](https://agentskills.io/specification) (`skills/<name>/SKILL.md`, see [SKILLS.md](../SKILLS.md)). The MCP server provides intelligent access to design tokens, component documentation, code examples, and code generation capabilities.

## Source Repositories

### Primary Sources

| Repository               | URL                                            | Purpose                                   |
| ------------------------ | ---------------------------------------------- | ----------------------------------------- |
| **Main Design System**   | `https://github.com/adeo/mozaic-design-system` | Core tokens, styles, icons, documentation |
| **Vue Implementation**   | `https://github.com/adeo/mozaic-vue`           | Vue.js component library                  |
| **React Implementation** | `https://github.com/adeo/mozaic-react`         | React component library                   |
| **Web Components**       | `https://github.com/adeo/mozaic-web-components` | Native/framework-agnostic Web Components |
| **Freemarker**           | `https://github.com/adeo/mozaic-freemarker`    | Freemarker macros for server-side templates |
| **Documentation Site**   | `https://mozaic.adeo.cloud/`                   | Official documentation                    |
| **Vue Storybook**        | `https://adeo.github.io/mozaic-vue/`           | Vue component demos                       |

Only `mozaic-design-system` is public; the Vue, React, Web Components and Freemarker repos are private (CI uses the `MOZAIC_REPOS_TOKEN` secret).

### NPM Packages

```bash
@mozaic-ds/styles        # SCSS framework
@mozaic-ds/tokens        # Design tokens (JSON → SCSS, JS, iOS, Android)
@mozaic-ds/css-dev-tools # PostCSS plugins and linters
@mozaic-ds/web-fonts     # Leroy Merlin font
@mozaic-ds/icons         # Iconography (React, Vue, iOS support)
@mozaic-ds/vue           # Vue 2 components
@mozaic-ds/vue-3         # Vue 3 components
```

### Hand-Authored Sources

Every source above is cloned into `repos/` (gitignored) and parsed by `build-index.ts`. The **style guide catalog** is the one exception: it has no upstream repo to parse, so its content is authored directly in this repository.

```
style-guides/<slug>/
├── meta.json       # { name, category, site, description, components: string[] }
└── screenshot.png  # Reference screenshot of the composed pattern
```

- `<slug>` is the `style_guides.slug` primary key (e.g. `modal-confirm`, `cascading-column-browser`).
- `category` is the pattern shape (reusable across sites); `site` is the source app the screenshot was captured from (e.g. `elo`, `sop`) — two independent axes, both open strings, both filterable via `list_style_guides(category?, site?)`.
- `components` is a list of component **slugs** (matching `components.slug`), not names — used to cross-link a pattern to the component docs/builder skills.
- `build-index.ts` fails fast if a folder is missing `meta.json`, `screenshot.png`, has malformed JSON, or references an unknown component slug — same convention as every other core table.
- Known categories so far: `modal-confirm`, `nav-header`, `search-filter`, `data-table`, `master-detail`, `calendar-view`, `onboarding-stepper`, `cascading-column-browser`, `form`.
- Known sites so far: `elo`, `sop`.

---

## Architecture

### Recommended Stack

- **Runtime**: Node.js 25+ (CI uses Node 25 and pnpm 9)
- **Language**: TypeScript
- **Database**: SQLite (simple, portable, zero-config)
- **MCP SDK**: `@modelcontextprotocol/sdk` (stdio transport)
- **HTTP server**: NestJS (`src/main.ts`), see [DEPLOYMENT.md](../DEPLOYMENT.md)

### Project Structure

```
mozaic-mcp-server/
├── src/
│   ├── index.ts              # MCP (stdio) server entry point
│   ├── main.ts                # NestJS HTTP server entry point (v0/web clients)
│   ├── app.module.ts          # NestJS root module
│   ├── mcp/
│   │   ├── mcp.controller.ts        # /mcp HTTP endpoint (stdio-equivalent MCP)
│   │   ├── mcp-light.controller.ts  # /mcp/light lightweight JSON-RPC token/CSS/icon tools
│   │   ├── mcp.module.ts
│   │   └── mcp.service.ts
│   ├── auth/                  # Bearer auth guard for the HTTP server
│   ├── config/                # NestJS configuration
│   ├── tools/
│   │   ├── get-design-tokens.ts
│   │   ├── get-component-info.ts
│   │   ├── list-components.ts
│   │   ├── generate-vue-component.ts
│   │   ├── generate-react-component.ts
│   │   ├── generate-webcomponent.ts
│   │   ├── get-webcomponent-info.ts
│   │   ├── list-webcomponents.ts
│   │   ├── generate-freemarker.ts
│   │   ├── get-freemarker-info.ts
│   │   ├── list-freemarker.ts
│   │   ├── get-icon.ts
│   │   ├── search-icons.ts
│   │   ├── get-install-info.ts
│   │   ├── search-documentation.ts
│   │   ├── get-css-utility.ts
│   │   ├── list-css-utilities.ts
│   │   ├── list-style-guides.ts
│   │   └── get-style-guide.ts
│   ├── __tests__/             # Integration, skills-scripts and sanity tests
│   ├── db/
│   │   ├── schema.ts         # SQLite schema
│   │   └── queries.ts        # Database queries
│   └── parsers/
│       ├── tokens-parser.ts  # Orchestrates all token parsers
│       ├── tokens/           # Split token parsers
│       │   ├── index.ts
│       │   ├── types.ts      # Shared types (Token, TokenProperty)
│       │   ├── color-parser.ts
│       │   ├── spacing-parser.ts
│       │   ├── shadow-parser.ts
│       │   ├── border-parser.ts
│       │   ├── screen-parser.ts
│       │   ├── typography-parser.ts
│       │   └── grid-parser.ts
│       ├── vue-parser.ts     # Parse Vue components
│       ├── react-parser.ts   # Parse React components
│       ├── web-components-parser.ts
│       ├── freemarker-parser.ts
│       ├── icons-parser.ts
│       ├── docs-parser.ts    # Parse markdown documentation
│       ├── scss-parser.ts    # Parse CSS utilities (Flexy, Margin, etc.)
│       └── __tests__/        # Parser unit tests
├── scripts/
│   ├── build-index.ts        # Clones repos/ and builds data/mozaic.db
│   ├── sanity-check.ts       # pnpm database:sanity
│   ├── docker-build.sh       # Docker image build for the HTTP server
│   └── generate-docs.ts      # Generate documentation & diagrams
├── skills/                   # 8 Agent Skills (SKILL.md + scripts/)
├── style-guides/             # Hand-authored patterns (meta.json + screenshot.png)
├── bin/mozaic-db.js          # installs the skills database to ~/.mozaic/mozaic.db
├── website/                  # Docs site + browser playground (GitHub Pages)
├── data/
│   └── mozaic.db             # SQLite database (generated)
├── docs/
│   ├── ARCHITECTURE.md       # Auto-generated architecture docs
│   └── assets/               # SVG diagrams
├── package.json
└── tsconfig.json
```

---

## MCP Tools (current)

19 tools, registered in `src/index.ts` (one file per tool in `src/tools/`):

| Group | Tools |
| ----- | ----- |
| Tokens | `get_design_tokens` |
| Components (Vue/React) | `get_component_info`, `list_components`, `generate_vue_component`, `generate_react_component` |
| Web Components | `generate_webcomponent`, `get_webcomponent_info`, `list_webcomponents` |
| Freemarker | `generate_freemarker`, `get_freemarker_info`, `list_freemarker` |
| Docs | `search_documentation` |
| CSS utilities | `get_css_utility`, `list_css_utilities` |
| Icons | `search_icons`, `get_icon` |
| Style guides | `list_style_guides` (filter by category/site), `get_style_guide` (returns a PNG image block + linked component slugs) |
| Install | `get_install_info` |

The browser playground (`website/`) implements all of them as SQL queries against the same database.

## HTTP Server (NestJS)

`src/main.ts` boots a separate, token-protected HTTP app for web tools (e.g. v0). Agents should use the stdio server. Bearer `AUTH_TOKEN` on all routes except `/health` and `/api`:

- `GET /health`, `GET /api` (Swagger)
- `POST /mcp` (JSON-RPC 2.0), `GET /mcp/info`, `POST /mcp/list-tools`, `POST /mcp/call-tool`: all 19 tools, proxied to a spawned stdio server
- `POST /mcp/light` (JSON-RPC 2.0), `POST /mcp/light/list-tools`, `POST /mcp/light/call-tool`: 7 tools (`get_design_tokens`, `list_css_utilities`, `get_css_utility`, `search_icons`, `get_icon`, `list_style_guides`, `get_style_guide`) read directly from SQLite, no subprocess
- `call-tool` body: `{"name": "...", "arguments": {...}}`

Env vars and deployment: [DEPLOYMENT.md](../DEPLOYMENT.md).

---

## Original Plan: Tool Specs (historical)

> The original planning spec, kept for context. Schemas below may differ from the shipped tools; `src/index.ts` is the source of truth.

### 1. `get_design_tokens`

Retrieve design tokens (colors, typography, spacing, etc.)

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "category": {
      "type": "string",
      "enum": ["colors", "typography", "spacing", "shadows", "borders", "all"],
      "description": "Token category to retrieve"
    },
    "format": {
      "type": "string",
      "enum": ["scss", "css", "json", "js"],
      "default": "json"
    }
  },
  "required": ["category"]
}
```

**Data Sources:**

- `@mozaic-ds/tokens/properties/color/*.json`
- `@mozaic-ds/tokens/properties/size/*.json`
- `@mozaic-ds/tokens/properties/font/*.json`
- `@mozaic-ds/tokens/build/js/tokensObject.js`

### 2. `get_component_info`

Get detailed information about a specific component.

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "component": {
      "type": "string",
      "description": "Component name (e.g., 'button', 'modal', 'accordion')"
    },
    "framework": {
      "type": "string",
      "enum": ["vue", "react", "html"],
      "default": "vue"
    }
  },
  "required": ["component"]
}
```

**Response Structure:**

```json
{
  "name": "MButton",
  "description": "Button component for user actions",
  "props": [
    {
      "name": "variant",
      "type": "string",
      "default": "primary",
      "options": ["primary", "secondary", "bordered", "solid"]
    }
  ],
  "slots": ["default", "icon-left", "icon-right"],
  "events": ["click"],
  "examples": [
    {
      "title": "Basic Button",
      "code": "<MButton>Click me</MButton>"
    }
  ],
  "cssClasses": ["mc-button", "mc-button--primary"],
  "relatedComponents": ["MButtonGroup", "MLink"]
}
```

### 3. `list_components`

List all available components, optionally filtered by category.

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "category": {
      "type": "string",
      "enum": [
        "form",
        "navigation",
        "feedback",
        "layout",
        "data-display",
        "all"
      ],
      "default": "all"
    }
  }
}
```

### 4. `generate_component`

Generate component code with specified props and configuration.

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "component": {
      "type": "string",
      "description": "Component type to generate"
    },
    "framework": {
      "type": "string",
      "enum": ["vue", "react", "html"]
    },
    "props": {
      "type": "object",
      "description": "Component properties to apply"
    },
    "children": {
      "type": "string",
      "description": "Content to place inside the component"
    }
  },
  "required": ["component", "framework"]
}
```

### 5. `search_documentation`

Semantic search across Mozaic documentation.

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Search query"
    },
    "limit": {
      "type": "number",
      "default": 5
    }
  },
  "required": ["query"]
}
```

### 6. `get_css_utility`

Get CSS utility classes and examples (Flexy, Margin, Padding, etc.).

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Utility name (e.g., 'flexy', 'margin', 'padding')"
    },
    "includeClasses": {
      "type": "boolean",
      "default": true,
      "description": "Include all CSS class names"
    }
  },
  "required": ["name"]
}
```

### 7. `list_css_utilities`

List available CSS-only utilities by category.

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "category": {
      "type": "string",
      "enum": ["layout", "utility", "all"],
      "default": "all",
      "description": "Filter: layout (Flexy, Container) or utility (Margin, Padding, Ratio, Scroll)"
    }
  }
}
```

---

## Data Extraction Strategy

### Phase 1: Clone and Parse Repositories

`pnpm build` (`scripts/build-index.ts`) clones or pulls the 5 source repos into `repos/` (shallow clones); no manual clone or token build is needed.

### Phase 2: Extract Design Tokens

The token extraction uses **split parsers** for each token category:

| Parser                 | Source                         | Tokens                                   |
| ---------------------- | ------------------------------ | ---------------------------------------- |
| `color-parser.ts`      | `properties/color/*.json`      | Colors with subcategory extraction       |
| `spacing-parser.ts`    | SCSS Magic Unit definitions    | 19 spacing values (mu025-mu1000)         |
| `shadow-parser.ts`     | `properties/shadow/*.json`     | Shadows with x, y, blur, spread, opacity |
| `border-parser.ts`     | `properties/size/*.json`       | Border widths and radius                 |
| `screen-parser.ts`     | `properties/size/screens.json` | Breakpoint definitions                   |
| `typography-parser.ts` | `properties/size/font.json`    | Font sizes and line heights              |

**Token File Locations:**

```
mozaic-design-system/packages/tokens/
├── properties/           # Source JSON files
│   ├── color/
│   │   ├── base.json    # Primary/secondary colors
│   │   ├── font.json    # Text colors
│   │   └── button.json  # Component-specific colors
│   ├── size/
│   │   ├── font.json    # Font sizes, line heights
│   │   ├── screens.json # Breakpoints
│   │   └── *.json       # Border, radius
│   └── shadow/
│       └── *.json       # Shadow definitions
└── build/                # Generated outputs
    ├── scss/_tokens.scss
    └── js/tokensObject.js
```

**Token Structure Example:**

```json
{
  "color": {
    "primary-01": {
      "100": { "value": "#78be20" },
      "200": { "value": "#5a8f18" }
    }
  }
}
```

**Spacing (Magic Unit) System:**

The spacing system uses a base unit of 16px with multipliers:

- `mu025` = 4px (0.25rem)
- `mu050` = 8px (0.5rem)
- `mu100` = 16px (1rem) - base unit
- `mu200` = 32px (2rem)
- ... up to `mu1000` = 160px (10rem)

### Phase 3: Extract Components

#### Vue Components

**Vue Component Locations:**

```
mozaic-vue/src/components/
├── MButton/
│   ├── MButton.vue
│   ├── MButton.spec.ts
│   └── index.ts
├── MModal/
│   └── ...
└── ...
```

**Storybook Stories:**

```
mozaic-vue/.storybook/
mozaic-vue/src/components/*/stories/*.stories.ts
```

#### React Components

**React Component Locations:**

```
mozaic-react/src/components/
├── Button/
│   ├── Button.tsx
│   ├── Button.spec.tsx
│   └── index.ts
├── Modal/
│   └── ...
└── ...
```

**React Storybook:**

```
mozaic-react/.storybook/
mozaic-react/src/components/*/stories/*.stories.tsx
```

**Parser Strategy:**

1. Parse component files to extract:
   - Props definitions (with types, defaults, validators)
   - Emitted events (Vue) / Callbacks (React)
   - Slots (Vue) / Children props (React)
2. Parse `.stories.ts/.stories.tsx` files to extract:
   - Usage examples
   - Args/controls definitions
3. Parse TypeScript interfaces for prop types

### Phase 4: Extract Documentation

**Documentation Locations:**

```
mozaic-design-system/src/docs/
├── Components/
│   ├── Buttons/
│   │   ├── code.mdx
│   │   └── design.mdx
│   └── ...
└── Foundations/
    ├── Colors/
    └── Typography/
```

---

## SQLite Database Schema

Excerpt; `src/db/schema.ts` is the source of truth. It also defines an `icons` table (name, icon_name, type, size, view_box, paths) with `icons_fts`.

```sql
-- Design Tokens (enhanced with subcategory, multiple value formats)
CREATE TABLE tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,        -- 'color', 'spacing', 'typography', 'shadow', 'border', 'radius', 'screen'
  subcategory TEXT,              -- e.g., 'primary', 'button', 'font-size', 'magic-unit'
  name TEXT NOT NULL,            -- Token name: 'primary-01-100', 'mu100'
  path TEXT NOT NULL UNIQUE,     -- Full path: 'color.primary-01.100'
  css_variable TEXT,             -- CSS var: '--color-primary-01-100'
  scss_variable TEXT,            -- SCSS var: '$color-primary-01-100'
  value_raw TEXT NOT NULL,       -- Raw value: '1rem', '#78be20'
  value_number REAL,             -- Numeric part: 1, null for colors
  value_unit TEXT,               -- Unit: 'rem', 'px', null for colors
  value_computed TEXT,           -- Computed value: '16px' (rem→px)
  description TEXT,
  platform TEXT DEFAULT 'all',
  source_file TEXT               -- Source file path
);

CREATE INDEX idx_tokens_category ON tokens(category);
CREATE INDEX idx_tokens_subcategory ON tokens(category, subcategory);
CREATE INDEX idx_tokens_path ON tokens(path);

-- Token Properties (for composite tokens like shadows)
CREATE TABLE token_properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_id INTEGER NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
  property TEXT NOT NULL,        -- 'x', 'y', 'blur', 'spread', 'opacity'
  value TEXT NOT NULL,
  value_number REAL,
  value_unit TEXT
);

CREATE INDEX idx_token_properties_token ON token_properties(token_id);

-- Full-text search for tokens
CREATE VIRTUAL TABLE tokens_fts USING fts5(
  name, path, description,
  content='tokens',
  content_rowid='id'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER tokens_ai AFTER INSERT ON tokens BEGIN
  INSERT INTO tokens_fts(rowid, name, path, description)
  VALUES (new.id, new.name, new.path, new.description);
END;

-- Components
CREATE TABLE components (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,     -- 'MButton'
  slug TEXT NOT NULL,            -- 'button'
  category TEXT,                 -- 'form', 'navigation', etc.
  description TEXT,
  frameworks TEXT                -- JSON array: ["vue", "react"]
);

CREATE INDEX idx_components_category ON components(category);

-- Component Props
CREATE TABLE component_props (
  id INTEGER PRIMARY KEY,
  component_id INTEGER REFERENCES components(id),
  name TEXT NOT NULL,
  type TEXT,                     -- 'string', 'boolean', 'number'
  default_value TEXT,
  required BOOLEAN DEFAULT FALSE,
  options TEXT,                  -- JSON array for enum types
  description TEXT
);

-- Component Slots
CREATE TABLE component_slots (
  id INTEGER PRIMARY KEY,
  component_id INTEGER REFERENCES components(id),
  name TEXT NOT NULL,
  description TEXT
);

-- Component Events
CREATE TABLE component_events (
  id INTEGER PRIMARY KEY,
  component_id INTEGER REFERENCES components(id),
  name TEXT NOT NULL,
  payload TEXT,
  description TEXT
);

-- Component Examples
CREATE TABLE component_examples (
  id INTEGER PRIMARY KEY,
  component_id INTEGER REFERENCES components(id),
  framework TEXT NOT NULL,
  title TEXT,
  code TEXT NOT NULL,
  description TEXT
);

-- Component CSS Classes
CREATE TABLE component_css_classes (
  id INTEGER PRIMARY KEY,
  component_id INTEGER REFERENCES components(id),
  class_name TEXT NOT NULL
);

-- CSS Utilities (layouts & spacing - separate from framework components)
CREATE TABLE css_utilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL,
  category TEXT NOT NULL,         -- 'layout', 'utility'
  description TEXT
);

CREATE INDEX idx_css_utilities_category ON css_utilities(category);

-- CSS Utility Classes
CREATE TABLE css_utility_classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  utility_id INTEGER REFERENCES css_utilities(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL
);

-- CSS Utility Examples
CREATE TABLE css_utility_examples (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  utility_id INTEGER REFERENCES css_utilities(id) ON DELETE CASCADE,
  title TEXT,
  code TEXT NOT NULL
);

-- Documentation
CREATE TABLE documentation (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  path TEXT NOT NULL UNIQUE,     -- URL path: '/components/button'
  content TEXT NOT NULL,         -- Full markdown content
  category TEXT,
  keywords TEXT                  -- JSON array for search
);

-- Full-text search for documentation
CREATE VIRTUAL TABLE docs_fts USING fts5(
  title, content,
  content='documentation',
  content_rowid='id'
);

-- Style Guides (hand-authored composed-pattern catalog, source: style-guides/<slug>/meta.json)
-- Small, browse-only table: no FTS table (list_style_guides only filters by category/site).
CREATE TABLE style_guides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,      -- 'modal-confirm', 'cascading-column-browser'
  name TEXT NOT NULL,
  category TEXT NOT NULL,         -- pattern shape: 'modal-confirm', 'nav-header', 'search-filter',
                                   -- 'data-table', 'master-detail', 'calendar-view',
                                   -- 'onboarding-stepper', 'cascading-column-browser', 'form'
  site TEXT,                      -- source app the screenshot was captured from, e.g. 'elo', 'sop'
  description TEXT NOT NULL,
  components TEXT,                -- JSON array of component slugs, e.g. '["button","modal","textinput"]'
  image_path TEXT NOT NULL        -- Relative path to style-guides/<slug>/screenshot.png
);

CREATE INDEX idx_style_guides_category ON style_guides(category);
CREATE INDEX idx_style_guides_site ON style_guides(site);
```

---

## Building and Refreshing the Database

```bash
pnpm build             # tsc + scripts/build-index.ts
pnpm database:sanity   # scripts/sanity-check.ts
```

`build-index.ts`:

1. Clones or pulls the 5 source repos into `repos/` (the 4 private ones need GitHub access)
2. Parses tokens, Vue/React/Web Components/Freemarker components, icons, CSS utilities, docs, and `style-guides/`
3. Recreates `data/mozaic.db` from scratch

There is no fallback dataset: a missing repo or an empty parse result fails the build.

### Database Contents

- **Tokens**: 586 (color 482, typography 60, spacing 19, screen 12, grid 4, border 3, radius 3, shadow 3)
- **Components**: 191 (Vue 79, React 39, Web Components 33, Freemarker 40; 137 distinct slugs)
- **Icons**: 1,473 (354 unique, 15 types, sizes 16/24/32/48/64)
- **CSS utilities**: 6 (Flexy, Container, Margin, Padding, Ratio, Scroll)
- **Docs**: 309 (220 design-system, 86 Vue Storybook, 3 React Storybook)
- **Style guides**: 16

### Where the Database Is Used

- `data/mozaic.db`: shipped in the npm package, read by the stdio MCP server and the HTTP server
- `~/.mozaic/mozaic.db` (override `MOZAIC_DB_PATH`): copy used by the skills' scripts, installed by `npx -y -p mozaic-mcp-server@2 mozaic-db`

---

## Running Locally

Agents run the published server with `npx -y mozaic-mcp-server@2` (install: `npx add-mcp mozaic-mcp-server@2 --name mozaic`, see [README.md](../README.md)). To test a local build, point your agent's MCP config at it, keeping the name `mozaic`:

```json
{
  "mcpServers": {
    "mozaic": {
      "command": "node",
      "args": ["/absolute/path/to/adeo-mozaic-mcp/dist/index.js"]
    }
  }
}
```

---

## CI/CD

Workflows in `.github/workflows/`:

| Workflow | What it does |
| -------- | ------------ |
| `test.yml` | Lint + format check; test job rebuilds the DB only if the `MOZAIC_REPOS_TOKEN` secret is set, then runs sanity check + tests |
| `refresh-db.yml` | Daily 04:00 UTC rebuild (temporary); commits `data/mozaic.db` if changed, which triggers a release |
| `release.yml` | semantic-release on `main` |
| `publish.yml` | On GitHub release: npm publish with provenance, then MCP Registry publish (`mcp-publisher`, GitHub OIDC) |
| `deploy-docs.yml` | Deploys `website/` to GitHub Pages |

---

## Debugging

The stdio server accepts `--debug`, which logs startup, DB init, tool calls and errors to `mcp-server.log` at the package root:

```bash
pnpm start:debug        # or: node dist/index.js --debug
```

Add `"--debug"` to the `args` of your agent's MCP config to debug a real session.

### Common Issues

- **`NODE_MODULE_VERSION` mismatch**: `better-sqlite3` was built for another Node version. Use Node 25 and run `pnpm rebuild` (or reinstall `node_modules`).
- **`Database not found at .../data/mozaic.db`**: run `pnpm build`.
- **Server not connecting**: check `mcp-server.log`, the path in your MCP config, that `dist/` exists, then restart the agent.

---

## Testing

See [TEST.md](./TEST.md): `pnpm test` (vitest), `pnpm database:sanity`.

---

## Resources

- [MCP SDK Documentation](https://modelcontextprotocol.io/docs)
- [Agent Skills spec](https://agentskills.io/specification)
- [Mozaic Documentation](https://mozaic.adeo.cloud/)
- [Style Dictionary](https://amzn.github.io/style-dictionary/) (token build tool used by Mozaic)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
