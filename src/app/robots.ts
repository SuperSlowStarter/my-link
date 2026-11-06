import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * /robots.txt — 검색 로봇 안내
 * - 소개 페이지(/)와 공개 프로필(/{username})은 수집 허용
 * - 로그인해야 쓰는 개인 화면(/mypage, /stats)은 제외 (페이지 메타데이터에도 noindex)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/mypage", "/stats"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
