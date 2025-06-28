"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface ResetPasswordFormProps {
  onBackToSignIn?: () => void;
}

export function ResetPasswordForm({ onBackToSignIn }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const { resetPassword, loading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!password || !confirmPassword) {
      setFormError(t("pleaseEnterAllFields"));
      return;
    }

    if (password !== confirmPassword) {
      setFormError(t("passwordsDontMatch"));
      return;
    }

    if (password.length < 6) {
      setFormError(t("passwordTooShort"));
      return;
    }

    const result = await resetPassword(password, confirmPassword);

    if (result.error) {
      setFormError(result.error);
    } else {
      // Redirect to sign in page after successful reset
      router.push("/auth/sign-in");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Reset your password
        </h1>
        <p className="text-gray-600">Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Password Field */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            New password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-infina-blue"
              placeholder="Enter new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm new password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 pr-10 bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-infina-blue"
              placeholder="Confirm new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Password Requirements */}
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">Password requirements:</p>
          <ul className="text-xs space-y-1">
            <li
              className={
                password.length >= 6 ? "text-emerald-green" : "text-gray-500"
              }
            >
              • At least 6 characters
            </li>
            <li
              className={
                password === confirmPassword && password.length > 0
                  ? "text-emerald-green"
                  : "text-gray-500"
              }
            >
              • Passwords match
            </li>
          </ul>
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
              Updating password...
            </div>
          ) : (
            t("updatePasswordButton")
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
