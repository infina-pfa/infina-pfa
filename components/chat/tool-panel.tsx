"use client";

import { useAppTranslation } from "@/hooks/use-translation";
import { ChatToolId } from "@/lib/types/ai-streaming.types";
import { useResponsive } from "@/hooks/use-responsive";
import { ToolHeader } from "./tool-header";
import { ToolContent } from "./tool-content";
import { ToolFooter } from "./tool-footer";
import { ToolLayout } from "./tool-layout";

interface ToolPanelProps {
  onClose: () => void;
  toolId: ChatToolId | null;
  isOpen?: boolean;
}

export function ToolPanel({ onClose, toolId, isOpen = false }: ToolPanelProps) {
  const { t } = useAppTranslation(["chat", "common"]);
  const { isMobile } = useResponsive();

  if (!isOpen || !toolId) {
    return null;
  }

  const handleUseTool = () => {
    // Implement tool usage logic here
    console.log(`Using tool: ${toolId}`);
    onClose();
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
    <ToolLayout
      isMobile={isMobile}
      header={headerComponent}
      content={contentComponent}
      footer={footerComponent}
    />
  );
}
