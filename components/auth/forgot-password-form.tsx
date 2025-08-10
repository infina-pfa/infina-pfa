"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/auth/use-auth";
import { useAppTranslation } from "@/hooks/use-translation";

interface ForgotPasswordFormProps {
  onBackToSignIn?: () => void;
}

export function ForgotPasswordForm({
  onBackToSignIn,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { forgotPassword, loading } = useAuth();
  const { t } = useAppTranslation(["auth", "common"]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email) {
      setFormError(t("pleaseEnterEmail"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError(t("pleaseEnterValidEmail"));
      return;
    }

    try {
      const result = await forgotPassword(email);

      if (result.error) {
        setFormError(result.error);
      } else {
        setIsSubmitted(true);
      }
    } catch {
      setFormError(t("unexpectedError"));
    }
  };

  // Show success message after successful submission
  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t("checkYourEmail")}
          </h1>
          <p className="text-gray-600 mb-6">
            {t("passwordResetEmailSent")}{" "}
            <span className="font-medium">{email}</span>
          </p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              {t("didntReceiveEmail")}{" "}
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-infina-blue hover:text-blue-700 font-medium cursor-pointer"
              >
                {t("tryAgain")}
              </button>
            </p>
            {onBackToSignIn && (
              <button
                onClick={onBackToSignIn}
                className="flex items-center justify-center w-full text-gray-600 hover:text-gray-800 transition-colors duration-200 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("backToSignIn")}
              </button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t("forgotPasswordTitle")}
        </h1>
        <p className="text-gray-600">{t("forgotPasswordDescription")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            {t("emailAddress")}
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-12"
              placeholder={t("emailPlaceholder")}
              required
            />
          </div>
        </div>

        {/* Error Message */}
        {formError && (
          <div className="text-infina-red text-sm bg-red-50 p-3 rounded-lg">
            {formError}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-infina-blue hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-full transition-colors duration-200 cursor-pointer"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              {t("sendingResetEmail")}
            </div>
          ) : (
            t("forgotPasswordButton")
          )}
        </Button>

        {/* Back to Sign In */}
        {onBackToSignIn && (
          <button
            type="button"
            onClick={onBackToSignIn}
            className="flex items-center justify-center w-full text-gray-600 hover:text-gray-800 transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("backToSignIn")}
          </button>
        )}
      </form>
    </Card>
  );
}
