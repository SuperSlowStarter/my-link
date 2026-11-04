import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "내 링크 관리 | 이대건",
  description: "마이링크에 표시할 링크를 추가하고 관리하는 페이지",
};

export default function MyPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
