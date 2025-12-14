import Database from "better-sqlite3";

export const SCHEMA = `
-- Design Tokens (enhanced schema)
CREATE TABLE IF NOT EXISTS tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,           -- 'color', 'spacing', 'shadow', 'border', 'radius', 'screen', 'typography'
  subcategory TEXT,                 -- 'primary', 'grey', 'font', 'line', etc.
  name TEXT NOT NULL,               -- 'primary-01-100', 'mu100', 's'
  path TEXT NOT NULL UNIQUE,        -- Full path: 'color.primary-01.100'
  css_variable TEXT,                -- '--color-primary-01-100'
  scss_variable TEXT,               -- '$color-primary-01-100' or '$mu100'

  -- Values (multiple formats)
  value_raw TEXT NOT NULL,          -- Original value as-is
  value_number REAL,                -- Numeric value (if applicable)
  value_unit TEXT,                  -- 'px', 'rem', '%', 'hex', etc.
  value_computed TEXT,              -- Computed value (e.g., '16px' for 1rem)

  -- Metadata
  description TEXT,
  platform TEXT DEFAULT 'all',
  source_file TEXT                  -- Where it came from
);

-- For composite tokens like shadows
CREATE TABLE IF NOT EXISTS token_properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_id INTEGER NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
  property TEXT NOT NULL,           -- 'x', 'y', 'blur', 'spread', 'opacity'
  value TEXT NOT NULL,
  value_number REAL,
  value_unit TEXT
);

CREATE INDEX IF NOT EXISTS idx_token_properties_token ON token_properties(token_id);

-- Token indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_tokens_category ON tokens(category);
CREATE INDEX IF NOT EXISTS idx_tokens_subcategory ON tokens(category, subcategory);
CREATE INDEX IF NOT EXISTS idx_tokens_path ON tokens(path);
CREATE INDEX IF NOT EXISTS idx_tokens_css_var ON tokens(css_variable);
CREATE INDEX IF NOT EXISTS idx_tokens_scss_var ON tokens(scss_variable);

-- Full-text search on tokens
CREATE VIRTUAL TABLE IF NOT EXISTS tokens_fts USING fts5(
  name,
  path,
  description,
  css_variable,
  scss_variable,
  content=tokens,
  content_rowid=id
);

-- Triggers to keep tokens FTS index in sync
CREATE TRIGGER IF NOT EXISTS tokens_ai AFTER INSERT ON tokens BEGIN
  INSERT INTO tokens_fts(rowid, name, path, description, css_variable, scss_variable)
  VALUES (new.id, new.name, new.path, new.description, new.css_variable, new.scss_variable);
END;

CREATE TRIGGER IF NOT EXISTS tokens_ad AFTER DELETE ON tokens BEGIN
  INSERT INTO tokens_fts(tokens_fts, rowid, name, path, description, css_variable, scss_variable)
  VALUES('delete', old.id, old.name, old.path, old.description, old.css_variable, old.scss_variable);
END;

CREATE TRIGGER IF NOT EXISTS tokens_au AFTER UPDATE ON tokens BEGIN
  INSERT INTO tokens_fts(tokens_fts, rowid, name, path, description, css_variable, scss_variable)
  VALUES('delete', old.id, old.name, old.path, old.description, old.css_variable, old.scss_variable);
  INSERT INTO tokens_fts(rowid, name, path, description, css_variable, scss_variable)
  VALUES (new.id, new.name, new.path, new.description, new.css_variable, new.scss_variable);
END;

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
