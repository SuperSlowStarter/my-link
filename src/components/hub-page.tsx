"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, Link2, Pencil, Plus } from "lucide-react";
import { useMyLinks } from "@/hooks/use-links";
import { useMyProfile } from "@/hooks/use-profile";
import { useRimLight } from "@/lib/use-rim-light";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfileEditor } from "@/components/profile-editor";
import { ProfileCardView } from "@/components/profile-view";
import { AmbientBackground } from "@/components/ambient-background";
import { SiteHeader } from "@/components/site-header";

/**
 * 내 링크 페이지 (로그인한 사용자의 홈 /)
 * - 프로필: users/{uid}/profile/main · 링크: users/{uid}/links — TanStack Query로 조회 (실시간 구독 없음)
 * - 방문자에게 보이는 모습은 /{username} 공개 페이지와 같다 (ProfileCardView 공용).
 * - 저장 결과·오류는 Sonner 알림으로 보여준다.
 */
export function HubPage() {
  useRimLight();

  const { profile } = useMyProfile();
  // 메인 카드는 마이페이지에서 직접 정한 순서대로
  const { orderedLinks: links, status: linksStatus } = useMyLinks();
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <>
      <AmbientBackground />

      {/* 사이트 헤더: 로고 · 메뉴 · 편집 모드 버튼 · 프로필 메뉴 */}
      <SiteHeader
        actions={
          !profile ? null : isEditMode ? (
            <Button type="button" variant="primary" size="sm" onClick={() => setIsEditMode(false)}>
              <Check className="h-3.5 w-3.5" />
              <span>완료</span>
            </Button>
          ) : (
            <>
              <Link
                href={`/${profile.username}`}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
                title="방문자에게 보이는 내 공개 페이지"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">공개 페이지</span>
              </Link>
              <Button type="button" variant="glass" size="sm" onClick={() => setIsEditMode(true)}>
                <Pencil className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">편집 모드</span>
              </Button>
            </>
          )
        }
      />

      <main className="relative flex flex-1 flex-col items-center justify-center overflow-x-hidden px-6 py-12">
        <Card className="animate-glass-entry w-full items-center p-[20px] text-center md:w-[80%] md:max-w-[480px] md:p-[28px] lg:w-[400px] lg:max-w-[400px]">
          {!profile ? (
            /* 프로필을 불러오는 중 (로딩 오버레이가 함께 뜬다) */
            <div aria-busy="true" className="flex w-full flex-col items-center gap-3 py-6">
              <div className="h-[120px] w-[120px] animate-pulse rounded-full bg-winter/[0.08]" />
              <div className="h-8 w-40 animate-pulse rounded-[6px] bg-winter/[0.08]" />
              <div className="h-4 w-56 animate-pulse rounded-[6px] bg-winter/[0.06]" />
            </div>
          ) : isEditMode ? (
            /* 편집 모드: 직무·스킬·쇼릴 (이름·소개·username은 마이페이지, 링크는 /mypage) */
            <ProfileEditor />
          ) : (
            <ProfileCardView
              profile={profile}
              links={links}
              linksLoading={linksStatus === "loading"}
              emptyLinks={
                <div className="flex flex-col items-center justify-center gap-2 rounded-[0.5rem] border border-dashed border-winter/25 bg-winter/8 p-6 text-center">
                  <Link2 className="h-6 w-6 text-hearth" aria-hidden="true" />
                  <p className="text-sm font-medium text-winter/90">등록된 외부 링크가 없습니다.</p>
                  <p className="text-xs text-winter/65">
                    내 링크 관리에서 유튜브, 인스타그램, 외주 문의 링크를 추가해보세요.
                  </p>
                  <Link href="/mypage" className={buttonVariants({ variant: "glass", size: "xs", className: "mt-1" })}>
                    <Plus className="h-3.5 w-3.5" />
                    <span>링크 추가하기</span>
                  </Link>
                </div>
              }
            />
          )}
        </Card>
      </main>
    </>
  );
}
