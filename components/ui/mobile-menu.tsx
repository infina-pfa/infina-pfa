"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuthContext } from "@/components/providers/auth-provider";
import { useAuth } from "@/hooks/use-auth";
import {
  Menu,
  User,
  LogOut,
  Home,
  DollarSign,
  Target,
  BarChart3,
  MessageCircle,
  PlusCircle,
} from "lucide-react";
import { FinaIcon } from "@/components/ui/fina-icon";
import { useAppTranslation } from "@/hooks/use-translation";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    key: "infina-advisor",
    href: "/chat",
    icon: MessageCircle,
  },
  {
    key: "budgeting",
    href: "/budgeting",
    icon: BarChart3,
  },
  {
    key: "income",
    href: "/income",
    icon: DollarSign,
  },
  {
    key: "goals",
    href: "/goals",
    icon: Target,
  },
  {
    key: "tools",
    href: "/tools",
    icon: PlusCircle,
  },
];

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuthContext();
  const { signOut } = useAuth();
  const { t } = useAppTranslation(["common"]);
  const pathname = usePathname();

  const closeMenu = () => setIsOpen(false);

  const handleSignOut = async () => {
    await signOut();
    closeMenu();
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

  // Get current page title based on pathname
  const getCurrentPageTitle = () => {
    // For root path, show Home
    if (pathname === "/") return t("home");

    // Check if current path matches any navigation item
    const navItem = navigationItems.find((item) =>
      pathname.startsWith(item.href)
    );
    if (navItem) return t(navItem.key);

    // Default title for other pages
    return t("app");
  };

  if (loading) {
    return (
      <div className="md:hidden">
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="md:hidden w-full">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <div className="flex items-center justify-between gap-2 w-full">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-gray-700 hover:text-infina-blue hover:bg-blue-50 flex items-center gap-2"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex-1 flex items-center justify-center">
              <span className="font-medium text-sm">
                {getCurrentPageTitle()}
              </span>
            </div>
            <span className="w-10" />
          </div>
        </SheetTrigger>

        <SheetContent side="left" className="w-80 p-0 bg-white">
          <div className="flex flex-col h-full">
            {/* Logo Section */}
            <div className="p-6 bg-section-bg">
              <Link
                href="/"
                onClick={closeMenu}
                className="flex items-center space-x-3"
              >
                <Image
                  src="/infina-logo.png"
                  alt="Infina"
                  width={120}
                  height={36}
                  className="h-auto w-auto"
                  priority
                />
              </Link>
            </div>

            <Separator />

            {user ? (
              <>
                {/* User Profile Section */}
                <div className="p-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
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

                {/* Navigation Items */}
                <div className="flex-1 px-4">
                  <nav className="space-y-1">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = isActiveRoute(item.href);

                      return (
                        <Link
                          key={item.key}
                          href={item.href}
                          onClick={closeMenu}
                          className={`
                            flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                            ${
                              isActive
                                ? "bg-infina-blue text-white"
                                : "text-gray-700 hover:bg-blue-50 hover:text-infina-blue"
                            }
                          `}
                        >
                          {item.key === "fina" ? (
                            <FinaIcon className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                          <span>{t(item.key)}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <Separator />

                {/* Sign Out Section */}
                <div className="p-4">
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:bg-red-50 hover:text-infina-red"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    {t("signOut")}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Guest Welcome Section */}
                <div className="p-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                      {t("welcome")}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {t("getStartedMessage")}
                    </p>
                  </div>
                </div>

                {/* Guest Navigation - Limited */}
                <div className="flex-1 px-4">
                  <nav className="space-y-1">
                    <Link
                      href="/"
                      onClick={closeMenu}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-infina-blue rounded-lg transition-colors"
                    >
                      <Home className="w-5 h-5" />
                      <span className="font-medium">{t("home")}</span>
                    </Link>
                  </nav>
                </div>

                <Separator />

                {/* Guest Auth Actions */}
                <div className="p-4 space-y-3">
                  <Link
                    href="/auth/sign-in"
                    onClick={closeMenu}
                    className="block w-full"
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:text-infina-blue hover:bg-blue-50 font-medium"
                    >
                      <User className="w-4 h-4 mr-3" />
                      {t("signIn")}
                    </Button>
                  </Link>

                  <Link
                    href="/auth/sign-up"
                    onClick={closeMenu}
                    className="block w-full"
                  >
                    <Button className="w-full bg-infina-blue hover:bg-blue-700 text-white font-medium">
                      {t("getStarted")}
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
