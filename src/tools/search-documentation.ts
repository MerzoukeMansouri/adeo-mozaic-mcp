import type Database from "better-sqlite3";
import { searchDocumentation as dbSearchDocumentation } from "../db/queries.js";

export interface SearchDocumentationInput {
  query: string;
  limit?: number;
}

export interface SearchResult {
  title: string;
  path: string;
  snippet: string;
  category?: string;
}

export function handleSearchDocumentation(
  db: Database.Database,
  input: SearchDocumentationInput
): { content: Array<{ type: "text"; text: string }> } {
  const { query, limit = 5 } = input;

  if (!query || query.trim().length === 0) {
    return {
      content: [
        {
          type: "text",
          text: "Please provide a search query.",
        },
      ],
    };
  }

  // Generate multiple search strategies from strict to fuzzy
  const searchStrategies = buildSearchStrategies(query);

  // Try each strategy until we find results
  for (const ftsQuery of searchStrategies) {
    try {
      const results = dbSearchDocumentation(db, ftsQuery, limit);
      if (results.length > 0) {
        return formatResults(results, query);
      }
    } catch {
      // FTS5 syntax error - try next strategy
      continue;
    }
  }

  return {
    content: [
      {
        type: "text",
        text: `No documentation found for: "${query}". Try different keywords or use list_components to see available components.`,
      },
    ],
  };
}

// Build multiple FTS5 search strategies from strict to fuzzy
function buildSearchStrategies(query: string): string[] {
  // Remove special characters that might break FTS5
  // Also replace hyphens with spaces since FTS5 tokenizes on hyphens
  const cleaned = query.replace(/[^\w\s]/g, " ");

  // Split into terms and filter short ones
  const terms = cleaned
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 1);

  if (terms.length === 0) {
    return [query.trim()];
  }

  // Single term: just use prefix matching
  if (terms.length === 1) {
    return [`${terms[0]}*`];
  }

  // Multiple terms: try strategies from strict to fuzzy
  return [
    // 1. Exact phrase match
    `"${terms.join(" ")}"`,

    // 2. All terms required with prefix (AND)
    terms.map((t) => `${t}*`).join(" AND "),

    // 3. Any term matches with prefix (OR) - most fuzzy
    terms.map((t) => `${t}*`).join(" OR "),
  ];
}

function formatResults(
  results: SearchResult[],
  originalQuery: string
): { content: Array<{ type: "text"; text: string }> } {
  const output = {
    query: originalQuery,
    resultCount: results.length,
    results: results.map((r) => ({
      title: r.title,
      path: r.path,
      category: r.category,
      snippet: cleanSnippet(r.snippet),
      url: `https://mozaic.adeo.cloud${r.path}`,
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

// Clean up FTS5 snippet output
function cleanSnippet(snippet: string): string {
  if (!snippet) return "";

  // Remove HTML tags but keep the text
  let cleaned = snippet.replace(/<mark>/g, "**").replace(/<\/mark>/g, "**");

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Truncate if too long
  if (cleaned.length > 200) {
    cleaned = cleaned.substring(0, 200) + "...";
  }

  return cleaned;
}

// Tool definition for MCP
export const searchDocumentationTool = {
  name: "search_documentation",
  description: "Search Mozaic Design System documentation for components, patterns, and guidelines",
  inputSchema: {
    type: "object" as const,
    properties: {
      query: {
        type: "string",
        description: "Search query (e.g., 'button variants', 'form validation', 'color tokens')",
      },
      limit: {
        type: "number",
        default: 5,
        description: "Maximum number of results to return",
      },
    },
    required: ["query"],
  },
};
