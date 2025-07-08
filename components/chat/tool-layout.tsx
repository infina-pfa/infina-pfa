"use client";

import { ReactNode } from "react";

interface ToolLayoutProps {
  isMobile: boolean;
  header: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
}

export function ToolLayout({
  isMobile,
  header,
  content,
  footer,
}: ToolLayoutProps) {
  // Mobile: Full screen overlay
  if (isMobile) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-gray-50 rounded-xl w-full h-[100vh] flex flex-col">
          {/* Header */}
          {header}

          {/* Content */}
          {content}
        </div>
      </div>
    );
  }

  // Desktop: Split screen
  return (
    <div className="fixed md:relative inset-y-0 right-0 w-full md:w-1/2 lg:w-2/5 bg-gray-50 border-l border-gray-200 z-40 h-full overflow-auto">
      {/* Header */}
      {header}

      {/* Content */}
      {content}

      {/* Footer */}
      {footer}
    </div>
  );
}
