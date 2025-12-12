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

  // Clean and prepare the query for FTS5
  const cleanQuery = prepareFtsQuery(query);

  try {
    const results = dbSearchDocumentation(db, cleanQuery, limit);

    if (results.length === 0) {
      // Try a more relaxed search with prefix matching
      const prefixQuery = query
        .trim()
        .split(/\s+/)
        .map((term) => `${term}*`)
        .join(" ");

      const prefixResults = dbSearchDocumentation(db, prefixQuery, limit);

      if (prefixResults.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No documentation found for: "${query}". Try different keywords or use list_components to see available components.`,
            },
          ],
        };
      }

      return formatResults(prefixResults, query);
    }

    return formatResults(results, query);
  } catch (error) {
    // FTS5 query syntax error - fall back to simple search
    const simpleQuery = query
      .trim()
      .split(/\s+/)
      .filter((term) => term.length > 1)
      .map((term) => `"${term}"`)
      .join(" OR ");

    try {
      const results = dbSearchDocumentation(db, simpleQuery, limit);
      return formatResults(results, query);
    } catch {
      return {
        content: [
          {
            type: "text",
            text: `Search error. Try using simpler search terms.`,
          },
        ],
      };
    }
  }
}

// Prepare query for FTS5
function prepareFtsQuery(query: string): string {
  // Remove special characters that might break FTS5
  let cleaned = query.replace(/[^\w\s-]/g, " ");

  // Split into terms
  const terms = cleaned.trim().split(/\s+/).filter((term) => term.length > 1);

  if (terms.length === 0) {
    return query.trim();
  }

  // Join with AND for better relevance
  return terms.join(" AND ");
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
  let cleaned = snippet
    .replace(/<mark>/g, "**")
    .replace(/<\/mark>/g, "**");

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
  description:
    "Search Mozaic Design System documentation for components, patterns, and guidelines",
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
