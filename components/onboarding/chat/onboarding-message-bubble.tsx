"use client";

import {
  OnboardingMessage,
  ComponentResponse,
  OnboardingComponent,
} from "@/lib/types/onboarding.types";
import { OnboardingComponentRenderer } from "./components/onboarding-component-renderer";
import { MarkdownRenderer } from "./markdown-renderer";
import { formatDistanceToNow } from "date-fns";
import { Bot, User } from "lucide-react";
import { useEffect, useState } from "react";

interface OnboardingMessageBubbleProps {
  message: OnboardingMessage;
  onComponentResponse: (
    componentId: string,
    response: ComponentResponse
  ) => Promise<void>;
}

export function OnboardingMessageBubble({
  message,
  onComponentResponse,
}: OnboardingMessageBubbleProps) {
  const isAI = message.type === "ai" || message.type === "component";
  const isComponent = !!(message.component || message.metadata?.component);
  const [showComponent, setShowComponent] = useState(false);

  // Add fade-in animation for components
  useEffect(() => {
    if (isComponent) {
      // Small delay to trigger animation
      const timer = setTimeout(() => {
        setShowComponent(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isComponent]);

  return (
    <div
      className={`flex ${
        isAI ? "justify-start" : "justify-end"
      } mb-3 sm:mb-4 animate-fadeIn`}
    >
      <div
        className={`flex max-w-[90%] sm:max-w-[80%] ${
          isAI ? "flex-row" : "flex-row-reverse"
        }`}
      >
        {/* Avatar */}
        <div
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isAI
              ? "bg-[#0055FF] text-white mr-2 sm:mr-3"
              : "bg-[#F0F2F5] text-[#6B7280] ml-2 sm:ml-3"
          }`}
        >
          {isAI ? (
            <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
          ) : (
            <User className="w-3 h-3 sm:w-4 sm:h-4" />
          )}
        </div>

        {/* Message Content */}
        <div className="flex flex-col min-w-0 flex-1">
          {/* Message bubble */}
          <div
            className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl ${
              isAI ? "bg-[#F0F2F5] text-[#111827]" : "bg-[#0055FF] text-white"
            }`}
          >
            {message.content && !isComponent && (
              <div className="break-words">
                {isAI ? (
                  <MarkdownRenderer content={message.content as string} />
                ) : (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                )}
              </div>
            )}

            {isComponent &&
              (message.component || message.metadata?.component) && (
                <div
                  className={`transition-all duration-500 ease-out ${
                    showComponent
                      ? "opacity-100 transform translate-y-0"
                      : "opacity-0 transform translate-y-2"
                  }`}
                >
                  <OnboardingComponentRenderer
                    component={
                      (message.component ||
                        message.metadata?.component) as OnboardingComponent
                    }
                    onResponse={onComponentResponse}
                  />
                </div>
              )}
          </div>

          <div
            className={`text-xs text-[#6B7280] mt-1 ${
              isAI ? "text-left" : "text-right"
            }`}
          >
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  );
}
