"use client";

import { useAuthListener } from "@/store/auth-store";

/** 루트 레이아웃에 한 번 두면 앱 전체에서 Firebase 로그인 상태를 추적한다 (화면에는 아무것도 그리지 않음) */
export function AuthListener() {
  useAuthListener();
  return null;
}
