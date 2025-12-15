import { Link } from "react-router-dom";

const stats = [
  { label: "Design Tokens", value: "586", color: "text-secondary-blue-500" },
  { label: "Components", value: "91", color: "text-primary-01-500" },
  { label: "Icons", value: "1,473", color: "text-secondary-purple-500" },
  { label: "CSS Utilities", value: "6", color: "text-secondary-blue-600" },
  { label: "Documentation", value: "281", color: "text-primary-01-600" },
  { label: "MCP Tools", value: "11", color: "text-secondary-purple-600" },
];

const tools = [
  { name: "get_design_tokens", desc: "Query tokens by category", category: "tokens" },
  { name: "get_component_info", desc: "Get component details (props, slots, events)", category: "components" },
  { name: "list_components", desc: "List components by category", category: "components" },
  { name: "generate_vue_component", desc: "Generate Vue 3 code", category: "components" },
  { name: "generate_react_component", desc: "Generate React code", category: "components" },
  { name: "search_documentation", desc: "Full-text search across docs", category: "docs" },
  { name: "get_css_utility", desc: "Get CSS utility classes", category: "css" },
  { name: "list_css_utilities", desc: "List available CSS utilities", category: "css" },
  { name: "search_icons", desc: "Search icons by name/type", category: "icons" },
  { name: "get_icon", desc: "Get icon SVG and code", category: "icons" },
  { name: "get_install_info", desc: "Get installation commands (beta)", category: "install" },
];

const features = [
  {
    title: "Design Tokens",
    desc: "Access 586 design tokens including colors, typography, spacing, shadows, borders, and breakpoints in JSON, SCSS, CSS, or JS format.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    title: "Component Documentation",
    desc: "Get complete documentation for 91 Vue and React components with props, slots, events, and code examples.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    title: "Icon Library",
    desc: "Search and retrieve 1,473 SVG icons across 15 categories with ready-to-use React and Vue code.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Full-Text Search",
    desc: "Search across 281 documentation pages with FTS5-powered full-text search for installation guides, usage, and best practices.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
];

function Home() {
  return (
    <div className="space-y-mu300">
      {/* Hero */}
      <section className="text-center py-mu300">
        <div className="inline-flex items-center px-mu100 py-mu025 bg-primary-01-100 dark:bg-primary-01-900/30 text-primary-01-600 dark:text-primary-01-400 rounded-full text-mozaic-03 font-medium mb-mu100">
          <span className="w-2 h-2 bg-primary-01-500 rounded-full mr-mu050 animate-pulse"></span>
          MCP Server for AI Assistants
        </div>
        <h1 className="text-mozaic-11 md:text-mozaic-12 font-bold text-grey-900 dark:text-grey-000 mb-mu100">
          Mozaic MCP Server
        </h1>
        <p className="text-mozaic-06 text-grey-600 dark:text-grey-300 max-w-2xl mx-auto mb-mu200">
          An MCP (Model Context Protocol) server that exposes the{" "}
          <strong className="text-primary-01-500">Mozaic Design System</strong> by ADEO to Claude and other AI
          assistants.
        </p>
        <div className="flex flex-wrap justify-center gap-mu100">
          <Link
            to="/playground"
            className="btn-mozaic-primary px-mu150 py-mu075 text-mozaic-05"
          >
            Try It Now
          </Link>
          <a
            href="https://github.com/anthropics/mozaic-mcp-server"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-mozaic-secondary px-mu150 py-mu075 text-mozaic-05"
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* Stats */}
      <section>
        <h2 className="text-mozaic-08 font-bold text-grey-900 dark:text-grey-000 mb-mu150">
          What's Indexed
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-mu100">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="card-mozaic text-center hover:border-primary-01-400 transition-colors"
            >
              <div className={`text-mozaic-10 font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-mozaic-03 text-grey-600 dark:text-grey-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section>
        <h2 className="text-mozaic-08 font-bold text-grey-900 dark:text-grey-000 mb-mu150">
          Quick Start
        </h2>
        <div className="bg-primary-02-900 rounded-mozaic-lg p-mu150 overflow-x-auto border border-primary-02-700">
          <pre className="text-grey-100 text-mozaic-04">
            <code>{`# Clone and build
git clone https://github.com/anthropics/mozaic-mcp-server
cd mozaic-mcp-server
pnpm install
pnpm build

# Start the MCP server
pnpm start`}</code>
          </pre>
        </div>
      </section>

      {/* MCP Tools */}
      <section>
        <h2 className="text-mozaic-08 font-bold text-grey-900 dark:text-grey-000 mb-mu150">
          MCP Tools
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-mu100">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="card-mozaic hover:border-primary-01-400 hover:shadow-sm transition-all group"
            >
              <code className="text-primary-01-500 dark:text-primary-01-400 font-mono text-mozaic-04 group-hover:text-primary-01-600">
                {tool.name}
              </code>
              <p className="text-mozaic-03 text-grey-600 dark:text-grey-400 mt-mu025">
                {tool.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-mozaic-08 font-bold text-grey-900 dark:text-grey-000 mb-mu150">
          Features
        </h2>
        <div className="grid md:grid-cols-2 gap-mu150">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card-mozaic hover:border-primary-01-400 transition-colors"
            >
              <div className="flex items-start space-x-mu100">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-01-100 dark:bg-primary-01-900/30 rounded-mozaic-lg flex items-center justify-center text-primary-01-500">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-mozaic-06 font-semibold text-grey-900 dark:text-grey-000 mb-mu025">
                    {feature.title}
                  </h3>
                  <p className="text-mozaic-04 text-grey-600 dark:text-grey-400">
                    {feature.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-02-800 dark:bg-primary-02-900 rounded-mozaic-lg p-mu200 text-center">
        <h2 className="text-mozaic-08 font-bold text-grey-000 mb-mu050">
          Ready to explore?
        </h2>
        <p className="text-mozaic-05 text-primary-02-300 mb-mu150">
          Test the MCP tools directly in your browser with our interactive playground.
        </p>
        <Link
          to="/playground"
          className="inline-block px-mu200 py-mu100 bg-primary-01-400 text-white rounded-mozaic font-semibold text-mozaic-05 hover:bg-primary-01-500 transition-colors"
        >
          Open Playground
        </Link>
      </section>
    </div>
  );
}

export default Home;
