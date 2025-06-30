"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    key: "about",
    href: "#about",
  },
  {
    key: "contact",
    href: "#contact",
  },
  {
    key: "tools",
    href: "/tools",
  },
];

export function LandingNavbar() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const isActiveRoute = (href: string) => {
    if (href.startsWith("#")) {
      return false; // Handle anchor links differently if needed
    }
    return pathname === href;
  };

  return (
    <nav className="flex items-center justify-between w-full h-full">
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-2">
        <Image
          src="/infina-logo.png"
          alt="Infina"
          width={100}
          height={30}
          className="h-auto w-auto"
          priority
        />
      </Link>

      {/* Navigation Items */}
      <div className="hidden lg:flex items-center space-x-8">
        {navigationItems.map((item) => {
          const isActive = isActiveRoute(item.href);

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`
                text-sm font-medium transition-colors duration-200 cursor-pointer
                ${
                  isActive
                    ? "text-infina-blue"
                    : "text-gray-700 hover:text-infina-blue"
                }
              `}
            >
              {t(item.key)}
            </Link>
          );
        })}
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center space-x-3">
        <Link href="/auth/sign-in">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-700 hover:text-infina-blue hover:bg-blue-50 font-medium cursor-pointer"
          >
            {t("signIn")}
          </Button>
        </Link>
        <Link href="/auth/sign-up">
          <Button
            size="sm"
            className="bg-infina-blue hover:bg-blue-700 text-white font-medium cursor-pointer"
          >
            {t("getStarted")}
          </Button>
        </Link>
      </div>
    </nav>
  );
}
