"use client";

import { useAppTranslation } from "@/hooks/use-translation";
import { ChatMessage, ChatSuggestion } from "@/lib/types/chat.types";
import { TypingIndicator } from "./typing-indicator";

interface ChatFlowState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isThinking: boolean;
  isStreaming: boolean;
  isMCPLoading: boolean;
  mcpLoadingMessage: string;
  showSuggestions: boolean;
  clearError: () => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSubmit: () => Promise<void>;
  isSubmitting: boolean;
  suggestions: ChatSuggestion[];
  onSuggestionClick: (suggestion: string) => Promise<void>;
  conversationId: string | null;
}

interface AINotificationCardProps {
  isVisible: boolean;
  chatState: ChatFlowState | undefined;
  onClose: () => void;
  onOpenChat: () => void;
}

export function AINotificationCard({
  isVisible,
  chatState,
  onClose,
  onOpenChat,
}: AINotificationCardProps) {
  const { t } = useAppTranslation(["chat", "common"]);

  // Auto-dismiss after response is complete (5 seconds)
  // useEffect(() => {
  //   if (
  //     chatState &&
  //     !chatState.isThinking &&
  //     !chatState.isStreaming &&
  //     isVisible
  //   ) {
  //     const latestAIMessage = chatState.messages
  //       .filter((msg) => msg.sender === "ai")
  //       .slice(-1)[0];

  //     const aiResponseText =
  //       latestAIMessage?.content || latestAIMessage?.streamingContent || "";

  //     if (aiResponseText) {
  //       const timer = setTimeout(() => {
  //         onClose();
  //       }, 5000);

  //       return () => clearTimeout(timer);
  //     }
  //   }
  // }, [
  //   chatState?.isThinking,
  //   chatState?.isStreaming,
  //   chatState?.messages,
  //   isVisible,
  //   onClose,
  // ]);

  if (!isVisible || !chatState) return null;

  // Get the latest AI message (the response to our tool action)
  const latestAIMessage = chatState.messages
    .filter((msg) => msg.sender === "ai")
    .slice(-1)[0];

  // Determine what to show
  const showThinking = chatState.isThinking;
  const showStreaming = chatState.isStreaming;
  const aiResponseText =
    latestAIMessage?.content || latestAIMessage?.streamingContent || "";

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#0055FF] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-nunito font-bold">
                AI
              </span>
            </div>
            <span className="text-sm font-nunito font-medium text-gray-700">
              {t("aiAdvisor")}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="mb-3 min-h-[40px] flex items-center">
          {showThinking && (
            <div className="flex items-center gap-2 text-gray-600">
              <TypingIndicator />
              <span className="text-sm font-nunito">{t("thinking")}</span>
            </div>
          )}

          {!showThinking && aiResponseText && (
            <div className="text-sm text-gray-800 font-nunito leading-relaxed">
              {aiResponseText}
              {showStreaming && (
                <span className="animate-pulse text-[#0055FF] ml-1">|</span>
              )}
            </div>
          )}

          {!showThinking && !aiResponseText && (
            <div className="text-sm text-gray-500 font-nunito">
              {t("waitingForResponse")}
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={onOpenChat}
          className="w-full bg-[#0055FF] text-white rounded-md py-2 text-sm font-nunito font-medium hover:bg-[#0041CC] transition-colors duration-200"
        >
          {t("openFullChat")}
        </button>
      </div>
    </div>
  );
}
