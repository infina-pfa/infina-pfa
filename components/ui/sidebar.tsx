"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/components/providers/auth-provider";
import { useAuth } from "@/hooks/use-auth";
import {
  Sparkles,
  Calculator,
  Wrench,
  LogOut,
  ChevronLeft,
  ChevronRight,
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

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
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
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-gray-100 ${
          isCollapsed ? "w-16" : "w-64"
        } transition-all duration-300`}
      >
        <div className="p-4">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
        </div>
      </aside>
    );
  }

  if (!user) {
    return null; // Don't show sidebar for non-authenticated users
  }

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-gray-100 ${
        isCollapsed ? "w-16" : "w-64"
      } transition-all duration-300 h-screen`}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
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
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`
                  flex items-center rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    isCollapsed
                      ? "justify-center p-3 w-10 h-10"
                      : "space-x-3 px-3 py-3"
                  }
                  ${
                    isActive
                      ? isCollapsed
                        ? "bg-infina-blue text-white"
                        : "bg-infina-blue text-white shadow-sm"
                      : "text-gray-700 hover:bg-blue-50 hover:text-infina-blue"
                  }
                `}
                title={isCollapsed ? t(item.key) : undefined}
              >
                {item.key === "fina" ? (
                  <FinaIcon
                    className={`flex-shrink-0 ${
                      isCollapsed ? "w-4 h-4" : "w-5 h-5"
                    }`}
                  />
                ) : (
                  <Icon
                    className={`flex-shrink-0 ${
                      isCollapsed ? "w-4 h-4" : "w-5 h-5"
                    }`}
                  />
                )}
                {!isCollapsed && <span>{t(item.key)}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-100">
        {isCollapsed ? (
          /* Collapsed User Avatar */
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full flex justify-center"
              title={user.email}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-infina-blue text-white text-sm font-medium">
                  {getUserInitials(user.email)}
                </AvatarFallback>
              </Avatar>
            </button>

            {/* Collapsed User Menu */}
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute bottom-full left-full ml-2 mb-2 z-20 bg-white rounded-lg border border-gray-100 min-w-[200px] py-2 shadow-lg">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-infina-red transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t("signOut")}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Expanded User Profile */
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-infina-blue text-white text-sm font-medium">
                  {getUserInitials(user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500">{t("user")}</p>
              </div>
            </button>

            {/* Expanded User Menu */}
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute bottom-full left-0 mb-2 z-20 bg-white rounded-lg border border-gray-100 w-full py-2 shadow-lg">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-infina-red transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t("signOut")}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
