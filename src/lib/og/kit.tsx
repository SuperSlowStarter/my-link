/**
 * OG 이미지 공용 부품 (next/og ImageResponse = Satori 렌더링)
 * - Satori는 Tailwind className·backdrop-filter·blur를 모른다 → 인라인 style, 유리 질감은 반투명 채움 + 얇은 테두리 + 안쪽 하이라이트로 흉내
 * - 색은 globals.css의 ColorPallete 토큰과 같은 값 (Crow · Cedar · Winter · Diplomatic · Hearth · Wharf)
 * - 한국어 글리프가 기본 글꼴에 없어서 Noto Sans KR을 Google Fonts에서 "쓰는 글자만" 받아 온다 (text= 서브셋)
 */
import type { ReactNode } from "react";

export const OG_SIZE = { width: 1200, height: 630 };

export const C = {
  crow: "#1e0912",
  cedar: "#2b2034",
  winter: "#f5ecd1",
  diplomatic: "#37435f",
  hearth: "#e1caa6",
  wharf: "#74838a",
};

/** winter/hearth를 알파값과 함께 */
export const winterA = (a: number) => `rgba(245,236,209,${a})`;
export const hearthA = (a: number) => `rgba(225,202,166,${a})`;

/* ------------------------------------------------------------------ */
/* 글꼴                                                                */
/* ------------------------------------------------------------------ */
type FontWeight = 400 | 500 | 700 | 800;
type OgFont = { name: string; data: ArrayBuffer; weight: FontWeight; style: "normal" };

/** Google Fonts CSS → TTF 주소를 찾아 받는다 (브라우저 UA를 안 보내면 truetype을 준다) */
async function loadGoogleFont(family: string, weight: FontWeight, text: string): Promise<ArrayBuffer | null> {
  try {
    const query = `family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(`https://fonts.googleapis.com/css2?${query}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    const response = await fetch(url);
    return response.ok ? await response.arrayBuffer() : null;
  } catch {
    return null;
  }
}

/**
 * 이미지에 들어가는 글자만 담은 글꼴 묶음.
 * 받기에 실패한 굵기는 빠진다 (그래도 이미지는 만들어진다 — 한국어만 기본 글꼴로 대체)
 */
export async function loadOgFonts(text: string): Promise<OgFont[]> {
  const chars = Array.from(new Set(Array.from(text + "0123456789@·/…"))).join("");
  const plan: { name: string; family: string; weight: FontWeight }[] = [
    { name: "Noto Sans KR", family: "Noto Sans KR", weight: 500 },
    { name: "Noto Sans KR", family: "Noto Sans KR", weight: 700 },
    { name: "Noto Sans KR", family: "Noto Sans KR", weight: 800 },
    { name: "Geist Mono", family: "Geist Mono", weight: 500 },
  ];
  const loaded = await Promise.all(plan.map((font) => loadGoogleFont(font.family, font.weight, chars)));
  return plan.flatMap((font, index) => {
    const data = loaded[index];
    return data ? [{ name: font.name, data, weight: font.weight, style: "normal" as const }] : [];
  });
}

export const SANS = "Noto Sans KR";
export const MONO = "Geist Mono";

/* ------------------------------------------------------------------ */
/* 배경: Crow 바탕 + 고정 광원 (AmbientBackground와 같은 위치·색)          */
/* ------------------------------------------------------------------ */
/** 광원 위치·색은 AmbientBackground(소개 페이지 배경)와 같은 자리: 왼쪽 위 Diplomatic, 오른쪽 위 Cedar, 오른쪽 아래 Wharf, 왼쪽 아래 Hearth */
const AMBIENT_SVG = (() => {
  const { width: w, height: h } = OG_SIZE;
  const glow = (id: string, cx: number, cy: number, r: number, rgb: string, a: number) =>
    `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse">` +
    `<stop offset="0" stop-color="rgb(${rgb})" stop-opacity="${a}"/>` +
    `<stop offset="0.45" stop-color="rgb(${rgb})" stop-opacity="${a * 0.45}"/>` +
    `<stop offset="1" stop-color="rgb(${rgb})" stop-opacity="0"/></radialGradient>`;
  const defs = [
    glow("d", 150, 40, 620, "55,67,95", 0.95),
    glow("c", 1080, 60, 560, "74,54,92", 0.9),
    glow("w", 900, 700, 520, "116,131,138", 0.36),
    glow("h", 120, 680, 480, "225,202,166", 0.2),
    `<radialGradient id="v" cx="${w / 2}" cy="${h / 2}" r="${w * 0.62}" gradientUnits="userSpaceOnUse">` +
      `<stop offset="0.6" stop-color="rgb(30,9,18)" stop-opacity="0"/><stop offset="1" stop-color="rgb(30,9,18)" stop-opacity="0.6"/></radialGradient>`,
  ].join("");
  const rects = ["d", "c", "w", "h", "v"].map((id) => `<rect width="${w}" height="${h}" fill="url(#${id})"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs>${defs}</defs>${rects}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
})();

export function OgFrame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: C.crow,
        fontFamily: SANS,
        color: C.winter,
        wordBreak: "keep-all",
        overflow: "hidden",
      }}
    >
      {/* 광원: SVG 방사형 그라디언트 한 장 (Satori의 CSS radial-gradient는 상자 경계가 드러나서 resvg가 그리는 SVG로) */}
      {/* eslint-disable-next-line @next/next/no-img-element -- Satori는 <img>만 그린다 */}
      <img src={AMBIENT_SVG} width={OG_SIZE.width} height={OG_SIZE.height} style={{ position: "absolute", left: 0, top: 0 }} alt="" />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 로고 (사이트 헤더와 같은 Hearth 사각형 + 링크 아이콘)                     */
/* ------------------------------------------------------------------ */
export function OgLogo({ scale = 1 }: { scale?: number }) {
  const box = 48 * scale;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 * scale }}>
      <div
        style={{
          width: box,
          height: box,
          borderRadius: 13 * scale,
          backgroundColor: C.hearth,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 8px 24px ${hearthA(0.25)}`,
        }}
      >
        <Icon type="link" size={26 * scale} color={C.crow} strokeWidth={2.4} />
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 28 * scale, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.1 }}>MyLink</span>
        <span style={{ fontFamily: MONO, fontSize: 13 * scale, letterSpacing: 2, color: winterA(0.5), marginTop: 2 }}>
          MOTION LINK HUB
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 아이콘                                                              */
/* ------------------------------------------------------------------ */
const ICON_PATHS: Record<string, string> = {
  play: `<path d="M6 3l14 9-14 9z"/>`,
  youtube: `<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3v6Z"/>`,
  instagram: `<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>`,
  mail: `<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>`,
  film: `<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18M3 7.5h4M3 12h18M3 16.5h4M17 3v18M17 7.5h4M17 16.5h4"/>`,
  globe: `<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>`,
  sparkles: `<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.13-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.13a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.13 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0z"/>`,
  link: `<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/>`,
  user: `<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>`,
};

/**
 * lucide 아이콘 (링크 iconType과 같은 이름).
 * 인라인 <svg>는 회전된 카드 안에서 Satori가 위쪽을 잘라 버려서, SVG 문자열을 data URL <img>로 그린다.
 */
export function Icon({
  type,
  size,
  color,
  strokeWidth = 2,
}: {
  type: string;
  size: number;
  color: string;
  strokeWidth?: number;
}) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" ` +
    `stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">` +
    `${ICON_PATHS[type] ?? ICON_PATHS.link}</svg>`;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Satori는 <img>만 그린다
    <img src={`data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`} width={size} height={size} alt="" />
  );
}

/* ------------------------------------------------------------------ */
/* 유리 카드 (소개 페이지의 떠 있는 미리보기 카드와 같은 구성)               */
/* ------------------------------------------------------------------ */
export interface OgLinkRow {
  title: string;
  subtitle: string;
  iconType: string;
  badge?: string;
  variant: "primary" | "glass";
}

export function OgGlassCard({
  avatar,
  name,
  bio,
  header,
  links,
  emptyText = "곧 링크가 채워져요",
}: {
  /** 소개용 카드: 아바타·이름·소개 / 프로필용 카드: 생략하고 header만 (왼쪽과 겹치지 않게) */
  avatar?: ReactNode;
  name?: string;
  bio?: string;
  header?: ReactNode;
  links: OgLinkRow[];
  emptyText?: string;
}) {
  return (
    <div style={{ display: "flex", position: "relative", width: 400 }}>
      {/* 뒤쪽 유리판: 깊이감 (소개 페이지 rotate(-6deg)와 같은 방향)
          앞 카드는 회전하지 않는다 — Satori가 회전된 상자 안의 아이콘 이미지를 위쪽부터 잘라 버림 */}
      <div
        style={{
          position: "absolute",
          left: 26,
          right: 26,
          top: -22,
          bottom: 10,
          borderRadius: 26,
          backgroundColor: "rgba(55,67,95,0.45)",
          border: `1px solid ${winterA(0.08)}`,
          transform: "rotate(-6deg)",
          display: "flex",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          padding: "30px 26px 26px",
          borderRadius: 26,
          backgroundImage: "linear-gradient(160deg, rgba(116,131,138,0.42) 0%, rgba(55,67,95,0.5) 45%, rgba(43,32,52,0.78) 100%)",
          border: `1px solid ${winterA(0.14)}`,
          boxShadow: `0 24px 48px rgba(12,3,7,0.4), inset 0 1px 0 ${winterA(0.18)}`,
        }}
      >
        {header}
        {avatar}
        {name ? <span style={{ marginTop: 14, fontSize: 24, fontWeight: 700, letterSpacing: -0.4, maxWidth: 340 }}>{name}</span> : null}
        {bio ? (
          <span
            style={{
              marginTop: 8,
              fontSize: 14,
              lineHeight: 1.5,
              color: winterA(0.68),
              textAlign: "center",
              maxWidth: 290,
              lineClamp: 2,
              display: "block",
            }}
          >
            {bio}
          </span>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", marginTop: avatar || name ? 22 : 0 }}>
          {links.length > 0 ? (
            links.map((link, index) => <OgRow key={index} link={link} />)
          ) : (
            <div
              style={{
                display: "flex",
                height: 56,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                border: `1px dashed ${winterA(0.2)}`,
                color: winterA(0.5),
                fontSize: 15,
              }}
            >
              {emptyText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OgRow({ link }: { link: OgLinkRow }) {
  const primary = link.variant === "primary";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        borderRadius: 12,
        backgroundColor: primary ? C.hearth : winterA(0.1),
        color: primary ? C.crow : C.winter,
        boxShadow: primary ? `0 10px 24px ${hearthA(0.22)}` : `inset 0 1px 0 ${winterA(0.06)}`,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: primary ? "rgba(30,9,18,0.85)" : "rgba(43,32,52,0.55)",
        }}
      >
        <Icon type={link.iconType} size={18} color={C.hearth} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 700, maxWidth: 230, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
            {link.title}
          </span>
          {link.badge ? (
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: 1,
                padding: "2px 6px",
                borderRadius: 4,
                backgroundColor: C.diplomatic,
                color: C.winter,
              }}
            >
              {link.badge.toUpperCase()}
            </span>
          ) : null}
        </div>
        {link.subtitle ? (
          <span
            style={{
              fontSize: 12,
              marginTop: 2,
              color: primary ? "rgba(30,9,18,0.65)" : winterA(0.58),
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              maxWidth: 270,
            }}
          >
            {link.subtitle}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** 사진이 없을 때·받기 실패했을 때: 이니셜 원 (Hearth → Diplomatic 그라디언트 테두리) */
export function OgAvatar({ src, fallback, size = 84 }: { src?: string | null; fallback: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        padding: 3,
        display: "flex",
        backgroundImage: `linear-gradient(135deg, ${hearthA(0.7)} 0%, rgba(55,67,95,0.8) 55%, ${C.cedar} 100%)`,
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- Satori는 <img>만 그린다
        <img src={src} width={size - 6} height={size - 6} style={{ borderRadius: size, objectFit: "cover" }} alt="" />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: size,
            backgroundColor: C.cedar,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: C.hearth,
            fontSize: size * 0.42,
            fontWeight: 800,
          }}
        >
          {fallback ? fallback : <Icon type="user" size={size * 0.42} color={winterA(0.7)} />}
        </div>
      )}
    </div>
  );
}

/** 프로필 사진을 data URL로 미리 받아 둔다 (Satori가 직접 받다가 실패하면 이미지 전체가 깨지므로) */
export async function fetchImageAsDataUrl(url: string, timeoutMs = 3000): Promise<string | null> {
  if (!/^https:\/\//.test(url)) return null;
  try {
    // Google 프로필 사진은 기본 96px → 256px로 받아 선명하게
    const sized = url.replace(/=s\d+(-c)?$/, "=s256-c");
    const response = await fetch(sized, { signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) return null;
    const type = response.headers.get("content-type") ?? "image/jpeg";
    if (!/^image\/(png|jpe?g|gif)/.test(type)) return null; // Satori가 그리는 형식만 (webp 불가)
    const base64 = Buffer.from(await response.arrayBuffer()).toString("base64");
    return `data:${type};base64,${base64}`;
  } catch {
    return null;
  }
}

/** 글자 수 기준으로 자르기 (Satori 줄 수 제한 보조) */
export const clip = (text: string, max: number) => {
  const chars = Array.from(text.trim());
  return chars.length > max ? `${chars.slice(0, max - 1).join("")}…` : chars.join("");
};
