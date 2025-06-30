import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  error?: boolean;
}

function Input({ className, type, error, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full bg-transparent px-4 py-4 text-base font-normal text-[#111827]",
        "font-[Nunito] leading-6",
        "border border-transparent border-b-[#E5E7EB] border-b",
        "rounded-none",
        "placeholder:text-[#9CA3AF]",
        "focus:outline-none focus:border-b-2 focus:border-b-[#0055FF]",
        error && "border-b-[#F44336] focus:border-b-[#F44336]",
        "disabled:cursor-not-allowed disabled:text-[#9CA3AF] disabled:border-b-[#E5E7EB]",
        "transition-all duration-200",
        "shadow-none",
        className
      )}
      {...props}
    />
  );
}

export { Input };
