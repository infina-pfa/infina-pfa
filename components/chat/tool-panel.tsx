"use client";

import { useResponsive } from "@/hooks/use-responsive";
import { useAppTranslation } from "@/hooks/use-translation";
import { ChatToolId } from "@/lib/types/ai-streaming.types";
import { Budget } from "@/lib/types/budget.types";
import { ChatMessage, DEFAULT_CHAT_SUGGESTIONS } from "@/lib/types/chat.types";
import { toolMessageTemplates } from "@/lib/utils/tool-message-templates";
import { useState } from "react";
import { AINotificationCard } from "./ai-notification-card";
import { ChatPopup } from "./chat-popup";
import { FloatingAIButton } from "./floating-ai-button";
import { ToolContent } from "./tool-content";
import { ToolFooter } from "./tool-footer";
import { ToolHeader } from "./tool-header";
import { ToolLayout } from "./tool-layout";

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
  sendMessage: (
    message: string,
    options?: { isToolMessage?: boolean }
  ) => Promise<void>;
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
  const [showNotification, setShowNotification] = useState(false);

  if (!isOpen || !toolId) {
    return null;
  }

  // Tool action callback handlers
  const handleBudgetCreated = async (budget: Budget) => {
    const message = toolMessageTemplates.budgetCreated(
      budget.name,
      budget.amount
    );
    sendToolMessage(message);
  };

  const handleBudgetUpdated = async (budget: Budget, oldAmount?: number) => {
    const message = toolMessageTemplates.budgetUpdated(
      budget.name,
      budget.amount,
      oldAmount
    );
    sendToolMessage(message);
  };

  const handleExpenseCreated = async (
    name: string,
    amount: number,
    budgetName: string
  ) => {
    const message = toolMessageTemplates.expenseCreated(
      name,
      amount,
      budgetName
    );
    sendToolMessage(message);
  };

  const handleExpenseUpdated = async (
    name: string,
    amount: number,
    oldAmount?: number
  ) => {
    const message = toolMessageTemplates.expenseUpdated(
      name,
      amount,
      oldAmount
    );
    await sendToolMessage(message);
  };

  const sendToolMessage = async (userMessage: string) => {
    try {
      setShowNotification(true);
      await chatFlowState?.sendMessage(userMessage, { isToolMessage: true });
    } catch (error) {
      console.error("Failed to send tool message:", error);
      // Reset notification on error
      setShowNotification(false);
    }
  };

  const closeNotification = () => {
    setShowNotification(false);
  };

  const openFullChat = () => {
    setShowNotification(false);
    setIsChatOpen(true);
  };

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

  const contentComponent = (
    <ToolContent
      toolId={toolId}
      isMobile={isMobile}
      onBudgetCreated={handleBudgetCreated}
      onBudgetUpdated={handleBudgetUpdated}
      onExpenseCreated={handleExpenseCreated}
      onExpenseUpdated={handleExpenseUpdated}
    />
  );

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

      {/* AI Notification Card */}
      <AINotificationCard
        isVisible={showNotification}
        chatState={chatFlowState}
        onClose={closeNotification}
        onOpenChat={openFullChat}
      />

      {/* Chat Popup */}
      <ChatPopup
        isOpen={isChatOpen}
        onClose={closeChat}
        chatFlowState={chatFlowState}
      />
    </>
  );
}
