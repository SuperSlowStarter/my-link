"use client";

import { useState } from "react";
import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Google 프로필 사진 주소를 화면 크기에 맞는 해상도로 바꾼다.
 * (lh3.googleusercontent.com/...=s96-c → =s{size*2}-c, 고해상도 화면 대응)
 */
export function googlePhotoAtSize(photoURL: string, size: number): string {
  if (!photoURL) return "";
  const px = Math.min(Math.max(Math.round(size * 2), 64), 512);
  if (/=s\d+(-c)?$/.test(photoURL)) return photoURL.replace(/=s\d+(-c)?$/, `=s${px}-c`);
  if (photoURL.includes("googleusercontent.com") && !photoURL.includes("=")) return `${photoURL}=s${px}-c`;
  return photoURL;
}

/**
 * 프로필 사진 — Google 계정 사진을 쓴다.
 * 사진이 없거나 불러오지 못하면 글자 대신 사람 아이콘을 보여준다.
 */
export function UserAvatar({
  photoURL,
  size = 28,
  className,
  alt = "",
}: {
  photoURL: string;
  size?: number;
  className?: string;
  alt?: string;
}) {
  const src = googlePhotoAtSize(photoURL, size);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-winter/25 bg-cedar text-winter/70",
        className
      )}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(src)}
          className="h-full w-full object-cover"
        />
      ) : (
        <UserRound
          aria-hidden="true"
          style={{ width: Math.round(size * 0.5), height: Math.round(size * 0.5) }}
        />
      )}
    </span>
  );
}
