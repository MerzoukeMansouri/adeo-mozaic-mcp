#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import Database from "better-sqlite3";
import {
  getTokensByCategory,
  getCssUtility,
  listCssUtilities,
  searchIcons,
  getIconByName,
} from "./src/db/queries.js";
import type { Token } from "./src/db/queries.js";
import { mapCategoryToDbCategories } from "./src/parsers/tokens-parser.js";
import { generateSvg } from "./src/parsers/icons-parser.js";

const DATABASE_PATH = process.env.DATABASE_PATH || "./data/mozaic.db";

// Token formatting functions
function formatAsScss(tokens: Token[]): string {
  const lines: string[] = [];
  for (const token of tokens) {
    const varName = token.scssVariable || `$${token.path.replace(/\./g, "-")}`;
    lines.push(`${varName}: ${token.valueRaw};`);
  }
  return lines.join("\n");
}

function formatAsCss(tokens: Token[]): string {
  const lines: string[] = [":root {"];
  for (const token of tokens) {
    const varName = token.cssVariable || `--${token.path.replace(/\./g, "-")}`;
    lines.push(`  ${varName}: ${token.valueRaw};`);
  }
  lines.push("}");
  return lines.join("\n");
}

function formatAsJs(tokens: Token[]): string {
  const obj: Record<string, unknown> = {};

  for (const token of tokens) {
    const parts = token.path.split(".");
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = token.valueRaw;
  }

  return `export const tokens = ${JSON.stringify(obj, null, 2)};`;
}

function formatAsJson(tokens: Token[]): string {
  return JSON.stringify(
    tokens.map((t) => ({
      category: t.category,
      subcategory: t.subcategory,
      name: t.name,
      path: t.path,
      value: t.valueRaw,
      valueComputed: t.valueComputed,
      cssVariable: t.cssVariable,
      scssVariable: t.scssVariable,
      description: t.description,
    })),
    null,
    2
  );
}

// Initialize database
const db = new Database(DATABASE_PATH);

// Create server
const server = new Server(
  {
    name: "mozaic-tokens",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_design_tokens",
        description:
          "Get Mozaic design tokens (colors, typography, spacing, shadows, borders, screens, grid) in various formats (JSON, SCSS, CSS, JS)",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: [
                "colors",
                "typography",
                "spacing",
                "shadows",
                "borders",
                "screens",
                "grid",
                "all",
              ],
              description: "Token category to retrieve",
            },
            format: {
              type: "string",
              enum: ["json", "scss", "css", "js"],
              default: "json",
              description: "Output format",
            },
          },
          required: ["category"],
        },
      },
      {
        name: "list_css_utilities",
        description:
          "List Mozaic CSS utilities (Flexy grid, Container, Margin, Padding, Ratio, Scroll). CSS-only, no framework needed.",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: ["layout", "utility", "all"],
              default: "all",
              description: "Filter: layout (Flexy, Container) or utility (Margin, Padding, etc.)",
            },
          },
          required: [],
        },
      },
      {
        name: "get_css_utility",
        description:
          "Get CSS utility classes and examples. Available: flexy, container, margin, padding, ratio, scroll.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Utility name (e.g., 'flexy', 'margin', 'padding')",
            },
            includeClasses: {
              type: "boolean",
              default: true,
              description: "Include all CSS class names",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "search_icons",
        description:
          "Search Mozaic icons by name or type. Returns icon names, types, and available sizes (16, 24, 32, 48, 64).",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: 'Search query (e.g., "arrow", "cart", "user")',
            },
            type: {
              type: "string",
              description: 'Filter by type (e.g., "navigation", "media", "social")',
            },
            size: {
              type: "number",
              description: "Filter by size (16, 24, 32, 48, 64)",
            },
            limit: {
              type: "number",
              default: 20,
              description: "Max results",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_icon",
        description:
          "Get specific icon by name with SVG markup. Use search_icons first to find names.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: 'Icon name (e.g., "ArrowArrowBottom16", "Cart24")',
            },
            format: {
              type: "string",
              enum: ["svg", "json"],
              default: "json",
              description: "Output: svg (raw SVG) or json (metadata + SVG)",
            },
          },
          required: ["name"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;

  if (toolName === "get_design_tokens") {
    const { category, format = "json" } = request.params.arguments as {
      category: string;
      format?: string;
    };

    let tokens: Token[] = [];

    if (category === "all") {
      tokens = getTokensByCategory(db, "all");
    } else {
      const dbCategories = mapCategoryToDbCategories(category);
      for (const cat of dbCategories) {
        tokens.push(...getTokensByCategory(db, cat));
      }
    }

    if (tokens.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No tokens found for category: ${category}`,
          },
        ],
      };
    }

    let output: string;

    switch (format) {
      case "scss":
        output = formatAsScss(tokens);
        break;
      case "css":
        output = formatAsCss(tokens);
        break;
      case "js":
        output = formatAsJs(tokens);
        break;
      case "json":
      default:
        output = formatAsJson(tokens);
        break;
    }

    return {
      content: [
        {
          type: "text",
          text: output,
        },
      ],
    };
  }

  if (toolName === "list_css_utilities") {
    const { category = "all" } = request.params.arguments as { category?: string };
    const utilities = listCssUtilities(db, category);

    const output = utilities.map((u) => ({
      name: u.name,
      slug: u.slug,
      category: u.category,
      description: u.description,
      classCount: u.classCount,
    }));

    return {
      content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
    };
  }

  if (toolName === "get_css_utility") {
    const { name, includeClasses = true } = request.params.arguments as {
      name: string;
      includeClasses?: boolean;
    };

    const utility = getCssUtility(db, name.toLowerCase());

    if (!utility) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: `CSS utility not found: ${name}`,
              available: ["flexy", "container", "margin", "padding", "ratio", "scroll"],
            }),
          },
        ],
      };
    }

    const output = {
      name: utility.name,
      category: utility.category,
      description: utility.description,
      classes: includeClasses ? utility.classes : [],
      examples: utility.examples.map((e) => ({
        title: e.title,
        code: e.code,
      })),
    };

    return {
      content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
    };
  }

  if (toolName === "search_icons") {
    const {
      query,
      type,
      size,
      limit = 20,
    } = request.params.arguments as {
      query: string;
      type?: string;
      size?: number;
      limit?: number;
    };

    const terms = query
      .trim()
      .split(/\s+/)
      .filter((t) => t.length > 1);
    const ftsQuery = terms.length > 0 ? terms.map((t) => `${t}*`).join(" OR ") : `${query}*`;

    const results = searchIcons(db, ftsQuery, { type, size, limit });

    const grouped = new Map<string, { iconName: string; type: string; sizes: number[] }>();
    for (const icon of results) {
      const key = icon.iconName;
      if (!grouped.has(key)) {
        grouped.set(key, { iconName: icon.iconName, type: icon.type, sizes: [] });
      }
      grouped.get(key)?.sizes.push(icon.size);
    }

    const output = {
      query,
      resultCount: results.length,
      uniqueIcons: grouped.size,
      icons: Array.from(grouped.values()).map((g) => ({
        name: g.iconName,
        type: g.type,
        availableSizes: g.sizes.sort((a, b) => a - b),
      })),
    };

    return {
      content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
    };
  }

  if (toolName === "get_icon") {
    const { name, format = "json" } = request.params.arguments as {
      name: string;
      format?: string;
    };

    let icon = getIconByName(db, name);

    if (!icon) {
      for (const size of [16, 24, 32, 48, 64]) {
        icon = getIconByName(db, `${name}${size}`);
        if (icon) break;
      }
    }

    if (!icon) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: `Icon not found: ${name}`,
              hint: "Use search_icons to find icons",
            }),
          },
        ],
      };
    }

    const parsedIcon = {
      name: icon.name,
      iconName: icon.iconName,
      type: icon.type,
      size: icon.size,
      viewBox: icon.viewBox,
      paths: icon.paths,
    };

    if (format === "svg") {
      return {
        content: [{ type: "text", text: generateSvg(parsedIcon) }],
      };
    }

    const output = {
      name: icon.name,
      iconName: icon.iconName,
      type: icon.type,
      size: icon.size,
      viewBox: icon.viewBox,
      svg: generateSvg(parsedIcon),
      rawPaths: icon.paths,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
    };
  }

  throw new Error(`Unknown tool: ${toolName}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Mozaic Tokens MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
