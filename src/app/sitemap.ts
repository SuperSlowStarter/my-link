import type { MetadataRoute } from "next";
import { listPublicUsernames } from "@/lib/public-profile-server";
import { SITE_URL } from "@/lib/site";

/**
 * /sitemap.xml — 검색 엔진에 알려 줄 공개 주소
 * - 홈(소개 페이지)
 * - 공개 프로필: usernames 컬렉션에 등록된 모든 /{username} (canonical과 같은 username 주소만)
 * /mypage, /stats 는 개인 화면이라 넣지 않는다.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profiles = await listPublicUsernames();

  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    ...profiles.map(({ username, updatedAt }) => ({
      url: `${SITE_URL}/${encodeURIComponent(username)}`,
      lastModified: updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
