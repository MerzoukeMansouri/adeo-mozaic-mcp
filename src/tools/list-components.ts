import type Database from "better-sqlite3";
import { listComponents as dbListComponents } from "../db/queries.js";

export interface ListComponentsInput {
  category?: "form" | "navigation" | "feedback" | "layout" | "data-display" | "action" | "all";
}

export interface ComponentListItem {
  name: string;
  slug: string;
  category: string;
  description?: string;
}

export function handleListComponents(
  db: Database.Database,
  input: ListComponentsInput
): { content: Array<{ type: "text"; text: string }> } {
  const { category = "all" } = input;

  const components = dbListComponents(db, category === "all" ? undefined : category);

  if (components.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: category === "all"
            ? "No components found in the database."
            : `No components found in category: ${category}`,
        },
      ],
    };
  }

  // Group by category for better readability
  const grouped: Record<string, ComponentListItem[]> = {};

  for (const component of components) {
    const cat = component.category || "other";
    if (!grouped[cat]) {
      grouped[cat] = [];
    }
    grouped[cat].push({
      name: component.name,
      slug: component.slug,
      category: cat,
      description: component.description,
    });
  }

  // Format output
  const output = {
    total: components.length,
    categories: Object.keys(grouped),
    components: category === "all" ? grouped : components,
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
export const listComponentsTool = {
  name: "list_components",
  description:
    "List available Mozaic Vue/React components by category. Note: CSS-only layout utilities (Grid, Flexy, Container, margin/padding utilities) are not listed here - use search_documentation to find them.",
  inputSchema: {
    type: "object" as const,
    properties: {
      category: {
        type: "string",
        enum: [
          "form",
          "navigation",
          "feedback",
          "layout",
          "data-display",
          "action",
          "all",
        ],
        default: "all",
        description: "Filter components by category",
      },
    },
  },
};
