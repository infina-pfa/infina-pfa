import { commonEn } from "./common";
import { heroEn } from "./hero";
import { howItWorksEn } from "./how-it-works";
import { financialStagesEn } from "./financial-stages";
import { featuresEn } from "./features";
import { testimonialsEn } from "./testimonials";
import { ctaEn } from "./cta";
import { footerEn } from "./footer";
import { authEn } from "./auth";
import { chatEn } from "./chat";
import { onboardingEn } from "./onboarding";
import { budgetingEn } from "./budgeting";
import { incomeEn } from "./income";
import { goalsEn } from "./goals";
import { spendingEn } from "./spending";
import { errorsEn } from "./errors";
import { debtEn } from "./debt";

export const enTranslations = {
  ...commonEn,
  ...heroEn,
  ...howItWorksEn,
  ...financialStagesEn,
  ...featuresEn,
  ...testimonialsEn,
  ...ctaEn,
  ...footerEn,
  ...authEn,
  ...chatEn,
  ...onboardingEn,
  ...budgetingEn,
  ...incomeEn,
  goals: goalsEn,
  spending: spendingEn,
  errors: errorsEn,
  debt: debtEn,
};
