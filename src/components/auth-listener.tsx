"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getFirebaseAuth } from "@/lib/firebase";
import { ensureProfile } from "@/lib/profile-repository";
import { queryKeys } from "@/lib/query-client";
import { useAuthListener, useAuthStore } from "@/store/auth-store";
import { beginLoading } from "@/store/loading-store";

/**
 * 루트 레이아웃에 한 번 두면
 * - Firebase 로그인 상태를 추적하고 (onAuthStateChanged — Auth 상태 감시, Firestore 실시간 구독 아님)
 * - 로그인하면 공개 프로필이 없을 때 초기값을 만든 뒤(ensureProfile) 프로필 캐시를 다시 조회하게 하고
 * - 로그아웃하면 이전 사용자의 캐시를 비운다.
 * 화면에는 아무것도 그리지 않는다.
 */
export function AuthListener() {
  useAuthListener();
  const queryClient = useQueryClient();
  const uid = useAuthStore((state) => state.user?.uid ?? null);
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (!uid) return;
    const user = getFirebaseAuth().currentUser;
    if (!user) return;
    let cancelled = false;
    const endLoading = beginLoading("프로필 준비 중");
    ensureProfile(user)
      .catch((error: unknown) => {
        if (process.env.NODE_ENV !== "production") console.warn("[firestore] 프로필 초기화 실패", error);
      })
      .finally(() => {
        endLoading();
        if (!cancelled) void queryClient.invalidateQueries({ queryKey: queryKeys.profile(uid) });
      });
    return () => {
      cancelled = true;
      endLoading();
    };
  }, [uid, queryClient]);

  // 로그아웃하면 이전 계정의 링크·프로필 캐시를 지운다
  useEffect(() => {
    if (status === "signedOut") {
      queryClient.removeQueries({ queryKey: ["links"] });
      queryClient.removeQueries({ queryKey: ["profile"] });
    }
  }, [status, queryClient]);

  return null;
}
