const repositories = [
  {
    name: "mozaic-design-system",
    url: "https://github.com/adeo/mozaic-design-system",
    description: "Design tokens, documentation, styles, and icons",
    branch: "main",
    indexed: ["Design tokens", "Documentation (MDX)", "CSS utilities", "Icons"],
  },
  {
    name: "mozaic-vue",
    url: "https://github.com/nicmusic/mozaic-vue",
    description: "Vue 3 components for Mozaic Design System",
    branch: "main",
    indexed: ["52 Vue components", "Props, slots, events", "Storybook docs"],
  },
  {
    name: "mozaic-react",
    url: "https://github.com/nicmusic/mozaic-react",
    description: "React components for Mozaic Design System",
    branch: "main",
    indexed: ["39 React components", "Props, callbacks", "Storybook docs"],
  },
];

const npmPackages = [
  {
    name: "@mozaic-ds/vue-3",
    description: "Vue 3 components",
    version: "^3.x",
  },
  {
    name: "@mozaic-ds/react",
    description: "React components",
    version: "^1.x",
  },
  {
    name: "@mozaic-ds/styles",
    description: "CSS styles and utilities",
    version: "^3.x",
  },
  {
    name: "@mozaic-ds/icons",
    description: "SVG icons library",
    version: "^3.x",
  },
  {
    name: "@mozaic-ds/tokens",
    description: "Design tokens",
    version: "^3.x",
  },
];

const dataStats = {
  tokens: {
    total: 586,
    categories: [
      { name: "colors", count: 482 },
      { name: "typography", count: 60 },
      { name: "spacing", count: 19 },
      { name: "screen", count: 12 },
      { name: "shadow", count: 3 },
      { name: "border", count: 3 },
      { name: "radius", count: 3 },
      { name: "grid", count: 4 },
    ],
  },
  components: {
    total: 91,
    vue: 52,
    react: 39,
    vueExamples: 180,
    reactExamples: 40,
  },
  icons: {
    total: 1473,
    unique: 354,
    types: 15,
    sizes: [16, 24, 32, 48, 64],
  },
  documentation: {
    total: 281,
    designSystem: 220,
    vueStorybook: 58,
    reactStorybook: 3,
  },
};

function Sources() {
  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Data Sources
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          All the repositories, packages, and data indexed by the Mozaic MCP
          Server.
        </p>
      </section>

      {/* Repositories */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Source Repositories
        </h2>
        <div className="grid gap-6">
          {repositories.map((repo) => (
            <div
              key={repo.name}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-primary-500 hover:underline"
                  >
                    {repo.name}
                  </a>
                  <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {repo.branch}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {repo.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {repo.indexed.map((item) => (
                  <span
                    key={item}
                    className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-1 rounded"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NPM Packages */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          NPM Packages
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Version
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {npmPackages.map((pkg) => (
                <tr key={pkg.name}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm text-primary-500">{pkg.name}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {pkg.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {pkg.version}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Data Statistics */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Indexed Data Statistics
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Tokens */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Design Tokens ({dataStats.tokens.total})
            </h3>
            <div className="space-y-2">
              {dataStats.tokens.categories.map((cat) => (
                <div key={cat.name} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {cat.name}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Components */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Components ({dataStats.components.total})
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Vue components
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {dataStats.components.vue}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  React components
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {dataStats.components.react}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Vue examples
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {dataStats.components.vueExamples}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  React examples
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {dataStats.components.reactExamples}
                </span>
              </div>
            </div>
          </div>

          {/* Icons */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Icons ({dataStats.icons.total})
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Unique icons
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {dataStats.icons.unique}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Icon types
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {dataStats.icons.types}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sizes</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {dataStats.icons.sizes.join(", ")}px
                </span>
              </div>
            </div>
          </div>

          {/* Documentation */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Documentation ({dataStats.documentation.total})
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Design System docs
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {dataStats.documentation.designSystem}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Vue Storybook docs
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {dataStats.documentation.vueStorybook}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  React Storybook docs
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {dataStats.documentation.reactStorybook}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Sources;
