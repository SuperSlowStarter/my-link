"use client";

import { useEffect } from "react";
import { create } from "zustand";
import {
  addLinkDoc,
  deleteLinkDoc,
  describeFirestoreError,
  migrateLocalLinks,
  reorderLinkDocs,
  subscribeLinks,
  updateLinkDoc,
  type LinkInput,
  type StoredLink,
} from "@/lib/links-repository";
import { useProfileStore } from "@/store/profile-store";

/**
 * 링크 상태 (Zustand) — 원본은 Firestore users/anonymous/links
 * - 목록은 onSnapshot 실시간 구독으로 채운다. 쓰기는 Firestore로 보내고,
 *   SDK의 지연 보정(latency compensation) 덕분에 화면에는 즉시 반영된다.
 * - 메인 허브(/)와 /mypage가 같은 스토어·같은 컬렉션을 쓴다.
 */
type LinksStatus = "idle" | "loading" | "ready" | "error";

interface LinksState {
  links: StoredLink[];
  status: LinksStatus;
  /** 마지막 오류 문구 (화면 알림용) */
  error: string | null;
  /** 마지막으로 쓰기에 성공한 시각 (저장 알림용) */
  savedAt: number | null;

  addLink: (input: LinkInput) => Promise<string | null>;
  updateLink: (id: string, input: LinkInput) => Promise<boolean>;
  deleteLink: (id: string) => Promise<boolean>;
  moveLink: (index: number, direction: "up" | "down") => Promise<boolean>;
  clearError: () => void;
}

export const useLinksStore = create<LinksState>()((set, get) => {
  /** 쓰기 공통 처리: 성공하면 savedAt 갱신, 실패하면 error 문구 */
  async function write<T>(task: () => Promise<T>): Promise<T | null> {
    try {
      const result = await task();
      set({ savedAt: Date.now(), error: null });
      return result;
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[firestore] 링크 쓰기 실패", error);
      }
      set({ error: describeFirestoreError(error) });
      return null;
    }
  }

  return {
    links: [],
    status: "idle",
    error: null,
    savedAt: null,

    addLink: (input) => {
      const { links } = get();
      const last = links[links.length - 1];
      const order = last && last.order !== Number.MAX_SAFE_INTEGER ? last.order + 1 : links.length;
      return write(() => addLinkDoc(input, order));
    },

    updateLink: async (id, input) =>
      (await write(() => updateLinkDoc(id, input).then(() => true))) ?? false,

    deleteLink: async (id) =>
      (await write(() => deleteLinkDoc(id).then(() => true))) ?? false,

    moveLink: async (index, direction) => {
      const ids = get().links.map((link) => link.id);
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= ids.length) return false;
      const [moved] = ids.splice(index, 1);
      ids.splice(target, 0, moved);
      return (await write(() => reorderLinkDocs(ids).then(() => true))) ?? false;
    },

    clearError: () => set({ error: null }),
  };
});

/* ------------------------------------------------------------------ */
/* 동기화: 구독 시작 + 최초 1회 마이그레이션                             */
/* ------------------------------------------------------------------ */
const MIGRATED_FLAG_KEY = "mylink_links_migrated_v1";
let subscribers = 0;
let unsubscribe: (() => void) | null = null;

async function migrateOnce() {
  try {
    if (window.localStorage.getItem(MIGRATED_FLAG_KEY)) return;
  } catch {
    // 저장소 접근이 막혀 있으면 Firestore 표시만으로 판단한다
  }
  try {
    // 이 브라우저에 저장돼 있던 링크(없으면 기본 시드 링크)를 옮긴다
    await useProfileStore.persist.rehydrate();
    const localLinks = useProfileStore.getState().profile.links;
    await migrateLocalLinks(localLinks);
    try {
      window.localStorage.setItem(MIGRATED_FLAG_KEY, new Date().toISOString());
    } catch {
      // 무시
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[firestore] 링크 마이그레이션을 건너뛰었어요.", error);
    }
  }
}

function startLinksSync() {
  subscribers += 1;
  if (subscribers === 1) {
    useLinksStore.setState({ status: "loading", error: null });
    try {
      unsubscribe = subscribeLinks(
        (links) => useLinksStore.setState({ links, status: "ready" }),
        (error) =>
          useLinksStore.setState({ status: "error", error: describeFirestoreError(error) })
      );
      void migrateOnce();
    } catch (error) {
      useLinksStore.setState({ status: "error", error: describeFirestoreError(error) });
    }
  }
  return () => {
    subscribers -= 1;
    if (subscribers === 0) {
      unsubscribe?.();
      unsubscribe = null;
    }
  };
}

/** 링크를 쓰는 페이지 최상단에서 한 번 호출한다 */
export function useLinksSync() {
  useEffect(() => startLinksSync(), []);
}
