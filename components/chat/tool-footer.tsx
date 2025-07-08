"use client";

import { useAppTranslation } from "@/hooks/use-translation";

interface ToolFooterProps {
  onClose: () => void;
  onUse?: () => void;
  showUseButton?: boolean;
}

export function ToolFooter({
  onClose,
  onUse,
  showUseButton = true,
}: ToolFooterProps) {
  const { t } = useAppTranslation(["chat", "common"]);

  return (
    <div className="flex items-center justify-end gap-4 p-6 bg-white border-t border-gray-200">
      <button
        onClick={onClose}
        className="px-6 py-2 text-base font-nunito font-medium text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
      >
        {t("close")}
      </button>
      {showUseButton && (
        <button
          onClick={onUse}
          className="px-6 py-2 bg-blue-600 text-white text-base font-nunito font-semibold rounded-full hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {t("useThisTool")}
        </button>
      )}
    </div>
  );
}
