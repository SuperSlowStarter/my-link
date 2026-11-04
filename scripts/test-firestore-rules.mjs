// Firestore 보안 규칙 테스트 (로그인하지 않은 방문자 시점, Firestore REST API)
// 실행: node scripts/test-firestore-rules.mjs
// - 읽기: 공개 프로필·링크·username은 누구나 → 허용(200 또는 404)
// - 쓰기: 로그인하지 않으면 모두 거부(403)
// - 계정 정보(users/{uid} 문서)는 본인만 → 거부(403)
// 로그인한 본인 쓰기 허용 / 남의 데이터 쓰기 거부는 앱에서 직접 확인한다 (README 참고).
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1)])
);
const PROJECT = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const KEY = env.NEXT_PUBLIC_FIREBASE_API_KEY;
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
const UID = "rules-test-uid";

const field = (value) => ({ stringValue: value });
const cases = [
  // [설명, 메서드, 경로, 본문, 기대 결과("allow" | "deny")]
  ["공개 프로필 읽기 (users/{uid}/profile/main)", "GET", `users/${UID}/profile/main`, null, "allow"],
  ["링크 목록 읽기 (users/{uid}/links)", "GET", `users/${UID}/links`, null, "allow"],
  ["username 조회 (usernames/{username})", "GET", `usernames/no-such-user-xyz`, null, "allow"],
  ["계정 정보 읽기 (users/{uid}) — 본인만", "GET", `users/${UID}`, null, "deny"],
  ["링크 쓰기 (로그인 안 함)", "POST", `users/${UID}/links`, { title: field("hack"), url: field("https://x.y") }, "deny"],
  ["프로필 쓰기 (로그인 안 함)", "PATCH", `users/${UID}/profile/main`, { username: field("hacker"), displayName: field("h"), bio: field("") }, "deny"],
  ["username 차지 (로그인 안 함)", "PATCH", `usernames/rules-test-name`, { uid: field(UID) }, "deny"],
  ["공용 링크 쓰기 (users/anonymous/links)", "POST", `users/anonymous/links`, { title: field("x"), url: field("https://x.y") }, "deny"],
];

// displayName 중복 확인 쿼리 (컬렉션 그룹 profile, where displayName ==) — 인덱스·규칙이 있어야 200
{
  const response = await fetch(`${BASE}:runQuery?key=${KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "profile", allDescendants: true }],
        where: { fieldFilter: { field: { fieldPath: "displayName" }, op: "EQUAL", value: { stringValue: "중복 확인 테스트" } } },
        limit: 5,
      },
    }),
  });
  cases.push(["__query__", response.status]);
}

let failed = 0;
for (const [label, method, path, fields, expected] of cases) {
  if (label === "__query__") {
    const pass = method === 200;
    if (!pass) failed += 1;
    console.log(`${pass ? "PASS" : "FAIL"}  [허용 기대 → ${method}]  displayName 중복 확인 쿼리 (collectionGroup profile)`);
    continue;
  }
  const response = await fetch(`${BASE}/${path}?key=${KEY}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: fields ? JSON.stringify({ fields }) : undefined,
  });
  // 읽기 허용이면 200(있음) 또는 404(없음), 거부면 403
  const actual = response.status === 403 ? "deny" : response.status < 500 && response.status !== 401 ? "allow" : "error";
  const pass = actual === expected;
  if (!pass) failed += 1;
  console.log(`${pass ? "PASS" : "FAIL"}  [${expected === "allow" ? "허용" : "거부"} 기대 → ${response.status}]  ${label}`);
}
console.log(failed ? `\n${failed}개 실패` : "\n모든 테스트 통과");
process.exit(failed ? 1 : 0);
