import type Database from "better-sqlite3";
import { listStyleGuides } from "../db/queries.js";

export interface ListStyleGuidesInput {
  category?: string;
  site?: string;
}

export function handleListStyleGuides(
  db: Database.Database,
  input: ListStyleGuidesInput
): { content: Array<{ type: "text"; text: string }> } {
  const guides = listStyleGuides(db, { category: input.category, site: input.site });

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            filters: { category: input.category ?? "all", site: input.site ?? "all" },
            resultCount: guides.length,
            styleGuides: guides.map((g) => ({
              slug: g.slug,
              name: g.name,
              category: g.category,
              site: g.site,
              description: g.description,
              components: g.components,
            })),
          },
          null,
          2
        ),
      },
    ],
  };
}

// Tool definition for MCP
export const listStyleGuidesTool = {
  name: "list_style_guides",
  description:
    "List Mozaic style guide patterns — real composed UI screens/layouts (not single components) captured from ADEO apps, optionally filtered by category (e.g. data-table, master-detail, modal-confirm) or source site (e.g. elo, sop). Use get_style_guide to see the actual screenshot.",
  inputSchema: {
    type: "object" as const,
    properties: {
      category: {
        type: "string",
        description:
          'Filter by pattern category (e.g. "data-table", "master-detail", "search-filter")',
      },
      site: {
        type: "string",
        description: 'Filter by source app (e.g. "elo", "sop")',
      },
    },
  },
};
