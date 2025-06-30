"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuthContext } from "@/components/providers/auth-provider";
import { userService } from "@/lib/services/user.service";
import { useOnboarding } from "@/hooks/use-onboarding";
import { WelcomeStep } from "@/components/onboarding/welcome-step";
import { NameStep } from "@/components/onboarding/name-step";
import { LoadingStep } from "@/components/onboarding/loading-step";

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
      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case "welcome":
        return <WelcomeStep onNext={nextStep} />;

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

      default:
        return <WelcomeStep onNext={nextStep} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] font-nunito">
      {/* Header - following landing page design */}
      <header className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center">
            {/* Logo - same as landing page */}
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
          </div>
        </div>
      </header>

      {/* Main Content - following landing page layout */}
      <main className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
        <div className="max-w-2xl mx-auto">{renderStep()}</div>
      </main>
    </div>
  );
}
