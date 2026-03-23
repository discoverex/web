import React from 'react';
import Link from 'next/link';

type ThemeListContainerProps = {
  themes: string[];
};

const ThemeListContainer = ({ themes }: ThemeListContainerProps) => {
  return (
    <div className="flex h-full flex-col items-center bg-zinc-50 font-sans dark:bg-black p-4 sm:p-8">
      <main className="w-full max-w-4xl">
        <div className="flex flex-col items-center gap-8 py-20">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black tracking-tight">Select a World</h2>
            <p className="text-zinc-500">Choose a theme to start your investigation.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
            {themes?.map((theme) => (
              // 테마 선택 시 페이지 이동
              <Link
                href={`/list/${theme}`}
                key={theme}
                className="p-8 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl hover:border-black dark:hover:border-white transition-all group text-left"
              >
                <span className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Theme ID</span>
                <span className="text-lg font-black break-all group-hover:underline">{theme}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ThemeListContainer;
