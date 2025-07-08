"use client";

import { useAppTranslation } from "@/hooks/use-translation";

interface ToolCardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  isPlaceholder?: boolean;
}

export function ToolCard({
  title,
  description,
  children,
  isPlaceholder = false,
}: ToolCardProps) {
  const { t } = useAppTranslation(["chat", "common"]);

  return (
    <div className="bg-white p-6 rounded-xl">
      <h3 className="text-xl font-bold font-nunito mb-4 text-gray-900">
        {title}
      </h3>
      <p className="text-base text-gray-600 font-nunito mb-6">{description}</p>
      {children
        ? children
        : isPlaceholder && (
            <div className="text-center py-12 text-gray-500 font-nunito">
              {t("componentPlaceholder")}
            </div>
          )}
    </div>
  );
}
