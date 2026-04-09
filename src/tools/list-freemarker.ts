import Database from "better-sqlite3";
import { z } from "zod";

/**
 * List Freemarker components by category
 *
 * Returns a list of all Freemarker macro components, optionally filtered by category.
 */

const _ListFreemarkerInputSchema = z.object({
  category: z
    .enum(["all", "action", "form", "feedback", "navigation", "layout", "data-display", "other"])
    .optional()
    .default("all")
    .describe("Filter by category (default: all)"),
});

export type ListFreemarkerInput = z.infer<typeof _ListFreemarkerInputSchema>;

export function handleListFreemarker(
  db: Database.Database,
  input: ListFreemarkerInput
): { content: Array<{ type: "text"; text: string }> } {
  const category = input.category || "all";

  let query = `
    SELECT name, slug, category, description
    FROM components
    WHERE frameworks LIKE '%freemarker%'
  `;

  const params: string[] = [];

  if (category !== "all") {
    query += ` AND category = ?`;
    params.push(category);
  }

  query += ` ORDER BY category ASC, name ASC`;

  const components = db.prepare(query).all(...params) as Array<{
    name: string;
    slug: string;
    category: string;
    description: string;
  }>;

  if (components.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: `No Freemarker components found${category !== "all" ? ` in category "${category}"` : ""}.`,
        },
      ],
    };
  }

  // Group components by category
  const groupedComponents = new Map<string, typeof components>();

  components.forEach((component) => {
    const cat = component.category;
    if (!groupedComponents.has(cat)) {
      groupedComponents.set(cat, []);
    }
    const group = groupedComponents.get(cat);
    if (group) {
      group.push(component);
    }
  });

  // Build output
  let output = `# Freemarker Components\n\n`;
  output += `Found ${components.length} components`;
  if (category !== "all") {
    output += ` in category "${category}"`;
  }
  output += `\n\n`;

  // List by category
  const categories = Array.from(groupedComponents.keys()).sort();

  categories.forEach((cat) => {
    const comps = groupedComponents.get(cat);
    if (!comps) return;
    output += `## ${cat.charAt(0).toUpperCase() + cat.slice(1)} (${comps.length})\n\n`;

    comps.forEach((comp) => {
      output += `### ${comp.name}\n`;
      output += `- **Slug:** \`${comp.slug}\`\n`;
      if (comp.description) {
        output += `- **Description:** ${comp.description}\n`;
      }
      const macroName = comp.slug.replace(/-/g, "");
      output += `- **Usage:** \`<#import "mozaic/${macroName}.ftl" as ${macroName}>\`\n`;
      output += `\n`;
    });
  });

  // Summary by category
  output += `---\n\n`;
  output += `## Summary by Category\n\n`;
  categories.forEach((cat) => {
    const group = groupedComponents.get(cat);
    if (group) {
      output += `- **${cat}**: ${group.length} components\n`;
    }
  });

  output += `\n`;
  output += `## Next Steps\n\n`;
  output += `Use \`get_freemarker_info\` to view detailed information about a specific component.\n`;
  output += `Use \`generate_freemarker\` to generate ready-to-use code for a component.\n`;

  return {
    content: [
      {
        type: "text",
        text: output,
      },
    ],
  };
}
