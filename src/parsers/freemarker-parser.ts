import { join, basename } from "path";
import { readdirSync, readFileSync, statSync } from "fs";

interface ParsedProp {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default_value: string | null;
}

interface Component {
  name: string;
  slug: string;
  category: string;
  description: string;
  frameworks: string[];
  props: ParsedProp[];
  slots: never[];
  events: never[];
  css_classes: string[];
  examples: never[];
}

/**
 * Parser for Mozaic Freemarker macros
 *
 * Parses Freemarker (.ftl) template files and associated JSON token files
 * to extract component information.
 *
 * Structure:
 * - mozaic-freemarker/src/main/resources/macros/mozaic/*.ftl - component macros
 * - js/tokens/*.json - JSON files with class name tokens
 *
 * Each .ftl macro defines:
 * - Macro name and parameters via <#macro name param1={} param2...>
 * - Documentation comments describing configuration options
 * - HTML structure with Mozaic CSS classes
 */

interface FreemarkerMacro {
  name: string;
  filePath: string;
  content: string;
  tokenData: Record<string, string> | null;
}

interface ParsedParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue: string | null;
}

/**
 * Find all .ftl macro files in the macros directory
 */
function findMacroFiles(macrosPath: string): string[] {
  const mozaicPath = join(macrosPath, "mozaic");

  try {
    const files = readdirSync(mozaicPath);
    return files
      .filter(
        (file) => file.endsWith(".ftl") && file !== "common-macro.ftl" && file !== "icons.ftl"
      )
      .map((file) => join(mozaicPath, file));
  } catch (error) {
    console.error(`Failed to read macros directory: ${macrosPath}`, error);
    return [];
  }
}

/**
 * Load JSON token file for a component if it exists
 */
function loadTokenFile(tokensPath: string, componentName: string): Record<string, string> | null {
  const tokenFilePath = join(tokensPath, `${componentName}.json`);

  try {
    const content = readFileSync(tokenFilePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Extract macro name from .ftl file content
 * Example: <#macro button config={} dataSup...> => "button"
 */
function extractMacroName(content: string): string | null {
  const macroMatch = content.match(/<#macro\s+(\w+)\s+/);
  return macroMatch ? macroMatch[1] : null;
}

/**
 * Extract parameter documentation from comment block
 * Parses the configuration object structure from comments
 */
function extractParametersFromComments(content: string): ParsedParameter[] {
  const params: ParsedParameter[] = [];

  // Look for configuration object in comments
  // Example: "color": "standard", // optional - "standard" (default) | "accent"
  const configBlockMatch = content.match(/<#--[\s\S]*?<#assign\s+\w+\s*=\s*{([\s\S]*?)}/);

  if (configBlockMatch) {
    const configContent = configBlockMatch[1];
    const paramMatches = configContent.matchAll(
      /"(\w+)":\s*([^,\n]+),?\s*\/\/\s*(optional|required)?\s*-?\s*([^\n]+)?/g
    );

    for (const match of paramMatches) {
      const [, name, defaultVal, requiredFlag, description] = match;

      params.push({
        name,
        type: inferType(defaultVal.trim()),
        description: description?.trim() || "",
        required: requiredFlag === "required",
        defaultValue: cleanDefaultValue(defaultVal.trim()),
      });
    }
  }

  // Also look for nested config objects (like icon: { ... })
  const nestedConfigMatches = content.matchAll(/"(\w+)":\s*{([^}]+)}/g);
  for (const match of nestedConfigMatches) {
    const [, name, nestedContent] = match;

    params.push({
      name,
      type: "object",
      description: `Nested configuration object for ${name}`,
      required: false,
      defaultValue: null,
    });

    // Parse nested properties
    const nestedParams = nestedContent.matchAll(
      /"(\w+)":\s*([^,\n]+),?\s*\/\/\s*(optional|required)?\s*-?\s*([^\n]+)?/g
    );
    for (const nestedMatch of nestedParams) {
      const [, nestedName, nestedDefaultVal, nestedRequiredFlag, nestedDescription] = nestedMatch;

      params.push({
        name: `${name}.${nestedName}`,
        type: inferType(nestedDefaultVal.trim()),
        description: nestedDescription?.trim() || "",
        required: nestedRequiredFlag === "required",
        defaultValue: cleanDefaultValue(nestedDefaultVal.trim()),
      });
    }
  }

  return params;
}

/**
 * Infer parameter type from default value
 */
function inferType(value: string): string {
  if (value === "true" || value === "false") return "boolean";
  if (value.match(/^\d+$/)) return "number";
  if (value.startsWith('"') || value.startsWith("'")) return "string";
  if (value.startsWith("{")) return "object";
  if (value.startsWith("[")) return "array";
  return "string";
}

/**
 * Clean default value for storage
 */
function cleanDefaultValue(value: string): string | null {
  if (!value || value === "false" || value === '""' || value === "''") return null;
  // Remove quotes from strings
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  }
  return value;
}

/**
 * Determine component category based on name and content
 */
function determineCategory(name: string, content: string): string {
  const lowerName = name.toLowerCase();

  // Action components
  if (lowerName.includes("button") || lowerName.includes("link") || lowerName.includes("action")) {
    return "action";
  }

  // Form components
  if (
    content.includes("mc-field") ||
    lowerName.includes("input") ||
    lowerName.includes("checkbox") ||
    lowerName.includes("radio") ||
    lowerName.includes("select") ||
    lowerName.includes("field") ||
    lowerName.includes("form") ||
    lowerName.includes("datepicker") ||
    lowerName.includes("fileuploader")
  ) {
    return "form";
  }

  // Feedback components
  if (
    lowerName.includes("notification") ||
    lowerName.includes("message") ||
    lowerName.includes("status") ||
    lowerName.includes("badge") ||
    lowerName.includes("flag") ||
    lowerName.includes("loader") ||
    lowerName.includes("progress") ||
    lowerName.includes("toaster") ||
    lowerName.includes("tooltip")
  ) {
    return "feedback";
  }

  // Navigation components
  if (
    lowerName.includes("nav") ||
    lowerName.includes("breadcrumb") ||
    lowerName.includes("tab") ||
    lowerName.includes("pagination") ||
    lowerName.includes("stepper") ||
    lowerName.includes("menu")
  ) {
    return "navigation";
  }

  // Layout components
  if (
    lowerName.includes("container") ||
    lowerName.includes("divider") ||
    lowerName.includes("modal") ||
    lowerName.includes("drawer") ||
    lowerName.includes("accordion") ||
    lowerName.includes("popover")
  ) {
    return "layout";
  }

  // Data display components
  if (
    lowerName.includes("card") ||
    lowerName.includes("tile") ||
    lowerName.includes("image") ||
    lowerName.includes("avatar") ||
    lowerName.includes("logo") ||
    lowerName.includes("carousel") ||
    lowerName.includes("callout") ||
    lowerName.includes("tag") ||
    lowerName.includes("rating")
  ) {
    return "data-display";
  }

  return "other";
}

/**
 * Extract description from comment block at the top of the file
 */
function extractDescription(content: string): string {
  // Look for the main comment block with component description
  const commentMatch = content.match(/<#--\s*\n([A-Z\s]+)\n([\s\S]*?)-->/);

  if (commentMatch) {
    const title = commentMatch[1].trim();
    const description = commentMatch[2].trim();

    // Get first sentence or line of description
    const firstLine = description.split("\n")[0].trim();
    return firstLine || title;
  }

  return "";
}

/**
 * Convert component name to slug format
 */
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/([A-Z])/g, "-$1")
    .replace(/^-/, "");
}

/**
 * Parse a single Freemarker macro file
 */
function parseMacroFile(macro: FreemarkerMacro): Component {
  const macroName = extractMacroName(macro.content) || basename(macro.filePath, ".ftl");
  const params = extractParametersFromComments(macro.content);
  const category = determineCategory(macroName, macro.content);
  const description = extractDescription(macro.content);

  // Convert parameters to props format
  const props: ParsedProp[] = params.map((param) => ({
    name: param.name,
    type: param.type,
    description: param.description,
    required: param.required,
    default_value: param.defaultValue,
  }));

  // Extract CSS classes used in the component
  const cssClasses: string[] = [];
  if (macro.tokenData) {
    Object.values(macro.tokenData).forEach((className) => {
      if (typeof className === "string" && className.startsWith("mc-")) {
        cssClasses.push(className);
      }
    });
  }

  // Extract additional classes from template content
  const classMatches = macro.content.matchAll(/class=["']([^"']+)["']/g);
  for (const match of classMatches) {
    const classes = match[1].split(" ");
    classes.forEach((cls) => {
      if (cls.startsWith("mc-") && !cssClasses.includes(cls)) {
        cssClasses.push(cls);
      }
    });
  }

  return {
    name: macroName.charAt(0).toUpperCase() + macroName.slice(1) + " (Freemarker)",
    slug: toSlug(macroName),
    category,
    description,
    frameworks: ["freemarker"],
    props,
    slots: [], // Freemarker uses <#nested> for slot-like content
    events: [], // Freemarker doesn't have events in the same way as JS frameworks
    css_classes: [...new Set(cssClasses)],
    examples: [],
  };
}

/**
 * Main parser function for Freemarker components
 */
export async function parseFreemarkerComponents(repoPath: string): Promise<Component[]> {
  const components: Component[] = [];

  const macrosPath = join(repoPath, "mozaic-freemarker/src/main/resources/macros");
  const tokensPath = join(repoPath, "js/tokens");

  // Check if paths exist
  try {
    statSync(macrosPath);
  } catch {
    console.error(`Macros path not found: ${macrosPath}`);
    return [];
  }

  console.log("Parsing Freemarker macros from:", macrosPath);

  const macroFiles = findMacroFiles(macrosPath);
  console.log(`Found ${macroFiles.length} macro files`);

  for (const filePath of macroFiles) {
    try {
      const content = readFileSync(filePath, "utf-8");
      const fileName = basename(filePath, ".ftl");
      const tokenData = loadTokenFile(tokensPath, fileName);

      const macro: FreemarkerMacro = {
        name: fileName,
        filePath,
        content,
        tokenData,
      };

      const component = parseMacroFile(macro);

      if (component.name) {
        components.push(component);
        console.log(`✓ Parsed: ${component.name} (${component.props.length} props)`);
      }
    } catch (error) {
      console.error(`Failed to parse ${filePath}:`, error);
    }
  }

  console.log(`\nTotal Freemarker components parsed: ${components.length}`);

  return components;
}
