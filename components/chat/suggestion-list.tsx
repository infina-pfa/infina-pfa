"use client";

import { ChatSuggestion } from "@/lib/types/chat.types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SuggestionListProps {
  suggestions: ChatSuggestion[];
  onSuggestionClick?: (suggestion: string) => void;
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
    <div className="space-y-2 px-2 sm:px-0 w-full">
      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion.id}
            onClick={() => onSuggestionClick?.(suggestion.text)}
            disabled={isSubmitting}
            variant="secondary"
            size="default"
            className={cn(
              "w-full sm:w-auto h-auto text-left justify-start",
              "font-nunito rounded-lg",
              "bg-white hover:bg-[#F0F2F5]",
              "shadow-none border-none",
              suggestion.description && "flex flex-col items-start"
            )}
          >
            <div className="flex flex-col items-start">
              <span className="font-semibold text-gray-900">
                {suggestion.text}
              </span>
              {suggestion.description && (
                <span className="text-xs text-gray-600 mt-1">
                  {suggestion.description}
                </span>
              )}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
