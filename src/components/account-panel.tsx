"use client";

import { useAuthStore } from "@/store/auth-store";
import { useLinksStore } from "@/store/links-store";
import { UserAvatar } from "@/components/user-avatar";

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/**
 * 계정 정보 패널 — Firestore users/{uid} 문서의 값을 보여준다.
 * (로그인할 때 Google 계정 정보가 이 문서에 기록된다)
 */
export function AccountPanel() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const linkCount = useLinksStore((state) => state.links.length);

  if (!user) return null;

  const name = profile?.displayName || user.displayName || "사용자";
  const rows: [string, string][] = [
    ["이메일", profile?.email || user.email || "-"],
    ["가입일", profile?.createdAtMs ? dateFormat.format(profile.createdAtMs) : "기록 중..."],
    ["마지막 로그인", profile?.lastLoginAtMs ? dateFormat.format(profile.lastLoginAtMs) : "기록 중..."],
    ["내 링크", `${linkCount}개`],
  ];

  return (
    <section
      id="account"
      aria-label="계정 정보"
      className="flex flex-col gap-3 rounded-[0.5rem] border border-winter/[0.08] bg-crow/40 p-3.5"
    >
      <div className="flex items-center gap-3">
        <UserAvatar name={name} photoURL={profile?.photoURL || user.photoURL} size={40} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-winter">@{name}</p>
          <p className="truncate font-mono text-[10px] text-winter/50" title={`users/${user.uid}`}>
            users/{user.uid}
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-winter/50">{label}</dt>
            <dd className="truncate text-winter/85">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
