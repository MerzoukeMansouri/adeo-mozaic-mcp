import { describe, it, expect } from "vitest";
import { mapCategoryToDbCategories, TOKEN_CATEGORIES } from "../tokens-parser.js";

describe("Tokens Parser", () => {
  describe("TOKEN_CATEGORIES", () => {
    it("has correct category mappings", () => {
      expect(TOKEN_CATEGORIES.colors).toEqual(["color"]);
      expect(TOKEN_CATEGORIES.typography).toEqual(["typography"]);
      expect(TOKEN_CATEGORIES.spacing).toEqual(["spacing"]);
      expect(TOKEN_CATEGORIES.shadows).toEqual(["shadow"]);
      expect(TOKEN_CATEGORIES.borders).toEqual(["border", "radius"]);
      expect(TOKEN_CATEGORIES.screens).toEqual(["screen"]);
      expect(TOKEN_CATEGORIES.grid).toEqual(["grid"]);
    });
  });

  describe("mapCategoryToDbCategories", () => {
    it("maps colors to db category", () => {
      expect(mapCategoryToDbCategories("colors")).toEqual(["color"]);
    });

    it("maps typography to db category", () => {
      expect(mapCategoryToDbCategories("typography")).toEqual(["typography"]);
    });

    it("maps spacing to db category", () => {
      expect(mapCategoryToDbCategories("spacing")).toEqual(["spacing"]);
    });

    it("maps shadows to db category", () => {
      expect(mapCategoryToDbCategories("shadows")).toEqual(["shadow"]);
    });

    it("maps borders to multiple db categories", () => {
      expect(mapCategoryToDbCategories("borders")).toEqual(["border", "radius"]);
    });

    it("maps screens to db category", () => {
      expect(mapCategoryToDbCategories("screens")).toEqual(["screen"]);
    });

    it("maps grid to db category", () => {
      expect(mapCategoryToDbCategories("grid")).toEqual(["grid"]);
    });

    it("returns unknown category as-is", () => {
      expect(mapCategoryToDbCategories("unknown")).toEqual(["unknown"]);
    });

    it("returns custom category as-is", () => {
      expect(mapCategoryToDbCategories("custom-category")).toEqual(["custom-category"]);
    });
  });

  describe("color token parsing logic", () => {
    it("extracts subcategory from path", () => {
      expect(extractSubcategory("primary-01.100")).toBe("primary");
      expect(extractSubcategory("secondary.200")).toBe("secondary");
      expect(extractSubcategory("gray.500")).toBe("gray");
    });

    it("removes numeric suffix from subcategory", () => {
      expect(extractSubcategory("primary-01.100")).toBe("primary");
      expect(extractSubcategory("danger-02.400")).toBe("danger");
    });

    it("returns undefined for single-part paths", () => {
      expect(extractSubcategory("single")).toBeUndefined();
    });
  });

  describe("color value detection", () => {
    it("detects color value object", () => {
      expect(isColorValue({ value: "#ff0000" })).toBe(true);
      expect(isColorValue({ value: "#ff0000", description: "Red" })).toBe(true);
    });

    it("rejects non-color-value objects", () => {
      expect(isColorValue(null)).toBe(false);
      expect(isColorValue(undefined)).toBe(false);
      expect(isColorValue({ notValue: "test" })).toBe(false);
      expect(isColorValue({ value: 123 })).toBe(false);
      expect(isColorValue("string")).toBe(false);
    });
  });

  describe("spacing token generation", () => {
    it("generates correct spacing values", () => {
      const spacing = generateSpacingToken("mu100", 1);
      expect(spacing.valueRaw).toBe("1rem");
      expect(spacing.valueComputed).toBe("16px");
    });

    it("generates correct half-spacing values", () => {
      const spacing = generateSpacingToken("mu050", 0.5);
      expect(spacing.valueRaw).toBe("0.5rem");
      expect(spacing.valueComputed).toBe("8px");
    });

    it("generates correct large spacing values", () => {
      const spacing = generateSpacingToken("mu1000", 10);
      expect(spacing.valueRaw).toBe("10rem");
      expect(spacing.valueComputed).toBe("160px");
    });

    it("includes correct CSS and SCSS variables", () => {
      const spacing = generateSpacingToken("mu100", 1);
      expect(spacing.cssVariable).toBe("--spacing-mu100");
      expect(spacing.scssVariable).toBe("$mu100");
    });
  });

  describe("CSS variable naming", () => {
    it("converts path to CSS variable", () => {
      expect(pathToCssVariable("color", "primary.100")).toBe("--color-primary-100");
      expect(pathToCssVariable("spacing", "mu100")).toBe("--spacing-mu100");
    });

    it("converts path to SCSS variable", () => {
      expect(pathToScssVariable("color", "primary.100")).toBe("$color-primary-100");
      expect(pathToScssVariable("spacing", "mu100")).toBe("$spacing-mu100");
    });
  });

  describe("value parsing", () => {
    it("parses hex colors", () => {
      const result = parseValue("#ff0000");
      expect(result.raw).toBe("#ff0000");
      expect(result.unit).toBeUndefined();
    });

    it("parses rem values", () => {
      const result = parseValue("1rem");
      expect(result.raw).toBe("1rem");
      expect(result.unit).toBe("rem");
      expect(result.number).toBe(1);
    });

    it("parses px values", () => {
      const result = parseValue("16px");
      expect(result.raw).toBe("16px");
      expect(result.unit).toBe("px");
      expect(result.number).toBe(16);
    });

    it("parses percentage values", () => {
      const result = parseValue("50%");
      expect(result.raw).toBe("50%");
      expect(result.unit).toBe("%");
      expect(result.number).toBe(50);
    });
  });
});

// Helper functions reimplemented for testing
function extractSubcategory(path: string): string | undefined {
  const parts = path.split(".");
  if (parts.length >= 2) {
    const subcat = parts[0].replace(/-\d+$/, "");
    return subcat;
  }
  return undefined;
}

function isColorValue(obj: unknown): obj is { value: string; description?: string } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "value" in obj &&
    typeof (obj as { value: unknown }).value === "string"
  );
}

interface SpacingToken {
  name: string;
  valueRaw: string;
  valueComputed: string;
  cssVariable: string;
  scssVariable: string;
}

function generateSpacingToken(name: string, multiplier: number): SpacingToken {
  const MAGIC_UNIT_BASE = 16;
  const remValue = multiplier;
  const pxValue = multiplier * MAGIC_UNIT_BASE;

  return {
    name,
    valueRaw: `${remValue}rem`,
    valueComputed: `${pxValue}px`,
    cssVariable: `--spacing-${name}`,
    scssVariable: `$${name}`,
  };
}

function pathToCssVariable(category: string, path: string): string {
  return `--${category}-${path.replace(/\./g, "-")}`;
}

function pathToScssVariable(category: string, path: string): string {
  return `$${category}-${path.replace(/\./g, "-")}`;
}

interface ParsedValue {
  raw: string;
  unit?: string;
  number?: number;
}

function parseValue(value: string): ParsedValue {
  const result: ParsedValue = { raw: value };

  // Extract number and unit
  const match = value.match(/^(-?\d*\.?\d+)(rem|px|em|%|vh|vw)?$/);
  if (match) {
    result.number = parseFloat(match[1]);
    result.unit = match[2];
  }

  return result;
}
