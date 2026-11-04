"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, ListPlus } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { AuthMenu } from "@/components/auth-menu";

/**
 * 사이트 헤더 (모든 페이지 공통)
 * - 왼쪽: 로고(홈으로) / 가운데: 내비게이션 / 오른쪽: 페이지별 버튼(actions) + Google 로그인
 * - 화면 맨 위에 붙어 따라오며(sticky), 스크롤하면 배경이 진해지고 아래 구분선에 그림자가 생긴다.
 * - z-index 계약: sticky-nav 100 (Design.md)
 */

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: House },
  { href: "/mypage", label: "내 링크 관리", icon: ListPlus },
] as const;

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

export function SiteHeader({ actions }: { actions?: ReactNode }) {
  // 메뉴(홈·내 링크 관리)는 로그인한 사용자에게만 보인다
  const isSignedIn = useAuthStore((state) => state.status === "signedIn");
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
        {/* 왼쪽: 로고 */}
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

        {/* 가운데: 내비게이션 (현재 페이지에 Hearth 밑줄) */}
        {/* usePathname은 동적 경로(/[username])에서 런타임 데이터라 Suspense 안에서 읽는다 (cacheComponents) */}
        {isSignedIn && (
          <Suspense fallback={<HeaderNav pathname={null} />}>
            <HeaderNavWithPath />
          </Suspense>
        )}

        {/* 오른쪽: 페이지별 버튼 + 로그인 */}
        <div className="ml-auto flex items-center gap-2">
          {actions}
          {actions && <span aria-hidden="true" className="hidden h-5 w-px bg-winter/15 sm:block" />}
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

/** 현재 경로를 읽어 메뉴에 넘긴다 (Suspense 안에서만 렌더) */
function HeaderNavWithPath() {
  const pathname = usePathname();
  return <HeaderNav pathname={pathname} />;
}

/** 주 메뉴 — 현재 페이지에 Hearth 밑줄 */
function HeaderNav({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="주 메뉴" className="flex h-full items-stretch gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            aria-label={label}
            className={`relative flex items-center gap-1.5 px-2.5 text-[13px] transition-colors duration-200 ease-punch outline-none focus-visible:text-winter ${
              active ? "font-medium text-winter" : "text-winter/60 hover:text-winter"
            }`}
          >
            <Icon className="h-4 w-4 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{label}</span>
            <span
              aria-hidden="true"
              className={`absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-hearth transition-opacity duration-200 ease-punch ${
                active ? "opacity-100" : "opacity-0"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
