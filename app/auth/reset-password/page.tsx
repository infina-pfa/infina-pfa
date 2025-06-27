"use client";

import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  const handleBackToSignIn = () => {
    router.push("/auth/sign-in");
  };

  return (
    <AuthLayout>
      <ResetPasswordForm onBackToSignIn={handleBackToSignIn} />
    </AuthLayout>
  );
}
