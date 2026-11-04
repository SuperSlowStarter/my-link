"use client";

import { create } from "zustand";

/**
 * 전역 로딩 상태 — 갱신·업데이트 중에 전체 화면 오버레이를 띄우기 위한 작업 목록
 * 여러 작업이 겹쳐도 하나라도 진행 중이면 오버레이가 보이고, 가장 최근 작업의 문구를 보여준다.
 */
interface LoadingTask {
  id: number;
  label: string;
}

interface LoadingState {
  tasks: LoadingTask[];
}

export const useLoadingStore = create<LoadingState>()(() => ({ tasks: [] }));

let nextId = 1;

/** 작업 시작: 끝낼 때 호출할 함수를 돌려준다 (여러 번 호출해도 안전) */
export function beginLoading(label: string): () => void {
  const id = nextId++;
  useLoadingStore.setState((state) => ({ tasks: [...state.tasks, { id, label }] }));
  let done = false;
  return () => {
    if (done) return;
    done = true;
    useLoadingStore.setState((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
  };
}

/** 비동기 작업을 감싸서 진행되는 동안 오버레이를 띄운다 */
export async function withLoading<T>(label: string, task: () => Promise<T>): Promise<T> {
  const end = beginLoading(label);
  try {
    return await task();
  } finally {
    end();
  }
}
