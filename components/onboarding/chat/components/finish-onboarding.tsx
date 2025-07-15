"use client";
import { Button } from "@/components/ui/button";
import { useAppTranslation } from "@/hooks/use-translation";
import { onboardingService } from "@/lib/services/onboarding.service";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function FinishOnboarding() {
  const { t } = useAppTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFinishOnboarding = async () => {
    setIsLoading(true);
    await onboardingService.completeOnboarding();
    setIsLoading(false);
    router.replace("/");
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Button onClick={handleFinishOnboarding} disabled={isLoading}>
        {isLoading ? t("loading") : t("finishOnboarding", { ns: "common" })}
      </Button>
    </div>
  );
}
