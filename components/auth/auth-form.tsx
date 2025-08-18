"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/auth/use-auth";
import { useAppTranslation } from "@/hooks/use-translation";
import { useRouter } from "next/navigation";
import { AuthFormFields } from "./auth-form-fields";
import { EmailVerification } from "./email-verification";
import {
  signInSchema,
  signUpSchema,
  type SignInFormData,
  type SignUpFormData,
} from "@/lib/validation/schemas/auth.schema";
import { ApiError } from "@/lib/api/type";
import { toast } from "sonner";

interface AuthFormProps {
  mode: "sign-in" | "sign-up";
  onToggleMode: () => void;
}

export function AuthForm({ mode, onToggleMode }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const { signIn, signUp, loading } = useAuth();
  const { t } = useAppTranslation(["auth", "common"]);
  const router = useRouter();

  // Use different forms based on mode for better type safety
  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
  });

  // Select the appropriate form based on mode
  const form = mode === "sign-in" ? signInForm : signUpForm;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = async (data: SignInFormData | SignUpFormData) => {
    try {
      if (mode === "sign-in") {
        await signIn(data.email, data.password);
      } else {
        await signUp(data.email, data.password);
      }

      if (mode === "sign-up") {
        // Store email and show verification
        setSubmittedEmail(data.email);
        setShowEmailVerification(true);
      } else {
        // Redirect to chat for sign in
        router.push("/chat");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(
          t((error.errorCode as string).toUpperCase(), { ns: "errors" })
        );
      } else {
        toast.error(t("unexpectedError"));
      }
    }
  };

  // Show email verification screen after signup
  if (showEmailVerification) {
    return (
      <EmailVerification
        email={submittedEmail}
        onBackToSignIn={() => {
          setShowEmailVerification(false);
          onToggleMode();
        }}
      />
    );
  }

  return (
    <Card
      className={`w-full max-w-md mx-auto bg-white p-8 transition-opacity duration-200 ${
        loading ? "pointer-events-none" : ""
      }`}
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {mode === "sign-in" ? t("signInTitle") : t("signUpTitle")}
        </h1>
        <p className="text-gray-600">
          {mode === "sign-in" ? t("signInDescription") : t("signUpDescription")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AuthFormFields
          mode={mode}
          register={register}
          errors={errors}
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          onToggleShowPassword={() => setShowPassword(!showPassword)}
          onToggleShowConfirmPassword={() =>
            setShowConfirmPassword(!showConfirmPassword)
          }
          t={t}
          disabled={loading}
        />

        {/* Forgot Password Link (Sign In Only) */}
        {mode === "sign-in" && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => router.push("/auth/forgot-password")}
              className="text-sm text-infina-blue hover:text-blue-700 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
              disabled={loading}
            >
              {t("forgotPassword")}
            </button>
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
          <span className={`text-gray-600 ${loading ? "opacity-50" : ""}`}>
            {mode === "sign-in"
              ? t("dontHaveAccount") + " "
              : t("alreadyHaveAccount") + " "}
          </span>
          <button
            type="button"
            onClick={onToggleMode}
            className="text-infina-blue hover:text-blue-700 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
            disabled={loading}
          >
            {mode === "sign-in" ? t("signUp") : t("signIn")}
          </button>
        </div>
      </form>
    </Card>
  );
}
