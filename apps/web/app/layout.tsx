import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { menus } from './consts/menus';
import { ThemeProvider } from 'next-themes';
import ThemeSwitcher from '../components/theme-switcher';
import { AuthProvider } from '../context/auth-context';
import UserHeader from '../components/user-header';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'Welcome to Vision AI GAMES World!',
  description: '비전 AI를 활용한 게임들을 모아둔 허브입니다.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} h-screen w-screen`}>
        <ThemeProvider attribute="data-theme" defaultTheme="dark">
          <AuthProvider>
            <div className="w-full px-4 py-2 flex justify-between gap-2 bg-amber-200 dark:bg-slate-900">
              <div className="flex gap-6 items-center">
                {menus.map((menu) => (
                  <a
                    key={menu.name}
                    href={menu.path}
                    className="text-md hover:animate-bounce font-medium hover:font-bold"
                  >
                    {menu.name}
                  </a>
                ))}
              </div>
              <div className="flex gap-4 items-center">
                <UserHeader />
                <ThemeSwitcher />
              </div>
            </div>
            <div className="p-2">{children}</div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
