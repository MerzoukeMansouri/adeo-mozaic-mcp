import type Database from "better-sqlite3";
import { getComponentBySlug } from "../db/queries.js";

export interface GenerateReactComponentInput {
  component: string;
  props?: Record<string, unknown>;
  children?: string;
}

export function handleGenerateReactComponent(
  db: Database.Database,
  input: GenerateReactComponentInput
): { content: Array<{ type: "text"; text: string }> } {
  const { component, props = {}, children = "" } = input;

  // Normalize component name
  const slug = component.replace(/^M/i, "").toLowerCase();
  const componentData = getComponentBySlug(db, slug);

  // Get component name (React components use same naming as Vue in Mozaic)
  const componentName =
    componentData?.name ||
    `M${component.charAt(0).toUpperCase()}${component.slice(1).toLowerCase()}`;

  const code = generateReactComponent(componentName, props, children);

  let output = `// Import statement\nimport { ${componentName} } from '@mozaic-ds/react';\n\n`;
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

function generateReactComponent(
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
      parts.push(`${key}={${value}}`);
    } else if (typeof value === "object") {
      parts.push(`${key}={${JSON.stringify(value)}}`);
    }
  }

  return parts.length > 0 ? "\n  " + parts.join("\n  ") : "";
}

// Tool definition for MCP
export const generateReactComponentTool = {
  name: "generate_react_component",
  description:
    "Generate React component code using Mozaic Design System (@mozaic-ds/react)",
  inputSchema: {
    type: "object" as const,
    properties: {
      component: {
        type: "string",
        description: "Component type to generate (e.g., Button, TextInput, Modal)",
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
