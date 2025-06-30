"use client";

import { ChatSuggestion } from "@/lib/types/chat.types";
import { useTranslation } from "react-i18next";

interface SuggestionListProps {
  suggestions: ChatSuggestion[];
  onSuggestionClick: (suggestion: string) => Promise<void>;
  isSubmitting: boolean;
}

export function SuggestionList({
  suggestions,
  onSuggestionClick,
  isSubmitting,
}: SuggestionListProps) {
  const { t } = useTranslation("chat");

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700 font-nunito mb-3">
        {t("suggestionsTitle")}
      </p>
      <div className="grid gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSuggestionClick(suggestion.text)}
            disabled={isSubmitting}
            className={`
              p-3 text-left rounded-lg border border-gray-200 hover:border-blue-300 
              hover:bg-blue-50 transition-colors text-sm font-nunito
              ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }
            `}
          >
            <div className="flex items-start gap-3">
              {suggestion.icon && (
                <div className="flex-shrink-0 w-5 h-5 text-blue-600 mt-0.5">
                  {/* Icon would be rendered here based on suggestion.icon */}
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-1">
                  {suggestion.text}
                </div>
                {suggestion.description && (
                  <div className="text-xs text-gray-600">
                    {suggestion.description}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
