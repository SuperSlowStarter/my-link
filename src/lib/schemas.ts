import { z } from "zod";
import { extractYoutubeVideoId, type LinkIconType } from "@/data/links";

/**
 * 편집 모드 유효성 검사 스키마 (Zod + React Hook Form)
 * 에러 문구는 화면에 그대로 노출되므로 한국어로 작성한다.
 */

const ICON_TYPES = [
  "play",
  "youtube",
  "instagram",
  "mail",
  "film",
  "globe",
  "link",
  "sparkles",
] as const satisfies readonly LinkIconType[];

/** http(s):// 주소 */
const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

/** mailto:이메일 주소 */
const isMailto = (value: string) =>
  /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/** 링크 이동 주소: http(s) 또는 mailto */
export const hrefSchema = z
  .string()
  .trim()
  .min(1, "주소를 입력해주세요.")
  .refine(
    (value) => isHttpUrl(value) || isMailto(value),
    "https://로 시작하는 주소나 mailto:이메일 형식으로 입력해주세요."
  );

/** 비워도 되는 이미지 URL */
const optionalImageUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || isHttpUrl(value),
    "이미지 주소는 https://로 시작해야 해요. 비워두면 이니셜이 표시돼요."
  );

/* ------------------------------------------------------------------ */
/* 링크 (메인 허브 링크 추가·수정 모달)                                  */
/* ------------------------------------------------------------------ */
export const linkFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "링크 제목을 입력해주세요.")
    .max(40, "링크 제목은 40자 이내로 입력해주세요."),
  subtitle: z.string().trim().max(60, "부제목은 60자 이내로 입력해주세요."),
  href: hrefSchema,
  iconType: z.enum(ICON_TYPES),
  badge: z.string().trim().max(10, "배지는 10자 이내로 입력해주세요."),
  variant: z.enum(["primary", "glass"]),
});
export type LinkFormValues = z.infer<typeof linkFormSchema>;

/* ------------------------------------------------------------------ */
/* /mypage 빠른 링크 추가 (7주차: 제목 + 주소)                          */
/* ------------------------------------------------------------------ */
export const quickLinkSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "제목을 입력해주세요.")
    .max(40, "제목은 40자 이내로 입력해주세요."),
  href: hrefSchema,
});
export type QuickLinkValues = z.infer<typeof quickLinkSchema>;

/* ------------------------------------------------------------------ */
/* 프로필 기본 정보                                                     */
/* ------------------------------------------------------------------ */
export const profileInfoSchema = z.object({
  avatarImageUrl: optionalImageUrlSchema,
  avatarText: z
    .string()
    .trim()
    .min(1, "이니셜을 입력해주세요.")
    .max(2, "이니셜은 2자 이내예요."),
  fpsBadge: z.string().trim().max(10, "배지는 10자 이내로 입력해주세요."),
  name: z
    .string()
    .trim()
    .min(1, "이름을 입력해주세요.")
    .max(20, "이름은 20자 이내로 입력해주세요."),
  role: z
    .string()
    .trim()
    .min(1, "직무 타이틀을 입력해주세요.")
    .max(40, "직무 타이틀은 40자 이내로 입력해주세요."),
  bio: z.string().trim().max(200, "소개글은 200자 이내로 입력해주세요."),
});
export type ProfileInfoValues = z.infer<typeof profileInfoSchema>;

/* ------------------------------------------------------------------ */
/* 대표 쇼릴                                                            */
/* ------------------------------------------------------------------ */
export const showreelSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "쇼릴 제목을 입력해주세요.")
    .max(40, "쇼릴 제목은 40자 이내로 입력해주세요."),
  badge: z.string().trim().max(10, "배지는 10자 이내로 입력해주세요."),
  subtitle: z.string().trim().max(60, "부제목은 60자 이내로 입력해주세요."),
  youtubeUrl: z
    .string()
    .trim()
    .min(1, "YouTube 주소를 입력해주세요.")
    .refine(
      (value) => extractYoutubeVideoId(value) !== null,
      "유효한 YouTube 주소가 아니에요. (예: https://youtu.be/영상ID)"
    ),
});
export type ShowreelValues = z.infer<typeof showreelSchema>;

/* ------------------------------------------------------------------ */
/* 기술 스택 태그 (중복 검사는 현재 목록이 필요해 함수로 만든다)          */
/* ------------------------------------------------------------------ */
export const makeSkillSchema = (existing: string[]) =>
  z.object({
    skill: z
      .string()
      .trim()
      .min(1, "추가할 스킬을 입력해주세요.")
      .max(20, "스킬 태그는 20자 이내로 입력해주세요.")
      .refine(
        (value) =>
          !existing.some((skill) => skill.toLowerCase() === value.toLowerCase()),
        "이미 등록된 스킬이에요."
      ),
  });
export type SkillValues = { skill: string };
