import type { CSSProperties } from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "glass-rim group/button relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[0.5rem] border text-sm font-semibold whitespace-nowrap transition-[transform,opacity,background-color,border-color,box-shadow] duration-200 ease-out outline-none select-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D111A] active:-translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-white/12 bg-[#0080FF] text-white shadow-[0_2px_12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 hover:bg-[#0073E6] hover:shadow-[0_6px_20px_rgba(0,128,255,0.3)]",
        primary:
          "border-white/12 bg-[#0080FF] text-white shadow-[0_2px_12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 hover:bg-[#0073E6] hover:shadow-[0_6px_20px_rgba(0,128,255,0.3)]",
        glass:
          "border-white/[0.08] bg-white/14 text-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur-md hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-[0_6px_18px_rgba(13,17,26,0.16)]",
        outline:
          "border-white/[0.08] bg-white/14 text-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur-md hover:bg-white/20",
        secondary:
          "border-white/[0.08] bg-white/14 text-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur-md hover:bg-white/20",
        ghost:
          "border-transparent bg-transparent text-white/90 hover:border-white/10 hover:bg-white/12 hover:text-white",
        destructive:
          "border-[#FF1493]/30 bg-[#FF1493]/20 text-white backdrop-blur-md hover:bg-[#FF1493]/35",
        link: "border-transparent bg-transparent text-[#0080FF] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-1.5 px-3.5 py-2",
        xs: "h-7 gap-1 rounded-[6px] px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 rounded-[6px] px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-4 py-3 text-sm",
        icon: "size-8",
        "icon-xs": "size-6 rounded-[6px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-[6px] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  style,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-glass-rim=""
      style={
        {
          "--rim-size": "130px",
          "--sheen-size": "140px",
          ...(typeof style === "object" ? style : {}),
        } as CSSProperties
      }
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
