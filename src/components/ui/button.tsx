import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[0.5rem] border text-sm font-semibold whitespace-nowrap transition-[transform,opacity,background-color,border-color,box-shadow] duration-200 ease-punch outline-none select-none focus-visible:ring-2 focus-visible:ring-hearth focus-visible:ring-offset-2 focus-visible:ring-offset-crow active:-translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-crow/10 bg-hearth text-crow shadow-[0_2px_12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 hover:bg-hearth-deep hover:shadow-[0_6px_20px_rgba(225,202,166,0.22)]",
        primary:
          "border-crow/10 bg-hearth text-crow shadow-[0_2px_12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 hover:bg-hearth-deep hover:shadow-[0_6px_20px_rgba(225,202,166,0.22)]",
        glass:
          "border-winter/[0.08] bg-winter/14 text-winter shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur-md hover:-translate-y-0.5 hover:bg-winter/20 hover:shadow-[0_6px_18px_rgba(30,9,18,0.16)]",
        outline:
          "border-winter/[0.08] bg-winter/14 text-winter shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur-md hover:bg-winter/20",
        secondary:
          "border-winter/[0.08] bg-winter/14 text-winter shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur-md hover:bg-winter/20",
        ghost:
          "border-transparent bg-transparent text-winter/90 hover:border-winter/10 hover:bg-winter/12 hover:text-winter",
        destructive:
          "border-danger/35 bg-danger/15 text-danger backdrop-blur-md hover:bg-danger/25",
        link: "border-transparent bg-transparent text-hearth underline-offset-4 hover:underline",
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
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
