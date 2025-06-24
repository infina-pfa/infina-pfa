"use client";

import React, { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";

interface I18nProviderProps {
  children: React.ReactNode;
}

/**
 * I18n Provider component that initializes i18next for the application
 * Sets Vietnamese as the default language
 */
export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    // Ensure i18n is initialized before rendering
    if (i18n.isInitialized) {
      setIsI18nInitialized(true);
    } else {
      i18n.on("initialized", () => {
        setIsI18nInitialized(true);
      });
    }

    // Cleanup listener on unmount
    return () => {
      i18n.off("initialized");
    };
  }, []);

  // Show loading state while i18n is initializing
  if (!isI18nInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F6F7F9]">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-[#0055FF] rounded-full"></div>
        </div>
      </div>
    );
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};
