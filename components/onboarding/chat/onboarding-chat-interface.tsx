"use client";

import { useEffect, useRef } from "react";
import { useAppTranslation } from "@/hooks/use-translation";
import { useOnboardingChat } from "@/hooks/use-onboarding-chat";
import { OnboardingMessageBubble } from "./onboarding-message-bubble";
import { OnboardingChatInput } from "./onboarding-chat-input";
import { OnboardingTypingIndicator } from "./onboarding-typing-indicator";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";

interface OnboardingChatInterfaceProps {
  userId: string;
  onComplete: () => void;
}

export function OnboardingChatInterface({ 
  userId, 
  onComplete 
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
    return <OnboardingChatSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 px-4">
          <div className="w-16 h-16 bg-[#F44336] bg-opacity-10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-[#F44336] text-2xl">!</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#111827] mb-2">
              {t("errorTitle")}
            </h3>
            <p className="text-[#6B7280] text-sm">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages - Flexible height with scroll */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 md:px-0 pb-4 scrollbar-hidden md:scrollbar-thin md:scrollbar-thumb-[#E5E7EB] md:scrollbar-track-transparent"
        style={{ 
          minHeight: '0', // Important for flexbox
          scrollBehavior: 'smooth' 
        }}
      >
        <div className="space-y-4">
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

      {/* Chat Input - Fixed at bottom */}
      <div className="flex-shrink-0 px-4 md:px-0 pt-4 border-t border-[#E5E7EB] bg-white">
        <OnboardingChatInput
          onSendMessage={sendMessage}
          disabled={isAIThinking || isStreaming}
          placeholder={t("chatInputPlaceholder")}
        />
      </div>
    </div>
  );
}

function OnboardingChatSkeleton() {
  return (
    <div className="flex flex-col h-full space-y-4 px-4 md:px-0">
      {/* Message skeletons */}
      <div className="flex-1 space-y-4 overflow-hidden">
        <div className="flex justify-start">
          <div className="space-y-2 max-w-[80%]">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Skeleton className="h-4 w-32 max-w-[80%]" />
        </div>
        
        <div className="flex justify-start">
          <div className="space-y-2 max-w-[80%]">
            <Skeleton className="h-24 w-full max-w-sm" />
          </div>
        </div>
      </div>
      
      {/* Input skeleton */}
      <div className="flex-shrink-0 pt-4 border-t border-[#E5E7EB]">
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
} 