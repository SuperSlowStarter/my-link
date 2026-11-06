import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL, socialMetadata } from "@/lib/site";

/**
 * 홈 (/) — 로그인 전에는 소개 페이지, 로그인 후에는 내 링크 페이지 (components/home-page.tsx)
 * 화면은 클라이언트 컴포넌트라 메타데이터는 이 서버 파일에서 내보낸다.
 * 검색 엔진은 로그인하지 않으므로 소개 페이지 기준으로 쓴다.
 */
export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  ...socialMetadata({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: "/" }),
};

/** 검색 결과에 사이트 이름을 보여 주는 구조화 데이터 (WebSite) */
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: "마이링크",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: "ko-KR",
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD: 공식 가이드 방식 (< 를 이스케이프해 스크립트 주입 방지)
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\u003c") }}
      />
      <HomePage />
    </>
  );
}
