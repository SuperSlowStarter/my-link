import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FirebaseAnalytics } from "@/components/firebase-analytics";
import { AuthListener } from "@/components/auth-listener";
import { LoadingOverlay } from "@/components/loading-overlay";
import { AppToaster } from "@/components/app-toaster";
import { QueryProvider } from "@/components/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyLink — 모션 디자이너를 위한 링크 허브",
  description:
    "쇼릴·유튜브·인스타그램·외주 문의를 한 장의 글래스 카드에. Google 계정으로 시작하는 모션 디자이너용 링크 페이지",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* 데이터 조회·쓰기: TanStack Query */}
        <QueryProvider>
          {children}
          <FirebaseAnalytics />
          <AuthListener />
          <LoadingOverlay />
          <AppToaster />
        </QueryProvider>
      </body>
    </html>
  );
}
