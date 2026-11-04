"use client";

import { useEffect, useState } from "react";
import { useLoadingStore } from "@/store/loading-store";
import { LogoMark } from "@/components/site-header";

/** 이보다 빨리 끝나는 작업은 오버레이를 띄우지 않는다 (깜빡임 방지) */
const SHOW_DELAY_MS = 250;
/** 한 번 뜨면 최소 이만큼은 보여준다 (번쩍임 방지) */
const MIN_VISIBLE_MS = 400;

/**
 * 전체 화면 로딩 오버레이 (글래스모피즘)
 * - 페이지 전체를 덮고 배경을 흐리게(backdrop-blur) 한 뒤, 가운데 유리 패널에 로딩 아이콘과 문구를 보여준다.
 * - 진행 중에는 아래 화면을 누를 수 없다.
 * - z-index: modal(300) 위, toast(500) 아래인 400.
 */
export function LoadingOverlay() {
  const tasks = useLoadingStore((state) => state.tasks);
  const busy = tasks.length > 0;
  const label = tasks[tasks.length - 1]?.label ?? "";

  const [visible, setVisible] = useState(false);
  const [shownLabel, setShownLabel] = useState("");
  const [shownAt, setShownAt] = useState(0);

  // 문구는 진행 중일 때만 갱신 (사라지는 동안 빈 문구가 되지 않게)
  if (busy && label && label !== shownLabel) setShownLabel(label);

  useEffect(() => {
    if (busy && !visible) {
      const timer = window.setTimeout(() => {
        setVisible(true);
        setShownAt(Date.now());
      }, SHOW_DELAY_MS);
      return () => window.clearTimeout(timer);
    }
    if (!busy && visible) {
      const remaining = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt));
      const timer = window.setTimeout(() => setVisible(false), remaining);
      return () => window.clearTimeout(timer);
    }
  }, [busy, visible, shownAt]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="animate-overlay-in fixed inset-0 z-[400] flex items-center justify-center bg-crow/45 backdrop-blur-md backdrop-saturate-150"
    >
      <div className="animate-expand flex min-w-[200px] flex-col items-center gap-4 rounded-[20px] bg-winter/[0.09] px-8 py-7 shadow-[0_16px_48px_rgba(12,3,7,0.55),inset_0_1px_1px_rgba(245,236,209,0.12),inset_0_0_18px_rgba(245,236,209,0.05)] backdrop-blur-xl">
        {/* 로딩 아이콘: 로고 마크 + 주위를 도는 Hearth 호 */}
        <span className="relative flex h-16 w-16 items-center justify-center">
          <svg className="absolute inset-0 h-16 w-16" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(245,236,209,0.12)" strokeWidth="3" />
          </svg>
          <svg className="animate-loader-spin absolute inset-0 h-16 w-16" viewBox="0 0 64 64" aria-hidden="true">
            <defs>
              <linearGradient id="loader-arc" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E1CAA6" stopOpacity="0" />
                <stop offset="100%" stopColor="#E1CAA6" />
              </linearGradient>
            </defs>
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="url(#loader-arc)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="70 176"
            />
          </svg>
          <LogoMark className="animate-loader-pulse h-8 w-8" />
        </span>
        <p className="text-sm font-medium text-winter">
          {shownLabel}
          <span className="loader-dots" aria-hidden="true" />
        </p>
      </div>
    </div>
  );
}
