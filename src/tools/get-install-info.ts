import type Database from "better-sqlite3";
import { getComponentBySlug, listComponents } from "../db/queries.js";

export interface GetInstallInfoInput {
  component: string;
  framework?: "vue" | "react";
  packageManager?: "npm" | "yarn" | "pnpm";
}

interface PackageInfo {
  name: string;
  peerDependencies: string[];
}

const PACKAGES: Record<string, PackageInfo> = {
  vue: {
    name: "@mozaic-ds/vue-3",
    peerDependencies: ["vue@^3.0"],
  },
  react: {
    name: "@mozaic-ds/react",
    peerDependencies: ["react@^17 || ^18", "react-dom@^17 || ^18"],
  },
};

const RELATED_PACKAGES = {
  styles: "@mozaic-ds/styles",
  icons: "@mozaic-ds/icons",
};

function pascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

function getInstallCommand(packageName: string, packageManager: string): string {
  switch (packageManager) {
    case "yarn":
      return `yarn add ${packageName}`;
    case "pnpm":
      return `pnpm add ${packageName}`;
    default:
      return `npm install ${packageName}`;
  }
}

export function handleGetInstallInfo(
  db: Database.Database,
  input: GetInstallInfoInput
): { content: Array<{ type: "text"; text: string }> } {
  const { component, framework = "vue", packageManager = "npm" } = input;

  if (!component || component.trim().length === 0) {
    const components = listComponents(db).slice(0, 10);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: "Please provide a component name",
              example: 'get_install_info({ component: "button", framework: "vue" })',
              availableComponents: components.map((c) => c.slug),
            },
            null,
            2
          ),
        },
      ],
    };
  }

  // Find the component in database
  const componentData = getComponentBySlug(db, component);

  if (!componentData) {
    // Try to find similar components
    const allComponents = listComponents(db);
    const searchTerm = component.toLowerCase();
    const similar = allComponents
      .filter(
        (c) =>
          c.slug.toLowerCase().includes(searchTerm) || searchTerm.includes(c.slug.toLowerCase())
      )
      .slice(0, 5);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: `Component "${component}" not found`,
              suggestions: similar.length > 0 ? similar.map((c) => c.slug) : undefined,
              hint: "Use list_components to see all available components",
            },
            null,
            2
          ),
        },
      ],
    };
  }

  const packageInfo = PACKAGES[framework];
  const componentName = `M${pascalCase(componentData.slug)}`;

  const response = {
    component: componentName,
    componentSlug: componentData.slug,
    framework,
    package: packageInfo.name,
    installCommand: getInstallCommand(packageInfo.name, packageManager),
    imports: {
      component:
        framework === "vue"
          ? `import { ${componentName} } from "${packageInfo.name}";`
          : `import { ${componentName} } from "${packageInfo.name}";`,
      styles: `@import "${RELATED_PACKAGES.styles}/lib/index.css";`,
    },
    peerDependencies: packageInfo.peerDependencies,
    relatedPackages: {
      styles: {
        name: RELATED_PACKAGES.styles,
        installCommand: getInstallCommand(RELATED_PACKAGES.styles, packageManager),
        description: "Required CSS styles for Mozaic components",
      },
      icons: {
        name: RELATED_PACKAGES.icons,
        installCommand: getInstallCommand(RELATED_PACKAGES.icons, packageManager),
        description: "SVG icons library (optional)",
      },
    },
    quickStart:
      framework === "vue"
        ? {
            setup: `// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import "${RELATED_PACKAGES.styles}/lib/index.css";

createApp(App).mount("#app");`,
            usage: `<template>
  <${componentName} />
</template>

<script setup lang="ts">
import { ${componentName} } from "${packageInfo.name}";
</script>`,
          }
        : {
            setup: `// index.tsx
import "${RELATED_PACKAGES.styles}/lib/index.css";`,
            usage: `import { ${componentName} } from "${packageInfo.name}";

function MyComponent() {
  return <${componentName} />;
}`,
          },
  };

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response, null, 2),
      },
    ],
  };
}

// Tool definition for MCP
export const getInstallInfoTool = {
  name: "get_install_info",
  description:
    "Get installation commands and import statements for a Mozaic component. Returns package name, install command (npm/yarn/pnpm), import statements, peer dependencies, and quick start code.",
  inputSchema: {
    type: "object" as const,
    properties: {
      component: {
        type: "string",
        description: 'Component name (e.g., "button", "modal", "text-input")',
      },
      framework: {
        type: "string",
        enum: ["vue", "react"],
        default: "vue",
        description: "Target framework: vue (@mozaic-ds/vue-3) or react (@mozaic-ds/react)",
      },
      packageManager: {
        type: "string",
        enum: ["npm", "yarn", "pnpm"],
        default: "npm",
        description: "Package manager for install commands",
      },
    },
    required: ["component"],
  },
};
