import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import organized translations
import { commonVi } from "./translations/vi/common";
import { commonEn } from "./translations/en/common";
import { budgetingVi } from "./translations/vi/budgeting";
import { budgetingEn } from "./translations/en/budgeting";
import { heroVi } from "./translations/vi/hero";
import { heroEn } from "./translations/en/hero";
import { howItWorksVi } from "./translations/vi/how-it-works";
import { howItWorksEn } from "./translations/en/how-it-works";
import { financialStagesVi } from "./translations/vi/financial-stages";
import { financialStagesEn } from "./translations/en/financial-stages";
import { featuresVi } from "./translations/vi/features";
import { featuresEn } from "./translations/en/features";
import { testimonialsVi } from "./translations/vi/testimonials";
import { testimonialsEn } from "./translations/en/testimonials";
import { ctaVi } from "./translations/vi/cta";
import { ctaEn } from "./translations/en/cta";
import { footerVi } from "./translations/vi/footer";
import { footerEn } from "./translations/en/footer";
import { authVi } from "./translations/vi/auth";
import { authEn } from "./translations/en/auth";
import { chatVi } from "./translations/vi/chat";
import { chatEn } from "./translations/en/chat";
import { onboardingVi } from "./translations/vi/onboarding";
import { onboardingEn } from "./translations/en/onboarding";
import { incomeVi } from "./translations/vi/income";
import { incomeEn } from "./translations/en/income";
import { goalsVi } from "./translations/vi/goals";
import { goalsEn } from "./translations/en/goals";
import { spendingVi } from "./translations/vi/spending";
import { spendingEn } from "./translations/en/spending";

// Translation resources
const resources = {
  vi: {
    common: commonVi,
    budgeting: budgetingVi,
    hero: heroVi,
    howItWorks: howItWorksVi,
    financialStages: financialStagesVi,
    features: featuresVi,
    testimonials: testimonialsVi,
    cta: ctaVi,
    footer: footerVi,
    auth: authVi,
    chat: chatVi,
    onboarding: onboardingVi,
    income: incomeVi,
    goals: goalsVi,
    spending: spendingVi,
  },
  en: {
    common: commonEn,
    budgeting: budgetingEn,
    hero: heroEn,
    howItWorks: howItWorksEn,
    financialStages: financialStagesEn,
    features: featuresEn,
    testimonials: testimonialsEn,
    cta: ctaEn,
    footer: footerEn,
    auth: authEn,
    chat: chatEn,
    onboarding: onboardingEn,
    income: incomeEn,
    goals: goalsEn,
    spending: spendingEn,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: "vi", // Default language is Vietnamese
    fallbackLng: "vi", // Fallback to Vietnamese
    defaultNS: "common",
    ns: [
      "common",
      "budgeting",
      "hero",
      "howItWorks",
      "financialStages",
      "features",
      "testimonials",
      "cta",
      "footer",
      "auth",
      "chat",
      "onboarding",
      "spending",
    ],

    detection: {
      // Language detection settings
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
    },

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    react: {
      useSuspense: false, // Set to false to avoid suspense issues in SSR
    },
  });

export default i18n;
