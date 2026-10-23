"use client";

import { useState, type CSSProperties } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Play } from "lucide-react";
import { extractYoutubeVideoId, type ShowreelConfig } from "@/data/links";
import { Badge } from "@/components/ui/badge";

interface ShowreelBlockProps {
  showreel: ShowreelConfig;
}

export function ShowreelBlock({ showreel }: ShowreelBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!showreel.enabled) {
    return null;
  }

  const videoId = extractYoutubeVideoId(showreel.youtubeUrl);
  const thumbnailUrl = videoId
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : null;

  const handleHeaderToggle = () => {
    if (isExpanded) {
      setIsExpanded(false);
      setIsPlaying(false);
    } else {
      setIsExpanded(true);
    }
  };

  const handlePlayClick = () => {
    setIsExpanded(true);
    setIsPlaying(true);
  };

  return (
    <div
      data-glass-rim=""
      style={
        {
          animationDelay: "60ms",
          "--rim-size": "180px",
          "--sheen-size": "200px",
        } as CSSProperties
      }
      className="glass-rim animate-glass-entry relative w-full overflow-hidden rounded-[0.5rem] border border-white/15 bg-[#0080FF] text-left text-white shadow-[0_4px_20px_rgba(0,128,255,0.28)] transition-[transform,opacity,background-color,box-shadow] duration-200 ease-out"
    >
      {/* 상단 쇼릴 헤더 바 (클릭 시 인라인 플레이어 펼치기 / 접기) */}
      <button
        type="button"
        onClick={handleHeaderToggle}
        aria-expanded={isExpanded}
        className="group relative z-10 flex w-full cursor-pointer items-center gap-3 p-[12px] text-left transition-colors duration-200 hover:bg-[#0073E6] focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none active:-translate-y-px"
      >
        {/* 좌측 Play 아이콘 박스 */}
        <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border border-white/35 bg-[#121723]/30 transition-transform duration-200 ease-out group-hover:scale-105">
          <Play className="h-4 w-4 fill-white text-white" aria-hidden="true" />
        </div>

        {/* 중앙 쇼릴 제목 & 부제목 */}
        <div className="relative z-10 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[0.875rem] font-semibold text-white">
              {showreel.title || "대표 쇼릴"}
            </span>
            {showreel.badge && (
              <Badge
                variant="purple"
                className="border-white/30 bg-[#8B00FF] px-1.5 py-0.5 text-[0.6875rem]"
              >
                {showreel.badge}
              </Badge>
            )}
          </div>
          {showreel.subtitle && (
            <p className="mt-0.5 truncate text-[0.75rem] font-normal text-white/90">
              {showreel.subtitle}
            </p>
          )}
        </div>

        {/* 우측 펼치기 / 접기 인디케이터 */}
        <span className="relative z-10 inline-flex shrink-0 items-center gap-1 rounded-[4px] border border-white/25 bg-[#121723]/25 px-2 py-1 font-mono text-[0.6875rem] font-medium text-white/95 transition-colors group-hover:bg-[#121723]/40">
          {isExpanded ? (
            <>
              <span>접기</span>
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            </>
          ) : (
            <>
              <span>재생</span>
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </>
          )}
        </span>
      </button>

      {/* 인라인 16:9 쇼릴 썸네일 미리보기 & YouTube 플레이어 영역 */}
      {isExpanded && (
        <div className="relative z-10 border-t border-white/20 bg-[#0D111A]/90 p-2.5">
          {videoId ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-[6px] border border-white/20 bg-[#0D111A] shadow-inner">
              {isPlaying ? (
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                  title={showreel.title || "Motion Graphic Showreel"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  onClick={handlePlayClick}
                  aria-label={`${showreel.title} 영상 인라인 재생`}
                  className="group/player relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:outline-none"
                >
                  {thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbnailUrl}
                      alt={showreel.title}
                      className="h-full w-full object-cover opacity-85 transition-transform duration-300 ease-out group-hover/player:scale-105 group-hover/player:opacity-100"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D111A]/80 via-[#0D111A]/25 to-transparent" />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-[#0080FF]/90 text-white shadow-[0_4px_24px_rgba(0,128,255,0.6)] backdrop-blur-md transition-transform duration-200 ease-out group-hover/player:scale-110">
                      <Play
                        className="ml-0.5 h-6 w-6 fill-white text-white"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="rounded-[4px] border border-white/20 bg-[#0D111A]/75 px-2.5 py-0.5 font-mono text-[11px] font-medium text-white/95 backdrop-blur-sm">
                      카드 내 즉시 재생 (16:9)
                    </span>
                  </div>
                </button>
              )}
            </div>
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-[6px] border border-white/15 bg-[#121723] p-4 text-center">
              <p className="text-xs text-white/75">
                유효한 YouTube URL이 설정되지 않았습니다.
              </p>
            </div>
          )}

          {/* 하단 보조 컨트롤 바 */}
          <div className="mt-2 flex items-center justify-between px-0.5 text-[11px] text-white/75">
            <span className="font-mono">INLINE PLAYER · 60FPS</span>
            {showreel.youtubeUrl && (
              <a
                href={showreel.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-white/90 underline-offset-4 hover:text-white hover:underline"
              >
                <span>YouTube에서 열기</span>
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
