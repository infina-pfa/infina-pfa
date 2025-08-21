"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { debtService } from "@/lib/services/debt.service";
import {
  DebtResponse,
  CreateDebtRequest,
  UpdateDebtRequest,
  DebtDetailResponse,
  DebtSimple,
  MonthlyPaymentResponse,
} from "@/lib/types/debt.types";

/**
 * Hook for fetching debts list
 */
export function useDebts() {
  const { data, error, isLoading, mutate } = useSWR(
    ["debts"],
    () => debtService.getDebts(),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    debts: data as DebtResponse[] | undefined,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook for fetching debt details with payments
 */
export function useDebtDetail(debtId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    debtId ? ["debt", debtId] : null,
    () => debtService.getDebtDetail(debtId!),
    {
      revalidateOnFocus: true,
    }
  );

  return {
    debt: data as DebtDetailResponse | undefined,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook for fetching monthly payment amount
 */
export function useMonthlyPayment() {
  const { data, error, isLoading, mutate } = useSWR(
    ["debts", "monthly-payment"],
    () => debtService.getMonthlyPayment(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    monthlyPayment: data as MonthlyPaymentResponse | undefined,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook for creating a debt with optimistic updates
 */
export function useCreateDebt() {
  const { mutate: globalMutate } = useSWR(["debts"]);

  const { trigger, isMutating, error } = useSWRMutation(
    ["debts", "create"],
    async (_, { arg }: { arg: CreateDebtRequest }): Promise<DebtResponse> => {
      // Create the debt on server first
      const newDebt = await debtService.createDebt(arg);
      
      // Then update the cache with the real data
      await globalMutate(
        async (currentDebts: DebtResponse[] | undefined) => {
          return (currentDebts || []).concat(newDebt);
        },
        {
          revalidate: false,
        }
      );

      return newDebt;
    }
  );

  return {
    createDebt: trigger,
    isCreating: isMutating,
    error,
  };
}

/**
 * Hook for updating a debt with optimistic updates
 */
export function useUpdateDebt(debtId: string) {
  const { mutate: listMutate } = useSWR(["debts"]);
  const { mutate: detailMutate } = useSWR(["debt", debtId]);

  const { trigger, isMutating, error } = useSWRMutation(
    ["debt", "update", debtId],
    async (_, { arg }: { arg: UpdateDebtRequest }): Promise<DebtSimple> => {
      // Update the debt on server first
      const updatedDebt = await debtService.updateDebt(debtId, arg);
      
      // Then update the cache with the real data
      await listMutate(
        async (currentDebts: DebtResponse[] | undefined) => {
          return (currentDebts || []).map((d: DebtResponse) =>
            d.id === debtId ? { ...d, ...updatedDebt } : d
          );
        },
        {
          revalidate: false,
        }
      );

      // Also update detail cache if exists
      if (detailMutate) {
        await detailMutate();
      }

      return updatedDebt;
    }
  );

  return {
    updateDebt: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Hook for deleting a debt with optimistic updates
 */
export function useDeleteDebt() {
  const { mutate: globalMutate } = useSWR(["debts"]);
  const { mutate: monthlyPaymentMutate } = useSWR(["debts", "monthly-payment"]);

  const { trigger, isMutating, error } = useSWRMutation(
    ["debt", "delete"],
    async (_, { arg: debtId }: { arg: string }) => {
      // Optimistic update - remove debt from list
      await globalMutate(
        async (currentDebts: DebtResponse[] | undefined) => {
          const optimisticDebts = (currentDebts || []).filter(
            (d: DebtResponse) => d.id !== debtId
          );

          try {
            await debtService.deleteDebt(debtId);
            // Revalidate monthly payment after deletion
            if (monthlyPaymentMutate) {
              await monthlyPaymentMutate();
            }
            return optimisticDebts;
          } catch (error) {
            throw error;
          }
        },
        {
          optimisticData: (current: DebtResponse[] | undefined) =>
            (current || []).filter((d: DebtResponse) => d.id !== debtId),
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        }
      );

      return true;
    }
  );

  return {
    deleteDebt: trigger,
    isDeleting: isMutating,
    error,
  };
}