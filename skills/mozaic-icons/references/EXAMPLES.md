# mozaic-icons: examples

## Common Use Cases

### Use Case 1: Button with Icon

**User**: "I need a delete button icon"

**Workflow**:
1. Search for "delete" or "trash"
2. Show Delete, Trash, Remove icons
3. User selects size and framework
4. Generate button code

**Vue Example**:
```vue
<template>
  <button class="btn btn--danger">
    <IconDelete24 />
    Delete
  </button>
</template>
```

**React Example**:
```tsx
<button className="btn btn--danger">
  <IconDelete24 />
  Delete
</button>
```

### Use Case 2: Navigation Icons

**User**: "Need icons for navigation menu"

**Workflow**:
1. Browse navigation category
2. Show Menu, Close, Arrow icons
3. Generate menu toggle code

**Vue Example**:
```vue
<script setup>
import { ref } from 'vue';
import { IconMenu24, IconClose24 } from '@mozaic-ds/icons/vue';

const isOpen = ref(false);
</script>

<template>
  <button @click="isOpen = !isOpen">
    <IconMenu24 v-if="!isOpen" />
    <IconClose24 v-else />
  </button>
</template>
```

### Use Case 3: Social Media Icons

**User**: "Add social media links"

**Workflow**:
1. Search for social icons
2. Show Facebook, Twitter, Instagram, LinkedIn
3. Generate social links

**React Example**:
```tsx
import {
  IconFacebook24,
  IconTwitter24,
  IconInstagram24,
  IconLinkedIn24
} from '@mozaic-ds/icons/react';

function SocialLinks() {
  return (
    <div className="social-links">
      <a href="https://facebook.com" aria-label="Facebook">
        <IconFacebook24 />
      </a>
      <a href="https://twitter.com" aria-label="Twitter">
        <IconTwitter24 />
      </a>
      <a href="https://instagram.com" aria-label="Instagram">
        <IconInstagram24 />
      </a>
      <a href="https://linkedin.com" aria-label="LinkedIn">
        <IconLinkedIn24 />
      </a>
    </div>
  );
}
```

### Use Case 4: Form Input Icons

**User**: "Icons for search and password inputs"

**Workflow**:
1. Search for "search" and "eye"
2. Show Search, Eye, EyeOff icons
3. Generate input with icon

**Vue Example**:
```vue
<template>
  <div class="input-group">
    <IconSearch24 class="input-icon" />
    <input type="text" placeholder="Search..." />
  </div>

  <div class="input-group">
    <input :type="showPassword ? 'text' : 'password'" />
    <button @click="showPassword = !showPassword" class="input-icon-btn">
      <IconEye24 v-if="!showPassword" />
      <IconEyeOff24 v-else />
    </button>
  </div>
</template>
```

### Use Case 5: Status Indicators

**User**: "Need success, error, warning icons"

**Workflow**:
1. Search for "check", "error", "warning"
2. Show CheckCircle, ErrorCircle, Warning icons
3. Generate status messages

**React Example**:
```tsx
import {
  IconCheckCircle24,
  IconErrorCircle24,
  IconWarning24
} from '@mozaic-ds/icons/react';

function StatusMessage({ type, message }: { type: string; message: string }) {
  const icons = {
    success: <IconCheckCircle24 color="green" />,
    error: <IconErrorCircle24 color="red" />,
    warning: <IconWarning24 color="orange" />
  };

  return (
    <div className={`alert alert--${type}`}>
      {icons[type]}
      <span>{message}</span>
    </div>
  );
}
```

### Use Case 6: Icon-Only Button

**User**: "Settings button with just an icon"

**Workflow**:
1. Search for "settings" or "gear"
2. Select size
3. Generate accessible icon button

**Vue Example**:
```vue
<template>
  <button
    class="btn-icon"
    aria-label="Settings"
    title="Settings"
  >
    <IconSettings24 />
  </button>
</template>

<style scoped>
.btn-icon {
  padding: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
}
</style>
```
