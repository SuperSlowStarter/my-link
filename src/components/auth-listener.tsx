"use client";

import { useAuthListener } from "@/store/auth-store";
import { useProfileSync } from "@/store/profile-store";

/** 루트 레이아웃에 한 번 두면 앱 전체에서 Firebase 로그인 상태를 추적한다 (화면에는 아무것도 그리지 않음) */
export function AuthListener() {
  useAuthListener();
  // 로그인하면 공개 프로필(users/{uid}/profile/main)을 만들고(없을 때) 구독
  useProfileSync();
  return null;
}
