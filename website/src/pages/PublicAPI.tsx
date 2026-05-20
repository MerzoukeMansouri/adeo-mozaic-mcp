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
            Public MCP server available at{" "}
            <code className="px-2 py-1 bg-grey-100 dark:bg-grey-900 rounded text-primary-01-600 dark:text-primary-01-400">
              https://mozaic-mcp.m14i.com
            </code>
          </p>
        </section>

        {/* Endpoints */}
        <section className="bg-white dark:bg-grey-800 rounded-xl p-6 shadow-sm border border-grey-200 dark:border-grey-700">
          <h2 className="text-2xl font-bold text-grey-900 dark:text-grey-000 mb-4">
            Endpoints
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <code className="px-2 py-1 bg-grey-100 dark:bg-grey-900 rounded text-sm font-mono text-success-600 dark:text-success-400">
                GET
              </code>
              <div>
                <code className="text-grey-700 dark:text-grey-300 font-mono">/health</code>
                <p className="text-sm text-grey-600 dark:text-grey-400 mt-1">Health check</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <code className="px-2 py-1 bg-grey-100 dark:bg-grey-900 rounded text-sm font-mono text-info-600 dark:text-info-400">
                POST
              </code>
              <div>
                <code className="text-grey-700 dark:text-grey-300 font-mono">/mcp/list-tools</code>
                <p className="text-sm text-grey-600 dark:text-grey-400 mt-1">List available tools</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <code className="px-2 py-1 bg-grey-100 dark:bg-grey-900 rounded text-sm font-mono text-info-600 dark:text-info-400">
                POST
              </code>
              <div>
                <code className="text-grey-700 dark:text-grey-300 font-mono">/mcp/call-tool</code>
                <p className="text-sm text-grey-600 dark:text-grey-400 mt-1">Call a specific tool</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <code className="px-2 py-1 bg-grey-100 dark:bg-grey-900 rounded text-sm font-mono text-success-600 dark:text-success-400">
                GET
              </code>
              <div>
                <a
                  href="https://mozaic-mcp.m14i.com/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-01-600 dark:text-primary-01-400 hover:underline font-mono"
                >
                  /api
                </a>
                <p className="text-sm text-grey-600 dark:text-grey-400 mt-1">Swagger documentation</p>
              </div>
            </div>
          </div>
        </section>

        {/* Authentication */}
        <section className="bg-white dark:bg-grey-800 rounded-xl p-6 shadow-sm border border-grey-200 dark:border-grey-700">
          <h2 className="text-2xl font-bold text-grey-900 dark:text-grey-000 mb-4">
            Authentication
          </h2>
          <p className="text-grey-700 dark:text-grey-300 mb-4">
            Bearer token required.{" "}
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

        {/* Example */}
        <section className="bg-white dark:bg-grey-800 rounded-xl p-6 shadow-sm border border-grey-200 dark:border-grey-700">
          <h2 className="text-2xl font-bold text-grey-900 dark:text-grey-000 mb-4">
            Example
          </h2>
          <div className="bg-grey-900 dark:bg-grey-950 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-grey-100">
              <code>{`curl -X POST https://mozaic-mcp.m14i.com/mcp/list-tools \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json"`}</code>
            </pre>
          </div>
        </section>

        {/* Response Example */}
        <section className="bg-white dark:bg-grey-800 rounded-xl p-6 shadow-sm border border-grey-200 dark:border-grey-700">
          <h2 className="text-2xl font-bold text-grey-900 dark:text-grey-000 mb-4">
            Example Response (17 MCP Tools)
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
      "description": "Generate ready-to-use Web Component code using Mozaic Design System (@adeo/mozaic-web-components)."
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
