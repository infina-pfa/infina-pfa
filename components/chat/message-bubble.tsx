"use client";

import { ChatMessage } from "@/lib/types/chat.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { MarkdownMessage } from "./markdown-message";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  console.log("🚀 ~ MessageBubble ~ message:", message);
  const { t } = useAppTranslation(["chat", "common"]);
  const isUser = message.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div
        className={`flex max-w-[80%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        } items-start gap-4`}
      >
        {/* Message Content */}
        <div
          className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
        >
          {/* Message Bubble */}
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
            {/* Streaming indicator */}
            {message.isStreaming && message.streamingContent ? (
              <div className="relative">
                {isUser ? (
                  <span>{message.streamingContent}</span>
                ) : (
                  <MarkdownMessage
                    content={message.streamingContent}
                    isUser={isUser}
                  />
                )}
              </div>
            ) : (
              <div>
                {isUser ? (
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                ) : (
                  <MarkdownMessage
                    content={message.content}
                    isUser={isUser}
                    className="[&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>h1]:mb-2 [&>h2]:mb-2 [&>h3]:mb-2 [&>h4]:mb-2 [&>h5]:mb-2 [&>h6]:mb-2 [&>blockquote]:mb-2 [&>pre]:mb-2"
                  />
                )}
              </div>
            )}
          </div>

          {/* Component Display */}
          {message.type === "tool" && (
            <div className="mt-3 p-4 bg-blue-50 rounded-xl max-w-full">
              <div className="flex items-center gap-3 mb-3">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
                <span className="text-base font-semibold text-blue-900 font-nunito">
                  {(
                    message.metadata as {
                      action: { payload: { toolId: string } };
                    }
                  )?.action?.payload?.toolId || t("componentSuggestion")}
                </span>
              </div>

              <button
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors font-nunito font-semibold cursor-pointer"
                onClick={() => {
                  // This will be handled by the parent component
                  console.log(
                    "Open component:",
                    (
                      message.metadata as {
                        action: { payload: { toolId: string } };
                      }
                    )?.action?.payload?.toolId
                  );
                }}
              >
                {t("openTool")}
              </button>
            </div>
          )}

          {/* Timestamp */}
          <div
            className={`text-sm text-gray-500 mt-2 font-nunito ${
              isUser ? "text-right" : "text-left"
            }`}
          >
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
