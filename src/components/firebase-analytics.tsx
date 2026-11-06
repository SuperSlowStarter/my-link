"use client";

import { useEffect } from "react";
import { initFirebaseAnalytics } from "@/lib/firebase";

/** 루트 레이아웃에 한 번 두면 브라우저에서 Firebase Analytics를 켠다 (화면에는 아무것도 그리지 않음) */
export function FirebaseAnalytics() {
  useEffect(() => {
    initFirebaseAnalytics().catch((error: unknown) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[firebase] Analytics 초기화를 건너뛰었어요.", error);
      }
    });
  }, []);
  return null;
}
