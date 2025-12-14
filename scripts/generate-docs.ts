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
  cssUtilities: number;
  cssUtilityClasses: number;
  documentation: number;
  vueComponents: number;
  reactComponents: number;
  vueExamples: number;
  reactExamples: number;
  categories: Array<{ category: string; count: number }>;
  tokenCategories: Array<{ category: string; count: number }>;
  tokenSubcategories: Array<{ category: string; subcategory: string; count: number }>;
  tokenProperties: number;
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

  const cssUtilities = db.prepare(
    "SELECT COUNT(*) as count FROM css_utilities"
  ).get() as { count: number };

  const cssUtilityClasses = db.prepare(
    "SELECT COUNT(*) as count FROM css_utility_classes"
  ).get() as { count: number };

  const categories = db.prepare(
    "SELECT category, COUNT(*) as count FROM components GROUP BY category ORDER BY count DESC"
  ).all() as Array<{ category: string; count: number }>;

  const tokenCategories = db.prepare(
    "SELECT category, COUNT(*) as count FROM tokens GROUP BY category ORDER BY count DESC"
  ).all() as Array<{ category: string; count: number }>;

  const tokenSubcategories = db.prepare(
    "SELECT category, subcategory, COUNT(*) as count FROM tokens WHERE subcategory IS NOT NULL GROUP BY category, subcategory ORDER BY category, count DESC"
  ).all() as Array<{ category: string; subcategory: string; count: number }>;

  const tokenProperties = db.prepare(
    "SELECT COUNT(*) as count FROM token_properties"
  ).get() as { count: number };

  db.close();

  return {
    tokens: tokens.count,
    components: components.count,
    cssUtilities: cssUtilities.count,
    cssUtilityClasses: cssUtilityClasses.count,
    documentation: docs.count,
    vueComponents: vueComponents.count,
    reactComponents: reactComponents.count,
    vueExamples: vueExamples.count,
    reactExamples: reactExamples.count,
    categories,
    tokenCategories,
    tokenSubcategories,
    tokenProperties: tokenProperties.count,
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
            T7[get_css_utility]
            T8[list_css_utilities]
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

    subgraph TokenParsers["Token Parsers"]
        TP[tokens-parser.ts<br/>orchestrator]
        TP1[color-parser]
        TP2[spacing-parser]
        TP3[shadow-parser]
        TP4[border-parser]
        TP5[screen-parser]
        TP6[typography-parser]
        TP7[grid-parser]
    end

    subgraph OtherParsers["Other Parsers"]
        P2[vue-parser.ts]
        P3[react-parser.ts]
        P4[docs-parser.ts]
        P5[scss-parser.ts]
    end

    subgraph Data["Extracted Data"]
        D1[Design Tokens<br/>colors, spacing, typography,<br/>shadows, borders, screens, grid]
        D2[Vue Components<br/>props, slots, events, examples]
        D3[React Components<br/>props, callbacks, examples]
        D4[Documentation<br/>MDX content, frontmatter]
        D5[CSS Utilities<br/>Flexy, Margin, Padding, etc.]
    end

    subgraph DB["SQLite Database"]
        T1[(tokens)]
        T1P[(token_properties)]
        T1F[(tokens_fts)]
        T2[(components)]
        T3[(component_props)]
        T4[(component_slots)]
        T5[(component_events)]
        T6[(component_examples)]
        T7[(documentation)]
        T8[(docs_fts)]
        CU[(css_utilities)]
        CUC[(css_utility_classes)]
        CUE[(css_utility_examples)]
    end

    R1 --> TP
    TP --> TP1 & TP2 & TP3 & TP4 & TP5 & TP6 & TP7
    TP1 & TP2 & TP3 & TP4 & TP5 & TP6 & TP7 --> D1
    D1 --> T1
    T1 --> T1P & T1F

    R1 --> P4 --> D4 --> T7 --> T8
    R1 --> P5 --> D5 --> CU
    CU --> CUC & CUE
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
        string subcategory
        string name
        string path UK
        string css_variable
        string scss_variable
        string value_raw
        float value_number
        string value_unit
        string value_computed
        string description
        string platform
        string source_file
    }

    token_properties {
        int id PK
        int token_id FK
        string property
        string value
        float value_number
        string value_unit
    }

    tokens_fts {
        string name
        string path
        string description
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

    css_utilities {
        int id PK
        string name UK
        string slug
        string category
        string description
    }

    css_utility_classes {
        int id PK
        int utility_id FK
        string class_name
    }

    css_utility_examples {
        int id PK
        int utility_id FK
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

    docs_fts {
        string title
        string content
        string keywords
    }

    tokens ||--o{ token_properties : has
    components ||--o{ component_props : has
    components ||--o{ component_slots : has
    components ||--o{ component_events : has
    components ||--o{ component_examples : has
    css_utilities ||--o{ css_utility_classes : has
    css_utilities ||--o{ css_utility_examples : has
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
        GT -->|category| GTO6[screens]
        GT -->|category| GTO7[grid]
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

    subgraph CssTools["CSS Utility Tools"]
        GCU[get_css_utility]
        LCU[list_css_utilities]

        GCU -->|input| GCUI[utility name]
        LCU -->|filter| LCUF[layout / utility]
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
                Schema[schema.ts]
                Queries[queries.ts]
            end

            subgraph ParsersDir["parsers/"]
                TP[tokens-parser.ts]
                VP[vue-parser.ts]
                RP[react-parser.ts]
                DP[docs-parser.ts]
                SP[scss-parser.ts]

                subgraph TokensDir["tokens/"]
                    TTypes[types.ts]
                    TColor[color-parser.ts]
                    TSpacing[spacing-parser.ts]
                    TShadow[shadow-parser.ts]
                    TBorder[border-parser.ts]
                    TScreen[screen-parser.ts]
                    TTypo[typography-parser.ts]
                    TGrid[grid-parser.ts]
                end
            end

            subgraph ToolsDir["tools/"]
                T1[get-design-tokens.ts]
                T2[get-component-info.ts]
                T3[list-components.ts]
                T4[generate-vue-component.ts]
                T5[generate-react-component.ts]
                T6[search-documentation.ts]
                T7[get-css-utility.ts]
                T8[list-css-utilities.ts]
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

        subgraph DocDir["docs/"]
            MD[doc.md + assets/]
        end
    end

    Index --> ToolsDir
    ToolsDir --> DbDir
    DbDir --> DataDir
    BI --> ParsersDir
    TP --> TokensDir
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
        T_Props["composite properties: ${stats.tokenProperties}"]
    end

    subgraph Components["Components: ${stats.components}"]
        direction TB
        Vue["Vue: ${stats.vueComponents}"]
        React["React: ${stats.reactComponents}"]
    end

    subgraph CssUtils["CSS Utilities: ${stats.cssUtilities}"]
        direction TB
        CssClasses["${stats.cssUtilityClasses} classes"]
    end

    subgraph Examples["Examples: ${stats.vueExamples + stats.reactExamples}"]
        direction TB
        VueEx["Vue: ${stats.vueExamples}"]
        ReactEx["React: ${stats.reactExamples}"]
    end

    subgraph Docs["Documentation"]
        DocPages["${stats.documentation} pages"]
    end

    Tokens --> Components --> CssUtils --> Examples --> Docs
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
            T7[get_css_utility]
            T8[list_css_utilities]
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
        P5[scss-parser]
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
        S5["CSS Utilities: ${stats.cssUtilities} (${stats.cssUtilityClasses} classes)"]
        S6["Documentation: ${stats.documentation} pages"]
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
      // Also add white background for better visibility
      svg = svg.replace(/style="max-width:[^"]*"/, 'style="min-width: 800px; background-color: white"');
      // Add width attribute and background if not present
      if (!svg.includes('width="')) {
        svg = svg.replace('<svg ', '<svg width="100%" style="background-color: white" ');
      }
      // Ensure background-color is set even if style already exists but without background
      if (!svg.includes('background-color')) {
        svg = svg.replace(/style="([^"]*)"/, 'style="$1; background-color: white"');
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
>
> For detailed development guide, database schema, and implementation specs, see [DEVELOPMENT.md](./DEVELOPMENT.md).

`;

  if (stats) {
    doc += `## Current Statistics

| Metric | Count |
|--------|-------|
| **Tokens** | ${stats.tokens} |
| Token Properties (composite) | ${stats.tokenProperties} |
| **Components** | ${stats.components} |
| Vue Components | ${stats.vueComponents} |
| React Components | ${stats.reactComponents} |
| Vue Examples | ${stats.vueExamples} |
| React Examples | ${stats.reactExamples} |
| **CSS Utilities** | ${stats.cssUtilities} |
| CSS Utility Classes | ${stats.cssUtilityClasses} |
| **Documentation** | ${stats.documentation} |

### Token Categories

| Category | Count |
|----------|-------|
${stats.tokenCategories.map(c => `| ${c.category} | ${c.count} |`).join("\n")}

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

  // Generate ARCHITECTURE.md only (README.md is maintained separately)
  const docMd = generateDocMd(stats);
  writeFileSync(join(DOC_DIR, "ARCHITECTURE.md"), docMd);
  console.log("  - ARCHITECTURE.md");

  console.log(`\nAll files saved to: ${DOC_DIR}/`);
}

main().catch((error) => {
  console.error("Documentation generation failed:", error);
  process.exit(1);
});
