import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FirebaseAnalytics } from "@/components/firebase-analytics";
import { AuthListener } from "@/components/auth-listener";
import { LoadingOverlay } from "@/components/loading-overlay";
import { AppToaster } from "@/components/app-toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "이대건 | Motion Graphic Designer",
  description:
    "움직임으로 이야기를 전하는 모션그래픽 디자이너 이대건의 포트폴리오 및 소셜 링크 허브",
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
        {children}
        <FirebaseAnalytics />
        <AuthListener />
        <LoadingOverlay />
        <AppToaster />
      </body>
    </html>
  );
}
