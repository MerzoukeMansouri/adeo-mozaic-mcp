# mozaic-css-utilities: examples

## Common Layout Patterns

### Pattern 1: Sidebar Layout

```html
<div class="container">
  <div class="flexy flexy--gutter">
    <!-- Sidebar: full width on mobile, 1/3 on desktop -->
    <aside class="flexy__col flexy__col--12 flexy__col--4@l">
      <div class="p-m">Sidebar</div>
    </aside>

    <!-- Main: full width on mobile, 2/3 on desktop -->
    <main class="flexy__col flexy__col--12 flexy__col--8@l">
      <div class="p-m">Main content</div>
    </main>
  </div>
</div>
```

### Pattern 2: Card Grid

```html
<div class="container">
  <div class="flexy flexy--gutter">
    <!-- 1 column mobile, 2 columns tablet, 3 columns desktop -->
    <div class="flexy__col flexy__col--12 flexy__col--6@m flexy__col--4@l">
      <div class="card p-m mb-m">Card 1</div>
    </div>
    <div class="flexy__col flexy__col--12 flexy__col--6@m flexy__col--4@l">
      <div class="card p-m mb-m">Card 2</div>
    </div>
    <div class="flexy__col flexy__col--12 flexy__col--6@m flexy__col--4@l">
      <div class="card p-m mb-m">Card 3</div>
    </div>
  </div>
</div>
```

### Pattern 3: Hero Section

```html
<section class="hero py-xl">
  <div class="container">
    <div class="flexy flexy--align-center flexy--justify-center">
      <div class="flexy__col flexy__col--12 flexy__col--8@m flexy__col--6@l">
        <h1 class="mb-m">Hero Title</h1>
        <p class="mb-l">Hero description text</p>
        <button class="btn">Call to Action</button>
      </div>
    </div>
  </div>
</section>
```

### Pattern 4: Feature Grid

```html
<div class="container py-xl">
  <div class="flexy flexy--gutter-l">
    <!-- 1 col mobile, 2 col tablet, 4 col desktop -->
    <div class="flexy__col flexy__col--12 flexy__col--6@m flexy__col--3@l">
      <div class="text-center p-m">
        <div class="ratio ratio--1x1 mb-m">
          <img src="icon1.svg" alt="Feature 1">
        </div>
        <h3>Feature 1</h3>
      </div>
    </div>
    <!-- Repeat for more features -->
  </div>
</div>
```

### Pattern 5: Form Layout

```html
<div class="container">
  <div class="flexy flexy--gutter">
    <div class="flexy__col flexy__col--12 flexy__col--6@m">
      <div class="mb-m">
        <label>First Name</label>
        <input type="text" class="px-s py-s">
      </div>
    </div>
    <div class="flexy__col flexy__col--12 flexy__col--6@m">
      <div class="mb-m">
        <label>Last Name</label>
        <input type="text" class="px-s py-s">
      </div>
    </div>
    <div class="flexy__col flexy__col--12">
      <div class="mb-m">
        <label>Email</label>
        <input type="email" class="px-s py-s">
      </div>
    </div>
  </div>
</div>
```

## Example Session

**User**: "I need a 3-column product grid"

**Skill**:
I'll help you build a responsive 3-column grid with Flexy!

Do you want:
- A) Equal columns (33.33% each)
- B) Responsive (1 col mobile, 2 tablet, 3 desktop)
- C) With gutters between items

**User**: "B - Responsive with gutters"

**Skill**:
Perfect! Here's your responsive product grid:

[Uses `get-utility.sh flexy` script]

```html
<div class="container">
  <div class="flexy flexy--gutter">
    <div class="flexy__col flexy__col--12 flexy__col--6@m flexy__col--4@l">
      <div class="card p-m">Product 1</div>
    </div>
    <div class="flexy__col flexy__col--12 flexy__col--6@m flexy__col--4@l">
      <div class="card p-m">Product 2</div>
    </div>
    <div class="flexy__col flexy__col--12 flexy__col--6@m flexy__col--4@l">
      <div class="card p-m">Product 3</div>
    </div>
  </div>
</div>
```

This creates:
- Mobile: 1 column (stacked)
- Tablet (≥768px): 2 columns
- Desktop (≥1024px): 3 columns
- With 16px gutters between items

Would you like me to:
- Add more products?
- Adjust gutter size?
- Add card styling?

---

**Let's build beautiful layouts with Mozaic CSS utilities!**
