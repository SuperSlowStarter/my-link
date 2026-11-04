"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ExternalLink, Link2, Plus, Trash2 } from "lucide-react";
import { quickLinkSchema, type QuickLinkValues } from "@/lib/schemas";
import { useRimLight } from "@/lib/use-rim-light";
import { useMyPageStore } from "@/store/mypage-store";
import { AmbientBackground } from "@/components/ambient-background";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * /mypage — 내 링크 관리 (7주차 실습: 링크 추가 기능 / Create)
 * 상단: 제목 / 중간: 추가 폼 / 하단: 목록
 */
export default function MyPage() {
  useRimLight();

  const links = useMyPageStore((state) => state.links);
  const addLink = useMyPageStore((state) => state.addLink);
  const removeLink = useMyPageStore((state) => state.removeLink);

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<QuickLinkValues>({
    resolver: zodResolver(quickLinkSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { title: "", href: "" },
  });

  // 검사를 통과하면 목록에 추가 → 입력 칸 자동 비우기 → 다음 입력을 위해 제목 칸에 포커스
  const onSubmit = (values: QuickLinkValues) => {
    addLink(values);
    reset({ title: "", href: "" });
    requestAnimationFrame(() => setFocus("title"));
  };

  return (
    <main className="relative flex min-h-[100dvh] flex-1 flex-col items-center px-4 py-16 sm:px-6">
      <AmbientBackground />

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
            <h1 className="text-2xl font-bold tracking-tight text-winter">
              내 링크 관리
            </h1>
            <p className="mt-1 text-xs text-winter/70">
              제목과 주소를 입력하고 추가 버튼을 누르면 아래 목록에 쌓여요.
            </p>
          </div>
        </header>

        {/* 중간: 링크 추가 폼 (입력 칸 세로 배치) */}
        <form
          onSubmit={handleSubmit(onSubmit)}
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

          <Button type="submit" variant="primary" className="mt-1 w-full">
            <Plus className="h-4 w-4" />
            <span>추가</span>
          </Button>
        </form>

        <div className="relative z-10 h-px w-full bg-gradient-to-r from-transparent via-winter/18 to-transparent" />

        {/* 하단: 링크 목록 */}
        <section aria-labelledby="mypage-list-title" className="relative z-10">
          <div className="mb-2.5 flex items-center justify-between">
            <h2
              id="mypage-list-title"
              className="text-xs font-bold tracking-wider text-winter uppercase"
            >
              링크 목록 ({links.length})
            </h2>
            <span className="font-mono text-[10px] text-winter/50">
              새로고침하면 초기화돼요
            </span>
          </div>

          {links.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {links.map((link, index) => (
                <li
                  key={link.id}
                  style={{ animationDelay: `${index * 80}ms` }}
                  className="animate-glass-entry relative flex items-center gap-2.5 rounded-[0.5rem] border border-winter/[0.08] bg-winter/[0.12] p-2.5 backdrop-blur-md"
                >
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-winter/10 bg-cedar/45">
                    <Link2 className="h-4 w-4 text-hearth" aria-hidden="true" />
                  </div>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group relative z-10 min-w-0 flex-1"
                  >
                    <span className="flex items-center gap-1 truncate text-sm font-semibold text-winter group-hover:underline">
                      {link.title}
                      <ExternalLink className="h-3 w-3 shrink-0 text-winter/50" aria-hidden="true" />
                    </span>
                    <span className="block truncate text-[11px] text-winter/65">
                      {link.href}
                    </span>
                  </a>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-xs"
                    onClick={() => removeLink(link.id)}
                    aria-label={`${link.title} 삭제`}
                    className="relative z-10"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-1.5 rounded-[0.5rem] border border-dashed border-winter/25 bg-winter/[0.06] p-6 text-center">
              <Link2 className="h-6 w-6 text-hearth" aria-hidden="true" />
              <p className="text-sm font-medium text-winter/90">아직 추가한 링크가 없어요.</p>
              <p className="text-xs text-winter/60">위 폼에서 첫 링크를 추가해보세요.</p>
            </div>
          )}
        </section>
      </Card>
    </main>
  );
}
