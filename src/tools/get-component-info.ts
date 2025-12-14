import type Database from "better-sqlite3";
import { getComponentBySlug } from "../db/queries.js";

export interface GetComponentInfoInput {
  component: string;
  framework?: "vue" | "react" | "html";
}

export interface ComponentInfoOutput {
  name: string;
  description?: string;
  props: Array<{
    name: string;
    type?: string;
    default?: string;
    required: boolean;
    options?: string[];
    description?: string;
  }>;
  slots: string[];
  events: string[];
  examples: Array<{
    title?: string;
    code: string;
  }>;
  cssClasses: string[];
  relatedComponents?: string[];
}

export function handleGetComponentInfo(
  db: Database.Database,
  input: GetComponentInfoInput
): { content: Array<{ type: "text"; text: string }> } {
  const { component, framework = "vue" } = input;

  // Normalize component name (remove M prefix if present, lowercase)
  const slug = component.replace(/^M/i, "").toLowerCase();

  const componentData = getComponentBySlug(db, slug);

  if (!componentData) {
    return {
      content: [
        {
          type: "text",
          text: `Component not found: ${component}. Try using the list_components tool to see available components.`,
        },
      ],
    };
  }

  // Filter examples by framework
  const filteredExamples = (componentData.examples || [])
    .filter((ex) => ex.framework === framework)
    .map((ex) => ({
      title: ex.title,
      code: ex.code,
    }));

  // Build output
  const output: ComponentInfoOutput = {
    name: componentData.name,
    description: componentData.description,
    props: (componentData.props || []).map((p) => ({
      name: p.name,
      type: p.type,
      default: p.defaultValue,
      required: p.required || false,
      options: p.options,
      description: p.description,
    })),
    slots: (componentData.slots || []).map((s) => s.name),
    events: (componentData.events || []).map((e) => e.name),
    examples: filteredExamples,
    cssClasses: componentData.cssClasses || [],
  };

  // Add basic example if none found
  if (output.examples.length === 0) {
    const basicExample = generateBasicExample(componentData.name, framework);
    if (basicExample) {
      output.examples.push({ title: "Basic Usage", code: basicExample });
    }
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(output, null, 2),
      },
    ],
  };
}

// Generate a basic example if none exist
function generateBasicExample(componentName: string, framework: string): string | null {
  const tag = componentName;

  switch (framework) {
    case "vue":
      return `<${tag}>Content</${tag}>`;
    case "react":
      return `<${tag}>Content</${tag}>`;
    case "html": {
      const cssClass = `mc-${componentName.replace(/^M/, "").toLowerCase()}`;
      return `<div class="${cssClass}">Content</div>`;
    }
    default:
      return null;
  }
}

// Tool definition for MCP
export const getComponentInfoTool = {
  name: "get_component_info",
  description:
    "Get detailed information about a Mozaic framework component including props, slots, events, and examples. For CSS-only utilities (Flexy, Container, Margin, Padding), use get_css_utility instead.",
  inputSchema: {
    type: "object" as const,
    properties: {
      component: {
        type: "string",
        description: "Component name (e.g., 'button', 'modal', 'MButton', 'accordion')",
      },
      framework: {
        type: "string",
        enum: ["vue", "react", "html"],
        default: "vue",
        description: "Framework for code examples",
      },
    },
    required: ["component"],
  },
};
