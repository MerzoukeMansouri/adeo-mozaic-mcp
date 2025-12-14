import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import type { Token } from "./types.js";
import { remToPx } from "./types.js";

interface FontValue {
  value: number | string;
  comment?: string;
}

interface FontSizeTokens {
  size?: {
    font?: { [key: string]: FontValue };
    line?: { [key: string]: { [key: string]: FontValue } };
  };
}

export async function parseTypographyTokens(tokensPath: string): Promise<Token[]> {
  const tokens: Token[] = [];
  const sizePath = join(tokensPath, "properties", "size");

  if (!existsSync(sizePath)) {
    console.warn(`Size tokens path not found: ${sizePath}`);
    return tokens;
  }

  // Look for font.json
  const fontFile = join(sizePath, "font.json");
  if (existsSync(fontFile)) {
    try {
      const content = readFileSync(fontFile, "utf-8");
      const data = JSON.parse(content) as FontSizeTokens;
      const relativePath = "properties/size/font.json";

      // Parse font sizes
      const fontSizes = data.size?.font || {};
      for (const [sizeName, fontDef] of Object.entries(fontSizes)) {
        if (typeof fontDef !== "object" || !("value" in fontDef)) continue;

        const value = fontDef.value;
        const numValue = typeof value === "number" ? value : parseFloat(String(value));
        const pxValue = Math.round(numValue * 16); // Convert rem to px

        tokens.push({
          category: "typography",
          subcategory: "font-size",
          name: `font-${sizeName}`,
          path: `typography.font.${sizeName}`,
          cssVariable: `--font-size-${sizeName}`,
          scssVariable: `$font-size-${sizeName}`,
          valueRaw: String(value),
          valueNumber: numValue,
          valueUnit: "rem",
          valueComputed: `${pxValue}px`,
          description: fontDef.comment || `Font size ${sizeName}`,
          platform: "all",
          sourceFile: relativePath,
        });
      }

      // Parse line heights
      const lineHeights = data.size?.line || {};
      for (const [sizeName, variants] of Object.entries(lineHeights)) {
        if (typeof variants !== "object") continue;

        for (const [variant, lineDef] of Object.entries(variants)) {
          if (typeof lineDef !== "object" || !("value" in lineDef)) continue;

          const value = (lineDef as FontValue).value;
          const numValue = typeof value === "number" ? value : parseFloat(String(value));
          const pxValue = Math.round(numValue * 16);

          tokens.push({
            category: "typography",
            subcategory: "line-height",
            name: `line-${sizeName}-${variant}`,
            path: `typography.line.${sizeName}.${variant}`,
            cssVariable: `--line-height-${sizeName}-${variant}`,
            scssVariable: `$line-height-${sizeName}-${variant}`,
            valueRaw: String(value),
            valueNumber: numValue,
            valueUnit: "rem",
            valueComputed: `${pxValue}px`,
            description: (lineDef as FontValue).comment || `Line height ${sizeName} ${variant}`,
            platform: "all",
            sourceFile: relativePath,
          });
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not parse ${fontFile}:`, error);
    }
  }

  return tokens;
}
