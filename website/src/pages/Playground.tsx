import { useState } from "react";
import { useSqlite } from "../hooks/useSqlite";
import { Button, Flag, Loader } from "@mozaic-ds/react";

type ToolName =
  | "get_design_tokens"
  | "get_component_info"
  | "list_components"
  | "search_documentation"
  | "search_icons"
  | "get_icon"
  | "get_css_utility"
  | "list_css_utilities"
  | "get_install_info"
  | "generate_vue_component"
  | "generate_react_component";

interface ToolConfig {
  name: ToolName;
  label: string;
  description: string;
  fields: FieldConfig[];
  buildQuery: (values: Record<string, string>) => string;
  isCodeGenerator?: boolean;
  generateCode?: (values: Record<string, string>, componentData: ComponentData | null) => string;
}

interface ComponentData {
  name: string;
  slug: string;
  props: Array<{ name: string; type: string; default_value: string | null; required: boolean }>;
}

interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "select" | "number";
  options?: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: string;
}

const tools: ToolConfig[] = [
  {
    name: "get_design_tokens",
    label: "Get Design Tokens",
    description: "Query design tokens by category",
    fields: [
      {
        name: "category",
        label: "Category",
        type: "select",
        options: [
          { value: "all", label: "All" },
          { value: "color", label: "Colors" },
          { value: "typography", label: "Typography" },
          { value: "spacing", label: "Spacing" },
          { value: "shadow", label: "Shadows" },
          { value: "border", label: "Borders" },
          { value: "radius", label: "Radius" },
          { value: "screen", label: "Screens" },
          { value: "grid", label: "Grid" },
        ],
        defaultValue: "color",
      },
    ],
    buildQuery: (values) => {
      const cat = values.category;
      if (cat === "all") {
        return "SELECT category, name, path, css_variable, value_raw FROM tokens LIMIT 50";
      }
      return `SELECT name, path, css_variable, value_raw FROM tokens WHERE category = '${cat}' LIMIT 30`;
    },
  },
  {
    name: "get_component_info",
    label: "Get Component Info",
    description: "Get component details (props, slots, events)",
    fields: [
      {
        name: "component",
        label: "Component",
        type: "text",
        placeholder: "button",
        defaultValue: "button",
      },
    ],
    buildQuery: (values) => {
      const comp = values.component.toLowerCase();
      return `
        SELECT c.name, c.slug, c.category, c.description,
               (SELECT COUNT(*) FROM component_props WHERE component_id = c.id) as props_count,
               (SELECT COUNT(*) FROM component_slots WHERE component_id = c.id) as slots_count,
               (SELECT COUNT(*) FROM component_events WHERE component_id = c.id) as events_count
        FROM components c
        WHERE c.slug LIKE '%${comp}%' OR c.name LIKE '%${comp}%'
        LIMIT 10
      `;
    },
  },
  {
    name: "list_components",
    label: "List Components",
    description: "List components by category",
    fields: [
      {
        name: "category",
        label: "Category",
        type: "select",
        options: [
          { value: "all", label: "All" },
          { value: "action", label: "Action" },
          { value: "data-display", label: "Data Display" },
          { value: "feedback", label: "Feedback" },
          { value: "form", label: "Form" },
          { value: "layout", label: "Layout" },
          { value: "navigation", label: "Navigation" },
          { value: "other", label: "Other" },
        ],
        defaultValue: "all",
      },
    ],
    buildQuery: (values) => {
      const cat = values.category;
      if (cat === "all") {
        return "SELECT name, slug, category FROM components ORDER BY category, name LIMIT 50";
      }
      return `SELECT name, slug, category FROM components WHERE category = '${cat}' ORDER BY name`;
    },
  },
  {
    name: "search_documentation",
    label: "Search Documentation",
    description: "Full-text search across documentation",
    fields: [
      {
        name: "query",
        label: "Search Query",
        type: "text",
        placeholder: "installation",
        defaultValue: "button",
      },
      {
        name: "limit",
        label: "Limit",
        type: "number",
        defaultValue: "10",
      },
    ],
    buildQuery: (values) => {
      const query = values.query;
      const limit = values.limit || "10";
      return `
        SELECT title, path, category, snippet(docs_fts, 1, '<mark>', '</mark>', '...', 30) as snippet
        FROM docs_fts
        WHERE docs_fts MATCH '${query}*'
        LIMIT ${limit}
      `;
    },
  },
  {
    name: "search_icons",
    label: "Search Icons",
    description: "Search icons by name or type",
    fields: [
      {
        name: "query",
        label: "Search Query",
        type: "text",
        placeholder: "arrow",
        defaultValue: "arrow",
      },
      {
        name: "type",
        label: "Type (optional)",
        type: "select",
        options: [
          { value: "", label: "All Types" },
          { value: "device", label: "Device" },
          { value: "instruction", label: "Instruction" },
          { value: "logotypes", label: "Logotypes" },
          { value: "media", label: "Media" },
          { value: "navigation", label: "Navigation" },
          { value: "payment", label: "Payment" },
          { value: "product", label: "Product" },
          { value: "project", label: "Project" },
          { value: "promise", label: "Promise" },
          { value: "service", label: "Service" },
          { value: "social", label: "Social" },
          { value: "store", label: "Store" },
          { value: "universe", label: "Universe" },
          { value: "user", label: "User" },
          { value: "various", label: "Various" },
        ],
        defaultValue: "",
      },
    ],
    buildQuery: (values) => {
      const query = values.query;
      const type = values.type;
      let sql = `
        SELECT name, icon_name, type, size, view_box
        FROM icons
        WHERE (name LIKE '%${query}%' OR icon_name LIKE '%${query}%')
      `;
      if (type) {
        sql += ` AND type = '${type}'`;
      }
      sql += " LIMIT 20";
      return sql;
    },
  },
  {
    name: "get_icon",
    label: "Get Icon",
    description: "Get icon details and SVG paths",
    fields: [
      {
        name: "name",
        label: "Icon Name",
        type: "text",
        placeholder: "ArrowArrowBottom16",
        defaultValue: "ArrowArrowBottom16",
      },
    ],
    buildQuery: (values) => {
      const name = values.name;
      return `SELECT name, icon_name, type, size, view_box, paths FROM icons WHERE name = '${name}'`;
    },
  },
  {
    name: "get_css_utility",
    label: "Get CSS Utility",
    description: "Get CSS utility classes",
    fields: [
      {
        name: "name",
        label: "Utility Name",
        type: "select",
        options: [
          { value: "Flexy", label: "Flexy" },
          { value: "Margin", label: "Margin" },
          { value: "Padding", label: "Padding" },
          { value: "Container", label: "Container" },
          { value: "Ratio", label: "Ratio" },
          { value: "Scroll", label: "Scroll" },
        ],
        defaultValue: "Flexy",
      },
    ],
    buildQuery: (values) => {
      const name = values.name;
      return `
        SELECT u.name, u.category, u.description,
               (SELECT COUNT(*) FROM css_utility_classes WHERE utility_id = u.id) as class_count
        FROM css_utilities u
        WHERE u.name = '${name}'
      `;
    },
  },
  {
    name: "list_css_utilities",
    label: "List CSS Utilities",
    description: "List available CSS utilities",
    fields: [
      {
        name: "category",
        label: "Category",
        type: "select",
        options: [
          { value: "all", label: "All" },
          { value: "layout", label: "Layout" },
          { value: "utility", label: "Utility" },
        ],
        defaultValue: "all",
      },
    ],
    buildQuery: (values) => {
      const cat = values.category;
      if (cat === "all") {
        return "SELECT name, category, description FROM css_utilities ORDER BY name";
      }
      return `SELECT name, category, description FROM css_utilities WHERE category = '${cat}' ORDER BY name`;
    },
  },
  {
    name: "get_install_info",
    label: "Get Install Info (beta)",
    description: "Get installation commands for a component",
    fields: [
      {
        name: "component",
        label: "Component",
        type: "text",
        placeholder: "button",
        defaultValue: "button",
      },
      {
        name: "framework",
        label: "Framework",
        type: "select",
        options: [
          { value: "vue", label: "Vue" },
          { value: "react", label: "React" },
        ],
        defaultValue: "vue",
      },
    ],
    buildQuery: (values) => {
      const comp = values.component.toLowerCase();
      return `SELECT name, slug, category, frameworks FROM components WHERE slug LIKE '%${comp}%' LIMIT 5`;
    },
  },
  {
    name: "generate_vue_component",
    label: "Generate Vue Component",
    description: "Generate ready-to-use Vue 3 code with Mozaic components",
    isCodeGenerator: true,
    fields: [
      {
        name: "component",
        label: "Component",
        type: "text",
        placeholder: "button",
        defaultValue: "button",
      },
      {
        name: "props",
        label: "Props (JSON)",
        type: "text",
        placeholder: '{"theme": "primary", "size": "m"}',
        defaultValue: '{"theme": "primary"}',
      },
      {
        name: "children",
        label: "Slot Content",
        type: "text",
        placeholder: "Click me",
        defaultValue: "Click me",
      },
    ],
    buildQuery: (values) => {
      const comp = values.component.toLowerCase();
      return `
        SELECT c.name, c.slug,
               json_group_array(json_object(
                 'name', p.name,
                 'type', p.type,
                 'default_value', p.default_value,
                 'required', p.required
               )) as props
        FROM components c
        LEFT JOIN component_props p ON p.component_id = c.id
        WHERE c.slug LIKE '%${comp}%'
        GROUP BY c.id
        LIMIT 1
      `;
    },
    generateCode: (values, componentData) => {
      if (!componentData) return "// Component not found";

      const componentName = componentData.name;
      let propsObj: Record<string, unknown> = {};
      try {
        propsObj = JSON.parse(values.props || "{}");
      } catch {
        propsObj = {};
      }

      const propsStr = Object.entries(propsObj)
        .map(([key, value]) => {
          if (typeof value === "string") return `${key}="${value}"`;
          if (typeof value === "boolean") return value ? key : `:${key}="false"`;
          return `:${key}="${JSON.stringify(value)}"`;
        })
        .join(" ");

      const children = values.children || "Content";

      return `<script setup>
import { ${componentName} } from '@mozaic-ds/vue-3';
</script>

<template>
  <${componentName}${propsStr ? " " + propsStr : ""}>
    ${children}
  </${componentName}>
</template>`;
    },
  },
  {
    name: "generate_react_component",
    label: "Generate React Component",
    description: "Generate ready-to-use React/TSX code with Mozaic components",
    isCodeGenerator: true,
    fields: [
      {
        name: "component",
        label: "Component",
        type: "text",
        placeholder: "button",
        defaultValue: "button",
      },
      {
        name: "props",
        label: "Props (JSON)",
        type: "text",
        placeholder: '{"theme": "primary", "size": "m"}',
        defaultValue: '{"theme": "primary"}',
      },
      {
        name: "children",
        label: "Children Content",
        type: "text",
        placeholder: "Click me",
        defaultValue: "Click me",
      },
    ],
    buildQuery: (values) => {
      const comp = values.component.toLowerCase();
      return `
        SELECT c.name, c.slug,
               json_group_array(json_object(
                 'name', p.name,
                 'type', p.type,
                 'default_value', p.default_value,
                 'required', p.required
               )) as props
        FROM components c
        LEFT JOIN component_props p ON p.component_id = c.id
        WHERE c.slug LIKE '%${comp}%'
        GROUP BY c.id
        LIMIT 1
      `;
    },
    generateCode: (values, componentData) => {
      if (!componentData) return "// Component not found";

      const componentName = componentData.name;
      let propsObj: Record<string, unknown> = {};
      try {
        propsObj = JSON.parse(values.props || "{}");
      } catch {
        propsObj = {};
      }

      const propsStr = Object.entries(propsObj)
        .map(([key, value]) => {
          if (typeof value === "string") return `${key}="${value}"`;
          if (typeof value === "boolean") return value ? key : `${key}={false}`;
          return `${key}={${JSON.stringify(value)}}`;
        })
        .join(" ");

      const children = values.children || "Content";

      return `import { ${componentName} } from '@mozaic-ds/react';

export default function MyComponent() {
  return (
    <${componentName}${propsStr ? " " + propsStr : ""}>
      ${children}
    </${componentName}>
  );
}`;
    },
  },
];

function Playground() {
  const { db, loading, error, executeQuery } = useSqlite();
  const [selectedTool, setSelectedTool] = useState<ToolName>("get_design_tokens");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{
    columns: string[];
    values: unknown[][];
    sql: string;
    error?: string;
    generatedCode?: string;
  } | null>(null);

  const currentTool = tools.find((t) => t.name === selectedTool)!;

  const handleFieldChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleRun = () => {
    const values: Record<string, string> = {};
    currentTool.fields.forEach((field) => {
      values[field.name] = formValues[field.name] ?? field.defaultValue ?? "";
    });

    const sql = currentTool.buildQuery(values);
    const queryResult = executeQuery(sql);

    // Handle code generation
    if (currentTool.isCodeGenerator && currentTool.generateCode) {
      let componentData: ComponentData | null = null;

      if (queryResult.values.length > 0) {
        const row = queryResult.values[0];
        const nameIdx = queryResult.columns.indexOf("name");
        const slugIdx = queryResult.columns.indexOf("slug");
        const propsIdx = queryResult.columns.indexOf("props");

        let props: ComponentData["props"] = [];
        if (propsIdx !== -1 && row[propsIdx]) {
          try {
            props = JSON.parse(String(row[propsIdx]));
          } catch {
            props = [];
          }
        }

        componentData = {
          name: String(row[nameIdx] || ""),
          slug: String(row[slugIdx] || ""),
          props,
        };
      }

      const generatedCode = currentTool.generateCode(values, componentData);

      setResult({
        columns: queryResult.columns,
        values: queryResult.values,
        sql,
        error: queryResult.error,
        generatedCode,
      });
    } else {
      setResult({
        columns: queryResult.columns,
        values: queryResult.values,
        sql,
        error: queryResult.error,
      });
    }
  };

  const copyResult = () => {
    if (result) {
      if (result.generatedCode) {
        navigator.clipboard.writeText(result.generatedCode);
      } else {
        const data = result.values.map((row) =>
          Object.fromEntries(result.columns.map((col, i) => [col, row[i]]))
        );
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader size="l" />
        <p className="text-grey-600 dark:text-grey-400 text-lg mt-6">Loading database...</p>
        <p className="text-sm text-grey-500 dark:text-grey-500 mt-2">
          Downloading SQLite database and initializing WebAssembly
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-secondary-red-100 dark:bg-secondary-red-900/20 border border-secondary-red-300 dark:border-secondary-red-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-secondary-red-700 dark:text-secondary-red-400 mb-2">
          Failed to Load Database
        </h2>
        <p className="text-secondary-red-600 dark:text-secondary-red-300">{error}</p>
        <p className="text-sm text-secondary-red-500 dark:text-secondary-red-400 mt-2">
          Make sure the database file is available at /mozaic.db
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-grey-900 dark:text-grey-000 mb-2">
            Test It!
          </h1>
          <p className="text-lg text-grey-600 dark:text-grey-400">
            Interactive playground to test MCP tools. The SQLite database runs directly in your browser using WebAssembly.
          </p>
        </div>
        <Flag variant="solid" theme="primary">Live Demo</Flag>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tool Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-primary-02-800 rounded-xl border border-grey-200 dark:border-primary-02-600 p-5 sticky top-24">
            <h2 className="font-semibold text-grey-900 dark:text-grey-000 mb-4 text-lg">
              Select Tool
            </h2>
            <div className="space-y-1">
              {tools.map((tool) => (
                <button
                  key={tool.name}
                  onClick={() => {
                    setSelectedTool(tool.name);
                    setFormValues({});
                    setResult(null);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                    selectedTool === tool.name
                      ? "bg-primary-01-500 text-white shadow-sm"
                      : "text-grey-700 dark:text-grey-300 hover:bg-grey-100 dark:hover:bg-primary-02-700"
                  }`}
                >
                  <code className="font-mono text-xs">{tool.name}</code>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form & Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form */}
          <div className="bg-white dark:bg-primary-02-800 rounded-xl border border-grey-200 dark:border-primary-02-600 p-6">
            <div className="mb-6">
              <h2 className="font-semibold text-grey-900 dark:text-grey-000 text-xl mb-1">
                {currentTool.label}
              </h2>
              <p className="text-sm text-grey-600 dark:text-grey-400">
                {currentTool.description}
              </p>
            </div>

            <div className="space-y-4">
              {currentTool.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                    {field.label}
                  </label>
                  {field.type === "select" ? (
                    <select
                      value={formValues[field.name] ?? field.defaultValue ?? ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="w-full px-4 py-3 border border-grey-300 dark:border-primary-02-600 rounded-lg bg-white dark:bg-primary-02-700 text-grey-900 dark:text-grey-000 focus:ring-2 focus:ring-primary-01-400 focus:border-transparent transition-all"
                    >
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={formValues[field.name] ?? field.defaultValue ?? ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 border border-grey-300 dark:border-primary-02-600 rounded-lg bg-white dark:bg-primary-02-700 text-grey-900 dark:text-grey-000 focus:ring-2 focus:ring-primary-01-400 focus:border-transparent transition-all"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Button onClick={handleRun} isDisabled={!db} variant="solid" theme="primary" size="m">
                Run Query
              </Button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-white dark:bg-primary-02-800 rounded-xl border border-grey-200 dark:border-primary-02-600 p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-grey-900 dark:text-grey-000 text-lg">
                    {result.generatedCode ? "Generated Code" : "Results"}
                  </h2>
                  {!result.generatedCode && (
                    <span className="px-2 py-1 bg-primary-01-100 dark:bg-primary-01-900/30 text-primary-01-700 dark:text-primary-01-400 rounded-md text-sm font-medium">
                      {result.values.length} rows
                    </span>
                  )}
                </div>
                <Button onClick={copyResult} size="s" variant="bordered" theme="primary">
                  {result.generatedCode ? "Copy Code" : "Copy JSON"}
                </Button>
              </div>

              {/* Generated Code Display */}
              {result.generatedCode && (
                <div className="mb-6">
                  <p className="text-xs text-grey-500 dark:text-grey-400 mb-2 uppercase tracking-wide font-medium">
                    {currentTool.name === "generate_vue_component" ? "Vue 3 Component" : "React Component"}
                  </p>
                  <pre className="bg-primary-02-900 text-grey-100 p-4 rounded-lg text-sm overflow-x-auto font-mono whitespace-pre-wrap">
                    <code>{result.generatedCode}</code>
                  </pre>
                </div>
              )}

              {/* SQL Query (collapsed for code generators) */}
              <details className={result.generatedCode ? "mb-4" : "mb-6"} open={!result.generatedCode}>
                <summary className="text-xs text-grey-500 dark:text-grey-400 mb-2 uppercase tracking-wide font-medium cursor-pointer hover:text-grey-700 dark:hover:text-grey-300">
                  SQL Query
                </summary>
                <pre className="bg-primary-02-900 text-grey-100 p-4 rounded-lg text-sm overflow-x-auto font-mono mt-2">
                  {result.sql}
                </pre>
              </details>

              {result.error ? (
                <div className="bg-secondary-red-100 dark:bg-secondary-red-900/20 border border-secondary-red-300 dark:border-secondary-red-800 rounded-lg p-4">
                  <p className="text-secondary-red-700 dark:text-secondary-red-400">
                    {result.error}
                  </p>
                </div>
              ) : !result.generatedCode && result.values.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-grey-500 dark:text-grey-400">No results found</p>
                </div>
              ) : !result.generatedCode && (
                <div className="overflow-x-auto rounded-lg border border-grey-200 dark:border-primary-02-600">
                  <table className="w-full text-sm">
                    <thead className="bg-grey-100 dark:bg-primary-02-700">
                      <tr>
                        {result.columns.map((col) => (
                          <th
                            key={col}
                            className="px-4 py-3 text-left text-xs font-semibold text-grey-600 dark:text-grey-300 uppercase tracking-wider"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-grey-200 dark:divide-primary-02-600">
                      {result.values.map((row, i) => (
                        <tr key={i} className="hover:bg-grey-50 dark:hover:bg-primary-02-700/50 transition-colors">
                          {row.map((cell, j) => (
                            <td
                              key={j}
                              className="px-4 py-3 text-grey-700 dark:text-grey-300 max-w-xs truncate"
                              title={String(cell)}
                            >
                              {String(cell).substring(0, 100)}
                              {String(cell).length > 100 && "..."}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Playground;
