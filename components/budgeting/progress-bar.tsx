"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100 percentage
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
}

export const ProgressBar = ({
  value,
  className,
  trackClassName,
  fillClassName,
}: ProgressBarProps) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "h-1 w-full bg-[#E5E7EB] rounded-full overflow-hidden",
          trackClassName
        )}
      >
        <div
          className={cn(
            "h-full bg-[#0055FF] transition-all duration-150 ease-in-out rounded-full",
            fillClassName
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
