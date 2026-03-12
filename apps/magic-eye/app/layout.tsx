import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@repo/ui/auth";
import { GlobalNavbar, ThemeProvider } from "@repo/ui/navbar";
import localFont from "next/font/local";

const pretendard = localFont({
  src: [
    { path: "./fonts/Pretendard-Black.otf", weight: "400" },
    { path: "./fonts/Pretendard-Bold.otf", weight: "500" },
    { path: "./fonts/Pretendard-ExtraBold.otf", weight: "600" },
    { path: "./fonts/Pretendard-Light.otf", weight: "100" },
    { path: "./fonts/Pretendard-ExtraLight.otf", weight: "0" },
    { path: "./fonts/Pretendard-Regular.otf", weight: "300" },
    { path: "./fonts/Pretendard-Medium.otf", weight: "200" },
    { path: "./fonts/Pretendard-SemiBold.otf", weight: "450" },
    { path: "./fonts/Pretendard-Thin.otf", weight: "100" },
  ],
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "Magic Eye - 퀴즈 매직아이",
  description: "Vision AI가 생성한 신비로운 매직아이 퀴즈",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${pretendard.variable} font-sans min-h-screen w-full bg-base-100`}
      >
        <ThemeProvider 
          attribute="data-theme" 
          defaultTheme="dark" 
          enableSystem={true}
        >
          <AuthProvider>
            <GlobalNavbar />
            <main className="p-4">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
