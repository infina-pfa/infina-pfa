"use client";

import { ChatMessage } from "@/lib/types/chat.types";
import { useTranslation } from "react-i18next";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { t } = useTranslation("chat");
  const isUser = message.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`flex max-w-[80%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        } items-start gap-3`}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold font-nunito">
                {message.user_id?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Message Content */}
        <div
          className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
        >
          {/* Message Bubble */}
          <div
            className={`
              px-4 py-3 rounded-2xl max-w-full font-nunito text-sm
              ${
                isUser
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-900 rounded-bl-sm"
              }
            `}
          >
            {/* Streaming indicator */}
            {message.isStreaming && message.streamingContent ? (
              <div className="relative">
                <span>{message.streamingContent}</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
            )}
          </div>

          {/* Component Display */}
          {message.component && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200 max-w-full">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
                <span className="text-sm font-medium text-blue-900 font-nunito">
                  {message.component.title || t("componentSuggestion")}
                </span>
              </div>
              {message.component.description && (
                <p className="text-xs text-blue-700 font-nunito mb-2">
                  {message.component.description}
                </p>
              )}
              <button
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors font-nunito"
                onClick={() => {
                  // This will be handled by the parent component
                  console.log("Open component:", message.component);
                }}
              >
                {t("openTool")}
              </button>
            </div>
          )}

          {/* Timestamp */}
          <div
            className={`text-xs text-gray-500 mt-1 font-nunito ${
              isUser ? "text-right" : "text-left"
            }`}
          >
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
