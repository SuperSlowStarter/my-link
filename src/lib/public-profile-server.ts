import { cache } from "react";
import { isValidUsername } from "@/lib/username";

/**
 * 서버 전용: 공개 페이지 /[username] 과 그 OG 이미지가 함께 쓰는 Firestore REST 조회.
 * (Firebase JS SDK 대신 REST — 서버에서 로그인 없이 "누구나 읽기" 규칙으로 읽는다)
 *
 * resolvePublicSlug · getPublicProfileSummary 는 React cache로 감싼다:
 * 한 요청 안에서 generateMetadata · 페이지 · JSON-LD 가 같은 값을 물어도 Firestore는 한 번만 조회한다.
 */

const firestoreBase = () => {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!projectId || !apiKey) return null;
  return { root: `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`, apiKey };
};

/** 잘못된 %인코딩이 와도 죽지 않게 */
export function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * URL 글자(slug) → { uid, handle }
 * 1) username (영문 소문자 규칙에 맞을 때만) → usernames/{username}
 * 2) displayName (1~30자, 대소문자·띄어쓰기까지 정확히 같은 이름) → 컬렉션 그룹 쿼리
 * 둘 다 없으면 null
 */
export const resolvePublicSlug = cache(async (raw: string): Promise<{ uid: string; handle: string } | null> => {
  const slug = safeDecode(raw).trim();
  if (!slug) return null;

  const asUsername = slug.toLowerCase();
  if (isValidUsername(asUsername)) {
    const uid = await findUidByUsernameOnServer(asUsername);
    if (uid) return { uid, handle: asUsername };
  }

  if (slug.length <= 30) {
    const uid = await findUidByDisplayNameOnServer(slug);
    if (uid) return { uid, handle: slug };
  }

  return null;
});

/**
 * 서버에서 usernames/{username} 문서를 읽는다 (Firestore REST, 누구나 읽기 규칙).
 * 문서가 없으면 null.
 */
export async function findUidByUsernameOnServer(username: string): Promise<string | null> {
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
export async function findUidByDisplayNameOnServer(displayName: string): Promise<string | null> {
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

/* ------------------------------------------------------------------ */
/* OG 이미지용 요약 (프로필 + 앞쪽 링크 몇 개)                            */
/* ------------------------------------------------------------------ */
type RestValue = { stringValue?: string; integerValue?: string; doubleValue?: number };
type RestDoc = { fields?: Record<string, RestValue> };

const str = (doc: RestDoc | undefined, key: string) => doc?.fields?.[key]?.stringValue ?? "";
const num = (doc: RestDoc | undefined, key: string) => {
  const value = doc?.fields?.[key];
  if (value?.integerValue !== undefined) return Number(value.integerValue);
  if (value?.doubleValue !== undefined) return value.doubleValue;
  return Number.MAX_SAFE_INTEGER; // order가 없는 예전 문서는 맨 뒤
};

export interface PublicLinkSummary {
  title: string;
  subtitle: string;
  iconType: string;
  badge: string;
  variant: "primary" | "glass";
}

export interface PublicProfileSummary {
  username: string;
  displayName: string;
  bio: string;
  photoURL: string;
  linkCount: number;
  /** 메인 카드와 같은 순서(order 오름차순)의 앞쪽 링크 */
  links: PublicLinkSummary[];
}

/** users/{uid}/profile/main + users/{uid}/links 를 읽어 OG 이미지에 필요한 만큼만 돌려준다 */
export const getPublicProfileSummary = cache(async (uid: string, maxLinks = 3): Promise<PublicProfileSummary | null> => {
  const base = firestoreBase();
  if (!base) return null;
  const userRoot = `${base.root}/users/${encodeURIComponent(uid)}`;

  const [profileRes, linksRes] = await Promise.all([
    fetch(`${userRoot}/profile/main?key=${base.apiKey}`, { cache: "no-store" }),
    fetch(`${userRoot}/links?pageSize=100&key=${base.apiKey}`, { cache: "no-store" }),
  ]);
  if (!profileRes.ok) return null;

  const profile = (await profileRes.json()) as RestDoc;
  const linkDocs = linksRes.ok ? (((await linksRes.json()) as { documents?: RestDoc[] }).documents ?? []) : [];

  const links = [...linkDocs]
    .sort((a, b) => num(a, "order") - num(b, "order"))
    .map<PublicLinkSummary>((doc) => ({
      title: str(doc, "title"),
      subtitle: str(doc, "subtitle"),
      iconType: str(doc, "iconType") || "link",
      badge: str(doc, "badge"),
      variant: str(doc, "variant") === "primary" ? "primary" : "glass",
    }))
    .filter((link) => link.title);

  return {
    username: str(profile, "username"),
    displayName: str(profile, "displayName"),
    bio: str(profile, "bio"),
    photoURL: str(profile, "photoURL"),
    linkCount: links.length,
    links: links.slice(0, maxLinks),
  };
});

/* ------------------------------------------------------------------ */
/* sitemap용: 공개 페이지가 있는 username 목록                            */
/* ------------------------------------------------------------------ */
/**
 * usernames/{username} 문서를 전부 훑는다 (Firestore REST list, 300개씩 페이지).
 * 문서 이름이 곧 username이고, updateTime을 lastModified로 쓴다. 실패하면 빈 목록.
 */
export async function listPublicUsernames(limit = 5000): Promise<{ username: string; updatedAt?: Date }[]> {
  const base = firestoreBase();
  if (!base) return [];

  const result: { username: string; updatedAt?: Date }[] = [];
  let pageToken = "";
  try {
    while (result.length < limit) {
      const query = `pageSize=300&mask.fieldPaths=uid&key=${base.apiKey}${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`;
      const response = await fetch(`${base.root}/usernames?${query}`, { cache: "no-store" });
      if (!response.ok) break;
      const json = (await response.json()) as {
        documents?: { name?: string; updateTime?: string }[];
        nextPageToken?: string;
      };
      for (const doc of json.documents ?? []) {
        const username = doc.name?.split("/usernames/")[1];
        if (username && isValidUsername(decodeURIComponent(username))) {
          result.push({ username: decodeURIComponent(username), updatedAt: doc.updateTime ? new Date(doc.updateTime) : undefined });
        }
      }
      if (!json.nextPageToken) break;
      pageToken = json.nextPageToken;
    }
  } catch {
    // 네트워크 오류: 지금까지 모은 것만
  }
  return result.slice(0, limit);
}
