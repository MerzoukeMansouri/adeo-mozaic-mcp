import { Link } from "react-router-dom";
import { Button, Flag } from "@mozaic-ds/react";

const stats = [
  { label: "Design Tokens", value: "586", gradient: "from-secondary-blue-500 to-secondary-blue-600" },
  { label: "Components", value: "91", gradient: "from-primary-01-500 to-primary-01-600" },
  { label: "Icons", value: "1,473", gradient: "from-secondary-purple-500 to-secondary-purple-600" },
  { label: "CSS Utilities", value: "6", gradient: "from-secondary-blue-600 to-secondary-blue-700" },
  { label: "Documentation", value: "281", gradient: "from-primary-01-600 to-primary-01-700" },
  { label: "MCP Tools", value: "11", gradient: "from-secondary-purple-600 to-secondary-purple-700" },
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
    color: "secondary-blue",
  },
  {
    title: "Component Documentation",
    desc: "Get complete documentation for 91 Vue and React components with props, slots, events, and code examples.",
    color: "primary-01",
  },
  {
    title: "Icon Library",
    desc: "Search and retrieve 1,473 SVG icons across 15 categories with ready-to-use React and Vue code.",
    color: "secondary-purple",
  },
  {
    title: "Full-Text Search",
    desc: "Search across 281 documentation pages with FTS5-powered full-text search for installation guides, usage, and best practices.",
    color: "primary-01",
  },
];

const categoryColors: Record<string, string> = {
  tokens: "bg-secondary-blue-100 text-secondary-blue-700 dark:bg-secondary-blue-900/30 dark:text-secondary-blue-400",
  components: "bg-primary-01-100 text-primary-01-700 dark:bg-primary-01-900/30 dark:text-primary-01-400",
  docs: "bg-secondary-purple-100 text-secondary-purple-700 dark:bg-secondary-purple-900/30 dark:text-secondary-purple-400",
  css: "bg-secondary-blue-100 text-secondary-blue-700 dark:bg-secondary-blue-900/30 dark:text-secondary-blue-400",
  icons: "bg-secondary-purple-100 text-secondary-purple-700 dark:bg-secondary-purple-900/30 dark:text-secondary-purple-400",
  install: "bg-grey-100 text-grey-700 dark:bg-grey-800 dark:text-grey-400",
};

function Home() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center py-12 hero-gradient rounded-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-01-100 dark:bg-primary-01-900/30 rounded-full mb-6">
          <span className="w-2 h-2 bg-primary-01-500 rounded-full animate-pulse"></span>
          <span className="text-sm font-medium text-primary-01-700 dark:text-primary-01-400">
            MCP Server for AI Assistants
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-grey-900 dark:text-grey-000 mb-6 tracking-tight">
          Mozaic MCP Server
        </h1>

        <p className="text-lg md:text-xl text-grey-600 dark:text-grey-300 max-w-3xl mx-auto mb-8 leading-relaxed">
          An MCP (Model Context Protocol) server that exposes the{" "}
          <strong className="text-primary-01-600 dark:text-primary-01-400">Mozaic Design System</strong> by ADEO to Claude and other AI assistants.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/playground">
            <Button variant="solid" theme="primary" size="l">
              Try It Now
            </Button>
          </Link>
          <a
            href="https://github.com/MerzoukeMansouri/adeo-mozaic-mcp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="bordered" theme="primary" size="l">
              View on GitHub
            </Button>
          </a>
        </div>
      </section>

      {/* Stats */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-grey-900 dark:text-grey-000">
            What's Indexed
          </h2>
          <div className="flex-1 h-px bg-grey-200 dark:bg-primary-02-700"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="stats-card rounded-xl border border-grey-200 dark:border-primary-02-600 p-6 text-center hover:border-primary-01-400 dark:hover:border-primary-01-500 transition-all feature-card"
            >
              <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                {stat.value}
              </div>
              <div className="text-sm text-grey-600 dark:text-grey-400 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-grey-900 dark:text-grey-000">
            Quick Start
          </h2>
          <div className="flex-1 h-px bg-grey-200 dark:bg-primary-02-700"></div>
        </div>

        <div className="code-block p-6 overflow-x-auto">
          <pre className="text-grey-100 text-sm md:text-base font-mono">
            <code>{`# Clone and build
git clone https://github.com/MerzoukeMansouri/adeo-mozaic-mcp
cd adeo-mozaic-mcp
pnpm install
pnpm build

# Start the MCP server
pnpm start`}</code>
          </pre>
        </div>

        <div className="mt-4 p-4 bg-secondary-blue-100 dark:bg-secondary-blue-900/20 border border-secondary-blue-200 dark:border-secondary-blue-800 rounded-lg">
          <p className="text-sm text-secondary-blue-700 dark:text-secondary-blue-300">
            <strong>Tip:</strong> Add the server to your Claude Desktop configuration to start using Mozaic documentation in your conversations.
          </p>
        </div>
      </section>

      {/* MCP Tools */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-grey-900 dark:text-grey-000">
            MCP Tools
          </h2>
          <Flag variant="solid" theme="primary">{tools.length} tools</Flag>
          <div className="flex-1 h-px bg-grey-200 dark:bg-primary-02-700"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="bg-white dark:bg-primary-02-800 rounded-xl border border-grey-200 dark:border-primary-02-600 p-5 hover:border-primary-01-400 dark:hover:border-primary-01-500 transition-all feature-card group"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <code className="text-primary-01-600 dark:text-primary-01-400 font-mono text-sm font-semibold group-hover:text-primary-01-700 dark:group-hover:text-primary-01-300 transition-colors">
                  {tool.name}
                </code>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${categoryColors[tool.category]}`}>
                  {tool.category}
                </span>
              </div>
              <p className="text-sm text-grey-600 dark:text-grey-400">
                {tool.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-grey-900 dark:text-grey-000">
            Features
          </h2>
          <div className="flex-1 h-px bg-grey-200 dark:bg-primary-02-700"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`bg-white dark:bg-primary-02-800 rounded-xl border-l-4 border border-grey-200 dark:border-primary-02-600 p-6 hover:border-primary-01-400 dark:hover:border-primary-01-500 transition-all feature-card ${
                feature.color === "primary-01"
                  ? "border-l-primary-01-500"
                  : feature.color === "secondary-blue"
                  ? "border-l-secondary-blue-500"
                  : "border-l-secondary-purple-500"
              }`}
            >
              <h3 className="text-lg font-semibold text-grey-900 dark:text-grey-000 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-grey-600 dark:text-grey-400 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-primary-02-800 to-primary-02-900 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-01-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-blue-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative">
          <h2 className="text-2xl md:text-3xl font-bold text-grey-000 mb-4">
            Ready to explore?
          </h2>
          <p className="text-lg text-primary-02-300 mb-8 max-w-2xl mx-auto">
            Test the MCP tools directly in your browser with our interactive playground.
          </p>
          <Link to="/playground">
            <Button variant="solid" theme="primary" size="l">
              Open Playground
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
