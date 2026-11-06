import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Input({ className, type = "text", ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full rounded-[0.5rem] border border-winter/22 bg-winter/10 px-3 py-1.5 text-sm text-foreground shadow-xs backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-200 ease-punch placeholder:text-winter/45 hover:bg-winter/14 focus-visible:border-hearth focus-visible:bg-winter/15 focus-visible:ring-2 focus-visible:ring-hearth focus-visible:ring-offset-2 focus-visible:ring-offset-crow focus-visible:outline-none aria-invalid:border-danger/70 aria-invalid:focus-visible:ring-danger disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
