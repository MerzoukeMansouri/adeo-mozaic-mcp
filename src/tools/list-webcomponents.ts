import type Database from "better-sqlite3";

export interface ListWebComponentsInput {
  category?: "form" | "navigation" | "feedback" | "layout" | "data-display" | "action" | "all";
}

export interface WebComponentListItem {
  name: string;
  tagName: string;
  category: string;
  description?: string;
}

export function handleListWebComponents(
  db: Database.Database,
  input: ListWebComponentsInput
): { content: Array<{ type: "text"; text: string }> } {
  const { category = "all" } = input;

  // Query components with webcomponents framework
  let query = `
    SELECT name, slug, category, description, frameworks
    FROM components
    WHERE frameworks LIKE '%webcomponents%'
  `;

  const params: string[] = [];

  if (category && category !== "all") {
    query += ` AND category = ?`;
    params.push(category);
  }

  query += ` ORDER BY category, name`;

  const rows = db.prepare(query).all(...params) as Array<{
    name: string;
    slug: string;
    category: string;
    description: string;
    frameworks: string;
  }>;

  if (rows.length === 0) {
    return {
      content: [
        {
          type: "text",
          text:
            category === "all"
              ? "No web components found in the database."
              : `No web components found in category: ${category}`,
        },
      ],
    };
  }

  // Group by category for better readability
  const grouped: Record<string, WebComponentListItem[]> = {};

  for (const row of rows) {
    const cat = row.category || "other";
    if (!grouped[cat]) {
      grouped[cat] = [];
    }
    grouped[cat].push({
      name: row.name,
      tagName: row.slug,
      category: cat,
      description: row.description,
    });
  }

  // Format output
  let text = `# Mozaic Web Components\n\n`;
  text += `Total: ${rows.length} component${rows.length !== 1 ? "s" : ""}\n\n`;

  if (category === "all") {
    text += `## Categories\n\n`;
    for (const [cat, components] of Object.entries(grouped)) {
      text += `### ${cat.charAt(0).toUpperCase() + cat.slice(1)} (${components.length})\n\n`;
      for (const comp of components) {
        text += `- **${comp.name}** (\`<${comp.tagName}>\`)`;
        if (comp.description) {
          text += `\n  ${comp.description}`;
        }
        text += `\n`;
      }
      text += `\n`;
    }
  } else {
    text += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Components\n\n`;
    for (const comp of rows) {
      text += `- **${comp.name}** (\`<${comp.slug}>\`)`;
      if (comp.description) {
        text += `\n  ${comp.description}`;
      }
      text += `\n`;
    }
  }

  // JSON output
  const jsonOutput = {
    total: rows.length,
    categories: Object.keys(grouped),
    components:
      category === "all"
        ? grouped
        : rows.map((r) => ({
            name: r.name,
            tagName: r.slug,
            category: r.category,
            description: r.description,
          })),
  };

  text += `\n---\n\n`;
  text += `**JSON Output:**\n\n`;
  text += `\`\`\`json\n${JSON.stringify(jsonOutput, null, 2)}\n\`\`\``;

  return {
    content: [
      {
        type: "text",
        text,
      },
    ],
  };
}

// Tool definition for MCP
export const listWebComponentsTool = {
  name: "list_webcomponents",
  description:
    "List available Mozaic Web Components by category. Returns custom element tag names and descriptions.",
  inputSchema: {
    type: "object" as const,
    properties: {
      category: {
        type: "string",
        enum: ["form", "navigation", "feedback", "layout", "data-display", "action", "all"],
        default: "all",
        description: "Filter web components by category",
      },
    },
  },
};
