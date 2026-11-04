"use client";

import { create } from "zustand";

/**
 * /mypage "내 링크 관리" 상태 (7주차 실습: Create)
 * 일부러 persist 없이 메모리에만 둔다.
 * → 체크리스트 테스트 "링크 추가 → 새로고침 → 사라짐 확인"을 위한 단계.
 * 다음 마일스톤(M5)에서 persist 미들웨어를 붙여 새로고침 후에도 유지되게 한다.
 */

export interface MyLink {
  id: string;
  title: string;
  href: string;
  createdAt: number;
}

interface MyPageState {
  links: MyLink[];
  addLink: (link: Pick<MyLink, "title" | "href">) => void;
  removeLink: (id: string) => void;
}

export const useMyPageStore = create<MyPageState>()((set) => ({
  links: [],
  addLink: ({ title, href }) =>
    set((state) => ({
      links: [
        ...state.links,
        { id: `my-${Date.now()}`, title, href, createdAt: Date.now() },
      ],
    })),
  removeLink: (id) =>
    set((state) => ({ links: state.links.filter((link) => link.id !== id) })),
}));
