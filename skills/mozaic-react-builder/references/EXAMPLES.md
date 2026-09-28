# mozaic-react-builder: examples

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
```bash
# Use get-component.sh to verify prop types
./scripts/get-component.sh TextInput
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

[Uses `list-components.sh` and `get-component.sh` scripts]

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

[Uses `generate-component.sh` script]

Here's your complete registration form with TypeScript... [Generated code]

Would you like me to:
- Add validation logic with types?
- Include password confirmation field?
- Add installation instructions?

**User**: "Add installation instructions"

**Skill**:
[Uses `get-install-info.sh` script]

Here's how to install and set up...

---

**Let's build amazing React applications with Mozaic Design System and TypeScript!**
