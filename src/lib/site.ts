import type { Metadata } from "next";

/**
 * 사이트 공통 정보 (SEO 메타데이터 · sitemap · robots · JSON-LD 에서 같이 쓴다)
 *
 * 절대 주소(SITE_URL) 우선순위
 * 1) NEXT_PUBLIC_SITE_URL — 직접 정한 대표 도메인 (커스텀 도메인을 붙이면 Vercel 환경 변수에 넣는다)
 * 2) VERCEL_PROJECT_PRODUCTION_URL — Vercel이 자동으로 주는 Production 주소 (Preview 배포에서도 대표 주소로 canonical)
 * 3) 로컬 개발: http://localhost:3000
 */
export const SITE_URL = (() => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
})();

export const SITE_NAME = "MyLink";
export const SITE_TITLE = "MyLink — 모션 디자이너를 위한 링크 허브";
export const SITE_DESCRIPTION =
  "포트폴리오·유튜브·인스타그램·외주 문의를 한 장의 글래스 카드에. Google 계정으로 1분 만에 만드는 모션 디자이너용 링크 페이지.";

export const SITE_KEYWORDS = [
  "MyLink",
  "마이링크",
  "링크 페이지",
  "링크 모음",
  "링크인바이오",
  "link in bio",
  "모션 디자이너",
  "모션 그래픽",
  "포트폴리오",
  "포트폴리오 링크",
  "외주 문의",
];

/**
 * 하위 페이지에서 openGraph / twitter 를 쓰면 부모 값이 통째로 바뀐다 (얕은 병합).
 * 사이트 이름·언어 같은 공통값이 빠지지 않게 이 함수로 만든다.
 * 이미지는 넣지 않는다 — 파일 기반 opengraph-image.tsx 가 자동으로 붙인다.
 */
export function socialMetadata({
  title,
  description,
  path,
  type = "website",
  extra,
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "profile";
  extra?: { username?: string };
}): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: "ko_KR",
      url: path,
      title,
      description,
      ...(type === "profile" && extra?.username ? { username: extra.username } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/** 로그인해야 쓰는 개인 화면: 검색 결과에 나오지 않게 */
export const PRIVATE_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};
