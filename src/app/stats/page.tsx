import type { Metadata } from "next";
import { StatsDashboard } from "@/components/stats-dashboard";

export const metadata: Metadata = {
  title: "통계 대시보드 | MyLink",
  robots: { index: false },
};

/** /stats — 내 링크 클릭 통계 (로그인 필수, 로그아웃이면 홈으로) */
export default function StatsPage() {
  return <StatsDashboard />;
}
