"use client";

import Link from "next/link";
import Image from "next/image";
import { AuthNav } from "@/components/ui/auth-nav";
import { MobileMenu } from "@/components/ui/mobile-menu";
import { useTranslation } from "react-i18next";

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="bg-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
            <Image
              src="/infina-logo.png"
              alt="Infina"
              width={100}
              height={30}
              className="h-auto w-auto"
              priority
            />
            <div className="text-xs sm:text-sm text-gray-600 hidden xs:block">
              <span className="hidden sm:inline">
                {t("personalFinanceAssistant")}
              </span>
              <span className="sm:hidden">PFA</span>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center">
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <AuthNav />
            </div>

            {/* Mobile Navigation */}
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
