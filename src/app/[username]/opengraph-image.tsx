import { ImageResponse } from "next/og";
import { getPublicProfileSummary, resolvePublicSlug, safeDecode } from "@/lib/public-profile-server";
import {
  C,
  MONO,
  OG_SIZE,
  OgAvatar,
  OgFrame,
  OgGlassCard,
  OgLogo,
  clip,
  fetchImageAsDataUrl,
  hearthA,
  loadOgFonts,
  winterA,
} from "@/lib/og/kit";
import { renderGeneralOgImage } from "@/lib/og/general";

/**
 * 동적 경로 OG 이미지 — /{username} 또는 /{displayName} 을 공유하면 그 사람의 카드가 보인다.
 * 1. 페이지와 같은 규칙으로 slug → uid (lib/public-profile-server.ts)
 * 2. users/{uid}/profile/main + links 앞쪽 3개를 읽는다
 * 3. 왼쪽: 프로필 사진·이름·@아이디·소개 / 오른쪽: 메인 카드 순서 그대로의 링크 미리보기
 * 찾지 못하면 일반 OG 이미지를 대신 쓴다.
 */
export const alt = "MyLink 프로필 — 이름, 소개, 대표 링크 미리보기";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username: raw } = await params;

  const found = await resolvePublicSlug(raw).catch(() => null);
  const profile = found ? await getPublicProfileSummary(found.uid).catch(() => null) : null;
  if (!found || !profile) return renderGeneralOgImage();

  const handle = profile.username || found.handle || safeDecode(raw);
  const name = clip(profile.displayName || handle, 24);
  const bio = clip(profile.bio, 78);
  const initial = Array.from(name)[0]?.toUpperCase() ?? "";
  const linkLabel = profile.linkCount > 0 ? `링크 ${profile.linkCount}개` : "링크 준비 중";

  const [photo, fonts] = await Promise.all([
    profile.photoURL ? fetchImageAsDataUrl(profile.photoURL) : Promise.resolve(null),
    loadOgFonts(
      [
        name,
        handle,
        bio,
        linkLabel,
        "MyLink MOTION LINK HUB LINKS more 곧 링크가 채워져요",
        ...profile.links.flatMap((link) => [link.title, link.subtitle, link.badge.toUpperCase()]),
      ].join(" ")
    ),
  ]);

  // 이름 길이에 따라 글자 크기 (한 줄 유지)
  const nameLength = Array.from(name).length;
  const nameSize = nameLength <= 6 ? 84 : nameLength <= 10 ? 72 : nameLength <= 16 ? 58 : 46;

  return new ImageResponse(
    (
      <OgFrame>
        <div style={{ display: "flex", width: "100%", height: "100%", padding: "64px 76px", alignItems: "center" }}>
          {/* 왼쪽: 프로필 */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%", justifyContent: "space-between" }}>
            <OgLogo scale={0.9} />

            <div style={{ display: "flex", flexDirection: "column" }}>
              <OgAvatar src={photo} fallback={initial} size={112} />
              <span
                style={{
                  marginTop: 26,
                  fontSize: nameSize,
                  fontWeight: 800,
                  letterSpacing: -2,
                  lineHeight: 1.08,
                  maxWidth: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {name}
              </span>
              <span
                style={{
                  marginTop: 12,
                  fontFamily: MONO,
                  fontSize: 26,
                  letterSpacing: 0.5,
                  backgroundImage: `linear-gradient(90deg, ${C.hearth} 0%, ${C.winter} 100%)`,
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {`@${handle}`}
              </span>
              {bio ? (
                <span
                  style={{
                    marginTop: 20,
                    fontSize: 23,
                    lineHeight: 1.55,
                    fontWeight: 500,
                    color: winterA(0.7),
                    maxWidth: 560,
                    lineClamp: 2,
                    display: "block",
                  }}
                >
                  {bio}
                </span>
              ) : null}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 16px",
                  borderRadius: 999,
                  fontSize: 17,
                  fontWeight: 700,
                  color: C.crow,
                  backgroundColor: C.hearth,
                  boxShadow: `0 8px 22px ${hearthA(0.25)}`,
                }}
              >
                {linkLabel}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 16, color: winterA(0.45), letterSpacing: 0.5 }}>{`/${handle}`}</span>
            </div>
          </div>

          {/* 오른쪽: 대표 링크 미리보기 (메인 카드와 같은 순서·강조) */}
          <div style={{ display: "flex", marginLeft: 40, marginRight: 8 }}>
            <OgGlassCard
              header={
                <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", marginBottom: 16, padding: "0 4px" }}>
                  <span style={{ fontFamily: MONO, fontSize: 13, letterSpacing: 2.5, color: C.hearth }}>LINKS</span>
                  <span style={{ fontFamily: MONO, fontSize: 13, color: winterA(0.45) }}>
                    {profile.linkCount > profile.links.length ? `+${profile.linkCount - profile.links.length} more` : `${profile.linkCount}`}
                  </span>
                </div>
              }
              links={profile.links}
              emptyText="곧 링크가 채워져요"
            />
          </div>
        </div>
      </OgFrame>
    ),
    { ...size, fonts }
  );
}
