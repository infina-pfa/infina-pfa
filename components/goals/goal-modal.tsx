"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { useGoalForm } from "@/hooks/use-goal-form";
import { useAppTranslation } from "@/hooks/use-translation";
import { Goal } from "@/lib/types/goal.types";

interface GoalModalProps {
  mode: "create" | "edit";
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goal?: Goal | null;
  onGoalCreated?: (goal: Goal) => Promise<void>;
  onGoalUpdated?: (goal: Goal) => Promise<void>;
}

export function GoalModal({
  mode,
  isOpen,
  onClose,
  onSuccess,
  goal,
  onGoalCreated,
  onGoalUpdated,
}: GoalModalProps) {
  const { t } = useAppTranslation(["goals", "common"]);

  const {
    formData,
    validationErrors,
    touched,
    isLoading,
    error,
    handleSubmit,
    handleInputChange,
    handleFieldBlur,
    handleClose,
    parseFormattedNumber,
  } = useGoalForm({
    mode,
    isOpen,
    goal,
    onSuccess,
    onClose,
    onGoalCreated,
    onGoalUpdated,
  });

  const title = mode === "create" ? t("addNewGoal") : t("editGoal");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] p-0 font-nunito overflow-hidden">
        <DialogHeader className="pt-4 md:pt-6 pb-0">
          <DialogTitle className="text-[20px] md:text-[24px] font-bold text-[#111827]">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] sm:max-h-[60vh]">
          <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-3">
                <p className="text-[#DC2626] text-[14px]">{error}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-[14px] font-bold text-[#111827] mb-1">
                {t("goalTitle")}
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                onBlur={() => handleFieldBlur("title")}
                className="h-12"
                placeholder={t("goalTitlePlaceholder")}
              />
              {touched.title && validationErrors.title && (
                <p className="text-[#DC2626] text-[12px] mt-1">
                  {validationErrors.title}
                </p>
              )}
            </div>

            {/* Current Amount */}

            {/* Target Amount */}
            <div>
              <MoneyInput
                label={t("targetAmount")}
                value={formData.target_amount || 0}
                onChange={(value) =>
                  handleInputChange(
                    "target_amount",
                    parseFormattedNumber(value.toString())
                  )
                }
                onBlur={() => handleFieldBlur("target_amount")}
                error={
                  touched.target_amount
                    ? validationErrors.target_amount
                    : undefined
                }
                placeholder={t("targetAmountPlaceholder")}
              />
            </div>

            <div>
              <MoneyInput
                label={t("currentAmount")}
                value={formData.current_amount}
                onChange={(value) =>
                  handleInputChange(
                    "current_amount",
                    parseFormattedNumber(value.toString())
                  )
                }
                onBlur={() => handleFieldBlur("current_amount")}
                error={
                  touched.current_amount
                    ? validationErrors.current_amount
                    : undefined
                }
                placeholder={t("currentAmountPlaceholder")}
                required
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-[14px] font-bold text-[#111827] mb-1">
                {t("dueDate")}
              </label>
              <Input
                type="date"
                value={formData.due_date || ""}
                onChange={(e) => handleInputChange("due_date", e.target.value)}
                onBlur={() => handleFieldBlur("due_date")}
                className="h-12"
              />
              {touched.due_date && validationErrors.due_date && (
                <p className="text-[#DC2626] text-[12px] mt-1">
                  {validationErrors.due_date}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-[14px] font-bold text-[#111827] mb-1">
                {t("description")}
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                onBlur={() => handleFieldBlur("description")}
                className="w-full p-3 bg-transparent border border-[#E5E7EB] rounded-lg focus:border-[#0055FF] focus:outline-none text-[16px] min-h-[100px]"
                placeholder={t("descriptionPlaceholder")}
              />
              {touched.description && validationErrors.description && (
                <p className="text-[#DC2626] text-[12px] mt-1">
                  {validationErrors.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto bg-[#0055FF] hover:bg-[#0041CC] text-white px-6 py-3 rounded-[9999px] min-h-[44px] disabled:opacity-50"
              >
                {isLoading
                  ? t("saving", { ns: "common" })
                  : mode === "create"
                  ? t("createGoal")
                  : t("updateGoal")}
              </Button>
              <Button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="w-full sm:w-auto bg-white border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] px-6 py-3 rounded-[9999px] min-h-[44px]"
              >
                {t("cancel", { ns: "common" })}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
