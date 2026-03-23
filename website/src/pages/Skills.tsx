import { Code, Terminal, Zap, Palette, Box, Image } from "lucide-react";

const skills = [
  {
    name: "mozaic-vue-builder",
    icon: Code,
    type: "Framework",
    color: "secondary-green",
    description: "Interactive Vue 3 component generator with Mozaic Design System",
    features: [
      "Browse components by category",
      "Interactive component selection",
      "Generate complete Vue 3 SFC code",
      "Props configuration with v-model",
      "Installation commands"
    ],
    tools: [
      "mcp__mozaic__list_components",
      "mcp__mozaic__get_component_info",
      "mcp__mozaic__generate_vue_component",
      "mcp__mozaic__get_install_info"
    ]
  },
  {
    name: "mozaic-react-builder",
    icon: Code,
    type: "Framework",
    color: "primary-01",
    description: "Interactive React/TSX component generator with TypeScript support",
    features: [
      "Browse React components by category",
      "Generate TypeScript/React code",
      "Full type safety with interfaces",
      "Props configuration and types",
      "Installation + TypeScript config"
    ],
    tools: [
      "mcp__mozaic__list_components",
      "mcp__mozaic__get_component_info",
      "mcp__mozaic__generate_react_component",
      "mcp__mozaic__get_install_info"
    ]
  },
  {
    name: "mozaic-design-tokens",
    icon: Palette,
    type: "Agnostic",
    color: "secondary-purple",
    description: "Design tokens and styling expert for consistent theming",
    features: [
      "Browse tokens by category",
      "Multiple formats (JSON, SCSS, CSS, JS)",
      "Responsive breakpoint values",
      "Usage examples for Vue & React",
      "Consistent styling guidance"
    ],
    tools: [
      "mcp__mozaic__get_design_tokens",
      "mcp__mozaic__search_documentation"
    ]
  },
  {
    name: "mozaic-css-utilities",
    icon: Box,
    type: "Agnostic",
    color: "secondary-blue",
    description: "CSS utility classes and layout systems expert",
    features: [
      "Flexy grid system (flexbox-based)",
      "Container and spacing utilities",
      "Margin and Padding utilities",
      "Ratio utilities (aspect ratios)",
      "Responsive modifiers"
    ],
    tools: [
      "mcp__mozaic__list_css_utilities",
      "mcp__mozaic__get_css_utility",
      "mcp__mozaic__search_documentation"
    ]
  },
  {
    name: "mozaic-icons",
    icon: Image,
    type: "Both",
    color: "secondary-orange",
    description: "Icon search and integration for Vue & React applications",
    features: [
      "Search 1,473 icons by keyword",
      "Browse by category",
      "Filter by size (16-64px)",
      "Generate Vue or React code",
      "Accessibility guidance"
    ],
    tools: [
      "mcp__mozaic__search_icons",
      "mcp__mozaic__get_icon"
    ]
  }
];

const colorClasses: Record<string, string> = {
  "secondary-green": "from-secondary-green-500 to-secondary-green-600",
  "primary-01": "from-primary-01-500 to-primary-01-600",
  "secondary-purple": "from-secondary-purple-500 to-secondary-purple-600",
  "secondary-blue": "from-secondary-blue-500 to-secondary-blue-600",
  "secondary-orange": "from-secondary-orange-500 to-secondary-orange-600"
};

const typeColors: Record<string, string> = {
  "Framework": "bg-primary-01-100 text-primary-01-700 dark:bg-primary-01-900/30 dark:text-primary-01-400",
  "Agnostic": "bg-secondary-blue-100 text-secondary-blue-700 dark:bg-secondary-blue-900/30 dark:text-secondary-blue-400",
  "Both": "bg-secondary-purple-100 text-secondary-purple-700 dark:bg-secondary-purple-900/30 dark:text-secondary-purple-400"
};

function Skills() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center py-12 hero-gradient rounded-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-green-100 dark:bg-secondary-green-900/30 rounded-full mb-6">
          <Zap className="w-4 h-4 text-secondary-green-600 dark:text-secondary-green-400" />
          <span className="text-sm font-medium text-secondary-green-700 dark:text-secondary-green-400">
            Interactive Workflows
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-grey-900 dark:text-grey-000 mb-6 tracking-tight">
          Claude Code Skills
        </h1>

        <p className="text-lg md:text-xl text-grey-600 dark:text-grey-300 max-w-3xl mx-auto mb-8 leading-relaxed">
          5 interactive skills that provide guided workflows for building applications with Mozaic Design System.
          Skills work with the MCP server to provide procedural knowledge and best practices.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-grey-900 dark:bg-grey-800 rounded-lg px-6 py-4 font-mono text-left">
            <div className="flex items-center gap-2 text-grey-400 mb-2">
              <Terminal className="w-4 h-4" />
              <span className="text-sm">Install Skills</span>
            </div>
            <code className="text-secondary-green-400 text-lg">
              npx mozaic-mcp-server install-skills
            </code>
          </div>
        </div>
      </section>

      {/* Architecture Diagram */}
      <section>
        <h2 className="text-2xl font-bold text-grey-900 dark:text-grey-000 mb-6">
          How Skills Work
        </h2>

        <div className="bg-grey-50 dark:bg-grey-800 rounded-xl p-8 border border-grey-200 dark:border-grey-700">
          {/* Visual Diagram */}
          <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
            {/* Skills Layer */}
            <div className="w-full">
              <div className="bg-gradient-to-r from-primary-01-500 to-primary-01-600 rounded-xl p-6 text-center shadow-lg">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Zap className="w-8 h-8 text-white" />
                  <h3 className="text-2xl font-bold text-white">Skills</h3>
                </div>
                <p className="text-white/90 text-sm">
                  Interactive workflows + Shell scripts
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center">
              <div className="w-1 h-16 bg-primary-01-300 dark:bg-primary-01-600"></div>
              <div className="text-primary-01-500 dark:text-primary-01-400 text-2xl font-bold">↓</div>
              <div className="text-sm text-grey-600 dark:text-grey-400 font-mono bg-grey-100 dark:bg-grey-700 px-3 py-1 rounded">
                sqlite3 queries
              </div>
              <div className="w-1 h-16 bg-primary-01-300 dark:bg-primary-01-600"></div>
            </div>

            {/* Database Layer */}
            <div className="w-full">
              <div className="bg-gradient-to-r from-secondary-green-500 to-secondary-green-600 rounded-xl p-6 text-center shadow-lg">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Box className="w-8 h-8 text-white" />
                  <h3 className="text-2xl font-bold text-white">SQLite Database</h3>
                </div>
                <p className="text-white/90 text-sm mb-3">
                  ~/.claude/mozaic.db
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-white/80">
                  <div>Components</div>
                  <div>Design Tokens</div>
                  <div>Icons</div>
                  <div>CSS Utilities</div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Point */}
          <div className="mt-8 p-4 bg-primary-01-50 dark:bg-primary-01-900/10 rounded-lg border-l-4 border-primary-01-500">
            <p className="text-sm text-grey-700 dark:text-grey-300">
              <strong className="text-primary-01-600 dark:text-primary-01-400">Direct Access:</strong> Skills use shell scripts to query the SQLite database directly via sqlite3 commands, providing guided workflows for building with Mozaic Design System.
            </p>
          </div>
        </div>
      </section>

      {/* Skills List */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-grey-900 dark:text-grey-000">
            Available Skills
          </h2>
          <span className="text-sm text-grey-500 dark:text-grey-400">
            5 skills • No database required
          </span>
        </div>

        <div className="grid gap-6">
          {skills.map((skill) => {
            const Icon = skill.icon;
            return (
              <div
                key={skill.name}
                className="bg-grey-000 dark:bg-grey-800 rounded-xl border border-grey-200 dark:border-grey-700 overflow-hidden hover:border-grey-300 dark:hover:border-grey-600 transition-colors"
              >
                <div className={`h-1 bg-gradient-to-r ${colorClasses[skill.color]}`} />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[skill.color]} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-grey-900 dark:text-grey-000 font-mono">
                          {skill.name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${typeColors[skill.type]}`}>
                          {skill.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-grey-600 dark:text-grey-300 mb-4">
                    {skill.description}
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-grey-900 dark:text-grey-000 mb-2">
                        Key Features
                      </h4>
                      <ul className="space-y-1">
                        {skill.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-grey-600 dark:text-grey-300 flex items-start gap-2">
                            <span className="text-secondary-green-500 mt-1">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-grey-900 dark:text-grey-000 mb-2">
                        MCP Tools Used
                      </h4>
                      <ul className="space-y-1">
                        {skill.tools.map((tool, idx) => (
                          <li key={idx} className="text-xs font-mono text-grey-500 dark:text-grey-400">
                            {tool.replace('mcp__mozaic__', '')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Installation Guide */}
      <section>
        <h2 className="text-2xl font-bold text-grey-900 dark:text-grey-000 mb-6">
          Installation Guide
        </h2>

        <div className="space-y-6">
          <div className="bg-grey-000 dark:bg-grey-800 rounded-xl p-6 border border-grey-200 dark:border-grey-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary-01-100 dark:bg-primary-01-900/30 flex items-center justify-center font-bold text-primary-01-600 dark:text-primary-01-400">
                1
              </div>
              <h3 className="text-lg font-semibold text-grey-900 dark:text-grey-000">
                Install Skills
              </h3>
            </div>

            <div className="bg-grey-900 dark:bg-grey-950 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="text-grey-400 mb-1"># Install all 5 skills</div>
              <code className="text-secondary-green-400">npx mozaic-mcp-server install-skills</code>
            </div>

            <p className="text-sm text-grey-600 dark:text-grey-300 mt-3">
              This installs all skills to <code className="px-2 py-1 bg-grey-100 dark:bg-grey-700 rounded font-mono text-xs">~/.claude/skills/</code>
            </p>
          </div>

          <div className="bg-grey-000 dark:bg-grey-800 rounded-xl p-6 border border-grey-200 dark:border-grey-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary-01-100 dark:bg-primary-01-900/30 flex items-center justify-center font-bold text-primary-01-600 dark:text-primary-01-400">
                2
              </div>
              <h3 className="text-lg font-semibold text-grey-900 dark:text-grey-000">
                Configure MCP Server
              </h3>
            </div>

            <p className="text-sm text-grey-600 dark:text-grey-300 mb-3">
              Add to your Claude Code settings:
            </p>

            <div className="bg-grey-900 dark:bg-grey-950 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-grey-300">
{`{
  "mcpServers": {
    "mozaic": {
      "command": "npx",
      "args": ["mozaic-mcp-server"]
    }
  }
}`}
              </pre>
            </div>
          </div>

          <div className="bg-grey-000 dark:bg-grey-800 rounded-xl p-6 border border-grey-200 dark:border-grey-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-secondary-green-100 dark:bg-secondary-green-900/30 flex items-center justify-center font-bold text-secondary-green-600 dark:text-secondary-green-400">
                ✓
              </div>
              <h3 className="text-lg font-semibold text-grey-900 dark:text-grey-000">
                Done!
              </h3>
            </div>

            <p className="text-grey-600 dark:text-grey-300">
              Restart Claude Code and skills will activate automatically based on context.
            </p>
          </div>
        </div>
      </section>

      {/* Documentation */}
      <section>
        <h2 className="text-2xl font-bold text-grey-900 dark:text-grey-000 mb-6">
          Documentation
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <a
            href="https://github.com/merzoukemansouri/adeo-mozaic-mcp/blob/main/SKILLS.md"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 bg-grey-000 dark:bg-grey-800 rounded-xl border border-grey-200 dark:border-grey-700 hover:border-primary-01-400 dark:hover:border-primary-01-600 transition-colors"
          >
            <h3 className="font-semibold text-grey-900 dark:text-grey-000 mb-2">
              SKILLS.md
            </h3>
            <p className="text-sm text-grey-600 dark:text-grey-300">
              Complete skills documentation with workflows, examples, and use cases
            </p>
          </a>

          <a
            href="https://github.com/merzoukemansouri/adeo-mozaic-mcp/blob/main/INSTALLATION.md"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 bg-grey-000 dark:bg-grey-800 rounded-xl border border-grey-200 dark:border-grey-700 hover:border-primary-01-400 dark:hover:border-primary-01-600 transition-colors"
          >
            <h3 className="font-semibold text-grey-900 dark:text-grey-000 mb-2">
              INSTALLATION.md
            </h3>
            <p className="text-sm text-grey-600 dark:text-grey-300">
              Complete setup guide with troubleshooting and configuration options
            </p>
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-12 bg-gradient-to-r from-primary-01-500 to-primary-01-600 rounded-2xl">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Install skills and start building with Mozaic Design System in minutes.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-grey-900 rounded-lg px-6 py-3 font-mono">
            <code className="text-secondary-green-400">
              npx mozaic-mcp-server install-skills
            </code>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Skills;
