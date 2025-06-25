"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuthContext } from "@/components/providers/auth-provider";
import { useAuth } from "@/hooks/use-auth";
import { Menu, User, LogOut, Home } from "lucide-react";
import { useTranslation } from "react-i18next";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuthContext();
  const { signOut } = useAuth();
  const { t } = useTranslation();

  const closeMenu = () => setIsOpen(false);

  const handleSignOut = async () => {
    await signOut();
    closeMenu();
  };

  if (loading) {
    return (
      <div className="md:hidden">
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  const getUserInitials = (email?: string) => {
    return email ? email.charAt(0).toUpperCase() : "U";
  };

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-gray-700 hover:text-infina-blue hover:bg-blue-50"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-80 p-0 bg-white">
          <div className="flex flex-col h-full">
            {user ? (
              <>
                {/* User Profile Section */}
                <div className="p-6 bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
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

                <Separator />

                {/* Menu Items */}
                <div className="flex-1 p-4">
                  <nav className="space-y-2">
                    <Link
                      href="/dashboard"
                      onClick={closeMenu}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-infina-blue rounded-lg transition-colors"
                    >
                      <Home className="w-5 h-5" />
                      <span className="font-medium">{t("dashboard")}</span>
                    </Link>
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
                {/* Guest Header */}
                <div className="p-6 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t("welcome")}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {t("getStartedMessage")}
                  </p>
                </div>

                <Separator />

                {/* Guest Menu */}
                <div className="flex-1 p-4">
                  <div className="space-y-3">
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
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
