import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import organized translations
import { viTranslations } from "./translations/vi";
import { enTranslations } from "./translations/en";

// Translation resources
const resources = {
  vi: {
    translation: viTranslations,
  },
  en: {
    translation: enTranslations,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: "vi", // Default language is Vietnamese
    fallbackLng: "vi", // Fallback to Vietnamese

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
