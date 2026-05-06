import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ContentFormat } from "@/types";

interface Props {
  source: string;
  format?: ContentFormat;
  className?: string;
}

export function MarkdownRenderer({ source, format = "markdown", className }: Props) {
  if (format === "html") {
    // Content produced by TipTap is sanitized at the editor level (no script tags possible from toolbar).
    return (
      <div
        className={`prose-editorial ${className ?? ""}`}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: source }}
      />
    );
  }
  return (
    <div className={`prose-editorial ${className ?? ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer noopener">
              {children}
            </a>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
