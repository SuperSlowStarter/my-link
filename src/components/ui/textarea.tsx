import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[76px] w-full rounded-[0.5rem] border border-white/22 bg-white/10 px-3 py-2 text-sm leading-relaxed text-foreground shadow-xs backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-200 ease-out placeholder:text-white/45 hover:bg-white/14 focus-visible:border-[#0080FF] focus-visible:bg-white/15 focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D111A] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
