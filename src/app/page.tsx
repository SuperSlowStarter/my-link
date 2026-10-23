"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type PointerEvent,
} from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  Film,
  Image as ImageIcon,
  Link2,
  Pencil,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Video,
  X,
} from "lucide-react";
import {
  extractYoutubeVideoId,
  type LinkItem,
  type ProfileData,
} from "@/data/links";
import { useProfileStorage } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { LinkFormModal } from "@/components/link-form-modal";
import { LinkIcon } from "@/components/link-icon";
import { ShowreelBlock } from "@/components/showreel-block";

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);
  const ambientOrbRef = useRef<HTMLDivElement>(null);

  const { profile, updateProfile: saveProfileToStore, resetProfile } =
    useProfileStorage();
  const [isEditMode, setIsEditMode] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // 링크 추가/수정 모달 상태
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);

  // 프로필 변경 시 LocalStorage 자동 저장 헬퍼
  const updateProfile = (updater: (prev: ProfileData) => ProfileData) => {
    saveProfileToStore(updater);
    setSaveNotice("LocalStorage 자동 저장됨");
  };

  useEffect(() => {
    if (!saveNotice) return;
    const timer = window.setTimeout(() => setSaveNotice(null), 2000);
    return () => window.clearTimeout(timer);
  }, [saveNotice]);

  // 마우스 커서 반응형 림라이트(.glass-rim) 및 배경 오브 추적
  const handlePointerMove = (e: PointerEvent<HTMLElement>) => {
    const container = mainRef.current;
    if (!container) return;

    if (ambientOrbRef.current) {
      const mainRect = container.getBoundingClientRect();
      const orbX = e.clientX - mainRect.left;
      const orbY = e.clientY - mainRect.top;
      ambientOrbRef.current.style.transform = `translate3d(${orbX - 180}px, ${orbY - 180}px, 0)`;
      ambientOrbRef.current.style.opacity = "0.55";
    }

    const rimElements =
      container.querySelectorAll<HTMLElement>("[data-glass-rim]");
    rimElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--rim-x", `${e.clientX - rect.left}px`);
      el.style.setProperty("--rim-y", `${e.clientY - rect.top}px`);
      el.style.setProperty("--rim-opacity", "1");
    });
  };

  const handlePointerLeave = () => {
    const container = mainRef.current;
    if (!container) return;

    if (ambientOrbRef.current) {
      ambientOrbRef.current.style.opacity = "0";
    }

    const rimElements =
      container.querySelectorAll<HTMLElement>("[data-glass-rim]");
    rimElements.forEach((el) => {
      el.style.setProperty("--rim-opacity", "0");
    });
  };

  // 스킬 태그 추가 / 삭제
  const handleAddSkill = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (profile.skills.includes(trimmed)) {
      setNewSkill("");
      return;
    }
    updateProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, trimmed],
    }));
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    updateProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  // 링크 CRUD 핸들러
  const handleOpenAddLink = () => {
    setEditingLink(null);
    setIsLinkModalOpen(true);
  };

  const handleOpenEditLink = (link: LinkItem) => {
    setEditingLink(link);
    setIsLinkModalOpen(true);
  };

  const handleSaveLink = (linkData: Omit<LinkItem, "id">, id?: string) => {
    if (id) {
      updateProfile((prev) => ({
        ...prev,
        links: prev.links.map((item) =>
          item.id === id ? { ...linkData, id } : item
        ),
      }));
    } else {
      const newItem: LinkItem = {
        ...linkData,
        id: `link-${Date.now()}`,
      };
      updateProfile((prev) => ({
        ...prev,
        links: [...prev.links, newItem],
      }));
    }
  };

  const handleDeleteLink = (id: string) => {
    updateProfile((prev) => ({
      ...prev,
      links: prev.links.filter((item) => item.id !== id),
    }));
  };

  const handleMoveLink = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= profile.links.length) return;
    updateProfile((prev) => {
      const nextLinks = [...prev.links];
      const [moved] = nextLinks.splice(index, 1);
      nextLinks.splice(targetIndex, 0, moved);
      return {
        ...prev,
        links: nextLinks,
      };
    });
  };

  const handleResetToDefault = () => {
    resetProfile();
    setAvatarLoadError(false);
    setSaveNotice("초기 기본값으로 복원됨");
  };

  const showreelVideoId = extractYoutubeVideoId(profile.showreel.youtubeUrl);

  return (
    <main
      ref={mainRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative flex min-h-[100dvh] flex-1 flex-col items-center justify-center overflow-x-hidden bg-[#0D111A] bg-[radial-gradient(at_15%_15%,rgba(255,20,147,0.45)_0px,transparent_55%),radial-gradient(at_85%_20%,rgba(139,0,255,0.48)_0px,transparent_55%),radial-gradient(at_80%_85%,rgba(32,178,170,0.45)_0px,transparent_55%),radial-gradient(at_20%_80%,rgba(0,128,255,0.48)_0px,transparent_55%)] px-6 py-16"
    >
      {/* Design.md 컬러 팔레트 기반 배경 메쉬 광원 레이어 (#0080FF, #8B00FF, #FF1493, #20B2AA) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div
          ref={ambientOrbRef}
          className="absolute top-0 left-0 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,#0080FF_0%,#FF1493_50%,transparent_75%)] opacity-0 blur-3xl transition-opacity duration-300 ease-out will-change-transform"
        />
        <div className="absolute -top-16 -left-16 h-72 w-72 rounded-full bg-[#FF1493]/55 blur-3xl sm:top-12 sm:left-1/4" />
        <div className="absolute -right-12 -bottom-20 h-80 w-80 rounded-full bg-[#0080FF]/55 blur-3xl sm:right-1/4 sm:bottom-12" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-3xl bg-[#8B00FF]/50 blur-2xl" />
        <div className="absolute bottom-1/4 left-1/3 h-48 w-48 rounded-full bg-[#20B2AA]/45 blur-3xl" />
      </div>

      {/* 상단 플로팅 모드 전환 컨트롤 바 (z-index: 100 per Design.md) */}
      <header className="fixed top-4 right-4 z-[100] flex items-center gap-2">
        {saveNotice && (
          <span
            role="status"
            aria-live="polite"
            className="animate-glass-entry rounded-[6px] border border-[#20B2AA]/40 bg-[#0D111A]/85 px-2.5 py-1 font-mono text-[11px] font-medium text-[#20B2AA] shadow-sm backdrop-blur-md"
          >
            {saveNotice}
          </span>
        )}

        {isEditMode ? (
          <>
            <Button
              type="button"
              variant="glass"
              size="sm"
              onClick={handleResetToDefault}
              title="초기 시드 데이터로 복원"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>기본값 복원</span>
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsEditMode(false)}
            >
              <Check className="h-3.5 w-3.5" />
              <span>완료</span>
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="glass"
            size="sm"
            onClick={() => setIsEditMode(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>편집 모드</span>
          </Button>
        )}
      </header>

      {/* 메인 Glassmorphism 프로필 & 링크 허브 카드 (PRD 5.4 반응형 규격) */}
      <Card className="animate-glass-entry w-full items-center p-[20px] text-center md:w-[80%] md:max-w-[480px] md:p-[28px] lg:w-[400px] lg:max-w-[400px]">
        {!isEditMode ? (
          /* =========================================================
             VIEW MODE (방문자 시점)
             ========================================================= */
          <>
            {/* 프로필 아바타 (120px x 120px 원형 Glass 프레임 + 60FPS 배지) */}
            <div
              data-glass-rim=""
              style={
                {
                  "--rim-size": "110px",
                  "--sheen-size": "120px",
                } as CSSProperties
              }
              className="glass-rim relative z-10 flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-full border border-white/12 bg-gradient-to-br from-white/25 via-white/12 to-white/5 text-4xl font-bold text-white shadow-[0_6px_20px_rgba(0,0,0,0.18)] backdrop-blur-md"
            >
              {profile.avatarImageUrl && !avatarLoadError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarImageUrl}
                  alt={profile.name}
                  onError={() => setAvatarLoadError(true)}
                  className="relative z-10 h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="relative z-10 drop-shadow-[0_2px_6px_rgba(13,17,26,0.35)]">
                  {profile.avatarText || profile.name.slice(0, 1) || "이"}
                </span>
              )}

              {profile.fpsBadge && (
                <Badge
                  variant="teal"
                  title="60 FPS Motion Craft"
                  className="absolute -right-1 bottom-1 z-30"
                >
                  {profile.fpsBadge}
                </Badge>
              )}
            </div>

            {/* H1 이름 타이포그래피 (Design.md: 2.25rem, weight 700, tight tracking) */}
            <h1 className="relative z-10 mt-3.5 text-[2.25rem] leading-tight font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(13,17,26,0.3)]">
              {profile.name}
            </h1>

            {/* Label Caps 직무 타이틀 (Design.md: 0.75rem, weight 500, uppercase) */}
            <p className="relative z-10 mt-1 flex items-center justify-center gap-1.5 text-[0.75rem] font-medium tracking-wider text-[#FF1493] uppercase drop-shadow-[0_1px_2px_rgba(13,17,26,0.4)]">
              <Film className="h-3.5 w-3.5 text-[#0080FF]" aria-hidden="true" />
              <span>{profile.role}</span>
            </p>

            {/* Body-md 자기소개 문구 (멀티라인 줄바꿈 지원) */}
            <p className="relative z-10 mt-2.5 max-w-[72ch] text-[1rem] leading-[1.6] font-normal whitespace-pre-line text-white/95 drop-shadow-[0_1px_4px_rgba(13,17,26,0.25)]">
              {profile.bio}
            </p>

            {/* 기술 스택 태그 (Skills) */}
            {profile.skills.length > 0 && (
              <div
                aria-label="보유 기술 스택"
                className="relative z-10 mt-3 flex flex-wrap justify-center gap-1.5"
              >
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="default">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            {/* 구분선 */}
            <div className="relative z-10 my-4 h-px w-full bg-gradient-to-r from-transparent via-white/18 to-transparent" />

            {/* 대표 쇼릴 인라인 재생 블록 + 링크 목록 */}
            <nav
              aria-label="포트폴리오 쇼릴 및 소셜 링크 목록"
              className="relative z-10 flex w-full flex-col gap-2.5"
            >
              {/* 대표 쇼릴 인라인 플레이어 (PRD 3.3, 7.1, 7.2) */}
              <ShowreelBlock showreel={profile.showreel} />

              {/* 외부 링크 리스트 (80ms Staggered Entry Cascade + Cursor Rim Light) */}
              {profile.links.length > 0 ? (
                profile.links.map((link, index) => {
                  const isPrimary = link.variant === "primary";
                  return (
                    <a
                      key={link.id}
                      href={link.href}
                      data-glass-rim=""
                      target={
                        link.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        link.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      style={
                        {
                          animationDelay: `${(index + 1) * 80}ms`,
                          "--rim-size": "160px",
                          "--sheen-size": "180px",
                        } as CSSProperties
                      }
                      className={
                        isPrimary
                          ? "glass-rim animate-glass-entry group relative flex w-full items-center gap-3 rounded-[0.5rem] border border-white/15 bg-[#0080FF] p-[12px] text-left font-semibold text-white shadow-[0_2px_12px_rgba(0,0,0,0.12)] transition-[transform,opacity,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#0073E6] hover:shadow-[0_6px_20px_rgba(0,128,255,0.3)] active:-translate-y-[1px]"
                          : "glass-rim animate-glass-entry group relative flex w-full items-center gap-3 rounded-[0.5rem] border border-white/[0.08] bg-white/[0.14] p-[12px] text-left shadow-[0_2px_12px_rgba(0,0,0,0.08)] backdrop-blur-md transition-[transform,opacity,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/[0.2] hover:shadow-[0_6px_18px_rgba(13,17,26,0.16)] active:-translate-y-[1px]"
                      }
                    >
                      {/* 좌측 아이콘 박스 */}
                      <div
                        className={
                          isPrimary
                            ? "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border border-white/15 bg-[#121723]/25 transition-transform duration-200 ease-out group-hover:scale-105"
                            : "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border border-white/10 bg-[#121723]/35 transition-transform duration-200 ease-out group-hover:scale-105"
                        }
                      >
                        <LinkIcon iconType={link.iconType} />
                      </div>

                      {/* 중앙 텍스트 영역 */}
                      <div className="relative z-10 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[0.875rem] font-semibold text-white">
                            {link.title}
                          </span>
                          {link.badge && (
                            <Badge
                              variant={
                                link.badge === "NEW" ? "pink" : "purple"
                              }
                            >
                              {link.badge}
                            </Badge>
                          )}
                        </div>
                        {link.subtitle && (
                          <p className="mt-0.5 truncate text-[0.75rem] font-normal text-white/85">
                            {link.subtitle}
                          </p>
                        )}
                      </div>

                      {/* 우측 화살표 아이콘 */}
                      <ArrowRight
                        className="relative z-10 h-4 w-4 shrink-0 text-white/80 transition-transform duration-200 ease-out group-hover:translate-x-1 group-hover:text-white"
                        aria-hidden="true"
                      />
                    </a>
                  );
                })
              ) : (
                /* Empty State (Design.md: Icon-based composition with descriptive text and action button) */
                <div className="flex flex-col items-center justify-center gap-2 rounded-[0.5rem] border border-dashed border-white/25 bg-white/8 p-6 text-center">
                  <Link2
                    className="h-6 w-6 text-[#0080FF]"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium text-white/90">
                    등록된 외부 링크가 없습니다.
                  </p>
                  <p className="text-xs text-white/65">
                    편집 모드에서 유튜브, 인스타그램, 외주 문의 링크를 추가해보세요.
                  </p>
                  <Button
                    type="button"
                    variant="glass"
                    size="xs"
                    className="mt-1"
                    onClick={() => setIsEditMode(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>링크 추가하기</span>
                  </Button>
                </div>
              )}
            </nav>

            {/* 하단 푸터 (Monospace 메타데이터) */}
            <footer className="relative z-10 mt-5 text-center">
              <p className="font-mono text-[0.75rem] font-medium text-white/65">
                © 2026 Lee Dae-geon
              </p>
            </footer>
          </>
        ) : (
          /* =========================================================
             EDIT MODE (관리자 실시간 편집 시점 — PRD 3.1 ~ 3.4, 7.3)
             ========================================================= */
          <div className="relative z-10 flex w-full flex-col gap-5 text-left">
            {/* 편집 모드 활성 배너 */}
            <div className="flex items-center justify-between rounded-[0.5rem] border border-[#0080FF]/45 bg-[#0080FF]/18 px-3 py-2">
              <div className="flex items-center gap-2">
                <Sparkles
                  className="h-4 w-4 shrink-0 text-[#0080FF]"
                  aria-hidden="true"
                />
                <span className="font-mono text-xs font-semibold tracking-wider text-white uppercase">
                  EDIT MODE ACTIVE
                </span>
              </div>
              <span className="text-[11px] text-white/80">
                실시간 자동 저장
              </span>
            </div>

            {/* 1. 프로필 기본 정보 & 아바타 편집 */}
            <div className="flex flex-col gap-3 rounded-[0.5rem] border border-white/18 bg-[#0D111A]/45 p-3.5">
              <div className="flex items-center gap-3">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/35 bg-white/15 text-xl font-bold text-white">
                  {profile.avatarImageUrl && !avatarLoadError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatarImageUrl}
                      alt={profile.name}
                      onError={() => setAvatarLoadError(true)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>
                      {profile.avatarText || profile.name.slice(0, 1) || "이"}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Label htmlFor="edit-avatar-url" className="mb-1">
                    프로필 이미지 URL (미입력 시 이니셜 표시)
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit-avatar-url"
                      value={profile.avatarImageUrl ?? ""}
                      onChange={(e) => {
                        setAvatarLoadError(false);
                        updateProfile((prev) => ({
                          ...prev,
                          avatarImageUrl: e.target.value,
                        }));
                      }}
                      placeholder="https://... 이미지 주소 입력"
                      className="pr-8 text-xs"
                    />
                    <ImageIcon
                      className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-white/45"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Label htmlFor="edit-avatar-text" className="mb-1">
                    아바타 이니셜
                  </Label>
                  <Input
                    id="edit-avatar-text"
                    maxLength={2}
                    value={profile.avatarText}
                    onChange={(e) =>
                      updateProfile((prev) => ({
                        ...prev,
                        avatarText: e.target.value,
                      }))
                    }
                    placeholder="이"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-fps-badge" className="mb-1">
                    포인트 배지
                  </Label>
                  <Input
                    id="edit-fps-badge"
                    maxLength={10}
                    value={profile.fpsBadge}
                    onChange={(e) =>
                      updateProfile((prev) => ({
                        ...prev,
                        fpsBadge: e.target.value,
                      }))
                    }
                    placeholder="60FPS"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-name" className="mb-1">
                  이름 (H1)
                </Label>
                <Input
                  id="edit-name"
                  value={profile.name}
                  onChange={(e) =>
                    updateProfile((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="이대건"
                />
              </div>

              <div>
                <Label htmlFor="edit-role" className="mb-1">
                  직무 타이틀 (Label)
                </Label>
                <Input
                  id="edit-role"
                  value={profile.role}
                  onChange={(e) =>
                    updateProfile((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                  placeholder="Motion Graphic Designer"
                />
              </div>

              <div>
                <Label htmlFor="edit-bio" className="mb-1">
                  소개글 (멀티라인 지원)
                </Label>
                <Textarea
                  id="edit-bio"
                  rows={3}
                  value={profile.bio}
                  onChange={(e) =>
                    updateProfile((prev) => ({
                      ...prev,
                      bio: e.target.value,
                    }))
                  }
                  placeholder="자기소개 문구를 입력하세요."
                />
              </div>

              {/* 기술 스택 태그 (Skills) 추가 및 삭제 */}
              <div>
                <Label className="mb-1.5">기술 스택 태그 (Skills)</Label>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {profile.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="default"
                      className="pr-1.5"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        aria-label={`${skill} 태그 삭제`}
                        className="ml-1 inline-flex cursor-pointer items-center justify-center rounded-full p-0.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <form onSubmit={handleAddSkill} className="flex gap-1.5">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="+ 새 스킬 태그 입력 (예: Cinema 4D)"
                    className="h-8 text-xs"
                  />
                  <Button type="submit" variant="glass" size="sm">
                    <Plus className="h-3.5 w-3.5" />
                    <span>추가</span>
                  </Button>
                </form>
              </div>
            </div>

            {/* 2. 대표 쇼릴(Showreel) 설정 섹션 */}
            <div className="flex flex-col gap-3 rounded-[0.5rem] border border-white/18 bg-[#0D111A]/45 p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Video
                    className="h-4 w-4 text-[#0080FF]"
                    aria-hidden="true"
                  />
                  <h2 className="text-xs font-bold tracking-wider text-white uppercase">
                    대표 쇼릴 (Showreel) 설정
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-white/75">
                    {profile.showreel.enabled ? "표시 중" : "숨김"}
                  </span>
                  <Switch
                    checked={profile.showreel.enabled}
                    onCheckedChange={(checked) =>
                      updateProfile((prev) => ({
                        ...prev,
                        showreel: {
                          ...prev.showreel,
                          enabled: checked,
                        },
                      }))
                    }
                    aria-label="대표 쇼릴 표시 여부 토글"
                  />
                </div>
              </div>

              {profile.showreel.enabled && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Label htmlFor="edit-showreel-title" className="mb-1">
                        쇼릴 제목
                      </Label>
                      <Input
                        id="edit-showreel-title"
                        value={profile.showreel.title}
                        onChange={(e) =>
                          updateProfile((prev) => ({
                            ...prev,
                            showreel: {
                              ...prev.showreel,
                              title: e.target.value,
                            },
                          }))
                        }
                        placeholder="2026 Motion Showreel"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-showreel-badge" className="mb-1">
                        배지
                      </Label>
                      <Input
                        id="edit-showreel-badge"
                        value={profile.showreel.badge ?? ""}
                        onChange={(e) =>
                          updateProfile((prev) => ({
                            ...prev,
                            showreel: {
                              ...prev.showreel,
                              badge: e.target.value,
                            },
                          }))
                        }
                        placeholder="FEATURED"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-showreel-subtitle" className="mb-1">
                      쇼릴 부제목
                    </Label>
                    <Input
                      id="edit-showreel-subtitle"
                      value={profile.showreel.subtitle}
                      onChange={(e) =>
                        updateProfile((prev) => ({
                          ...prev,
                          showreel: {
                            ...prev.showreel,
                            subtitle: e.target.value,
                          },
                        }))
                      }
                      placeholder="2D · Fake 3D · Kinetic Typography 대표 작업물"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-showreel-url" className="mb-1">
                      YouTube URL
                    </Label>
                    <Input
                      id="edit-showreel-url"
                      value={profile.showreel.youtubeUrl}
                      onChange={(e) =>
                        updateProfile((prev) => ({
                          ...prev,
                          showreel: {
                            ...prev.showreel,
                            youtubeUrl: e.target.value,
                          },
                        }))
                      }
                      placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."
                      className="h-8 text-xs"
                    />
                  </div>

                  {/* 쇼릴 썸네일 실시간 미리보기 */}
                  <div className="mt-0.5 overflow-hidden rounded-[6px] border border-white/15 bg-[#0D111A]/80 p-2">
                    <div className="mb-1.5 flex items-center justify-between text-[11px] text-white/75">
                      <span>썸네일 미리보기</span>
                      <span className="font-mono text-[#20B2AA]">
                        {showreelVideoId ? `ID: ${showreelVideoId}` : "URL 확인 필요"}
                      </span>
                    </div>
                    {showreelVideoId ? (
                      <div className="relative aspect-video w-full overflow-hidden rounded-[4px] border border-white/15 bg-[#0D111A]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://i.ytimg.com/vi/${showreelVideoId}/hqdefault.jpg`}
                          alt="Showreel thumbnail preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <p className="py-3 text-center text-xs text-white/55">
                        유효한 YouTube 주소를 입력하면 16:9 썸네일이 표시됩니다.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* 3. 링크 목록 관리 (CRUD) 섹션 */}
            <div className="flex flex-col gap-2.5 rounded-[0.5rem] border border-white/18 bg-[#0D111A]/45 p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Link2
                    className="h-4 w-4 text-[#20B2AA]"
                    aria-hidden="true"
                  />
                  <h2 className="text-xs font-bold tracking-wider text-white uppercase">
                    링크 목록 관리 ({profile.links.length})
                  </h2>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="xs"
                  onClick={handleOpenAddLink}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>새 링크</span>
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                {profile.links.map((link, index) => (
                  <div
                    key={link.id}
                    className="flex items-center gap-2 rounded-[0.5rem] border border-white/20 bg-white/12 p-2.5 backdrop-blur-md"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-white/20 bg-[#121723]/45">
                      <LinkIcon iconType={link.iconType} className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-semibold text-white">
                          {link.title}
                        </span>
                        {link.badge && (
                          <Badge
                            variant={
                              link.badge === "NEW" ? "pink" : "purple"
                            }
                            className="px-1 py-0 text-[10px]"
                          >
                            {link.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-[11px] text-white/70">
                        {link.subtitle || link.href}
                      </p>
                    </div>

                    {/* 순서 변경 및 수정/삭제 컨트롤 */}
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveLink(index, "up")}
                        disabled={index === 0}
                        aria-label={`${link.title} 위로 이동`}
                        className="inline-flex size-6 cursor-pointer items-center justify-center rounded-[4px] border border-white/15 bg-white/8 text-white/80 transition-colors hover:bg-white/20 disabled:pointer-events-none disabled:opacity-30"
                      >
                        <ArrowUp className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveLink(index, "down")}
                        disabled={index === profile.links.length - 1}
                        aria-label={`${link.title} 아래로 이동`}
                        className="inline-flex size-6 cursor-pointer items-center justify-center rounded-[4px] border border-white/15 bg-white/8 text-white/80 transition-colors hover:bg-white/20 disabled:pointer-events-none disabled:opacity-30"
                      >
                        <ArrowDown className="size-3" />
                      </button>
                      <Button
                        type="button"
                        variant="glass"
                        size="xs"
                        onClick={() => handleOpenEditLink(link)}
                        aria-label={`${link.title} 수정`}
                      >
                        수정
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-xs"
                        onClick={() => handleDeleteLink(link.id)}
                        aria-label={`${link.title} 삭제`}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 하단 + 새 링크 추가하기 버튼 (PRD 7.3) */}
              <Button
                type="button"
                variant="glass"
                size="default"
                onClick={handleOpenAddLink}
                className="mt-1 w-full border-dashed border-white/35 bg-white/10 hover:bg-white/18"
              >
                <Plus className="h-4 w-4" />
                <span>새 링크 추가하기</span>
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 링크 추가/수정 Glass 모달 */}
      <LinkFormModal
        key={`${editingLink?.id ?? "new"}-${isLinkModalOpen ? "open" : "closed"}`}
        open={isLinkModalOpen}
        onOpenChange={setIsLinkModalOpen}
        initialLink={editingLink}
        onSave={handleSaveLink}
      />
    </main>
  );
}
