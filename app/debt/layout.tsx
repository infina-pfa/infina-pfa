"use client";

import { AppLayout } from "@/components/ui";

export default function DebtLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F6F7F9]">{children}</div>
    </AppLayout>
  );
}
