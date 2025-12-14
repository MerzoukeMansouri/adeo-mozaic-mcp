import { existsSync } from "fs";
import { join } from "path";
import type { CssUtility, CssUtilityExample } from "../db/queries.js";

// Screen breakpoints for responsive classes
const MAJOR_SCREENS = ["s", "m", "l", "xl"];

// Spacing sizes for margin/padding utilities
const SIZES = [
  "025",
  "050",
  "075",
  "100",
  "125",
  "150",
  "200",
  "250",
  "300",
  "350",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "1000",
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
 * Parse SCSS files to extract CSS-only utilities (layouts and spacing)
 */
export async function parseCssUtilities(stylesPath: string): Promise<CssUtility[]> {
  const utilities: CssUtility[] = [];

  // Parse layouts
  const layoutsPath = join(stylesPath, "layouts");
  if (existsSync(layoutsPath)) {
    utilities.push(parseFlexyUtility());
    utilities.push(parseContainerUtility());
  }

  // Parse utilities
  const utilitiesPath = join(stylesPath, "utilities");
  if (existsSync(utilitiesPath)) {
    utilities.push(parseMarginUtility());
    utilities.push(parsePaddingUtility());
    utilities.push(parseRatioUtility());
    utilities.push(parseScrollUtility());
  }

  return utilities;
}

/**
 * Parse Flexy (flexbox grid) utility
 */
function parseFlexyUtility(): CssUtility {
  const classes: string[] = [];

  // Base class
  classes.push(".ml-flexy");

  // Column class
  classes.push(".ml-flexy__col");

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
    classes.push(`.ml-flexy--${mod}`);
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
      classes.push(`.ml-flexy--${mod}@from-${screen}`);
    }
  }

  // Column width classes (fractions)
  const fractions = [
    [1, 2],
    [1, 3],
    [2, 3],
    [1, 4],
    [3, 4],
    [1, 6],
    [5, 6],
    [1, 12],
    [2, 12],
    [3, 12],
    [4, 12],
    [5, 12],
    [6, 12],
    [7, 12],
    [8, 12],
    [9, 12],
    [10, 12],
    [11, 12],
  ];

  for (const [num, denom] of fractions) {
    classes.push(`.ml-flexy__col--${num}of${denom}`);
    classes.push(`.ml-flexy__col--push-${num}of${denom}`);

    // Responsive variants
    for (const screen of MAJOR_SCREENS) {
      classes.push(`.ml-flexy__col--${num}of${denom}@from-${screen}`);
      classes.push(`.ml-flexy__col--push-${num}of${denom}@from-${screen}`);
    }
  }

  // Custom column classes
  const customCols = ["fill", "full", "initial", "grow", "first", "last"];
  for (const col of customCols) {
    classes.push(`.ml-flexy__col--${col}`);
    for (const screen of MAJOR_SCREENS) {
      classes.push(`.ml-flexy__col--${col}@from-${screen}`);
    }
  }

  // Push reset
  classes.push(".ml-flexy__col--push--reset");
  for (const screen of MAJOR_SCREENS) {
    classes.push(`.ml-flexy__col--push--reset@from-${screen}`);
  }

  const examples: CssUtilityExample[] = [
    {
      title: "Basic 2-column layout",
      code: `<div class="ml-flexy ml-flexy--gutter">
  <div class="ml-flexy__col ml-flexy__col--6of12">Column 1</div>
  <div class="ml-flexy__col ml-flexy__col--6of12">Column 2</div>
</div>`,
    },
    {
      title: "Responsive columns",
      code: `<div class="ml-flexy ml-flexy--gutter">
  <div class="ml-flexy__col ml-flexy__col--full ml-flexy__col--6of12@from-m ml-flexy__col--4of12@from-l">
    Responsive column
  </div>
</div>`,
    },
    {
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
    classes,
    examples,
  };
}

/**
 * Parse Container utility
 */
function parseContainerUtility(): CssUtility {
  const classes: string[] = [];

  classes.push(".ml-container");
  classes.push(".ml-container--fluid");

  // Responsive fluid modifier
  for (const screen of MAJOR_SCREENS) {
    classes.push(`.ml-container--fluid@from-${screen}`);
  }

  const examples: CssUtilityExample[] = [
    {
      title: "Basic container",
      code: `<div class="ml-container">
  <p>Content within max-width container</p>
</div>`,
    },
    {
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
    classes,
    examples,
  };
}

/**
 * Parse Margin utilities
 */
function parseMarginUtility(): CssUtility {
  const classes: string[] = [];

  // Generate all margin utility classes
  for (const [sideKey] of Object.entries(SIDES)) {
    for (const size of SIZES) {
      if (sideKey === "all") {
        classes.push(`.mu-m-${size}`);
      } else {
        classes.push(`.mu-m${sideKey}-${size}`);
      }
    }
  }

  const examples: CssUtilityExample[] = [
    {
      title: "Margin all sides",
      code: `<div class="mu-m-100">16px margin on all sides</div>`,
    },
    {
      title: "Margin specific sides",
      code: `<div class="mu-mt-200 mu-mb-100">
  32px top margin, 16px bottom margin
</div>`,
    },
    {
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
    classes,
    examples,
  };
}

/**
 * Parse Padding utilities
 */
function parsePaddingUtility(): CssUtility {
  const classes: string[] = [];

  // Generate all padding utility classes
  for (const [sideKey] of Object.entries(SIDES)) {
    for (const size of SIZES) {
      if (sideKey === "all") {
        classes.push(`.mu-p-${size}`);
      } else {
        classes.push(`.mu-p${sideKey}-${size}`);
      }
    }
  }

  const examples: CssUtilityExample[] = [
    {
      title: "Padding all sides",
      code: `<div class="mu-p-100">16px padding on all sides</div>`,
    },
    {
      title: "Padding specific sides",
      code: `<div class="mu-pt-200 mu-pb-100">
  32px top padding, 16px bottom padding
</div>`,
    },
    {
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
    classes,
    examples,
  };
}

/**
 * Parse Ratio utilities
 */
function parseRatioUtility(): CssUtility {
  const classes: string[] = [];

  classes.push(".mu-ratio");
  classes.push(".mu-ratio__item");

  for (const ratio of ASPECT_RATIOS) {
    classes.push(`.mu-ratio--${ratio}`);
  }

  const examples: CssUtilityExample[] = [
    {
      title: "16:9 aspect ratio",
      code: `<div class="mu-ratio mu-ratio--16x9">
  <img class="mu-ratio__item" src="image.jpg" alt="Image with 16:9 ratio" />
</div>`,
    },
    {
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
    classes,
    examples,
  };
}

/**
 * Parse Scroll utilities
 */
function parseScrollUtility(): CssUtility {
  const classes = [".mu-prevent-body-scroll"];

  const examples: CssUtilityExample[] = [
    {
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
    classes,
    examples,
  };
}
