"use client";

import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { AmbientBackground } from "@/components/ambient-background";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/** 404 화면 — 없는 username(/{username})이나 없는 주소 */
export function NotFoundView({ username }: { username?: string }) {
  return (
    <>
      <AmbientBackground />
      <title>페이지를 찾을 수 없어요 | MyLink</title>
      <SiteHeader />
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-16">
        <Card className="animate-glass-entry w-full max-w-[400px] items-center p-8 text-center">
          <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-hearth/15">
            <SearchX className="h-6 w-6 text-hearth" aria-hidden="true" />
          </span>
          <p className="relative z-10 mt-5 font-mono text-[44px] leading-none font-bold tracking-tight text-winter/90">
            404
          </p>
          <h1 className="relative z-10 mt-3 text-lg font-semibold text-winter">페이지를 찾을 수 없어요</h1>
          <p className="relative z-10 mt-2 text-[13px] leading-relaxed text-winter/60">
            {username ? (
              <>
                <span className="font-mono text-winter/85">@{username}</span> 사용자가 없거나 username이 바뀌었어요.
              </>
            ) : (
              "주소가 바뀌었거나 없는 페이지예요."
            )}
          </p>
          <Link href="/" className={buttonVariants({ variant: "glass", size: "sm", className: "relative z-10 mt-6" })}>
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>MyLink 홈으로</span>
          </Link>
        </Card>
      </main>
    </>
  );
}
