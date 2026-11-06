import type { Metadata } from "next";
import { StatsDashboard } from "@/components/stats-dashboard";
import { PRIVATE_ROBOTS, SITE_NAME, socialMetadata } from "@/lib/site";

/** 로그인한 본인만 보는 화면 → 검색 결과에서 제외 (제목 뒤 " | MyLink"는 루트 template이 붙인다) */
export const metadata: Metadata = {
  title: "통계 대시보드",
  description: "내 링크별 클릭 수를 한눈에 보는 통계 대시보드",
  alternates: { canonical: "/stats" },
  robots: PRIVATE_ROBOTS,
  ...socialMetadata({ title: `통계 대시보드 | ${SITE_NAME}`, description: "내 링크별 클릭 수를 한눈에 보는 통계 대시보드", path: "/stats" }),
};

/** /stats — 내 링크 클릭 통계 (로그인 필수, 로그아웃이면 홈으로) */
export default function StatsPage() {
  return <StatsDashboard />;
}
