import { existsSync } from "fs";
import { join } from "path";
import type { Token } from "./types.js";

// Magic Unit spacing tokens from SCSS
// Base: $magic-unit = 16px (1rem)
const MAGIC_UNIT_BASE = 16; // px

interface SpacingDefinition {
  name: string;
  multiplier: number;
}

// Defined in _s.magic-unit.scss
const SPACING_DEFINITIONS: SpacingDefinition[] = [
  { name: "mu025", multiplier: 0.25 },
  { name: "mu050", multiplier: 0.5 },
  { name: "mu075", multiplier: 0.75 },
  { name: "mu100", multiplier: 1 },
  { name: "mu125", multiplier: 1.25 },
  { name: "mu150", multiplier: 1.5 },
  { name: "mu175", multiplier: 1.75 },
  { name: "mu200", multiplier: 2 },
  { name: "mu250", multiplier: 2.5 },
  { name: "mu300", multiplier: 3 },
  { name: "mu350", multiplier: 3.5 },
  { name: "mu400", multiplier: 4 },
  { name: "mu500", multiplier: 5 },
  { name: "mu600", multiplier: 6 },
  { name: "mu700", multiplier: 7 },
  { name: "mu800", multiplier: 8 },
  { name: "mu900", multiplier: 9 },
  { name: "mu1000", multiplier: 10 },
];

export async function parseSpacingTokens(stylesPath: string): Promise<Token[]> {
  const tokens: Token[] = [];
  const sourceFile = "settings-tools/_s.magic-unit.scss";
  const magicUnitPath = join(stylesPath, sourceFile);

  // Verify the file exists for reference
  if (!existsSync(magicUnitPath)) {
    console.warn(`Magic unit SCSS not found: ${magicUnitPath}`);
    console.log("Using predefined spacing definitions");
  }

  // Generate tokens from known definitions
  for (const def of SPACING_DEFINITIONS) {
    const remValue = def.multiplier;
    const pxValue = def.multiplier * MAGIC_UNIT_BASE;

    tokens.push({
      category: "spacing",
      subcategory: "magic-unit",
      name: def.name,
      path: `spacing.${def.name}`,
      cssVariable: `--spacing-${def.name}`,
      scssVariable: `$${def.name}`,
      valueRaw: `${remValue}rem`,
      valueNumber: remValue,
      valueUnit: "rem",
      valueComputed: `${pxValue}px`,
      description: `${def.multiplier} × magic-unit (${pxValue}px)`,
      platform: "all",
      sourceFile,
    });
  }

  // Also add the base magic unit
  tokens.push({
    category: "spacing",
    subcategory: "base",
    name: "magic-unit",
    path: "spacing.magic-unit",
    cssVariable: "--spacing-magic-unit",
    scssVariable: "$magic-unit",
    valueRaw: "16px",
    valueNumber: 16,
    valueUnit: "px",
    valueComputed: "16px",
    description: "Base magic unit value",
    platform: "all",
    sourceFile,
  });

  return tokens;
}

// Also parse any additional spacing from JSON if exists
export async function parseSpacingFromJson(tokensPath: string): Promise<Token[]> {
  const spacingPath = join(tokensPath, "properties", "spacing");
  const tokens: Token[] = [];

  if (!existsSync(spacingPath)) {
    return tokens;
  }

  // Parse JSON spacing files if they exist
  // (Currently Mozaic doesn't have these, but future-proofing)

  return tokens;
}
