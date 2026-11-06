"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { describeFirestoreError } from "@/lib/links-repository";
import {
  DisplayNameTakenError,
  fetchProfile,
  saveProfileBasics,
  UsernameTakenError,
  type ProfileBasics,
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

/** 프로필 저장 (username·displayName·bio, 인라인 수정) — 중복이면 해당 필드 오류로 돌려준다 */
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
