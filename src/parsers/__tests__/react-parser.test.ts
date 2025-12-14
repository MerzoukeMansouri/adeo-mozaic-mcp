import { describe, it, expect } from "vitest";

// Test the React prop extraction patterns directly
describe("React Parser - extractConstArrays", () => {
  function extractConstArrays(content: string): Map<string, string[]> {
    const constArrays = new Map<string, string[]>();

    const constRegex = /const\s+(\w+)\s*=\s*\[([^\]]+)\]\s*as\s+const/g;
    let match;
    while ((match = constRegex.exec(content)) !== null) {
      const name = match[1];
      const values = match[2]
        .split(",")
        .map((s) => s.trim().replace(/['"]/g, ""))
        .filter((s) => s.length > 0);
      constArrays.set(name, values);
    }

    return constArrays;
  }

  it("should extract const arrays", () => {
    const content = `
export const sizes = ['s', 'm', 'l'] as const;
export const themes = ['primary', 'secondary', 'danger'] as const;
`;
    const arrays = extractConstArrays(content);

    expect(arrays.get("sizes")).toEqual(["s", "m", "l"]);
    expect(arrays.get("themes")).toEqual(["primary", "secondary", "danger"]);
  });

  it("should handle double quotes", () => {
    const content = `export const variants = ["solid", "bordered", "ghost"] as const;`;
    const arrays = extractConstArrays(content);

    expect(arrays.get("variants")).toEqual(["solid", "bordered", "ghost"]);
  });
});

describe("React Parser - extractPropsFromInterface", () => {
  function extractPropsFromInterface(
    content: string,
    interfaceName: string,
    constArrays: Map<string, string[]>
  ) {
    const props: Array<{
      name: string;
      type: string;
      required: boolean;
      options?: string[];
    }> = [];
    const seenProps = new Set<string>();

    const interfaceRegex = new RegExp(
      `interface\\s+${interfaceName}\\s*(?:extends\\s+([^{]+))?\\s*\\{([\\s\\S]*?)\\}`,
      "g"
    );

    const match = interfaceRegex.exec(content);
    if (!match) return props;

    const extendsClause = match[1];
    const interfaceBody = match[2];

    // Recursively get props from extended interfaces
    if (extendsClause) {
      const extendedInterfaces = extendsClause
        .split(",")
        .map((s) => s.trim().replace(/<[^>]+>/, ""))
        .filter((s) => s.length > 0 && !s.startsWith("Omit") && !s.includes("HTMLAttributes"));

      for (const extInterface of extendedInterfaces) {
        const extProps = extractPropsFromInterface(content, extInterface, constArrays);
        for (const prop of extProps) {
          if (!seenProps.has(prop.name)) {
            seenProps.add(prop.name);
            props.push(prop);
          }
        }
      }
    }

    const propRegex = /(\w+)(\?)?:\s*([^;\n]+)/g;
    let propMatch;
    while ((propMatch = propRegex.exec(interfaceBody)) !== null) {
      const propName = propMatch[1];
      const isOptional = !!propMatch[2];
      const propType = propMatch[3].trim();

      if (seenProps.has(propName)) continue;
      if (propType.includes("=>") || propName.startsWith("on")) continue;
      if (propName === "children" || propName === "className") continue;

      seenProps.add(propName);

      let options: string[] | undefined;
      const typeRefMatch = propType.match(/^T(\w+)$/);
      if (typeRefMatch) {
        const typeName = typeRefMatch[1].toLowerCase();
        for (const [constName, values] of constArrays) {
          const constNameLower = constName.toLowerCase();
          // Match if type contains const name or const name contains type suffix
          // e.g., "buttonvariant" should match "variant" or "variants"
          if (
            typeName.includes(constNameLower) ||
            typeName.includes(constNameLower.replace(/s$/, ""))
          ) {
            options = values;
            break;
          }
        }
      }

      if (propType.includes("|") && propType.includes("'")) {
        options = propType
          .split("|")
          .map((s) => s.trim().replace(/['"]/g, ""))
          .filter((s) => s && s !== "undefined");
      }

      props.push({
        name: propName,
        type: propType,
        required: !isOptional,
        options: options && options.length > 1 ? options : undefined,
      });
    }

    return props;
  }

  it("should extract props from simple interface", () => {
    const content = `
interface IButtonProps {
  variant?: TButtonVariant;
  size?: TButtonSize;
  isDisabled?: boolean;
}
`;
    const constArrays = new Map<string, string[]>();
    constArrays.set("variants", ["solid", "bordered"]);
    constArrays.set("sizes", ["s", "m", "l"]);

    const props = extractPropsFromInterface(content, "IButtonProps", constArrays);

    expect(props).toHaveLength(3);
    expect(props[0].name).toBe("variant");
    expect(props[0].options).toEqual(["solid", "bordered"]);
    expect(props[1].name).toBe("size");
    expect(props[1].options).toEqual(["s", "m", "l"]);
    expect(props[2].name).toBe("isDisabled");
    expect(props[2].type).toBe("boolean");
  });

  it("should handle interface inheritance", () => {
    const content = `
interface IBaseProps {
  id?: string;
  testId?: string;
}

interface IButtonProps extends IBaseProps {
  variant?: string;
  size?: string;
}
`;
    const props = extractPropsFromInterface(content, "IButtonProps", new Map());

    expect(props).toHaveLength(4);
    expect(props.map((p) => p.name)).toContain("id");
    expect(props.map((p) => p.name)).toContain("testId");
    expect(props.map((p) => p.name)).toContain("variant");
    expect(props.map((p) => p.name)).toContain("size");
  });

  it("should extract inline union types as options", () => {
    const content = `
interface IButtonProps {
  theme?: 'primary' | 'secondary' | 'danger';
  size?: 's' | 'm' | 'l';
}
`;
    const props = extractPropsFromInterface(content, "IButtonProps", new Map());

    expect(props[0].options).toEqual(["primary", "secondary", "danger"]);
    expect(props[1].options).toEqual(["s", "m", "l"]);
  });

  it("should skip callback props and children", () => {
    const content = `
interface IButtonProps {
  onClick?: () => void;
  onHover?: (event: MouseEvent) => void;
  children?: ReactNode;
  className?: string;
  label?: string;
}
`;
    const props = extractPropsFromInterface(content, "IButtonProps", new Map());

    expect(props).toHaveLength(1);
    expect(props[0].name).toBe("label");
  });
});

describe("React Parser - extractCallbacks", () => {
  function extractCallbacks(content: string) {
    const events: Array<{ name: string; description?: string }> = [];
    const seenEvents = new Set<string>();

    const callbackPatterns = [
      /(\bon[A-Z]\w*)\??:\s*\([^)]*\)\s*=>\s*\w+/g,
      /(\bon[A-Z]\w*)\??:\s*\w*EventHandler/g,
    ];

    for (const pattern of callbackPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const eventName = match[1];
        if (!seenEvents.has(eventName)) {
          seenEvents.add(eventName);
          events.push({
            name: eventName,
            description: `${eventName.replace(/^on/, "")} event callback`,
          });
        }
      }
    }

    return events;
  }

  it("should extract callback props", () => {
    const content = `
interface IButtonProps {
  onClick?: () => void;
  onHover?: (event: MouseEvent) => void;
  onChange?: (value: string) => void;
}
`;
    const callbacks = extractCallbacks(content);

    expect(callbacks).toHaveLength(3);
    expect(callbacks.map((c) => c.name)).toContain("onClick");
    expect(callbacks.map((c) => c.name)).toContain("onHover");
    expect(callbacks.map((c) => c.name)).toContain("onChange");
  });

  it("should extract EventHandler types", () => {
    const content = `
interface IInputProps {
  onFocus?: FocusEventHandler;
  onBlur?: FocusEventHandler;
}
`;
    const callbacks = extractCallbacks(content);

    expect(callbacks).toHaveLength(2);
    expect(callbacks.map((c) => c.name)).toContain("onFocus");
    expect(callbacks.map((c) => c.name)).toContain("onBlur");
  });
});

describe("React Parser - hasChildrenProp", () => {
  function hasChildrenProp(content: string): boolean {
    return (
      content.includes("children") ||
      content.includes("PropsWithChildren") ||
      content.includes("ReactNode")
    );
  }

  it("should detect children prop", () => {
    expect(hasChildrenProp("interface Props { children: ReactNode }")).toBe(true);
    expect(hasChildrenProp("type Props = PropsWithChildren<{}>")).toBe(true);
    expect(hasChildrenProp("interface Props { label: string }")).toBe(false);
  });
});

describe("React Parser - inferCategory", () => {
  function inferCategory(componentName: string): string {
    const name = componentName.toLowerCase();

    if (["button", "link", "optionbutton"].some((n) => name.includes(n))) return "action";
    if (
      ["input", "select", "checkbox", "radio", "toggle", "textarea", "field"].some((n) =>
        name.includes(n)
      )
    )
      return "form";
    if (["accordion", "breadcrumb", "menu", "pagination", "tabs"].some((n) => name.includes(n)))
      return "navigation";
    if (
      ["badge", "flag", "loader", "modal", "notification", "progress", "tooltip"].some((n) =>
        name.includes(n)
      )
    )
      return "feedback";
    if (["card", "divider", "layer"].some((n) => name.includes(n))) return "layout";
    if (["table", "heading", "hero", "listbox", "rating", "tag"].some((n) => name.includes(n)))
      return "data-display";

    return "other";
  }

  it("should categorize action components", () => {
    expect(inferCategory("Button")).toBe("action");
    expect(inferCategory("Link")).toBe("action");
    expect(inferCategory("OptionButton")).toBe("action");
  });

  it("should categorize form components", () => {
    expect(inferCategory("Input")).toBe("form");
    expect(inferCategory("TextInput")).toBe("form");
    expect(inferCategory("Checkbox")).toBe("form");
    expect(inferCategory("Select")).toBe("form");
    expect(inferCategory("TextField")).toBe("form");
  });

  it("should categorize navigation components", () => {
    expect(inferCategory("Breadcrumb")).toBe("navigation");
    expect(inferCategory("Menu")).toBe("navigation");
    expect(inferCategory("Tabs")).toBe("navigation");
  });

  it("should categorize feedback components", () => {
    expect(inferCategory("Modal")).toBe("feedback");
    expect(inferCategory("Notification")).toBe("feedback");
    expect(inferCategory("Loader")).toBe("feedback");
    expect(inferCategory("ProgressBar")).toBe("feedback");
  });

  it("should return other for unknown components", () => {
    expect(inferCategory("CustomComponent")).toBe("other");
    expect(inferCategory("MyWidget")).toBe("other");
  });
});
