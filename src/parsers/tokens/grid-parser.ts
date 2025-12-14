import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { Token } from "./types.js";

interface GridValue {
  value: number;
}

interface GridTokens {
  size?: {
    gutter?: {
      screen?: { [key: string]: GridValue };
    };
  };
}

interface BaseTokens {
  "magic-unit"?: GridValue;
  "local-rem-value"?: GridValue;
}

const MAGIC_UNIT_PX = 16; // 1 magic unit = 16px

export async function parseGridTokens(tokensPath: string): Promise<Token[]> {
  const tokens: Token[] = [];
  const sizePath = join(tokensPath, "properties", "size");

  if (!existsSync(sizePath)) {
    console.warn(`Size tokens path not found: ${sizePath}`);
    return tokens;
  }

  // Parse grid.json (gutter sizes)
  const gridFile = join(sizePath, "grid.json");
  if (existsSync(gridFile)) {
    try {
      const content = readFileSync(gridFile, "utf-8");
      const data = JSON.parse(content) as GridTokens;
      const relativePath = "properties/size/grid.json";

      const gutterData = data.size?.gutter?.screen || {};

      for (const [screenName, gutterDef] of Object.entries(gutterData)) {
        if (typeof gutterDef !== "object" || !("value" in gutterDef)) continue;

        const muValue = gutterDef.value;
        const pxValue = muValue * MAGIC_UNIT_PX;

        tokens.push({
          category: "grid",
          subcategory: "gutter",
          name: `gutter-${screenName}`,
          path: `grid.gutter.screen.${screenName}`,
          cssVariable: `--grid-gutter-${screenName}`,
          scssVariable: `$size-gutter-screen-${screenName}`,
          valueRaw: `${muValue}mu`,
          valueNumber: muValue,
          valueUnit: "mu",
          valueComputed: `${pxValue}px`,
          description: `Grid gutter for ${screenName} screens (${muValue} magic units = ${pxValue}px)`,
          platform: "all",
          sourceFile: relativePath,
        });
      }
    } catch (error) {
      console.warn(`Warning: Could not parse ${gridFile}:`, error);
    }
  }

  // Parse base.json (magic unit and rem value)
  const baseFile = join(sizePath, "base.json");
  if (existsSync(baseFile)) {
    try {
      const content = readFileSync(baseFile, "utf-8");
      const data = JSON.parse(content) as BaseTokens;
      const relativePath = "properties/size/base.json";

      // Magic unit
      if (data["magic-unit"]) {
        const muValue = data["magic-unit"].value;
        tokens.push({
          category: "grid",
          subcategory: "base",
          name: "magic-unit",
          path: "grid.magic-unit",
          cssVariable: "--magic-unit",
          scssVariable: "$magic-unit",
          valueRaw: `${muValue}`,
          valueNumber: muValue,
          valueUnit: undefined,
          valueComputed: `${muValue * MAGIC_UNIT_PX}px`,
          description: "Base magic unit multiplier (1mu = 16px)",
          platform: "all",
          sourceFile: relativePath,
        });
      }

      // Local rem value
      if (data["local-rem-value"]) {
        const remValue = data["local-rem-value"].value;
        tokens.push({
          category: "grid",
          subcategory: "base",
          name: "local-rem-value",
          path: "grid.local-rem-value",
          cssVariable: "--local-rem-value",
          scssVariable: "$local-rem-value",
          valueRaw: `${remValue}px`,
          valueNumber: remValue,
          valueUnit: "px",
          valueComputed: `${remValue}px`,
          description: "Base rem value (1rem = 16px)",
          platform: "all",
          sourceFile: relativePath,
        });
      }
    } catch (error) {
      console.warn(`Warning: Could not parse ${baseFile}:`, error);
    }
  }

  return tokens;
}
