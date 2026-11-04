---
version: "alpha"
name: "Glassmorphism"
description: "Glassmorphic interface with frosted glass effect. Ideal for overlays, modal dialogs, card components, premium interfaces. AI-ready template."
colors:
  # ColorPallete.jpeg 기반 (Crow / Bleached Cedar / Winter White / Diplomatic / Hearth / Bay Wharf)
  primary: "#E1CAA6"     # Hearth — 핵심 액션, 대표 쇼릴, 포커스 링
  secondary: "#37435F"   # Diplomatic — 보조 강조, 배지, 배경 광원
  tertiary: "#74838A"    # Bay Wharf — 보조 아이콘, NEW 배지, 배경 광원
  neutral: "#1E0912"     # Crow — 기본 배경
  surface: "#2B2034"     # Bleached Cedar — 모달·아이콘 박스 등 깊은 표면
  text: "#F5ECD1"        # Winter White — 본문 텍스트
  # 버튼 등 primary 색 위에 올라가는 글자색. 순수 검정 대신 Crow를 쓰며, 이 값만 바꾸면 전체에 반영된다.
  on-primary: "#1E0912"

rounded:
  xs: 4px    # 아이콘 박스, 작은 칩
  sm: 6px    # 작은 버튼, 썸네일
  md: 0.5rem # 버튼, 링크 아이템, 입력창
  lg: 16px   # 모달(Dialog)
  xl: 20px   # 메인 프로필 카드

motion:
  # After Effects 속도 그래프 기준 비대칭 베지어 (괄호 안은 시작/끝 영향력)
  ease-punch: "cubic-bezier(0.10, 0, 0.05, 1)"   # 확 치고 길게 감속 (10% / 95%)
  ease-swoosh: "cubic-bezier(0.85, 0, 0.15, 1)"  # 천천히 → 슉 → 천천히 (85% / 85%)
  ease-snap: "cubic-bezier(0.90, 0, 0.90, 1)"    # 길게 모았다가 탁 (90% / 10%)

typography:
  h1:
    fontFamily: -apple-system, sans-serif
    fontSize: 2.25rem
    fontWeight: 700
  body-md:
    fontFamily: -apple-system, sans-serif
    fontSize: 1rem
    fontWeight: 400
  label-caps:
    fontFamily: -apple-system, sans-serif
    fontSize: 0.75rem
    fontWeight: 500
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    padding: 12px
---

## Overview

Glassmorphic interface with frosted glass effect. Ideal for overlays, modal dialogs, card components, premium interfaces. AI-ready template. Apple didn't invent frosted glass UI, but they made everyone care about it. iOS 7 dropped the skeuomorphism and introduced those translucent panels that let color bleed through from whatever sat behind them. It was polarizing. People hated it, then copied it. By Big Sur, the entire macOS chrome leaned into layered transparency as a spatial cue — and with visionOS, glass became the literal foundation of their spatial computing interface. It's not decoration there; it's architecture.

Microsoft took a parallel path with Fluent Design's acrylic material around 2017. Windows 11 doubled down on it. Their approach was more systematic — defined noise textures, tint layers, luminosity blend modes. Less "pretty blur" and more "engineered material."

What made glassmorphism actually viable for the web was backdrop-filter landing in all major browsers by 2020. Before that, you were faking it with duplicated backgrounds and clip paths — hacky, brittle, not worth the effort. Now it's a single CSS property. By 2026, it's a mature technique with solid browser support, though you still need to think about what happens when that blur can't render.

- Density: 5/10 — Balanced
- Variance: 4/10 — Moderate
- Motion: 4/10 — Subtle

- **Style:** Translucent, Layered, Vibrant, Blurred
- **Keywords:** Frosted glass, transparent, blurred background, layered, vibrant background, light source, depth, multi-layer
- **Era:** 2020s Modern
- **Light/Dark:** ✓ Full / ✓ Full

## Colors

Palette source: `ColorPallete.jpeg` in the project root. Tailwind tokens: `crow`, `cedar`, `winter`, `diplomatic`, `hearth`, `wharf` (e.g. `bg-hearth`, `text-winter/80`).

- **Crow** (#1E0912) — Page background, text on Hearth-filled elements (`on-primary`). Replaces pure black.
- **Bleached Cedar** (#2B2034) — Deep surfaces: modal, icon boxes, background light pool.
- **Winter White** (#F5ECD1) — Body and heading text; glass surface tint (rgba(245,236,209,0.08-0.2)).
- **Diplomatic** (#37435F) — Secondary accent: FEATURED badge, background light pool.
- **Hearth** (#E1CAA6) — Primary accent: main buttons, showreel block, role label, focus ring. Hover: #CFBA99 (8% darker).
- **Bay Wharf** (#74838A) — Tertiary accent: NEW badge (Crow text), mail/globe icons, background light pool.
- **Danger** (#D98C7A) — The only non-palette color; delete buttons and error text only.


## Typography

- **Display / Hero:** System UI stack (-apple-system, sans-serif) — Weight 700, tight tracking, used for headline impact
- **Body:** System UI stack (-apple-system, sans-serif) — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** System UI stack (-apple-system, sans-serif) — 0.875rem, weight 500, slight letter-spacing
- **Monospace:** JetBrains Mono — Used for code, metadata, and technical values

Scale:
- Hero: clamp(2.5rem, 5vw, 4rem)
- H1: 2.25rem
- H2: 1.5rem
- Body: 1rem / 1.6
- Small: 0.875rem


## Layout

- **Grid:** CSS Grid primary. Max-width containment: 1280px centered with 1.5rem side padding.
- **Spacing rhythm:** Balanced. Base unit: 0.5rem (8px).
- **Section vertical gaps:** clamp(4rem, 8vw, 8rem).
- **Hero layout:** Split-screen (text left, visual right).
- **Feature sections:** Zig-zag alternating text+image rows. No 3-equal-columns.
- **Mobile collapse:** All multi-column layouts collapse below 768px. No horizontal overflow.
- **z-index contract:** base (0) / sticky-nav (100) / overlay (200) / modal (300) / toast (500).


## Elevation & Depth

Backdrop blur (10-20px), subtle border (1px solid Winter White at 8-20%), Z-depth.

- **Rim light (base card only):** Only the main glass card (`Card`, the base block) has `.glass-rim`. Buttons, badges, link items, showreel, avatar and modal do not.
  - Shape: light gathers along the card edge via `inset box-shadow`, following the border radius evenly (classic glassmorphism edge catch). No diamond or band shapes, no stroke line (the card border is transparent).
  - Static glow (`::before`): a very faint top-lit edge glow, always visible.
  - Cursor glow (`::after`): the same edge glow revealed through a radial mask centered on the cursor (`--rim-size` 360px). Edges near the mouse are brightest and fade out with distance. Driven by `src/lib/use-rim-light.ts`. Disabled on touch devices.
- **No light around the cursor:** no spotlight blob in empty space, no full-surface sheen. Background light pools are static.

- **Physics:** Asymmetric high-influence curves (see `motion` tokens), 200-300ms duration. Avoid the default symmetric Easy Ease (33%) and plain `ease-out`.
- **Entry animations:** Fade + translate-Y (16px → 0) over 420ms `ease-punch`. Staggered cascades for lists: 80ms between items.
- **Hover states:** Subtle color shift + shadow adjustment over 200ms `ease-punch`.
- **Expand / collapse (showreel player, modal open):** `ease-swoosh`.
- **Emphasis pop (badge, saved confirmation):** `ease-snap`.
- **Page transitions:** Fade only (200ms `ease-swoosh`).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.




## Shapes

Base corner radius: 4px. Radius grows with element size: 4px (icon box) → 6px (small button) → 0.5rem (button, link item) → 16px (modal) → 20px (main card). See `rounded` tokens in front matter.

## Components

- **Primary Button:** Subtly rounded (0.5rem) shape. Accent color fill. Text color: `on-primary` (Crow #1E0912, adjustable token; never pure black). Hover: 8% darken + subtle lift shadow. Active: -1px translate tactile press. Font weight 600. No outer glows.
- **Secondary / Ghost Button:** Outline variant. 1.5px border in muted color. Text in primary color. Hover: subtle background fill.
- **Cards:**
  - Main profile card: 20px corners, glass surface, blur 16px + saturate 180%, 1px border `rgba(255,255,255,0.08)`, shadow `0 12px 40px rgba(8,11,18,0.35)`.
  - Inner link items: 0.5rem corners, 1px border, shadow `0 2px 12px rgba(0,0,0,0.08)`.
- **Inputs:** Label above input. 1px border stroke. Focus ring: 2px accent color offset 2px. Error text below in semantic red. No floating labels.
- **Navigation:** Primary surface background. Active item: accent color indicator. Font weight 500 when active.
- **Skeletons:** Shimmer animation matching component dimensions. No circular spinners.
- **Empty States:** Icon-based composition with descriptive text and action button.


## Do's and Don'ts

- No emojis in UI — use icon system only (Lucide, Heroicons)
- No pure black (#000000) — use off-black or charcoal variants
- No oversaturated accent colors (saturation cap: 80%)
- No 3-column equal-width feature layouts — use zig-zag or asymmetric grid
- No `h-screen` — use `min-h-[100dvh]`
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- No broken external image links — use picsum.photos or inline SVG
- No generic lorem ipsum in demos

- Do Backdrop-filter blur 10-20px
- Do Translucent white 15-30% opacity
- Do Subtle border 1px light
- Do Vibrant background verified
- Do Text contrast 4.5:1 checked


## Use Case

Overlays, Modal dialogs, Card components, Premium interfaces
