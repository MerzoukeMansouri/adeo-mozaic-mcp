---
name: mozaic-react-builder
description: Interactive React/TSX component generator with Mozaic Design System. Helps discover, configure, and generate production-ready React components with TypeScript support, proper imports, and installation guidance.
version: 1.0.0
---

# Mozaic React Builder

An interactive assistant for building React applications with the Mozaic Design System by ADEO. This skill helps you discover components, understand their props, generate ready-to-use TypeScript/JSX code, and set up installation properly.

## ⚠️ Prerequisites

**This skill requires the Mozaic MCP server to be configured.**

Without the MCP server, this skill cannot:
- Access the Mozaic component database
- Retrieve component props, events, and TypeScript types
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

1. **Discover Components**: Browse Mozaic React components by category (forms, navigation, feedback, etc.)
2. **Interactive Selection**: Propose component combinations based on your needs
3. **Generate Code**: Create complete React/TSX code with proper imports and TypeScript types
4. **Installation Guidance**: Provide package manager commands and setup instructions
5. **Props Configuration**: Help configure component props with full type safety

## MCP Tools Used

This skill uses the Mozaic MCP server tools:
- `mcp__mozaic__list_components` - Browse available components by category
- `mcp__mozaic__get_component_info` - Get detailed component information (props, events, types)
- `mcp__mozaic__generate_react_component` - Generate React/TSX component code
- `mcp__mozaic__get_install_info` - Get installation commands and imports

## When to Use This Skill

Use this skill when you:
- Need to build React UI components with Mozaic
- Want to explore available Mozaic components
- Need help with component props and TypeScript types
- Want installation and import guidance
- Are building forms, navigation, modals, or other UI elements
- Need TypeScript-ready React code

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
- Available props with TypeScript types and defaults
- Events and callbacks
- Component examples
- TypeScript interfaces

**Example**:
```typescript
// TextInput Props Interface
interface TextInputProps {
  value: string;                    // Controlled value
  onChange: (value: string) => void; // Change handler
  label?: string;                   // Field label
  placeholder?: string;             // Placeholder text
  type?: 'text' | 'email' | 'password' | 'number'; // Input type
  disabled?: boolean;               // Disable state
  error?: string;                   // Error message
  required?: boolean;               // Required field
  size?: 's' | 'm' | 'l';          // Size variant
}
```

### Step 4: Propose Component Combinations

I'll suggest 2-3 combinations that work well together:

**Example for "Login Form"**:

**Option 1: Simple Login**
```tsx
import { TextInput, Button } from '@mozaic-ds/react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form>
      <TextInput
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
      />
      <TextInput
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
      />
      <Button theme="primary">Login</Button>
    </form>
  );
}
```

**Option 2: Enhanced Login with Validation**
```tsx
import { useState } from 'react';
import { TextInput, Button, Checkbox } from '@mozaic-ds/react';

interface FormErrors {
  email?: string;
  password?: string;
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const isValid = email && password;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Your submit logic
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        error={errors.email}
        required
      />
      <TextInput
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        error={errors.password}
        required
      />
      <Checkbox
        checked={rememberMe}
        onChange={setRememberMe}
        label="Remember me"
      />
      <Button
        theme="primary"
        disabled={!isValid}
      >
        Login
      </Button>
    </form>
  );
}
```

### Step 5: Refinement & Configuration

You can:
- Choose an option: "I like Option 2"
- Customize: "Add a forgot password link"
- Combine: "Use Option 1 but add TypeScript from Option 2"
- Request changes: "Make the button larger"
- Ask for TypeScript types: "Show me the full type definitions"

### Step 6: Generate Final Code

I'll use `mcp__mozaic__generate_react_component` to create complete code:

```tsx
import { useState, FormEvent } from 'react';
import { TextInput, Button, Checkbox } from '@mozaic-ds/react';
import '@mozaic-ds/react/dist/styles.css';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export function LoginForm() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const isValid = formData.email && formData.password;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Your submit logic
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <TextInput
        label="Email"
        type="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={(value) => setFormData({ ...formData, email: value })}
        error={errors.email}
        required
      />
      <TextInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={(value) => setFormData({ ...formData, password: value })}
        error={errors.password}
        required
      />
      <Checkbox
        checked={formData.rememberMe}
        onChange={(checked) => setFormData({ ...formData, rememberMe: checked })}
        label="Remember me"
      />
      <Button
        theme="primary"
        size="l"
        disabled={!isValid}
        type="submit"
      >
        Login
      </Button>
    </form>
  );
}
```

```css
/* styles.css */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
}
```

### Step 7: Installation Guidance

I'll use `mcp__mozaic__get_install_info` to provide:

**Package Manager Choice**:
- npm
- yarn
- pnpm (default)

**Installation Commands**:
```bash
# Install Mozaic React
pnpm add @mozaic-ds/react

# Install peer dependencies
pnpm add react@^18.0.0 react-dom@^18.0.0

# Install TypeScript (if not already installed)
pnpm add -D typescript @types/react @types/react-dom
```

**Import Setup**:
```tsx
// In your component or App.tsx
import { TextInput, Button } from '@mozaic-ds/react';
import '@mozaic-ds/react/dist/styles.css';
```

**TypeScript Configuration** (tsconfig.json):
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "strict": true
  }
}
```

## Common Use Cases

### Use Case 1: Contact Form

**User**: "I need a contact form with TypeScript"

**Workflow**:
1. List form components
2. Propose: Name, Email, Message (textarea), Submit button
3. Show validation patterns with TypeScript
4. Generate code with proper types
5. Provide installation commands

### Use Case 2: Navigation Tabs

**User**: "Build tab navigation for dashboard"

**Workflow**:
1. Show navigation components
2. Demonstrate Tabs component
3. Configure tabs with icons and TypeScript
4. Generate code with tab content
5. Provide styling guidance

### Use Case 3: Modal Dialog

**User**: "Confirmation modal for delete action"

**Workflow**:
1. Show feedback components
2. Demonstrate Modal component
3. Configure: title, message, actions with TypeScript
4. Add danger button styling
5. Generate code with controlled visibility

### Use Case 4: Data Table

**User**: "Display user list in a table with TypeScript"

**Workflow**:
1. Show data-display components
2. Demonstrate Table component
3. Configure columns with proper types
4. Add pagination and row actions
5. Generate code with typed data

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

### 1. Use TypeScript for Type Safety
```tsx
// Good: Define interfaces for your data
interface User {
  id: number;
  name: string;
  email: string;
}

interface UserFormProps {
  user?: User;
  onSubmit: (user: User) => void;
}

function UserForm({ user, onSubmit }: UserFormProps) {
  // Component implementation
}
```

### 2. Controlled Components
```tsx
// Good: Use controlled components
const [value, setValue] = useState('');

<TextInput
  value={value}
  onChange={setValue}
  label="Username"
/>

// Avoid: Uncontrolled components
<TextInput defaultValue="username" />
```

### 3. Proper Event Handling
```tsx
// Good: Type your event handlers
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  // Your logic
};

<Button onClick={handleClick}>Submit</Button>
```

### 4. Component Composition
```tsx
// Good: Compose components
function UserCard({ user }: { user: User }) {
  return (
    <Card>
      <Card.Header>
        <h2>{user.name}</h2>
      </Card.Header>
      <Card.Body>
        <TextInput value={user.email} readOnly />
      </Card.Body>
      <Card.Footer>
        <Button theme="primary">Edit</Button>
      </Card.Footer>
    </Card>
  );
}
```

### 5. Use React Hooks Properly
```tsx
// Good: Use hooks for state and effects
import { useState, useEffect, useCallback } from 'react';

function FormComponent() {
  const [data, setData] = useState<FormData>({});

  const handleSubmit = useCallback(() => {
    // Submit logic
  }, [data]);

  useEffect(() => {
    // Side effects
  }, []);
}
```

### 6. Props Destructuring with Types
```tsx
// Good: Destructure props with types
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function CustomButton({ label, onClick, disabled = false }: ButtonProps) {
  return <Button onClick={onClick} disabled={disabled}>{label}</Button>;
}
```

## TypeScript Patterns

### Generic Components
```tsx
interface SelectOption<T> {
  value: T;
  label: string;
}

interface TypedSelectProps<T> {
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

function TypedSelect<T>({ options, value, onChange }: TypedSelectProps<T>) {
  // Implementation
}
```

### Form State Management
```tsx
type FormState<T> = {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
};

function useFormState<T>(initialValues: T) {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {}
  });

  // Form logic
  return state;
}
```

## Troubleshooting

### Issue: TypeScript errors with props

**Solution**: Check prop types
```tsx
// Use mcp__mozaic__get_component_info to verify prop types
// Ensure you're using the correct interface
```

### Issue: Styles not applying

**Solution**: Import CSS
```tsx
import '@mozaic-ds/react/dist/styles.css';
```

### Issue: Components not rendering

**Solution**: Check React version compatibility
```bash
pnpm list react react-dom
# Should be ^18.0.0 or higher
```

### Issue: Event handlers not working

**Solution**: Use correct callback signatures
```tsx
// Check component docs for callback types
onChange={(value: string) => handleChange(value)}
```

## Commands

When this skill is active:

- **"Show me [category] components"**: Browse components by category
- **"I need a [type]"**: Build specific component type
- **"How do I configure [component]?"**: Get component details with TypeScript
- **"Generate code for [description]"**: Create TypeScript component code
- **"Install instructions"**: Get setup guidance
- **"Show TypeScript examples"**: See typed usage examples
- **"What are the types for [component]?"**: Get TypeScript interfaces

## Integration with Other Skills

This skill works well with:
- **mozaic-design-tokens**: Get color/spacing tokens for styling
- **mozaic-css-utilities**: Add layout utilities (Flexy grid, spacing)
- **mozaic-icons**: Add icons to buttons and components

## Example Session

**User**: "I need a registration form with TypeScript"

**Skill**:
I'll help you build a registration form with Mozaic React components and full TypeScript support!

What fields do you need?
- A) Basic (name, email, password)
- B) Extended (+ phone, address, terms)
- C) Custom (tell me what fields)

**User**: "B - Extended"

**Skill**:
Perfect! Here's a registration form with extended fields and TypeScript:

[Uses `mcp__mozaic__list_components` and `mcp__mozaic__get_component_info`]

**Proposed Components**:
1. TextInput (Name)
2. TextInput (Email - type="email")
3. TextInput (Password - type="password")
4. TextInput (Phone - type="tel")
5. Textarea (Address)
6. Checkbox (Terms agreement)
7. Button (Submit - theme="primary")

**TypeScript Interfaces**:
```typescript
interface RegistrationData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  termsAccepted: boolean;
}
```

[Uses `mcp__mozaic__generate_react_component`]

Here's your complete registration form with TypeScript... [Generated code]

Would you like me to:
- Add validation logic with types?
- Include password confirmation field?
- Add installation instructions?

**User**: "Add installation instructions"

**Skill**:
[Uses `mcp__mozaic__get_install_info`]

Here's how to install and set up...

---

**Let's build amazing React applications with Mozaic Design System and TypeScript!**
