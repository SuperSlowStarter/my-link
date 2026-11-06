import { ImageResponse } from "next/og";
import { C, OG_SIZE, OgAvatar, OgFrame, OgGlassCard, OgLogo, hearthA, loadOgFonts, winterA } from "@/lib/og/kit";

/**
 * 일반 OG 이미지 렌더러 — app/opengraph-image.tsx(일반 경로)와
 * app/[username]/opengraph-image.tsx(프로필을 못 찾았을 때)가 같이 쓴다.
 * 구성: 소개 페이지 첫 화면과 같은 제목·문구 + 떠 있는 미리보기 카드
 */
export const GENERAL_OG_ALT = "MyLink — 움직이는 작업을, 한 장의 링크로. 모션 디자이너를 위한 링크 허브";

const SAMPLE_LINKS = [
  { title: "Vimeo 포트폴리오", subtitle: "2D · 3D · Kinetic", iconType: "play", badge: "Featured", variant: "primary" as const },
  { title: "YouTube", subtitle: "작업 과정 브이로그", iconType: "youtube", variant: "glass" as const },
  { title: "외주 문의", subtitle: "hello@example.com", iconType: "mail", variant: "glass" as const },
];

const HEADLINE_1 = "움직이는 작업을,";
const HEADLINE_2 = "한 장의 링크로.";
const LEAD = "포트폴리오, 유튜브, 인스타그램, 외주 문의까지 흩어진 채널을 유리처럼 맑은 카드 한 장에.";
const TAGS = ["Google 계정으로 시작", "계정별 자동 저장", "모바일에서도 그대로"];

export async function renderGeneralOgImage() {
  const fonts = await loadOgFonts(
    [HEADLINE_1, HEADLINE_2, LEAD, ...TAGS, "MyLink MOTION LINK HUB @yourname 움직이는 것을 만듭니다. 외주·협업 문의 환영해요.",
      ...SAMPLE_LINKS.flatMap((link) => [link.title, link.subtitle, link.badge ?? ""]).map((s) => s.toUpperCase() + s)].join(" ")
  );

  return new ImageResponse(
    (
      <OgFrame>
        <div style={{ display: "flex", width: "100%", height: "100%", padding: "64px 76px", alignItems: "center" }}>
          {/* 왼쪽: 소개 */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%", justifyContent: "space-between" }}>
            <OgLogo />

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 76, fontWeight: 800, letterSpacing: -2.5, lineHeight: 1.08 }}>{HEADLINE_1}</span>
              <span
                style={{
                  fontSize: 76,
                  fontWeight: 800,
                  letterSpacing: -2.5,
                  lineHeight: 1.12,
                  backgroundImage: `linear-gradient(90deg, ${C.winter} 0%, ${C.hearth} 55%, ${C.hearth} 100%)`,
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {HEADLINE_2}
              </span>
              <span style={{ marginTop: 24, fontSize: 23, lineHeight: 1.6, color: winterA(0.68), maxWidth: 560, fontWeight: 500 }}>
                {LEAD}
              </span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {TAGS.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                    borderRadius: 999,
                    fontSize: 16,
                    fontWeight: 500,
                    color: winterA(0.72),
                    backgroundColor: winterA(0.07),
                    border: `1px solid ${winterA(0.08)}`,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: 6, backgroundColor: hearthA(0.8), display: "flex" }} />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 오른쪽: 떠 있는 미리보기 카드 */}
          <div style={{ display: "flex", marginLeft: 40, marginRight: 8 }}>
            <OgGlassCard
              avatar={<OgAvatar fallback="" />}
              name="@yourname"
              bio="움직이는 것을 만듭니다. 외주·협업 문의 환영해요."
              links={SAMPLE_LINKS}
            />
          </div>
        </div>
      </OgFrame>
    ),
    { ...OG_SIZE, fonts }
  );
}
