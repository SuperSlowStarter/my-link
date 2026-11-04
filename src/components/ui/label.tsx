import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "block text-left text-[0.75rem] font-medium tracking-wide text-winter/90 select-none",
        className
      )}
      {...props}
    />
  );
}

export { Label };
