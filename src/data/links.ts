export type LinkIconType =
  | "play"
  | "youtube"
  | "instagram"
  | "mail"
  | "film"
  | "globe"
  | "link"
  | "sparkles";

export interface LinkItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  iconType: LinkIconType;
  badge?: string;
  variant: "primary" | "glass";
}

export interface ShowreelConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  youtubeUrl: string;
  badge?: string;
}

export interface ProfileData {
  name: string;
  role: string;
  bio: string;
  avatarText: string;
  avatarImageUrl?: string;
  fpsBadge: string;
  skills: string[];
  showreel: ShowreelConfig;
  links: LinkItem[];
}

export const STORAGE_KEY = "mylink_state_v1";

export const LINK_ICON_OPTIONS: {
  value: LinkIconType;
  label: string;
  accentColor: string;
}[] = [
  { value: "play", label: "Play (쇼릴/영상)", accentColor: "#F5ECD1" },
  { value: "youtube", label: "YouTube (유튜브)", accentColor: "#E1CAA6" },
  { value: "instagram", label: "Instagram (인스타그램)", accentColor: "#F5ECD1" },
  { value: "film", label: "Film (포트폴리오/아카이브)", accentColor: "#E1CAA6" },
  { value: "sparkles", label: "Sparkles (클래스/하이라이트)", accentColor: "#E1CAA6" },
  { value: "globe", label: "Globe (웹사이트/스토어)", accentColor: "#74838A" },
  { value: "link", label: "Link (일반 외부 링크)", accentColor: "#E1CAA6" },
  { value: "mail", label: "Mail (이메일/외주 문의)", accentColor: "#74838A" },
];

export const DEFAULT_SKILLS: string[] = [
  "After Effects",
  "Blender",
  "3ds Max",
  "Photoshop",
  "Illustrator",
  "Premiere Pro",
];

export const DEFAULT_SHOWREEL: ShowreelConfig = {
  enabled: true,
  title: "2026 Motion Showreel",
  subtitle: "2D · Fake 3D · Kinetic Typography 대표 작업물",
  youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  badge: "FEATURED",
};

/**
 * 모션그래픽 디자이너 '이대건' 페르소나 기반 링크 목록 더미(시드) 데이터
 */
export const DUMMY_LINKS: LinkItem[] = [
  {
    id: "link-youtube-channel",
    title: "YouTube Channel",
    subtitle: "모션그래픽 개인작 & 작업 과정(Making Film)",
    href: "https://www.youtube.com",
    iconType: "youtube",
    variant: "glass",
  },
  {
    id: "link-coloso-class",
    title: "Coloso 모션그래픽 클래스",
    subtitle: "AE & Blender 실무 2D/Fake 3D 결합 워크플로우 강의",
    href: "https://coloso.co.kr",
    iconType: "sparkles",
    badge: "NEW",
    variant: "glass",
  },
  {
    id: "link-behance-archive",
    title: "Behance Portfolio Archive",
    subtitle: "브랜드 캠페인 · 타이틀 시퀀스 프로젝트 전체 보기",
    href: "https://www.behance.net",
    iconType: "film",
    variant: "glass",
  },
  {
    id: "link-instagram-lab",
    title: "Instagram",
    subtitle: "짧은 모션 실험실 & 60FPS 아트워크 노트",
    href: "https://www.instagram.com",
    iconType: "instagram",
    variant: "glass",
  },
  {
    id: "link-preset-store",
    title: "Motion Asset & Preset Store",
    subtitle: "애프터이펙트 텐션 커브 프리셋 & 프로젝트 파일",
    href: "https://gumroad.com",
    iconType: "globe",
    variant: "glass",
  },
  {
    id: "link-contact-mail",
    title: "프로젝트 및 외주 문의",
    subtitle: "cleangabby@gmail.com · 상업 영상 & 브랜드 필름 의뢰",
    href: "mailto:cleangabby@gmail.com",
    iconType: "mail",
    variant: "glass",
  },
];

export const DEFAULT_PROFILE_DATA: ProfileData = {
  name: "이대건",
  role: "Motion Graphic Designer",
  bio: "움직임으로 이야기를 전하는 모션그래픽 디자이너입니다.\n브랜드의 메시지를 감각적인 영상으로 만듭니다.",
  avatarText: "이",
  avatarImageUrl: "",
  fpsBadge: "60FPS",
  skills: DEFAULT_SKILLS,
  showreel: DEFAULT_SHOWREEL,
  links: DUMMY_LINKS,
};

/**
 * YouTube URL에서 11자리 비디오 ID를 추출합니다.
 */
export function extractYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  // 11자리 ID 자체만 입력한 경우
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp =
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);
  return match ? match[1] : null;
}

