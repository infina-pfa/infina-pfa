"use client";

import { useAppTranslation } from "@/hooks/use-translation";
import { useOnboardingChat } from "@/hooks/use-onboarding-chat";
import { OnboardingMessage } from "@/lib/types/onboarding.types";
import { OnboardingMessageBubble } from "./onboarding-message-bubble";
import { OnboardingChatInput } from "./onboarding-chat-input";
import { OnboardingTypingIndicator } from "./onboarding-typing-indicator";
import { OnboardingProgress } from "./onboarding-progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ComponentResponse } from "@/lib/types/onboarding.types";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  
  const {
    state,
    messages,
    isLoading,
    isAIThinking,
    isStreaming,
    error,
    sendMessage,
    handleComponentResponse,
  } = useOnboardingChat(userId, onComplete);

  if (isLoading) {
    return <OnboardingChatSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
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
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <OnboardingProgress currentStep={state.step} />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6">
        {messages.map((message) => (
          <OnboardingMessageBubble
            key={message.id}
            message={message}
            onComponentResponse={handleComponentResponse}
          />
        ))}
        
        {/* Thinking indicator */}
        {isAIThinking && (
          <OnboardingTypingIndicator />
        )}
      </div>

      {/* Chat Input */}
      <div className="flex-shrink-0">
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
    <div className="flex flex-col h-full max-w-4xl mx-auto space-y-6">
      {/* Progress skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-2 w-64" />
      </div>
      
      {/* Message skeletons */}
      <div className="space-y-4">
        <div className="flex justify-start">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Skeleton className="h-4 w-32" />
        </div>
        
        <div className="flex justify-start">
          <div className="space-y-2">
            <Skeleton className="h-24 w-80" />
          </div>
        </div>
      </div>
      
      {/* Input skeleton */}
      <div className="flex-shrink-0">
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
} 