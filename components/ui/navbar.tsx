"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthContext } from "@/components/providers/auth-provider";
import { useAuth } from "@/hooks/use-auth";
import {
  LogOut,
  ChevronDown,
  Sparkles,
  Calculator,
  Wrench,
} from "lucide-react";
import { FinaIcon } from "@/components/ui/fina-icon";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    key: "fina",
    href: "/chat",
    icon: Sparkles,
  },
  {
    key: "budgeting",
    href: "/budgeting",
    icon: Calculator,
  },
  {
    key: "tools",
    href: "/tools",
    icon: Wrench,
  },
];

export function Navbar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, loading } = useAuthContext();
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
  };

  const getUserInitials = (email?: string) => {
    return email ? email.charAt(0).toUpperCase() : "U";
  };

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-6">
        {/* Navigation skeleton */}
        <div className="hidden lg:flex items-center space-x-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-20 h-6 bg-gray-200 rounded animate-pulse"
            />
          ))}
        </div>
        {/* User avatar skeleton */}
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-6">
        {/* Desktop Navigation Items */}
        <nav className="hidden lg:flex items-center space-x-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "text-infina-blue bg-blue-50"
                      : "text-gray-700 hover:text-infina-blue hover:bg-blue-50"
                  }
                `}
              >
                {item.key === "fina" ? (
                  <FinaIcon className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span>{t(item.key)}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50 transition-colors"
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-infina-blue text-white text-sm font-medium">
                {getUserInitials(user.email)}
              </AvatarFallback>
            </Avatar>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                isUserMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsUserMenuOpen(false)}
                aria-hidden="true"
              />

              {/* Dropdown Content */}
              <div className="absolute right-0 top-full mt-2 z-20 bg-white rounded-lg border border-gray-100 min-w-[220px] py-2">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-infina-blue text-white font-medium">
                        {getUserInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500">{t("user")}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-infina-red transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t("signOut")}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <Link href="/auth/sign-in">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-700 hover:text-infina-blue hover:bg-blue-50 font-medium"
        >
          {t("signIn")}
        </Button>
      </Link>
      <Link href="/auth/sign-up">
        <Button
          size="sm"
          className="bg-infina-blue hover:bg-blue-700 text-white font-medium"
        >
          {t("getStarted")}
        </Button>
      </Link>
    </div>
  );
}
