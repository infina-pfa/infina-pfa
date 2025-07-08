"use client";

import { useAppTranslation } from "@/hooks/use-translation";

interface ToolButtonProps {
  toolId?: string;
  onClick?: () => void;
  className?: string;
}

export function ToolButton({
  toolId,
  onClick,
  className = "text-sm bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors font-nunito font-semibold cursor-pointer",
}: ToolButtonProps) {
  const { t } = useAppTranslation(["chat", "common"]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      console.log("Open component:", toolId);
    }
  };

  return (
    <button className={className} onClick={handleClick}>
      {t("openTool")}
    </button>
  );
}
