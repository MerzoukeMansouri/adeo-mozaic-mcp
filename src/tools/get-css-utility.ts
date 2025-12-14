import type Database from "better-sqlite3";
import { getCssUtility } from "../db/queries.js";

export interface GetCssUtilityInput {
  name: string;
  includeClasses?: boolean;
}

export interface CssUtilityOutput {
  name: string;
  category: string;
  description?: string;
  classes: string[];
  examples: Array<{
    title?: string;
    code: string;
  }>;
}

export function handleGetCssUtility(
  db: Database.Database,
  input: GetCssUtilityInput
): { content: Array<{ type: "text"; text: string }> } {
  const { name, includeClasses = true } = input;

  // Normalize utility name (lowercase)
  const slug = name.toLowerCase();

  const utility = getCssUtility(db, slug);

  if (!utility) {
    return {
      content: [
        {
          type: "text",
          text: `CSS utility not found: ${name}. Available utilities: Flexy, Container, Margin, Padding, Ratio, Scroll. Use list_css_utilities to see all available utilities.`,
        },
      ],
    };
  }

  // Build output
  const output: CssUtilityOutput = {
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
    content: [
      {
        type: "text",
        text: JSON.stringify(output, null, 2),
      },
    ],
  };
}

// Tool definition for MCP
export const getCssUtilityTool = {
  name: "get_css_utility",
  description:
    "Get CSS utility classes and examples for Mozaic layout and spacing utilities. These are CSS-only utilities (no framework component needed). Available utilities: Flexy (flexbox grid), Container, Margin, Padding, Ratio, Scroll.",
  inputSchema: {
    type: "object" as const,
    properties: {
      name: {
        type: "string",
        description:
          "Utility name (e.g., 'flexy', 'margin', 'padding', 'container', 'ratio', 'scroll')",
      },
      includeClasses: {
        type: "boolean",
        default: true,
        description: "Include all CSS class names in the response",
      },
    },
    required: ["name"],
  },
};
