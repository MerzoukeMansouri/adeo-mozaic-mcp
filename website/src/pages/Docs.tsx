import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";

interface DocItem {
  slug: string;
  label: string;
  file: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

const docs: DocItem[] = [
  { slug: "architecture", label: "Architecture", file: "ARCHITECTURE.md" },
  { slug: "development", label: "Development", file: "DEVELOPMENT.md" },
  { slug: "test", label: "Testing", file: "TEST.md" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extractToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const toc: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    // Skip the main title (h1)
    if (level > 1) {
      toc.push({
        id: slugify(text),
        text,
        level,
      });
    }
  }

  return toc;
}

function Docs() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Default to architecture if no slug
  const currentSlug = slug || "architecture";
  const currentDoc = docs.find((d) => d.slug === currentSlug) || docs[0];

  // Redirect to /docs/architecture if accessing /docs
  useEffect(() => {
    if (!slug) {
      navigate("/docs/architecture", { replace: true });
    }
  }, [slug, navigate]);

  // Fetch markdown content
  useEffect(() => {
    setLoading(true);
    setError(null);

    const baseUrl = import.meta.env.BASE_URL || "/";
    const fullUrl = `${baseUrl}content/${currentDoc.file}`;

    fetch(fullUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setToc(extractToc(text));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [currentDoc.file]);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll(".markdown-body h2, .markdown-body h3");
      let currentActive = "";

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          currentActive = heading.id;
        }
      });

      setActiveSection(currentActive);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle internal markdown links
  const handleLinkClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      // Handle internal .md links
      if (href.endsWith(".md") || href.includes(".md#")) {
        e.preventDefault();
        const [file, anchor] = href.split("#");
        const targetDoc = docs.find(
          (d) => d.file.toLowerCase() === file.replace("./", "").toLowerCase()
        );
        if (targetDoc) {
          navigate(`/docs/${targetDoc.slug}${anchor ? `#${anchor}` : ""}`);
        }
      }
      // Handle anchor links
      else if (href.startsWith("#")) {
        e.preventDefault();
        const element = document.getElementById(href.slice(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    },
    [navigate]
  );

  return (
    <div className="docs-layout">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="docs-sidebar-toggle lg:hidden fixed bottom-4 right-4 z-50 bg-primary-01-500 text-white p-3 rounded-full shadow-lg"
        aria-label="Toggle sidebar"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`docs-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="docs-sidebar-content">
          {/* Document list */}
          <nav className="docs-nav">
            <h3 className="docs-nav-title">Documentation</h3>
            <ul className="docs-nav-list">
              {docs.map((doc) => (
                <li key={doc.slug}>
                  <Link
                    to={`/docs/${doc.slug}`}
                    onClick={() => setSidebarOpen(false)}
                    className={`docs-nav-link ${currentSlug === doc.slug ? "active" : ""}`}
                  >
                    {doc.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Table of Contents */}
          {toc.length > 0 && (
            <nav className="docs-toc">
              <h3 className="docs-toc-title">On This Page</h3>
              <ul className="docs-toc-list">
                {toc.map((item) => (
                  <li
                    key={item.id}
                    className={`docs-toc-item level-${item.level}`}
                  >
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setSidebarOpen(false);
                        const element = document.getElementById(item.id);
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className={`docs-toc-link ${activeSection === item.id ? "active" : ""}`}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="docs-backdrop lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="docs-main">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-01-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-400">Error loading content: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
              components={{
                // Add IDs to headings for anchor links
                h1: ({ children }) => {
                  const text = String(children);
                  return <h1 id={slugify(text)}>{children}</h1>;
                },
                h2: ({ children }) => {
                  const text = String(children);
                  return <h2 id={slugify(text)}>{children}</h2>;
                },
                h3: ({ children }) => {
                  const text = String(children);
                  return <h3 id={slugify(text)}>{children}</h3>;
                },
                // Handle links
                a: ({ href, children }) => {
                  if (!href) return <span>{children}</span>;

                  // Internal markdown or anchor links
                  if (href.endsWith(".md") || href.includes(".md#") || href.startsWith("#")) {
                    return (
                      <a
                        href={href}
                        onClick={(e) => handleLinkClick(e, href)}
                        className="text-primary-01-500 hover:text-primary-01-600 hover:underline"
                      >
                        {children}
                      </a>
                    );
                  }

                  // External links
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-01-500 hover:text-primary-01-600 hover:underline"
                    >
                      {children}
                    </a>
                  );
                },
                // Handle images with base URL
                img: ({ src, alt }) => {
                  const baseUrl = import.meta.env.BASE_URL || "/";
                  let imgSrc = src;
                  if (src?.startsWith("./assets/")) {
                    imgSrc = `${baseUrl}assets/${src.replace("./assets/", "")}`;
                  } else if (src?.startsWith("./")) {
                    imgSrc = `${baseUrl}${src.replace("./", "")}`;
                  }
                  return (
                    <img
                      src={imgSrc}
                      alt={alt || ""}
                      className="max-w-full h-auto my-4 rounded-lg border border-grey-200 dark:border-primary-02-700"
                    />
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}

        {/* Previous/Next navigation */}
        {!loading && !error && (
          <nav className="docs-pagination">
            {docs.findIndex((d) => d.slug === currentSlug) > 0 && (
              <Link
                to={`/docs/${docs[docs.findIndex((d) => d.slug === currentSlug) - 1].slug}`}
                className="docs-pagination-link prev"
              >
                <span className="docs-pagination-label">Previous</span>
                <span className="docs-pagination-title">
                  {docs[docs.findIndex((d) => d.slug === currentSlug) - 1].label}
                </span>
              </Link>
            )}
            {docs.findIndex((d) => d.slug === currentSlug) < docs.length - 1 && (
              <Link
                to={`/docs/${docs[docs.findIndex((d) => d.slug === currentSlug) + 1].slug}`}
                className="docs-pagination-link next"
              >
                <span className="docs-pagination-label">Next</span>
                <span className="docs-pagination-title">
                  {docs[docs.findIndex((d) => d.slug === currentSlug) + 1].label}
                </span>
              </Link>
            )}
          </nav>
        )}
      </main>
    </div>
  );
}

export default Docs;
