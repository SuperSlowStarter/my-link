import {
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
  runTransaction,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore/lite";
import type { User } from "firebase/auth";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { usernameCandidates, usernameFromEmail } from "@/lib/username";

/**
 * 공개 프로필 저장소
 * - 프로필:   users/{uid}/profile/main   (누구나 읽기, 본인만 쓰기)
 *   ※ Firestore 문서 경로는 "컬렉션/문서" 짝이어야 해서 users/{uid}/profile 아래 main 문서에 둔다.
 * - username: usernames/{username} → { uid }   (중복 방지 + /{username} 주소로 사용자 찾기)
 * 이메일 같은 개인 정보는 공개 프로필에 두지 않는다 (계정 정보는 users/{uid}, 본인만 읽기).
 */

export interface UserProfile {
  uid: string;
  /** 공유 URL용 (/{username}) */
  username: string;
  /** 표시 이름 (기본값: Google 계정 이름) */
  displayName: string;
  /** 소개글 */
  bio: string;
  /** Google 프로필 사진 */
  photoURL: string;
  createdAtMs: number | null;
  updatedAtMs: number | null;
}

/** 프로필 기본 정보 (내 링크 페이지 인라인 수정) */
export interface ProfileBasics {
  username: string;
  displayName: string;
  bio: string;
}

const profileDoc = (uid: string) => doc(db, "users", uid, "profile", "main");
const usernameDoc = (username: string) => doc(db, "usernames", username);

const toMs = (value: unknown) =>
  value && typeof (value as Timestamp).toMillis === "function" ? (value as Timestamp).toMillis() : null;

function fromDocument(uid: string, data: DocumentData): UserProfile {
  return {
    uid,
    username: typeof data.username === "string" ? data.username : "",
    displayName: typeof data.displayName === "string" ? data.displayName : "",
    bio: typeof data.bio === "string" ? data.bio : "",
    photoURL: typeof data.photoURL === "string" ? data.photoURL : "",
    createdAtMs: toMs(data.createdAt),
    updatedAtMs: toMs(data.updatedAt),
  };
}

/* ------------------------------------------------------------------ */
/* 로그인 전 브라우저에 저장했던 프로필 (최초 1회, 첫 계정만 가져간다)     */
/* ------------------------------------------------------------------ */
const LEGACY_PROFILE_KEY = "mylink_state_v1";
const LEGACY_CLAIMED_KEY = "mylink_legacy_profile_claimed";

interface LegacySeed {
  bio?: string;
}

function readLegacyProfile(): LegacySeed | null {
  try {
    if (window.localStorage.getItem(LEGACY_CLAIMED_KEY)) return null;
    const raw = window.localStorage.getItem(LEGACY_PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      bio: typeof parsed.bio === "string" ? parsed.bio : undefined,
    };
  } catch {
    return null;
  }
}

function markLegacyClaimed() {
  try {
    window.localStorage.setItem(LEGACY_CLAIMED_KEY, new Date().toISOString());
  } catch {
    // 무시
  }
}

/* ------------------------------------------------------------------ */
/* 로그인 시 초기값 자동 설정                                            */
/* ------------------------------------------------------------------ */
/**
 * 프로필이 없으면 만든다 (트랜잭션).
 * - username: 이메일 앞부분 (중복이면 숫자를 붙임)
 * - displayName: Google 계정 이름 (없으면 username)
 * 이미 있으면 Google 사진만 최신으로 맞춘다.
 */
export async function ensureProfile(user: User): Promise<void> {
  if (!isFirebaseConfigured) return;
  const ref = profileDoc(user.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    if (user.photoURL && existing.get("photoURL") !== user.photoURL) {
      await updateDoc(ref, { photoURL: user.photoURL, updatedAt: serverTimestamp() });
    }
    return;
  }

  const legacy = readLegacyProfile();
  const candidates = usernameCandidates(usernameFromEmail(user.email));

  await runTransaction(db, async (transaction) => {
    // 트랜잭션은 읽기를 모두 끝낸 뒤 쓴다
    const again = await transaction.get(ref);
    if (again.exists()) return;
    let chosen: string | null = null;
    let alreadyMine = false;
    for (const candidate of candidates) {
      const snap = await transaction.get(usernameDoc(candidate));
      if (!snap.exists() || snap.get("uid") === user.uid) {
        chosen = candidate;
        alreadyMine = snap.exists();
        break;
      }
    }
    if (!chosen) chosen = `user-${user.uid.slice(0, 8).toLowerCase()}`;

    // usernames 문서는 보안 규칙상 "새로 만들기"만 된다 (이미 내 것이면 그대로 둔다)
    if (!alreadyMine) transaction.set(usernameDoc(chosen), { uid: user.uid, createdAt: serverTimestamp() });
    transaction.set(ref, {
      username: chosen,
      displayName: (user.displayName ?? "").trim().slice(0, 30) || chosen,
      bio: legacy?.bio ?? "",
      photoURL: user.photoURL ?? "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  if (legacy) markLegacyClaimed();
}

/* ------------------------------------------------------------------ */
/* 읽기                                                                */
/* ------------------------------------------------------------------ */
/** users/{uid}/profile/main 을 한 번 불러온다 (없으면 null) */
export async function fetchProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(profileDoc(uid));
  return snap.exists() ? fromDocument(uid, snap.data()) : null;
}

/** username → uid (없으면 null) */
export async function findUidByUsername(username: string): Promise<string | null> {
  const snap = await getDoc(usernameDoc(username));
  return snap.exists() ? (snap.get("uid") as string) : null;
}

/* ------------------------------------------------------------------ */
/* 쓰기                                                                */
/* ------------------------------------------------------------------ */
export class UsernameTakenError extends Error {
  constructor() {
    super("username-taken");
    this.name = "UsernameTakenError";
  }
}

export class DisplayNameTakenError extends Error {
  constructor() {
    super("display-name-taken");
    this.name = "DisplayNameTakenError";
  }
}

/**
 * Display Name 중복 확인
 * 같은 displayName을 가진 다른 사용자의 프로필이 있는지 조회한다 — where("displayName", "==", newName).
 * 프로필은 users/{uid}/profile/main 에 있으므로 모든 사용자의 profile 하위 컬렉션을 한 번에 찾는
 * 컬렉션 그룹 쿼리를 쓴다 (users/{uid} 문서는 이메일이 있어 본인만 읽을 수 있음).
 * 필요한 것: firestore.indexes.json의 profile.displayName 컬렉션 그룹 인덱스 + 규칙 match /{path=**}/profile/{docId}
 */
export async function isDisplayNameTaken(displayName: string, uid: string): Promise<boolean> {
  const snapshot = await getDocs(
    query(collectionGroup(db, "profile"), where("displayName", "==", displayName), limit(5))
  );
  // 내 프로필(users/{uid}/profile/main)은 제외
  return snapshot.docs.some((snap) => snap.ref.parent.parent?.id !== uid);
}

/**
 * 프로필 저장 (username·displayName·bio — 내 링크 페이지 인라인 수정)
 * username이 바뀌면 같은 트랜잭션 안에서 중복을 확인하고, 새 이름을 차지한 뒤 예전 이름을 놓아준다.
 * 이미 다른 사람이 쓰는 username이면 UsernameTakenError를 던진다.
 * displayName이 바뀌면 저장 전에 다른 사용자와 같은지 조회하고, 같으면 DisplayNameTakenError를 던져 저장을 중단한다.
 */
export async function saveProfileBasics(uid: string, basics: ProfileBasics): Promise<void> {
  // 1) displayName을 바꾸려는 경우에만 중복 조회
  const currentSnap = await getDoc(profileDoc(uid));
  const previousDisplayName = currentSnap.exists() ? (currentSnap.get("displayName") as string) : "";
  if (basics.displayName !== previousDisplayName && (await isDisplayNameTaken(basics.displayName, uid))) {
    throw new DisplayNameTakenError();
  }

  // 2) username 중복 확인 + 저장 (트랜잭션)
  await runTransaction(db, async (transaction) => {
    const ref = profileDoc(uid);
    const current = await transaction.get(ref);
    const previous = current.exists() ? (current.get("username") as string) : "";
    const changed = previous !== basics.username;

    if (changed) {
      const target = await transaction.get(usernameDoc(basics.username));
      if (target.exists() && target.get("uid") !== uid) throw new UsernameTakenError();
      // 보안 규칙상 usernames는 새로 만들기만 된다 (이미 내 것이면 그대로 둔다)
      if (!target.exists()) transaction.set(usernameDoc(basics.username), { uid, createdAt: serverTimestamp() });
      if (previous) transaction.delete(usernameDoc(previous));
    }

    transaction.set(
      ref,
      {
        username: basics.username,
        displayName: basics.displayName,
        bio: basics.bio,
        updatedAt: serverTimestamp(),
        ...(current.exists() ? {} : { createdAt: serverTimestamp() }),
      },
      { merge: true }
    );
  });
}

/** 저장 전에 미리 확인 (입력하면서 보여주는 용도, 최종 확인은 saveProfileBasics 트랜잭션) */
export async function isUsernameAvailable(username: string, uid: string): Promise<boolean> {
  const snap = await getDoc(usernameDoc(username));
  return !snap.exists() || snap.get("uid") === uid;
}
