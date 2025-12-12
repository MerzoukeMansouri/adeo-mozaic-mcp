import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, basename } from "path";
import type { Component, ComponentProp, ComponentSlot, ComponentEvent, ComponentExample } from "../db/queries.js";

interface ParsedVueComponent {
  name: string;
  props: ComponentProp[];
  slots: ComponentSlot[];
  events: ComponentEvent[];
}

// Extract props from Vue component script
function extractProps(content: string): ComponentProp[] {
  const props: ComponentProp[] = [];

  // Match defineProps or props option
  const propsPatterns = [
    // defineProps<{...}>() or defineProps({...})
    /defineProps[<\(][\s\S]*?[>\)]\s*\(/g,
    // props: { ... }
    /props\s*:\s*{([\s\S]*?)}\s*[,}]/g,
    // @Prop decorator
    /@Prop\s*\(([^)]*)\)\s*(\w+)/g,
  ];

  // Simple prop extraction from props object
  const propsMatch = content.match(/props\s*:\s*{([\s\S]*?)}\s*(?:,|\n\s*\w)/);
  if (propsMatch) {
    const propsContent = propsMatch[1];

    // Match individual prop definitions
    const propRegex = /(\w+)\s*:\s*{([^}]*)}/g;
    let match;
    while ((match = propRegex.exec(propsContent)) !== null) {
      const propName = match[1];
      const propDef = match[2];

      const prop: ComponentProp = {
        name: propName,
      };

      // Extract type
      const typeMatch = propDef.match(/type\s*:\s*(\w+)/);
      if (typeMatch) {
        prop.type = typeMatch[1].toLowerCase();
      }

      // Extract default
      const defaultMatch = propDef.match(/default\s*:\s*(?:['"`]([^'"`]*)['"`]|(\w+))/);
      if (defaultMatch) {
        prop.defaultValue = defaultMatch[1] || defaultMatch[2];
      }

      // Extract required
      const requiredMatch = propDef.match(/required\s*:\s*(true|false)/);
      if (requiredMatch) {
        prop.required = requiredMatch[1] === "true";
      }

      // Extract validator options (for enum-like props)
      const validatorMatch = propDef.match(/validator\s*:\s*\(?\w+\)?\s*=>\s*\[([^\]]+)\]/);
      if (validatorMatch) {
        prop.options = validatorMatch[1]
          .split(",")
          .map((s) => s.trim().replace(/['"`]/g, ""));
      }

      props.push(prop);
    }
  }

  // TypeScript interface-based props
  const interfaceMatch = content.match(/interface\s+\w*Props\w*\s*{([\s\S]*?)}/);
  if (interfaceMatch && props.length === 0) {
    const interfaceContent = interfaceMatch[1];
    const propRegex = /(\w+)(\?)?:\s*([^;\n]+)/g;
    let match;
    while ((match = propRegex.exec(interfaceContent)) !== null) {
      props.push({
        name: match[1],
        type: match[3].trim(),
        required: !match[2],
      });
    }
  }

  return props;
}

// Extract slots from template
function extractSlots(content: string): ComponentSlot[] {
  const slots: ComponentSlot[] = [];
  const seenSlots = new Set<string>();

  // Match <slot> tags
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

// Extract emitted events
function extractEvents(content: string): ComponentEvent[] {
  const events: ComponentEvent[] = [];
  const seenEvents = new Set<string>();

  // Match emit calls
  const emitPatterns = [
    /emit\s*\(\s*['"`]([^'"`]+)['"`]/g,
    /\$emit\s*\(\s*['"`]([^'"`]+)['"`]/g,
    /defineEmits\s*<?\s*\[?\s*['"`]([^'"`\]]+)['"`]/g,
  ];

  for (const pattern of emitPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const eventName = match[1];
      if (!seenEvents.has(eventName)) {
        seenEvents.add(eventName);
        events.push({ name: eventName });
      }
    }
  }

  // Match emits option
  const emitsMatch = content.match(/emits\s*:\s*\[([\s\S]*?)\]/);
  if (emitsMatch) {
    const emitsContent = emitsMatch[1];
    const eventRegex = /['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = eventRegex.exec(emitsContent)) !== null) {
      if (!seenEvents.has(match[1])) {
        seenEvents.add(match[1]);
        events.push({ name: match[1] });
      }
    }
  }

  return events;
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

function parseVueFile(filePath: string): ParsedVueComponent | null {
  try {
    const content = readFileSync(filePath, "utf-8");
    const fileName = basename(filePath, ".vue");

    return {
      name: fileName,
      props: extractProps(content),
      slots: extractSlots(content),
      events: extractEvents(content),
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

    // Also try to extract template strings
    const templateRegex = /template\s*:\s*`([^`]+)`/g;
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

function findComponentDirs(baseDir: string): string[] {
  const dirs: string[] = [];

  if (!existsSync(baseDir)) {
    return dirs;
  }

  const entries = readdirSync(baseDir);
  for (const entry of entries) {
    const fullPath = join(baseDir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory() && entry.startsWith("M")) {
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

export async function parseVueComponents(
  componentsPath: string
): Promise<Component[]> {
  const components: Component[] = [];

  const componentDirs = findComponentDirs(componentsPath);

  for (const dir of componentDirs) {
    const componentName = basename(dir);
    const vueFile = join(dir, `${componentName}.vue`);

    if (existsSync(vueFile)) {
      const parsed = parseVueFile(vueFile);

      if (parsed) {
        const component: Component = {
          name: parsed.name,
          slug: parsed.name.replace(/^M/, "").toLowerCase(),
          category: inferCategory(parsed.name),
          frameworks: ["vue"],
          props: parsed.props,
          slots: parsed.slots,
          events: parsed.events,
          examples: [],
          cssClasses: [],
        };

        // Try to find stories file
        const storiesPath = join(dir, "stories");
        if (existsSync(storiesPath)) {
          const storyFiles = readdirSync(storiesPath).filter((f) =>
            f.endsWith(".stories.ts")
          );
          for (const storyFile of storyFiles) {
            const stories = parseStoriesFile(join(storiesPath, storyFile));
            component.examples?.push(
              ...stories.map((s) => ({
                framework: "vue",
                title: s.title,
                code: s.code,
              }))
            );
          }
        }

        // Extract CSS classes from the Vue file
        const vueContent = readFileSync(vueFile, "utf-8");
        component.cssClasses = extractCssClasses(vueContent);

        components.push(component);
      }
    }
  }

  return components;
}

// Default component list based on Mozaic documentation
export const MOZAIC_COMPONENTS: Partial<Component>[] = [
  { name: "MButton", slug: "button", category: "action", description: "Button component for user actions" },
  { name: "MLink", slug: "link", category: "action", description: "Link component for navigation" },
  { name: "MOptionButton", slug: "optionbutton", category: "action", description: "Option button for selections" },
  { name: "MOptionCard", slug: "optioncard", category: "action", description: "Option card for visual selections" },
  { name: "MTextInput", slug: "textinput", category: "form", description: "Text input field" },
  { name: "MTextArea", slug: "textarea", category: "form", description: "Multi-line text input" },
  { name: "MSelect", slug: "select", category: "form", description: "Select dropdown" },
  { name: "MCheckbox", slug: "checkbox", category: "form", description: "Checkbox input" },
  { name: "MRadio", slug: "radio", category: "form", description: "Radio button input" },
  { name: "MToggle", slug: "toggle", category: "form", description: "Toggle switch" },
  { name: "MField", slug: "field", category: "form", description: "Form field wrapper" },
  { name: "MAutocomplete", slug: "autocomplete", category: "form", description: "Autocomplete input" },
  { name: "MDatepicker", slug: "datepicker", category: "form", description: "Date picker input" },
  { name: "MDropdown", slug: "dropdown", category: "form", description: "Dropdown select" },
  { name: "MFileUploader", slug: "fileuploader", category: "form", description: "File upload component" },
  { name: "MPasswordInput", slug: "passwordinput", category: "form", description: "Password input field" },
  { name: "MPhoneNumberInput", slug: "phonenumberinput", category: "form", description: "Phone number input" },
  { name: "MQuantitySelector", slug: "quantityselector", category: "form", description: "Quantity selector" },
  { name: "MAccordion", slug: "accordion", category: "navigation", description: "Accordion component" },
  { name: "MBreadcrumb", slug: "breadcrumb", category: "navigation", description: "Breadcrumb navigation" },
  { name: "MBuiltInMenu", slug: "builtinmenu", category: "navigation", description: "Built-in menu" },
  { name: "MPagination", slug: "pagination", category: "navigation", description: "Pagination component" },
  { name: "MSidebar", slug: "sidebar", category: "navigation", description: "Sidebar navigation" },
  { name: "MStepper", slug: "stepper", category: "navigation", description: "Step indicator" },
  { name: "MTabs", slug: "tabs", category: "navigation", description: "Tabs component" },
  { name: "MBadge", slug: "badge", category: "feedback", description: "Badge indicator" },
  { name: "MFlag", slug: "flag", category: "feedback", description: "Flag/banner component" },
  { name: "MLoader", slug: "loader", category: "feedback", description: "Loading indicator" },
  { name: "MModal", slug: "modal", category: "feedback", description: "Modal dialog" },
  { name: "MNotification", slug: "notification", category: "feedback", description: "Notification component" },
  { name: "MProgressBar", slug: "progressbar", category: "feedback", description: "Progress bar" },
  { name: "MTooltip", slug: "tooltip", category: "feedback", description: "Tooltip component" },
  { name: "MCard", slug: "card", category: "layout", description: "Card container" },
  { name: "MDivider", slug: "divider", category: "layout", description: "Visual divider" },
  { name: "MLayer", slug: "layer", category: "layout", description: "Layer/overlay component" },
  { name: "MDataTable", slug: "datatable", category: "data-display", description: "Data table" },
  { name: "MHeading", slug: "heading", category: "data-display", description: "Heading typography" },
  { name: "MHero", slug: "hero", category: "data-display", description: "Hero section" },
  { name: "MListbox", slug: "listbox", category: "data-display", description: "Listbox component" },
  { name: "MRatingStars", slug: "ratingstars", category: "data-display", description: "Star rating" },
  { name: "MTag", slug: "tag", category: "data-display", description: "Tag/label component" },
];
