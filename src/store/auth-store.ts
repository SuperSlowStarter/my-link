"use client";

import { useEffect } from "react";
import { create } from "zustand";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { beginLoading } from "@/store/loading-store";
import { displayNameFromEmail, upsertUserProfile } from "@/lib/users-repository";

/**
 * 인증 상태 (Firebase Auth + Google 로그인)
 * - status: loading(확인 중) → signedIn / signedOut
 * - 로그인하면 users/{uid} 문서에 계정 정보를 기록한다. (Firestore 실시간 구독 없음 — 데이터 조회는 TanStack Query)
 * - onAuthStateChanged는 Firebase Auth의 로그인 상태 감시라 유지한다 (새로고침해도 로그인 유지).
 */
export interface AuthUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}

type AuthStatus = "loading" | "signedIn" | "signedOut";

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  pending: boolean;

  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

function describeAuthError(error: unknown): string {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "로그인 창이 닫혔어요. 다시 시도해주세요.";
    case "auth/operation-not-allowed":
      return "Firebase 콘솔에서 Google 로그인이 아직 켜져 있지 않아요.";
    case "auth/unauthorized-domain":
      return "이 주소는 Firebase 승인 도메인에 등록되어 있지 않아요.";
    case "auth/network-request-failed":
      return "네트워크 오류로 로그인하지 못했어요.";
    default:
      return "로그인하지 못했어요. 잠시 후 다시 시도해주세요.";
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: "loading",
  user: null,
  error: null,
  pending: false,

  signInWithGoogle: async () => {
    if (!isFirebaseConfigured) {
      set({ error: "Firebase 설정(.env.local)이 비어 있어요." });
      return;
    }
    set({ pending: true, error: null });
    // 로그인 창이 열려 있는 동안 전체 화면 로딩 오버레이
    const endLoading = beginLoading("Google 로그인 중");
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    // Google 로그인 창은 COOP 정책 때문에 창이 닫혔는지 SDK가 바로 알지 못한다.
    // 사용자가 창을 닫고 이 화면으로 돌아왔는데 몇 초 안에 로그인이 끝나지 않으면 버튼을 다시 풀어준다.
    // (늦게라도 로그인이 끝나면 onAuthStateChanged가 화면을 갱신한다)
    let focusTimer: number | undefined;
    const handleFocus = () => {
      window.clearTimeout(focusTimer);
      focusTimer = window.setTimeout(() => {
        if (useAuthStore.getState().status !== "signedIn") {
          set({ pending: false });
          endLoading();
        }
      }, 4000);
    };
    window.addEventListener("focus", handleFocus);

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      const code =
        typeof error === "object" && error && "code" in error
          ? String((error as { code: unknown }).code)
          : "";
      // 팝업이 막힌 환경(인앱 브라우저 등)에서는 리디렉션 방식으로 다시 시도
      if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
        await signInWithRedirect(auth, provider);
        return;
      }
      // 창을 닫은 경우는 오류로 띄우지 않는다 (사용자가 직접 취소한 것)
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        set({ error: describeAuthError(error) });
      }
    } finally {
      window.removeEventListener("focus", handleFocus);
      window.clearTimeout(focusTimer);
      set({ pending: false });
      endLoading();
    }
  },

  signOut: async () => {
    set({ pending: true });
    const endLoading = beginLoading("로그아웃 중");
    try {
      await firebaseSignOut(getFirebaseAuth());
    } finally {
      set({ pending: false });
      endLoading();
    }
  },

  clearError: () => set({ error: null }),
}));

/* ------------------------------------------------------------------ */
/* 인증 상태 감시 (앱 전체에서 한 번만)                                  */
/* ------------------------------------------------------------------ */
let started = false;

function startAuthListener() {
  if (started) return;
  started = true;

  if (!isFirebaseConfigured) {
    useAuthStore.setState({ status: "signedOut" });
    return;
  }

  // 첫 응답(로그인 상태 확인)이 올 때까지 오버레이
  let endInitialCheck: (() => void) | null = beginLoading("로그인 상태 확인 중");

  onAuthStateChanged(getFirebaseAuth(), (firebaseUser) => {
    endInitialCheck?.();
    endInitialCheck = null;

    if (!firebaseUser) {
      useAuthStore.setState({ status: "signedOut", user: null });
      return;
    }

    useAuthStore.setState({
      status: "signedIn",
      user: {
        uid: firebaseUser.uid,
        // 표시 이름은 이메일 앞부분 (cleangabby@gmail.com → cleangabby)
        displayName: displayNameFromEmail(firebaseUser.email, firebaseUser.displayName),
        email: firebaseUser.email ?? "",
        photoURL: firebaseUser.photoURL ?? "",
      },
    });

    // users/{uid}에 계정 정보(이메일·마지막 로그인) 기록
    upsertUserProfile(firebaseUser).catch((error: unknown) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[firestore] 사용자 정보 저장 실패", error);
      }
    });
  });
}

/** 루트에서 한 번 마운트하면 로그인 상태를 계속 추적한다 */
export function useAuthListener() {
  useEffect(() => {
    startAuthListener();
  }, []);
}
