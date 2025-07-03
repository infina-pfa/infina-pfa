"use client";

import { OnboardingMessage, ComponentResponse } from "@/lib/types/onboarding.types";
import { OnboardingComponentRenderer } from "./components/onboarding-component-renderer";
import { formatDistanceToNow } from "date-fns";
import { Bot, User } from "lucide-react";

interface OnboardingMessageBubbleProps {
  message: OnboardingMessage;
  onComponentResponse: (componentId: string, response: ComponentResponse) => Promise<void>;
}

export function OnboardingMessageBubble({
  message,
  onComponentResponse,
}: OnboardingMessageBubbleProps) {
  const isAI = message.type === "ai" || message.type === "component";
  const isComponent = !!message.component;

  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"} mb-4`}>
      <div className={`flex max-w-[80%] ${isAI ? "flex-row" : "flex-row-reverse"}`}>
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isAI
              ? "bg-[#0055FF] text-white mr-3"
              : "bg-[#F0F2F5] text-[#6B7280] ml-3"
          }`}
        >
          {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>

        {/* Message Content */}
        <div className="flex flex-col">
          {/* Message bubble */}
          <div
            className={`px-4 py-3 rounded-2xl ${
              isAI
                ? "bg-[#F0F2F5] text-[#111827]"
                : "bg-[#0055FF] text-white"
            }`}
          >
            {/* Text content */}
            {message.content && (
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
            )}

            {/* Component content */}
            {isComponent && message.component && (
              <div className="mt-3">
                <OnboardingComponentRenderer
                  component={message.component}
                  onResponse={onComponentResponse}
                />
              </div>
            )}
          </div>

          {/* Timestamp */}
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