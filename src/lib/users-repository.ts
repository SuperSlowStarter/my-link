import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from "firebase/firestore/lite";
import type { User } from "firebase/auth";
import { db } from "@/lib/firebase";

/**
 * 사용자 문서 — users/{uid}
 * 로그인할 때마다 Google 계정 정보를 기록하고, 화면(헤더·계정 패널)은 이 문서를 읽어 보여준다.
 */
export interface UserProfileDoc {
  uid: string;
  /** 표시 이름 = 이메일 앞부분 */
  displayName: string;
  /** Google 계정에 등록된 이름 (참고용) */
  googleName: string;
  email: string;
  photoURL: string;
  provider: string;
  /** 처음 로그인한 시각(ms) */
  createdAtMs: number | null;
  /** 마지막 로그인 시각(ms) */
  lastLoginAtMs: number | null;
  /** 이전 공용 링크를 가져온 시각(ms) */
  legacyLinksImportedAtMs: number | null;
}

const userDoc = (uid: string) => doc(db, "users", uid);

/**
 * 화면에 보여줄 이름 = 이메일 앞부분 (cleangabby@gmail.com → cleangabby)
 * 이메일이 없으면 Google 계정 이름, 그것도 없으면 "사용자"
 */
export function displayNameFromEmail(email: string | null | undefined, fallback?: string | null): string {
  const local = email?.split("@")[0]?.trim();
  return local || fallback?.trim() || "사용자";
}

const toMs = (value: unknown) =>
  value && typeof (value as Timestamp).toMillis === "function"
    ? (value as Timestamp).toMillis()
    : null;

/** 로그인 직후 호출: 계정 정보 갱신 + 처음이면 createdAt 기록 */
export async function upsertUserProfile(user: User): Promise<void> {
  const ref = userDoc(user.uid);
  const snapshot = await getDoc(ref);
  await setDoc(
    ref,
    {
      uid: user.uid,
      displayName: displayNameFromEmail(user.email, user.displayName),
      googleName: user.displayName ?? "",
      email: user.email ?? "",
      photoURL: user.photoURL ?? "",
      provider: user.providerData[0]?.providerId ?? "google.com",
      lastLoginAt: serverTimestamp(),
      ...(snapshot.exists() && snapshot.get("createdAt") ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true }
  );
}

/** users/{uid} 계정 정보를 한 번 불러온다 (본인만 읽기 가능) */
export async function fetchUserAccount(uid: string): Promise<UserProfileDoc | null> {
  const snapshot = await getDoc(userDoc(uid));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return {
    uid,
    displayName: displayNameFromEmail(
      typeof data.email === "string" ? data.email : "",
      typeof data.displayName === "string" ? data.displayName : ""
    ),
    googleName: typeof data.googleName === "string" ? data.googleName : "",
    email: typeof data.email === "string" ? data.email : "",
    photoURL: typeof data.photoURL === "string" ? data.photoURL : "",
    provider: typeof data.provider === "string" ? data.provider : "",
    createdAtMs: toMs(data.createdAt),
    lastLoginAtMs: toMs(data.lastLoginAt),
    legacyLinksImportedAtMs: toMs(data.legacyLinksImportedAt),
  };
}
