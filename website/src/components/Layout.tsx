import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/docs", label: "Documentation" },
  { path: "/sources", label: "Sources" },
  { path: "/playground", label: "Playground", highlight: true },
];

function Layout() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-grey-100 dark:bg-grey-900 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-primary-02-800 border-b border-grey-200 dark:border-primary-02-700 shadow-sm">
        <div className="ml-container">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary-01-500 rounded-lg flex items-center justify-center group-hover:bg-primary-01-600 transition-colors shadow-sm">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-grey-900 dark:text-grey-000 text-lg leading-tight">
                  Mozaic MCP
                </span>
                <span className="text-xs text-grey-600 dark:text-grey-400 leading-tight">
                  Design System Server
                </span>
              </div>
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) => {
                    if (item.highlight) {
                      return `mc-button mc-button--solid mc-button--s ${
                        isActive
                          ? "mc-button--accent"
                          : ""
                      }`;
                    }
                    return `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary-01-100 text-primary-01-700 dark:bg-primary-01-900/30 dark:text-primary-01-400"
                        : "text-grey-700 dark:text-grey-300 hover:bg-grey-100 dark:hover:bg-primary-02-700"
                    }`;
                  }}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg text-grey-600 dark:text-grey-400 hover:bg-grey-100 dark:hover:bg-primary-02-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 0 1-4.4 2.26 5.4 5.4 0 0 1-3.14-9.8c-.45-.06-.9-.1-1.36-.1z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm0 18a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1zm9-9a1 1 0 0 1 0 2h-1a1 1 0 1 1 0-2h1zM4 11a1 1 0 0 1 0 2H3a1 1 0 1 1 0-2h1zm14.07-6.07a1 1 0 0 1 0 1.41l-.71.71a1 1 0 1 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0zM7.05 16.95a1 1 0 0 1 0 1.41l-.71.71a1 1 0 1 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0zm11.02 1.41a1 1 0 0 1-1.41 0l-.71-.71a1 1 0 1 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41zM7.05 7.05a1 1 0 0 1-1.41 0l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41z"/>
                  </svg>
                )}
              </button>

              {/* GitHub link */}
              <a
                href="https://github.com/MerzoukeMansouri/adeo-mozaic-mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-grey-600 dark:text-grey-400 hover:bg-grey-100 dark:hover:bg-primary-02-700 transition-colors"
                aria-label="View on GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-grey-600 dark:text-grey-400 hover:bg-grey-100 dark:hover:bg-primary-02-700"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-grey-200 dark:border-primary-02-700 bg-white dark:bg-primary-02-800">
            <nav className="ml-container py-4 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => {
                    if (item.highlight) {
                      return `block w-full mc-button mc-button--solid mc-button--s text-center`;
                    }
                    return `block px-4 py-3 rounded-lg text-sm font-medium ${
                      isActive
                        ? "bg-primary-01-100 text-primary-01-700 dark:bg-primary-01-900/30 dark:text-primary-01-400"
                        : "text-grey-700 dark:text-grey-300 hover:bg-grey-100 dark:hover:bg-primary-02-700"
                    }`;
                  }}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="ml-container py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-grey-200 dark:bg-grey-800 border-t border-grey-300 dark:border-grey-700 mt-16">
        <div className="ml-container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-01-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-grey-900 dark:text-grey-000 font-semibold">Mozaic MCP Server</span>
            </div>
            <p className="text-sm text-grey-600 dark:text-grey-400 text-center md:text-right">
              An MCP server for the{" "}
              <a
                href="https://mozaic.adeo.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-01-600 hover:text-primary-01-700 hover:underline"
              >
                Mozaic Design System
              </a>{" "}
              by ADEO
            </p>
          </div>
          <div className="h-px bg-grey-400 dark:bg-grey-600 my-6" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-grey-500 dark:text-grey-500">
            <p>Built with Mozaic Design System</p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/MerzoukeMansouri/adeo-mozaic-mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-grey-700 dark:hover:text-grey-300 transition-colors inline-flex items-center gap-1"
              >
                GitHub ↗
              </a>
              <a
                href="https://mozaic.adeo.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-grey-700 dark:hover:text-grey-300 transition-colors inline-flex items-center gap-1"
              >
                Mozaic Docs ↗
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
