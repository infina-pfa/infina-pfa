"use client";

import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm sm:prose-base max-w-none">
      <ReactMarkdown
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-lg sm:text-xl font-bold text-[#111827] mb-3 mt-0 font-nunito">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base sm:text-lg font-bold text-[#111827] mb-2 mt-4 font-nunito">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm sm:text-base font-semibold text-[#111827] mb-2 mt-3 font-nunito">
              {children}
            </h3>
          ),
          
          // Paragraphs
          p: ({ children }) => (
            <p className="text-sm leading-relaxed text-[#111827] mb-3 last:mb-0 font-nunito">
              {children}
            </p>
          ),
          
          // Strong/Bold text
          strong: ({ children }) => (
            <span className="font-bold text-[#0055FF] font-nunito">
              {children}
            </span>
          ),
          
          // Emphasis/Italic text
          em: ({ children }) => (
            <span className="italic text-[#111827] font-nunito">
              {children}
            </span>
          ),
          
          // Unordered lists
          ul: ({ children }) => (
            <div className="space-y-1 mb-3 last:mb-0">
              {children}
            </div>
          ),
          
          // Ordered lists
          ol: ({ children }) => (
            <div className="space-y-1 mb-3 last:mb-0">
              {children}
            </div>
          ),
          
          // List items - simple approach without checking parent
          li: ({ children }) => (
            <div className="flex items-start space-x-3 text-sm leading-relaxed text-[#111827] font-nunito mb-2">
              <span className="flex-shrink-0 w-1.5 h-1.5 bg-[#0055FF] rounded-full mt-2"></span>
              <div className="flex-1">
                {children}
              </div>
            </div>
          ),
          
          // Code blocks
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-[#F0F2F5] text-[#0055FF] px-2 py-1 rounded font-mono text-sm font-nunito">
                  {children}
                </code>
              );
            }
            
            return (
              <pre className="bg-[#F0F2F5] p-4 rounded-lg overflow-x-auto mb-3 last:mb-0">
                <code className="text-sm font-mono text-[#111827] font-nunito">
                  {children}
                </code>
              </pre>
            );
          },
          
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#0055FF] pl-4 py-2 bg-[#F0F2F5] rounded-r-lg my-3 last:my-0">
              <div className="text-sm text-[#111827] font-nunito">
                {children}
              </div>
            </blockquote>
          ),
          
          // Links
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0055FF] hover:text-[#0044CC] font-semibold underline font-nunito"
            >
              {children}
            </a>
          ),
          
          // Horizontal rules
          hr: () => (
            <hr className="border-0 h-px bg-[#E0E0E0] my-4" />
          ),
          
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3 last:mb-0">
              <table className="w-full border-collapse">
                {children}
              </table>
            </div>
          ),
          
          thead: ({ children }) => (
            <thead className="bg-[#F0F2F5]">
              {children}
            </thead>
          ),
          
          tbody: ({ children }) => (
            <tbody>
              {children}
            </tbody>
          ),
          
          tr: ({ children }) => (
            <tr className="border-b border-[#E0E0E0] last:border-b-0">
              {children}
            </tr>
          ),
          
          th: ({ children }) => (
            <th className="text-left p-3 text-sm font-semibold text-[#111827] font-nunito">
              {children}
            </th>
          ),
          
          td: ({ children }) => (
            <td className="p-3 text-sm text-[#111827] font-nunito">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 