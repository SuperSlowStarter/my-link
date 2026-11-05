"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addLinkDoc,
  countLegacyLinks,
  deleteLinkDoc,
  describeFirestoreError,
  fetchLinks,
  importLegacyLinks,
  reorderLinkDocs,
  sortByOrder,
  updateLinkDoc,
  type LinkInput,
  type StoredLink,
} from "@/lib/links-repository";
import { queryKeys } from "@/lib/query-client";
import { useAuthStore } from "@/store/auth-store";

/**
 * 링크 데이터 (TanStack Query) — Firestore users/{uid}/links
 * - 조회: useQuery로 한 번 불러와 캐시 (실시간 구독 없음)
 * - 쓰기: useMutation → 성공하면 링크 캐시를 무효화해 다시 조회
 * - 진행 중에는 전체 화면 로딩 오버레이(meta.loadingLabel), 결과는 Sonner 알림
 */

const NO_LINKS: StoredLink[] = [];

export type LinksStatus = "signedOut" | "loading" | "ready" | "error";

/** 링크 목록 조회 (내 링크든 공개 페이지든 uid만 있으면 같은 캐시) */
export function useLinksQuery(uid: string | null) {
  const query = useQuery({
    queryKey: queryKeys.links(uid ?? ""),
    queryFn: () => fetchLinks(uid as string),
    enabled: Boolean(uid),
    meta: { loadingLabel: "링크 불러오는 중" },
  });
  const links = query.data ?? NO_LINKS;
  // 메인 카드용: 직접 정한 순서
  const orderedLinks = useMemo(() => sortByOrder(links), [links]);
  const status: LinksStatus = !uid
    ? "signedOut"
    : query.isPending
      ? "loading"
      : query.isError
        ? "error"
        : "ready";
  return {
    /** createdAt 최신순 */
    links,
    orderedLinks,
    status,
    error: query.error ? describeFirestoreError(query.error) : null,
    refetch: query.refetch,
  };
}

/** 로그인한 내 링크 */
export function useMyLinks() {
  const uid = useAuthStore((state) => state.user?.uid ?? null);
  return { uid, ...useLinksQuery(uid) };
}

/** 쓰기 공통: 성공하면 내 링크 캐시를 다시 조회, 실패하면 Sonner 오류 알림 */
function useLinkMutation<TVars, TResult>(
  loadingLabel: string,
  run: (uid: string, vars: TVars) => Promise<TResult>,
  successMessage?: (result: TResult, vars: TVars) => string | null
) {
  const queryClient = useQueryClient();
  const uid = useAuthStore((state) => state.user?.uid ?? null);
  return useMutation({
    meta: { loadingLabel },
    mutationFn: (vars: TVars) => {
      if (!uid) throw new Error("unauthenticated");
      return run(uid, vars);
    },
    onSuccess: async (result, vars) => {
      if (uid) await queryClient.invalidateQueries({ queryKey: queryKeys.links(uid) });
      const message = successMessage?.(result, vars);
      if (message) toast.success(message);
    },
    onError: (error) => {
      if (process.env.NODE_ENV !== "production") console.error("[firestore] 링크 쓰기 실패", error);
      toast.error("링크를 저장하지 못했어요", { description: describeFirestoreError(error) });
    },
  });
}

/** 링크 추가·수정·삭제·순서 변경·이전 링크 가져오기 */
export function useLinkActions() {
  const queryClient = useQueryClient();
  const uid = useAuthStore((state) => state.user?.uid ?? null);

  const add = useLinkMutation(
    "링크 저장 중",
    (id: string, input: LinkInput) => {
      // 새 링크는 카드 순서의 맨 뒤
      const current = sortByOrder(queryClient.getQueryData<StoredLink[]>(queryKeys.links(id)) ?? []);
      const known = current.filter((link) => link.order !== Number.MAX_SAFE_INTEGER);
      const order = known.length ? known[known.length - 1].order + 1 : current.length;
      return addLinkDoc(id, input, order);
    },
    (_, input) => `"${input.title}" 링크를 추가했어요`
  );
  const update = useLinkMutation(
    "링크 수정 중",
    (id: string, vars: { linkId: string; input: LinkInput }) => updateLinkDoc(id, vars.linkId, vars.input),
    () => "링크를 수정했어요"
  );
  const remove = useLinkMutation(
    "링크 삭제 중",
    (id: string, linkId: string) => deleteLinkDoc(id, linkId),
    () => "링크를 삭제했어요"
  );
  const reorder = useLinkMutation("순서 변경 중", (id: string, orderedIds: string[]) => reorderLinkDocs(id, orderedIds));
  const importLegacy = useLinkMutation(
    "이전 링크 가져오는 중",
    (id: string) => importLegacyLinks(id),
    (count) => `이전 링크 ${count}개를 가져왔어요`
  );

  return {
    /** 추가 성공 시 새 문서 ID, 실패 시 null */
    addLink: async (input: LinkInput) => {
      try {
        return await add.mutateAsync(input);
      } catch {
        return null;
      }
    },
    updateLink: (linkId: string, input: LinkInput) => update.mutate({ linkId, input }),
    deleteLink: (linkId: string) => remove.mutate(linkId),
    /** 카드 순서(orderedLinks 기준) index를 위·아래로 한 칸 */
    moveLink: (index: number, direction: "up" | "down") => {
      if (!uid) return;
      const ids = sortByOrder(queryClient.getQueryData<StoredLink[]>(queryKeys.links(uid)) ?? []).map((link) => link.id);
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= ids.length) return;
      const [moved] = ids.splice(index, 1);
      ids.splice(target, 0, moved);
      reorder.mutate(ids);
    },
    importLegacy: async () => {
      try {
        await importLegacy.mutateAsync(undefined as never);
        await queryClient.invalidateQueries({ queryKey: queryKeys.legacyLinkCount() });
      } catch {
        // 오류 알림은 onError에서
      }
    },
    isImporting: importLegacy.isPending,
  };
}

/** 로그인 전 공용 경로(users/anonymous/links)에 남은 링크 수 — 내 목록이 비었을 때만 조회 */
export function useLegacyLinkCount(enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.legacyLinkCount(),
    queryFn: countLegacyLinks,
    enabled,
    staleTime: 5 * 60_000,
  });
  return query.data ?? 0;
}
