#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import Database from "better-sqlite3";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Import tool handlers
import {
  handleGetDesignTokens,
  getDesignTokensTool,
  type GetDesignTokensInput,
} from "./tools/get-design-tokens.js";
import {
  handleGetComponentInfo,
  getComponentInfoTool,
  type GetComponentInfoInput,
} from "./tools/get-component-info.js";
import {
  handleListComponents,
  listComponentsTool,
  type ListComponentsInput,
} from "./tools/list-components.js";
import {
  handleGenerateComponent,
  generateComponentTool,
  type GenerateComponentInput,
} from "./tools/generate-component.js";
import {
  handleSearchDocumentation,
  searchDocumentationTool,
  type SearchDocumentationInput,
} from "./tools/search-documentation.js";

// Get database path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, "..", "data", "mozaic.db");

// Initialize database
let db: Database.Database;

function initializeDatabase(): Database.Database {
  if (!existsSync(dbPath)) {
    // Don't log to stderr - throw error instead for MCP compatibility
    throw new Error(`Database not found at ${dbPath}. Run 'npm run build:index' to build the database first.`);
  }

  const database = new Database(dbPath, { readonly: true });
  database.pragma("journal_mode = WAL");
  return database;
}

// Create MCP server
const server = new Server(
  {
    name: "mozaic-design-system",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    getDesignTokensTool,
    getComponentInfoTool,
    listComponentsTool,
    generateComponentTool,
    searchDocumentationTool,
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Ensure database is initialized
  if (!db) {
    db = initializeDatabase();
  }

  try {
    switch (name) {
      case "get_design_tokens":
        return handleGetDesignTokens(db, args as unknown as GetDesignTokensInput);

      case "get_component_info":
        return handleGetComponentInfo(db, args as unknown as GetComponentInfoInput);

      case "list_components":
        return handleListComponents(db, args as unknown as ListComponentsInput);

      case "generate_component":
        return handleGenerateComponent(db, args as unknown as GenerateComponentInput);

      case "search_documentation":
        return handleSearchDocumentation(db, args as unknown as SearchDocumentationInput);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  // Initialize database on startup
  try {
    db = initializeDatabase();
    // Don't log to stderr in production - it interferes with MCP protocol
    // console.error("Mozaic MCP Server initialized successfully");
    // console.error(`Database: ${dbPath}`);
  } catch (error) {
    // Only log critical errors
    // console.error("Failed to initialize database:", error);
    // Continue anyway - will fail gracefully on tool calls
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(() => {
  // Don't log to stderr - MCP servers should be silent
  process.exit(1);
});
