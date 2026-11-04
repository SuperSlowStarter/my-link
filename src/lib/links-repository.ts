import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
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
 * Firestore 링크 저장소 — 메인 허브와 /mypage가 함께 쓰는 단일 원본
 * 경로: users/{userId}/links/{linkId}
 * 로그인 전 단계라 userId는 "anonymous"로 고정한다. Firebase Auth를 붙이면 uid로 바꾼다.
 */
export const ANONYMOUS_USER_ID = "anonymous";

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

const userDoc = (userId: string) => doc(db, "users", userId);
const linksCollection = (userId: string) => collection(db, "users", userId, "links");
const linkDoc = (userId: string, linkId: string) => doc(db, "users", userId, "links", linkId);

function assertConfigured() {
  if (!isFirebaseConfigured) throw new Error("not-configured");
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
 * 페이지가 열리면 users/{userId}/links 를 createdAt 내림차순(최신순)으로 불러오고,
 * 이후 추가·수정·삭제가 생길 때마다 onChange가 다시 호출된다.
 * 방금 추가한 문서는 서버 시각이 정해지기 전에도 추정 시각으로 맨 위에 온다.
 */
export function subscribeLinks(
  onChange: (links: StoredLink[]) => void,
  onError: (error: unknown) => void,
  userId: string = ANONYMOUS_USER_ID
): Unsubscribe {
  assertConfigured();
  return onSnapshot(
    query(linksCollection(userId), orderBy("createdAt", "desc")),
    (snapshot) => {
      const links = snapshot.docs.map((snap) =>
        // 서버 시각이 아직 안 정해진 직후에도 정렬이 흔들리지 않게 추정값을 쓴다
        fromDocument(snap.id, snap.data({ serverTimestamps: "estimate" }))
      );
      onChange(links);
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
export async function addLinkDoc(
  input: LinkInput,
  order: number,
  userId: string = ANONYMOUS_USER_ID
): Promise<string> {
  assertConfigured();
  const data: LinkDocument = {
    ...toFields(input),
    ...(input.badge ? { badge: input.badge } : {}),
    order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await withTimeout(addDoc(linksCollection(userId), data));
  return ref.id;
}

/** 링크 수정. updatedAt만 새 서버 시각으로 바뀐다 */
export async function updateLinkDoc(
  id: string,
  input: LinkInput,
  userId: string = ANONYMOUS_USER_ID
): Promise<void> {
  assertConfigured();
  await withTimeout(
    updateDoc(linkDoc(userId, id), {
      ...toFields(input),
      badge: input.badge ? input.badge : deleteField(),
      updatedAt: serverTimestamp(),
    })
  );
}

export async function deleteLinkDoc(
  id: string,
  userId: string = ANONYMOUS_USER_ID
): Promise<void> {
  assertConfigured();
  await withTimeout(deleteDoc(linkDoc(userId, id)));
}

/** 순서 변경: 전달된 id 순서대로 order를 0부터 다시 매긴다 (한 번에 커밋) */
export async function reorderLinkDocs(
  orderedIds: string[],
  userId: string = ANONYMOUS_USER_ID
): Promise<void> {
  assertConfigured();
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(linkDoc(userId, id), { order: index, updatedAt: serverTimestamp() });
  });
  await withTimeout(batch.commit());
}

/* ------------------------------------------------------------------ */
/* 마이그레이션: localStorage 링크 → Firestore (최초 1회)               */
/* ------------------------------------------------------------------ */
/**
 * users/{userId} 문서의 linksMigratedAt 표시로 1회만 실행한다.
 * 트랜잭션이라 여러 탭에서 동시에 열어도 한 번만 기록된다.
 * 기존 링크 id를 그대로 문서 ID로 써서 다시 실행돼도 중복되지 않는다.
 * @returns 이번에 이전했으면 true, 이미 이전돼 있었으면 false
 */
export async function migrateLocalLinks(
  localLinks: LinkItem[],
  userId: string = ANONYMOUS_USER_ID
): Promise<boolean> {
  assertConfigured();
  return runTransaction(db, async (transaction) => {
    const userRef = userDoc(userId);
    const userSnap = await transaction.get(userRef);
    if (userSnap.exists() && userSnap.get("linksMigratedAt")) return false;

    localLinks.forEach((link, index) => {
      const data: LinkDocument = {
        ...toFields(link),
        ...(link.badge ? { badge: link.badge } : {}),
        order: index,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      transaction.set(linkDoc(userId, link.id), data);
    });
    transaction.set(
      userRef,
      { linksMigratedAt: serverTimestamp(), migratedLinkCount: localLinks.length },
      { merge: true }
    );
    return true;
  });
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
      return "저장 권한이 없어요. Firestore 보안 규칙을 확인해주세요.";
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
