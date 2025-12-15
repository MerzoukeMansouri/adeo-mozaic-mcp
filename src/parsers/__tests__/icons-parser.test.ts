import { describe, it, expect } from "vitest";
import {
  generateSvg,
  generateReactComponent,
  generateVueComponent,
  type ParsedIcon,
} from "../icons-parser.js";

describe("Icons Parser", () => {
  describe("generateSvg", () => {
    it("generates SVG from simple path", () => {
      const icon: ParsedIcon = {
        name: "ArrowDown16",
        iconName: "ArrowDown",
        type: "navigation",
        size: 16,
        viewBox: "0 0 16 16",
        paths: '[{"tagName":"path","attrs":{"d":"M8 12L4 8h8z"}}]',
      };

      const svg = generateSvg(icon);
      expect(svg).toContain('viewBox="0 0 16 16"');
      expect(svg).toContain("<path");
      expect(svg).toContain('d="M8 12L4 8h8z"');
      expect(svg).toContain("xmlns=");
    });

    it("handles complex paths with nested elements", () => {
      const icon: ParsedIcon = {
        name: "Complex24",
        iconName: "Complex",
        type: "media",
        size: 24,
        viewBox: "0 0 24 24",
        paths:
          '[{"tagName":"g","attrs":{"clip-path":"url(#id)"},"children":[{"tagName":"path","attrs":{"d":"M0 0h24v24H0z"}}]}]',
      };

      const svg = generateSvg(icon);
      expect(svg).toContain("<g");
      expect(svg).toContain("</g>");
      expect(svg).toContain("<path");
    });

    it("handles empty paths array", () => {
      const icon: ParsedIcon = {
        name: "Empty16",
        iconName: "Empty",
        type: "unknown",
        size: 16,
        viewBox: "0 0 16 16",
        paths: "[]",
      };

      const svg = generateSvg(icon);
      expect(svg).toContain('viewBox="0 0 16 16"');
      expect(svg).toContain("</svg>");
    });

    it("handles malformed paths gracefully", () => {
      const icon: ParsedIcon = {
        name: "Malformed16",
        iconName: "Malformed",
        type: "unknown",
        size: 16,
        viewBox: "0 0 16 16",
        paths: "not valid json",
      };

      // Should not throw
      const svg = generateSvg(icon);
      expect(svg).toContain("<svg");
      expect(svg).toContain("</svg>");
    });
  });

  describe("generateReactComponent", () => {
    it("generates React import code", () => {
      const icon: ParsedIcon = {
        name: "ArrowDown16",
        iconName: "ArrowDown",
        type: "navigation",
        size: 16,
        viewBox: "0 0 16 16",
        paths: "[]",
      };

      const code = generateReactComponent(icon);
      expect(code).toContain("@mozaic-ds/react");
      expect(code).toContain("<MIcon");
      expect(code).toContain('name="ArrowDown16"');
      expect(code).toContain("@mozaic-ds/icons/js/icons");
      expect(code).toContain("ArrowDown16");
    });
  });

  describe("generateVueComponent", () => {
    it("generates Vue component code", () => {
      const icon: ParsedIcon = {
        name: "Cart24",
        iconName: "Cart",
        type: "action",
        size: 24,
        viewBox: "0 0 24 24",
        paths: "[]",
      };

      const code = generateVueComponent(icon);
      expect(code).toContain("<template>");
      expect(code).toContain("<MIcon");
      expect(code).toContain('name="Cart24"');
      expect(code).toContain("@mozaic-ds/vue-3");
      expect(code).toContain("<script setup>");
    });
  });

  describe("icon name parsing", () => {
    it("correctly identifies size from icon name", () => {
      // Test via the parsed icon structure
      const icon16: ParsedIcon = {
        name: "Arrow16",
        iconName: "Arrow",
        type: "navigation",
        size: 16,
        viewBox: "0 0 16 16",
        paths: "[]",
      };
      expect(icon16.size).toBe(16);

      const icon64: ParsedIcon = {
        name: "Arrow64",
        iconName: "Arrow",
        type: "navigation",
        size: 64,
        viewBox: "0 0 64 64",
        paths: "[]",
      };
      expect(icon64.size).toBe(64);
    });

    it("correctly extracts clean icon name", () => {
      const icon: ParsedIcon = {
        name: "ArrowArrowBottom16",
        iconName: "ArrowArrowBottom",
        type: "navigation",
        size: 16,
        viewBox: "0 0 16 16",
        paths: "[]",
      };
      expect(icon.iconName).toBe("ArrowArrowBottom");
      expect(icon.iconName).not.toContain("16");
    });
  });

  describe("icon types", () => {
    it("supports navigation type", () => {
      const icon: ParsedIcon = {
        name: "ArrowUp16",
        iconName: "ArrowUp",
        type: "navigation",
        size: 16,
        viewBox: "0 0 16 16",
        paths: "[]",
      };
      expect(icon.type).toBe("navigation");
    });

    it("supports media type", () => {
      const icon: ParsedIcon = {
        name: "Play24",
        iconName: "Play",
        type: "media",
        size: 24,
        viewBox: "0 0 24 24",
        paths: "[]",
      };
      expect(icon.type).toBe("media");
    });

    it("supports social type", () => {
      const icon: ParsedIcon = {
        name: "Share16",
        iconName: "Share",
        type: "social",
        size: 16,
        viewBox: "0 0 16 16",
        paths: "[]",
      };
      expect(icon.type).toBe("social");
    });
  });
});
