"use client";

import { ChatComponentId } from "@/lib/types/ai-streaming.types";
import { ChatMessage, ChatSuggestion } from "@/lib/types/chat.types";
import { FinancialOverviewCard } from "./financial-overview-card";
import { VideoMessage } from "./video-message";
import { SuggestionList } from "./suggestion-list";
import { GoalDashboardMessage } from "./goal-dashboard-message";
import { BudgetingDashboardMessage } from "./budgeting-dashboard-message";
import { MonthlyBudgetAnalysisMessage } from "./monthly-budget-analysis-message";
import { BudgetDetailMessage } from "./budget-detail-message";


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

  if (componentId === ChatComponentId.BUDGET_DETAIL) {
    return <BudgetDetailMessage onSendMessage={onSendMessage} />;
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

  if (componentId === ChatComponentId.GOAL_DASHBOARD) {
    return <GoalDashboardMessage onSendMessage={onSendMessage} />;
  }

  if (componentId === ChatComponentId.BUDGETING_DASHBOARD) {
    return <BudgetingDashboardMessage onSendMessage={onSendMessage} />;
  }

  if (componentId === ChatComponentId.MONTHLY_BUDGET_ANALYSIS) {
    return <MonthlyBudgetAnalysisMessage onSendMessage={onSendMessage} />;
  }

  return null;
}
