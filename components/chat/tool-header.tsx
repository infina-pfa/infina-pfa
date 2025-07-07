"use client";

import { useAppTranslation } from "@/hooks/use-translation";
import { X } from "lucide-react";

interface ToolHeaderProps {
  title: string;
  onClose: () => void;
  isMobile?: boolean;
}

export function ToolHeader({
  title,
  onClose,
  isMobile = false,
}: ToolHeaderProps) {
  const { t } = useAppTranslation(["chat", "common"]);

  return (
    <div
      className={`
        flex items-center justify-between 
        ${
          isMobile
            ? "p-4 bg-gray-100 rounded-t-xl"
            : "p-6 bg-gray-100 border-b border-gray-200"
        }
      `}
    >
      <h2 className="text-xl font-bold font-nunito text-gray-900">{title}</h2>
      <button
        onClick={onClose}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
        aria-label={t("closePanel")}
      >
        <X className="w-6 h-6 text-gray-600" />
      </button>
    </div>
  );
}
