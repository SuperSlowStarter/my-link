import { useSyncExternalStore } from "react";
import {
  DEFAULT_PROFILE_DATA,
  STORAGE_KEY,
  type ProfileData,
} from "@/data/links";

export interface StorageService {
  loadProfile(): ProfileData;
  saveProfile(data: ProfileData): void;
  resetProfile(): ProfileData;
  subscribe(listener: () => void): () => void;
  getSnapshot(): ProfileData;
  getServerSnapshot(): ProfileData;
}

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedProfile: ProfileData = DEFAULT_PROFILE_DATA;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function parseProfile(raw: string | null): ProfileData {
  if (!raw) {
    return DEFAULT_PROFILE_DATA;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<ProfileData>;
    return {
      name:
        typeof parsed.name === "string"
          ? parsed.name
          : DEFAULT_PROFILE_DATA.name,
      role:
        typeof parsed.role === "string"
          ? parsed.role
          : DEFAULT_PROFILE_DATA.role,
      bio:
        typeof parsed.bio === "string" ? parsed.bio : DEFAULT_PROFILE_DATA.bio,
      avatarText:
        typeof parsed.avatarText === "string"
          ? parsed.avatarText
          : DEFAULT_PROFILE_DATA.avatarText,
      avatarImageUrl:
        typeof parsed.avatarImageUrl === "string"
          ? parsed.avatarImageUrl
          : DEFAULT_PROFILE_DATA.avatarImageUrl,
      fpsBadge:
        typeof parsed.fpsBadge === "string"
          ? parsed.fpsBadge
          : DEFAULT_PROFILE_DATA.fpsBadge,
      skills: Array.isArray(parsed.skills)
        ? parsed.skills
        : DEFAULT_PROFILE_DATA.skills,
      showreel:
        parsed.showreel && typeof parsed.showreel === "object"
          ? {
              ...DEFAULT_PROFILE_DATA.showreel,
              ...parsed.showreel,
            }
          : DEFAULT_PROFILE_DATA.showreel,
      links: Array.isArray(parsed.links)
        ? parsed.links
        : DEFAULT_PROFILE_DATA.links,
    };
  } catch {
    return DEFAULT_PROFILE_DATA;
  }
}

export const storageService: StorageService = {
  loadProfile(): ProfileData {
    return this.getSnapshot();
  },

  getSnapshot(): ProfileData {
    if (typeof window === "undefined") {
      return DEFAULT_PROFILE_DATA;
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw !== cachedRaw) {
        cachedRaw = raw;
        cachedProfile = parseProfile(raw);
      }
      return cachedProfile;
    } catch {
      return DEFAULT_PROFILE_DATA;
    }
  },

  getServerSnapshot(): ProfileData {
    return DEFAULT_PROFILE_DATA;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        listener();
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
    }
    return () => {
      listeners.delete(listener);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
      }
    };
  },

  saveProfile(data: ProfileData): void {
    if (typeof window === "undefined") return;
    try {
      const serialized = JSON.stringify(data);
      window.localStorage.setItem(STORAGE_KEY, serialized);
      cachedRaw = serialized;
      cachedProfile = data;
      emitChange();
    } catch {
      // Ignore quota or private mode errors
    }
  },

  resetProfile(): ProfileData {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    }
    cachedRaw = null;
    cachedProfile = DEFAULT_PROFILE_DATA;
    emitChange();
    return DEFAULT_PROFILE_DATA;
  },
};

export function useProfileStorage() {
  const profile = useSyncExternalStore(
    storageService.subscribe,
    () => storageService.getSnapshot(),
    () => storageService.getServerSnapshot()
  );

  const updateProfile = (
    updater: ProfileData | ((prev: ProfileData) => ProfileData)
  ) => {
    const current = storageService.getSnapshot();
    const next = typeof updater === "function" ? updater(current) : updater;
    storageService.saveProfile(next);
  };

  const resetProfile = () => storageService.resetProfile();

  return { profile, updateProfile, resetProfile };
}
