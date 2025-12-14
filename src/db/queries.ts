import Database from "better-sqlite3";
import { initSchema } from "./schema.js";

// Types
export interface TokenProperty {
  property: string;
  value: string;
  valueNumber?: number;
  valueUnit?: string;
}

export interface Token {
  category: string;
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
  properties?: TokenProperty[];
}

export interface ComponentProp {
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  options?: string[];
  description?: string;
}

export interface ComponentSlot {
  name: string;
  description?: string;
}

export interface ComponentEvent {
  name: string;
  payload?: string;
  description?: string;
}

export interface ComponentExample {
  framework: string;
  title?: string;
  code: string;
  description?: string;
}

export interface Component {
  name: string;
  slug: string;
  category?: string;
  description?: string;
  frameworks?: string[];
  props?: ComponentProp[];
  slots?: ComponentSlot[];
  events?: ComponentEvent[];
  examples?: ComponentExample[];
  cssClasses?: string[];
}

export interface Documentation {
  title: string;
  path: string;
  content: string;
  category?: string;
  keywords?: string[];
}

// Database initialization
export function initDatabase(dbPath: string): Database.Database {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  initSchema(db);
  return db;
}

// Token operations
export function insertTokens(db: Database.Database, tokens: Token[]): void {
  const tokenStmt = db.prepare(`
    INSERT INTO tokens (
      category, subcategory, name, path, css_variable, scss_variable,
      value_raw, value_number, value_unit, value_computed,
      description, platform, source_file
    )
    VALUES (
      @category, @subcategory, @name, @path, @cssVariable, @scssVariable,
      @valueRaw, @valueNumber, @valueUnit, @valueComputed,
      @description, @platform, @sourceFile
    )
  `);

  const propertyStmt = db.prepare(`
    INSERT INTO token_properties (token_id, property, value, value_number, value_unit)
    VALUES (@tokenId, @property, @value, @valueNumber, @valueUnit)
  `);

  const insertMany = db.transaction((items: Token[]) => {
    for (const item of items) {
      const result = tokenStmt.run({
        category: item.category,
        subcategory: item.subcategory ?? null,
        name: item.name,
        path: item.path,
        cssVariable: item.cssVariable ?? null,
        scssVariable: item.scssVariable ?? null,
        valueRaw: item.valueRaw,
        valueNumber: item.valueNumber ?? null,
        valueUnit: item.valueUnit ?? null,
        valueComputed: item.valueComputed ?? null,
        description: item.description ?? null,
        platform: item.platform ?? "all",
        sourceFile: item.sourceFile ?? null,
      });

      // Insert token properties if any (for composite tokens like shadows)
      if (item.properties && item.properties.length > 0) {
        const tokenId = result.lastInsertRowid as number;
        for (const prop of item.properties) {
          propertyStmt.run({
            tokenId,
            property: prop.property,
            value: prop.value,
            valueNumber: prop.valueNumber ?? null,
            valueUnit: prop.valueUnit ?? null,
          });
        }
      }
    }
  });

  insertMany(tokens);
}

interface TokenRow {
  id: number;
  category: string;
  subcategory: string | null;
  name: string;
  path: string;
  css_variable: string | null;
  scss_variable: string | null;
  value_raw: string;
  value_number: number | null;
  value_unit: string | null;
  value_computed: string | null;
  description: string | null;
  platform: string;
  source_file: string | null;
}

interface TokenPropertyRow {
  property: string;
  value: string;
  value_number: number | null;
  value_unit: string | null;
}

function rowToToken(row: TokenRow, properties?: TokenPropertyRow[]): Token {
  const token: Token = {
    category: row.category,
    subcategory: row.subcategory ?? undefined,
    name: row.name,
    path: row.path,
    cssVariable: row.css_variable ?? undefined,
    scssVariable: row.scss_variable ?? undefined,
    valueRaw: row.value_raw,
    valueNumber: row.value_number ?? undefined,
    valueUnit: row.value_unit ?? undefined,
    valueComputed: row.value_computed ?? undefined,
    description: row.description ?? undefined,
    platform: row.platform,
    sourceFile: row.source_file ?? undefined,
  };

  if (properties && properties.length > 0) {
    token.properties = properties.map((p) => ({
      property: p.property,
      value: p.value,
      valueNumber: p.value_number ?? undefined,
      valueUnit: p.value_unit ?? undefined,
    }));
  }

  return token;
}

export function getTokensByCategory(
  db: Database.Database,
  category: string
): Token[] {
  const rows = category === "all"
    ? db.prepare("SELECT * FROM tokens").all() as TokenRow[]
    : db.prepare("SELECT * FROM tokens WHERE category = ?").all(category) as TokenRow[];

  return rows.map((row) => {
    const properties = db
      .prepare("SELECT property, value, value_number, value_unit FROM token_properties WHERE token_id = ?")
      .all(row.id) as TokenPropertyRow[];
    return rowToToken(row, properties);
  });
}

export function getTokensBySubcategory(
  db: Database.Database,
  category: string,
  subcategory: string
): Token[] {
  const rows = db
    .prepare("SELECT * FROM tokens WHERE category = ? AND subcategory = ?")
    .all(category, subcategory) as TokenRow[];

  return rows.map((row) => {
    const properties = db
      .prepare("SELECT property, value, value_number, value_unit FROM token_properties WHERE token_id = ?")
      .all(row.id) as TokenPropertyRow[];
    return rowToToken(row, properties);
  });
}

export function getTokenByPath(
  db: Database.Database,
  path: string
): Token | undefined {
  const row = db
    .prepare("SELECT * FROM tokens WHERE path = ?")
    .get(path) as TokenRow | undefined;

  if (!row) return undefined;

  const properties = db
    .prepare("SELECT property, value, value_number, value_unit FROM token_properties WHERE token_id = ?")
    .all(row.id) as TokenPropertyRow[];

  return rowToToken(row, properties);
}

export function searchTokens(
  db: Database.Database,
  query: string,
  limit: number = 20
): Token[] {
  const rows = db
    .prepare(`
      SELECT t.*
      FROM tokens_fts
      JOIN tokens t ON tokens_fts.rowid = t.id
      WHERE tokens_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `)
    .all(query, limit) as TokenRow[];

  return rows.map((row) => {
    const properties = db
      .prepare("SELECT property, value, value_number, value_unit FROM token_properties WHERE token_id = ?")
      .all(row.id) as TokenPropertyRow[];
    return rowToToken(row, properties);
  });
}

// Component operations
export function insertComponent(
  db: Database.Database,
  component: Component
): number {
  const result = db
    .prepare(
      `
    INSERT INTO components (name, slug, category, description, frameworks)
    VALUES (@name, @slug, @category, @description, @frameworks)
  `
    )
    .run({
      name: component.name,
      slug: component.slug,
      category: component.category ?? null,
      description: component.description ?? null,
      frameworks: component.frameworks
        ? JSON.stringify(component.frameworks)
        : null,
    });

  const componentId = result.lastInsertRowid as number;

  // Insert props
  if (component.props && component.props.length > 0) {
    const propStmt = db.prepare(`
      INSERT INTO component_props (component_id, name, type, default_value, required, options, description)
      VALUES (@componentId, @name, @type, @defaultValue, @required, @options, @description)
    `);
    for (const prop of component.props) {
      propStmt.run({
        componentId,
        name: prop.name,
        type: prop.type ?? null,
        defaultValue: prop.defaultValue ?? null,
        required: prop.required ? 1 : 0,
        options: prop.options ? JSON.stringify(prop.options) : null,
        description: prop.description ?? null,
      });
    }
  }

  // Insert slots
  if (component.slots && component.slots.length > 0) {
    const slotStmt = db.prepare(`
      INSERT INTO component_slots (component_id, name, description)
      VALUES (@componentId, @name, @description)
    `);
    for (const slot of component.slots) {
      slotStmt.run({
        componentId,
        name: slot.name,
        description: slot.description ?? null,
      });
    }
  }

  // Insert events
  if (component.events && component.events.length > 0) {
    const eventStmt = db.prepare(`
      INSERT INTO component_events (component_id, name, payload, description)
      VALUES (@componentId, @name, @payload, @description)
    `);
    for (const event of component.events) {
      eventStmt.run({
        componentId,
        name: event.name,
        payload: event.payload ?? null,
        description: event.description ?? null,
      });
    }
  }

  // Insert examples
  if (component.examples && component.examples.length > 0) {
    const exampleStmt = db.prepare(`
      INSERT INTO component_examples (component_id, framework, title, code, description)
      VALUES (@componentId, @framework, @title, @code, @description)
    `);
    for (const example of component.examples) {
      exampleStmt.run({
        componentId,
        framework: example.framework,
        title: example.title ?? null,
        code: example.code,
        description: example.description ?? null,
      });
    }
  }

  // Insert CSS classes
  if (component.cssClasses && component.cssClasses.length > 0) {
    const cssStmt = db.prepare(`
      INSERT INTO component_css_classes (component_id, class_name)
      VALUES (@componentId, @className)
    `);
    for (const className of component.cssClasses) {
      cssStmt.run({ componentId, className });
    }
  }

  return componentId;
}

export function insertComponents(
  db: Database.Database,
  components: Component[]
): void {
  const transaction = db.transaction((items: Component[]) => {
    for (const component of items) {
      insertComponent(db, component);
    }
  });
  transaction(components);
}

export function getComponentBySlug(
  db: Database.Database,
  slug: string
): Component | null {
  const row = db
    .prepare("SELECT * FROM components WHERE slug = ? COLLATE NOCASE")
    .get(slug) as { id: number; name: string; slug: string; category: string; description: string; frameworks: string } | undefined;

  if (!row) return null;

  const props = db
    .prepare("SELECT * FROM component_props WHERE component_id = ?")
    .all(row.id) as Array<{
      name: string;
      type: string;
      default_value: string;
      required: number;
      options: string;
      description: string;
    }>;

  const slots = db
    .prepare("SELECT * FROM component_slots WHERE component_id = ?")
    .all(row.id) as Array<{ name: string; description: string }>;

  const events = db
    .prepare("SELECT * FROM component_events WHERE component_id = ?")
    .all(row.id) as Array<{ name: string; payload: string; description: string }>;

  const examples = db
    .prepare("SELECT * FROM component_examples WHERE component_id = ?")
    .all(row.id) as Array<{
      framework: string;
      title: string;
      code: string;
      description: string;
    }>;

  const cssClasses = db
    .prepare("SELECT class_name FROM component_css_classes WHERE component_id = ?")
    .all(row.id) as Array<{ class_name: string }>;

  return {
    name: row.name,
    slug: row.slug,
    category: row.category,
    description: row.description,
    frameworks: row.frameworks ? JSON.parse(row.frameworks) : [],
    props: props.map((p) => ({
      name: p.name,
      type: p.type,
      defaultValue: p.default_value,
      required: p.required === 1,
      options: p.options ? JSON.parse(p.options) : undefined,
      description: p.description,
    })),
    slots: slots.map((s) => ({
      name: s.name,
      description: s.description,
    })),
    events: events.map((e) => ({
      name: e.name,
      payload: e.payload,
      description: e.description,
    })),
    examples: examples.map((ex) => ({
      framework: ex.framework,
      title: ex.title,
      code: ex.code,
      description: ex.description,
    })),
    cssClasses: cssClasses.map((c) => c.class_name),
  };
}

export function listComponents(
  db: Database.Database,
  category?: string
): Array<{ name: string; slug: string; category: string; description: string }> {
  if (category && category !== "all") {
    return db
      .prepare(
        "SELECT name, slug, category, description FROM components WHERE category = ?"
      )
      .all(category) as Array<{ name: string; slug: string; category: string; description: string }>;
  }
  return db
    .prepare("SELECT name, slug, category, description FROM components")
    .all() as Array<{ name: string; slug: string; category: string; description: string }>;
}

// Documentation operations
export function insertDocs(
  db: Database.Database,
  docs: Documentation[]
): void {
  const stmt = db.prepare(`
    INSERT INTO documentation (title, path, content, category, keywords)
    VALUES (@title, @path, @content, @category, @keywords)
  `);

  const insertMany = db.transaction((items: Documentation[]) => {
    for (const item of items) {
      stmt.run({
        title: item.title,
        path: item.path,
        content: item.content,
        category: item.category ?? null,
        keywords: item.keywords ? JSON.stringify(item.keywords) : null,
      });
    }
  });

  insertMany(docs);
}

export function searchDocumentation(
  db: Database.Database,
  query: string,
  limit: number = 5
): Array<{ title: string; path: string; snippet: string; category: string }> {
  const results = db
    .prepare(
      `
    SELECT
      d.title,
      d.path,
      d.category,
      snippet(docs_fts, 1, '<mark>', '</mark>', '...', 64) as snippet
    FROM docs_fts
    JOIN documentation d ON docs_fts.rowid = d.id
    WHERE docs_fts MATCH ?
    ORDER BY rank
    LIMIT ?
  `
    )
    .all(query, limit) as Array<{ title: string; path: string; snippet: string; category: string }>;

  return results;
}

export function getDocumentationByPath(
  db: Database.Database,
  path: string
): Documentation | undefined {
  return db
    .prepare("SELECT * FROM documentation WHERE path = ?")
    .get(path) as Documentation | undefined;
}

// Utility functions
export function clearDatabase(db: Database.Database): void {
  db.exec(`
    DELETE FROM token_properties;
    DELETE FROM tokens;
    DELETE FROM component_css_classes;
    DELETE FROM component_examples;
    DELETE FROM component_events;
    DELETE FROM component_slots;
    DELETE FROM component_props;
    DELETE FROM components;
    DELETE FROM documentation;
  `);
}

export function getDatabaseStats(db: Database.Database): {
  tokens: number;
  components: number;
  documentation: number;
} {
  const tokens = db.prepare("SELECT COUNT(*) as count FROM tokens").get() as { count: number };
  const components = db.prepare("SELECT COUNT(*) as count FROM components").get() as { count: number };
  const documentation = db.prepare("SELECT COUNT(*) as count FROM documentation").get() as { count: number };

  return {
    tokens: tokens.count,
    components: components.count,
    documentation: documentation.count,
  };
}
