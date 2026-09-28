---
name: mozaic-react-builder
description: Interactive React/TSX component generator with Mozaic Design System. Helps discover, configure, and generate production-ready React components with TypeScript support, proper imports, and installation guidance.
compatibility: Requires bash, sqlite3 and jq, plus npx to fetch the Mozaic database (~/.mozaic/mozaic.db) on first use.
allowed-tools: Bash
metadata:
  version: "2.0.0"
---

# Mozaic React Builder

An interactive assistant for building React applications with the Mozaic Design System by ADEO. This skill helps you discover components, understand their props, generate ready-to-use TypeScript/JSX code, and set up installation properly.

## What This Skill Does

1. **Discover Components**: Browse Mozaic React components by category (forms, navigation, feedback, etc.)
2. **Interactive Selection**: Propose component combinations based on your needs
3. **Generate Code**: Create complete React/TSX code with proper imports and TypeScript types
4. **Installation Guidance**: Provide package manager commands and setup instructions
5. **Props Configuration**: Help configure component props with full type safety

## Shell Scripts Used

This skill uses shell scripts to query the local Mozaic database:
- `list-components.sh` - Browse available React components by category
- `get-component.sh` - Get detailed component information (props, events, TypeScript types)
- `generate-component.sh` - Generate React/TSX component code
- `get-install-info.sh` - Get installation commands and imports

Database location: `~/.mozaic/mozaic.db` (override with `MOZAIC_DB_PATH`; installed automatically on first use)

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

Based on your answer, I'll use the `list-components.sh` script to show relevant components.

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

I'll use the `get-component.sh` script to show:
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

I'll use the `generate-component.sh` script to create complete code:

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

I'll use the `get-install-info.sh` script to provide:

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

## More Examples

Worked examples (Common Use Cases, TypeScript Patterns, Troubleshooting, Example Session) are in [references/EXAMPLES.md](references/EXAMPLES.md). Read it when you need a full pattern or a sample session.

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
