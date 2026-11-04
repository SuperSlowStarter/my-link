"use client";

import { useEffect } from "react";
import { create } from "zustand";
import {
  addLinkDoc,
  countLegacyLinks,
  deleteLinkDoc,
  describeFirestoreError,
  importLegacyLinks,
  reorderLinkDocs,
  sortByOrder,
  subscribeLinks,
  updateLinkDoc,
  type LinkInput,
  type StoredLink,
} from "@/lib/links-repository";
import { useAuthStore } from "@/store/auth-store";
import { beginLoading } from "@/store/loading-store";

/**
 * 링크 상태 (Zustand) — 원본은 Firestore users/{user.uid}/links
 * - 로그인한 사용자의 uid로 실시간 구독한다. 로그아웃하면 목록을 비우고 status를 "signedOut"으로 둔다.
 * - 쓰기는 Firestore로 보내고, SDK의 지연 보정 덕분에 화면에는 즉시 반영된다.
 */
type LinksStatus = "idle" | "signedOut" | "loading" | "ready" | "error";

interface LinksState {
  /** 지금 구독 중인 사용자 uid */
  uid: string | null;
  /** Firestore에서 받은 그대로: createdAt 최신순 (/mypage 목록) */
  links: StoredLink[];
  /** 직접 정한 순서(order) — 메인 카드 */
  orderedLinks: StoredLink[];
  status: LinksStatus;
  /** 마지막 오류 문구 (화면 알림용) */
  error: string | null;
  /** 마지막으로 쓰기에 성공한 시각 (저장 알림용) */
  savedAt: number | null;
  /** 로그인 전 공용 경로(users/anonymous/links)에 남아 있는 링크 수 */
  legacyCount: number;

  addLink: (input: LinkInput) => Promise<string | null>;
  updateLink: (id: string, input: LinkInput) => Promise<boolean>;
  deleteLink: (id: string) => Promise<boolean>;
  moveLink: (index: number, direction: "up" | "down") => Promise<boolean>;
  importLegacy: () => Promise<number | null>;
  clearError: () => void;
}

const EMPTY = { links: [] as StoredLink[], orderedLinks: [] as StoredLink[] };

export const useLinksStore = create<LinksState>()((set, get) => {
  /**
   * 쓰기 공통 처리: 로그인 확인 → 진행 중 전체 화면 로딩 오버레이 → 성공하면 savedAt 갱신, 실패하면 error 문구
   */
  async function write<T>(label: string, task: (uid: string) => Promise<T>): Promise<T | null> {
    const uid = get().uid;
    if (!uid) {
      set({ error: "로그인이 필요해요." });
      return null;
    }
    const endLoading = beginLoading(label);
    try {
      const result = await task(uid);
      set({ savedAt: Date.now(), error: null });
      return result;
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[firestore] 링크 쓰기 실패", error);
      }
      set({ error: describeFirestoreError(error) });
      return null;
    } finally {
      endLoading();
    }
  }

  return {
    uid: null,
    ...EMPTY,
    status: "idle",
    error: null,
    savedAt: null,
    legacyCount: 0,

    addLink: (input) => {
      const { orderedLinks } = get();
      const known = orderedLinks.filter((link) => link.order !== Number.MAX_SAFE_INTEGER);
      const order = known.length ? known[known.length - 1].order + 1 : orderedLinks.length;
      return write("링크 저장 중", (uid) => addLinkDoc(uid, input, order));
    },

    updateLink: async (id, input) =>
      (await write("링크 수정 중", (uid) => updateLinkDoc(uid, id, input).then(() => true))) ?? false,

    deleteLink: async (id) =>
      (await write("링크 삭제 중", (uid) => deleteLinkDoc(uid, id).then(() => true))) ?? false,

    moveLink: async (index, direction) => {
      const ids = get().orderedLinks.map((link) => link.id);
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= ids.length) return false;
      const [moved] = ids.splice(index, 1);
      ids.splice(target, 0, moved);
      return (await write("순서 변경 중", (uid) => reorderLinkDocs(uid, ids).then(() => true))) ?? false;
    },

    importLegacy: async () => {
      const count = await write("이전 링크 가져오는 중", (uid) => importLegacyLinks(uid));
      if (count !== null) set({ legacyCount: 0 });
      return count;
    },

    clearError: () => set({ error: null }),
  };
});

/* ------------------------------------------------------------------ */
/* 동기화: 로그인한 uid가 바뀔 때마다 users/{uid}/links 구독을 갈아끼운다 */
/* ------------------------------------------------------------------ */
let subscribers = 0;
let stopLinks: (() => void) | null = null;
let stopAuthWatch: (() => void) | null = null;
/** 첫 목록을 받기 전까지 띄우는 '불러오는 중' 오버레이 */
let endInitialLoading: (() => void) | null = null;
const finishInitialLoading = () => {
  endInitialLoading?.();
  endInitialLoading = null;
};

function attach(uid: string | null) {
  if (useLinksStore.getState().uid === uid && stopLinks) return;
  stopLinks?.();
  stopLinks = null;
  finishInitialLoading();

  if (!uid) {
    useLinksStore.setState({ uid: null, ...EMPTY, status: "signedOut", legacyCount: 0 });
    return;
  }

  useLinksStore.setState({ uid, ...EMPTY, status: "loading", error: null });
  endInitialLoading = beginLoading("링크 불러오는 중");
  try {
    stopLinks = subscribeLinks(
      uid,
      (links) => {
        finishInitialLoading();
        useLinksStore.setState({ links, orderedLinks: sortByOrder(links), status: "ready" });
        // 내 목록이 비어 있으면, 로그인 전 공용 경로에 남은 링크가 있는지 알려준다
        if (links.length === 0) {
          countLegacyLinks()
            .then((legacyCount) => {
              if (useLinksStore.getState().uid === uid) useLinksStore.setState({ legacyCount });
            })
            .catch(() => useLinksStore.setState({ legacyCount: 0 }));
        } else {
          useLinksStore.setState({ legacyCount: 0 });
        }
      },
      (error) => {
        finishInitialLoading();
        useLinksStore.setState({ status: "error", error: describeFirestoreError(error) });
      }
    );
  } catch (error) {
    finishInitialLoading();
    useLinksStore.setState({ status: "error", error: describeFirestoreError(error) });
  }
}

function syncWithAuth() {
  const { status, user } = useAuthStore.getState();
  if (status === "loading") {
    useLinksStore.setState({ status: "loading" });
    return;
  }
  attach(status === "signedIn" && user ? user.uid : null);
}

function startLinksSync() {
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
      stopLinks?.();
      stopLinks = null;
      finishInitialLoading();
      useLinksStore.setState({ uid: null, ...EMPTY, status: "idle" });
    }
  };
}

/** 링크를 쓰는 페이지 최상단에서 한 번 호출한다 */
export function useLinksSync() {
  useEffect(() => startLinksSync(), []);
}
