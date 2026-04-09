import Database from "better-sqlite3";
import { z } from "zod";

/**
 * Generate Freemarker macro usage code
 *
 * This tool generates ready-to-use Freemarker template code with:
 * - Import statement for the macro
 * - Macro invocation with configuration object
 * - Example configuration based on component props
 */

const _GenerateFreemarkerInputSchema = z.object({
  component: z.string().describe("Component name (e.g., 'button', 'field', 'modal')"),
  config: z
    .string()
    .optional()
    .describe('Configuration object as JSON (e.g., {"color": "primary", "size": "m"})'),
  content: z.string().optional().describe("Nested content for the macro (if applicable)"),
});

export type GenerateFreemarkerInput = z.infer<typeof _GenerateFreemarkerInputSchema>;

export function handleGenerateFreemarker(
  db: Database.Database,
  input: GenerateFreemarkerInput
): { content: Array<{ type: "text"; text: string }> } {
  const componentSlug = input.component.toLowerCase().replace(/\s+/g, "-");

  // Find component
  const component = db
    .prepare(
      `
    SELECT id, name, slug, description
    FROM components
    WHERE frameworks LIKE '%freemarker%'
      AND (LOWER(slug) LIKE ? OR LOWER(name) LIKE ?)
    LIMIT 1
  `
    )
    .get(`%${componentSlug}%`, `%${componentSlug}%`) as
    | { id: number; name: string; slug: string; description: string }
    | undefined;

  if (!component) {
    return {
      content: [
        {
          type: "text",
          text: `Component "${input.component}" not found in Freemarker components.\n\nTry listing available components first with list_freemarker_components.`,
        },
      ],
    };
  }

  // Get component props for configuration example
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

  // Generate macro file name (lowercase with underscores)
  const macroFileName = component.slug.replace(/-/g, "");

  // Parse user configuration or use example
  let configObject: Record<string, unknown> = {};
  if (input.config) {
    try {
      configObject = JSON.parse(input.config);
    } catch {
      // If parsing fails, treat as simple key-value
      configObject = {};
    }
  } else {
    // Generate example configuration from props
    props.slice(0, 3).forEach((prop) => {
      if (prop.default_value) {
        configObject[prop.name] = prop.default_value;
      } else if (prop.type === "boolean") {
        configObject[prop.name] = false;
      } else if (prop.type === "string") {
        configObject[prop.name] = `example_${prop.name}`;
      }
    });
  }

  // Format configuration as Freemarker assignment
  const configLines: string[] = [];
  Object.entries(configObject).forEach(([key, value]) => {
    let formattedValue: string;
    if (typeof value === "string") {
      formattedValue = `"${value}"`;
    } else if (typeof value === "boolean") {
      formattedValue = value.toString();
    } else if (typeof value === "object" && value !== null) {
      formattedValue = JSON.stringify(value, null, 4).replace(/"(\w+)":/g, '"$1":');
    } else {
      formattedValue = String(value);
    }
    configLines.push(`    "${key}": ${formattedValue}`);
  });

  const configString = configLines.length > 0 ? `\n${configLines.join(",\n")}\n` : "";

  // Generate nested content
  const nestedContent = input.content || "Content goes here";

  // Generate the complete Freemarker template code
  const code = `<#import "mozaic/${macroFileName}.ftl" as ${macroFileName}>

<#-- Configuration for ${component.name} -->
<#assign config${component.name} = {${configString}}>

<#-- Render ${component.name} -->
<@${macroFileName}.${macroFileName} config=config${component.name}>
    ${nestedContent}
</@${macroFileName}.${macroFileName}>`;

  // Build description
  let description = `# Freemarker ${component.name}\n\n`;
  description += `${component.description}\n\n`;
  description += `## Generated Code\n\n\`\`\`ftl\n${code}\n\`\`\`\n\n`;

  if (props.length > 0) {
    description += `## Available Configuration Options\n\n`;
    props.forEach((prop) => {
      const required = prop.required ? " (required)" : "";
      const defaultVal = prop.default_value ? ` [default: ${prop.default_value}]` : "";
      description += `- **${prop.name}** (${prop.type})${required}${defaultVal}\n`;
      if (prop.description) {
        description += `  ${prop.description}\n`;
      }
    });
    description += `\n`;
  }

  description += `## Usage Notes\n\n`;
  description += `1. Import the macro at the top of your .ftl file\n`;
  description += `2. Define configuration using <#assign config = {...}>\n`;
  description += `3. Call the macro with <@${macroFileName}.${macroFileName} config=config>...</@>\n`;
  description += `4. Nested content goes between opening and closing tags\n\n`;

  description += `## Installation\n\n`;
  description += `Add to your project's pom.xml:\n\n`;
  description += `\`\`\`xml\n`;
  description += `<dependency>\n`;
  description += `    <groupId>com.adeo.mozaic</groupId>\n`;
  description += `    <artifactId>mozaic-freemarker</artifactId>\n`;
  description += `    <version>LATEST_VERSION</version>\n`;
  description += `</dependency>\n`;
  description += `\`\`\`\n`;

  return {
    content: [
      {
        type: "text",
        text: description,
      },
    ],
  };
}
