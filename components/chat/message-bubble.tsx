"use client";

import { ChatMessage } from "@/lib/types/chat.types";
import { MessageTimestamp } from "./message-timestamp";
import { ToolMessage } from "./tool-message";
import { TextMessage } from "./text-message";
import { ComponentMessage } from "./component-message";

interface MessageBubbleProps {
  message: ChatMessage;
  onToolClick?: (toolId: string) => void;
}

export function MessageBubble({ message, onToolClick }: MessageBubbleProps) {
  const isUser = message.sender === "user";

  if (message.sender === "system") {
    return null;
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`flex max-w-[80%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        } items-start gap-4`}
      >
        <div
          className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
        >
          {message.type === "text" && (
            <TextMessage message={message} isUser={isUser} />
          )}

          {message.type === "tool" && (
            <ToolMessage message={message} onToolClick={onToolClick} />
          )}

          {message.type === "component" && (
            <ComponentMessage message={message} />
          )}

          <MessageTimestamp timestamp={message.created_at} isUser={isUser} />
        </div>
      </div>
    </div>
  );
}
