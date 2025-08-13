"use client";

import {
  ComponentResponse,
  OnboardingComponent,
} from "@/lib/types/onboarding.types";
import { FinancialInputComponent } from "./financial-input-component";
import { GoalSelectorComponent } from "./goal-selector-component";
import { IntroductionTemplateComponent } from "./introduction-template-component";
import { SliderComponent } from "./slider-component";
import { TextInputComponent } from "./text-input-component";
// New stage-first components
import { DecisionTreeComponent } from "./decision-tree-component";
import { EducationContentComponent } from "./education-content-component";
import { ExpenseCategoriesComponent } from "./expense-categories-component";
import { FinishOnboarding } from "./finish-onboarding";
import { GoalConfirmationComponent } from "./goal-confirmation-component";
import { InfinAppQR } from "./infina-app-qr";
import { SavingsCapacityComponent } from "./savings-capacity-component";
import { StageSelectorComponent } from "./stage-selector-component";
import { Suggestions } from "./suggestions";
// Budget allocation enhancement components
import BudgetAllocationTool from "./budget-allocation-tool";
import BudgetCategoryEducation from "./budget-category-education";
import BudgetSummaryComponent from "./budget-summary-component";
import PhilosophySelection from "./philosophy-selection";

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
    case "slider":
      return (
        <SliderComponent component={component} onResponse={handleResponse} />
      );

    case "text_input":
      return (
        <TextInputComponent component={component} onResponse={handleResponse} />
      );

    case "financial_input":
      return (
        <FinancialInputComponent
          component={component}
          onResponse={handleResponse}
        />
      );

    case "goal_selector":
      return (
        <GoalSelectorComponent
          component={component}
          onResponse={handleResponse}
        />
      );

    case "introduction_template":
      return (
        <IntroductionTemplateComponent
          component={component}
          onResponse={handleResponse}
        />
      );

    case "stage_selector":
      return (
        <StageSelectorComponent
          component={component}
          onResponse={handleResponse}
        />
      );

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

    case "savings_capacity":
      return (
        <SavingsCapacityComponent
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

    case "budget_allocation_tool":
      return (
        <BudgetAllocationTool
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

    default:
      return (
        <div className="p-4 bg-[#F44336] bg-opacity-10 rounded-lg text-[#F44336] text-sm">
          Unknown component type: {component.type}
        </div>
      );
  }
}
