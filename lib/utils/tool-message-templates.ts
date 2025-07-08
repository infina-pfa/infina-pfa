import { formatCurrency } from "@/lib/utils";

export const toolMessageTemplates = {
  budgetCreated: (name: string, amount: number) =>
    `Tôi vừa mới tạo ngân sách "${name}" với số tiền ${formatCurrency(amount)}`,

  budgetUpdated: (name: string, amount: number, oldAmount?: number) => {
    if (oldAmount && oldAmount !== amount) {
      return `Tôi vừa cập nhật ngân sách "${name}" từ ${formatCurrency(
        oldAmount
      )} thành ${formatCurrency(amount)}`;
    }
    return `Tôi vừa cập nhật ngân sách "${name}" với số tiền ${formatCurrency(
      amount
    )}`;
  },

  expenseCreated: (name: string, amount: number, budgetName?: string) =>
    `Tôi vừa tạo chi tiêu "${name}" với số tiền ${formatCurrency(amount)}${
      budgetName ? ` trong ngân sách "${budgetName}"` : ""
    }`,

  expenseUpdated: (name: string, amount: number, oldAmount?: number) =>
    `Tôi vừa cập nhật chi tiêu "${name}" thành ${formatCurrency(amount)}${
      oldAmount ? ` từ ${formatCurrency(oldAmount)}` : ""
    }`,
};

export type ToolActionType = keyof typeof toolMessageTemplates;
