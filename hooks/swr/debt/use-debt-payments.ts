"use client";

import { debtService } from "@/lib/services/debt.service";
import { PayDebtRequest, DebtDetailResponse } from "@/lib/types/debt.types";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

/**
 * Hook for recording a payment against a debt
 */
export function useRecordPayment(debtId: string) {
  const { mutate: debtListMutate } = useSWR(["debts"]);
  const { mutate: debtDetailMutate } = useSWR(["debt", debtId]);
  const { mutate: monthlyPaymentMutate } = useSWR(["debts", "monthly-payment"]);

  const { trigger, isMutating, error } = useSWRMutation(
    ["debt", debtId, "payment"],
    async (_, { arg }: { arg: PayDebtRequest }): Promise<DebtDetailResponse> => {
      const updatedDebt = await debtService.recordPayment(debtId, arg);

      // Invalidate all related caches
      await Promise.all([
        debtListMutate(),
        debtDetailMutate(updatedDebt, { revalidate: false }),
        monthlyPaymentMutate(),
      ]);

      return updatedDebt;
    }
  );

  return {
    recordPayment: trigger,
    isRecording: isMutating,
    error,
  };
}

/**
 * Hook for deleting a payment transaction from a debt
 */
export function useDeletePayment(debtId: string) {
  const { mutate: debtListMutate } = useSWR(["debts"]);
  const { mutate: debtDetailMutate } = useSWR(["debt", debtId]);
  const { mutate: monthlyPaymentMutate } = useSWR(["debts", "monthly-payment"]);

  const { trigger, isMutating, error } = useSWRMutation(
    ["debt", debtId, "payment", "delete"],
    async (_, { arg: paymentId }: { arg: string }) => {
      await debtService.deletePayment(debtId, paymentId);

      // Invalidate all related caches
      await Promise.all([
        debtListMutate(),
        debtDetailMutate(),
        monthlyPaymentMutate(),
      ]);

      return true;
    }
  );

  return {
    deletePayment: trigger,
    isDeleting: isMutating,
    error,
  };
}