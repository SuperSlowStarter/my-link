"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Link2, Pencil, UserRound } from "lucide-react";
import { describeFirestoreError, sortByOrder, subscribeLinks, type StoredLink } from "@/lib/links-repository";
import { subscribeProfile, type UserProfile } from "@/lib/profile-repository";
import { useRimLight } from "@/lib/use-rim-light";
import { useAuthStore } from "@/store/auth-store";
import { AmbientBackground } from "@/components/ambient-background";
import { NotFoundView } from "@/components/not-found-view";
import { ProfileCardView } from "@/components/profile-view";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const CARD =
  "animate-glass-entry w-full items-center p-[20px] text-center md:w-[80%] md:max-w-[480px] md:p-[28px] lg:w-[400px] lg:max-w-[400px]";

/** 서버에서 username을 찾는 동안 보여주는 자리 */
export function PublicProfileSkeleton() {
  return (
    <>
      <AmbientBackground />
      <SiteHeader />
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        <Card className={CARD}>
          <div aria-busy="true" aria-label="페이지를 불러오는 중" className="flex w-full flex-col items-center gap-3 py-6">
            <div className="h-[120px] w-[120px] animate-pulse rounded-full bg-winter/[0.08]" />
            <div className="h-8 w-40 animate-pulse rounded-[6px] bg-winter/[0.08]" />
            <div className="h-4 w-24 animate-pulse rounded-[6px] bg-winter/[0.06]" />
            <div className="mt-4 flex w-full flex-col gap-2.5">
              {[0, 1, 2].map((key) => (
                <div key={key} className="h-[61px] w-full animate-pulse rounded-[0.5rem] bg-winter/[0.08]" />
              ))}
            </div>
          </div>
        </Card>
      </main>
    </>
  );
}

/**
 * 공개 개인 페이지 본문 — 로그인 없이 누구나 볼 수 있다.
 * 상단: 프로필 카드(이름·소개글) / 하단: 링크 리스트(버튼 형태)
 * users/{uid}/profile/main 과 users/{uid}/links 를 실시간 구독한다.
 */
export function PublicProfilePage({ uid, username }: { uid: string; username: string }) {
  useRimLight();

  const viewerUid = useAuthStore((state) => state.user?.uid ?? null);
  const isOwner = viewerUid === uid;

  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);
  const [links, setLinks] = useState<StoredLink[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stopProfile = subscribeProfile(uid, setProfile, (err) => setError(describeFirestoreError(err)));
    const stopLinks = subscribeLinks(uid, setLinks, (err) => setError(describeFirestoreError(err)));
    return () => {
      stopProfile();
      stopLinks();
    };
  }, [uid]);

  const orderedLinks = useMemo(() => (links ? sortByOrder(links) : []), [links]);

  // username은 있는데 프로필 문서가 없으면 (삭제된 계정 등) 404와 같은 화면
  if (profile === null) return <NotFoundView username={username} />;

  return (
    <>
      <AmbientBackground />
      {profile && <title>{`${profile.displayName} (@${profile.username}) | MyLink`}</title>}
      <SiteHeader
        actions={
          isOwner ? (
            <Link href="/" className={buttonVariants({ variant: "glass", size: "sm" })}>
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">내 페이지 편집</span>
            </Link>
          ) : null
        }
      />

      <main className="relative flex flex-1 flex-col items-center justify-center overflow-x-hidden px-6 py-12">
        {isOwner && (
          <p className="animate-glass-entry relative z-10 mb-4 rounded-full bg-hearth/15 px-3 py-1 text-[11px] text-hearth">
            방문자에게 보이는 내 공개 페이지예요
          </p>
        )}

        <Card className={CARD}>
          {error ? (
            <p role="alert" className="relative z-10 py-8 text-sm text-danger">
              {error}
            </p>
          ) : !profile ? (
            <div aria-busy="true" className="flex w-full flex-col items-center gap-3 py-6">
              <div className="h-[120px] w-[120px] animate-pulse rounded-full bg-winter/[0.08]" />
              <div className="h-8 w-40 animate-pulse rounded-[6px] bg-winter/[0.08]" />
            </div>
          ) : (
            <ProfileCardView
              profile={profile}
              links={orderedLinks}
              linksLoading={links === null}
              emptyLinks={
                <div className="flex flex-col items-center gap-2 rounded-[0.5rem] border border-dashed border-winter/20 bg-winter/[0.05] p-6 text-center">
                  <Link2 className="h-6 w-6 text-hearth/70" aria-hidden="true" />
                  <p className="text-sm text-winter/70">아직 등록된 링크가 없어요.</p>
                </div>
              }
            />
          )}
        </Card>

        {!isOwner && (
          <Link
            href="/"
            className="relative z-10 mt-6 inline-flex items-center gap-1.5 text-[12px] text-winter/45 transition-colors hover:text-winter/80"
          >
            <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
            나도 MyLink 만들기
          </Link>
        )}
      </main>
    </>
  );
}
