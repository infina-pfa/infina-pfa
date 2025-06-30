import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-auto w-full rounded-full bg-[#F9FAFB] px-6 py-3 text-base text-[#111827]",
        "placeholder:text-[#9CA3AF]",
        "focus:outline-none focus:bg-white focus:ring-0",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
        "transition-all duration-200",
        "shadow-none border-none",
        className
      )}
      {...props}
    />
  );
}

export { Input };
