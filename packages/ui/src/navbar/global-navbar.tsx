"use client";

import React from "react";
import { menus } from "./menus";
import { appendSSOToken, resolveAuthToken } from "../auth";
import UserHeader from "./user-header";
import ThemeSwitcher from "./theme-switcher";

export default function GlobalNavbar({
  user: initialUser,
}: {
  user?: any | null;
}): React.JSX.Element {
  const handleSSOLink = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string,
  ) => {
    e.preventDefault();
    let finalPath = path;
    const { token } = await resolveAuthToken();

    if (token) {
      finalPath = appendSSOToken(finalPath, token);
    }

    window.location.href = finalPath;
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-base-300 dark:border-slate-800 shadow-sm transition-all duration-300">
      {/* 중앙 정렬 컨테이너: 여백 및 너비 제한 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 왼쪽 영역: 로고 + 메뉴 */}
          <div className="flex items-center gap-10">
            {/* LOGO */}
            <a
              href="/"
              onClick={(e) => handleSSOLink(e, menus[0]!.path)}
              className="text-xl font-black tracking-tighter bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent hover:scale-105 transition-transform shrink-0"
            >
              VISION AI GAMES
            </a>

            {/* 메뉴 리스트 (데스크탑) */}
            <div className="hidden md:flex items-center gap-6">
              {menus.map((menu) => (
                <a
                  key={menu.name}
                  href={menu.path}
                  onClick={(e) => handleSSOLink(e, menu.path)}
                  className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-amber-400 transition-colors relative group py-2"
                >
                  {menu.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
                </a>
              ))}
            </div>
          </div>

          {/* 오른쪽 영역: 사용자 정보 + 테마 스위처 */}
          <div className="flex items-center gap-4">
            <UserHeader initialUser={initialUser} />
            <div className="divider divider-horizontal mx-0 h-8 opacity-20"></div>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}
