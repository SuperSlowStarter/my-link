import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-1 rounded-[4px] border px-2.5 py-0.5 text-[0.75rem] font-medium tracking-wide whitespace-nowrap transition-[transform,opacity,background-color,border-color] duration-200 ease-punch",
  {
    variants: {
      variant: {
        default:
          "border-winter/[0.08] bg-winter/12 text-winter/95 shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur-sm",
        primary:
          "border-crow/10 bg-hearth font-mono text-[0.6875rem] tracking-wider text-crow uppercase",
        purple:
          "border-winter/15 bg-diplomatic px-1.5 py-0.5 font-mono text-[0.6875rem] tracking-wider text-winter uppercase",
        pink:
          "border-crow/15 bg-wharf px-1.5 py-0.5 font-mono text-[0.6875rem] tracking-wider text-crow uppercase",
        teal:
          "border-winter/20 bg-cedar/85 px-2 py-0.5 font-mono text-[11px] text-hearth shadow-xs backdrop-blur-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant = "default",
  children,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center gap-1">
        {children}
      </span>
    </span>
  );
}

export { Badge, badgeVariants };
