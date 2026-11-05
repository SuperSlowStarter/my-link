"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { BarChart3, ExternalLink, Link2, MousePointerClick, Trophy } from "lucide-react";
import type { ComponentType } from "react";
import type { StoredLink } from "@/lib/links-repository";
import { useAuthStore } from "@/store/auth-store";
import { useMyLinks } from "@/hooks/use-links";
import { useMyProfile } from "@/hooks/use-profile";
import { useRimLight } from "@/lib/use-rim-light";
import { computeLinkStats, formatCount, LinkStatsRanking } from "@/components/link-stats";
import { AmbientBackground } from "@/components/ambient-background";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

/**
 * 통계 대시보드 /stats (13주차)
 * - 로그인 필수: 로그아웃 상태면 홈(/)으로 보낸다. 본인 링크(users/{uid}/links)만 조회하므로 본인 통계만 보인다.
 * - 총 클릭수 · 가장 인기 있는 링크 · 클릭된 링크 수 / 링크별 클릭수 막대 차트(shadcn chart + recharts) / 순위 목록(많은 순)
 * - 림라이트는 바탕 카드 하나에만 (Design.md 규칙). 안쪽 패널은 반투명 유리만.
 */

const chartConfig = {
  clicks: { label: "클릭", color: "#E1CAA6" }, // Hearth
} satisfies ChartConfig;

/** 차트 막대가 자라는 곡선: 확 치고 길게 감속 (ease-punch, 10 % / 95 %) */
const EASE_PUNCH = "cubic-bezier(0.1,0,0.05,1)" as const;

const PANEL = "rounded-[14px] border border-winter/[0.08] bg-winter/[0.06] shadow-[0_8px_24px_rgba(12,3,7,0.28)]";

export function StatsDashboard() {
  useRimLight();

  const authStatus = useAuthStore((state) => state.status);
  const router = useRouter();
  useEffect(() => {
    if (authStatus === "signedOut") router.replace("/");
  }, [authStatus, router]);

  const { links, status, error } = useMyLinks();
  const { profile } = useMyProfile();
  const ready = authStatus === "signedIn" && status === "ready";

  return (
    <>
      <AmbientBackground />
      <SiteHeader />

      <main className="relative flex flex-1 flex-col items-center overflow-x-hidden px-4 py-10 sm:px-6">
        <Card className="animate-glass-entry w-full max-w-3xl gap-5 p-5 sm:p-7">
          {/* 머리말 */}
          <header className="relative z-10 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-[0.18em] text-hearth uppercase">Click Analytics</p>
              <h1 className="mt-1 bg-gradient-to-r from-winter to-hearth bg-clip-text text-[1.75rem] leading-tight font-bold tracking-tight text-transparent">
                통계 대시보드
              </h1>
              <p className="mt-1 text-xs text-winter/60">방문자가 내 공개 페이지에서 어떤 링크를 눌렀는지 한눈에 확인하세요.</p>
            </div>
            {profile?.username && (
              <Link
                href={`/${profile.username}`}
                className={buttonVariants({ variant: "glass", size: "sm", className: "mt-2 self-start sm:mt-0 sm:self-auto" })}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>/{profile.username}</span>
              </Link>
            )}
          </header>

          {error ? (
            <p role="alert" className="relative z-10 rounded-[10px] border border-danger/30 bg-danger/10 p-4 text-center text-sm text-danger">
              {error}
            </p>
          ) : !ready ? (
            <div aria-busy="true" aria-label="통계를 불러오는 중" className="relative z-10 flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-3">
                {[0, 1, 2].map((key) => (
                  <div key={key} className="h-[104px] animate-pulse rounded-[14px] bg-winter/[0.07]" />
                ))}
              </div>
              <div className="h-[260px] animate-pulse rounded-[14px] bg-winter/[0.06]" />
            </div>
          ) : (
            <StatsContent links={links} username={profile?.username ?? null} />
          )}
        </Card>
      </main>
    </>
  );
}

/** 통계 본문 (지표 · 차트 · 순위) — 링크 목록만 있으면 그린다 */
export function StatsContent({ links, username }: { links: StoredLink[]; username: string | null }) {
  const stats = computeLinkStats(links);
  // 차트(recharts)는 브라우저 크기를 재야 해서 화면에 붙은 뒤에만 그린다 (서버 렌더링에서는 자리만)
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  // 차트: 많은 순 상위 8개 (제목이 길면 줄임)
  const chartData = stats.ranked.slice(0, 8).map((link) => ({
    title: link.title.length > 10 ? `${link.title.slice(0, 10)}…` : link.title,
    fullTitle: link.title,
    clicks: link.clickCount,
  }));

  return (
    <>
      {/* 주요 지표 */}
      <div className="relative z-10 grid gap-3 sm:grid-cols-3">
        <MetricCard
          icon={MousePointerClick}
          label="총 클릭수"
          value={formatCount(stats.total)}
          unit="클릭"
          hint="모든 링크의 누적 클릭"
          highlight
          delay={0}
        />
        <MetricCard
          icon={Trophy}
          label="가장 인기 있는 링크"
          value={stats.top ? stats.top.title : "아직 없음"}
          hint={stats.top ? `${formatCount(stats.top.clickCount)} 클릭` : "클릭이 생기면 보여요"}
          small
          delay={80}
        />
        <MetricCard
          icon={Link2}
          label="클릭된 링크"
          value={`${stats.clickedCount}`}
          unit={`/ ${stats.ranked.length}개`}
          hint="한 번 이상 눌린 링크 수"
          delay={160}
        />
      </div>

      {/* 링크별 클릭수 막대 차트 */}
      <section aria-labelledby="stats-chart-title" className={`relative z-10 p-4 ${PANEL}`}>
        <h2 id="stats-chart-title" className="flex items-center gap-1.5 text-sm font-semibold text-winter">
          <BarChart3 className="h-4 w-4 text-hearth" aria-hidden="true" />
          링크별 클릭 분석
        </h2>
        <p className="mt-0.5 text-[11px] text-winter/55">클릭수 많은 순 · 상위 {chartData.length}개</p>

        {stats.ranked.length === 0 ? (
          <EmptyState text="아직 링크가 없어요. 내 링크 관리에서 링크를 추가해보세요." href="/mypage" action="링크 추가하기" />
        ) : stats.total === 0 ? (
          <EmptyState
            text="아직 클릭이 없어요. 공개 페이지 주소를 공유하면 방문자의 클릭이 여기에 쌓여요."
            href={username ? `/${username}` : "/"}
            action="내 공개 페이지 열기"
          />
        ) : !mounted ? (
          <div
            className="mt-3 animate-pulse rounded-[10px] bg-winter/[0.05]"
            style={{ height: Math.max(160, chartData.length * 44 + 24) }}
          />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mt-3 aspect-auto w-full"
            style={{ height: Math.max(160, chartData.length * 44 + 24) }}
          >
            <BarChart data={chartData} layout="vertical" margin={{ left: 4, right: 40, top: 4, bottom: 4 }}>
              <CartesianGrid horizontal={false} stroke="rgba(245,236,209,0.08)" />
              <XAxis type="number" allowDecimals={false} hide />
              <YAxis
                type="category"
                dataKey="title"
                width={96}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "rgba(245,236,209,0.75)", fontSize: 12 }}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(245,236,209,0.06)" }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullTitle ?? ""}
                  />
                }
              />
              <Bar
                dataKey="clicks"
                fill="var(--color-clicks)"
                radius={[4, 4, 4, 4]}
                barSize={22}
                animationDuration={700}
                animationEasing={EASE_PUNCH}
              >
                <LabelList dataKey="clicks" position="right" offset={8} fill="rgba(245,236,209,0.85)" fontSize={12} />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </section>

      {/* 상세 순위 */}
      <section aria-labelledby="stats-ranking-title" className={`relative z-10 p-4 ${PANEL}`}>
        <h2 id="stats-ranking-title" className="text-sm font-semibold text-winter">
          전체 링크 순위
        </h2>
        <p className="mt-0.5 mb-3 text-[11px] text-winter/55">
          진행 바는 가장 많이 눌린 링크 대비 비율, 오른쪽 %는 전체 클릭 중 비율이에요.
        </p>
        <LinkStatsRanking stats={stats} />
      </section>

      <p className="relative z-10 text-center text-[10px] leading-relaxed text-winter/40">
        공개 페이지(/username)에서 누른 클릭만 집계해요. 내 링크 페이지·내 링크 관리에서 누른 건 세지 않아요.
        클릭수는 Firestore 서버에서 +1 하므로(increment) 동시에 눌러도 정확해요.
      </p>
    </>
  );
}

const noopSubscribe = () => () => {};

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  hint,
  highlight = false,
  small = false,
  delay,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit?: string;
  hint: string;
  highlight?: boolean;
  small?: boolean;
  delay: number;
}) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`animate-glass-entry flex min-w-0 flex-col justify-between gap-2 p-4 ${PANEL} ${
        highlight ? "border-hearth/25 bg-gradient-to-br from-hearth/[0.16] to-hearth/[0.04]" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-winter/60">{label}</span>
        <span className="flex size-7 items-center justify-center rounded-full bg-hearth/15">
          <Icon className="h-3.5 w-3.5 text-hearth" />
        </span>
      </div>
      <p className="min-w-0 leading-none">
        <span
          className={`font-bold tracking-tight text-winter tabular-nums ${small ? "block truncate text-lg" : "text-[2rem]"}`}
          title={small ? value : undefined}
        >
          {value}
        </span>
        {unit && <span className="ml-1 text-sm font-semibold text-winter/65">{unit}</span>}
      </p>
      <p className="truncate text-[10px] text-winter/45">{hint}</p>
    </div>
  );
}

function EmptyState({ text, href, action }: { text: string; href: string; action: string }) {
  return (
    <div className="mt-3 flex flex-col items-center gap-2 rounded-[10px] border border-dashed border-winter/20 p-6 text-center">
      <MousePointerClick className="h-6 w-6 text-hearth" aria-hidden="true" />
      <p className="max-w-[36ch] text-xs leading-relaxed break-keep text-winter/70">{text}</p>
      <Link href={href} className={buttonVariants({ variant: "glass", size: "xs" })}>
        {action}
      </Link>
    </div>
  );
}
