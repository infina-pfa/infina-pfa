"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Conversation } from "@/lib/types/conversation.types";
import { Message } from "@/lib/types/message.types";

interface ChatAreaProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  isSending: boolean;
  isMobile?: boolean;
}

export const ChatArea = ({
  conversation,
  messages,
  onSendMessage,
  isLoading,
  isSending,
  isMobile = false,
}: ChatAreaProps) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    onSendMessage(inputValue.trim());
    setInputValue("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.sender_type === "USER";

    return (
      <div
        className={`flex ${
          isUser ? "justify-end" : "justify-start"
        } mb-3 md:mb-4`}
      >
        <div
          className={`flex ${isMobile ? "max-w-[85%]" : "max-w-[70%]"} ${
            isUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {/* Avatar */}
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full ${
              isUser ? "bg-[#0055FF] ml-3" : "bg-[#2ECC71] mr-3"
            } flex items-center justify-center`}
          >
            {isUser ? (
              <User size={16} className="text-white" />
            ) : (
              <Bot size={16} className="text-white" />
            )}
          </div>

          {/* Message Content */}
          <div
            className={`rounded-2xl ${isMobile ? "px-3 py-2" : "px-4 py-3"} ${
              isUser ? "bg-[#0055FF] text-white" : "bg-white text-gray-900"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
            <div
              className={`text-xs mt-2 ${
                isUser ? "text-blue-100" : "text-gray-500"
              }`}
            >
              {formatTime(message.created_at)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - Hidden on mobile since we have mobile header in main page */}
      {!isMobile && (
        <div className="p-4 bg-white border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {conversation.title}
          </h2>
          <p className="text-sm text-gray-500">
            {t("messageCount", { count: messages.length })}
          </p>
        </div>
      )}

      {/* Messages */}
      <div
        className={`flex-1 overflow-y-auto ${
          isMobile ? "p-3" : "p-4"
        } space-y-1`}
      >
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`flex ${
                  i % 2 === 0 ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex max-w-[70%]">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse mr-3"></div>
                  <div className="bg-gray-200 rounded-2xl px-4 py-3 animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="text-gray-500">
              <Bot size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm">{t("noMessagesYet")}</p>
              <p className="text-xs mt-1">{t("startConversation")}</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isSending && (
              <div className="flex justify-end mb-4">
                <div className="flex max-w-[70%] flex-row-reverse">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0055FF] ml-3 flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <div className="bg-[#0055FF]/70 text-white rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-end gap-2 md:gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={t("typeYourMessage")}
              className="w-full px-3 md:px-4 py-2 md:py-3 pr-10 md:pr-12 bg-[#F0F2F5] rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#0055FF]/20 text-sm min-h-[44px] md:min-h-[48px] max-h-[120px]"
              rows={1}
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isSending}
              className="absolute right-1 md:right-2 bottom-1 md:bottom-2 p-2 bg-[#0055FF] text-white rounded-full hover:bg-[#0055FF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={14} className="md:w-4 md:h-4" />
            </button>
          </div>
        </form>
        <p className="text-xs text-gray-400 mt-1 md:mt-2 hidden md:block">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};
