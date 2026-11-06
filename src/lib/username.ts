/**
 * username 규칙 (공유 URL용: /{username})
 * - 영문 소문자·숫자·밑줄(_)·하이픈(-), 3~20자, 처음과 끝은 영문/숫자
 * - 사이트 경로와 겹치는 단어는 쓸 수 없다
 */
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9_-]{1,18})[a-z0-9]$/;

/** 사이트 경로·시스템 이름과 겹쳐서 쓸 수 없는 username */
export const RESERVED_USERNAMES = new Set([
  "mypage",
  "stats",
  "api",
  "admin",
  "login",
  "logout",
  "signin",
  "signup",
  "settings",
  "account",
  "profile",
  "user",
  "users",
  "u",
  "about",
  "help",
  "support",
  "terms",
  "privacy",
  "static",
  "public",
  "assets",
  "not-found",
  "404",
  "500",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "anonymous",
  "mylink",
]);

export function isValidUsername(value: string): boolean {
  return USERNAME_PATTERN.test(value) && !RESERVED_USERNAMES.has(value);
}

/**
 * 이메일 앞부분으로 기본 username을 만든다.
 * cleangabby@gmail.com → cleangabby, Lee.Dae-Geon@x.com → lee-dae-geon
 * 규칙에 맞지 않으면 보정하고, 너무 짧으면 "-link"를 붙인다.
 */
export function usernameFromEmail(email: string | null | undefined): string {
  const local = (email ?? "").split("@")[0] ?? "";
  let base = local
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .replace(/[-_]{2,}/g, "-")
    .slice(0, USERNAME_MAX);
  base = base.replace(/[-_]+$/g, "");
  // 너무 짧으면 "-link"를 붙인다 (ab → ab-link), 비어 있으면 member
  if (base.length < USERNAME_MIN) base = base ? `${base}-link` : "member";
  if (RESERVED_USERNAMES.has(base)) base = `${base}-me`.slice(0, USERNAME_MAX);
  return base;
}

/** 중복일 때 뒤에 숫자를 붙인 후보 (cleangabby → cleangabby2, cleangabby3 …) */
export function usernameCandidates(base: string, count = 20): string[] {
  const list = [base];
  for (let i = 2; list.length < count; i++) {
    const suffix = String(i);
    list.push(`${base.slice(0, USERNAME_MAX - suffix.length)}${suffix}`);
  }
  return list.filter(isValidUsername);
}
