"use client";

import { useEffect, useRef } from "react";
import { useAppTranslation } from "@/hooks/use-translation";
import { useOnboardingChat } from "@/hooks/use-onboarding-chat";
import { OnboardingMessageBubble } from "./onboarding-message-bubble";
import { OnboardingChatInput } from "./onboarding-chat-input";
import { OnboardingTypingIndicator } from "./onboarding-typing-indicator";
import { AnimatePresence, motion } from "framer-motion";

interface OnboardingChatInterfaceProps {
  userId: string;
  onComplete: () => void;
}

export function OnboardingChatInterface({
  userId,
  onComplete,
}: OnboardingChatInterfaceProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    isAIThinking,
    isStreaming,
    error,
    sendMessage,
    handleComponentResponse,
  } = useOnboardingChat(userId, onComplete);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    scrollToBottom();
  }, [messages, isAIThinking]);

  // Smooth scroll when streaming
  useEffect(() => {
    if (isStreaming && chatContainerRef.current) {
      const container = chatContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [isStreaming, messages]);

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
    <div className="flex h-full bg-gray-50 p-0 md:p-8">
      <div className="flex-1 flex flex-col w-full">
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
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto scrollbar-hide px-4 md:px-0"
        >
          <div className="space-y-4 pb-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <OnboardingMessageBubble
                    message={message}
                    onComponentResponse={handleComponentResponse}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Thinking indicator */}
            {isAIThinking && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <OnboardingTypingIndicator />
              </motion.div>
            )}

            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="px-4 md:px-0">
          <OnboardingChatInput
            onSendMessage={sendMessage}
            disabled={isAIThinking || isStreaming}
            placeholder={t("chatInputPlaceholder")}
          />
        </div>
      </div>
    </div>
  );
}
