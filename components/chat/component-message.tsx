"use client";

import { ChatComponentId } from "@/lib/types/ai-streaming.types";
import { ChatMessage } from "@/lib/types/chat.types";
import { FinancialOverviewCard } from "./financial-overview-card";
import { VideoMessage } from "./video-message";

const today = new Date();
const currentMonth = today.getMonth() + 1;
const currentYear = today.getFullYear();

export function ComponentMessage({ message }: { message: ChatMessage }) {
  const component = message.metadata as {
    action: {
      payload: {
        componentId: ChatComponentId;
        videoURL?: string;
      };
    };
  };

  if (
    component?.action?.payload?.componentId === ChatComponentId.BUDGET_OVERVIEW
  ) {
    return <FinancialOverviewCard month={currentMonth} year={currentYear} />;
  }

  if (
    component?.action?.payload?.componentId === ChatComponentId.VIDEO &&
    component?.action?.payload?.videoURL
  ) {
    return <VideoMessage videoURL={component.action.payload.videoURL} />;
  }

  return null;
}
