import { z } from "zod";
import type { LinkIconType } from "@/data/links";
import { RESERVED_USERNAMES, USERNAME_MAX, USERNAME_MIN, USERNAME_PATTERN } from "@/lib/username";

/**
 * 입력 유효성 검사 스키마 (Zod + React Hook Form)
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
/** 프로필 인라인 수정 (username · displayName · bio) */
export const profileBasicsSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(USERNAME_MIN, `username은 ${USERNAME_MIN}자 이상이에요.`)
    .max(USERNAME_MAX, `username은 ${USERNAME_MAX}자 이내예요.`)
    .regex(USERNAME_PATTERN, "영문 소문자·숫자·_·-만 쓸 수 있고, 처음과 끝은 영문이나 숫자여야 해요.")
    .refine((value) => !RESERVED_USERNAMES.has(value), "사이트에서 쓰는 이름이라 사용할 수 없어요."),
  displayName: z
    .string()
    .trim()
    .min(1, "표시 이름을 입력해주세요.")
    .max(30, "표시 이름은 30자 이내로 입력해주세요."),
  bio: z.string().trim().max(200, "소개글은 200자 이내로 입력해주세요."),
});
export type ProfileBasicsValues = z.infer<typeof profileBasicsSchema>;
