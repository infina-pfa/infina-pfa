"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { AuthFormFields } from "./auth-form-fields";

interface AuthFormProps {
  mode: "sign-in" | "sign-up";
  onToggleMode: () => void;
}

export function AuthForm({ mode, onToggleMode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const { signIn, signUp, loading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email || !password) {
      setFormError(t("pleaseEnterAllFields"));
      return;
    }

    if (mode === "sign-up" && password !== confirmPassword) {
      setFormError(t("passwordsDontMatch"));
      return;
    }

    if (password.length < 6) {
      setFormError(t("passwordTooShort"));
      return;
    }

    try {
      const result =
        mode === "sign-in"
          ? await signIn(email, password)
          : await signUp(email, password);

      if (result.error) {
        setFormError(result.error);
      } else {
        router.push("/chat");
      }
    } catch {
      setFormError(t("unexpectedError"));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {mode === "sign-in" ? t("signInTitle") : t("signUpTitle")}
        </h1>
        <p className="text-gray-600">
          {mode === "sign-in" ? t("signInDescription") : t("signUpDescription")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthFormFields
          mode={mode}
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onToggleShowPassword={() => setShowPassword(!showPassword)}
          onToggleShowConfirmPassword={() =>
            setShowConfirmPassword(!showConfirmPassword)
          }
        />

        {/* Forgot Password Link (Sign In Only) */}
        {mode === "sign-in" && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => router.push("/auth/forgot-password")}
              className="text-sm text-infina-blue hover:text-blue-700 font-medium cursor-pointer"
            >
              {t("forgotPassword")}
            </button>
          </div>
        )}

        {/* Error Message */}
        {formError && (
          <div className="text-infina-red text-sm bg-red-50 p-3 rounded-lg">
            {formError}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-infina-blue hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-full transition-colors duration-200"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              {mode === "sign-in" ? t("signingIn") : t("creatingAccount")}
            </div>
          ) : mode === "sign-in" ? (
            t("signInButton")
          ) : (
            t("createAccount")
          )}
        </Button>

        {/* Toggle Mode */}
        <div className="text-center">
          <span className="text-gray-600">
            {mode === "sign-in"
              ? t("dontHaveAccount") + " "
              : t("alreadyHaveAccount") + " "}
          </span>
          <button
            type="button"
            onClick={onToggleMode}
            className="text-infina-blue hover:text-blue-700 font-medium cursor-pointer"
          >
            {mode === "sign-in" ? t("signUp") : t("signIn")}
          </button>
        </div>
      </form>
    </Card>
  );
}
