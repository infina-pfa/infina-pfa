import { BudgetingWidget } from "@/components/budgeting/budgeting-widget";
import { AppLayout } from "@/components/ui/app-layout";

export default function BudgetingPage() {
  return (
    <AppLayout>
      <div className="pb-6 md:pb-8">
        <BudgetingWidget />
      </div>
    </AppLayout>
  );
}
