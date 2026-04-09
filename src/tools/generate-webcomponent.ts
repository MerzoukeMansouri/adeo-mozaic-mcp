import type Database from "better-sqlite3";
import { getComponentBySlug } from "../db/queries.js";

export interface GenerateWebComponentInput {
  component: string;
  attributes?: Record<string, string>;
  children?: string;
}

export function handleGenerateWebComponent(
  db: Database.Database,
  input: GenerateWebComponentInput
): { content: Array<{ type: "text"; text: string }> } {
  const { component, attributes = {}, children = "" } = input;

  // Normalize component name to kebab-case slug
  const slug = component.toLowerCase().replace(/^mozaic-/, "");
  const componentData = getComponentBySlug(db, slug);

  // Get tag name (should be kebab-case)
  const tagName = componentData?.slug || `mozaic-${slug}`;

  const code = generateWebComponent(tagName, attributes, children);

  let output = `// Import web component\n`;
  output += `import '@adeo/mozaic-web-components/${slug}.js';\n\n`;
  output += `// Usage in HTML\n${code}`;

  return {
    content: [
      {
        type: "text",
        text: output,
      },
    ],
  };
}

function generateWebComponent(
  tagName: string,
  attributes: Record<string, string>,
  children: string
): string {
  const attributesString = generateAttributesString(attributes);

  if (children) {
    return `<${tagName}${attributesString}>\n  ${children}\n</${tagName}>`;
  }

  if (Object.keys(attributes).length === 0) {
    return `<${tagName}></${tagName}>`;
  }

  return `<${tagName}${attributesString}></${tagName}>`;
}

function generateAttributesString(attributes: Record<string, string>): string {
  if (Object.keys(attributes).length === 0) {
    return "";
  }

  const parts: string[] = [];

  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined || value === null) {
      continue;
    }

    // Web component attributes are always strings
    // Boolean attributes: if truthy, add attribute without value
    if (value === "true" || value === "") {
      parts.push(key);
    } else if (value === "false") {
      // Skip false boolean attributes
      continue;
    } else {
      // All other values as string attributes
      parts.push(`${key}="${value}"`);
    }
  }

  return parts.length > 0 ? "\n  " + parts.join("\n  ") : "";
}

// Tool definition for MCP
export const generateWebComponentTool = {
  name: "generate_webcomponent",
  description:
    "Generate Web Component code using Mozaic Design System (@adeo/mozaic-web-components). Returns ready-to-use HTML with import statement.",
  inputSchema: {
    type: "object" as const,
    properties: {
      component: {
        type: "string",
        description:
          "Component type to generate (e.g., button, card, modal). Will be converted to kebab-case tag name (e.g., mozaic-button)",
      },
      attributes: {
        type: "object",
        description:
          "HTML attributes to apply to the component (all values as strings). Use 'true'/'false' for boolean attributes.",
        additionalProperties: {
          type: "string",
        },
      },
      children: {
        type: "string",
        description: "Inner HTML content / slot content to place inside the component",
      },
    },
    required: ["component"],
  },
};
