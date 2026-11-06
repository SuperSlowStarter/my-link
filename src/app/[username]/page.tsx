import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isValidUsername } from "@/lib/username";
import { PublicProfilePage, PublicProfileSkeleton } from "@/components/public-profile";

/**
 * 공개 개인 페이지 /{username} 또는 /{displayName}
 * 1. URL에서 주소 글자(slug)를 꺼낸다 (한글·띄어쓰기는 디코딩)
 * 2. username으로 먼저 찾는다 — Firestore usernames/{username} → userId
 * 3. 없으면 displayName으로 찾는다 — collectionGroup("profile") where displayName == slug → userId
 * 4. 찾은 userId로 users/{userId}/profile/main, users/{userId}/links 를 조회해 보여준다 (PublicProfilePage)
 * 5. 둘 다 없으면 404 (app/not-found.tsx)
 *
 * 폴더 이름은 [username] 하나로 둔다 (같은 자리에 동적 폴더 두 개는 둘 수 없음).
 * cacheComponents 사용 중이라 동적 params는 Suspense 안에서 읽는다 (Next.js 16 동적 라우트 가이드).
 */
export default function UsernamePage({ params }: { params: Promise<{ username: string }> }) {
  return (
    <Suspense fallback={<PublicProfileSkeleton />}>
      <ResolveProfile params={params} />
    </Suspense>
  );
}

async function ResolveProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username: raw } = await params;
  const slug = safeDecode(raw).trim();
  if (!slug) notFound();

  // 1) username (영문 소문자 규칙에 맞을 때만)
  const asUsername = slug.toLowerCase();
  if (isValidUsername(asUsername)) {
    const uid = await findUidByUsernameOnServer(asUsername);
    if (uid) return <PublicProfilePage uid={uid} username={asUsername} />;
  }

  // 2) displayName (표시 이름 규칙: 1~30자, 대소문자·띄어쓰기까지 정확히 같은 이름)
  if (slug.length <= 30) {
    const uid = await findUidByDisplayNameOnServer(slug);
    if (uid) return <PublicProfilePage uid={uid} username={slug} />;
  }

  notFound();
}

/** 잘못된 %인코딩이 와도 죽지 않게 */
function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

const firestoreBase = () => {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!projectId || !apiKey) return null;
  return { root: `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`, apiKey };
};

/**
 * 서버에서 usernames/{username} 문서를 읽는다 (Firestore REST, 누구나 읽기 규칙).
 * 문서가 없으면 null.
 */
async function findUidByUsernameOnServer(username: string): Promise<string | null> {
  const base = firestoreBase();
  if (!base) return null;

  const response = await fetch(`${base.root}/usernames/${encodeURIComponent(username)}?key=${base.apiKey}`, {
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`username 조회 실패 (${response.status})`);

  const json = (await response.json()) as { fields?: { uid?: { stringValue?: string } } };
  return json.fields?.uid?.stringValue ?? null;
}

/**
 * 서버에서 displayName이 같은 프로필을 찾는다 (Firestore REST runQuery, 컬렉션 그룹 쿼리).
 * - 모든 사용자의 users/{uid}/profile/main 을 한 번에 찾는다: from: { collectionId: "profile", allDescendants: true }
 * - 필요한 설정은 displayName 중복 확인과 같다: profile.displayName 컬렉션 그룹 인덱스 + 규칙 /{path=**}/profile/{docId} 읽기 허용
 * - 저장할 때 중복을 막지만(§3.7) 혹시 둘 이상이면 먼저 나온 사람을 보여준다.
 */
async function findUidByDisplayNameOnServer(displayName: string): Promise<string | null> {
  const base = firestoreBase();
  if (!base) return null;

  const response = await fetch(`${base.root}:runQuery?key=${base.apiKey}`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "profile", allDescendants: true }],
        where: {
          fieldFilter: { field: { fieldPath: "displayName" }, op: "EQUAL", value: { stringValue: displayName } },
        },
        limit: 2,
      },
    }),
  });
  if (!response.ok) throw new Error(`displayName 조회 실패 (${response.status})`);

  // 결과가 없으면 [{ readTime }] 만 온다
  const rows = (await response.json()) as { document?: { name?: string } }[];
  for (const row of rows) {
    // name: projects/{p}/databases/(default)/documents/users/{uid}/profile/main
    const path = row.document?.name?.split("/documents/")[1]?.split("/");
    if (path && path.length === 4 && path[0] === "users" && path[2] === "profile" && path[3] === "main") {
      return path[1];
    }
  }
  return null;
}
