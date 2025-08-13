"use client";

import { Loader2 } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";

export function ToolPreparingIndicator() {
  const { t } = useAppTranslation(["onboarding", "common"]);
  
  return (
    <div className="flex items-center gap-2 p-3 bg-[#f0f2f5] rounded-lg">
      <Loader2 className="h-4 w-4 animate-spin text-[#0055FF]" />
      <span className="text-sm text-gray-600 font-nunito">
        {t("preparingTool")}
      </span>
    </div>
  );
}
