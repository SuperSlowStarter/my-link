"use client";

import { Check, Lock } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { GoogleSignInButton } from "@/components/auth-menu";

/**
 * 로그인 전 안내 패널 — 로그인해야 쓸 수 있는 기능 자리에 대신 보여준다.
 * 인증 상태를 확인하는 중에는 스켈레톤을 보여줘 깜빡임을 막는다.
 */
export function LoginRequired({
  title = "로그인하면 사용할 수 있어요",
  description,
  features,
  compact = false,
}: {
  title?: string;
  description: string;
  features?: string[];
  compact?: boolean;
}) {
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);

  if (status === "loading") {
    return (
      <div
        aria-busy="true"
        aria-label="로그인 상태 확인 중"
        className="h-[150px] w-full animate-pulse rounded-[0.5rem] bg-winter/[0.08]"
      />
    );
  }

  return (
    <section
      aria-label="로그인 안내"
      className={`flex w-full flex-col items-center rounded-[0.5rem] border border-dashed border-winter/25 bg-winter/[0.06] text-center ${
        compact ? "gap-2 p-5" : "gap-3 p-6"
      }`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-hearth/40 bg-hearth/15">
        <Lock className="h-4 w-4 text-hearth" aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-sm font-bold text-winter">{title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-winter/70">{description}</p>
      </div>
      {features && features.length > 0 && (
        <ul className="flex flex-col gap-1 text-left text-[11px] text-winter/75">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-1.5">
              <Check className="mt-0.5 h-3 w-3 shrink-0 text-hearth" aria-hidden="true" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}
      <GoogleSignInButton size="default" className="mt-1" label="Google 계정으로 로그인" />
      {error && (
        <p role="alert" className="text-[11px] font-medium text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
