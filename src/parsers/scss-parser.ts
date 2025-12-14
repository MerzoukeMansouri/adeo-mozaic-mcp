import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { Component, ComponentExample } from "../db/queries.js";

// Screen breakpoints for responsive classes
const SCREENS = ["s", "m", "l", "xl", "xxl"];
const MAJOR_SCREENS = ["s", "m", "l", "xl"];

// Spacing sizes for margin/padding utilities
const SIZES = [
  "025", "050", "075", "100", "125", "150",
  "200", "250", "300", "350", "400", "500",
  "600", "700", "800", "900", "1000"
];

// Sides for margin/padding utilities
const SIDES = {
  t: "top",
  r: "right",
  l: "left",
  b: "bottom",
  all: "all",
  v: "vertical",
  h: "horizontal",
};

// Aspect ratios
const ASPECT_RATIOS = ["1x1", "2x3", "3x2", "3x4", "4x3", "16x9"];

export interface ParseScssOptions {
  stylesPath: string;
}

/**
 * Parse SCSS files to extract CSS-only components (layouts and utilities)
 */
export async function parseScssComponents(
  stylesPath: string
): Promise<Component[]> {
  const components: Component[] = [];

  // Parse layouts
  const layoutsPath = join(stylesPath, "layouts");
  if (existsSync(layoutsPath)) {
    components.push(parseFlexyComponent(layoutsPath));
    components.push(parseContainerComponent(layoutsPath));
  }

  // Parse utilities
  const utilitiesPath = join(stylesPath, "utilities");
  if (existsSync(utilitiesPath)) {
    components.push(parseMarginComponent(utilitiesPath));
    components.push(parsePaddingComponent(utilitiesPath));
    components.push(parseRatioComponent(utilitiesPath));
    components.push(parseScrollComponent(utilitiesPath));
  }

  return components;
}

/**
 * Parse Flexy (flexbox grid) component
 */
function parseFlexyComponent(layoutsPath: string): Component {
  const cssClasses: string[] = [];

  // Base class
  cssClasses.push(".ml-flexy");

  // Column class
  cssClasses.push(".ml-flexy__col");

  // Modifiers
  const modifiers = [
    "gutter",
    "space-around",
    "justify-between",
    "justify-evenly",
    "justify-start",
    "justify-center",
    "justify-end",
    "items-stretch",
    "items-start",
    "items-center",
    "items-end",
  ];

  for (const mod of modifiers) {
    cssClasses.push(`.ml-flexy--${mod}`);
  }

  // Responsive modifiers (for justify-* classes)
  const responsiveModifiers = [
    "space-around",
    "justify-between",
    "justify-evenly",
    "justify-start",
    "justify-center",
    "justify-end",
  ];

  for (const screen of MAJOR_SCREENS) {
    for (const mod of responsiveModifiers) {
      cssClasses.push(`.ml-flexy--${mod}@from-${screen}`);
    }
  }

  // Column width classes (fractions)
  const fractions = [
    [1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 6], [5, 6],
    [1, 12], [2, 12], [3, 12], [4, 12], [5, 12], [6, 12],
    [7, 12], [8, 12], [9, 12], [10, 12], [11, 12],
  ];

  for (const [num, denom] of fractions) {
    cssClasses.push(`.ml-flexy__col--${num}of${denom}`);
    cssClasses.push(`.ml-flexy__col--push-${num}of${denom}`);

    // Responsive variants
    for (const screen of MAJOR_SCREENS) {
      cssClasses.push(`.ml-flexy__col--${num}of${denom}@from-${screen}`);
      cssClasses.push(`.ml-flexy__col--push-${num}of${denom}@from-${screen}`);
    }
  }

  // Custom column classes
  const customCols = ["fill", "full", "initial", "grow", "first", "last"];
  for (const col of customCols) {
    cssClasses.push(`.ml-flexy__col--${col}`);
    for (const screen of MAJOR_SCREENS) {
      cssClasses.push(`.ml-flexy__col--${col}@from-${screen}`);
    }
  }

  // Push reset
  cssClasses.push(".ml-flexy__col--push--reset");
  for (const screen of MAJOR_SCREENS) {
    cssClasses.push(`.ml-flexy__col--push--reset@from-${screen}`);
  }

  const examples: ComponentExample[] = [
    {
      framework: "html",
      title: "Basic 2-column layout",
      code: `<div class="ml-flexy ml-flexy--gutter">
  <div class="ml-flexy__col ml-flexy__col--6of12">Column 1</div>
  <div class="ml-flexy__col ml-flexy__col--6of12">Column 2</div>
</div>`,
    },
    {
      framework: "html",
      title: "Responsive columns",
      code: `<div class="ml-flexy ml-flexy--gutter">
  <div class="ml-flexy__col ml-flexy__col--full ml-flexy__col--6of12@from-m ml-flexy__col--4of12@from-l">
    Responsive column
  </div>
</div>`,
    },
    {
      framework: "html",
      title: "Centered content",
      code: `<div class="ml-flexy ml-flexy--justify-center ml-flexy--items-center">
  <div class="ml-flexy__col ml-flexy__col--initial">Centered content</div>
</div>`,
    },
  ];

  return {
    name: "Flexy",
    slug: "flexy",
    category: "layout",
    description:
      "Flexbox-based grid system for creating responsive layouts. Uses 12-column grid with responsive breakpoints and utility modifiers for alignment and spacing.",
    frameworks: ["html"],
    props: [],
    slots: [],
    events: [],
    examples,
    cssClasses,
  };
}

/**
 * Parse Container component
 */
function parseContainerComponent(layoutsPath: string): Component {
  const cssClasses: string[] = [];

  cssClasses.push(".ml-container");
  cssClasses.push(".ml-container--fluid");

  // Responsive fluid modifier
  for (const screen of MAJOR_SCREENS) {
    cssClasses.push(`.ml-container--fluid@from-${screen}`);
  }

  const examples: ComponentExample[] = [
    {
      framework: "html",
      title: "Basic container",
      code: `<div class="ml-container">
  <p>Content within max-width container</p>
</div>`,
    },
    {
      framework: "html",
      title: "Fluid container",
      code: `<div class="ml-container ml-container--fluid">
  <p>Full-width content with padding</p>
</div>`,
    },
  ];

  return {
    name: "Container",
    slug: "container",
    category: "layout",
    description:
      "Responsive container with automatic max-width and padding. Centers content and provides consistent horizontal spacing across breakpoints.",
    frameworks: ["html"],
    props: [],
    slots: [],
    events: [],
    examples,
    cssClasses,
  };
}

/**
 * Parse Margin utilities
 */
function parseMarginComponent(utilitiesPath: string): Component {
  const cssClasses: string[] = [];

  // Generate all margin utility classes
  for (const [sideKey, sideName] of Object.entries(SIDES)) {
    for (const size of SIZES) {
      if (sideKey === "all") {
        cssClasses.push(`.mu-m-${size}`);
      } else {
        cssClasses.push(`.mu-m${sideKey}-${size}`);
      }
    }
  }

  const examples: ComponentExample[] = [
    {
      framework: "html",
      title: "Margin all sides",
      code: `<div class="mu-m-100">16px margin on all sides</div>`,
    },
    {
      framework: "html",
      title: "Margin specific sides",
      code: `<div class="mu-mt-200 mu-mb-100">
  32px top margin, 16px bottom margin
</div>`,
    },
    {
      framework: "html",
      title: "Horizontal/vertical margin",
      code: `<div class="mu-mv-200 mu-mh-100">
  32px vertical margin, 16px horizontal margin
</div>`,
    },
  ];

  return {
    name: "Margin",
    slug: "margin",
    category: "utility",
    description:
      "Margin utility classes using magic unit scale (mu). Supports all sides, individual sides, vertical, and horizontal margins.",
    frameworks: ["html"],
    props: [],
    slots: [],
    events: [],
    examples,
    cssClasses,
  };
}

/**
 * Parse Padding utilities
 */
function parsePaddingComponent(utilitiesPath: string): Component {
  const cssClasses: string[] = [];

  // Generate all padding utility classes
  for (const [sideKey, sideName] of Object.entries(SIDES)) {
    for (const size of SIZES) {
      if (sideKey === "all") {
        cssClasses.push(`.mu-p-${size}`);
      } else {
        cssClasses.push(`.mu-p${sideKey}-${size}`);
      }
    }
  }

  const examples: ComponentExample[] = [
    {
      framework: "html",
      title: "Padding all sides",
      code: `<div class="mu-p-100">16px padding on all sides</div>`,
    },
    {
      framework: "html",
      title: "Padding specific sides",
      code: `<div class="mu-pt-200 mu-pb-100">
  32px top padding, 16px bottom padding
</div>`,
    },
    {
      framework: "html",
      title: "Horizontal/vertical padding",
      code: `<div class="mu-pv-200 mu-ph-100">
  32px vertical padding, 16px horizontal padding
</div>`,
    },
  ];

  return {
    name: "Padding",
    slug: "padding",
    category: "utility",
    description:
      "Padding utility classes using magic unit scale (mu). Supports all sides, individual sides, vertical, and horizontal padding.",
    frameworks: ["html"],
    props: [],
    slots: [],
    events: [],
    examples,
    cssClasses,
  };
}

/**
 * Parse Ratio utilities
 */
function parseRatioComponent(utilitiesPath: string): Component {
  const cssClasses: string[] = [];

  cssClasses.push(".mu-ratio");
  cssClasses.push(".mu-ratio__item");

  for (const ratio of ASPECT_RATIOS) {
    cssClasses.push(`.mu-ratio--${ratio}`);
  }

  const examples: ComponentExample[] = [
    {
      framework: "html",
      title: "16:9 aspect ratio",
      code: `<div class="mu-ratio mu-ratio--16x9">
  <img class="mu-ratio__item" src="image.jpg" alt="Image with 16:9 ratio" />
</div>`,
    },
    {
      framework: "html",
      title: "Square ratio",
      code: `<div class="mu-ratio mu-ratio--1x1">
  <div class="mu-ratio__item">Square content</div>
</div>`,
    },
  ];

  return {
    name: "Ratio",
    slug: "ratio",
    category: "utility",
    description:
      "Aspect ratio utility for maintaining element proportions. Supports common aspect ratios like 16:9, 4:3, 1:1, etc.",
    frameworks: ["html"],
    props: [],
    slots: [],
    events: [],
    examples,
    cssClasses,
  };
}

/**
 * Parse Scroll utilities
 */
function parseScrollComponent(utilitiesPath: string): Component {
  const cssClasses = [".mu-prevent-body-scroll"];

  const examples: ComponentExample[] = [
    {
      framework: "html",
      title: "Prevent body scroll",
      code: `<!-- Add to html or body element when modal is open -->
<html class="mu-prevent-body-scroll">
  <body class="mu-prevent-body-scroll">
    <!-- Content -->
  </body>
</html>`,
    },
  ];

  return {
    name: "Scroll",
    slug: "scroll",
    category: "utility",
    description:
      "Scroll utility for preventing body scroll. Useful when modals or overlays are open.",
    frameworks: ["html"],
    props: [],
    slots: [],
    events: [],
    examples,
    cssClasses,
  };
}
