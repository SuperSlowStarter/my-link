"use client";

import type { ReactNode } from "react";
import { ArrowRight, Film } from "lucide-react";
import type { UserProfile } from "@/lib/profile-repository";
import type { StoredLink } from "@/lib/links-repository";
import { Badge } from "@/components/ui/badge";
import { LinkIcon } from "@/components/link-icon";
import { ShowreelBlock } from "@/components/showreel-block";
import { UserAvatar } from "@/components/user-avatar";

/**
 * 프로필 카드 내용 (보기 전용) — 내 링크 페이지와 공개 페이지(/{username})가 함께 쓴다.
 * 상단: 프로필(사진·이름·@username·직무·소개·스킬) / 하단: 쇼릴 + 링크 리스트(버튼 형태)
 */
export function ProfileCardView({
  profile,
  links,
  linksLoading = false,
  emptyLinks,
}: {
  profile: UserProfile;
  links: StoredLink[];
  linksLoading?: boolean;
  /** 링크가 하나도 없을 때 보여줄 내용 */
  emptyLinks?: ReactNode;
}) {
  return (
    <>
      {/* 프로필 아바타 (120px 원형 Glass 프레임) — Google 프로필 사진, 없으면 사람 아이콘 */}
      <div className="relative z-10 rounded-full bg-gradient-to-br from-winter/25 via-winter/12 to-winter/5 p-1 shadow-[0_6px_20px_rgba(0,0,0,0.18)] backdrop-blur-md">
        <UserAvatar
          photoURL={profile.photoURL}
          size={112}
          alt={profile.displayName}
          className="border-winter/15 bg-cedar/70"
        />
      </div>

      {/* 이름 (Design.md: 2.25rem, weight 700, tight tracking) */}
      <h1 className="relative z-10 mt-3.5 text-[2.25rem] leading-tight font-bold tracking-tight text-winter drop-shadow-[0_2px_8px_rgba(30,9,18,0.3)]">
        {profile.displayName}
      </h1>
      <p className="relative z-10 mt-0.5 font-mono text-[12px] text-winter/50">@{profile.username}</p>

      {/* 직무 타이틀 */}
      {profile.role && (
        <p className="relative z-10 mt-2 flex items-center justify-center gap-1.5 text-[0.75rem] font-medium tracking-wider text-hearth uppercase drop-shadow-[0_1px_2px_rgba(30,9,18,0.4)]">
          <Film className="h-3.5 w-3.5 text-hearth" aria-hidden="true" />
          <span>{profile.role}</span>
        </p>
      )}

      {/* 소개글 (멀티라인 줄바꿈 지원) */}
      {profile.bio && (
        <p className="relative z-10 mt-2.5 max-w-[72ch] text-[1rem] leading-[1.6] font-normal whitespace-pre-line text-winter/95 drop-shadow-[0_1px_4px_rgba(30,9,18,0.25)]">
          {profile.bio}
        </p>
      )}

      {/* 기술 스택 */}
      {profile.skills.length > 0 && (
        <div aria-label="보유 기술 스택" className="relative z-10 mt-3 flex flex-wrap justify-center gap-1.5">
          {profile.skills.map((skill) => (
            <Badge key={skill} variant="default">
              {skill}
            </Badge>
          ))}
        </div>
      )}

      <div className="relative z-10 my-4 h-px w-full bg-gradient-to-r from-transparent via-winter/18 to-transparent" />

      {/* 대표 쇼릴 + 링크 리스트 */}
      <nav aria-label="포트폴리오 쇼릴 및 소셜 링크 목록" className="relative z-10 flex w-full flex-col gap-2.5">
        <ShowreelBlock showreel={profile.showreel} />

        {linksLoading && links.length === 0 ? (
          <div aria-busy="true" aria-label="링크를 불러오는 중" className="flex flex-col gap-2.5">
            {[0, 1, 2].map((key) => (
              <div key={key} className="h-[61px] w-full animate-pulse rounded-[0.5rem] bg-winter/[0.08]" />
            ))}
          </div>
        ) : links.length > 0 ? (
          links.map((link, index) => <LinkButton key={link.id} link={link} index={index} />)
        ) : (
          emptyLinks ?? null
        )}
      </nav>

      <footer className="relative z-10 mt-5 text-center">
        <p className="font-mono text-[0.75rem] font-medium text-winter/65">© 2026 @{profile.username}</p>
      </footer>
    </>
  );
}

/** 링크 버튼 (80ms 간격으로 차례로 등장) */
function LinkButton({ link, index }: { link: StoredLink; index: number }) {
  const isPrimary = link.variant === "primary";
  const external = link.href.startsWith("http");
  return (
    <a
      href={link.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      style={{ animationDelay: `${(index + 1) * 80}ms` }}
      className={
        isPrimary
          ? "animate-glass-entry group relative flex w-full items-center gap-3 rounded-[0.5rem] border border-crow/10 bg-hearth p-[12px] text-left font-semibold text-crow shadow-[0_2px_12px_rgba(0,0,0,0.12)] transition-[transform,opacity,background-color,box-shadow] duration-200 ease-punch hover:-translate-y-0.5 hover:bg-hearth-deep hover:shadow-[0_6px_20px_rgba(225,202,166,0.22)] active:-translate-y-[1px]"
          : "animate-glass-entry group relative flex w-full items-center gap-3 rounded-[0.5rem] border border-winter/[0.08] bg-winter/[0.14] p-[12px] text-left shadow-[0_2px_12px_rgba(0,0,0,0.08)] backdrop-blur-md transition-[transform,opacity,background-color,border-color,box-shadow] duration-200 ease-punch hover:-translate-y-0.5 hover:bg-winter/[0.2] hover:shadow-[0_6px_18px_rgba(30,9,18,0.16)] active:-translate-y-[1px]"
      }
    >
      <div
        className={
          isPrimary
            ? "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border border-crow/20 bg-crow/85 transition-transform duration-200 ease-punch group-hover:scale-105"
            : "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border border-winter/10 bg-cedar/35 transition-transform duration-200 ease-punch group-hover:scale-105"
        }
      >
        <LinkIcon iconType={link.iconType} />
      </div>
      <div className="relative z-10 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`truncate text-[0.875rem] font-semibold ${isPrimary ? "text-crow" : "text-winter"}`}>
            {link.title}
          </span>
          {link.badge && <Badge variant={link.badge === "NEW" ? "pink" : "purple"}>{link.badge}</Badge>}
        </div>
        {link.subtitle && (
          <p className={`mt-0.5 truncate text-[0.75rem] font-normal ${isPrimary ? "text-crow/75" : "text-winter/85"}`}>
            {link.subtitle}
          </p>
        )}
      </div>
      <ArrowRight
        className={`relative z-10 h-4 w-4 shrink-0 transition-transform duration-200 ease-punch group-hover:translate-x-1 ${
          isPrimary ? "text-crow/70 group-hover:text-crow" : "text-winter/80 group-hover:text-winter"
        }`}
        aria-hidden="true"
      />
    </a>
  );
}
