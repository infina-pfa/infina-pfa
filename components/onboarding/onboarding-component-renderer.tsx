"use client";

import {
  ComponentResponse,
  OnboardingComponent,
} from "@/lib/types/onboarding.types";
// New stage-first components
import { DecisionTreeComponent } from "./decision-tree-component";
import { EducationContentComponent } from "./education-content-component";
import { ExpenseCategoriesComponent } from "./expense-categories-component";
import { FinishOnboarding } from "./finish-onboarding";
import { GoalConfirmationComponent } from "./goal-confirmation-component";
import { InfinAppQR } from "./infina-app-qr";
import { Suggestions } from "./suggestions";
// Budget allocation enhancement components
import BudgetCategoryEducation from "./budget-category-education";
import BudgetSummaryComponent from "./budget-summary-component";
import PhilosophySelection from "./philosophy-selection";
import { DebtList } from "./debt-list";
import { DebtCard } from "./debt-card";
import { DebtTable } from "./debt-table";

interface OnboardingComponentRendererProps {
  component: OnboardingComponent;
  onResponse: (
    componentId: string,
    response: ComponentResponse
  ) => Promise<void>;
}

export function OnboardingComponentRenderer({
  component,
  onResponse,
}: OnboardingComponentRendererProps) {
  const handleResponse = async (response: ComponentResponse) => {
    await onResponse(component.id || component.type, response);
  };

  switch (component.type) {
    case "decision_tree":
      return (
        <DecisionTreeComponent
          component={component}
          onResponse={handleResponse}
        />
      );

    case "expense_categories":
      return (
        <ExpenseCategoriesComponent
          component={component}
          onResponse={handleResponse}
        />
      );

    case "goal_confirmation":
      return (
        <GoalConfirmationComponent
          component={component}
          onResponse={handleResponse}
        />
      );

    case "education_content":
      return (
        <EducationContentComponent
          component={component}
          onResponse={handleResponse}
        />
      );
    case "suggestions":
      return (
        <Suggestions
          suggestions={
            component.context.options?.map((suggestion) => suggestion.label) ||
            []
          }
          onSelect={(suggestionLabel) => {
            handleResponse({
              selectedOption: suggestionLabel,
              completedAt: new Date(),
            });
          }}
        />
      );

    case "infina_qr":
      return <InfinAppQR />;

    case "finish_onboarding":
      return <FinishOnboarding />;

    case "budget_category_education":
      return (
        <BudgetCategoryEducation
          component={component}
          onResponse={handleResponse}
        />
      );

    case "free_to_spend_choice":
      return (
        <PhilosophySelection
          component={component}
          onResponse={handleResponse}
        />
      );

    case "budget_summary":
      return (
        <BudgetSummaryComponent
          component={component}
          onResponse={handleResponse}
        />
      );

    case "debt_list":
      return <DebtList debts={component.context.debts || []} />;

    case "debt_card":
      return (
        <DebtCard
          lender={component.context.debt.lender}
          purpose={component.context.debt.purpose}
          interestRate={component.context.debt.rate}
          dueDate={component.context.debt.dueDate}
          amount={component.context.debt.amount}
          currentPaidAmount={component.context.debt.currentPaidAmount}
        />
      );

    case "debt_table":
      return <DebtTable debts={component.context.debtTable?.debts || []} />;

    default:
      return (
        <div className="p-4 bg-[#F44336] bg-opacity-10 rounded-lg text-[#F44336] text-sm">
          Unknown component type: {component.type}
        </div>
      );
  }
}
