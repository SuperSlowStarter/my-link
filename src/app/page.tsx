"use client";

import { useAuthStore } from "@/store/auth-store";
import { AmbientBackground } from "@/components/ambient-background";
import { HubPage } from "@/components/hub-page";
import { LandingPage } from "@/components/landing-page";
import { SiteHeader } from "@/components/site-header";

/**
 * 홈 (/)
 * - 로그인 전: 서비스 소개 + Google로 시작하기 (LandingPage)
 * - 로그인 후: 내 링크 페이지 (HubPage)
 * - 로그인 상태 확인 중: 헤더와 배경만 (전체 화면 로딩 오버레이가 덮는다)
 */
export default function Home() {
  const status = useAuthStore((state) => state.status);

  if (status === "signedIn") return <HubPage />;
  if (status === "signedOut") return <LandingPage />;

  return (
    <>
      <AmbientBackground />
      <SiteHeader />
      <main className="flex-1" />
    </>
  );
}
