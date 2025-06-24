"use client";

import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthForm } from "@/components/auth/auth-form";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  const handleToggleMode = () => {
    router.push("/auth/sign-in");
  };

  return (
    <AuthLayout>
      <AuthForm mode="sign-up" onToggleMode={handleToggleMode} />
    </AuthLayout>
  );
}
