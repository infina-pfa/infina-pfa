"use client";

import { ChatMessage } from "@/lib/types/chat.types";
import { MarkdownMessage } from "./markdown-message";

interface TextMessageProps {
  message: ChatMessage;
  isUser: boolean;
}

export function TextMessage({ message, isUser }: TextMessageProps) {
  return (
    <div
      className={`
        px-4 py-3 rounded-2xl max-w-full font-nunito text-base
        ${
          isUser
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-gray-100 text-gray-900 rounded-bl-sm"
        }
      `}
    >
      {isUser ? (
        <span>{message.content}</span>
      ) : (
        <MarkdownMessage
          content={message.streamingContent || message.content || ""}
          isUser={false}
        />
      )}
    </div>
  );
}
