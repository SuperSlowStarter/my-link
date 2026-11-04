"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, Link2, Pencil, Plus } from "lucide-react";
import { useLinksStore, useLinksSync } from "@/store/links-store";
import { useProfileStore } from "@/store/profile-store";
import { useRimLight } from "@/lib/use-rim-light";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfileEditor } from "@/components/profile-editor";
import { ProfileCardView } from "@/components/profile-view";
import { AmbientBackground } from "@/components/ambient-background";
import { SiteHeader } from "@/components/site-header";

/**
 * 내 링크 페이지 (로그인한 사용자의 홈 /)
 * - 프로필: Firestore users/{uid}/profile/main · 링크: users/{uid}/links
 * - 방문자에게 보이는 모습은 /{username} 공개 페이지와 같다 (ProfileCardView 공용).
 * - 로그인 전 방문자에게는 app/page.tsx가 소개 페이지(LandingPage)를 대신 보여준다.
 */
export function HubPage() {
  useRimLight();

  const profile = useProfileStore((state) => state.profile);
  const profileSavedAt = useProfileStore((state) => state.savedAt);
  const profileError = useProfileStore((state) => state.error);

  useLinksSync();
  // 메인 카드는 편집 모드·마이페이지에서 직접 정한 순서대로
  const links = useLinksStore((state) => state.orderedLinks);
  const linksStatus = useLinksStore((state) => state.status);
  const linksSavedAt = useLinksStore((state) => state.savedAt);
  const linksError = useLinksStore((state) => state.error);
  const clearLinksError = useLinksStore((state) => state.clearError);

  const [isEditMode, setIsEditMode] = useState(false);
  const [noticeHiddenAt, setNoticeHiddenAt] = useState<number | null>(null);

  // 저장 알림: 프로필·링크 중 마지막 저장을 2초간 표시
  const savedAt = Math.max(linksSavedAt ?? 0, profileSavedAt ?? 0) || null;
  useEffect(() => {
    if (!savedAt) return;
    const timer = window.setTimeout(() => setNoticeHiddenAt(savedAt), 2000);
    return () => window.clearTimeout(timer);
  }, [savedAt]);
  const saveNotice = savedAt && noticeHiddenAt !== savedAt ? "Firestore에 저장됨" : null;
  const error = linksError ?? profileError;

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

      {/* 저장·오류 알림 (헤더 아래 우측) */}
      <div className="pointer-events-none fixed top-[68px] right-4 z-[500] flex flex-col items-end gap-2">
        {error && (
          <button
            type="button"
            role="alert"
            onClick={clearLinksError}
            title="닫기"
            className="animate-snap pointer-events-auto max-w-[280px] cursor-pointer rounded-[6px] border border-danger/40 bg-crow/90 px-2.5 py-1 text-left text-[11px] font-medium text-danger shadow-sm backdrop-blur-md"
          >
            {error}
          </button>
        )}
        {saveNotice && !error && (
          <span
            key={savedAt}
            role="status"
            aria-live="polite"
            className="animate-snap rounded-[6px] border border-hearth/40 bg-crow/85 px-2.5 py-1 font-mono text-[11px] font-medium text-hearth shadow-sm backdrop-blur-md"
          >
            {saveNotice}
          </span>
        )}
      </div>

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
