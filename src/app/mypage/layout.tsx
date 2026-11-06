import type { Metadata } from "next";
import { PRIVATE_ROBOTS, SITE_NAME, socialMetadata } from "@/lib/site";

/** 로그인한 본인만 쓰는 관리 화면 → 검색 결과에서 제외 (제목 뒤 " | MyLink"는 루트 template이 붙인다) */
export const metadata: Metadata = {
  title: "내 링크 관리",
  description: "MyLink에 표시할 링크를 추가하고 순서·스타일을 관리하는 페이지",
  alternates: { canonical: "/mypage" },
  robots: PRIVATE_ROBOTS,
  ...socialMetadata({ title: `내 링크 관리 | ${SITE_NAME}`, description: "MyLink에 표시할 링크를 추가하고 순서·스타일을 관리하는 페이지", path: "/mypage" }),
};

export default function MyPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
