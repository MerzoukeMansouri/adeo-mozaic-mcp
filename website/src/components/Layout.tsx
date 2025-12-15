import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/architecture", label: "Architecture" },
  { path: "/development", label: "Development" },
  { path: "/test", label: "Test" },
  { path: "/sources", label: "Sources" },
  { path: "/playground", label: "Test It!", highlight: true },
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
    <div className="min-h-screen bg-grey-000 dark:bg-primary-02-900 transition-colors">
      {/* Header - Mozaic style with Primary-02 dark header */}
      <header className="sticky top-0 z-50 bg-primary-02-800 dark:bg-primary-02-900 border-b border-primary-02-700">
        <div className="max-w-7xl mx-auto px-mu100 sm:px-mu150 lg:px-mu200">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Mozaic Green */}
            <NavLink to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-primary-01-400 rounded-mozaic flex items-center justify-center group-hover:bg-primary-01-500 transition-colors">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-grey-000 text-mozaic-05">
                  Mozaic MCP
                </span>
                <span className="text-mozaic-01 text-primary-02-300">
                  Design System Server
                </span>
              </div>
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-mu025">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) => {
                    if (item.highlight) {
                      return `px-mu100 py-mu050 rounded-mozaic text-mozaic-04 font-semibold transition-all ${
                        isActive
                          ? "bg-primary-01-500 text-white"
                          : "bg-primary-01-400 text-white hover:bg-primary-01-500"
                      }`;
                    }
                    return `px-mu075 py-mu050 rounded-mozaic text-mozaic-04 font-medium transition-colors ${
                      isActive
                        ? "bg-primary-02-600 text-grey-000"
                        : "text-primary-02-200 hover:text-grey-000 hover:bg-primary-02-700"
                    }`;
                  }}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-mu050">
              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-mu050 rounded-mozaic text-primary-02-300 hover:text-grey-000 hover:bg-primary-02-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* GitHub link */}
              <a
                href="https://github.com/MerzoukeMansouri/adeo-mozaic-mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="p-mu050 rounded-mozaic text-primary-02-300 hover:text-grey-000 hover:bg-primary-02-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-mu050 rounded-mozaic text-primary-02-300 hover:text-grey-000 hover:bg-primary-02-700"
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
          <div className="md:hidden border-t border-primary-02-700 bg-primary-02-800">
            <nav className="px-mu100 py-mu050 space-y-mu025">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => {
                    if (item.highlight) {
                      return `block px-mu100 py-mu050 rounded-mozaic text-mozaic-04 font-semibold ${
                        isActive
                          ? "bg-primary-01-500 text-white"
                          : "bg-primary-01-400 text-white"
                      }`;
                    }
                    return `block px-mu100 py-mu050 rounded-mozaic text-mozaic-04 font-medium ${
                      isActive
                        ? "bg-primary-02-600 text-grey-000"
                        : "text-primary-02-200 hover:bg-primary-02-700"
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
      <main className="max-w-7xl mx-auto px-mu100 sm:px-mu150 lg:px-mu200 py-mu200">
        <Outlet />
      </main>

      {/* Footer - Mozaic style */}
      <footer className="bg-primary-02-800 dark:bg-primary-02-900 border-t border-primary-02-700 mt-mu400">
        <div className="max-w-7xl mx-auto px-mu100 sm:px-mu150 lg:px-mu200 py-mu200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-mu100 md:space-y-0">
            <div className="flex items-center space-x-mu050">
              <div className="w-8 h-8 bg-primary-01-400 rounded-mozaic flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-grey-000 font-semibold">Mozaic MCP Server</span>
            </div>
            <p className="text-mozaic-03 text-primary-02-300">
              An MCP server for the Mozaic Design System by ADEO
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
