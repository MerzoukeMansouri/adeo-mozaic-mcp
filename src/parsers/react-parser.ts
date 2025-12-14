import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, basename } from "path";
import type { Component, ComponentProp, ComponentEvent } from "../db/queries.js";

interface ParsedReactComponent {
  name: string;
  props: ComponentProp[];
  callbacks: ComponentEvent[];
  hasChildren: boolean;
}

// Extract const arrays like: const sizes = ['s', 'm', 'l'] as const
function extractConstArrays(content: string): Map<string, string[]> {
  const constArrays = new Map<string, string[]>();

  // Match: const sizes = ['s', 'm', 'l'] as const
  const constRegex = /const\s+(\w+)\s*=\s*\[([^\]]+)\]\s*as\s+const/g;
  let match;
  while ((match = constRegex.exec(content)) !== null) {
    const name = match[1];
    const values = match[2]
      .split(",")
      .map((s) => s.trim().replace(/['"]/g, ""))
      .filter((s) => s.length > 0);
    constArrays.set(name, values);
  }

  return constArrays;
}

// Extract props from a types file content
function extractPropsFromInterface(
  content: string,
  interfaceName: string,
  constArrays: Map<string, string[]>,
  allInterfaces: Map<string, string>
): ComponentProp[] {
  const props: ComponentProp[] = [];
  const seenProps = new Set<string>();

  // Find the target interface
  const interfaceRegex = new RegExp(
    `interface\\s+${interfaceName}\\s*(?:extends\\s+([^{]+))?\\s*\\{([\\s\\S]*?)\\}`,
    "g"
  );

  const match = interfaceRegex.exec(content);
  if (!match) return props;

  const extendsClause = match[1];
  const interfaceBody = match[2];

  // First, recursively get props from extended interfaces
  if (extendsClause) {
    const extendedInterfaces = extendsClause
      .split(",")
      .map((s) => s.trim().replace(/<[^>]+>/, "")) // Remove generics like Omit<...>
      .filter((s) => s.length > 0 && !s.startsWith("Omit") && !s.includes("HTMLAttributes"));

    for (const extInterface of extendedInterfaces) {
      const extProps = extractPropsFromInterface(content, extInterface, constArrays, allInterfaces);
      for (const prop of extProps) {
        if (!seenProps.has(prop.name)) {
          seenProps.add(prop.name);
          props.push(prop);
        }
      }
    }
  }

  // Parse props from this interface
  const propRegex = /(\w+)(\?)?:\s*([^;\n]+)/g;
  let propMatch;
  while ((propMatch = propRegex.exec(interfaceBody)) !== null) {
    const propName = propMatch[1];
    const isOptional = !!propMatch[2];
    let propType = propMatch[3].trim();

    // Skip already seen, callbacks, children
    if (seenProps.has(propName)) continue;
    if (propType.includes("=>") || propName.startsWith("on")) continue;
    if (propName === "children" || propName === "className") continue;

    seenProps.add(propName);

    // Check if type references a const array type (e.g., TButtonSize)
    let options: string[] | undefined;
    const typeRefMatch = propType.match(/^T(\w+)$/);
    if (typeRefMatch) {
      // Look for corresponding const array (e.g., TButtonSize -> sizes)
      const typeName = typeRefMatch[1].toLowerCase();
      for (const [constName, values] of constArrays) {
        if (typeName.includes(constName.toLowerCase())) {
          options = values;
          break;
        }
      }
    }

    // Handle inline union types
    if (propType.includes("|") && propType.includes("'")) {
      options = propType
        .split("|")
        .map((s) => s.trim().replace(/['"]/g, ""))
        .filter((s) => s && s !== "undefined");
    }

    props.push({
      name: propName,
      type: propType,
      required: !isOptional,
      options: options && options.length > 1 ? options : undefined,
    });
  }

  return props;
}

// Extract props from React component - checks both inline and external .types.ts files
function extractProps(content: string, componentDir?: string): ComponentProp[] {
  let props: ComponentProp[] = [];

  // First try to find imported Props type and load external types file
  if (componentDir) {
    // Match: import { IButtonProps } from './Button.types'
    const importMatch = content.match(/import\s*\{[^}]*?(I\w*Props)\s*[^}]*\}\s*from\s*['"]\.\/(\w+)\.types['"]/);

    if (importMatch) {
      const propsInterface = importMatch[1];
      const typesFileName = importMatch[2];
      const typesFilePath = join(componentDir, `${typesFileName}.types.ts`);

      if (existsSync(typesFilePath)) {
        try {
          const typesContent = readFileSync(typesFilePath, "utf-8");
          const constArrays = extractConstArrays(typesContent);
          const allInterfaces = new Map<string, string>();

          props = extractPropsFromInterface(typesContent, propsInterface, constArrays, allInterfaces);
        } catch (e) {
          // Fall through to inline extraction
        }
      }
    }
  }

  // Fallback: extract from inline interfaces in the component file
  if (props.length === 0) {
    const interfacePatterns = [
      /interface\s+\w*Props\w*\s*(?:extends[^{]+)?{([\s\S]*?)}/g,
      /type\s+\w*Props\w*\s*=\s*{([\s\S]*?)}/g,
    ];

    for (const pattern of interfacePatterns) {
      let interfaceMatch;
      while ((interfaceMatch = pattern.exec(content)) !== null) {
        const interfaceContent = interfaceMatch[1];

        const propRegex = /(\w+)(\?)?:\s*([^;\n]+)/g;
        let match;
        while ((match = propRegex.exec(interfaceContent)) !== null) {
          const propName = match[1];
          const isOptional = !!match[2];
          let propType = match[3].trim();

          if (propType.includes("=>") || propName.startsWith("on")) continue;
          if (propName === "children") continue;

          if (propType.includes("|")) {
            const options = propType
              .split("|")
              .map((s) => s.trim().replace(/['"]/g, ""))
              .filter((s) => s && s !== "undefined");

            props.push({
              name: propName,
              type: "string",
              required: !isOptional,
              options: options.length > 1 ? options : undefined,
            });
          } else {
            props.push({
              name: propName,
              type: propType.toLowerCase(),
              required: !isOptional,
            });
          }
        }
      }
    }
  }

  return props;
}

// Extract callback props as events
function extractCallbacks(content: string): ComponentEvent[] {
  const events: ComponentEvent[] = [];
  const seenEvents = new Set<string>();

  // Match callback props: onSomething?: (args) => void
  const callbackPatterns = [
    /(\bon[A-Z]\w*)\??:\s*\([^)]*\)\s*=>\s*\w+/g,
    /(\bon[A-Z]\w*)\??:\s*\w*EventHandler/g,
  ];

  for (const pattern of callbackPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const eventName = match[1];
      if (!seenEvents.has(eventName)) {
        seenEvents.add(eventName);
        events.push({
          name: eventName,
          description: `${eventName.replace(/^on/, "")} event callback`,
        });
      }
    }
  }

  return events;
}

// Check if component accepts children
function hasChildrenProp(content: string): boolean {
  return (
    content.includes("children") ||
    content.includes("PropsWithChildren") ||
    content.includes("ReactNode")
  );
}

// Extract CSS classes from component
function extractCssClasses(content: string): string[] {
  const classes: string[] = [];
  const seenClasses = new Set<string>();

  // Match mc- prefixed classes (Mozaic convention)
  const classRegex = /['"`](mc-[a-z0-9-]+)['"`]/g;
  let match;
  while ((match = classRegex.exec(content)) !== null) {
    if (!seenClasses.has(match[1])) {
      seenClasses.add(match[1]);
      classes.push(match[1]);
    }
  }

  return classes;
}

function parseReactFile(filePath: string, componentDir: string): ParsedReactComponent | null {
  try {
    const content = readFileSync(filePath, "utf-8");
    const fileName = basename(filePath, ".tsx");

    // Also try to extract callbacks from types file
    let callbacks = extractCallbacks(content);
    const typesFilePath = join(componentDir, `${fileName}.types.ts`);
    if (existsSync(typesFilePath)) {
      const typesContent = readFileSync(typesFilePath, "utf-8");
      callbacks = [...callbacks, ...extractCallbacks(typesContent)];
    }

    return {
      name: fileName,
      props: extractProps(content, componentDir),
      callbacks,
      hasChildren: hasChildrenProp(content),
    };
  } catch (error) {
    console.warn(`Warning: Could not parse ${filePath}:`, error);
    return null;
  }
}

// Parse storybook stories for examples
function parseStoriesFile(
  filePath: string
): Array<{ title: string; code: string }> {
  const examples: Array<{ title: string; code: string }> = [];

  try {
    const content = readFileSync(filePath, "utf-8");

    // First, find all exported story names
    const exportedStories: string[] = [];
    const exportRegex = /export\s+const\s+(\w+)\s*=/g;
    let exportMatch;
    while ((exportMatch = exportRegex.exec(content)) !== null) {
      const storyName = exportMatch[1];
      // Skip default export and non-story exports
      if (storyName !== "default" && storyName !== "Default" && /^[A-Z]/.test(storyName)) {
        exportedStories.push(storyName);
      }
    }

    // For each story, find its args (React CSF format: StoryName.args = {...})
    for (const storyName of exportedStories) {
      // Match StoryName.args = {...} - handle nested objects with balanced braces
      const argsPattern = new RegExp(`${storyName}\\.args\\s*=\\s*\\{([^}]*(?:\\{[^}]*\\}[^}]*)*)\\}`, "s");
      const argsMatch = content.match(argsPattern);

      if (argsMatch) {
        examples.push({
          title: storyName.replace(/([A-Z])/g, " $1").trim(),
          code: argsMatch[1].trim(),
        });
      }
    }

    // Also try inline args format: export const Story = { args: {...} }
    const inlineArgsRegex = /export\s+const\s+(\w+)\s*=\s*\{[\s\S]*?args\s*:\s*\{([^}]*)\}/g;
    let match;
    while ((match = inlineArgsRegex.exec(content)) !== null) {
      const storyName = match[1];
      const args = match[2];

      // Skip Default story and already captured stories
      if (storyName !== "Default" && !exportedStories.includes(storyName)) {
        examples.push({
          title: storyName.replace(/([A-Z])/g, " $1").trim(),
          code: args.trim(),
        });
      }
    }

    // Also try to extract render functions
    const renderRegex = /render\s*:\s*\([^)]*\)\s*=>\s*(<[\s\S]*?>)/g;
    while ((match = renderRegex.exec(content)) !== null) {
      examples.push({
        title: "Example",
        code: match[1].trim(),
      });
    }
  } catch (error) {
    console.warn(`Warning: Could not parse stories ${filePath}:`, error);
  }

  return examples;
}

function findComponentDirs(baseDir: string): string[] {
  const dirs: string[] = [];

  if (!existsSync(baseDir)) {
    return dirs;
  }

  const entries = readdirSync(baseDir);
  for (const entry of entries) {
    const fullPath = join(baseDir, entry);
    const stat = statSync(fullPath);

    // React components typically use PascalCase directory names
    if (stat.isDirectory() && /^[A-Z]/.test(entry)) {
      dirs.push(fullPath);
    }
  }

  return dirs;
}

// Component category mapping based on name patterns
function inferCategory(componentName: string): string {
  const name = componentName.toLowerCase();

  if (
    ["button", "link", "optionbutton", "optioncard"].some((n) =>
      name.includes(n)
    )
  ) {
    return "action";
  }
  if (
    [
      "input",
      "select",
      "checkbox",
      "radio",
      "toggle",
      "textarea",
      "field",
      "autocomplete",
      "datepicker",
      "dropdown",
      "fileuploader",
      "password",
      "phone",
      "quantity",
    ].some((n) => name.includes(n))
  ) {
    return "form";
  }
  if (
    [
      "accordion",
      "breadcrumb",
      "menu",
      "pagination",
      "sidebar",
      "stepper",
      "tabs",
    ].some((n) => name.includes(n))
  ) {
    return "navigation";
  }
  if (
    [
      "badge",
      "flag",
      "loader",
      "modal",
      "notification",
      "progress",
      "tooltip",
    ].some((n) => name.includes(n))
  ) {
    return "feedback";
  }
  if (["card", "divider", "layer"].some((n) => name.includes(n))) {
    return "layout";
  }
  if (
    ["table", "heading", "hero", "listbox", "rating", "tag"].some((n) =>
      name.includes(n)
    )
  ) {
    return "data-display";
  }

  return "other";
}

export async function parseReactComponents(
  componentsPath: string
): Promise<Component[]> {
  const components: Component[] = [];

  const componentDirs = findComponentDirs(componentsPath);

  for (const dir of componentDirs) {
    const componentName = basename(dir);

    // React components are typically named Component.tsx or index.tsx
    const possibleFiles = [
      join(dir, `${componentName}.tsx`),
      join(dir, "index.tsx"),
    ];

    let tsxFile: string | null = null;
    for (const file of possibleFiles) {
      if (existsSync(file)) {
        tsxFile = file;
        break;
      }
    }

    if (tsxFile) {
      const parsed = parseReactFile(tsxFile, dir);

      if (parsed) {
        const component: Component = {
          name: componentName,
          slug: componentName.toLowerCase(),
          category: inferCategory(componentName),
          frameworks: ["react"],
          props: parsed.props,
          slots: parsed.hasChildren
            ? [{ name: "children", description: "Component children" }]
            : [],
          events: parsed.callbacks,
          examples: [],
          cssClasses: [],
        };

        // Try to find stories file
        const storiesPatterns = [
          join(dir, "stories", `${componentName}.stories.tsx`),
          join(dir, `${componentName}.stories.tsx`),
          join(dir, "stories", "index.stories.tsx"),
        ];

        for (const storiesPath of storiesPatterns) {
          if (existsSync(storiesPath)) {
            const stories = parseStoriesFile(storiesPath);
            component.examples?.push(
              ...stories.map((s) => ({
                framework: "react",
                title: s.title,
                code: s.code,
              }))
            );
            break;
          }
        }

        // Also check for stories directory
        const storiesDir = join(dir, "stories");
        if (existsSync(storiesDir)) {
          const storyFiles = readdirSync(storiesDir).filter((f) =>
            f.endsWith(".stories.tsx")
          );
          for (const storyFile of storyFiles) {
            const stories = parseStoriesFile(join(storiesDir, storyFile));
            component.examples?.push(
              ...stories.map((s) => ({
                framework: "react",
                title: s.title,
                code: s.code,
              }))
            );
          }
        }

        // Extract CSS classes from the TSX file
        const tsxContent = readFileSync(tsxFile, "utf-8");
        component.cssClasses = extractCssClasses(tsxContent);

        components.push(component);
      }
    }
  }

  return components;
}

