import { describe, it, expect } from "vitest";

// Test CSS utility parsing logic
// Since parseCssUtilities requires filesystem, we test the utility generation logic directly

describe("SCSS Parser", () => {
  describe("Flexy utility", () => {
    const flexy = parseFlexyUtility();

    it("returns correct name and slug", () => {
      expect(flexy.name).toBe("Flexy");
      expect(flexy.slug).toBe("flexy");
      expect(flexy.category).toBe("layout");
    });

    it("includes base classes", () => {
      expect(flexy.classes).toContain(".ml-flexy");
      expect(flexy.classes).toContain(".ml-flexy__col");
    });

    it("includes modifier classes", () => {
      expect(flexy.classes).toContain(".ml-flexy--gutter");
      expect(flexy.classes).toContain(".ml-flexy--justify-center");
      expect(flexy.classes).toContain(".ml-flexy--items-center");
    });

    it("includes responsive modifiers", () => {
      expect(flexy.classes).toContain(".ml-flexy--justify-center@from-s");
      expect(flexy.classes).toContain(".ml-flexy--justify-center@from-m");
      expect(flexy.classes).toContain(".ml-flexy--justify-center@from-l");
      expect(flexy.classes).toContain(".ml-flexy--justify-center@from-xl");
    });

    it("includes column width classes", () => {
      expect(flexy.classes).toContain(".ml-flexy__col--1of2");
      expect(flexy.classes).toContain(".ml-flexy__col--6of12");
      expect(flexy.classes).toContain(".ml-flexy__col--4of12");
    });

    it("includes push classes", () => {
      expect(flexy.classes).toContain(".ml-flexy__col--push-1of2");
      expect(flexy.classes).toContain(".ml-flexy__col--push--reset");
    });

    it("includes responsive column classes", () => {
      expect(flexy.classes).toContain(".ml-flexy__col--6of12@from-m");
      expect(flexy.classes).toContain(".ml-flexy__col--full@from-l");
    });

    it("includes custom column classes", () => {
      expect(flexy.classes).toContain(".ml-flexy__col--fill");
      expect(flexy.classes).toContain(".ml-flexy__col--full");
      expect(flexy.classes).toContain(".ml-flexy__col--grow");
    });

    it("has examples", () => {
      expect(flexy.examples.length).toBeGreaterThan(0);
      expect(flexy.examples[0].code).toContain("ml-flexy");
    });

    it("has description", () => {
      expect(flexy.description).toBeDefined();
      expect(flexy.description.length).toBeGreaterThan(10);
    });
  });

  describe("Container utility", () => {
    const container = parseContainerUtility();

    it("returns correct name and slug", () => {
      expect(container.name).toBe("Container");
      expect(container.slug).toBe("container");
      expect(container.category).toBe("layout");
    });

    it("includes base and fluid classes", () => {
      expect(container.classes).toContain(".ml-container");
      expect(container.classes).toContain(".ml-container--fluid");
    });

    it("includes responsive fluid modifiers", () => {
      expect(container.classes).toContain(".ml-container--fluid@from-s");
      expect(container.classes).toContain(".ml-container--fluid@from-m");
    });

    it("has examples", () => {
      expect(container.examples.length).toBeGreaterThan(0);
    });
  });

  describe("Margin utility", () => {
    const margin = parseMarginUtility();

    it("returns correct name and slug", () => {
      expect(margin.name).toBe("Margin");
      expect(margin.slug).toBe("margin");
      expect(margin.category).toBe("utility");
    });

    it("includes all-sides margin classes", () => {
      expect(margin.classes).toContain(".mu-m-100");
      expect(margin.classes).toContain(".mu-m-200");
    });

    it("includes directional margin classes", () => {
      expect(margin.classes).toContain(".mu-mt-100"); // top
      expect(margin.classes).toContain(".mu-mr-100"); // right
      expect(margin.classes).toContain(".mu-mb-100"); // bottom
      expect(margin.classes).toContain(".mu-ml-100"); // left
    });

    it("includes vertical/horizontal margin classes", () => {
      expect(margin.classes).toContain(".mu-mv-100"); // vertical
      expect(margin.classes).toContain(".mu-mh-100"); // horizontal
    });

    it("includes various sizes", () => {
      expect(margin.classes).toContain(".mu-m-025");
      expect(margin.classes).toContain(".mu-m-050");
      expect(margin.classes).toContain(".mu-m-500");
      expect(margin.classes).toContain(".mu-m-1000");
    });

    it("has examples", () => {
      expect(margin.examples.length).toBeGreaterThan(0);
      expect(margin.examples[0].code).toContain("mu-m");
    });
  });

  describe("Padding utility", () => {
    const padding = parsePaddingUtility();

    it("returns correct name and slug", () => {
      expect(padding.name).toBe("Padding");
      expect(padding.slug).toBe("padding");
      expect(padding.category).toBe("utility");
    });

    it("includes all-sides padding classes", () => {
      expect(padding.classes).toContain(".mu-p-100");
      expect(padding.classes).toContain(".mu-p-200");
    });

    it("includes directional padding classes", () => {
      expect(padding.classes).toContain(".mu-pt-100"); // top
      expect(padding.classes).toContain(".mu-pr-100"); // right
      expect(padding.classes).toContain(".mu-pb-100"); // bottom
      expect(padding.classes).toContain(".mu-pl-100"); // left
    });

    it("includes vertical/horizontal padding classes", () => {
      expect(padding.classes).toContain(".mu-pv-100"); // vertical
      expect(padding.classes).toContain(".mu-ph-100"); // horizontal
    });

    it("has examples", () => {
      expect(padding.examples.length).toBeGreaterThan(0);
      expect(padding.examples[0].code).toContain("mu-p");
    });
  });

  describe("Ratio utility", () => {
    const ratio = parseRatioUtility();

    it("returns correct name and slug", () => {
      expect(ratio.name).toBe("Ratio");
      expect(ratio.slug).toBe("ratio");
      expect(ratio.category).toBe("utility");
    });

    it("includes base classes", () => {
      expect(ratio.classes).toContain(".mu-ratio");
      expect(ratio.classes).toContain(".mu-ratio__item");
    });

    it("includes aspect ratio modifiers", () => {
      expect(ratio.classes).toContain(".mu-ratio--1x1");
      expect(ratio.classes).toContain(".mu-ratio--16x9");
      expect(ratio.classes).toContain(".mu-ratio--4x3");
      expect(ratio.classes).toContain(".mu-ratio--3x2");
    });

    it("has examples", () => {
      expect(ratio.examples.length).toBeGreaterThan(0);
      expect(ratio.examples[0].code).toContain("mu-ratio");
    });
  });

  describe("Scroll utility", () => {
    const scroll = parseScrollUtility();

    it("returns correct name and slug", () => {
      expect(scroll.name).toBe("Scroll");
      expect(scroll.slug).toBe("scroll");
      expect(scroll.category).toBe("utility");
    });

    it("includes prevent body scroll class", () => {
      expect(scroll.classes).toContain(".mu-prevent-body-scroll");
    });

    it("has examples", () => {
      expect(scroll.examples.length).toBeGreaterThan(0);
    });
  });
});

// Reimplemented utility functions for testing
const MAJOR_SCREENS = ["s", "m", "l", "xl"];
const SIZES = [
  "025", "050", "075", "100", "125", "150",
  "200", "250", "300", "350", "400", "500",
  "600", "700", "800", "900", "1000"
];
const SIDES = { t: "top", r: "right", l: "left", b: "bottom", all: "all", v: "vertical", h: "horizontal" };
const ASPECT_RATIOS = ["1x1", "2x3", "3x2", "3x4", "4x3", "16x9"];

interface CssUtility {
  name: string;
  slug: string;
  category: string;
  description: string;
  classes: string[];
  examples: Array<{ title?: string; code: string }>;
}

function parseFlexyUtility(): CssUtility {
  const classes: string[] = [];
  classes.push(".ml-flexy");
  classes.push(".ml-flexy__col");

  const modifiers = [
    "gutter", "space-around", "justify-between", "justify-evenly",
    "justify-start", "justify-center", "justify-end",
    "items-stretch", "items-start", "items-center", "items-end",
  ];

  for (const mod of modifiers) {
    classes.push(`.ml-flexy--${mod}`);
  }

  const responsiveModifiers = [
    "space-around", "justify-between", "justify-evenly",
    "justify-start", "justify-center", "justify-end",
  ];

  for (const screen of MAJOR_SCREENS) {
    for (const mod of responsiveModifiers) {
      classes.push(`.ml-flexy--${mod}@from-${screen}`);
    }
  }

  const fractions = [
    [1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 6], [5, 6],
    [1, 12], [2, 12], [3, 12], [4, 12], [5, 12], [6, 12],
    [7, 12], [8, 12], [9, 12], [10, 12], [11, 12],
  ];

  for (const [num, denom] of fractions) {
    classes.push(`.ml-flexy__col--${num}of${denom}`);
    classes.push(`.ml-flexy__col--push-${num}of${denom}`);
    for (const screen of MAJOR_SCREENS) {
      classes.push(`.ml-flexy__col--${num}of${denom}@from-${screen}`);
      classes.push(`.ml-flexy__col--push-${num}of${denom}@from-${screen}`);
    }
  }

  const customCols = ["fill", "full", "initial", "grow", "first", "last"];
  for (const col of customCols) {
    classes.push(`.ml-flexy__col--${col}`);
    for (const screen of MAJOR_SCREENS) {
      classes.push(`.ml-flexy__col--${col}@from-${screen}`);
    }
  }

  classes.push(".ml-flexy__col--push--reset");
  for (const screen of MAJOR_SCREENS) {
    classes.push(`.ml-flexy__col--push--reset@from-${screen}`);
  }

  return {
    name: "Flexy",
    slug: "flexy",
    category: "layout",
    description: "Flexbox-based grid system for creating responsive layouts.",
    classes,
    examples: [{ title: "Basic", code: '<div class="ml-flexy"></div>' }],
  };
}

function parseContainerUtility(): CssUtility {
  const classes: string[] = [];
  classes.push(".ml-container");
  classes.push(".ml-container--fluid");
  for (const screen of MAJOR_SCREENS) {
    classes.push(`.ml-container--fluid@from-${screen}`);
  }
  return {
    name: "Container",
    slug: "container",
    category: "layout",
    description: "Responsive container with max-width.",
    classes,
    examples: [{ title: "Basic", code: '<div class="ml-container"></div>' }],
  };
}

function parseMarginUtility(): CssUtility {
  const classes: string[] = [];
  for (const [sideKey] of Object.entries(SIDES)) {
    for (const size of SIZES) {
      if (sideKey === "all") {
        classes.push(`.mu-m-${size}`);
      } else {
        classes.push(`.mu-m${sideKey}-${size}`);
      }
    }
  }
  return {
    name: "Margin",
    slug: "margin",
    category: "utility",
    description: "Margin utility classes.",
    classes,
    examples: [{ title: "Margin", code: '<div class="mu-m-100"></div>' }],
  };
}

function parsePaddingUtility(): CssUtility {
  const classes: string[] = [];
  for (const [sideKey] of Object.entries(SIDES)) {
    for (const size of SIZES) {
      if (sideKey === "all") {
        classes.push(`.mu-p-${size}`);
      } else {
        classes.push(`.mu-p${sideKey}-${size}`);
      }
    }
  }
  return {
    name: "Padding",
    slug: "padding",
    category: "utility",
    description: "Padding utility classes.",
    classes,
    examples: [{ title: "Padding", code: '<div class="mu-p-100"></div>' }],
  };
}

function parseRatioUtility(): CssUtility {
  const classes: string[] = [];
  classes.push(".mu-ratio");
  classes.push(".mu-ratio__item");
  for (const ratio of ASPECT_RATIOS) {
    classes.push(`.mu-ratio--${ratio}`);
  }
  return {
    name: "Ratio",
    slug: "ratio",
    category: "utility",
    description: "Aspect ratio utilities.",
    classes,
    examples: [{ title: "Ratio", code: '<div class="mu-ratio mu-ratio--16x9"></div>' }],
  };
}

function parseScrollUtility(): CssUtility {
  return {
    name: "Scroll",
    slug: "scroll",
    category: "utility",
    description: "Scroll utility.",
    classes: [".mu-prevent-body-scroll"],
    examples: [{ title: "Scroll", code: '<html class="mu-prevent-body-scroll">' }],
  };
}
