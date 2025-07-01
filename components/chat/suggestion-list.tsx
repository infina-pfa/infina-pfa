"use client";

import { ChatSuggestion } from "@/lib/types/chat.types";

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
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-row flex-wrap gap-3">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSuggestionClick(suggestion.text)}
            disabled={isSubmitting}
            className={`
              p-4 text-left rounded-xl bg-white hover:bg-blue-50 
              transition-colors text-sm font-nunito cursor-pointer
              ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">
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
