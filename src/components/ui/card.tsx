import type { ComponentProps, CSSProperties } from "react";
import { cn } from "@/lib/utils";

function Card({
  className,
  style,
  children,
  ...props
}: ComponentProps<"section">) {
  return (
    <section
      data-slot="card"
      style={
        {
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          ...style,
        } as CSSProperties
      }
      className={cn(
        "glass-rim relative z-10 flex flex-col rounded-[20px] border border-winter/[0.08] bg-card text-card-foreground shadow-[0_12px_40px_0_rgba(12,3,7,0.5)] backdrop-blur-[16px] backdrop-saturate-[180%]",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("relative z-10 flex flex-col items-center gap-1.5", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      data-slot="card-title"
      className={cn("text-lg font-bold tracking-tight text-winter", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-winter/85", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("relative z-10 w-full", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: ComponentProps<"footer">) {
  return (
    <footer
      data-slot="card-footer"
      className={cn("relative z-10 flex items-center justify-center", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
