import Database from "better-sqlite3";

export const SCHEMA = `
-- Design Tokens
CREATE TABLE IF NOT EXISTS tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  path TEXT NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  platform TEXT DEFAULT 'all'
);

CREATE INDEX IF NOT EXISTS idx_tokens_category ON tokens(category);
CREATE INDEX IF NOT EXISTS idx_tokens_path ON tokens(path);

-- Components
CREATE TABLE IF NOT EXISTS components (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL,
  category TEXT,
  description TEXT,
  frameworks TEXT
);

CREATE INDEX IF NOT EXISTS idx_components_category ON components(category);
CREATE INDEX IF NOT EXISTS idx_components_slug ON components(slug);

-- Component Props
CREATE TABLE IF NOT EXISTS component_props (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  component_id INTEGER REFERENCES components(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  default_value TEXT,
  required INTEGER DEFAULT 0,
  options TEXT,
  description TEXT
);

CREATE INDEX IF NOT EXISTS idx_component_props_component ON component_props(component_id);

-- Component Slots
CREATE TABLE IF NOT EXISTS component_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  component_id INTEGER REFERENCES components(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT
);

-- Component Events
CREATE TABLE IF NOT EXISTS component_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  component_id INTEGER REFERENCES components(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  payload TEXT,
  description TEXT
);

-- Component Examples
CREATE TABLE IF NOT EXISTS component_examples (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  component_id INTEGER REFERENCES components(id) ON DELETE CASCADE,
  framework TEXT NOT NULL,
  title TEXT,
  code TEXT NOT NULL,
  description TEXT
);

CREATE INDEX IF NOT EXISTS idx_component_examples_component ON component_examples(component_id);
CREATE INDEX IF NOT EXISTS idx_component_examples_framework ON component_examples(framework);

-- CSS Classes
CREATE TABLE IF NOT EXISTS component_css_classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  component_id INTEGER REFERENCES components(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  description TEXT
);

-- Documentation
CREATE TABLE IF NOT EXISTS documentation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  path TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  keywords TEXT
);

CREATE INDEX IF NOT EXISTS idx_documentation_category ON documentation(category);
CREATE INDEX IF NOT EXISTS idx_documentation_path ON documentation(path);

-- Full-text search for documentation
CREATE VIRTUAL TABLE IF NOT EXISTS docs_fts USING fts5(
  title,
  content,
  keywords,
  content=documentation,
  content_rowid=id
);

-- Triggers to keep FTS index in sync
CREATE TRIGGER IF NOT EXISTS docs_ai AFTER INSERT ON documentation BEGIN
  INSERT INTO docs_fts(rowid, title, content, keywords)
  VALUES (new.id, new.title, new.content, new.keywords);
END;

CREATE TRIGGER IF NOT EXISTS docs_ad AFTER DELETE ON documentation BEGIN
  INSERT INTO docs_fts(docs_fts, rowid, title, content, keywords)
  VALUES('delete', old.id, old.title, old.content, old.keywords);
END;

CREATE TRIGGER IF NOT EXISTS docs_au AFTER UPDATE ON documentation BEGIN
  INSERT INTO docs_fts(docs_fts, rowid, title, content, keywords)
  VALUES('delete', old.id, old.title, old.content, old.keywords);
  INSERT INTO docs_fts(rowid, title, content, keywords)
  VALUES (new.id, new.title, new.content, new.keywords);
END;
`;

export function initSchema(db: Database.Database): void {
  db.exec(SCHEMA);
}
