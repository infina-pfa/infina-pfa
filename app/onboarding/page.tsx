"use client";

import { useOnboarding } from "@/hooks/use-onboarding-stream";
import { useAppTranslation } from "@/hooks/use-translation";
import { ChatInput } from "@/components/onboarding/chat-input";
import { MessageList } from "@/components/onboarding/message-list";
import { TypingIndicator } from "@/components/onboarding/typing-indicator";
import { ToolPreparingIndicator } from "@/components/onboarding/tool-preparing-indicator";

export default function OnboardingV2Page() {
  const { t } = useAppTranslation(["onboarding", "common"]);

  const onboardingStream = useOnboarding();
  const {
    messages,
    isLoading,
    error,
    isThinking,
    isStreaming,
    isPreparingTool,
    clearError,
    handleComponentResponse,
    handleSubmit,
    isSubmitting,
  } = onboardingStream;

  // Loading state
  if (isLoading) {
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

  return (
    <div className="flex h-screen container mx-auto">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
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

        {/* Messages Area - flex-1 to take remaining space */}
        <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
          <MessageList
            messages={messages}
            onComponentResponse={handleComponentResponse}
          />
          {isThinking && <TypingIndicator />}
          {isPreparingTool && <ToolPreparingIndicator />}
        </div>

        {/* Input Area - fixed at bottom */}
        <div className="flex-shrink-0 rounded-t-button overflow-hidden bg-white">
          <ChatInput
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            disabled={isThinking || isStreaming}
          />
        </div>
      </div>
    </div>
  );
}
