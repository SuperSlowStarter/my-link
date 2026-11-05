import { QueryClient } from "@tanstack/react-query";

/**
 * TanStack Query 설정 — Firestore 데이터 조회·쓰기를 모두 여기서 관리한다 (실시간 구독 없음)
 * - 조회(useQuery): 30초 동안은 캐시를 그대로 쓰고, 창으로 돌아오면 다시 조회한다.
 * - 쓰기(useMutation): 성공하면 관련 캐시를 무효화해 다시 조회한다.
 * - meta.loadingLabel 이 있는 작업은 전체 화면 로딩 오버레이에 문구와 함께 표시된다.
 */
declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: { loadingLabel?: string };
    mutationMeta: { loadingLabel?: string };
  }
}

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

/** 캐시 키 — 같은 데이터는 어디서 읽든 같은 키를 쓴다 */
export const queryKeys = {
  /** users/{uid}/links */
  links: (uid: string) => ["links", uid] as const,
  /** users/{uid}/profile/main (내 프로필·공개 페이지 공용) */
  profile: (uid: string) => ["profile", uid] as const,
  /** users/anonymous/links 개수 (이전 공용 링크 가져오기) */
  legacyLinkCount: () => ["legacy-link-count"] as const,
};
