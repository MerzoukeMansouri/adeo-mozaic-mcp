import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { SCHEMA } from "../db/schema.js";

describe("Sanity Check - Database Integrity", () => {
  let db: Database.Database;

  beforeEach(() => {
    // Create in-memory database for testing
    db = new Database(":memory:");
    db.exec(SCHEMA);
  });

  afterEach(() => {
    db.close();
  });

  describe("Token checks", () => {
    it("should detect missing token categories", () => {
      // Insert tokens with only some categories
      db.prepare(
        "INSERT INTO tokens (category, name, path, value_raw, css_variable) VALUES (?, ?, ?, ?, ?)"
      ).run("color", "primary", "color.primary", "#000", "--color-primary");

      const categories = db.prepare("SELECT DISTINCT category FROM tokens").all() as Array<{
        category: string;
      }>;

      expect(categories).toHaveLength(1);
      expect(categories[0].category).toBe("color");
    });

    it("should count tokens by category", () => {
      // Insert multiple tokens
      const insert = db.prepare(
        "INSERT INTO tokens (category, name, path, value_raw, css_variable) VALUES (?, ?, ?, ?, ?)"
      );

      insert.run("color", "primary-100", "color.primary.100", "#fff", "--color-primary-100");
      insert.run("color", "primary-200", "color.primary.200", "#eee", "--color-primary-200");
      insert.run("spacing", "mu100", "spacing.mu100", "16px", "--spacing-mu100");

      const counts = db
        .prepare("SELECT category, COUNT(*) as count FROM tokens GROUP BY category")
        .all() as Array<{ category: string; count: number }>;

      expect(counts).toHaveLength(2);
      const colorCount = counts.find((c) => c.category === "color");
      const spacingCount = counts.find((c) => c.category === "spacing");

      expect(colorCount?.count).toBe(2);
      expect(spacingCount?.count).toBe(1);
    });

    it("should detect missing required fields", () => {
      // Insert token with missing path
      db.prepare("INSERT INTO tokens (category, name, path, value_raw) VALUES (?, ?, ?, ?)").run(
        "color",
        "test",
        "",
        "value"
      );

      const emptyPath = db
        .prepare("SELECT COUNT(*) as count FROM tokens WHERE path IS NULL OR path = ''")
        .get() as { count: number };

      expect(emptyPath.count).toBe(1);
    });
  });

  describe("Component checks", () => {
    it("should count components by framework", () => {
      const insert = db.prepare(
        "INSERT INTO components (name, slug, category, frameworks) VALUES (?, ?, ?, ?)"
      );

      insert.run("Button", "button", "action", '["vue"]');
      insert.run("Input", "input", "form", '["vue"]');
      insert.run("Card", "card", "layout", '["react"]');
      insert.run("Modal", "modal", "feedback", '["vue", "react"]');

      const vueCount = db
        .prepare("SELECT COUNT(*) as count FROM components WHERE frameworks LIKE '%vue%'")
        .get() as { count: number };
      const reactCount = db
        .prepare("SELECT COUNT(*) as count FROM components WHERE frameworks LIKE '%react%'")
        .get() as { count: number };

      expect(vueCount.count).toBe(3);
      expect(reactCount.count).toBe(2);
    });

    it("should detect components without props", () => {
      const insertComponent = db.prepare(
        "INSERT INTO components (name, slug, frameworks) VALUES (?, ?, ?)"
      );
      const insertProp = db.prepare(
        "INSERT INTO component_props (component_id, name, type) VALUES (?, ?, ?)"
      );

      const c1 = insertComponent.run("Button", "button", '["vue"]');
      const c2 = insertComponent.run("Input", "input", '["vue"]');
      insertComponent.run("Card", "card", '["react"]');

      // Only add props to first two components
      insertProp.run(c1.lastInsertRowid, "size", "string");
      insertProp.run(c2.lastInsertRowid, "value", "string");

      const total = db.prepare("SELECT COUNT(*) as count FROM components").get() as {
        count: number;
      };
      const withProps = db
        .prepare("SELECT COUNT(DISTINCT component_id) as count FROM component_props")
        .get() as { count: number };

      expect(total.count).toBe(3);
      expect(withProps.count).toBe(2);
      expect(Math.round((withProps.count / total.count) * 100)).toBe(67);
    });
  });

  describe("CSS Utility checks", () => {
    it("should count CSS utility classes", () => {
      const insertUtility = db.prepare(
        "INSERT INTO css_utilities (name, slug, category) VALUES (?, ?, ?)"
      );
      const insertClass = db.prepare(
        "INSERT INTO css_utility_classes (utility_id, class_name) VALUES (?, ?)"
      );

      const u1 = insertUtility.run("Flexy", "flexy", "layout");
      const u2 = insertUtility.run("Margin", "margin", "utility");

      insertClass.run(u1.lastInsertRowid, ".ml-flexy");
      insertClass.run(u1.lastInsertRowid, ".ml-flexy__col");
      insertClass.run(u1.lastInsertRowid, ".ml-flexy__col--6of12");
      insertClass.run(u2.lastInsertRowid, ".mu100");

      const counts = db
        .prepare(
          `SELECT u.name, COUNT(c.id) as count
           FROM css_utilities u
           LEFT JOIN css_utility_classes c ON c.utility_id = u.id
           GROUP BY u.id`
        )
        .all() as Array<{ name: string; count: number }>;

      expect(counts.find((c) => c.name === "Flexy")?.count).toBe(3);
      expect(counts.find((c) => c.name === "Margin")?.count).toBe(1);
    });

    it("should detect utilities without examples", () => {
      const insertUtility = db.prepare(
        "INSERT INTO css_utilities (name, slug, category) VALUES (?, ?, ?)"
      );
      const insertExample = db.prepare(
        "INSERT INTO css_utility_examples (utility_id, title, code) VALUES (?, ?, ?)"
      );

      const u1 = insertUtility.run("Flexy", "flexy", "layout");
      insertUtility.run("Container", "container", "layout");

      insertExample.run(u1.lastInsertRowid, "Basic", '<div class="ml-flexy"></div>');

      const total = db.prepare("SELECT COUNT(*) as count FROM css_utilities").get() as {
        count: number;
      };
      const withExamples = db
        .prepare("SELECT COUNT(DISTINCT utility_id) as count FROM css_utility_examples")
        .get() as { count: number };

      expect(total.count).toBe(2);
      expect(withExamples.count).toBe(1);
    });
  });

  describe("Foreign Key Integrity", () => {
    it("should detect orphaned component_props", () => {
      // Disable FK constraints to test orphan detection logic
      db.pragma("foreign_keys = OFF");

      // Insert component
      const insertComponent = db.prepare(
        "INSERT INTO components (name, slug, frameworks) VALUES (?, ?, ?)"
      );
      const c1 = insertComponent.run("Button", "button", '["vue"]');

      // Insert valid prop
      db.prepare("INSERT INTO component_props (component_id, name, type) VALUES (?, ?, ?)").run(
        c1.lastInsertRowid,
        "size",
        "string"
      );

      // Insert orphaned prop (referencing non-existent component)
      db.prepare("INSERT INTO component_props (component_id, name, type) VALUES (?, ?, ?)").run(
        9999,
        "orphan",
        "string"
      );

      const orphans = db
        .prepare(
          `SELECT COUNT(*) as count FROM component_props cp
           WHERE NOT EXISTS (SELECT 1 FROM components c WHERE c.id = cp.component_id)`
        )
        .get() as { count: number };

      expect(orphans.count).toBe(1);

      // Re-enable FK constraints
      db.pragma("foreign_keys = ON");
    });

    it("should detect orphaned css_utility_classes", () => {
      // Disable FK constraints to test orphan detection logic
      db.pragma("foreign_keys = OFF");

      const insertUtility = db.prepare(
        "INSERT INTO css_utilities (name, slug, category) VALUES (?, ?, ?)"
      );
      const u1 = insertUtility.run("Flexy", "flexy", "layout");

      db.prepare("INSERT INTO css_utility_classes (utility_id, class_name) VALUES (?, ?)").run(
        u1.lastInsertRowid,
        ".ml-flexy"
      );
      db.prepare("INSERT INTO css_utility_classes (utility_id, class_name) VALUES (?, ?)").run(
        9999,
        ".orphan"
      );

      const orphans = db
        .prepare(
          `SELECT COUNT(*) as count FROM css_utility_classes cuc
           WHERE NOT EXISTS (SELECT 1 FROM css_utilities cu WHERE cu.id = cuc.utility_id)`
        )
        .get() as { count: number };

      expect(orphans.count).toBe(1);

      // Re-enable FK constraints
      db.pragma("foreign_keys = ON");
    });
  });

  describe("Full-Text Search", () => {
    it("should index tokens for FTS", () => {
      db.prepare(
        "INSERT INTO tokens (category, name, path, value_raw, css_variable) VALUES (?, ?, ?, ?, ?)"
      ).run("color", "primary-100", "color.primary.100", "#1a73e8", "--color-primary-100");

      db.prepare(
        "INSERT INTO tokens (category, name, path, value_raw, css_variable) VALUES (?, ?, ?, ?, ?)"
      ).run("color", "secondary-100", "color.secondary.100", "#666", "--color-secondary-100");

      const results = db
        .prepare("SELECT COUNT(*) as count FROM tokens_fts WHERE tokens_fts MATCH 'primary'")
        .get() as { count: number };

      expect(results.count).toBe(1);
    });

    it("should index documentation for FTS", () => {
      db.prepare(
        "INSERT INTO documentation (title, path, content, category, keywords) VALUES (?, ?, ?, ?, ?)"
      ).run(
        "Button",
        "/components/button",
        "Button component documentation",
        "components",
        "button,action"
      );

      db.prepare(
        "INSERT INTO documentation (title, path, content, category, keywords) VALUES (?, ?, ?, ?, ?)"
      ).run("Input", "/components/input", "Input field documentation", "components", "input,form");

      const results = db
        .prepare("SELECT COUNT(*) as count FROM docs_fts WHERE docs_fts MATCH 'button'")
        .get() as { count: number };

      expect(results.count).toBe(1);
    });
  });
});
