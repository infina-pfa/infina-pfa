"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuthContext } from "@/components/providers/auth-provider";
import { userService } from "@/lib/services-v2/user.service";
import { OnboardingChatInterface } from "@/components/onboarding/chat/onboarding-chat-interface";
import { useAppTranslation } from "@/hooks/use-translation";

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const { t } = useAppTranslation(["onboarding", "common"]);

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user?.id) return;

      try {
        const result = await userService.checkUserExists();

        if (
          result.exists &&
          result.user &&
          result.user.onboarding_completed_at
        ) {
          // User has completed onboarding, redirect to chat
          router.push("/chat");
        }
        // If user exists but hasn't completed onboarding, continue with onboarding
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // Continue with onboarding if there's an error
      }
    };

    if (user && !authLoading) {
      checkOnboardingStatus();
    }
  }, [user, authLoading, router]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/sign-in");
    }
  }, [user, authLoading, router]);

  // Show loading while checking auth or user profile
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleOnboardingComplete = () => {
    // Navigate to chat after successful onboarding
    router.push("/chat");
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] font-nunito flex flex-col">
      {/* Header - following landing page design */}
      <header className="bg-white shadow-sm flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center">
            {/* Logo - same as landing page */}
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/infina-logo.png"
                alt="Infina"
                width={100}
                height={30}
                className="h-auto w-auto max-h-[24px] sm:max-h-[30px]"
                priority
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Full height chat interface */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto">
          <div className="flex-1 bg-white sm:rounded-t-2xl sm:mt-4 shadow-sm flex flex-col overflow-hidden">
            {/* Header - Reduced padding on mobile */}
            <div className="text-center px-4 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6 flex-shrink-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#111827] mb-2 sm:mb-4">
                {t("onboardingTitle")}
              </h1>
              <p className="text-base sm:text-lg text-[#6B7280] max-w-2xl mx-auto">
                {t("onboardingSubtitle")}
              </p>
            </div>

            {/* Chat Interface - Takes remaining space */}
            <div className="flex-1 px-4 pb-4 sm:px-8 sm:pb-6 overflow-hidden">
              <OnboardingChatInterface
                userId={user.id}
                onComplete={handleOnboardingComplete}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
