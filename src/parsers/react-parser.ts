import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, basename } from "path";
import type { Component, ComponentProp, ComponentEvent } from "../db/queries.js";

interface ParsedReactComponent {
  name: string;
  props: ComponentProp[];
  callbacks: ComponentEvent[];
  hasChildren: boolean;
}

// Extract props from React component TypeScript interface
function extractProps(content: string): ComponentProp[] {
  const props: ComponentProp[] = [];

  // Match Props interface: interface ButtonProps { ... } or type ButtonProps = { ... }
  const interfacePatterns = [
    /interface\s+\w*Props\w*\s*(?:extends[^{]+)?{([\s\S]*?)}/g,
    /type\s+\w*Props\w*\s*=\s*{([\s\S]*?)}/g,
  ];

  for (const pattern of interfacePatterns) {
    let interfaceMatch;
    while ((interfaceMatch = pattern.exec(content)) !== null) {
      const interfaceContent = interfaceMatch[1];

      // Match individual prop definitions: propName?: type;
      const propRegex = /(\w+)(\?)?:\s*([^;\n]+)/g;
      let match;
      while ((match = propRegex.exec(interfaceContent)) !== null) {
        const propName = match[1];
        const isOptional = !!match[2];
        let propType = match[3].trim();

        // Skip callback props (they'll be extracted as events)
        if (propType.includes("=>") || propName.startsWith("on")) {
          continue;
        }

        // Skip children prop (handled separately)
        if (propName === "children") {
          continue;
        }

        // Clean up complex types
        if (propType.includes("|")) {
          // Union type - extract as options
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

  // Also check for destructured props in function component
  const destructuredMatch = content.match(
    /(?:export\s+)?(?:const|function)\s+\w+\s*[=:]\s*(?:\w+\s*=>|\([^)]*\)\s*(?::\s*\w+)?\s*=>|function\s*\([^)]*\))/
  );

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

function parseReactFile(filePath: string): ParsedReactComponent | null {
  try {
    const content = readFileSync(filePath, "utf-8");
    const fileName = basename(filePath, ".tsx");

    return {
      name: fileName,
      props: extractProps(content),
      callbacks: extractCallbacks(content),
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

    // Match story exports
    const storyRegex = /export\s+const\s+(\w+)[\s\S]*?args\s*:\s*{([^}]*)}/g;
    let match;
    while ((match = storyRegex.exec(content)) !== null) {
      const storyName = match[1];
      const args = match[2];

      // Skip Default story as it's usually just basic usage
      if (storyName !== "Default") {
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
      const parsed = parseReactFile(tsxFile);

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

