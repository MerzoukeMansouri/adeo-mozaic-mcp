import type Database from "better-sqlite3";
import { getComponentBySlug } from "../db/queries.js";

export interface GenerateComponentInput {
  component: string;
  framework: "vue" | "react" | "html";
  props?: Record<string, unknown>;
  children?: string;
}

export function handleGenerateComponent(
  db: Database.Database,
  input: GenerateComponentInput
): { content: Array<{ type: "text"; text: string }> } {
  const { component, framework, props = {}, children = "" } = input;

  // Normalize component name
  const slug = component.replace(/^M/i, "").toLowerCase();
  const componentData = getComponentBySlug(db, slug);

  // Get component name (with M prefix for Vue/React)
  const componentName = componentData?.name || `M${component.charAt(0).toUpperCase()}${component.slice(1).toLowerCase()}`;

  let code: string;

  switch (framework) {
    case "vue":
      code = generateVueComponent(componentName, props, children);
      break;
    case "react":
      code = generateReactComponent(componentName, props, children);
      break;
    case "html":
      code = generateHtmlComponent(componentName, props, children, componentData?.cssClasses);
      break;
    default:
      return {
        content: [
          {
            type: "text",
            text: `Unsupported framework: ${framework}. Use vue, react, or html.`,
          },
        ],
      };
  }

  // Add import statement if applicable
  let output = "";

  if (framework === "vue") {
    output += `// Import statement\nimport { ${componentName} } from '@mozaic-ds/vue-3';\n\n`;
    output += `// Component usage\n${code}`;
  } else if (framework === "react") {
    output += `// Import statement\nimport { ${componentName} } from '@mozaic-ds/react';\n\n`;
    output += `// Component usage\n${code}`;
  } else {
    output += `<!-- Include Mozaic styles -->\n<link rel="stylesheet" href="@mozaic-ds/styles/css/mozaic.css">\n\n`;
    output += `<!-- Component markup -->\n${code}`;
  }

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
  const propsString = generatePropsString(props, "vue");

  if (children) {
    return `<${componentName}${propsString}>\n  ${children}\n</${componentName}>`;
  }

  if (Object.keys(props).length === 0) {
    return `<${componentName} />`;
  }

  return `<${componentName}${propsString} />`;
}

function generateReactComponent(
  componentName: string,
  props: Record<string, unknown>,
  children: string
): string {
  const propsString = generatePropsString(props, "react");

  if (children) {
    return `<${componentName}${propsString}>\n  ${children}\n</${componentName}>`;
  }

  if (Object.keys(props).length === 0) {
    return `<${componentName} />`;
  }

  return `<${componentName}${propsString} />`;
}

function generateHtmlComponent(
  componentName: string,
  props: Record<string, unknown>,
  children: string,
  cssClasses?: string[]
): string {
  // Convert component name to CSS class
  const baseClass = `mc-${componentName.replace(/^M/, "").toLowerCase()}`;

  // Build class list
  const classes = [baseClass];

  // Add modifier classes from props
  if (props.variant) {
    classes.push(`${baseClass}--${props.variant}`);
  }
  if (props.size) {
    classes.push(`${baseClass}--${props.size}`);
  }
  if (props.disabled) {
    classes.push(`${baseClass}--disabled`);
  }

  // Add any known CSS classes
  if (cssClasses && cssClasses.length > 0) {
    // Don't duplicate base class
    for (const cls of cssClasses) {
      if (!classes.includes(cls)) {
        classes.push(cls);
      }
    }
  }

  const classAttr = `class="${classes.join(" ")}"`;

  // Determine HTML element based on component type
  let element = "div";
  const lowerName = componentName.toLowerCase();
  if (lowerName.includes("button")) {
    element = "button";
  } else if (lowerName.includes("input")) {
    element = "input";
  } else if (lowerName.includes("link")) {
    element = "a";
  } else if (lowerName.includes("heading")) {
    element = "h2";
  }

  // Build attributes
  let attrs = classAttr;
  if (props.disabled) {
    attrs += " disabled";
  }
  if (props.href && element === "a") {
    attrs += ` href="${props.href}"`;
  }
  if (props.type && element === "button") {
    attrs += ` type="${props.type}"`;
  }

  if (element === "input") {
    return `<${element} ${attrs} />`;
  }

  return `<${element} ${attrs}>${children || "Content"}</${element}>`;
}

function generatePropsString(
  props: Record<string, unknown>,
  framework: "vue" | "react"
): string {
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
      if (framework === "vue") {
        parts.push(`:${key}="${value}"`);
      } else {
        parts.push(`${key}={${value}}`);
      }
    } else if (typeof value === "object") {
      if (framework === "vue") {
        parts.push(`:${key}="${JSON.stringify(value).replace(/"/g, "'")}"`);
      } else {
        parts.push(`${key}={${JSON.stringify(value)}}`);
      }
    }
  }

  return parts.length > 0 ? "\n  " + parts.join("\n  ") : "";
}

// Tool definition for MCP
export const generateComponentTool = {
  name: "generate_component",
  description:
    "Generate component code using Mozaic Design System for Vue, React, or HTML",
  inputSchema: {
    type: "object" as const,
    properties: {
      component: {
        type: "string",
        description: "Component type to generate (e.g., button, input, modal)",
      },
      framework: {
        type: "string",
        enum: ["vue", "react", "html"],
        description: "Target framework for code generation",
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
    required: ["component", "framework"],
  },
};
