"use client";

import type { ComponentProps } from "react";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-white/25 bg-white/15 p-0.5 shadow-xs backdrop-blur-md transition-colors duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D111A] data-[checked]:border-[#0080FF] data-[checked]:bg-[#0080FF] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out data-[checked]:translate-x-4 data-[unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
