"use client";

import { useEffect } from "react";

/**
 * 커서 반응형 림라이트.
 * 마우스 위치를 각 .glass-rim 요소의 로컬 좌표로 바꿔 --rim-x / --rim-y 에 넣는다.
 * 실제 빛은 globals.css 의 .glass-rim::after 가 테두리(1px) 안에서만 그린다.
 * 터치 기기(hover 없음)에서는 동작하지 않는다.
 */
export function useRimLight() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const paint = () => {
      frame = 0;
      document.querySelectorAll<HTMLElement>(".glass-rim").forEach((el) => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--rim-x", `${x - rect.left}px`);
        el.style.setProperty("--rim-y", `${y - rect.top}px`);
        el.style.setProperty("--rim-opacity", "1");
      });
    };

    const handleMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const handleLeave = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      document.querySelectorAll<HTMLElement>(".glass-rim").forEach((el) => {
        el.style.setProperty("--rim-opacity", "0");
      });
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handleLeave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handleMove);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
    };
  }, []);
}
