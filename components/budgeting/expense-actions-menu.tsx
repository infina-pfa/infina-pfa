"use client";

import * as React from "react";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ExpenseActionsMenuProps {
  id: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ExpenseActionsMenu = ({
  id,
  onEdit,
  onDelete,
}: ExpenseActionsMenuProps) => {
  const { t } = useAppTranslation("budgeting");

  // Stop propagation to prevent triggering expense item click
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
          className="flex-shrink-0 h-8 w-8 p-0 text-[#6B7280] hover:text-[#0055FF] hover:bg-[#F0F2F5]"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {onEdit && (
          <DropdownMenuItem
            onClick={(e) => handleActionClick(e, onEdit)}
            className="text-[#111827] hover:text-[#111827] hover:bg-[#F9FAFB]"
          >
            <Edit className="h-4 w-4 text-[#0055FF]" />
            <span>{t("editExpense")}</span>
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
              <span>{t("removeExpense")}</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
