"use client";

import { useAppTranslation } from "@/hooks/use-translation";

interface FloatingAIButtonProps {
  onClick: () => void;
  className?: string;
}

export function FloatingAIButton({
  onClick,
  className = "",
}: FloatingAIButtonProps) {
  const { t } = useAppTranslation(["chat", "common"]);

  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-50
        w-14 h-14 
        bg-blue-600 hover:bg-blue-700
        text-white
        rounded-full
        shadow-lg hover:shadow-xl
        transition-all duration-200
        flex items-center justify-center
        cursor-pointer
        animate-pulse
        ${className}
      `}
      aria-label={t("openAIAssistant")}
    >
      {/* AI Icon */}
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    </button>
  );
}
