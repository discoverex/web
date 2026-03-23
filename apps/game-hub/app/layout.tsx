import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { ThemeProvider } from '@repo/ui/navbar';
import { AuthProvider } from '@repo/ui/auth';
import { getServerUser } from '@repo/ui/auth/server';
import { GlobalNavbar } from '@repo/ui/navbar';
import React from 'react';

const pretendard = localFont({
  src: [
    { path: './fonts/Pretendard-Black.otf', weight: '400' },
    { path: './fonts/Pretendard-Bold.otf', weight: '500' },
    { path: './fonts/Pretendard-ExtraBold.otf', weight: '600' },
    { path: './fonts/Pretendard-Light.otf', weight: '100' },
    { path: './fonts/Pretendard-ExtraLight.otf', weight: '0' },
    { path: './fonts/Pretendard-Regular.otf', weight: '300' },
    { path: './fonts/Pretendard-Medium.otf', weight: '200' },
    { path: './fonts/Pretendard-SemiBold.otf', weight: '450' },
    { path: './fonts/Pretendard-Thin.otf', weight: '100' },
  ],
  variable: '--font-pretendard',
});

export const metadata: Metadata = {
  title: 'Vision AI Games - Hub',
  description: 'AI 기반 게임들의 메인 허브',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.ReactElement> {
  const user = await getServerUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${pretendard.variable} font-sans min-h-screen w-full bg-base-100`}>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <AuthProvider initialUser={user}>
            <GlobalNavbar />
            <main className="p-4">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
