"use client";

import { GoalWidget } from "@/components/goals";
import { AppLayout } from "@/components/ui/app-layout";

export default function GoalsPage() {
  return (
    <AppLayout>
      <div className="pb-6 md:pb-8">
        <GoalWidget />
      </div>
    </AppLayout>
  );
}
