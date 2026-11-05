"use client";

import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "@base-ui/react/menu";
import { toast } from "sonner";
import { Copy, ExternalLink, House, ListPlus, LogOut, Settings2, UserRound } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useMyLinks } from "@/hooks/use-links";
import { useMyProfile } from "@/hooks/use-profile";
import { UserAvatar } from "@/components/user-avatar";

const joinedFormat = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

/** 드롭다운 항목 공통 스타일 (키보드·마우스로 강조되면 data-highlighted) */
const ITEM =
  "group/item flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-[8px] px-2.5 text-left text-[13px] text-winter/85 outline-none select-none transition-colors duration-150 ease-punch data-[highlighted]:bg-winter/[0.09] data-[highlighted]:text-winter";

/** 클립보드 복사 (Clipboard API가 막힌 환경은 textarea 방식으로 대신한다) */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      textarea.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** 내 공개 페이지 주소(/{username}) 복사 → Sonner 알림 */
async function copyMyLinkAddress(username: string) {
  const url = `${window.location.origin}/${username}`;
  if (await copyText(url)) {
    toast.success("링크 주소를 복사했어요", { description: url });
  } else {
    toast.error("링크 주소를 복사하지 못했어요", {
      description: "브라우저의 클립보드 권한을 확인해주세요.",
    });
  }
}

const SEPARATOR = "my-1.5 h-px bg-gradient-to-r from-transparent via-winter/15 to-transparent";

function ItemIcon({ icon: Icon, tone = "default" }: { icon: ComponentType<{ className?: string }>; tone?: "default" | "danger" }) {
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] transition-colors duration-150 ease-punch ${
        tone === "danger"
          ? "bg-danger/10 text-danger group-data-[highlighted]/item:bg-danger/20"
          : "bg-winter/[0.06] text-winter/70 group-data-[highlighted]/item:bg-hearth/20 group-data-[highlighted]/item:text-hearth"
      }`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
    </span>
  );
}

function NavItem({
  href,
  icon,
  children,
  trailing,
  external = false,
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
  trailing?: ReactNode;
  external?: boolean;
}) {
  return (
    <Menu.LinkItem
      className={ITEM}
      render={
        external ? (
          <a href={href} target="_blank" rel="noopener noreferrer" />
        ) : (
          <Link href={href} />
        )
      }
    >
      <ItemIcon icon={icon} />
      <span className="flex-1 truncate">{children}</span>
      {trailing}
    </Menu.LinkItem>
  );
}

/**
 * 헤더 우측 프로필 메뉴 (로그인 상태)
 * - 트리거: 원형 프로필 사진 버튼
 * - 드롭다운: 계정 요약(users/{uid}) → 링크 주소 복사 → 바로가기 → Google 계정 관리 → 로그아웃
 * - Base UI Menu: 키보드 이동(↑↓), Esc·바깥 클릭으로 닫기, 포커스 복귀를 기본 제공
 */
export function ProfileMenu() {
  const user = useAuthStore((state) => state.user);
  const pending = useAuthStore((state) => state.pending);
  const signOut = useAuthStore((state) => state.signOut);
  const router = useRouter();

  // 로그아웃하면 소개 페이지(/)로 이동
  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };
  const myLinks = useMyLinks();
  const linkCount = myLinks.status === "ready" ? myLinks.links.length : null;
  // 공개 프로필 (users/{uid}/profile/main): username·displayName·사진·가입일
  const { profile: publicProfile } = useMyProfile();

  if (!user) return null;

  // 화면에는 Firestore users/{uid} 문서 값을 우선 보여주고, 아직 없으면 Auth 값으로 채운다
  const username = publicProfile?.username ?? "";
  const name = publicProfile?.displayName || user.displayName || "사용자";
  const email = user.email;
  const photoURL = publicProfile?.photoURL || user.photoURL;

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`계정 메뉴 열기 (${username ? `@${username}` : name})`}
        className="group relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full p-0.5 outline-none ring-1 ring-winter/20 transition-[box-shadow,transform] duration-200 ease-punch hover:ring-hearth/60 focus-visible:ring-2 focus-visible:ring-hearth data-[popup-open]:ring-2 data-[popup-open]:ring-hearth active:scale-95"
      >
        <UserAvatar photoURL={photoURL} size={32} />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={10} className="z-[150] outline-none">
          <Menu.Popup className="w-[264px] origin-[var(--transform-origin)] rounded-[14px] bg-popover p-1.5 text-winter shadow-[0_18px_48px_rgba(12,3,7,0.6),inset_0_1px_1px_rgba(245,236,209,0.1),inset_0_0_18px_rgba(245,236,209,0.04)] backdrop-blur-xl backdrop-saturate-150 outline-none transition-[opacity,transform] duration-200 ease-swoosh data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:-translate-y-1 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            {/* 1. 계정 요약 */}
            <div className="flex items-center gap-3 px-2.5 pt-2 pb-2.5">
              <UserAvatar photoURL={photoURL} size={40} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-winter">{name}</p>
                <p className="truncate font-mono text-[11px] text-winter/55">{username ? `@${username}` : email}</p>
              </div>
            </div>
            <div className="mx-2.5 mb-1 flex items-center gap-2 font-mono text-[10px] text-winter/45">
              <span>링크 {linkCount ?? "-"}개</span>
              {publicProfile?.createdAtMs && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>가입 {joinedFormat.format(publicProfile.createdAtMs)}</span>
                </>
              )}
            </div>

            {/* 공유: 내 마이링크 주소 복사 (복사되면 Sonner 알림) */}
            <Menu.Item className={ITEM} disabled={!username} onClick={() => void copyMyLinkAddress(username)}>
              <ItemIcon icon={Copy} />
              <span className="flex-1">링크 주소 복사</span>
              <span className="max-w-[96px] truncate font-mono text-[10px] text-winter/35">/{username}</span>
            </Menu.Item>

            <Menu.Separator className={SEPARATOR} />

            {/* 2. 바로가기 */}
            <Menu.Group>
              <Menu.GroupLabel className="px-2.5 pt-1 pb-1 text-[10px] font-medium tracking-wider text-winter/40 uppercase">
                바로가기
              </Menu.GroupLabel>
              <NavItem href="/" icon={House}>
                홈
              </NavItem>
              <NavItem
                href="/mypage"
                icon={ListPlus}
                trailing={
                  linkCount !== null ? (
                    <span className="rounded-[4px] bg-hearth/15 px-1.5 py-0.5 font-mono text-[10px] text-hearth">
                      {linkCount}
                    </span>
                  ) : null
                }
              >
                내 링크 관리
              </NavItem>
              {username && (
                <NavItem href={`/${username}`} icon={ExternalLink}>
                  내 공개 페이지
                </NavItem>
              )}
              <NavItem href="/mypage#profile" icon={UserRound}>
                프로필 수정
              </NavItem>
            </Menu.Group>

            <Menu.Separator className={SEPARATOR} />

            {/* 3. 외부: Google 계정 관리 (사진·이름 변경) */}
            <NavItem
              href="https://myaccount.google.com/"
              icon={Settings2}
              external
              trailing={<ExternalLink className="h-3 w-3 text-winter/40" aria-hidden="true" />}
            >
              Google 계정 관리
            </NavItem>

            <Menu.Separator className={SEPARATOR} />

            {/* 4. 로그아웃 */}
            <Menu.Item
              className={`${ITEM} text-danger/90 data-[highlighted]:bg-danger/10 data-[highlighted]:text-danger`}
              disabled={pending}
              onClick={() => void handleSignOut()}
            >
              <ItemIcon icon={LogOut} tone="danger" />
              <span className="flex-1">로그아웃</span>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
