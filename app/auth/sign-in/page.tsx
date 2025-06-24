"use client";

import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthForm } from "@/components/auth/auth-form";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();

  const handleToggleMode = () => {
    router.push("/auth/sign-up");
  };

  return (
    <AuthLayout>
      <AuthForm mode="sign-in" onToggleMode={handleToggleMode} />
    </AuthLayout>
  );
}
