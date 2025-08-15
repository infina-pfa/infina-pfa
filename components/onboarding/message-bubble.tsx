"use client";

import { OnboardingComponentRenderer } from "@/components/onboarding/onboarding-component-renderer";
import {
  ComponentResponse,
  OnboardingComponent,
} from "@/lib/types/onboarding.types";
import { User } from "lucide-react";
import { MarkdownMessage } from "../chat";

interface OnboardingMessage {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  createdAt: string;
  component?: OnboardingComponent;
}

interface MessageBubbleProps {
  message: OnboardingMessage;
  onComponentResponse?: (
    componentId: string,
    response: ComponentResponse
  ) => Promise<void>;
}

export function MessageBubble({
  message,
  onComponentResponse,
}: MessageBubbleProps) {
  const isUser = message.type === "user";
  const isSystem = message.type === "system";
  const hasComponent = !!message.component;

  if (!isUser && !isSystem && !hasComponent && !message.content) {
    return null;
  }

  if (isSystem) {
    return (
      <div className="flex justify-center mb-6">
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-base font-nunito">
          {message.content}
        </div>
      </div>
    );
  }

  // AI messages: no avatar, no background, full width
  if (!isUser) {
    return (
      <div className="flex justify-start mb-6 w-full">
        <div className="flex flex-col w-full">
          {/* Text content if present */}
          {message.content && !hasComponent && (
            <div className="w-full">
              <MarkdownMessage content={message.content} />
            </div>
          )}

          {/* Component renderer if present */}
          {hasComponent && message.component && onComponentResponse && (
            <div className="bg-white rounded-2xl shadow-sm p-4 w-full">
              <OnboardingComponentRenderer
                component={message.component}
                onResponse={onComponentResponse}
              />
            </div>
          )}

          {/* Timestamp */}
          <div className="text-sm text-gray-500 mt-2 font-nunito">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    );
  }

  // User messages: keep existing styling with avatar and background
  return (
    <div className="flex justify-end mb-6">
      <div className="flex items-start gap-4 max-w-[80%] flex-row-reverse">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200">
          <User className="w-5 h-5 text-gray-600" />
        </div>

        {/* Message Content */}
        <div className="flex flex-col">
          <div className="rounded-2xl px-4 py-3 bg-blue-600 text-white rounded-br-sm">
            <p className="text-base font-nunito whitespace-pre-wrap">
              {message.content}
            </p>
          </div>

          {/* Timestamp */}
          <div className="text-sm text-gray-500 mt-2 font-nunito text-right">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
