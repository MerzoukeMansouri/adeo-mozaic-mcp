# Mozaic Design System MCP Server

## Project Overview

An MCP (Model Context Protocol) server that exposes the **Mozaic Design System** (by ADEO) to Claude and other AI assistants. The MCP server provides intelligent access to design tokens, component documentation, code examples, and code generation capabilities.

## Source Repositories

### Primary Sources

| Repository               | URL                                            | Purpose                                   |
| ------------------------ | ---------------------------------------------- | ----------------------------------------- |
| **Main Design System**   | `https://github.com/adeo/mozaic-design-system` | Core tokens, styles, icons, documentation |
| **Vue Implementation**   | `https://github.com/adeo/mozaic-vue`           | Vue.js component library                  |
| **React Implementation** | `https://github.com/adeo/mozaic-react`         | React component library                   |
| **Documentation Site**   | `https://mozaic.adeo.cloud/`                   | Official documentation                    |
| **Vue Storybook**        | `https://adeo.github.io/mozaic-vue/`           | Vue component demos                       |

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

---

## Architecture

### Recommended Stack

- **Runtime**: Node.js 25+ (required for Claude Desktop compatibility)
- **Language**: TypeScript
- **Database**: SQLite (simple, portable, zero-config)
- **MCP SDK**: `@modelcontextprotocol/sdk`

### Project Structure

```
mozaic-mcp-server/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── tools/
│   │   ├── get-component-info.ts
│   │   ├── list-components.ts
│   │   ├── get-design-tokens.ts
│   │   ├── generate-component.ts
│   │   └── search-documentation.ts
│   ├── db/
│   │   ├── schema.ts         # SQLite schema
│   │   └── queries.ts        # Database queries
│   └── parsers/
│       ├── tokens-parser.ts  # Parse @mozaic-ds/tokens
│       ├── vue-parser.ts     # Parse Vue components
│       └── docs-parser.ts    # Parse markdown documentation
├── scripts/
│   └── build-index.ts        # Build-time indexing script
├── data/
│   └── mozaic.db             # SQLite database (generated)
├── package.json
└── tsconfig.json
```

---

## MCP Tools to Implement

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

---

## Data Extraction Strategy

### Phase 1: Clone and Parse Repositories

```bash
# Clone repositories
git clone https://github.com/adeo/mozaic-design-system.git
git clone https://github.com/adeo/mozaic-vue.git
git clone https://github.com/adeo/mozaic-react.git

# Install dependencies to access built tokens
cd mozaic-design-system && yarn install && yarn tokens:build
```

### Phase 2: Extract Design Tokens

**Token File Locations:**

```
mozaic-design-system/packages/tokens/
├── properties/           # Source JSON files
│   ├── color/
│   │   ├── base.json    # Primary/secondary colors
│   │   ├── font.json    # Text colors
│   │   └── button.json  # Component-specific colors
│   ├── size/
│   │   └── *.json
│   └── font/
│       └── *.json
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

```sql
-- Design Tokens
CREATE TABLE tokens (
  id INTEGER PRIMARY KEY,
  category TEXT NOT NULL,        -- 'color', 'spacing', 'typography'
  path TEXT NOT NULL,            -- 'color.primary-01.100'
  value TEXT NOT NULL,           -- '#78be20'
  description TEXT,
  platform TEXT DEFAULT 'all'    -- 'all', 'web', 'ios', 'android'
);

CREATE INDEX idx_tokens_category ON tokens(category);
CREATE INDEX idx_tokens_path ON tokens(path);

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

-- Component Examples
CREATE TABLE component_examples (
  id INTEGER PRIMARY KEY,
  component_id INTEGER REFERENCES components(id),
  framework TEXT NOT NULL,
  title TEXT,
  code TEXT NOT NULL,
  description TEXT
);

-- Documentation
CREATE TABLE documentation (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  path TEXT NOT NULL,            -- URL path: '/components/button'
  content TEXT NOT NULL,         -- Full markdown content
  category TEXT,
  keywords TEXT                  -- JSON array for search
);

CREATE VIRTUAL TABLE docs_fts USING fts5(
  title, content, keywords,
  content=documentation
);
```

---

## Building and Refreshing the Database

### How the Database is Created

The Mozaic MCP Server uses a SQLite database (`data/mozaic.db`) that contains all the design tokens, component information, and documentation. This database is built from the official Mozaic repositories.

### Available Scripts

To build or refresh the database, run:

```bash
npm run build:index
```

This script will:
1. **Clone repositories** from GitHub (or update them if they already exist):
   - `https://github.com/adeo/mozaic-design-system`
   - `https://github.com/adeo/mozaic-vue`
   - `https://github.com/adeo/mozaic-react`
2. **Extract and parse data**:
   - Design tokens from JSON files
   - Component props, slots/children, events, and examples (Vue and React)
   - Documentation from Markdown/MDX files
3. **Create a fresh SQLite database** at `data/mozaic.db`
   - The existing database is deleted and rebuilt from scratch
   - This ensures data consistency and removes any stale entries

### Database Contents

The database includes:
- **Design Tokens**: Colors, typography, spacing, shadows, borders
- **Components**: 40+ Mozaic components with their props, slots/children, events, and code examples for Vue and React
- **Documentation**: Searchable documentation content with full-text search support

### Fallback Behavior

If the GitHub repositories are unavailable or cannot be cloned, the build script will use fallback data to ensure a minimal working dataset:
- 23 sample design tokens
- 42 pre-defined Mozaic components (Vue and React compatible)
- 7 default documentation entries

### Database Location

The SQLite database file is stored at:
```
data/mozaic.db
```

Additional SQLite files may be present:
- `data/mozaic.db-wal` - Write-Ahead Log (for performance)
- `data/mozaic.db-shm` - Shared memory file (for concurrency)

---

## Build-Time Indexing Script

```typescript
// scripts/build-index.ts
import { parseTokens } from "../src/parsers/tokens-parser";
import { parseVueComponents } from "../src/parsers/vue-parser";
import { parseReactComponents } from "../src/parsers/react-parser";
import { parseDocumentation } from "../src/parsers/docs-parser";
import {
  initDatabase,
  insertTokens,
  insertComponents,
  insertDocs,
} from "../src/db/queries";

async function buildIndex() {
  console.log("🔧 Building Mozaic MCP index...");

  // Initialize SQLite database
  const db = await initDatabase("./data/mozaic.db");

  // Parse and index design tokens
  console.log("📦 Parsing design tokens...");
  const tokens = await parseTokens(
    "./repos/mozaic-design-system/packages/tokens"
  );
  await insertTokens(db, tokens);
  console.log(`   ✓ Indexed ${tokens.length} tokens`);

  // Parse and index Vue components
  console.log("🧩 Parsing Vue components...");
  const vueComponents = await parseVueComponents(
    "./repos/mozaic-vue/src/components"
  );
  await insertComponents(db, vueComponents);
  console.log(`   ✓ Indexed ${vueComponents.length} Vue components`);

  // Parse and index React components
  console.log("⚛️ Parsing React components...");
  const reactComponents = await parseReactComponents(
    "./repos/mozaic-react/src/components"
  );
  await insertComponents(db, reactComponents);
  console.log(`   ✓ Indexed ${reactComponents.length} React components`);

  // Parse and index documentation
  console.log("📚 Parsing documentation...");
  const docs = await parseDocumentation(
    "./repos/mozaic-design-system/src/docs"
  );
  await insertDocs(db, docs);
  console.log(`   ✓ Indexed ${docs.length} documentation pages`);

  console.log("✅ Index build complete!");
}

buildIndex().catch(console.error);
```

---

## MCP Server Implementation

```typescript
// src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import Database from "better-sqlite3";

const db = new Database("./data/mozaic.db", { readonly: true });

const server = new McpServer({
  name: "mozaic-design-system",
  version: "1.0.0",
});

// Register tools using McpServer.registerTool()
server.registerTool(
  "get_design_tokens",
  {
    description: "Get design tokens (colors, typography, spacing) from Mozaic",
    inputSchema: {
      category: z.enum(["colors", "typography", "spacing", "shadows", "borders", "all"])
        .describe("Token category to retrieve"),
      format: z.enum(["json", "scss", "css", "js"]).default("json")
        .describe("Output format"),
    },
  },
  async (args) => handleGetDesignTokens(db, args)
);

server.registerTool(
  "get_component_info",
  {
    description: "Get detailed information about a Mozaic component",
    inputSchema: {
      component: z.string().describe("Component name (e.g., button, modal)"),
      framework: z.enum(["vue", "react", "html"]).default("vue"),
    },
  },
  async (args) => handleGetComponentInfo(db, args)
);

server.registerTool(
  "list_components",
  {
    description: "List all available Mozaic components",
    inputSchema: {
      category: z.enum(["form", "navigation", "feedback", "layout", "data-display", "action", "all"])
        .default("all"),
    },
  },
  async (args) => handleListComponents(db, args)
);

server.registerTool(
  "generate_component",
  {
    description: "Generate component code using Mozaic design system",
    inputSchema: {
      component: z.string().describe("Component type to generate"),
      framework: z.enum(["vue", "react", "html"]),
      props: z.record(z.unknown()).optional(),
      children: z.string().optional(),
    },
  },
  async (args) => handleGenerateComponent(db, args)
);

server.registerTool(
  "search_documentation",
  {
    description: "Search Mozaic documentation",
    inputSchema: {
      query: z.string().describe("Search query"),
      limit: z.number().default(5),
    },
  },
  async (args) => handleSearchDocumentation(db, args)
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
```

---

## Component List to Index

Based on the Mozaic documentation, index these components:

### Form Components

- `MAutocomplete` - Autocomplete input
- `MCheckbox` - Checkbox input
- `MDatepicker` - Date picker
- `MDropdown` - Dropdown select
- `MField` - Form field wrapper
- `MFileUploader` - File upload
- `MPasswordInput` - Password input
- `MPhoneNumberInput` - Phone number input
- `MQuantitySelector` - Quantity selector
- `MRadio` - Radio button
- `MSelect` - Select dropdown
- `MTextArea` - Text area
- `MTextInput` - Text input
- `MToggle` - Toggle switch

### Navigation Components

- `MAccordion` - Accordion
- `MBreadcrumb` - Breadcrumb
- `MBuiltInMenu` - Built-in menu
- `MPagination` - Pagination
- `MSidebar` - Sidebar
- `MStepper` - Stepper
- `MTabs` - Tabs

### Feedback Components

- `MBadge` - Badge
- `MFlag` - Flag/Banner
- `MLoader` - Loading indicator
- `MModal` - Modal dialog
- `MNotification` - Notification
- `MProgressBar` - Progress bar
- `MTooltip` - Tooltip

### Layout Components

- `MCard` - Card
- `MDivider` - Divider
- `MLayer` - Layer/Overlay

### Action Components

- `MButton` - Button
- `MLink` - Link
- `MOptionButton` - Option button
- `MOptionCard` - Option card

### Data Display

- `MDataTable` - Data table
- `MHeading` - Heading
- `MHero` - Hero section
- `MListbox` - Listbox
- `MRatingStars` - Rating stars
- `MTag` - Tag

---

## Deployment Options

### Option 1: Local Development

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "mozaic": {
      "command": "node",
      "args": ["path/to/mozaic-mcp-server/dist/index.js"]
    }
  }
}
```

### Option 2: NPM Package

```bash
npm publish @your-org/mozaic-mcp-server
```

### Option 3: Docker

```dockerfile
FROM node:25-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
CMD ["node", "dist/index.js"]
```

---

## Debugging

### Enable Debug Mode

The MCP server supports a `--debug` flag that logs all server activity to a file. This is useful for troubleshooting issues with Claude Desktop.

**Enable debug mode in Claude Desktop config:**

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "mozaic": {
      "command": "node",
      "args": [
        "path/to/mozaic-mcp-server/dist/index.js",
        "--debug"
      ]
    }
  }
}
```

**Or run manually:**

```bash
# Start with debug logging
pnpm start:debug

# Or directly
node dist/index.js --debug
```

### Log File Location

When debug mode is enabled, logs are written to:

```
mcp-server.log
```

This file is located in the project root directory.

### Log Contents

The debug log includes:
- Server startup events
- Database initialization status
- Tool calls with input parameters
- Tool results (content length)
- Any errors encountered

**Example log output:**

```
[2024-12-14T02:30:00.000Z] === MCP Server Starting ===
[2024-12-14T02:30:00.001Z] Debug mode enabled: {"DEBUG":true,"argv":["node","dist/index.js","--debug"]}
[2024-12-14T02:30:00.002Z] Database path: {"dbPath":"/path/to/data/mozaic.db"}
[2024-12-14T02:30:00.010Z] Initializing database: {"path":"/path/to/data/mozaic.db"}
[2024-12-14T02:30:00.015Z] Database initialized successfully
[2024-12-14T02:30:00.020Z] Connecting to stdio transport
[2024-12-14T02:30:00.025Z] Server connected and ready
[2024-12-14T02:30:05.100Z] Tool called: get_design_tokens: {"category":"colors","format":"json"}
[2024-12-14T02:30:05.150Z] Tool result: get_design_tokens: {"contentLength":1}
```

### Troubleshooting Common Issues

#### Node.js Version Mismatch

If you see an error like:

```
NODE_MODULE_VERSION X. This version of Node.js requires NODE_MODULE_VERSION Y.
```

This means the `better-sqlite3` native module was compiled for a different Node.js version than Claude Desktop uses.

**Solution:**

1. Check your Node version matches Claude Desktop (currently Node 25):
   ```bash
   node --version  # Should show v25.x.x
   ```

2. Reinstall dependencies:
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   pnpm build
   ```

3. Restart Claude Desktop

#### Database Not Found

If you see:

```
Database not found at /path/to/data/mozaic.db
```

**Solution:**

Run the database build script:

```bash
pnpm build:index
```

#### MCP Server Not Connecting

1. Check the log file for errors
2. Verify the path in `claude_desktop_config.json` is correct
3. Ensure the `dist/` folder exists (run `pnpm build`)
4. Restart Claude Desktop after config changes

---

## Testing Checklist

- [ ] `get_design_tokens` returns correct color values
- [ ] `get_component_info` returns props, slots, events for MButton
- [ ] `list_components` returns all 40+ components
- [ ] `generate_component` produces valid Vue/React code
- [ ] `search_documentation` returns relevant results
- [ ] SQLite database is portable and self-contained
- [ ] MCP server starts without errors
- [ ] Claude can successfully call all tools

---

## Next Steps

1. **Clone this spec** and start implementing the parsers
2. **Run the build script** to generate the SQLite index
3. **Test locally** with Claude Desktop
4. **Iterate** based on what queries are most useful

---

## Resources

- [MCP SDK Documentation](https://modelcontextprotocol.io/docs)
- [Mozaic Documentation](https://mozaic.adeo.cloud/)
- [Style Dictionary](https://amzn.github.io/style-dictionary/) (token build tool used by Mozaic)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) (recommended SQLite library)
