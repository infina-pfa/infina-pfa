"use client";

import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Mic, Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  disabled?: boolean;
  onAttachFile?: () => void;
  onVoiceInput?: () => void;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  disabled = false,
  onAttachFile,
  onVoiceInput,
}: ChatInputProps) {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
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
    <div className="bg-white rounded-xl mx-4">
      {/* Text Input Row */}
      <div className="px-4 pt-4 pb-3">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("inputPlaceholder") || "Message"}
          disabled={disabled || isSubmitting}
          className={`
            w-full resize-none bg-transparent outline-none font-nunito text-base
            placeholder-gray-400 text-gray-900 min-h-[24px] max-h-[120px]
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        />
      </div>

      {/* Tools Row */}
      <div className="flex items-center justify-between px-4 pb-4">
        {/* Add/Attach Button */}
        <button
          onClick={onAttachFile}
          disabled={disabled || isSubmitting}
          className={`
            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
            transition-colors font-nunito
            ${
              disabled || isSubmitting
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }
          `}
          aria-label={t("attachFile")}
        >
          <Plus
            className={`w-5 h-5 ${
              disabled || isSubmitting ? "text-gray-400" : "text-white"
            }`}
          />
        </button>

        {/* Voice/Send Button */}
        <button
          onClick={value.trim() ? handleSubmit : onVoiceInput}
          disabled={disabled || isSubmitting}
          className={`
            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
            transition-colors font-nunito
            ${
              disabled || isSubmitting
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }
          `}
          aria-label={value.trim() ? t("sendMessage") : t("voiceInput")}
        >
          {isSubmitting ? (
            <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
          ) : value.trim() ? (
            <Send
              className={`w-5 h-5 ${disabled ? "text-gray-400" : "text-white"}`}
            />
          ) : (
            <Mic
              className={`w-5 h-5 ${disabled ? "text-gray-400" : "text-white"}`}
            />
          )}
        </button>
      </div>
    </div>
  );
}
