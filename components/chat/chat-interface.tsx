"use client";

import { useAuth } from "@/hooks/use-auth";
import { useChatFlow } from "@/hooks/use-chat-flow";
import { useAppTranslation } from "@/hooks/use-translation";
import { ChatToolId } from "@/lib/types/ai-streaming.types";
import { useEffect, useRef, useState } from "react";
import { ChatInput } from "./chat-input";
import { MessageList } from "./message-list";
import { SuggestionList } from "./suggestion-list";
import { ToolPanel } from "./tool-panel";
import { TypingIndicator } from "./typing-indicator";
import { getStartConversationPromptForStartSaving } from "@/lib/ai-advisor/prompts/start-conversation";

export function ChatInterface() {
  const { t } = useAppTranslation(["chat", "common"]);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();
  const sentFirstMessage = useRef(false);

  const chatFlow = useChatFlow();
  const {
    messages,
    isLoading: chatLoading,
    error,
    isThinking,
    isStreaming,
    showSuggestions,
    clearError,
    toolId,
    setToolId,
    inputValue,
    setInputValue,
    handleSubmit,
    isSubmitting,
    suggestions,
    onSuggestionClick,
    conversationId,
    sendMessage,
  } = chatFlow;

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIsMobile();

    // Add event listener for resize
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    if (user && !sentFirstMessage.current) {
      sendMessage(getStartConversationPromptForStartSaving(), {
        sender: "system",
      });
      sentFirstMessage.current = true;
    }
  }, [user]);

  // Loading state
  if (chatLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-6">
            <div className="w-full h-full bg-blue-600 rounded-full animate-pulse"></div>
          </div>
          <p className="text-gray-600 font-nunito font-medium">
            {t("loading")}
          </p>
        </div>
      </div>
    );
  }

  // Determine if tool panel is open and adjust layout
  const isToolOpen = !!toolId && !isMobile;

  return (
    <div className="flex h-full bg-gray-50 p-0 md:p-8">
      {/* Main Chat Area - adjust width when tool panel is open on desktop */}
      <div
        className={`flex-1 flex flex-col ${
          isToolOpen ? "md:w-1/2 lg:w-3/5" : "w-full"
        }`}
        style={isToolOpen ? { maxWidth: isMobile ? "100%" : "60%" } : {}}
      >
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 p-6 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-red-400 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-nunito font-medium">
                  {error}
                </p>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800 text-sm font-nunito font-medium mt-2 cursor-pointer"
                >
                  {t("dismissError")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <MessageList
            messages={messages}
            onToolClick={(toolId) => setToolId(toolId as ChatToolId)}
            onSendMessage={sendMessage}
          />
          {isThinking && <TypingIndicator />}
        </div>

        {/* Input Area */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="mb-2 p-4">
            <SuggestionList
              suggestions={suggestions}
              onSuggestionClick={onSuggestionClick}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          disabled={isThinking || isStreaming}
        />
      </div>

      {/* Tool Panel */}
      <ToolPanel
        isOpen={!!toolId}
        toolId={toolId}
        onClose={() => {
          setToolId(null);
        }}
        chatFlowState={{
          messages,
          isLoading: chatLoading,
          error,
          isThinking,
          isStreaming,
          showSuggestions,
          clearError,
          inputValue,
          setInputValue,
          sendMessage,
          handleSubmit,
          isSubmitting,
          suggestions,
          onSuggestionClick,
          conversationId,
        }}
      />
    </div>
  );
}
