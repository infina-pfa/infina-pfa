"use client";

import Link from "next/link";
import Image from "next/image";
import { AuthNav } from "@/components/ui/auth-nav";
import { useTranslation } from "react-i18next";

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/infina-logo.png"
              alt="Infina"
              width={120}
              height={36}
              className="h-9 w-auto"
              priority
            />
            <div className="text-sm text-gray-600 hidden sm:block">
              {t("personalFinanceAssistant")}
            </div>
          </Link>

          {/* Navigation */}
          <AuthNav />
        </div>
      </div>
    </header>
  );
}
