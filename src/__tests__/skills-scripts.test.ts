import { describe, it, expect } from "vitest";
import { spawnSync } from "child_process";
import { resolve } from "path";

const DB_PATH = resolve(process.cwd(), "data/mozaic.db");
const SKILLS_DIR = resolve(process.cwd(), "skills");

function runScript(scriptPath: string, args: string[] = []) {
  const result = spawnSync("bash", [scriptPath, ...args], {
    env: { ...process.env, MOZAIC_DB_PATH: DB_PATH },
    encoding: "utf8",
  });
  return {
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
    status: result.status ?? 1,
  };
}

// ---------------------------------------------------------------------------
// mozaic-design-tokens — get-tokens.sh
// Bug fixed: plural category aliases (colors/shadows/borders/screens) were not
// mapped to the actual DB values (color/shadow/border/screen).
// ---------------------------------------------------------------------------
describe("mozaic-design-tokens/get-tokens.sh", () => {
  const script = `${SKILLS_DIR}/mozaic-design-tokens/scripts/get-tokens.sh`;

  it("accepts 'colors' alias and returns color tokens as JSON", () => {
    const { stdout, status } = runScript(script, ["colors"]);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("name");
    expect(data[0]).toHaveProperty("value");
  });

  it("accepts 'shadows' alias and returns shadow tokens", () => {
    const { stdout, status } = runScript(script, ["shadows"]);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it("accepts 'borders' alias and returns border tokens", () => {
    const { stdout, status } = runScript(script, ["borders"]);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it("accepts 'screens' alias and returns screen tokens", () => {
    const { stdout, status } = runScript(script, ["screens"]);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it("accepts native 'color' category (no alias)", () => {
    const { stdout, status } = runScript(script, ["color"]);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it("accepts 'all' and returns tokens from multiple categories", () => {
    const { stdout, status } = runScript(script, ["all"]);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(Array.isArray(data)).toBe(true);
    const categories = [...new Set(data.map((t: { category: string }) => t.category))];
    expect(categories.length).toBeGreaterThan(3);
  });

  it("outputs valid SCSS format", () => {
    const { stdout, status } = runScript(script, ["spacing", "scss"]);
    expect(status).toBe(0);
    expect(stdout).toMatch(/^\$.+:.+;/m);
  });

  it("outputs valid CSS :root block", () => {
    const { stdout, status } = runScript(script, ["spacing", "css"]);
    expect(status).toBe(0);
    expect(stdout).toContain(":root {");
    expect(stdout).toMatch(/--[\w-]+:/);
  });

  it("exits with error when no category is provided", () => {
    const { status, stdout } = runScript(script, []);
    expect(status).not.toBe(0);
    expect(stdout).toContain("Error");
  });
});

// ---------------------------------------------------------------------------
// mozaic-design-tokens — search-docs.sh
// Bug fixed: SELECT queried non-existent 'url' column; actual column is 'path'.
// ---------------------------------------------------------------------------
describe("mozaic-design-tokens/search-docs.sh", () => {
  const script = `${SKILLS_DIR}/mozaic-design-tokens/scripts/search-docs.sh`;

  it("returns results without a column error", () => {
    const { stderr, status } = runScript(script, ["color"]);
    expect(status).toBe(0);
    expect(stderr).not.toContain("no such column");
    expect(stderr).not.toContain("error");
  });

  it("returns results that include a 'path' field (not 'url')", () => {
    const { stdout, status } = runScript(script, ["color"]);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("path");
    expect(data[0]).not.toHaveProperty("url");
  });

  it("respects the limit argument", () => {
    const { stdout, status } = runScript(script, ["button", "3"]);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(data.length).toBeLessThanOrEqual(3);
  });

  it("exits with error when no query is provided", () => {
    const { status, stdout } = runScript(script, []);
    expect(status).not.toBe(0);
    expect(stdout).toContain("Error");
  });
});

// ---------------------------------------------------------------------------
// mozaic-css-utilities — get-utility.sh
// Bug fixed: SELECT queried non-existent 'description' column in css_utility_examples.
// ---------------------------------------------------------------------------
describe("mozaic-css-utilities/get-utility.sh", () => {
  const script = `${SKILLS_DIR}/mozaic-css-utilities/scripts/get-utility.sh`;

  it("returns margin utility without a column error", () => {
    const { stderr, status } = runScript(script, ["margin"]);
    expect(status).toBe(0);
    expect(stderr).not.toContain("no such column");
    expect(stderr).not.toContain("error");
  });

  it("examples have 'title' and 'code' fields only (no 'description')", () => {
    const { stdout, status } = runScript(script, ["margin"]);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(Array.isArray(data.examples)).toBe(true);
    expect(data.examples.length).toBeGreaterThan(0);
    expect(data.examples[0]).toHaveProperty("title");
    expect(data.examples[0]).toHaveProperty("code");
    expect(data.examples[0]).not.toHaveProperty("description");
  });

  it("returns classes when include-classes=true", () => {
    const { stdout, status } = runScript(script, ["flexy", "true"]);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(data.classes.length).toBeGreaterThan(10);
  });

  it("exits with error for unknown utility", () => {
    const { status, stdout } = runScript(script, ["nonexistent"]);
    expect(status).not.toBe(0);
    expect(stdout).toContain("Error");
  });
});

// ---------------------------------------------------------------------------
// mozaic-icons — get-icon.sh
// Bug fixed: empty result check `= "[]"` never triggered because sqlite3
// returns an empty string for no results, not "[]".
// ---------------------------------------------------------------------------
describe("mozaic-icons/get-icon.sh", () => {
  const script = `${SKILLS_DIR}/mozaic-icons/scripts/get-icon.sh`;

  it("returns a clear error for a non-existent icon (regression: silent empty output)", () => {
    const { status, stdout } = runScript(script, ["NonExistentIconXYZ"]);
    expect(status).not.toBe(0);
    expect(stdout).toContain("Error");
    expect(stdout).toContain("not found");
  });

  it("returns valid data for a known icon", () => {
    const { stdout, status } = runScript(script, ["ArrowArrowRight16", "react"]);
    expect(status).toBe(0);
    expect(stdout).toContain("import");
    expect(stdout).toContain("@mozaic-ds/icons/react");
  });

  it("exits with error for invalid format", () => {
    const { status, stdout } = runScript(script, ["ArrowArrowRight16", "invalid"]);
    expect(status).not.toBe(0);
    expect(stdout).toContain("Error");
  });
});

// ---------------------------------------------------------------------------
// mozaic-icons — search-icons.sh
// ---------------------------------------------------------------------------
describe("mozaic-icons/search-icons.sh", () => {
  const script = `${SKILLS_DIR}/mozaic-icons/scripts/search-icons.sh`;

  it("returns icons matching query", () => {
    const { stdout, status } = runScript(script, ["arrow"]);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("name");
    expect(data[0]).toHaveProperty("size");
  });

  it("returns empty array for no match", () => {
    const { stdout, status } = runScript(script, ["zzznomatchzzz"]);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// mozaic-react-builder — get-component.sh
// Bug fixed: empty result check `= "[]"` never triggered (same as icons).
// ---------------------------------------------------------------------------
describe("mozaic-react-builder/get-component.sh", () => {
  const script = `${SKILLS_DIR}/mozaic-react-builder/scripts/get-component.sh`;

  it("returns a clear error for a non-existent component (regression: silent empty output)", () => {
    const { status, stdout } = runScript(script, ["NonExistentComponentXYZ"]);
    expect(status).not.toBe(0);
    expect(stdout).toContain("Error");
    expect(stdout).toContain("not found");
  });

  it("returns Button component with props", () => {
    const { stdout, status } = runScript(script, ["Button"]);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(Array.isArray(data.component)).toBe(true);
    expect(data.component[0].name).toBe("Button");
    expect(Array.isArray(data.props)).toBe(true);
    expect(data.props.length).toBeGreaterThan(0);
  });

  it("returns examples for Button", () => {
    const { stdout, status } = runScript(script, ["Button"]);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(Array.isArray(data.examples)).toBe(true);
    expect(data.examples.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// mozaic-react-builder — generate-component.sh
// Bug fixed: queried non-existent 'template' column; now generates from examples.
// ---------------------------------------------------------------------------
describe("mozaic-react-builder/generate-component.sh", () => {
  const script = `${SKILLS_DIR}/mozaic-react-builder/scripts/generate-component.sh`;

  it("generates Button code without a column error (regression: template column)", () => {
    const { stderr, status } = runScript(script, ["Button"]);
    expect(status).toBe(0);
    expect(stderr).not.toContain("no such column");
    expect(stderr).not.toContain("error");
  });

  it("returns valid JSON with component, framework, code, and import fields", () => {
    const { stdout, status } = runScript(script, ["Button"]);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(data.component).toBe("Button");
    expect(data.framework).toBe("react");
    expect(typeof data.code).toBe("string");
    expect(data.code.length).toBeGreaterThan(0);
    expect(data.import).toContain("@mozaic-ds/react");
  });

  it("returns a clear error for a non-existent component", () => {
    const { status, stdout } = runScript(script, ["NonExistentComponentXYZ"]);
    expect(status).not.toBe(0);
    expect(stdout).toContain("Error");
  });
});

// ---------------------------------------------------------------------------
// mozaic-vue-builder — get-component.sh
// Bug fixed: same empty result check issue + Vue components use M prefix.
// ---------------------------------------------------------------------------
describe("mozaic-vue-builder/get-component.sh", () => {
  const script = `${SKILLS_DIR}/mozaic-vue-builder/scripts/get-component.sh`;

  it("returns a clear error for a non-existent component (regression: silent empty output)", () => {
    const { status, stdout } = runScript(script, ["NonExistentComponentXYZ"]);
    expect(status).not.toBe(0);
    expect(stdout).toContain("Error");
    expect(stdout).toContain("not found");
  });

  it("returns error for 'Button' without M prefix (Vue components need M prefix)", () => {
    const { status, stdout } = runScript(script, ["Button"]);
    expect(status).not.toBe(0);
    expect(stdout).toContain("not found");
  });

  it("returns MButton component with props and slots", () => {
    const { stdout, status } = runScript(script, ["MButton"]);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(data.component[0].name).toBe("MButton");
    expect(Array.isArray(data.props)).toBe(true);
    expect(data.props.length).toBeGreaterThan(0);
    expect(Array.isArray(data.slots)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// mozaic-vue-builder — generate-component.sh
// Bug fixed: queried non-existent 'template' column; now generates from examples.
// ---------------------------------------------------------------------------
describe("mozaic-vue-builder/generate-component.sh", () => {
  const script = `${SKILLS_DIR}/mozaic-vue-builder/scripts/generate-component.sh`;

  it("generates MButton code without a column error (regression: template column)", () => {
    const { stderr, status } = runScript(script, ["MButton"]);
    expect(status).toBe(0);
    expect(stderr).not.toContain("no such column");
    expect(stderr).not.toContain("error");
  });

  it("returns valid JSON with component, framework, code, and import fields", () => {
    const { stdout, status } = runScript(script, ["MButton"]);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(data.component).toBe("MButton");
    expect(data.framework).toBe("vue");
    expect(typeof data.code).toBe("string");
    expect(data.code.length).toBeGreaterThan(0);
    expect(data.import).toContain("@mozaic-ds/vue-3");
  });

  it("returns a clear error for a non-existent component", () => {
    const { status, stdout } = runScript(script, ["NonExistentComponentXYZ"]);
    expect(status).not.toBe(0);
    expect(stdout).toContain("Error");
  });
});

// ---------------------------------------------------------------------------
// mozaic-react-builder — list-components.sh & get-install-info.sh
// ---------------------------------------------------------------------------
describe("mozaic-react-builder/list-components.sh", () => {
  const script = `${SKILLS_DIR}/mozaic-react-builder/scripts/list-components.sh`;

  it("lists all React components", () => {
    const { stdout, status } = runScript(script, []);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data.every((c: { frameworks: string }) => c.frameworks.includes("react"))).toBe(true);
  });

  it("filters by category", () => {
    const { stdout, status } = runScript(script, ["action"]);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(data.length).toBeGreaterThan(0);
    expect(data.every((c: { category: string }) => c.category === "action")).toBe(true);
  });
});

describe("mozaic-react-builder/get-install-info.sh", () => {
  const script = `${SKILLS_DIR}/mozaic-react-builder/scripts/get-install-info.sh`;

  it("returns install info for Button", () => {
    const { stdout, status } = runScript(script, ["Button"]);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(data.component).toBe("Button");
    expect(data.package).toBe("@mozaic-ds/react");
    expect(data.installCommand).toContain("@mozaic-ds/react");
  });

  it("supports npm package manager", () => {
    const { stdout, status } = runScript(script, ["Button", "npm"]);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(data.installCommand).toContain("npm install");
  });

  it("returns error for unknown component", () => {
    const { status, stdout } = runScript(script, ["NonExistentXYZ"]);
    expect(status).not.toBe(0);
    expect(stdout).toContain("Error");
  });
});

// ---------------------------------------------------------------------------
// mozaic-vue-builder — list-components.sh & get-install-info.sh
// ---------------------------------------------------------------------------
describe("mozaic-vue-builder/list-components.sh", () => {
  const script = `${SKILLS_DIR}/mozaic-vue-builder/scripts/list-components.sh`;

  it("lists all Vue components", () => {
    const { stdout, status } = runScript(script, []);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data.every((c: { frameworks: string }) => c.frameworks.includes("vue"))).toBe(true);
  });
});

describe("mozaic-vue-builder/get-install-info.sh", () => {
  const script = `${SKILLS_DIR}/mozaic-vue-builder/scripts/get-install-info.sh`;

  it("returns install info for MButton", () => {
    const { stdout, status } = runScript(script, ["MButton"]);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(data.component).toBe("MButton");
    expect(data.package).toBe("@mozaic-ds/vue-3");
    expect(data.installCommand).toContain("@mozaic-ds/vue-3");
  });

  it("returns error for unknown component", () => {
    const { status, stdout } = runScript(script, ["NonExistentXYZ"]);
    expect(status).not.toBe(0);
    expect(stdout).toContain("Error");
  });
});

// ---------------------------------------------------------------------------
// mozaic-css-utilities — list-utilities.sh
// ---------------------------------------------------------------------------
describe("mozaic-css-utilities/list-utilities.sh", () => {
  const script = `${SKILLS_DIR}/mozaic-css-utilities/scripts/list-utilities.sh`;

  it("lists all 6 CSS utilities", () => {
    const { stdout, status } = runScript(script, []);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(6);
  });

  it("filters utilities by 'layout' category", () => {
    const { stdout, status } = runScript(script, ["layout"]);
    expect(status).toBe(0);
    const data = JSON.parse(stdout);
    expect(data.every((u: { category: string }) => u.category === "layout")).toBe(true);
  });
});
