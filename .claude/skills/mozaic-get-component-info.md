# Get Component Information

## Description

This skill guides you on using the `mcp__mozaic__get_component_info` tool to retrieve detailed documentation for Mozaic Design System components, including props, slots, events, CSS classes, and usage examples.

## When to Use

Use this skill when users ask questions like:
- "How does the Button component work?"
- "What props does Modal accept?"
- "Show me TextInput properties"
- "How do I use the Accordion component?"
- "What events does Select emit?"
- "Can I customize the Link component?"

## MCP Tool

**Tool Name:** `mcp__mozaic__get_component_info`

**Parameters:**
- `component` (required): Component name (e.g., 'button', 'modal', 'text-input')
- `framework` (optional, default: 'vue'): Framework for code examples ('vue' or 'react')

## Database Context

This tool queries the following database tables:
- **components**: Main component metadata (name, slug, category, description, available frameworks)
- **component_props**: Component properties with types, default values, required flag, and descriptions
- **component_slots**: Vue component slots (for content insertion points)
- **component_events**: Events emitted by the component with payload descriptions
- **component_examples**: Code examples showing component usage patterns
- **component_css_classes**: CSS classes that can be applied to customize the component

The database contains 91 components total (52 Vue, 39 React) organized into categories: form, navigation, feedback, layout, data-display, and action.

## Workflow

1. **Normalize the component name**: Convert to lowercase, remove prefixes like "Mozaic" or "@"
2. **Call the tool** with the component name and desired framework
3. **Present the results** including:
   - Component description and category
   - Available frameworks
   - Props with types, defaults, and whether they're required
   - Slots (Vue only) with descriptions
   - Events with payload information
   - Code examples showing typical usage
   - CSS classes for styling customization

## Examples

### Example 1: Getting Button component info

**User asks:** "What props does the Button component support?"

**Action:**
```
Use mcp__mozaic__get_component_info with:
- component: "button"
- framework: "vue"
```

**What to present:**
- List all props: `theme`, `size`, `disabled`, `variant`, etc.
- Show prop types: `theme: 'primary' | 'secondary' | 'tertiary'`
- Indicate required props and default values
- Show code examples from the database
- Mention available CSS classes for customization

### Example 2: React component details

**User asks:** "How do I use the Modal component in React?"

**Action:**
```
Use mcp__mozaic__get_component_info with:
- component: "modal"
- framework: "react"
```

**What to present:**
- Component description and purpose
- All props with TypeScript types
- Events: `onClose`, `onOpen`, etc.
- React-specific code examples
- Best practices from examples

### Example 3: Form input with slots

**User asks:** "Can I customize the TextInput component with icons?"

**Action:**
```
Use mcp__mozaic__get_component_info with:
- component: "text-input"
- framework: "vue"
```

**What to present:**
- Available slots (e.g., `prefix`, `suffix`)
- Slot descriptions explaining what content can be inserted
- Example showing icon usage in slots
- Props related to customization

## Common Patterns

1. **Component not found**: If the tool returns an error, suggest using `list_components` to find available components
2. **Multiple frameworks**: If unsure which framework, ask the user or check both Vue and React
3. **Related components**: Mention similar components from the same category
4. **Installation**: Direct users to `get_install_info` for package installation details

## Related Skills

- **mozaic-list-components.md**: Use this first to discover available components
- **mozaic-generate-vue-component.md**: Use after getting info to generate ready-to-use Vue code
- **mozaic-generate-react-component.md**: Use after getting info to generate ready-to-use React code
- **mozaic-get-install-info.md**: Use to show installation and import statements
- **mozaic-search-documentation.md**: Use for broader documentation searches beyond component API
