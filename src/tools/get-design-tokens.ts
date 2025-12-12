import type Database from "better-sqlite3";
import { getTokensByCategory, type Token } from "../db/queries.js";
import { mapCategoryToDbCategories } from "../parsers/tokens-parser.js";

export interface GetDesignTokensInput {
  category: "colors" | "typography" | "spacing" | "shadows" | "borders" | "all";
  format?: "json" | "scss" | "css" | "js";
}

export interface TokenOutput {
  category: string;
  path: string;
  value: string;
  description?: string;
}

// Format tokens as SCSS variables
function formatAsScss(tokens: Token[]): string {
  const lines: string[] = [];
  for (const token of tokens) {
    const varName = token.path.replace(/\./g, "-");
    lines.push(`$${varName}: ${token.value};`);
  }
  return lines.join("\n");
}

// Format tokens as CSS custom properties
function formatAsCss(tokens: Token[]): string {
  const lines: string[] = [":root {"];
  for (const token of tokens) {
    const varName = token.path.replace(/\./g, "-");
    lines.push(`  --${varName}: ${token.value};`);
  }
  lines.push("}");
  return lines.join("\n");
}

// Format tokens as JavaScript object
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

    current[parts[parts.length - 1]] = token.value;
  }

  return `export const tokens = ${JSON.stringify(obj, null, 2)};`;
}

// Format tokens as JSON
function formatAsJson(tokens: Token[]): TokenOutput[] {
  return tokens.map((t) => ({
    category: t.category,
    path: t.path,
    value: t.value,
    description: t.description,
  }));
}

export function handleGetDesignTokens(
  db: Database.Database,
  input: GetDesignTokensInput
): { content: Array<{ type: "text"; text: string }> } {
  const { category, format = "json" } = input;

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
      output = JSON.stringify(formatAsJson(tokens), null, 2);
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

// Tool definition for MCP
export const getDesignTokensTool = {
  name: "get_design_tokens",
  description:
    "Get design tokens (colors, typography, spacing) from Mozaic Design System",
  inputSchema: {
    type: "object" as const,
    properties: {
      category: {
        type: "string",
        enum: ["colors", "typography", "spacing", "shadows", "borders", "all"],
        description: "Token category to retrieve",
      },
      format: {
        type: "string",
        enum: ["json", "scss", "css", "js"],
        default: "json",
        description: "Output format for the tokens",
      },
    },
    required: ["category"],
  },
};
