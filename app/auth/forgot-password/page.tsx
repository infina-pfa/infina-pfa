"use client";

import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const handleBackToSignIn = () => {
    router.push("/auth/sign-in");
  };

  return (
    <AuthLayout>
      <ForgotPasswordForm onBackToSignIn={handleBackToSignIn} />
    </AuthLayout>
  );
}
