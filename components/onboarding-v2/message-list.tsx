"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import { ComponentResponse, OnboardingComponent } from "@/lib/types/onboarding.types";

interface OnboardingMessage {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  component?: OnboardingComponent;
}

interface MessageListProps {
  messages: OnboardingMessage[];
  onComponentResponse?: (componentId: string, response: ComponentResponse) => Promise<void>;
}

export function MessageList({ messages, onComponentResponse }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((message) => (
        <MessageBubble 
          key={message.id} 
          message={message} 
          onComponentResponse={onComponentResponse}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}