"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, ChevronDown } from "lucide-react";
import { Button } from "./button";

interface LanguageSwitcherProps {
  /** Whether to show the language switcher (default: false for hidden) */
  isVisible?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Language switcher component with Vietnamese as default
 * Hidden by default but can be made visible for admin/dev purposes
 */
export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  isVisible = false,
  className = "",
}) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "vi", name: t("vietnamese"), flag: "🇻🇳" },
    { code: "en", name: t("english"), flag: "🇺🇸" },
  ];

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  // Return null if not visible (hidden by default)
  if (!isVisible) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 
          hover:bg-[#F0F2F5] 
          text-gray-700 hover:text-[#0055FF]
          transition-colors duration-200
        `}
        aria-label={t("language")}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {currentLanguage.flag} {currentLanguage.name}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop to close dropdown when clicking outside */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown content */}
          <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-lg shadow-lg border border-gray-100 min-w-[160px]">
            <div className="py-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`
                    w-full px-4 py-2 text-left text-sm 
                    hover:bg-[#F0F2F5] 
                    transition-colors duration-200
                    ${
                      i18n.language === language.code
                        ? "bg-[#F0F2F5] text-[#0055FF] font-medium"
                        : "text-gray-700 hover:text-[#0055FF]"
                    }
                  `}
                  role="menuitem"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-base">{language.flag}</span>
                    <span>{language.name}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Developer-only language switcher for testing
 * Only shows in development mode
 */
export const DevLanguageSwitcher: React.FC = () => {
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <LanguageSwitcher
      isVisible={isDevelopment}
      className="fixed bottom-4 right-4 z-50"
    />
  );
};
