"use client";

import * as React from "react";
import { PlusCircle, Edit, Trash2, MoreVertical } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface BudgetActionsMenuProps {
  id: string;
  onAddExpense?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const BudgetActionsMenu = ({
  id,
  onAddExpense,
  onEdit,
  onDelete,
}: BudgetActionsMenuProps) => {
  const { t } = useAppTranslation("budgeting");

  // Stop propagation to prevent triggering card click
  const handleActionClick = (
    e: React.MouseEvent,
    callback?: (id: string) => void
  ) => {
    e.stopPropagation();
    if (callback) {
      callback(id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0 h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm hover:bg-[#F9FAFB]"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-3 w-3 md:h-4 md:w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {onAddExpense && (
          <DropdownMenuItem
            onClick={(e) => handleActionClick(e, onAddExpense)}
            className="text-[#111827] hover:text-[#111827] hover:bg-[#F9FAFB]"
          >
            <PlusCircle className="h-4 w-4 text-[#0055FF]" />
            <span>{t("addExpense")}</span>
          </DropdownMenuItem>
        )}

        {onEdit && (
          <DropdownMenuItem
            onClick={(e) => handleActionClick(e, onEdit)}
            className="text-[#111827] hover:text-[#111827] hover:bg-[#F9FAFB]"
          >
            <Edit className="h-4 w-4 text-[#0055FF]" />
            <span>{t("editBudget")}</span>
          </DropdownMenuItem>
        )}

        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => handleActionClick(e, onDelete)}
              variant="destructive"
              className="text-[#F44336] hover:text-[#F44336] hover:bg-[#F44336]/10"
            >
              <Trash2 className="h-4 w-4 text-[#F44336]" />
              <span>{t("removeBudget")}</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
