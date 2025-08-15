"use client";

import { useRef, useEffect, useState } from "react";
import { useAppTranslation } from "@/hooks/use-translation";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSubmit: (text: string) => Promise<void>;
  isSubmitting: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSubmit,
  isSubmitting,
  disabled = false,
}: ChatInputProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState<string>("");
  const maxLength = 500;

  // Auto-resize textarea and update character count
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    // Enforce character limit
    if (newValue.length <= maxLength) {
      setValue(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isSubmitting && !disabled) {
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (value.trim() && !isSubmitting && !disabled) {
      onSubmit(value);
      setValue("");
    }
  };

  const isOverLimit = value.length > maxLength;
  const isNearLimit =
    value.length >= maxLength * 0.9 && value.length <= maxLength;

  return (
    <div className="bg-white">
      {/* Text Input Row */}
      <div className="px-4 pt-4 pb-1">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={t("chatInputPlaceholder") || "Type your message..."}
          disabled={disabled || isSubmitting}
          maxLength={maxLength}
          className={`
            w-full resize-none bg-transparent outline-none font-nunito text-base
            placeholder-gray-400 text-gray-900 min-h-[24px] max-h-[120px]
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        />

        {/* Character counter */}
        <div
          className={`text-xs text-right mt-1 ${
            isOverLimit
              ? "text-[#F44336]"
              : isNearLimit
              ? "text-[#FFC107]"
              : "text-gray-400"
          }`}
        >
          {value.length}/{maxLength}
        </div>
      </div>

      {/* Send Button Row */}
      <div className="flex items-center justify-end px-4 pb-4">
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || disabled || isSubmitting || isOverLimit}
          className={`
            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
            transition-colors font-nunito
            ${
              !value.trim() || disabled || isSubmitting || isOverLimit
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }
          `}
          aria-label={t("sendMessage")}
        >
          {isSubmitting ? (
            <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
          ) : (
            <Send
              className={`w-5 h-5 ${
                !value.trim() || disabled || isOverLimit
                  ? "text-gray-400"
                  : "text-white"
              }`}
            />
          )}
        </button>
      </div>
    </div>
  );
}
