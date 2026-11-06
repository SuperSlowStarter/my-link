import type { Metadata, Viewport } from "next";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TITLE, SITE_URL, socialMetadata } from "@/lib/site";
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

/**
 * 사이트 공통 메타데이터 (SEO) — 하위 페이지가 덮어쓰지 않은 값은 그대로 물려받는다.
 * - title.template: 하위 페이지 제목 뒤에 " | MyLink" (예: "대건 (@cleangabb) | MyLink")
 * - metadataBase: OG 이미지·canonical 상대 주소를 절대 주소로 (lib/site.ts SITE_URL)
 * - canonical은 페이지마다 따로 둔다 (여기에 두면 모든 하위 페이지가 "/"를 가리키게 됨)
 * - OG 이미지는 app/opengraph-image.tsx · app/[username]/opengraph-image.tsx 가 자동으로 붙인다
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  category: "design",
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { email: false, telephone: false, address: false },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  ...socialMetadata({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: "/" }),
};

/** 모바일 브라우저 주소창 색 = Crow (사이트 바탕색) */
export const viewport: Viewport = {
  themeColor: "#1e0912",
  colorScheme: "dark",
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
