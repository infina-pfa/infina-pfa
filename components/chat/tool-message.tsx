"use client";

import { ChatMessage } from "@/lib/types/chat.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { ToolIcon } from "./tool-icon";
import { ToolButton } from "./tool-button";

interface ToolMessageProps {
  message: ChatMessage;
  onToolClick?: (toolId: string) => void;
}

export function ToolMessage({ message, onToolClick }: ToolMessageProps) {
  const { t } = useAppTranslation(["chat", "common"]);

  const toolId = (
    message.metadata as {
      action: { payload: { toolId: string } };
    }
  )?.action?.payload?.toolId;

  return (
    <div className="mt-3 p-4 bg-blue-50 rounded-xl max-w-full">
      <div className="flex items-center gap-3 mb-3">
        <ToolIcon />
        <span className="text-base font-semibold text-blue-900 font-nunito">
          {toolId || t("componentSuggestion")}
        </span>
      </div>

      <ToolButton toolId={toolId} onClick={() => onToolClick?.(toolId)} />
    </div>
  );
}
