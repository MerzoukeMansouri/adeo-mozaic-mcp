import type Database from "better-sqlite3";
import { listIconTypes, searchIcons } from "../db/queries.js";

export interface SearchIconsInput {
  query: string;
  type?: string;
  size?: number;
  limit?: number;
}

export function handleSearchIcons(
  db: Database.Database,
  input: SearchIconsInput
): { content: Array<{ type: "text"; text: string }> } {
  const { query, type, size, limit = 20 } = input;

  if (!query || query.trim().length === 0) {
    // If no query, list available icon types
    const types = listIconTypes(db);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              message: "Please provide a search query. Here are the available icon types:",
              types: types.map((t) => `${t.type} (${t.count} icons)`),
              example: 'search_icons({ query: "arrow", type: "navigation" })',
            },
            null,
            2
          ),
        },
      ],
    };
  }

  // Build FTS query with prefix matching
  const searchStrategies = buildSearchStrategies(query);

  // Try each strategy until we find results
  for (const ftsQuery of searchStrategies) {
    try {
      const results = searchIcons(db, ftsQuery, { type, size, limit });
      if (results.length > 0) {
        return formatResults(results, query, type, size);
      }
    } catch {
      // FTS5 syntax error - try next strategy
      continue;
    }
  }

  // No results found
  const types = listIconTypes(db);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            query,
            resultCount: 0,
            message: `No icons found for "${query}". Try a different search term.`,
            availableTypes: types.map((t) => t.type),
          },
          null,
          2
        ),
      },
    ],
  };
}

// Build multiple FTS5 search strategies from strict to fuzzy
function buildSearchStrategies(query: string): string[] {
  // Clean query - remove special characters, normalize spaces
  const cleaned = query.replace(/[^\w\s]/g, " ");
  const terms = cleaned
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 1);

  if (terms.length === 0) {
    return [`${query.trim()}*`];
  }

  if (terms.length === 1) {
    return [`${terms[0]}*`];
  }

  // Multiple terms: try AND then OR
  return [terms.map((t) => `${t}*`).join(" AND "), terms.map((t) => `${t}*`).join(" OR ")];
}

function formatResults(
  results: Array<{
    name: string;
    iconName: string;
    type: string;
    size: number;
    viewBox: string;
  }>,
  query: string,
  type?: string,
  size?: number
): { content: Array<{ type: "text"; text: string }> } {
  // Group by icon name to show available sizes
  const grouped = new Map<string, { iconName: string; type: string; sizes: number[] }>();

  for (const icon of results) {
    const key = icon.iconName;
    if (!grouped.has(key)) {
      grouped.set(key, {
        iconName: icon.iconName,
        type: icon.type,
        sizes: [],
      });
    }
    grouped.get(key)?.sizes.push(icon.size);
  }

  const output = {
    query,
    filters: { type: type || "all", size: size || "all" },
    resultCount: results.length,
    uniqueIcons: grouped.size,
    icons: Array.from(grouped.values()).map((g) => ({
      name: g.iconName,
      type: g.type,
      availableSizes: g.sizes.sort((a, b) => a - b),
      usage: {
        react: `import { ${g.iconName}${g.sizes[0]} } from "@mozaic-ds/icons/js/icons"`,
        vue: `<MIcon name="${g.iconName}${g.sizes[0]}" />`,
      },
    })),
  };

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(output, null, 2),
      },
    ],
  };
}

// Tool definition for MCP
export const searchIconsTool = {
  name: "search_icons",
  description:
    "Search Mozaic Design System icons by name, type (navigation, media, social, etc.), or size (16, 24, 32, 48, 64)",
  inputSchema: {
    type: "object" as const,
    properties: {
      query: {
        type: "string",
        description: 'Search query for icon name (e.g., "arrow", "cart", "user", "check")',
      },
      type: {
        type: "string",
        description:
          'Filter by icon type/category (e.g., "navigation", "media", "social", "payment")',
      },
      size: {
        type: "number",
        description: "Filter by icon size in pixels (16, 24, 32, 48, or 64)",
      },
      limit: {
        type: "number",
        default: 20,
        description: "Maximum number of results to return",
      },
    },
    required: ["query"],
  },
};
