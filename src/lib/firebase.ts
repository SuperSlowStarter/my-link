import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore/lite";

/**
 * Firebase 초기화 (프로젝트: my-dae-link)
 * - 설정값은 .env.local 의 NEXT_PUBLIC_FIREBASE_* 에서 읽는다 (.env.example 참고).
 * - Next.js는 process.env.NEXT_PUBLIC_XXX 처럼 이름을 직접 적어야 브라우저 번들에 값을 넣어준다.
 *   그래서 객체 순회 같은 동적 접근 없이 하나씩 적는다.
 * - HMR·여러 번 import 되어도 앱은 한 번만 만든다 (getApps).
 */
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || undefined,
};

/** 필수 설정이 모두 채워져 있는지 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

if (!isFirebaseConfigured && process.env.NODE_ENV !== "production") {
  console.warn(
    "[firebase] NEXT_PUBLIC_FIREBASE_* 환경 변수가 비어 있어요. .env.example을 참고해 .env.local을 채워주세요."
  );
}

export const firebaseApp: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

/**
 * Cloud Firestore — Firestore Lite SDK (firebase/firestore/lite)
 * 실시간 리스너(onSnapshot·Listen 스트림) 없이 REST 요청으로만 읽고 쓴다. 조회 캐시는 TanStack Query가 맡는다.
 */
export const db: Firestore = getFirestore(firebaseApp);

/** Firebase Auth — Phase 2 관리자 로그인(편집 권한 보호). 브라우저에서만 호출한다. */
export function getFirebaseAuth(): Auth {
  return getAuth(firebaseApp);
}

/**
 * Google Analytics — 브라우저이고, 지원되는 환경이며, measurementId가 있을 때만 켠다.
 * SSR·광고 차단기·쿠키 차단 환경에서는 조용히 건너뛴다.
 */
export async function initFirebaseAnalytics() {
  if (typeof window === "undefined" || !firebaseConfig.measurementId) return null;
  const { getAnalytics, isSupported } = await import("firebase/analytics");
  if (!(await isSupported())) return null;
  return getAnalytics(firebaseApp);
}
