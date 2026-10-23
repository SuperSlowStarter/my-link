# PRD (제품 요구사항 및 기능 정의서) — 마이링크 (MyLink)

- **문서 버전:** v1.0
- **작성일:** 2026-10-07
- **프로젝트명:** 마이링크 (MyLink)
- **서비스 정의:** 모션그래픽 디자이너를 위한 인터랙티브 Glassmorphism 개인 프로필 & 쇼릴 링크 허브

---

## 1. 프로젝트 개요 (Overview)

### 1.1 배경 및 목적
모션그래픽 디자이너 **이대건**의 작업물(쇼릴, 유튜브, 인스타그램)과 외주 문의 창구를 하나의 URL로 연결하는 개인 전용 링크트리(Linktree) 웹 애플리케이션입니다. 단순한 링크 나열을 넘어, 디자이너의 감각을 보여주는 **마우스 커서 반응형 림라이트(Specular Rim Light) Glassmorphism UI**와 **대표 쇼릴 인라인 재생** 경험을 제공하며, 코드 수정 없이 웹 화면에서 즉시 콘텐츠를 관리할 수 있는 **실시간 편집 모드(Edit Mode)**를 지원합니다.

### 1.2 타겟 사용자
1. **관리자 (Owner):** 본인(모션그래픽 디자이너 이대건) — 브라우저 내 편집 모드를 통해 프로필, 기술 스택, 쇼릴 영상, 외부 링크를 추가·수정·삭제.
2. **방문자 (Visitors):** 클라이언트, 채용 담당자, 동료 디자이너 및 구독자 — 데스크탑·태블릿·모바일 환경에서 쇼릴 영상을 감상하고 주요 채널로 이동하거나 프로젝트 문의를 진행.

---

## 2. 데이터 아키텍처 및 단계별 로드맵 (Phased Roadmap)

향후 클라우드 DB 확장을 고려하여 **UI 컴포넌트와 데이터 저장소(Storage Layer)를 분리**하여 설계합니다.

```mermaid
flowchart LR
  UI["MyLink UI (View / Edit Mode)"] --> Adapter["Storage Service Interface"]
  Adapter -->|Phase 1: MVP| Local["Browser LocalStorage (Seed Fallback)"]
  Adapter -.->|Phase 2: Cloud Sync| Cloud["Supabase / Firebase DB + Admin Auth"]
```

| 단계 | 저장 방식 | 주요 목표 및 특징 |
| :---: | :--- | :--- |
| **Phase 1 (현재 MVP)** | **LocalStorage + 기본 시드 데이터** | • 최초 접속 시 코드에 정의된 기본 프로필/링크 데이터 로드<br/>• 편집 모드에서 수정 시 브라우저 `localStorage`에 즉시 반영 및 유지<br/>• 기본값 복원(Reset to Default) 기능 제공 |
| **Phase 2 (추후 확장)** | **외부 DB (Supabase / Firebase)** | • 간단한 관리자 비밀번호/핀(PIN) 인증을 통한 편집 권한 보호<br/>• 수정 사항이 DB에 저장되어 모든 외부 방문자에게 실시간 동기화 |

---

## 3. 핵심 기능 정의 (Functional Requirements)

### 3.1 화면 모드 전환 (View Mode ↔ Edit Mode)
- **진입 방식:** 별도의 `/admin` 페이지 이동 없이, 화면 우측 상단(또는 하단)의 플로팅 **`편집 모드 (Edit)` 토글 버튼**을 클릭하여 즉시 전환합니다.
- **실시간 미리보기 (Live Preview):** 편집 모드 활성화 시 기존 Glassmorphism 카드 레이아웃을 유지한 채 각 영역(프로필, 쇼릴, 링크 아이템)에 수정·삭제 컨트롤과 추가 버튼이 나타나며, 변경 결과를 실시간으로 확인합니다.

### 3.2 프로필 정보 관리 (Profile Management)
| 항목 | 상세 요구사항 |
| :--- | :--- |
| **프로필 아바타** | • `120px × 120px` 원형 Glass 프레임 + `60FPS` 포인트 배지<br/>• 이미지 URL 입력 시 프로필 사진 렌더링, 미입력 시 텍스트 이니셜(`이`) 표시 |
| **기본 텍스트 정보** | • **이름(H1):** 예) `이대건`<br/>• **직무 타이틀(Label):** 예) `Motion Graphic Designer`<br/>• **소개 문구(Body):** 멀티라인(줄바꿈) 지원 자기소개 텍스트 편집 |
| **기술 스택 태그 (Skills)** | • 보유 툴 태그(`After Effects`, `Blender`, `3ds Max`, `Photoshop`, `Illustrator`, `Premiere Pro` 등) 추가 및 개별 삭제(`×`) 지원 |

### 3.3 대표 쇼릴(Showreel) 인라인 재생 및 미리보기 (Featured Showreel Player)
- **기능 설명:** 모션그래픽 디자이너의 핵심 포트폴리오인 **대표 쇼릴 영상**을 외부 사이트로 이탈하지 않고 마이링크 카드 안에서 바로 재생하거나 미리 볼 수 있는 전용 미디어 블록입니다.
- **상세 동작:**
  1. 편집 모드에서 YouTube URL(예: `https://youtu.be/...` 또는 `https://www.youtube.com/watch?v=...`)과 쇼릴 제목·부제목을 입력합니다.
  2. 유튜브 비디오 ID를 자동 추출하여 고화질 썸네일과 재생(Play) 오버레이 버튼을 카드 내에 렌더링합니다.
  3. 방문자가 재생 버튼을 클릭하면 카드 내 `16:9` 반응형 인라인 플레이어(iframe)로 즉시 전환되어 영상이 재생되며, 필요 시 접기/닫기가 가능합니다.

### 3.4 링크 CRUD 관리 (Link Management)
- **링크 데이터 구조:**
  - `id`: 고유 식별자 (`string`)
  - `title`: 링크 제목 (필수, 예: `YouTube Channel`)
  - `subtitle`: 부연 설명 (선택, 예: `모션그래픽 개인작 & 작업 과정`)
  - `href`: 이동할 URL 또는 `mailto:` 이메일 주소 (필수)
  - `iconType`: 아이콘 프리셋 선택 (`play`, `youtube`, `instagram`, `mail`, `link`, `globe`, `sparkles`)
  - `badge`: 강조 배지 텍스트 (선택, 예: `FEATURED`, `NEW`)
  - `variant`: 버튼 스타일 (`primary` 일렉트릭 블루 강조형 / `glass` 반투명 유리 기본형)
- **CRUD 동작:**
  - **추가 (Create):** 리스트 하단 `+ 새 링크 추가` 버튼을 눌러 글래스 모달(또는 인라인 폼)에서 새 링크 생성
  - **수정 (Update):** 편집 모드에서 개별 링크의 `수정` 아이콘 클릭 시 기존 값을 불러와 즉시 편집
  - **삭제 (Delete):** 편집 모드에서 개별 링크의 `삭제` 아이콘 클릭 시 해당 링크 제거

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
  | "globe";

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
```

---

## 5. 디자인 시스템 및 UI/UX 요구사항 (shadcn/ui × Glassmorphism Design System)

프로젝트 내 [Design.md](file:///c:/Users/daegu/OneDrive/%EB%B0%94%ED%83%95%20%ED%99%94%EB%A9%B4/projects/my-link/mylink/Design.md) 규격을 준수하며, **단순히 기본 `shadcn/ui` 스타일을 그대로 사용하는 것이 아니라, `shadcn/ui`의 컴포넌트 아키텍처(`@base-ui/react`, `cva`, `cn`) 위에 Glassmorphism 머티리얼과 반응형 림라이트를 결합한 전용 디자인 시스템(Glass-UI System)으로 구축합니다.**

### 5.1 설계 철학 (Core Architecture)
- **구조와 접근성은 `shadcn/ui`, 시각 머티리얼은 `Glassmorphism`:**
  - 포커스 관리, 키보드 내비게이션, ARIA 속성, 변형(Variant) 분기 등 컴포넌트의 뼈대는 `src/components/ui`의 `shadcn/ui` 프리미티브를 기반으로 합니다.
  - 반면 기존의 불투명(Solid) 배경과 단색 보더를 모두 제거하고, **반투명 프로스티드 유리 표면(`backdrop-filter`) + 유리 단면 보더(`1px rgba white`) + 커서 반응형 림라이트(`.glass-rim`)**가 모든 `shadcn/ui` 컴포넌트의 기본 시각 언어(Visual Language)로 작동하도록 커스터마이징합니다.

### 5.2 Glassmorphism 디자인 토큰 매핑 (`src/app/globals.css`)
`shadcn/ui`의 시맨틱 CSS 변수를 Glassmorphism 디자인 토큰으로 1:1 매핑하여 시스템 전체에서 일관된 유리 질감을 유지합니다.

| `shadcn/ui` 토큰 | Glassmorphism 매핑 값 | 역할 및 시각적 특징 |
| :--- | :--- | :--- |
| `--background` | `#0D111A` | 순수 검정을 배제한 오프블랙 차콜 베이스 배경 |
| `--foreground` | `#F8FAFC` | 유리 표면 위에서도 4.5:1 이상 명도 대비를 보장하는 텍스트 컬러 |
| `--card` | `rgba(255, 255, 255, 0.18)` | 메인 프로필/링크 카드용 반투명 화이트 유리 표면 (`blur(16px) saturate(180%)` 결합) |
| `--popover` | `rgba(13, 17, 26, 0.82)` | 모달(`Dialog`)·드롭다운(`Select`)용 고밀도 다크 프로스티드 글래스 표면 (`blur(20px)`) |
| `--primary` | `#0080FF` (Electric Blue) | 핵심 액션 버튼, 대표 쇼릴 강조, 포커스 인디케이터 |
| `--secondary` | `rgba(255, 255, 255, 0.12)` | 보조 유리 버튼, 스킬 태그칩(`Badge`) 기본 표면 |
| `--accent` | `rgba(139, 0, 255, 0.28)` | Neon Purple(`#8B00FF`) 기반 호버/활성 하이라이트 표면 |
| `--border` / `--input` | `rgba(255, 255, 255, 0.22)` | 유리 단면의 빛 반사를 표현하는 `1px` 반투명 보더 및 입력창 외곽선 |
| `--ring` | `#0080FF` | 키보드 포커스 및 입력 활성 시 표시되는 `2px` Electric Blue 포커스 링 |
| **서브 액센트 토큰** | `#8B00FF` / `#FF1493` / `#20B2AA` | Neon Purple, Vivid Pink, Teal — 배경 메쉬 광원 오브 및 아이콘/배지 포인트 |

### 5.3 `shadcn/ui` 컴포넌트별 Glassmorphism 구축 규격 (`src/components/ui/*`)
앞으로 추가·구현하는 모든 `shadcn/ui` 컴포넌트는 아래의 Glassmorphism 디자인 시스템 규격으로 확장하여 구축합니다.

1. **`Button` (`src/components/ui/button.tsx`):**
   - `default` (`primary` 변형): Electric Blue(`#0080FF`) 액센트 필 + 상단 유리 광택 + 호버 시 8% 다크닝 및 리프트 섀도우 + 클릭 시 `-1px` 택타일 프레스(`active:-translate-y-px`) + `.glass-rim` 림라이트 적용.
   - `glass` / `outline` / `secondary` 변형: `bg-white/15 hover:bg-white/22 backdrop-blur-md border border-white/22` 반투명 유리 버튼 스타일 및 커서 반응형 `.glass-rim` 기본 탑재.
2. **`Card` (`src/components/ui/card.tsx`):**
   - `backdrop-blur-[16px] backdrop-saturate-[180%] bg-card border-border shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]` 및 상단 엣지 스펙큘러 하이라이트 라인, `.glass-rim` 속성을 내장한 컨테이너 컴포넌트로 구축.
3. **`Input` & `Textarea` & `Label` (`src/components/ui/input.tsx` 등):**
   - 편집 모드에서 사용하는 모든 입력 필드는 플로팅 라벨 없이 상단 고정 `Label` + 반투명 유리 입력창(`bg-white/10 backdrop-blur-md border-white/22 text-foreground placeholder:text-white/45`)으로 구성하며, 포커스 시 `2px` Electric Blue 포커스 링(`ring-offset-2`)을 적용.
4. **`Badge` (`src/components/ui/badge.tsx`):**
   - 기술 스택 태그(`After Effects`, `Blender` 등)와 포인트 배지(`60FPS`, `FEATURED`, `NEW`)를 표현하는 프로스티드 글래스 칩(`backdrop-blur-sm bg-white/14 border-white/25`).
5. **`Dialog` / `Select` / `Switch` (편집 모드 오버레이 및 컨트롤):**
   - 링크 추가·수정 모달 및 컨트롤은 `z-index` 계층(`overlay: 200`, `modal: 300`, `toast: 500`)을 준수하며, 배경 블러 오버레이 위에 다중 레이어 유리 패널로 렌더링.

### 5.4 반응형 및 모션 원칙
- **반응형 카드 규격:**
  - **모바일 (`360px ~ 767px`):** 카드 너비 `100%`, 패딩 `20px`
  - **태블릿 (`768px ~ 1023px`):** 카드 너비 `80%` (최대 `480px`), 패딩 `28px`
  - **데스크탑 (`1024px ~`):** 카드 너비 `400px` 고정, 패딩 `28px`
- **아이콘 및 애니메이션:**
  - UI 내 이모지 사용을 배제하고 `lucide-react` 아이콘 시스템만 사용합니다.
  - 진입 시 `420ms ease-out` 페이드+슬라이드 업(`16px → 0`), 리스트 아이템 간 `80ms` 스태거드 애니메이션, `tw-animate-css` 기반의 부드러운 상태 전환(`transform`, `opacity` 한정)을 적용합니다.

---

## 6. 사용자 시나리오 (User Scenarios)

### 6.1 전체 사용자 여정 흐름도 (User Flow)

```mermaid
flowchart TD
  Start(["마이링크 접속"]) --> Role{"사용자 유형"}

  %% 방문자 흐름
  Role -->|방문자: 클라이언트 / 구독자| View["View 모드 진입<br/>(림라이트 Glass 카드 & 프로필/스킬 확인)"]
  View --> Action{"주요 행동 선택"}
  Action -->|대표 쇼릴 클릭| Play["카드 내 16:9 인라인 플레이어로<br/>이탈 없이 쇼릴 즉시 재생"]
  Action -->|유튜브 / 인스타 클릭| External["새 탭(_blank)으로<br/>해당 소셜 채널 이동"]
  Action -->|프로젝트 문의 클릭| Mail["기본 메일 앱 실행<br/>(mailto:cleangabby@gmail.com)"]

  %% 관리자 흐름
  Role -->|관리자: 디자이너 본인| ToggleEdit["우측 상단/하단 '편집 모드' 버튼 클릭"]
  ToggleEdit --> EditAction{"편집 작업 수행"}
  EditAction -->|프로필/스킬 수정| UpdateProfile["이름·소개글·아바타·툴 태그 실시간 변경"]
  EditAction -->|쇼릴 변경| UpdateShowreel["신규 YouTube URL 입력 및 썸네일 미리보기 확인"]
  EditAction -->|링크 추가/수정/삭제| UpdateLinks["링크 제목·URL·아이콘·배지 CRUD"]
  UpdateProfile & UpdateShowreel & UpdateLinks --> Save["LocalStorage 자동 저장 및<br/>'편집 완료' 클릭 시 View 모드 복귀"]
```

---

### 6.2 시나리오 A: 외주 클라이언트 / 채용 담당자 (데스크탑 환경)
- **페르소나:** 브랜드 캠페인 모션그래픽 제작을 맡길 디자이너를 찾고 있는 에이전시 PD 김 대리
- **상황 및 목표:** 인스타그램 프로필이나 명함에 적힌 마이링크 URL을 통해 데스크탑 브라우저로 접속하여 디자이너의 작업 역량(2D/Fake 3D, 사용 툴)을 빠르게 검증하고 연락하고 싶음.
- **상세 흐름 (Step-by-Step):**
  1. **첫인상 및 역량 파악:** 페이지 접속과 동시에 `420ms` 페이드업 애니메이션으로 Glassmorphism 카드가 등장한다. 마우스를 움직일 때마다 카드와 버튼 테두리를 따라 반응하는 **림라이트(Specular Rim Light)**를 통해 디자이너의 감각적인 디테일을 체감하고, `After Effects`, `Blender`, `3ds Max` 등 보유 기술 스택 태그를 한눈에 확인한다.
  2. **쇼릴 즉시 감상 (이탈 방지):** 최상단의 **`2026 Motion Showreel` (`FEATURED`)** 카드의 재생 버튼을 클릭한다. 유튜브 사이트로 창이 넘어가지 않고 카드 내부에서 즉시 `16:9` 영상 플레이어가 열려, 60FPS 모션그래픽 쇼릴을 끊김 없이 감상한다.
  3. **추가 작업물 확인 및 문의:** 작업 스타일이 마음에 들어 하단의 `YouTube Channel` 링크를 눌러 메이킹 필름을 새 탭에서 확인한 뒤, 다시 마이링크 탭으로 돌아와 **`프로젝트 및 외주 문의`** 버튼을 클릭하여 바로 의뢰 메일을 작성한다.

---

### 6.3 시나리오 B: SNS 팔로워 및 동료 디자이너 (모바일 환경)
- **페르소나:** 유튜브 쇼츠나 인스타그램 릴스에서 모션 작업물을 보고 유입된 모바일 사용자
- **상황 및 목표:** 스마트폰 인앱 브라우저로 접속해 다른 채널들을 구독하고 작업 과정을 살펴보고 싶음.
- **상세 흐름 (Step-by-Step):**
  1. **모바일 최적화 뷰 확인:** `360px~767px` 모바일 해상도에 맞춰 가로 너비 `100%`, 패딩 `20px`로 최적화된 글래스 카드를 스크롤 부담 없이 한 화면에서 확인한다.
  2. **채널 이동:** `YouTube Channel` 또는 `Instagram` 카드를 터치하면 `-1px` 택타일 프레스 피드백과 함께 해당 채널로 즉시 이동하여 구독 및 팔로우를 진행한다.

---

### 6.4 시나리오 C: 디자이너 본인 — 콘텐츠 업데이트 및 링크 관리 (편집 모드)
- **페르소나:** 모션그래픽 디자이너 **이대건** (서비스 소유자)
- **상황 및 목표:** 새로운 개인작 영상을 유튜브에 업로드한 직후, 코드를 다시 짜거나 배포할 필요 없이 웹 화면에서 바로 대표 쇼릴 영상을 교체하고 신규 링크를 추가하고 싶음.
- **상세 흐름 (Step-by-Step):**
  1. **편집 모드 진입:** 마이링크 페이지 우측 상단(또는 하단)의 플로팅 **`편집 모드`** 버튼을 클릭한다.
  2. **프로필 및 스킬 태그 업데이트:** 새로 익힌 툴이나 변경된 자기소개 문구를 인라인 입력창에서 수정하고, 기술 스택 영역에서 새 태그를 입력해 추가하거나 기존 태그의 `×` 버튼을 눌러 정리한다.
  3. **대표 쇼릴 URL 교체:** 쇼릴 설정 입력란에 새로 업로드한 유튜브 영상 주소를 붙여넣는다. 즉시 새로운 영상의 썸네일 미리보기가 카드에 반영되는 것을 확인한다.
  4. **링크 추가 및 수정 (CRUD):**
     - 하단 **`+ 새 링크 추가`** 버튼을 클릭해 제목(`Coloso 강의 오픈`), 부제목, URL, 아이콘, 강조 배지(`NEW`)를 입력하고 저장한다.
     - 기존 링크 중 수정이 필요한 항목의 `수정` 버튼을 눌러 문구를 다듬거나, 더 이상 쓰지 않는 링크의 `삭제` 버튼을 눌러 목록에서 제거한다.
  5. **저장 및 확인:** 모든 수정 사항은 즉시 브라우저 `localStorage`에 자동 저장된다. **`편집 완료`** 버튼을 눌러 일반 방문자 시점(View Mode)으로 전환한 뒤, 림라이트 효과와 레이아웃이 잘 적용되었는지 최종 확인한다. (필요 시 `기본값 복원` 버튼으로 초기 시드 상태로 되돌릴 수 있다.)

---

## 7. 메인 화면 와이어프레임 (Wireframes)

### 7.1 기본 메인 화면 (View Mode — 방문자 시점)

```text
+-----------------------------------------------------------------------+
|  Viewport (min-h-[100dvh], Charcoal #0D111A + Vibrant Mesh Orbs)      |
|                                                    [ ✎ 편집 모드 ]    |
|                                                                       |
|           +-----------------------------------------------+           |
|           |  ═══════ Specular Rim Light Glass Card ══════ |           |
|           |  (Mobile 100% / Tablet 80% / Desktop 400px)   |           |
|           |                                               |           |
|           |                  .---------.                  |           |
|           |                 /           \                 |           |
|           |                |     이      | (120 x 120px)  |           |
|           |                 \           /  [60FPS]        |           |
|           |                  '---------'                  |           |
|           |                                               |           |
|           |                    이대건                      | <-- H1    |
|           |          [🎬] MOTION GRAPHIC DESIGNER         | <-- Label |
|           |                                               |           |
|           |    움직임으로 이야기를 전하는 모션그래픽      | <-- Body  |
|           |  디자이너입니다. 브랜드의 메시지를 만듭니다.   |           |
|           |                                               |           |
|           |  [After Effects] [Blender] [3ds Max]          | <-- Chips |
|           |  [Photoshop] [Illustrator] [Premiere Pro]     |           |
|           |                                               |           |
|           |  -------------------------------------------  |           |
|           |                                               |           |
|           |  +-----------------------------------------+  |           |
|           |  | [▶] 2026 Motion Showreel   [FEATURED] ▾ |  | <-- 쇼릴  |
|           |  |     2D · Fake 3D · Kinetic 대표 작업물  |  | (Primary) |
|           |  +-----------------------------------------+  |           |
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
|           |               © 2026 Lee Dae-geon             | <-- Footer|
|           +-----------------------------------------------+           |
|                                                                       |
+-----------------------------------------------------------------------+
```

### 7.2 대표 쇼릴 인라인 재생 확장 상태 (Showreel Expanded State)

방문자가 최상단 `2026 Motion Showreel` 카드를 클릭했을 때 페이지 이탈 없이 카드 내부에서 `16:9` 플레이어가 펼쳐진 모습입니다.

```text
           |  -------------------------------------------  |
           |  +-----------------------------------------+  |
           |  | [▶] 2026 Motion Showreel      [접기 ▲] |  |
           |  | +-------------------------------------+ |  |
           |  | |                                     | |  |
           |  | |       16:9 YouTube Inline Player    | |  |
           |  | |            ( ▶ Playing... )         | |  |
           |  | |                                     | |  |
           |  | +-------------------------------------+ |  |
           |  +-----------------------------------------+  |
```

### 7.3 실시간 편집 모드 화면 (Edit Mode — 관리자 시점)

우측 상단 `[ ✎ 편집 모드 ]` 토글 활성화 시 같은 화면 안에서 바로 프로필·쇼릴·링크를 수정·추가·삭제하는 레이아웃입니다.

```text
+-----------------------------------------------------------------------+
|  Viewport                                [ ↺ 기본값 복원 ] [ ✓ 완료 ] |
|                                                                       |
|           +-----------------------------------------------+           |
|           |  [EDIT MODE ACTIVE] 실시간 편집 및 미리보기   |           |
|           |                                               |           |
|           |              ( 이 ) [이미지 URL 변경]         |           |
|           |                                               |           |
|           |  이름:   [ 이대건                          ]  |           |
|           |  직무:   [ Motion Graphic Designer         ]  |           |
|           |  소개글: [ 움직임으로 이야기를 전하는...   ]  |           |
|           |                                               |           |
|           |  기술 스택:                                   |           |
|           |  [After Effects ×] [Blender ×] [3ds Max ×]    |           |
|           |  [+ 새 스킬 태그 입력...          ] [추가]    |           |
|           |                                               |           |
|           |  --- [ 대표 쇼릴(Showreel) 설정 ] ----------  |           |
|           |  제목: [ 2026 Motion Showreel              ]  |           |
|           |  YouTube URL: [ https://youtu.be/...       ]  |           |
|           |                                               |           |
|           |  --- [ 링크 목록 관리 (CRUD) ] -------------  |           |
|           |  +-----------------------------------------+  |           |
|           |  | [▷] YouTube Channel        [수정] [삭제]|  |           |
|           |  +-----------------------------------------+  |           |
|           |  +-----------------------------------------+  |           |
|           |  | [◎] Instagram              [수정] [삭제]|  |           |
|           |  +-----------------------------------------+  |           |
|           |  +-----------------------------------------+  |           |
|           |  | [✉] 프로젝트 및 외주 문의  [수정] [삭제]|  |           |
|           |  +-----------------------------------------+  |           |
|           |                                               |           |
|           |  +-----------------------------------------+  |           |
|           |  |           + 새 링크 추가하기            |  |           |
|           |  +-----------------------------------------+  |           |
|           +-----------------------------------------------+           |
+-----------------------------------------------------------------------+
```


