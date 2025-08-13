import useSWR from "swr";
import { useAppTranslation } from "@/hooks/use-translation";
import { transactionService } from "@/lib/services-v2/transaction.service";
import { Transaction } from "@/lib/types/transaction.types";

export interface UseRecentTransactionsSWRReturn {
  data: Array<
    Transaction & {
      budgetName?: string;
      budgetColor?: string;
    }
  >;
  isLoading: boolean;
  error: Error | null;
  mutate: () => Promise<
    | Array<
        Transaction & {
          budgetName?: string;
          budgetColor?: string;
        }
      >
    | undefined
  >;
}

export const useRecentTransactionsSWR = (
  months: number = 6
): UseRecentTransactionsSWRReturn => {
  const { t } = useAppTranslation(["budgeting", "common"]);

  const { data, error, isLoading, mutate } = useSWR(
    [`transactions/recent`, months],
    async () => {
      const response = await transactionService.getRecentTransactions(
        months,
        t
      );
      if (response.error) {
        throw new Error(response.error);
      }
      return response.transactions;
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  );

  return {
    data: data || [],
    error: error || null,
    isLoading,
    mutate,
  };
};
