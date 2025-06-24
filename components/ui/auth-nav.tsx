"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/components/providers/auth-provider";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, User } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AuthNav() {
  const { user, loading } = useAuthContext();
  const { signOut } = useAuth();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-gray-700">
          <User className="w-5 h-5" />
          <span className="text-sm font-medium">{user.email}</span>
        </div>
        <Button
          onClick={handleSignOut}
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-infina-red"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t("signOut")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <Link href="/auth/sign-in">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-700 hover:text-infina-blue"
        >
          {t("signIn")}
        </Button>
      </Link>
      <Link href="/auth/sign-up">
        <Button
          size="sm"
          className="bg-infina-blue hover:bg-blue-700 text-white"
        >
          {t("getStarted")}
        </Button>
      </Link>
    </div>
  );
}
