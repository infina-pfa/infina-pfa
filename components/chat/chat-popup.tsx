"use client";

import { useAppTranslation } from "@/hooks/use-translation";
import { ToolChatInterface } from "./tool-chat-interface";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  chatFlowState?: ChatFlowState;
}

export function ChatPopup({ isOpen, onClose, chatFlowState }: ChatPopupProps) {
  const { t } = useAppTranslation(["chat", "common"]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="h-[85vh] max-h-[85vh] p-0 bg-white rounded-t-xl border-0 shadow-2xl"
      >
        <SheetHeader className="px-6 py-4 border-b border-gray-100">
          <SheetTitle className="text-lg font-semibold text-gray-900 font-nunito">
            {t("aiAssistant")}
          </SheetTitle>
        </SheetHeader>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden h-full">
          <ToolChatInterface chatFlowState={chatFlowState} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
