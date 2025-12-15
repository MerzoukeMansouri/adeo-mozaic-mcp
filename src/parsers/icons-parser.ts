import { readFileSync } from "fs";

export interface ParsedIcon {
  name: string;
  iconName: string;
  type: string;
  size: number;
  viewBox: string;
  paths: string;
}

/**
 * Parse icons from the mozaic-design-system icons.js file
 * The file contains ES module exports like:
 * export const ArrowArrowBottom16 = {
 *   viewBox: "0 0 16 16",
 *   size: "1rem",
 *   paths: [{tagName: "path", attrs: {...}}],
 *   type: "navigation",
 *   iconName: "ArrowArrowBottom16"
 * };
 */
export async function parseIcons(iconsJsPath: string): Promise<ParsedIcon[]> {
  const content = readFileSync(iconsJsPath, "utf-8");
  const icons: ParsedIcon[] = [];

  // Split by 'export const' to get individual icon definitions
  const iconBlocks = content.split(/export\s+const\s+/).slice(1); // Skip first empty element

  for (const block of iconBlocks) {
    try {
      // Extract the icon name (first word before '=')
      const nameMatch = block.match(/^(\w+)\s*=/);
      if (!nameMatch) continue;

      const exportName = nameMatch[1];

      // Extract viewBox
      const viewBoxMatch = block.match(/viewBox:\s*"([^"]+)"/);
      const viewBox = viewBoxMatch?.[1] ?? "0 0 16 16";

      // Extract type
      const typeMatch = block.match(/type:\s*"([^"]+)"/);
      const type = typeMatch?.[1] ?? "unknown";

      // Extract iconName from the object
      const iconNameMatch = block.match(/iconName:\s*"([^"]+)"/);
      const iconName = iconNameMatch?.[1] ?? exportName;

      // Extract size from the name (last digits)
      const sizeMatch = exportName.match(/(\d+)$/);
      const size = sizeMatch ? parseInt(sizeMatch[1], 10) : 16;

      // Extract paths - find the paths array
      const pathsMatch = block.match(/paths:\s*(\[[\s\S]*?\])\s*,?\s*(?:type:|iconName:)/);
      const paths = pathsMatch?.[1] ?? "[]";

      // Clean icon name (remove size suffix)
      const cleanIconName = iconName.replace(/\d+$/, "");

      icons.push({
        name: exportName,
        iconName: cleanIconName,
        type,
        size,
        viewBox,
        paths,
      });
    } catch {
      // Skip icons that fail to parse
      continue;
    }
  }

  return icons;
}

/**
 * Generate SVG markup from an icon's path data
 */
export function generateSvg(icon: ParsedIcon): string {
  let pathsArray: Array<{ tagName: string; attrs?: Record<string, string>; children?: unknown[] }>;

  try {
    // Parse the paths JSON
    pathsArray = JSON.parse(icon.paths.replace(/(\w+):/g, '"$1":').replace(/'/g, '"'));
  } catch {
    // If parsing fails, try to extract just the d attribute
    const dMatch = icon.paths.match(/"d":\s*"([^"]+)"/);
    if (dMatch) {
      return `<svg viewBox="${icon.viewBox}" xmlns="http://www.w3.org/2000/svg">
  <path d="${dMatch[1]}" fill="currentColor"/>
</svg>`;
    }
    return `<svg viewBox="${icon.viewBox}" xmlns="http://www.w3.org/2000/svg"></svg>`;
  }

  const renderElement = (
    el: { tagName: string; attrs?: Record<string, string>; children?: unknown[] },
    indent: string = "  "
  ): string => {
    const attrs = el.attrs
      ? Object.entries(el.attrs)
          .map(([k, v]) => `${k}="${v}"`)
          .join(" ")
      : "";

    if (el.children && el.children.length > 0) {
      const childrenStr = el.children
        .map((child) => renderElement(child as typeof el, indent + "  "))
        .join("\n");
      return `${indent}<${el.tagName}${attrs ? " " + attrs : ""}>\n${childrenStr}\n${indent}</${el.tagName}>`;
    }

    return `${indent}<${el.tagName}${attrs ? " " + attrs : ""} fill="currentColor"/>`;
  };

  const pathsStr = pathsArray.map((p) => renderElement(p)).join("\n");

  return `<svg viewBox="${icon.viewBox}" xmlns="http://www.w3.org/2000/svg">
${pathsStr}
</svg>`;
}

/**
 * Generate React component code for an icon
 */
export function generateReactComponent(icon: ParsedIcon): string {
  return `import { MIcon } from "@mozaic-ds/react";

// Using the Mozaic React icon component
<MIcon name="${icon.name}" />

// Or import directly from the icons package
import { ${icon.name} } from "@mozaic-ds/icons/js/icons";`;
}

/**
 * Generate Vue component code for an icon
 */
export function generateVueComponent(icon: ParsedIcon): string {
  return `<template>
  <MIcon name="${icon.name}" />
</template>

<script setup>
import { MIcon } from "@mozaic-ds/vue-3";
</script>

<!-- Or use directly from icons package -->
<script>
import { ${icon.name} } from "@mozaic-ds/icons/js/icons";
</script>`;
}
