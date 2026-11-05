# PRD (제품 요구사항 및 기능 정의서) — 마이링크 (MyLink)

- **문서 버전:** v1.3 (2026-11-05: 13주차 클릭 통계 — 클릭 카운트 저장·링크별 클릭수·마이페이지 통계·/stats 대시보드)
- **v1.2:** 2026-11-05 편집 모드·쇼릴·직무·스킬 제거, 프로필 인라인 수정
- **이전 버전:** v1.1 (2026-11-04: 기술 스택·상태관리·유효성 검사·/mypage·마일스톤 추가)
- **최초 버전:** v1.0
- **작성일:** 2026-10-07
- **프로젝트명:** 마이링크 (MyLink)
- **서비스 정의:** 모션그래픽 디자이너를 위한 인터랙티브 Glassmorphism 개인 프로필 & 링크 허브

---

## 1. 프로젝트 개요 (Overview)

### 1.1 배경 및 목적
모션그래픽 디자이너 **이대건**의 작업물(쇼릴, 유튜브, 인스타그램)과 외주 문의 창구를 하나의 URL로 연결하는 개인 전용 링크트리(Linktree) 웹 애플리케이션입니다. 단순한 링크 나열을 넘어, 디자이너의 감각을 보여주는 **ColorPallete 기반 웜 다크 Glassmorphism UI(가장자리 림라이트)**를 제공하며, 코드 수정 없이 내 카드에서 바로 이름·소개를 고치는 **인라인 수정**과 링크 관리 페이지(`/mypage`)를 지원합니다.

### 1.2 타겟 사용자
1. **관리자 (Owner):** 본인(모션그래픽 디자이너 이대건) — **Google 계정으로 로그인**한 뒤, 내 링크 카드에서 **이름·@username·소개글을 바로 눌러 수정**하고(인라인 수정), **내 링크 관리(`/mypage`)**에서 외부 링크를 추가·수정·삭제하고 순서를 바꿈.
2. **방문자 (Visitors):** 클라이언트, 채용 담당자, 동료 디자이너 및 구독자 — 데스크탑·태블릿·모바일 환경에서 작업물 링크를 열어보고 주요 채널로 이동하거나 프로젝트 문의를 진행.

---

### 1.3 기술 스택 (Tech Stack)

| 영역 | 기술 | 용도 |
| :--- | :--- | :--- |
| 프레임워크 | **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript** | 페이지 라우팅(`/`, `/mypage`), 클라이언트 컴포넌트 |
| 스타일 | **Tailwind CSS v4** · `tw-animate-css` | ColorPallete 토큰(`bg-hearth`, `text-winter` 등), 이징 토큰(`ease-punch` 등) |
| UI 프리미티브 | **shadcn/ui** 구조 + **@base-ui/react** · `cva` · `lucide-react` | 접근성 있는 버튼·스위치, 변형(variant) 분기, 아이콘 |
| 서버 데이터 | **TanStack Query 5** (`useQuery`·`useMutation`, DevTools) | Firestore 조회·추가·수정·삭제·캐시·다시 조회 (`src/hooks/use-links.ts`, `src/hooks/use-profile.ts`) |
| 상태관리 | **Zustand 5** | 화면 상태만 — 로그인 상태(`useAuthStore`), 진행 중 작업 문구(`useLoadingStore`) |
| 폼 | **React Hook Form 7** (+ `@hookform/resolvers`) | /mypage(링크 빠른 추가·상세 모달) 입력 관리 (프로필 인라인 수정은 필드별 Zod 검사) |
| 유효성 검사 | **Zod 4** | 입력 규칙과 한국어 오류 문구를 스키마 하나로 정의 (`src/lib/schemas.ts`) |
| 저장소 | Phase 1: 브라우저 `localStorage` / Phase 2: **Firebase** (Cloud Firestore) | §2 로드맵 참조 |
| 백엔드 (BaaS) | **Firebase 13** — App · **Cloud Firestore Lite**(`firebase/firestore/lite`, 실시간 없음) · Authentication · Analytics (프로젝트 `my-dae-link`) | 링크는 Firestore `users/{uid}/links`, 사용자 정보는 `users/{uid}` |
| 인증 | **Firebase Authentication — Google 소셜 로그인** (`signInWithPopup`, 팝업이 막히면 `signInWithRedirect`) | 헤더 로그인 메뉴, 로그인 전 안내 화면, 사용자별 데이터 분리 (`src/store/auth-store.ts`) |
| 알림 | **Sonner 2** (`toast`) | 링크 주소 복사 등 짧은 결과 알림 — 짙은 유리 패널, 헤더 아래 우측 (`src/components/app-toaster.tsx`) |
| 차트 | **Recharts 3** + shadcn/ui `chart` (`src/components/ui/chart.tsx`) | `/stats` 링크별 클릭수 막대 차트 (13주차) |

---

## 2. 데이터 아키텍처 및 단계별 로드맵 (Phased Roadmap)

향후 클라우드 DB 확장을 고려하여 **UI 컴포넌트와 데이터 저장소(Storage Layer)를 분리**하여 설계합니다.

- **상태관리는 Zustand로 일원화합니다.** 컴포넌트는 스토어의 상태와 액션(`addLink`, `updateLink`, `deleteLink`, `moveLink` 등)만 사용하고, 저장 방식은 알지 못합니다.
- **데이터 조회·쓰기는 TanStack Query로 일원화했습니다 (2026-11-05).** Firestore 실시간 기능(`onSnapshot`)은 쓰지 않습니다.
  - Firestore SDK도 실시간 리스너가 없는 **Firestore Lite**(`firebase/firestore/lite`)를 씁니다. 일반 SDK는 한 번 읽기(`getDoc`)에도 내부적으로 `Listen` 스트림을 여는데, Lite는 REST 요청(`runQuery`, `batchGet`, `commit`)만 보냅니다. 번들도 더 작습니다.
  - **조회(`useQuery`):** 한 번 불러와 캐시합니다. 30초 동안은 캐시를 쓰고(`staleTime`), 창으로 돌아오면 다시 조회합니다(`refetchOnWindowFocus`). 다른 기기·탭에서 바꾼 내용은 다시 조회할 때 반영됩니다.
  - **쓰기(`useMutation`):** 성공하면 관련 캐시를 무효화해 다시 조회합니다. 결과는 Sonner 알림(성공·실패)으로 보여줍니다.
  - **로딩 오버레이:** `meta.loadingLabel`이 있는 진행 중인 쓰기(`useMutationState`)와 처음 조회(`useIsFetching`)를 보고 띄웁니다. 로그인·로그아웃·프로필 준비는 `useLoadingStore`.
- **캐시 키 (`src/lib/query-client.ts`)**

  | 키 | 데이터 | 조회 함수 | 쓰기 (mutation) |
  | :--- | :--- | :--- | :--- |
  | `["links", uid]` | `users/{uid}/links` (createdAt 최신순) | `fetchLinks` | 추가·수정·삭제·순서 변경·이전 링크 가져오기 → 이 키 무효화 |
  | `["profile", uid]` | `users/{uid}/profile/main` (내 프로필·공개 페이지 공용) | `fetchProfile` | 인라인 수정 저장(`useSaveProfileBasics`) → 무효화 |
  | `["legacy-link-count"]` | `users/anonymous/links` 개수 | `countLegacyLinks` | 가져오기 후 무효화 |

- **훅 (`src/hooks/*`):** `useMyLinks`·`useLinksQuery(uid)`·`useLinkActions`·`useLegacyLinkCount` / `useMyProfile`·`useProfileQuery(uid)`·`useSaveProfileBasics`. (편집 모드 자동 저장 훅 `useProfileDetailsAutosave`는 2026-11-05 삭제)
- **로그인 직후:** `AuthListener`가 프로필이 없으면 초기값을 만들고(`ensureProfile`) `["profile", uid]`를 무효화합니다. 로그아웃하면 `links`·`profile` 캐시를 지웁니다. 로그인 상태 감시(`onAuthStateChanged`)는 Firebase Auth 기능이라 유지합니다 (Firestore 실시간 구독 아님).
- 프로필은 `users/{uid}/profile/main`에 있으며, 예전 브라우저 localStorage 값은 첫 로그인 계정의 초기값으로 한 번만 가져옵니다.

```mermaid
flowchart LR
  UI["MyLink UI"] --> Form["React Hook Form + Zod<br/>(검사 통과 값만 전달)"]
  Form --> Mut["useMutation<br/>(추가·수정·삭제·저장)"]
  UI --> Q["useQuery<br/>(링크·프로필 조회)"]
  Auth["useAuthStore<br/>(Google 로그인)"] -->|user.uid| Q
  Auth -->|user.uid| Mut
  Q -->|fetch (REST)| Lite["Firestore Lite<br/>users/{uid}/links · profile/main"]
  Mut -->|write (REST)| Lite
  Mut -->|성공 시 invalidate| Cache[("TanStack Query 캐시")]
  Cache --> Q
```

| 단계 | 저장 방식 | 주요 목표 및 특징 |
| :---: | :--- | :--- |
| **Phase 1 (현재 MVP)** | **LocalStorage + 기본 시드 데이터** | • 최초 접속 시 코드에 정의된 기본 프로필/링크 데이터 로드<br/>• 편집 모드에서 수정 시 브라우저 `localStorage`에 즉시 반영 및 유지<br/>• 기본값 복원(Reset to Default) 기능 제공 |
| **Phase 2 (진행 중)** | **Firebase (Cloud Firestore + Authentication)** | • ✅ Google 소셜 로그인, 사용자별 링크 저장(`users/{uid}/links`)<br/>• ⬜ 프로필(이름·소개·쇼릴)도 `users/{uid}`로 이전<br/>• ⬜ 방문자용 공개 페이지(로그인 없이 특정 사용자의 링크 보기) |

### 2.1 Firebase 설정 (Setup)
- **프로젝트:** `my-dae-link` (웹 앱). SDK: `firebase` npm 패키지 (모듈식 v9+ API).
- **환경 변수:** 설정값은 코드에 직접 쓰지 않고 `.env.local`의 `NEXT_PUBLIC_FIREBASE_*` 변수로 주입합니다. `.env.local`은 git에서 제외되고, 형식은 커밋되는 `.env.example`로 공유합니다.

  | 변수 | 설명 |
  | :--- | :--- |
  | `NEXT_PUBLIC_FIREBASE_API_KEY` | 웹 API 키 |
  | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | 인증 도메인 |
  | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | 프로젝트 ID |
  | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage 버킷 |
  | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | 메시징 발신자 ID |
  | `NEXT_PUBLIC_FIREBASE_APP_ID` | 앱 ID |
  | `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | (선택) Google Analytics 측정 ID |

- **초기화 모듈 (`src/lib/firebase.ts`):** 앱을 한 번만 만들고(`getApps`) 다음을 내보냅니다.
  - `firebaseApp` — Firebase 앱 인스턴스
  - `db` — Cloud Firestore (Phase 2 프로필·링크 저장소)
  - `getFirebaseAuth()` — Authentication (Google 로그인, 브라우저 전용)
  - `initFirebaseAnalytics()` — 브라우저이고 지원되는 환경이며 측정 ID가 있을 때만 Analytics를 켭니다.
  - `isFirebaseConfigured` — 필수 값이 비어 있으면 개발 중 콘솔에 경고합니다.
- **Analytics:** 루트 레이아웃의 `<FirebaseAnalytics />`가 앱 시작 시 한 번 초기화합니다.
- **보안 메모:** 웹 API 키는 브라우저에 노출되는 공개 식별자이므로, 실제 보호는 **Firestore 보안 규칙**과 Google Cloud 콘솔의 **API 키 제한(허용 도메인)**으로 합니다.
- **Google 로그인 설정:** Firebase 콘솔 → Authentication → 로그인 방법에서 **Google 제공업체가 사용 설정**되어 있어야 합니다 (2026-11-04 확인: 로그인 창 정상 표시). 배포 도메인은 Authentication → 설정 → **승인된 도메인**에 추가합니다 (`localhost`는 기본 포함).

### 2.2 인증 (Google 소셜 로그인)
- **흐름:** 헤더의 `Google로 로그인` → `signInWithPopup(GoogleAuthProvider)` (계정 선택 창 `prompt: select_account`) → 성공하면 `onAuthStateChanged`가 사용자 정보를 받음 → `users/{uid}` 문서에 계정 정보를 기록(upsert) → 같은 문서를 실시간 구독해 화면에 표시.
- **세션 유지:** Firebase Auth 기본 설정(브라우저 로컬 저장)으로 새로고침·재방문해도 로그인이 유지됩니다. 확인하는 동안(`status: loading`)은 스켈레톤을 보여 화면이 깜빡이지 않게 합니다.
- **팝업 예외 처리:** 팝업이 막히면 리디렉션 방식으로 다시 시도합니다. Google 로그인 창은 COOP 정책 때문에 SDK가 창이 닫힌 것을 바로 알지 못하므로, 사용자가 창을 닫고 돌아온 뒤 4초 안에 로그인이 끝나지 않으면 버튼을 다시 활성화합니다. 사용자가 직접 창을 닫은 경우는 오류로 표시하지 않습니다.
- **오류 문구:** Google 로그인 꺼짐(`auth/operation-not-allowed`), 승인되지 않은 도메인, 네트워크 오류를 한국어로 안내합니다.
- **로그인에 따른 화면:**

  | 화면 | 로그인 전 | 로그인 후 |
  | :--- | :--- | :--- |
  | 헤더 (메인·/mypage 공통) | `Google로 로그인` 버튼 | **프로필 아이콘 버튼**(원형 사진) → 드롭다운 메뉴 (§5.5.1) |
  | 메인 카드 링크 영역 | "로그인하면 내 링크가 보여요" 안내 + 로그인 버튼 | 내 링크(`users/{uid}/links`, 카드 순서) |
  | 메인 카드 이름·@username·소개 | — (소개 페이지) | 커서를 올리면 ✎ 아이콘, 눌러서 인라인 수정 |
  | `/mypage` | "로그인 후 사용할 수 있어요" 안내 + 사용할 수 있는 기능 목록 + 로그인 버튼 | 계정 정보 패널 + 빠른 추가 폼 + 링크 목록 |

  - 내 프로필 카드(사진·이름·@username·소개)는 `users/{uid}/profile/main`에서 읽습니다. 로그아웃 상태의 홈은 소개 페이지만 보입니다.

- **Firestore 데이터 구조:**

  ```text
  users/{uid}/profile/main             공개 프로필 (누구나 읽기, 본인만 쓰기)
    username     string     공유 URL용 (/{username}), 기본값 = 이메일 앞부분
    displayName  string     표시 이름, 기본값 = Google 계정 이름
    bio          string     소개글 (200자 이내)
    photoURL     string     Google 프로필 사진 (로그인할 때마다 최신으로)
    (예전 문서에 남은 role·skills·showreel 필드는 더 이상 읽지 않음, 2026-11-05)
    createdAt / updatedAt  timestamp

  usernames/{username}                 username → uid (누구나 읽기, 본인만 만들기·지우기)
    uid          string     이 username을 쓰는 사용자
    createdAt    timestamp

  users/{uid}                          계정 정보 (본인만 읽기·쓰기, 로그인할 때마다 갱신)
    uid          string     Firebase Auth uid
    displayName  string     Google 계정 이름
    email        string     Google 계정 이메일
    photoURL     string     Google 프로필 사진
    provider     string     google.com
    createdAt    timestamp  처음 로그인한 시각 (최초 1회)
    lastLoginAt  timestamp  마지막 로그인 시각
    legacyLinksImportedAt     timestamp?  이전 공용 링크를 가져온 시각
    legacyLinksImportedCount  number?     가져온 링크 개수

  users/{uid}/links/{linkId}           내 링크 문서 (메인 카드·/mypage 공용)
    title      string     링크 제목 (필수)
    url        string     이동 주소 — http(s):// 또는 mailto: (필수)
    subtitle   string     부제목 (없으면 "")
    iconType   string     play | youtube | instagram | mail | film | globe | link | sparkles
    badge      string?    강조 배지 (없으면 필드 자체를 두지 않음)
    variant    string     primary | glass
    order      number     표시 순서 (0부터)
    clickCount number?    클릭 수 (13주차) — 서버에서 increment(1)로만 증가, 없으면 0으로 봄
    createdAt  timestamp  serverTimestamp() — 추가 시각
    updatedAt  timestamp  serverTimestamp() — 마지막 수정·순서 변경 시각
  ```

  - 모든 링크 함수는 로그인한 사용자의 `user.uid`를 받아 `users/{uid}/links`에만 읽고 씁니다. 로그인 전에는 호출하지 않습니다.
  - `/mypage`에서 빠르게 추가한 링크는 `subtitle: ""`, `iconType: "link"`, `variant: "glass"` 기본값으로 저장되어 메인 카드에도 바로 표시됩니다.
  - **불러오기:** 로그인하면 `query(users/{uid}/links, orderBy("createdAt", "desc"))`를 `getDocs`로 한 번 조회해 **createdAt 최신순**으로 불러옵니다 (TanStack Query `["links", uid]`). 추가·수정·삭제하면 이 캐시를 무효화해 다시 조회합니다. 다른 계정으로 바꾸면 그 계정의 키로 조회합니다.
  - **화면별 정렬:** `/mypage` 목록은 최신순 그대로(`links`), 메인 카드는 직접 정한 `order` 오름차순(`orderedLinks`, `order`가 없는 예전 문서는 맨 뒤).
  - 저장소 함수: `fetchLinks`, `addLinkDoc`, `updateLinkDoc`, `deleteLinkDoc`, `reorderLinkDocs`(배치), `countLegacyLinks`, `importLegacyLinks` (`src/lib/links-repository.ts`) / `upsertUserProfile`, `fetchUserAccount` (`src/lib/users-repository.ts`) / `fetchProfile`, `ensureProfile`, `saveProfileBasics` (`src/lib/profile-repository.ts`).
- **이전 공용 링크 가져오기:** 로그인 기능 전에는 모든 링크가 공용 경로 `users/anonymous/links`에 있었습니다. 로그인한 사용자의 목록이 비어 있고 공용 경로에 링크가 있으면, `/mypage`에 `이전 링크 N개 가져오기` 버튼이 나타납니다.
  - 누르면 공용 링크를 같은 문서 ID로 `users/{uid}/links`에 **복사**합니다 (원본은 그대로, 여러 번 눌러도 중복 없음). 기록은 `users/{uid}.legacyLinksImportedAt`.
  - 예전의 localStorage → `users/anonymous` 자동 마이그레이션은 로그인 도입으로 없앴습니다.
- **보안 규칙·인덱스 (배포 완료, 2026-11-04):** `firestore.rules`, `firestore.indexes.json` 파일로 관리하고 `firebase deploy --only firestore:rules,firestore:indexes`로 배포합니다 (`firebase.json`, `.firebaserc`).

  | 경로 | 읽기 | 쓰기 |
  | :--- | :--- | :--- |
  | `users/{userId}/links/{linkId}` | 누구나 (로그인 불필요) | 로그인 + `request.auth.uid == userId` (+ 제목·주소 검사) / **예외: `clickCount`만 정확히 +1 하는 수정은 누구나** (`isClickIncrement`, 13주차) |
  | `users/{userId}/profile/{docId}` | 누구나 | 로그인 + 본인, `docId == 'main'`, username 형식·길이 검사, `usernames/{username}`이 본인 것 (`getAfter`) |
  | `usernames/{username}` | 누구나 | 만들기: 로그인 + `uid`가 본인 + 형식 검사 / 지우기: 본인 것만 / 수정: 금지 |
  | `{path=**}/profile/{docId}` (컬렉션 그룹 쿼리) | 누구나 (displayName 중복 확인용) | — (쓰기는 위 profile 규칙) |
  | `users/{userId}` (계정 정보: 이메일 등) | 본인만 | 본인만 |
  | `users/anonymous/links` (이전 공용 링크) | 누구나 | 금지 |

  - 슬라이드 예시의 `match /users/{userId}/profile`은 컬렉션 경로라 어떤 문서에도 맞지 않아서, `match /users/{userId}/profile/{docId}`로 작성했습니다.
  - 이메일 같은 개인 정보는 공개 프로필에 두지 않고 본인만 읽는 `users/{uid}`에 둡니다.
- **보안 규칙 테스트:** `node scripts/test-firestore-rules.mjs` — 로그인하지 않은 방문자 시점에서 Firestore REST API로 12가지를 확인합니다 (2026-11-05 클릭 규칙 배포 후 12/12 통과).

  | 시나리오 | 기대 | 결과 |
  | :--- | :---: | :---: |
  | 공개 프로필 읽기 `users/{uid}/profile/main` | 허용 | ✅ |
  | 링크 목록 읽기 `users/{uid}/links` | 허용 | ✅ |
  | username 조회 `usernames/{username}` | 허용 | ✅ |
  | 계정 정보 읽기 `users/{uid}` | 거부 | ✅ 403 |
  | 링크 쓰기 (로그인 안 함) | 거부 | ✅ 403 |
  | 프로필 쓰기 (로그인 안 함) | 거부 | ✅ 403 |
  | username 차지 (로그인 안 함) | 거부 | ✅ 403 |
  | 공용 링크 쓰기 | 거부 | ✅ 403 |
  | displayName 중복 확인 쿼리 (`collectionGroup('profile')`) | 허용 | ✅ 200 |
| 클릭 수 +1 (`increment(1)`, 로그인 안 함) | 허용 | ✅ 200 (배포 전에는 403 `PERMISSION_DENIED`) |
| 클릭 수를 9999로 덮어쓰기 (로그인 안 함) | 거부 | ✅ 403 |
| 클릭 수 +1 하면서 제목 바꾸기 (로그인 안 함) | 거부 | ✅ 403 |

  - 로그인한 본인 쓰기 허용·남의 데이터 쓰기 거부는 앱에서 로그인 후 확인합니다 (로컬 에뮬레이터는 Java가 없어 사용하지 않음).
- **Next.js 참고:** `NEXT_PUBLIC_` 값은 `next build` 시점에 번들에 고정됩니다. 값을 바꾸면 개발 서버 재시작 또는 재빌드가 필요합니다.

---

## 3. 핵심 기능 정의 (Functional Requirements)

### 3.0 홈(`/`)과 로그인 상태
- **로그인 전 → 소개 페이지** (`src/components/landing-page.tsx`): 서비스 소개와 `Google로 시작하기` 버튼. 헤더에는 로고와 로그인 버튼만 보임 (메뉴 숨김).
- **로그인 후 → 내 링크 페이지** (`src/components/hub-page.tsx`): 프로필 카드(인라인 수정) + `users/{uid}/links`.
- **로그아웃하면 소개 페이지로 이동**합니다. 로그아웃 상태로 `/mypage`에 들어오면 소개 페이지로 보냅니다.
- 이전에는 로그아웃해도 브라우저에 저장된 프로필 카드가 그대로 보였는데, 이제 로그아웃 상태에서는 소개 페이지만 보입니다.
- 로그인 상태를 확인하는 동안에는 헤더·배경만 그리고 로딩 오버레이(§5.6)가 덮습니다.
- 사이트 제목(메타데이터): `MyLink — 모션 디자이너를 위한 링크 허브`.

### 3.1 편집 모드 없음 — 보이는 카드에서 바로 수정 (2026-11-05)
- 예전의 `편집 모드` 토글·`완료`·`기본값 복원` 버튼과 편집 화면(`profile-editor.tsx`)은 **없앴습니다.** 내 링크 페이지는 방문자에게 보이는 카드 그대로이고, 본인 카드에서만 텍스트를 눌러 고칩니다 (§3.7).
- 링크는 카드에서 고치지 않고 `/mypage`(내 링크 관리)에서 관리합니다 (§3.4, §3.6). 링크가 없으면 카드에 `링크 추가하기` 버튼이 보입니다.

### 3.2 프로필 정보 (Profile)
| 항목 | 상세 요구사항 |
| :--- | :--- |
| **프로필 아바타** | • `120px` 원형 Glass 프레임<br/>• **Google 계정 프로필 사진**을 그대로 사용 (`users/{uid}.photoURL`, 화면 크기의 2배 해상도로 요청)<br/>• 사진이 없거나 불러오지 못하면 글자 대신 사람 아이콘 표시. 직접 입력하던 이미지 URL·이니셜·포인트 배지는 제거 (2026-11-04) |
| **텍스트 정보** | • **표시 이름(H1):** 예) `이대건`<br/>• **@username:** 공개 주소 `/{username}`<br/>• **소개글(Body):** 멀티라인(줄바꿈) 지원 |
| **제거한 항목 (2026-11-05)** | 직무 타이틀(Label), 기술 스택 태그(Skills), 대표 쇼릴(Showreel) 블록 |

- **카드 푸터:** `© 2026 @{username}` (예: `© 2026 @cleangabby`).

### 3.3 대표 쇼릴 — 제거 (2026-11-05)
- 카드 안 YouTube 인라인 플레이어(`showreel-block.tsx`)와 쇼릴 설정은 없앴습니다. 대표 영상은 일반 링크로 추가하고, 필요하면 `primary` 스타일·`FEATURED` 배지로 강조합니다 (§3.4).

### 3.4 링크 CRUD 관리 (Link Management)
- **링크 데이터 구조:**
  - `id`: 고유 식별자 (`string`)
  - `title`: 링크 제목 (필수, 예: `YouTube Channel`)
  - `subtitle`: 부연 설명 (선택, 예: `모션그래픽 개인작 & 작업 과정`)
  - `href`: 이동할 URL 또는 `mailto:` 이메일 주소 (필수)
  - `iconType`: 아이콘 프리셋 선택 (`play` 쇼릴/영상, `youtube` 유튜브, `instagram` 인스타그램, `film` 포트폴리오/아카이브, `sparkles` 클래스/하이라이트, `globe` 웹사이트/스토어, `link` 일반 외부 링크, `mail` 이메일/외주 문의)
  - `badge`: 강조 배지 텍스트 (선택, 예: `FEATURED`, `NEW`)
  - `variant`: 버튼 스타일 (`primary` Hearth 강조형 / `glass` 반투명 유리 기본형)
- **관리 위치:** 모든 링크 CRUD는 **`/mypage`(내 링크 관리)** 한 곳에서 합니다. 메인 카드와 같은 Firestore 컬렉션이라 바꾸면 메인 카드에 즉시 반영됩니다.
- **CRUD 동작:**
  - **추가 (Create):** ① 빠른 추가 — 제목·주소만 입력하고 `추가` (나머지는 기본값: 아이콘 `link`, 스타일 `glass`) ② 상세 추가 — `상세 추가` 버튼으로 글래스 모달을 열어 부제목·아이콘·배지·스타일까지 입력
  - **조회 (Read):** 페이지가 열리면 Firestore에서 한 번 불러옵니다 (TanStack Query, 기본 최신순). 쓰기 후·창으로 돌아올 때 다시 조회
  - **수정 (Update):** 항목의 연필 아이콘 → 같은 모달에 기존 값을 불러와 편집
  - **삭제 (Delete):** 항목의 휴지통 아이콘 → Firestore 문서 삭제
  - **순서 변경:** `카드 순서` 보기에서 위·아래 화살표로 메인 카드 표시 순서(`order`)를 변경

### 3.5 편집 유효성 검사 (Validation — Zod + React Hook Form)
- **원칙:** 모든 입력 규칙은 `src/lib/schemas.ts`의 Zod 스키마 한 곳에서 정의하고, React Hook Form이 `zodResolver`로 검사합니다. 오류 문구는 입력 칸 바로 아래에 한국어로 표시하고(`FieldError`), 오류가 있는 칸은 `aria-invalid`로 표시되어 테두리가 Danger 색으로 바뀝니다.
- **프로필 인라인 수정:** 저장(Enter·바깥 클릭)할 때 해당 필드만 `profileBasicsSchema.shape[필드]`로 검사합니다. 실패하면 입력 칸 아래에 오류를 보여주고 수정 상태를 유지합니다 (저장하지 않음).
- **검사 시점:** 프로필은 저장할 때, 링크 모달·/mypage는 첫 제출 후부터 입력할 때마다 다시 검사합니다.

| 대상 | 필드 | 규칙 |
| :--- | :--- | :--- |
| 프로필 (인라인) | 표시 이름 | 필수, 30자 이내, 다른 사용자와 중복 금지 |
| | username | 3~20자, 영문 소문자·숫자·`_`·`-`, 예약어 금지, 중복 금지 |
| | 소개글 | 200자 이내 |
| 링크 (모달) | 제목 | 필수, 40자 이내 |
| | 이동 주소 | 필수, `http(s)://` 또는 `mailto:이메일` |
| | 부제목 / 배지 | 60자 / 10자 이내 |
| /mypage | 제목 | 필수(빈 칸 금지), 40자 이내 |
| | 주소 | 필수(빈 칸 금지), `http(s)://` 또는 `mailto:이메일` |

### 3.6 내 링크 관리 페이지 (`/mypage`) — 링크 관리 전용
- **로그인 필요:** 로그인 전에는 폼·목록 대신 "로그인 후 사용할 수 있어요" 안내, 사용할 수 있는 기능 목록, `Google 계정으로 로그인` 버튼을 보여줍니다 (§2.2). 로그인하면 맨 위에 **계정 정보 패널**(`users/{uid}`: 사진·이름·uid 경로·이메일·가입일·마지막 로그인·내 링크 개수)이 나타납니다.
- **목적:** 로그인한 사용자가 자기 링크(`users/{uid}/links`)의 추가·조회·수정·삭제·순서 변경을 한 곳에서 하는 링크 관리 전용 페이지입니다. 프로필 드롭다운의 `내 링크 관리`, 또는 링크가 없을 때 카드의 `링크 추가하기` 버튼으로 이동합니다. (7주차 실습 화면에서 출발해 확장)
- **페이지 구조:** 상단 `내 링크 관리` 제목 / 중간 빠른 추가 폼 / 하단 링크 목록. **프로필 수정 폼과 공개 주소 복사 버튼은 없앴습니다 (2026-11-05)** — 프로필은 내 링크 카드에서 인라인으로, 주소 복사는 프로필 드롭다운의 `링크 주소 복사`로 합니다.
- **빠른 추가 폼:** 제목 입력 칸, 주소 입력 칸(세로 배치), `추가` 버튼 + `상세 추가` 버튼. 버튼은 프로젝트 팔레트 규칙에 따라 Hearth primary 버튼을 사용합니다 (실습 예시의 보라색 `#5B5FC7` 대신).
- **빠른 추가 동작:**
  1. `추가` 클릭 → 빈 칸·주소 형식 검사 (§3.5)
  2. 통과 시 Firestore `users/{uid}/links`에 저장 — 저장 중에는 버튼이 `저장 중...`으로 바뀌고 비활성화
  3. 저장에 성공하면 목록을 다시 조회해 반영되고 Sonner 알림이 뜸 (실패하면 입력값을 유지하고 폼 아래에 오류 문구 표시)
  4. 입력 칸 자동 비우기 + 제목 칸으로 포커스 이동
- **상세 추가·수정 모달:** 제목·부제목·주소·아이콘(8종)·배지(프리셋 NEW/FEATURED/HOT/OPEN)·스타일(Glass/Primary)을 입력하며, Zod 스키마로 검사합니다 (§3.5 링크 모달 규칙).
- **목록:**
  - 항목마다 아이콘, 제목, 배지, 부제목(없으면 주소), 추가 시각을 표시하고 `수정`·`삭제` 버튼을 둡니다. 제목을 누르면 링크가 새 탭으로 열립니다.
  - **정렬 보기 전환:** `최신순`(기본, createdAt 내림차순) / `카드 순서`(메인 카드 표시 순서). 위·아래 이동 버튼은 `카드 순서` 보기에서만 보입니다.
  - Firestore 쓰기에 실패하면 목록 위에 오류 알림을 띄우고, 누르면 닫힙니다.
- **저장 범위:** 목록은 Firestore가 원본이라 **새로고침하거나 다른 기기에서 열어도 유지**됩니다. 메인 카드와 같은 컬렉션이라 여기서 바꾸면 메인 카드에 바로 반영됩니다.
  - 참고: M4(7주차) 체크리스트의 "새로고침 → 사라짐 확인"은 메모리 상태였던 당시 단계의 테스트이며, M5에서 Firestore로 옮기면서 "새로고침 → 유지됨"이 기대 결과로 바뀌었습니다.

### 3.7 프로필 인라인 수정 (내 링크 카드, `src/components/inline-edit.tsx`)
- **대상 3개:** `displayName`(표시 이름), `username`(@, 공유 URL용), `bio`(소개글). 본인 카드(홈 `/`)에서만 수정할 수 있고, 공개 페이지 `/{username}`은 보기 전용입니다.
- **동작:**
  1. 텍스트에 커서를 올리면 옆에 작은 ✎ 아이콘이 뜨고 배경이 살짝 밝아집니다 (`ease-punch` 200ms). 키보드 포커스에도 같이 보입니다.
  2. **텍스트를 누르거나** 아이콘을 누르면(또는 Tab 포커스 후 Enter·Space) 그 자리가 입력 칸으로 바뀌고 커서가 끝에 놓입니다. 오른쪽에 저장(✓)·취소(×) 버튼.
  3. 저장: 이름·username은 `Enter`, 소개글은 `Ctrl/⌘+Enter`(Enter는 줄바꿈). 입력 칸 밖을 눌러도 저장. `Esc`는 취소.
  4. 값이 그대로면 저장하지 않고 닫힙니다. 저장 중에는 ✓ 자리에 회전 아이콘 + 로딩 오버레이(`프로필 저장 중`).
  5. 실패(형식 오류·username 중복·displayName 중복·네트워크)하면 입력 칸 아래에 Danger 색 오류 문구를 띄우고 수정 상태를 유지합니다. 성공하면 Sonner 알림(`표시 이름을 바꿨어요` / `username을 바꿨어요` + 새 공개 주소 / `소개글을 저장했어요`).
- **저장 방식:** 필드 하나만 바꿔도 `saveProfileBasics`에 세 값(나머지는 현재 값)을 함께 보냅니다. 그래서 아래 중복 확인·트랜잭션 규칙이 그대로 적용됩니다.
- username 입력은 소문자로 바꾸고 공백을 지웁니다. 소개글이 비어 있으면 `소개글 추가하기` 안내를 흐리게 보여줍니다.
- **접근성:** 보기 상태는 `role="button"`·`tabIndex=0`·`aria-label="표시 이름 수정"` 등, 오류는 `role="alert"` + `aria-invalid`·`aria-describedby`.
- **로그인 시 초기값 자동 설정** (`ensureProfile`, 트랜잭션): 프로필이 없으면 만듭니다.
  - `username` = 이메일 앞부분 (규칙에 맞게 소문자·`-`로 보정, 예: `Lee.Dae-Geon@…` → `lee-dae-geon`, 너무 짧으면 `-link`를 붙임). 이미 쓰는 사람이 있으면 `cleangabby2`, `cleangabby3` … 순서로 비어 있는 것을 고릅니다.
  - `displayName` = Google 계정 이름 (없으면 username)
  - 이 브라우저에 로그인 전에 저장해 둔 소개글이 있으면 첫 로그인 계정이 한 번만 가져갑니다.
- **username 규칙:** 영문 소문자·숫자·`_`·`-`, 3~20자, 처음과 끝은 영문/숫자. 사이트 경로와 겹치는 이름(`mypage`, `api`, `admin`, `login` 등)은 사용할 수 없습니다.
- **저장:** `users/{uid}/profile/main`에 기록합니다. username이 바뀌면 같은 트랜잭션 안에서 `usernames/{새 이름}`이 비어 있는지 **중복 체크**하고, 비어 있으면 새 이름을 차지하고 예전 이름을 놓아줍니다. 이미 다른 사람이 쓰면 username 입력 칸 아래에 "이미 사용 중인 username이에요" 오류를 띄웁니다.
- **Display Name 중복 확인:** displayName을 바꾸려 하면 저장 전에 Firestore에서 같은 displayName을 가진 다른 사용자가 있는지 조회합니다 — `where("displayName", "==", newName)`.
  - 프로필이 `users/{uid}/profile/main`에 있으므로 모든 사용자의 `profile` 하위 컬렉션을 한 번에 찾는 **컬렉션 그룹 쿼리**(`collectionGroup("profile")`)를 씁니다. (`users/{uid}` 문서는 이메일이 있어 본인만 읽을 수 있어서 대상에서 제외)
  - 내 프로필은 제외하고, 다른 사용자가 쓰고 있으면 표시 이름 칸 아래에 "이미 다른 사용자가 쓰고 있는 표시 이름이에요" 오류를 띄우고 **저장을 중단**합니다. displayName을 바꾸지 않았으면 조회하지 않습니다.
  - 비교는 입력값을 앞뒤 공백만 정리한 **정확히 같은 문자열** 기준입니다 (대소문자·띄어쓰기가 다르면 다른 이름).
  - 필요한 설정: `firestore.indexes.json`의 `profile.displayName` 컬렉션 그룹 인덱스, 보안 규칙 `match /{path=**}/profile/{docId} { allow read: if true; }`.
  - 참고: 조회와 저장 사이가 트랜잭션이 아니어서, 두 사람이 같은 순간에 같은 이름으로 저장하면 둘 다 통과할 수 있습니다 (username은 트랜잭션으로 막음).
  - 처음 로그인할 때 자동으로 넣는 기본 displayName(Google 이름)은 중복 확인 대상이 아닙니다.
- 결과: **username을 바꾸면 `/{username}` 주소가 바로 준비됩니다.**
- 예전의 마이페이지 프로필 수정 폼(`profile-form.tsx`)과 메인 편집 모드는 2026-11-05에 없앴습니다.

### 3.8 공개 개인 페이지 — 동적 라우팅 (`/{username}` 또는 `/{displayName}`, `src/app/[username]/page.tsx`)
- **동작 순서:**
  1. URL에서 주소 글자를 꺼냅니다 (한글·띄어쓰기는 디코딩, 앞뒤 공백 정리).
  2. **username으로 먼저 찾기:** 소문자로 맞춘 값이 username 규칙에 맞으면 Firestore `usernames/{username}`에서 `userId`를 찾습니다 (서버에서 REST로 조회).
  2-1. **없으면 displayName으로 찾기 (2026-11-05):** `collectionGroup("profile")`에서 `where("displayName", "==", 주소 글자)`로 조회해 `users/{userId}/profile/main`의 `userId`를 꺼냅니다 (서버에서 REST `runQuery`, `allDescendants: true`). 대소문자·띄어쓰기까지 정확히 같아야 하고 30자 이내일 때만 조회합니다. 저장할 때 displayName 중복을 막지만(§3.7) 혹시 둘 이상이면 먼저 나온 사람을 보여줍니다.
  3. 찾은 userId로 `users/{userId}/profile/main`과 `users/{userId}/links`를 조회합니다 (브라우저에서 TanStack Query로 한 번 조회, 내 링크 페이지와 같은 캐시 키).
  4. 화면에 프로필 정보와 링크 리스트를 표시합니다 — 상단 프로필 카드(사진·이름·@username·소개글), 하단 링크 리스트(버튼 형태, 카드 순서).
  5. username·displayName 둘 다 찾지 못하면 404 페이지(`app/not-found.tsx`)를 보여줍니다. 검색엔진 색인 제외(`noindex`).
- **로그인 불필요:** 누구나 볼 수 있습니다. 본인이 보면 "방문자에게 보이는 내 공개 페이지예요" 안내와 `내 페이지 편집` 버튼(홈으로 가서 인라인 수정)이 보이고, 다른 사람에게는 `나도 MyLink 만들기` 링크가 보입니다.
- **같은 화면 구성:** 내 링크 페이지(홈)와 공개 페이지는 같은 카드 컴포넌트(`ProfileCardView`)를 써서 방문자가 보는 모습과 내가 보는 모습이 같습니다. 홈에서는 `editable`로 인라인 수정만 켭니다.
- 탭 제목: `{displayName} (@{username}) | MyLink`.
- Next.js 16 `cacheComponents`에 맞춰 동적 params와 `usePathname`(헤더 메뉴)은 `<Suspense>` 안에서 읽습니다.
- 결과: **`/cleangabby`(username)나 `/대건`(displayName)으로 접속하면 그 사용자의 링크 페이지가 보입니다.** 공유용 주소는 깨지지 않는 username 주소(`링크 주소 복사`)를 권장합니다 — 한글 displayName은 주소창 밖에서 `%EB%8C%80…`처럼 인코딩되어 보이고, 이름을 바꾸면 예전 주소가 끊깁니다.
- 폴더는 `[username]` 하나입니다. 같은 자리에 동적 폴더 두 개(`[username]`, `[displayName]`)는 둘 수 없어서, 한 페이지에서 두 방식을 차례로 찾습니다. 필요한 설정은 displayName 중복 확인과 같습니다 (컬렉션 그룹 인덱스 + `/{path=**}/profile/{docId}` 읽기 규칙).
- 프로필 메뉴의 `링크 주소 복사`는 이제 `{도메인}/{username}`을 복사하고, `내 공개 페이지`로 바로 갈 수 있습니다.
### 3.9 클릭 통계 (13주차) — 클릭 카운트 저장 · 링크별 클릭수 · 마이페이지 통계 · `/stats`
- **목표:** 링크 클릭 횟수를 기록하고(데이터 집계), 동시에 눌려도 정확하게 세고(동시성 해결), 총 클릭수와 링크별 클릭수를 보여준다(통계 UI).
- **클릭 카운트 저장** (`incrementLinkClick`, `src/lib/links-repository.ts` / `useLinkClick`, `src/hooks/use-links.ts`)
  1. 링크 버튼을 누르면(`onClick`, 마우스 가운데 버튼 `onAuxClick` 포함) 감지합니다. 이동은 막지 않아 **새 탭(`target="_blank"`)으로 그대로 열립니다.**
  2. `users/{ownerUid}/links/{linkId}`에 `updateDoc(..., { clickCount: increment(1) })`를 보냅니다. `ownerUid`는 누른 사람이 아니라 **링크 주인(페이지 주인)** 입니다.
  3. **왜 `increment()`?** 두 사람이 동시에 누를 때 "현재 5를 읽고 6을 저장"하면 둘 다 6을 써서 1번이 사라집니다. `increment(1)`은 Firestore 서버가 더해서 5 → 7이 됩니다. (예전 링크처럼 필드가 없으면 0에서 시작)
  4. 화면 캐시(`["links", uid]`)를 먼저 +1 하고(낙관적 업데이트), 실패하면 **콘솔에 오류**(`[firestore] 클릭 수 저장 실패`)를 남기고 다시 조회해 되돌립니다. 방문자에게 알림·로딩 오버레이는 띄우지 않습니다.
- **무엇을 세나:** 공개 페이지 `/{username}`(·`/{displayName}`)에서 누른 클릭만 셉니다 — 로그인 안 한 방문자 포함. **내 관리 화면(홈 `/` 내 링크 카드, `/mypage`)에서 누른 건 세지 않습니다.** 주인이 누른 클릭이 섞이면 통계가 객관적이지 않기 때문입니다 (강의의 "편집 모드가 아닐 때만 카운트").
- **보안 규칙 업데이트:** 기존 규칙은 링크 수정을 본인만 허용해서, 방문자 클릭은 `PERMISSION_DENIED`로 막혔습니다. 그래서 링크 수정 규칙에 `|| isClickIncrement()`를 추가했습니다 — 바뀐 필드가 `clickCount` 하나뿐이고 `새 값 == 이전 값(없으면 0) + 1`일 때만 누구나 허용. 방문자가 제목·주소를 바꾸거나 클릭 수를 마음대로 정하는 것은 그대로 막힙니다 (§2.2 테스트 표).
- **링크별 클릭수 표시:** `제목 · N 클릭` 형태, 작은 회색 글씨, `clickCount`가 없으면 `0 클릭`.
  - 내 링크 카드(홈 `/`)의 각 링크 버튼, `/mypage` 링크 목록 항목에 보입니다.
  - **공개 페이지(방문자 화면)에서는 숨깁니다.**
- **마이페이지 통계 섹션** (`MyPageStatsSection`, `src/components/link-stats.tsx`): 링크 관리 영역 아래.
  - **총 클릭수**를 큰 숫자로 강조 (`총 234 클릭`) + `링크 N개 중 M개 클릭됨`
  - **링크별 클릭수** — 제목과 클릭수, **클릭수 많은 순** 정렬, 가장 많이 눌린 링크 대비 진행 바
  - 오른쪽 위 `대시보드 >`로 `/stats` 이동. 로그인해야 보이는 페이지라 따로 로그인 확인이 필요 없습니다.
- **통계 대시보드 `/stats`** (`src/app/stats/page.tsx`, `src/components/stats-dashboard.tsx`)
  - **로그인 필수:** 로그아웃 상태면 홈(`/`)으로 보냅니다(`router.replace`). 내 `uid`의 링크만 조회하므로 **본인 통계만** 보입니다.
  - 주요 지표 3개: 총 클릭수 / 가장 인기 있는 링크 / 클릭된 링크 수(전체 중)
  - **링크별 클릭 분석 — shadcn/ui 차트(Recharts) 가로 막대 차트**, 많은 순 상위 8개, 막대 끝에 숫자, 툴팁에 전체 제목. 막대가 자라는 곡선은 `ease-punch`.
  - 전체 링크 순위: 순위·아이콘·제목·`N 클릭`·전체 대비 %·진행 바 (차례로 등장)
  - 링크가 없거나 클릭이 0이면 안내 + `링크 추가하기` / `내 공개 페이지 열기`
  - 이동: 프로필 드롭다운 `통계`, 마이페이지 통계 섹션 `대시보드`. 헤더 로고를 누르면 홈.
  - 차트는 브라우저에서 크기를 재야 해서 화면에 붙은 뒤(마운트 후)에만 그립니다. 서버 렌더링에서 Recharts를 그리면 오류가 나서 그 자리는 로딩 자리로 둡니다.
  - `stats`는 사이트 경로라 username으로 쓸 수 없게 예약어에 추가했습니다.
- **디자인(UI 개선 단계):** 실습 예시의 보라색(`#5B5FC7`) 대신 프로젝트 팔레트(Hearth 강조, Winter 글자, 유리 패널 + 그림자). 림라이트는 바탕 카드 하나에만.

---

## 4. 데이터 스키마 명세 (Data Model)

Phase 1(`localStorage` key: `mylink_state_v1`)과 Phase 2(DB 테이블/문서)에서 공통으로 사용할 JSON 스키마입니다.

```typescript
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

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  bio: string;
  photoURL: string;
  createdAtMs: number | null;
  updatedAtMs: number | null;
}
// 2026-11-05: ShowreelConfig, ProfileData(role·skills·showreel) 제거

// Firestore에서 불러온 링크 (src/lib/links-repository.ts)
export interface StoredLink extends LinkItem {
  order: number;
  createdAtMs: number;
  clickCount: number; // 13주차: 없으면 0
}
```

---

## 5. 디자인 시스템 및 UI/UX 요구사항 (shadcn/ui × Glassmorphism Design System)

프로젝트 내 [Design.md](./Design.md) 규격을 준수하며, **단순히 기본 `shadcn/ui` 스타일을 그대로 사용하는 것이 아니라, `shadcn/ui`의 컴포넌트 아키텍처(`@base-ui/react`, `cva`, `cn`) 위에 Glassmorphism 머티리얼을 결합한 전용 디자인 시스템(Glass-UI System)으로 구축합니다.**

### 5.1 설계 철학 (Core Architecture)
- **구조와 접근성은 `shadcn/ui`, 시각 머티리얼은 `Glassmorphism`:**
  - 포커스 관리, 키보드 내비게이션, ARIA 속성, 변형(Variant) 분기 등 컴포넌트의 뼈대는 `src/components/ui`의 `shadcn/ui` 프리미티브를 기반으로 합니다.
  - 반면 기존의 불투명(Solid) 배경과 단색 보더를 모두 제거하고, **반투명 프로스티드 유리 표면(`backdrop-filter`)**이 모든 `shadcn/ui` 컴포넌트의 기본 시각 언어(Visual Language)로 작동하도록 커스터마이징합니다. 마우스 위치에 반응하는 림라이트(`.glass-rim`)는 **바탕이 되는 메인 카드에만** 적용합니다.

### 5.2 Glassmorphism 디자인 토큰 매핑 (`src/app/globals.css`)
`shadcn/ui`의 시맨틱 CSS 변수를 프로젝트 루트의 `ColorPallete.jpeg` 6색으로 1:1 매핑합니다. 글래스 가장자리의 **커서 반응형 림라이트(`.glass-rim`)**는 유지합니다. **메인 카드(가장 바탕이 되는 블록)에만** 적용하며, 유리판 가장자리를 따라 균일하게 맺히는 빛(inset glow)이 마우스 위치를 중심으로 방사형으로 드러납니다. 마우스와 가까운 가장자리일수록 밝고 멀어질수록 희미해집니다. 테두리 선은 쓰지 않고, 마우스 주변 허공에 뜨는 빛 덩어리나 표면 전체 광택도 쓰지 않습니다.

| `shadcn/ui` 토큰 | Glassmorphism 매핑 값 | 역할 및 시각적 특징 |
| :--- | :--- | :--- |
| `--background` | `#1E0912` (Crow) | 순수 검정을 배제한 웜 다크 베이스 배경 |
| `--foreground` | `#F5ECD1` (Winter White) | 유리 표면 위에서도 4.5:1 이상 명도 대비를 보장하는 텍스트 컬러 |
| `--card` | `rgba(245, 236, 209, 0.08)` | 메인 프로필/링크 카드용 반투명 화이트 유리 표면 (`blur(16px) saturate(180%)` 결합) |
| `--popover` | `rgba(43, 32, 52, 0.92)` (Bleached Cedar) | 모달(`Dialog`)·드롭다운(`Select`)용 고밀도 다크 프로스티드 글래스 표면 (`blur(20px)`) |
| `--primary` | `#E1CAA6` (Hearth) | 핵심 액션 버튼, Primary 링크 강조, 인라인 수정 아이콘·입력 링, 포커스 인디케이터 (글자색은 Crow) |
| `--secondary` | `rgba(245, 236, 209, 0.1)` | 보조 유리 버튼, 배지 칩(`Badge`) 기본 표면 |
| `--accent` | `rgba(55, 67, 95, 0.6)` | Diplomatic(`#37435F`) 기반 호버/활성 하이라이트 표면 |
| `--border` / `--input` | `rgba(245, 236, 209, 0.08)` / `0.16` | 유리 단면의 빛 반사를 표현하는 `1px` 반투명 보더 및 입력창 외곽선 |
| `--ring` | `#E1CAA6` | 키보드 포커스 및 입력 활성 시 표시되는 `2px` Hearth 포커스 링 |
| **서브 액센트 토큰** | `#37435F` / `#74838A` / `#2B2034` | Diplomatic, Bay Wharf, Bleached Cedar — 고정 배경 광원 및 아이콘/배지 포인트 |
| `--destructive` | `#D98C7A` | 팔레트 밖 유일한 의미색 — 삭제 버튼·오류 문구 전용 |

### 5.3 `shadcn/ui` 컴포넌트별 Glassmorphism 구축 규격 (`src/components/ui/*`)
앞으로 추가·구현하는 모든 `shadcn/ui` 컴포넌트는 아래의 Glassmorphism 디자인 시스템 규격으로 확장하여 구축합니다.

1. **`Button` (`src/components/ui/button.tsx`):**
   - `default` (`primary` 변형): Hearth(`#E1CAA6`) 액센트 필 + Crow(`#1E0912`, `on-primary` 토큰으로 변경 가능) 글자색 + 상단 유리 광택 + 호버 시 8% 다크닝 및 리프트 섀도우 + 클릭 시 `-1px` 택타일 프레스(`active:-translate-y-px`).
   - `glass` / `outline` / `secondary` 변형: `bg-winter/14 hover:bg-winter/20 backdrop-blur-md border border-winter/[0.08]` 반투명 유리 버튼 스타일.
2. **`Card` (`src/components/ui/card.tsx`):**
   - `rounded-[20px] backdrop-blur-[16px] backdrop-saturate-[180%] bg-card border-winter/[0.08] shadow-[0_12px_40px_0_rgba(12,3,7,0.5)]`를 내장한 컨테이너 컴포넌트로 구축.
3. **`Input` & `Textarea` & `Label` (`src/components/ui/input.tsx` 등):**
   - 폼 입력 필드(/mypage·링크 모달)는 플로팅 라벨 없이 상단 고정 `Label` + 반투명 유리 입력창(`bg-winter/10 backdrop-blur-md border-winter/22 text-foreground placeholder:text-winter/45`)으로 구성하며, 포커스 시 `2px` Hearth 포커스 링(`ring-offset-2`)을 적용.
4. **`Badge` (`src/components/ui/badge.tsx`):**
   - 링크의 강조 배지(`FEATURED`, `NEW`)를 표현하는 프로스티드 글래스 칩(`backdrop-blur-sm bg-white/14 border-white/25`).
5. **`Dialog` / `Select` / `Switch` (모달 및 컨트롤):**
   - 링크 추가·수정 모달 및 컨트롤은 `z-index` 계층(`overlay: 200`, `modal: 300`, `toast: 500`)을 준수하며, 배경 블러 오버레이 위에 다중 레이어 유리 패널로 렌더링.

### 5.4 반응형 및 모션 원칙
- **반응형 카드 규격:**
  - **모바일 (`360px ~ 767px`):** 카드 너비 `100%`, 패딩 `20px`
  - **태블릿 (`768px ~ 1023px`):** 카드 너비 `80%` (최대 `480px`), 패딩 `28px`
  - **데스크탑 (`1024px ~`):** 카드 너비 `400px` 고정, 패딩 `28px`
- **아이콘 및 애니메이션:**
  - UI 내 이모지 사용을 배제하고 `lucide-react` 아이콘 시스템만 사용합니다.
  - 진입 시 `420ms` 페이드+슬라이드 업(`16px → 0`), 리스트 아이템 간 `80ms` 스태거드 애니메이션, `tw-animate-css` 기반 상태 전환(`transform`, `opacity` 한정)을 적용합니다.
  - **이징:** 기본 Easy Ease(대칭 33 %)나 평범한 `ease-out`은 쓰지 않고, After Effects 속도 그래프식 비대칭 곡선을 씁니다 (Design.md `motion` 토큰).
    - `ease-punch` `cubic-bezier(0.10, 0, 0.05, 1)` — 확 치고 길게 감속 (10 % / 95 %): 진입, 호버
    - `ease-swoosh` `cubic-bezier(0.85, 0, 0.15, 1)` — 천천히 → 슉 → 천천히 (85 % / 85 %): 모달 열림, 드롭다운, 페이지 전환
    - `ease-snap` `cubic-bezier(0.90, 0, 0.90, 1)` — 길게 모았다가 탁 (90 % / 10 %): 배지·저장 완료 같은 강조


### 5.5 사이트 헤더 (`src/components/site-header.tsx`)
- **배치:** 모든 페이지 맨 위에 가로 전체로 붙는 sticky 헤더 (높이 56px, `z-index: 100`). 안쪽 콘텐츠는 최대 폭 1024px로 가운데 정렬.
- **구성:**
  - **왼쪽 — 로고:** MyLink 로고 마크(Hearth 바탕에 맞물린 두 고리, Crow 선) + `MyLink` 워드마크 + `MOTION LINK HUB` 보조 문구(모바일에서는 숨김). 누르면 홈(`/`)으로 이동, 호버 시 마크가 살짝 기울어짐(`ease-punch`).
  - **페이지 이동 메뉴 없음 (2026-11-05):** `홈`·`내 링크 관리`·`내 공개 페이지`는 프로필 드롭다운(§5.5.1)에만 둡니다. 헤더에 같은 메뉴를 또 두지 않습니다. 로고를 누르면 홈으로 갑니다.
  - **오른쪽 — `내 페이지` + 계정:** 로그인하고 프로필이 준비되면 **`내 페이지`** 글래스 버튼(외부 링크 아이콘, 모바일은 아이콘만)이 보이고 내 공개 페이지 `/{username}`으로 이동합니다 (2026-11-05). 내 공개 페이지에 있을 때는 숨기고 `내 페이지 편집`만 보입니다. 버튼과 계정 영역 사이에 세로 구분선. 맨 끝은 로그인 전 `Google로 로그인` 버튼, 로그인 후 **프로필 아이콘 버튼**(§5.5.1).
- **헤더 구분 UI:** 반투명 유리 배경(`bg-crow/45` + `backdrop-blur-xl`)과 아래쪽 1px 구분선(가운데가 밝고 양 끝으로 사라지는 그라디언트). 스크롤하면 배경이 `bg-crow/80`으로 진해지고 그림자가 생김(`ease-swoosh` 300ms).
- **알림 위치:** 저장·오류 알림은 헤더 안이 아니라 헤더 아래 우측(`top: 68px`, `z-index: 500` toast)에 뜸.

#### 5.5.1 프로필 드롭다운 메뉴 (`src/components/profile-menu.tsx`)
- **트리거:** 36px 원형 프로필 사진 버튼 (사진이 없으면 표시 이름 첫 글자). 기본은 옅은 링, 호버 시 Hearth 링, 열려 있으면 2px Hearth 링, 누를 때 살짝 작아짐. `aria-label="계정 메뉴 열기 (@displayName)"`.
- **구성 (위에서 아래로):**
  1. **계정 요약** — 40px 사진, `@displayName`(이메일 앞부분), 이메일, `링크 N개 · 가입 YYYY년 M월 D일` (`users/{uid}`)
  1-1. **링크 주소 복사** — 내 공개 페이지 주소(`{origin}/{username}`, 예: `http://localhost:3000/cleangabby`)를 클립보드에 복사. 성공하면 Sonner로 "링크 주소를 복사했어요" + 복사한 주소, 실패하면 "링크 주소를 복사하지 못했어요" 알림. Clipboard API가 막힌 환경은 textarea 복사로 대신함. 오른쪽에 복사될 도메인을 작게 표시.
  2. **바로가기** — `홈`, `내 링크 관리`(링크 개수 배지), `통계`(`/stats`, 13주차), `내 공개 페이지`. (`프로필 수정` 항목은 인라인 수정으로 바뀌어 2026-11-05에 뺐습니다)
  3. **Google 계정 관리** — 사진·이름은 Google에서 바꾸므로 `myaccount.google.com`을 새 탭으로 연결 (외부 링크 아이콘)
  4. **로그아웃** — 맨 아래, 구분선으로 떼어 실수 방지, Danger 색
- **디자인:** 짙은 유리 패널(`bg-popover` + `backdrop-blur-xl`, 위쪽 은은한 inset 빛), 폭 264px, 모서리 14px. 항목은 높이 36px, 왼쪽 아이콘 박스가 강조 시 Hearth로 바뀜. 구분선은 양 끝이 사라지는 1px 그라디언트.
- **모션:** 버튼 쪽(오른쪽 위)을 기준으로 살짝 커지며 나타나고 작아지며 사라짐 (`ease-swoosh` 200ms).
- **접근성:** Base UI Menu — ↑↓ 키로 이동, Enter로 실행, Esc·바깥 클릭으로 닫힘, 닫히면 포커스가 버튼으로 돌아감. z-index 150 (헤더 100 위).

### 5.6 로딩 오버레이 (`src/components/loading-overlay.tsx`)
- **언제:** 갱신·업데이트 같은 진행 작업이 있을 때 — 로그인 상태 확인, Google 로그인·로그아웃, 링크 불러오기, 링크 저장·수정·삭제·순서 변경, 이전 링크 가져오기.
- **모양 (글래스모피즘):** 페이지 전체를 덮는 오버레이. 배경은 흐려지고(`backdrop-blur-md`, `bg-crow/45`) 아래 화면은 누를 수 없음. 가운데 유리 패널에 로딩 아이콘(로고 마크 + 주위를 도는 Hearth 호)과 진행 문구("링크 저장 중..." 등, 점 세 개 애니메이션).
- **모션:** 호는 한 바퀴마다 천천히 → 슉 → 천천히(`ease-swoosh`), 로고는 길게 모았다가 탁(`ease-snap`)으로 숨쉬기, 오버레이는 220ms 페이드 인. 동작 줄이기 설정에서는 회전 없이 천천히 깜빡이기만.
- **깜빡임 방지:** 250ms 안에 끝나는 작업은 띄우지 않고, 한 번 뜨면 최소 400ms는 보여줌.
- **구조:** `src/store/loading-store.ts`의 작업 목록(`beginLoading(label)` → 끝낼 때 호출). 작업이 겹치면 하나라도 진행 중일 때 계속 보이고, 가장 최근 작업의 문구를 표시. z-index 400(모달 300 위, 토스트 500 아래).

### 5.7 알림 (Sonner, `src/components/app-toaster.tsx`)
- **용도:** 사용자가 한 동작의 결과를 짧게 알려줄 때 (예: 링크 주소 복사). 진행 중 상태는 로딩 오버레이(§5.6), 저장 결과는 기존 헤더 아래 알림을 사용.
- **위치:** 화면 우측 상단, 헤더 아래(`top: 72px`, 모바일은 좌우 12px 여백으로 가로 꽉 차게). 2.6초 뒤 자동으로 사라짐.
- **모양:** 기본 스타일을 끄고(`unstyled`) 짙은 유리 패널로 통일 — `bg-popover` + `backdrop-blur-xl`, 모서리 14px, 위쪽 은은한 inset 빛. 제목 13px 굵게, 설명은 모노 11px.
- **아이콘:** 성공 Hearth 체크, 오류 Danger 느낌표, 안내 Bay Wharf, 진행 Hearth 회전.
- **모션:** Sonner 기본 전환 곡선을 `ease-punch`(확 치고 길게 감속)로 교체.
---

## 6. 사용자 시나리오 (User Scenarios)

### 6.1 전체 사용자 여정 흐름도 (User Flow)

```mermaid
flowchart TD
  Start(["마이링크 접속"]) --> Role{"사용자 유형"}

  %% 방문자 흐름
  Role -->|방문자: 클라이언트 / 구독자| View["공개 페이지 /{username}<br/>(Glass 카드 & 프로필 확인)"]
  View --> Action{"주요 행동 선택"}
  Action -->|유튜브 / 인스타 클릭| External["새 탭(_blank)으로<br/>해당 소셜 채널 이동"]
  Action -->|프로젝트 문의 클릭| Mail["기본 메일 앱 실행<br/>(mailto:cleangabby@gmail.com)"]

  %% 관리자 흐름
  Role -->|관리자: 디자이너 본인| SignIn["헤더 'Google로 로그인'<br/>(users/{uid} 기록)"]
  SignIn --> Hub["홈 = 내 링크 카드"]
  Hub -->|이름·@username·소개 클릭| Inline["그 자리에서 입력 칸으로 전환<br/>Enter 저장 · Esc 취소"]
  Inline --> SaveProfile["Firestore profile/main 저장<br/>(중복 확인) + Sonner 알림"]
  Hub -->|드롭다운 내 링크 관리| MyPage["/mypage<br/>(users/{uid}/links)"]
  MyPage --> LinkAction{"링크 작업"}
  LinkAction -->|빠른 추가 / 상세 추가| AddLink["제목·주소(+부제목·아이콘·배지·스타일) 입력"]
  LinkAction -->|수정 / 삭제| EditLink["연필·휴지통 아이콘"]
  LinkAction -->|순서 변경| Reorder["'카드 순서' 보기에서 위·아래 이동"]
  AddLink & EditLink & Reorder --> Firestore["Firestore 저장 → 메인 카드에 즉시 반영"]
```

---

### 6.2 시나리오 A: 외주 클라이언트 / 채용 담당자 (데스크탑 환경)
- **페르소나:** 브랜드 캠페인 모션그래픽 제작을 맡길 디자이너를 찾고 있는 에이전시 PD 김 대리
- **상황 및 목표:** 인스타그램 프로필이나 명함에 적힌 마이링크 URL을 통해 데스크탑 브라우저로 접속하여 디자이너의 작업 역량을 빠르게 검증하고 연락하고 싶음.
- **상세 흐름 (Step-by-Step):**
  1. **첫인상 및 역량 파악:** 페이지 접속과 동시에 `420ms` 페이드업 애니메이션으로 Glassmorphism 카드가 등장한다. 마우스를 움직일 때마다 카드 **가장자리에 빛이 맺히는** 림라이트로 디자이너의 감각적인 디테일을 체감하고, 소개글로 어떤 작업을 하는 사람인지 확인한다.
  2. **대표 작업 확인:** 맨 위의 강조(`primary`, `FEATURED`) 링크를 눌러 새 탭에서 대표 영상을 감상한다.
  3. **추가 작업물 확인 및 문의:** 작업 스타일이 마음에 들어 하단의 `YouTube Channel` 링크를 눌러 메이킹 필름을 새 탭에서 확인한 뒤, 다시 마이링크 탭으로 돌아와 **`프로젝트 및 외주 문의`** 버튼을 클릭하여 바로 의뢰 메일을 작성한다.

---

### 6.3 시나리오 B: SNS 팔로워 및 동료 디자이너 (모바일 환경)
- **페르소나:** 유튜브 쇼츠나 인스타그램 릴스에서 모션 작업물을 보고 유입된 모바일 사용자
- **상황 및 목표:** 스마트폰 인앱 브라우저로 접속해 다른 채널들을 구독하고 작업 과정을 살펴보고 싶음.
- **상세 흐름 (Step-by-Step):**
  1. **모바일 최적화 뷰 확인:** `360px~767px` 모바일 해상도에 맞춰 가로 너비 `100%`, 패딩 `20px`로 최적화된 글래스 카드를 스크롤 부담 없이 한 화면에서 확인한다.
  2. **채널 이동:** `YouTube Channel` 또는 `Instagram` 카드를 터치하면 `-1px` 택타일 프레스 피드백과 함께 해당 채널로 즉시 이동하여 구독 및 팔로우를 진행한다.

---

### 6.4 시나리오 C: 디자이너 본인 — 프로필 인라인 수정 및 링크 관리(`/mypage`)
- **페르소나:** 모션그래픽 디자이너 **이대건** (서비스 소유자)
- **상황 및 목표:** 새로운 개인작 영상을 유튜브에 올린 직후, 코드 수정이나 배포 없이 소개글을 다듬고 새 링크를 맨 위에 올리고 싶음.
- **상세 흐름 (Step-by-Step):**
  0. **로그인:** 소개 페이지의 **`Google로 시작하기`**(또는 헤더의 `Google로 로그인`)로 로그인하면 홈이 내 링크 카드로 바뀐다.
  1. **소개글 수정:** 카드의 소개글에 커서를 올리면 ✎ 아이콘이 뜬다. 글을 눌러 입력 칸으로 바꾸고 고친 뒤 `Ctrl+Enter`(또는 바깥 클릭)로 저장한다. "소개글을 저장했어요" 알림이 뜬다.
  2. **이름·username 수정:** 같은 방법으로 표시 이름이나 `@username`을 눌러 고치고 `Enter`. 이미 누가 쓰는 이름이면 입력 칸 아래에 오류가 뜨고, 다른 이름으로 바꿔 다시 저장한다. username을 바꾸면 알림에 새 공개 주소가 나온다.
  3. **링크 관리로 이동:** 프로필 드롭다운의 **`내 링크 관리`**를 눌러 `/mypage`로 간다.
  4. **링크 추가:** 급하면 제목·주소만 입력하고 `추가`. 꾸미고 싶으면 `상세 추가`로 부제목, 아이콘, 강조 배지(`NEW`), 스타일(`primary`)까지 입력한다. 저장되면 목록 맨 위(최신순)에 나타난다.
  5. **수정·삭제·순서 변경:** 연필 아이콘으로 고치고, 휴지통으로 지우고, `카드 순서` 보기에서 화살표로 순서를 바꾼다.
  6. **공유:** 드롭다운의 `링크 주소 복사`로 `/{username}` 주소를 복사해 SNS 프로필에 붙인다. 링크는 Firestore에 저장되어 다른 기기에서도 똑같이 보인다.

---

## 7. 메인 화면 와이어프레임 (Wireframes)

### 7.0 소개 페이지 (`/` — 로그인 전)

```text
+---------------------------------------------------------------------------+
| [∞] MyLink                                          [ G Google로 로그인 ] |  <-- 메뉴 없음
+---------------------------------------------------------------------------+
|                                                                           |
|  ( ✦ MOTION LINK HUB )                        +-----------------------+   |
|                                               |  (사람 아이콘)          |   |  <-- 떠 있는 미리보기
|  움직이는 작업을,                              |  @yourname            |   |      카드 (기울기 +
|  한 장의 링크로.   <-- Winter→Hearth 그라디언트 |  소개 한 줄            |   |      floatY 왕복)
|                                               |  [▶ Vimeo 포트폴리오 ] |   |
|  포트폴리오, 유튜브, 인스타그램, 외주 문의까지 ..|  [  YouTube         ] |   |
|                                               |  [  Instagram       ] |   |
|  [ G  Google로 시작하기 ]   기능 살펴보기 ↓      |  [  외주 문의        ] |   |
|  • 별도 가입 없이 Google 계정으로 • 계정별 자동 저장 • 모바일에서도 그대로   |
|                                                                           |
|  FEATURES  링크 페이지에 필요한 것만, 정성껏                                 |
|  +-------------------------------------+  +-----------------------+       |
|  | 흩어진 채널을 한 장에 (큰 카드)        |  | 보이는 그대로 고치기    |       |
|  | [Vimeo][YouTube][Instagram]...       |  +-----------------------+       |
|  |                                     |  | 어디서든 같은 링크      |       |
|  +-------------------------------------+  +-----------------------+       |
|  +---------------------------------------------------------------+       |
|  | 움직임이 있는 유리 질감 (가로 카드)                               |       |
|  +---------------------------------------------------------------+       |
|                                                                           |
|  HOW IT WORKS        +------------------------------------------+         |
|  세 단계면 충분해요    | (01) Google 계정으로 로그인                 |         |
|                      | (02) 링크 추가하고 꾸미기                    |         |
|                      | (03) 주소 하나로 공유                       |         |
|                      +------------------------------------------+         |
|                                                                           |
|  +---------------------------------------------------------------+       |
|  |   지금, 내 작업에 어울리는 링크 페이지를 만들어 보세요              |       |
|  |                 [ G  Google로 시작하기 ]                        |       |
|  +---------------------------------------------------------------+       |
|                    © 2026 MyLink · Motion Link Hub                        |
+---------------------------------------------------------------------------+
```

- **디자인 원칙:** 기능 카드는 크기가 다른 벤토 배치(같은 폭 3단 금지). 첫 화면 요소는 80ms 간격으로 차례로 등장(`ease-punch`), 미리보기 카드는 3.6초 주기로 천천히 떠오르고 가라앉음(`ease-swoosh` 왕복, 동작 줄이기 설정 시 정지). 미리보기 카드에만 커서 반응 림라이트.
- **모바일:** 첫 화면이 세로로 쌓이고(소개 → 미리보기 카드), 기능 카드는 한 줄씩.

### 7.1 내 링크 페이지 (홈 `/` — 로그인 후, 공개 페이지와 같은 카드)

```text
+-----------------------------------------------------------------------+
|  Viewport (min-h-[100dvh], Crow #1E0912 + Static Light Pools)        |
|  [∞] MyLink                                                  (C)      |
|                                                                       |
|           +-----------------------------------------------+           |
|           |  ══════════ Warm Dark Glass Card ═══════════ |           |
|           |  (Mobile 100% / Tablet 80% / Desktop 400px)   |           |
|           |                                               |           |
|           |                  .---------.                  |           |
|           |                 /           \                 |           |
|           |                |     이      | (120 x 120px)  |           |
|           |                 \           /                 |           |
|           |                  '---------'                  |           |
|           |                                               |           |
|           |                    이대건  ✎                   | <-- H1 (호버 시 ✎) |
|           |                 @cleangabby                   | <-- username |
|           |                                               |           |
|           |    움직임으로 이야기를 전하는 모션그래픽      | <-- Body  |
|           |  디자이너입니다. 브랜드의 메시지를 만듭니다.   |           |
|           |                                               |           |
|           |  -------------------------------------------  |           |
|           |                                               |           |
|           |  +-----------------------------------------+  |           |
|           |  | [▷] YouTube Channel                   → |  | <-- 링크1 |
|           |  |     모션그래픽 개인작 & 작업 과정       |  |  (Glass)  |
|           |  +-----------------------------------------+  |           |
|           |                                               |           |
|           |  +-----------------------------------------+  |           |
|           |  | [◎] Instagram                         → |  | <-- 링크2 |
|           |  |     짧은 모션 실험실 & 아트워크 노트    |  |  (Glass)  |
|           |  +-----------------------------------------+  |           |
|           |                                               |           |
|           |  +-----------------------------------------+  |           |
|           |  | [✉] 프로젝트 및 외주 문의             → |  | <-- 링크3 |
|           |  |     cleangabby@gmail.com                |  |  (Glass)  |
|           |  +-----------------------------------------+  |           |
|           |                                               |           |
|           |          © 2026 @cleangabby (로그인 시)        | <-- Footer|
|           +-----------------------------------------------+           |
|                                                                       |
+-----------------------------------------------------------------------+
```

### 7.2 인라인 수정 상태 (본인 카드)

표시 이름을 눌렀을 때 (소개글은 3줄 입력 칸, `Ctrl+Enter` 저장):

```text
           |  보기 (호버)             이대건  ✎        |  <-- 배경 살짝 밝아짐 + 작은 ✎
           |                                               |
           |  수정  +-------------------------------+ [✓] |  <-- Hearth 2px 링
           |        |  이대건|                       | [×] |
           |        +-------------------------------+     |
           |        Enter 저장 · Esc 취소                  |  <-- 안내 (오류면 Danger 문구)
           |                                               |
           |  오류  +-------------------------------+ [✓] |  <-- Danger 링
           |        | @ cleangabby2                 | [×] |
           |        +-------------------------------+     |
           |        이미 사용 중인 username이에요. ...       |
```

### 7.3 (제거) 편집 모드 화면
- 2026-11-05에 편집 모드를 없앴습니다. 프로필은 §7.2 인라인 수정, 링크는 §7.4 `/mypage`.

### 7.4 내 링크 관리 화면 (`/mypage` — 관리자 시점)

```text
+-----------------------------------------------+
|  [← 마이링크로 돌아가기]                       |
|                                               |
|  내 링크 관리                                  | <-- H1
|  메인 카드에 보이는 링크를 여기서 관리해요.    |
|                                               |
|  제목  [ 예: 유튜브 채널                   ]  |
|  주소  [ https://...                       ]  |
|  [        + 추가        ] [ ⚙ 상세 추가 ]     | <-- 빠른 추가 / 모달
|                                               |
|  -------------------------------------------  |
|  링크 목록 (7)           [최신순|카드 순서]    | <-- 정렬 보기 전환
|  +-----------------------------------------+  |
|  | [▷] YouTube Channel ↗          [✎] [🗑] |  |
|  |     모션그래픽 개인작 & 작업 과정        |  |
|  |     11월 4일 오후 12:06                  |  |
|  +-----------------------------------------+  |
|  | [✦] Coloso 클래스 [NEW] ↗      [✎] [🗑] |  |
|  +-----------------------------------------+  |
|  ('카드 순서' 보기에서는 [↑][↓] 이동 버튼 추가) |
+-----------------------------------------------+
```


### 7.5 로그인 상태별 화면 (Google 소셜 로그인)

**사이트 헤더 (메인·/mypage 공통, 화면 맨 위 sticky — §5.5)**

```text
로그인 전
+---------------------------------------------------------------------------+
| [∞] MyLink                                            [ G Google로 로그인 ] |
|     MOTION LINK HUB                                                       |
+---------------------------------------------------------------------------+
  ───────────── 1px 구분선 (가운데 밝고 양 끝으로 사라짐) ─────────────

로그인 후 (메인) — 페이지 이동은 프로필 드롭다운에서만
| [∞] MyLink                                    [↗ 내 페이지] │ (C) |  <-- 내 공개 페이지 / 프로필 아이콘 버튼
                                                     +------------------------------+
                                                     | (C)  cleangabby              |
                                                     |      @cleangabby             |
                                                     | 링크 7개 · 가입 2026년 11월 4일 |
                                                     | [⧉] 링크 주소 복사 /cleangabby |
                                                     | ---------------------------- |
                                                     | 바로가기                      |
                                                     | [⌂] 홈                        |
                                                     | [≡+] 내 링크 관리         [7] |
                                                     | [↗] 내 공개 페이지            |
                                                     | ---------------------------- |
                                                     | [⚙] Google 계정 관리       ↗ |
                                                     | ---------------------------- |
                                                     | [⎋] 로그아웃 (Danger)         |
                                                     +------------------------------+

모바일 (375px): 보조 문구·버튼 글자 숨김
| [∞] MyLink                                  [↗] │ (C) |
```

**/mypage — 로그인 전**

```text
+-----------------------------------------------+
|  [← 마이링크로 돌아가기]                       |
|  내 링크 관리                                  |
|  Google 계정으로 로그인하면 나만의 링크 목록을 |
|  관리할 수 있어요.                             |
|  + - - - - - - - - - - - - - - - - - - - - +  |
|  :                 ( 🔒 )                  :  |
|  :        로그인 후 사용할 수 있어요         :  |
|  :  ✓ 제목·주소만으로 빠르게 링크 추가      :  |
|  :  ✓ 부제목·아이콘·배지·스타일 상세 추가   :  |
|  :  ✓ 메인 카드에 보이는 순서 바꾸기        :  |
|  :  ✓ 새로고침·다른 기기에서도 유지         :  |
|  :     [ G  Google 계정으로 로그인 ]        :  |
|  + - - - - - - - - - - - - - - - - - - - - +  |
+-----------------------------------------------+
```

**/mypage — 로그인 후 (상단 계정 정보 패널)**

```text
|  +-----------------------------------------+  |
|  | (사진) cleangabby                        |  |
|  |        users/AbC123...                   |  |  <-- Firestore users/{uid}
|  | 이메일        ...@gmail.com              |  |
|  | 가입일        2026년 11월 4일 오후 2:10  |  |
|  | 마지막 로그인  2026년 11월 4일 오후 2:10  |  |
|  | 내 링크        7개                       |  |
|  +-----------------------------------------+  |
|  (이하 빠른 추가 폼 · 링크 목록 — §7.4)        |
|  목록이 비어 있고 공용 링크가 있으면:           |
|  [ ⤓ 이전 링크 7개 가져오기 ]                   |
```
---

## 8. 마일스톤 (Milestones)

| 마일스톤 | 상태 | 범위 | 완료 기준 |
| :--- | :---: | :--- | :--- |
| **M1. 프로필 페이지 기초** | 완료 | 프로필 페이지, README, 모션그래픽 디자이너 소개 | 기본 프로필 화면 표시 |
| **M2. 글래스 링크 허브 + 편집 모드** | 완료 | 글래스 카드, 대표 쇼릴 인라인 재생, 편집 모드, 링크 CRUD, localStorage 저장 | 편집 내용이 새로고침 후에도 유지 |
| **M3. 디자인 시스템 정비** | 완료 | ColorPallete 6색 토큰, 커서 반응형 번짐 림라이트, AE식 비대칭 이징 토큰 | Design.md 규격과 화면 일치 |
| **M4. 링크 추가 기능 (Create) — 7주차** | 완료 (2026-11-04) | `/mypage` 페이지, 링크 추가 폼(제목·주소·버튼), 추가 시 목록 반영, 입력 칸 자동 비우기, 빈 칸 검증 / Zustand 상태관리, Zod + React Hook Form 유효성 검사 도입 | 체크리스트 6개 항목 통과 (§8.1) |
| **M5. Firestore 링크 CRUD** | 완료 (2026-11-04) | Create·Read(createdAt 최신순, 2026-11-05부터 TanStack Query 조회)·Update·Delete·순서 변경을 Firestore `users/anonymous/links`로 이전, localStorage 링크 1회 마이그레이션, **링크 관리를 `/mypage`로 일원화**(편집 모드는 프로필·쇼릴 전용) | 새로고침·다른 기기에서도 목록 유지, `/mypage` 변경이 메인 카드에 즉시 반영 |
| **M6. Phase 2 — 로그인·개인화** | 완료 (2026-11-04) | Firebase SDK·Analytics / Google 소셜 로그인, 로그인 상태별 화면, `users/{uid}/links` 개인화 / 프로필 Firestore 이전(`users/{uid}/profile/main`), 프로필 수정·username 중복 체크, 공개 페이지 `/{username}`·404, 보안 규칙 배포·테스트 | 다른 기기·다른 사람도 `/{username}`에서 같은 링크를 보고, 쓰기는 본인만 가능 |
| **M7. 카드 단순화 + 인라인 수정** | 완료 (2026-11-05) | 편집 모드·대표 쇼릴·직무 타이틀·기술 스택 제거, 이름·@username·소개 인라인 수정(`InlineEditableText`), /mypage 프로필 폼·주소 복사 제거, 드롭다운 `프로필 수정` 제거, 헤더 메뉴 제거, TanStack Query·Firestore Lite 전환 | 카드에서 텍스트를 눌러 고치고 저장되며, 중복·형식 오류가 입력 칸 아래에 표시됨 |
| **M8. 클릭 통계 — 13주차** | 완료 (2026-11-05) | 링크 클릭 시 `increment(1)`로 클릭수 저장(새 탭 유지), 방문자 +1만 허용하는 보안 규칙, 링크별 클릭수 표시, 마이페이지 통계 섹션, `/stats` 대시보드(shadcn 차트), 드롭다운 `통계` | 공개 페이지에서 링크를 누르면 Firestore `clickCount`가 1씩 오르고, 마이페이지·`/stats`에 많은 순으로 보임. 로그아웃하면 `/stats` 접근 차단 |

### 8.1 M4 체크리스트 (7주차 실습)
- [x] `/mypage` 페이지 만들기 — `src/app/mypage/page.tsx`
- [x] 링크 추가 폼 만들기 (제목, 주소, 버튼)
- [x] 추가 버튼 클릭 시 목록에 추가 — (M4 당시) `useMyPageStore.addLink` → (M5) `useLinksStore.addLink` → (2026-11-05) `useLinkActions().addLink` (TanStack Query)
- [x] 입력 칸 자동으로 비우기 — 성공 시 `reset()` + 제목 칸 포커스
- [x] 빈 칸 검증 추가하기 — `quickLinkSchema` (Zod) + React Hook Form
- [x] 테스트: 링크 추가 → 새로고침 → 사라짐 확인 — 메모리 상태라 새로고침 시 목록 0개 (브라우저에서 확인)

### 8.2 8주차 체크리스트 (개인화·공개 페이지·보안)
- [x] 프로필 수정 기능 추가 — username·displayName·bio + 저장, 로그인 시 초기값 자동 설정, username 중복 체크, 저장 성공 알림 (§3.7, 2026-11-05부터 마이페이지 폼 대신 카드 인라인 수정)
- [x] `/[username]` 페이지 생성 — URL에서 username 추출 → userId 찾기 → 프로필·링크 표시, 없으면 404 (§3.8)
- [x] `/[displayName]` 동적 라우팅 — displayName으로 유저 검색(컬렉션 그룹 쿼리) → `users/{userId}/links` 표시, 없으면 404. username 주소와 같은 페이지에서 username 먼저, 없으면 displayName (§3.8)
- [x] 헤더·프로필 드롭다운에 개인 페이지 이동 — 헤더 `내 페이지` 버튼, 드롭다운 `내 공개 페이지` (§5.5, §5.5.1)
- [x] Security Rules 설정 + 테스트 — 읽기 누구나, 쓰기 본인만, `firestore.rules` 배포, `scripts/test-firestore-rules.mjs` 8/8 통과 (§2.2)

### 8.3 13주차 체크리스트 (클릭 통계 기능)
강의 영상(`녹음 2026-11-05 222403.mp4`, 17분)의 화면 자막·체크리스트와 음성 받아쓰기(faster-whisper)로 정리했습니다.

**이번 차시 핵심 3가지**
1. **데이터 집계:** 흩어진 데이터(링크마다의 클릭수)를 모아 의미 있는 정보(총 클릭수·순위)로.
2. **동시성 해결:** "현재 값 + 1"을 브라우저가 계산하지 않고 서버에 "+1 해줘"(`increment`)를 요청 → 동시에 눌러도 정확.
3. **통계 UI:** 총 클릭수 + 링크별 클릭수를 시각화.

**시작 전 확인**
- [x] 12주차 프로젝트 준비 (개인별 페이지 `/{username}` 완료)
- [x] Firebase 콘솔 / Firestore에 테스트 링크 있음

**Step 1. 링크 클릭 카운트 저장** — "링크 클릭 시 클릭 카운트 저장해줘. onClick 핸들러 추가, increment(1)로 clickCount 증가, 경로 users/{userId}/links/{linkId}, 링크는 새 탭에서 열림 유지"
- [x] 링크를 클릭하면 새 탭에서 열림 (`target="_blank"` 유지 확인)
- [x] Firestore에 `clickCount` 필드가 생김 — 필드가 없던 링크가 첫 클릭에 1
- [x] 클릭할 때마다 숫자가 증가 — 연속 3번 클릭 → 1 → 4 (손실 없음)
- [x] 오류 해결: Security Rules 업데이트 — 배포 전 방문자 +1은 403(`PERMISSION_DENIED`), 규칙 배포 후 200. 방문자가 제목·URL을 바꾸면 차단, clickCount만 +1은 허용

**Step 2. 링크별 클릭수 표시** — "링크 목록에 클릭수 표시해줘. 'Instagram · 5 클릭' 형태, clickCount 없으면 0, 작은 회색 텍스트"
- [x] 각 링크 옆에 클릭수 표시 (`/mypage` 목록, 내 링크 카드)
- [x] `제목 · N 클릭` 형태
- [x] clickCount가 없는 링크는 `0 클릭`
- [x] 공개 페이지(방문자 화면)에서는 숨김 (강의 피드백 반영)

**Step 3. 통계 페이지 제작** — "통계 페이지(/stats) 만들어줘. 로그인 필수(비로그인 시 리다이렉트), 총 클릭수(모든 링크 합산), shadcn 차트 컴포넌트 사용, 통계 페이지 링크는 프로필 드롭다운에"
- [x] `/stats` 접속됨 (빌드 라우트 `○ /stats`)
- [x] 총 클릭수 표시
- [x] 링크가 클릭수 순으로 정렬
- [x] 로그아웃 시 접근 차단 → 홈(`/`)으로 이동
- [x] 마이페이지에 통계 섹션 추가 (링크 관리 아래, 총 클릭수 큰 숫자 + 링크별 많은 순)
- [x] 프로필 드롭다운에 `통계` 추가

**Step 4. UI 개선 (선택)** — "/stats 페이지 예쁘게. 진행 바(최대 클릭수 대비 비율), 카드 그림자, (보라색 계열)"
- [x] 진행 바 표시 (가장 많이 눌린 링크 = 100%, 자라는 애니메이션 `ease-punch`)
- [x] 카드 그림자·유리 패널, 주요 지표 카드(총 클릭수·가장 인기 있는 링크·클릭된 링크 수), 순위·비율(%)
- [x] 색은 보라색 대신 프로젝트 팔레트(Hearth) — Design.md 규칙
- [x] 헤더 유지(로고 → 홈), 모바일 375px 세로 배치 확인

**Step 5. 최종 테스트**
- [x] 링크 클릭 → 새 탭 열림 + 카운트 증가 (로그인 안 한 방문자로 확인)
- [x] 링크 목록에 클릭수 표시
- [x] `/stats`에서 총 클릭수 표시, 클릭수 많은 순 정렬 (예시 데이터로 화면 확인)
- [x] 로그인해야 통계 조회 가능 (로그아웃 상태 `/stats` → `/`)
- [x] 보안 규칙 테스트 12/12 통과 (`node scripts/test-firestore-rules.mjs`), `next build` 성공
