#!/usr/bin/env tsx

import Database from "better-sqlite3";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";

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
  wcComponents: number;
  freemarkerComponents: number;
  vueExamples: number;
  reactExamples: number;
  wcExamples: number;
  styleGuides: number;
  vueDocs: number;
  reactDocs: number;
  designSystemDocs: number;
  icons: number;
  iconTypes: Array<{ type: string; count: number }>;
  categories: Array<{ category: string; count: number }>;
  tokenCategories: Array<{ category: string; count: number }>;
  tokenSubcategories: Array<{ category: string; subcategory: string; count: number }>;
  tokenProperties: number;
}

function getDbStats(): DbStats | null {
  if (!existsSync(DB_PATH)) {
    console.log("Database not found. Run 'pnpm build' first.");
    return null;
  }

  const db = new Database(DB_PATH, { readonly: true });

  const tokens = db.prepare("SELECT COUNT(*) as count FROM tokens").get() as { count: number };
  const components = db.prepare("SELECT COUNT(*) as count FROM components").get() as {
    count: number;
  };
  const docs = db.prepare("SELECT COUNT(*) as count FROM documentation").get() as { count: number };

  const vueComponents = db
    .prepare("SELECT COUNT(*) as count FROM components WHERE frameworks LIKE '%vue%'")
    .get() as { count: number };

  const reactComponents = db
    .prepare("SELECT COUNT(*) as count FROM components WHERE frameworks LIKE '%react%'")
    .get() as { count: number };

  const count = (sql: string): number => (db.prepare(sql).get() as { count: number }).count;
  const wcComponents = count(
    "SELECT COUNT(*) as count FROM components WHERE frameworks LIKE '%webcomponents%'"
  );
  const freemarkerComponents = count(
    "SELECT COUNT(*) as count FROM components WHERE frameworks LIKE '%freemarker%'"
  );
  const wcExamples = count(
    "SELECT COUNT(*) as count FROM component_examples WHERE framework = 'webcomponents'"
  );
  const styleGuides = count("SELECT COUNT(*) as count FROM style_guides");

  const vueExamples = db
    .prepare("SELECT COUNT(*) as count FROM component_examples WHERE framework = 'vue'")
    .get() as { count: number };

  const reactExamples = db
    .prepare("SELECT COUNT(*) as count FROM component_examples WHERE framework = 'react'")
    .get() as { count: number };

  const cssUtilities = db.prepare("SELECT COUNT(*) as count FROM css_utilities").get() as {
    count: number;
  };

  const cssUtilityClasses = db
    .prepare("SELECT COUNT(*) as count FROM css_utility_classes")
    .get() as { count: number };

  const categories = db
    .prepare(
      "SELECT category, COUNT(*) as count FROM components GROUP BY category ORDER BY count DESC"
    )
    .all() as Array<{ category: string; count: number }>;

  const tokenCategories = db
    .prepare("SELECT category, COUNT(*) as count FROM tokens GROUP BY category ORDER BY count DESC")
    .all() as Array<{ category: string; count: number }>;

  const tokenSubcategories = db
    .prepare(
      "SELECT category, subcategory, COUNT(*) as count FROM tokens WHERE subcategory IS NOT NULL GROUP BY category, subcategory ORDER BY category, count DESC"
    )
    .all() as Array<{ category: string; subcategory: string; count: number }>;

  const tokenProperties = db.prepare("SELECT COUNT(*) as count FROM token_properties").get() as {
    count: number;
  };

  const vueDocs = db
    .prepare("SELECT COUNT(*) as count FROM documentation WHERE category = 'vue-docs'")
    .get() as { count: number };

  const reactDocs = db
    .prepare("SELECT COUNT(*) as count FROM documentation WHERE category = 'react-docs'")
    .get() as { count: number };

  const designSystemDocs = db
    .prepare(
      "SELECT COUNT(*) as count FROM documentation WHERE category NOT IN ('vue-docs', 'react-docs')"
    )
    .get() as { count: number };

  const icons = db.prepare("SELECT COUNT(*) as count FROM icons").get() as { count: number };

  const iconTypes = db
    .prepare("SELECT type, COUNT(*) as count FROM icons GROUP BY type ORDER BY count DESC")
    .all() as Array<{ type: string; count: number }>;

  db.close();

  return {
    tokens: tokens.count,
    components: components.count,
    cssUtilities: cssUtilities.count,
    cssUtilityClasses: cssUtilityClasses.count,
    documentation: docs.count,
    vueComponents: vueComponents.count,
    reactComponents: reactComponents.count,
    wcComponents,
    freemarkerComponents,
    vueExamples: vueExamples.count,
    reactExamples: reactExamples.count,
    wcExamples,
    styleGuides,
    vueDocs: vueDocs.count,
    reactDocs: reactDocs.count,
    designSystemDocs: designSystemDocs.count,
    icons: icons.count,
    iconTypes,
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
    subgraph Agents["Coding agents / MCP clients"]
        AG[Claude Code, Codex, Cursor,<br/>Copilot, Gemini CLI, ...]
    end

    WEB[Web tools<br/>e.g. v0]

    subgraph Skills["Agent Skills (8) - skills/&lt;name&gt;/SKILL.md"]
        SK7[7 builder/reference skills<br/>bash scripts + sqlite3]
        SKSG[mozaic-style-guide<br/>uses MCP tools]
    end

    subgraph Stdio["MCP server (stdio) - src/index.ts"]
        Tools[19 MCP tools<br/>src/tools/]
        Queries[db/queries.ts]
        Tools --> Queries
    end

    subgraph Http["HTTP server (NestJS) - src/main.ts<br/>Bearer AUTH_TOKEN"]
        MCPR[POST /mcp<br/>JSON-RPC, 19 tools]
        LIGHT[POST /mcp/light<br/>7 light tools]
    end

    DB[(data/mozaic.db<br/>SQLite)]
    HOMEDB[(~/.mozaic/mozaic.db<br/>copy via mozaic-db)]

    AG -->|loads| Skills
    AG <-->|stdio<br/>npx -y mozaic-mcp-server@2| Stdio
    SK7 -->|sqlite3| HOMEDB
    SKSG -->|list/get_style_guide| Stdio
    WEB -->|HTTPS| Http
    MCPR -->|spawns + proxies| Stdio
    LIGHT -->|reads directly| DB
    Queries --> DB
    DB -.->|packaged| HOMEDB
`;
}

function generateDataFlowDiagram(): string {
  return `---
title: Data Flow - Index Building (scripts/build-index.ts)
---
flowchart LR
    subgraph Repos["Vendored repos (repos/)"]
        R1[mozaic-design-system]
        R2[mozaic-vue]
        R3[mozaic-react]
        R4[mozaic-web-components]
        R5[mozaic-freemarker]
    end
    R6[style-guides/&lt;slug&gt;/<br/>meta.json + screenshot.png<br/>hand-authored]

    subgraph Parsers["src/parsers/"]
        P1[tokens-parser<br/>+ tokens/*]
        P4[docs-parser]
        P5[scss-parser]
        P6[icons-parser]
        P2[vue-parser]
        P3[react-parser]
        P7[web-components-parser]
        P8[freemarker-parser]
    end

    BI[scripts/build-index.ts]

    subgraph DB["data/mozaic.db"]
        T1[(tokens<br/>token_properties)]
        T2[(components<br/>props, slots, events,<br/>examples, css_classes)]
        T3[(documentation<br/>docs_fts)]
        T4[(css_utilities<br/>classes, examples)]
        T5[(icons<br/>icons_fts)]
        T6[(style_guides)]
    end

    R1 --> P1 & P4 & P5 & P6
    R2 --> P2 & P4
    R3 --> P3 & P4
    R4 --> P7
    R5 --> P8
    Parsers --> BI
    R6 --> BI
    BI --> T1 & T2 & T3 & T4 & T5 & T6
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
        int required
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
        string description
    }

    component_css_classes {
        int id PK
        int component_id FK
        string class_name
        string description
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
        string path
        string content
        string category
        string keywords
    }

    icons {
        int id PK
        string name UK
        string icon_name
        string type
        int size
        string view_box
        string paths
    }

    style_guides {
        int id PK
        string slug UK
        string name
        string category
        string site
        string description
        string components
        string image_path
    }

    tokens ||--o{ token_properties : has
    components ||--o{ component_props : has
    components ||--o{ component_slots : has
    components ||--o{ component_events : has
    components ||--o{ component_examples : has
    components ||--o{ component_css_classes : has
    css_utilities ||--o{ css_utility_classes : has
    css_utilities ||--o{ css_utility_examples : has
`;
}

function generateToolsDiagram(): string {
  return `---
title: MCP Tools (19)
---
flowchart LR
    subgraph Tokens["Design Tokens"]
        GT[get_design_tokens]
    end

    subgraph Components["Components (Vue / React)"]
        GC[get_component_info]
        LC[list_components]
        GVC[generate_vue_component]
        GRC[generate_react_component]
    end

    subgraph WC["Web Components"]
        GWC[generate_webcomponent]
        GWCI[get_webcomponent_info]
        LWC[list_webcomponents]
    end

    subgraph FTL["Freemarker"]
        GF[generate_freemarker]
        GFI[get_freemarker_info]
        LF[list_freemarker]
    end

    subgraph Docs["Documentation"]
        SD[search_documentation<br/>FTS5]
    end

    subgraph Css["CSS Utilities"]
        GCU[get_css_utility]
        LCU[list_css_utilities]
    end

    subgraph Icons["Icons"]
        SI[search_icons]
        GI[get_icon]
    end

    subgraph SG["Style Guides"]
        LSG[list_style_guides]
        GSG[get_style_guide<br/>returns PNG image]
    end

    subgraph Install["Install"]
        GIN[get_install_info]
    end
`;
}

function generateSequenceDiagram(): string {
  return `---
title: Request Flow
---
sequenceDiagram
    participant User
    participant Agent as Coding agent (MCP client)
    participant MCP as MCP Server (stdio)
    participant DB as SQLite DB

    User->>Agent: "Show me the Button component"
    Agent->>MCP: get_component_info(component: "button")
    MCP->>DB: SELECT * FROM components WHERE slug = 'button'
    DB-->>MCP: Component data
    MCP->>DB: SELECT props, slots, events, examples
    DB-->>MCP: Details
    MCP-->>Agent: Formatted component info
    Agent-->>User: Button component documentation

    User->>Agent: "Generate a Vue button with primary theme"
    Agent->>MCP: generate_vue_component(component: "button", props: {theme: "primary"})
    MCP->>DB: Get component info for validation
    DB-->>MCP: Component data
    MCP-->>Agent: Generated Vue code
    Agent-->>User: Vue component code snippet
`;
}

function generateProjectStructure(): string {
  return `---
title: Project Structure
---
flowchart TB
    subgraph Root["mozaic-mcp-server/"]
        direction TB

        subgraph Bin["bin/"]
            B3[mozaic-db.js<br/>mozaic-db]
        end

        subgraph Src["src/"]
            Index[index.ts<br/>stdio MCP server]
            Main[main.ts<br/>NestJS HTTP server]
            McpDir[mcp/<br/>controllers + light]
            ToolsDir[tools/<br/>19 tools]
            DbDir[db/<br/>schema.ts, queries.ts]
            ParsersDir[parsers/<br/>+ tokens/]
            AuthDir[auth/, config/]
        end

        subgraph Scripts["scripts/"]
            BI[build-index.ts]
            GD[generate-docs.ts]
        end

        SkillsDir[skills/&lt;name&gt;/SKILL.md<br/>8 Agent Skills]
        SGDir[style-guides/<br/>meta.json + screenshot]
        ReposDir[repos/<br/>5 vendored Mozaic repos]
        DataDir[(data/mozaic.db)]
        WebDir[website/<br/>docs site + playground]
        ServerJson[server.json<br/>MCP Registry]
    end

    Index --> ToolsDir --> DbDir --> DataDir
    Main --> McpDir
    McpDir -->|proxy| Index
    McpDir -->|light| DbDir
    BI --> ParsersDir --> ReposDir
    BI --> SGDir
    BI --> DataDir
    B3 -->|copies to ~/.mozaic| DataDir
`;
}

function generateComponentsCategoryPie(stats: DbStats): string {
  return `---
title: Components by Category
---
pie showData
${stats.categories.map((c) => `    "${c.category}" : ${c.count}`).join("\n")}
`;
}

function generateTokensCategoryPie(stats: DbStats): string {
  return `---
title: Tokens by Category
---
pie showData
${stats.tokenCategories.map((c) => `    "${c.category}" : ${c.count}`).join("\n")}
`;
}

function generateStatsSummary(stats: DbStats): string {
  return `---
title: Database Statistics Summary
---
flowchart LR
    subgraph Tokens["Tokens: ${stats.tokens}"]
        direction TB
${stats.tokenCategories.map((c) => `        T_${c.category.replace(/[^a-zA-Z]/g, "")}["${c.category}: ${c.count}"]`).join("\n")}
        T_Props["composite properties: ${stats.tokenProperties}"]
    end

    subgraph Components["Components: ${stats.components}"]
        direction TB
        Vue["Vue: ${stats.vueComponents}"]
        React["React: ${stats.reactComponents}"]
        WComp["Web Components: ${stats.wcComponents}"]
        Ftl["Freemarker: ${stats.freemarkerComponents}"]
    end

    subgraph Icons["Icons: ${stats.icons}"]
        direction TB
${stats.iconTypes
  .slice(0, 5)
  .map((t) => `        Icon_${t.type.replace(/[^a-zA-Z]/g, "")}["${t.type}: ${t.count}"]`)
  .join("\n")}
    end

    subgraph CssUtils["CSS Utilities: ${stats.cssUtilities}"]
        direction TB
        CssClasses["${stats.cssUtilityClasses} classes"]
    end

    subgraph Examples["Examples: ${stats.vueExamples + stats.reactExamples + stats.wcExamples}"]
        direction TB
        VueEx["Vue: ${stats.vueExamples}"]
        ReactEx["React: ${stats.reactExamples}"]
        WcEx["Web Components: ${stats.wcExamples}"]
    end

    subgraph Docs["Documentation: ${stats.documentation}"]
        direction TB
        DSDoc["Design System: ${stats.designSystemDocs}"]
        VueDoc["Vue Storybook: ${stats.vueDocs}"]
        ReactDoc["React Storybook: ${stats.reactDocs}"]
    end

    subgraph StyleGuides["Style Guides: ${stats.styleGuides}"]
        direction TB
        SGNote["composed UI patterns"]
    end

    Tokens --> Components --> Icons --> CssUtils --> Examples --> Docs --> StyleGuides
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
    subgraph Clients["Clients"]
        AG[Coding agents<br/>Claude Code, Codex, Cursor, Copilot, ...]
        WEB[Web tools, e.g. v0]
    end

    subgraph SkillsG["Agent Skills (8)"]
        SK7[7 skills: bash + sqlite3]
        SKSG[mozaic-style-guide: MCP tools]
    end

    subgraph MCP["MCP server (stdio) - src/index.ts"]
        direction TB
        Tools[19 MCP tools]
        Queries[db/queries.ts]
        Tools --> Queries
    end

    subgraph Http["NestJS HTTP server - src/main.ts"]
        MCPR[POST /mcp]
        LIGHT[POST /mcp/light]
    end

    DB[(data/mozaic.db)]
    HOMEDB[(~/.mozaic/mozaic.db)]
    BI[scripts/build-index.ts<br/>src/parsers/]

    subgraph Sources["Sources"]
        direction LR
        DS[mozaic-design-system]
        VUE[mozaic-vue]
        REACT[mozaic-react]
        WCR[mozaic-web-components]
        FTLR[mozaic-freemarker]
        SGS[style-guides/]
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
        S8["Web Components: ${stats.wcComponents} / Freemarker: ${stats.freemarkerComponents}"]
        S5["Icons: ${stats.icons}"]
        S6["CSS Utilities: ${stats.cssUtilities} (${stats.cssUtilityClasses} classes)"]
        S7["Documentation: ${stats.documentation} pages"]
        S9["Style Guides: ${stats.styleGuides}"]
    end
`;
  }

  diagram += `
    %% Connections
    AG --> SkillsG
    AG <-->|"stdio"| MCP
    SK7 --> HOMEDB
    SKSG --> MCP
    WEB --> Http
    MCPR -->|"proxy"| MCP
    LIGHT --> DB
    Queries --> DB
    DB -.->|"mozaic-db"| HOMEDB
    Sources --> BI -.->|"build"| DB
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

      let svg = await page.evaluate(
        async (diagram: string, id: string) => {
          const container = document.getElementById("container");
          if (!container) throw new Error("Container not found");
          container.innerHTML = "";
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { svg } = await (window as any).mermaid.render(id, diagram);
          return svg;
        },
        cleanContent,
        `diagram-${name}`
      );

      // Fix malformed HTML in SVG (mermaid outputs <br> instead of <br/>)
      svg = svg.replace(/<br>/g, "<br/>");

      // Set explicit width for better GitHub preview (remove max-width constraint)
      // Also add white background for better visibility
      svg = svg.replace(
        /style="max-width:[^"]*"/,
        'style="min-width: 800px; background-color: white"'
      );
      // Add width attribute and background if not present
      if (!svg.includes('width="')) {
        svg = svg.replace("<svg ", '<svg width="100%" style="background-color: white" ');
      }
      // Ensure background-color is set even if style already exists but without background
      if (!svg.includes("background-color")) {
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
| Web Components | ${stats.wcComponents} |
| Freemarker Macros | ${stats.freemarkerComponents} |
| Vue Examples | ${stats.vueExamples} |
| React Examples | ${stats.reactExamples} |
| Web Component Examples | ${stats.wcExamples} |
| **Icons** | ${stats.icons} |
| **CSS Utilities** | ${stats.cssUtilities} |
| CSS Utility Classes | ${stats.cssUtilityClasses} |
| **Documentation** | ${stats.documentation} |
| Design System Docs | ${stats.designSystemDocs} |
| Vue Storybook Docs | ${stats.vueDocs} |
| React Storybook Docs | ${stats.reactDocs} |
| **Style Guides** | ${stats.styleGuides} |

### Token Categories

| Category | Count |
|----------|-------|
${stats.tokenCategories.map((c) => `| ${c.category} | ${c.count} |`).join("\n")}

### Icon Types

| Type | Count |
|------|-------|
${stats.iconTypes.map((t) => `| ${t.type} | ${t.count} |`).join("\n")}

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
      { name: "stats-summary", content: generateStatsSummary(stats) }
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
