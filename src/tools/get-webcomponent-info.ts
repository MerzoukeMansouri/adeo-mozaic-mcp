import type Database from "better-sqlite3";
import { getComponentBySlug } from "../db/queries.js";

export interface GetWebComponentInfoInput {
  component: string;
}

export interface WebComponentInfoOutput {
  name: string;
  tagName: string;
  description?: string;
  attributes: Array<{
    name: string;
    type?: string;
    default?: string;
    required: boolean;
    options?: string[];
    description?: string;
  }>;
  slots: Array<{
    name: string;
    description?: string;
  }>;
  events: Array<{
    name: string;
    payload?: string;
    description?: string;
  }>;
  cssProperties: string[];
  examples: Array<{
    title?: string;
    code: string;
  }>;
}

export function handleGetWebComponentInfo(
  db: Database.Database,
  input: GetWebComponentInfoInput
): { content: Array<{ type: "text"; text: string }> } {
  const { component } = input;

  // Normalize component name to slug (kebab-case)
  const slug = component.toLowerCase().replace(/^mozaic-/, "");

  const componentData = getComponentBySlug(db, slug);

  if (!componentData) {
    return {
      content: [
        {
          type: "text",
          text: `Web Component not found: ${component}. Try using the list_webcomponents tool to see available components.`,
        },
      ],
    };
  }

  // Check if component supports webcomponents framework
  const frameworks = componentData.frameworks || [];
  if (!frameworks.includes("webcomponents")) {
    return {
      content: [
        {
          type: "text",
          text: `Component "${component}" is not available as a web component. Available frameworks: ${frameworks.join(", ")}`,
        },
      ],
    };
  }

  // Filter examples for webcomponents
  const filteredExamples = (componentData.examples || [])
    .filter((ex) => ex.framework === "webcomponents")
    .map((ex) => ({
      title: ex.title,
      code: ex.code,
    }));

  // Build output
  const output: WebComponentInfoOutput = {
    name: componentData.name,
    tagName: componentData.slug,
    description: componentData.description,
    attributes: (componentData.props || []).map((p) => ({
      name: p.name,
      type: p.type,
      default: p.defaultValue,
      required: p.required || false,
      options: p.options,
      description: p.description,
    })),
    slots: (componentData.slots || []).map((s) => ({
      name: s.name,
      description: s.description,
    })),
    events: (componentData.events || []).map((e) => ({
      name: e.name,
      payload: e.payload,
      description: e.description,
    })),
    cssProperties: componentData.cssClasses || [],
    examples: filteredExamples,
  };

  // Add basic example if none found
  if (output.examples.length === 0) {
    const basicExample = generateBasicWebComponentExample(output.tagName);
    output.examples.push({ title: "Basic Usage", code: basicExample });
  }

  // Add formatted output with helpful information
  let text = `# ${output.name} (${output.tagName})\n\n`;

  if (output.description) {
    text += `${output.description}\n\n`;
  }

  // Attributes section
  if (output.attributes.length > 0) {
    text += `## Attributes\n\n`;
    for (const attr of output.attributes) {
      text += `- **${attr.name}**`;
      if (attr.type) text += ` (${attr.type})`;
      if (attr.required) text += ` *required*`;
      if (attr.default) text += ` - default: \`${attr.default}\``;
      if (attr.description) text += `\n  ${attr.description}`;
      if (attr.options && attr.options.length > 0) {
        text += `\n  Options: ${attr.options.map((o) => `\`${o}\``).join(", ")}`;
      }
      text += `\n`;
    }
    text += `\n`;
  }

  // Slots section
  if (output.slots.length > 0) {
    text += `## Slots\n\n`;
    for (const slot of output.slots) {
      text += `- **${slot.name}**`;
      if (slot.description) text += ` - ${slot.description}`;
      text += `\n`;
    }
    text += `\n`;
  }

  // Events section
  if (output.events.length > 0) {
    text += `## Events\n\n`;
    for (const event of output.events) {
      text += `- **${event.name}**`;
      if (event.payload) text += ` (payload: ${event.payload})`;
      if (event.description) text += `\n  ${event.description}`;
      text += `\n`;
    }
    text += `\n`;
  }

  // CSS Properties section
  if (output.cssProperties.length > 0) {
    text += `## CSS Custom Properties\n\n`;
    for (const prop of output.cssProperties) {
      text += `- \`${prop}\`\n`;
    }
    text += `\n`;
  }

  // Examples section
  if (output.examples.length > 0) {
    text += `## Examples\n\n`;
    for (const example of output.examples) {
      if (example.title) {
        text += `### ${example.title}\n\n`;
      }
      text += `\`\`\`html\n${example.code}\n\`\`\`\n\n`;
    }
  }

  // Installation
  text += `## Installation\n\n`;
  text += `\`\`\`javascript\n`;
  text += `import '@adeo/mozaic-web-components/${slug}.js';\n`;
  text += `\`\`\`\n\n`;

  // JSON output for programmatic use
  text += `---\n\n`;
  text += `**JSON Output:**\n\n`;
  text += `\`\`\`json\n${JSON.stringify(output, null, 2)}\n\`\`\``;

  return {
    content: [
      {
        type: "text",
        text,
      },
    ],
  };
}

// Generate a basic example
function generateBasicWebComponentExample(tagName: string): string {
  return `<${tagName}>\n  Content\n</${tagName}>`;
}

// Tool definition for MCP
export const getWebComponentInfoTool = {
  name: "get_webcomponent_info",
  description:
    "Get detailed information about a Mozaic Web Component including attributes, slots, events, CSS custom properties, and usage examples.",
  inputSchema: {
    type: "object" as const,
    properties: {
      component: {
        type: "string",
        description:
          "Web component name (e.g., 'button', 'card', 'mozaic-button'). Will be converted to tag name.",
      },
    },
    required: ["component"],
  },
};
