"use client";

import {
  OnboardingComponent,
  ComponentResponse,
} from "@/lib/types/onboarding.types";
import { MultipleChoiceComponent } from "./multiple-choice-component";
import { RatingScaleComponent } from "./rating-scale-component";
import { SliderComponent } from "./slider-component";
import { TextInputComponent } from "./text-input-component";
import { FinancialInputComponent } from "./financial-input-component";
import { GoalSelectorComponent } from "./goal-selector-component";
import { IntroductionTemplateComponent } from "./introduction-template-component";
// New stage-first components
import { StageSelectorComponent } from "./stage-selector-component";
import { DecisionTreeComponent } from "./decision-tree-component";
import { ExpenseCategoriesComponent } from "./expense-categories-component";
import { SavingsCapacityComponent } from "./savings-capacity-component";
import { GoalConfirmationComponent } from "./goal-confirmation-component";
import { EducationContentComponent } from "./education-content-component";
import { Suggestions } from "./suggestions";

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
  console.log("🚀 ~ component:", component);
  const handleResponse = async (response: ComponentResponse) => {
    await onResponse(component.id || component.type, response);
  };

  switch (component.type) {
    case "multiple_choice":
      return (
        <MultipleChoiceComponent
          component={component}
          onResponse={handleResponse}
        />
      );

    case "rating_scale":
      return (
        <RatingScaleComponent
          component={component}
          onResponse={handleResponse}
        />
      );

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
            component.context.options?.map((option) => option.label) || []
          }
          onSelect={(suggestion) =>
            handleResponse({
              selectedOption: suggestion,
              completedAt: new Date(),
            })
          }
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
