"use client";

import { ChatComponentId } from "@/lib/types/ai-streaming.types";
import { ChatMessage, ChatSuggestion } from "@/lib/types/chat.types";
import { FinancialOverviewCard } from "./financial-overview-card";
import { VideoMessage } from "./video-message";
import { SuggestionList } from "./suggestion-list";

const today = new Date();
const currentMonth = today.getMonth() + 1;
const currentYear = today.getFullYear();

export function ComponentMessage({
  message,
  onSendMessage,
}: {
  message: ChatMessage;
  onSendMessage?: (message: string) => void;
}) {
  const component = message.metadata as {
    action: {
      payload: {
        componentId: ChatComponentId;
        videoURL?: string;
      };
    };
  };
  const componentId = component?.action?.payload?.componentId;

  if (componentId === ChatComponentId.BUDGET_OVERVIEW) {
    return <FinancialOverviewCard month={currentMonth} year={currentYear} />;
  }

  if (
    componentId === ChatComponentId.VIDEO &&
    component?.action?.payload?.videoURL
  ) {
    return <VideoMessage videoURL={component.action.payload.videoURL} />;
  }

  if (componentId === ChatComponentId.SUGGESTIONS) {
    return (
      <SuggestionList
        suggestions={
          (
            component.action.payload as unknown as {
              context: {
                suggestions: ChatSuggestion[];
              };
            }
          ).context.suggestions
        }
        onSuggestionClick={onSendMessage}
        isSubmitting={false}
      />
    );
  }

  return null;
}
