"use client";

import { useAppTranslation } from "@/hooks/use-translation";
import { ChatToolId } from "@/lib/types/ai-streaming.types";
import { useResponsive } from "@/hooks/use-responsive";
import { useState } from "react";
import { ToolHeader } from "./tool-header";
import { ToolContent } from "./tool-content";
import { ToolFooter } from "./tool-footer";
import { ToolLayout } from "./tool-layout";
import { FloatingAIButton } from "./floating-ai-button";
import { ChatPopup } from "./chat-popup";
import { ChatMessage, DEFAULT_CHAT_SUGGESTIONS } from "@/lib/types/chat.types";

interface ChatFlowState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isThinking: boolean;
  isStreaming: boolean;
  showSuggestions: boolean;
  clearError: () => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSubmit: () => Promise<void>;
  isSubmitting: boolean;
  suggestions: typeof DEFAULT_CHAT_SUGGESTIONS;
  onSuggestionClick: (suggestion: string) => Promise<void>;
  conversationId: string | null;
}

interface ToolPanelProps {
  onClose: () => void;
  toolId: ChatToolId | null;
  isOpen?: boolean;
  chatFlowState?: ChatFlowState;
}

export function ToolPanel({
  onClose,
  toolId,
  isOpen = false,
  chatFlowState,
}: ToolPanelProps) {
  const { t } = useAppTranslation(["chat", "common"]);
  const { isMobile } = useResponsive();
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (!isOpen || !toolId) {
    return null;
  }

  const handleUseTool = () => {
    // Implement tool usage logic here
    console.log(`Using tool: ${toolId}`);
    onClose();
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const headerComponent = (
    <ToolHeader
      title={isMobile ? t(toolId, { ns: "common" }) : t("componentPanelTitle")}
      onClose={onClose}
      isMobile={isMobile}
    />
  );

  const contentComponent = <ToolContent toolId={toolId} isMobile={isMobile} />;

  const footerComponent = !isMobile ? (
    <ToolFooter onClose={onClose} onUse={handleUseTool} />
  ) : undefined;

  return (
    <>
      <ToolLayout
        isMobile={isMobile}
        header={headerComponent}
        content={contentComponent}
        footer={footerComponent}
      />

      {/* Floating AI Button - Only on mobile */}
      {isMobile && <FloatingAIButton onClick={toggleChat} />}

      {/* Chat Popup */}
      <ChatPopup
        isOpen={isChatOpen}
        onClose={closeChat}
        chatFlowState={chatFlowState}
      />
    </>
  );
}
