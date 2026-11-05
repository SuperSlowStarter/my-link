"use client";

import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import type { UserProfile } from "@/lib/profile-repository";
import type { StoredLink } from "@/lib/links-repository";
import { profileBasicsSchema } from "@/lib/schemas";
import { useSaveProfileBasics } from "@/hooks/use-profile";
import { useLinkClick } from "@/hooks/use-links";
import { Badge } from "@/components/ui/badge";
import { InlineEditableText } from "@/components/inline-edit";
import { LinkIcon } from "@/components/link-icon";
import { UserAvatar } from "@/components/user-avatar";

/**
 * 프로필 카드 내용 — 내 링크 페이지와 공개 페이지(/{username})가 함께 쓴다.
 * 상단: 프로필(사진·이름·@username·소개) / 하단: 링크 리스트(버튼 형태)
 * editable이면(내 링크 페이지) 이름·@username·소개를 그 자리에서 고칠 수 있다 (인라인 수정).
 * 클릭 통계(13주차): 공개 페이지에서 링크를 누르면 클릭 수 +1 (로그인 안 한 방문자 포함).
 *   본인 관리 화면(editable = 내 링크 페이지)에서 누른 건 세지 않는다 — 주인이 누른 클릭이 섞이면 통계가 객관적이지 않다.
 *   클릭 수(0 포함)는 본인 카드에서만 보이고, 공개 페이지에서는 숨긴다.
 */
export function ProfileCardView({
  profile,
  links,
  linksLoading = false,
  emptyLinks,
  editable = false,
}: {
  profile: UserProfile;
  links: StoredLink[];
  linksLoading?: boolean;
  /** 링크가 하나도 없을 때 보여줄 내용 */
  emptyLinks?: ReactNode;
  /** 본인 카드: 이름·username·소개 인라인 수정 */
  editable?: boolean;
}) {
  // 링크 주인(profile.uid)의 users/{uid}/links/{linkId}.clickCount +1
  const countClick = useLinkClick(profile.uid);

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

      {editable ? (
        <EditableProfileText profile={profile} />
      ) : (
        <>
          {/* 이름 (Design.md: 2.25rem, weight 700, tight tracking) */}
          <h1 className={NAME_CLASS}>{profile.displayName}</h1>
          <p className={USERNAME_CLASS}>@{profile.username}</p>
          {/* 소개글 (멀티라인 줄바꿈 지원) */}
          {profile.bio && <p className={BIO_CLASS}>{profile.bio}</p>}
        </>
      )}

      <div className="relative z-10 my-4 h-px w-full bg-gradient-to-r from-transparent via-winter/18 to-transparent" />

      {/* 링크 리스트 */}
      <nav aria-label="소셜·포트폴리오 링크 목록" className="relative z-10 flex w-full flex-col gap-2.5">
        {linksLoading && links.length === 0 ? (
          <div aria-busy="true" aria-label="링크를 불러오는 중" className="flex flex-col gap-2.5">
            {[0, 1, 2].map((key) => (
              <div key={key} className="h-[61px] w-full animate-pulse rounded-[0.5rem] bg-winter/[0.08]" />
            ))}
          </div>
        ) : links.length > 0 ? (
          links.map((link, index) => (
            <LinkButton
              key={link.id}
              link={link}
              index={index}
              showCount={editable}
              onClick={editable ? undefined : () => countClick(link.id)}
            />
          ))
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

const NAME_CLASS =
  "relative z-10 mt-3.5 text-[2.25rem] leading-tight font-bold tracking-tight text-winter drop-shadow-[0_2px_8px_rgba(30,9,18,0.3)]";
const USERNAME_CLASS = "relative z-10 mt-0.5 font-mono text-[12px] text-winter/50";
const BIO_CLASS =
  "relative z-10 mt-2.5 max-w-[72ch] text-[1rem] leading-[1.6] font-normal break-keep whitespace-pre-line text-winter/95 drop-shadow-[0_1px_4px_rgba(30,9,18,0.25)]";

type BasicsField = "displayName" | "username" | "bio";

/**
 * 본인 카드의 이름·@username·소개 (인라인 수정)
 * 필드 하나를 고쳐도 저장은 세 값을 함께 보낸다 (saveProfileBasics — username·displayName 중복 확인 포함).
 */
function EditableProfileText({ profile }: { profile: UserProfile }) {
  const { save } = useSaveProfileBasics();

  const saveField = (field: BasicsField) => async (next: string) => {
    // 이 필드만 Zod로 검사
    const checked = profileBasicsSchema.shape[field].safeParse(next);
    if (!checked.success) return checked.error.issues[0]?.message ?? "입력값을 확인해주세요.";
    const result = await save({
      username: profile.username,
      displayName: profile.displayName,
      bio: profile.bio,
      [field]: checked.data,
    });
    if (!result.ok) return result.message;
    toast.success(
      field === "username" ? "username을 바꿨어요" : field === "displayName" ? "표시 이름을 바꿨어요" : "소개글을 저장했어요",
      field === "username" ? { description: `공개 주소: /${checked.data}` } : undefined
    );
    return null;
  };

  return (
    <div className="relative z-10 flex w-full flex-col items-center">
      <h1 className="mt-3.5 w-full text-center">
        <InlineEditableText
          label="표시 이름"
          value={profile.displayName}
          maxLength={30}
          placeholder="표시 이름"
          onSave={saveField("displayName")}
          className="text-[2.25rem] leading-tight font-bold tracking-tight text-winter drop-shadow-[0_2px_8px_rgba(30,9,18,0.3)]"
          inputClassName="text-center text-[1.5rem] font-bold tracking-tight"
        />
      </h1>
      <div className="mt-0.5 w-full text-center">
        <InlineEditableText
          label="username"
          value={profile.username}
          prefix="@"
          maxLength={20}
          placeholder="username"
          normalize={(raw) => raw.toLowerCase().replace(/\s/g, "")}
          onSave={saveField("username")}
          className="font-mono text-[12px] text-winter/50"
          inputClassName="font-mono text-[13px]"
        >
          @{profile.username}
        </InlineEditableText>
      </div>
      <div className="mt-2.5 w-full text-center">
        <InlineEditableText
          label="소개글"
          value={profile.bio}
          multiline
          maxLength={200}
          placeholder="나를 소개하는 한두 줄을 적어보세요"
          emptyText="소개글 추가하기"
          onSave={saveField("bio")}
          className="max-w-[72ch] text-[1rem] leading-[1.6] font-normal break-keep whitespace-pre-line text-winter/95 drop-shadow-[0_1px_4px_rgba(30,9,18,0.25)]"
          inputClassName="text-[0.9375rem] leading-[1.6] break-keep"
        />
      </div>
    </div>
  );
}

/** 링크 버튼 (80ms 간격으로 차례로 등장) */
function LinkButton({
  link,
  index,
  showCount,
  onClick,
}: {
  link: StoredLink;
  index: number;
  /** 클릭 수 표시 (본인 카드만) */
  showCount: boolean;
  /** 클릭 수 +1 (공개 페이지만) */
  onClick?: () => void;
}) {
  const isPrimary = link.variant === "primary";
  const external = link.href.startsWith("http");
  return (
    <a
      href={link.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      // 이동은 막지 않는다 (새 탭은 그대로 열림). 클릭 수 저장은 뒤에서 보낸다
      onClick={onClick}
      onAuxClick={(event) => {
        // 마우스 가운데 버튼으로 새 탭에 연 경우도 클릭으로 센다
        if (event.button === 1) onClick?.();
      }}
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
          {showCount && (
            <span
              aria-label={`클릭 ${link.clickCount}회`}
              className={`shrink-0 text-[11px] font-normal tabular-nums ${isPrimary ? "text-crow/55" : "text-winter/50"}`}
            >
              · {link.clickCount.toLocaleString("ko-KR")} 클릭
            </span>
          )}
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
