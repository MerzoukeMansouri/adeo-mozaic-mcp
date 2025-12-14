import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import type { Token } from "./types.js";
import { parseValue } from "./types.js";

interface ScreenValue {
  value: string | number;
  comment?: string;
}

interface ScreenTokens {
  screen?: { [key: string]: ScreenValue };
}

export async function parseScreenTokens(tokensPath: string): Promise<Token[]> {
  const tokens: Token[] = [];
  const sizePath = join(tokensPath, "properties", "size");

  if (!existsSync(sizePath)) {
    console.warn(`Size tokens path not found: ${sizePath}`);
    return tokens;
  }

  // Look for screens.json
  const screensFile = join(sizePath, "screens.json");
  if (existsSync(screensFile)) {
    try {
      const content = readFileSync(screensFile, "utf-8");
      const data = JSON.parse(content) as ScreenTokens;
      const relativePath = "properties/size/screens.json";

      const screenData = data.screen || data;

      for (const [screenName, screenDef] of Object.entries(screenData)) {
        if (typeof screenDef !== "object" || !("value" in screenDef)) continue;

        const value = screenDef.value;
        const parsed = parseValue(value);

        // Determine subcategory based on name pattern
        let subcategory = "breakpoint";
        if (screenName.includes("-")) {
          // e.g., "s-medium", "xl-large"
          const baseName = screenName.split("-")[0];
          subcategory = baseName;
        }

        tokens.push({
          category: "screen",
          subcategory,
          name: screenName,
          path: `screen.${screenName}`,
          cssVariable: `--screen-${screenName}`,
          scssVariable: `$screen-${screenName}`,
          valueRaw: String(value),
          valueNumber: parsed.number,
          valueUnit: parsed.unit || "px",
          valueComputed: String(value),
          description: screenDef.comment || `Screen breakpoint ${screenName}`,
          platform: "all",
          sourceFile: relativePath,
        });
      }
    } catch (error) {
      console.warn(`Warning: Could not parse ${screensFile}:`, error);
    }
  }

  return tokens;
}
