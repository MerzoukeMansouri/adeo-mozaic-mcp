import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import type { Token, TokenProperty } from "./types.js";
import { parseValue } from "./types.js";

interface ShadowPropertyValue {
  value: string;
}

interface ShadowDefinition {
  x: ShadowPropertyValue;
  y: ShadowPropertyValue;
  blur: ShadowPropertyValue;
  spread: ShadowPropertyValue;
  opacity: ShadowPropertyValue;
}

interface ShadowTokens {
  shadow: {
    [key: string]: ShadowDefinition;
  };
}

export async function parseShadowTokens(tokensPath: string): Promise<Token[]> {
  const shadowPath = join(tokensPath, "properties", "shadow");
  const tokens: Token[] = [];

  if (!existsSync(shadowPath)) {
    console.warn(`Shadow tokens path not found: ${shadowPath}`);
    return tokens;
  }

  // Find all JSON files in shadow directory
  const files = readdirSync(shadowPath).filter((f: string) => f.endsWith(".json"));

  for (const file of files) {
    const filePath = join(shadowPath, file);
    try {
      const content = readFileSync(filePath, "utf-8");
      const data = JSON.parse(content) as ShadowTokens;
      const relativePath = `properties/shadow/${file}`;

      const shadowData = data.shadow || data;

      for (const [sizeName, shadowDef] of Object.entries(shadowData)) {
        if (typeof shadowDef !== "object" || !shadowDef.x) continue;

        const def = shadowDef as ShadowDefinition;

        // Build composite shadow value
        const shadowValue = `${def.x.value} ${def.y.value} ${def.blur.value} ${def.spread.value}`;

        // Extract properties
        const properties: TokenProperty[] = [
          { property: "x", value: def.x.value, ...parseValueProp(def.x.value) },
          { property: "y", value: def.y.value, ...parseValueProp(def.y.value) },
          { property: "blur", value: def.blur.value, ...parseValueProp(def.blur.value) },
          { property: "spread", value: def.spread.value, ...parseValueProp(def.spread.value) },
          { property: "opacity", value: def.opacity.value, ...parseValueProp(def.opacity.value) },
        ];

        tokens.push({
          category: "shadow",
          subcategory: undefined,
          name: sizeName,
          path: `shadow.${sizeName}`,
          cssVariable: `--shadow-${sizeName}`,
          scssVariable: `$shadow-${sizeName}`,
          valueRaw: shadowValue,
          description: `Shadow size ${sizeName}`,
          platform: "all",
          sourceFile: relativePath,
          properties,
        });
      }
    } catch (error) {
      console.warn(`Warning: Could not parse ${filePath}:`, error);
    }
  }

  return tokens;
}

function parseValueProp(value: string): { valueNumber?: number; valueUnit?: string } {
  const parsed = parseValue(value);
  return {
    valueNumber: parsed.number,
    valueUnit: parsed.unit,
  };
}
