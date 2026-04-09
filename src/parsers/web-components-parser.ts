import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, basename } from "path";
import type { Component, ComponentProp, ComponentSlot, ComponentEvent } from "../db/queries.js";

interface CustomElementManifest {
  modules?: Array<{
    declarations?: Array<{
      kind?: string;
      name?: string;
      tagName?: string;
      description?: string;
      members?: Array<{
        kind?: string;
        name?: string;
        type?: { text?: string };
        default?: string;
        description?: string;
        attribute?: string;
        reflect?: boolean;
      }>;
      events?: Array<{
        name?: string;
        type?: { text?: string };
        description?: string;
      }>;
      slots?: Array<{
        name?: string;
        description?: string;
      }>;
      cssProperties?: Array<{
        name?: string;
        description?: string;
        default?: string;
      }>;
    }>;
  }>;
}

interface ParsedWebComponent {
  name: string;
  tagName: string;
  props: ComponentProp[];
  slots: ComponentSlot[];
  events: ComponentEvent[];
  cssProperties: string[];
  description?: string;
}

// Parse Custom Elements Manifest (CEM)
function parseCustomElementsManifest(basePath: string): ParsedWebComponent[] {
  const components: ParsedWebComponent[] = [];

  const manifestPaths = [
    join(basePath, "..", "..", "custom-elements.json"),
    join(basePath, "..", "custom-elements.json"),
    join(basePath, "custom-elements.json"),
    join(basePath, "..", "..", "custom-elements-manifest.json"),
  ];

  for (const manifestPath of manifestPaths) {
    if (existsSync(manifestPath)) {
      try {
        const content = readFileSync(manifestPath, "utf-8");
        const manifest: CustomElementManifest = JSON.parse(content);

        if (manifest.modules) {
          for (const module of manifest.modules) {
            if (module.declarations) {
              for (const declaration of module.declarations) {
                if (declaration.kind === "class" && declaration.tagName && declaration.name) {
                  const props: ComponentProp[] = [];
                  const events: ComponentEvent[] = [];
                  const slots: ComponentSlot[] = [];
                  const cssProperties: string[] = [];

                  // Extract properties
                  if (declaration.members) {
                    for (const member of declaration.members) {
                      if (member.kind === "field" && member.attribute) {
                        props.push({
                          name: member.name || "",
                          type: member.type?.text,
                          defaultValue: member.default,
                          description: member.description,
                          required: !member.default,
                        });
                      }
                    }
                  }

                  // Extract events
                  if (declaration.events) {
                    for (const event of declaration.events) {
                      if (event.name) {
                        events.push({
                          name: event.name,
                          payload: event.type?.text,
                          description: event.description,
                        });
                      }
                    }
                  }

                  // Extract slots
                  if (declaration.slots) {
                    for (const slot of declaration.slots) {
                      slots.push({
                        name: slot.name || "default",
                        description: slot.description,
                      });
                    }
                  }

                  // Extract CSS custom properties
                  if (declaration.cssProperties) {
                    for (const cssProp of declaration.cssProperties) {
                      if (cssProp.name) {
                        cssProperties.push(cssProp.name);
                      }
                    }
                  }

                  components.push({
                    name: declaration.name,
                    tagName: declaration.tagName,
                    description: declaration.description,
                    props,
                    slots,
                    events,
                    cssProperties,
                  });
                }
              }
            }
          }
        }

        console.log(`   ✓ Parsed custom elements manifest: ${components.length} components`);
        return components;
      } catch (error) {
        console.warn(`Warning: Could not parse manifest ${manifestPath}:`, error);
      }
    }
  }

  return components;
}

// Extract properties from TypeScript/JavaScript source
function extractPropsFromSource(content: string): ComponentProp[] {
  const props: ComponentProp[] = [];
  const seenProps = new Set<string>();

  // Pattern 1: @property() decorator (Lit)
  const propertyRegex =
    /@property\s*\(\s*\{([^}]*)\}\s*\)\s*(?:\/\*\*[\s\S]*?\*\/\s*)?(\w+)(\??)\s*:\s*([^;=\n]+)/g;
  let match;
  while ((match = propertyRegex.exec(content)) !== null) {
    const options = match[1];
    const propName = match[2];
    const isOptional = match[3] === "?";
    const propType = match[4].trim();

    if (!seenProps.has(propName)) {
      seenProps.add(propName);

      // Extract type from options
      const typeMatch = options.match(/type\s*:\s*(\w+)/);
      const attributeMatch = options.match(/attribute\s*:\s*['"`]([^'"`]+)['"`]/);
      // const reflectMatch = options.match(/reflect\s*:\s*(true|false)/);

      // Extract JSDoc comment before decorator
      const beforeDecorator = content.substring(0, match.index);
      const jsdocMatch = beforeDecorator.match(/\/\*\*\s*([\s\S]*?)\s*\*\/\s*$/);
      let description: string | undefined;
      if (jsdocMatch) {
        description = jsdocMatch[1]
          .replace(/^\s*\*\s*/gm, "")
          .replace(/\n/g, " ")
          .trim();
      }

      props.push({
        name: attributeMatch ? attributeMatch[1] : propName,
        type: typeMatch ? typeMatch[1] : propType,
        required: !isOptional,
        description,
      });
    }
  }

  // Pattern 2: static properties = { ... } (Lit)
  const staticPropsMatch = content.match(/static\s+properties\s*=\s*\{([\s\S]*?)\};/);
  if (staticPropsMatch) {
    const propsContent = staticPropsMatch[1];
    const propDefRegex = /(\w+)\s*:\s*\{([^}]*)\}/g;
    while ((match = propDefRegex.exec(propsContent)) !== null) {
      const propName = match[1];
      const propDef = match[2];

      if (!seenProps.has(propName)) {
        seenProps.add(propName);

        const typeMatch = propDef.match(/type\s*:\s*(\w+)/);
        const attributeMatch = propDef.match(/attribute\s*:\s*['"`]([^'"`]+)['"`]/);

        props.push({
          name: attributeMatch ? attributeMatch[1] : propName,
          type: typeMatch ? typeMatch[1] : undefined,
        });
      }
    }
  }

  // Pattern 3: static get properties() { return { ... } }
  const staticGetPropsMatch = content.match(
    /static\s+get\s+properties\s*\(\s*\)\s*\{[\s\S]*?return\s*\{([\s\S]*?)\}/
  );
  if (staticGetPropsMatch) {
    const propsContent = staticGetPropsMatch[1];
    const propDefRegex = /(\w+)\s*:\s*\{([^}]*)\}/g;
    while ((match = propDefRegex.exec(propsContent)) !== null) {
      const propName = match[1];
      const propDef = match[2];

      if (!seenProps.has(propName)) {
        seenProps.add(propName);

        const typeMatch = propDef.match(/type\s*:\s*(\w+)/);
        props.push({
          name: propName,
          type: typeMatch ? typeMatch[1] : undefined,
        });
      }
    }
  }

  return props;
}

// Extract events from source
function extractEventsFromSource(content: string): ComponentEvent[] {
  const events: ComponentEvent[] = [];
  const seenEvents = new Set<string>();

  // Pattern 1: dispatchEvent(new CustomEvent('event-name'))
  const customEventRegex = /dispatchEvent\s*\(\s*new\s+CustomEvent\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = customEventRegex.exec(content)) !== null) {
    const eventName = match[1];
    if (!seenEvents.has(eventName)) {
      seenEvents.add(eventName);
      events.push({ name: eventName });
    }
  }

  // Pattern 2: this.dispatchEvent(new Event('event-name'))
  const eventRegex = /dispatchEvent\s*\(\s*new\s+Event\s*\(\s*['"`]([^'"`]+)['"`]/g;
  while ((match = eventRegex.exec(content)) !== null) {
    const eventName = match[1];
    if (!seenEvents.has(eventName)) {
      seenEvents.add(eventName);
      events.push({ name: eventName });
    }
  }

  // Pattern 3: @event JSDoc tags
  const jsdocEventRegex = /@(?:fires?|event)\s+\{?([^}\s]+)\}?\s+(\w+)/g;
  while ((match = jsdocEventRegex.exec(content)) !== null) {
    const eventName = match[2];
    if (!seenEvents.has(eventName)) {
      seenEvents.add(eventName);
      events.push({
        name: eventName,
        payload: match[1],
      });
    }
  }

  return events;
}

// Extract slots from template/render
function extractSlotsFromSource(content: string): ComponentSlot[] {
  const slots: ComponentSlot[] = [];
  const seenSlots = new Set<string>();

  // Match <slot> tags in template literals or html`` strings
  const slotRegex = /<slot\s*(?:name=["']([^"']+)["'])?[^>]*>/g;
  let match;
  while ((match = slotRegex.exec(content)) !== null) {
    const slotName = match[1] || "default";
    if (!seenSlots.has(slotName)) {
      seenSlots.add(slotName);
      slots.push({ name: slotName });
    }
  }

  return slots;
}

// Extract CSS custom properties
function extractCssProperties(content: string): string[] {
  const cssProps: string[] = [];
  const seenProps = new Set<string>();

  // Match --property-name in CSS or static styles
  const cssVarRegex = /(--[a-z0-9-]+)/g;
  let match;
  while ((match = cssVarRegex.exec(content)) !== null) {
    const propName = match[1];
    if (!seenProps.has(propName)) {
      seenProps.add(propName);
      cssProps.push(propName);
    }
  }

  return cssProps;
}

// Parse TypeScript/JavaScript component file
function parseWebComponentFile(filePath: string): ParsedWebComponent | null {
  try {
    const content = readFileSync(filePath, "utf-8");
    const fileName = basename(filePath, ".ts").replace(/\.js$/, "");

    // Extract component name from @customElement decorator or class name
    let componentName = fileName;
    let tagName = fileName.toLowerCase();

    const customElementMatch = content.match(/@customElement\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/);
    if (customElementMatch) {
      tagName = customElementMatch[1];
      // Convert tag-name to ClassName
      componentName = tagName
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
    }

    // Extract class name if available
    const classMatch = content.match(/class\s+(\w+)\s+extends\s+(?:LitElement|HTMLElement)/);
    if (classMatch) {
      componentName = classMatch[1];
    }

    // Extract description from JSDoc
    let description: string | undefined;
    const jsdocMatch = content.match(/\/\*\*\s*([\s\S]*?)\s*\*\/\s*export\s+class/);
    if (jsdocMatch) {
      description = jsdocMatch[1]
        .replace(/^\s*\*\s*/gm, "")
        .replace(/@\w+.*$/gm, "")
        .replace(/\n/g, " ")
        .trim();
    }

    return {
      name: componentName,
      tagName,
      description,
      props: extractPropsFromSource(content),
      events: extractEventsFromSource(content),
      slots: extractSlotsFromSource(content),
      cssProperties: extractCssProperties(content),
    };
  } catch (error) {
    console.warn(`Warning: Could not parse ${filePath}:`, error);
    return null;
  }
}

// Parse Storybook stories for web components
function parseWebComponentStories(filePath: string): Array<{ title: string; code: string }> {
  const examples: Array<{ title: string; code: string }> = [];

  try {
    const content = readFileSync(filePath, "utf-8");

    // Match story exports with render functions
    const storyRegex = /export\s+const\s+(\w+)[\s\S]*?render:\s*\(([^)]*)\)\s*=>\s*html`([^`]*)`/g;
    let match;
    while ((match = storyRegex.exec(content)) !== null) {
      const storyName = match[1];
      const template = match[3];

      if (storyName !== "Default") {
        examples.push({
          title: storyName.replace(/([A-Z])/g, " $1").trim(),
          code: template.trim(),
        });
      }
    }

    // Also match simple template assignments
    const templateRegex = /template\s*:\s*html`([^`]+)`/g;
    while ((match = templateRegex.exec(content)) !== null) {
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

// Find component directories
function findComponentDirs(baseDir: string): string[] {
  const dirs: string[] = [];

  if (!existsSync(baseDir)) {
    return dirs;
  }

  const entries = readdirSync(baseDir);
  for (const entry of entries) {
    const fullPath = join(baseDir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory() && /^[a-z]/.test(entry)) {
      dirs.push(fullPath);
    }
  }

  return dirs;
}

// Infer component category
function inferCategory(componentName: string, tagName: string): string {
  const name = (componentName + tagName).toLowerCase();

  if (["button", "link"].some((n) => name.includes(n))) {
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
      "form",
      "datepicker",
      "dropdown",
    ].some((n) => name.includes(n))
  ) {
    return "form";
  }
  if (
    ["accordion", "breadcrumb", "menu", "nav", "pagination", "tabs", "stepper"].some((n) =>
      name.includes(n)
    )
  ) {
    return "navigation";
  }
  if (
    ["badge", "alert", "loader", "modal", "notification", "progress", "tooltip", "snackbar"].some(
      (n) => name.includes(n)
    )
  ) {
    return "feedback";
  }
  if (["card", "divider", "container", "grid", "stack"].some((n) => name.includes(n))) {
    return "layout";
  }
  if (
    ["table", "list", "heading", "text", "icon", "avatar", "chip", "tag"].some((n) =>
      name.includes(n)
    )
  ) {
    return "data-display";
  }

  return "other";
}

// Consolidate component data from multiple sources
function consolidateComponent(
  manifestData: ParsedWebComponent | undefined,
  sourceData: ParsedWebComponent | null,
  stories: Array<{ title: string; code: string }>
): Component | null {
  // Use manifest as primary source, fall back to source parsing
  const base = manifestData || sourceData;
  if (!base) return null;

  const component: Component = {
    name: base.name + " (Web Component)", // Make name unique to avoid conflicts with Vue/React
    slug: base.tagName,
    category: inferCategory(base.name, base.tagName),
    description: base.description,
    frameworks: ["webcomponents"],
    props: [],
    slots: [],
    events: [],
    examples: [],
    cssClasses: base.cssProperties || [],
  };

  // Consolidate props (deduplicate by name)
  const propMap = new Map<string, ComponentProp>();

  // Add manifest props first (higher priority)
  if (manifestData) {
    for (const prop of manifestData.props) {
      propMap.set(prop.name, prop);
    }
  }

  // Add source props if not already present
  if (sourceData) {
    for (const prop of sourceData.props) {
      if (!propMap.has(prop.name)) {
        propMap.set(prop.name, prop);
      }
    }
  }

  component.props = Array.from(propMap.values());

  // Consolidate events
  const eventMap = new Map<string, ComponentEvent>();
  if (manifestData) {
    for (const event of manifestData.events) {
      eventMap.set(event.name, event);
    }
  }
  if (sourceData) {
    for (const event of sourceData.events) {
      if (!eventMap.has(event.name)) {
        eventMap.set(event.name, event);
      }
    }
  }
  component.events = Array.from(eventMap.values());

  // Consolidate slots
  const slotMap = new Map<string, ComponentSlot>();
  if (manifestData) {
    for (const slot of manifestData.slots) {
      slotMap.set(slot.name, slot);
    }
  }
  if (sourceData) {
    for (const slot of sourceData.slots) {
      if (!slotMap.has(slot.name)) {
        slotMap.set(slot.name, slot);
      }
    }
  }
  component.slots = Array.from(slotMap.values());

  // Add examples from Storybook
  component.examples = stories.map((story) => ({
    framework: "webcomponents",
    title: story.title,
    code: story.code,
  }));

  return component;
}

export async function parseWebComponents(componentsPath: string): Promise<Component[]> {
  const components: Component[] = [];

  // Step 1: Parse Custom Elements Manifest
  const manifestComponents = parseCustomElementsManifest(componentsPath);
  const manifestMap = new Map<string, ParsedWebComponent>();
  for (const comp of manifestComponents) {
    manifestMap.set(comp.tagName, comp);
  }

  // Step 2: Parse component source files
  const componentDirs = findComponentDirs(componentsPath);

  for (const dir of componentDirs) {
    const dirName = basename(dir);

    // Try to find component file
    const possibleFiles = [
      join(dir, `${dirName}.ts`),
      join(dir, `${dirName}.js`),
      join(dir, "index.ts"),
      join(dir, "index.js"),
    ];

    let componentFile: string | null = null;
    for (const file of possibleFiles) {
      if (existsSync(file)) {
        componentFile = file;
        break;
      }
    }

    const sourceData = componentFile ? parseWebComponentFile(componentFile) : null;

    // Get manifest data if available (try by directory name as tag)
    // Directory names like "accordionlist" match tags like "m-accordion-list" or "m-accordionlist"
    const possibleTagNames = [
      `m-${dirName}`, // e.g., "m-accordionlist"
      `m-${dirName.replace(/([A-Z])/g, "-$1").toLowerCase()}`, // e.g., "m-accordion-list" for "accordionList"
      `mozaic-${dirName}`,
      dirName,
      sourceData?.tagName || "",
    ];

    let manifestData: ParsedWebComponent | undefined;
    for (const tagName of possibleTagNames) {
      if (manifestMap.has(tagName)) {
        manifestData = manifestMap.get(tagName);
        break;
      }
    }

    // Parse stories
    let stories: Array<{ title: string; code: string }> = [];
    const storyPatterns = [
      join(dir, `${dirName}.stories.ts`),
      join(dir, `${dirName}.stories.js`),
      join(dir, "stories", `${dirName}.stories.ts`),
    ];

    for (const storyPath of storyPatterns) {
      if (existsSync(storyPath)) {
        stories = parseWebComponentStories(storyPath);
        break;
      }
    }

    // Consolidate all data (manifest-only is ok if no source file found)
    const component = consolidateComponent(manifestData, sourceData, stories);
    if (component) {
      components.push(component);
    }
  }

  return components;
}
