import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isValidUsername } from "@/lib/username";
import { PublicProfilePage, PublicProfileSkeleton } from "@/components/public-profile";

/**
 * 공개 개인 페이지 /{username}
 * 1. URL에서 username을 꺼낸다
 * 2. Firestore usernames/{username} 에서 userId(uid)를 찾는다  (username → uid 변환)
 * 3. 찾은 uid로 users/{uid}/profile/main, users/{uid}/links 를 조회해 보여준다 (PublicProfilePage)
 * 4. username이 없으면 404 (app/not-found.tsx)
 *
 * cacheComponents 사용 중이라 동적 params는 Suspense 안에서 읽는다 (Next.js 16 동적 라우트 가이드).
 */
export default function UsernamePage({ params }: { params: Promise<{ username: string }> }) {
  return (
    <Suspense fallback={<PublicProfileSkeleton />}>
      <ResolveUsername params={params} />
    </Suspense>
  );
}

async function ResolveUsername({ params }: { params: Promise<{ username: string }> }) {
  const { username: raw } = await params;
  const username = decodeURIComponent(raw).trim().toLowerCase();
  if (!isValidUsername(username)) notFound();

  const uid = await findUidByUsernameOnServer(username);
  if (!uid) notFound();

  return <PublicProfilePage uid={uid} username={username} />;
}

/**
 * 서버에서 usernames/{username} 문서를 읽는다 (Firestore REST, 누구나 읽기 규칙).
 * 문서가 없으면 null → 404.
 */
async function findUidByUsernameOnServer(username: string): Promise<string | null> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!projectId || !apiKey) return null;

  const url =
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/usernames/` +
    `${encodeURIComponent(username)}?key=${apiKey}`;
  const response = await fetch(url, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`username 조회 실패 (${response.status})`);

  const json = (await response.json()) as { fields?: { uid?: { stringValue?: string } } };
  return json.fields?.uid?.stringValue ?? null;
}
