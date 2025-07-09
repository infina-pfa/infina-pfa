import { IncomeWidget } from "@/components/income/income-widget";
import { AppLayout } from "@/components/ui/app-layout";

export default function IncomePage() {
  return (
    <AppLayout>
      <div className="pb-6 md:pb-8">
        <IncomeWidget />
      </div>
    </AppLayout>
  );
}
