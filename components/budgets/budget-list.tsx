
"use client";

import { useBudgets } from "@/hooks/use-budgets";
import { Tables } from "@/lib/supabase/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency, getDaysLeft } from "@/lib/utils";

type Budget = Tables<"budgets">;

export function BudgetList() {
  const { budgets, loading, error } = useBudgets();
  const { t } = useTranslation();

  if (loading) {
    return <div>{t("loading")}...</div>;
  }

  if (error) {
    return <div>{t("error")}: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {budgets.map((budget) => (
        <BudgetItem key={budget.id} budget={budget} />
      ))}
    </div>
  );
}

function BudgetItem({ budget }: { budget: Budget }) {
  const { t } = useTranslation();
  const spent = 300; // Mock data, will be replaced with real data
  const progress = (spent / budget.amount) * 100;
  const daysLeft = getDaysLeft(budget.ended_at);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: budget.color }}
              >
                {budget.icon}
              </span>
              {budget.name}
            </CardTitle>
            <CardDescription>
              {t(budget.category)} - {t("daysLeft", { count: daysLeft })}
            </CardDescription>
          </div>
          <BudgetMenu />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">
              {formatCurrency(spent)}
            </span>
            <span className="text-gray-500">
              / {formatCurrency(budget.amount)}
            </span>
          </div>
          <Progress value={progress} className="mt-1" />
        </div>
      </CardContent>
    </Card>
  );
}

function BudgetMenu() {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>{t("edit")}</DropdownMenuItem>
        <DropdownMenuItem className="text-red-500">{t("delete")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
