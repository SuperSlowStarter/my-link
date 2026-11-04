"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Film,
  Link2,
  ListPlus,
  Pencil,
  Plus,
  RotateCcw,
} from "lucide-react";
import { useLinksStore, useLinksSync } from "@/store/links-store";
import { useProfileStore } from "@/store/profile-store";
import { useRimLight } from "@/lib/use-rim-light";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LinkIcon } from "@/components/link-icon";
import { ProfileEditor } from "@/components/profile-editor";
import { ShowreelBlock } from "@/components/showreel-block";
import { AmbientBackground } from "@/components/ambient-background";

export default function Home() {
  // 마우스 위치에 반응하는 가장자리 림라이트
  useRimLight();

  // 프로필: Zustand + localStorage persist
  const profile = useProfileStore((state) => state.profile);
  const profileSavedAt = useProfileStore((state) => state.savedAt);
  const savedReason = useProfileStore((state) => state.savedReason);
  const resetVersion = useProfileStore((state) => state.resetVersion);
  const resetProfile = useProfileStore((state) => state.resetProfile);

  // 링크: Zustand + Firestore(users/anonymous/links) 실시간 구독
  useLinksSync();
  // 메인 카드는 편집 모드에서 직접 정한 순서대로 보여준다
  const links = useLinksStore((state) => state.orderedLinks);
  const linksStatus = useLinksStore((state) => state.status);
  const linksSavedAt = useLinksStore((state) => state.savedAt);
  const linksError = useLinksStore((state) => state.error);
  const clearLinksError = useLinksStore((state) => state.clearError);

  const [isEditMode, setIsEditMode] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [noticeHiddenAt, setNoticeHiddenAt] = useState<number | null>(null);

  // 브라우저에 마운트된 뒤 localStorage 값을 불러온다 (SSR 기본값과 첫 화면 일치)
  useEffect(() => {
    void useProfileStore.persist.rehydrate();
  }, []);

  // 저장 알림: 프로필(localStorage)·링크(Firestore) 중 마지막 저장을 2초간 표시
  const linksIsLatest = (linksSavedAt ?? 0) > (profileSavedAt ?? 0);
  const savedAt = linksIsLatest ? linksSavedAt : profileSavedAt;
  useEffect(() => {
    if (!savedAt) return;
    const timer = window.setTimeout(() => setNoticeHiddenAt(savedAt), 2000);
    return () => window.clearTimeout(timer);
  }, [savedAt]);
  const saveNotice =
    savedAt && noticeHiddenAt !== savedAt
      ? linksIsLatest
        ? "Firestore에 저장됨"
        : savedReason === "reset"
          ? "프로필 기본값으로 복원됨"
          : "LocalStorage 자동 저장됨"
      : null;

  const handleResetToDefault = () => {
    resetProfile();
    setAvatarLoadError(false);
  };

  return (
    <main className="relative flex min-h-[100dvh] flex-1 flex-col items-center justify-center overflow-x-hidden bg-crow px-6 py-16">
      <AmbientBackground />

      {/* 상단 플로팅 모드 전환 컨트롤 바 (z-index: 100 per Design.md) */}
      <header className="fixed top-4 right-4 z-[100] flex items-center gap-2">
        {linksError && (
          <button
            type="button"
            role="alert"
            onClick={clearLinksError}
            title="닫기"
            className="animate-snap max-w-[260px] cursor-pointer rounded-[6px] border border-danger/40 bg-crow/90 px-2.5 py-1 text-left text-[11px] font-medium text-danger shadow-sm backdrop-blur-md"
          >
            {linksError}
          </button>
        )}
        {saveNotice && !linksError && (
          <span
            key={savedAt}
            role="status"
            aria-live="polite"
            className="animate-snap rounded-[6px] border border-hearth/40 bg-crow/85 px-2.5 py-1 font-mono text-[11px] font-medium text-hearth shadow-sm backdrop-blur-md"
          >
            {saveNotice}
          </span>
        )}

        {isEditMode ? (
          <>
            <Button
              type="button"
              variant="glass"
              size="sm"
              onClick={handleResetToDefault}
              title="초기 시드 데이터로 복원"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>기본값 복원</span>
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsEditMode(false)}
            >
              <Check className="h-3.5 w-3.5" />
              <span>완료</span>
            </Button>
          </>
        ) : (
          <>
            <Link
              href="/mypage"
              className={buttonVariants({ variant: "glass", size: "sm" })}
            >
              <ListPlus className="h-3.5 w-3.5" />
              <span>내 링크 관리</span>
            </Link>
            <Button
              type="button"
              variant="glass"
              size="sm"
              onClick={() => setIsEditMode(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
              <span>편집 모드</span>
            </Button>
          </>
        )}
      </header>

      {/* 메인 Glassmorphism 프로필 & 링크 허브 카드 (PRD 5.4 반응형 규격) */}
      <Card className="animate-glass-entry w-full items-center p-[20px] text-center md:w-[80%] md:max-w-[480px] md:p-[28px] lg:w-[400px] lg:max-w-[400px]">
        {!isEditMode ? (
          /* =========================================================
             VIEW MODE (방문자 시점)
             ========================================================= */
          <>
            {/* 프로필 아바타 (120px x 120px 원형 Glass 프레임 + 60FPS 배지) */}
            <div
              className="relative z-10 flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-full border border-winter/12 bg-gradient-to-br from-winter/25 via-winter/12 to-winter/5 text-4xl font-bold text-winter shadow-[0_6px_20px_rgba(0,0,0,0.18)] backdrop-blur-md"
            >
              {profile.avatarImageUrl && !avatarLoadError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarImageUrl}
                  alt={profile.name}
                  onError={() => setAvatarLoadError(true)}
                  className="relative z-10 h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="relative z-10 drop-shadow-[0_2px_6px_rgba(30,9,18,0.35)]">
                  {profile.avatarText || profile.name.slice(0, 1) || "이"}
                </span>
              )}

              {profile.fpsBadge && (
                <Badge
                  variant="teal"
                  title="60 FPS Motion Craft"
                  className="absolute -right-1 bottom-1 z-30"
                >
                  {profile.fpsBadge}
                </Badge>
              )}
            </div>

            {/* H1 이름 타이포그래피 (Design.md: 2.25rem, weight 700, tight tracking) */}
            <h1 className="relative z-10 mt-3.5 text-[2.25rem] leading-tight font-bold tracking-tight text-winter drop-shadow-[0_2px_8px_rgba(30,9,18,0.3)]">
              {profile.name}
            </h1>

            {/* Label Caps 직무 타이틀 (Design.md: 0.75rem, weight 500, uppercase) */}
            <p className="relative z-10 mt-1 flex items-center justify-center gap-1.5 text-[0.75rem] font-medium tracking-wider text-hearth uppercase drop-shadow-[0_1px_2px_rgba(30,9,18,0.4)]">
              <Film className="h-3.5 w-3.5 text-hearth" aria-hidden="true" />
              <span>{profile.role}</span>
            </p>

            {/* Body-md 자기소개 문구 (멀티라인 줄바꿈 지원) */}
            <p className="relative z-10 mt-2.5 max-w-[72ch] text-[1rem] leading-[1.6] font-normal whitespace-pre-line text-winter/95 drop-shadow-[0_1px_4px_rgba(30,9,18,0.25)]">
              {profile.bio}
            </p>

            {/* 기술 스택 태그 (Skills) */}
            {profile.skills.length > 0 && (
              <div
                aria-label="보유 기술 스택"
                className="relative z-10 mt-3 flex flex-wrap justify-center gap-1.5"
              >
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="default">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            {/* 구분선 */}
            <div className="relative z-10 my-4 h-px w-full bg-gradient-to-r from-transparent via-winter/18 to-transparent" />

            {/* 대표 쇼릴 인라인 재생 블록 + 링크 목록 */}
            <nav
              aria-label="포트폴리오 쇼릴 및 소셜 링크 목록"
              className="relative z-10 flex w-full flex-col gap-2.5"
            >
              {/* 대표 쇼릴 인라인 플레이어 (PRD 3.3, 7.1, 7.2) */}
              <ShowreelBlock showreel={profile.showreel} />

              {/* 외부 링크 리스트 (80ms Staggered Entry Cascade) */}
              {linksStatus === "loading" && links.length === 0 ? (
                /* 불러오는 중 (Design.md: Skeletons, no spinners) */
                <div aria-busy="true" aria-label="링크를 불러오는 중" className="flex flex-col gap-2.5">
                  {[0, 1, 2].map((key) => (
                    <div
                      key={key}
                      className="h-[61px] w-full animate-pulse rounded-[0.5rem] bg-winter/[0.08]"
                    />
                  ))}
                </div>
              ) : links.length > 0 ? (
                links.map((link, index) => {
                  const isPrimary = link.variant === "primary";
                  return (
                    <a
                      key={link.id}
                      href={link.href}
                      target={
                        link.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        link.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      style={{ animationDelay: `${(index + 1) * 80}ms` }}
                      className={
                        isPrimary
                          ? "animate-glass-entry group relative flex w-full items-center gap-3 rounded-[0.5rem] border border-crow/10 bg-hearth p-[12px] text-left font-semibold text-crow shadow-[0_2px_12px_rgba(0,0,0,0.12)] transition-[transform,opacity,background-color,box-shadow] duration-200 ease-punch hover:-translate-y-0.5 hover:bg-hearth-deep hover:shadow-[0_6px_20px_rgba(225,202,166,0.22)] active:-translate-y-[1px]"
                          : "animate-glass-entry group relative flex w-full items-center gap-3 rounded-[0.5rem] border border-winter/[0.08] bg-winter/[0.14] p-[12px] text-left shadow-[0_2px_12px_rgba(0,0,0,0.08)] backdrop-blur-md transition-[transform,opacity,background-color,border-color,box-shadow] duration-200 ease-punch hover:-translate-y-0.5 hover:bg-winter/[0.2] hover:shadow-[0_6px_18px_rgba(30,9,18,0.16)] active:-translate-y-[1px]"
                      }
                    >
                      {/* 좌측 아이콘 박스 */}
                      <div
                        className={
                          isPrimary
                            ? "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border border-crow/20 bg-crow/85 transition-transform duration-200 ease-punch group-hover:scale-105"
                            : "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border border-winter/10 bg-cedar/35 transition-transform duration-200 ease-punch group-hover:scale-105"
                        }
                      >
                        <LinkIcon iconType={link.iconType} />
                      </div>

                      {/* 중앙 텍스트 영역 */}
                      <div className="relative z-10 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`truncate text-[0.875rem] font-semibold ${isPrimary ? "text-crow" : "text-winter"}`}
                          >
                            {link.title}
                          </span>
                          {link.badge && (
                            <Badge
                              variant={
                                link.badge === "NEW" ? "pink" : "purple"
                              }
                            >
                              {link.badge}
                            </Badge>
                          )}
                        </div>
                        {link.subtitle && (
                          <p
                            className={`mt-0.5 truncate text-[0.75rem] font-normal ${isPrimary ? "text-crow/75" : "text-winter/85"}`}
                          >
                            {link.subtitle}
                          </p>
                        )}
                      </div>

                      {/* 우측 화살표 아이콘 */}
                      <ArrowRight
                        className={`relative z-10 h-4 w-4 shrink-0 transition-transform duration-200 ease-punch group-hover:translate-x-1 ${isPrimary ? "text-crow/70 group-hover:text-crow" : "text-winter/80 group-hover:text-winter"}`}
                        aria-hidden="true"
                      />
                    </a>
                  );
                })
              ) : (
                /* Empty State (Design.md: Icon-based composition with descriptive text and action button) */
                <div className="flex flex-col items-center justify-center gap-2 rounded-[0.5rem] border border-dashed border-winter/25 bg-winter/8 p-6 text-center">
                  <Link2
                    className="h-6 w-6 text-hearth"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium text-winter/90">
                    등록된 외부 링크가 없습니다.
                  </p>
                  <p className="text-xs text-winter/65">
                    내 링크 관리에서 유튜브, 인스타그램, 외주 문의 링크를 추가해보세요.
                  </p>
                  <Link
                    href="/mypage"
                    className={buttonVariants({ variant: "glass", size: "xs", className: "mt-1" })}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>링크 추가하기</span>
                  </Link>
                </div>
              )}
            </nav>

            {/* 하단 푸터 (Monospace 메타데이터) */}
            <footer className="relative z-10 mt-5 text-center">
              <p className="font-mono text-[0.75rem] font-medium text-winter/65">
                © 2026 Lee Dae-geon
              </p>
            </footer>
          </>
        ) : (
          /* EDIT MODE (프로필·스킬·쇼릴 편집 — PRD 3.1 ~ 3.3, 7.3 / 링크는 /mypage) */
          <ProfileEditor key={resetVersion} />
        )}
      </Card>

    </main>
  );
}
