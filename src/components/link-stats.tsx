"use client";

import Link from "next/link";
import { BarChart3, ChevronRight, MousePointerClick } from "lucide-react";
import type { StoredLink } from "@/lib/links-repository";
import { LinkIcon } from "@/components/link-icon";

/**
 * 클릭 통계 (13주차) — 마이페이지 통계 섹션과 /stats 대시보드가 함께 쓴다.
 * 데이터 집계: 각 링크의 clickCount(서버에서 increment(1)로 늘린 값)를 모아 총 클릭수·순위로 만든다.
 */

export interface LinkStats {
  /** 모든 링크의 클릭수 합계 */
  total: number;
  /** 클릭수 많은 순 (같으면 제목 가나다순) */
  ranked: StoredLink[];
  /** 가장 많이 눌린 링크의 클릭수 (진행 바 기준) */
  max: number;
  /** 가장 인기 있는 링크 (클릭이 하나도 없으면 null) */
  top: StoredLink | null;
  /** 한 번이라도 눌린 링크 수 */
  clickedCount: number;
}

export function computeLinkStats(links: StoredLink[]): LinkStats {
  const ranked = [...links].sort(
    (a, b) => b.clickCount - a.clickCount || a.title.localeCompare(b.title, "ko")
  );
  const total = links.reduce((sum, link) => sum + link.clickCount, 0);
  const max = ranked[0]?.clickCount ?? 0;
  return {
    total,
    ranked,
    max,
    top: max > 0 ? ranked[0] : null,
    clickedCount: links.filter((link) => link.clickCount > 0).length,
  };
}

export const formatCount = (value: number) => value.toLocaleString("ko-KR");

/** 전체 대비 비율 (소수점 없이) */
const share = (value: number, total: number) => (total > 0 ? Math.round((value / total) * 100) : 0);

/**
 * 링크별 클릭수 순위 — 제목 · N 클릭 + 진행 바(가장 많이 눌린 링크 대비 비율)
 */
export function LinkStatsRanking({ stats, compact = false }: { stats: LinkStats; compact?: boolean }) {
  if (stats.ranked.length === 0) {
    return <p className="py-4 text-center text-xs text-winter/55">아직 링크가 없어요. 링크를 추가하면 여기에 통계가 보여요.</p>;
  }
  return (
    <ol className="flex flex-col gap-2" aria-label="링크별 클릭수 (많은 순)">
      {stats.ranked.map((link, index) => {
        const ratio = stats.max > 0 ? link.clickCount / stats.max : 0;
        return (
          <li
            key={link.id}
            style={{ animationDelay: `${index * 60}ms` }}
            className="animate-glass-entry flex items-center gap-2.5 rounded-[0.5rem] border border-winter/[0.06] bg-winter/[0.07] px-2.5 py-2"
          >
            <span
              aria-hidden="true"
              className={`w-4 shrink-0 text-center font-mono text-[11px] tabular-nums ${
                index === 0 && link.clickCount > 0 ? "font-bold text-hearth" : "text-winter/45"
              }`}
            >
              {index + 1}
            </span>
            {!compact && (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-[4px] border border-winter/10 bg-cedar/45">
                <LinkIcon iconType={link.iconType} className="h-3.5 w-3.5" />
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[13px] font-medium text-winter">{link.title}</span>
                <span className="shrink-0 text-[11px] text-winter/60 tabular-nums">
                  <span className="font-semibold text-winter">{formatCount(link.clickCount)}</span> 클릭
                  {!compact && <span className="ml-1.5 text-winter/40">{share(link.clickCount, stats.total)}%</span>}
                </span>
              </span>
              {/* 진행 바: 가장 많이 눌린 링크를 100%로 */}
              <span
                role="progressbar"
                aria-label={`${link.title} 클릭 비율`}
                aria-valuemin={0}
                aria-valuemax={stats.max}
                aria-valuenow={link.clickCount}
                className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-winter/[0.08]"
              >
                <span
                  className="stats-bar block h-full origin-left rounded-full bg-gradient-to-r from-hearth/70 to-hearth"
                  style={{ transform: `scaleX(${ratio})`, animationDelay: `${120 + index * 60}ms` }}
                />
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * 마이페이지 통계 섹션 — 링크 관리 영역 아래
 * 총 클릭수(큰 숫자) + 링크별 클릭수(많은 순) + 대시보드(/stats) 바로가기
 */
export function MyPageStatsSection({ links }: { links: StoredLink[] }) {
  const stats = computeLinkStats(links);
  return (
    <section aria-labelledby="mypage-stats-title" className="relative z-10 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 id="mypage-stats-title" className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-winter uppercase">
          <BarChart3 className="h-3.5 w-3.5 text-hearth" aria-hidden="true" />
          클릭 통계
        </h2>
        <Link
          href="/stats"
          className="group inline-flex items-center gap-0.5 rounded-[4px] text-[11px] font-medium text-hearth outline-none hover:underline focus-visible:ring-2 focus-visible:ring-hearth"
        >
          대시보드
          <ChevronRight className="h-3 w-3 transition-transform duration-200 ease-punch group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* 총 클릭수 — 큰 숫자로 강조 */}
      <div className="flex items-end justify-between gap-3 rounded-[0.75rem] border border-hearth/20 bg-gradient-to-br from-hearth/[0.14] to-hearth/[0.04] px-4 py-3 shadow-[0_6px_20px_rgba(12,3,7,0.25)]">
        <div>
          <p className="text-[11px] font-medium text-winter/60">총 클릭수</p>
          <p className="mt-0.5 leading-none">
            <span className="text-[2rem] font-bold tracking-tight text-winter tabular-nums">{formatCount(stats.total)}</span>
            <span className="ml-1 text-sm font-semibold text-winter/70">클릭</span>
          </p>
        </div>
        <p className="flex items-center gap-1 pb-0.5 text-right text-[11px] text-winter/55">
          <MousePointerClick className="h-3.5 w-3.5 text-hearth" aria-hidden="true" />
          링크 {stats.ranked.length}개 중 {stats.clickedCount}개 클릭됨
        </p>
      </div>

      <LinkStatsRanking stats={stats} compact />
      <p className="text-[10px] leading-relaxed text-winter/40">
        방문자가 공개 페이지(/username)에서 링크를 누를 때 집계돼요. 내 링크 페이지·이 화면에서 누른 건 세지 않아요.
      </p>
    </section>
  );
}
