import type Database from "better-sqlite3";
import { getIconByName, listIcons } from "../db/queries.js";
import {
  generateReactComponent,
  generateSvg,
  generateVueComponent,
} from "../parsers/icons-parser.js";

export interface GetIconInput {
  name: string;
  format?: "svg" | "react" | "vue" | "all";
}

export function handleGetIcon(
  db: Database.Database,
  input: GetIconInput
): { content: Array<{ type: "text"; text: string }> } {
  const { name, format = "all" } = input;

  if (!name || name.trim().length === 0) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: "Please provide an icon name",
              example: 'get_icon({ name: "ArrowArrowBottom16" })',
              hint: 'Use search_icons to find icon names, e.g., search_icons({ query: "arrow" })',
            },
            null,
            2
          ),
        },
      ],
    };
  }

  // Try exact match first
  let icon = getIconByName(db, name);

  // If not found, try with common size suffixes
  if (!icon) {
    for (const size of [16, 24, 32, 48, 64]) {
      icon = getIconByName(db, `${name}${size}`);
      if (icon) break;
    }
  }

  // Still not found - try to find similar icons
  if (!icon) {
    // Search for icons with similar names
    const similarIcons = listIcons(db, { limit: 5 });
    const namePattern = name.toLowerCase();
    const matches = similarIcons.filter(
      (i) =>
        i.iconName.toLowerCase().includes(namePattern) || i.name.toLowerCase().includes(namePattern)
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: `Icon "${name}" not found`,
              suggestions:
                matches.length > 0
                  ? matches.map((m) => m.name)
                  : ['Use search_icons to find icons, e.g., search_icons({ query: "arrow" })'],
            },
            null,
            2
          ),
        },
      ],
    };
  }

  // Build response based on format
  const parsedIcon = {
    name: icon.name,
    iconName: icon.iconName,
    type: icon.type,
    size: icon.size,
    viewBox: icon.viewBox,
    paths: icon.paths,
  };

  const response: Record<string, unknown> = {
    name: icon.name,
    iconName: icon.iconName,
    type: icon.type,
    size: icon.size,
    viewBox: icon.viewBox,
  };

  if (format === "svg" || format === "all") {
    response.svg = generateSvg(parsedIcon);
  }

  if (format === "react" || format === "all") {
    response.react = generateReactComponent(parsedIcon);
  }

  if (format === "vue" || format === "all") {
    response.vue = generateVueComponent(parsedIcon);
  }

  // Add raw paths for advanced usage
  if (format === "all") {
    response.rawPaths = icon.paths;
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response, null, 2),
      },
    ],
  };
}

// Tool definition for MCP
export const getIconTool = {
  name: "get_icon",
  description: "Get a specific Mozaic icon by name with SVG markup and usage code for React/Vue",
  inputSchema: {
    type: "object" as const,
    properties: {
      name: {
        type: "string",
        description: 'The icon name (e.g., "ArrowArrowBottom16", "Cart24", "User32")',
      },
      format: {
        type: "string",
        enum: ["svg", "react", "vue", "all"],
        default: "all",
        description: "Output format: svg, react, vue, or all",
      },
    },
    required: ["name"],
  },
};
