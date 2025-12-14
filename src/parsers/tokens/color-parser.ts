import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, basename } from "path";
import type { Token } from "./types.js";
import { parseValue, pathToCssVariable, pathToScssVariable } from "./types.js";

interface ColorTokenValue {
  value: string;
  description?: string;
}

type ColorTokenObject = {
  [key: string]: ColorTokenObject | ColorTokenValue;
};

function isColorValue(obj: unknown): obj is ColorTokenValue {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "value" in obj &&
    typeof (obj as ColorTokenValue).value === "string"
  );
}

function extractSubcategory(path: string): string | undefined {
  // Extract subcategory from paths like "color.primary-01.100"
  const parts = path.split(".");
  if (parts.length >= 2) {
    // Get base name without number suffix (e.g., "primary" from "primary-01")
    const subcat = parts[0].replace(/-\d+$/, "");
    return subcat;
  }
  return undefined;
}

function flattenColorTokens(
  obj: ColorTokenObject,
  sourceFile: string,
  prefix: string = ""
): Token[] {
  const tokens: Token[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (isColorValue(value)) {
      const parsed = parseValue(value.value);
      const fullPath = `color.${path}`;

      tokens.push({
        category: "color",
        subcategory: extractSubcategory(path),
        name: path.replace(/\./g, "-"),
        path: fullPath,
        cssVariable: pathToCssVariable("color", path),
        scssVariable: pathToScssVariable("color", path),
        valueRaw: parsed.raw,
        valueUnit: parsed.unit,
        description: value.description,
        platform: "all",
        sourceFile,
      });
    } else if (typeof value === "object" && value !== null) {
      tokens.push(...flattenColorTokens(value as ColorTokenObject, sourceFile, path));
    }
  }

  return tokens;
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

export async function parseColorTokens(tokensPath: string): Promise<Token[]> {
  const colorPath = join(tokensPath, "properties", "color");
  const tokens: Token[] = [];

  if (!existsSync(colorPath)) {
    console.warn(`Color tokens path not found: ${colorPath}`);
    return tokens;
  }

  const jsonFiles = findJsonFiles(colorPath);

  for (const file of jsonFiles) {
    try {
      const content = readFileSync(file, "utf-8");
      const data = JSON.parse(content) as ColorTokenObject;
      const relativePath = file.replace(tokensPath, "");

      // Skip the outer "color" key if present
      const colorData = data.color || data;
      tokens.push(...flattenColorTokens(colorData as ColorTokenObject, relativePath));
    } catch (error) {
      console.warn(`Warning: Could not parse ${file}:`, error);
    }
  }

  return tokens;
}
