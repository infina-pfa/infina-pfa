"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface EmailVerificationProps {
  email: string;
  onBackToSignIn?: () => void;
}

export function EmailVerification({
  email,
  onBackToSignIn,
}: EmailVerificationProps) {
  const [isResending, setIsResending] = useState(false);
  const { t } = useTranslation();
  const { success, error } = useToast();
  const { resendEmailVerification } = useAuth();

  const handleResendVerification = async () => {
    if (isResending) return;

    setIsResending(true);
    try {
      const result = await resendEmailVerification(email);

      if (result.error) {
        error(t("signUpFailed"), result.error);
      } else {
        success(t("verificationEmailResent"), t("checkYourEmail"));
      }
    } catch {
      error(t("signUpFailed"), t("unexpectedError"));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white p-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-[#0055FF] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-[#0055FF]" />
        </div>

        <h1 className="text-2xl font-bold text-[#111827] font-nunito mb-2">
          {t("checkYourEmail")}
        </h1>

        <p className="text-[#6B7280] font-nunito mb-2">
          {t("verificationEmailSent")}{" "}
          <span className="font-medium text-[#111827]">{email}</span>
        </p>

        <p className="text-[#6B7280] font-nunito text-sm mb-6">
          {t("verificationEmailDescription")}
        </p>

        <div className="space-y-4">
          <p className="text-sm text-[#6B7280] font-nunito">
            {t("didntReceiveEmail")}{" "}
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="text-[#0055FF] hover:text-blue-700 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-nunito"
            >
              {isResending ? t("signingIn") : t("resendVerification")}
            </button>
          </p>

          {onBackToSignIn && (
            <Button
              variant="outline"
              onClick={onBackToSignIn}
              className="w-full flex items-center justify-center text-[#6B7280] hover:text-[#111827] border-[#E5E7EB] hover:border-[#D1D5DB] font-nunito"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("backToSignIn")}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
