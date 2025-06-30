"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/providers/auth-provider";
import { userService } from "@/lib/services/user.service";
import { useOnboarding } from "@/hooks/use-onboarding";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { WelcomeStep } from "@/components/onboarding/welcome-step";
import { IntroductionStep } from "@/components/onboarding/introduction-step";
import { NameStep } from "@/components/onboarding/name-step";
import { LoadingStep } from "@/components/onboarding/loading-step";
import { SuccessStep } from "@/components/onboarding/success-step";

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();

  // Initialize onboarding hook only when we have a user
  const { step, name, loading, error, nextStep, updateName, createUser } =
    useOnboarding(user?.id || "");

  // Check if user already has a profile
  useEffect(() => {
    const checkUserProfile = async () => {
      if (!user?.id) return;

      try {
        const result = await userService.checkUserExists(user.id);

        if (result.exists && result.user) {
          // User already has a profile, redirect to chat
          router.push("/chat");
        }
      } catch (error) {
        console.error("Error checking user profile:", error);
        // Continue with onboarding if there's an error
      }
    };

    if (user && !authLoading) {
      checkUserProfile();
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
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleStartChat = () => {
    router.push("/chat");
  };

  const renderStep = () => {
    switch (step) {
      case "welcome":
        return <WelcomeStep onNext={nextStep} />;

      case "introduction":
        return <IntroductionStep onNext={nextStep} />;

      case "name":
        return (
          <NameStep
            name={name}
            onNameChange={updateName}
            onSubmit={createUser}
            loading={loading}
            error={error}
          />
        );

      case "loading":
        return <LoadingStep />;

      case "success":
        return <SuccessStep onStartChat={handleStartChat} />;

      default:
        return <WelcomeStep onNext={nextStep} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#0055FF] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm font-nunito">
                  I
                </span>
              </div>
              <span className="text-xl font-bold text-[#111827] font-nunito">
                Infina PFA
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress Indicator (only show for relevant steps) */}
        {!["success"].includes(step) && (
          <OnboardingProgress currentStep={step} />
        )}

        {/* Step Content */}
        <div className="mt-8">{renderStep()}</div>
      </main>
    </div>
  );
}
