"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AtSign, Check, Copy, ExternalLink, Loader2, Save } from "lucide-react";
import { profileBasicsSchema, type ProfileBasicsValues } from "@/lib/schemas";
import type { UserProfile } from "@/lib/profile-repository";
import { useAuthStore } from "@/store/auth-store";
import { useProfileStore } from "@/store/profile-store";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";

const joinedFormat = new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" });

/**
 * 마이페이지 상단 프로필 수정 (username · displayName · bio + 저장)
 * - 현재 값을 채워서 보여주고, 저장하면 users/{uid}/profile/main에 기록한다.
 * - username은 저장 전에 중복을 확인하고(트랜잭션), 중복이면 입력 칸 아래에 오류를 띄운다.
 * - displayName도 바꿀 때 다른 사용자와 같은지 조회하고, 같으면 오류를 띄우고 저장을 중단한다.
 * - 저장되면 Sonner 알림.
 */
export function ProfileForm({ profile }: { profile: UserProfile }) {
  const email = useAuthStore((state) => state.user?.email ?? "");
  const saveBasics = useProfileStore((state) => state.saveBasics);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileBasicsValues>({
    resolver: zodResolver(profileBasicsSchema),
    mode: "onChange",
    defaultValues: {
      username: profile.username,
      displayName: profile.displayName,
      bio: profile.bio,
    },
  });

  const username = useWatch({ control, name: "username" }) ?? "";
  const bio = useWatch({ control, name: "bio" }) ?? "";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const host = typeof window !== "undefined" ? window.location.host : "";
  const savedUrl = `${origin}/${profile.username}`;

  const onSubmit = async (values: ProfileBasicsValues) => {
    const result = await saveBasics(values);
    if (!result.ok) {
      if (result.field) {
        // 중복이면 해당 칸 아래에 오류를 띄우고 저장을 중단한다
        setError(result.field, { type: "taken", message: result.message }, { shouldFocus: true });
      } else {
        toast.error("프로필을 저장하지 못했어요", { description: result.message });
      }
      return;
    }
    reset(values);
    toast.success("프로필을 저장했어요", { description: `${origin}/${values.username}` });
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(savedUrl);
      setCopied(true);
      toast.success("링크 주소를 복사했어요", { description: savedUrl });
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("링크 주소를 복사하지 못했어요");
    }
  };

  return (
    <section
      id="profile"
      aria-labelledby="profile-form-title"
      className="scroll-mt-20 rounded-[0.75rem] bg-crow/40 p-4 shadow-[inset_0_1px_1px_rgba(245,236,209,0.06)]"
    >
      {/* 머리: 사진 + 계정 정보 */}
      <div className="flex items-center gap-3">
        <UserAvatar photoURL={profile.photoURL} size={44} alt={profile.displayName} />
        <div className="min-w-0 flex-1">
          <h2 id="profile-form-title" className="text-sm font-semibold text-winter">
            프로필 수정
          </h2>
          <p className="truncate text-[11px] text-winter/50">
            {email}
            {profile.createdAtMs ? ` · ${joinedFormat.format(profile.createdAtMs)} 가입` : ""}
          </p>
        </div>
      </div>

      {/* 내 공개 페이지 주소 */}
      <div className="mt-3 flex items-center gap-2 rounded-[8px] bg-winter/[0.06] py-1.5 pr-1.5 pl-3">
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-winter/70" title={savedUrl}>
          {host}/<span className="text-hearth">{profile.username}</span>
        </span>
        <a
          href={`/${profile.username}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="공개 페이지 새 탭에서 보기"
          className="inline-flex size-7 items-center justify-center rounded-[6px] text-winter/70 transition-colors hover:bg-winter/10 hover:text-winter"
        >
          <ExternalLink className="size-3.5" />
        </a>
        <button
          type="button"
          onClick={() => void copyUrl()}
          aria-label="공개 페이지 주소 복사"
          className="inline-flex size-7 cursor-pointer items-center justify-center rounded-[6px] text-winter/70 transition-colors hover:bg-winter/10 hover:text-winter"
        >
          {copied ? <Check className="size-3.5 text-hearth" /> : <Copy className="size-3.5" />}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 flex flex-col gap-3">
        {/* username (공유 URL용) */}
        <div>
          <Label htmlFor="profile-username" className="mb-1.5">
            username <span className="text-winter/45">(공유 URL)</span>
          </Label>
          <div className="relative">
            <AtSign
              className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-winter/45"
              aria-hidden="true"
            />
            <Input
              id="profile-username"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              className="pl-8 font-mono"
              aria-invalid={errors.username ? true : undefined}
              aria-describedby="profile-username-help"
              {...register("username")}
            />
          </div>
          {errors.username ? (
            <FieldError message={errors.username.message} />
          ) : (
            <p id="profile-username-help" className="mt-1 text-[11px] text-winter/45">
              {host}/<span className="text-winter/70">{username || "username"}</span> · 영문 소문자·숫자·_·- 3~20자
            </p>
          )}
        </div>

        {/* displayName (표시 이름) */}
        <div>
          <Label htmlFor="profile-display-name" className="mb-1.5">
            표시 이름 <span className="text-winter/45">(displayName)</span>
          </Label>
          <Input
            id="profile-display-name"
            autoComplete="name"
            aria-invalid={errors.displayName ? true : undefined}
            {...register("displayName")}
          />
          <FieldError message={errors.displayName?.message} />
        </div>

        {/* bio (소개글) */}
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <Label htmlFor="profile-bio">
              소개글 <span className="text-winter/45">(bio)</span>
            </Label>
            <span className={`font-mono text-[10px] ${bio.length > 200 ? "text-danger" : "text-winter/40"}`}>
              {bio.length}/200
            </span>
          </div>
          <Textarea
            id="profile-bio"
            rows={3}
            placeholder="움직임으로 이야기를 전하는 모션그래픽 디자이너입니다."
            aria-invalid={errors.bio ? true : undefined}
            {...register("bio")}
          />
          <FieldError message={errors.bio?.message} />
        </div>

        <div className="mt-1 flex items-center justify-end gap-2">
          {isDirty && !isSubmitting && (
            <button
              type="button"
              onClick={() => reset()}
              className="cursor-pointer px-2 text-[12px] text-winter/55 transition-colors hover:text-winter"
            >
              되돌리기
            </button>
          )}
          <Button type="submit" variant="primary" size="sm" disabled={!isDirty || isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{isSubmitting ? "저장 중..." : "저장"}</span>
          </Button>
        </div>
      </form>
    </section>
  );
}
