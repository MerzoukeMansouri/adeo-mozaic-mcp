#!/usr/bin/env tsx

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, "..");
const DOC_DIR = join(PROJECT_ROOT, "doc");
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

async function main(): Promise<void> {
  console.log("Generating Mermaid diagrams...\n");

  // Create doc directory
  if (!existsSync(DOC_DIR)) {
    mkdirSync(DOC_DIR, { recursive: true });
    console.log("Created doc/ directory");
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

  console.log("\nGenerated diagrams:");
  for (const { name, content } of diagrams) {
    const outputPath = join(DOC_DIR, `${name}.mmd`);
    writeFileSync(outputPath, content);
    console.log(`  - ${name}.mmd`);
  }

  console.log(`\nAll diagrams saved to: ${DOC_DIR}/`);
  console.log("\nView diagrams at: https://mermaid.live or in VS Code with Mermaid extension");
}

main().catch((error) => {
  console.error("Documentation generation failed:", error);
  process.exit(1);
});
