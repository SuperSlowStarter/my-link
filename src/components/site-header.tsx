"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useMyProfile } from "@/hooks/use-profile";
import { buttonVariants } from "@/components/ui/button";
import { AuthMenu } from "@/components/auth-menu";

/**
 * 사이트 헤더 (모든 페이지 공통)
 * - 왼쪽: 로고(홈으로) / 오른쪽: 페이지별 동작 버튼(actions) + `내 페이지`(로그인 시) + 계정(로그인 버튼 또는 프로필 드롭다운)
 * - 페이지 이동은 프로필 드롭다운에 두고, 헤더에는 내 공개 페이지(/{username}) 바로가기 버튼 하나만 둔다.
 * - 화면 맨 위에 붙어 따라오며(sticky), 스크롤하면 배경이 진해지고 아래 구분선에 그림자가 생긴다.
 * - z-index 계약: sticky-nav 100 (Design.md)
 */

/** MyLink 로고 마크: 두 고리가 맞물린 모양 (Hearth 바탕 + Crow 선) */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#E1CAA6" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" fill="none" stroke="#F5ECD1" strokeOpacity="0.55" />
      <path
        d="M13.5 18.5a4.25 4.25 0 0 1 0-6l2.5-2.5a4.25 4.25 0 0 1 6 6l-1.25 1.25"
        fill="none"
        stroke="#1E0912"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M18.5 13.5a4.25 4.25 0 0 1 0 6L16 22a4.25 4.25 0 0 1-6-6l1.25-1.25"
        fill="none"
        stroke="#1E0912"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SiteHeader({
  actions,
  hideMyPage = false,
}: {
  actions?: ReactNode;
  /** 이미 내 공개 페이지에 있을 때 `내 페이지` 버튼 숨김 */
  hideMyPage?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-[100] w-full backdrop-blur-xl backdrop-saturate-150 transition-[background-color,box-shadow] duration-300 ease-swoosh ${
        scrolled
          ? "bg-crow/80 shadow-[0_8px_24px_rgba(12,3,7,0.45)]"
          : "bg-crow/45 shadow-none"
      }`}
    >
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
        {/* 왼쪽: 로고 (홈으로) */}
        <Link
          href="/"
          aria-label="MyLink 홈"
          className="group flex shrink-0 items-center gap-2 rounded-[6px] outline-none focus-visible:ring-2 focus-visible:ring-hearth focus-visible:ring-offset-2 focus-visible:ring-offset-crow"
        >
          <LogoMark className="h-7 w-7 transition-transform duration-200 ease-punch group-hover:-rotate-6" />
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-bold tracking-tight text-winter">MyLink</span>
            <span className="mt-0.5 hidden font-mono text-[9px] tracking-wider text-winter/45 uppercase sm:block">
              Motion Link Hub
            </span>
          </span>
        </Link>

        {/* 오른쪽: 페이지별 동작 버튼 + 계정 */}
        <div className="ml-auto flex items-center gap-2">
          {actions}
          {actions && <span aria-hidden="true" className="hidden h-5 w-px bg-winter/15 sm:block" />}
          {!hideMyPage && <MyPageButton />}
          <AuthMenu />
        </div>
      </div>

      {/* 헤더 구분선: 가운데가 밝고 양 끝으로 사라지는 1px 라인 */}
      <div
        aria-hidden="true"
        className="h-px w-full bg-gradient-to-r from-transparent via-winter/20 to-transparent"
      />
    </header>
  );
}

/** 내 공개 페이지(/{username}) 바로가기 — 로그인하고 프로필이 준비됐을 때만 보인다 */
function MyPageButton() {
  const { profile } = useMyProfile();
  if (!profile?.username) return null;
  return (
    <>
      <Link
        href={`/${profile.username}`}
        aria-label={`내 페이지 (/${profile.username})`}
        className={buttonVariants({ variant: "glass", size: "sm" })}
      >
        <ExternalLink className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">내 페이지</span>
      </Link>
      {/* 버튼과 계정(프로필 사진) 사이 구분선 */}
      <span aria-hidden="true" className="hidden h-5 w-px bg-winter/15 sm:block" />
    </>
  );
}
