import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";

interface MarkdownPageProps {
  url: string;
  title?: string;
}

function MarkdownPage({ url, title }: MarkdownPageProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Prepend base URL for GitHub Pages compatibility
    const baseUrl = import.meta.env.BASE_URL || "/";
    const fullUrl = url.startsWith("/") ? `${baseUrl}${url.slice(1)}` : url;

    fetch(fullUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-700 dark:text-red-400">Error loading content: {error}</p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {title}
        </h1>
      )}
      <div className="markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
          components={{
            img: ({ src, alt }) => {
              // Handle relative image paths with base URL for GitHub Pages
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
                  className="max-w-full h-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700"
                />
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default MarkdownPage;
