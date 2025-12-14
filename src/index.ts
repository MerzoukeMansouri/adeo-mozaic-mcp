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
  handleGenerateComponent,
  type GenerateComponentInput,
} from "./tools/generate-component.js";
import {
  handleSearchDocumentation,
  type SearchDocumentationInput,
} from "./tools/search-documentation.js";

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
    if (!db) db = initializeDatabase();
    return handleGetComponentInfo(db, args as GetComponentInfoInput);
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
    if (!db) db = initializeDatabase();
    return handleListComponents(db, args as ListComponentsInput);
  }
);

server.registerTool(
  "generate_component",
  {
    description: "Generate component code using Mozaic design system",
    inputSchema: {
      component: z.string().describe("Component type to generate"),
      framework: z.enum(["vue", "react", "html"]).describe("Target framework"),
      props: z.record(z.unknown()).optional().describe("Component properties"),
      children: z.string().optional().describe("Content to place inside the component"),
    },
  },
  async (args) => {
    if (!db) db = initializeDatabase();
    return handleGenerateComponent(db, args as GenerateComponentInput);
  }
);

server.registerTool(
  "search_documentation",
  {
    description: "Search Mozaic documentation",
    inputSchema: {
      query: z.string().describe("Search query"),
      limit: z.number().default(5).describe("Maximum number of results"),
    },
  },
  async (args) => {
    if (!db) db = initializeDatabase();
    return handleSearchDocumentation(db, args as SearchDocumentationInput);
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
