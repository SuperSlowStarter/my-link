import type { ComponentProps, CSSProperties } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "glass-rim relative inline-flex shrink-0 items-center justify-center gap-1 rounded-[4px] border px-2.5 py-0.5 text-[0.75rem] font-medium tracking-wide whitespace-nowrap transition-[transform,opacity,background-color,border-color] duration-200 ease-out",
  {
    variants: {
      variant: {
        default:
          "border-white/[0.08] bg-white/12 text-white/95 shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur-sm",
        primary:
          "border-white/15 bg-[#0080FF] font-mono text-[0.6875rem] tracking-wider text-white uppercase",
        purple:
          "border-white/15 bg-[#8B00FF] px-1.5 py-0.5 font-mono text-[0.6875rem] tracking-wider text-white uppercase",
        pink:
          "border-white/15 bg-[#FF1493] px-1.5 py-0.5 font-mono text-[0.6875rem] tracking-wider text-white uppercase",
        teal:
          "border-white/20 bg-[#121723]/85 px-2 py-0.5 font-mono text-[11px] text-[#20B2AA] shadow-xs backdrop-blur-md",
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
  style,
  children,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      data-glass-rim=""
      style={
        {
          "--rim-size": "80px",
          "--sheen-size": "85px",
          ...style,
        } as CSSProperties
      }
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
