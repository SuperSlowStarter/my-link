"use client";

import { Toaster } from "sonner";
import { CircleAlert, CircleCheck, Info, Loader2 } from "lucide-react";

/**
 * 전역 알림 (Sonner) — 짙은 유리 패널, 헤더 아래 우측
 * 사용: import { toast } from "sonner"; toast.success("복사했어요", { description: url })
 * z-index는 Sonner 기본값(999999)을 쓰므로 로딩 오버레이(400) 위에 뜬다.
 */
export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      offset={{ top: 72, right: 16 }}
      mobileOffset={{ top: 68, right: 12, left: 12 }}
      gap={8}
      duration={2600}
      theme="dark"
      icons={{
        success: <CircleCheck className="h-4 w-4 text-hearth" aria-hidden="true" />,
        error: <CircleAlert className="h-4 w-4 text-danger" aria-hidden="true" />,
        info: <Info className="h-4 w-4 text-wharf" aria-hidden="true" />,
        loading: <Loader2 className="h-4 w-4 animate-spin text-hearth" aria-hidden="true" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-start gap-3 rounded-[14px] bg-popover px-3.5 py-3 text-winter shadow-[0_16px_40px_rgba(12,3,7,0.55),inset_0_1px_1px_rgba(245,236,209,0.1),inset_0_0_18px_rgba(245,236,209,0.04)] backdrop-blur-xl backdrop-saturate-150 sm:w-[340px]",
          icon: "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center",
          content: "flex min-w-0 flex-1 flex-col gap-0.5",
          title: "text-[13px] font-semibold text-winter",
          description: "truncate font-mono text-[11px] text-winter/55",
          error: "[&_[data-title]]:text-danger",
        },
      }}
    />
  );
}
