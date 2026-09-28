---
name: mozaic-icons
description: Mozaic icon search and integration for Vue & React. Search icons by name or type, view multiple sizes (16, 24, 32, 48, 64), and generate framework-specific code with proper imports.
compatibility: Requires bash, sqlite3 and jq, plus npx to fetch the Mozaic database (~/.mozaic/mozaic.db) on first use.
allowed-tools: Bash
metadata:
  version: "2.0.0"
---

# Mozaic Icons

An expert assistant for discovering and integrating Mozaic Design System icons. Search through the icon library, preview different sizes, and generate ready-to-use code for Vue or React applications.

## What This Skill Does

1. **Search Icons**: Find icons by keyword or description
2. **Browse by Type**: Explore icons by category (navigation, media, social, payment, etc.)
3. **Filter by Size**: View available sizes (16px, 24px, 32px, 48px, 64px)
4. **Preview Icons**: See icon names, types, and available sizes
5. **Generate Code**: Create framework-specific code (Vue or React) with proper imports
6. **Get SVG**: Access raw SVG markup for custom usage

## Shell Scripts Used

This skill uses shell scripts to query the local Mozaic database:
- `search-icons.sh` - Search icons by name, type, or size (1,473 icons)
- `get-icon.sh` - Get specific icon with SVG and framework code (Vue/React)

Database location: `~/.mozaic/mozaic.db` (override with `MOZAIC_DB_PATH`; installed automatically on first use)

## When to Use This Skill

Use this skill when you:
- Need to find an icon for your UI
- Want to browse available icons by category
- Need icons in specific sizes
- Want to integrate icons in Vue or React
- Need SVG code for custom usage
- Are building navigation, actions, media controls, or social features

## Icon Categories

### Navigation Icons
- Arrows (up, down, left, right, diagonal)
- Chevrons (directions, expand/collapse)
- Menu (hamburger, dots, kebab)
- Close/Exit icons
- Back/Forward navigation

### Media Icons
- Play, Pause, Stop
- Volume controls
- Skip/Rewind/Fast-forward
- Record, Live, Broadcast
- Fullscreen, Picture-in-Picture

### Action Icons
- Edit, Delete, Save
- Add, Remove, Plus, Minus
- Search, Filter, Sort
- Settings, Preferences
- Download, Upload, Share

### Social Icons
- Facebook, Twitter, Instagram
- LinkedIn, YouTube, TikTok
- Pinterest, Snapchat
- WhatsApp, Telegram

### Commerce Icons
- Shopping cart, Bag
- Credit card, Payment
- Wishlist, Favorite
- Shipping, Delivery
- Tag, Price, Discount

### Interface Icons
- User, Profile, Account
- Notification, Bell, Alert
- Calendar, Clock, Time
- Location, Map, Pin
- Lock, Unlock, Security

### Communication Icons
- Email, Message, Chat
- Phone, Call, Video call
- Comment, Reply, Send
- Microphone, Camera

### File Icons
- Document, File, Folder
- Image, Photo, Gallery
- Video, Audio
- PDF, ZIP, Code

## Available Sizes

Mozaic icons come in multiple sizes:
- **16px**: Small icons for tight spaces (inline text, compact UI)
- **24px**: Standard size for most UI elements
- **32px**: Medium size for emphasis
- **48px**: Large icons for features, empty states
- **64px**: Extra large for hero sections, illustrations

## Interactive Workflow

### Step 1: Describe What You Need

When you activate this skill, I'll ask:

**"What icon are you looking for?"**

You can describe:
- Keyword (e.g., "arrow", "cart", "user")
- Action (e.g., "edit button", "delete action")
- Category (e.g., "social media icons", "navigation arrows")
- Specific icon name (e.g., "ArrowUp24")

### Step 2: Search and Filter

I'll use the `search-icons.sh` script with optional filters:

**Filters**:
- By name/keyword
- By type (navigation, media, social, etc.)
- By size (16, 24, 32, 48, 64)

### Step 3: Show Results

Display matching icons with:
- Icon name
- Type/category
- Available sizes
- Brief description

**Example Results**:
```
Found 8 arrow icons:

1. ArrowUp (Navigation)
   Sizes: 16, 24, 32
   Upward pointing arrow

2. ArrowDown (Navigation)
   Sizes: 16, 24, 32
   Downward pointing arrow

3. ArrowLeft (Navigation)
   Sizes: 16, 24, 32
   Left pointing arrow

4. ArrowRight (Navigation)
   Sizes: 16, 24, 32
   Right pointing arrow

5. ArrowArrowBottom (Navigation)
   Sizes: 16, 24
   Download/move down action
```

### Step 4: Select Icon and Framework

You choose:
- Which icon (by number or name)
- Which size (16, 24, 32, 48, 64)
- Which framework (Vue, React, or SVG only)

### Step 5: Generate Code

I'll use the `get-icon.sh` script to provide:
- Import statements
- Component usage
- Props and customization
- Accessibility attributes

## Usage Examples

### Vue 3 Usage

```vue
<script setup>
import { IconArrowRight24 } from '@mozaic-ds/icons/vue';
</script>

<template>
  <button>
    Next
    <IconArrowRight24 />
  </button>
</template>
```

**With Props**:
```vue
<template>
  <IconUser24
    :size="32"
    color="currentColor"
    aria-label="User profile"
  />
</template>
```

### React/TSX Usage

```tsx
import { IconArrowRight24 } from '@mozaic-ds/icons/react';

function NextButton() {
  return (
    <button>
      Next
      <IconArrowRight24 />
    </button>
  );
}
```

**With Props**:
```tsx
<IconUser24
  size={32}
  color="currentColor"
  aria-label="User profile"
/>
```

### Raw SVG Usage

```html
<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
</svg>
```

## More Examples

Worked examples (Common Use Cases) are in [references/EXAMPLES.md](references/EXAMPLES.md). Read it when you need a full pattern or a sample session.

## Icon Naming Convention

Mozaic icons follow this pattern:
```
Icon[Name][Size]
```

Examples:
- `IconArrowUp24` - Arrow up icon, 24px
- `IconUser32` - User icon, 32px
- `IconCart16` - Shopping cart, 16px

## Accessibility Best Practices

### 1. Always Provide Labels

```tsx
// Good: Has aria-label
<button aria-label="Close modal">
  <IconClose24 />
</button>

// Avoid: No label for screen readers
<button>
  <IconClose24 />
</button>
```

### 2. Decorative vs. Meaningful

```tsx
// Decorative (icon next to text)
<button>
  <IconSave24 aria-hidden="true" />
  Save
</button>

// Meaningful (icon-only)
<button aria-label="Save">
  <IconSave24 />
</button>
```

### 3. Use Titles for Tooltips

```tsx
<button title="Delete item" aria-label="Delete">
  <IconDelete24 />
</button>
```

## Customization

### Color

```vue
<!-- Use currentColor to inherit text color -->
<IconUser24 color="currentColor" />

<!-- Or specify a color -->
<IconUser24 color="#007DBC" />
```

### Size Override

```tsx
// Use different size than default
<IconArrowRight24 size={32} />

// Or use CSS
<IconArrowRight24 style={{ width: '2rem', height: '2rem' }} />
```

### Animation

```vue
<template>
  <IconLoading24 class="spin" />
</template>

<style scoped>
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
```

## Installation

```bash
# Install Mozaic icons
pnpm add @mozaic-ds/icons

# For Vue
import { IconName24 } from '@mozaic-ds/icons/vue';

# For React
import { IconName24 } from '@mozaic-ds/icons/react';
```

## Search Tips

### Search by Action
- "add" → Plus, Add, Create icons
- "edit" → Edit, Pencil, Modify icons
- "delete" → Trash, Delete, Remove icons

### Search by Object
- "user" → User, Profile, Account icons
- "cart" → Cart, Bag, Shopping icons
- "message" → Message, Chat, Email icons

### Search by Direction
- "up" → ArrowUp, ChevronUp, etc.
- "down" → ArrowDown, ChevronDown, etc.

### Search by Category
- "social" → Social media icons
- "payment" → Payment method icons
- "navigation" → Navigation icons

## Commands

When this skill is active:

- **"Find [keyword] icon"**: Search for icons
- **"Show [category] icons"**: Browse by category
- **"I need a [size]px icon"**: Filter by size
- **"Generate [framework] code"**: Get framework-specific code
- **"Show me all [type] icons"**: Browse icon type

## Integration with Other Skills

This skill works well with:
- **mozaic-vue-builder**: Add icons to Vue components
- **mozaic-react-builder**: Add icons to React components
- **mozaic-design-tokens**: Use token colors for icons

## Example Session

**User**: "I need a shopping cart icon for a button"

**Skill**:
I'll help you find a shopping cart icon!

[Uses `search-icons.sh cart` script]

Found 3 shopping cart icons:

1. **Cart** (Commerce)
   Sizes: 16, 24, 32
   Standard shopping cart

2. **CartAdd** (Commerce)
   Sizes: 24, 32
   Shopping cart with plus sign

3. **CartRemove** (Commerce)
   Sizes: 24, 32
   Shopping cart with minus sign

Which one do you need? (1-3)

**User**: "1 - Cart at 24px"

**Skill**:
Perfect! Which framework?
- A) Vue 3
- B) React
- C) SVG only

**User**: "B - React"

**Skill**:
[Uses `get-icon.sh Cart24 react` script]

Here's your shopping cart button with icon:

```tsx
import { IconCart24 } from '@mozaic-ds/icons/react';

function AddToCartButton() {
  return (
    <button className="btn btn--primary">
      <IconCart24 />
      Add to Cart
    </button>
  );
}
```

Installation:
```bash
pnpm add @mozaic-ds/icons
```

Would you like me to:
- Show other sizes?
- Generate a different style?
- Add animation?

---

**Let's enhance your UI with beautiful Mozaic icons!**
