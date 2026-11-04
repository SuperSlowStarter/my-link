"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  ArrowRight,
  Image as ImageIcon,
  Link2,
  ListPlus,
  Plus,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { extractYoutubeVideoId } from "@/data/links";
import {
  makeSkillSchema,
  profileInfoSchema,
  showreelSchema,
  type ProfileInfoValues,
  type ShowreelValues,
  type SkillValues,
} from "@/lib/schemas";
import { useLinksStore } from "@/store/links-store";
import { useProfileStore } from "@/store/profile-store";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const SECTION =
  "flex flex-col gap-3 rounded-[0.5rem] border border-winter/18 bg-crow/45 p-3.5";

/**
 * 편집 모드 본문 (PRD 3.1 ~ 3.3, 7.3) — 프로필·기술 스택·쇼릴
 * 링크 관리는 /mypage(내 링크 관리)로 모았다 (PRD 3.4, 3.6).
 * - 입력은 React Hook Form이 관리하고 Zod 스키마로 검사한다.
 * - 검사를 통과한 값만 Zustand 스토어에 즉시 저장된다 (실시간 자동 저장).
 * - 통과하지 못한 칸은 아래에 오류 문구가 뜨고, 고칠 때까지 화면의 카드에는 마지막 정상 값이 유지된다.
 */
export function ProfileEditor() {
  return (
    <div className="relative z-10 flex w-full flex-col gap-5 text-left">
      {/* 편집 모드 활성 배너 */}
      <div className="flex items-center justify-between rounded-[0.5rem] border border-hearth/45 bg-hearth/18 px-3 py-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-hearth" aria-hidden="true" />
          <span className="font-mono text-xs font-semibold tracking-wider text-winter uppercase">
            EDIT MODE ACTIVE
          </span>
        </div>
        <span className="text-[11px] text-winter/80">검사 통과 시 자동 저장</span>
      </div>

      <ProfileInfoSection />
      <ShowreelSection />
      <LinksShortcut />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1. 프로필 기본 정보 + 기술 스택                                       */
/* ------------------------------------------------------------------ */
function ProfileInfoSection() {
  const profile = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const {
    register,
    control,
    subscribe,
    formState: { errors },
  } = useForm<ProfileInfoValues>({
    resolver: zodResolver(profileInfoSchema),
    mode: "onChange",
    defaultValues: {
      avatarImageUrl: profile.avatarImageUrl ?? "",
      avatarText: profile.avatarText,
      fpsBadge: profile.fpsBadge,
      name: profile.name,
      role: profile.role,
      bio: profile.bio,
    },
  });

  // 검사를 통과한 값만 스토어에 반영한다
  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: ({ values }) => {
          const result = profileInfoSchema.safeParse(values);
          if (!result.success) return;
          updateProfile((prev) => ({ ...prev, ...result.data }));
        },
      }),
    [subscribe, updateProfile]
  );

  const avatarUrl = useWatch({ control, name: "avatarImageUrl" });
  const avatarText = useWatch({ control, name: "avatarText" });
  const showImage = avatarUrl && !errors.avatarImageUrl && !avatarLoadError;

  return (
    <div className={SECTION}>
      <div className="flex items-start gap-3">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-winter/35 bg-winter/15 text-xl font-bold text-winter">
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={profile.name}
              onError={() => setAvatarLoadError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{avatarText || profile.name.slice(0, 1) || "이"}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Label htmlFor="edit-avatar-url" className="mb-1">
            프로필 이미지 URL (미입력 시 이니셜 표시)
          </Label>
          <div className="relative">
            <Input
              id="edit-avatar-url"
              inputMode="url"
              placeholder="https://... 이미지 주소 입력"
              className="pr-8 text-xs"
              aria-invalid={errors.avatarImageUrl ? true : undefined}
              {...register("avatarImageUrl", {
                onChange: () => setAvatarLoadError(false),
              })}
            />
            <ImageIcon
              className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-winter/45"
              aria-hidden="true"
            />
          </div>
          <FieldError message={errors.avatarImageUrl?.message} />
          {avatarLoadError && !errors.avatarImageUrl && (
            <FieldError message="이미지를 불러오지 못했어요. 주소를 확인해주세요." />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <Label htmlFor="edit-avatar-text" className="mb-1">
            아바타 이니셜
          </Label>
          <Input
            id="edit-avatar-text"
            placeholder="이"
            aria-invalid={errors.avatarText ? true : undefined}
            {...register("avatarText")}
          />
          <FieldError message={errors.avatarText?.message} />
        </div>
        <div>
          <Label htmlFor="edit-fps-badge" className="mb-1">
            포인트 배지
          </Label>
          <Input
            id="edit-fps-badge"
            placeholder="60FPS"
            aria-invalid={errors.fpsBadge ? true : undefined}
            {...register("fpsBadge")}
          />
          <FieldError message={errors.fpsBadge?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="edit-name" className="mb-1">
          이름 (H1) *
        </Label>
        <Input
          id="edit-name"
          placeholder="이대건"
          aria-invalid={errors.name ? true : undefined}
          {...register("name")}
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div>
        <Label htmlFor="edit-role" className="mb-1">
          직무 타이틀 (Label) *
        </Label>
        <Input
          id="edit-role"
          placeholder="Motion Graphic Designer"
          aria-invalid={errors.role ? true : undefined}
          {...register("role")}
        />
        <FieldError message={errors.role?.message} />
      </div>

      <div>
        <Label htmlFor="edit-bio" className="mb-1">
          소개글 (멀티라인 지원)
        </Label>
        <Textarea
          id="edit-bio"
          rows={3}
          placeholder="자기소개 문구를 입력하세요."
          aria-invalid={errors.bio ? true : undefined}
          {...register("bio")}
        />
        <FieldError message={errors.bio?.message} />
      </div>

      <SkillsField />
    </div>
  );
}

function SkillsField() {
  const skills = useProfileStore((state) => state.profile.skills);
  const addSkill = useProfileStore((state) => state.addSkill);
  const removeSkill = useProfileStore((state) => state.removeSkill);

  // 중복 검사를 위해 현재 목록이 바뀔 때마다 스키마를 다시 만든다
  const schema = useMemo(() => makeSkillSchema(skills), [skills]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SkillValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { skill: "" },
  });

  const onSubmit = ({ skill }: SkillValues) => {
    addSkill(skill.trim());
    reset({ skill: "" });
  };

  return (
    <div>
      <Label className="mb-1.5">기술 스택 태그 (Skills)</Label>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <Badge key={skill} variant="default" className="pr-1.5">
            <span>{skill}</span>
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              aria-label={`${skill} 태그 삭제`}
              className="ml-1 inline-flex cursor-pointer items-center justify-center rounded-full p-0.5 text-winter/70 transition-colors hover:bg-winter/20 hover:text-winter"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex gap-1.5">
        <Input
          placeholder="+ 새 스킬 태그 입력 (예: Cinema 4D)"
          className="h-8 text-xs"
          aria-label="새 스킬 태그"
          aria-invalid={errors.skill ? true : undefined}
          {...register("skill")}
        />
        <Button type="submit" variant="glass" size="sm">
          <Plus className="h-3.5 w-3.5" />
          <span>추가</span>
        </Button>
      </form>
      <FieldError message={errors.skill?.message} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. 대표 쇼릴                                                         */
/* ------------------------------------------------------------------ */
function ShowreelSection() {
  const showreel = useProfileStore((state) => state.profile.showreel);
  const updateShowreel = useProfileStore((state) => state.updateShowreel);

  const {
    register,
    control,
    subscribe,
    formState: { errors },
  } = useForm<ShowreelValues>({
    resolver: zodResolver(showreelSchema),
    mode: "onChange",
    defaultValues: {
      title: showreel.title,
      badge: showreel.badge ?? "",
      subtitle: showreel.subtitle,
      youtubeUrl: showreel.youtubeUrl,
    },
  });

  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: ({ values }) => {
          const result = showreelSchema.safeParse(values);
          if (!result.success) return;
          updateShowreel(result.data);
        },
      }),
    [subscribe, updateShowreel]
  );

  const videoId = extractYoutubeVideoId(
    useWatch({ control, name: "youtubeUrl" }) ?? ""
  );

  return (
    <div className={SECTION}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Video className="h-4 w-4 text-hearth" aria-hidden="true" />
          <h2 className="text-xs font-bold tracking-wider text-winter uppercase">
            대표 쇼릴 (Showreel) 설정
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-winter/75">
            {showreel.enabled ? "표시 중" : "숨김"}
          </span>
          <Switch
            checked={showreel.enabled}
            onCheckedChange={(checked) => updateShowreel({ enabled: checked })}
            aria-label="대표 쇼릴 표시 여부 토글"
          />
        </div>
      </div>

      {/* 숨김 상태에서도 폼 값이 유지되도록 언마운트하지 않고 감춘다 */}
      <div className={showreel.enabled ? "flex flex-col gap-3" : "hidden"}>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <Label htmlFor="edit-showreel-title" className="mb-1">
              쇼릴 제목 *
            </Label>
            <Input
              id="edit-showreel-title"
              placeholder="2026 Motion Showreel"
              className="h-8 text-xs"
              aria-invalid={errors.title ? true : undefined}
              {...register("title")}
            />
            <FieldError message={errors.title?.message} />
          </div>
          <div>
            <Label htmlFor="edit-showreel-badge" className="mb-1">
              배지
            </Label>
            <Input
              id="edit-showreel-badge"
              placeholder="FEATURED"
              className="h-8 text-xs"
              aria-invalid={errors.badge ? true : undefined}
              {...register("badge")}
            />
            <FieldError message={errors.badge?.message} />
          </div>
        </div>

        <div>
          <Label htmlFor="edit-showreel-subtitle" className="mb-1">
            쇼릴 부제목
          </Label>
          <Input
            id="edit-showreel-subtitle"
            placeholder="2D · Fake 3D · Kinetic Typography 대표 작업물"
            className="h-8 text-xs"
            aria-invalid={errors.subtitle ? true : undefined}
            {...register("subtitle")}
          />
          <FieldError message={errors.subtitle?.message} />
        </div>

        <div>
          <Label htmlFor="edit-showreel-url" className="mb-1">
            YouTube URL *
          </Label>
          <Input
            id="edit-showreel-url"
            inputMode="url"
            placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."
            className="h-8 text-xs"
            aria-invalid={errors.youtubeUrl ? true : undefined}
            {...register("youtubeUrl")}
          />
          <FieldError message={errors.youtubeUrl?.message} />
        </div>

        {/* 쇼릴 썸네일 실시간 미리보기 */}
        <div className="mt-0.5 overflow-hidden rounded-[6px] border border-winter/15 bg-crow/80 p-2">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-winter/75">
            <span>썸네일 미리보기</span>
            <span className="font-mono text-hearth">
              {videoId ? `ID: ${videoId}` : "URL 확인 필요"}
            </span>
          </div>
          {videoId ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-[4px] border border-winter/15 bg-crow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                alt="Showreel thumbnail preview"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <p className="py-3 text-center text-xs text-winter/55">
              유효한 YouTube 주소를 입력하면 16:9 썸네일이 표시됩니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. 링크 — 관리는 /mypage(내 링크 관리)에서                           */
/* ------------------------------------------------------------------ */
function LinksShortcut() {
  const count = useLinksStore((state) => state.orderedLinks.length);

  return (
    <div className={SECTION}>
      <div className="flex items-center gap-1.5">
        <Link2 className="h-4 w-4 text-wharf" aria-hidden="true" />
        <h2 className="text-xs font-bold tracking-wider text-winter uppercase">
          링크 ({count})
        </h2>
      </div>
      <p className="text-[11px] leading-relaxed text-winter/70">
        링크 추가·수정·삭제와 순서 변경은 <strong className="font-semibold text-winter">내 링크 관리</strong>에서 해요.
        바꾼 내용은 메인 카드에 바로 반영돼요.
      </p>
      <Link
        href="/mypage"
        className={buttonVariants({ variant: "glass", size: "sm", className: "w-full" })}
      >
        <ListPlus className="h-3.5 w-3.5" />
        <span>내 링크 관리로 이동</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
