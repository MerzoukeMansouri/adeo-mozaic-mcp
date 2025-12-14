import { join } from "path";
import type { Token } from "./tokens/types.js";
import { parseColorTokens } from "./tokens/color-parser.js";
import { parseSpacingTokens } from "./tokens/spacing-parser.js";
import { parseShadowTokens } from "./tokens/shadow-parser.js";
import { parseBorderTokens } from "./tokens/border-parser.js";
import { parseScreenTokens } from "./tokens/screen-parser.js";
import { parseTypographyTokens } from "./tokens/typography-parser.js";

// Re-export Token type for backwards compatibility
export type { Token } from "./tokens/types.js";

export interface ParseTokensOptions {
  tokensPath: string;   // Path to tokens JSON files (e.g., repos/mozaic-design-system/packages/tokens)
  stylesPath?: string;  // Path to styles SCSS files (e.g., repos/mozaic-design-system/packages/styles)
}

export async function parseTokens(tokensPath: string, stylesPath?: string): Promise<Token[]> {
  const allTokens: Token[] = [];

  // Determine styles path if not provided
  const effectiveStylesPath = stylesPath || join(tokensPath, "..", "styles");

  console.log("  Parsing color tokens...");
  const colorTokens = await parseColorTokens(tokensPath);
  allTokens.push(...colorTokens);
  console.log(`    ✓ ${colorTokens.length} color tokens`);

  console.log("  Parsing spacing tokens...");
  const spacingTokens = await parseSpacingTokens(effectiveStylesPath);
  allTokens.push(...spacingTokens);
  console.log(`    ✓ ${spacingTokens.length} spacing tokens`);

  console.log("  Parsing shadow tokens...");
  const shadowTokens = await parseShadowTokens(tokensPath);
  allTokens.push(...shadowTokens);
  console.log(`    ✓ ${shadowTokens.length} shadow tokens`);

  console.log("  Parsing border/radius tokens...");
  const borderTokens = await parseBorderTokens(tokensPath);
  allTokens.push(...borderTokens);
  console.log(`    ✓ ${borderTokens.length} border/radius tokens`);

  console.log("  Parsing screen tokens...");
  const screenTokens = await parseScreenTokens(tokensPath);
  allTokens.push(...screenTokens);
  console.log(`    ✓ ${screenTokens.length} screen tokens`);

  console.log("  Parsing typography tokens...");
  const typographyTokens = await parseTypographyTokens(tokensPath);
  allTokens.push(...typographyTokens);
  console.log(`    ✓ ${typographyTokens.length} typography tokens`);

  return allTokens;
}

// Category mapping for token queries
export const TOKEN_CATEGORIES = {
  colors: ["color"],
  typography: ["typography"],
  spacing: ["spacing"],
  shadows: ["shadow"],
  borders: ["border", "radius"],
  screens: ["screen"],
} as const;

export function mapCategoryToDbCategories(category: string): string[] {
  const mapping = TOKEN_CATEGORIES[category as keyof typeof TOKEN_CATEGORIES];
  return mapping ? [...mapping] : [category];
}
