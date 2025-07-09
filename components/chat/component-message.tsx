"use client";

import { ChatComponentId } from "@/lib/types/ai-streaming.types";
import { ChatMessage } from "@/lib/types/chat.types";
import { FinancialOverviewCard } from "./financial-overview-card";

const today = new Date();
const currentMonth = today.getMonth() + 1;
const currentYear = today.getFullYear();

export function ComponentMessage({ message }: { message: ChatMessage }) {
  const component = message.metadata as {
    action: {
      payload: {
        componentId: ChatComponentId;
      };
    };
  };

  if (
    component?.action?.payload?.componentId === ChatComponentId.BUDGET_OVERVIEW
  ) {
    return <FinancialOverviewCard month={currentMonth} year={currentYear} />;
  }

  return null;
}
