# List Components

## Description

This skill guides you on using the `mcp__mozaic__list_components` tool to discover available Mozaic Design System components, optionally filtered by category.

## When to Use

Use this skill when users ask questions like:
- "What components are available in Mozaic?"
- "Show me all form components"
- "List navigation components"
- "What feedback components exist?"
- "Which components can I use for layout?"
- "Show all available Mozaic components"

## MCP Tool

**Tool Name:** `mcp__mozaic__list_components`

**Parameters:**
- `category` (optional, default: 'all'): Filter by category
  - `form`: Input components (TextInput, Select, Checkbox, Radio, etc.)
  - `navigation`: Navigation components (Tabs, Breadcrumb, Pagination, etc.)
  - `feedback`: User feedback components (Modal, Toast, Alert, etc.)
  - `layout`: Layout components (Container, Grid, etc.)
  - `data-display`: Data display components (Table, Card, Badge, etc.)
  - `action`: Action components (Button, Link, etc.)
  - `all`: Return all components

## Database Context

This tool queries the **components** table which contains:
- Component metadata for 91 total components (52 Vue, 39 React)
- Component name, slug, category, and description
- Available frameworks (stored as JSON array)

Results are sorted alphabetically by component name for easy browsing.

## Workflow

1. **Determine the category**: If user specifies a type (e.g., "form", "navigation"), use that category; otherwise use 'all'
2. **Call the tool** with the appropriate category filter
3. **Present the results** as:
   - Grouped by category if showing all
   - Simple list if showing single category
   - Include component descriptions to help users understand purpose
   - Mention available frameworks (Vue/React)

## Examples

### Example 1: List all components

**User asks:** "What components does Mozaic provide?"

**Action:**
```
Use mcp__mozaic__list_components with:
- category: "all"
```

**What to present:**
- Group components by category
- Show component names with brief descriptions
- Format as organized list: "Form Components", "Navigation Components", etc.
- Mention total count (e.g., "Found 91 components across 6 categories")

### Example 2: List form components

**User asks:** "Show me form input components"

**Action:**
```
Use mcp__mozaic__list_components with:
- category: "form"
```

**What to present:**
- List all form-related components: Button, Checkbox, Radio, Select, TextInput, Toggle, etc.
- Include descriptions: "TextInput - Single-line text input field"
- Mention which are available in Vue vs React if relevant
- Suggest using `get_component_info` to learn more about specific components

### Example 3: Navigation components

**User asks:** "What navigation components are available?"

**Action:**
```
Use mcp__mozaic__list_components with:
- category: "navigation"
```

**What to present:**
- List navigation components: Tabs, Breadcrumb, Pagination, Stepper, etc.
- Brief description of each
- Suggest related components from other categories if applicable

## Common Patterns

1. **Broad discovery**: Start with `category: "all"` to give users an overview
2. **Narrowing down**: If user mentions a specific domain (forms, navigation), use category filter
3. **Next steps**: After listing, suggest:
   - Using `get_component_info` for detailed documentation
   - Using `generate_vue_component` or `generate_react_component` for code
4. **Component not found**: If user asks about a component not in results, suggest:
   - Searching documentation with `search_documentation`
   - Checking if it's a CSS utility with `list_css_utilities`

## Related Skills

- **mozaic-get-component-info.md**: Use after listing to get detailed info on specific components
- **mozaic-generate-vue-component.md**: Use to generate Vue code for a component
- **mozaic-generate-react-component.md**: Use to generate React code for a component
- **mozaic-list-css-utilities.md**: If looking for layout/spacing utilities instead of components
- **mozaic-search-documentation.md**: For broader searches beyond component names
