"use client";

import { useEffect } from "react";
import { create } from "zustand";
import type { ShowreelConfig } from "@/data/links";
import { getFirebaseAuth } from "@/lib/firebase";
import { describeFirestoreError } from "@/lib/links-repository";
import {
  ensureProfile,
  saveProfileBasics,
  subscribeProfile,
  updateProfileDetails,
  DisplayNameTakenError,
  UsernameTakenError,
  type ProfileBasics,
  type ProfileDetails,
  type UserProfile,
} from "@/lib/profile-repository";
import { useAuthStore } from "@/store/auth-store";
import { beginLoading } from "@/store/loading-store";

/**
 * 내 공개 프로필 상태 (Zustand) — 원본은 Firestore users/{uid}/profile/main
 * - 로그인하면 프로필이 없을 때 초기값을 만들고(ensureProfile), 실시간 구독한다.
 * - 마이페이지 저장(username·displayName·bio)은 버튼으로, 편집 모드(직무·스킬·쇼릴)는 입력 후 잠시 뒤 자동 저장.
 */
type ProfileStatus = "idle" | "signedOut" | "loading" | "ready" | "error";

export type SaveBasicsResult =
  | { ok: true }
  | { ok: false; field?: "username" | "displayName"; message: string };

interface ProfileState {
  uid: string | null;
  profile: UserProfile | null;
  status: ProfileStatus;
  error: string | null;
  /** 마지막 자동 저장 시각 (저장 알림용) */
  savedAt: number | null;

  saveBasics: (basics: ProfileBasics) => Promise<SaveBasicsResult>;
  /** 편집 모드 자동 저장 (연속 입력은 묶어서 한 번에) */
  updateDetails: (details: ProfileDetails) => void;
  updateShowreel: (patch: Partial<ShowreelConfig>) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
}

/* 편집 모드 자동 저장: 입력이 멈추고 600ms 뒤에 모아서 저장 */
const AUTOSAVE_DELAY_MS = 600;
let pendingDetails: ProfileDetails = {};
let autosaveTimer: ReturnType<typeof setTimeout> | null = null;

export const useProfileStore = create<ProfileState>()((set, get) => {
  function flushDetails() {
    autosaveTimer = null;
    const uid = get().uid;
    const details = pendingDetails;
    pendingDetails = {};
    if (!uid || Object.keys(details).length === 0) return;
    updateProfileDetails(uid, details)
      .then(() => set({ savedAt: Date.now(), error: null }))
      .catch((error: unknown) => set({ error: describeFirestoreError(error) }));
  }

  function queueDetails(details: ProfileDetails) {
    const current = get().profile;
    if (!current) return;
    // 화면에는 바로 반영 (Firestore 응답을 기다리지 않음)
    set({ profile: { ...current, ...details } });
    pendingDetails = { ...pendingDetails, ...details };
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(flushDetails, AUTOSAVE_DELAY_MS);
  }

  return {
    uid: null,
    profile: null,
    status: "idle",
    error: null,
    savedAt: null,

    saveBasics: async (basics) => {
      const uid = get().uid;
      if (!uid) return { ok: false, message: "로그인이 필요해요." };
      const endLoading = beginLoading("프로필 저장 중");
      try {
        await saveProfileBasics(uid, basics);
        return { ok: true };
      } catch (error) {
        if (error instanceof UsernameTakenError) {
          return { ok: false, field: "username", message: "이미 사용 중인 username이에요. 다른 이름을 입력해주세요." };
        }
        if (error instanceof DisplayNameTakenError) {
          return { ok: false, field: "displayName", message: "이미 다른 사용자가 쓰고 있는 표시 이름이에요. 다른 이름을 입력해주세요." };
        }
        if (process.env.NODE_ENV !== "production") console.error("[firestore] 프로필 저장 실패", error);
        return { ok: false, message: describeFirestoreError(error) };
      } finally {
        endLoading();
      }
    },

    updateDetails: (details) => queueDetails(details),

    updateShowreel: (patch) => {
      const current = get().profile;
      if (!current) return;
      queueDetails({ showreel: { ...current.showreel, ...patch } });
    },

    addSkill: (skill) => {
      const current = get().profile;
      if (!current) return;
      queueDetails({ skills: [...current.skills, skill] });
    },

    removeSkill: (skill) => {
      const current = get().profile;
      if (!current) return;
      queueDetails({ skills: current.skills.filter((item) => item !== skill) });
    },
  };
});

/* ------------------------------------------------------------------ */
/* 동기화: 로그인한 uid가 바뀔 때마다 users/{uid}/profile/main 구독      */
/* ------------------------------------------------------------------ */
let subscribers = 0;
let stopProfile: (() => void) | null = null;
let stopAuthWatch: (() => void) | null = null;
let endInitialLoading: (() => void) | null = null;
const finishInitialLoading = () => {
  endInitialLoading?.();
  endInitialLoading = null;
};

function attach(uid: string | null) {
  if (useProfileStore.getState().uid === uid && stopProfile) return;
  stopProfile?.();
  stopProfile = null;
  finishInitialLoading();

  if (!uid) {
    useProfileStore.setState({ uid: null, profile: null, status: "signedOut" });
    return;
  }

  useProfileStore.setState({ uid, profile: null, status: "loading", error: null });
  endInitialLoading = beginLoading("프로필 불러오는 중");

  const firebaseUser = getFirebaseAuth().currentUser;
  // 프로필이 없으면 초기값 생성 (username = 이메일 앞부분, displayName = Google 이름)
  const ready = firebaseUser ? ensureProfile(firebaseUser) : Promise.resolve();
  ready
    .catch((error: unknown) => {
      if (process.env.NODE_ENV !== "production") console.warn("[firestore] 프로필 초기화 실패", error);
    })
    .finally(() => {
      if (useProfileStore.getState().uid !== uid) return;
      stopProfile = subscribeProfile(
        uid,
        (profile) => {
          finishInitialLoading();
          useProfileStore.setState({ profile, status: profile ? "ready" : "loading" });
        },
        (error) => {
          finishInitialLoading();
          useProfileStore.setState({ status: "error", error: describeFirestoreError(error) });
        }
      );
    });
}

function syncWithAuth() {
  const { status, user } = useAuthStore.getState();
  if (status === "loading") return;
  attach(status === "signedIn" && user ? user.uid : null);
}

function startProfileSync() {
  subscribers += 1;
  if (subscribers === 1) {
    syncWithAuth();
    stopAuthWatch = useAuthStore.subscribe((state, prev) => {
      if (state.status !== prev.status || state.user?.uid !== prev.user?.uid) syncWithAuth();
    });
  }
  return () => {
    subscribers -= 1;
    if (subscribers === 0) {
      stopAuthWatch?.();
      stopAuthWatch = null;
      stopProfile?.();
      stopProfile = null;
      finishInitialLoading();
      useProfileStore.setState({ uid: null, profile: null, status: "idle" });
    }
  };
}

/** 내 프로필을 쓰는 곳(헤더 메뉴·내 링크 페이지·마이페이지)에서 호출한다 */
export function useProfileSync() {
  useEffect(() => startProfileSync(), []);
}
