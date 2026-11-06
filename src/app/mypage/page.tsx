"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ExternalLink,
  Link2,
  Loader2,
  Pencil,
  Download,
  Plus,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import type { LinkItem } from "@/data/links";
import { quickLinkSchema, type QuickLinkValues } from "@/lib/schemas";
import { useRimLight } from "@/lib/use-rim-light";
import { useAuthStore } from "@/store/auth-store";
import { useLegacyLinkCount, useLinkActions, useMyLinks } from "@/hooks/use-links";
import { MyPageStatsSection } from "@/components/link-stats";
import { SiteHeader } from "@/components/site-header";
import { LoginRequired } from "@/components/login-required";
import { AmbientBackground } from "@/components/ambient-background";
import { LinkFormModal } from "@/components/link-form-modal";
import { LinkIcon } from "@/components/link-icon";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * /mypage — 내 링크 관리 (링크 관리 전용 페이지)
 * 링크 추가·수정·삭제·순서 변경은 모두 여기서 한다. 프로필(이름·username·소개)은 내 링크 페이지 카드에서 인라인으로 고친다.
 * 데이터 원본: Firestore users/{user.uid}/links (Google 로그인 사용자별, 메인 카드와 같은 컬렉션)
 * 로그인 전에는 폼·목록 대신 로그인 안내를 보여준다.
 * 상단: 제목 / 중간: 빠른 추가 폼 / 하단: 목록 (기본 최신순, '카드 순서' 보기에서 순서 변경, 항목마다 "· N 클릭")
 * 맨 아래: 클릭 통계 섹션 (총 클릭수 + 링크별 클릭수 많은 순, 13주차)
 */

/** 추가 시각 표시: "11월 4일 오후 12:07" */
const createdAtFormat = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

type SortMode = "latest" | "card";

const ICON_BUTTON =
  "inline-flex size-6 cursor-pointer items-center justify-center rounded-[4px] border border-winter/15 bg-winter/8 text-winter/80 transition-colors hover:bg-winter/20 disabled:pointer-events-none disabled:opacity-30";

export default function MyPage() {
  useRimLight();

  // 로그인 상태 (Firebase Auth · Google)
  const authStatus = useAuthStore((state) => state.status);
  const isSignedIn = authStatus === "signedIn";

  // 로그아웃 상태로 들어오면 소개 페이지(/)로 보낸다
  const router = useRouter();
  useEffect(() => {
    if (authStatus === "signedOut") router.replace("/");
  }, [authStatus, router]);

  // 로그인하면 users/{uid}/links 를 조회한다 (TanStack Query, createdAt 최신순). 쓰기 후에는 다시 조회.
  const { links: latestLinks, orderedLinks, status, error: storeError } = useMyLinks();
  const { addLink, updateLink, deleteLink, moveLink, importLegacy, isImporting: importing } = useLinkActions();
  // 내 목록이 비었을 때만 이전 공용 링크 개수를 조회
  const legacyCount = useLegacyLinkCount(status === "ready" && latestLinks.length === 0);
  const clearStoreError = () => void 0;

  const handleImportLegacy = () => importLegacy();

  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const links = sortMode === "latest" ? latestLinks : orderedLinks;

  // 상세 추가·수정 모달
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);

  const openCreateModal = () => {
    setEditingLink(null);
    setIsModalOpen(true);
  };
  const openEditModal = (link: LinkItem) => {
    setEditingLink(link);
    setIsModalOpen(true);
  };
  // 모달은 바로 닫히고, 결과는 Sonner 알림으로 보여준다
  const handleModalSave = (linkData: Omit<LinkItem, "id">, id?: string) => {
    if (id) updateLink(id, linkData);
    else void addLink(linkData);
  };

  /* ------------------------- 빠른 추가 폼 (제목 + 주소) ------------------------- */
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<QuickLinkValues>({
    resolver: zodResolver(quickLinkSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { title: "", href: "" },
  });

  // 검사 통과 → Firestore에 저장(성공하면 목록을 다시 조회)
  // → 입력 칸 자동 비우기 → 다음 입력을 위해 제목 칸에 포커스
  const onQuickSubmit = async (values: QuickLinkValues) => {
    clearErrors("root");
    const id = await addLink({
      title: values.title,
      href: values.href,
      // 메인 카드에 필요한 나머지 필드는 기본값 (나중에 '수정'에서 바꿀 수 있음)
      subtitle: "",
      iconType: "link",
      variant: "glass",
    });
    if (!id) {
      // 실패하면 입력값을 그대로 두어 다시 시도할 수 있게 한다
      setError("root", { message: "링크를 저장하지 못했어요. 잠시 후 다시 시도해주세요." });
      return;
    }
    reset({ title: "", href: "" });
    requestAnimationFrame(() => setFocus("title"));
  };

  return (
    <>
      <AmbientBackground />

      {/* 사이트 헤더: 로고 · 메뉴 · Google 로그인 */}
      <SiteHeader />

    <main className="relative flex flex-1 flex-col items-center px-4 py-10 sm:px-6">
      <Card className="animate-glass-entry w-full gap-6 p-[20px] md:w-[80%] md:max-w-[480px] md:p-[28px] lg:w-[400px] lg:max-w-[400px]">
        {/* 상단: 제목 */}
        <header className="relative z-10 flex flex-col gap-3">
          <Link
            href="/"
            className={buttonVariants({ variant: "ghost", size: "xs", className: "self-start" })}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>마이링크로 돌아가기</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-winter">내 링크 관리</h1>
            <p className="mt-1 text-xs text-winter/70">
              {isSignedIn
                ? "메인 카드에 보이는 내 링크를 여기서 추가·수정·삭제하고 순서를 바꿔요."
                : "Google 계정으로 로그인하면 나만의 링크 목록을 관리할 수 있어요."}
            </p>
          </div>
        </header>

        {!isSignedIn ? (
          /* 로그인 전: 사용 방법 안내 */
          <LoginRequired
            title="로그인 후 사용할 수 있어요"
            description="내 링크 관리는 Google 계정으로 로그인한 뒤에 쓸 수 있어요. 링크는 계정마다 따로 저장되고, 다른 기기에서 로그인해도 그대로 보여요."
            features={[
              "제목·주소만으로 빠르게 링크 추가",
              "부제목·아이콘·배지·스타일까지 상세 추가와 수정",
              "메인 카드에 보이는 순서 바꾸기",
              "Firestore에 저장되어 새로고침·다른 기기에서도 유지",
            ]}
          />
        ) : (
          <>
        <h2 className="relative z-10 -mb-3 text-sm font-semibold text-winter">링크 추가</h2>

        {/* 중간: 빠른 추가 폼 (입력 칸 세로 배치) */}
        <form
          onSubmit={handleSubmit(onQuickSubmit)}
          noValidate
          aria-label="링크 추가"
          className="relative z-10 flex flex-col gap-3"
        >
          <div>
            <Label htmlFor="mypage-title" className="mb-1.5">
              제목
            </Label>
            <Input
              id="mypage-title"
              placeholder="예: 유튜브 채널"
              autoComplete="off"
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={errors.title ? "mypage-title-error" : undefined}
              {...register("title")}
            />
            <FieldError id="mypage-title-error" message={errors.title?.message} />
          </div>

          <div>
            <Label htmlFor="mypage-href" className="mb-1.5">
              주소
            </Label>
            <Input
              id="mypage-href"
              inputMode="url"
              placeholder="https://..."
              autoComplete="off"
              aria-invalid={errors.href ? true : undefined}
              aria-describedby={errors.href ? "mypage-href-error" : undefined}
              {...register("href")}
            />
            <FieldError id="mypage-href-error" message={errors.href?.message} />
          </div>

          <div className="mt-1 flex gap-2">
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>{isSubmitting ? "저장 중..." : "추가"}</span>
            </Button>
            <Button
              type="button"
              variant="glass"
              onClick={openCreateModal}
              title="부제목·아이콘·배지·스타일까지 입력해서 추가"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>상세 추가</span>
            </Button>
          </div>
          <FieldError message={errors.root?.message} className="text-center" />
        </form>

        <div className="relative z-10 h-px w-full bg-gradient-to-r from-transparent via-winter/18 to-transparent" />

        {/* 하단: 링크 목록 */}
        <section aria-labelledby="mypage-list-title" className="relative z-10">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <h2
              id="mypage-list-title"
              className="text-xs font-bold tracking-wider text-winter uppercase"
            >
              링크 목록 ({links.length})
            </h2>
            {/* 정렬 보기 전환 */}
            <div
              role="group"
              aria-label="목록 정렬"
              className="inline-flex rounded-[6px] border border-winter/15 bg-crow/40 p-0.5"
            >
              {(
                [
                  ["latest", "최신순"],
                  ["card", "카드 순서"],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={sortMode === mode}
                  onClick={() => setSortMode(mode)}
                  className={`cursor-pointer rounded-[4px] px-2 py-0.5 text-[11px] font-medium transition-colors duration-200 ease-punch ${
                    sortMode === mode
                      ? "bg-hearth text-crow"
                      : "text-winter/70 hover:bg-winter/10 hover:text-winter"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="mb-2.5 text-[11px] text-winter/50">
            {sortMode === "latest"
              ? "추가한 시각이 최신인 순서예요. 순서를 바꾸려면 '카드 순서'를 눌러주세요."
              : "메인 카드에 보이는 순서예요. 화살표로 위치를 바꿀 수 있어요."}
          </p>

          {storeError && links.length > 0 && (
            <button
              type="button"
              role="alert"
              onClick={clearStoreError}
              title="닫기"
              className="mb-2 w-full cursor-pointer rounded-[6px] border border-danger/30 bg-danger/10 px-3 py-2 text-left text-[11px] font-medium text-danger"
            >
              {storeError}
            </button>
          )}

          {status === "error" && links.length === 0 ? (
            <p
              role="alert"
              className="rounded-[0.5rem] border border-danger/30 bg-danger/10 p-4 text-center text-xs text-danger"
            >
              {storeError ?? "링크를 불러오지 못했어요."}
            </p>
          ) : status !== "ready" && links.length === 0 ? (
            <div aria-busy="true" aria-label="링크를 불러오는 중" className="flex flex-col gap-2">
              {[0, 1].map((key) => (
                <div key={key} className="h-[66px] animate-pulse rounded-[0.5rem] bg-winter/[0.08]" />
              ))}
            </div>
          ) : links.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {links.map((link, index) => (
                <li
                  key={link.id}
                  className="relative flex items-center gap-2.5 rounded-[0.5rem] border border-winter/[0.08] bg-winter/[0.12] p-2.5 backdrop-blur-md"
                >
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-winter/10 bg-cedar/45">
                    <LinkIcon iconType={link.iconType} className="h-4 w-4" />
                  </div>

                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group relative z-10 min-w-0 flex-1"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-winter group-hover:underline">
                        {link.title}
                      </span>
                      {link.badge && (
                        <Badge
                          variant={link.badge === "NEW" ? "pink" : "purple"}
                          className="px-1 py-0 text-[10px]"
                        >
                          {link.badge}
                        </Badge>
                      )}
                      <ExternalLink className="h-3 w-3 shrink-0 text-winter/50" aria-hidden="true" />
                      {/* 클릭수: "제목 · N 클릭" (없으면 0) — 관리 화면이라 여기서 누른 건 세지 않는다 */}
                      <span className="ml-auto shrink-0 pl-1 text-[11px] text-winter/50 tabular-nums">
                        · {link.clickCount.toLocaleString("ko-KR")} 클릭
                      </span>
                    </span>
                    <span className="block truncate text-[11px] text-winter/65">
                      {link.subtitle || link.href}
                    </span>
                    <time
                      dateTime={new Date(link.createdAtMs).toISOString()}
                      className="mt-0.5 block font-mono text-[10px] text-winter/45"
                    >
                      {createdAtFormat.format(link.createdAtMs)}
                    </time>
                  </a>

                  {/* 순서 변경(카드 순서 보기) · 수정 · 삭제 */}
                  <div className="relative z-10 flex shrink-0 items-center gap-1">
                    {sortMode === "card" && (
                      <>
                        <button
                          type="button"
                          onClick={() => moveLink(index, "up")}
                          disabled={index === 0}
                          aria-label={`${link.title} 위로 이동`}
                          className={ICON_BUTTON}
                        >
                          <ArrowUp className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLink(index, "down")}
                          disabled={index === links.length - 1}
                          aria-label={`${link.title} 아래로 이동`}
                          className={ICON_BUTTON}
                        >
                          <ArrowDown className="size-3" />
                        </button>
                      </>
                    )}
                    <Button
                      type="button"
                      variant="glass"
                      size="icon-xs"
                      onClick={() => openEditModal(link)}
                      aria-label={`${link.title} 수정`}
                    >
                      <Pencil className="size-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-xs"
                      onClick={() => deleteLink(link.id)}
                      aria-label={`${link.title} 삭제`}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-1.5 rounded-[0.5rem] border border-dashed border-winter/25 bg-winter/[0.06] p-6 text-center">
              <Link2 className="h-6 w-6 text-hearth" aria-hidden="true" />
              <p className="text-sm font-medium text-winter/90">아직 추가한 링크가 없어요.</p>
              <p className="text-xs text-winter/60">위 폼에서 첫 링크를 추가해보세요.</p>
              {legacyCount > 0 && (
                <div className="mt-2 flex flex-col items-center gap-1.5">
                  <p className="text-[11px] text-winter/60">
                    로그인 기능 전에 저장한 공용 링크 {legacyCount}개가 있어요.
                  </p>
                  <Button
                    type="button"
                    variant="glass"
                    size="sm"
                    onClick={() => void handleImportLegacy()}
                    disabled={importing}
                    aria-busy={importing}
                  >
                    {importing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    <span>{importing ? "가져오는 중..." : `이전 링크 ${legacyCount}개 가져오기`}</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 클릭 통계 섹션 (링크 관리 영역 아래) */}
        {status === "ready" && (
          <>
            <div className="relative z-10 h-px w-full bg-gradient-to-r from-transparent via-winter/18 to-transparent" />
            <MyPageStatsSection links={latestLinks} />
          </>
        )}
          </>
        )}
      </Card>

      {/* 상세 추가·수정 모달 (Zod + React Hook Form 검사) */}
      <LinkFormModal
        key={`${editingLink?.id ?? "new"}-${isModalOpen ? "open" : "closed"}`}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialLink={editingLink}
        onSave={handleModalSave}
      />
    </main>
    </>
  );
}
