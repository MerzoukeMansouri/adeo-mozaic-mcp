import { describe, it, expect } from "vitest";

// Test the Vue prop extraction patterns directly
describe("Vue Parser - extractProps", () => {
  // Helper to extract props using the same logic as vue-parser.ts
  function extractProps(content: string) {
    const props: Array<{
      name: string;
      type?: string;
      required?: boolean;
      defaultValue?: string;
      options?: string[];
      description?: string;
    }> = [];

    // Vue 3 Composition API: defineProps<{...}>() with TypeScript generics
    const definePropsMatch = content.match(/defineProps<\{([\s\S]*?)\}>\s*\(\)/);
    if (definePropsMatch) {
      const propsContent = definePropsMatch[1];

      // Extract defaults from withDefaults if present
      const defaultsMatch = content.match(
        /withDefaults\s*\(\s*defineProps<[\s\S]*?>\s*\(\)\s*,\s*\{([\s\S]*?)\}\s*\)/
      );
      const defaultsContent = defaultsMatch ? defaultsMatch[1] : "";

      // Parse each prop with its JSDoc comment
      const propRegex = /(?:\/\*\*[\s\S]*?\*\/\s*)?(\w+)(\?)?:\s*([^;]+);/g;
      let match;
      while ((match = propRegex.exec(propsContent)) !== null) {
        const propName = match[1];
        const isOptional = !!match[2];
        const propType = match[3].trim();

        // Extract description from JSDoc comment before this prop
        const beforeProp = propsContent.substring(0, match.index);
        // Match JSDoc: /** ... */ allowing for multi-line content with * prefixes
        const jsdocMatch = beforeProp.match(/\/\*\*([\s\S]*?)\*\/\s*$/);
        let description: string | undefined;
        if (jsdocMatch) {
          // Remove leading whitespace, asterisks, and collapse to single line
          description = jsdocMatch[1]
            .split('\n')
            .map(line => line.replace(/^\s*\*?\s*/, '').trim())
            .filter(line => line.length > 0)
            .join(' ')
            .trim();
        }

        // Extract default value
        const defaultMatch = defaultsContent.match(
          new RegExp(`${propName}\\s*:\\s*['"\`]?([^'"\`,}]+)['"\`]?`)
        );
        const defaultValue = defaultMatch ? defaultMatch[1].trim() : undefined;

        // Extract options from union types
        let options: string[] | undefined;
        if (propType.includes("'") && propType.includes("|")) {
          options = propType
            .split("|")
            .map((s) => s.trim().replace(/['"]/g, ""))
            .filter((s) => s.length > 0);
        }

        props.push({
          name: propName,
          type: propType,
          required: !isOptional,
          defaultValue,
          options,
          description,
        });
      }
    }

    return props;
  }

  it("should extract props from defineProps with TypeScript generics", () => {
    const content = `
const props = defineProps<{
  size?: 's' | 'm' | 'l';
  disabled?: boolean;
}>()
`;
    const props = extractProps(content);

    expect(props).toHaveLength(2);
    expect(props[0].name).toBe("size");
    expect(props[0].required).toBe(false);
    expect(props[0].options).toEqual(["s", "m", "l"]);

    expect(props[1].name).toBe("disabled");
    expect(props[1].type).toBe("boolean");
  });

  it("should extract props with withDefaults", () => {
    const content = `
const props = withDefaults(
  defineProps<{
    appearance?: 'standard' | 'accent' | 'danger';
    size?: 's' | 'm' | 'l';
  }>(),
  {
    appearance: 'standard',
    size: 'm',
  }
)
`;
    const props = extractProps(content);

    expect(props).toHaveLength(2);
    expect(props[0].name).toBe("appearance");
    expect(props[0].defaultValue).toBe("standard");
    expect(props[0].options).toEqual(["standard", "accent", "danger"]);

    expect(props[1].name).toBe("size");
    expect(props[1].defaultValue).toBe("m");
  });

  it("should handle boolean and string types", () => {
    const content = `
const props = defineProps<{
  isLoading?: boolean;
  label: string;
  count?: number;
}>()
`;
    const props = extractProps(content);

    expect(props).toHaveLength(3);
    expect(props[0].name).toBe("isLoading");
    expect(props[0].type).toBe("boolean");
    expect(props[0].required).toBe(false);

    expect(props[1].name).toBe("label");
    expect(props[1].type).toBe("string");
    expect(props[1].required).toBe(true);

    expect(props[2].name).toBe("count");
    expect(props[2].type).toBe("number");
  });
});

describe("Vue Parser - extractSlots", () => {
  function extractSlots(content: string) {
    const slots: Array<{ name: string; description?: string }> = [];
    const seenSlots = new Set<string>();

    const slotRegex = /<slot\s*(?:name=["']([^"']+)["'])?[^>]*>/g;
    let match;
    while ((match = slotRegex.exec(content)) !== null) {
      const slotName = match[1] || "default";
      if (!seenSlots.has(slotName)) {
        seenSlots.add(slotName);
        slots.push({ name: slotName });
      }
    }

    return slots;
  }

  it("should extract default slot", () => {
    const content = `<template><slot /></template>`;
    const slots = extractSlots(content);

    expect(slots).toHaveLength(1);
    expect(slots[0].name).toBe("default");
  });

  it("should extract named slots", () => {
    const content = `
<template>
  <slot name="header" />
  <slot />
  <slot name="footer" />
</template>
`;
    const slots = extractSlots(content);

    expect(slots).toHaveLength(3);
    expect(slots.map((s) => s.name)).toContain("header");
    expect(slots.map((s) => s.name)).toContain("default");
    expect(slots.map((s) => s.name)).toContain("footer");
  });

  it("should not duplicate slots", () => {
    const content = `
<template>
  <slot name="icon" />
  <slot name="icon" />
</template>
`;
    const slots = extractSlots(content);

    expect(slots).toHaveLength(1);
    expect(slots[0].name).toBe("icon");
  });
});

describe("Vue Parser - extractEvents", () => {
  function extractEvents(content: string) {
    const events: Array<{ name: string; payload?: string }> = [];
    const seenEvents = new Set<string>();

    // Match emit calls: emit('eventName') or $emit('eventName')
    const emitPatterns = [
      /emit\s*\(\s*['"]([^'"]+)['"]/g,
      /\$emit\s*\(\s*['"]([^'"]+)['"]/g,
    ];

    for (const pattern of emitPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const eventName = match[1];
        if (!seenEvents.has(eventName)) {
          seenEvents.add(eventName);
          events.push({ name: eventName });
        }
      }
    }

    return events;
  }

  it("should extract emit events", () => {
    const content = `
const emit = defineEmits(['update', 'change'])
emit('update', value)
emit('change', newValue)
`;
    const events = extractEvents(content);

    expect(events).toHaveLength(2);
    expect(events.map((e) => e.name)).toContain("update");
    expect(events.map((e) => e.name)).toContain("change");
  });

  it("should extract $emit events from Options API", () => {
    const content = `
methods: {
  handleClick() {
    this.$emit('click', this.value)
  },
  handleChange() {
    this.$emit('input', newValue)
  }
}
`;
    const events = extractEvents(content);

    expect(events).toHaveLength(2);
    expect(events.map((e) => e.name)).toContain("click");
    expect(events.map((e) => e.name)).toContain("input");
  });
});
