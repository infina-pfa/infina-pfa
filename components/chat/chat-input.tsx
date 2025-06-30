"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  disabled?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  disabled = false,
}: ChatInputProps) {
  const { t } = useTranslation("chat");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [rows, setRows] = useState(1);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const newRows = Math.min(Math.max(Math.ceil(scrollHeight / 24), 1), 4);
      setRows(newRows);
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isSubmitting && !disabled) {
        onSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (value.trim() && !isSubmitting && !disabled) {
      onSubmit();
    }
  };

  return (
    <div className="p-4">
      <div className="relative flex items-end gap-3 bg-gray-50 rounded-xl p-3">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("inputPlaceholder")}
          disabled={disabled || isSubmitting}
          className={`
            flex-1 resize-none bg-transparent border-none outline-none font-nunito text-sm
            placeholder-gray-500 text-gray-900 min-h-[24px] max-h-[96px]
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        />

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || isSubmitting || disabled}
          className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
            transition-colors font-nunito
            ${
              !value.trim() || isSubmitting || disabled
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
            }
          `}
          aria-label={t("sendMessage")}
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              className={`w-4 h-4 ${
                !value.trim() || disabled ? "text-gray-500" : "text-white"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Input Hint */}
      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-xs text-gray-500 font-nunito">
          {t("inputHint")}
        </span>
        {disabled && (
          <span className="text-xs text-amber-600 font-nunito">
            {t("aiTyping")}
          </span>
        )}
      </div>
    </div>
  );
}
