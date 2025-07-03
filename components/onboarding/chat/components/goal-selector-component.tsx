"use client";

import { OnboardingComponent, ComponentResponse } from "@/lib/types/onboarding.types";
import { MultipleChoiceComponent } from "./multiple-choice-component";

interface GoalSelectorComponentProps {
  component: OnboardingComponent;
  onResponse: (response: ComponentResponse) => Promise<void>;
}

export function GoalSelectorComponent(props: GoalSelectorComponentProps) {
  // For now, goal selector is just a specialized multiple choice component
  return <MultipleChoiceComponent {...props} />;
} 