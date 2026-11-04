"use client";

import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";
import {
  DEFAULT_PROFILE_DATA,
  STORAGE_KEY,
  type LinkItem,
  type ProfileData,
  type ShowreelConfig,
} from "@/data/links";

/**
 * 메인 허브 프로필 상태 (Zustand + persist)
 * - Phase 1: localStorage(`mylink_state_v1`)에 저장한다.
 * - 저장 형식은 기존과 같은 순수 ProfileData JSON이라, 이전에 저장된 데이터를 그대로 읽는다.
 * - Phase 2(DB)로 옮길 때는 아래 profileStorage만 교체하면 된다.
 */

type ProfileUpdater = ProfileData | ((prev: ProfileData) => ProfileData);

interface ProfileState {
  profile: ProfileData;
  /** 마지막으로 저장한 시각 (저장 알림 표시용) */
  savedAt: number | null;
  /** 마지막 저장 사유 */
  savedReason: "save" | "reset" | null;
  /** 기본값 복원 횟수. 편집 폼을 다시 마운트해 입력값을 새로 채우는 데 쓴다 */
  resetVersion: number;

  updateProfile: (updater: ProfileUpdater) => void;
  updateShowreel: (patch: Partial<ShowreelConfig>) => void;

  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;

  addLink: (link: Omit<LinkItem, "id">) => void;
  updateLink: (id: string, link: Omit<LinkItem, "id">) => void;
  deleteLink: (id: string) => void;
  moveLink: (index: number, direction: "up" | "down") => void;

  resetProfile: () => void;
}

/** 저장값이 일부 깨져 있어도 기본값으로 채워서 복구한다 */
function sanitizeProfile(parsed: Partial<ProfileData> | null | undefined): ProfileData {
  if (!parsed || typeof parsed !== "object") return DEFAULT_PROFILE_DATA;
  const pick = <K extends keyof ProfileData>(key: K, check: (v: unknown) => boolean) =>
    check(parsed[key]) ? (parsed[key] as ProfileData[K]) : DEFAULT_PROFILE_DATA[key];
  const isString = (v: unknown) => typeof v === "string";

  return {
    name: pick("name", isString),
    role: pick("role", isString),
    bio: pick("bio", isString),
    avatarText: pick("avatarText", isString),
    avatarImageUrl: pick("avatarImageUrl", isString),
    fpsBadge: pick("fpsBadge", isString),
    skills: pick("skills", Array.isArray),
    showreel:
      parsed.showreel && typeof parsed.showreel === "object"
        ? { ...DEFAULT_PROFILE_DATA.showreel, ...parsed.showreel }
        : DEFAULT_PROFILE_DATA.showreel,
    links: pick("links", Array.isArray),
  };
}

type PersistedSlice = Pick<ProfileState, "profile">;

/** 기존 저장 형식(ProfileData 그대로)을 유지하는 커스텀 스토리지 */
const profileStorage: PersistStorage<PersistedSlice> = {
  getItem: (name) => {
    try {
      const raw = window.localStorage.getItem(name);
      if (!raw) return null;
      return { state: { profile: sanitizeProfile(JSON.parse(raw)) }, version: 1 };
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, JSON.stringify(value.state.profile));
    } catch {
      // 용량 초과·시크릿 모드 등은 무시하고 화면 상태만 유지한다
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name);
    } catch {
      // 무시
    }
  },
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => {
      const commit = (next: ProfileData) =>
        set({ profile: next, savedAt: Date.now(), savedReason: "save" });

      return {
        profile: DEFAULT_PROFILE_DATA,
        savedAt: null,
        savedReason: null,
        resetVersion: 0,

        updateProfile: (updater) => {
          const prev = get().profile;
          commit(typeof updater === "function" ? updater(prev) : updater);
        },

        updateShowreel: (patch) => {
          const prev = get().profile;
          commit({ ...prev, showreel: { ...prev.showreel, ...patch } });
        },

        addSkill: (skill) => {
          const prev = get().profile;
          commit({ ...prev, skills: [...prev.skills, skill] });
        },

        removeSkill: (skill) => {
          const prev = get().profile;
          commit({ ...prev, skills: prev.skills.filter((item) => item !== skill) });
        },

        addLink: (link) => {
          const prev = get().profile;
          commit({
            ...prev,
            links: [...prev.links, { ...link, id: `link-${Date.now()}` }],
          });
        },

        updateLink: (id, link) => {
          const prev = get().profile;
          commit({
            ...prev,
            links: prev.links.map((item) => (item.id === id ? { ...link, id } : item)),
          });
        },

        deleteLink: (id) => {
          const prev = get().profile;
          commit({ ...prev, links: prev.links.filter((item) => item.id !== id) });
        },

        moveLink: (index, direction) => {
          const prev = get().profile;
          const target = direction === "up" ? index - 1 : index + 1;
          if (target < 0 || target >= prev.links.length) return;
          const links = [...prev.links];
          const [moved] = links.splice(index, 1);
          links.splice(target, 0, moved);
          commit({ ...prev, links });
        },

        resetProfile: () => {
          useProfileStore.persist.clearStorage();
          set({
            profile: DEFAULT_PROFILE_DATA,
            savedAt: Date.now(),
            savedReason: "reset",
            resetVersion: get().resetVersion + 1,
          });
        },
      };
    },
    {
      name: STORAGE_KEY,
      // profileStorage.getItem이 돌려주는 version과 같아야 저장값을 그대로 쓴다 (다르면 migrate가 필요)
      version: 1,
      storage: profileStorage,
      partialize: (state) => ({ profile: state.profile }),
      // SSR 결과(기본값)와 첫 화면을 맞추기 위해, 브라우저에서 마운트된 뒤 직접 불러온다
      skipHydration: true,
    }
  )
);
