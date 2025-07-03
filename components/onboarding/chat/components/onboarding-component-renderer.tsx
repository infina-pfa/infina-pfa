"use client";

import { OnboardingComponent, ComponentResponse } from "@/lib/types/onboarding.types";
import { MultipleChoiceComponent } from "./multiple-choice-component";
import { RatingScaleComponent } from "./rating-scale-component";
import { SliderComponent } from "./slider-component";
import { TextInputComponent } from "./text-input-component";
import { FinancialInputComponent } from "./financial-input-component";
import { GoalSelectorComponent } from "./goal-selector-component";
import { IntroductionTemplateComponent } from "./introduction-template-component";

interface OnboardingComponentRendererProps {
  component: OnboardingComponent;
  onResponse: (componentId: string, response: ComponentResponse) => Promise<void>;
}

export function OnboardingComponentRenderer({
  component,
  onResponse,
}: OnboardingComponentRendererProps) {
  const handleResponse = async (response: ComponentResponse) => {
    await onResponse(component.id, response);
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
        <SliderComponent
          component={component}
          onResponse={handleResponse}
        />
      );

    case "text_input":
      return (
        <TextInputComponent
          component={component}
          onResponse={handleResponse}
        />
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

    default:
      return (
        <div className="p-4 bg-[#F44336] bg-opacity-10 rounded-lg text-[#F44336] text-sm">
          Unknown component type: {component.type}
        </div>
      );
  }
} 