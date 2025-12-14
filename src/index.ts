#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import Database from "better-sqlite3";
import { existsSync, appendFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

// Debug mode - enable with --debug flag
const DEBUG = process.argv.includes("--debug");
const LOG_FILE = join(dirname(fileURLToPath(import.meta.url)), "..", "mcp-server.log");

function log(message: string, data?: unknown) {
  if (!DEBUG) return;
  const timestamp = new Date().toISOString();
  const logMessage = data
    ? `[${timestamp}] ${message}: ${JSON.stringify(data, null, 2)}\n`
    : `[${timestamp}] ${message}\n`;
  appendFileSync(LOG_FILE, logMessage);
}

// Import tool handlers
import {
  handleGetDesignTokens,
  type GetDesignTokensInput,
} from "./tools/get-design-tokens.js";
import {
  handleGetComponentInfo,
  type GetComponentInfoInput,
} from "./tools/get-component-info.js";
import {
  handleListComponents,
  type ListComponentsInput,
} from "./tools/list-components.js";
import {
  handleGenerateVueComponent,
  type GenerateVueComponentInput,
} from "./tools/generate-vue-component.js";
import {
  handleGenerateReactComponent,
  type GenerateReactComponentInput,
} from "./tools/generate-react-component.js";
import {
  handleSearchDocumentation,
  type SearchDocumentationInput,
} from "./tools/search-documentation.js";
import {
  handleGetCssUtility,
  type GetCssUtilityInput,
} from "./tools/get-css-utility.js";
import {
  handleListCssUtilities,
  type ListCssUtilitiesInput,
} from "./tools/list-css-utilities.js";

// Get database path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, "..", "data", "mozaic.db");

// Initialize database
let db: Database.Database;

function initializeDatabase(): Database.Database {
  log("Initializing database", { path: dbPath });
  if (!existsSync(dbPath)) {
    const error = `Database not found at ${dbPath}. Run 'npm run build:index' to build the database first.`;
    log("Database error", { error });
    throw new Error(error);
  }

  const database = new Database(dbPath, { readonly: true });
  database.pragma("journal_mode = WAL");
  log("Database initialized successfully");
  return database;
}

// Create MCP server
const server = new McpServer({
  name: "mozaic-design-system",
  version: "1.0.0",
});

// Register tools using the new McpServer API
log("Registering MCP tools");

server.registerTool(
  "get_design_tokens",
  {
    description: "Get design tokens (colors, typography, spacing) from Mozaic Design System",
    inputSchema: {
      category: z.enum(["colors", "typography", "spacing", "shadows", "borders", "all"])
        .describe("Token category to retrieve"),
      format: z.enum(["json", "scss", "css", "js"]).default("json")
        .describe("Output format for the tokens"),
    },
  },
  async (args) => {
    log("Tool called: get_design_tokens", args);
    if (!db) db = initializeDatabase();
    const result = handleGetDesignTokens(db, args as GetDesignTokensInput);
    log("Tool result: get_design_tokens", { contentLength: result.content.length });
    return result;
  }
);

server.registerTool(
  "get_component_info",
  {
    description: "Get detailed information about a Mozaic component",
    inputSchema: {
      component: z.string().describe("Component name (e.g., 'button', 'modal', 'accordion')"),
      framework: z.enum(["vue", "react", "html"]).default("vue")
        .describe("Framework for examples"),
    },
  },
  async (args) => {
    log("Tool called: get_component_info", args);
    if (!db) db = initializeDatabase();
    const result = handleGetComponentInfo(db, args as GetComponentInfoInput);
    log("Tool result: get_component_info", { contentLength: result.content.length });
    return result;
  }
);

server.registerTool(
  "list_components",
  {
    description: "List all available Mozaic components",
    inputSchema: {
      category: z.enum(["form", "navigation", "feedback", "layout", "data-display", "action", "all"])
        .default("all")
        .describe("Optional category filter"),
    },
  },
  async (args) => {
    log("Tool called: list_components", args);
    if (!db) db = initializeDatabase();
    const result = handleListComponents(db, args as ListComponentsInput);
    log("Tool result: list_components", { contentLength: result.content.length });
    return result;
  }
);

server.registerTool(
  "generate_vue_component",
  {
    description: "Generate Vue component code using Mozaic Design System (@mozaic-ds/vue-3)",
    inputSchema: {
      component: z.string().describe("Component type to generate (e.g., button, input, modal)"),
      props: z.record(z.unknown()).optional().describe("Component properties"),
      children: z.string().optional().describe("Content to place inside the component"),
    },
  },
  async (args) => {
    log("Tool called: generate_vue_component", args);
    if (!db) db = initializeDatabase();
    const result = handleGenerateVueComponent(db, args as GenerateVueComponentInput);
    log("Tool result: generate_vue_component", { contentLength: result.content.length });
    return result;
  }
);

server.registerTool(
  "generate_react_component",
  {
    description: "Generate React component code using Mozaic Design System (@mozaic-ds/react)",
    inputSchema: {
      component: z.string().describe("Component type to generate (e.g., Button, TextInput, Modal)"),
      props: z.record(z.unknown()).optional().describe("Component properties"),
      children: z.string().optional().describe("Content to place inside the component"),
    },
  },
  async (args) => {
    log("Tool called: generate_react_component", args);
    if (!db) db = initializeDatabase();
    const result = handleGenerateReactComponent(db, args as GenerateReactComponentInput);
    log("Tool result: generate_react_component", { contentLength: result.content.length });
    return result;
  }
);

server.registerTool(
  "search_documentation",
  {
    description: "Search Mozaic Design System documentation for installation guides, component usage, configuration, styling, tokens, patterns, and best practices. Use this for any question about how to use Mozaic.",
    inputSchema: {
      query: z.string().describe("Search query (e.g., 'installation', 'vue setup', 'button props', 'color tokens')"),
      limit: z.number().default(5).describe("Maximum number of results"),
    },
  },
  async (args) => {
    log("Tool called: search_documentation", args);
    if (!db) db = initializeDatabase();
    const result = handleSearchDocumentation(db, args as SearchDocumentationInput);
    log("Tool result: search_documentation", {
      contentLength: result.content.length,
      resultText: result.content[0]?.text?.substring(0, 500)
    });
    return result;
  }
);

server.registerTool(
  "get_css_utility",
  {
    description: "Get CSS utility classes and examples for Mozaic layout and spacing utilities. These are CSS-only utilities (no framework component needed). Available: Flexy (flexbox grid), Container, Margin, Padding, Ratio, Scroll.",
    inputSchema: {
      name: z.string().describe("Utility name (e.g., 'flexy', 'margin', 'padding', 'container')"),
      includeClasses: z.boolean().default(true).describe("Include all CSS class names in the response"),
    },
  },
  async (args) => {
    log("Tool called: get_css_utility", args);
    if (!db) db = initializeDatabase();
    const result = handleGetCssUtility(db, args as GetCssUtilityInput);
    log("Tool result: get_css_utility", { contentLength: result.content.length });
    return result;
  }
);

server.registerTool(
  "list_css_utilities",
  {
    description: "List available Mozaic CSS utility classes. These are CSS-only utilities for layout (Flexy, Container) and spacing (Margin, Padding, Ratio, Scroll).",
    inputSchema: {
      category: z.enum(["layout", "utility", "all"]).default("all")
        .describe("Filter by category: 'layout', 'utility', or 'all'"),
    },
  },
  async (args) => {
    log("Tool called: list_css_utilities", args);
    if (!db) db = initializeDatabase();
    const result = handleListCssUtilities(db, args as ListCssUtilitiesInput);
    log("Tool result: list_css_utilities", { contentLength: result.content.length });
    return result;
  }
);

// Start server
async function main() {
  log("=== MCP Server Starting ===");
  log("Debug mode enabled", { DEBUG, argv: process.argv });
  log("Database path", { dbPath });

  // Initialize database on startup
  try {
    db = initializeDatabase();
  } catch (error) {
    log("Failed to initialize database on startup", { error: String(error) });
    // Continue anyway - will fail gracefully on tool calls
  }

  log("Connecting to stdio transport");
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log("Server connected and ready");
}

main().catch((error) => {
  log("Fatal error", { error: String(error) });
  process.exit(1);
});
