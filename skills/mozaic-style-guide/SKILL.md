---
name: mozaic-style-guide
description: Mozaic composed-pattern catalog — real UI screens/layouts (master-detail, data-table, search-filter, modal-confirm, etc.) captured from live ADEO apps, each with a screenshot and description. Framework-agnostic reference to check before building a screen, so it comes out Mozaic-compliant.
compatibility: Requires bash and sqlite3, plus npx to fetch the Mozaic database (~/.mozaic/mozaic.db) on first use.
allowed-tools: Bash Read
metadata:
  version: "2.0.0"
---

# Mozaic Style Guide

A pattern catalog, not a component library: each entry is a **composed screen or layout** (e.g. a master-detail view, a filterable data table, an onboarding stepper) rather than a single button or input. Use it to check what a compliant Mozaic screen actually looks like before building one.

Self-contained: the scripts query the local Mozaic database (`~/.mozaic/mozaic.db`, installed automatically on first use, override with `MOZAIC_DB_PATH`). No MCP server needed.

## Shell Scripts Used

- `scripts/list-style-guides.sh [category|all] [site|all]` - List patterns as JSON (slug, name, category, site, description, components)
- `scripts/get-style-guide.sh <slug>` - Pattern details as JSON, plus `screenshot`: the path of a PNG file the script writes to `~/.mozaic/style-guides/<slug>.png` (override with `MOZAIC_STYLE_GUIDES_DIR`)

## When to Use This Skill

- Before building a composed screen (list+detail, filtered table, wizard, etc.) — check if a matching pattern already exists
- To see a real screenshot of how a pattern looks in production, not just a mockup
- To find which components a pattern is built from, before generating code

## Workflow

1. **Find a pattern** — `scripts/list-style-guides.sh [category] [site]`. `category` is the pattern shape (`data-table`, `master-detail`, `search-filter`, `modal-confirm`, `nav-header`, `calendar-view`, `onboarding-stepper`, `cascading-column-browser`, `form`, ...). `site` is the source app it was captured from (`elo`, `sop`, ...). Use `all` (or omit) to browse everything.
2. **Inspect it** — `scripts/get-style-guide.sh <slug>` returns the description, source site and the `components` slugs it composes, and writes the screenshot to the `screenshot` path.
3. **Look at the screenshot** — open the PNG at `screenshot` with your file/image viewing tool (e.g. Read) so you actually see the layout before building it.
4. **Hand off to a builder** — for each component slug returned, use the matching framework skill to generate real code: `mozaic-react-builder`, `mozaic-vue-builder`, `mozaic-webcomponents-builder`, or `mozaic-freemarker-builder`. This skill only tells you *what* to build and *how it should look*; it doesn't generate framework code itself.

## Example

**User**: "I need a list+detail screen for managing service executions."

1. `scripts/list-style-guides.sh master-detail` → finds `project-detail`.
2. `scripts/get-style-guide.sh project-detail` → components `pageheader`, `tile`, `badge`, `statusnotification`, `select`, `accordion`; screenshot written to `~/.mozaic/style-guides/project-detail.png`.
3. Open that PNG: sticky summary header, card list, status badges, inline alerts, disclosure toggle.
4. Hand off each component to `mozaic-react-builder` (or the target framework) to generate the actual code, matching the layout shown.

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
  "components": ["pageheader", "tile", "badge", "statusnotification"]
}
```

- `category` and `site` are open strings, no fixed enum — reuse an existing value where it fits, coin a new one when it genuinely doesn't.
- `components` must be slugs from the `components` table (e.g. `textinput`, `datatable`, `statusnotification`); unknown slugs fail the build.
- One screenshot per pattern, PNG only.
- A malformed or incomplete entry fails the build (`pnpm run build`) — fix it before shipping.
