"use client";

import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownMessageProps {
  content: string;
  isUser?: boolean;
  className?: string;
}

export function MarkdownMessage({
  content,
  isUser = false,
  className,
}: MarkdownMessageProps) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none font-nunito [&>*]:font-nunito",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
        components={{
          // Headers - no animations
          h1: ({ children }) => (
            <h1
              className={cn(
                "font-bold my-3 text-gray-900",
                "text-lg",
                isUser && "text-white"
              )}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={cn(
                "font-bold my-2 text-gray-800",
                "text-base",
                isUser && "text-white"
              )}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={cn(
                "font-semibold my-2 text-gray-700",
                "text-sm",
                isUser && "text-white"
              )}
            >
              {children}
            </h3>
          ),

          // Paragraphs - simple styling
          p: ({ children }) => (
            <p
              className={cn(
                "my-2 leading-relaxed",
                "text-sm",
                isUser ? "text-white" : "text-gray-800"
              )}
            >
              {children}
            </p>
          ),

          // Lists - minimal styling
          ul: ({ children }) => (
            <ul
              className={cn(
                "list-disc ml-4 my-2 space-y-1",
                "ml-3 my-1 space-y-0.5"
              )}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={cn(
                "list-decimal ml-4 my-2 space-y-1",
                "ml-3 my-1 space-y-0.5"
              )}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li
              className={cn(
                "leading-relaxed",
                "text-sm",
                isUser ? "text-white" : "text-gray-700"
              )}
            >
              {children}
            </li>
          ),

          // Strong/Bold text - simple highlight
          strong: ({ children }) => (
            <strong
              className={cn(
                "font-bold",
                isUser ? "text-white" : "text-gray-900"
              )}
            >
              {children}
            </strong>
          ),

          // Emphasis/Italic text
          em: ({ children }) => (
            <em
              className={cn(
                "italic",
                isUser ? "text-blue-100" : "text-gray-600"
              )}
            >
              {children}
            </em>
          ),

          // Links - simple hover
          a: ({ href, children }) => (
            <a
              href={href}
              className={cn(
                "underline font-medium hover:opacity-80",
                isUser
                  ? "text-blue-200 hover:text-blue-100"
                  : "text-blue-600 hover:text-blue-800"
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),

          // Code blocks - no syntax highlighting
          code: ({ children, className }) => {
            const isInline = !className;

            if (isInline) {
              return (
                <code
                  className={cn(
                    "px-1.5 py-0.5 rounded text-xs font-mono",
                    isUser
                      ? "bg-blue-700 text-blue-100"
                      : "bg-gray-100 text-gray-800"
                  )}
                >
                  {children}
                </code>
              );
            }

            return (
              <code
                className={cn(
                  "block p-3 rounded-lg font-mono text-sm overflow-x-auto",
                  "p-2 text-xs",
                  isUser
                    ? "bg-blue-800 text-blue-100"
                    : "bg-gray-50 text-gray-800"
                )}
              >
                {children}
              </code>
            );
          },

          // Pre blocks
          pre: ({ children }) => (
            <pre className={cn("my-3 rounded-lg overflow-x-auto", "my-2")}>
              {children}
            </pre>
          ),

          // Blockquotes - simple styling
          blockquote: ({ children }) => (
            <blockquote
              className={cn(
                "pl-4 my-3 italic",
                "pl-3 my-2",
                isUser
                  ? "text-blue-100 bg-white/5 py-2 rounded-r"
                  : "text-gray-600 bg-gray-50 py-2 rounded-r"
              )}
            >
              {children}
            </blockquote>
          ),

          // Tables - basic styling
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto">
              <table className={cn("min-w-full rounded-lg", isUser && "")}>
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th
              className={cn(
                "px-3 py-2 text-left font-semibold",
                "px-2 py-1 text-xs",
                isUser ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-900"
              )}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              className={cn(
                "px-3 py-2 border-b",
                "px-2 py-1 text-xs",
                isUser
                  ? "text-white border-blue-400"
                  : "text-gray-700 border-gray-200"
              )}
            >
              {children}
            </td>
          ),

          // Horizontal rule
          hr: () => (
            <hr
              className={cn(
                "my-4 border-t",
                isUser ? "border-blue-300" : "border-gray-300"
              )}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
