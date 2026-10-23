import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Input({ className, type = "text", ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full rounded-[0.5rem] border border-white/22 bg-white/10 px-3 py-1.5 text-sm text-foreground shadow-xs backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-200 ease-out placeholder:text-white/45 hover:bg-white/14 focus-visible:border-[#0080FF] focus-visible:bg-white/15 focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D111A] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
