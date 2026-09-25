---
name: mozaic-style-guide
description: Mozaic composed-pattern catalog — real UI screens/layouts (master-detail, data-table, search-filter, modal-confirm, etc.) captured from live ADEO apps, each with a screenshot and description. Framework-agnostic reference to check before building a screen, so it comes out Mozaic-compliant.
version: 1.0.0
allowed-tools:
  - mcp__mozaic__list_style_guides
  - mcp__mozaic__get_style_guide
---

# Mozaic Style Guide

A pattern catalog, not a component library: each entry is a **composed screen or layout** (e.g. a master-detail view, a filterable data table, an onboarding stepper) rather than a single button or input. Use it to check what a compliant Mozaic screen actually looks like before building one.

This skill calls the MCP tools directly (`list_style_guides` / `get_style_guide`) instead of a local shell script, because `get_style_guide` returns the screenshot as a real image content block — something a shell script printing text can't do.

## When to Use This Skill

- Before building a composed screen (list+detail, filtered table, wizard, etc.) — check if a matching pattern already exists
- To see a real screenshot of how a pattern looks in production, not just a mockup
- To find which components a pattern is built from, before generating code

## Workflow

1. **Find a pattern** — `list_style_guides({ category?, site? })`. `category` is the pattern shape (`data-table`, `master-detail`, `search-filter`, `modal-confirm`, `nav-header`, `calendar-view`, `onboarding-stepper`, `cascading-column-browser`, `detail-view`, `form`, ...). `site` is the source app it was captured from (`elo`, `sop`, ...). Omit either to browse everything.
2. **Inspect it** — `get_style_guide({ slug })` returns the description, source site, the `components` slugs it composes, and the actual screenshot.
3. **Hand off to a builder** — for each component slug returned, use the matching framework skill to generate real code: `mozaic-react-builder`, `mozaic-vue-builder`, `mozaic-webcomponents-builder`, or `mozaic-freemarker-builder`. This skill only tells you *what* to build and *how it should look*; it doesn't generate framework code itself.

## Example

**User**: "I need a list+detail screen for managing service executions."

1. `list_style_guides({ category: "master-detail" })` → finds `project-detail`.
2. `get_style_guide({ slug: "project-detail" })` → shows the screenshot: sticky summary header, card list, status badges, inline alerts, disclosure toggle. Components: `sticky-header`, `card-list`, `badge`, `alert`, `dropdown`, `disclosure`.
3. Hand off each component to `mozaic-react-builder` (or the target framework) to generate the actual code, matching the layout shown.

## Authoring a New Entry

Contributors add patterns under `style-guides/<slug>/`:

```
style-guides/
  <slug>/
    meta.json
    screenshot.png
```

`meta.json`:
```json
{
  "name": "Project Detail",
  "category": "master-detail",
  "site": "sop",
  "description": "2-4 sentences: what it's for, key layout/elements.",
  "components": ["sticky-header", "card-list", "badge", "alert"]
}
```

- `category` and `site` are open strings, no fixed enum — reuse an existing value where it fits, coin a new one when it genuinely doesn't.
- `components` is best-effort illustrative slugs, not yet validated against the `components` table.
- One screenshot per pattern, PNG only.
- A malformed or incomplete entry fails the build (`pnpm run build`) — fix it before shipping.
