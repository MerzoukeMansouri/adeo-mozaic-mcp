import type Database from "better-sqlite3";
import { getComponentBySlug } from "../db/queries.js";

export interface GenerateVueComponentInput {
  component: string;
  props?: Record<string, unknown>;
  children?: string;
}

export function handleGenerateVueComponent(
  db: Database.Database,
  input: GenerateVueComponentInput
): { content: Array<{ type: "text"; text: string }> } {
  const { component, props = {}, children = "" } = input;

  // Normalize component name
  const slug = component.replace(/^M/i, "").toLowerCase();
  const componentData = getComponentBySlug(db, slug);

  // Get component name (with M prefix for Vue)
  const componentName =
    componentData?.name ||
    `M${component.charAt(0).toUpperCase()}${component.slice(1).toLowerCase()}`;

  const code = generateVueComponent(componentName, props, children);

  let output = `// Import statement\nimport { ${componentName} } from '@mozaic-ds/vue-3';\n\n`;
  output += `// Component usage\n${code}`;

  return {
    content: [
      {
        type: "text",
        text: output,
      },
    ],
  };
}

function generateVueComponent(
  componentName: string,
  props: Record<string, unknown>,
  children: string
): string {
  const propsString = generatePropsString(props);

  if (children) {
    return `<${componentName}${propsString}>\n  ${children}\n</${componentName}>`;
  }

  if (Object.keys(props).length === 0) {
    return `<${componentName} />`;
  }

  return `<${componentName}${propsString} />`;
}

function generatePropsString(props: Record<string, unknown>): string {
  if (Object.keys(props).length === 0) {
    return "";
  }

  const parts: string[] = [];

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value === "boolean") {
      if (value) {
        parts.push(key);
      }
    } else if (typeof value === "string") {
      parts.push(`${key}="${value}"`);
    } else if (typeof value === "number") {
      parts.push(`:${key}="${value}"`);
    } else if (typeof value === "object") {
      parts.push(`:${key}="${JSON.stringify(value).replace(/"/g, "'")}"`);
    }
  }

  return parts.length > 0 ? "\n  " + parts.join("\n  ") : "";
}

// Tool definition for MCP
export const generateVueComponentTool = {
  name: "generate_vue_component",
  description:
    "Generate Vue component code using Mozaic Design System (@mozaic-ds/vue-3)",
  inputSchema: {
    type: "object" as const,
    properties: {
      component: {
        type: "string",
        description: "Component type to generate (e.g., button, input, modal)",
      },
      props: {
        type: "object",
        description: "Component properties to apply",
      },
      children: {
        type: "string",
        description: "Content to place inside the component",
      },
    },
    required: ["component"],
  },
};
