import { useTranslation } from "react-i18next";

/**
 * Custom hook wrapper for react-i18next's useTranslation
 * Provides type safety and consistent usage across the app
 */
export const useAppTranslation = (ns?: string | string[]) => {
  const { t, i18n } = useTranslation(ns);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language;
  const isVietnamese = currentLanguage === "vi";
  const isEnglish = currentLanguage === "en";

  return {
    t,
    i18n,
    changeLanguage,
    currentLanguage,
    isVietnamese,
    isEnglish,
  };
};
