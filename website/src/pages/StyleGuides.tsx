import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, Code, Terminal } from "lucide-react";
import { useSqlite } from "../hooks/useSqlite";

interface StyleGuide {
  slug: string;
  name: string;
  category: string;
  site: string | null;
  description: string;
  components: string[];
  imagePath: string;
}

const steps = [
  {
    title: "Find a pattern",
    call: "list_style_guides({ category?, site? })",
    desc: "Browse the catalog, optionally filtered by pattern shape (data-table, master-detail, modal-confirm, ...) or by the app it was captured from (elo, sop).",
  },
  {
    title: "Inspect it",
    call: 'get_style_guide({ slug: "sales-mode-modal" })',
    desc: "Returns the description, the component slugs the screen is built from, and the screenshot itself as an image block, so the agent actually sees the layout.",
  },
  {
    title: "Build it",
    call: "mozaic-react-builder / vue / webcomponents / freemarker",
    desc: "Each component slug is handed to the builder skill for the target stack, which generates the real code matching the layout shown.",
  },
];

const chip = (active: boolean) =>
  `px-3 py-1 rounded-full text-sm border transition-colors ${
    active
      ? "bg-primary-01-500 border-primary-01-500 text-white"
      : "bg-white dark:bg-primary-02-800 border-grey-200 dark:border-primary-02-600 text-grey-700 dark:text-grey-300 hover:border-primary-01-400"
  }`;

function StyleGuides() {
  const { loading, error, executeQuery } = useSqlite();
  const [category, setCategory] = useState<string | null>(null);
  const [site, setSite] = useState<string | null>(null);

  const guides = useMemo<StyleGuide[]>(() => {
    if (loading || error) return [];
    const result = executeQuery(
      "SELECT slug, name, category, site, description, components, image_path FROM style_guides ORDER BY category, name"
    );
    return result.values.map(([slug, name, cat, s, description, components, imagePath]) => ({
      slug: slug as string,
      name: name as string,
      category: cat as string,
      site: s as string | null,
      description: description as string,
      components: components ? (JSON.parse(components as string) as string[]) : [],
      imagePath: imagePath as string,
    }));
  }, [loading, error, executeQuery]);

  const categories = [...new Set(guides.map((g) => g.category))];
  const sites = [...new Set(guides.map((g) => g.site).filter(Boolean))] as string[];
  const visible = guides.filter(
    (g) => (!category || g.category === category) && (!site || g.site === site)
  );
  const baseUrl = import.meta.env.BASE_URL || "/";

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center py-12 hero-gradient rounded-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-purple-100 dark:bg-secondary-purple-900/30 rounded-full mb-6">
          <LayoutGrid className="w-4 h-4 text-secondary-purple-600 dark:text-secondary-purple-400" />
          <span className="text-sm font-medium text-secondary-purple-700 dark:text-secondary-purple-400">
            New: 2 MCP tools + 1 skill
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-grey-900 dark:text-grey-000 mb-6 tracking-tight">
          Style Guides
        </h1>

        <p className="text-lg md:text-xl text-grey-600 dark:text-grey-300 max-w-3xl mx-auto leading-relaxed">
          A catalog of real, composed Mozaic screens captured from live ADEO apps. Components tell an
          agent <em>what</em> exists; style guides show <em>how</em> they are combined into a
          compliant screen: a filterable table, a master-detail view, a blocking modal.
        </p>
      </section>

      {/* How it works */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-grey-900 dark:text-grey-000">
            How it works
          </h2>
          <div className="flex-1 h-px bg-grey-200 dark:bg-primary-02-700"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className="bg-white dark:bg-primary-02-800 rounded-xl border border-grey-200 dark:border-primary-02-600 p-6"
            >
              <div className="text-sm font-semibold text-primary-01-600 dark:text-primary-01-400 mb-2">
                Step {idx + 1}
              </div>
              <h3 className="text-lg font-bold text-grey-900 dark:text-grey-000 mb-3">
                {step.title}
              </h3>
              <code className="block text-xs font-mono bg-grey-100 dark:bg-primary-02-900 text-grey-800 dark:text-grey-200 rounded p-2 mb-3 break-words">
                {step.call}
              </code>
              <p className="text-sm text-grey-600 dark:text-grey-400">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white dark:bg-primary-02-800 rounded-xl border border-grey-200 dark:border-primary-02-600 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Code className="w-5 h-5 text-primary-01-500" />
              <h3 className="text-lg font-bold text-grey-900 dark:text-grey-000">MCP tools</h3>
            </div>
            <ul className="space-y-2 text-sm text-grey-600 dark:text-grey-400">
              <li>
                <code className="text-primary-01-600 dark:text-primary-01-400">list_style_guides</code>
                : list patterns, filter by <code>category</code> and/or <code>site</code>. Browse
                only, no full-text search (the catalog stays small).
              </li>
              <li>
                <code className="text-primary-01-600 dark:text-primary-01-400">get_style_guide</code>
                : one pattern's metadata, component slugs, and its screenshot as a base64 PNG image
                content block.
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-primary-02-800 rounded-xl border border-grey-200 dark:border-primary-02-600 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="w-5 h-5 text-secondary-green-500" />
              <h3 className="text-lg font-bold text-grey-900 dark:text-grey-000">
                mozaic-style-guide skill
              </h3>
            </div>
            <p className="text-sm text-grey-600 dark:text-grey-400">
              Framework-agnostic. Unlike the other skills, it calls the MCP tools directly instead
              of local shell scripts, because only an MCP tool can return a real image block. It
              needs the Mozaic MCP server configured, and hands code generation off to the{" "}
              <Link to="/skills" className="text-primary-01-600 dark:text-primary-01-400 underline">
                builder skills
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-grey-900 dark:text-grey-000">
            Catalog
          </h2>
          <span className="text-sm text-grey-500 dark:text-grey-400">
            {visible.length} of {guides.length} patterns
          </span>
          <div className="flex-1 h-px bg-grey-200 dark:bg-primary-02-700"></div>
        </div>

        {loading && <p className="text-grey-500">Loading catalog…</p>}
        {error && <p className="text-secondary-red-400">Could not load database: {error}</p>}

        {!loading && !error && (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              <button className={chip(!category)} onClick={() => setCategory(null)}>
                All categories
              </button>
              {categories.map((c) => (
                <button key={c} className={chip(category === c)} onClick={() => setCategory(c)}>
                  {c}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-8">
              <button className={chip(!site)} onClick={() => setSite(null)}>
                All sites
              </button>
              {sites.map((s) => (
                <button key={s} className={chip(site === s)} onClick={() => setSite(s)}>
                  {s}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((g) => (
                <div
                  key={g.slug}
                  className="bg-white dark:bg-primary-02-800 rounded-xl border border-grey-200 dark:border-primary-02-600 overflow-hidden flex flex-col"
                >
                  <a href={`${baseUrl}${g.imagePath}`} target="_blank" rel="noreferrer">
                    <img
                      src={`${baseUrl}${g.imagePath}`}
                      alt={`${g.name} screenshot`}
                      loading="lazy"
                      className="w-full h-48 object-cover object-top border-b border-grey-200 dark:border-primary-02-600"
                    />
                  </a>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-grey-900 dark:text-grey-000">{g.name}</h3>
                      {g.site && (
                        <span className="text-xs px-2 py-0.5 rounded bg-grey-100 dark:bg-primary-02-900 text-grey-600 dark:text-grey-400">
                          {g.site}
                        </span>
                      )}
                    </div>
                    <code className="text-xs text-primary-01-600 dark:text-primary-01-400 mb-3">
                      {g.slug} · {g.category}
                    </code>
                    <p className="text-sm text-grey-600 dark:text-grey-400 mb-4 flex-1">
                      {g.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {g.components.map((c) => (
                        <span
                          key={c}
                          className="text-xs font-mono px-2 py-0.5 rounded bg-primary-01-100 dark:bg-primary-01-900/30 text-primary-01-700 dark:text-primary-01-400"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Authoring */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-grey-900 dark:text-grey-000">
            Add a pattern
          </h2>
          <div className="flex-1 h-px bg-grey-200 dark:bg-primary-02-700"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-grey-900 dark:bg-grey-950 rounded-xl p-5 overflow-x-auto">
            <pre className="text-xs text-grey-100">{`style-guides/<slug>/
├── meta.json
└── screenshot.png

{
  "name": "Sales Mode Modal",
  "category": "modal-confirm",
  "site": "elo",
  "description": "2-4 sentences: purpose, key layout.",
  "components": ["modal", "radiogroup", "button"]
}`}</pre>
          </div>
          <ul className="space-y-3 text-sm text-grey-600 dark:text-grey-400 list-disc pl-5">
            <li>
              Style guides are hand-authored in this repo; every other source is parsed from the
              upstream Mozaic repos.
            </li>
            <li>
              <code>category</code> and <code>site</code> are open strings: reuse an existing value
              when it fits.
            </li>
            <li>
              <code>components</code> must be real component slugs (<code>textinput</code>,{" "}
              <code>datatable</code>, <code>statusnotification</code>, ...).
            </li>
            <li>
              The build fails on a missing file, malformed JSON, or an unknown component slug.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default StyleGuides;
