import { Link } from "react-router-dom";

const endpoints = [
  { method: "GET", path: "/health", auth: false, desc: "Health check" },
  { method: "GET", path: "/api", auth: false, desc: "Swagger UI", href: "https://mozaic-mcp.m14i.com/api" },
  { method: "POST", path: "/mcp", auth: true, desc: "Full MCP, JSON-RPC 2.0 (19 tools)" },
  { method: "GET", path: "/mcp/info", auth: true, desc: "Server info" },
  { method: "POST", path: "/mcp/list-tools", auth: true, desc: "List the 19 full tools" },
  { method: "POST", path: "/mcp/call-tool", auth: true, desc: "Call a full tool" },
  { method: "POST", path: "/mcp/light", auth: true, desc: "MCP Light, JSON-RPC 2.0 (7 tools)" },
  { method: "POST", path: "/mcp/light/list-tools", auth: true, desc: "List the 7 light tools" },
  { method: "POST", path: "/mcp/light/call-tool", auth: true, desc: "Call a light tool" },
];

const lightTools = [
  "get_design_tokens",
  "list_css_utilities",
  "get_css_utility",
  "search_icons",
  "get_icon",
  "list_style_guides",
  "get_style_guide",
];

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="bg-grey-900 dark:bg-grey-950 rounded-lg p-4 overflow-x-auto">
      <pre className="text-sm text-grey-100">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export default function PublicAPI() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-grey-900 dark:text-grey-000 mb-4">
          Public API
        </h1>
        <p className="text-xl text-grey-600 dark:text-grey-400">
          Access Mozaic MCP Server via HTTP endpoints
        </p>
      </div>

      <div className="space-y-8">
        {/* Overview */}
        <section className="bg-white dark:bg-grey-800 rounded-xl p-6 shadow-sm border border-grey-200 dark:border-grey-700">
          <h2 className="text-2xl font-bold text-grey-900 dark:text-grey-000 mb-4">
            Overview
          </h2>
          <p className="text-grey-700 dark:text-grey-300 mb-4">
            Hosted HTTP server at{" "}
            <code className="px-2 py-1 bg-grey-100 dark:bg-grey-900 rounded text-primary-01-600 dark:text-primary-01-400">
              https://mozaic-mcp.m14i.com
            </code>
            , intended for web tools such as v0.
          </p>
          <div className="p-4 bg-secondary-blue-100 dark:bg-secondary-blue-900/20 border border-secondary-blue-200 dark:border-secondary-blue-800 rounded-lg">
            <p className="text-sm text-secondary-blue-700 dark:text-secondary-blue-300">
              For coding agents, the recommended setup is the local stdio server installed by the{" "}
              <Link to="/" className="underline">Quick Start</Link>, not this HTTP API.
            </p>
          </div>
        </section>

        {/* Endpoints */}
        <section className="bg-white dark:bg-grey-800 rounded-xl p-6 shadow-sm border border-grey-200 dark:border-grey-700">
          <h2 className="text-2xl font-bold text-grey-900 dark:text-grey-000 mb-4">
            Endpoints
          </h2>
          <div className="space-y-3">
            {endpoints.map((e) => (
              <div key={e.path} className="flex items-start gap-3">
                <code
                  className={`px-2 py-1 bg-grey-100 dark:bg-grey-900 rounded text-sm font-mono w-14 text-center ${
                    e.method === "GET" ? "text-success-600 dark:text-success-400" : "text-info-600 dark:text-info-400"
                  }`}
                >
                  {e.method}
                </code>
                <div>
                  {e.href ? (
                    <a
                      href={e.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-01-600 dark:text-primary-01-400 hover:underline font-mono"
                    >
                      {e.path}
                    </a>
                  ) : (
                    <code className="text-grey-700 dark:text-grey-300 font-mono">{e.path}</code>
                  )}
                  <p className="text-sm text-grey-600 dark:text-grey-400 mt-1">
                    {e.desc} · {e.auth ? "Bearer token" : "public"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Full vs Light */}
        <section className="bg-white dark:bg-grey-800 rounded-xl p-6 shadow-sm border border-grey-200 dark:border-grey-700">
          <h2 className="text-2xl font-bold text-grey-900 dark:text-grey-000 mb-4">
            Full vs Light
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-grey-700 dark:text-grey-300">
            <li>
              <strong>Full</strong> (<code className="font-mono">/mcp</code>): all 19 tools, proxied to a spawned stdio MCP server process.
            </li>
            <li>
              <strong>Light</strong> (<code className="font-mono">/mcp/light</code>): 7 tools (tokens, CSS utilities, icons, style guides) read directly from SQLite, no subprocess. Lighter and faster.
            </li>
          </ul>
          <div className="flex flex-wrap gap-2 mt-4">
            {lightTools.map((t) => (
              <code key={t} className="px-2 py-1 bg-grey-100 dark:bg-grey-900 rounded text-primary-01-600 dark:text-primary-01-400 text-sm">
                {t}
              </code>
            ))}
          </div>
          <p className="text-sm text-grey-600 dark:text-grey-400 mt-4">
            <code className="font-mono">call-tool</code> body:{" "}
            <code className="font-mono">{`{"name": "<tool>", "arguments": {...}}`}</code>. JSON-RPC endpoints support{" "}
            <code className="font-mono">initialize</code>, <code className="font-mono">tools/list</code>,{" "}
            <code className="font-mono">tools/call</code>.
          </p>
        </section>

        {/* Authentication */}
        <section className="bg-white dark:bg-grey-800 rounded-xl p-6 shadow-sm border border-grey-200 dark:border-grey-700">
          <h2 className="text-2xl font-bold text-grey-900 dark:text-grey-000 mb-4">
            Authentication
          </h2>
          <p className="text-grey-700 dark:text-grey-300 mb-4">
            Bearer token required on every route except <code className="font-mono">/health</code> and{" "}
            <code className="font-mono">/api</code>.{" "}
            <a
              href="https://adeo-tech-community.slack.com/archives/D05E2CXR8TB"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-01-600 dark:text-primary-01-400 hover:underline"
            >
              Contact me
            </a>{" "}
            on Slack for access.
          </p>
        </section>

        {/* Examples */}
        <section className="bg-white dark:bg-grey-800 rounded-xl p-6 shadow-sm border border-grey-200 dark:border-grey-700">
          <h2 className="text-2xl font-bold text-grey-900 dark:text-grey-000 mb-4">
            Examples
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-grey-900 dark:text-grey-000 mb-2">Full: list tools</h3>
              <CodeBlock>{`curl -X POST https://mozaic-mcp.m14i.com/mcp/list-tools \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json"`}</CodeBlock>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-grey-900 dark:text-grey-000 mb-2">Light: call a tool</h3>
              <CodeBlock>{`curl -X POST https://mozaic-mcp.m14i.com/mcp/light/call-tool \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"search_icons","arguments":{"query":"arrow","limit":5}}'`}</CodeBlock>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-grey-900 dark:text-grey-000 mb-2">Light: JSON-RPC tools/list</h3>
              <CodeBlock>{`curl -X POST https://mozaic-mcp.m14i.com/mcp/light \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`}</CodeBlock>
            </div>
          </div>
        </section>

        {/* Response Example */}
        <section className="bg-white dark:bg-grey-800 rounded-xl p-6 shadow-sm border border-grey-200 dark:border-grey-700">
          <h2 className="text-2xl font-bold text-grey-900 dark:text-grey-000 mb-4">
            Full list-tools response (19 tools)
          </h2>
          <div className="bg-grey-900 dark:bg-grey-950 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto">
            <pre className="text-xs text-grey-100">
              <code>{`{
  "tools": [
    {
      "name": "get_design_tokens",
      "description": "Get Mozaic design tokens with CSS/SCSS variables. Categories: colors (brand, semantic, component), typography (font sizes, weights, line heights), spacing (magic unit scale), shadows, borders, screens (breakpoints), grid (gutters)."
    },
    {
      "name": "get_component_info",
      "description": "Get Vue/React component details: props (types, defaults, required), slots, events, and code examples."
    },
    {
      "name": "list_components",
      "description": "List Mozaic Vue/React components by category."
    },
    {
      "name": "generate_vue_component",
      "description": "Generate ready-to-use Vue 3 code with Mozaic components (@mozaic-ds/vue-3)."
    },
    {
      "name": "generate_react_component",
      "description": "Generate ready-to-use React/TSX code with Mozaic components (@mozaic-ds/react)."
    },
    {
      "name": "search_documentation",
      "description": "Search Mozaic Design System documentation for installation guides, component usage, configuration, styling, tokens, patterns, and best practices."
    },
    {
      "name": "get_css_utility",
      "description": "Get CSS utility classes and examples for Mozaic layout and spacing utilities."
    },
    {
      "name": "list_css_utilities",
      "description": "List Mozaic CSS-only utilities (no framework needed)."
    },
    {
      "name": "search_icons",
      "description": "Search Mozaic Design System icons by name or type."
    },
    {
      "name": "get_icon",
      "description": "Get a specific Mozaic icon by name with SVG markup and ready-to-use code for React/Vue."
    },
    {
      "name": "get_install_info",
      "description": "Get installation commands and import statements for a Mozaic component."
    },
    {
      "name": "generate_webcomponent",
      "description": "Generate ready-to-use Web Component code using Mozaic Design System (@mozaic-ds/web-components)."
    },
    {
      "name": "get_webcomponent_info",
      "description": "Get detailed information about a Mozaic Web Component including attributes, slots, events, CSS custom properties, and usage examples."
    },
    {
      "name": "list_webcomponents",
      "description": "List available Mozaic Web Components by category."
    },
    {
      "name": "generate_freemarker",
      "description": "Generate ready-to-use Freemarker macro code with import statements and configuration examples for Mozaic components."
    },
    {
      "name": "get_freemarker_info",
      "description": "Get detailed information about a Freemarker component including configuration options, CSS classes, and usage examples."
    },
    {
      "name": "list_freemarker",
      "description": "List available Mozaic Freemarker macros by category."
    },
    {
      "name": "list_style_guides",
      "description": "List Mozaic style guide patterns (composed screens, not single components), filterable by category and/or source site."
    },
    {
      "name": "get_style_guide",
      "description": "Get a style guide pattern's screenshot as an image, plus the component slugs it composes."
    }
  ]
}`}</code>
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
