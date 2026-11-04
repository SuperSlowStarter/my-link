import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type DocumentData,
  type FieldValue,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { LINK_ICON_OPTIONS, type LinkIconType, type LinkItem } from "@/data/links";
import { db, isFirebaseConfigured } from "@/lib/firebase";

/**
 * Firestore 링크 저장소 — 로그인한 사용자별 개인 링크
 * 경로: users/{uid}/links/{linkId}
 * 모든 함수는 Firebase Auth의 user.uid를 받는다. 로그인 전에는 호출하지 않는다.
 */

/** 로그인 기능 도입 전에 쓰던 공용 경로 (users/anonymous/links) — 가져오기 전용 */
export const LEGACY_ANONYMOUS_ID = "anonymous";

/** 화면에서 쓰는 링크 + 정렬 정보 */
export interface StoredLink extends LinkItem {
  order: number;
  /** 서버 시각(ms). 저장 직후 서버 응답 전에는 추정값 */
  createdAtMs: number;
}

/** 링크 추가·수정 입력값 (id는 Firestore가 정한다) */
export type LinkInput = Omit<LinkItem, "id">;

/** Firestore 문서 모양 */
export interface LinkDocument {
  title: string;
  url: string;
  subtitle: string;
  iconType: LinkIconType;
  badge?: string;
  variant: "primary" | "glass";
  order: number;
  createdAt: FieldValue | Timestamp;
  updatedAt: FieldValue | Timestamp;
}

const ICON_TYPES = new Set<string>(LINK_ICON_OPTIONS.map((option) => option.value));

const userDoc = (uid: string) => doc(db, "users", uid);
const linksCollection = (uid: string) => collection(db, "users", uid, "links");
const linkDoc = (uid: string, linkId: string) => doc(db, "users", uid, "links", linkId);

function assertReady(uid: string) {
  if (!isFirebaseConfigured) throw new Error("not-configured");
  if (!uid) throw new Error("unauthenticated");
}

/** 화면 입력값 → Firestore 필드 (타임스탬프 제외) */
function toFields(input: LinkInput) {
  return {
    title: input.title,
    url: input.href,
    subtitle: input.subtitle ?? "",
    iconType: input.iconType,
    variant: input.variant,
  };
}

/** Firestore 문서 → 화면 링크. 예전 형식(title·url만 있는 문서)도 기본값으로 채운다 */
function fromDocument(id: string, data: DocumentData): StoredLink {
  const createdAt = data.createdAt as Timestamp | null | undefined;
  return {
    id,
    title: typeof data.title === "string" ? data.title : "(제목 없음)",
    href: typeof data.url === "string" ? data.url : "",
    subtitle: typeof data.subtitle === "string" ? data.subtitle : "",
    iconType: ICON_TYPES.has(data.iconType) ? (data.iconType as LinkIconType) : "link",
    badge: typeof data.badge === "string" && data.badge ? data.badge : undefined,
    variant: data.variant === "primary" ? "primary" : "glass",
    order: typeof data.order === "number" ? data.order : Number.MAX_SAFE_INTEGER,
    createdAtMs: createdAt?.toMillis?.() ?? Date.now(),
  };
}

/**
 * 메인 카드용 정렬: 직접 정한 order 오름차순 → 같으면 createdAt 오름차순.
 * (order가 없는 예전 문서는 맨 뒤)
 */
export function sortByOrder(links: StoredLink[]): StoredLink[] {
  return [...links].sort((a, b) => a.order - b.order || a.createdAtMs - b.createdAtMs);
}

/* ------------------------------------------------------------------ */
/* Read — 실시간 구독 (createdAt 최신순)                                 */
/* ------------------------------------------------------------------ */
/**
 * users/{uid}/links 를 createdAt 내림차순(최신순)으로 불러오고,
 * 이후 추가·수정·삭제가 생길 때마다 onChange가 다시 호출된다.
 * 방금 추가한 문서는 서버 시각이 정해지기 전에도 추정 시각으로 맨 위에 온다.
 */
export function subscribeLinks(
  uid: string,
  onChange: (links: StoredLink[]) => void,
  onError: (error: unknown) => void
): Unsubscribe {
  assertReady(uid);
  return onSnapshot(
    query(linksCollection(uid), orderBy("createdAt", "desc")),
    (snapshot) => {
      onChange(
        snapshot.docs.map((snap) =>
          fromDocument(snap.id, snap.data({ serverTimestamps: "estimate" }))
        )
      );
    },
    onError
  );
}

/* ------------------------------------------------------------------ */
/* Create / Update / Delete                                           */
/* ------------------------------------------------------------------ */
/** 네트워크가 막혔을 때 무한히 기다리지 않도록 제한 시간을 둔다 (SDK는 연결되면 이어서 전송한다) */
const WRITE_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), WRITE_TIMEOUT_MS);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

/** 링크 추가. createdAt·updatedAt은 serverTimestamp로 채우고 새 문서 ID를 돌려준다 */
export async function addLinkDoc(uid: string, input: LinkInput, order: number): Promise<string> {
  assertReady(uid);
  const data: LinkDocument = {
    ...toFields(input),
    ...(input.badge ? { badge: input.badge } : {}),
    order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await withTimeout(addDoc(linksCollection(uid), data));
  return ref.id;
}

/** 링크 수정. updatedAt만 새 서버 시각으로 바뀐다 */
export async function updateLinkDoc(uid: string, id: string, input: LinkInput): Promise<void> {
  assertReady(uid);
  await withTimeout(
    updateDoc(linkDoc(uid, id), {
      ...toFields(input),
      badge: input.badge ? input.badge : deleteField(),
      updatedAt: serverTimestamp(),
    })
  );
}

export async function deleteLinkDoc(uid: string, id: string): Promise<void> {
  assertReady(uid);
  await withTimeout(deleteDoc(linkDoc(uid, id)));
}

/** 순서 변경: 전달된 id 순서대로 order를 0부터 다시 매긴다 (한 번에 커밋) */
export async function reorderLinkDocs(uid: string, orderedIds: string[]): Promise<void> {
  assertReady(uid);
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(linkDoc(uid, id), { order: index, updatedAt: serverTimestamp() });
  });
  await withTimeout(batch.commit());
}

/* ------------------------------------------------------------------ */
/* 이전 공용 링크 가져오기: users/anonymous/links → users/{uid}/links    */
/* ------------------------------------------------------------------ */
/** 로그인 전 공용 경로에 링크가 몇 개 있는지 (가져오기 버튼 표시용) */
export async function countLegacyLinks(): Promise<number> {
  if (!isFirebaseConfigured) return 0;
  const snapshot = await getDocs(linksCollection(LEGACY_ANONYMOUS_ID));
  return snapshot.size;
}

/**
 * 공용 경로의 링크를 내 경로로 복사한다 (원본은 그대로 둔다).
 * 같은 문서 ID를 써서 여러 번 눌러도 중복되지 않고, users/{uid}.legacyLinksImportedAt 에 기록한다.
 * @returns 복사한 링크 개수
 */
export async function importLegacyLinks(uid: string): Promise<number> {
  assertReady(uid);
  const snapshot = await getDocs(linksCollection(LEGACY_ANONYMOUS_ID));
  const userSnap = await getDoc(userDoc(uid));
  const batch = writeBatch(db);

  const legacy = sortByOrder(snapshot.docs.map((snap) => fromDocument(snap.id, snap.data())));
  legacy.forEach((link, index) => {
    const data: LinkDocument = {
      ...toFields(link),
      ...(link.badge ? { badge: link.badge } : {}),
      order: index,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    batch.set(linkDoc(uid, link.id), data);
  });
  batch.set(
    userDoc(uid),
    {
      legacyLinksImportedAt: serverTimestamp(),
      legacyLinksImportedCount: legacy.length,
      ...(userSnap.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true }
  );
  await withTimeout(batch.commit());
  return legacy.length;
}

/* ------------------------------------------------------------------ */
/* 오류 문구                                                           */
/* ------------------------------------------------------------------ */
export function describeFirestoreError(error: unknown): string {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code: unknown }).code)
      : error instanceof Error
        ? error.message
        : "";

  switch (code) {
    case "permission-denied":
      return "권한이 없어요. 로그인 상태와 Firestore 보안 규칙을 확인해주세요.";
    case "unauthenticated":
      return "로그인이 필요해요.";
    case "unavailable":
      return "Firestore에 연결하지 못했어요. 네트워크를 확인해주세요.";
    case "timeout":
      return "Firestore 응답이 늦어요. 연결되면 자동으로 이어서 저장돼요.";
    case "not-found":
      return "이미 삭제된 링크예요.";
    case "not-configured":
      return "Firebase 설정(.env.local)이 비어 있어요.";
    default:
      return "Firestore 작업에 실패했어요. 잠시 후 다시 시도해주세요.";
  }
}
