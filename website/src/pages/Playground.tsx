import { useState } from "react";
import { useSqlite } from "../hooks/useSqlite";

type ToolName =
  | "get_design_tokens"
  | "get_component_info"
  | "list_components"
  | "search_documentation"
  | "search_icons"
  | "get_icon"
  | "get_css_utility"
  | "list_css_utilities"
  | "get_install_info";

interface ToolConfig {
  name: ToolName;
  label: string;
  description: string;
  fields: FieldConfig[];
  buildQuery: (values: Record<string, string>) => string;
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

    setResult({
      columns: queryResult.columns,
      values: queryResult.values,
      sql,
      error: queryResult.error,
    });
  };

  const copyResult = () => {
    if (result) {
      const data = result.values.map((row) =>
        Object.fromEntries(result.columns.map((col, i) => [col, row[i]]))
      );
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-mu300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-01-500 mb-mu100"></div>
        <p className="text-grey-600 dark:text-grey-400 text-mozaic-05">Loading database...</p>
        <p className="text-mozaic-03 text-grey-500 dark:text-grey-500 mt-mu050">
          Downloading SQLite database and initializing WebAssembly
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-100 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-mozaic-lg p-mu150">
        <h2 className="text-mozaic-06 font-semibold text-danger-700 dark:text-danger-400 mb-mu050">
          Failed to Load Database
        </h2>
        <p className="text-danger-600 dark:text-danger-300">{error}</p>
        <p className="text-mozaic-03 text-danger-500 dark:text-danger-400 mt-mu050">
          Make sure the database file is available at /mozaic.db
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-mu200">
      <section>
        <h1 className="text-mozaic-09 font-bold text-grey-900 dark:text-grey-000 mb-mu050">
          Test It!
        </h1>
        <p className="text-mozaic-05 text-grey-600 dark:text-grey-400">
          Interactive playground to test MCP tools. The SQLite database runs
          directly in your browser using WebAssembly.
        </p>
      </section>

      <div className="grid lg:grid-cols-3 gap-mu150">
        {/* Tool Selector */}
        <div className="lg:col-span-1">
          <div className="card-mozaic">
            <h2 className="font-semibold text-grey-900 dark:text-grey-000 mb-mu100 text-mozaic-05">
              Select Tool
            </h2>
            <div className="space-y-mu025">
              {tools.map((tool) => (
                <button
                  key={tool.name}
                  onClick={() => {
                    setSelectedTool(tool.name);
                    setFormValues({});
                    setResult(null);
                  }}
                  className={`w-full text-left px-mu075 py-mu050 rounded-mozaic text-mozaic-04 transition-colors ${
                    selectedTool === tool.name
                      ? "bg-primary-01-500 text-white"
                      : "text-grey-700 dark:text-grey-300 hover:bg-grey-100 dark:hover:bg-primary-02-700"
                  }`}
                >
                  <code className="font-mono">{tool.name}</code>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form & Results */}
        <div className="lg:col-span-2 space-y-mu150">
          {/* Form */}
          <div className="card-mozaic p-mu150">
            <h2 className="font-semibold text-grey-900 dark:text-grey-000 mb-mu025 text-mozaic-06">
              {currentTool.label}
            </h2>
            <p className="text-mozaic-04 text-grey-600 dark:text-grey-400 mb-mu100">
              {currentTool.description}
            </p>

            <div className="space-y-mu100">
              {currentTool.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-mozaic-04 font-medium text-grey-700 dark:text-grey-300 mb-mu025">
                    {field.label}
                  </label>
                  {field.type === "select" ? (
                    <select
                      value={formValues[field.name] ?? field.defaultValue ?? ""}
                      onChange={(e) =>
                        handleFieldChange(field.name, e.target.value)
                      }
                      className="w-full px-mu075 py-mu050 border border-grey-300 dark:border-primary-02-600 rounded-mozaic bg-white dark:bg-primary-02-800 text-grey-900 dark:text-grey-000 focus-mozaic"
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
                      onChange={(e) =>
                        handleFieldChange(field.name, e.target.value)
                      }
                      placeholder={field.placeholder}
                      className="w-full px-mu075 py-mu050 border border-grey-300 dark:border-primary-02-600 rounded-mozaic bg-white dark:bg-primary-02-800 text-grey-900 dark:text-grey-000 focus-mozaic"
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleRun}
              disabled={!db}
              className="mt-mu100 btn-mozaic-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Run Query
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="card-mozaic p-mu150">
              <div className="flex justify-between items-center mb-mu100">
                <h2 className="font-semibold text-grey-900 dark:text-grey-000 text-mozaic-05">
                  Results ({result.values.length} rows)
                </h2>
                <button
                  onClick={copyResult}
                  className="text-mozaic-03 px-mu075 py-mu025 bg-grey-100 dark:bg-primary-02-700 text-grey-700 dark:text-grey-300 rounded-mozaic hover:bg-grey-200 dark:hover:bg-primary-02-600 transition-colors"
                >
                  Copy JSON
                </button>
              </div>

              {/* SQL Query */}
              <div className="mb-mu100">
                <p className="text-mozaic-02 text-grey-500 dark:text-grey-400 mb-mu025">
                  SQL Query:
                </p>
                <pre className="bg-primary-02-900 text-grey-100 p-mu075 rounded-mozaic text-mozaic-03 overflow-x-auto">
                  {result.sql}
                </pre>
              </div>

              {result.error ? (
                <div className="bg-danger-100 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-mozaic p-mu100">
                  <p className="text-danger-700 dark:text-danger-400">
                    {result.error}
                  </p>
                </div>
              ) : result.values.length === 0 ? (
                <p className="text-grey-500 dark:text-grey-400">
                  No results found
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-mozaic-04">
                    <thead className="bg-grey-100 dark:bg-primary-02-700">
                      <tr>
                        {result.columns.map((col) => (
                          <th
                            key={col}
                            className="px-mu075 py-mu050 text-left text-mozaic-02 font-medium text-grey-500 dark:text-grey-300 uppercase"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-grey-200 dark:divide-primary-02-600">
                      {result.values.map((row, i) => (
                        <tr key={i} className="hover:bg-grey-50 dark:hover:bg-primary-02-800 transition-colors">
                          {row.map((cell, j) => (
                            <td
                              key={j}
                              className="px-mu075 py-mu050 text-grey-700 dark:text-grey-300 max-w-xs truncate"
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
