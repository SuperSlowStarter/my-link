"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ShowreelConfig } from "@/data/links";
import { describeFirestoreError } from "@/lib/links-repository";
import {
  DisplayNameTakenError,
  fetchProfile,
  saveProfileBasics,
  updateProfileDetails,
  UsernameTakenError,
  type ProfileBasics,
  type ProfileDetails,
  type UserProfile,
} from "@/lib/profile-repository";
import { queryKeys } from "@/lib/query-client";
import { useAuthStore } from "@/store/auth-store";

/**
 * 공개 프로필 (TanStack Query) — Firestore users/{uid}/profile/main
 * - 조회: useQuery (실시간 구독 없음). 내 프로필·공개 페이지가 같은 캐시 키를 쓴다.
 * - 프로필이 없으면 로그인 직후 AuthListener가 초기값을 만들고(ensureProfile) 이 캐시를 무효화한다.
 */

/** uid의 프로필 조회 (없으면 null) */
export function useProfileQuery(uid: string | null) {
  return useQuery({
    queryKey: queryKeys.profile(uid ?? ""),
    queryFn: () => fetchProfile(uid as string),
    enabled: Boolean(uid),
    meta: { loadingLabel: "프로필 불러오는 중" },
  });
}

/** 로그인한 내 프로필 */
export function useMyProfile() {
  const uid = useAuthStore((state) => state.user?.uid ?? null);
  const query = useProfileQuery(uid);
  return { uid, profile: query.data ?? null, isLoading: query.isPending, error: query.error };
}

export type SaveBasicsResult =
  | { ok: true }
  | { ok: false; field?: "username" | "displayName"; message: string };

/** 마이페이지 프로필 저장 (username·displayName·bio) — 중복이면 해당 필드 오류로 돌려준다 */
export function useSaveProfileBasics() {
  const queryClient = useQueryClient();
  const uid = useAuthStore((state) => state.user?.uid ?? null);
  const mutation = useMutation({
    meta: { loadingLabel: "프로필 저장 중" },
    mutationFn: (basics: ProfileBasics) => {
      if (!uid) throw new Error("unauthenticated");
      return saveProfileBasics(uid, basics);
    },
    onSuccess: () => {
      if (uid) void queryClient.invalidateQueries({ queryKey: queryKeys.profile(uid) });
    },
  });

  const save = async (basics: ProfileBasics): Promise<SaveBasicsResult> => {
    try {
      await mutation.mutateAsync(basics);
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
    }
  };

  return { save, isSaving: mutation.isPending };
}

/* 편집 모드 자동 저장: 입력이 멈추고 600ms 뒤에 모아서 저장 */
const AUTOSAVE_DELAY_MS = 600;

/**
 * 편집 모드 상세 정보(직무·스킬·쇼릴) 자동 저장
 * - 입력하면 캐시를 바로 고쳐 카드에 반영하고(낙관적 업데이트), 600ms 뒤 한 번에 Firestore에 저장한다.
 * - 실패하면 Sonner 오류 알림 후 프로필을 다시 조회해 원래 값으로 되돌린다.
 * - 자동 저장이라 로딩 오버레이는 띄우지 않는다.
 */
export function useProfileDetailsAutosave() {
  const queryClient = useQueryClient();
  const uid = useAuthStore((state) => state.user?.uid ?? null);
  const pending = useRef<ProfileDetails>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mutation = useMutation({
    mutationFn: (details: ProfileDetails) => {
      if (!uid) throw new Error("unauthenticated");
      return updateProfileDetails(uid, details);
    },
    onError: (error) => {
      toast.error("자동 저장에 실패했어요", { description: describeFirestoreError(error) });
      if (uid) void queryClient.invalidateQueries({ queryKey: queryKeys.profile(uid) });
    },
  });
  const { mutate } = mutation;

  const flush = useCallback(() => {
    timer.current = null;
    const details = pending.current;
    pending.current = {};
    if (Object.keys(details).length > 0) mutate(details);
  }, [mutate]);

  // 화면을 떠날 때 남은 변경을 저장
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
        flush();
      }
    },
    [flush]
  );

  const queue = useCallback(
    (details: ProfileDetails) => {
      if (!uid) return;
      queryClient.setQueryData<UserProfile | null>(queryKeys.profile(uid), (current) =>
        current ? { ...current, ...details } : current
      );
      pending.current = { ...pending.current, ...details };
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, AUTOSAVE_DELAY_MS);
    },
    [uid, queryClient, flush]
  );

  const current = () => (uid ? queryClient.getQueryData<UserProfile | null>(queryKeys.profile(uid)) : null);

  return {
    updateDetails: queue,
    updateShowreel: (patch: Partial<ShowreelConfig>) => {
      const profile = current();
      if (profile) queue({ showreel: { ...profile.showreel, ...patch } });
    },
    addSkill: (skill: string) => {
      const profile = current();
      if (profile) queue({ skills: [...profile.skills, skill] });
    },
    removeSkill: (skill: string) => {
      const profile = current();
      if (profile) queue({ skills: profile.skills.filter((item) => item !== skill) });
    },
    isSaving: mutation.isPending,
  };
}
