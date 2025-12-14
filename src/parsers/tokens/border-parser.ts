import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import type { Token } from "./types.js";

interface BorderValue {
  value: number | string;
  description?: string;
}

interface BorderTokens {
  border?: { [key: string]: BorderValue };
  radius?: { [key: string]: BorderValue };
}

export async function parseBorderTokens(tokensPath: string): Promise<Token[]> {
  const tokens: Token[] = [];

  // Parse border tokens
  const borderPath = join(tokensPath, "properties", "border");
  if (existsSync(borderPath)) {
    const files = readdirSync(borderPath).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const filePath = join(borderPath, file);
      try {
        const content = readFileSync(filePath, "utf-8");
        const data = JSON.parse(content) as BorderTokens;
        const relativePath = `properties/border/${file}`;

        const borderData = data.border || data;

        for (const [sizeName, borderDef] of Object.entries(borderData)) {
          if (typeof borderDef !== "object" || !("value" in borderDef)) continue;

          const value = borderDef.value;
          const numValue = typeof value === "number" ? value : parseFloat(String(value));

          tokens.push({
            category: "border",
            subcategory: "width",
            name: sizeName,
            path: `border.${sizeName}`,
            cssVariable: `--border-${sizeName}`,
            scssVariable: `$border-${sizeName}`,
            valueRaw: String(value),
            valueNumber: numValue,
            valueUnit: "px",
            valueComputed: `${numValue}px`,
            description: borderDef.description || `Border width ${sizeName}`,
            platform: "all",
            sourceFile: relativePath,
          });
        }
      } catch (error) {
        console.warn(`Warning: Could not parse ${filePath}:`, error);
      }
    }
  }

  // Parse radius tokens
  const radiusPath = join(tokensPath, "properties", "radius");
  if (existsSync(radiusPath)) {
    const files = readdirSync(radiusPath).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const filePath = join(radiusPath, file);
      try {
        const content = readFileSync(filePath, "utf-8");
        const data = JSON.parse(content) as BorderTokens;
        const relativePath = `properties/radius/${file}`;

        const radiusData = data.radius || data;

        for (const [sizeName, radiusDef] of Object.entries(radiusData)) {
          if (typeof radiusDef !== "object" || !("value" in radiusDef)) continue;

          const value = radiusDef.value;
          const numValue = typeof value === "number" ? value : parseFloat(String(value));

          tokens.push({
            category: "radius",
            subcategory: undefined,
            name: sizeName,
            path: `radius.${sizeName}`,
            cssVariable: `--radius-${sizeName}`,
            scssVariable: `$radius-${sizeName}`,
            valueRaw: String(value),
            valueNumber: numValue,
            valueUnit: "px",
            valueComputed: `${numValue}px`,
            description: radiusDef.description || `Border radius ${sizeName}`,
            platform: "all",
            sourceFile: relativePath,
          });
        }
      } catch (error) {
        console.warn(`Warning: Could not parse ${filePath}:`, error);
      }
    }
  }

  return tokens;
}
