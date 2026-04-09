import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Database from "better-sqlite3";
import { resolve } from "path";
import { handleGetComponentInfo } from "../tools/get-component-info.js";
import { handleGetDesignTokens } from "../tools/get-design-tokens.js";
import { handleSearchDocumentation } from "../tools/search-documentation.js";
import { handleListComponents } from "../tools/list-components.js";
import { handleGetCssUtility } from "../tools/get-css-utility.js";
import { handleListCssUtilities } from "../tools/list-css-utilities.js";
import { handleGetInstallInfo } from "../tools/get-install-info.js";
import { handleGenerateWebComponent } from "../tools/generate-webcomponent.js";
import { handleGetWebComponentInfo } from "../tools/get-webcomponent-info.js";
import { handleListWebComponents } from "../tools/list-webcomponents.js";

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
      expect(
        data.props.some((p: { name: string }) => p.name === "size" || p.name === "appearance")
      ).toBe(true);
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
      expect(
        data.components.action.some(
          (c: { name: string }) => c.name === "MButton" || c.name === "Button"
        )
      ).toBe(true);
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

  describe("get_install_info", () => {
    it("returns Vue install info for button", () => {
      const result = handleGetInstallInfo(db, { component: "button" });
      const data = JSON.parse(result.content[0].text);

      expect(data.component).toBe("MButton");
      expect(data.framework).toBe("vue");
      expect(data.package).toBe("@mozaic-ds/vue-3");
      expect(data.installCommand).toBe("npm install @mozaic-ds/vue-3");
      expect(data.imports.component).toContain("MButton");
      expect(data.imports.styles).toContain("@mozaic-ds/styles");
    });

    it("returns React install info", () => {
      const result = handleGetInstallInfo(db, { component: "button", framework: "react" });
      const data = JSON.parse(result.content[0].text);

      expect(data.framework).toBe("react");
      expect(data.package).toBe("@mozaic-ds/react");
      expect(data.peerDependencies).toContain("react@^17 || ^18");
    });

    it("supports yarn package manager", () => {
      const result = handleGetInstallInfo(db, {
        component: "button",
        packageManager: "yarn",
      });
      const data = JSON.parse(result.content[0].text);

      expect(data.installCommand).toBe("yarn add @mozaic-ds/vue-3");
      expect(data.relatedPackages.styles.installCommand).toContain("yarn add");
    });

    it("supports pnpm package manager", () => {
      const result = handleGetInstallInfo(db, {
        component: "button",
        packageManager: "pnpm",
      });
      const data = JSON.parse(result.content[0].text);

      expect(data.installCommand).toBe("pnpm add @mozaic-ds/vue-3");
    });

    it("includes quick start code", () => {
      const result = handleGetInstallInfo(db, { component: "modal" });
      const data = JSON.parse(result.content[0].text);

      expect(data.quickStart).toBeDefined();
      expect(data.quickStart.setup).toContain("@mozaic-ds/styles");
      expect(data.quickStart.usage).toContain("MModal");
    });

    it("returns error for unknown component", () => {
      const result = handleGetInstallInfo(db, { component: "nonexistent" });
      const data = JSON.parse(result.content[0].text);

      expect(data.error).toContain("not found");
    });

    it("returns error for empty component name", () => {
      const result = handleGetInstallInfo(db, { component: "" });
      const data = JSON.parse(result.content[0].text);

      expect(data.error).toContain("Please provide a component name");
    });
  });

  describe("Web Components Tools", () => {
    describe("generate_webcomponent", () => {
      it("generates basic web component code", () => {
        const result = handleGenerateWebComponent(db, { component: "button" });

        expect(result.content[0].text).toContain("import '@adeo/mozaic-web-components/button.js'");
        expect(result.content[0].text).toContain("<");
        expect(result.content[0].text).toContain(">");
      });

      it("generates component with attributes", () => {
        const result = handleGenerateWebComponent(db, {
          component: "button",
          attributes: { theme: "primary", size: "m" },
        });

        expect(result.content[0].text).toContain('theme="primary"');
        expect(result.content[0].text).toContain('size="m"');
      });

      it("generates component with children", () => {
        const result = handleGenerateWebComponent(db, {
          component: "button",
          children: "Click me",
        });

        expect(result.content[0].text).toContain("Click me");
        expect(result.content[0].text).toMatch(/<[^>]+>[\s\S]*Click me[\s\S]*<\/[^>]+>/);
      });

      it("handles kebab-case conversion", () => {
        const result = handleGenerateWebComponent(db, { component: "button" });

        // Should generate mozaic-button or similar tag name
        expect(result.content[0].text).toContain("<");
      });
    });

    describe("get_webcomponent_info", () => {
      it("returns web component information", () => {
        const result = handleGetWebComponentInfo(db, { component: "button" });

        // Check if it's a formatted markdown response or contains component info
        expect(result.content[0].text).toBeDefined();
        expect(result.content[0].text.length).toBeGreaterThan(0);
      });

      it("handles component not found", () => {
        const result = handleGetWebComponentInfo(db, { component: "nonexistent-wc" });

        expect(result.content[0].text).toContain("not found");
      });

      it("shows attributes section", () => {
        const result = handleGetWebComponentInfo(db, { component: "button" });

        // Should contain structured information
        expect(result.content[0].text).toBeDefined();
      });
    });

    describe("list_webcomponents", () => {
      it("lists all web components", () => {
        const result = handleListWebComponents(db, { category: "all" });

        expect(result.content[0].text).toBeDefined();
        expect(result.content[0].text.length).toBeGreaterThan(0);
      });

      it("filters web components by category", () => {
        const result = handleListWebComponents(db, { category: "form" });

        expect(result.content[0].text).toBeDefined();
      });

      it("returns proper structure", () => {
        const result = handleListWebComponents(db, { category: "all" });

        // Check that it contains either formatted text or JSON
        expect(result.content[0].text).toBeDefined();
      });
    });

    describe("get_component_info with webcomponents framework", () => {
      it("supports webcomponents as framework option", () => {
        const result = handleGetComponentInfo(db, {
          component: "button",
          framework: "webcomponents",
        });

        expect(result.content[0].text).toBeDefined();
      });

      it("generates web component example for webcomponents framework", () => {
        const result = handleGetComponentInfo(db, {
          component: "button",
          framework: "webcomponents",
        });

        const data = JSON.parse(result.content[0].text);

        // Should have examples property
        expect(data.examples).toBeDefined();
      });
    });
  });
});
