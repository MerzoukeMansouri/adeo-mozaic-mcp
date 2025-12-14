import type Database from "better-sqlite3";
import { listCssUtilities } from "../db/queries.js";

export interface ListCssUtilitiesInput {
  category?: "layout" | "utility" | "all";
}

export function handleListCssUtilities(
  db: Database.Database,
  input: ListCssUtilitiesInput
): { content: Array<{ type: "text"; text: string }> } {
  const { category = "all" } = input;

  const utilities = listCssUtilities(db, category);

  if (utilities.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: `No CSS utilities found for category: ${category}`,
        },
      ],
    };
  }

  const output = utilities.map((u) => ({
    name: u.name,
    slug: u.slug,
    category: u.category,
    description: u.description,
    classCount: u.classCount,
  }));

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
export const listCssUtilitiesTool = {
  name: "list_css_utilities",
  description:
    "List available Mozaic CSS utility classes by category. These are CSS-only utilities for layout (Flexy, Container) and spacing (Margin, Padding, Ratio, Scroll). Use get_css_utility to get detailed class names and examples.",
  inputSchema: {
    type: "object" as const,
    properties: {
      category: {
        type: "string",
        enum: ["layout", "utility", "all"],
        default: "all",
        description: "Filter by category: 'layout' (Flexy, Container), 'utility' (Margin, Padding, etc.), or 'all'",
      },
    },
    required: [],
  },
};
