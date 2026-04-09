# Mozaic Freemarker Builder

Interactive Freemarker macro generator for Mozaic Design System. Help users discover, configure, and generate production-ready Freemarker template code with proper imports and configuration.

## Activation

This skill activates when users:
- Ask about Freemarker components or macros
- Want to generate Freemarker template code
- Need help with Mozaic Freemarker implementation
- Mention ".ftl" files or Freemarker templates

## Workflow

### 1. Discovery Phase
Ask user what they want to build or which component they need:
```bash
# List all Freemarker components
./scripts/list-components.sh all

# List by category
./scripts/list-components.sh form
./scripts/list-components.sh navigation
```

### 2. Component Selection
Let user browse and select:
```bash
# Search for specific component
./scripts/search-components.sh "button"

# Get detailed component info
./scripts/get-component.sh "button"
```

### 3. Configuration
Help user configure the component:
- Show available configuration options (props)
- Explain required vs optional parameters
- Provide examples of common configurations

### 4. Code Generation
Generate ready-to-use Freemarker code:
```bash
# Generate basic code
./scripts/generate-component.sh "button"

# Generate with configuration
./scripts/generate-component.sh "button" '{"color": "primary", "size": "m"}'

# Generate with content
./scripts/generate-component.sh "button" '{"color": "accent"}' "Click Me"
```

## Output Format

Always provide:
1. **Import statement** - Freemarker import directive
2. **Configuration object** - <#assign config = {...}>
3. **Macro invocation** - <@macroname.macroname config=config>...</@>
4. **Installation info** - Maven dependency

Example output:
```ftl
<#import "mozaic/button.ftl" as button>

<#assign configButton = {
    "color": "primary",
    "size": "m",
    "outlined": false
}>

<@button.button config=configButton>
    Click Me
</@button.button>
```

## Component Categories

- **action**: Buttons, links, icon buttons
- **form**: Text inputs, checkboxes, radio buttons, fields, file uploaders
- **feedback**: Notifications, messages, badges, flags, loaders, progress bars, toasters, tooltips
- **navigation**: Breadcrumbs, tabs, pagination, steppers, menus
- **layout**: Containers, dividers, modals, drawers, accordions, popovers
- **data-display**: Cards, tiles, images, avatars, logos, carousels, callouts, tags, ratings

## Best Practices

1. **Always import macros** at the top of .ftl files
2. **Define configuration separately** using <#assign>
3. **Use descriptive variable names** (e.g., configButton, configModal)
4. **Set locale** with <#global locale="fr_FR"/> for i18n
5. **Nested content** goes between opening and closing macro tags

## Installation

Maven dependency:
```xml
<dependency>
    <groupId>com.adeo.mozaic</groupId>
    <artifactId>mozaic-freemarker</artifactId>
    <version>LATEST_VERSION</version>
</dependency>
```

## Documentation

Repository: https://github.com/adeo/mozaic-freemarker
Design System: https://mozaic.adeo.cloud/

## Example Interaction

**User**: "I need a button for my Freemarker template"

**Assistant**: "I'll help you create a button with Mozaic Freemarker. Let me show you the available options..."

*Runs ./scripts/get-component.sh "button"*

"Here are the button configuration options:
- color: standard, accent, danger, ghost, inverse
- size: s, m (default), l
- outlined: boolean for outlined style
- loading: boolean for loading state

What style would you like?"

**User**: "Primary colored, medium size"

**Assistant**: *Generates code*

"Here's your Freemarker button code:
```ftl
<#import "mozaic/button.ftl" as button>

<#assign configButton = {
    "color": "primary",
    "size": "m"
}>

<@button.button config=configButton>
    Click Me
</@button.button>
```

This will render a primary-colored, medium-sized button. You can customize the text between the tags."
