import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Database from "better-sqlite3";
import { resolve } from "path";
import { handleGetComponentInfo } from "../tools/get-component-info.js";
import { handleGetDesignTokens } from "../tools/get-design-tokens.js";
import { handleSearchDocumentation } from "../tools/search-documentation.js";
import { handleListComponents } from "../tools/list-components.js";
import { handleGetCssUtility } from "../tools/get-css-utility.js";
import { handleListCssUtilities } from "../tools/list-css-utilities.js";

describe("MCP Tools Integration Tests", () => {
  let db: Database.Database;

  beforeAll(() => {
    const dbPath = resolve(process.cwd(), "data/mozaic.db");
    db = new Database(dbPath, { readonly: true });
  });

  afterAll(() => {
    db.close();
  });

  describe("get_component_info", () => {
    it("returns Button component with props", () => {
      const result = handleGetComponentInfo(db, { component: "button" });
      const data = JSON.parse(result.content[0].text);

      expect(data.name).toBe("MButton");
      expect(data.props.length).toBeGreaterThan(0);
      expect(data.props.some((p: { name: string }) => p.name === "size" || p.name === "appearance")).toBe(true);
    });

    it("returns Vue examples by default", () => {
      const result = handleGetComponentInfo(db, { component: "button" });
      const data = JSON.parse(result.content[0].text);

      expect(data.examples.length).toBeGreaterThan(0);
    });

    it("returns React examples when framework=react", () => {
      const result = handleGetComponentInfo(db, { component: "button", framework: "react" });
      const data = JSON.parse(result.content[0].text);

      // Component name remains the same, but examples are filtered by framework
      expect(data.name).toBeDefined();
      expect(data.examples).toBeDefined();
    });

    it("handles MButton prefix", () => {
      const result = handleGetComponentInfo(db, { component: "MButton" });
      const data = JSON.parse(result.content[0].text);

      expect(data.name).toBe("MButton");
    });

    it("returns error for unknown component", () => {
      const result = handleGetComponentInfo(db, { component: "nonexistent" });

      expect(result.content[0].text).toContain("Component not found");
    });
  });

  describe("get_design_tokens", () => {
    it("returns color tokens", () => {
      const result = handleGetDesignTokens(db, { category: "colors" });
      const data = JSON.parse(result.content[0].text);

      expect(data.length).toBeGreaterThan(100);
      expect(data[0]).toHaveProperty("path");
      expect(data[0]).toHaveProperty("value");
    });

    it("returns spacing tokens", () => {
      const result = handleGetDesignTokens(db, { category: "spacing" });
      const data = JSON.parse(result.content[0].text);

      expect(data.length).toBeGreaterThan(10);
      expect(data.some((t: { path: string }) => t.path.includes("mu"))).toBe(true);
    });

    it("formats as CSS variables", () => {
      const result = handleGetDesignTokens(db, { category: "spacing", format: "css" });

      expect(result.content[0].text).toContain(":root {");
      expect(result.content[0].text).toContain("--");
    });

    it("formats as SCSS variables", () => {
      const result = handleGetDesignTokens(db, { category: "spacing", format: "scss" });

      expect(result.content[0].text).toContain("$");
    });

    it("returns all categories when category=all", () => {
      const result = handleGetDesignTokens(db, { category: "all" });
      const data = JSON.parse(result.content[0].text);

      expect(data.length).toBeGreaterThan(500);
    });
  });

  describe("search_documentation", () => {
    it("finds button documentation", () => {
      const result = handleSearchDocumentation(db, { query: "button" });
      const data = JSON.parse(result.content[0].text);

      expect(data.results.length).toBeGreaterThan(0);
      expect(data.results[0]).toHaveProperty("title");
      expect(data.results[0]).toHaveProperty("path");
    });

    it("returns snippets with highlights", () => {
      const result = handleSearchDocumentation(db, { query: "color" });
      const data = JSON.parse(result.content[0].text);

      expect(data.results.length).toBeGreaterThan(0);
      expect(data.results[0]).toHaveProperty("snippet");
    });

    it("limits results", () => {
      const result = handleSearchDocumentation(db, { query: "component", limit: 5 });
      const data = JSON.parse(result.content[0].text);

      expect(data.results.length).toBeLessThanOrEqual(5);
    });

    it("handles empty query gracefully", () => {
      const result = handleSearchDocumentation(db, { query: "" });

      expect(result.content[0].text).toBeDefined();
    });
  });

  describe("list_components", () => {
    it("lists all components grouped by category", () => {
      const result = handleListComponents(db, {});
      const data = JSON.parse(result.content[0].text);

      expect(data.total).toBeGreaterThan(80);
      expect(data.categories.length).toBeGreaterThan(3);
      // When category="all", components is grouped object
      expect(data.components).toBeDefined();
    });

    it("includes action category components", () => {
      const result = handleListComponents(db, {});
      const data = JSON.parse(result.content[0].text);

      expect(data.components.action).toBeDefined();
      expect(data.components.action.some((c: { name: string }) =>
        c.name === "MButton" || c.name === "Button"
      )).toBe(true);
    });

    it("filters by category", () => {
      const result = handleListComponents(db, { category: "action" });
      const data = JSON.parse(result.content[0].text);

      expect(data.total).toBeGreaterThan(0);
      // When filtered, components is array
      expect(Array.isArray(data.components)).toBe(true);
    });
  });

  describe("get_css_utility", () => {
    it("returns Flexy utility with classes", () => {
      const result = handleGetCssUtility(db, { name: "flexy" });
      const data = JSON.parse(result.content[0].text);

      expect(data.name).toBe("Flexy");
      expect(data.classes.length).toBeGreaterThan(100);
      expect(data.classes.some((c: string) => c.includes("ml-flexy"))).toBe(true);
    });

    it("returns Margin utility", () => {
      const result = handleGetCssUtility(db, { name: "margin" });
      const data = JSON.parse(result.content[0].text);

      expect(data.name).toBe("Margin");
      expect(data.classes.length).toBeGreaterThan(50);
    });

    it("returns examples", () => {
      const result = handleGetCssUtility(db, { name: "flexy" });
      const data = JSON.parse(result.content[0].text);

      expect(data.examples.length).toBeGreaterThan(0);
    });

    it("returns error for unknown utility", () => {
      const result = handleGetCssUtility(db, { name: "nonexistent" });

      expect(result.content[0].text).toContain("not found");
    });
  });

  describe("list_css_utilities", () => {
    it("lists all utilities", () => {
      const result = handleListCssUtilities(db, {});
      const data = JSON.parse(result.content[0].text);

      // Returns array directly, not { utilities: [...] }
      expect(data.length).toBe(6);
      expect(data.some((u: { name: string }) => u.name === "Flexy")).toBe(true);
      expect(data.some((u: { name: string }) => u.name === "Margin")).toBe(true);
    });

    it("filters by category", () => {
      const result = handleListCssUtilities(db, { category: "layout" });
      const data = JSON.parse(result.content[0].text);

      expect(data.length).toBe(2);
      expect(data.every((u: { category: string }) => u.category === "layout")).toBe(true);
    });
  });
});
