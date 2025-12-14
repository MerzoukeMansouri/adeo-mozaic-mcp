// Token types for the enhanced schema

export type TokenCategory =
  | "color"
  | "spacing"
  | "shadow"
  | "border"
  | "radius"
  | "screen"
  | "typography";

export interface TokenProperty {
  property: string;
  value: string;
  valueNumber?: number;
  valueUnit?: string;
}

export interface Token {
  category: TokenCategory;
  subcategory?: string;
  name: string;
  path: string;
  cssVariable?: string;
  scssVariable?: string;
  valueRaw: string;
  valueNumber?: number;
  valueUnit?: string;
  valueComputed?: string;
  description?: string;
  platform?: string;
  sourceFile?: string;
  properties?: TokenProperty[]; // For composite tokens like shadows
}

// Helper to parse value and extract number/unit
export function parseValue(value: string | number): {
  raw: string;
  number?: number;
  unit?: string;
  computed?: string;
} {
  const raw = String(value);

  // If it's already a number
  if (typeof value === "number") {
    return { raw, number: value };
  }

  // Try to parse numeric value with unit
  const match = raw.match(/^(-?[\d.]+)(px|rem|em|%|vw|vh|s|ms)?$/);
  if (match) {
    return {
      raw,
      number: parseFloat(match[1]),
      unit: match[2] || undefined,
    };
  }

  // Check if it's a hex color
  if (raw.match(/^#[0-9a-fA-F]{3,8}$/)) {
    return { raw, unit: "hex" };
  }

  // Check if it's an rgb/rgba color
  if (raw.match(/^rgba?\(/)) {
    return { raw, unit: "rgb" };
  }

  return { raw };
}

// Convert path to CSS variable name
export function pathToCssVariable(category: string, path: string): string {
  const cleanPath = path.replace(/\./g, "-").toLowerCase();
  return `--${category}-${cleanPath}`;
}

// Convert path to SCSS variable name
export function pathToScssVariable(category: string, path: string): string {
  const cleanPath = path.replace(/\./g, "-").toLowerCase();
  return `$${category}-${cleanPath}`;
}

// Compute pixel value from rem (assuming 16px base)
export function remToPx(rem: number): string {
  return `${rem * 16}px`;
}
