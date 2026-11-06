"use client";

import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/profile-menu";

/** Google 로고 (로그인 버튼 전용, Google 브랜드 가이드의 4색 G) */
export function GoogleGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/** Google 로그인 버튼 (헤더·안내 패널 공용) */
export function GoogleSignInButton({
  size = "sm",
  className,
  label = "Google로 로그인",
}: {
  size?: "sm" | "default";
  className?: string;
  label?: string;
}) {
  const signIn = useAuthStore((state) => state.signInWithGoogle);
  const pending = useAuthStore((state) => state.pending);
  return (
    <Button
      type="button"
      variant="glass"
      size={size}
      onClick={() => void signIn()}
      disabled={pending}
      aria-busy={pending}
      className={className}
    >
      <GoogleGlyph className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      <span>{pending ? "로그인 중..." : label}</span>
    </Button>
  );
}

/**
 * 헤더 로그인 영역
 * - 확인 중: 자리만 잡는 스켈레톤
 * - 로그아웃: Google로 로그인 버튼
 * - 로그인: 프로필 아이콘 버튼 + 드롭다운 (src/components/profile-menu.tsx)
 */
export function AuthMenu() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  if (status === "loading") {
    return <span aria-hidden="true" className="h-8 w-28 animate-pulse rounded-[6px] bg-winter/10" />;
  }

  if (status === "signedOut" || !user) {
    return (
      <div className="flex items-center gap-2">
        {error && (
          <button
            type="button"
            role="alert"
            onClick={clearError}
            title="닫기"
            className="max-w-[220px] cursor-pointer rounded-[6px] border border-danger/40 bg-crow/90 px-2.5 py-1 text-left text-[11px] font-medium text-danger backdrop-blur-md"
          >
            {error}
          </button>
        )}
        <GoogleSignInButton />
      </div>
    );
  }

  // 로그인: 프로필 아이콘 버튼 + 드롭다운
  return <ProfileMenu />;
}
