"use client";

import type { ComponentType, CSSProperties, ReactNode } from "react";
import {
  ArrowDown,
  Cloud,
  LayoutGrid,
  Link2,
  Mail,
  MousePointerClick,
  Pencil,
  Play,
  Share2,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useRimLight } from "@/lib/use-rim-light";
import { useAuthStore } from "@/store/auth-store";
import { AmbientBackground } from "@/components/ambient-background";
import { GoogleGlyph } from "@/components/auth-menu";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { LinkIcon } from "@/components/link-icon";
import { cn } from "@/lib/utils";

/**
 * 소개 페이지 (로그인 전 홈 /)
 * 첫 화면(제목·소개·Google로 시작하기 + 떠 있는 미리보기 카드) → 기능 → 시작 3단계 → 마무리 CTA → 푸터
 * 로그인하면 app/page.tsx가 내 링크 페이지(HubPage)로 바꿔 보여준다.
 */
export function LandingPage() {
  useRimLight();

  return (
    <>
      <AmbientBackground />
      <SiteHeader />

      {/* break-keep: 한국어를 어절 단위로 줄바꿈 ("유리처/럼" 같은 끊김 방지) */}
      <main className="relative flex-1 overflow-x-hidden break-keep">
        <Hero />
        <Features />
        <Steps />
        <ClosingCta />
      </main>

      <footer className="relative z-10 border-t border-winter/[0.06] py-8 text-center font-mono text-[11px] text-winter/40">
        © 2026 MyLink · Motion Link Hub
      </footer>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 공용                                                                */
/* ------------------------------------------------------------------ */
const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

/** lucide에 없는 브랜드 아이콘은 프로젝트의 LinkIcon SVG를 쓴다 */
const Youtube = ({ className }: { className?: string }) => <LinkIcon iconType="youtube" className={className} />;
const Instagram = ({ className }: { className?: string }) => <LinkIcon iconType="instagram" className={className} />;

/** Google로 시작하기 (Hearth primary, 큰 버튼) */
function GoogleStartButton({ className }: { className?: string }) {
  const signIn = useAuthStore((state) => state.signInWithGoogle);
  const pending = useAuthStore((state) => state.pending);
  const error = useAuthStore((state) => state.error);

  return (
    <div className={cn("flex flex-col items-start gap-2", className)}>
      <button
        type="button"
        onClick={() => void signIn()}
        disabled={pending}
        aria-busy={pending}
        className="group inline-flex h-12 cursor-pointer items-center gap-2.5 rounded-[12px] bg-hearth pr-5 pl-2 text-[15px] font-semibold text-crow shadow-[0_10px_30px_rgba(225,202,166,0.25),inset_0_1px_0_rgba(255,255,255,0.5)] transition-[transform,background-color,box-shadow] duration-200 ease-punch outline-none hover:-translate-y-0.5 hover:bg-hearth-deep hover:shadow-[0_14px_36px_rgba(225,202,166,0.32),inset_0_1px_0_rgba(255,255,255,0.5)] focus-visible:ring-2 focus-visible:ring-hearth focus-visible:ring-offset-2 focus-visible:ring-offset-crow active:translate-y-0 disabled:opacity-60"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-winter shadow-sm">
          <GoogleGlyph className="h-4 w-4" />
        </span>
        <span>{pending ? "로그인 중..." : "Google로 시작하기"}</span>
      </button>
      {error && (
        <p role="alert" className="text-[12px] font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1. 첫 화면                                                          */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section className="relative mx-auto grid w-full max-w-5xl items-center gap-14 px-6 pt-16 pb-20 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-28">
      {/* 왼쪽: 소개 */}
      <div className="flex flex-col items-start">
        <span
          style={delay(0)}
          className="animate-glass-entry inline-flex items-center gap-2 rounded-full bg-winter/[0.07] py-1 pr-3 pl-1.5 text-[11px] font-medium text-winter/70 shadow-[inset_0_1px_1px_rgba(245,236,209,0.08)] backdrop-blur-md"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-hearth/20">
            <Sparkles className="h-3 w-3 text-hearth" aria-hidden="true" />
          </span>
          <span className="font-mono tracking-wider uppercase">Motion Link Hub</span>
        </span>

        <h1
          style={delay(80)}
          className="animate-glass-entry mt-6 text-[clamp(2.4rem,6vw,3.9rem)] leading-[1.08] font-bold tracking-[-0.03em] text-winter"
        >
          움직이는 작업을,
          <br />
          <span className="bg-gradient-to-r from-winter via-hearth to-hearth bg-clip-text text-transparent">
            한 장의 링크로.
          </span>
        </h1>

        <p
          style={delay(160)}
          className="animate-glass-entry mt-6 max-w-[34rem] text-[1.05rem] leading-[1.7] text-winter/70"
        >
          포트폴리오, 유튜브, 인스타그램, 외주 문의까지. 흩어진 채널을 유리처럼 맑은 카드 한 장에 모으세요.
          Google 계정으로 로그인하면 링크가 내 계정에 저장되어 어느 기기에서든 그대로 이어져요.
        </p>

        <div style={delay(240)} className="animate-glass-entry mt-9 flex flex-wrap items-center gap-3">
          <GoogleStartButton />
          <a
            href="#features"
            className="inline-flex h-12 items-center gap-1.5 rounded-[12px] px-4 text-[14px] font-medium text-winter/70 transition-colors duration-200 ease-punch hover:bg-winter/[0.06] hover:text-winter"
          >
            기능 살펴보기
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <ul
          style={delay(320)}
          className="animate-glass-entry mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-winter/50"
        >
          {["별도 가입 없이 Google 계정으로", "계정별 자동 저장", "모바일에서도 그대로"].map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-hearth/70" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* 오른쪽: 떠 있는 미리보기 카드 */}
      <div style={delay(200)} className="animate-glass-entry relative mx-auto w-full max-w-[360px]" aria-hidden="true">
        <PreviewCard />
      </div>
    </section>
  );
}

/** 링크 페이지 미리보기 (장식용) */
function PreviewCard() {
  return (
    <div className="relative">
      {/* 뒤쪽 유리판: 깊이감 */}
      <div className="absolute inset-x-6 -top-5 h-full rotate-[-6deg] rounded-[22px] bg-diplomatic/40 blur-[1px] backdrop-blur-md" />
      <div className="absolute -inset-10 -z-10 rounded-full bg-hearth/10 blur-3xl" />

      <div className="animate-float">
        <Card className="items-center rotate-[2deg] p-6 text-center">
          <span className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-hearth/50 via-diplomatic/60 to-cedar p-[3px]">
            <span className="flex h-full w-full items-center justify-center rounded-full bg-cedar text-winter/70">
              <UserRound className="h-8 w-8" />
            </span>
          </span>
          <p className="relative z-10 mt-3 text-lg font-bold tracking-tight text-winter">@yourname</p>
          <p className="relative z-10 mt-2 max-w-[24ch] text-center text-[11px] leading-relaxed break-keep text-winter/70">
            움직이는 것을 만듭니다. 외주·협업 문의 환영해요.
          </p>

          <div className="relative z-10 mt-5 flex w-full flex-col gap-2">
            <PreviewRow primary icon={Play} title="Vimeo 포트폴리오" sub="2D · 3D · Kinetic" badge="FEATURED" />
            <PreviewRow icon={Youtube} title="YouTube" sub="작업 과정 브이로그" />
            <PreviewRow icon={Instagram} title="Instagram" sub="짧은 모션 실험" />
            <PreviewRow icon={Mail} title="외주 문의" sub="hello@example.com" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function PreviewRow({
  icon: Icon,
  title,
  sub,
  badge,
  primary = false,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  sub: string;
  badge?: string;
  primary?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-[8px] p-2 text-left",
        primary ? "bg-hearth text-crow" : "bg-winter/[0.1] text-winter"
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px]",
          primary ? "bg-crow/85 text-hearth" : "bg-cedar/50 text-hearth"
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[12px] font-semibold">
          {title}
          {badge && (
            <span className="rounded-[3px] bg-diplomatic px-1 py-px font-mono text-[8px] tracking-wider text-winter">
              {badge}
            </span>
          )}
        </span>
        <span className={cn("block truncate text-[10px]", primary ? "text-crow/70" : "text-winter/60")}>{sub}</span>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. 기능 (벤토 배치, 같은 폭 3단 금지)                                 */
/* ------------------------------------------------------------------ */
function Features() {
  return (
    <section id="features" className="relative mx-auto w-full max-w-5xl scroll-mt-20 px-6 py-16">
      <SectionHeading eyebrow="Features" title="링크 페이지에 필요한 것만, 정성껏" />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          className="sm:col-span-2 lg:row-span-2"
          icon={LayoutGrid}
          title="흩어진 채널을 한 장에"
          body="Vimeo, 유튜브, 인스타그램, 포트폴리오, 외주 문의 메일까지. 아이콘·배지·강조 스타일로 중요한 링크를 먼저 보이게 하고, 순서는 원하는 대로 바꿀 수 있어요."
          large
        >
          {/* 오른쪽 카드 두 장 높이만큼 늘어나므로 칩을 바닥에 붙여 빈 공간을 없앤다 */}
          <div className="mt-6 flex flex-wrap gap-2 lg:mt-auto lg:pt-8" aria-hidden="true">
            {[
              { icon: Play, label: "Vimeo" },
              { icon: Youtube, label: "YouTube" },
              { icon: Instagram, label: "Instagram" },
              { icon: Link2, label: "Behance" },
              { icon: Mail, label: "Contact" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-winter/[0.07] px-3 py-1.5 text-[12px] text-winter/75"
              >
                <Icon className="h-3.5 w-3.5 text-hearth" />
                {label}
              </span>
            ))}
          </div>
        </FeatureCard>

        <FeatureCard
          icon={Pencil}
          title="보이는 그대로 고치기"
          body="내 카드에서 이름·username·소개글을 눌러 그 자리에서 바로 수정해요. 따로 편집 화면이 없어요."
        />
        <FeatureCard
          icon={Cloud}
          title="어디서든 같은 링크"
          body="링크는 내 Google 계정에 저장돼요. 휴대폰에서 고쳐도 노트북에 바로 반영돼요."
        />
        <FeatureCard
          className="sm:col-span-2 lg:col-span-3"
          icon={MousePointerClick}
          title="움직임이 있는 유리 질감"
          body="마우스를 따라 가장자리에 빛이 맺히는 글래스 카드, 모션 디자이너의 곡선으로 다듬은 전환. 링크 페이지도 작업물처럼 보이게 했어요."
          horizontal
        />
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
  className,
  large = false,
  horizontal = false,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
  className?: string;
  large?: boolean;
  horizontal?: boolean;
  children?: ReactNode;
}) {
  return (
    <article
      className={cn(
        "relative flex flex-col rounded-[18px] bg-winter/[0.05] p-6 shadow-[inset_0_1px_1px_rgba(245,236,209,0.07),inset_0_0_24px_rgba(245,236,209,0.03)] backdrop-blur-md transition-colors duration-300 ease-punch hover:bg-winter/[0.08]",
        horizontal && "sm:flex-row sm:items-center sm:gap-6",
        className
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-[12px] bg-hearth/15 text-hearth",
          large ? "h-12 w-12" : "h-10 w-10"
        )}
      >
        <Icon className={large ? "h-6 w-6" : "h-5 w-5"} aria-hidden="true" />
      </span>
      <div className={cn(!horizontal && "mt-5", large && "flex flex-1 flex-col")}>
        <h3 className={cn("font-semibold tracking-tight text-winter", large ? "text-2xl" : "text-[17px]")}>
          {title}
        </h3>
        <p className={cn("mt-2 leading-relaxed text-winter/60", large ? "max-w-[30rem] text-[15px]" : "text-[13px]")}>
          {body}
        </p>
        {children}
      </div>
    </article>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.2em] text-hearth uppercase">{eyebrow}</p>
      <h2 className="mt-3 text-[clamp(1.6rem,3.5vw,2.2rem)] leading-tight font-bold tracking-tight text-winter">
        {title}
      </h2>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. 시작 3단계 (세로 타임라인)                                         */
/* ------------------------------------------------------------------ */
const STEPS = [
  {
    icon: UserRound,
    title: "Google 계정으로 로그인",
    body: "버튼 하나로 시작해요. 이메일 앞부분이 내 이름(@아이디)이 돼요.",
  },
  {
    icon: Link2,
    title: "링크 추가하고 꾸미기",
    body: "제목과 주소만 넣어도 되고, 아이콘·배지·강조 스타일로 꾸며도 돼요.",
  },
  {
    icon: Share2,
    title: "주소 하나로 공유",
    body: "프로필 메뉴에서 링크 주소를 복사해 SNS 프로필과 명함에 붙이세요.",
  },
] as const;

function Steps() {
  return (
    <section className="relative mx-auto grid w-full max-w-5xl gap-10 px-6 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
      <SectionHeading eyebrow="How it works" title="세 단계면 충분해요" />

      <ol className="relative flex flex-col gap-2 rounded-[22px] bg-winter/[0.04] p-3 shadow-[inset_0_1px_1px_rgba(245,236,209,0.06)] backdrop-blur-md">
        {STEPS.map(({ icon: Icon, title, body }, index) => (
          <li key={title} className="relative flex gap-4 rounded-[16px] p-4 transition-colors duration-300 ease-punch hover:bg-winter/[0.05]">
            <div className="flex flex-col items-center">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hearth font-mono text-[13px] font-bold text-crow">
                {String(index + 1).padStart(2, "0")}
              </span>
              {index < STEPS.length - 1 && (
                <span className="mt-2 w-px flex-1 bg-gradient-to-b from-hearth/40 to-transparent" aria-hidden="true" />
              )}
            </div>
            <div className="pb-2">
              <h3 className="flex items-center gap-2 text-[16px] font-semibold text-winter">
                <Icon className="h-4 w-4 text-hearth" aria-hidden="true" />
                {title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-winter/60">{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 4. 마무리 CTA                                                       */
/* ------------------------------------------------------------------ */
function ClosingCta() {
  return (
    <section className="relative mx-auto w-full max-w-5xl px-6 pt-8 pb-24">
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-diplomatic/50 via-cedar/60 to-crow/40 px-8 py-14 text-center shadow-[inset_0_1px_1px_rgba(245,236,209,0.1),0_24px_60px_rgba(12,3,7,0.45)] backdrop-blur-md sm:px-14">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[70%] -translate-x-1/2 rounded-full bg-hearth/20 blur-3xl" aria-hidden="true" />
        <h2 className="relative text-[clamp(1.6rem,3.5vw,2.4rem)] leading-tight font-bold tracking-tight text-winter">
          지금, 내 작업에 어울리는
          <br className="sm:hidden" /> 링크 페이지를 만들어 보세요
        </h2>
        <p className="relative mx-auto mt-4 max-w-[30rem] text-[14px] leading-relaxed text-balance text-winter/65">
          로그인하면 바로 내 링크 페이지가 열려요. 언제든 로그아웃하면 이 화면으로 돌아와요.
        </p>
        <div className="relative mt-8 flex justify-center">
          <GoogleStartButton className="items-center" />
        </div>
      </div>
    </section>
  );
}
