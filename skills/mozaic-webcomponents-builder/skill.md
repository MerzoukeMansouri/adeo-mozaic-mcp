---
name: mozaic-webcomponents-builder
description: Interactive Web Components generator with Mozaic Design System. Helps discover, configure, and generate production-ready native web components with proper imports and usage patterns.
version: 1.0.0
allowed-tools:
  - Bash
---

# Mozaic Web Components Builder

An interactive assistant for building framework-agnostic applications with Mozaic Design System Web Components by ADEO. This skill helps you discover components, understand their attributes and events, generate ready-to-use HTML/JavaScript code, and set up installation properly.

## What This Skill Does

1. **Discover Web Components**: Browse Mozaic web components by category (forms, navigation, feedback, etc.)
2. **Interactive Selection**: Propose component combinations based on your needs
3. **Generate Code**: Create complete HTML with JavaScript imports and proper attribute usage
4. **Installation Guidance**: Provide npm/yarn commands and import strategies (module vs script tag)
5. **Attributes & Events**: Help configure component attributes and set up event listeners
6. **Slots & CSS Properties**: Guide on using slots for content projection and CSS custom properties for theming

## Shell Scripts Used

This skill uses shell scripts to query the local Mozaic database:
- `list-components.sh` - Browse available web components by category
- `get-component.sh` - Get detailed component information (attributes, slots, events, CSS properties)
- `search-components.sh` - Search components by name or description
- `generate-component.sh` - Generate web component usage code

Database location: `~/.claude/mozaic.db`

## When to Use This Skill

Use this skill when you:
- Need framework-agnostic UI components (vanilla JS, server-rendered apps, micro-frontends)
- Want to build with native Web Components (Custom Elements v1)
- Need components that work across frameworks (React, Vue, Angular, Svelte)
- Are building progressive enhancement layers
- Want to explore available Mozaic web components
- Need help with component attributes, events, and slots
- Want installation and import guidance for web components

## Interactive Workflow

### Step 1: Understanding Your Needs

When you activate this skill, I'll ask:

**"What type of web component do you need to build?"**

Common options:
- A) Form (inputs, selects, checkboxes, validation)
- B) Navigation (tabs, breadcrumb, pagination, menu)
- C) Modal/Dialog (overlay, confirmation, alert)
- D) Button/Action (primary, secondary, with icons)
- E) Layout (cards, containers, dividers)
- F) Data Display (tables, lists, badges, tags)
- G) Feedback (notifications, loaders, progress bars)
- H) Other (describe your needs)

### Step 2: Browse Available Components

Based on your answer, I'll use the `list-components.sh` script to show relevant web components.

**Example**:
```
For forms, Mozaic offers these web components:
- mozaic-input (text, email, password fields)
- mozaic-select (dropdowns with single/multiple selection)
- mozaic-checkbox (checkbox with label)
- mozaic-radio (radio button)
- mozaic-toggle (switch control)
- mozaic-textarea (multi-line text input)
```

### Step 3: Component Details

I'll use the `get-component.sh` script to show:
- Available attributes (HTML attributes and properties)
- Slots for content projection
- Custom events you can listen to
- CSS custom properties for theming
- Usage examples

**Example**:
```html
<!-- mozaic-button Attributes -->
<mozaic-button
  theme="primary"        <!-- Theme: primary, secondary, tertiary -->
  size="m"               <!-- Size: s, m, l -->
  disabled="false"       <!-- Disabled state -->
  icon-left="arrow"      <!-- Icon on left -->
  full-width="false"     <!-- Full width button -->
>
  Click me
</mozaic-button>

<!-- Events -->
button.addEventListener('mozaic-click', (e) => {
  console.log('Button clicked!', e.detail);
});

<!-- CSS Custom Properties -->
:root {
  --mozaic-button-bg: #007bff;
  --mozaic-button-text: #fff;
  --mozaic-button-padding: 12px 24px;
}
```

### Step 4: Propose Component Combinations

I'll suggest 2-3 combinations that work well together:

**Example for "Login Form"**:

**Option 1: Simple Login Form**
```html
<!-- Import components -->
<script type="module">
  import '@adeo/mozaic-web-components/input.js';
  import '@adeo/mozaic-web-components/button.js';
</script>

<!-- Usage -->
<form id="login-form">
  <mozaic-input
    label="Email"
    type="email"
    name="email"
    required="true"
  ></mozaic-input>

  <mozaic-input
    label="Password"
    type="password"
    name="password"
    required="true"
  ></mozaic-input>

  <mozaic-button theme="primary" type="submit">
    Login
  </mozaic-button>
</form>
```

**Option 2: Enhanced Login with Validation & Events**
```html
<!-- Import components -->
<script type="module">
  import '@adeo/mozaic-web-components/input.js';
  import '@adeo/mozaic-web-components/button.js';
  import '@adeo/mozaic-web-components/checkbox.js';
</script>

<!-- Usage -->
<form id="login-form">
  <mozaic-input
    id="email-input"
    label="Email"
    type="email"
    name="email"
    required="true"
    error-message=""
  ></mozaic-input>

  <mozaic-input
    id="password-input"
    label="Password"
    type="password"
    name="password"
    required="true"
    error-message=""
  ></mozaic-input>

  <mozaic-checkbox
    name="remember"
    label="Remember me"
  ></mozaic-checkbox>

  <mozaic-button id="login-btn" theme="primary" type="submit">
    Login
  </mozaic-button>
</form>

<script>
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');
  const loginBtn = document.getElementById('login-btn');

  // Listen to input changes
  emailInput.addEventListener('mozaic-change', (e) => {
    validateEmail(e.detail.value);
  });

  passwordInput.addEventListener('mozaic-change', (e) => {
    validatePassword(e.detail.value);
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginBtn.setAttribute('loading', 'true');

    // Perform login
    try {
      await login(emailInput.value, passwordInput.value);
    } finally {
      loginBtn.setAttribute('loading', 'false');
    }
  });

  function validateEmail(email) {
    if (!email.includes('@')) {
      emailInput.setAttribute('error-message', 'Invalid email format');
      return false;
    }
    emailInput.removeAttribute('error-message');
    return true;
  }

  function validatePassword(password) {
    if (password.length < 8) {
      passwordInput.setAttribute('error-message', 'Password must be at least 8 characters');
      return false;
    }
    passwordInput.removeAttribute('error-message');
    return true;
  }
</script>
```

**Option 3: Server-Side Rendered with Progressive Enhancement**
```html
<!-- SSR-friendly - works without JavaScript, enhanced with JS -->
<form id="login-form" action="/login" method="POST">
  <div class="form-field">
    <label for="email">Email</label>
    <input type="email" name="email" id="email" required>
  </div>

  <div class="form-field">
    <label for="password">Password</label>
    <input type="password" name="password" id="password" required>
  </div>

  <button type="submit">Login</button>
</form>

<!-- Progressive enhancement with web components -->
<script type="module">
  import '@adeo/mozaic-web-components/input.js';
  import '@adeo/mozaic-web-components/button.js';

  // Enhance form when components are loaded
  customElements.whenDefined('mozaic-input').then(() => {
    enhanceForm();
  });

  function enhanceForm() {
    const form = document.getElementById('login-form');
    // Replace native inputs with web components
    // Web components will read existing values
  }
</script>
```

### Step 5: Refinement & Configuration

You can:
- Choose an option: "I like Option 2"
- Customize: "Add a forgot password link"
- Combine: "Use Option 1 but add event handling from Option 2"
- Request changes: "Make the button full width"
- Ask about features: "How do I add an icon to the button?"

### Step 6: Generate Final Code

I'll use the `generate-component.sh` script to create complete code with:
- Import statements (ES modules or script tags)
- Component usage with proper attributes
- Event listener setup
- CSS custom property theming
- Accessibility attributes

## Common Use Cases

### 1. Creating a Contact Form

```markdown
User: "I need a contact form with name, email, and message fields"