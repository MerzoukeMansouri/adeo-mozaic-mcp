---
name: mozaic-vue-builder
description: Interactive Vue 3 component generator with Mozaic Design System. Helps discover, configure, and generate production-ready Vue components with proper imports and installation guidance.
version: 1.0.0
---

# Mozaic Vue Builder

An interactive assistant for building Vue 3 applications with the Mozaic Design System by ADEO. This skill helps you discover components, understand their props, generate ready-to-use code, and set up installation properly.

## ⚠️ Prerequisites

**This skill requires the Mozaic MCP server to be configured.**

Without the MCP server, this skill cannot:
- Access the Mozaic component database
- Retrieve component props, slots, and events
- Generate accurate code examples

**Setup**:
```json
{
  "mcpServers": {
    "mozaic": {
      "command": "npx",
      "args": ["mozaic-mcp-server"]
    }
  }
}
```

See [INSTALLATION.md](https://github.com/merzoukemansouri/adeo-mozaic-mcp/blob/main/INSTALLATION.md) for complete setup.

## What This Skill Does

1. **Discover Components**: Browse Mozaic Vue components by category (forms, navigation, feedback, etc.)
2. **Interactive Selection**: Propose component combinations based on your needs
3. **Generate Code**: Create complete Vue 3 SFC code with proper imports
4. **Installation Guidance**: Provide package manager commands and setup instructions
5. **Props Configuration**: Help configure component props with type safety

## MCP Tools Used

This skill uses the Mozaic MCP server tools:
- `mcp__mozaic__list_components` - Browse available components by category
- `mcp__mozaic__get_component_info` - Get detailed component information (props, slots, events)
- `mcp__mozaic__generate_vue_component` - Generate Vue 3 component code
- `mcp__mozaic__get_install_info` - Get installation commands and imports

## When to Use This Skill

Use this skill when you:
- Need to build Vue 3 UI components with Mozaic
- Want to explore available Mozaic components
- Need help with component props and configuration
- Want installation and import guidance
- Are building forms, navigation, modals, or other UI elements

## Interactive Workflow

### Step 1: Understanding Your Needs

When you activate this skill, I'll ask:

**"What type of component do you need to build?"**

Common options:
- A) Form (inputs, selects, checkboxes, validation)
- B) Navigation (tabs, breadcrumb, pagination)
- C) Modal/Dialog (overlay, confirmation, form modal)
- D) Button/Action (primary, secondary, with icons)
- E) Layout (cards, containers, grids)
- F) Data Display (tables, lists, badges)
- G) Other (describe your needs)

### Step 2: Browse Available Components

Based on your answer, I'll use `mcp__mozaic__list_components` to show relevant components.

**Example**:
```
For forms, Mozaic offers:
- TextInput (text, email, password fields)
- Select (dropdowns with single/multiple selection)
- Checkbox (single or group)
- Radio (radio button groups)
- Toggle (switch control)
- FileUpload (file input with drag-drop)
```

### Step 3: Component Details

I'll use `mcp__mozaic__get_component_info` to show:
- Available props with types and defaults
- Slots for customization
- Events you can listen to
- Code examples

**Example**:
```javascript
// TextInput Props
{
  modelValue: String,           // v-model binding
  label: String,                // Field label
  placeholder: String,          // Placeholder text
  type: 'text' | 'email' | 'password', // Input type
  disabled: Boolean,            // Disable state
  error: String,                // Error message
  required: Boolean,            // Required field
  size: 's' | 'm' | 'l'        // Size variant
}
```

### Step 4: Propose Component Combinations

I'll suggest 2-3 combinations that work well together:

**Example for "Login Form"**:

**Option 1: Simple Login**
```vue
<template>
  <form>
    <MTextInput label="Email" type="email" />
    <MTextInput label="Password" type="password" />
    <MButton theme="primary">Login</MButton>
  </form>
</template>
```

**Option 2: Enhanced Login with Validation**
```vue
<template>
  <form>
    <MTextInput
      v-model="email"
      label="Email"
      type="email"
      :error="errors.email"
      required
    />
    <MTextInput
      v-model="password"
      label="Password"
      type="password"
      :error="errors.password"
      required
    />
    <MCheckbox label="Remember me" />
    <MButton theme="primary" :disabled="!isValid">
      Login
    </MButton>
  </form>
</template>
```

### Step 5: Refinement & Configuration

You can:
- Choose an option: "I like Option 2"
- Customize: "Add a forgot password link"
- Combine: "Use Option 1 but add validation from Option 2"
- Request changes: "Make the button larger"

### Step 6: Generate Final Code

I'll use `mcp__mozaic__generate_vue_component` to create complete code:

```vue
<script setup>
import { ref, computed } from 'vue'
import { MTextInput, MButton, MCheckbox } from '@mozaic-ds/vue-3'

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const errors = ref({})

const isValid = computed(() => {
  return email.value && password.value
})

const handleSubmit = () => {
  // Your submit logic
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <MTextInput
      v-model="email"
      label="Email"
      type="email"
      placeholder="Enter your email"
      :error="errors.email"
      required
    />
    <MTextInput
      v-model="password"
      label="Password"
      type="password"
      placeholder="Enter your password"
      :error="errors.password"
      required
    />
    <MCheckbox v-model="rememberMe" label="Remember me" />
    <MButton
      theme="primary"
      size="l"
      :disabled="!isValid"
    >
      Login
    </MButton>
  </form>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
}
</style>
```

### Step 7: Installation Guidance

I'll use `mcp__mozaic__get_install_info` to provide:

**Package Manager Choice**:
- npm
- yarn
- pnpm (default)

**Installation Commands**:
```bash
# Install Mozaic Vue 3
pnpm add @mozaic-ds/vue-3

# Install peer dependencies (if needed)
pnpm add vue@^3.3.0
```

**Import Setup**:
```javascript
// In your main.js or component
import { MTextInput, MButton, MCheckbox } from '@mozaic-ds/vue-3'
import '@mozaic-ds/vue-3/dist/style.css'
```

**Quick Start**:
```javascript
// Global registration (optional)
import { createApp } from 'vue'
import MozaicVue from '@mozaic-ds/vue-3'

const app = createApp(App)
app.use(MozaicVue)
```

## Common Use Cases

### Use Case 1: Contact Form

**User**: "I need a contact form"

**Workflow**:
1. List form components
2. Propose: Name, Email, Message (textarea), Submit button
3. Show validation patterns
4. Generate code with v-model bindings
5. Provide installation commands

### Use Case 2: Navigation Tabs

**User**: "Build tab navigation for settings"

**Workflow**:
1. Show navigation components
2. Demonstrate MTabs component
3. Configure tabs with icons
4. Generate code with tab content slots
5. Provide styling guidance

### Use Case 3: Modal Dialog

**User**: "Confirmation modal for delete action"

**Workflow**:
1. Show feedback components
2. Demonstrate MModal component
3. Configure: title, message, actions
4. Add danger button styling
5. Generate code with v-model for visibility

### Use Case 4: Data Table

**User**: "Display user list in a table"

**Workflow**:
1. Show data-display components
2. Demonstrate MTable component
3. Configure columns, pagination
4. Add row actions
5. Generate code with data binding

## Component Categories Reference

### Form Components
- **TextInput**: Text, email, password, number inputs
- **Select**: Dropdown with single/multiple selection
- **Checkbox**: Single checkbox or checkbox group
- **Radio**: Radio button groups
- **Toggle**: Switch control
- **FileUpload**: File input with drag-drop support
- **DatePicker**: Date selection
- **Textarea**: Multi-line text input

### Navigation Components
- **Tabs**: Tab navigation with content panels
- **Breadcrumb**: Hierarchical navigation trail
- **Pagination**: Page navigation controls
- **Stepper**: Multi-step progress indicator

### Feedback Components
- **Modal**: Overlay dialog/modal
- **Toast**: Notification messages
- **Alert**: Inline alerts and warnings
- **ProgressBar**: Progress indication
- **Loader**: Loading spinners

### Action Components
- **Button**: Primary, secondary, tertiary buttons
- **IconButton**: Button with icon only
- **Link**: Styled hyperlinks

### Layout Components
- **Card**: Content container with header/footer
- **Accordion**: Collapsible content sections
- **Divider**: Visual separator

### Data Display Components
- **Table**: Data grid with sorting/filtering
- **Badge**: Status indicators
- **Tag**: Labeled items
- **Avatar**: User profile images

## Best Practices

### 1. Component Composition
```vue
<!-- Good: Compose small components -->
<MCard>
  <template #header>
    <h2>User Profile</h2>
  </template>
  <MTextInput label="Name" v-model="name" />
  <MTextInput label="Email" v-model="email" />
  <template #footer>
    <MButton theme="primary">Save</MButton>
  </template>
</MCard>
```

### 2. Use v-model for Two-Way Binding
```vue
<!-- Good: Use v-model -->
<MTextInput v-model="username" label="Username" />

<!-- Avoid: Manual binding -->
<MTextInput :modelValue="username" @update:modelValue="username = $event" />
```

### 3. Validate Props with TypeScript
```vue
<script setup lang="ts">
import type { ComponentProps } from '@mozaic-ds/vue-3'

interface FormData {
  email: string
  password: string
}

const formData = ref<FormData>({
  email: '',
  password: ''
})
</script>
```

### 4. Handle Events Properly
```vue
<MButton
  @click="handleClick"
  @focus="handleFocus"
>
  Submit
</MButton>
```

### 5. Use Slots for Customization
```vue
<MModal v-model="isOpen">
  <template #header>
    Custom Header
  </template>
  <template #default>
    Modal content
  </template>
  <template #footer>
    <MButton @click="isOpen = false">Close</MButton>
  </template>
</MModal>
```

## Troubleshooting

### Issue: Components not rendering

**Solution**: Ensure CSS is imported
```javascript
import '@mozaic-ds/vue-3/dist/style.css'
```

### Issue: TypeScript errors

**Solution**: Install type definitions
```bash
pnpm add -D @types/node
```

### Issue: Props not working

**Solution**: Check prop names and types
```javascript
// Use mcp__mozaic__get_component_info to verify props
```

### Issue: Styling conflicts

**Solution**: Use scoped styles
```vue
<style scoped>
/* Your styles won't leak */
</style>
```

## Commands

When this skill is active:

- **"Show me [category] components"**: Browse components by category
- **"I need a [type]"**: Build specific component type
- **"How do I configure [component]?"**: Get component details
- **"Generate code for [description]"**: Create component code
- **"Install instructions"**: Get setup guidance
- **"Show examples"**: See usage examples
- **"What props does [component] have?"**: List component props

## Integration with Other Skills

This skill works well with:
- **mozaic-design-tokens**: Get color/spacing tokens for styling
- **mozaic-css-utilities**: Add layout utilities (Flexy grid, spacing)
- **mozaic-icons**: Add icons to buttons and inputs

## Example Session

**User**: "I need a registration form"

**Skill**:
I'll help you build a registration form with Mozaic Vue components!

What fields do you need?
- A) Basic (name, email, password)
- B) Extended (+ phone, address, terms)
- C) Custom (tell me what fields)

**User**: "B - Extended"

**Skill**:
Perfect! Here's a registration form with extended fields:

[Uses `mcp__mozaic__list_components` and `mcp__mozaic__get_component_info`]

**Proposed Components**:
1. TextInput (Name)
2. TextInput (Email - type="email")
3. TextInput (Password - type="password")
4. TextInput (Phone - type="tel")
5. Textarea (Address)
6. Checkbox (Terms agreement)
7. Button (Submit - theme="primary")

[Uses `mcp__mozaic__generate_vue_component`]

Here's your complete registration form... [Generated code]

Would you like me to:
- Add validation rules?
- Include password confirmation field?
- Add installation instructions?

**User**: "Add installation instructions"

**Skill**:
[Uses `mcp__mozaic__get_install_info`]

Here's how to install and set up...

---

**Let's build amazing Vue 3 applications with Mozaic Design System!**
