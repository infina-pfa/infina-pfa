"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email) {
      setFormError(t("pleaseEnterEmail"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError(t("invalidEmailAddress"));
      return;
    }

    const result = await forgotPassword(email);

    if (result.error) {
      setFormError(result.error);
    } else {
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-emerald-green" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Check your email
          </h1>

          <p className="text-gray-600 mb-6">
            We&apos;ve sent password reset instructions to{" "}
            <span className="font-semibold text-gray-900">{email}</span>
          </p>

          <div className="space-y-4">
            <Button
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="w-full"
            >
              Send another email
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={onBackToSignIn}
                className="inline-flex items-center text-infina-blue hover:text-blue-700 font-semibold transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to sign in
              </button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Forgot password?
        </h1>
        <p className="text-gray-600">
          Enter your email address and we&apos;ll send you instructions to reset
          your password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-infina-blue"
              placeholder="Enter your email address"
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
          className="w-full bg-infina-blue hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Sending reset email...
            </div>
          ) : (
            t("forgotPasswordButton")
          )}
        </Button>

        {/* Back to Sign In */}
        <div className="text-center">
          <button
            type="button"
            onClick={onBackToSignIn}
            className="inline-flex items-center text-infina-blue hover:text-blue-700 font-semibold transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to sign in
          </button>
        </div>
      </form>
    </Card>
  );
}
