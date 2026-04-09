import Database from "better-sqlite3";
import { z } from "zod";

/**
 * Get detailed information about a Freemarker component
 *
 * Returns:
 * - Component metadata (name, description, category)
 * - Configuration options (props)
 * - CSS classes
 * - Usage examples
 */

const _GetFreemarkerInfoInputSchema = z.object({
  component: z.string().describe("Component name (e.g., 'button', 'field', 'modal')"),
});

export type GetFreemarkerInfoInput = z.infer<typeof _GetFreemarkerInfoInputSchema>;

export function handleGetFreemarkerInfo(
  db: Database.Database,
  input: GetFreemarkerInfoInput
): { content: Array<{ type: "text"; text: string }> } {
  const componentSlug = input.component.toLowerCase().replace(/\s+/g, "-");

  // Find component
  const component = db
    .prepare(
      `
    SELECT id, name, slug, category, description
    FROM components
    WHERE frameworks LIKE '%freemarker%'
      AND (LOWER(slug) LIKE ? OR LOWER(name) LIKE ?)
    LIMIT 1
  `
    )
    .get(`%${componentSlug}%`, `%${componentSlug}%`) as
    | { id: number; name: string; slug: string; category: string; description: string }
    | undefined;

  if (!component) {
    return {
      content: [
        {
          type: "text",
          text: `Component "${input.component}" not found in Freemarker components.\n\nTry searching with list_freemarker_components.`,
        },
      ],
    };
  }

  // Get configuration options (props)
  const props = db
    .prepare(
      `
    SELECT name, type, default_value, required, description
    FROM component_props
    WHERE component_id = ?
    ORDER BY required DESC, name ASC
  `
    )
    .all(component.id) as Array<{
    name: string;
    type: string;
    default_value: string | null;
    required: boolean;
    description: string;
  }>;

  // Get CSS classes
  const cssClasses = db
    .prepare(
      `
    SELECT class_name, description
    FROM component_css_classes
    WHERE component_id = ?
    ORDER BY class_name ASC
  `
    )
    .all(component.id) as Array<{
    class_name: string;
    description: string | null;
  }>;

  // Build markdown description
  let output = `# ${component.name} (Freemarker)\n\n`;
  output += `**Category:** ${component.category}\n\n`;

  if (component.description) {
    output += `## Description\n\n${component.description}\n\n`;
  }

  // Configuration options
  output += `## Configuration Options\n\n`;
  if (props.length > 0) {
    output += `| Option | Type | Required | Default | Description |\n`;
    output += `|--------|------|----------|---------|-------------|\n`;

    props.forEach((prop) => {
      const required = prop.required ? "✓" : "";
      const defaultVal = prop.default_value || "-";
      const desc = prop.description || "-";
      output += `| \`${prop.name}\` | ${prop.type} | ${required} | ${defaultVal} | ${desc} |\n`;
    });
  } else {
    output += `No configuration options documented.\n`;
  }
  output += `\n`;

  // CSS Classes
  if (cssClasses.length > 0) {
    output += `## CSS Classes\n\n`;
    cssClasses.forEach((cls) => {
      output += `- \`${cls.class_name}\``;
      if (cls.description) {
        output += ` - ${cls.description}`;
      }
      output += `\n`;
    });
    output += `\n`;
  }

  // Usage example
  const macroFileName = component.slug.replace(/-/g, "");

  output += `## Usage Example\n\n`;
  output += `\`\`\`ftl\n`;
  output += `<#import "mozaic/${macroFileName}.ftl" as ${macroFileName}>\n\n`;
  output += `<#assign config = {\n`;

  // Add example configuration
  const exampleProps = props.slice(0, 3);
  if (exampleProps.length > 0) {
    exampleProps.forEach((prop, index) => {
      let exampleValue: string;
      if (prop.default_value) {
        exampleValue = prop.type === "string" ? `"${prop.default_value}"` : prop.default_value;
      } else if (prop.type === "boolean") {
        exampleValue = "false";
      } else if (prop.type === "string") {
        exampleValue = `"example"`;
      } else {
        exampleValue = '""';
      }

      const comma = index < exampleProps.length - 1 ? "," : "";
      output += `    "${prop.name}": ${exampleValue}${comma}\n`;
    });
  }

  output += `}>\n\n`;
  output += `<@${macroFileName}.${macroFileName} config=config>\n`;
  output += `    Content goes here\n`;
  output += `</@${macroFileName}.${macroFileName}>\n`;
  output += `\`\`\`\n\n`;

  // Installation
  output += `## Installation\n\n`;
  output += `Add to your project's \`pom.xml\`:\n\n`;
  output += `\`\`\`xml\n`;
  output += `<dependency>\n`;
  output += `    <groupId>com.adeo.mozaic</groupId>\n`;
  output += `    <artifactId>mozaic-freemarker</artifactId>\n`;
  output += `    <version>LATEST_VERSION</version>\n`;
  output += `</dependency>\n`;
  output += `\`\`\`\n\n`;

  // Documentation link
  output += `## Documentation\n\n`;
  output += `For more information, visit the [Mozaic Freemarker repository](https://github.com/adeo/mozaic-freemarker).\n`;

  // JSON metadata for programmatic access
  const jsonData = {
    name: component.name,
    slug: component.slug,
    category: component.category,
    description: component.description,
    framework: "freemarker",
    props: props.map((p) => ({
      name: p.name,
      type: p.type,
      required: p.required,
      default: p.default_value,
      description: p.description,
    })),
    cssClasses: cssClasses.map((c) => c.class_name),
  };

  output += `\n---\n\n`;
  output += `### Component Data (JSON)\n\n`;
  output += `\`\`\`json\n${JSON.stringify(jsonData, null, 2)}\n\`\`\`\n`;

  return {
    content: [
      {
        type: "text",
        text: output,
      },
    ],
  };
}
