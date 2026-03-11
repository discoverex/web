'use client';

import React, { useRef } from "react";
import Image from "next/image";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { useAuth } from "@repo/ui/auth";
import rexAnimation from "../public/rex-animation.json";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  if (loading) return <div className="flex h-screen items-center justify-center">인증 상태 확인 중...</div>;

  const handleLottieClick = () => {
    if (lottieRef.current) {
      lottieRef.current.stop();
      lottieRef.current.play();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black p-8">
      <main className="flex w-full max-w-3xl flex-col items-center gap-8 bg-white dark:bg-zinc-900 p-12 rounded-2xl shadow-xl">
        <div 
          className="w-48 h-48 cursor-pointer hover:scale-105 transition-transform" 
          onClick={handleLottieClick}
          title="클릭해서 애니메이션 재생"
        >
          <Lottie 
            lottieRef={lottieRef}
            animationData={rexAnimation} 
            loop={false} 
            autoplay={false}
          />
        </div>
        
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={120}
          height={24}
          priority
        />
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
            렉스를 찾아라! (Discoverex)
          </h1>
          
          {user ? (
            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <p className="text-lg font-medium text-green-800 dark:text-green-400">
                ✅ 로그인 성공! 환영합니다, <span className="font-bold underline">{user.displayName || user.email}</span>님.
              </p>
              <button 
                onClick={logout}
                className="mt-4 text-sm text-red-600 hover:underline cursor-pointer"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <p className="text-lg font-medium text-amber-800 dark:text-amber-400">
                ❌ 로그인이 필요합니다. Game Hub에서 로그인해 주세요.
              </p>
              <a 
                href="https://discoverex-game-hub-329947062450.asia-northeast3.run.app"
                className="mt-4 inline-block px-6 py-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors"
              >
                Game Hub로 이동
              </a>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-8">
          <a
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold hover:opacity-90 transition-opacity"
            href="#"
          >
            게임 가이드 보기
          </a>
          <a
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            href="#"
          >
            랭킹 확인하기
          </a>
        </div>
      </main>
    </div>
  );
}
