import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPublicProfileSummary, resolvePublicSlug, safeDecode } from "@/lib/public-profile-server";
import { SITE_NAME, SITE_URL, socialMetadata } from "@/lib/site";
import { PublicProfilePage, PublicProfileSkeleton } from "@/components/public-profile";

/**
 * 공개 개인 페이지 /{username} 또는 /{displayName}
 * 1. URL에서 주소 글자(slug)를 꺼낸다 (한글·띄어쓰기는 디코딩)
 * 2. username으로 먼저 찾는다 — Firestore usernames/{username} → userId
 * 3. 없으면 displayName으로 찾는다 — collectionGroup("profile") where displayName == slug → userId
 * 4. 찾은 userId로 users/{userId}/profile/main, users/{userId}/links 를 조회해 보여준다 (PublicProfilePage)
 * 5. 둘 다 없으면 404 (app/not-found.tsx)
 *
 * 조회 함수는 OG 이미지(opengraph-image.tsx)와 같이 쓰려고 lib/public-profile-server.ts 로 옮겼다.
 * 폴더 이름은 [username] 하나로 둔다 (같은 자리에 동적 폴더 두 개는 둘 수 없음).
 * cacheComponents 사용 중이라 동적 params는 Suspense 안에서 읽는다 (Next.js 16 동적 라우트 가이드).
 */
type Props = { params: Promise<{ username: string }> };

/** 프로필 → 검색 결과 제목·설명 (페이지 · JSON-LD 가 같은 문구를 쓴다) */
function describeProfile(handle: string, profile: { displayName: string; bio: string; username: string; linkCount: number }) {
  const name = profile.displayName || handle;
  const username = profile.username || handle;
  const title = name === username ? `@${username}` : `${name} (@${username})`;
  const description =
    profile.bio.trim() ||
    `${name}님의 포트폴리오와 작업 채널을 한곳에 모은 링크 페이지${profile.linkCount > 0 ? ` · 링크 ${profile.linkCount}개` : ""}.`;
  return { name, username, title, description: description.slice(0, 160) };
}

/**
 * SEO 메타데이터: 사람 이름·소개로 제목과 설명을 만든다.
 * - canonical은 username 주소(/cleangabb)로 통일 — displayName 주소(/대건)로 들어와도 같은 페이지로 본다
 * - 못 찾으면 검색 제외 (페이지는 404)
 * - params를 읽으므로 요청 시점에 만들어진다 (페이지도 Suspense로 요청 시점 렌더 → Cache Components 규칙 충족)
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username: raw } = await params;
  const found = await resolvePublicSlug(raw).catch(() => null);
  const profile = found ? await getPublicProfileSummary(found.uid).catch(() => null) : null;

  if (!found || !profile) {
    return {
      title: "페이지를 찾을 수 없어요",
      description: `MyLink에 "${safeDecode(raw).slice(0, 30)}" 페이지가 없어요.`,
      robots: { index: false, follow: false },
    };
  }

  const { title, description, username } = describeProfile(found.handle, profile);
  const path = `/${encodeURIComponent(username)}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    authors: [{ name: profile.displayName || username, url: path }],
    ...socialMetadata({ title: `${title} | ${SITE_NAME}`, description, path, type: "profile", extra: { username } }),
  };
}

export default function UsernamePage({ params }: Props) {
  return (
    <Suspense fallback={<PublicProfileSkeleton />}>
      <ResolveProfile params={params} />
    </Suspense>
  );
}

async function ResolveProfile({ params }: Props) {
  const { username: raw } = await params;
  const found = await resolvePublicSlug(raw);
  if (!found) notFound();
  const profile = await getPublicProfileSummary(found.uid).catch(() => null);

  return (
    <>
      {profile ? <ProfileJsonLd handle={found.handle} profile={profile} /> : null}
      <PublicProfilePage uid={found.uid} username={found.handle} />
    </>
  );
}

/**
 * 구조화 데이터 (schema.org ProfilePage + Person) — 검색 엔진이 "이 사람의 프로필 페이지"로 이해하게.
 */
function ProfileJsonLd({
  handle,
  profile,
}: {
  handle: string;
  profile: NonNullable<Awaited<ReturnType<typeof getPublicProfileSummary>>>;
}) {
  const { name, username, description } = describeProfile(handle, profile);
  const url = `${SITE_URL}/${encodeURIComponent(username)}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    name: `${name} | ${SITE_NAME}`,
    inLanguage: "ko-KR",
    mainEntity: {
      "@type": "Person",
      name,
      alternateName: `@${username}`,
      identifier: username,
      description,
      url,
      ...(profile.photoURL ? { image: profile.photoURL } : {}),
    },
  };
  return (
    <script
      type="application/ld+json"
      // JSON-LD: 공식 가이드 방식 (< 를 이스케이프해 스크립트 주입 방지)
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
