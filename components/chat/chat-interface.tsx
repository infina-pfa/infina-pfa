"use client";

import { useChatFlow } from "@/hooks/use-chat-flow";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { TypingIndicator } from "./typing-indicator";
import { ComponentPanel } from "./component-panel";
import { SuggestionList } from "./suggestion-list";
import { useTranslation } from "react-i18next";

export function ChatInterface() {
  const { t } = useTranslation("chat");
  const {
    messages,
    isLoading,
    error,
    isAiTyping,
    showSuggestions,
    conversationId,
    clearError,
    closeComponent,
    inputValue,
    setInputValue,
    handleSubmit,
    isSubmitting,
    suggestions,
    onSuggestionClick,
  } = useChatFlow();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-nunito">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700 font-nunito">{error}</p>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800 text-sm underline mt-1"
                >
                  {t("dismissError")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          {!conversationId ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md mx-auto p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.436L3 21l2.436-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 font-nunito mb-2">
                  {t("welcomeTitle")}
                </h2>
                <p className="text-gray-600 font-nunito text-sm mb-6">
                  {t("welcomeDescription")}
                </p>
                {showSuggestions && suggestions.length > 0 && (
                  <SuggestionList
                    suggestions={suggestions}
                    onSuggestionClick={onSuggestionClick}
                    isSubmitting={isSubmitting}
                  />
                )}
              </div>
            </div>
          ) : (
            <>
              <MessageList messages={messages} />
              {isAiTyping && <TypingIndicator />}
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-100 bg-white">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            disabled={isAiTyping}
          />
        </div>
      </div>

      {/* Component Panel */}
      <ComponentPanel onClose={closeComponent} />
    </div>
  );
}
