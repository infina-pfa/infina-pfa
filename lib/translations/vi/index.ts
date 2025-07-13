import { commonVi } from "./common";
import { heroVi } from "./hero";
import { howItWorksVi } from "./how-it-works";
import { financialStagesVi } from "./financial-stages";
import { featuresVi } from "./features";
import { testimonialsVi } from "./testimonials";
import { ctaVi } from "./cta";
import { footerVi } from "./footer";
import { authVi } from "./auth";
import { chatVi } from "./chat";
import { onboardingVi } from "./onboarding";
import { budgetingVi } from "./budgeting";
import { incomeVi } from "./income";
import { goalsVi } from "./goals";
import { spendingVi } from "./spending";

export const viTranslations = {
  ...commonVi,
  ...heroVi,
  ...howItWorksVi,
  ...financialStagesVi,
  ...featuresVi,
  ...testimonialsVi,
  ...ctaVi,
  ...footerVi,
  ...authVi,
  ...chatVi,
  ...onboardingVi,
  ...budgetingVi,
  ...incomeVi,
  goals: goalsVi,
  spending: spendingVi,
};
