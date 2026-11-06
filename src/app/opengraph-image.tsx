import { GENERAL_OG_ALT, renderGeneralOgImage } from "@/lib/og/general";
import { OG_SIZE } from "@/lib/og/kit";

/**
 * 일반 경로 OG 이미지 — / · /mypage · /stats 등 동적 경로가 아닌 모든 페이지가 이 이미지를 물려받는다.
 * (파일 기반 메타데이터: 루트 세그먼트의 opengraph-image는 하위 세그먼트에 상속, /[username]은 자기 것으로 덮어씀)
 */
export const alt = GENERAL_OG_ALT;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderGeneralOgImage();
}
