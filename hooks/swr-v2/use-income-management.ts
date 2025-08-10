import { useIncomeListSWR } from "./use-income-list";
import { useIncomeCreateSWR } from "./use-income-create";
import { useIncomeUpdateSWR } from "./use-income-update";
import { useIncomeDeleteSWR } from "./use-income-delete";
import { useIncomeStatsSWR } from "./use-income-stats";
import type { IncomeFilters } from "@/lib/types/income.types";

interface UseIncomeManagementReturn {
  list: ReturnType<typeof useIncomeListSWR>;
  create: ReturnType<typeof useIncomeCreateSWR>;
  update: ReturnType<typeof useIncomeUpdateSWR>;
  delete: ReturnType<typeof useIncomeDeleteSWR>;
  stats: ReturnType<typeof useIncomeStatsSWR>;
}

export function useIncomeManagement(
  filters?: IncomeFilters,
  statsFilters?: { month?: number; year?: number }
): UseIncomeManagementReturn {
  const list = useIncomeListSWR(filters);
  const create = useIncomeCreateSWR();
  const update = useIncomeUpdateSWR();
  const deleteHook = useIncomeDeleteSWR();
  const stats = useIncomeStatsSWR(statsFilters);

  return {
    list,
    create,
    update,
    delete: deleteHook,
    stats,
  };
}
