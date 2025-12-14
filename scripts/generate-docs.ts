#!/usr/bin/env tsx

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, "..");
const DOC_DIR = join(PROJECT_ROOT, "docs");
const ASSETS_DIR = join(DOC_DIR, "assets");
const DB_PATH = join(PROJECT_ROOT, "data", "mozaic.db");

interface DbStats {
  tokens: number;
  components: number;
  documentation: number;
  vueComponents: number;
  reactComponents: number;
  vueExamples: number;
  reactExamples: number;
  categories: Array<{ category: string; count: number }>;
  tokenCategories: Array<{ category: string; count: number }>;
}

function getDbStats(): DbStats | null {
  if (!existsSync(DB_PATH)) {
    console.log("Database not found. Run 'pnpm build:index' first.");
    return null;
  }

  const db = new Database(DB_PATH, { readonly: true });

  const tokens = db.prepare("SELECT COUNT(*) as count FROM tokens").get() as { count: number };
  const components = db.prepare("SELECT COUNT(*) as count FROM components").get() as { count: number };
  const docs = db.prepare("SELECT COUNT(*) as count FROM documentation").get() as { count: number };

  const vueComponents = db.prepare(
    "SELECT COUNT(*) as count FROM components WHERE frameworks LIKE '%vue%'"
  ).get() as { count: number };

  const reactComponents = db.prepare(
    "SELECT COUNT(*) as count FROM components WHERE frameworks LIKE '%react%'"
  ).get() as { count: number };

  const vueExamples = db.prepare(
    "SELECT COUNT(*) as count FROM component_examples WHERE framework = 'vue'"
  ).get() as { count: number };

  const reactExamples = db.prepare(
    "SELECT COUNT(*) as count FROM component_examples WHERE framework = 'react'"
  ).get() as { count: number };

  const categories = db.prepare(
    "SELECT category, COUNT(*) as count FROM components GROUP BY category ORDER BY count DESC"
  ).all() as Array<{ category: string; count: number }>;

  const tokenCategories = db.prepare(
    "SELECT category, COUNT(*) as count FROM tokens GROUP BY category ORDER BY count DESC"
  ).all() as Array<{ category: string; count: number }>;

  db.close();

  return {
    tokens: tokens.count,
    components: components.count,
    documentation: docs.count,
    vueComponents: vueComponents.count,
    reactComponents: reactComponents.count,
    vueExamples: vueExamples.count,
    reactExamples: reactExamples.count,
    categories,
    tokenCategories,
  };
}

function generateArchitectureDiagram(): string {
  return `---
title: Mozaic MCP Server - Architecture Overview
---
flowchart TB
    subgraph Client["Claude Desktop / MCP Client"]
        CD[Claude Desktop]
    end

    subgraph MCP["Mozaic MCP Server"]
        direction TB
        Server[MCP Server<br/>src/index.ts]

        subgraph Tools["MCP Tools"]
            T1[get_design_tokens]
            T2[get_component_info]
            T3[list_components]
            T4[generate_vue_component]
            T5[generate_react_component]
            T6[search_documentation]
        end

        Server --> Tools
    end

    subgraph Data["Data Layer"]
        DB[(SQLite Database<br/>data/mozaic.db)]
        Queries[db/queries.ts]
    end

    subgraph Sources["Source Repositories"]
        DS[mozaic-design-system<br/>Tokens + Docs]
        VUE[mozaic-vue<br/>Vue Components]
        REACT[mozaic-react<br/>React Components]
    end

    CD <-->|stdio| Server
    Tools --> Queries
    Queries --> DB

    DS -.->|build:index| DB
    VUE -.->|build:index| DB
    REACT -.->|build:index| DB
`;
}

function generateDataFlowDiagram(): string {
  return `---
title: Data Flow - Index Building
---
flowchart LR
    subgraph Repos["Git Repositories"]
        R1[mozaic-design-system]
        R2[mozaic-vue]
        R3[mozaic-react]
    end

    subgraph Parsers["Parsers"]
        P1[tokens-parser.ts]
        P2[vue-parser.ts]
        P3[react-parser.ts]
        P4[docs-parser.ts]
    end

    subgraph Data["Extracted Data"]
        D1[Design Tokens<br/>colors, spacing, typography]
        D2[Vue Components<br/>props, slots, events, examples]
        D3[React Components<br/>props, callbacks, examples]
        D4[Documentation<br/>MDX content, frontmatter]
    end

    subgraph DB["SQLite Database"]
        T1[(tokens)]
        T2[(components)]
        T3[(component_props)]
        T4[(component_slots)]
        T5[(component_events)]
        T6[(component_examples)]
        T7[(documentation)]
        T8[(documentation_fts)]
    end

    R1 --> P1 --> D1 --> T1
    R1 --> P4 --> D4 --> T7 --> T8
    R2 --> P2 --> D2 --> T2
    R3 --> P3 --> D3 --> T2

    D2 --> T3 & T4 & T5 & T6
    D3 --> T3 & T5 & T6
`;
}

function generateDatabaseSchema(): string {
  return `---
title: Database Schema
---
erDiagram
    tokens {
        int id PK
        string category
        string path
        string value
        string description
        string platform
    }

    components {
        int id PK
        string name UK
        string slug
        string category
        string description
        string frameworks
    }

    component_props {
        int id PK
        int component_id FK
        string name
        string type
        string default_value
        bool required
        string options
        string description
    }

    component_slots {
        int id PK
        int component_id FK
        string name
        string description
    }

    component_events {
        int id PK
        int component_id FK
        string name
        string payload
        string description
    }

    component_examples {
        int id PK
        int component_id FK
        string framework
        string title
        string code
    }

    documentation {
        int id PK
        string title
        string path UK
        string content
        string category
        string keywords
    }

    documentation_fts {
        string title
        string content
        string keywords
    }

    components ||--o{ component_props : has
    components ||--o{ component_slots : has
    components ||--o{ component_events : has
    components ||--o{ component_examples : has
`;
}

function generateToolsDiagram(): string {
  return `---
title: MCP Tools
---
flowchart TB
    subgraph TokenTools["Design Token Tools"]
        GT[get_design_tokens]
        GT -->|category| GTO1[colors]
        GT -->|category| GTO2[typography]
        GT -->|category| GTO3[spacing]
        GT -->|category| GTO4[shadows]
        GT -->|category| GTO5[borders]
        GT -->|format| GTF1[json/scss/css/js]
    end

    subgraph ComponentTools["Component Tools"]
        GC[get_component_info]
        LC[list_components]
        GVC[generate_vue_component]
        GRC[generate_react_component]

        GC -->|input| GCI[component name + framework]
        LC -->|filter| LCF[category filter]
        GVC -->|input| GVCI[component + props + children]
        GRC -->|input| GRCI[component + props + children]
    end

    subgraph DocTools["Documentation Tools"]
        SD[search_documentation]
        SD -->|FTS5| SDR[Full-text search]
    end
`;
}

function generateSequenceDiagram(): string {
  return `---
title: Request Flow
---
sequenceDiagram
    participant User
    participant Claude as Claude Desktop
    participant MCP as MCP Server
    participant DB as SQLite DB

    User->>Claude: "Show me the Button component"
    Claude->>MCP: get_component_info(component: "button")
    MCP->>DB: SELECT * FROM components WHERE slug = 'button'
    DB-->>MCP: Component data
    MCP->>DB: SELECT * FROM component_props WHERE component_id = ?
    DB-->>MCP: Props data
    MCP->>DB: SELECT * FROM component_examples WHERE component_id = ?
    DB-->>MCP: Examples data
    MCP-->>Claude: Formatted component info
    Claude-->>User: Button component documentation

    User->>Claude: "Generate a Vue button with primary theme"
    Claude->>MCP: generate_vue_component(component: "button", props: {theme: "primary"})
    MCP->>DB: Get component info for validation
    DB-->>MCP: Component data
    MCP-->>Claude: Generated Vue code
    Claude-->>User: Vue component code snippet
`;
}

function generateProjectStructure(): string {
  return `---
title: Project Structure
---
flowchart TB
    subgraph Root["mozaic-mcp-server/"]
        direction TB

        subgraph Scripts["scripts/"]
            BI[build-index.ts]
            GD[generate-docs.ts]
        end

        subgraph Src["src/"]
            direction TB
            Index[index.ts<br/>MCP Server Entry]

            subgraph DbDir["db/"]
                Queries[queries.ts]
            end

            subgraph ParsersDir["parsers/"]
                TP[tokens-parser.ts]
                VP[vue-parser.ts]
                RP[react-parser.ts]
                DP[docs-parser.ts]
            end

            subgraph ToolsDir["tools/"]
                T1[get-design-tokens.ts]
                T2[get-component-info.ts]
                T3[list-components.ts]
                T4[generate-vue-component.ts]
                T5[generate-react-component.ts]
                T6[search-documentation.ts]
            end
        end

        subgraph DataDir["data/"]
            DB[(mozaic.db)]
        end

        subgraph ReposDir["repos/"]
            R1[mozaic-design-system/]
            R2[mozaic-vue/]
            R3[mozaic-react/]
        end

        subgraph DocDir["doc/"]
            MD[*.mmd diagrams]
        end
    end

    Index --> ToolsDir
    ToolsDir --> DbDir
    DbDir --> DataDir
    BI --> ParsersDir
    ParsersDir --> DataDir
    BI --> ReposDir
`;
}

function generateComponentsCategoryPie(stats: DbStats): string {
  return `---
title: Components by Category
---
pie showData
${stats.categories.map(c => `    "${c.category}" : ${c.count}`).join("\n")}
`;
}

function generateTokensCategoryPie(stats: DbStats): string {
  return `---
title: Tokens by Category
---
pie showData
${stats.tokenCategories.map(c => `    "${c.category}" : ${c.count}`).join("\n")}
`;
}

function generateStatsSummary(stats: DbStats): string {
  return `---
title: Database Statistics Summary
---
flowchart LR
    subgraph Tokens["Tokens: ${stats.tokens}"]
        direction TB
${stats.tokenCategories.map(c => `        T_${c.category.replace(/[^a-zA-Z]/g, "")}["${c.category}: ${c.count}"]`).join("\n")}
    end

    subgraph Components["Components: ${stats.components}"]
        direction TB
        Vue["Vue: ${stats.vueComponents}"]
        React["React: ${stats.reactComponents}"]
    end

    subgraph Examples["Examples: ${stats.vueExamples + stats.reactExamples}"]
        direction TB
        VueEx["Vue: ${stats.vueExamples}"]
        ReactEx["React: ${stats.reactExamples}"]
    end

    subgraph Docs["Documentation"]
        DocPages["${stats.documentation} pages"]
    end

    Tokens --> Components --> Examples --> Docs
`;
}

function generateFullDiagram(stats: DbStats | null): string {
  const timestamp = new Date().toISOString().split("T")[0];

  let diagram = `%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#5C57E0'}}}%%
---
title: Mozaic MCP Server - Complete Architecture (${timestamp})
---
flowchart TB
    %% Main Architecture
    subgraph Client["Claude Desktop / MCP Client"]
        CD[Claude Desktop]
    end

    subgraph MCP["Mozaic MCP Server"]
        direction TB
        Server[MCP Server<br/>src/index.ts]

        subgraph Tools["MCP Tools"]
            direction LR
            T1[get_design_tokens]
            T2[get_component_info]
            T3[list_components]
            T4[generate_vue_component]
            T5[generate_react_component]
            T6[search_documentation]
        end

        Server --> Tools
    end

    subgraph DataLayer["Data Layer"]
        direction TB
        Queries[db/queries.ts]
        DB[(SQLite Database<br/>data/mozaic.db)]
        Queries --> DB
    end

    subgraph Parsers["Parsers"]
        direction LR
        P1[tokens-parser]
        P2[vue-parser]
        P3[react-parser]
        P4[docs-parser]
    end

    subgraph Sources["Source Repositories (ADEO)"]
        direction LR
        DS[mozaic-design-system]
        VUE[mozaic-vue]
        REACT[mozaic-react]
    end
`;

  if (stats) {
    diagram += `
    subgraph Stats["Current Statistics"]
        direction TB
        S1["Tokens: ${stats.tokens}"]
        S2["Components: ${stats.components}"]
        S3["Vue: ${stats.vueComponents} + ${stats.vueExamples} examples"]
        S4["React: ${stats.reactComponents} + ${stats.reactExamples} examples"]
        S5["Documentation: ${stats.documentation} pages"]
    end
`;
  }

  diagram += `
    %% Connections
    CD <-->|"stdio"| Server
    Tools --> Queries

    DS --> P1 & P4
    VUE --> P2
    REACT --> P3
    P1 & P2 & P3 & P4 -.->|"build:index"| DB
`;

  return diagram;
}

async function generateImages(diagrams: Array<{ name: string; content: string }>): Promise<void> {
  console.log("\nGenerating SVG images with puppeteer...");

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Load mermaid from CDN
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
      </head>
      <body>
        <div id="container"></div>
        <script>
          mermaid.initialize({ startOnLoad: false, theme: 'default' });
        </script>
      </body>
    </html>
  `);

  // Wait for mermaid to load
  await page.waitForFunction("typeof window.mermaid !== 'undefined'");

  for (const { name, content } of diagrams) {
    const outputPath = join(ASSETS_DIR, `${name}.svg`);

    try {
      // Remove frontmatter (---title:...) as it's not supported in all diagram types
      const cleanContent = content.replace(/^---[\s\S]*?---\n?/m, "").trim();

      let svg = await page.evaluate(async (diagram: string, id: string) => {
        const container = document.getElementById("container")!;
        container.innerHTML = "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { svg } = await (window as any).mermaid.render(id, diagram);
        return svg;
      }, cleanContent, `diagram-${name}`);

      // Fix malformed HTML in SVG (mermaid outputs <br> instead of <br/>)
      svg = svg.replace(/<br>/g, "<br/>");

      // Set explicit width for better GitHub preview (remove max-width constraint)
      svg = svg.replace(/style="max-width:[^"]*"/, 'style="min-width: 800px"');
      // Add width attribute if not present
      if (!svg.includes('width="')) {
        svg = svg.replace('<svg ', '<svg width="100%" ');
      }

      writeFileSync(outputPath, svg);
      console.log(`  - ${name}.svg`);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.warn(`  - ${name}.svg (failed: ${err.message || "unknown error"})`);
    }
  }

  await browser.close();
}

function generateDocMd(stats: DbStats | null): string {
  const timestamp = new Date().toISOString().split("T")[0];

  let doc = `# Mozaic MCP Server - Architecture Documentation

> Auto-generated on ${timestamp}

`;

  if (stats) {
    doc += `## Current Statistics

| Metric | Count |
|--------|-------|
| Tokens | ${stats.tokens} |
| Components | ${stats.components} |
| Vue Components | ${stats.vueComponents} |
| React Components | ${stats.reactComponents} |
| Vue Examples | ${stats.vueExamples} |
| React Examples | ${stats.reactExamples} |
| Documentation | ${stats.documentation} |

`;
  }

  doc += `## Diagrams

### Architecture Overview
<img src="./assets/architecture.svg" width="100%" alt="Architecture">

### Project Structure
<img src="./assets/structure.svg" width="100%" alt="Structure">

### Data Flow
<img src="./assets/dataflow.svg" width="100%" alt="Data Flow">

### Database Schema
<img src="./assets/schema.svg" width="100%" alt="Schema">

### MCP Tools
<img src="./assets/tools.svg" width="100%" alt="Tools">

### Request Sequence
<img src="./assets/sequence.svg" width="100%" alt="Sequence">

### Complete Overview
<img src="./assets/full.svg" width="100%" alt="Full Architecture">

`;

  if (stats) {
    doc += `### Statistics

<img src="./assets/stats-components.svg" width="400" alt="Components by Category">
<img src="./assets/stats-tokens.svg" width="400" alt="Tokens by Category">
<img src="./assets/stats-summary.svg" width="100%" alt="Statistics Summary">
`;
  }

  return doc;
}

function generateRootReadme(stats: DbStats | null): string {
  let readme = `# Mozaic MCP Server

MCP (Model Context Protocol) server for the Mozaic Design System by ADEO. Provides Claude Desktop with access to design tokens, components, and documentation.

## Features

- **Design Tokens**: Colors, typography, spacing, shadows
- **Components**: Vue 3 and React component info with props, slots, events, examples
- **Documentation**: Full-text search across Mozaic docs
- **Code Generation**: Generate Vue/React component code snippets

## Quick Start

\`\`\`bash
pnpm install
pnpm build:index  # Clone repos & build database
pnpm build        # Compile TypeScript
pnpm start        # Start MCP server
\`\`\`

## Architecture

`;

  if (stats) {
    readme += `### Statistics Summary
<a href="./docs/doc.md">
  <img src="./docs/assets/stats-summary.svg" width="100%" alt="Statistics Summary">
</a>

`;
  }

  readme += `### Data Flow
<a href="./docs/doc.md">
  <img src="./docs/assets/dataflow.svg" width="100%" alt="Data Flow">
</a>

[View full documentation](./docs/doc.md)

## MCP Tools

| Tool | Description |
|------|-------------|
| \`get_design_tokens\` | Get design tokens (colors, typography, spacing) |
| \`get_component_info\` | Get component details (props, slots, events, examples) |
| \`list_components\` | List available components by category |
| \`generate_vue_component\` | Generate Vue component code |
| \`generate_react_component\` | Generate React component code |
| \`search_documentation\` | Full-text search Mozaic docs |

## License

MIT
`;

  return readme;
}

async function main(): Promise<void> {
  console.log("Generating Mermaid diagrams...\n");

  // Create docs directory
  if (!existsSync(DOC_DIR)) {
    mkdirSync(DOC_DIR, { recursive: true });
    console.log("Created docs/ directory");
  }

  // Get database stats
  const stats = getDbStats();
  if (stats) {
    console.log("Database stats loaded:");
    console.log(`  - Tokens: ${stats.tokens}`);
    console.log(`  - Components: ${stats.components}`);
    console.log(`  - Documentation: ${stats.documentation}`);
  }

  // Generate individual diagram files
  const diagrams: Array<{ name: string; content: string }> = [
    { name: "architecture", content: generateArchitectureDiagram() },
    { name: "structure", content: generateProjectStructure() },
    { name: "dataflow", content: generateDataFlowDiagram() },
    { name: "schema", content: generateDatabaseSchema() },
    { name: "tools", content: generateToolsDiagram() },
    { name: "sequence", content: generateSequenceDiagram() },
    { name: "full", content: generateFullDiagram(stats) },
  ];

  if (stats) {
    diagrams.push(
      { name: "stats-components", content: generateComponentsCategoryPie(stats) },
      { name: "stats-tokens", content: generateTokensCategoryPie(stats) },
      { name: "stats-summary", content: generateStatsSummary(stats) },
    );
  }

  // Create assets directory
  if (!existsSync(ASSETS_DIR)) {
    mkdirSync(ASSETS_DIR, { recursive: true });
    console.log("Created docs/assets/ directory");
  }

  console.log("Generated diagrams:");
  for (const { name, content } of diagrams) {
    const outputPath = join(ASSETS_DIR, `${name}.mmd`);
    writeFileSync(outputPath, content);
    console.log(`  - assets/${name}.mmd`);
  }

  // Generate SVG images from mermaid files
  await generateImages(diagrams);

  // Generate doc.md for docs folder
  const docMd = generateDocMd(stats);
  writeFileSync(join(DOC_DIR, "doc.md"), docMd);
  console.log("  - doc.md");

  // Generate root README.md
  const rootReadme = generateRootReadme(stats);
  writeFileSync(join(PROJECT_ROOT, "README.md"), rootReadme);
  console.log("  - README.md (root)");

  console.log(`\nAll files saved to: ${DOC_DIR}/`);
}

main().catch((error) => {
  console.error("Documentation generation failed:", error);
  process.exit(1);
});
