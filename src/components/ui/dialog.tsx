"use client";

import {
  useEffect,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps extends Omit<ComponentProps<"dialog">, "open"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
  children: ReactNode;
}

/**
 * Glassmorphism Modal Dialog
 * Uses native <dialog closedby="any"> + showModal() with fallback light-dismiss
 * and z-index contract (overlay: 200, modal: 300) per PRD 5.3 & Design.md.
 */
function Dialog({
  open,
  onOpenChange,
  titleId,
  className,
  style,
  children,
  ...props
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      onOpenChange(false);
    };

    dialog.addEventListener("close", handleClose);

    // Fallback for browsers without closedby support (per modern-web-guidance light-dismiss-a-dialog)
    let handleBackdropClick: ((event: MouseEvent) => void) | null = null;
    if (
      typeof HTMLDialogElement !== "undefined" &&
      !("closedBy" in HTMLDialogElement.prototype)
    ) {
      handleBackdropClick = (event: MouseEvent) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;

        if (isDialogContent) return;
        dialog.close();
      };
      dialog.addEventListener("click", handleBackdropClick);
    }

    return () => {
      dialog.removeEventListener("close", handleClose);
      if (handleBackdropClick) {
        dialog.removeEventListener("click", handleBackdropClick);
      }
    };
  }, [onOpenChange]);

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby={titleId}
      style={
        {
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          ...style,
        } as CSSProperties
      }
      className={cn(
        "fixed top-1/2 left-1/2 z-[300] m-0 w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-[16px] border border-winter/10 bg-popover p-6 text-left text-foreground shadow-[0_16px_48px_rgba(0,0,0,0.5)] backdrop-blur-[20px] backdrop-saturate-[180%] outline-none open:animate-expand",
        className
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </dialog>
  );
}

function DialogHeader({
  className,
  onClose,
  children,
}: {
  className?: string;
  onClose?: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex items-start justify-between gap-3 border-b border-winter/15 pb-3",
        className
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="모달 닫기"
          className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[6px] border border-winter/15 bg-winter/10 text-winter/80 transition-colors hover:bg-winter/20 hover:text-winter focus-visible:ring-2 focus-visible:ring-hearth focus-visible:outline-none"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

export { Dialog, DialogHeader };
