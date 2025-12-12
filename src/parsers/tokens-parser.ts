import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, basename } from "path";
import type { Token } from "../db/queries.js";

interface TokenValue {
  value: string;
  description?: string;
}

type TokenObject = {
  [key: string]: TokenObject | TokenValue;
};

function isTokenValue(obj: unknown): obj is TokenValue {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "value" in obj &&
    typeof (obj as TokenValue).value === "string"
  );
}

function flattenTokens(
  obj: TokenObject,
  category: string,
  prefix: string = ""
): Token[] {
  const tokens: Token[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (isTokenValue(value)) {
      tokens.push({
        category,
        path,
        value: value.value,
        description: value.description,
        platform: "all",
      });
    } else if (typeof value === "object" && value !== null) {
      tokens.push(...flattenTokens(value as TokenObject, category, path));
    }
  }

  return tokens;
}

function parseJsonFile(filePath: string, category: string): Token[] {
  try {
    const content = readFileSync(filePath, "utf-8");
    const data = JSON.parse(content) as TokenObject;
    return flattenTokens(data, category);
  } catch (error) {
    console.warn(`Warning: Could not parse ${filePath}:`, error);
    return [];
  }
}

function getCategoryFromPath(filePath: string): string {
  const parts = filePath.split("/");
  const propertiesIndex = parts.indexOf("properties");
  if (propertiesIndex !== -1 && parts[propertiesIndex + 1]) {
    return parts[propertiesIndex + 1];
  }
  return basename(filePath, ".json");
}

function findJsonFiles(dir: string): string[] {
  const files: string[] = [];

  if (!existsSync(dir)) {
    return files;
  }

  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findJsonFiles(fullPath));
    } else if (entry.endsWith(".json")) {
      files.push(fullPath);
    }
  }

  return files;
}

export async function parseTokens(tokensPath: string): Promise<Token[]> {
  const allTokens: Token[] = [];

  // Parse from properties directory (source JSON files)
  const propertiesPath = join(tokensPath, "properties");
  if (existsSync(propertiesPath)) {
    const jsonFiles = findJsonFiles(propertiesPath);

    for (const file of jsonFiles) {
      const category = getCategoryFromPath(file);
      const tokens = parseJsonFile(file, category);
      allTokens.push(...tokens);
    }
  }

  // Also try to parse from build directory if available
  const buildJsPath = join(tokensPath, "build", "js", "tokensObject.js");
  if (existsSync(buildJsPath)) {
    try {
      // Read the JS file and extract the object
      const content = readFileSync(buildJsPath, "utf-8");
      // Simple extraction - the file exports a tokens object
      const match = content.match(/export\s+(?:default\s+)?({[\s\S]*})/);
      if (match) {
        // This is a simplified approach - in production you might want to use
        // a proper JS parser or just import the module
        console.log("Found tokensObject.js - using properties files instead");
      }
    } catch (error) {
      console.warn("Could not parse tokensObject.js:", error);
    }
  }

  return allTokens;
}

// Category mapping for token queries
export const TOKEN_CATEGORIES = {
  colors: ["color"],
  typography: ["font", "text"],
  spacing: ["size", "space"],
  shadows: ["shadow"],
  borders: ["border", "radius"],
} as const;

export function mapCategoryToDbCategories(category: string): string[] {
  const mapping = TOKEN_CATEGORIES[category as keyof typeof TOKEN_CATEGORIES];
  return mapping ? [...mapping] : [category];
}
