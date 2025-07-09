"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";
import { supabase } from "@/lib/supabase";

type VerificationState = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const [state, setState] = useState<VerificationState>("loading");
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useAppTranslation(["auth", "common"]);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get tokens from URL params (Supabase auth flow)
        const token = searchParams.get("token");
        const type = searchParams.get("type");

        console.log("🚀 ~ verifyEmail ~ token:", token);
        console.log("🚀 ~ verifyEmail ~ type:", type);

        if (!token || type !== "signup") {
          throw new Error("Invalid verification link");
        }

        // Verify the email using Supabase with PKCE token
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "signup",
        });

        if (error) {
          console.error("Verification error:", error);
          throw error;
        }

        setState("success");

        // Redirect to chat after a short delay
        setTimeout(() => {
          router.push("/chat");
        }, 3000);
      } catch (error) {
        console.error("Verification error:", error);
        setState("error");
        setError(error instanceof Error ? error.message : t("unexpectedError"));
      }
    };

    verifyEmail();
  }, [searchParams, router, t]);

  const handleContinueToSignIn = () => {
    router.push("/auth/sign-in");
  };

  const handleRetryChat = () => {
    router.push("/chat");
  };

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto bg-white p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#0055FF] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader className="w-8 h-8 text-[#0055FF] animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-[#111827] font-nunito mb-2">
              {t("verifyingEmail")}
            </h1>
            <p className="text-[#6B7280] font-nunito">
              {t("pleaseWaitWhileVerifying")}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto bg-white p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#2ECC71] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[#2ECC71]" />
            </div>
            <h1 className="text-2xl font-bold text-[#111827] font-nunito mb-2">
              {t("emailVerified")}
            </h1>
            <p className="text-[#6B7280] font-nunito mb-6">
              {t("emailVerifiedDescription")}
            </p>
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280] font-nunito">
                {t("redirectingToChat")}
              </p>
              <Button
                onClick={handleRetryChat}
                className="w-full bg-[#0055FF] hover:bg-blue-700 text-white font-nunito"
              >
                {t("continueToChat")}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-white p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#F44336] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-[#F44336]" />
          </div>
          <h1 className="text-2xl font-bold text-[#111827] font-nunito mb-2">
            {t("verificationFailed")}
          </h1>
          <p className="text-[#6B7280] font-nunito mb-2">
            {t("verificationFailedDescription")}
          </p>
          {error && (
            <p className="text-[#F44336] font-nunito text-sm mb-6">{error}</p>
          )}
          <div className="space-y-4">
            <Button
              onClick={handleContinueToSignIn}
              className="w-full bg-[#0055FF] hover:bg-blue-700 text-white font-nunito"
            >
              {t("backToSignIn")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
